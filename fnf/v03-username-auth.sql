-- FNF v0.3.0: invitation validation for username-only accounts.
-- New auth users are created by the fnf-auth Edge Function, never by client SQL.
create or replace function fnf_private.signup_access(p_access text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    exists (
      select 1 from public.fnf_rooms r
      where r.code = upper(btrim(p_access))
    ) or exists (
      select 1 from fnf_private.room_gate g
      where g.singleton = true
        and encode(extensions.digest(p_access || g.salt,'sha256'),'hex') = g.secret_hash
    ), false
  );
$$;

create or replace function public.fnf_signup_access(p_access text)
returns boolean language sql security invoker set search_path = '' as $$
  select fnf_private.signup_access(p_access);
$$;

revoke execute on function fnf_private.signup_access(text) from public,anon,authenticated;
revoke execute on function public.fnf_signup_access(text) from public,anon,authenticated;
grant usage on schema fnf_private to service_role;
grant execute on function fnf_private.signup_access(text) to service_role;
grant execute on function public.fnf_signup_access(text) to service_role;
