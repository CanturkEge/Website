-- Kadim Masa Defteri v53
-- Oyuncu karakter oluştururken 2014 Standard Array / 27 Point Buy yöntemini,
-- esnek species ability bonuslarını ve kanonik başlangıç hızını güvenli biçimde kaydeder.
-- Mevcut kampanya/karakter verisini silmez; v31 JSON birleştirme hattını değiştirmez.

create or replace function public.character_create_player_v53(
  p_user uuid,
  p_campaign uuid,
  p_name text,
  p_species text,
  p_subspecies text,
  p_class_name text,
  p_base_stats jsonb,
  p_max_hp integer,
  p_ac integer,
  p_ability_method text,
  p_species_bonuses jsonb,
  p_speed integer
)
returns boolean
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  st jsonb;
  new_character jsonb;
  method_name text:=lower(trim(coalesce(p_ability_method,'recommended')));
  ability_key text;
  ability_value integer;
  ordered_scores integer[];
  point_cost integer:=0;
  bonus_total integer:=0;
  bonus_count integer:=0;
begin
  if not exists(
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_user and role='player'
  ) then
    raise exception 'Bu kampanyada oyuncu değilsin';
  end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Karakter adı en az 2 karakter olmalı'; end if;
  if method_name not in ('recommended','standard','pointbuy') then raise exception 'Ability üretim yöntemi geçersiz'; end if;
  if jsonb_typeof(coalesce(p_base_stats,'null'::jsonb))<>'object'
     or (select count(*) from jsonb_object_keys(p_base_stats))<>6 then
    raise exception 'Altı ability score birlikte gönderilmeli';
  end if;

  foreach ability_key in array array['STR','DEX','CON','INT','WIS','CHA'] loop
    if not (p_base_stats ? ability_key) or (p_base_stats->>ability_key) !~ '^[0-9]+$' then
      raise exception '% ability score geçersiz',ability_key;
    end if;
    ability_value:=(p_base_stats->>ability_key)::integer;
    if ability_value<8 or ability_value>15 then raise exception '% başlangıç skoru 8–15 arasında olmalı',ability_key; end if;
    point_cost:=point_cost+case ability_value when 8 then 0 when 9 then 1 when 10 then 2 when 11 then 3 when 12 then 4 when 13 then 5 when 14 then 7 when 15 then 9 else 99 end;
  end loop;

  if method_name in ('recommended','standard') then
    select array_agg(value::integer order by value::integer) into ordered_scores
    from jsonb_each_text(p_base_stats);
    if ordered_scores<>array[8,10,12,13,14,15] then
      raise exception 'Standard Array tam olarak 15, 14, 13, 12, 10 ve 8 kullanmalı';
    end if;
  elsif point_cost<>27 then
    raise exception 'Point Buy tam 27 puan harcamalı; gönderilen toplam %',point_cost;
  end if;

  if jsonb_typeof(coalesce(p_species_bonuses,'{}'::jsonb))<>'object' then raise exception 'Species ability bonusları geçersiz'; end if;
  if exists(select 1 from jsonb_each_text(coalesce(p_species_bonuses,'{}'::jsonb)) entry where entry.key<>all(array['STR','DEX','CON','INT','WIS','CHA']) or entry.value !~ '^[0-2]$') then
    raise exception 'Species ability bonus anahtarı/değeri geçersiz';
  end if;
  select coalesce(sum(value::integer),0),count(*) into bonus_total,bonus_count from jsonb_each_text(coalesce(p_species_bonuses,'{}'::jsonb));
  if bonus_total>3 or bonus_count>2 then raise exception 'Esnek species bonus bütçesi aşıldı'; end if;
  if trim(coalesce(p_species,''))='Half-Elf' then
    if bonus_total<>2 or bonus_count<>2 or p_species_bonuses ? 'CHA' or exists(select 1 from jsonb_each_text(p_species_bonuses) entry where entry.value::integer<>1) then raise exception 'Half-Elf iki farklı CHA dışı ability’ye +1 vermeli'; end if;
  elsif trim(coalesce(p_species,''))='Human' and trim(coalesce(p_subspecies,''))='Versatile Human' then
    if bonus_total<>2 or bonus_count<>2 or exists(select 1 from jsonb_each_text(p_species_bonuses) entry where entry.value::integer<>1) then raise exception 'Variant Human iki farklı ability’ye +1 vermeli'; end if;
  elsif trim(coalesce(p_species,'')) in ('Plasmoid / Slime','Harengon','Owlin')
     or (trim(coalesce(p_species,''))='Dragonborn' and position(' Gem / ' in trim(coalesce(p_subspecies,'')))>0)
     or (trim(coalesce(p_species,''))='Kobold' and trim(coalesce(p_subspecies,''))='Draconic') then
    if bonus_total<>3 or bonus_count<>2 or not exists(select 1 from jsonb_each_text(p_species_bonuses) entry where entry.value::integer=2) or not exists(select 1 from jsonb_each_text(p_species_bonuses) entry where entry.value::integer=1) then raise exception 'Bu species farklı ability’lere +2 ve +1 vermeli'; end if;
  elsif trim(coalesce(p_species,''))='Warforged' and trim(coalesce(p_subspecies,''))='Envoy' then
    if bonus_total<>2 or bonus_count<>2 or exists(select 1 from jsonb_each_text(p_species_bonuses) entry where entry.value::integer<>1) then raise exception 'Warforged Envoy iki farklı ability’ye +1 vermeli'; end if;
  elsif bonus_total<>0 then
    raise exception 'Seçilen species sabit ability bonusu kullanır';
  end if;

  select state into st from campaigns where id=p_campaign for update;
  if st is null then raise exception 'Kampanya bulunamadı'; end if;
  if exists(select 1 from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) character where character->>'userId'=p_user::text) then
    raise exception 'Bu kampanyada zaten bir karakterin var';
  end if;

  new_character:=jsonb_build_object(
    'id',gen_random_uuid()::text,'userId',p_user::text,'name',left(trim(p_name),60),
    'species',left(trim(coalesce(p_species,'Human')),80),'subspecies',left(trim(coalesce(p_subspecies,'')),100),
    'className',left(trim(coalesce(p_class_name,'Fighter')),80),'subclass','','level',1,
    'approvalStatus','pending','abilityMethod',method_name,
    'speciesAbilityBonuses',coalesce(p_species_bonuses,'{}'::jsonb),'speciesSpeedApplied',true,
    'baseStats',p_base_stats,'stats',p_base_stats,'statOverrides','{}'::jsonb,
    'maxHp',greatest(1,least(coalesce(p_max_hp,10),100)),'hp',greatest(1,least(coalesce(p_max_hp,10),100)),
    'ac',greatest(0,least(coalesce(p_ac,10),30)),'autoVitals',true,'tempHp',0,
    'speed',greatest(20,least(coalesce(p_speed,30),40)),'speedAuto',true,'pp',10,
    'guild','','inventory','[]'::jsonb,'effects','[]'::jsonb,'skills','[]'::jsonb,'preparedSpells','[]'::jsonb,
    'resistances','[]'::jsonb,'weaknesses','[]'::jsonb
  );
  st:=jsonb_set(st,'{characters}',coalesce(st->'characters','[]'::jsonb)||jsonb_build_array(new_character),true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end
$$;

revoke all on function public.character_create_player_v53(uuid,uuid,text,text,text,text,jsonb,integer,integer,text,jsonb,integer) from public;
grant execute on function public.character_create_player_v53(uuid,uuid,text,text,text,text,jsonb,integer,integer,text,jsonb,integer) to anon,authenticated;

comment on function public.character_create_player_v53(uuid,uuid,text,text,text,text,jsonb,integer,integer,text,jsonb,integer)
is 'v53: validated 2014 Standard Array/27 Point Buy character creation with flexible species ASI';
