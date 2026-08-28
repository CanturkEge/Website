-- Salt okunur Kadim Masa Defteri v56 sağlık kontrolü.
-- Hesap, kampanya veya karakter değiştirmez.

with required_functions(name) as (
  values
    ('account_login_v54'),('account_register_v54'),('account_session_logout_v54'),
    ('campaign_list_v2'),('campaign_load_v2'),('campaign_save_v2'),
    ('character_create_player_v53'),('character_delete_dm_v56'),
    ('character_choices_set_v52'),('inventory_move_v32'),('dice_roll_add'),
    ('kadim_admin_valid')
), function_status as (
  select r.name,
    exists(
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=r.name
    ) as present
  from required_functions r
), campaign_health as (
  select count(*)::integer as campaigns,
    count(*) filter(where jsonb_typeof(state)<>'object')::integer as invalid_state,
    count(*) filter(where jsonb_typeof(coalesce(state->'characters','[]'::jsonb))<>'array')::integer as invalid_characters
  from public.campaigns
)
select jsonb_build_object(
  'accounts',(select count(*) from public.accounts),
  'campaign_health',(select to_jsonb(row) from campaign_health row),
  'functions',(select jsonb_object_agg(name,present) from function_status),
  'pgcrypto',exists(select 1 from pg_extension where extname='pgcrypto'),
  'v53_jsonb_fix',coalesce((
    select position('jsonb_object_length' in pg_get_functiondef(p.oid))=0
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='character_create_player_v53'
    limit 1
  ),false)
);
