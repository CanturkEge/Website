-- Build 77: DM-controlled fantasy casino with atomic wallet settlement.
-- Existing accounts, campaigns, characters, wallets and campaign JSON are preserved.

create table if not exists public.casino_settings_v77(
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  is_open boolean not null default false,
  title text not null default 'Altın Zar Kumarhanesi',
  house_note text not null default 'Han kapısındaki pirinç çan çaldığında masalar açılır.',
  updated_by uuid references public.accounts(id) on delete set null,
  updated_at timestamptz not null default now(),
  check(char_length(title) between 1 and 80),
  check(char_length(house_note) <= 1000)
);

create table if not exists public.casino_games_v77(
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  game_key text not null,
  kind text not null check(kind in ('coin_flip','bone_dice','shells','wheel','high_roll','sigil_draw')),
  mode text not null check(mode in ('solo','table')),
  name text not null,
  description text not null default '',
  enabled boolean not null default true,
  min_bet integer not null default 10 check(min_bet > 0),
  max_bet integer not null default 10000 check(max_bet >= min_bet),
  config jsonb not null default '{}'::jsonb check(jsonb_typeof(config)='object'),
  sort_order integer not null default 0,
  updated_by uuid references public.accounts(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(campaign_id,game_key),
  check(char_length(name) between 1 and 80),
  check(char_length(description) <= 1000)
);

create table if not exists public.casino_rounds_v77(
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  game_id uuid not null references public.casino_games_v77(id) on delete cascade,
  status text not null default 'open' check(status in ('open','resolved','cancelled')),
  opened_by uuid references public.accounts(id) on delete set null,
  resolved_by uuid references public.accounts(id) on delete set null,
  result jsonb not null default '{}'::jsonb check(jsonb_typeof(result)='object'),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.casino_plays_v77(
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null unique,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  game_id uuid not null references public.casino_games_v77(id) on delete cascade,
  round_id uuid references public.casino_rounds_v77(id) on delete cascade,
  user_id uuid not null references public.accounts(id) on delete cascade,
  stake integer not null check(stake > 0),
  selection jsonb not null default '{}'::jsonb check(jsonb_typeof(selection)='object'),
  result jsonb not null default '{}'::jsonb check(jsonb_typeof(result)='object'),
  payout integer not null default 0 check(payout >= 0),
  outcome text not null default 'pending' check(outcome in ('pending','win','partial','lose','cancelled')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique(round_id,user_id)
);

create table if not exists public.casino_operations_v77(
  operation_id uuid primary key,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.accounts(id) on delete cascade,
  action text not null,
  request_hash text not null,
  response jsonb,
  created_at timestamptz not null default now()
);

alter table public.casino_settings_v77 enable row level security;
alter table public.casino_games_v77 enable row level security;
alter table public.casino_rounds_v77 enable row level security;
alter table public.casino_plays_v77 enable row level security;
alter table public.casino_operations_v77 enable row level security;

create index if not exists casino_games_v77_campaign_idx on public.casino_games_v77(campaign_id,sort_order,id);
create index if not exists casino_settings_v77_updated_by_idx on public.casino_settings_v77(updated_by);
create index if not exists casino_games_v77_updated_by_idx on public.casino_games_v77(updated_by);
create unique index if not exists casino_rounds_v77_one_open_game_idx on public.casino_rounds_v77(game_id) where status='open';
create index if not exists casino_rounds_v77_campaign_status_idx on public.casino_rounds_v77(campaign_id,status,created_at desc);
create index if not exists casino_rounds_v77_opened_by_idx on public.casino_rounds_v77(opened_by);
create index if not exists casino_rounds_v77_resolved_by_idx on public.casino_rounds_v77(resolved_by);
create index if not exists casino_plays_v77_campaign_created_idx on public.casino_plays_v77(campaign_id,created_at desc,id);
create index if not exists casino_plays_v77_user_created_idx on public.casino_plays_v77(user_id,created_at desc,id);
create index if not exists casino_plays_v77_game_idx on public.casino_plays_v77(game_id);
create index if not exists casino_plays_v77_round_idx on public.casino_plays_v77(round_id,user_id);
create index if not exists casino_operations_v77_campaign_created_idx on public.casino_operations_v77(campaign_id,created_at);
create index if not exists casino_operations_v77_user_idx on public.casino_operations_v77(user_id);

create or replace function public.casino_random_v77(p_max integer)
returns integer
language plpgsql volatile security definer set search_path=''
as $$
begin
  if p_max is null or p_max < 1 or p_max > 1000000 then raise exception 'Rastgele sayı sınırı geçersiz'; end if;
  return floor(pg_catalog.random()*p_max)::integer;
end
$$;

create or replace function public.casino_config_v77(p_kind text,p_config jsonb)
returns jsonb
language plpgsql immutable security definer set search_path=''
as $$
declare
  cfg jsonb:=case when jsonb_typeof(coalesce(p_config,'{}'::jsonb))='object' then coalesce(p_config,'{}'::jsonb) else '{}'::jsonb end;
  segments jsonb; row_value jsonb; value_int integer; segment_count integer;
begin
  if p_kind='coin_flip' then
    value_int:=coalesce((cfg->>'winMultiplierBps')::integer,19000);
    if value_int not between 10000 and 100000 then raise exception 'Kazanç çarpanı 1–10 arasında olmalı'; end if;
    return jsonb_build_object('winMultiplierBps',value_int);
  elsif p_kind='bone_dice' then
    value_int:=coalesce((cfg->>'lowHighMultiplierBps')::integer,20000);
    if value_int not between 10000 and 100000 then raise exception 'Alt/üst çarpanı 1–10 arasında olmalı'; end if;
    if coalesce((cfg->>'sevenMultiplierBps')::integer,50000) not between 10000 and 100000 then raise exception 'Yedi çarpanı 1–10 arasında olmalı'; end if;
    return jsonb_build_object('lowHighMultiplierBps',value_int,'sevenMultiplierBps',coalesce((cfg->>'sevenMultiplierBps')::integer,50000));
  elsif p_kind='shells' then
    value_int:=coalesce((cfg->>'cupCount')::integer,3);
    if value_int not between 2 and 10 then raise exception 'Kupa sayısı 2–10 arasında olmalı'; end if;
    if coalesce((cfg->>'winMultiplierBps')::integer,27000) not between 10000 and 100000 then raise exception 'Kazanç çarpanı 1–10 arasında olmalı'; end if;
    return jsonb_build_object('cupCount',value_int,'winMultiplierBps',coalesce((cfg->>'winMultiplierBps')::integer,27000));
  elsif p_kind='wheel' then
    segments:=coalesce(cfg->'segments','[0,0,0,0,5000,10000,10000,15000,20000,30000]'::jsonb);
    if jsonb_typeof(segments)<>'array' then raise exception 'Çark dilimleri liste olmalı'; end if;
    segment_count:=jsonb_array_length(segments);
    if segment_count not between 4 and 20 then raise exception 'Çarkta 4–20 dilim olmalı'; end if;
    for row_value in select value from jsonb_array_elements(segments) loop
      value_int:=(row_value#>>'{}')::integer;
      if value_int not between 0 and 100000 then raise exception 'Çark çarpanları 0–10 arasında olmalı'; end if;
    end loop;
    return jsonb_build_object('segments',segments);
  elsif p_kind in ('high_roll','sigil_draw') then
    value_int:=coalesce((cfg->>'houseCutBps')::integer,500);
    if value_int not between 0 and 2500 then raise exception 'Kasa payı %%0–25 arasında olmalı'; end if;
    if coalesce((cfg->>'minPlayers')::integer,2) not between 2 and 12 then raise exception 'En az oyuncu 2–12 arasında olmalı'; end if;
    if coalesce((cfg->>'maxPlayers')::integer,10) not between coalesce((cfg->>'minPlayers')::integer,2) and 20 then raise exception 'En çok oyuncu, en az oyuncudan küçük olamaz ve 20’yi geçemez'; end if;
    return jsonb_build_object(
      'houseCutBps',value_int,
      'minPlayers',coalesce((cfg->>'minPlayers')::integer,2),
      'maxPlayers',coalesce((cfg->>'maxPlayers')::integer,10),
      'sides',case when p_kind='sigil_draw' then greatest(2,least(12,coalesce((cfg->>'sides')::integer,6))) else 20 end
    );
  end if;
  raise exception 'Oyun türü geçersiz';
end
$$;

create or replace function public.casino_seed_v77(p_campaign uuid)
returns void
language plpgsql security definer set search_path=''
as $$
begin
  insert into public.casino_settings_v77(campaign_id) values(p_campaign) on conflict(campaign_id) do nothing;
  insert into public.casino_games_v77(campaign_id,game_key,kind,mode,name,description,min_bet,max_bet,config,sort_order)
  values
    (p_campaign,'crown_blade','coin_flip','solo','Taç mı Kılıç mı?','Krallık sikkesi havaya yükselir. Taç veya kılıcı bil; tek atışta kaderin konuşsun.',10,100000,'{"winMultiplierBps":19000}',10),
    (p_campaign,'bone_prophecy','bone_dice','solo','Kemik Zar Kehaneti','İki oyma kemik zarın toplamı için düşük, yedi veya yüksek kehanetini seç.',10,100000,'{"lowHighMultiplierBps":20000,"sevenMultiplierBps":50000}',20),
    (p_campaign,'moonstone_cups','shells','solo','Kupa Altındaki Aytaşı','Hancı aytaşını tunç kupalardan birinin altına saklar. Doğru kupayı bul.',10,100000,'{"cupCount":3,"winMultiplierBps":27000}',30),
    (p_campaign,'dragon_wheel','wheel','solo','Ejderha Çarkı','Ejderha pullarıyla işaretli çarkı döndür; alev dilimi bahsi yakar, hazine dilimi büyütür.',10,100000,'{"segments":[0,0,0,0,5000,10000,10000,15000,20000,30000]}',40),
    (p_campaign,'high_dice_table','high_roll','table','Yüksek Zar Masası','Masadaki herkes d20 atar. En yüksek atan, kasa payı çıktıktan sonra ortak potu alır; eşitlikte pot bölünür.',10,100000,'{"houseCutBps":500,"minPlayers":2,"maxPlayers":10,"sides":20}',50),
    (p_campaign,'six_seals','sigil_draw','table','Altı Mühür Çekilişi','Oyuncular altı kadim mühürden birini seçer. Çekilen mührü bilenler ortak potu paylaşır.',10,100000,'{"houseCutBps":500,"minPlayers":2,"maxPlayers":12,"sides":6}',60)
  on conflict(campaign_id,game_key) do nothing;
end
$$;

create or replace function public.casino_load_v77(p_session_token text,p_campaign uuid)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=public.v66_session_user(p_session_token); member_role text; settings_json jsonb; games_json jsonb; rounds_json jsonb; history_json jsonb; wallet_total bigint;
begin
  select m.role into member_role from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid;
  if uid is null or member_role is null then raise exception 'Oturum veya kampanya üyeliği geçersiz'; end if;
  perform public.casino_seed_v77(p_campaign);

  select jsonb_build_object('isOpen',s.is_open,'title',s.title,'houseNote',s.house_note,'updatedAt',s.updated_at)
  into settings_json from public.casino_settings_v77 s where s.campaign_id=p_campaign;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',g.id,'key',g.game_key,'kind',g.kind,'mode',g.mode,'name',g.name,'description',g.description,
    'enabled',g.enabled,'minBet',g.min_bet,'maxBet',g.max_bet,'config',g.config,'sortOrder',g.sort_order,'updatedAt',g.updated_at
  ) order by g.sort_order,g.name),'[]'::jsonb)
  into games_json from public.casino_games_v77 g
  where g.campaign_id=p_campaign and (member_role='dm' or g.enabled);

  select coalesce(jsonb_agg(row_json order by created_at desc),'[]'::jsonb) into rounds_json
  from (
    select r.created_at,jsonb_build_object(
      'id',r.id,'gameId',r.game_id,'status',r.status,'result',r.result,'createdAt',r.created_at,'resolvedAt',r.resolved_at,
      'bets',coalesce((select jsonb_agg(jsonb_build_object(
        'id',p.id,'userId',p.user_id,'playerName',a.display_name,'stake',p.stake,
        'selection',case when member_role='dm' or r.status<>'open' or p.user_id=uid then p.selection else '{}'::jsonb end,
        'result',case when member_role='dm' or r.status<>'open' or p.user_id=uid then p.result else '{}'::jsonb end,
        'payout',case when member_role='dm' or r.status<>'open' or p.user_id=uid then p.payout else 0 end,
        'outcome',p.outcome,'createdAt',p.created_at
      ) order by p.created_at) from public.casino_plays_v77 p join public.accounts a on a.id=p.user_id where p.round_id=r.id),'[]'::jsonb)
    ) row_json
    from public.casino_rounds_v77 r join public.casino_games_v77 g on g.id=r.game_id
    where r.campaign_id=p_campaign and (r.status='open' or r.created_at>now()-interval '14 days')
      and (member_role='dm' or g.enabled or exists(select 1 from public.casino_plays_v77 p where p.round_id=r.id and p.user_id=uid))
    order by r.created_at desc limit 30
  ) recent_rounds;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'operationId',p.operation_id,'gameId',p.game_id,'gameName',g.name,'gameKind',g.kind,'roundId',p.round_id,
    'userId',p.user_id,'playerName',a.display_name,'stake',p.stake,'selection',p.selection,'result',p.result,
    'payout',p.payout,'outcome',p.outcome,'createdAt',p.created_at,'resolvedAt',p.resolved_at
  ) order by p.created_at desc),'[]'::jsonb)
  into history_json
  from (select * from public.casino_plays_v77 x where x.campaign_id=p_campaign and (member_role='dm' or x.user_id=uid) order by x.created_at desc limit 80) p
  join public.casino_games_v77 g on g.id=p.game_id join public.accounts a on a.id=p.user_id;

  if member_role='player' then
    insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,uid) on conflict do nothing;
    select w.platinum::bigint*1000+w.gold::bigint*100+w.silver::bigint*10+w.copper::bigint into wallet_total
    from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id=uid;
  end if;
  return jsonb_build_object('role',member_role,'settings',settings_json,'games',games_json,'rounds',rounds_json,'history',history_json,'wallet',wallet_total);
end
$$;

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

revoke all on table public.casino_settings_v77,public.casino_games_v77,public.casino_rounds_v77,public.casino_plays_v77,public.casino_operations_v77 from public,anon,authenticated;
revoke all on function public.casino_random_v77(integer),public.casino_config_v77(text,jsonb),public.casino_seed_v77(uuid),
  public.casino_load_v77(text,uuid),public.casino_action_v77(text,uuid,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.casino_load_v77(text,uuid),public.casino_action_v77(text,uuid,text,jsonb,uuid) to anon;

comment on function public.casino_action_v77(text,uuid,text,jsonb,uuid)
is 'Token-scoped idempotent casino mutation API. Wallet debits, payouts, table resolution and refunds are atomic.';
