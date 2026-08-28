-- Kadim Masa Defteri v22: güvenli para bozma, eksiltme ve oyuncular arası transfer
-- Mevcut hesapları, kampanyaları, karakterleri ve mesajları silmez.

create table if not exists public.campaign_wallets (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.accounts(id) on delete cascade,
  platinum integer not null default 0 check(platinum >= 0),
  gold integer not null default 0 check(gold >= 0),
  silver integer not null default 0 check(silver >= 0),
  copper integer not null default 0 check(copper >= 0),
  updated_at timestamptz not null default now(),
  primary key(campaign_id,user_id)
);

create table if not exists public.guild_wallets (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  platinum integer not null default 0 check(platinum >= 0),
  gold integer not null default 0 check(gold >= 0),
  silver integer not null default 0 check(silver >= 0),
  copper integer not null default 0 check(copper >= 0),
  updated_at timestamptz not null default now()
);

alter table public.campaign_wallets enable row level security;
alter table public.guild_wallets enable row level security;

create or replace function public.wallet_list(p_user uuid,p_campaign uuid)
returns table(user_id uuid,player_name text,platinum integer,gold integer,silver integer,copper integer)
language plpgsql security definer set search_path=public,extensions as $$
declare caller_role text;
begin
  select cm.role into caller_role from campaign_members cm
  where cm.campaign_id=p_campaign and cm.user_id=p_user;
  if caller_role is null then return; end if;

  insert into campaign_wallets(campaign_id,user_id)
  select cm.campaign_id,cm.user_id from campaign_members cm
  where cm.campaign_id=p_campaign and cm.role='player'
    and (caller_role='dm' or cm.user_id=p_user)
  on conflict do nothing;

  return query
  select w.user_id,a.display_name,w.platinum,w.gold,w.silver,w.copper
  from campaign_wallets w join accounts a on a.id=w.user_id
  where w.campaign_id=p_campaign and (caller_role='dm' or w.user_id=p_user)
  order by a.display_name;
end $$;

create or replace function public.guild_wallet_get(p_user uuid,p_campaign uuid)
returns table(platinum integer,gold integer,silver integer,copper integer)
language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user) then return; end if;
  insert into guild_wallets(campaign_id) values(p_campaign) on conflict do nothing;
  return query select g.platinum,g.gold,g.silver,g.copper from guild_wallets g where g.campaign_id=p_campaign;
end $$;

