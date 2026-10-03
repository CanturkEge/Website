/* Build 83: pure campaign-hub rules shared by UI and tests. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.v83Rules=api})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const ROOM_PRESETS=[
  ['kitchen','Mutfak','Uzun dinlenme sonrası erzak ve yemek hazırlığı.',2500],
  ['bedroom','Yatak Odası','İki kişilik güvenli konaklama alanı.',1800],
  ['stable','Ahır','Binek bakımı ve yolculuk hazırlığı.',4200],
  ['infirmary','Revir','Tedavi, bakım ve iyileşme alanı.',6000],
  ['library','Kütüphane','Araştırma ve büyü kopyalama çalışmaları.',8000],
  ['workshop','Atölye','Eşya onarımı ve üretim projeleri.',7500],
  ['alchemy','Simya Laboratuvarı','İksir ve simya bileşeni çalışmaları.',9000],
  ['armory','Cephanelik','Silah ve zırhların güvenli saklanması.',7000],
  ['training','Eğitim Salonu','Antrenman ve talim alanı.',6500],
  ['ritual','Ritüel Odası','Büyüsel ayinler için korumalı oda.',11000],
  ['shrine','Şapel','İbadet, adak ve kutsama alanı.',8500],
  ['vault','Kasa Odası','Para ve değerli eşyalar için güçlendirilmiş oda.',12000],
  ['greenhouse','Sera','Bitki, zehir ve şifalı ot yetiştirme alanı.',5000],
  ['guest','Misafir Odası','Konuklar ve diplomatik ziyaretçiler için oda.',3000],
  ['holding','Hücre','Esir veya tehlikeli varlıkların tutulduğu alan.',5500],
  ['warroom','Savaş Odası','Harita, keşif ve operasyon planlama merkezi.',10000]
 ].map(([id,name,effect,price])=>({id,name,effect,price}));
 const BUILDING_PRESETS=[
  ['manor','Malikâne',6,24000],['keep','Küçük Kale',10,60000],['tower','Büyücü Kulesi',5,45000],
  ['lodge','Avcı Locası',4,18000],['temple','Tapınak',8,52000],['guildhall','Lonca Salonu',8,40000],
  ['farm','Çiftlik Yerleşkesi',7,26000],['underground','Yeraltı Sığınağı',6,50000]
 ].map(([id,name,capacity,price])=>({id,name,capacity,price}));
 const QUEST_STATUSES=['Taslak','Aktif','Beklemede','Tamamlandı','Başarısız'];
 const ENCOUNTER_STATUSES=['Hazırlanıyor','Hazır','Aktif','Bitti'];
 const EVENT_STATUSES=['Yaklaşıyor','Aktif','Gelişiyor','Çözüldü','Başarısız'];
 const CASE_STATUSES=['Şüpheli','Aranıyor','Yakalandı','Yargılandı','Affedildi'];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
 const id=(prefix='v83')=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
 const nextStatus=(current,list)=>list[(Math.max(-1,list.indexOf(current))+1)%list.length];
 const lines=value=>String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,50);
 const passive=character=>{
  const stats=character?.stats||character?.baseStats||{},wis=Number(stats.WIS)||10,mod=Math.floor((wis-10)/2);
  if(Number.isFinite(Number(character?.passivePerception)))return Number(character.passivePerception);
  const level=clamp(character?.level||1,1,20),pb=2+Math.floor((level-1)/4);
  const profs=new Set([...(character?.classSkillChoices||[]),...(character?.bonusSkillChoices||[])]);
  const background={Sailor:['Perception']}[character?.background]||[];background.forEach(x=>profs.add(x));
  const fixed=['Elf','Tabaxi','Harengon'].includes(character?.species)||character?.species==='Owlin'&&character?.subspecies==='Barn';
  const trained=profs.has('Perception')||fixed,expert=(character?.expertise||[]).includes('Perception');
  return 10+mod+(trained?pb*(expert?2:1):0);
 };
 const detectedTraps=(traps,score)=>(traps||[]).filter(row=>row.revealed||row.triggered||row.armed!==false&&clamp(row.dc||10,1,40)<=score);
 const defaults=()=>({
  public:{bastion:{name:'',level:1,morale:50,defense:10,treasury:0,buildings:[],rooms:[],projects:[],hirelings:[],requests:[],dmNotes:''},factions:[],worldEvents:[],pets:[],chronicle:{title:'Macera Kroniği',pages:[]}},
  private:{traps:[],advancedQuests:[],encounters:[],crimes:{laws:[],cases:[]},divine:[],dmNotebook:{title:'DM Notları',pages:[]}},
  notebook:{title:'Maceracının Defteri',pages:[]}
 });
 function normalize(payload={}){
  const base=defaults(),out={role:payload.role||'player',passivePerception:Number(payload.passivePerception)||10,public:{...base.public,...(payload.public||{})},private:{...base.private,...(payload.private||{})},notebook:{...base.notebook,...(payload.notebook||{})}};
  out.public.bastion={...base.public.bastion,...(out.public.bastion||{})};
  for(const key of ['buildings','rooms','projects','hirelings','requests'])if(!Array.isArray(out.public.bastion[key]))out.public.bastion[key]=[];
  for(const key of ['factions','worldEvents','pets'])if(!Array.isArray(out.public[key]))out.public[key]=[];
  for(const key of ['traps','advancedQuests','encounters','divine'])if(!Array.isArray(out.private[key]))out.private[key]=[];
  out.private.crimes={...base.private.crimes,...(out.private.crimes||{})};
  if(!Array.isArray(out.private.crimes.laws))out.private.crimes.laws=[];if(!Array.isArray(out.private.crimes.cases))out.private.crimes.cases=[];
  for(const book of [out.public.chronicle,out.private.dmNotebook,out.notebook]){book.pages=Array.isArray(book.pages)?book.pages:[];if(!book.pages.length)book.pages.push({id:id('page'),title:'İlk Sayfa',body:'',npcIds:[],attachment:null});}
  return out;
 }
 return {ROOM_PRESETS,BUILDING_PRESETS,QUEST_STATUSES,ENCOUNTER_STATUSES,EVENT_STATUSES,CASE_STATUSES,clamp,id,nextStatus,lines,passive,detectedTraps,defaults,normalize};
});
