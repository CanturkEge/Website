-- Kadim Masa Defteri v67 — legacy spell focus equipment recognition.
-- Existing accounts, campaigns, characters and inventory records are preserved.

create or replace function public.equipment_slot_v45(p_item jsonb)
returns text language plpgsql immutable set search_path=public as $$
declare
  category text:=lower(trim(coalesce(p_item->>'category','')));
  explicit_slot text:=lower(trim(coalesce(p_item->>'slot','')));
  item_name text:=lower(coalesce(p_item->>'name',''));
  effect_name text:=lower(coalesce(p_item->>'effect',''));
  note_text text:=lower(coalesce(p_item->>'note',''));
  focus_type text:=lower(trim(coalesce(p_item->>'focusType','')));
  source_id text:=coalesce(p_item->>'sourceItemId',p_item->>'sourceLootId',p_item->>'id','');
  full_text text;
  focus_like boolean;
  inferred text;
begin
  full_text:=item_name||' '||effect_name||' '||note_text;
  focus_like:=focus_type in ('arcane','divine','druidic','instrument','universal')
    or position('kutsal sembol' in full_text)>0 or position('kutsal odak' in full_text)>0 or position('holy symbol' in full_text)>0
    or position('arcane focus' in full_text)>0 or position('druid odağı' in full_text)>0 or position('druid totemi' in full_text)>0 or position('druidic focus' in full_text)>0
    or position('component pouch' in full_text)>0 or position('bileşen kesesi' in full_text)>0 or position('bileşen çantası' in full_text)>0
    or position('büyü odağı' in full_text)>0 or position('savaş büyücüsü değneği' in full_text)>0 or position('war mage' in full_text)>0
    or position('lavta' in full_text)>0 or position('çalgı' in full_text)>0 or position('instrument' in full_text)>0;

  if category in ('consumable','scroll','component','gem','trinket','tool','ammunition','document','junk') and not focus_like then return null; end if;
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
    if focus_like then return 'focus'; end if;
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
  if focus_like or position(' asa' in effect_name)>0 or position('değnek' in item_name)>0 or right(item_name,4)=' asa' then return 'focus'; end if;
  return null;
end $$;

revoke all on function public.equipment_slot_v45(jsonb) from public,anon,authenticated;
grant execute on function public.equipment_slot_v45(jsonb) to anon,authenticated;
