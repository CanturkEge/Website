-- v73: Campaign achievements / memory archive.
-- Existing accounts, campaigns, characters and campaign state are preserved.

create table if not exists public.campaign_achievements_v73(
  id uuid primary key default gen_random_uuid(),
  award_group_id uuid not null default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  player_user_id uuid not null references public.accounts(id) on delete cascade,
  granted_by_user_id uuid references public.accounts(id) on delete set null,
  title text not null check(char_length(btrim(title)) between 1 and 80),
  description text not null check(char_length(btrim(description)) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.campaign_achievements_v73 enable row level security;

create index if not exists campaign_achievements_v73_campaign_created_idx
  on public.campaign_achievements_v73(campaign_id,created_at desc,id);
create index if not exists campaign_achievements_v73_player_created_idx
  on public.campaign_achievements_v73(campaign_id,player_user_id,created_at desc,id);
create index if not exists campaign_achievements_v73_player_fk_idx
  on public.campaign_achievements_v73(player_user_id);
create index if not exists campaign_achievements_v73_granter_fk_idx
  on public.campaign_achievements_v73(granted_by_user_id);

create or replace function public.achievement_list_v73(p_session_token text,p_campaign uuid)
returns table(
  id uuid,
  award_group_id uuid,
  player_user_id uuid,
  player_name text,
  granted_by_user_id uuid,
  granted_by_name text,
  title text,
  description text,
  created_at timestamptz
)
language plpgsql security definer set search_path=public as $$
declare uid uuid; member_role text;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;

  select cm.role into member_role
  from public.campaign_members cm
  where cm.campaign_id=p_campaign and cm.user_id=uid;
  if member_role is null then raise exception 'Kampanya üyesi değilsin'; end if;

  return query
  select a.id,a.award_group_id,a.player_user_id,player.display_name,
         a.granted_by_user_id,granter.display_name,a.title,a.description,a.created_at
  from public.campaign_achievements_v73 a
  join public.accounts player on player.id=a.player_user_id
  left join public.accounts granter on granter.id=a.granted_by_user_id
  where a.campaign_id=p_campaign
    and (member_role='dm' or a.player_user_id=uid)
  order by a.created_at desc,a.id
  limit 500;
end $$;

create or replace function public.achievement_grant_v73(
  p_session_token text,
  p_campaign uuid,
  p_title text,
  p_description text,
  p_player_ids uuid[]
)
returns integer
language plpgsql security definer set search_path=public as $$
declare uid uuid; target_ids uuid[]; target_count integer; valid_count integer; group_id uuid:=gen_random_uuid();
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  if not exists(
    select 1 from public.campaign_members cm
    where cm.campaign_id=p_campaign and cm.user_id=uid and cm.role='dm'
  ) then raise exception 'Yalnızca DM başarım verebilir'; end if;
  if char_length(btrim(coalesce(p_title,''))) not between 1 and 80 then
    raise exception 'Başarım adı 1-80 karakter olmalı';
  end if;
  if char_length(btrim(coalesce(p_description,''))) not between 1 and 1000 then
    raise exception 'Açıklama 1-1000 karakter olmalı';
  end if;

  select coalesce(array_agg(distinct target_id),'{}'::uuid[])
  into target_ids
  from unnest(coalesce(p_player_ids,'{}'::uuid[])) as targets(target_id)
  where target_id is not null;
  target_count:=coalesce(cardinality(target_ids),0);
  if target_count not between 1 and 50 then raise exception '1-50 oyuncu seçmelisin'; end if;

  select count(*)::integer into valid_count
  from public.campaign_members cm
  where cm.campaign_id=p_campaign and cm.role='player' and cm.user_id=any(target_ids);
  if valid_count<>target_count then raise exception 'Seçilen hesaplardan biri bu kampanyada oyuncu değil'; end if;

  insert into public.campaign_achievements_v73(
    award_group_id,campaign_id,player_user_id,granted_by_user_id,title,description
  )
  select group_id,p_campaign,target_id,uid,btrim(p_title),btrim(p_description)
  from unnest(target_ids) as targets(target_id);
  return target_count;
end $$;

create or replace function public.achievement_revoke_v73(
  p_session_token text,
  p_campaign uuid,
  p_award_group uuid
)
returns integer
language plpgsql security definer set search_path=public as $$
declare uid uuid; removed integer;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;
  if not exists(
    select 1 from public.campaign_members cm
    where cm.campaign_id=p_campaign and cm.user_id=uid and cm.role='dm'
  ) then raise exception 'Yalnızca DM başarımı geri alabilir'; end if;

  delete from public.campaign_achievements_v73 a
  where a.campaign_id=p_campaign and a.award_group_id=p_award_group;
  get diagnostics removed=row_count;
  return removed;
end $$;

revoke all on table public.campaign_achievements_v73 from public,anon,authenticated;
revoke all on function public.achievement_list_v73(text,uuid),public.achievement_grant_v73(text,uuid,text,text,uuid[]),public.achievement_revoke_v73(text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.achievement_list_v73(text,uuid),public.achievement_grant_v73(text,uuid,text,text,uuid[]),public.achievement_revoke_v73(text,uuid,uuid) to anon;
