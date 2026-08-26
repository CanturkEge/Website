-- Kadim Masa Defteri v31 — performans ve veri güvenilirliği yaması.
-- Mevcut hesap, kampanya, karakter, eşya ve para kayıtlarını silmez.
-- Tekrar çalıştırılabilir.

create or replace function public.jsonb_merge_v31(p_base jsonb,p_local jsonb,p_remote jsonb)
returns jsonb language plpgsql immutable set search_path=public as $$
declare
  result jsonb; k text; elem jsonb; base_elem jsonb; remote_elem jsonb; merged jsonb;
  base_has boolean; local_has boolean; remote_has boolean; local_same boolean; remote_same boolean;
  stable boolean; item_key text; base_found boolean; remote_found boolean;
begin
  if p_local is not distinct from p_base then return p_remote; end if;
  if p_remote is not distinct from p_base then return p_local; end if;
  if p_local is not distinct from p_remote then return p_local; end if;

  if jsonb_typeof(p_base)='object' and jsonb_typeof(p_local)='object' and jsonb_typeof(p_remote)='object' then
    result:='{}'::jsonb;
    for k in
      select key from (
        select jsonb_object_keys(p_base) key
        union select jsonb_object_keys(p_local)
        union select jsonb_object_keys(p_remote)
      ) keys
    loop
      base_has:=p_base ? k; local_has:=p_local ? k; remote_has:=p_remote ? k;
      local_same:=(local_has=base_has) and (not local_has or (p_local->k) is not distinct from (p_base->k));
      remote_same:=(remote_has=base_has) and (not remote_has or (p_remote->k) is not distinct from (p_base->k));
      if local_same then
        if remote_has then result:=result||jsonb_build_object(k,p_remote->k); end if;
      elsif remote_same then
        if local_has then result:=result||jsonb_build_object(k,p_local->k); end if;
      elsif local_has and remote_has then
        merged:=public.jsonb_merge_v31(case when base_has then p_base->k else null end,p_local->k,p_remote->k);
        result:=result||jsonb_build_object(k,merged);
      elsif local_has then
        result:=result||jsonb_build_object(k,p_local->k);
      end if;
    end loop;
    return result;
  end if;

  if jsonb_typeof(p_base)='array' and jsonb_typeof(p_local)='array' and jsonb_typeof(p_remote)='array' then
    select coalesce(bool_and(jsonb_typeof(value)='object' and coalesce(value->>'id',value->>'groundId','')<>''),true)
      into stable from jsonb_array_elements(p_base);
    if stable then
      select coalesce(bool_and(jsonb_typeof(value)='object' and coalesce(value->>'id',value->>'groundId','')<>''),true)
        into stable from jsonb_array_elements(p_local);
    end if;
    if stable then
      select coalesce(bool_and(jsonb_typeof(value)='object' and coalesce(value->>'id',value->>'groundId','')<>''),true)
        into stable from jsonb_array_elements(p_remote);
    end if;
    if stable then
      result:='[]'::jsonb;
      for elem in select value from jsonb_array_elements(p_local) loop
        item_key:=coalesce(elem->>'id',elem->>'groundId');
        base_elem:=null; remote_elem:=null; base_found:=false; remote_found:=false;
        select e.value,true into base_elem,base_found from jsonb_array_elements(p_base) e(value)
          where coalesce(e.value->>'id',e.value->>'groundId')=item_key limit 1;
        select e.value,true into remote_elem,remote_found from jsonb_array_elements(p_remote) e(value)
          where coalesce(e.value->>'id',e.value->>'groundId')=item_key limit 1;
        if base_found and not remote_found then
          if elem is distinct from base_elem then result:=result||jsonb_build_array(elem); end if;
        elsif remote_found then
          result:=result||jsonb_build_array(public.jsonb_merge_v31(case when base_found then base_elem else null end,elem,remote_elem));
        else
          result:=result||jsonb_build_array(elem);
        end if;
      end loop;
      for elem in select value from jsonb_array_elements(p_remote) loop
        item_key:=coalesce(elem->>'id',elem->>'groundId');
        local_has:=exists(select 1 from jsonb_array_elements(p_local) e(value) where coalesce(e.value->>'id',e.value->>'groundId')=item_key);
        base_has:=exists(select 1 from jsonb_array_elements(p_base) e(value) where coalesce(e.value->>'id',e.value->>'groundId')=item_key);
        if not local_has and not base_has then result:=result||jsonb_build_array(elem); end if;
      end loop;
      return result;
    end if;
  end if;
  return p_local;
