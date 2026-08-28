-- Kadim Masa Defteri v56
-- Veri silmeden v53 karakter doğrulamasını düzeltir ve DM'e atomik karakter silme RPC'si ekler.

do $$
declare
  v53_definition text;
begin
  select pg_get_functiondef(p.oid) into v53_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='character_create_player_v53'
  limit 1;

  if v53_definition is null then
    raise exception 'character_create_player_v53 bulunamadı; önce v53-update.sql çalıştırılmalı';
  end if;

  if position('jsonb_object_length(p_base_stats)' in v53_definition)>0 then
    v53_definition:=replace(
      v53_definition,
      'jsonb_object_length(p_base_stats)',
      '(select count(*) from jsonb_object_keys(p_base_stats))'
    );
    execute v53_definition;
  end if;
end
$$;

create or replace function public.character_delete_dm_v56(
  p_user uuid,
  p_campaign uuid,
  p_character text
)
returns boolean
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  st jsonb;
  next_characters jsonb;
  next_encounter jsonb;
begin
  if not exists(
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_user and role='dm'
  ) then
    raise exception 'Yalnızca kampanyanın DM’i karakter silebilir';
  end if;

  select state into st from campaigns where id=p_campaign for update;
  if st is null then raise exception 'Kampanya bulunamadı'; end if;
  if not exists(
    select 1 from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) entry
    where entry->>'id'=p_character
  ) then
    raise exception 'Karakter bulunamadı';
  end if;

  select coalesce(jsonb_agg(entry),'[]'::jsonb) into next_characters
  from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) entry
  where entry->>'id'<>p_character;

  select coalesce(jsonb_agg(entry),'[]'::jsonb) into next_encounter
  from jsonb_array_elements(coalesce(st->'encounter','[]'::jsonb)) entry
  where coalesce(entry->>'characterId','')<>p_character;

  st:=jsonb_set(st,'{characters}',next_characters,true);
  st:=jsonb_set(st,'{encounter}',next_encounter,true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end
$$;

revoke all on function public.character_delete_dm_v56(uuid,uuid,text) from public;
grant execute on function public.character_delete_dm_v56(uuid,uuid,text) to anon,authenticated;

comment on function public.character_delete_dm_v56(uuid,uuid,text)
is 'v56: DM-only atomic character removal; account and campaign rows are preserved';

-- SQL Editor sonucunda tek satırlık sağlık özeti gösterir.
select jsonb_build_object(
  'accounts',(select count(*) from public.accounts),
  'campaigns',(select count(*) from public.campaigns),
  'invalid_state',(select count(*) from public.campaigns where jsonb_typeof(state)<>'object'),
  'invalid_characters',(select count(*) from public.campaigns where jsonb_typeof(coalesce(state->'characters','[]'::jsonb))<>'array'),
  'v53_jsonb_fix',coalesce((
    select position('jsonb_object_length' in pg_get_functiondef(p.oid))=0
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='character_create_player_v53'
    limit 1
  ),false),
  'character_delete_rpc',to_regprocedure('public.character_delete_dm_v56(uuid,uuid,text)') is not null
) as v56_health;
