-- v54: LiveKit ses odaları için kısa ömürlü, sunucuda doğrulanan hesap oturumları.
-- Mevcut hesapları, kampanyaları ve oyun state'ini değiştirmez.

create table if not exists public.account_sessions_v54 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.accounts(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists account_sessions_v54_user_expires_idx
  on public.account_sessions_v54(user_id, expires_at desc);

alter table public.account_sessions_v54 enable row level security;
revoke all on table public.account_sessions_v54 from public, anon, authenticated;

create or replace function public.account_register_v54(
  p_username text,
  p_password text,
  p_display text
) returns table(user_id uuid, display_name text, session_token text)
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  new_user_id uuid;
  raw_token text;
begin
  if length(trim(p_username)) < 3 or length(p_password) < 3 then
    raise exception 'Kullanıcı adı ve şifre en az 3 karakter olmalı';
  end if;

  insert into accounts(username, display_name, password_hash)
  values(
    lower(trim(p_username)),
    coalesce(nullif(trim(p_display), ''), trim(p_username)),
    crypt(p_password, gen_salt('bf'))
  ) returning id into new_user_id;

  raw_token := encode(gen_random_bytes(32), 'hex');
  insert into account_sessions_v54(user_id, token_hash)
  values(new_user_id, encode(digest(raw_token, 'sha256'), 'hex'));

  return query
  select new_user_id, a.display_name, raw_token
  from accounts a where a.id = new_user_id;
exception
  when unique_violation then raise exception 'Bu kullanıcı adı alınmış';
end
$$;

create or replace function public.account_login_v54(
  p_username text,
  p_password text
) returns table(user_id uuid, display_name text, session_token text)
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  matched_user_id uuid;
  matched_display_name text;
  raw_token text;
begin
  select a.id, a.display_name
  into matched_user_id, matched_display_name
  from accounts a
  where a.username = lower(trim(p_username))
    and a.password_hash = crypt(p_password, a.password_hash);

  if matched_user_id is null then return; end if;

  delete from account_sessions_v54 where expires_at <= now();
  raw_token := encode(gen_random_bytes(32), 'hex');
  insert into account_sessions_v54(user_id, token_hash)
  values(matched_user_id, encode(digest(raw_token, 'sha256'), 'hex'));

  return query select matched_user_id, matched_display_name, raw_token;
end
$$;

create or replace function public.account_session_logout_v54(p_session_token text)
returns boolean
language plpgsql
security definer
set search_path=public,extensions
as $$
begin
  delete from account_sessions_v54
  where token_hash = encode(digest(coalesce(p_session_token, ''), 'sha256'), 'hex');
  return found;
end
$$;

revoke all on function public.account_register_v54(text,text,text),
  public.account_login_v54(text,text),
  public.account_session_logout_v54(text) from public;

grant execute on function public.account_register_v54(text,text,text),
  public.account_login_v54(text,text),
  public.account_session_logout_v54(text) to anon, authenticated;

drop function if exists public.voice_session_validate_v54(text,uuid);

comment on table public.account_sessions_v54
is 'v54: hashed app sessions used by trusted server functions; raw tokens are never stored';
