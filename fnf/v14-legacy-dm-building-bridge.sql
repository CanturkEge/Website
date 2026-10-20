-- Keep the DM's existing room-wide support buildings available while the
-- new village construction system handles its own houses and workshops.
-- The private simulation action still checks DM membership and material costs.
create or replace function public.fnf_sim_action(p_room_id uuid,p_action text,
  p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql set search_path = '' as $$
begin
  if p_action in ('field','recruit') then
    return jsonb_build_object('error','Bu işlem artık köy defterinden yapılır.');
  end if;
  return fnf_private.sim_action(p_room_id,p_action,p_payload);
end;
$$;
