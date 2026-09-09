-- Build 77 hardening: freeze active table rules and audit table wagers/refunds.
create or replace function public.casino_action_v77(
  p_session_token text,p_campaign uuid,p_action text,p_payload jsonb,p_operation uuid
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=public.v66_session_user(p_session_token); member_role text; op_row public.casino_operations_v77%rowtype;
  request_hash text; game_row public.casino_games_v77%rowtype; round_row public.casino_rounds_v77%rowtype;
  bet_amount integer; wallet_total bigint; payout_amount integer:=0; payout_bps integer:=0; roll_a integer; roll_b integer; roll_total integer;
  pick text; actual text; outcome_value text; player_count integer; winner_count integer; pot_total bigint; distributable bigint; house_cut bigint;
  participant record; now_at timestamptz:=now(); cfg jsonb; new_title text; new_description text; min_bet_value integer; max_bet_value integer;
begin
  if p_operation is null then raise exception 'İşlem kimliği gerekli'; end if;
  if jsonb_typeof(coalesce(p_payload,'{}'::jsonb))<>'object' then raise exception 'İşlem verisi geçersiz'; end if;
  select m.role into member_role from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid;
  if uid is null or member_role is null then raise exception 'Oturum veya kampanya üyeliği geçersiz'; end if;
  if coalesce(p_action,'') not in ('settings_save','game_save','solo_play','round_open','round_join','round_resolve','round_cancel','history_clear') then raise exception 'Kumarhane işlemi geçersiz'; end if;
  perform public.casino_seed_v77(p_campaign);
  request_hash:=md5(coalesce(p_action,'')||'|'||coalesce(p_payload,'{}'::jsonb)::text);
  insert into public.casino_operations_v77(operation_id,campaign_id,user_id,action,request_hash)
  values(p_operation,p_campaign,uid,p_action,request_hash) on conflict(operation_id) do nothing;
  select * into op_row from public.casino_operations_v77 o where o.operation_id=p_operation for update;
  if op_row.campaign_id<>p_campaign or op_row.user_id<>uid or op_row.action<>p_action or op_row.request_hash<>request_hash then raise exception 'İşlem kimliği başka bir istek için kullanılmış'; end if;
  if op_row.response is not null then return public.casino_load_v77(p_session_token,p_campaign); end if;

  if p_action='settings_save' then
    if member_role<>'dm' then raise exception 'Yalnızca DM kumarhaneyi yönetebilir'; end if;
    new_title:=trim(coalesce(p_payload->>'title',''));
    if char_length(new_title) not between 1 and 80 then raise exception 'Kumarhane adı 1–80 karakter olmalı'; end if;
    if char_length(coalesce(p_payload->>'houseNote',''))>1000 then raise exception 'Kumarhane notu çok uzun'; end if;
    update public.casino_settings_v77 set is_open=coalesce((p_payload->>'isOpen')::boolean,false),title=new_title,
      house_note=coalesce(p_payload->>'houseNote',''),updated_by=uid,updated_at=now_at where campaign_id=p_campaign;

  elsif p_action='game_save' then
    if member_role<>'dm' then raise exception 'Yalnızca DM oyunları düzenleyebilir'; end if;
    select * into game_row from public.casino_games_v77 g where g.id=(p_payload->>'gameId')::uuid and g.campaign_id=p_campaign for update;
    if game_row.id is null then raise exception 'Oyun bulunamadı'; end if;
    if game_row.mode='table' and exists(select 1 from public.casino_rounds_v77 r where r.game_id=game_row.id and r.status='open') then
      raise exception 'Açık masa kapanmadan bu oyunun ayarları değiştirilemez';
    end if;
    new_title:=trim(coalesce(p_payload->>'name','')); new_description:=trim(coalesce(p_payload->>'description',''));
    min_bet_value:=coalesce((p_payload->>'minBet')::integer,game_row.min_bet); max_bet_value:=coalesce((p_payload->>'maxBet')::integer,game_row.max_bet);
    if char_length(new_title) not between 1 and 80 or char_length(new_description)>1000 then raise exception 'Oyun adı veya açıklaması geçersiz'; end if;
    if min_bet_value<1 or max_bet_value<min_bet_value or max_bet_value>2000000000 then raise exception 'Bahis sınırları geçersiz'; end if;
    cfg:=public.casino_config_v77(game_row.kind,p_payload->'config');
    update public.casino_games_v77 set name=new_title,description=new_description,enabled=coalesce((p_payload->>'enabled')::boolean,true),
      min_bet=min_bet_value,max_bet=max_bet_value,config=cfg,updated_by=uid,updated_at=now_at where id=game_row.id;

  elsif p_action='solo_play' then
    if member_role<>'player' then raise exception 'Bahis yalnız oyuncu kesesinden oynanabilir'; end if;
    if not exists(select 1 from public.casino_settings_v77 s where s.campaign_id=p_campaign and s.is_open) then raise exception 'Kumarhane şu anda kapalı'; end if;
    select * into game_row from public.casino_games_v77 g where g.id=(p_payload->>'gameId')::uuid and g.campaign_id=p_campaign and g.enabled for update;
    if game_row.id is null or game_row.mode<>'solo' then raise exception 'Tek kişilik oyun açık değil'; end if;
    bet_amount:=(p_payload->>'bet')::integer; pick:=coalesce(p_payload->>'selection','');
    if bet_amount not between game_row.min_bet and game_row.max_bet then raise exception 'Bahis oyun sınırları dışında'; end if;
    insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,uid) on conflict do nothing;
    select w.platinum::bigint*1000+w.gold::bigint*100+w.silver::bigint*10+w.copper::bigint into wallet_total
      from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id=uid for update;
    if wallet_total<bet_amount then raise exception 'Kesende bu bahis için yeterli para yok'; end if;

    if game_row.kind='coin_flip' then
      if pick not in ('crown','blade') then raise exception 'Taç veya kılıç seç'; end if;
      actual:=case public.casino_random_v77(2) when 0 then 'crown' else 'blade' end;
      payout_bps:=case when pick=actual then (game_row.config->>'winMultiplierBps')::integer else 0 end;
      cfg:=jsonb_build_object('face',actual);
    elsif game_row.kind='bone_dice' then
      if pick not in ('low','seven','high') then raise exception 'Düşük, yedi veya yüksek seç'; end if;
      roll_a:=public.casino_random_v77(6)+1; roll_b:=public.casino_random_v77(6)+1; roll_total:=roll_a+roll_b;
      actual:=case when roll_total<7 then 'low' when roll_total=7 then 'seven' else 'high' end;
      payout_bps:=case when pick<>actual then 0 when actual='seven' then (game_row.config->>'sevenMultiplierBps')::integer else (game_row.config->>'lowHighMultiplierBps')::integer end;
      cfg:=jsonb_build_object('dice',jsonb_build_array(roll_a,roll_b),'total',roll_total,'band',actual);
    elsif game_row.kind='shells' then
      roll_total:=public.casino_random_v77((game_row.config->>'cupCount')::integer)+1;
      if pick !~ '^[0-9]+$' or pick::integer not between 1 and (game_row.config->>'cupCount')::integer then raise exception 'Geçerli bir kupa seç'; end if;
      actual:=roll_total::text; payout_bps:=case when pick=actual then (game_row.config->>'winMultiplierBps')::integer else 0 end;
      cfg:=jsonb_build_object('cup',roll_total);
    elsif game_row.kind='wheel' then
      roll_total:=public.casino_random_v77(jsonb_array_length(game_row.config->'segments'));
      payout_bps:=(game_row.config->'segments'->>roll_total)::integer;
      cfg:=jsonb_build_object('segment',roll_total+1,'multiplierBps',payout_bps);
      pick:='spin';
    else raise exception 'Bu oyun tek kişilik değil';
    end if;
    payout_amount:=floor(bet_amount::numeric*payout_bps/10000)::integer;
    outcome_value:=case when payout_amount=0 then 'lose' when payout_amount<bet_amount then 'partial' else 'win' end;
    wallet_total:=wallet_total-bet_amount+payout_amount;
    update public.campaign_wallets set platinum=(wallet_total/1000)::integer,gold=((wallet_total%1000)/100)::integer,
      silver=((wallet_total%100)/10)::integer,copper=(wallet_total%10)::integer,updated_at=now_at where campaign_id=p_campaign and user_id=uid;
    insert into public.casino_plays_v77(operation_id,campaign_id,game_id,user_id,stake,selection,result,payout,outcome,resolved_at)
    values(p_operation,p_campaign,game_row.id,uid,bet_amount,jsonb_build_object('choice',pick),cfg,payout_amount,outcome_value,now_at);
    perform public.audit_insert_v69(p_campaign,uid,'casino_play','Kumarhane bahsi',game_row.name||' · '||bet_amount||' CP bahis · '||payout_amount||' CP ödeme',
      jsonb_build_object('gameId',game_row.id,'game',game_row.name,'stakeCP',bet_amount,'payoutCP',payout_amount,'outcome',outcome_value));

  elsif p_action='round_open' then
    if member_role<>'dm' then raise exception 'Masayı yalnızca DM açabilir'; end if;
    if not exists(select 1 from public.casino_settings_v77 s where s.campaign_id=p_campaign and s.is_open) then raise exception 'Önce kumarhaneyi aç'; end if;
    select * into game_row from public.casino_games_v77 g where g.id=(p_payload->>'gameId')::uuid and g.campaign_id=p_campaign and g.enabled for update;
    if game_row.id is null or game_row.mode<>'table' then raise exception 'Çok oyunculu oyun açık değil'; end if;
    if exists(select 1 from public.casino_rounds_v77 r where r.game_id=game_row.id and r.status='open') then raise exception 'Bu oyunda zaten açık masa var'; end if;
    insert into public.casino_rounds_v77(campaign_id,game_id,opened_by) values(p_campaign,game_row.id,uid);

  elsif p_action='round_join' then
    if member_role<>'player' then raise exception 'Masaya yalnız oyuncular katılabilir'; end if;
    if not exists(select 1 from public.casino_settings_v77 s where s.campaign_id=p_campaign and s.is_open) then raise exception 'Kumarhane şu anda kapalı'; end if;
    select * into round_row from public.casino_rounds_v77 r where r.id=(p_payload->>'roundId')::uuid and r.campaign_id=p_campaign for update;
    if round_row.id is null or round_row.status<>'open' then raise exception 'Masa artık bahis kabul etmiyor'; end if;
    select * into game_row from public.casino_games_v77 g where g.id=round_row.game_id and g.enabled;
    if game_row.id is null or game_row.mode<>'table' then raise exception 'Masa oyunu açık değil'; end if;
    select count(*) into player_count from public.casino_plays_v77 p where p.round_id=round_row.id;
    if player_count >= (game_row.config->>'maxPlayers')::integer then raise exception 'Masa dolu'; end if;
    if exists(select 1 from public.casino_plays_v77 p where p.round_id=round_row.id and p.user_id=uid) then raise exception 'Bu masaya zaten bahis koydun'; end if;
    bet_amount:=(p_payload->>'bet')::integer; pick:=coalesce(p_payload->>'selection','');
    if bet_amount not between game_row.min_bet and game_row.max_bet then raise exception 'Bahis oyun sınırları dışında'; end if;
    if game_row.kind='sigil_draw' and (pick !~ '^[0-9]+$' or pick::integer not between 1 and (game_row.config->>'sides')::integer) then raise exception 'Geçerli bir mühür seç'; end if;
    if game_row.kind='high_roll' then pick:='d20'; end if;
    insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,uid) on conflict do nothing;
    select w.platinum::bigint*1000+w.gold::bigint*100+w.silver::bigint*10+w.copper::bigint into wallet_total
      from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id=uid for update;
    if wallet_total<bet_amount then raise exception 'Kesende bu bahis için yeterli para yok'; end if;
    wallet_total:=wallet_total-bet_amount;
    update public.campaign_wallets set platinum=(wallet_total/1000)::integer,gold=((wallet_total%1000)/100)::integer,
      silver=((wallet_total%100)/10)::integer,copper=(wallet_total%10)::integer,updated_at=now_at where campaign_id=p_campaign and user_id=uid;
    insert into public.casino_plays_v77(operation_id,campaign_id,game_id,round_id,user_id,stake,selection)
    values(p_operation,p_campaign,game_row.id,round_row.id,uid,bet_amount,jsonb_build_object('choice',pick));
    perform public.audit_insert_v69(p_campaign,uid,'casino_play','Kumarhane masa bahsi',game_row.name||' · '||bet_amount||' CP ortak pota kondu',
      jsonb_build_object('gameId',game_row.id,'roundId',round_row.id,'game',game_row.name,'stakeCP',bet_amount));

  elsif p_action in ('round_resolve','round_cancel') then
    if member_role<>'dm' then raise exception 'Masayı yalnızca DM sonuçlandırabilir'; end if;
    select * into round_row from public.casino_rounds_v77 r where r.id=(p_payload->>'roundId')::uuid and r.campaign_id=p_campaign for update;
    if round_row.id is null or round_row.status<>'open' then raise exception 'Masa zaten kapanmış'; end if;
    select * into game_row from public.casino_games_v77 g where g.id=round_row.game_id;
    select count(*),coalesce(sum(p.stake),0) into player_count,pot_total from public.casino_plays_v77 p where p.round_id=round_row.id and p.outcome='pending';
    perform 1 from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id in(select p.user_id from public.casino_plays_v77 p where p.round_id=round_row.id) order by w.user_id for update;

    if p_action='round_cancel' then
      for participant in select p.user_id,sum(p.stake)::bigint refund from public.casino_plays_v77 p where p.round_id=round_row.id and p.outcome='pending' group by p.user_id order by p.user_id loop
        select w.platinum::bigint*1000+w.gold::bigint*100+w.silver::bigint*10+w.copper::bigint into wallet_total from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id=participant.user_id;
        wallet_total:=wallet_total+participant.refund;
        update public.campaign_wallets set platinum=(wallet_total/1000)::integer,gold=((wallet_total%1000)/100)::integer,
          silver=((wallet_total%100)/10)::integer,copper=(wallet_total%10)::integer,updated_at=now_at where campaign_id=p_campaign and user_id=participant.user_id;
      end loop;
      update public.casino_plays_v77 set payout=stake,outcome='cancelled',result=jsonb_build_object('refunded',true),resolved_at=now_at where round_id=round_row.id and outcome='pending';
      update public.casino_rounds_v77 set status='cancelled',resolved_by=uid,result=jsonb_build_object('refunded',pot_total),resolved_at=now_at where id=round_row.id;
      perform public.audit_insert_v69(p_campaign,uid,'casino_table','Kumarhane masası iptal edildi',game_row.name||' · '||pot_total||' CP oyunculara iade edildi',
        jsonb_build_object('gameId',game_row.id,'roundId',round_row.id,'game',game_row.name,'refundCP',pot_total));
    else
      if player_count < (game_row.config->>'minPlayers')::integer then raise exception 'Masayı sonuçlandırmak için yeterli oyuncu yok'; end if;
      house_cut:=floor(pot_total::numeric*(game_row.config->>'houseCutBps')::integer/10000)::bigint; distributable:=pot_total-house_cut;
      if game_row.kind='high_roll' then
        for participant in select p.id from public.casino_plays_v77 p where p.round_id=round_row.id and p.outcome='pending' order by p.id loop
          roll_total:=public.casino_random_v77(20)+1;
          update public.casino_plays_v77 set result=jsonb_build_object('roll',roll_total) where id=participant.id;
        end loop;
        select max((p.result->>'roll')::integer) into roll_total from public.casino_plays_v77 p where p.round_id=round_row.id;
        select count(*) into winner_count from public.casino_plays_v77 p where p.round_id=round_row.id and (p.result->>'roll')::integer=roll_total;
        payout_amount:=floor(distributable::numeric/winner_count)::integer;
        update public.casino_plays_v77 p set payout=case when (p.result->>'roll')::integer=roll_total then payout_amount else 0 end,
          outcome=case when (p.result->>'roll')::integer=roll_total then 'win' else 'lose' end,resolved_at=now_at where p.round_id=round_row.id;
        cfg:=jsonb_build_object('highestRoll',roll_total,'winnerCount',winner_count,'pot',pot_total,'houseCut',house_cut,'payoutEach',payout_amount);
      elsif game_row.kind='sigil_draw' then
        roll_total:=public.casino_random_v77((game_row.config->>'sides')::integer)+1;
        select count(*) into winner_count from public.casino_plays_v77 p where p.round_id=round_row.id and p.selection->>'choice'=roll_total::text;
        payout_amount:=case when winner_count>0 then floor(distributable::numeric/winner_count)::integer else 0 end;
        update public.casino_plays_v77 p set result=jsonb_build_object('drawnSeal',roll_total),
          payout=case when p.selection->>'choice'=roll_total::text then payout_amount else 0 end,
          outcome=case when p.selection->>'choice'=roll_total::text then 'win' else 'lose' end,resolved_at=now_at where p.round_id=round_row.id;
        cfg:=jsonb_build_object('drawnSeal',roll_total,'winnerCount',winner_count,'pot',pot_total,'houseCut',house_cut,'payoutEach',payout_amount);
      else raise exception 'Masa oyunu türü geçersiz';
      end if;
      for participant in select p.user_id,sum(p.payout)::bigint payout from public.casino_plays_v77 p where p.round_id=round_row.id and p.payout>0 group by p.user_id order by p.user_id loop
        select w.platinum::bigint*1000+w.gold::bigint*100+w.silver::bigint*10+w.copper::bigint into wallet_total from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id=participant.user_id;
        wallet_total:=wallet_total+participant.payout;
        update public.campaign_wallets set platinum=(wallet_total/1000)::integer,gold=((wallet_total%1000)/100)::integer,
          silver=((wallet_total%100)/10)::integer,copper=(wallet_total%10)::integer,updated_at=now_at where campaign_id=p_campaign and user_id=participant.user_id;
      end loop;
      update public.casino_rounds_v77 set status='resolved',resolved_by=uid,result=cfg,resolved_at=now_at where id=round_row.id;
      perform public.audit_insert_v69(p_campaign,uid,'casino_table','Kumarhane masası sonuçlandı',game_row.name||' · '||player_count||' oyuncu · '||pot_total||' CP pot',
        jsonb_build_object('gameId',game_row.id,'roundId',round_row.id,'game',game_row.name,'players',player_count,'potCP',pot_total,'result',cfg));
    end if;

  elsif p_action='history_clear' then
    if member_role<>'dm' then raise exception 'Kumarhane geçmişini yalnız DM temizleyebilir'; end if;
    delete from public.casino_plays_v77 p where p.campaign_id=p_campaign and p.round_id is null;
    delete from public.casino_rounds_v77 r where r.campaign_id=p_campaign and r.status in ('resolved','cancelled');
  end if;

  update public.casino_operations_v77 set response=jsonb_build_object('ok',true),created_at=now_at where operation_id=p_operation;
  delete from public.casino_operations_v77 o where o.campaign_id=p_campaign and o.created_at<now()-interval '30 days';
  return public.casino_load_v77(p_session_token,p_campaign);
end
$$;

