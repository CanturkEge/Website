-- Hosted upgrade, isolated to Study Rift. Existing daily attempts receive ten minutes from upgrade.
alter table public.study_rift_profiles add column display_name text;
update public.study_rift_profiles set display_name=username;
alter table public.study_rift_profiles alter column display_name set not null;
alter table public.study_rift_profiles add constraint study_rift_display_name_length check(char_length(display_name) between 2 and 24);
alter table public.study_rift_attempts add column deadline_at timestamptz default (now()+interval '10 minutes');
update public.study_rift_attempts set deadline_at=null where completed;
-- Deleting membership also blocks stale shared Auth tokens from recreating a game save.
drop policy "Read own hunter" on public.study_rift_saves;
drop policy "Create own hunter" on public.study_rift_saves;
drop policy "Update own hunter" on public.study_rift_saves;
create policy "Read own hunter" on public.study_rift_saves for select to authenticated using ((select auth.uid())=user_id and exists(select 1 from public.study_rift_profiles p where p.user_id=(select auth.uid())));
create policy "Create own hunter" on public.study_rift_saves for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.study_rift_profiles p where p.user_id=(select auth.uid())));
create policy "Update own hunter" on public.study_rift_saves for update to authenticated using ((select auth.uid())=user_id and exists(select 1 from public.study_rift_profiles p where p.user_id=(select auth.uid()))) with check ((select auth.uid())=user_id and exists(select 1 from public.study_rift_profiles p where p.user_id=(select auth.uid())));
create function public.study_rift_delete_profile(p_user_id uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.study_rift_profiles where user_id=p_user_id for update;
 delete from public.study_rift_saves where user_id=p_user_id;
 delete from public.study_rift_profiles where user_id=p_user_id;
end $$;
revoke execute on function public.study_rift_delete_profile(uuid) from public,anon,authenticated;
grant execute on function public.study_rift_delete_profile(uuid) to service_role;
