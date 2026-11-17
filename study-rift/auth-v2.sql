create table public.study_rift_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
 recovery_enabled boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.study_rift_profiles enable row level security;
revoke all on public.study_rift_profiles from anon, authenticated;
grant select on public.study_rift_profiles to authenticated;
create policy "Own Rift profile" on public.study_rift_profiles for select to authenticated using ((select auth.uid())=user_id);
create table public.study_rift_auth_limits (
 bucket text primary key,
 requests integer not null,
 expires_at timestamptz not null
);
alter table public.study_rift_auth_limits enable row level security;
revoke all on public.study_rift_auth_limits from anon, authenticated;
create function public.study_rift_consume_limit(p_bucket text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.study_rift_auth_limits as t(bucket,requests,expires_at)
 values(p_bucket,1,now()+make_interval(secs=>p_seconds))
 on conflict(bucket) do update set
 requests=case when t.expires_at<now() then 1 else t.requests+1 end,
 expires_at=case when t.expires_at<now() then now()+make_interval(secs=>p_seconds) else t.expires_at end
 returning requests into n;
 delete from public.study_rift_auth_limits where expires_at<now()-interval '1 day';
 return n<=p_limit;
end $$;
revoke execute on function public.study_rift_consume_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.study_rift_consume_limit(text,integer,integer) to service_role;
