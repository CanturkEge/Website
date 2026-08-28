-- Kadim Masa Defteri v32 — lonca oyuncu işlem geçmişi.
-- Mevcut kampanya, karakter, eşya ve para kayıtlarını silmez. Tekrar çalıştırılabilir.
-- Bu dosya v31-update.sql ve guild-update.sql kurulduktan sonra çalıştırılmalıdır.

create table if not exists public.guild_activity_v32 (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  actor_id uuid not null references public.accounts(id) on delete cascade,
  actor_name text not null,
  character_name text,
  action text not null check(action in ('money_deposit','money_withdraw','item_deposit','item_withdraw')),
  item_name text,
  quantity integer,
  coin text,
  amount integer,
  created_at timestamptz not null default now()
);

create index if not exists guild_activity_v32_campaign_created_idx
  on public.guild_activity_v32(campaign_id,created_at desc);

alter table public.guild_activity_v32 enable row level security;

create or replace function public.guild_activity_add_v32(
  p_campaign uuid,p_user uuid,p_action text,
  p_item_name text default null,p_quantity integer default null,
  p_coin text default null,p_amount integer default null
) returns void
language plpgsql security definer set search_path=public as $$
declare st jsonb; g jsonb; actor_label text; character_label text;
begin
  if p_action not in ('money_deposit','money_withdraw','item_deposit','item_withdraw') then
    raise exception 'Geçersiz lonca geçmişi işlemi';
  end if;
  if not exists(
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_user and role='player'
  ) then raise exception 'Yalnızca oyuncu işlemleri lonca geçmişine yazılır'; end if;

  select c.state into st from campaigns c where c.id=p_campaign;
  g:=st->'guild';
  if g is null or not(coalesce(g->'members','[]'::jsonb) ? p_user::text) then
    raise exception 'Lonca üyesi değilsin';
  end if;

  select a.display_name into actor_label from accounts a where a.id=p_user;
  select e.value->>'name' into character_label
  from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) e(value)
  where e.value->>'userId'=p_user::text limit 1;

  insert into guild_activity_v32(
    campaign_id,actor_id,actor_name,character_name,action,item_name,quantity,coin,amount
  ) values(
    p_campaign,p_user,coalesce(actor_label,'Bilinmeyen Oyuncu'),character_label,p_action,
    nullif(trim(coalesce(p_item_name,'')),''),p_quantity,nullif(trim(coalesce(p_coin,'')),''),p_amount
  );

  -- Kampanya başına son 500 başarılı oyuncu işlemini tut. UI son 200 kaydı gösterir.
  delete from guild_activity_v32 old
  where old.campaign_id=p_campaign and old.id in (
    select a.id from guild_activity_v32 a
    where a.campaign_id=p_campaign
    order by a.created_at desc,a.id desc
    offset 500
  );
end $$;

create or replace function public.guild_wallet_move_v32(
  p_user uuid,p_campaign uuid,p_coin text,p_amount integer,p_direction text
) returns boolean
language plpgsql security definer set search_path=public as $$
begin
  perform public.guild_wallet_move_v26(p_user,p_campaign,p_coin,p_amount,p_direction);
  perform public.guild_activity_add_v32(
    p_campaign,p_user,
    case when p_direction='deposit' then 'money_deposit' else 'money_withdraw' end,
    null,null,p_coin,p_amount
  );
  return true;
end $$;

create or replace function public.guild_inventory_move_v32(
  p_user uuid,p_campaign uuid,p_direction text,p_item_index integer,
  p_expected_id text,p_expected_name text,p_quantity integer
) returns boolean
language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; source jsonb; server_item_name text;
begin
  select c.state into st from campaigns c where c.id=p_campaign for update;
  select (e.ordinality-1)::integer into ci
  from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality)
  where e.value->>'userId'=p_user::text limit 1;
  if ci is null then raise exception 'Karakterin bulunamadı'; end if;

  if p_direction='deposit' then
    source:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
  else
    source:=coalesce(st->'guildInventory','[]'::jsonb);
  end if;
  if p_item_index<0 or p_item_index>=jsonb_array_length(source) then
    raise exception 'Eşya listesi değişti; ekranı yenile';
  end if;
  server_item_name:=source->p_item_index->>'name';

  perform public.guild_inventory_move_v31(
    p_user,p_campaign,p_direction,p_item_index,p_expected_id,p_expected_name,p_quantity
  );
  perform public.guild_activity_add_v32(
    p_campaign,p_user,
    case when p_direction='deposit' then 'item_deposit' else 'item_withdraw' end,
    server_item_name,p_quantity,null,null
  );
  return true;
end $$;

create or replace function public.inventory_move_v32(
  p_user uuid,p_campaign uuid,p_item_index integer,p_expected_id text,p_expected_name text,
  p_quantity integer,p_destination text,p_target uuid default null
) returns boolean
language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; inv jsonb; server_item_name text;
begin
  if p_destination='guild' then
    select c.state into st from campaigns c where c.id=p_campaign for update;
    select (e.ordinality-1)::integer into ci
    from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality)
    where e.value->>'userId'=p_user::text limit 1;
    if ci is null then raise exception 'Karakterin bulunamadı'; end if;
    inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
    if p_item_index<0 or p_item_index>=jsonb_array_length(inv) then
      raise exception 'Eşya listesi değişti; ekranı yenile';
    end if;
    server_item_name:=inv->p_item_index->>'name';
  end if;

  perform public.inventory_move_v31(
    p_user,p_campaign,p_item_index,p_expected_id,p_expected_name,
    p_quantity,p_destination,p_target
  );

  if p_destination='guild' then
    perform public.guild_activity_add_v32(
      p_campaign,p_user,'item_deposit',server_item_name,p_quantity,null,null
    );
  end if;
  return true;
end $$;

create or replace function public.guild_activity_list_v32(p_user uuid,p_campaign uuid)
returns table(
  id uuid,actor_name text,character_name text,action text,item_name text,
  quantity integer,coin text,amount integer,created_at timestamptz
)
language plpgsql security definer set search_path=public as $$
declare caller_role text; st jsonb; g jsonb;
begin
  select cm.role into caller_role from campaign_members cm
  where cm.campaign_id=p_campaign and cm.user_id=p_user;
  if caller_role is null then return; end if;
  if caller_role='player' then
    select c.state into st from campaigns c where c.id=p_campaign;
    g:=st->'guild';
    if g is null or not(coalesce(g->'members','[]'::jsonb) ? p_user::text) then return; end if;
  end if;

  return query
  select a.id,a.actor_name,a.character_name,a.action,a.item_name,
         a.quantity,a.coin,a.amount,a.created_at
  from guild_activity_v32 a
  where a.campaign_id=p_campaign
  order by a.created_at desc,a.id desc
  limit 200;
end $$;

revoke all on table public.guild_activity_v32 from public,anon,authenticated;
revoke all on function public.guild_activity_add_v32(uuid,uuid,text,text,integer,text,integer) from public;
revoke all on function public.guild_wallet_move_v32(uuid,uuid,text,integer,text),
  public.guild_inventory_move_v32(uuid,uuid,text,integer,text,text,integer),
  public.inventory_move_v32(uuid,uuid,integer,text,text,integer,text,uuid),
  public.guild_activity_list_v32(uuid,uuid) from public;

grant execute on function public.guild_wallet_move_v32(uuid,uuid,text,integer,text),
  public.guild_inventory_move_v32(uuid,uuid,text,integer,text,text,integer),
  public.inventory_move_v32(uuid,uuid,integer,text,text,integer,text,uuid),
  public.guild_activity_list_v32(uuid,uuid) to anon,authenticated;
