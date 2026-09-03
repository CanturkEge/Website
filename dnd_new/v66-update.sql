-- v66: Market cart negotiation and player-to-NPC transfers.
-- Existing accounts, campaigns, wallets, characters and inventory are preserved.

create table if not exists public.market_orders_v66(
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.accounts(id) on delete cascade,
  items jsonb not null check(jsonb_typeof(items)='array'),
  list_total integer not null check(list_total>=0),
  player_offer integer not null check(player_offer>0),
  dm_offer integer check(dm_offer>0),
  status text not null default 'pending' check(status in ('pending','countered','completed','rejected','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.market_orders_v66 enable row level security;
create index if not exists market_orders_v66_campaign_status_idx on public.market_orders_v66(campaign_id,status,updated_at desc);

create or replace function public.v66_session_user(p_token text) returns uuid
language sql security definer set search_path=public,extensions stable as $$
  select s.user_id from public.account_sessions_v54 s
  where s.token_hash=encode(digest(coalesce(p_token,''),'sha256'),'hex') and s.expires_at>now()
  limit 1
$$;

create or replace function public.market_order_submit_v66(p_session_token text,p_campaign uuid,p_items jsonb,p_offer integer)
returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid; st jsonb; entry jsonb; market_item jsonb; resolved jsonb='[]'::jsonb; total integer=0; qty integer; discount integer; oid uuid; shop_cfg jsonb;
begin
  uid:=public.v66_session_user(p_session_token); if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  if not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=uid and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>30 then raise exception 'Sepet 1-30 satır olmalı'; end if;
  select state into st from public.campaigns where id=p_campaign;
  if not coalesce((st#>>'{shopSettings,buyingEnabled}')::boolean,false) then raise exception 'DM satın almayı kapattı'; end if;
  discount:=greatest(0,least(90,coalesce((st#>>'{shopSettings,discount}')::integer,0)));
  for entry in select value from jsonb_array_elements(p_items) loop
    qty:=greatest(1,least(99,coalesce((entry->>'qty')::integer,1)));
    select value into market_item from jsonb_array_elements(coalesce(st->'market','[]'::jsonb)) where value->>'id'=entry->>'itemId' limit 1;
    if market_item is null or coalesce((market_item->>'active')::boolean,true)=false then raise exception 'Sepetteki ürün artık satılmıyor'; end if;
    shop_cfg:=st#>array['shopSettings','shops',market_item->>'shop'];
    if shop_cfg is null or not coalesce((shop_cfg->>'enabled')::boolean,false) or coalesce((shop_cfg->>'tier')::integer,0)<coalesce((market_item->>'tier')::integer,1) then raise exception '% dükkânı veya ürün tieri açık değil',market_item->>'name'; end if;
    if coalesce((market_item->>'stock')::integer,0)<qty then raise exception '% için stok yetersiz',market_item->>'name'; end if;
    total:=total+round(coalesce((market_item->>'priceCopper')::numeric,0)*(100-discount)/100)::integer*qty;
    resolved:=resolved||jsonb_build_array(jsonb_build_object('itemId',market_item->>'id','name',market_item->>'name','qty',qty,'unitPrice',round(coalesce((market_item->>'priceCopper')::numeric,0)*(100-discount)/100)::integer));
  end loop;
  if p_offer is null or p_offer<1 or p_offer>total then raise exception 'Teklif 1 ile sepet toplamı arasında olmalı'; end if;
  insert into public.market_orders_v66(campaign_id,user_id,items,list_total,player_offer) values(p_campaign,uid,resolved,total,p_offer) returning id into oid;
  return oid;
end $$;

create or replace function public.market_order_list_v66(p_session_token text,p_campaign uuid)
returns table(id uuid,user_id uuid,player_name text,items jsonb,list_total integer,player_offer integer,dm_offer integer,status text,updated_at timestamptz)
language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid; member_role text;
begin
  uid:=public.v66_session_user(p_session_token); if uid is null then raise exception 'Oturum geçersiz'; end if;
  select cm.role into member_role
  from public.campaign_members cm
  where cm.campaign_id=p_campaign and cm.user_id=uid;
  if member_role is null then raise exception 'Kampanya üyesi değilsin'; end if;
  return query select o.id,o.user_id,a.display_name,o.items,o.list_total,o.player_offer,o.dm_offer,o.status,o.updated_at
  from public.market_orders_v66 o join public.accounts a on a.id=o.user_id
  where o.campaign_id=p_campaign and (member_role='dm' or o.user_id=uid) order by o.updated_at desc limit 100;
end $$;

create or replace function public.market_order_counter_v66(p_session_token text,p_campaign uuid,p_order uuid,p_amount integer)
returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid; ceiling integer;
begin
  uid:=public.v66_session_user(p_session_token); if uid is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=uid and role='dm') then raise exception 'Yalnızca DM karşı teklif verebilir'; end if;
  select list_total into ceiling from public.market_orders_v66 where id=p_order and campaign_id=p_campaign and status in('pending','countered') for update;
  if ceiling is null then raise exception 'Aktif teklif bulunamadı'; end if;
  if p_amount<1 or p_amount>ceiling then raise exception 'Karşı teklif geçersiz'; end if;
  update public.market_orders_v66 set dm_offer=p_amount,status='countered',updated_at=now() where id=p_order; return true;
end $$;

create or replace function public.market_order_finish_v66(p_session_token text,p_campaign uuid,p_order uuid,p_action text)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid; member_role text; ord public.market_orders_v66%rowtype; final_price integer; st jsonb; entry jsonb; market_item jsonb; item_idx integer; char_idx integer; inv jsonb; qty integer; stock integer; total bigint; item_copy jsonb;
begin
  uid:=public.v66_session_user(p_session_token); if uid is null then raise exception 'Oturum geçersiz'; end if;
  select role into member_role from public.campaign_members where campaign_id=p_campaign and user_id=uid;
  select * into ord from public.market_orders_v66 where id=p_order and campaign_id=p_campaign for update;
  if ord.id is null then raise exception 'Teklif bulunamadı'; end if;
  if p_action='reject' and member_role='dm' and ord.status in('pending','countered') then update public.market_orders_v66 set status='rejected',updated_at=now() where id=p_order; return jsonb_build_object('status','rejected'); end if;
  if p_action='cancel' and uid=ord.user_id and ord.status in('pending','countered') then update public.market_orders_v66 set status='cancelled',updated_at=now() where id=p_order; return jsonb_build_object('status','cancelled'); end if;
  if not ((member_role='dm' and ord.status='pending' and p_action='approve') or (uid=ord.user_id and ord.status='countered' and p_action='accept')) then raise exception 'Bu teklifi sonuçlandırma yetkin yok'; end if;
  final_price:=case when ord.status='countered' then ord.dm_offer else ord.player_offer end;
  select state into st from public.campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into char_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=ord.user_id::text limit 1;
  if char_idx is null then raise exception 'Oyuncunun karakteri yok'; end if;
  insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,ord.user_id) on conflict do nothing;
  select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into total from public.campaign_wallets where campaign_id=p_campaign and user_id=ord.user_id for update;
  if total<final_price then raise exception 'Oyuncunun parası yetersiz'; end if;
  inv:=coalesce(st#>array['characters',char_idx::text,'inventory'],'[]'::jsonb);
  for entry in select value from jsonb_array_elements(ord.items) loop
    qty:=(entry->>'qty')::integer;
    select (e.ordinality-1)::integer,e.value into item_idx,market_item from jsonb_array_elements(coalesce(st->'market','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'id'=entry->>'itemId' limit 1;
    stock:=coalesce((market_item->>'stock')::integer,0); if item_idx is null or stock<qty then raise exception '% için stok kalmadı',entry->>'name'; end if;
    item_copy:=(market_item-'stock'-'active'-'shop'-'priceCopper'-'tier'-'ready'-'custom')||jsonb_build_object('id',gen_random_uuid()::text,'sourceItemId',market_item->>'id','qty',qty,'equipped',false,'purchased',true,'purchasePrice',final_price);
    inv:=inv||jsonb_build_array(item_copy); st:=jsonb_set(st,array['market',item_idx::text,'stock'],to_jsonb(stock-qty),true);
  end loop;
  st:=jsonb_set(st,array['characters',char_idx::text,'inventory'],inv,true); total:=total-final_price;
  update public.campaign_wallets set platinum=(total/1000)::integer,gold=((total%1000)/100)::integer,silver=((total%100)/10)::integer,copper=(total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=ord.user_id;
  update public.campaigns set state=st,updated_at=now() where id=p_campaign;
  update public.market_orders_v66 set status='completed',updated_at=now() where id=p_order;
  return jsonb_build_object('status','completed','paid',final_price);
end $$;

create or replace function public.npc_transfer_v66(p_session_token text,p_campaign uuid,p_npc text,p_kind text,p_item_index integer default null,p_coin text default null,p_amount integer default 1)
returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid; st jsonb; ci integer; ni integer; inv jsonb; ninv jsonb; item jsonb; qty integer; coins jsonb; mult bigint; total bigint;
begin
  uid:=public.v66_session_user(p_session_token); if uid is null then raise exception 'Oturum geçersiz'; end if;
  if not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=uid and role='player') then raise exception 'Oyuncu değilsin'; end if;
  if p_amount is null or p_amount<1 or p_amount>999 then raise exception 'Miktar 1-999 arasında olmalı'; end if;
  if p_kind='item' and (p_item_index is null or p_item_index<0) then raise exception 'Eşya sırası geçersiz'; end if;
  qty:=p_amount; select state into st from public.campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=uid::text limit 1;
  select (e.ordinality-1)::integer into ni from jsonb_array_elements(coalesce(st->'npcs','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'id'=p_npc limit 1;
  if ci is null or ni is null then raise exception 'Karakter veya NPC bulunamadı'; end if;
  if p_kind='item' then
    inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb); item:=inv->p_item_index;
    if item is null or coalesce((item->>'qty')::integer,1)<qty then raise exception 'Eşya adedi yetersiz'; end if;
    ninv:=coalesce(st#>array['npcs',ni::text,'inventory'],'[]'::jsonb);
    ninv:=ninv||jsonb_build_array((item||jsonb_build_object('id',gen_random_uuid()::text,'qty',qty,'equipped',false)));
    if coalesce((item->>'qty')::integer,1)=qty then inv:=inv-p_item_index; else inv:=jsonb_set(inv,array[p_item_index::text,'qty'],to_jsonb((item->>'qty')::integer-qty),false); end if;
    st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true); st:=jsonb_set(st,array['npcs',ni::text,'inventory'],ninv,true);
  elsif p_kind='coin' then
    mult:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 when 'copper' then 1 end; if mult is null then raise exception 'Para türü geçersiz'; end if;
    insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,uid) on conflict do nothing;
    select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into total from public.campaign_wallets where campaign_id=p_campaign and user_id=uid for update;
    if total<qty*mult then raise exception 'Yeterli paran yok'; end if; total:=total-qty*mult;
    update public.campaign_wallets set platinum=(total/1000)::integer,gold=((total%1000)/100)::integer,silver=((total%100)/10)::integer,copper=(total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=uid;
    coins:=coalesce(st#>array['npcs',ni::text,'coins'],'{}'::jsonb); coins:=jsonb_set(coins,array[case p_coin when 'platinum' then 'pp' when 'gold' then 'gp' when 'silver' then 'sp' else 'cp' end],to_jsonb(coalesce((coins->>case p_coin when 'platinum' then 'pp' when 'gold' then 'gp' when 'silver' then 'sp' else 'cp' end)::integer,0)+qty),true); st:=jsonb_set(st,array['npcs',ni::text,'coins'],coins,true);
  else raise exception 'Transfer türü geçersiz'; end if;
  update public.campaigns set state=st,updated_at=now() where id=p_campaign; return true;
end $$;

revoke all on table public.market_orders_v66 from public,anon,authenticated;
revoke all on function public.v66_session_user(text),public.market_order_submit_v66(text,uuid,jsonb,integer),public.market_order_list_v66(text,uuid),public.market_order_counter_v66(text,uuid,uuid,integer),public.market_order_finish_v66(text,uuid,uuid,text),public.npc_transfer_v66(text,uuid,text,text,integer,text,integer) from public,anon,authenticated;
grant execute on function public.market_order_submit_v66(text,uuid,jsonb,integer),public.market_order_list_v66(text,uuid),public.market_order_counter_v66(text,uuid,uuid,integer),public.market_order_finish_v66(text,uuid,uuid,text),public.npc_transfer_v66(text,uuid,text,text,integer,text,integer) to anon;
