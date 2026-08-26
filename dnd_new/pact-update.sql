-- Kadim Masa Defteri v12: gizli oyuncu <-> DM anlaşmaları
-- Mevcut kampanyaları ve kayıtları silmez. Bir kez çalıştırmak yeterlidir.

create table if not exists public.pact_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  player_id uuid not null references public.accounts(id) on delete cascade,
  sender_role text not null check (sender_role in ('dm','player')),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists pact_messages_campaign_player_created_idx
  on public.pact_messages(campaign_id, player_id, created_at);

alter table public.pact_messages enable row level security;

create or replace function public.pact_send(
  p_user uuid,
  p_campaign uuid,
  p_body text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if char_length(trim(coalesce(p_body,''))) not between 1 and 1000 then
    raise exception 'Mesaj 1-1000 karakter olmalı';
  end if;
  if not exists (
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_user and role='player'
  ) then
    raise exception 'Bu kampanyada oyuncu değilsin';
  end if;
  insert into pact_messages(campaign_id,player_id,sender_role,body)
  values(p_campaign,p_user,'player',trim(p_body))
  returning id into new_id;
  return new_id;
end
$$;

create or replace function public.pact_reply(
  p_user uuid,
  p_campaign uuid,
  p_player uuid,
  p_body text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if char_length(trim(coalesce(p_body,''))) not between 1 and 1000 then
    raise exception 'Mesaj 1-1000 karakter olmalı';
  end if;
  if not exists (
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_user and role='dm'
  ) then
    raise exception 'Yalnızca DM cevap verebilir';
  end if;
  if not exists (
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_player and role='player'
  ) then
    raise exception 'Oyuncu bu kampanyada değil';
  end if;
  insert into pact_messages(campaign_id,player_id,sender_role,body)
  values(p_campaign,p_player,'dm',trim(p_body))
  returning id into new_id;
  return new_id;
end
$$;

create or replace function public.pact_list(
  p_user uuid,
  p_campaign uuid
) returns table(
  id uuid,
  player_id uuid,
  player_name text,
  sender_role text,
  body text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  select cm.role into caller_role
  from campaign_members cm
  where cm.campaign_id=p_campaign and cm.user_id=p_user;

  if caller_role is null then
    return;
  end if;

  return query
  select q.id,q.player_id,q.player_name,q.sender_role,q.body,q.created_at
  from (
    select pm.id,pm.player_id,a.display_name as player_name,
           pm.sender_role,pm.body,pm.created_at
    from pact_messages pm
    join accounts a on a.id=pm.player_id
    where pm.campaign_id=p_campaign
      and (caller_role='dm' or pm.player_id=p_user)
    order by pm.created_at desc
    limit 300
  ) q
  order by q.created_at;
end
$$;

revoke all on function public.pact_send(uuid,uuid,text) from public;
revoke all on function public.pact_reply(uuid,uuid,uuid,text) from public;
revoke all on function public.pact_list(uuid,uuid) from public;

grant execute on function public.pact_send(uuid,uuid,text) to anon,authenticated;
grant execute on function public.pact_reply(uuid,uuid,uuid,text) to anon,authenticated;
grant execute on function public.pact_list(uuid,uuid) to anon,authenticated;
