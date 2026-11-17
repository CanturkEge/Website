-- Study Rift v0.1.0: isolated table; no changes to other applications.
create table public.study_rift_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 1000000),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.study_rift_saves enable row level security;
revoke all on public.study_rift_saves from anon;
grant select, insert, update on public.study_rift_saves to authenticated;
create policy "Read own hunter" on public.study_rift_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own hunter" on public.study_rift_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own hunter" on public.study_rift_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
comment on table public.study_rift_saves is 'Private, versioned single-player Study Rift progress. Client-owned state; no competitive leaderboard.';
