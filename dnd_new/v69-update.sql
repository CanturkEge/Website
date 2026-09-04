-- v69: Multi-round market negotiation and DM audit log.
-- Existing accounts, campaigns, orders, wallets, characters, NPCs and inventory are preserved.

alter table public.market_orders_v66
  add column if not exists negotiation_locked boolean not null default false,
  add column if not exists last_offer_by text not null default 'player',
  add column if not exists offer_history jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists(
    select 1 from pg_constraint
    where conname='market_orders_v69_last_offer_by_check'
      and conrelid='public.market_orders_v66'::regclass
  ) then
    alter table public.market_orders_v66
      add constraint market_orders_v69_last_offer_by_check
      check(last_offer_by in ('player','dm'));
  end if;
end
$$;

update public.market_orders_v66 o
set last_offer_by=case when o.dm_offer is not null and o.status in ('countered','completed') then 'dm' else 'player' end,
    offer_history=
      jsonb_build_array(jsonb_build_object(
        'by','player','amount',o.player_offer,'locked',false,'at',o.created_at
      ))
      || case when o.dm_offer is not null then jsonb_build_array(jsonb_build_object(
        'by','dm','amount',o.dm_offer,'locked',false,'at',o.updated_at
      )) else '[]'::jsonb end
where o.offer_history='[]'::jsonb;