end $$;

create or replace function public.campaign_save_v31(p_user uuid,p_campaign uuid,p_base jsonb,p_state jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare remote_state jsonb; merged_state jsonb;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='dm') then
    raise exception 'Yalnızca kampanya DM’i kaydedebilir';
  end if;
  select state into remote_state from campaigns where id=p_campaign for update;
  if remote_state is null then raise exception 'Kampanya bulunamadı'; end if;
  merged_state:=public.jsonb_merge_v31(coalesce(p_base,'{}'::jsonb),coalesce(p_state,'{}'::jsonb),remote_state);
  update campaigns set state=merged_state,updated_at=now() where id=p_campaign;
  return merged_state;
end $$;

create or replace function public.inventory_move_v31(
  p_user uuid,p_campaign uuid,p_item_index integer,p_expected_id text,p_expected_name text,
  p_quantity integer,p_destination text,p_target uuid default null
) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare st jsonb; source_idx integer; target_idx integer; inv jsonb; target_inv jsonb; item jsonb; moved jsonb;
  available integer; remaining integer; server_id text;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if p_item_index<0 or p_quantity<1 or p_destination not in ('ground','guild','player') then raise exception 'Geçersiz eşya, miktar veya hedef'; end if;
  select state into st from campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into source_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if source_idx is null then raise exception 'Karakterin bulunamadı'; end if;
  inv:=coalesce(st#>array['characters',source_idx::text,'inventory'],'[]'::jsonb);
  if p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya listesi değişti; ekranı yenileyip tekrar dene'; end if;
  item:=inv->p_item_index; server_id:=coalesce(item->>'id','');
  if coalesce(p_expected_name,'')<>'' and coalesce(item->>'name','')<>p_expected_name then raise exception 'Eşya listesi değişti; yanlış eşya taşınmadı'; end if;
  if coalesce(p_expected_id,'')<>'' and server_id<>'' and server_id<>p_expected_id then raise exception 'Eşya ID değişti; ekranı yenileyip tekrar dene'; end if;
  if server_id='' then item:=item||jsonb_build_object('id',coalesce(nullif(p_expected_id,''),gen_random_uuid()::text)); inv:=jsonb_set(inv,array[p_item_index::text],item,true); end if;
  available:=greatest(1,coalesce((item->>'qty')::integer,1));
  if p_quantity>available then raise exception 'Bu kadar eşyan yok'; end if;
  remaining:=available-p_quantity;
  moved:=jsonb_set(item,'{qty}',to_jsonb(p_quantity),true)||jsonb_build_object('equipped',false);
  if remaining>0 then moved:=moved||jsonb_build_object('id',gen_random_uuid()::text); end if;
  if remaining=0 then inv:=inv-p_item_index; else inv:=jsonb_set(inv,array[p_item_index::text,'qty'],to_jsonb(remaining),true); end if;
  st:=jsonb_set(st,array['characters',source_idx::text,'inventory'],inv,true);
  if p_destination='guild' then
    if st->'guild' is null or not(coalesce(st->'guild'->'members','[]'::jsonb) ? p_user::text) then raise exception 'Lonca üyesi değilsin'; end if;
    target_inv:=coalesce(st->'guildInventory','[]'::jsonb)||jsonb_build_array(moved);
    st:=jsonb_set(st,'{guildInventory}',target_inv,true);
  elsif p_destination='ground' then
    moved:=moved||jsonb_build_object('groundId',gen_random_uuid()::text,'droppedBy',p_user::text,'droppedAt',now());
    target_inv:=coalesce(st->'groundLoot','[]'::jsonb)||jsonb_build_array(moved);
    st:=jsonb_set(st,'{groundLoot}',target_inv,true);
  else
    if p_target is null or p_target=p_user then raise exception 'Geçerli başka bir oyuncu seç'; end if;
    if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_target and role='player') then raise exception 'Alıcı bu kampanyada değil'; end if;
    select (e.ordinality-1)::integer into target_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_target::text limit 1;
    if target_idx is null then raise exception 'Alıcının karakteri yok'; end if;
    target_inv:=coalesce(st#>array['characters',target_idx::text,'inventory'],'[]'::jsonb)||jsonb_build_array(moved);
    st:=jsonb_set(st,array['characters',target_idx::text,'inventory'],target_inv,true);
  end if;
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

create or replace function public.inventory_take_ground_v31(
  p_user uuid,p_campaign uuid,p_ground_index integer,p_expected_id text,p_expected_name text,p_quantity integer
) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare st jsonb; char_idx integer; ground jsonb; inv jsonb; item jsonb; moved jsonb; available integer; remaining integer; server_id text;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if p_ground_index<0 or p_quantity<1 then raise exception 'Geçersiz eşya veya miktar'; end if;
  select state into st from campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into char_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if char_idx is null then raise exception 'Karakterin bulunamadı'; end if;
  ground:=coalesce(st->'groundLoot','[]'::jsonb);
  if p_ground_index>=jsonb_array_length(ground) then raise exception 'Eşya artık yerde değil'; end if;
  item:=ground->p_ground_index; server_id:=coalesce(item->>'groundId',item->>'id','');
  if coalesce(p_expected_name,'')<>'' and coalesce(item->>'name','')<>p_expected_name then raise exception 'Yer listesi değişti; yanlış eşya alınmadı'; end if;
  if coalesce(p_expected_id,'')<>'' and server_id<>'' and server_id<>p_expected_id then raise exception 'Eşya ID değişti; ekranı yenileyip tekrar dene'; end if;
  if coalesce(item->>'id','')='' then item:=item||jsonb_build_object('id',gen_random_uuid()::text); end if;
  if coalesce(item->>'groundId','')='' then item:=item||jsonb_build_object('groundId',coalesce(nullif(p_expected_id,''),gen_random_uuid()::text)); end if;
  ground:=jsonb_set(ground,array[p_ground_index::text],item,true);
  available:=greatest(1,coalesce((item->>'qty')::integer,1));
  if p_quantity>available then raise exception 'Yerde bu kadar eşya yok'; end if;
  remaining:=available-p_quantity;
  moved:=(item-'groundId'-'droppedBy'-'droppedAt')||jsonb_build_object('qty',p_quantity,'equipped',false);
  if remaining>0 then moved:=moved||jsonb_build_object('id',gen_random_uuid()::text); end if;
  if remaining=0 then ground:=ground-p_ground_index; else ground:=jsonb_set(ground,array[p_ground_index::text,'qty'],to_jsonb(remaining),true); end if;
  inv:=coalesce(st#>array['characters',char_idx::text,'inventory'],'[]'::jsonb)||jsonb_build_array(moved);
  st:=jsonb_set(st,'{groundLoot}',ground,true);
  st:=jsonb_set(st,array['characters',char_idx::text,'inventory'],inv,true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

create or replace function public.inventory_equip_v31(
  p_user uuid,p_campaign uuid,p_item_index integer,p_expected_id text,p_expected_name text
) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare st jsonb; ci integer; inv jsonb; item jsonb; meta jsonb; slot text; next_value boolean; i integer; server_id text; source_id text;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  select state into st from campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if ci is null then raise exception 'Karakterin bulunamadı'; end if;
  inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
  if p_item_index<0 or p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya listesi değişti; ekranı yenile'; end if;
  item:=inv->p_item_index; server_id:=coalesce(item->>'id','');
  if coalesce(p_expected_name,'')<>'' and coalesce(item->>'name','')<>p_expected_name then raise exception 'Eşya listesi değişti; yanlış eşya kuşanılmadı'; end if;
  if coalesce(p_expected_id,'')<>'' and server_id<>'' and server_id<>p_expected_id then raise exception 'Eşya ID değişti; ekranı yenile'; end if;
  if server_id='' then item:=item||jsonb_build_object('id',coalesce(nullif(p_expected_id,''),gen_random_uuid()::text)); end if;
  source_id:=coalesce(item->>'sourceItemId',item->>'id');
  meta:=case source_id
    when 'ex-leather' then jsonb_build_object('slot','armor','armorType','light','armorBase',11)
    when 'ex-studded' then jsonb_build_object('slot','armor','armorType','light','armorBase',12)
    when 'ex-padded' then jsonb_build_object('slot','armor','armorType','light','armorBase',11,'stealthDisadvantage',true)
    when 'ex-hide' then jsonb_build_object('slot','armor','armorType','medium','armorBase',12)
    when 'ex-chain-shirt' then jsonb_build_object('slot','armor','armorType','medium','armorBase',13)
    when 'ex-mithral-shirt' then jsonb_build_object('slot','armor','armorType','medium','armorBase',13)
    when 'ex-scale-mail' then jsonb_build_object('slot','armor','armorType','medium','armorBase',14,'stealthDisadvantage',true)
    when 'ex-breastplate' then jsonb_build_object('slot','armor','armorType','medium','armorBase',14)
    when 'ex-chain-mail' then jsonb_build_object('slot','armor','armorType','heavy','armorBase',16,'strRequirement',13,'stealthDisadvantage',true)
    when 'ex-splint' then jsonb_build_object('slot','armor','armorType','heavy','armorBase',17,'strRequirement',15,'stealthDisadvantage',true)
    when 'ex-plate' then jsonb_build_object('slot','armor','armorType','heavy','armorBase',18,'strRequirement',15,'stealthDisadvantage',true)
    when 'ex-adamantine-plate' then jsonb_build_object('slot','armor','armorType','heavy','armorBase',18,'strRequirement',15,'stealthDisadvantage',true)
    when 'ex-armor-resistance' then jsonb_build_object('slot','armor','armorType','heavy','armorBase',18,'acBonus',1,'strRequirement',15,'stealthDisadvantage',true)
    when 'ex-shield' then jsonb_build_object('slot','shield','acBonus',2)
    when 'ex-sentinel-shield' then jsonb_build_object('slot','shield','acBonus',2)
    when 'ex-spellguard-shield' then jsonb_build_object('slot','shield','acBonus',2)
    when 'ex-animated-shield' then jsonb_build_object('slot','shield','acBonus',2)
    when 'ex-tower-shield' then jsonb_build_object('slot','shield','acBonus',2)
    when 'ex-cloak-protection' then jsonb_build_object('slot','wondrous','acBonus',1,'saveBonus',1)
    when 'ex-armor-martyr' then jsonb_build_object('slot','wondrous','acBonus',1)
    when 'ex-robe-stars' then jsonb_build_object('slot','wondrous','saveBonus',1)
    else '{}'::jsonb end;
  item:=meta||item;
  inv:=jsonb_set(inv,array[p_item_index::text],item,true);
  slot:=coalesce(item->>'slot',case when item ? 'armorBase' then 'armor' else null end);
  if slot is null and not(item ? 'acBonus' or item ? 'attackBonus' or item ? 'damageBonus' or item ? 'magicBonus' or item ? 'bonuses' or item ? 'statBonuses' or item ? 'saveBonus') then raise exception 'Bu eşya kuşanılamaz'; end if;
  next_value:=not coalesce((item->>'equipped')::boolean,false);
  if next_value and slot in ('armor','shield') then
    for i in 0..jsonb_array_length(inv)-1 loop
      if i<>p_item_index and coalesce(inv->i->>'slot',case when inv->i ? 'armorBase' then 'armor' else null end)=slot then inv:=jsonb_set(inv,array[i::text,'equipped'],'false'::jsonb,true); end if;
    end loop;
  end if;
  inv:=jsonb_set(inv,array[p_item_index::text,'equipped'],to_jsonb(next_value),true);
  st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return next_value;
end $$;

create or replace function public.inventory_delete_v31(
  p_user uuid,p_campaign uuid,p_item_index integer,p_expected_id text,p_expected_name text
) returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; inv jsonb; item jsonb; server_id text;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  select state into st from campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if ci is null then raise exception 'Karakterin bulunamadı'; end if;
  inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
  if p_item_index<0 or p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya listesi değişti; ekranı yenile'; end if;
  item:=inv->p_item_index; server_id:=coalesce(item->>'id','');
  if coalesce(p_expected_name,'')<>'' and coalesce(item->>'name','')<>p_expected_name then raise exception 'Eşya listesi değişti; yanlış eşya silinmedi'; end if;
  if coalesce(p_expected_id,'')<>'' and server_id<>'' and server_id<>p_expected_id then raise exception 'Eşya ID değişti; ekranı yenile'; end if;
  inv:=inv-p_item_index;
  st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

create or replace function public.guild_inventory_move_v31(
  p_user uuid,p_campaign uuid,p_direction text,p_item_index integer,p_expected_id text,p_expected_name text,p_quantity integer
) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare st jsonb; g jsonb; ci integer; source jsonb; target jsonb; item jsonb; moved jsonb; available integer; remaining integer; server_id text;
begin
  if p_direction not in ('deposit','withdraw') or p_item_index<0 or p_quantity<1 then raise exception 'Geçersiz eşya işlemi'; end if;
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Oyuncu değilsin'; end if;
  select state into st from campaigns where id=p_campaign for update;
  g:=st->'guild'; if g is null or not(coalesce(g->'members','[]'::jsonb) ? p_user::text) then raise exception 'Lonca üyesi değilsin'; end if;
  select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if ci is null then raise exception 'Karakterin bulunamadı'; end if;
  if p_direction='deposit' then source:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);target:=coalesce(st->'guildInventory','[]'::jsonb);
  else source:=coalesce(st->'guildInventory','[]'::jsonb);target:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);end if;
  if p_item_index>=jsonb_array_length(source) then raise exception 'Eşya listesi değişti; ekranı yenile'; end if;
  item:=source->p_item_index; server_id:=coalesce(item->>'id','');
  if coalesce(p_expected_name,'')<>'' and coalesce(item->>'name','')<>p_expected_name then raise exception 'Eşya listesi değişti; yanlış eşya taşınmadı'; end if;
  if coalesce(p_expected_id,'')<>'' and server_id<>'' and server_id<>p_expected_id then raise exception 'Eşya ID değişti; ekranı yenile'; end if;
  if server_id='' then item:=item||jsonb_build_object('id',coalesce(nullif(p_expected_id,''),gen_random_uuid()::text));source:=jsonb_set(source,array[p_item_index::text],item,true);end if;
  available:=greatest(1,coalesce((item->>'qty')::integer,1));if p_quantity>available then raise exception 'Bu kadar eşya yok';end if;
  remaining:=available-p_quantity;moved:=jsonb_set(item,'{qty}',to_jsonb(p_quantity),true)||jsonb_build_object('equipped',false);
  if remaining>0 then moved:=moved||jsonb_build_object('id',gen_random_uuid()::text);end if;
  if remaining=0 then source:=source-p_item_index;else source:=jsonb_set(source,array[p_item_index::text,'qty'],to_jsonb(remaining),true);end if;
  target:=target||jsonb_build_array(moved);
  if p_direction='deposit' then st:=jsonb_set(st,array['characters',ci::text,'inventory'],source,true);st:=jsonb_set(st,'{guildInventory}',target,true);
  else st:=jsonb_set(st,'{guildInventory}',source,true);st:=jsonb_set(st,array['characters',ci::text,'inventory'],target,true);end if;
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

create or replace function public.character_choices_set(p_user uuid,p_campaign uuid,p_subclass text,p_subspecies text,p_spells jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; idx integer; ch jsonb; lvl integer; unlock_level integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  select state into st from campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer,e.value into idx,ch from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if idx is null then raise exception 'Hesabına bağlı karakter yok'; end if;
  lvl:=coalesce((ch->>'level')::integer,1);
  unlock_level:=case when ch->>'className' in ('Cleric','Sorcerer','Warlock') then 1 when ch->>'className' in ('Druid','Wizard') then 2 else 3 end;
  if lvl<unlock_level and coalesce(trim(p_subclass),'')<>'' then raise exception 'Bu class için subclass % seviyede açılır',unlock_level; end if;
  if coalesce(ch->>'subclass','')<>'' and trim(coalesce(p_subclass,''))<>ch->>'subclass' then raise exception 'Subclass seçimi kilitli; yalnızca DM değiştirebilir'; end if;
  if coalesce(ch->>'subclass','')='' and lvl>=unlock_level and coalesce(trim(p_subclass),'')<>'' then st:=jsonb_set(st,array['characters',idx::text,'subclass'],to_jsonb(trim(p_subclass)),true); end if;
  st:=jsonb_set(st,array['characters',idx::text,'preparedSpells'],coalesce(p_spells,'[]'::jsonb),true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

create or replace function public.shop_buy(p_user uuid,p_campaign uuid,p_item_id text)
returns table(item_name text,platinum integer,gold integer,silver integer,copper integer)
language plpgsql security definer set search_path=public,extensions as $$
declare st jsonb; settings jsonb; item jsonb; shop_cfg jsonb; inv jsonb; item_idx integer; char_idx integer;
  price bigint; total bigint; discount integer; wpp integer; wgp integer; wsp integer; wcp integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  select state into st from campaigns where id=p_campaign for update;
  settings:=st->'shopSettings';if coalesce((settings->>'buyingEnabled')::boolean,false)=false then raise exception 'DM satın almayı henüz açmadı';end if;
  select e.value,(e.ordinality-1)::integer into item,item_idx from jsonb_array_elements(coalesce(st->'market','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'id'=p_item_id limit 1;
  if item is null then raise exception 'Ürün bulunamadı';end if;
  shop_cfg:=settings->'shops'->(item->>'shop');
  if coalesce((shop_cfg->>'enabled')::boolean,false)=false then raise exception 'Bu dükkân kapalı';end if;
  if coalesce((item->>'active')::boolean,true)=false then raise exception 'Ürün satışta değil';end if;
  if coalesce((item->>'tier')::integer,1)>coalesce((shop_cfg->>'tier')::integer,1) then raise exception 'Ürün bu dükkân tierinde yok';end if;
  if coalesce((item->>'stock')::integer,0)<=0 then raise exception 'Ürün tükendi';end if;
  discount:=greatest(0,least(90,coalesce((settings->>'discount')::integer,0)));
  price:=greatest(0,round(coalesce((item->>'priceCopper')::numeric,0)*(100-discount)/100));
  insert into campaign_wallets(campaign_id,user_id) values(p_campaign,p_user) on conflict do nothing;
  select w.platinum,w.gold,w.silver,w.copper into wpp,wgp,wsp,wcp from campaign_wallets w where w.campaign_id=p_campaign and w.user_id=p_user for update;
  total:=wpp*1000::bigint+wgp*100::bigint+wsp*10::bigint+wcp;if total<price then raise exception 'Yeterli paran yok';end if;
  total:=total-price;wpp:=total/1000;total:=total%1000;wgp:=total/100;total:=total%100;wsp:=total/10;wcp:=total%10;
  select (e.ordinality-1)::integer into char_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if char_idx is null then raise exception 'DM hesabına bağlı karakter oluşturmalı';end if;
  inv:=coalesce(st#>array['characters',char_idx::text,'inventory'],'[]'::jsonb);
  inv:=inv||jsonb_build_array((item-'id'-'stock'-'active'-'shop'-'priceCopper'-'tier'-'ready'-'custom')||jsonb_build_object('id',gen_random_uuid()::text,'sourceItemId',item->>'id','qty',1,'equipped',false,'purchased',true));
  st:=jsonb_set(st,array['characters',char_idx::text,'inventory'],inv,true);
  st:=jsonb_set(st,array['market',item_idx::text,'stock'],to_jsonb((item->>'stock')::integer-1),true);
  update campaign_wallets set platinum=wpp,gold=wgp,silver=wsp,copper=wcp,updated_at=now() where campaign_id=p_campaign and user_id=p_user;
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return query select item->>'name',wpp,wgp,wsp,wcp;
end $$;

revoke all on function public.campaign_save_v31(uuid,uuid,jsonb,jsonb),
  public.inventory_move_v31(uuid,uuid,integer,text,text,integer,text,uuid),
  public.inventory_take_ground_v31(uuid,uuid,integer,text,text,integer),
  public.inventory_equip_v31(uuid,uuid,integer,text,text),
  public.inventory_delete_v31(uuid,uuid,integer,text,text),
  public.guild_inventory_move_v31(uuid,uuid,text,integer,text,text,integer) from public;
grant execute on function public.campaign_save_v31(uuid,uuid,jsonb,jsonb),
  public.inventory_move_v31(uuid,uuid,integer,text,text,integer,text,uuid),
  public.inventory_take_ground_v31(uuid,uuid,integer,text,text,integer),
  public.inventory_equip_v31(uuid,uuid,integer,text,text),
  public.inventory_delete_v31(uuid,uuid,integer,text,text),
  public.guild_inventory_move_v31(uuid,uuid,text,integer,text,text,integer) to anon,authenticated;

revoke all on function public.character_choices_set(uuid,uuid,text,text,jsonb),public.shop_buy(uuid,uuid,text) from public;
grant execute on function public.character_choices_set(uuid,uuid,text,text,jsonb),public.shop_buy(uuid,uuid,text) to anon,authenticated;
