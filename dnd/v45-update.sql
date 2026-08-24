-- Kadim Masa Defteri v45 — güvenilir kuşanma yuvaları.
-- Mevcut kampanya ve envanter verilerini silmez. Tekrar çalıştırılabilir.

create or replace function public.equipment_slot_v45(p_item jsonb)
returns text language plpgsql immutable set search_path=public as $$
declare
  category text:=lower(trim(coalesce(p_item->>'category','')));
  explicit_slot text:=lower(trim(coalesce(p_item->>'slot','')));
  item_name text:=lower(coalesce(p_item->>'name',''));
  effect_name text:=lower(coalesce(p_item->>'effect',''));
  source_id text:=coalesce(p_item->>'sourceItemId',p_item->>'sourceLootId',p_item->>'id','');
  inferred text;
begin
  if category in ('consumable','scroll','component','gem','trinket','tool','ammunition','document','junk') then return null; end if;
  if coalesce((p_item->>'service')::boolean,false) or coalesce((p_item->>'mount')::boolean,false) or position('mühimmat' in effect_name)>0 or position('binek zırhı' in effect_name)>0 then return null; end if;

  if position('yüzük' in item_name)>0 or position('yüzüğü' in item_name)>0 or position('mühür' in item_name)>0 or position('mührü' in item_name)>0 then inferred:='ring';
  elsif position('kolye' in item_name)>0 or position('muska' in item_name)>0 or position('madalyon' in item_name)>0 or position('tılsım' in item_name)>0 then inferred:='neck';
  elsif position('broş' in item_name)>0 then inferred:='brooch';
  elsif position('bileklik' in item_name)>0 or position('bilezik' in item_name)>0 then inferred:='wrist';
  elsif position('halhal' in item_name)>0 then inferred:='anklet';
  elsif position('küpe' in item_name)>0 then inferred:='ears';
  elsif position('pelerin' in item_name)>0 or position('cübbe' in item_name)>0 then inferred:='back';
  elsif position('eldiven' in item_name)>0 then inferred:='hands';
  elsif position('kemer' in item_name)>0 then inferred:='waist';
  elsif position('çizme' in item_name)>0 or position('ayakkabı' in item_name)>0 then inferred:='feet';
  elsif position('mercek' in item_name)>0 or position('gözlük' in item_name)>0 then inferred:='eyes';
  elsif position('taç' in item_name)>0 or position('tacı' in item_name)>0 then inferred:='head';
  end if;

  if category='weapon' then return 'weapon'; end if;
  if category='shield' then return 'shield'; end if;
  if category='focus' then return 'focus'; end if;
  if category='armor' then
    if p_item ? 'armorBase' and lower(coalesce(p_item->>'armorType','')) in ('light','medium','heavy') then return 'armor'; end if;
    return null;
  end if;
  if category='accessory' then
    if inferred is not null then return inferred; end if;
    if explicit_slot='wondrous' and position('ayna' in item_name)=0 and position('fener' in item_name)=0 and position('kum saati' in item_name)=0 and position('zar takımı' in item_name)=0 then return 'wondrous'; end if;
    return null;
  end if;

  if source_id in ('ex-leather','ex-studded','ex-padded','ex-hide','ex-chain-shirt','ex-mithral-shirt','ex-scale-mail','ex-breastplate','ex-chain-mail','ex-splint','ex-plate','ex-adamantine-plate','ex-armor-resistance') then return 'armor'; end if;
  if source_id in ('ex-shield','ex-sentinel-shield','ex-spellguard-shield','ex-animated-shield','ex-tower-shield') then return 'shield'; end if;
  if source_id='ex-armor-martyr' then return 'wondrous'; end if;
  if inferred is not null and explicit_slot='wondrous' then return inferred; end if;
  if explicit_slot in ('weapon','armor','shield','focus','neck','ring','brooch','wrist','anklet','ears','back','hands','waist','feet','eyes','head','wondrous') then return explicit_slot; end if;
  if inferred is not null then return inferred; end if;
  if position('kalkan' in effect_name)>0 then return 'shield'; end if;
  if position('zırh' in effect_name)>0 and p_item ? 'armorBase' and lower(coalesce(p_item->>'armorType','')) in ('light','medium','heavy') then return 'armor'; end if;
  if position('silah' in effect_name)>0 then return 'weapon'; end if;
  if position('büyü odağı' in effect_name)>0 or position(' asa' in effect_name)>0 or position('değnek' in item_name)>0 or right(item_name,4)=' asa' then return 'focus'; end if;
  return null;
end $$;

create or replace function public.inventory_equip_v45(
  p_user uuid,p_campaign uuid,p_item_index integer,p_expected_id text,p_expected_name text,p_expected_slot text
) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare
  st jsonb; ci integer; inv jsonb; item jsonb; meta jsonb; slot text; other_slot text;
  next_value boolean; i integer; server_id text; source_id text; slot_limit integer; equipped_count integer:=0;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if p_item_index<0 then raise exception 'Geçersiz eşya'; end if;
  select state into st from campaigns where id=p_campaign for update;
  select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if ci is null then raise exception 'Karakterin bulunamadı'; end if;
  inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
  if p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya listesi değişti; ekranı yenile'; end if;
  item:=inv->p_item_index;server_id:=coalesce(item->>'id','');
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
  slot:=public.equipment_slot_v45(item);
  if slot is null then raise exception 'Bu eşya kuşanılamaz; yalnız gerçek ekipman kullanılabilir'; end if;
  if lower(trim(coalesce(p_expected_slot,'')))<>slot then raise exception 'Eşyanın kuşanma yuvası değişti; ekranı yenile'; end if;
  if slot='armor' and (not(item ? 'armorBase') or lower(coalesce(item->>'armorType','')) not in ('light','medium','heavy')) then raise exception 'Zırhın AC ve tür bilgisi eksik'; end if;

  next_value:=not coalesce((item->>'equipped')::boolean,false);
  slot_limit:=case when slot='weapon' then 2 when slot='ring' then 2 when slot='wondrous' then 3 else 1 end;
  if next_value then
    if slot_limit=1 then
      for i in 0..jsonb_array_length(inv)-1 loop
        if i<>p_item_index and coalesce((inv->i->>'equipped')::boolean,false) and public.equipment_slot_v45(inv->i)=slot then
          inv:=jsonb_set(inv,array[i::text,'equipped'],'false'::jsonb,true);
        end if;
      end loop;
    else
      select count(*)::integer into equipped_count
      from jsonb_array_elements(inv) with ordinality e(value,ordinality)
      where e.ordinality-1<>p_item_index and coalesce((e.value->>'equipped')::boolean,false) and public.equipment_slot_v45(e.value)=slot;
      if equipped_count>=slot_limit then
        if slot='weapon' then raise exception 'En fazla iki silah kuşanabilirsin; önce birini çıkar';
        elsif slot='ring' then raise exception 'En fazla iki yüzük kuşanabilirsin; önce birini çıkar';
        else raise exception 'Bu kuşanma yuvasının sınırına ulaştın'; end if;
      end if;
    end if;
  end if;
  item:=item||jsonb_build_object('slot',slot,'equipped',next_value);
  inv:=jsonb_set(inv,array[p_item_index::text],item,true);
  st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return next_value;
end $$;

revoke all on function public.equipment_slot_v45(jsonb),public.inventory_equip_v45(uuid,uuid,integer,text,text,text) from public;
grant execute on function public.equipment_slot_v45(jsonb),public.inventory_equip_v45(uuid,uuid,integer,text,text,text) to anon,authenticated;
