/* Build 76: pure backup validation helpers. */
(function(root){
  'use strict';
  const FORMAT='kadim-campaign-backup';
  const ARRAY_KEYS=['quests','characters','npcs','encounter','encounterTemplates','customMonsters','guildInventory','market','customEffects','customSpecies','customClasses','log','relationshipsV75'];
  const KNOWN_KEYS=new Set(['session','notes',...ARRAY_KEYS,'diceLog','groundLoot','wallets','battle','map','marketSeedVersion','v44KarmaLedger','v51JusticeLedger']);
  const BLOCKED_KEYS=new Set(['__proto__','prototype','constructor']);
  const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  function safeClone(value,limits={}){
    const maxDepth=limits.maxDepth||30,maxNodes=limits.maxNodes||150000,maxString=limits.maxString||2000000;let nodes=0;
    function copy(input,depth){
      if(++nodes>maxNodes)throw Error('Yedek çok fazla kayıt içeriyor.');
      if(depth>maxDepth)throw Error('Yedek iç içe veri sınırını aşıyor.');
      if(input===null||typeof input==='boolean'||typeof input==='number')return input;
      if(typeof input==='string'){if(input.length>maxString)throw Error('Yedekte aşırı uzun bir metin bulundu.');return input}
      if(Array.isArray(input))return input.map(item=>copy(item,depth+1));
      if(!isObject(input))throw Error('Yedekte desteklenmeyen bir veri türü bulundu.');
      const out={};for(const [key,item] of Object.entries(input)){if(BLOCKED_KEYS.has(key))throw Error('Yedekte güvenli olmayan alan adı bulundu.');out[key]=copy(item,depth+1)}return out;
    }
    return copy(value,0);
  }
  function counts(state={}){
    const chars=state.characters||[],npcs=state.npcs||[];
    return{characters:chars.length,npcs:npcs.length,relations:(state.relationshipsV75||[]).length,quests:(state.quests||[]).length,encounter:(state.encounter||[]).length,market:(state.market||[]).length,items:(state.guildInventory||[]).length+chars.reduce((n,row)=>n+(Array.isArray(row?.inventory)?row.inventory.length:0),0)+npcs.reduce((n,row)=>n+(Array.isArray(row?.inventory)?row.inventory.length:0),0)};
  }
  function validate(raw){
    if(!isObject(raw))throw Error('JSON dosyasının kökünde bir nesne olmalı.');
    const wrapped=raw.format===FORMAT;
    if(raw.format&&raw.format!==FORMAT)throw Error('Bu dosya Kadim Masa kampanya yedeği değil.');
    const source=wrapped?raw.state:raw;
    if(!isObject(source))throw Error('Yedekte kampanya state alanı bulunamadı.');
    const recognized=Object.keys(source).filter(key=>KNOWN_KEYS.has(key));
    if(recognized.length<2)throw Error('Dosya kampanya yedeğine benzemiyor; bilinen alanlar eksik.');
    for(const key of ARRAY_KEYS)if(key in source&&!Array.isArray(source[key]))throw Error(`${key} alanı liste olmalı.`);
    if('session'in source&&(!Number.isFinite(+source.session)||+source.session<0))throw Error('Oturum numarası geçersiz.');
    const state=safeClone(source);return{state,wrapped,createdAt:wrapped?String(raw.createdAt||''):'',campaign:wrapped&&isObject(raw.campaign)?safeClone(raw.campaign):{},counts:counts(state),recognized:recognized.length};
  }
  root.v76Backup={FORMAT,ARRAY_KEYS,safeClone,counts,validate};
})(typeof window==='undefined'?globalThis:window);
