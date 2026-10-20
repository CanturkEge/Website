-- Farms & Fields v0.2.0. Apply to the dedicated FNF project after schema.sql.
-- Existing characters and rooms are retained. The old skills JSON is preserved.
alter table public.fnf_characters
  add column if not exists abilities jsonb not null default '{"power":10,"agility":10,"endurance":10,"intellect":10,"insight":10,"presence":10}'::jsonb,
  add column if not exists skill_choices text[] not null default '{}'::text[];

create or replace function fnf_private.create_character_v2(
  p_room_id uuid, p_name text, p_species text, p_class_id text,
  p_specialty text, p_abilities jsonb, p_skill_choices text[]
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  new_id uuid;
  total integer;
  allowed_skills text[];
  species_skill text;
  specialty_skill text;
begin
  if actor is null or not exists (
    select 1 from public.fnf_room_members m
    where m.room_id = p_room_id and m.user_id = actor and m.role = 'player'
  ) then
    return jsonb_build_object('error','Yalnızca bu odanın oyuncuları karakter oluşturabilir.');
  end if;
  if exists (select 1 from public.fnf_characters c where c.room_id=p_room_id and c.user_id=actor) then
    return jsonb_build_object('error','Bu odada zaten karakterin var.');
  end if;
  if char_length(btrim(coalesce(p_name,''))) not between 2 and 32 then
    return jsonb_build_object('error','Karakter adı 2–32 karakter olmalı.');
  end if;

  species_skill := case p_species
    when 'human' then 'diplomacy' when 'elf' then 'botany'
    when 'dwarf' then 'craft' when 'orc' then 'defense'
    when 'dragonborn' then 'exploration' when 'halfling' then 'husbandry'
    else null end;
  if species_skill is null then return jsonb_build_object('error','Geçerli bir tür seç.'); end if;

  allowed_skills := case p_class_id
    when 'nature' then array['botany','husbandry','craft','research','exploration']
    when 'villager' then array['botany','husbandry','craft','diplomacy','exploration']
    when 'physical' then array['defense','exploration','craft','husbandry','diplomacy']
    when 'engineering' then array['engineering','research','craft','botany','defense']
    else null end;
  specialty_skill := case
    when p_class_id='nature' then case p_specialty
      when 'healer' then 'botany' when 'alchemist' then 'research' when 'artisan' then 'craft' end
    when p_class_id='villager' then case p_specialty
      when 'herder' then 'husbandry' when 'farmer' then 'botany' when 'gardener' then 'botany' end
    when p_class_id='physical' then case p_specialty
      when 'warrior' then 'defense' when 'miner' then 'craft' when 'explorer' then 'exploration' end
    when p_class_id='engineering' then case p_specialty
      when 'builder' then 'engineering' when 'chemist' then 'research' when 'researcher' then 'research' end
    else null end;
  if allowed_skills is null or specialty_skill is null then
    return jsonb_build_object('error','Uzmanlık ve ana yol eşleşmiyor.');
  end if;

  if jsonb_typeof(p_abilities) is distinct from 'object' or
     (select count(*) from jsonb_object_keys(p_abilities)) <> 6 or
     exists (
       select 1 from jsonb_each(p_abilities) a
       where a.key not in ('power','agility','endurance','intellect','insight','presence')
          or jsonb_typeof(a.value) <> 'number'
          or a.value::text !~ '^(10|11|12|13|14)$'
     ) then
    return jsonb_build_object('error','Nitelik dağılımı geçersiz.');
  end if;
  select sum(a.value::text::integer) into total from jsonb_each(p_abilities) a;
  if total <> 68 then return jsonb_build_object('error','Sekiz nitelik puanı dağıt.'); end if;

  if p_skill_choices is null or cardinality(p_skill_choices) <> 2 or
     exists (
       select 1 from unnest(p_skill_choices) chosen
       where chosen is null or chosen <> all(allowed_skills)
          or chosen = species_skill or chosen = specialty_skill
     ) or p_skill_choices[1] = p_skill_choices[2] then
    return jsonb_build_object('error','Ana yolundan iki ayrı beceri seç.');
  end if;

  insert into public.fnf_characters(room_id,user_id,name,species,class_id,specialty,skills,abilities,skill_choices)
  values (p_room_id,actor,btrim(p_name),p_species,p_class_id,p_specialty,'{}'::jsonb,p_abilities,p_skill_choices)
  returning id into new_id;
  return jsonb_build_object('id',new_id);
end;
$$;

create or replace function public.fnf_create_character_v2(
  p_room_id uuid, p_name text, p_species text, p_class_id text,
  p_specialty text, p_abilities jsonb, p_skill_choices text[]
) returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.create_character_v2(p_room_id,p_name,p_species,p_class_id,p_specialty,p_abilities,p_skill_choices);
$$;

revoke execute on function fnf_private.create_character_v2(uuid,text,text,text,text,jsonb,text[]) from public,anon;
revoke execute on function public.fnf_create_character_v2(uuid,text,text,text,text,jsonb,text[]) from public,anon;
revoke execute on function fnf_private.create_character(uuid,text,text,text,text,jsonb) from authenticated;
revoke execute on function public.fnf_create_character(uuid,text,text,text,text,jsonb) from authenticated;
grant execute on function fnf_private.create_character_v2(uuid,text,text,text,text,jsonb,text[]) to authenticated;
grant execute on function public.fnf_create_character_v2(uuid,text,text,text,text,jsonb,text[]) to authenticated;