create table if not exists public.campaign_audit_log_v69(
  id bigint generated always as identity primary key,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  actor_user_id uuid references public.accounts(id) on delete set null,
  action text not null,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.campaign_audit_log_v69 enable row level security;
create index if not exists campaign_audit_log_v69_campaign_created_idx
  on public.campaign_audit_log_v69(campaign_id,created_at desc,id desc);
create index if not exists campaign_audit_log_v69_actor_idx
  on public.campaign_audit_log_v69(actor_user_id);

create or replace function public.audit_insert_v69(
  p_campaign uuid,p_actor uuid,p_action text,p_title text,p_body text,p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path=public as $$
begin
  insert into public.campaign_audit_log_v69(campaign_id,actor_user_id,action,title,body,metadata)
  values(
    p_campaign,p_actor,left(coalesce(p_action,'other'),40),left(coalesce(p_title,'İşlem'),120),
    left(coalesce(p_body,''),1000),
    case when jsonb_typeof(coalesce(p_metadata,'{}'::jsonb))='object' then coalesce(p_metadata,'{}'::jsonb) else '{}'::jsonb end
  );
end
$$;

create or replace function public.audit_record_v69(
  p_session_token text,p_campaign uuid,p_action text,p_title text,p_body text,p_metadata jsonb default '{}'::jsonb
) returns boolean
language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  if not exists(select 1 from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid) then
    raise exception 'Kampanya üyesi değilsin';
  end if;
  if coalesce(p_action,'') not in (
    'item_transfer','item_ground','item_take','dm_item_grant','npc_item','npc_money',
    'wallet_adjust','loot_money','guild_action','other'
  ) then raise exception 'Log işlem türü geçersiz'; end if;
  perform public.audit_insert_v69(p_campaign,uid,p_action,p_title,p_body,p_metadata);
  return true;
end
$$;

create or replace function public.market_order_submit_v69(
  p_session_token text,p_campaign uuid,p_items jsonb,p_offer integer
) returns uuid
language plpgsql security definer set search_path=public as $$
declare oid uuid;
begin
  oid:=public.market_order_submit_v66(p_session_token,p_campaign,p_items,p_offer);
  update public.market_orders_v66 o
  set last_offer_by='player',negotiation_locked=false,
      offer_history=jsonb_build_array(jsonb_build_object(
        'by','player','amount',o.player_offer,'locked',false,'at',o.created_at
      ))
  where o.id=oid;
  return oid;
end
$$;

create or replace function public.market_order_list_v69(p_session_token text,p_campaign uuid)
returns table(
  id uuid,user_id uuid,player_name text,items jsonb,list_total integer,
  player_offer integer,dm_offer integer,status text,negotiation_locked boolean,
  last_offer_by text,offer_history jsonb,created_at timestamptz,updated_at timestamptz
)
language plpgsql security definer set search_path=public as $$
declare uid uuid; member_role text;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  select cm.role into member_role from public.campaign_members cm
  where cm.campaign_id=p_campaign and cm.user_id=uid;
  if member_role is null then raise exception 'Kampanya üyesi değilsin'; end if;
  return query
  select o.id,o.user_id,a.display_name,o.items,o.list_total,o.player_offer,o.dm_offer,o.status,
    o.negotiation_locked,o.last_offer_by,o.offer_history,o.created_at,o.updated_at
  from public.market_orders_v66 o
  join public.accounts a on a.id=o.user_id
  where o.campaign_id=p_campaign and (member_role='dm' or o.user_id=uid)
  order by (o.status in ('pending','countered')) desc,o.updated_at desc
  limit 200;
end
$$;

create or replace function public.market_order_counter_v69(
  p_session_token text,p_campaign uuid,p_order uuid,p_amount integer,p_locked boolean
) returns boolean
language plpgsql security definer set search_path=public as $$
declare uid uuid; ord public.market_orders_v66%rowtype;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null or not exists(
    select 1 from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid and m.role='dm'
  ) then raise exception 'Yalnızca DM karşı teklif verebilir'; end if;
  if p_amount is null or p_amount<1 or p_amount>2000000000 then raise exception 'Karşı teklif geçersiz'; end if;
  select * into ord from public.market_orders_v66 o
  where o.id=p_order and o.campaign_id=p_campaign for update;
  if ord.id is null then raise exception 'Teklif bulunamadı'; end if;
  if ord.status<>'pending' or ord.last_offer_by<>'player' then
    raise exception 'Önce oyuncunun yeni teklifini beklemelisin';
  end if;
  update public.market_orders_v66 o
  set dm_offer=p_amount,status='countered',last_offer_by='dm',
      negotiation_locked=coalesce(p_locked,false),updated_at=now(),
      offer_history=coalesce(o.offer_history,'[]'::jsonb)||jsonb_build_array(jsonb_build_object(
        'by','dm','amount',p_amount,'locked',coalesce(p_locked,false),'at',now()
      ))
  where o.id=p_order;
  return true;
end
$$;

create or replace function public.market_order_player_counter_v69(
  p_session_token text,p_campaign uuid,p_order uuid,p_amount integer
) returns boolean
language plpgsql security definer set search_path=public as $$
declare uid uuid; ord public.market_orders_v66%rowtype;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  if p_amount is null or p_amount<1 or p_amount>2000000000 then raise exception 'Karşı teklif geçersiz'; end if;
  select * into ord from public.market_orders_v66 o
  where o.id=p_order and o.campaign_id=p_campaign for update;
  if ord.id is null or ord.user_id<>uid then raise exception 'Teklif sana ait değil'; end if;
  if ord.status<>'countered' or ord.last_offer_by<>'dm' then raise exception 'DM karşı teklifi bekleniyor'; end if;
  if ord.negotiation_locked then raise exception 'DM bu fiyatı pazarlığa kapattı'; end if;
  update public.market_orders_v66 o
  set player_offer=p_amount,status='pending',last_offer_by='player',
      negotiation_locked=false,updated_at=now(),
      offer_history=coalesce(o.offer_history,'[]'::jsonb)||jsonb_build_array(jsonb_build_object(
        'by','player','amount',p_amount,'locked',false,'at',now()
      ))
  where o.id=p_order;
  return true;
end
$$;

create or replace function public.market_order_clear_history_v69(
  p_session_token text,p_campaign uuid
) returns integer
language plpgsql security definer set search_path=public as $$
declare uid uuid; removed integer;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null or not exists(
    select 1 from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid and m.role='dm'
  ) then raise exception 'Yalnızca DM market geçmişini temizleyebilir'; end if;
  delete from public.market_orders_v66 o
  where o.campaign_id=p_campaign and o.status in ('completed','rejected','cancelled');
  get diagnostics removed=row_count;
  return removed;
end
$$;

create or replace function public.market_order_notify_v68()
returns trigger
language plpgsql security definer set search_path=public as $$
declare player_name text; line_count integer;
begin
  select coalesce(a.display_name,'Oyuncu') into player_name from public.accounts a where a.id=new.user_id;
  line_count:=case when jsonb_typeof(new.items)='array' then jsonb_array_length(new.items) else 0 end;
  if tg_op='INSERT' then
    insert into public.campaign_notifications(campaign_id,user_id,title,body)
    select new.campaign_id,cm.user_id,'Yeni market teklifi',
      left(player_name||' marketten '||line_count||' kalem için '||new.player_offer||' CP teklif gönderdi.',500)
    from public.campaign_members cm where cm.campaign_id=new.campaign_id and cm.role='dm';
  elsif old.status is distinct from new.status then
    if new.status='pending' and new.last_offer_by='player' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      select new.campaign_id,cm.user_id,'Oyuncudan karşı teklif',
        left(player_name||' market teklifini '||new.player_offer||' CP olarak güncelledi.',500)
      from public.campaign_members cm where cm.campaign_id=new.campaign_id and cm.role='dm';
    elsif new.status='countered' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      values(new.campaign_id,new.user_id,'DM karşı teklif gönderdi',
        left('Market sepetin için karşı teklif: '||coalesce(new.dm_offer,new.player_offer)||' CP.'||case when new.negotiation_locked then ' Bu son fiyat; yeni karşı teklif gönderilemez.' else '' end,500));
    elsif new.status='completed' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      values(new.campaign_id,new.user_id,'Market alışverişi tamamlandı','Ödeme alındı; satın aldığın eşyalar envanterine aktarıldı.');
    elsif new.status='rejected' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      values(new.campaign_id,new.user_id,'Market teklifi reddedildi','DM market teklifini reddetti.');
    elsif new.status='cancelled' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      select new.campaign_id,cm.user_id,'Market teklifi iptal edildi',left(player_name||' market teklifini iptal etti.',500)
      from public.campaign_members cm where cm.campaign_id=new.campaign_id and cm.role='dm';
    end if;
  end if;
  return new;
end
$$;

create or replace function public.market_order_audit_v69()
returns trigger
language plpgsql security definer set search_path=public as $$
declare paid integer; item_summary text; player_name text;
begin
  if old.status is distinct from new.status and new.status='completed' then
    paid:=case when old.status='countered' then new.dm_offer else new.player_offer end;
    select coalesce(a.display_name,'Oyuncu') into player_name from public.accounts a where a.id=new.user_id;
    select string_agg(coalesce(e.value->>'name','Eşya')||' ×'||coalesce(e.value->>'qty','1'),', ')
      into item_summary from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) e(value);
    perform public.audit_insert_v69(
      new.campaign_id,new.user_id,'market_purchase','Market alışverişi tamamlandı',
      player_name||' '||coalesce(item_summary,'eşya')||' için '||paid||' CP ödedi.',
      jsonb_build_object('orderId',new.id,'paidCopper',paid,'listTotalCopper',new.list_total,'items',new.items)
    );
  end if;
  return new;
end
$$;

drop trigger if exists market_order_audit_v69_trigger on public.market_orders_v66;
create trigger market_order_audit_v69_trigger
after update on public.market_orders_v66
for each row execute function public.market_order_audit_v69();

create or replace function public.wallet_transfer_v69(
  p_session_token text,p_campaign uuid,p_target uuid,p_coin text,p_amount integer
) returns boolean
language plpgsql security definer set search_path=public as $$
declare uid uuid; sender_name text; target_name text; label text;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  perform public.wallet_transfer(uid,p_campaign,p_target,p_coin,p_amount);
  select a.display_name into sender_name from public.accounts a where a.id=uid;
  select a.display_name into target_name from public.accounts a where a.id=p_target;
  label:=case p_coin when 'platinum' then 'PP' when 'gold' then 'GP' when 'silver' then 'SP' else 'CP' end;
  perform public.audit_insert_v69(p_campaign,uid,'money_transfer','Oyuncular arası para transferi',
    coalesce(sender_name,'Oyuncu')||' → '||coalesce(target_name,'Oyuncu')||': '||p_amount||' '||label,
    jsonb_build_object('targetUserId',p_target,'coin',p_coin,'amount',p_amount));
  return true;
end
$$;

create or replace function public.wallet_discard_v61(
  p_session_token text,p_campaign uuid,p_coin text,p_amount integer
) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare session_user_id uuid; multiplier bigint; discard_value bigint; total bigint; label text;
begin
  if length(coalesce(p_session_token,''))<32 then raise exception 'Oturum geçersiz; yeniden giriş yap'; end if;
  if p_amount is null or p_amount<=0 then raise exception 'Miktar sıfırdan büyük olmalı'; end if;
  select s.user_id into session_user_id from public.account_sessions_v54 s
  where s.token_hash=encode(digest(p_session_token,'sha256'),'hex') and s.expires_at>now();
  if session_user_id is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  if not exists(select 1 from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=session_user_id and m.role='player') then
    raise exception 'Bu kampanyada oyuncu değilsin';
  end if;
  multiplier:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 when 'copper' then 1 else null end;
  if multiplier is null then raise exception 'Geçersiz para türü'; end if;
  discard_value:=p_amount::bigint*multiplier;
  insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,session_user_id) on conflict do nothing;
  select w.platinum*1000::bigint+w.gold*100::bigint+w.silver*10::bigint+w.copper into total
  from public.campaign_wallets w where w.campaign_id=p_campaign and w.user_id=session_user_id for update;
  if total<discard_value then raise exception 'Yeterli paran yok'; end if;
  total:=total-discard_value;
  update public.campaign_wallets set platinum=(total/1000)::integer,gold=((total%1000)/100)::integer,
    silver=((total%100)/10)::integer,copper=(total%10)::integer,updated_at=now()
  where campaign_id=p_campaign and user_id=session_user_id;
  label:=case p_coin when 'platinum' then 'PP' when 'gold' then 'GP' when 'silver' then 'SP' else 'CP' end;
  perform public.audit_insert_v69(p_campaign,session_user_id,'money_discard','Oyuncu para sildi',
    p_amount||' '||label||' keseden kalıcı olarak silindi.',jsonb_build_object('coin',p_coin,'amount',p_amount,'copperValue',discard_value));
  return jsonb_build_object('platinum',(total/1000)::integer,'gold',((total%1000)/100)::integer,
    'silver',((total%100)/10)::integer,'copper',(total%10)::integer,'discardedCopper',discard_value);
