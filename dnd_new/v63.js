/* v63: apply equipped caster-focus bonuses to live spell calculations. */
((root)=>{
  'use strict';
  function classAllowed(item,character){
    const allowed=Array.isArray(item?.classRestriction)?item.classRestriction:[];
    return !allowed.length||allowed.includes(character?.className);
  }
  function spellBonus(character){
    const equipped=typeof v25Equipped==='function'?v25Equipped(character):(character?.inventory||[]).filter(item=>item.equipped);
    return equipped.reduce((sum,item)=>sum+(classAllowed(item,character)?Number(item.magicBonus)||0:0),0);
  }
  root.v63SpellBonus=spellBonus;

  if(typeof v25UpdateSkill==='function'){
    const baseUpdate=v25UpdateSkill;
    v25UpdateSkill=function(){
      baseUpdate();
      const character=typeof myChar==='function'?myChar():null,name=$('#v25Skill')?.value;
      if(!character||typeof V25_SKILLS==='undefined'||V25_SKILLS[name]!=='CAST')return;
      const itemBonus=spellBonus(character),box=$('#sessionDiceBonus');
      if(!itemBonus||!box)return;
      box.value=(Number(box.value)||0)+itemBonus;
      const label=$('#v25SkillBonus');if(label)label.textContent=`Bonus ${prSigned(Number(box.value)||0)} • eşya ${prSigned(itemBonus)}`;
    };
  }
  if(current)render();
})(typeof window!=='undefined'?window:globalThis);
