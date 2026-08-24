/* v43: Normalize prepared-spell records before player and DM character views render them. */
(()=>{
  function v43SpellText(value){return String(value??'').trim()}

  function v43CanonicalSpell(ref){
    let key=v43SpellText(ref);
    return key?PR_SPELL_LIBRARY.find(spell=>spell.id===key||spell.name===key)||null:null;
  }

  function v43SpellObject(raw){
    if(raw==null)return null;
    if(typeof raw==='string'){
      let name=v43SpellText(raw),canonical=v43CanonicalSpell(name);
      return canonical?{...canonical}:name?{id:'',name,spellLevel:1,requiredLevel:1,note:'Eski büyü kaydı; ayrıntısı hazır kütüphanede bulunamadı.'}:null;
    }
    if(Array.isArray(raw)){
      let canonical=v43CanonicalSpell(raw[1])||v43CanonicalSpell(raw[0]);
      if(canonical)return {...canonical};
      let name=v43SpellText(raw[1]),spellLevel=Number(raw[3]),requiredLevel=Number(raw[0]);
      if(!name)return null;
      return {id:'',name,spellLevel:Number.isFinite(spellLevel)?spellLevel:1,requiredLevel:Number.isFinite(requiredLevel)?requiredLevel:1,note:v43SpellText(raw[2])||'Büyü açıklaması bulunamadı.'};
    }
    if(typeof raw!=='object')return null;
    let canonical=v43CanonicalSpell(raw.id)||v43CanonicalSpell(raw.name)||v43CanonicalSpell(raw.spellId)||v43CanonicalSpell(raw.spell_id);
    if(canonical)return {...canonical};
    let name=v43SpellText(raw.name||raw.spellName||raw.spell_name),id=v43SpellText(raw.id||raw.spellId||raw.spell_id),spellLevel=Number(raw.spellLevel??raw.spell_level??raw.level),requiredLevel=Number(raw.requiredLevel??raw.required_level);
    if(!name&&!id)return null;
    return {id,name:name||id,spellLevel:Number.isFinite(spellLevel)?spellLevel:1,requiredLevel:Number.isFinite(requiredLevel)?requiredLevel:1,note:v43SpellText(raw.note||raw.description)||'Büyü açıklaması bulunamadı.'};
  }

  function v43PreparedKeys(character){
    let keys=new Set();
    let source=Array.isArray(character?.preparedSpells)?character.preparedSpells:character?.preparedSpells?[character.preparedSpells]:[];
    for(let raw of source){
      if(typeof raw==='string'){let key=v43SpellText(raw);if(key)keys.add(key);continue}
      if(Array.isArray(raw)){for(let value of [raw[0],raw[1]]){let key=v43SpellText(value);if(key)keys.add(key)}continue}
      if(raw&&typeof raw==='object')for(let value of [raw.id,raw.name,raw.spellId,raw.spell_id,raw.spellName,raw.spell_name]){let key=v43SpellText(value);if(key)keys.add(key)}
    }
    return keys;
  }

  function v43RepairPreparedSpells(character){
    let source=Array.isArray(character?.preparedSpells)?character.preparedSpells:character?.preparedSpells?[character.preparedSpells]:[],out=[],seen=new Set();
    for(let raw of source){
      let spell=v43SpellObject(raw);if(!spell)continue;
      let key=spell.id||spell.name;if(!key||seen.has(key))continue;seen.add(key);
      out.push({id:spell.id||'',name:spell.name,spellLevel:spell.spellLevel,requiredLevel:spell.requiredLevel,note:spell.note});
    }
    character.preparedSpells=out;
    return out;
  }

  const v43EnsureBase=prEnsure;
  prEnsure=function(){
    for(let character of state.characters||[])v43RepairPreparedSpells(character);
    return v43EnsureBase();
  };

  prSpells=function(character){
    let prepared=v43PreparedKeys(character);
    let visible=prSpellOptions(character).filter(spell=>prepared.has(spell.id)||prepared.has(spell.name)).map(spell=>({...spell})),seen=new Set(visible.flatMap(spell=>[spell.id,spell.name]));
    let source=Array.isArray(character?.preparedSpells)?character.preparedSpells:character?.preparedSpells?[character.preparedSpells]:[];
    for(let raw of source){let spell=v43SpellObject(raw);if(!spell||seen.has(spell.id)||seen.has(spell.name))continue;visible.push(spell);if(spell.id)seen.add(spell.id);seen.add(spell.name)}
    return visible;
  };

  const v43SpellRuleBase=v25SpellRule;
  v25SpellRule=function(raw){
    let spell=v43SpellObject(raw);
    return spell?v43SpellRuleBase(spell):'';
  };

  window.v43SpellObject=v43SpellObject;
  window.v43RepairPreparedSpells=v43RepairPreparedSpells;
  if(current){prEnsure();render()}
})();
