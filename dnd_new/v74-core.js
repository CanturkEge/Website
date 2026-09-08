/* Build 74: shared combat rules. Also consumed by the migration generator/tests. */
(function(root){
  'use strict';
  const third=[[],[],[],[2],[3],[3],[3],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1]];
  const level=c=>Math.max(1,Math.min(20,Number(c?.level)||1));
  const key=value=>String(value||'').replace(/^v47-/,'').trim().toLocaleLowerCase('en-US');
  const mod=n=>Math.floor((Number(n||10)-10)/2);
  function casting(c){
    if(c?.className==='Fighter'&&c.subclass==='Eldritch Knight'||c?.className==='Rogue'&&c.subclass==='Arcane Trickster')return {ability:'INT',slots:third};
    return root.V53_SPELLCASTING?.[c?.className]||null;
  }
  function slots(c){const cfg=casting(c),lv=level(c);if(!cfg)return[];return cfg.pactLevel?Array.from({length:cfg.pactLevel[lv]},(_,i)=>i===cfg.pactLevel[lv]-1?cfg.pactSlots[lv]:0):[...(cfg.slots?.[lv]||[])];}
  function automatic(c){
    const names=new Set(),lv=level(c),cfg=casting(c),max=slots(c).length;
    if(c.className==='Rogue'&&c.subclass==='Arcane Trickster'&&lv>=3)names.add(key('Mage Hand'));
    if(c.className==='Cleric'){
      const domains=Object.values(root.V52_CLERIC_DOMAINS||{}),d=domains.find(d=>d.id===c.subclass||d.name===c.subclass||key(d.id)===key(c.subclass));
      for(const r of d?.spells||[])if(lv>=r[0]){names.add(key(r[1]));names.add(key(r[2]));}
    }
    if(cfg&&(['Paladin','Ranger','Artificer'].includes(c.className)||c.className==='Sorcerer'&&['Aberrant Mind','Clockwork Soul'].includes(c.subclass)))
      for(const s of root.V47_SPELLS||[])if(s.level>0&&s.level<=max&&(s.subclasses||[]).includes(c.subclass))names.add(key(s.name));
    return [...names];
  }
  function spells(c){
    const selected=new Set((c.preparedSpells||[]).flatMap(x=>typeof x==='string'?[key(x)]:[key(x.id),key(x.sourceId),key(x.name)])),auto=new Set(automatic(c));
    return (root.V47_SPELLS||[]).filter(s=>selected.has(key(s.id))||selected.has(key(s.name))||auto.has(key(s.name))).map(s=>({...s,automatic:auto.has(key(s.name))})).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name,'en'));
  }
  function castOptions(c,s){
    if(s.level===0)return[{level:0,label:'Cantrip · slot harcamaz',remaining:Infinity}];
    if(c.className==='Warlock'&&s.level>=6){const unlocked=level(c)>=(s.level-6)*2+11;return unlocked?[{level:s.level,label:`Mystic Arcanum ${s.level} · ${Math.max(0,1-(+c.resources?.['v74_arcanum_'+s.level]||0))}/1`,remaining:Math.max(0,1-(+c.resources?.['v74_arcanum_'+s.level]||0)),arcanum:true}]:[];}
    return slots(c).map((n,i)=>({level:i+1,remaining:Math.max(0,n-(+c.spellSlotsUsed?.[i+1]||0)),label:`${i+1}. seviye · ${Math.max(0,n-(+c.spellSlotsUsed?.[i+1]||0))}/${n} slot`})).filter(x=>x.level>=s.level&&slots(c)[x.level-1]>0);
  }
  function durationRounds(s){
    const text=String(s.duration||'').toLowerCase();if(/instant|until dispelled|special/.test(text))return null;
    const m=text.match(/(\d+)\s*(round|minute|hour|day)/);return m?Number(m[1])*({round:1,minute:10,hour:600,day:14400}[m[2]]):null;
  }
  function resourceRules(c){
    const lv=level(c),rows=[],add=(id,name,max,rest='long',ability='')=>rows.push({id:'v74_'+id,name,max,rest,ability});
    switch(c.className){
      case'Barbarian':add('rage','Rage',lv>=20?999:lv>=17?6:lv>=12?5:lv>=6?4:lv>=3?3:2);break;
      case'Bard':add('inspiration','Bardic Inspiration',1,lv>=5?'short':'long','CHA');break;
      case'Cleric':if(lv>=2)add('channel','Channel Divinity',lv>=18?3:lv>=6?2:1,'short');break;
      case'Druid':if(lv>=2)add('wildshape','Wild Shape',lv>=20?999:2,'short');break;
      case'Fighter':add('secondwind','Second Wind',1,'short');if(lv>=2)add('surge','Action Surge',lv>=17?2:1,'short');if(lv>=9)add('indomitable','Indomitable',lv>=17?3:lv>=13?2:1);break;
      case'Monk':if(lv>=2)add('ki','Ki',lv,'short');break;
      case'Paladin':add('layhands','Lay on Hands (HP)',lv*5);add('sense','Divine Sense',1,'long','CHA+1');if(lv>=3)add('channel','Channel Divinity',1,'short');break;
      case'Sorcerer':if(lv>=2)add('sorcery','Sorcery Points',lv);break;
      case'Wizard':add('recovery','Arcane Recovery',1);break;
      case'Artificer':if(lv>=7)add('genius','Flash of Genius',1,'long','INT');break;
    }
    return rows;
  }
  function resources(c){const stats=typeof root.prStats==='function'?root.prStats(c):c.stats||c.baseStats||{};return resourceRules(c).map(r=>{const max=r.ability?Math.max(1,mod(stats[r.ability.slice(0,3)])+(r.ability.endsWith('+1')?1:0)):r.max;return {...r,max,used:+c.resources?.[r.id]||0,remaining:max===999?999:Math.max(0,max-(+c.resources?.[r.id]||0))};});}
  function safeImage(url){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch(_){return'';}}
  function reputation(n){return n>=60?'Müttefik':n>=20?'Dost':n<=-60?'Düşman':n<=-20?'Güvensiz':'Tarafsız';}
  root.v74Rules={level,key,mod,casting,slots,automatic,spells,castOptions,durationRounds,resources,resourceRules,safeImage,reputation};
})(typeof window==='undefined'?globalThis:window);
