/* Build 77: pure casino labels and formatting shared by UI and tests. */
(function(root){
  'use strict';
  const KINDS=Object.freeze({
    coin_flip:{label:'Sikke Oyunu',icon:'◐'},bone_dice:{label:'Kemik Zar',icon:'⚄'},shells:{label:'Kupa Oyunu',icon:'♜'},
    wheel:{label:'Şans Çarkı',icon:'✦'},high_roll:{label:'Ortak Masa',icon:'⬡'},sigil_draw:{label:'Mühür Çekilişi',icon:'✧'}
  });
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(+value)?Math.round(+value):min));
  function money(value){
    let total=Math.max(0,Math.trunc(Number(value)||0)),parts=[];
    for(const [size,label] of [[1000,'PP'],[100,'GP'],[10,'SP'],[1,'CP']]){const count=Math.floor(total/size);total%=size;if(count||size===1&&!parts.length)parts.push(`${count} ${label}`)}
    return parts.join(' ');
  }
  function multiplier(bps){return `×${(Math.max(0,Number(bps)||0)/10000).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2})}`}
  function selections(game={}){
    const cfg=game.config||{};
    if(game.kind==='coin_flip')return[['crown','Taç'],['blade','Kılıç']];
    if(game.kind==='bone_dice')return[['low','Düşük · 2–6'],['seven','Tam Yedi'],['high','Yüksek · 8–12']];
    if(game.kind==='shells')return Array.from({length:clamp(cfg.cupCount,2,10)},(_,index)=>[String(index+1),`${index+1}. Kupa`]);
    if(game.kind==='sigil_draw')return Array.from({length:clamp(cfg.sides,2,12)},(_,index)=>[String(index+1),`${index+1}. Mühür`]);
    return [];
  }
  function configSummary(game={}){
    const cfg=game.config||{};
    if(game.kind==='coin_flip')return `Doğru yüz ${multiplier(cfg.winMultiplierBps)}`;
    if(game.kind==='bone_dice')return `Düşük/yüksek ${multiplier(cfg.lowHighMultiplierBps)} · yedi ${multiplier(cfg.sevenMultiplierBps)}`;
    if(game.kind==='shells')return `${clamp(cfg.cupCount,2,10)} kupa · doğru seçim ${multiplier(cfg.winMultiplierBps)}`;
    if(game.kind==='wheel')return `${Array.isArray(cfg.segments)?cfg.segments.length:0} dilim · ${[...new Set(cfg.segments||[])].map(multiplier).join(' / ')}`;
    if(game.mode==='table')return `%${((Number(cfg.houseCutBps)||0)/100).toLocaleString('tr-TR',{maximumFractionDigits:2})} kasa payı · ${clamp(cfg.minPlayers,2,12)}–${clamp(cfg.maxPlayers,2,20)} oyuncu`;
    return '';
  }
  function result(game={},play={}){
    const row=play.result||{};
    if(game.kind==='coin_flip')return row.face==='crown'?'Taç geldi':row.face==='blade'?'Kılıç geldi':'';
    if(game.kind==='bone_dice')return Array.isArray(row.dice)?`${row.dice.join(' + ')} = ${row.total}`:'';
    if(game.kind==='shells')return row.cup?`Aytaşı ${row.cup}. kupadaydı`:'';
    if(game.kind==='wheel')return row.segment?`${row.segment}. dilim · ${multiplier(row.multiplierBps)}`:'';
    if(game.kind==='high_roll')return row.roll?`d20: ${row.roll}`:'';
    if(game.kind==='sigil_draw')return row.drawnSeal?`${row.drawnSeal}. mühür çekildi`:'';
    return '';
  }
  root.v77CasinoRules={KINDS,clamp,money,multiplier,selections,configSummary,result};
})(typeof window==='undefined'?globalThis:window);
