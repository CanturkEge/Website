-- Kadim Masa Defteri v20: DM kampanya silme ve sunucu yöneticisi paneli.
-- Mevcut kampanya ve karakter kayıtlarını değiştirmez.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.kadim_admin_settings (
  singleton boolean primary key default true check (singleton),
  username text not null,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.kadim_admin_settings enable row level security;

insert into public.kadim_admin_settings(singleton,username,password_hash)
values(true,'admin',extensions.crypt('Admin27!',extensions.gen_salt('bf')))
on conflict(singleton) do update set username=excluded.username,password_hash=excluded.password_hash,updated_at=now();

create or replace function public.kadim_admin_valid(p_username text,p_password text)
returns boolean language sql security definer set search_path=public,extensions as $$
 select exists(
  select 1 from kadim_admin_settings
  where singleton=true and username=lower(trim(p_username))
    and password_hash=crypt(p_password,password_hash)
 )
$$;

create or replace function public.campaign_delete_dm(p_user uuid,p_campaign uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='dm') then
  raise exception 'Bu kampanyayı yalnızca kampanyanın DM’i silebilir';
 end if;
 delete from campaigns where id=p_campaign;
 return found;
end $$;

create or replace function public.kadim_admin_campaign_list(p_username text,p_password text)
returns table(
 id uuid,code text,name text,dm_name text,member_count bigint,character_count integer,
 created_at timestamptz,updated_at timestamptz,age_days integer
) language plpgsql security definer set search_path=public,extensions as $$
begin
 if not kadim_admin_valid(p_username,p_password) then raise exception 'Admin girişi reddedildi'; end if;
 return query
 select c.id,c.code,c.name,coalesce(a.display_name,'Bilinmeyen DM'),
  (select count(*) from campaign_members cm where cm.campaign_id=c.id),
  jsonb_array_length(coalesce(c.state->'characters','[]'::jsonb)),c.created_at,c.updated_at,
  greatest(0,floor(extract(epoch from (now()-c.created_at))/86400)::integer)
 from campaigns c
 left join campaign_members dm on dm.campaign_id=c.id and dm.role='dm'
 left join accounts a on a.id=dm.user_id
 order by c.updated_at desc;
end $$;

create or replace function public.kadim_admin_campaign_delete(p_username text,p_password text,p_campaign uuid)
returns boolean language plpgsql security definer set search_path=public,extensions as $$
begin
 if not kadim_admin_valid(p_username,p_password) then raise exception 'Admin girişi reddedildi'; end if;
 delete from campaigns where id=p_campaign;
 return found;
end $$;

revoke all on function public.kadim_admin_valid(text,text),public.campaign_delete_dm(uuid,uuid),public.kadim_admin_campaign_list(text,text),public.kadim_admin_campaign_delete(text,text,uuid) from public;
grant execute on function public.kadim_admin_valid(text,text),public.campaign_delete_dm(uuid,uuid),public.kadim_admin_campaign_list(text,text),public.kadim_admin_campaign_delete(text,text,uuid) to anon,authenticated;
