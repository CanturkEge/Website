-- ESKİ task-panel SQL'ini daha önce çalıştırdıysan yalnızca bu dosyayı çalıştır.
alter type public.app_role add value if not exists 'manager';
alter type public.app_role add value if not exists 'reception';
alter type public.app_role add value if not exists 'procurement';
alter type public.app_role add value if not exists 'kitchen';
alter type public.app_role add value if not exists 'housekeeping';
alter type public.app_role add value if not exists 'maintenance';

create or replace function public.can_manage()
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.profiles
    where id=(select auth.uid()) and role::text in ('admin','manager')
  );
$$;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "tasks_select" on public.tasks;
drop policy if exists "tasks_insert" on public.tasks;
drop policy if exists "tasks_update" on public.tasks;
drop policy if exists "tasks_delete" on public.tasks;

create policy "profiles_select" on public.profiles for select to authenticated
using(id=(select auth.uid()) or (select public.can_manage()));
create policy "tasks_select" on public.tasks for select to authenticated
using(assignee_id=(select auth.uid()) or (select public.can_manage()));
create policy "tasks_insert" on public.tasks for insert to authenticated
with check(created_by=(select auth.uid()) and (assignee_id=(select auth.uid()) or (select public.can_manage())));
create policy "tasks_update" on public.tasks for update to authenticated
using(assignee_id=(select auth.uid()) or (select public.can_manage()))
with check(assignee_id=(select auth.uid()) or (select public.can_manage()));
create policy "tasks_delete" on public.tasks for delete to authenticated
using((select public.can_manage()));

-- Mevcut admin hesabını korumak için e-postayı değiştirip bir kez çalıştırabilirsin:
-- update public.profiles set role='admin' where email='senin@mailin.com';
-- update auth.users set raw_app_meta_data=raw_app_meta_data||'{"app_role":"admin"}'::jsonb where email='senin@mailin.com';
