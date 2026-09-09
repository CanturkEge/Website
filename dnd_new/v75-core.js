/* Build 75: pure relationship helpers shared by UI and tests. */
(function(root){
  'use strict';
  const TYPES=Object.freeze([
    {id:'neutral',label:'Nötr'},{id:'normal',label:'Normal / Tanıdık'},{id:'coworker',label:'İş arkadaşı'},
    {id:'ally',label:'Müttefik'},{id:'friend',label:'Dost'},{id:'close',label:'Yakın'},
    {id:'romantic',label:'Romantik'},{id:'family',label:'Aile'},{id:'mentor',label:'Mentor / Öğrenci'},
    {id:'rival',label:'Rakip'},{id:'tense',label:'Gergin'},{id:'hostile',label:'Düşman'},
    {id:'sworn',label:'Yeminli bağ'}
  ]);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(+value)?Math.round(+value):min));
  function band(value){
    const score=clamp(value,-100,100);
    if(score<=-75)return{id:'hateful',label:'Kinli',tone:'hostile'};
    if(score<=-40)return{id:'hostile',label:'Düşmanca',tone:'hostile'};
    if(score<=-15)return{id:'cold',label:'Soğuk',tone:'cold'};
    if(score<=14)return{id:'neutral',label:'Nötr',tone:'neutral'};
    if(score<=39)return{id:'positive',label:'Olumlu',tone:'positive'};
    if(score<=74)return{id:'trusted',label:'Güveniyor',tone:'trusted'};
    return{id:'unshakable',label:'Sarsılmaz',tone:'trusted'};
  }
  function ref(value={}){return{type:value.type==='npc'?'npc':'character',id:String(value.id||'')}}
  function normalize(value={}){
    return{
      id:String(value.id||''),source:ref(value.source),target:ref(value.target),
      type:TYPES.some(row=>row.id===value.type)?value.type:'neutral',mutual:value.mutual!==false,
      score:clamp(value.score,-100,100),trust:clamp(value.trust,0,100),respect:clamp(value.respect,0,100),
      affection:clamp(value.affection,0,100),tension:clamp(value.tension,0,100),
      note:String(value.note||'').slice(0,2000),visible:value.visible!==false,
      updatedAt:String(value.updatedAt||''),history:Array.isArray(value.history)?value.history.filter(Boolean).slice(0,100):[]
    };
  }
  function pairKey(value={}){
    const row=normalize(value),a=`${row.source.type}:${row.source.id}`,b=`${row.target.type}:${row.target.id}`;
    return row.mutual?[a,b].sort().join('↔'):`${a}→${b}`;
  }
  function entityKind(value={}){
    const row=normalize(value),kinds=[row.source.type,row.target.type].sort().join('-');
    return kinds==='character-character'?'characters':kinds==='npc-npc'?'npcs':'mixed';
  }
  function visibleTo(value,role='player'){return role==='dm'||normalize(value).visible}
  function searchText(value,resolve){
    const row=normalize(value),source=resolve?.(row.source),target=resolve?.(row.target),type=TYPES.find(x=>x.id===row.type)?.label||row.type;
    return `${source?.name||''} ${target?.name||''} ${type} ${row.note}`.toLocaleLowerCase('tr-TR');
  }
  function matches(value,filters={},resolve){
    const row=normalize(value);
    if(filters.type&&filters.type!=='all'&&row.type!==filters.type)return false;
    if(filters.kind&&filters.kind!=='all'&&entityKind(row)!==filters.kind)return false;
    if(filters.band&&filters.band!=='all'&&band(row.score).id!==filters.band)return false;
    if(filters.entity&&![`${row.source.type}:${row.source.id}`,`${row.target.type}:${row.target.id}`].includes(filters.entity))return false;
    const query=String(filters.query||'').trim().toLocaleLowerCase('tr-TR');
    return !query||searchText(row,resolve).includes(query);
  }
  root.v75Relations={TYPES,clamp,band,normalize,pairKey,entityKind,visibleTo,matches};
})(typeof window==='undefined'?globalThis:window);
