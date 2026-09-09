/* Build 78: pure XP progression helpers shared by UI and tests. */
(function(root){
  'use strict';
  const THRESHOLDS=Object.freeze([0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]);
  const MAX_XP=999999999;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(+value)?Math.trunc(+value):min));
  const xpForLevel=level=>THRESHOLDS[clamp(level,1,20)-1];
  function levelForXp(value){
    const xp=clamp(value,0,MAX_XP);let level=1;
    for(let index=1;index<THRESHOLDS.length&&xp>=THRESHOLDS[index];index++)level=index+1;
    return level;
  }
  function hasXp(character={}){return Object.prototype.hasOwnProperty.call(character,'xp')&&Number.isFinite(+character.xp)&&+character.xp>=0}
  function total(character={}){return hasXp(character)?clamp(character.xp,0,MAX_XP):xpForLevel(character.level)}
  function progress(character={}){
    const xp=total(character),level=levelForXp(xp),floor=xpForLevel(level),next=level<20?xpForLevel(level+1):null,span=next==null?0:next-floor,earned=Math.max(0,xp-floor);
    return{xp,level,floor,next,span,earned,remaining:next==null?0:Math.max(0,next-xp),percent:next==null?100:Math.max(0,Math.min(100,span?earned/span*100:0))};
  }
  function history(value){return(Array.isArray(value)?value:[]).filter(row=>row&&typeof row==='object').slice(0,50)}
  function normalize(character={}){
    const xp=total(character),level=levelForXp(xp);
    return{...character,xp,level,xpHistory:history(character.xpHistory)};
  }
  function apply(character={},operation={}){
    const current=normalize(character),before=progress(current),mode=['add','remove','set'].includes(operation.mode)?operation.mode:'add',amount=clamp(operation.amount,0,MAX_XP);
    const target=mode==='set'?amount:mode==='remove'?before.xp-amount:before.xp+amount,nextXp=clamp(target,0,MAX_XP),after=progress({xp:nextXp}),delta=nextXp-before.xp;
    if(!delta)return{character:current,before,after,delta:0,changed:false};
    const entry={
      id:String(operation.id||''),at:String(operation.at||''),actor:String(operation.actor||'DM').slice(0,80),reason:String(operation.reason||'XP düzenlemesi').trim().slice(0,240),mode,
      amount,delta,beforeXp:before.xp,afterXp:nextXp,beforeLevel:before.level,afterLevel:after.level
    };
    return{character:{...current,xp:nextXp,level:after.level,xpHistory:[entry,...current.xpHistory].slice(0,50)},before,after,delta,changed:true,entry};
  }
  root.v78Xp={THRESHOLDS,MAX_XP,clamp,xpForLevel,levelForXp,total,progress,normalize,apply};
})(typeof window==='undefined'?globalThis:window);
