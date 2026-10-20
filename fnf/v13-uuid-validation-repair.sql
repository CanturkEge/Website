-- Repair the five-group UUID validation in the current village action and
-- each restore layer. Guard the exact number of replacements so a changed
-- function definition fails the migration instead of silently changing code.
do $fnf_uuid_repair$
declare
  routine regprocedure;
  expected_count integer;
  actual_count integer;
  definition text;
  broken_pattern constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  valid_pattern constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
begin
  for routine, expected_count in
    select name::regprocedure, count_expected from (values
      ('fnf_private.village_ops_action(uuid,text,jsonb)',1),
      ('fnf_private.restore_room_v08(jsonb,text)',1),
      ('fnf_private.restore_room_v09(jsonb,text)',1),
      ('fnf_private.restore_room(jsonb,text)',2)
    ) as fixes(name,count_expected)
  loop
    definition := pg_get_functiondef(routine);
    actual_count := (length(definition)-length(replace(definition,broken_pattern,'')))
      /length(broken_pattern);
    if actual_count <> expected_count then
      raise exception 'Unexpected UUID check count in %: expected %, got %',
        routine,expected_count,actual_count;
    end if;
    execute replace(definition,broken_pattern,valid_pattern);
  end loop;
end;
$fnf_uuid_repair$;
