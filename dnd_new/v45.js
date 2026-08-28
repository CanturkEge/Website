/* v45: strict equipment slots and legacy inventory cleanup. */
(()=>{
  const EQUIPMENT_CATEGORIES=new Set(['weapon','armor','shield','accessory','focus']);
  const NON_EQUIPMENT_CATEGORIES=new Set(['consumable','scroll','component','gem','trinket','tool','ammunition','document','junk']);
  const BODY_SLOTS=new Set(['neck','ring','brooch','wrist','anklet','ears','back','hands','waist','feet','eyes','head','wondrous']);
  const VALID_SLOTS=new Set(['weapon','armor','shield','focus',...BODY_SLOTS]);
  const SLOT_LIMITS={weapon:2,ring:2,wondrous:3,armor:1,shield:1,focus:1,neck:1,brooch:1,wrist:1,anklet:1,ears:1,back:1,hands:1,waist:1,feet:1,eyes:1,head:1};

  function v45Text(value){return String(value??'').trim().toLocaleLowerCase('tr-TR')}
  function v45WearableSlot(item={}){
    let name=v45Text(item.name);
    if(['yüzük','yüzüğü','mühür','mührü'].some(word=>name.includes(word)))return 'ring';
    if(['kolye','muska','madalyon','tılsım'].some(word=>name.includes(word)))return 'neck';
    if(name.includes('broş'))return 'brooch';
    if(['bileklik','bilezik'].some(word=>name.includes(word)))return 'wrist';
    if(name.includes('halhal'))return 'anklet';
    if(name.includes('küpe'))return 'ears';
    if(['pelerin','cübbe'].some(word=>name.includes(word)))return 'back';
    if(name.includes('eldiven'))return 'hands';
    if(name.includes('kemer'))return 'waist';
    if(['çizme','ayakkabı'].some(word=>name.includes(word)))return 'feet';
    if(['mercek','gözlük'].some(word=>name.includes(word)))return 'eyes';
    if(['taç','tacı'].some(word=>name.includes(word)))return 'head';
    return '';
  }

  function v45EquipSlot(item={}){
    v25HydrateItem(item);
    let category=v45Text(item.category),explicit=v45Text(item.slot),effect=v45Text(item.effect),name=v45Text(item.name);
    if(NON_EQUIPMENT_CATEGORIES.has(category))return '';
    if(item.service||item.mount||effect.includes('mühimmat')||effect.includes('binek zırhı'))return '';
    if(category&&EQUIPMENT_CATEGORIES.has(category)){
      if(category==='weapon')return 'weapon';
      if(category==='shield')return 'shield';
      if(category==='focus')return 'focus';
      if(category==='armor')return Number.isFinite(Number(item.armorBase))&&['light','medium','heavy'].includes(v45Text(item.armorType))?'armor':'';
      let inferred=v45WearableSlot(item);
      if(inferred)return inferred;
      return explicit==='wondrous'&&!/(ayna|fener|kum saati|zar takımı)/u.test(name)?'wondrous':'';
    }
    let wearable=v45WearableSlot(item);
    if(explicit==='wondrous'&&wearable)return wearable;
    if(explicit&&VALID_SLOTS.has(explicit)){
      if(explicit==='armor'&&(!Number.isFinite(Number(item.armorBase))||!['light','medium','heavy'].includes(v45Text(item.armorType))))return '';
      return explicit;
    }
    if(wearable)return wearable;
    if(effect.includes('kalkan'))return 'shield';
    if(effect.includes('zırh')&&Number.isFinite(Number(item.armorBase))&&['light','medium','heavy'].includes(v45Text(item.armorType)))return 'armor';
    if(effect.includes('silah'))return 'weapon';
    if(effect.includes('büyü odağı')||effect.endsWith(' asa')||effect.includes('nadir asa')||/\b(değnek|asa)\b/u.test(name))return 'focus';
    return '';
  }

  function v45CanEquip(item){return !!v45EquipSlot(item)}
  function v45PrepareItem(item){
    if(!item||typeof item!=='object')return false;
    let changed=false,slot=v45EquipSlot(item);
    if(slot&&item.slot!==slot){item.slot=slot;changed=true}
    if(!slot&&item.equipped){item.equipped=false;changed=true}
    return changed;
  }
  function v45NormalizeEquipmentState(){
    if(!state)return false;
    let changed=false;
    for(let item of state.market||[])changed=v45PrepareItem(item)||changed;
    for(let character of state.characters||[])for(let item of character.inventory||[])changed=v45PrepareItem(item)||changed;
    for(let item of state.guildInventory||[])changed=v45PrepareItem(item)||changed;
    for(let item of state.groundLoot||[])changed=v45PrepareItem(item)||changed;
    if(current?.role==='dm'&&state.v45EquipmentVersion!==1){state.v45EquipmentVersion=1;changed=true}
    if(changed&&current?.role==='dm')setTimeout(save,0);
    return changed;
  }

  v25CanEquip=v45CanEquip;
  window.v25CanEquip=v45CanEquip;
  v25Equipped=function(character){
    return (character?.inventory||[]).filter(item=>item.equipped&&v45CanEquip(item)).map(item=>{v45PrepareItem(item);return v25HydrateItem(item)});
  };
  window.v25Equipped=v25Equipped;

  const v45EnsureBase=prEnsure;
  prEnsure=function(){v45NormalizeEquipmentState();return v45EnsureBase()};
  const v45RenderBase=render;
  render=function(){v45NormalizeEquipmentState();return v45RenderBase()};

  function v45EquipLimitProblem(character,item){
    if(item.equipped)return '';
    let slot=v45EquipSlot(item),limit=SLOT_LIMITS[slot]||1;
    if(limit<=1)return '';
    let used=(character?.inventory||[]).filter(other=>other!==item&&other.equipped&&v45EquipSlot(other)===slot).length;
    return used>=limit?slot==='weapon'?'En fazla iki silah kuşanabilirsin; önce bir silahı çıkar.':slot==='ring'?'En fazla iki yüzük kuşanabilirsin; önce bir yüzüğü çıkar.':'Bu türden kuşanma sınırına ulaştın; önce birini çıkar.':'';
  }

  window.v31ToggleEquip=async function(button,index){
    let character=myChar(),item=character?.inventory?.[index],slot=item&&v45EquipSlot(item);
    if(!item)return;
    if(!slot)return alert('Bu eşya kuşanılamaz. Yalnız silah, zırh, kalkan, büyü odağı ve gerçekten giyilen aksesuarlar kuşanılabilir.');
    item.slot=slot;
    let problem=v31EquipProblem(character,item)||v45EquipLimitProblem(character,item);
    if(problem)return alert(problem);
    button.disabled=true;
    let {error}=await db.rpc('inventory_equip_v45',{p_user:auth.id,p_campaign:current.id,p_item_index:index,p_expected_id:v31ItemKey(item),p_expected_name:item.name||'',p_expected_slot:slot});
    if(error){button.disabled=false;return alert(error.message+'\n\nv45-update.sql dosyasını Supabase SQL Editor’da bir kez çalıştır.')}
    await syncFromServer(true);
    let now=myChar()?.inventory?.find(row=>v31ItemKey(row)===v31ItemKey(item));
    if(now?.equipped&&now.strRequirement&&prStats(myChar()).STR<now.strRequirement)toast(`Kuşanıldı; STR ${now.strRequirement} altı olduğu için hız -10 ft`,true);
  };

  window.V45_EQUIPMENT_CATEGORIES=Object.freeze(Array.from(EQUIPMENT_CATEGORIES));
  window.V45_BODY_SLOTS=Object.freeze(Array.from(BODY_SLOTS));
  window.V45_SLOT_LIMITS=Object.freeze({...SLOT_LIMITS});
  window.v45WearableSlot=v45WearableSlot;
  window.v45EquipSlot=v45EquipSlot;
  window.v45NormalizeEquipmentState=v45NormalizeEquipmentState;
  if(current){v45NormalizeEquipmentState();render()}
})();