end
$$;

create or replace function public.npc_transfer_v66(
  p_session_token text,p_campaign uuid,p_npc text,p_kind text,p_item_index integer default null,
  p_coin text default null,p_amount integer default 1
) returns boolean
language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid; st jsonb; ci integer; ni integer; inv jsonb; ninv jsonb; item jsonb; qty integer;
  coins jsonb; mult bigint; total bigint; npc_name text; item_name text; label text;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz'; end if;
  if not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=uid and role='player') then raise exception 'Oyuncu değilsin'; end if;
  if p_amount is null or p_amount<1 or p_amount>999 then raise exception 'Miktar 1-999 arasında olmalı'; end if;
  if p_kind='item' and (p_item_index is null or p_item_index<0) then raise exception 'Eşya sırası geçersiz'; end if;
  qty:=p_amount;select state into st from public.campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=uid::text limit 1;
  select (e.ordinality-1)::integer into ni from jsonb_array_elements(coalesce(st->'npcs','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'id'=p_npc limit 1;
  if ci is null or ni is null then raise exception 'Karakter veya NPC bulunamadı'; end if;
  npc_name:=coalesce(st#>>array['npcs',ni::text,'name'],'NPC');
  if p_kind='item' then
    inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);item:=inv->p_item_index;item_name:=coalesce(item->>'name','Eşya');
    if item is null or coalesce((item->>'qty')::integer,1)<qty then raise exception 'Eşya adedi yetersiz'; end if;
    ninv:=coalesce(st#>array['npcs',ni::text,'inventory'],'[]'::jsonb);
    ninv:=ninv||jsonb_build_array(item||jsonb_build_object('id',gen_random_uuid()::text,'qty',qty,'equipped',false));
    if coalesce((item->>'qty')::integer,1)=qty then inv:=inv-p_item_index; else inv:=jsonb_set(inv,array[p_item_index::text,'qty'],to_jsonb((item->>'qty')::integer-qty),false); end if;
    st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true);st:=jsonb_set(st,array['npcs',ni::text,'inventory'],ninv,true);
  elsif p_kind='coin' then
    mult:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 when 'copper' then 1 end;
    if mult is null then raise exception 'Para türü geçersiz'; end if;
    insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,uid) on conflict do nothing;
    select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into total from public.campaign_wallets where campaign_id=p_campaign and user_id=uid for update;
    if total<qty*mult then raise exception 'Yeterli paran yok'; end if;total:=total-qty*mult;
    update public.campaign_wallets set platinum=(total/1000)::integer,gold=((total%1000)/100)::integer,
      silver=((total%100)/10)::integer,copper=(total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=uid;
    coins:=coalesce(st#>array['npcs',ni::text,'coins'],'{}'::jsonb);
    coins:=jsonb_set(coins,array[case p_coin when 'platinum' then 'pp' when 'gold' then 'gp' when 'silver' then 'sp' else 'cp' end],
      to_jsonb(coalesce((coins->>case p_coin when 'platinum' then 'pp' when 'gold' then 'gp' when 'silver' then 'sp' else 'cp' end)::integer,0)+qty),true);
    st:=jsonb_set(st,array['npcs',ni::text,'coins'],coins,true);
  else raise exception 'Transfer türü geçersiz'; end if;
  update public.campaigns set state=st,updated_at=now() where id=p_campaign;
  if p_kind='item' then
    perform public.audit_insert_v69(p_campaign,uid,'npc_item','NPC’ye eşya gönderildi',
      qty||'× '||item_name||' → '||npc_name,jsonb_build_object('npcId',p_npc,'item',item_name,'quantity',qty));
  else
    label:=case p_coin when 'platinum' then 'PP' when 'gold' then 'GP' when 'silver' then 'SP' else 'CP' end;
    perform public.audit_insert_v69(p_campaign,uid,'npc_money','NPC’ye para gönderildi',
      qty||' '||label||' → '||npc_name,jsonb_build_object('npcId',p_npc,'coin',p_coin,'amount',qty));
  end if;
  return true;
end
$$;

create or replace function public.dm_audit_list_v69(p_session_token text,p_campaign uuid)
returns table(id bigint,actor_name text,action text,title text,body text,metadata jsonb,created_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare uid uuid;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null or not exists(
    select 1 from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid and m.role='dm'
  ) then raise exception 'Yalnızca DM işlem logunu görebilir'; end if;
  return query select l.id,coalesce(a.display_name,'Sistem'),l.action,l.title,l.body,l.metadata,l.created_at
  from public.campaign_audit_log_v69 l left join public.accounts a on a.id=l.actor_user_id
  where l.campaign_id=p_campaign order by l.created_at desc,l.id desc limit 500;
end
$$;

create or replace function public.dm_audit_clear_v69(p_session_token text,p_campaign uuid)
returns integer
language plpgsql security definer set search_path=public as $$
declare uid uuid; removed integer;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null or not exists(
    select 1 from public.campaign_members m where m.campaign_id=p_campaign and m.user_id=uid and m.role='dm'
  ) then raise exception 'Yalnızca DM işlem logunu temizleyebilir'; end if;
  delete from public.campaign_audit_log_v69 l where l.campaign_id=p_campaign;
  get diagnostics removed=row_count;
  return removed;
end
$$;

revoke all on table public.campaign_audit_log_v69 from public,anon,authenticated;
revoke all on function public.audit_insert_v69(uuid,uuid,text,text,text,jsonb),
  public.market_order_audit_v69(),public.market_order_notify_v68() from public,anon,authenticated;
revoke all on function public.audit_record_v69(text,uuid,text,text,text,jsonb),
  public.market_order_submit_v69(text,uuid,jsonb,integer),public.market_order_list_v69(text,uuid),
  public.market_order_counter_v69(text,uuid,uuid,integer,boolean),
  public.market_order_player_counter_v69(text,uuid,uuid,integer),
  public.market_order_clear_history_v69(text,uuid),public.wallet_transfer_v69(text,uuid,uuid,text,integer),
  public.wallet_discard_v61(text,uuid,text,integer),public.npc_transfer_v66(text,uuid,text,text,integer,text,integer),
  public.dm_audit_list_v69(text,uuid),public.dm_audit_clear_v69(text,uuid)
from public,anon,authenticated;

grant execute on function public.audit_record_v69(text,uuid,text,text,text,jsonb),
  public.market_order_submit_v69(text,uuid,jsonb,integer),public.market_order_list_v69(text,uuid),
  public.market_order_counter_v69(text,uuid,uuid,integer,boolean),
  public.market_order_player_counter_v69(text,uuid,uuid,integer),
  public.market_order_clear_history_v69(text,uuid),public.wallet_transfer_v69(text,uuid,uuid,text,integer),
  public.wallet_discard_v61(text,uuid,text,integer),public.npc_transfer_v66(text,uuid,text,text,integer,text,integer),
  public.dm_audit_list_v69(text,uuid),public.dm_audit_clear_v69(text,uuid)
to anon;
