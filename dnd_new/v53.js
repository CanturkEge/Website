/* v53: 2014 legacy character-rules audit, manual ability generation and full spell picker. */
(()=>{
  'use strict';
  const A=window.V53_ABILITIES?Object.keys(V53_ABILITIES):['STR','DEX','CON','INT','WIS','CHA'];
  const clampLevel=value=>Math.max(1,Math.min(20,Math.trunc(Number(value)||1)));
  const spellKey=value=>String(value||'').trim().toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const signed=value=>`${Number(value)>=0?'+':''}${Number(value)||0}`;
  const speciesRule=name=>window.V53_SPECIES?.[name]||null;
  const subRule=character=>speciesRule(character?.species)?.subs?.[character?.subspecies]||null;
  const addBonus=(target,source)=>{for(const key of A)target[key]=(Number(target[key])||0)+(Number(source?.[key])||0);return target};
  const cleanBonus=value=>Object.fromEntries(A.filter(key=>Number.isFinite(Number(value?.[key]))&&Number(value[key])!==0).map(key=>[key,Math.trunc(Number(value[key]))]));

  function v53SuggestedChoices(speciesName,subspecies,className){
    const species=speciesRule(speciesName),sub=species?.subs?.[subspecies],amounts=sub?.choices||species?.choices||[];
    if(!amounts.length)return {};
    const excluded=new Set(sub?.choiceExclude||species?.choiceExclude||[]),classRule=window.V53_CLASSES?.[className],primary=classRule?.primary||['STR','CON'];
    const ranked=classRule?[...A].sort((left,right)=>classRule.recommended[A.indexOf(right)]-classRule.recommended[A.indexOf(left)]):A;
    const order=[...primary,...ranked,...A].filter((key,index,list)=>!excluded.has(key)&&list.indexOf(key)===index),out={};
    amounts.forEach((amount,index)=>{if(order[index])out[order[index]]=amount});
    return out;
  }

  function v53SpeciesBonus(character){
    const species=speciesRule(character?.species);if(!species)return cleanBonus(character?.speciesAbilityBonuses||{});
    const sub=species.subs?.[character?.subspecies],out=Object.fromEntries(A.map(key=>[key,0]));
    addBonus(out,sub?.replaceBonus?sub.bonus:species.bonus);
    if(sub&&!sub.replaceBonus)addBonus(out,sub.bonus);
    const choices=sub?.choices||species.choices||[];
    if(choices.length){
      const stored=cleanBonus(character?.speciesAbilityBonuses||{}),sum=Object.values(stored).reduce((total,value)=>total+value,0);
      addBonus(out,sum?stored:v53SuggestedChoices(character.species,character.subspecies,character.className));
    }
    return out;
  }

  function v53SpeciesDetails(character){
    const species=speciesRule(character?.species),sub=species?.subs?.[character?.subspecies];
    if(!species)return null;
    return {
      species,sub,
      traits:[...new Set([...(species.traits||[]),...(sub?.traits||[])])],
      resist:[...new Set([...(species.resist||[]),...(sub?.resist||[])])],
      weak:[...new Set([...(species.weak||[]),...(sub?.weak||[])])],
      speed:Number(sub?.speed||species.speed||30),darkvision:Number(sub?.darkvision??species.darkvision??0),
      swim:Number(sub?.swim||species.swim||0),fly:Number(sub?.fly||species.fly||0),climb:Number(sub?.climb||species.climb||0),
      status:sub?.status||species.status||'official',source:sub?.source||species.source||'Legacy 5e',
      hpPerLevel:Number(sub?.hpPerLevel||species.hpPerLevel||0)
    };
  }

  const allSpeciesBase=allSpecies;
  allSpecies=function(){
    const previous=allSpeciesBase(),characters=state.characters||[];
    const audited=Object.entries(V53_SPECIES).map(([name,rule])=>{
      const earlier=previous.filter(row=>row.name===name).flatMap(row=>row.subs||[]),used=characters.filter(row=>row.species===name&&row.subspecies).map(row=>row.subspecies);
      return {name,subs:[...new Set([...Object.keys(rule.subs||{}),...earlier,...used])].filter(Boolean)};
    });
    const extras=previous.filter(row=>!V53_SPECIES[row.name]);
    return [...audited,...extras];
  };

  const allClassesBase=allClasses;
  allClasses=function(){
    const previous=allClassesBase().map(row=>typeof row==='string'?{name:row,subs:[]}:{...row,subs:Array.isArray(row.subs)?row.subs:[]}),characters=state.characters||[];
    const audited=Object.keys(V53_CLASSES).map(name=>{
      const earlier=previous.filter(row=>row.name===name).flatMap(row=>row.subs||[]),canonical=typeof V26_SUBCLASSES!=='undefined'?V26_SUBCLASSES[name]||[]:[],used=characters.filter(row=>row.className===name&&row.subclass).map(row=>row.subclass);
      return {name,subs:[...new Set([...canonical,...earlier,...used])].filter(Boolean)};
    });
    return [...audited,...previous.filter(row=>!V53_CLASSES[row.name]&&((state.customClasses||[]).some(custom=>(typeof custom==='string'?custom:custom.name)===row.name)||characters.some(character=>character.className===row.name)))];
  };

  const prClassBase=prClass;
  prClass=function(name){
    const base=prClassBase(name),rule=V53_CLASSES[name];
    return rule?{...base,stats:[...rule.recommended],primary:[...rule.primary],saves:[...rule.saves],caster:rule.caster,features:rule.features.map(row=>[row.level,row.name,row.summary]),source:rule.source}:base;
  };
  const prSubclassLevelBase=prSubclassLevel;
  prSubclassLevel=function(name){return V53_CLASSES[name]?.subclassLevel||prSubclassLevelBase(name)};
  prSpecies=function(name){
    const row=speciesRule(name);
    return row?{bonus:{...row.bonus},traits:[...(row.traits||[])],resist:[...(row.resist||[])],weak:[...(row.weak||[])],speed:row.speed,darkvision:row.darkvision,source:row.source}:({bonus:{},traits:['Kampanyaya özel species: ayrıntıları DM belirler.'],resist:[],weak:[]});
  };

  prStats=function(character){
    const base=character?.baseStats||character?.stats||Object.fromEntries(A.map(key=>[key,10])),species=v53SpeciesBonus(character),level=prLevelBonus(character),barbarianCapstone=character?.className==='Barbarian'&&clampLevel(character.level)>=20?{STR:4,CON:4}:{},out={};
    for(const key of A){
      const cap=character?.className==='Barbarian'&&clampLevel(character.level)>=20&&['STR','CON'].includes(key)?24:20;
      out[key]=Math.min(cap,Math.max(1,(Number(base[key])||10)+(Number(species[key])||0)+(Number(level[key])||0)+(Number(barbarianCapstone[key])||0)+(Number(character?.statOverrides?.[key])||0)));
    }
    const items=typeof v25Equipped==='function'?v25Equipped(character):[];
    for(const item of items){const bonuses=item.statBonuses||item.bonuses||{};for(const key of A)if(Number(bonuses[key]))out[key]=Math.min(30,out[key]+Number(bonuses[key]));}
    return out;
  };

  const prAutoHPBase=prAutoHP;
  prAutoHP=function(character){const level=clampLevel(character?.level),speciesHp=(v53SpeciesDetails(character)?.hpPerLevel||0)*level,subclassHp=character?.className==='Sorcerer'&&character?.subclass==='Draconic'?level:0,toughHp=(character?.feats||[]).some(feat=>String(feat).trim().toLocaleLowerCase('en-US')==='tough')?level*2:0;return prAutoHPBase(character)+speciesHp+subclassHp+toughHp};

  const prAutoACBase=prAutoAC;
  prAutoAC=function(character){
    const items=typeof v25Equipped==='function'?v25Equipped(character):[],armor=items.find(item=>item.slot==='armor'||item.slot!=='shield'&&item.armorBase!=null),shield=items.find(item=>item.slot==='shield'),stats=prStats(character),dex=prMod(stats.DEX),con=prMod(stats.CON),wis=prMod(stats.WIS),shieldBonus=shield?(Number(shield.acBonus)||2):0,other=items.filter(item=>item!==armor&&item!==shield&&item.slot!=='armor'&&item.slot!=='shield').reduce((sum,item)=>sum+(Number(item.acBonus)||0),0);let base;
    if(character?.species==='Tortle')base=17;
    else if(armor){base=Number(armor.armorBase)||10;if(armor.armorType==='light')base+=dex;else if(armor.armorType==='medium')base+=Math.min(2,dex);base+=Number(armor.acBonus)||0;}
    else{
      const mode=typeof PR_AC_BASE!=='undefined'?PR_AC_BASE[character?.className]??10:10;
      if(mode==='unarmored-con')base=10+dex+con;
      else if(mode==='unarmored-wis')base=shield?10+dex:10+dex+wis;
      else if(mode===14)base=12+Math.min(2,dex);
      else if(mode===12)base=11+dex;
      else if(mode===10)base=10+dex;
      else base=Number(mode)||prAutoACBase(character);
      const naturalBase=character?.species==='Lizardfolk'||character?.className==='Sorcerer'&&character?.subclass==='Draconic'?13+dex:0;if(naturalBase)base=Math.max(base,naturalBase);
    }
    if(character?.className==='Cleric'&&character?.subclass==='Forge'&&clampLevel(character.level)>=6&&armor?.armorType==='heavy')base+=1;
    return base+shieldBonus+other;
  };

  function v53SaveProficient(character,key){
    if(prClass(character.className).saves.includes(key))return true;
    const level=clampLevel(character.level);if(character.className==='Monk'&&level>=14)return true;if(character.className==='Rogue'&&level>=15&&key==='WIS')return true;if(character.className==='Fighter'&&character.subclass==='Samurai'&&level>=7&&key==='WIS')return true;return false;
  }
  function v53AuraSaveBonus(character){return character?.className==='Paladin'&&clampLevel(character.level)>=6?Math.max(1,prMod(prStats(character).CHA)):0}

  function v53MovementSpeed(character){
    if(character?.speedAuto===false&&Number.isFinite(Number(character.speed)))return Math.max(0,Number(character.speed));
    const details=v53SpeciesDetails(character),items=typeof v25Equipped==='function'?v25Equipped(character):[],armor=items.find(item=>item.slot==='armor'||item.slot!=='shield'&&item.armorBase!=null),shield=items.find(item=>item.slot==='shield'),level=clampLevel(character?.level);let speed=Number(details?.speed||character?.speed||30);
    if(character?.className==='Barbarian'&&level>=5&&armor?.armorType!=='heavy')speed+=10;
    if(character?.className==='Monk'&&level>=2&&!armor&&!shield)speed+=level>=18?30:level>=14?25:level>=10?20:level>=6?15:10;
    if(character?.className==='Rogue'&&character?.subclass==='Scout'&&level>=9)speed+=10;
    if(character?.className==='Paladin'&&character?.subclass==='Glory'&&level>=7)speed+=10;
    if((character?.feats||[]).some(feat=>String(feat).trim().toLocaleLowerCase('en-US')==='mobile'))speed+=10;
    if(character?.species!=='Dwarf'&&armor?.armorType==='heavy'&&Number(armor.strRequirement)>prStats(character).STR)speed-=10;
    speed+=items.reduce((sum,item)=>sum+(Number(item.speedBonus)||0),0);return Math.max(0,speed);
  }
  function v53SkillCheckBonus(character,name,key){const level=clampLevel(character.level),trained=typeof v30SkillProfs==='function'&&v30SkillProfs(character).includes(name),expert=trained&&(character.expertise||[]).includes(name),scoutExpert=character.className==='Rogue'&&character.subclass==='Scout'&&level>=3&&['Nature','Survival'].includes(name);let bonus=prMod(prStats(character)[key]);if(scoutExpert)bonus+=prProf(level)*2;else if(trained)bonus+=prProf(level)*(expert?2:1);else if(character.className==='Bard'&&level>=2)bonus+=Math.floor(prProf(level)/2);else if(character.className==='Fighter'&&character.subclass==='Champion'&&level>=7&&['STR','DEX','CON'].includes(key))bonus+=Math.ceil(prProf(level)/2);if(character.className==='Ranger'&&character.subclass==='Fey Wanderer'&&level>=3&&key==='CHA')bonus+=Math.max(1,prMod(prStats(character).WIS));if(character.className==='Fighter'&&character.subclass==='Samurai'&&level>=7&&name==='Persuasion')bonus+=prMod(prStats(character).WIS);return bonus}

  prStatGrid=function(character,dm=false){
    const stats=prStats(character),species=v53SpeciesBonus(character),level=prLevelBonus(character),classBuff=character?.className==='Barbarian'&&clampLevel(character.level)>=20?{STR:4,CON:4}:{},items=typeof v25Equipped==='function'?v25Equipped(character):[],saveItem=typeof v31EquipmentSaveBonus==='function'?v31EquipmentSaveBonus(character):0,aura=v53AuraSaveBonus(character);
    const itemStats=Object.fromEntries(A.map(key=>[key,items.reduce((sum,item)=>sum+(Number((item.statBonuses||item.bonuses||{})[key])||0),0)]));
    return `<div class="pr-statgrid v53-statgrid">${A.map(key=>{const mod=prMod(stats[key]),save=mod+(v53SaveProficient(character,key)?prProf(character.level):0)+saveItem+aura;return `<article><b>${key}</b><strong>${stats[key]}</strong><span>${signed(mod)} mod • ${signed(save)} save</span><small>Temel ${character.baseStats?.[key]??10}${species[key]?` + tür ${species[key]}`:''}${level[key]?` + ASI ${level[key]}`:''}${classBuff[key]?` + Primal Champion ${classBuff[key]}`:''}${character.statOverrides?.[key]?` + DM ${character.statOverrides[key]}`:''}${itemStats[key]?` + eşya ${itemStats[key]}`:''}${v53SaveProficient(character,key)?' • save proficient':''}${aura?` • aura ${signed(aura)}`:''}${saveItem?` • save eşyası ${signed(saveItem)}`:''}</small>${dm?`<button class="ghost" data-pr-stat="${character.id}|${key}">DM ±</button>`:''}</article>`}).join('')}</div>`;
  };

  if(typeof v25SkillBonus==='function'){
    const v53SkillBonusBase=v25SkillBonus;
    v25SkillBonus=function(character,name){
      let bonus=v53SkillBonusBase(character,name),raw=String(name||'').replace(/ \([^)]*\)$/,''),level=clampLevel(character?.level),key=typeof V25_SKILLS!=='undefined'?V25_SKILLS[name]:null,keyResolved=key==='CAST'?(PR_CASTING_ABILITY[character?.className]||'INT'):key;
      if(name?.includes('Saving Throw')){
        const baseProficient=prClass(character.className).saves.includes(keyResolved);if(v53SaveProficient(character,keyResolved)&&!baseProficient)bonus+=prProf(level);bonus+=v53AuraSaveBonus(character);return bonus;
      }
      if(raw==='Initiative'){
        const alreadyProficient=character.species==='Harengon';if(alreadyProficient)bonus+=prProf(level);
        else if(character.className==='Bard'&&level>=2)bonus+=Math.floor(prProf(level)/2);
        else if(character.className==='Fighter'&&character.subclass==='Champion'&&level>=7)bonus+=Math.ceil(prProf(level)/2);
        if(character.className==='Ranger'&&character.subclass==='Gloom Stalker'&&level>=3)bonus+=prMod(prStats(character).WIS);
        if(character.className==='Rogue'&&character.subclass==='Swashbuckler'&&level>=3)bonus+=prMod(prStats(character).CHA);
        if(character.className==='Wizard'&&['War Magic','Chronurgy'].includes(character.subclass)&&level>=2)bonus+=prMod(prStats(character).INT);
        if(character.className==='Paladin'&&character.subclass==='Watchers'&&level>=7)bonus+=prProf(level);
        if((character.feats||[]).some(feat=>String(feat).trim().toLocaleLowerCase('en-US')==='alert'))bonus+=5;return bonus;
      }
      const trained=typeof v30SkillProfs==='function'&&v30SkillProfs(character).includes(raw),expert=trained&&(character.expertise||[]).includes(raw),scoutExpert=character.className==='Rogue'&&character.subclass==='Scout'&&level>=3&&['Nature','Survival'].includes(raw);if(scoutExpert)bonus+=trained?(expert?0:prProf(level)):prProf(level)*2;else if(!trained&&character.className==='Bard'&&level>=2)bonus+=Math.floor(prProf(level)/2);else if(!trained&&character.className==='Fighter'&&character.subclass==='Champion'&&level>=7&&['STR','DEX','CON'].includes(keyResolved))bonus+=Math.ceil(prProf(level)/2);if(character.className==='Ranger'&&character.subclass==='Fey Wanderer'&&level>=3&&keyResolved==='CHA')bonus+=Math.max(1,prMod(prStats(character).WIS));if(character.className==='Fighter'&&character.subclass==='Samurai'&&level>=7&&raw==='Persuasion')bonus+=prMod(prStats(character).WIS);return bonus;
    };
  }

  prTraitCard=function(character){
    const details=v53SpeciesDetails(character);if(!details){const fallback=prSpecies(character.species);return `<section class="pr-traits"><h3>${esc(character.species)} Özellikleri</h3>${fallback.traits.map(row=>`<p>◆ ${esc(row)}</p>`).join('')}</section>`;}
    const bonus=v53SpeciesBonus(character),res=[...new Set([...details.resist,...(character.resistances||[])])],weak=[...new Set([...details.weak,...(character.weaknesses||[])])];
    return `<section class="pr-traits v53-traits"><div class="v53-trait-head"><div><small>${details.status==='homebrew'?'HOMEBREW / MASA KURALI':'2014 LEGACY KAYNAK'}</small><h3>${esc(character.species)}${character.subspecies?` / ${esc(character.subspecies)}`:''}</h3></div><span>${esc(details.source)}</span></div><div class="v53-trait-facts"><span>Hız <b>${details.speed} ft</b></span><span>Darkvision <b>${details.darkvision?details.darkvision+' ft':'Yok'}</b></span>${details.swim?`<span>Yüzme <b>${details.swim} ft</b></span>`:''}${details.climb?`<span>Tırmanma <b>${details.climb} ft</b></span>`:''}${details.fly?`<span>Uçuş <b>${details.fly} ft</b></span>`:''}<span>Ability <b>${A.filter(key=>bonus[key]).map(key=>`${key} ${signed(bonus[key])}`).join(', ')||'Sabit bonus yok'}</b></span></div>${details.traits.map(row=>`<p>◆ ${esc(row)}</p>`).join('')}<div class="pr-tags"><span class="good">Direnç/Bağışıklık: ${esc(res.join(', ')||'Yok')}</span><span class="bad">Zayıflık: ${esc(weak.join(', ')||'Yok')}</span></div></section>`;
  };

  const v53ThirdSlots=[[],[],[],[2],[3],[3],[3],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1]];
  const v53ThirdKnown=[0,0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
  const v53EkCantrips=[0,0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3],v53AtCantrips=[0,0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4];
  const v53SubclassCasting={
    Fighter:{subclass:'Eldritch Knight',ability:'INT',mode:'known',slots:v53ThirdSlots,known:v53ThirdKnown,cantrips:v53EkCantrips,spellClass:'Wizard',schools:['Abjuration','Evocation']},
    Rogue:{subclass:'Arcane Trickster',ability:'INT',mode:'known',slots:v53ThirdSlots,known:v53ThirdKnown,cantrips:v53AtCantrips,spellClass:'Wizard',schools:['Enchantment','Illusion']}
  };
  function v53CastingConfig(character){const special=v53SubclassCasting[character?.className];return special&&special.subclass===character?.subclass?special:V53_SPELLCASTING[character?.className]||null}

  function v53MaxSpellLevel(character){
    const config=v53CastingConfig(character),level=clampLevel(character?.level);if(!config)return 0;
    if(config.pactLevel){let max=Number(config.pactLevel[level])||0;if(level>=11)max=6;if(level>=13)max=7;if(level>=15)max=8;if(level>=17)max=9;return max;}
    const slots=config.slots?.[level]||[];for(let index=slots.length-1;index>=0;index--)if(slots[index])return index+1;return 0;
  }

  function v53SpellRows(character){
    const artificer=new Set((V53_ARTIFICER_SPELL_NAMES||[]).map(spellKey)),max=v53MaxSpellLevel(character),className=character?.className,config=v53CastingConfig(character),level=clampLevel(character?.level),magicalSecrets=className==='Bard'?(character.subclass==='Lore'&&level>=6?2:0)+(level>=18?6:level>=14?4:level>=10?2:0):0;
    return (V47_SPELLS||[]).filter(row=>{
      const classes=row.classes||[],subclasses=row.subclasses||[],base=classes.includes(className)||(className==='Artificer'&&artificer.has(spellKey(row.name))),special=config?.spellClass&&classes.includes(config.spellClass),divineSoul=className==='Sorcerer'&&character.subclass==='Divine Soul'&&classes.includes('Cleric'),subclassAccess=!['Cleric','Bard'].includes(className)&&!(className==='Druid'&&character.subclass==='Land')&&subclasses.includes(character?.subclass);
      return base||special||divineSoul||subclassAccess||(magicalSecrets>0&&row.level>0);
    }).filter(row=>row.level===0?Number(config?.cantrips?.[level]||0)>0:row.level<=max).map(row=>({
      id:`v47-${row.id}`,sourceId:row.id,name:row.name,nameTr:row.nameTr||row.name,spellLevel:row.level,requiredLevel:1,school:row.school,schoolTr:row.schoolTr||row.school,baseClass:(row.classes||[]).includes(className)||(className==='Artificer'&&artificer.has(spellKey(row.name))),note:`${row.schoolTr||row.school} • ${row.castingTime} • ${row.range}`,description:row.description||'',castingTime:row.castingTime,range:row.range,duration:row.duration,concentration:!!row.concentration,ritual:!!row.ritual
    })).sort((a,b)=>a.spellLevel-b.spellLevel||a.name.localeCompare(b.name,'en'));
  }

  function v53AutomaticSpellNames(character){
    const names=new Set(),level=clampLevel(character?.level),max=v53MaxSpellLevel(character);
    if(character?.className==='Rogue'&&character?.subclass==='Arcane Trickster'&&level>=3)names.add(spellKey('Mage Hand'));
    if(character?.className==='Cleric'&&character.subclass&&typeof v52Domain==='function'){const domain=v52Domain(character.subclass);for(const row of (domain?.spells||[]).filter(row=>level>=row[0])){names.add(spellKey(row[1]));names.add(spellKey(row[2]));}}
    if(['Paladin','Ranger','Artificer'].includes(character?.className)||character?.className==='Sorcerer'&&['Aberrant Mind','Clockwork Soul'].includes(character.subclass))for(const row of V47_SPELLS||[])if(row.level>0&&row.level<=max&&(row.subclasses||[]).includes(character.subclass))names.add(spellKey(row.name));
    return names;
  }

  prSpellOptions=function(character){const automatic=v53AutomaticSpellNames(character);return v53SpellRows(character).filter(row=>!automatic.has(spellKey(row.name)))};
  function v53CantripLimit(character){let limit=Number(v53CastingConfig(character)?.cantrips?.[clampLevel(character?.level)]||0);if(character?.className==='Rogue'&&character?.subclass==='Arcane Trickster'&&clampLevel(character?.level)>=3)limit=Math.max(0,limit-1);return limit}
  function v53SpellLimit(character){
    const config=v53CastingConfig(character),level=clampLevel(character?.level);if(!config)return 0;
    if(config.known)return Number(config.known[level]||0)+(character.className==='Bard'&&character.subclass==='Lore'&&level>=6?2:0);
    const ability=config.ability||prClass(character.className).primary[0],mod=prMod(prStats(character)[ability]);
    return Math.max(1,(config.formula==='half+mod'?Math.floor(level/2):level)+mod);
  }
  prPrepareLimit=v53SpellLimit;
  prSpells=function(character){
    const selected=(character.preparedSpells||[]),ids=new Set(selected.flatMap(row=>typeof row==='string'?[spellKey(row)]:[String(row.id||''),spellKey(row.name)]));
    return prSpellOptions(character).filter(row=>ids.has(row.id)||ids.has(spellKey(row.name))).map(row=>[1,row.name,row.description||row.note,row.spellLevel]);
  };

  function v53ValidateSpellSelection(character,selected,showAlert=true){
    const cantrips=selected.filter(row=>row.spellLevel===0),normal=selected.filter(row=>row.spellLevel>0&&!(character.className==='Warlock'&&row.spellLevel>5)),arcanum=selected.filter(row=>character.className==='Warlock'&&row.spellLevel>5),cantripLimit=v53CantripLimit(character),spellLimit=v53SpellLimit(character);
    let message='';
    if(cantrips.length>cantripLimit)message=`En fazla ${cantripLimit} cantrip seçebilirsin.`;
    else if(normal.length>spellLimit)message=`${character.className} Lv ${clampLevel(character.level)} için en fazla ${spellLimit} ${v53CastingConfig(character)?.mode==='known'?'bilinen':'hazırlanmış'} büyü seçebilirsin.`;
    else if(arcanum.some(row=>arcanum.filter(other=>other.spellLevel===row.spellLevel).length>1))message='Warlock Mystic Arcanum için 6–9. seviyelerin her birinden en fazla bir büyü seçebilirsin.';
    const config=v53CastingConfig(character),offSchool=config?.schools?normal.filter(row=>!config.schools.includes(row.school)).length:0,offSchoolLimit=clampLevel(character.level)>=20?4:clampLevel(character.level)>=14?3:clampLevel(character.level)>=8?2:1;
    if(!message&&config?.schools&&offSchool>offSchoolLimit)message=`${character.subclass}, çoğu Wizard büyüsünü ${config.schools.join(' / ')} okullarından seçer; bu seviyede okul dışı en fazla ${offSchoolLimit} büyü seçebilirsin.`;
    const secretLimit=character.className==='Bard'?(character.subclass==='Lore'&&clampLevel(character.level)>=6?2:0)+(clampLevel(character.level)>=18?6:clampLevel(character.level)>=14?4:clampLevel(character.level)>=10?2:0):0,secretCount=normal.filter(row=>!row.baseClass).length;
    if(!message&&character.className==='Bard'&&secretCount>secretLimit)message=`Magical Secrets ile bu seviyede Bard listesi dışından en fazla ${secretLimit} büyü seçebilirsin.`;
    if(message&&showAlert)alert(message);
    return !message;
  }

  function v53SlotSummary(character){
    const config=v53CastingConfig(character),level=clampLevel(character.level);if(!config)return '';
    if(config.pactSlots)return `${config.pactSlots[level]||0} pact slot • slot seviyesi ${config.pactLevel[level]||1} • kısa dinlenmede yenilenir${level>=11?' • Mystic Arcanum açık':''}`;
    return (config.slots?.[level]||[]).map((count,index)=>count?`${index+1}. seviye ×${count}`:'').filter(Boolean).join(' • ')||'Henüz spell slot yok';
  }
  function v53SpellAccessNote(character){const config=v53CastingConfig(character),level=clampLevel(character.level);if(config?.schools)return ` • Ana okullar: ${config.schools.join(' / ')}; okul dışı hak ${level>=20?4:level>=14?3:level>=8?2:1}`;if(character.className==='Sorcerer'&&character.subclass==='Divine Soul')return ' • Sorcerer + Cleric listesi';if(character.className==='Bard'&&((character.subclass==='Lore'&&level>=6)||level>=10))return ' • Magical Secrets class dışı seçimleri açık';return ''}

  function v53SpellPicker(character){
    const options=prSpellOptions(character),chosen=new Set((character.preparedSpells||[]).flatMap(row=>typeof row==='string'?[spellKey(row)]:[String(row.id||''),spellKey(row.name)])),cantripLimit=v53CantripLimit(character),limit=v53SpellLimit(character),mode=v53CastingConfig(character)?.mode||'prepared',selected=options.filter(row=>chosen.has(row.id)||chosen.has(spellKey(row.name))),cantripCount=selected.filter(row=>row.spellLevel===0).length,spellCount=selected.filter(row=>row.spellLevel>0&&!(character.className==='Warlock'&&row.spellLevel>5)).length,automatic=v53SpellRows(character).filter(row=>v53AutomaticSpellNames(character).has(spellKey(row.name)));
    const modeLabel={prepared:'hazırlanan',known:'bilinen',pact:'bilinen pact',spellbook:'hazırlanan (spellbook)'}[mode]||mode;
    return `<div class="v53-spell-head"><div><h3>Tam Büyü & Cantrip Seçimi</h3><p>2014 SRD kataloğundan class, subclass ve açılmış spell seviyene göre süzülür.</p></div><div class="v53-spell-count"><span>Cantrip <b id="v53CantripCounter">${cantripCount}/${cantripLimit}</b></span><span>${modeLabel} <b id="prSpellCounter">${spellCount}/${limit}</b></span></div></div><div class="v53-slot-summary">${esc(v53SlotSummary(character)+v53SpellAccessNote(character))}${automatic.length?` • ${automatic.length} subclass/domain büyüsü otomatik, sınıra sayılmaz`:''}</div>${automatic.length?`<details class="v53-auto-spells"><summary>Daima bilinen/hazırlanmış büyüler (${automatic.length})</summary><p>${automatic.map(row=>esc(row.nameTr||row.name)).join(' • ')}</p></details>`:''}<div class="v53-spell-tools"><input id="v53SpellSearch" class="input" placeholder="Büyü adı, okul, seviye ara…"><select id="v53SpellLevel"><option value="">Bütün seviyeler</option><option value="0">Cantrip</option>${Array.from({length:v53MaxSpellLevel(character)},(_,index)=>`<option value="${index+1}">${index+1}. seviye</option>`).join('')}</select><select id="v53SpellSchool"><option value="">Bütün okullar</option>${[...new Set(options.map(row=>row.schoolTr))].sort().map(row=>`<option>${esc(row)}</option>`).join('')}</select></div><div class="pr-spell-picker v53-spell-picker">${options.map(row=>`<label data-v53-spell-row data-level="${row.spellLevel}" data-school="${esc(row.schoolTr)}" data-search="${esc(`${row.name} ${row.nameTr} ${row.school} ${row.schoolTr}`.toLocaleLowerCase('tr'))}"><input type="checkbox" data-pr-spell="${row.id}" ${chosen.has(row.id)||chosen.has(spellKey(row.name))?'checked':''}><span><b>${esc(row.nameTr)} <small>${esc(row.name)}</small></b><small>${row.spellLevel===0?'Cantrip':row.spellLevel+'. seviye'} • ${esc(row.note)}${row.concentration?' • Concentration':''}${row.ritual?' • Ritual':''}</small></span></label>`).join('')}</div>`;
  }

  const prChoicePanelBase=prChoicePanel;
  prChoicePanel=function(character){
    const old=prChoicePanelBase(character),prefix=old.includes('<section class="pr-choice card">')?old.split('<section class="pr-choice card">')[0]:'',cl=allClasses().find(row=>row.name===character.className),unlock=prSubclassLevel(character.className);
    const subclassArea=character.subclass?`<div class="pr-locked-choice"><span>Subclass</span><b>${esc(character.subclass)}</b><small>Seçim mühürlendi; yalnız DM değiştirebilir.</small></div>`:character.className==='Cleric'?'<p class="notice">Cleric domaini yukarıdaki tanrı → uygun domain akışından seçilir; tanrı adı tek başına mekanik buff vermez.</p>':character.level<unlock?`<p class="notice">${esc(character.className)} subclass seçimi ${unlock}. seviyede açılır.</p>`:`<label>Subclass — tek seçim<select id="prPlayerSubclass"><option value="">Seç</option>${(cl?.subs||[]).map(row=>`<option>${esc(row)}</option>`).join('')}</select><small>Kaydedilince kilitlenir.</small></label>`;
    const canSaveSubclass=!character.subclass&&character.level>=unlock&&!(character.className==='Cleric');
    const canSaveSpells=!!v53CastingConfig(character)&&(character.className!=='Cleric'||!!character.subclass);
    return `${prefix}<section class="pr-choice card v53-choice"><div class="v53-choice-title"><div><small>v53 • 2014 LEGACY</small><h2>Karakter Seçimlerim</h2></div><span>319 büyülük kaynak bağlı katalog</span></div><div class="pr-locked-choice"><span>Alt tür / miras</span><b>${esc(character.subspecies||'Alt tür yok')}</b><small>Tür ve alt tür buffları stat hesabına birlikte uygulanır.</small></div>${subclassArea}${v53CastingConfig(character)?v53SpellPicker(character):''}${canSaveSubclass||canSaveSpells?`<button id="prSavePlayerChoices" class="primary" data-limit="${v53SpellLimit(character)}">Seçimlerimi Kaydet</button>`:''}</section>`;
  };

  function v53ResourceCards(character){
    const level=clampLevel(character.level),name=character.className,rows=[['Hız',v53MovementSpeed(character)+' ft']];
    if(name==='Barbarian'){const rages=[0,2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,'∞'];rows.push(['Rage',rages[level]],['Rage Hasarı',level>=16?'+4':level>=9?'+3':'+2']);}
    if(name==='Bard')rows.push(['Bardic Inspiration',level>=15?'d12':level>=10?'d10':level>=5?'d8':'d6']);
    if(name==='Monk')rows.push(['Ki',level>=2?level:0],['Martial Arts',level>=17?'d10':level>=11?'d8':level>=5?'d6':'d4']);
    if(name==='Paladin')rows.push(['Lay on Hands',level*5+' HP'],['Aura',level>=18?'30 ft':level>=6?'10 ft':'Lv 6']);
    if(name==='Rogue')rows.push(['Sneak Attack',Math.ceil(level/2)+'d6']);
    if(name==='Sorcerer')rows.push(['Sorcery Point',level>=2?level:0]);
    if(name==='Warlock'){const inv=[0,0,2,2,2,3,3,4,4,5,5,5,6,6,7,7,7,8,8,8,8];rows.push(['Invocation',inv[level]],['Pact Slot',V53_SPELLCASTING.Warlock.pactSlots[level]]);}
    if(name==='Druid')rows.push(['Wild Shape',level>=2?'2 / kısa dinlenme':'Lv 2']);
    if(name==='Fighter')rows.push(['Action Surge',level>=17?'2 / dinlenme':level>=2?'1 / dinlenme':'Lv 2']);
    if(name==='Artificer')rows.push(['Infused Item',level>=18?6:level>=14?5:level>=10?4:level>=6?3:level>=2?2:0]);
    return rows.map(([label,value])=>`<article><small>${esc(label)}</small><b>${esc(value)}</b></article>`).join('');
  }

  function v53FeatureDetails(row,level){return `<details class="v53-feature ${level>=row.level?'unlocked':'locked'}"><summary><span>Lv ${row.level}</span><b>${esc(row.name)}</b><small>${level>=row.level?'AÇIK':'KİLİTLİ'}</small></summary><p>${esc(row.summary)}</p></details>`}
  function v53ClassPanel(character){
    const rule=V53_CLASSES[character.className];if(!rule)return '';
    const level=clampLevel(character.level),subFeatures=V53_SUBCLASS_FEATURES[character.className]?.[character.subclass]||[],subSummary=character.subclass&&typeof v28SubclassText==='function'?v28SubclassText(character.subclass):'',config=v53CastingConfig(character),ability=config?.ability,mod=ability?prMod(prStats(character)[ability]):0,itemMagic=typeof v63SpellBonus==='function'?v63SpellBonus(character):0,saveDc=ability?8+prProf(level)+mod+itemMagic:null,selected=prSpells(character);
    return `<section class="v53-class-panel"><div class="v53-class-hero"><div><small>2014 LEGACY SINIF DENETİMİ • ${esc(rule.source)}</small><h2>${esc(character.className)}${character.subclass?` / ${esc(character.subclass)}`:''}</h2><p>Hit Die d${rule.hitDie} • Save proficiency ${esc(rule.saves.join(', '))} • Ana stat ${esc(rule.primary.join(' / '))}</p></div><strong>Lv ${level}</strong></div><div class="v53-resource-grid">${v53ResourceCards(character)}${ability?`<article><small>Spell Save DC</small><b>${saveDc}</b>${itemMagic?`<span>Eşya ${signed(itemMagic)}</span>`:''}</article><article><small>Spell Attack</small><b>${signed(prProf(level)+mod+itemMagic)}</b>${itemMagic?`<span>Eşya ${signed(itemMagic)}</span>`:''}</article>`:''}</div>${config?`<div class="v53-slot-summary">${esc(v53SlotSummary(character))} • Cantrip ${v53CantripLimit(character)} • ${v53SpellLimit(character)} ${config.mode==='known'?'bilinen':'hazırlanan'}</div>`:''}<div class="v53-feature-columns"><section class="card"><div class="v53-section-title"><small>CLASS</small><h3>Çekirdek Özellikler • 1–20</h3></div>${rule.features.map(row=>v53FeatureDetails(row,level)).join('')}</section><section class="card"><div class="v53-section-title"><small>SUBCLASS</small><h3>${esc(character.subclass||`Lv ${rule.subclassLevel} seçimi bekleniyor`)}</h3></div>${subSummary?`<p class="v53-sub-summary">${esc(subSummary)}</p>`:''}${subFeatures.length?subFeatures.map(row=>v53FeatureDetails({...row,summary:`${character.subclass} özelliği: ${row.name}. Tam action, kullanım ve save sınırı kaynak metnine göre uygulanır.`},level)).join(''):'<p class="empty">Subclass seçilmedi veya kampanyaya özel; mevcut seçim korunur ve DM mekanikleri tanımlar.</p>'}</section></div>${selected.length?`<details class="card v53-selected-spells"><summary>Seçili Büyü ve Cantripler (${selected.length})</summary>${selected.map(row=>`<article><b>${row[3]===0?'Cantrip':row[3]+'. seviye'} • ${esc(row[1])}</b><p>${esc(row[2])}</p></article>`).join('')}</details>`:''}</section>`;
  }

  prUnlocked=function(character){
    const core=(V53_CLASSES[character.className]?.features||[]).map(row=>[row.level,row.name,row.summary]),subs=(V53_SUBCLASS_FEATURES[character.className]?.[character.subclass]||[]).map(row=>[row.level,row.name,`${character.subclass} subclass özelliği.`]);
    return [...core,...subs].filter(row=>row[0]<=clampLevel(character.level)).sort((a,b)=>a[0]-b[0]);
  };
  prProgress=function(character){return character.className==='Cleric'&&typeof v52ClericPanel==='function'?v52ClericPanel(character):v53ClassPanel(character)};

  function v53AbilityBuilder(className,speciesName,subspecies){
    const rule=V53_CLASSES[className]||{recommended:[15,14,13,12,10,8]},values=Object.fromEntries(A.map((key,index)=>[key,rule.recommended[index]])),choice=v53SuggestedChoices(speciesName,subspecies,className),speciesBonus=v53SpeciesBonus({species:speciesName,subspecies,className,speciesAbilityBonuses:choice});
    return `<section class="v53-ability-builder"><div class="v53-ability-head"><div><small>ABILITY SCORE ÜRETİMİ</small><h3>Otomatik veya Manuel</h3></div><select id="v53AbilityMode"><option value="recommended">Sınıfa göre otomatik</option><option value="standard">Manuel Standard Array</option><option value="pointbuy">Manuel 27 Point Buy</option></select></div><p id="v53AbilityHelp">Sınıfın önerilen 15, 14, 13, 12, 10, 8 dağılımı otomatik yerleştirilir.</p><div class="v53-base-stats">${A.map(key=>`<label><span>${key}<small>${esc(V53_ABILITIES[key]?.tr||'')}</small></span><input type="number" data-v53-base="${key}" value="${values[key]}" min="8" max="15" disabled></label>`).join('')}</div><div id="v53SpeciesAsi">${v53AbilityChoiceHtml(speciesName,subspecies,className)}</div><div id="v53AbilityResult" class="v53-ability-result"><div><small>Dağılım</small><b class="ok">Hazır</b></div>${A.map(key=>`<span><small>${key}</small><b>${values[key]+(speciesBonus[key]||0)}</b><i>${values[key]}${speciesBonus[key]?` ${signed(speciesBonus[key])}`:''}</i></span>`).join('')}</div></section>`;
  }

  function v53AbilityChoiceHtml(speciesName,subspecies,className){
    const species=speciesRule(speciesName),sub=species?.subs?.[subspecies],amounts=sub?.choices||species?.choices||[];if(!amounts.length)return '';
    const excluded=new Set(sub?.choiceExclude||species?.choiceExclude||[]),suggested=v53SuggestedChoices(speciesName,subspecies,className),chosen=Object.keys(suggested);
    return `<fieldset class="v53-species-asi"><legend>${esc(speciesName)} esnek ability bonusu</legend><p>Bonuslar farklı ability’lere gitmeli; sabit tür/alt tür bonusları ayrıca eklenir.</p><div>${amounts.map((amount,index)=>`<label>${signed(amount)} bonus<select data-v53-species-asi="${index}" data-amount="${amount}">${A.filter(key=>!excluded.has(key)).map(key=>`<option value="${key}" ${key===chosen[index]?'selected':''}>${key} • ${esc(V53_ABILITIES[key]?.tr||'')}</option>`).join('')}</select></label>`).join('')}</div></fieldset>`;
  }

  function v53CurrentChoiceBonus(){
    const out={};for(const select of document.querySelectorAll('[data-v53-species-asi]'))out[select.value]=(out[select.value]||0)+Number(select.dataset.amount||0);return out;
  }
  function v53RefreshAbilityBuilder(rebuildChoice=true){
    const mode=$('#v53AbilityMode'),className=$('#prNewClass')?.value||'Fighter',speciesName=$('#prNewSpecies')?.value||'Human',subspecies=$('#prNewSubspecies')?.value||'',rule=V53_CLASSES[className]||{recommended:[15,14,13,12,10,8]};if(!mode)return;
    const inputs=[...document.querySelectorAll('[data-v53-base]')];
    if(mode.value==='recommended'){inputs.forEach((input,index)=>{input.value=rule.recommended[index];input.disabled=true});}
    else inputs.forEach(input=>{input.disabled=false;input.min=8;input.max=15});
    $('#v53AbilityHelp').textContent=mode.value==='pointbuy'?'27 puanı dağıt: skorlar 8–15; 14 ve 15 daha pahalıdır.':mode.value==='standard'?'15, 14, 13, 12, 10, 8 değerlerinin her birini tam bir kez yerleştir.':'Sınıfın önerilen standard array dağılımı otomatik yerleştirilir.';
    if(rebuildChoice&&$('#v53SpeciesAsi'))$('#v53SpeciesAsi').innerHTML=v53AbilityChoiceHtml(speciesName,subspecies,className);
    const base=Object.fromEntries(inputs.map(input=>[input.dataset.v53Base,Math.trunc(Number(input.value)||0)])),choice=v53CurrentChoiceBonus(),speciesBonus=v53SpeciesBonus({species:speciesName,subspecies,className,speciesAbilityBonuses:choice}),cost=Object.values(base).reduce((sum,value)=>sum+(V53_POINT_BUY[value]??99),0),standard=[...Object.values(base)].sort((a,b)=>a-b).join(',')==='8,10,12,13,14,15',valid=mode.value==='recommended'||mode.value==='pointbuy'?cost===27:standard;
    if($('#v53AbilityResult'))$('#v53AbilityResult').innerHTML=`<div><small>${mode.value==='pointbuy'?'Kalan puan':mode.value==='standard'?'Array kontrolü':'Dağılım'}</small><b class="${valid?'ok':'bad'}">${mode.value==='pointbuy'?27-cost:mode.value==='standard'?(standard?'Tam':'Eksik'):'Hazır'}</b></div>${A.map(key=>`<span><small>${key}</small><b>${(base[key]||0)+(speciesBonus[key]||0)}</b><i>${base[key]||0}${speciesBonus[key]?` ${signed(speciesBonus[key])}`:''}</i></span>`).join('')}`;
  }

  function v53ReadCreationProfile(_classRule,speciesName,subspecies){
    const mode=$('#v53AbilityMode')?.value||'recommended',className=$('#prNewClass')?.value||'Fighter',rule=V53_CLASSES[className]||{recommended:[15,14,13,12,10,8]},inputs=[...document.querySelectorAll('[data-v53-base]')];
    const base=mode==='recommended'?Object.fromEntries(A.map((key,index)=>[key,rule.recommended[index]])):Object.fromEntries(inputs.map(input=>[input.dataset.v53Base,Math.trunc(Number(input.value)||0)]));
    if(mode==='standard'&&[...Object.values(base)].sort((a,b)=>a-b).join(',')!=='8,10,12,13,14,15'){alert('Standard Array modunda 15, 14, 13, 12, 10 ve 8 değerlerinin her birini tam bir kez kullan.');return null;}
    const cost=Object.values(base).reduce((sum,value)=>sum+(V53_POINT_BUY[value]??99),0);if(mode==='pointbuy'&&cost!==27){alert(`Point Buy tam 27 puan harcamalı. Şu an ${cost} puan harcadın.`);return null;}
    const speciesBonus=v53CurrentChoiceBonus(),selects=[...document.querySelectorAll('[data-v53-species-asi]')];if(new Set(selects.map(select=>select.value)).size!==selects.length){alert('Esnek tür bonuslarını farklı ability’lere ver.');return null;}
    const details=v53SpeciesDetails({species:speciesName,subspecies,className}),fixed=v53SpeciesBonus({species:speciesName,subspecies,className,speciesAbilityBonuses:speciesBonus});
    return {base,method:mode,speciesBonus,speed:details?.speed||30,final:Object.fromEntries(A.map(key=>[key,base[key]+(fixed[key]||0)]))};
  }

  const prPlayerCreateBase=prPlayerCreate;
  prPlayerCreate=function(){
    let html=prPlayerCreateBase();
    html=html.replace("Species ve subspecies seviye 1'de seçilir ve kaydedilir. Subclass class uzmanlığıdır; classına göre 1, 2 veya 3. seviyede açılır.","Species ve subspecies seviye 1'de seçilir. Statlarını sınıfa göre otomatik dağıtabilir veya 2014 Standard Array / 27 Point Buy ile kendin verebilirsin; subclass classına göre 1, 2 veya 3. seviyede açılır.");
    const marker=html.includes('<button id="v30CreatePlayerCharacter"')?'<button id="v30CreatePlayerCharacter" class="primary">Karakterimi Oluştur</button>':'<button id="prCreatePlayerCharacter" class="primary">Karakterimi Oluştur</button>';
    return html.replace(marker,`${v53AbilityBuilder($('#prNewClass')?.value||'Fighter',$('#prNewSpecies')?.value||'Human',$('#prNewSubspecies')?.value||'')}${marker}`);
  };

  const prEnsureBase=prEnsure;
  prEnsure=function(){
    const result=prEnsureBase();for(const character of state.characters||[]){character.abilityMethod??='legacy';character.speciesAbilityBonuses??={};const details=v53SpeciesDetails(character);if(details&&character.speedAuto!==false&&(character.speed==null||character.speed===30||character.speciesSpeedApplied)){character.speed=v53MovementSpeed(character);character.speciesSpeedApplied=true;}character.stats=prStats(character);}return result;
  };

  function v53FilterSpells(){const query=($('#v53SpellSearch')?.value||'').trim().toLocaleLowerCase('tr'),level=$('#v53SpellLevel')?.value||'',school=$('#v53SpellSchool')?.value||'';for(const row of document.querySelectorAll('[data-v53-spell-row]'))row.hidden=!!((query&&!row.dataset.search.includes(query))||(level&&row.dataset.level!==level)||(school&&row.dataset.school!==school));}
  function v53UpdateSpellCounter(){const character=myChar();if(!character)return;const selected=[...document.querySelectorAll('[data-pr-spell]:checked')].map(input=>prSpellOptions(character).find(row=>row.id===input.dataset.prSpell)).filter(Boolean),normal=selected.filter(row=>row.spellLevel>0&&!(character.className==='Warlock'&&row.spellLevel>5));if($('#v53CantripCounter'))$('#v53CantripCounter').textContent=`${selected.filter(row=>row.spellLevel===0).length}/${v53CantripLimit(character)}`;if($('#prSpellCounter'))$('#prSpellCounter').textContent=`${normal.length}/${v53SpellLimit(character)}`;}

  document.addEventListener('input',event=>{if(event.target.matches?.('[data-v53-base]'))v53RefreshAbilityBuilder(false);if(event.target.id==='v53SpellSearch')v53FilterSpells()},true);
  document.addEventListener('change',event=>{
    if(event.target.id==='v53AbilityMode')v53RefreshAbilityBuilder(false);
    if(['prNewClass','prNewSpecies','prNewSubspecies'].includes(event.target.id))queueMicrotask(()=>v53RefreshAbilityBuilder(true));
    if(event.target.matches?.('[data-v53-species-asi]'))v53RefreshAbilityBuilder(false);
    if(['v53SpellLevel','v53SpellSchool'].includes(event.target.id))v53FilterSpells();
    if(event.target.matches?.('[data-pr-spell]')){event.target.closest('label')?.classList.toggle('selected',event.target.checked);v53UpdateSpellCounter();}
  },true);

  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button||!current||button.id!=='prSavePlayerChoices')return;
    event.preventDefault();event.stopImmediatePropagation();const character=myChar();if(!character)return;
    const options=prSpellOptions(character),selected=[...document.querySelectorAll('[data-pr-spell]:checked')].map(input=>options.find(row=>row.id===input.dataset.prSpell)).filter(Boolean);if(!v53ValidateSpellSelection(character,selected,true))return;
    const newSubclass=character.subclass||$('#prPlayerSubclass')?.value||'',unlock=prSubclassLevel(character.className);if(character.level>=unlock&&!character.subclass&&!newSubclass&&character.className!=='Cleric')return alert('Önce subclass seç. Bu seçim kaydedilince kilitlenecek.');
    const spells=selected.map(row=>({id:row.id,name:row.name,nameTr:row.nameTr,spellLevel:row.spellLevel,note:row.note}));button.disabled=true;button.textContent='Büyü ve seçimler kaydediliyor…';
    const {error}=await db.rpc('character_choices_set',{p_user:auth.id,p_campaign:current.id,p_subclass:newSubclass,p_subspecies:character.subspecies||'',p_spells:spells});if(error){button.disabled=false;button.textContent='Seçimlerimi Kaydet';return alert(error.message)}window.kadimUiState?.clearWithin($('#view'));await syncFromServer(true);toast('Cantrip, büyü ve subclass seçimleri kaydedildi');
  },true);

  window.v53SpeciesBonus=v53SpeciesBonus;
  window.v53SpeciesDetails=v53SpeciesDetails;
  window.v53SpellRows=v53SpellRows;
  window.v53CastingConfig=v53CastingConfig;
  window.v53CantripLimit=v53CantripLimit;
  window.v53SpellLimit=v53SpellLimit;
  window.v53SaveProficient=v53SaveProficient;
  window.v53MovementSpeed=v53MovementSpeed;
  window.v53SkillCheckBonus=v53SkillCheckBonus;
  window.v53ValidateSpellSelection=v53ValidateSpellSelection;
  window.v53ReadCreationProfile=v53ReadCreationProfile;
  window.v53RefreshAbilityBuilder=v53RefreshAbilityBuilder;
  window.v53ClassPanel=v53ClassPanel;
  window.v53Audit={species:Object.keys(V53_SPECIES).length,subspecies:Object.values(V53_SPECIES).reduce((sum,row)=>sum+Object.keys(row.subs||{}).length,0),classes:Object.keys(V53_CLASSES).length,subclasses:Object.values(V53_SUBCLASS_FEATURES).reduce((sum,row)=>sum+Object.keys(row).length,0)+(window.V52_CLERIC_DOMAINS?Object.keys(V52_CLERIC_DOMAINS).length:14),spells:(window.V47_SPELLS||[]).length};
  if(typeof V27_PAGE_HELP!=='undefined')V27_PAGE_HELP.skills='2014 legacy class/subclass özellikleri, tür + alt tür stat buffları, 319 büyülük cantrip/spell seçimi ve gerçek seviye kaynaklarını yönet.';
  queueMicrotask(()=>{if(current){prEnsure();render();queueMicrotask(()=>v53RefreshAbilityBuilder(true))}});
})();
