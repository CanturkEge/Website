create type public.app_role as enum ('admin','employee');
create type public.task_status as enum ('pending','in_progress','completed');
create type public.task_priority as enum ('low','normal','high');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table public.tasks (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  assignee_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  status public.task_status not null default 'pending',
  priority public.task_priority not null default 'normal',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index tasks_status_idx on public.tasks(status);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),coalesce((new.raw_app_meta_data->>'app_role')::public.app_role,'employee'));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin');
$$;
create policy "profiles_select" on public.profiles for select to authenticated
using(id=(select auth.uid()) or (select public.is_admin()));
create policy "tasks_select" on public.tasks for select to authenticated
using(assignee_id=(select auth.uid()) or (select public.is_admin()));
create policy "tasks_insert" on public.tasks for insert to authenticated
with check((select public.is_admin()));
create policy "tasks_update" on public.tasks for update to authenticated
using(assignee_id=(select auth.uid()) or (select public.is_admin()))
with check(assignee_id=(select auth.uid()) or (select public.is_admin()));
create policy "tasks_delete" on public.tasks for delete to authenticated
using((select public.is_admin()));

-- İlk hesabı admin yapmak için e-postayı değiştirip çalıştır:
-- update public.profiles set role='admin' where email='senin@mailin.com';
-- update auth.users set raw_app_meta_data=raw_app_meta_data||'{"app_role":"admin"}'::jsonb where email='senin@mailin.com';