create or replace function public.wallet_adjust(p_user uuid,p_campaign uuid,p_target uuid,p_coin text,p_delta integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare total bigint; multiplier integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='dm') then raise exception 'Yalnızca DM para düzenleyebilir'; end if;
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_target and role='player') then raise exception 'Oyuncu bu kampanyada değil'; end if;
  if p_delta=0 then return true; end if;
  multiplier:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 when 'copper' then 1 else null end;
  if multiplier is null then raise exception 'Geçersiz para türü'; end if;
  insert into campaign_wallets(campaign_id,user_id) values(p_campaign,p_target) on conflict do nothing;
  select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into total from campaign_wallets where campaign_id=p_campaign and user_id=p_target for update;
  total:=total+(p_delta::bigint*multiplier);
  if total<0 then raise exception 'Yetersiz bakiye'; end if;
  update campaign_wallets set platinum=(total/1000)::integer,gold=((total%1000)/100)::integer,silver=((total%100)/10)::integer,copper=(total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=p_target;
  return true;
end $$;

create or replace function public.guild_wallet_adjust(p_user uuid,p_campaign uuid,p_coin text,p_delta integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare total bigint; multiplier integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='dm') then raise exception 'Yalnızca DM lonca kasasını düzenleyebilir'; end if;
  if p_delta=0 then return true; end if;
  multiplier:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 when 'copper' then 1 else null end;
  if multiplier is null then raise exception 'Geçersiz para türü'; end if;
  insert into guild_wallets(campaign_id) values(p_campaign) on conflict do nothing;
  select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into total from guild_wallets where campaign_id=p_campaign for update;
  total:=total+(p_delta::bigint*multiplier);
  if total<0 then raise exception 'Yetersiz lonca bakiyesi'; end if;
  update guild_wallets set platinum=(total/1000)::integer,gold=((total%1000)/100)::integer,silver=((total%100)/10)::integer,copper=(total%10)::integer,updated_at=now() where campaign_id=p_campaign;
  return true;
end $$;

create or replace function public.wallet_transfer(p_user uuid,p_campaign uuid,p_target uuid,p_coin text,p_amount integer)
returns boolean
language plpgsql security definer set search_path=public as $$
declare source_total bigint; target_total bigint; transfer_value bigint; multiplier integer;
begin
  if p_user=p_target then raise exception 'Kendine para gönderemezsin'; end if;
  if p_amount is null or p_amount<=0 then raise exception 'Miktar sıfırdan büyük olmalı'; end if;
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_target and role='player') then raise exception 'Alıcı bu kampanyada değil'; end if;
  multiplier:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 when 'copper' then 1 else null end;
  if multiplier is null then raise exception 'Geçersiz para türü'; end if;
  transfer_value:=p_amount::bigint*multiplier;
  insert into campaign_wallets(campaign_id,user_id) values(p_campaign,p_user),(p_campaign,p_target) on conflict do nothing;
  perform 1 from campaign_wallets where campaign_id=p_campaign and user_id in (p_user,p_target) order by user_id for update;
  select w.platinum*1000::bigint+w.gold*100::bigint+w.silver*10::bigint+w.copper into source_total from campaign_wallets w where w.campaign_id=p_campaign and w.user_id=p_user;
  if source_total<transfer_value then raise exception 'Yeterli paran yok'; end if;
  select w.platinum*1000::bigint+w.gold*100::bigint+w.silver*10::bigint+w.copper into target_total from campaign_wallets w where w.campaign_id=p_campaign and w.user_id=p_target;
  source_total:=source_total-transfer_value; target_total:=target_total+transfer_value;
  update campaign_wallets set platinum=(source_total/1000)::integer,gold=((source_total%1000)/100)::integer,silver=((source_total%100)/10)::integer,copper=(source_total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=p_user;
  update campaign_wallets set platinum=(target_total/1000)::integer,gold=((target_total%1000)/100)::integer,silver=((target_total%100)/10)::integer,copper=(target_total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=p_target;
  return true;
end $$;

create or replace function public.shop_buy(p_user uuid,p_campaign uuid,p_item_id text)
returns table(item_name text,platinum integer,gold integer,silver integer,copper integer)
language plpgsql security definer set search_path=public,extensions as $$
declare
  st jsonb; settings jsonb; item jsonb; shop_cfg jsonb; inv jsonb;
  item_idx integer; char_idx integer; price bigint; total bigint; discount integer;
  wpp integer; wgp integer; wsp integer; wcp integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  select c.state into st from campaigns c where c.id=p_campaign for update;
  settings:=st->'shopSettings';
  if coalesce((settings->>'buyingEnabled')::boolean,false)=false then raise exception 'DM satın almayı henüz açmadı'; end if;

  select e.value,(e.ordinality-1)::integer into item,item_idx
  from jsonb_array_elements(coalesce(st->'market','[]'::jsonb)) with ordinality e(value,ordinality)
  where e.value->>'id'=p_item_id limit 1;
  if item is null then raise exception 'Ürün bulunamadı'; end if;
  shop_cfg:=settings->'shops'->(item->>'shop');
  if coalesce((shop_cfg->>'enabled')::boolean,false)=false then raise exception 'Bu dükkân kapalı'; end if;
  if coalesce((item->>'active')::boolean,true)=false then raise exception 'Ürün satışta değil'; end if;
  if coalesce((item->>'tier')::integer,1)>coalesce((shop_cfg->>'tier')::integer,1) then raise exception 'Ürün bu dükkân tierinde yok'; end if;
  if coalesce((item->>'stock')::integer,0)<=0 then raise exception 'Ürün tükendi'; end if;

  discount:=greatest(0,least(90,coalesce((settings->>'discount')::integer,0)));
  price:=greatest(0,round(coalesce((item->>'priceCopper')::numeric,0)*(100-discount)/100));
  insert into campaign_wallets(campaign_id,user_id) values(p_campaign,p_user) on conflict do nothing;
  select w.platinum,w.gold,w.silver,w.copper into wpp,wgp,wsp,wcp
  from campaign_wallets w where w.campaign_id=p_campaign and w.user_id=p_user for update;
  total:=wpp*1000::bigint+wgp*100::bigint+wsp*10::bigint+wcp;
  if total<price then raise exception 'Yeterli paran yok'; end if;
  total:=total-price;
  wpp:=total/1000; total:=total%1000; wgp:=total/100; total:=total%100; wsp:=total/10; wcp:=total%10;

  select (e.ordinality-1)::integer into char_idx
  from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality)
  where e.value->>'userId'=p_user::text limit 1;
  if char_idx is null then raise exception 'DM hesabına bağlı karakter oluşturmalı'; end if;
  inv:=coalesce(st#>array['characters',char_idx::text,'inventory'],'[]'::jsonb);
  inv:=inv||jsonb_build_array(
    (item-'id'-'stock'-'active'-'shop'-'priceCopper'-'tier'-'ready'-'custom')
    ||jsonb_build_object('id',gen_random_uuid()::text,'sourceItemId',item->>'id','qty',1,'equipped',false,'purchased',true)
  );
  st:=jsonb_set(st,array['characters',char_idx::text,'inventory'],inv,true);
  st:=jsonb_set(st,array['market',item_idx::text,'stock'],to_jsonb((item->>'stock')::integer-1),true);

  update campaign_wallets set platinum=wpp,gold=wgp,silver=wsp,copper=wcp,updated_at=now() where campaign_id=p_campaign and user_id=p_user;
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return query select item->>'name',wpp,wgp,wsp,wcp;
end $$;

revoke all on function public.wallet_list(uuid,uuid),public.guild_wallet_get(uuid,uuid),public.wallet_adjust(uuid,uuid,uuid,text,integer),public.guild_wallet_adjust(uuid,uuid,text,integer),public.wallet_transfer(uuid,uuid,uuid,text,integer),public.shop_buy(uuid,uuid,text) from public;
grant execute on function public.wallet_list(uuid,uuid),public.guild_wallet_get(uuid,uuid),public.wallet_adjust(uuid,uuid,uuid,text,integer),public.guild_wallet_adjust(uuid,uuid,text,integer),public.wallet_transfer(uuid,uuid,uuid,text,integer),public.shop_buy(uuid,uuid,text) to anon,authenticated;
