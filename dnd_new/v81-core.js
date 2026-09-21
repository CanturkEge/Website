/* Build 81: pure Wizard spellbook rules shared by UI and tests. */
(function(root){
 'use strict';
 const key=value=>String(value||'').replace(/^v47-/,'').trim().toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const level=character=>Math.max(1,Math.min(20,Math.trunc(Number(character?.level)||1)));
 const intMod=character=>Math.floor((Number(character?.stats?.INT??character?.baseStats?.INT??10)-10)/2);
 const maxSpellLevel=character=>Math.min(9,Math.floor((level(character)+1)/2));
 const prepareLimit=character=>Math.max(1,level(character)+intMod(character));
 const cantripLimit=character=>level(character)>=10?5:level(character)>=4?4:3;
 const learnedAllowance=character=>6+Math.max(0,level(character)-1)*2;
 const wizardCatalog=catalog=>(catalog||[]).filter(spell=>(spell.classes||[]).includes('Wizard'));
 function resolve(catalog,value){
  const wanted=key(typeof value==='string'?value:value?.id||value?.sourceId||value?.name);
  return wizardCatalog(catalog).find(spell=>key(spell.id)===wanted||key(spell.name)===wanted)||null;
 }
 function entry(spell,source='level',addedAt=''){
  return {id:'v47-'+spell.id,sourceId:spell.id,name:spell.name,nameTr:spell.nameTr||spell.name,spellLevel:Number(spell.level)||0,school:spell.school||'',ritual:!!spell.ritual,source:['level','copied','legacy'].includes(source)?source:'legacy',addedAt:addedAt||''};
 }
 function unique(rows){const seen=new Set();return rows.filter(row=>{const id=key(row.id||row.sourceId||row.name);if(!id||seen.has(id))return false;seen.add(id);return true})}
 function model(character,catalog){
  const selected=unique((character?.preparedSpells||[]).map(raw=>{const spell=resolve(catalog,raw);return spell?entry(spell,'legacy',raw?.addedAt||''):null}).filter(Boolean));
  const cantrips=selected.filter(row=>row.spellLevel===0);
  const prepared=selected.filter(row=>row.spellLevel>0);
  const stored=Array.isArray(character?.spellbookSpells)?character.spellbookSpells:[];
  let book=unique(stored.map(raw=>{const spell=resolve(catalog,raw);return spell&&spell.level>0?entry(spell,raw?.source||'legacy',raw?.addedAt||''):null}).filter(Boolean));
  for(const row of prepared)if(!book.some(bookRow=>key(bookRow.id)===key(row.id)))book.push({...row,source:'legacy'});
  return {book:unique(book),prepared,cantrips};
 }
 function validate(character,value,catalog){
  const allowed=new Map(wizardCatalog(catalog).map(spell=>[key(spell.id),spell])),book=unique(value?.book||[]),prepared=unique(value?.prepared||[]),cantrips=unique(value?.cantrips||[]),errors=[];
  if(character?.className!=='Wizard')errors.push('Büyü kitabı yalnız Wizard için kullanılabilir.');
  if(cantrips.length>cantripLimit(character))errors.push(`En fazla ${cantripLimit(character)} cantrip seçebilirsin.`);
  if(prepared.length>prepareLimit(character))errors.push(`En fazla ${prepareLimit(character)} büyü hazırlayabilirsin.`);
  if(book.filter(row=>row.source!=='copied').length>learnedAllowance(character))errors.push(`Seviye kazanımıyla kitapta en fazla ${learnedAllowance(character)} büyü bulunabilir; diğerleri kopya olarak işaretlenmeli.`);
  const bookIds=new Set(book.map(row=>key(row.id)));
  for(const row of book){const spell=allowed.get(key(row.id));if(!spell||spell.level<1||spell.level>maxSpellLevel(character))errors.push(`${row.name||'Büyü'} bu Wizard seviyesinde kitaba eklenemez.`)}
  for(const row of prepared)if(!bookIds.has(key(row.id)))errors.push(`${row.name||'Büyü'} kitapta olmadan hazırlanamaz.`);
  for(const row of cantrips){const spell=allowed.get(key(row.id));if(!spell||spell.level!==0)errors.push(`${row.name||'Cantrip'} geçerli bir Wizard cantrip'i değil.`)}
  return [...new Set(errors)];
 }
 const copyCost=spell=>({gp:Math.max(1,Number(spell?.level)||1)*50,hours:Math.max(1,Number(spell?.level)||1)*2});
 root.v81WizardRules={key,level,intMod,maxSpellLevel,prepareLimit,cantripLimit,learnedAllowance,wizardCatalog,resolve,entry,model,validate,copyCost,unique};
})(typeof window==='undefined'?globalThis:window);
