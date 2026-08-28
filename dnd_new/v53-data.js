/* v53: audited 2014-era character rules, species bonuses and class progression. */
((root)=>{
  'use strict';

  const A=['STR','DEX','CON','INT','WIS','CHA'];
  const feature=(level,name,summary)=>Object.freeze({level,name,summary});
  const cls=(recommended,primary,saves,hitDie,caster,subclassLevel,features,source='PHB 2014')=>Object.freeze({recommended:Object.freeze(recommended),primary:Object.freeze(primary),saves:Object.freeze(saves),hitDie,caster,subclassLevel,features:Object.freeze(features.map(row=>feature(...row))),source});
  const sub=(bonus={},traits=[],extra={})=>Object.freeze({bonus:Object.freeze(bonus),traits:Object.freeze(traits),...extra});
  const species=(bonus,speed,darkvision,traits,subs={},extra={})=>Object.freeze({bonus:Object.freeze(bonus),speed,darkvision,traits:Object.freeze(traits),subs:Object.freeze(subs),source:'Legacy 5e',status:'official',...extra});

  const abilities=Object.freeze({
    STR:{name:'Strength',tr:'Güç',use:'Yakın dövüş, Athletics, taşıma ve ağır zırh.'},
    DEX:{name:'Dexterity',tr:'Çeviklik',use:'AC, initiative, menzilli/finesse saldırı ve gizlilik.'},
    CON:{name:'Constitution',tr:'Dayanıklılık',use:'HP ve concentration saving throw.'},
    INT:{name:'Intelligence',tr:'Zekâ',use:'Arcana, History, Investigation ve Wizard/Artificer büyüleri.'},
    WIS:{name:'Wisdom',tr:'Bilgelik',use:'Perception, Insight ve Cleric/Druid/Ranger büyüleri.'},
    CHA:{name:'Charisma',tr:'Karizma',use:'Sosyal skilller ve Bard/Paladin/Sorcerer/Warlock büyüleri.'}
  });

  const speciesRules={
    Human:species({STR:1,DEX:1,CON:1,INT:1,WIS:1,CHA:1},30,0,['Common ve seçilen bir ek dil.'],{
      'Standard Human':sub({},['Bütün ability score değerlerine +1.'],{source:'PHB 2014'}),
      'Versatile Human':sub({},['İki farklı ability +1, bir skill proficiency ve bir feat.'],{replaceBonus:true,choices:[1,1],source:'PHB 2014 Variant Human'}),
      Highborn:sub({CHA:1,INT:1},['Persuasion proficiency; uzun dinlenmede bir Persuasion tekrar zarı.'],{replaceBonus:true,status:'homebrew',source:'Kadim Defter'}),
      Nomad:sub({WIS:1,DEX:1},['Survival proficiency; kara yolculuğunda yön bulma avantajı.'],{replaceBonus:true,status:'homebrew',source:'Kadim Defter'})
    },{source:'PHB 2014'}),
    Elf:species({DEX:2},30,60,['Fey Ancestry','Trance','Keen Senses'],{
      'High Elf':sub({INT:1},['Bir Wizard cantrip, elf silah eğitimi ve ek dil.'],{source:'PHB 2014'}),
      'Wood Elf':sub({WIS:1},['35 ft hız, Mask of the Wild ve elf silah eğitimi.'],{speed:35,source:'PHB 2014'}),
      Drow:sub({CHA:1},['120 ft darkvision, Sunlight Sensitivity ve Drow Magic.'],{darkvision:120,source:'PHB 2014'}),
      Eladrin:sub({CHA:1},['Fey Step ile bonus action 30 ft teleport.'],{source:'MToF legacy'}),
      'Sea Elf':sub({CON:1},['30 ft yüzme, su altında nefes ve deniz eğitimi.'],{swim:30,source:'MToF legacy'}),
      'Shadar-kai':sub({CON:1},['Necrotic direnç ve Blessing of the Raven Queen teleportu.'],{resist:['Necrotic'],source:'MToF legacy'})
    },{source:'PHB 2014'}),
    Dwarf:species({CON:2},25,60,['Dwarven Resilience','Stonecunning','Hız ağır zırhla düşmez.'],{
      'Hill Dwarf':sub({WIS:1},['Her seviyede maksimum HP +1.'],{hpPerLevel:1,source:'PHB 2014'}),
      'Mountain Dwarf':sub({STR:2},['Light ve medium armor proficiency.'],{source:'PHB 2014'}),
      'Duergar (Psionik Cüce)':sub({STR:1},['120 ft darkvision, Duergar Resilience ve doğuştan Enlarge/Invisibility.'],{darkvision:120,source:'SCAG/MToF legacy'})
    },{resist:['Poison'],source:'PHB 2014'}),
    Halfling:species({DEX:2},25,0,['Lucky','Brave','Halfling Nimbleness'],{
      Lightfoot:sub({CHA:1},['Naturally Stealthy.'],{source:'PHB 2014'}),
      Stout:sub({CON:1},['Poison save avantajı ve poison direnci.'],{resist:['Poison'],source:'PHB 2014'}),
      Ghostwise:sub({WIS:1},['30 ft Silent Speech telepatisi.'],{source:'SCAG legacy'})
    },{source:'PHB 2014'}),
    Dragonborn:species({STR:2,CHA:1},30,0,['Draconic Ancestry','Nefes save DC = 8 + proficiency + CON; 2014 hasarı seviyede gelişir','Soy hasarına direnç'],Object.fromEntries([
      ['Black / Acid','Acid','line','DEX'],['Blue / Lightning','Lightning','line','DEX'],['Green / Poison','Poison','cone','CON'],['Red / Fire','Fire','cone','DEX'],['White / Cold','Cold','cone','CON'],['Brass / Fire','Fire','line','DEX'],['Bronze / Lightning','Lightning','line','DEX'],['Copper / Acid','Acid','line','DEX'],['Gold / Fire','Fire','cone','DEX'],['Silver / Cold','Cold','cone','CON'],['Amethyst Gem / Force','Force','line','DEX'],['Crystal Gem / Radiant','Radiant','line','DEX'],['Emerald Gem / Psychic','Psychic','cone','INT'],['Sapphire Gem / Thunder','Thunder','cone','CON'],['Topaz Gem / Necrotic','Necrotic','cone','CON']
    ].map(([name,damage,shape,save])=>[name,sub({},[`${shape==='line'?'Çizgi':'Koni'} nefes: ${save} save, ${damage} hasarı.`,`${damage} direnci.`],{resist:[damage],source:name.includes('Gem')?'FToD legacy':'PHB 2014',...(name.includes('Gem')?{replaceBonus:true,choices:[2,1]}:{})})])),{source:'PHB 2014 / FToD legacy'}),
    Gnome:species({INT:2},25,60,['Gnome Cunning: büyü kaynaklı INT/WIS/CHA save avantajı.'],{
      'Forest Gnome':sub({DEX:1},['Minor Illusion ve küçük hayvanlarla iletişim.'],{source:'PHB 2014'}),
      'Rock Gnome':sub({CON:1},['Artificer’s Lore ve Tinker.'],{source:'PHB 2014'}),
      'Deep Gnome':sub({DEX:1},['120 ft darkvision ve Stone Camouflage.'],{darkvision:120,source:'SCAG legacy'})
    },{source:'PHB 2014'}),
    Goliath:species({STR:2,CON:1},30,0,['Powerful Build','Mountain Born','Stone’s Endurance'],{
      'Cloud Giant':sub({},['Kısa teleport ve hasar azaltma varyantı.'],{status:'homebrew',source:'Kadim Defter'}),
      'Fire Giant':sub({},['Fire direnci ve sınırlı ek fire hasarı.'],{resist:['Fire'],status:'homebrew',source:'Kadim Defter'}),
      'Frost Giant':sub({},['Cold direnci ve isabette hız azaltma.'],{resist:['Cold'],status:'homebrew',source:'Kadim Defter'}),
      'Hill Giant':sub({},['Sınırlı grapple/shove avantajı.'],{status:'homebrew',source:'Kadim Defter'}),
      'Stone Giant':sub({},['Darkvision ve reaction hasar azaltma.'],{darkvision:60,status:'homebrew',source:'Kadim Defter'}),
      'Storm Giant':sub({},['Lightning direnci ve reaction yıldırım karşılığı.'],{resist:['Lightning'],status:'homebrew',source:'Kadim Defter'})
    },{source:'EEPC/Volo legacy'}),
    Orc:species({STR:2,CON:1},30,60,['Aggressive/Adrenaline Rush kullanılan kaynağa göre','Powerful Build','Darkvision'],{
      'Gray Orc':sub({},['Survival proficiency ve karanlıkta ilk tur initiative avantajı.'],{status:'homebrew',source:'Kadim Defter'}),
      'Mountain Orc':sub({},['Athletics proficiency ve taşıma kapasitesi artışı.'],{status:'homebrew',source:'Kadim Defter'}),
      Orog:sub({},['Medium armor ve bir martial silah proficiency.'],{status:'homebrew',source:'Kadim Defter'})
    },{source:'Volo/Eberron legacy'}),
    Tiefling:species({INT:1,CHA:2},30,60,['Hellish Resistance','Infernal Legacy'],{
      Infernal:sub({},['Thaumaturgy; Lv3 Hellish Rebuke; Lv5 Darkness.'],{resist:['Fire'],source:'PHB 2014'}),
      Abyssal:sub({CON:1,CHA:2},['Poison Spray; Lv3 Ray of Sickness; Lv5 Crown of Madness.'],{replaceBonus:true,resist:['Poison'],status:'homebrew',source:'Kadim Defter'}),
      Chthonic:sub({WIS:1,CHA:2},['Chill Touch; Lv3 False Life; Lv5 Ray of Enfeeblement.'],{replaceBonus:true,resist:['Necrotic'],status:'homebrew',source:'Kadim Defter'}),
      Feral:sub({DEX:2,INT:1},['Feral ASI; uçuş varyantı DM onayına bağlı.'],{replaceBonus:true,source:'SCAG legacy'})
    },{resist:['Fire'],source:'PHB 2014'}),
    Aasimar:species({CHA:2},30,60,['Healing Hands','Light Bearer','Radiant ve necrotic direnç'],{
      Protector:sub({WIS:1},['Lv3 Radiant Soul: geçici kanat ve radiant bonus.'],{resist:['Radiant','Necrotic'],source:'Volo legacy'}),
      Scourge:sub({CON:1},['Lv3 Radiant Consumption aura.'],{resist:['Radiant','Necrotic'],source:'Volo legacy'}),
      Fallen:sub({STR:1},['Lv3 Necrotic Shroud korkutması.'],{resist:['Radiant','Necrotic'],source:'Volo legacy'})
    },{resist:['Radiant','Necrotic'],source:'Volo legacy'}),
    'Plasmoid / Slime':species({},30,0,['Amorphous','Hold Breath','Shape Self'],{
      'Clear Ooze':sub({},['Stealth proficiency ve hareketsizken saydam kamuflaj.'],{status:'homebrew',source:'Kadim Defter'}),
      'Venom Slime':sub({},['Poison direnç/save avantajı ve sınırlı +1d4 poison.'],{resist:['Poison'],status:'homebrew',source:'Kadim Defter'}),
      'Prismatic Slime':sub({},['Uzun dinlenmede seçilen element direnci.'],{status:'homebrew',source:'Kadim Defter'}),
      'Grave Slime':sub({},['Necrotic direnç ve sınırlı 1 HP’de kalma save’i.'],{resist:['Necrotic'],status:'homebrew',source:'Kadim Defter'})
    },{choices:[2,1],resist:['Acid','Poison'],source:'Spelljammer legacy + Kadim Defter mirasları'}),
    Genasi:species({CON:2},30,0,['Elemental miras ve doğuştan büyü.'],{
      Air:sub({DEX:1},['Nefesi sınırsız tutma ve Levitate.'],{source:'EEPC legacy'}),
      Earth:sub({STR:1},['Taş/toprak zor arazisi ve Pass without Trace.'],{source:'EEPC legacy'}),
      Fire:sub({INT:1},['120 ft darkvision, fire direnci ve Produce Flame/Burning Hands.'],{darkvision:120,resist:['Fire'],source:'EEPC legacy'}),
      Water:sub({WIS:1},['Yüzme, su altında nefes ve Shape Water.'],{swim:30,resist:['Acid'],source:'EEPC legacy'})
    },{source:'EEPC legacy'}),
    Gith:species({INT:1},30,0,['Psionics'],{
      Githyanki:sub({STR:2},['Armor/silah eğitimi; Mage Hand, Jump ve Misty Step.'],{source:'MToF legacy'}),
      Githzerai:sub({WIS:2},['Mental Discipline; Mage Hand, Shield ve Detect Thoughts.'],{source:'MToF legacy'})
    },{source:'MToF legacy'}),
    Goblin:species({DEX:2,CON:1},30,60,['Nimble Escape','Fury of the Small'],{
      'Cave Goblin':sub({},['Mağarada Stealth avantajı.'],{status:'homebrew',source:'Kadim Defter'}),
      'Forest Goblin':sub({},['Survival proficiency ve doğal örtüde Hide.'],{status:'homebrew',source:'Kadim Defter'}),
      Hobgoblin:sub({CON:2,INT:1},['Saving Face.'],{replaceBonus:true,source:'Volo legacy uyarlaması'})
    },{source:'Volo legacy'}),
    Kobold:species({DEX:2},30,60,['Draconic Cry','Kobold Legacy'],{
      Draconic:sub({},['Draconic Cry: bonus action ile yakındaki düşmanlara karşı dostlara avantaj.'],{replaceBonus:true,choices:[2,1],source:'MPMM legacy'}),
      Winged:sub({},['30 ft uçuş; medium/heavy armor ile kullanılamaz.'],{fly:30,status:'homebrew',source:'Kadim Defter'}),
      'Tunnel Stalker':sub({},['Stealth proficiency ve sınırlı bonus action Disengage.'],{status:'homebrew',source:'Kadim Defter'})
    },{source:'Volo/MPMM legacy'}),
    Tabaxi:species({DEX:2,CHA:1},30,60,['Feline Agility','Cat’s Claws','Cat’s Talent'],{
      Jungle:sub({},['Tırmanma hızı ve Perception proficiency.'],{climb:30,status:'homebrew',source:'Kadim Defter'}),
      Mountain:sub({},['Athletics proficiency ve düşme hasarı azaltma.'],{status:'homebrew',source:'Kadim Defter'}),
      'Night Prowler':sub({},['120 ft darkvision ve loş ışıkta güçlü Stealth.'],{darkvision:120,status:'homebrew',source:'Kadim Defter'})
    },{climb:20,source:'Volo legacy'}),
    Tortle:species({STR:2,WIS:1},30,0,['Natural Armor 17','Shell Defense','Hold Breath','Zırh giyemez'],{
      'River Shell':sub({},['30 ft yüzme ve 1 saat nefes tutma.'],{swim:30,status:'homebrew',source:'Kadim Defter'}),
      'Island Shell':sub({},['Survival proficiency ve Shell Defense sonrası hızlı kalkış.'],{status:'homebrew',source:'Kadim Defter'})
    },{naturalArmor:17,source:'Tortle Package legacy'}),
    Warforged:species({CON:1},30,0,['Constructed Resilience','Sentry’s Rest','Integrated Protection'],{
      Envoy:sub({},['İki farklı ability +1; bir skill, tool, dil ve entegre alet.'],{choices:[1,1],source:'Wayfinder legacy'}),
      Juggernaut:sub({STR:2},['Powerful Build ve doğal yumruk.'],{source:'Wayfinder legacy'}),
      Skirmisher:sub({DEX:2},['35 ft hız ve hafif hareket.'],{speed:35,source:'Wayfinder legacy'})
    },{resist:['Poison'],source:'Eberron legacy'}),
    Changeling:species({CHA:2},30,0,['Shapechanger','Changeling Instincts'],{
      Veiled:sub({DEX:1},['Deception proficiency ve action görünüş değişimi.'],{status:'homebrew',source:'Kadim Defter'}),
      Mirrorborn:sub({WIS:1},['Insight proficiency ve taklitte Performance avantajı.'],{status:'homebrew',source:'Kadim Defter'})
    },{source:'Eberron legacy'}),
    Firbolg:species({WIS:2,STR:1},30,60,['Firbolg Magic','Hidden Step','Powerful Build','Speech of Beast and Leaf'],{
      'Forest Warden':sub({},['Animal Handling proficiency.'],{status:'homebrew',source:'Kadim Defter'}),
      'Mist Walker':sub({},['Uzun dinlenmede bir Misty Step.'],{status:'homebrew',source:'Kadim Defter'})
    },{source:'Volo legacy'}),
    Kenku:species({DEX:2,WIS:1},30,0,['Expert Forgery','Kenku Training','Mimicry'],{
      Ravenfolk:sub({},['İki seçili skill proficiency.'],{status:'homebrew',source:'Kadim Defter'}),
      Crowfolk:sub({},['Sleight of Hand proficiency.'],{status:'homebrew',source:'Kadim Defter'})
    },{source:'Volo legacy'}),
    Lizardfolk:species({CON:2,WIS:1},30,0,['Bite','Cunning Artisan','Hold Breath','Hunter’s Lore','Natural Armor','Hungry Jaws'],{
      Swamp:sub({},['30 ft yüzme ve Survival proficiency.'],{swim:30,status:'homebrew',source:'Kadim Defter'}),
      Desert:sub({},['Nature proficiency ve sıcak iklim uyumu.'],{status:'homebrew',source:'Kadim Defter'}),
      Deepwater:sub({},['30 ft yüzme, su altında nefes ve 60 ft darkvision.'],{swim:30,darkvision:60,status:'homebrew',source:'Kadim Defter'})
    },{naturalArmor:13,source:'Volo legacy'}),
    Triton:species({STR:1,CON:1,CHA:1},30,60,['Amphibious','Control Air and Water','Emissary of the Sea','Guardians of the Depths'],{
      Coral:sub({},['Resif içinde Stealth avantajı.'],{swim:30,status:'homebrew',source:'Kadim Defter'}),
      Abyssal:sub({},['120 ft darkvision ve cold direnci.'],{swim:30,darkvision:120,resist:['Cold'],status:'homebrew',source:'Kadim Defter'}),
      Storm:sub({},['Uzun dinlenmede bir Thunderwave.'],{swim:30,status:'homebrew',source:'Kadim Defter'})
    },{swim:30,resist:['Cold'],source:'Volo legacy'}),
    Satyr:species({CHA:2,DEX:1},35,0,['Fey','Magic Resistance','Mirthful Leaps','Ram','Reveler'],{
      Woodland:sub({},['Performance proficiency ve gelişmiş sıçrama.'],{status:'homebrew',source:'Kadim Defter'}),
      Moonlit:sub({},['Minor Illusion ve gece Perception avantajı.'],{status:'homebrew',source:'Kadim Defter'})
    },{source:'Theros legacy'}),
    Harengon:species({},30,0,['Hare-Trigger','Leporine Senses','Lucky Footwork','Rabbit Hop'],{
      Meadow:sub({},['Initiative’e proficiency ve Rabbit Hop.'],{status:'homebrew',source:'Kadim Defter'}),
      Snowshoe:sub({},['Cold direnci ve karda zor araziyi yok sayma.'],{resist:['Cold'],status:'homebrew',source:'Kadim Defter'})
    },{choices:[2,1],source:'Witchlight legacy'}),
    Owlin:species({},30,120,['30 ft uçuş','Silent Feathers','120 ft darkvision'],{
      Barn:sub({},['Perception proficiency.'],{status:'homebrew',source:'Kadim Defter'}),
      Horned:sub({},['Intimidation proficiency ve doğal boynuz.'],{status:'homebrew',source:'Kadim Defter'}),
      Snowy:sub({},['Cold direnci ve karda Stealth proficiency.'],{resist:['Cold'],status:'homebrew',source:'Kadim Defter'})
    },{choices:[2,1],fly:30,source:'Strixhaven legacy'}),
    'Yuan-ti':species({INT:1,CHA:2},30,60,['Innate Spellcasting','Magic Resistance','Poison Immunity/Resilience kullanılan kaynağa göre'],{
      Pureblood:sub({},['Poison Spray, Animal Friendship (snake) ve Suggestion.'],{resist:['Poison'],source:'Volo legacy'}),
      Serpentborn:sub({},['Doğal bite ve sınırlı ek poison hasarı.'],{resist:['Poison'],status:'homebrew',source:'Kadim Defter'})
    },{resist:['Poison'],source:'Volo legacy'}),
    'Half-Elf':species({CHA:2},30,60,['Fey Ancestry','Skill Versatility: iki skill proficiency','Common, Elvish ve bir ek dil'],{}, {choices:[1,1],choiceExclude:['CHA'],source:'PHB 2014'}),
    'Half-Orc':species({STR:2,CON:1},30,60,['Menacing: Intimidation proficiency','Relentless Endurance','Savage Attacks'],{}, {source:'PHB 2014'})
  };

  const classRules={
    Barbarian:cls([15,13,14,8,12,10],['STR','CON'],['STR','CON'],12,false,3,[
      [1,'Rage','Bonus action; STR yakın saldırısına hasar bonusu ve fiziksel hasar direnci.'],[1,'Unarmored Defense','Zırhsız AC = 10 + DEX + CON; kalkan kullanılabilir.'],[2,'Reckless Attack','İlk STR yakın saldırına avantaj; sonraki turuna kadar sana saldırılar avantajlı.'],[2,'Danger Sense','Görebildiğin tehlikelerin DEX save’lerinde avantaj.'],[3,'Primal Path','Barbarian subclass seçimi.'],[5,'Extra Attack','Attack actionında iki saldırı.'],[5,'Fast Movement','Ağır zırh yokken hız +10 ft.'],[7,'Feral Instinct','Initiative avantajı; surprise turunda rage ile hareket edebilme.'],[9,'Brutal Critical','Kritikte bir ek silah zarı; Lv13 iki, Lv17 üç.'],[11,'Relentless Rage','Rage sırasında 0 HP’de CON save ile 1 HP’de kalmayı dene.'],[15,'Persistent Rage','Rage yalnız bayılınca veya sen bitirince erken sona erer.'],[18,'Indomitable Might','STR check sonucu STR skorundan düşükse skorunu kullan.'],[20,'Primal Champion','STR ve CON +4; maksimumları 24.']
    ]),
    Bard:cls([8,14,13,10,12,15],['CHA','DEX'],['DEX','CHA'],8,true,3,[
      [1,'Spellcasting','CHA ile Bard büyüleri; cantrip ve bilinen büyü tablosu uygulanır.'],[1,'Bardic Inspiration d6','Bonus action ile 60 ft dostuna attack/check/save için ilham zarı.'],[2,'Jack of All Trades','Proficiency olmayan ability checklere PB’nin yarısı.'],[2,'Song of Rest d6','Kısa dinlenmede Hit Die ile iyileşenlere ek iyileşme.'],[3,'Bard College / Expertise','Subclass seç; iki proficient skillde PB iki kat.'],[5,'Font of Inspiration / d8','İlham kısa veya uzun dinlenmede yenilenir.'],[6,'Countercharm','Action ile charm/fear save avantajı veren performans.'],[10,'Expertise / Magical Secrets / d10','İki expertise daha ve herhangi listeden iki büyü.'],[14,'Magical Secrets','Herhangi listeden iki büyü daha.'],[15,'Bardic Inspiration d12','İlham zarı d12 olur.'],[18,'Magical Secrets','Herhangi listeden iki büyü daha.'],[20,'Superior Inspiration','Initiative’te ilhamın yoksa bir kullanım geri kazan.']
    ]),
    Cleric:cls([10,12,14,8,15,13],['WIS','CON'],['WIS','CHA'],8,true,1,[
      [1,'Spellcasting / Divine Domain','WIS ile hazırlanmış Cleric büyüleri ve 1. seviye domain.'],[2,'Channel Divinity','Turn Undead veya domain seçeneği; dinlenme başına 1 kullanım.'],[5,'Destroy Undead','Turn Undead save kaybeden düşük CR undead yok edilir.'],[6,'Channel Divinity ×2','Dinlenme başına iki kullanım.'],[10,'Divine Intervention','d100 sonucu Cleric seviyene eşit/düşükse ilahi yardım.'],[18,'Channel Divinity ×3','Dinlenme başına üç kullanım.'],[20,'Improved Divine Intervention','İlahi müdahale otomatik başarılı.']
    ]),
    Druid:cls([8,13,14,12,15,10],['WIS','CON'],['INT','WIS'],8,true,2,[
      [1,'Druidic / Spellcasting','WIS ile hazırlanmış Druid büyüleri ve gizli Druidic dili.'],[2,'Wild Shape','İki kullanım; normal Druid için CR 1/4, uçma/yüzme yok.'],[2,'Druid Circle','Druid subclass seçimi.'],[4,'Wild Shape Improvement','CR 1/2 ve yüzme hızı açılır.'],[8,'Wild Shape Improvement','CR 1 ve uçma hızı açılır.'],[18,'Timeless Body','Yaşlanma on kat yavaşlar.'],[18,'Beast Spells','Wild Shape içindeyken çoğu spell componentini kullanabilirsin.'],[20,'Archdruid','Wild Shape sınırsız; çoğu V/S componentini yok sayarsın.']
    ]),
    Fighter:cls([15,13,14,10,12,8],['STR','CON'],['STR','CON'],10,false,3,[
      [1,'Fighting Style','Bir savaş stili seç.'],[1,'Second Wind','Bonus action: 1d10 + Fighter seviyesi iyileşme; kısa/uzun dinlenme.'],[2,'Action Surge','Kendi turunda bir ek action; Lv17’de iki kullanım.'],[3,'Martial Archetype','Fighter subclass seçimi.'],[5,'Extra Attack','Attack actionında iki saldırı; Lv11 üç, Lv20 dört.'],[9,'Indomitable','Başarısız save’i yeniden at; Lv13 iki, Lv17 üç kullanım.'],[20,'Extra Attack ×4','Attack actionında dört saldırı.']
    ]),
    Monk:cls([10,15,13,8,14,12],['DEX','WIS'],['STR','DEX'],8,false,3,[
      [1,'Martial Arts d4','Monk silahı/unarmed için DEX ve bonus action unarmed strike.'],[1,'Unarmored Defense','Zırh/kalkan yokken AC = 10 + DEX + WIS.'],[2,'Ki','Monk seviyesi kadar Ki; kısa/uzun dinlenmede yenilenir.'],[2,'Unarmored Movement +10','Zırh/kalkan yokken hız artar.'],[3,'Monastic Tradition / Deflect Missiles','Subclass ve reaction ile menzilli hasar azaltma.'],[4,'Slow Fall','Reaction ile düşme hasarını 5 × Monk seviyesi azalt.'],[5,'Extra Attack / Stunning Strike / d6','İki saldırı; 1 Ki ile CON save’e karşı stun.'],[6,'Ki-Empowered Strikes','Unarmed saldırılar direnç için magical sayılır.'],[7,'Evasion / Stillness of Mind','DEX alan hasarı azaltma ve charm/fear temizleme.'],[9,'Unarmored Movement Improvement','Dikey yüzey ve sıvı üstünde tur boyunca hareket.'],[10,'Purity of Body','Hastalık ve poison bağışıklığı.'],[13,'Tongue of Sun and Moon','Bütün konuşulan dilleri anla ve anlaşıl.'],[14,'Diamond Soul','Bütün saving throwlarda proficiency; Ki ile reroll.'],[15,'Timeless Body','Yaşlanma zayıflığı yok; yiyecek/su gerekmez.'],[18,'Empty Body','4 Ki ile invisible ve çoğu hasara direnç; astral projection.'],[20,'Perfect Self','Initiative’te 0 Ki varsa 4 Ki kazan.']
    ]),
    Paladin:cls([15,10,13,8,12,14],['STR','CHA'],['WIS','CHA'],10,true,3,[
      [1,'Divine Sense','Celestial/fiend/undead ve kutsal-kirli alan algısı.'],[1,'Lay on Hands','Paladin seviyesi ×5 iyileştirme havuzu.'],[2,'Fighting Style / Spellcasting','Bir stil; CHA ile hazırlanmış yarım-caster büyüleri.'],[2,'Divine Smite','Yakın silah isabetine slot harcayıp radiant hasar ekle.'],[3,'Divine Health / Sacred Oath','Hastalık bağışıklığı ve subclass/Channel Divinity.'],[5,'Extra Attack','Attack actionında iki saldırı.'],[6,'Aura of Protection','10 ft dostların save’lerine CHA modifier; Lv18’de 30 ft.'],[10,'Aura of Courage','Yakındaki dostlar frightened olmaz.'],[11,'Improved Divine Smite','Her yakın silah isabetine +1d8 radiant.'],[14,'Cleansing Touch','Action ile kendi CHA kullanımın kadar spell sona erdir.']
    ]),
    Ranger:cls([10,15,13,12,14,8],['DEX','WIS'],['STR','DEX'],10,true,3,[
      [1,'Favored Enemy','İz sürme/bilgi checklerinde avantaj; doğrudan hasar bonusu yok.'],[1,'Natural Explorer','Seçilen arazide yolculuk ve keşif üstünlükleri.'],[2,'Fighting Style / Spellcasting','Bir stil; WIS ile bilinen yarım-caster büyüleri.'],[3,'Ranger Archetype / Primeval Awareness','Subclass ve slotla çevrede yaratık türü sezme.'],[5,'Extra Attack','Attack actionında iki saldırı.'],[8,'Land’s Stride','Büyüsüz zor bitki arazisini yok say.'],[10,'Hide in Plain Sight','Kamuflaj hazırlayıp Stealth’e +10.'],[14,'Vanish','Hide bonus action; büyüsüz izlenemezsin.'],[18,'Feral Senses','Görünmeyen hedefe saldırı dezavantajını azaltır; 30 ft konum sezisi.'],[20,'Foe Slayer','Favored enemy saldırı/hasarına turda bir WIS ekle.']
    ]),
    Rogue:cls([8,15,13,14,10,12],['DEX','INT'],['DEX','INT'],8,false,3,[
      [1,'Expertise','İki proficiencyde PB iki kat.'],[1,'Sneak Attack 1d6','Şartları sağlayan finesse/ranged isabete turda bir ek hasar.'],[1,'Thieves’ Cant','Gizli hırsız dili.'],[2,'Cunning Action','Dash, Disengage veya Hide bonus action.'],[3,'Roguish Archetype / Sneak 2d6','Subclass seçimi ve Sneak Attack gelişimi.'],[5,'Uncanny Dodge / Sneak 3d6','Görülen saldırının hasarını reaction ile yarıya indir.'],[6,'Expertise','İki proficiency daha.'],[7,'Evasion / Sneak 4d6','DEX alan save’inde başarıda sıfır, başarısızlıkta yarım hasar.'],[11,'Reliable Talent / Sneak 6d6','Proficient check d20 sonucu 9 altıysa 10 sayılır.'],[14,'Blindsense','10 ft içindeki gizli/görünmez hedefi duyabiliyorsan konumunu bil.'],[15,'Slippery Mind / Sneak 8d6','WIS saving throw proficiency.'],[18,'Elusive','Incapacitated değilken sana saldırılar avantajlı olamaz.'],[20,'Stroke of Luck / Sneak 10d6','Kaçan saldırıyı isabete veya başarısız checki 20’ye çevir.']
    ]),
    Sorcerer:cls([8,13,14,10,12,15],['CHA','CON'],['CON','CHA'],6,true,1,[
      [1,'Spellcasting / Sorcerous Origin','CHA ile bilinen büyüler ve subclass.'],[2,'Font of Magic','Sorcerer seviyesi kadar sorcery point ve slot dönüşümü.'],[3,'Metamagic','İki Metamagic; Lv10 ve Lv17’de birer seçenek daha.'],[10,'Metamagic ×3','Üçüncü Metamagic seçeneği.'],[17,'Metamagic ×4','Dördüncü Metamagic seçeneği.'],[20,'Sorcerous Restoration','Kısa dinlenmede 4 sorcery point geri kazan.']
    ]),
    Warlock:cls([8,13,14,10,12,15],['CHA','CON'],['WIS','CHA'],8,true,1,[
      [1,'Otherworldly Patron / Pact Magic','CHA ile patron ve kısa dinlenmede yenilenen pact slotları.'],[2,'Eldritch Invocations','İki invocation; sınıf tablosuyla sayı artar.'],[3,'Pact Boon','Chain, Blade veya Tome.'],[11,'Mystic Arcanum (6th)','6. seviye bir büyüyü uzun dinlenmede bir kez.'],[13,'Mystic Arcanum (7th)','7. seviye bir büyü.'],[15,'Mystic Arcanum (8th)','8. seviye bir büyü.'],[17,'Mystic Arcanum (9th)','9. seviye bir büyü.'],[20,'Eldritch Master','1 dakikalık dua ile pact slotlarını geri kazan; uzun dinlenmede bir.']
    ]),
    Wizard:cls([8,14,13,15,12,10],['INT','CON'],['INT','WIS'],6,true,2,[
      [1,'Spellcasting / Spellbook','INT ile Wizard büyüleri; kitapta 6 adet 1. seviye büyüyle başla.'],[1,'Arcane Recovery','Günde bir kısa dinlenmede toplam seviyesi Wizard/2 yukarı yuvarlanmış slot yenile.'],[2,'Arcane Tradition','Wizard subclass/okul seçimi.'],[18,'Spell Mastery','Bir 1. ve bir 2. seviye büyüyü en düşük seviyesinde slotsuz kullan.'],[20,'Signature Spells','İki 3. seviye büyü daima hazır; her biri uzun dinlenmede bir ücretsiz.']
    ]),
    Artificer:cls([8,14,13,15,12,10],['INT','CON'],['CON','INT'],8,true,3,[
      [1,'Magical Tinkering / Spellcasting','INT ile hazırlanmış Artificer büyüleri.'],[2,'Infuse Item','Bilinen infusionları sıradan eşyalara uygula.'],[3,'Artificer Specialist / Right Tool for the Job','Subclass ve 1 saat içinde seçilen artisan tool üretme.'],[6,'Tool Expertise','Proficient tool checklerinde PB iki kat.'],[7,'Flash of Genius','Reaction ile 30 ft check/save’e INT bonusu; INT/long rest.'],[10,'Magic Item Adept','Dört attunement; common/uncommon craft daha hızlı/ucuz.'],[11,'Spell-Storing Item','Bir eşyaya 1. veya 2. seviye Artificer büyüsü yükle.'],[14,'Magic Item Savant','Beş attunement; magic item class/race/level/spell şartlarını yok say.'],[18,'Magic Item Master','Altı attunement.'],[20,'Soul of Artifice','Attuned eşya başına save +1; 0 HP’de infusion sonlandırıp 1 HP.']
    ],'Eberron/TCoE legacy')
  };

  const subclassSpecs={
    Barbarian:{
      Berserker:'Frenzy|Mindless Rage|Intimidating Presence|Retaliation','Totem Warrior':'Spirit Seeker / Totem Spirit|Aspect of the Beast|Spirit Walker|Totemic Attunement','Ancestral Guardian':'Ancestral Protectors|Spirit Shield|Consult the Spirits|Vengeful Ancestors','Storm Herald':'Storm Aura|Storm Soul|Shielding Storm|Raging Storm',Zealot:'Divine Fury / Warrior of the Gods|Fanatical Focus|Zealous Presence|Rage Beyond Death',Beast:'Form of the Beast|Bestial Soul|Infectious Fury|Call the Hunt','Wild Magic':'Magic Awareness / Wild Surge|Bolstering Magic|Unstable Backlash|Controlled Surge'},
    Bard:{Lore:'Bonus Proficiencies / Cutting Words|Additional Magical Secrets|Peerless Skill',Valor:'Bonus Proficiencies / Combat Inspiration|Extra Attack|Battle Magic',Glamour:'Mantle of Inspiration / Enthralling Performance|Mantle of Majesty|Unbreakable Majesty',Swords:'Bonus Proficiencies / Fighting Style / Blade Flourish|Extra Attack|Master’s Flourish',Whispers:'Psychic Blades / Words of Terror|Mantle of Whispers|Shadow Lore',Creation:'Mote of Potential / Performance of Creation|Animating Performance|Creative Crescendo',Eloquence:'Silver Tongue / Unsettling Words|Unfailing Inspiration / Universal Speech|Infectious Inspiration',Spirits:'Guiding Whispers / Spiritual Focus / Tales from Beyond|Spirit Session|Mystical Connection'},
    Druid:{Land:'Bonus Cantrip / Natural Recovery / Circle Spells|Land’s Stride|Nature’s Ward|Nature’s Sanctuary',Moon:'Combat Wild Shape / Circle Forms|Primal Strike / Circle Forms|Elemental Wild Shape|Thousand Forms',Dreams:'Balm of the Summer Court|Hearth of Moonlight and Shadow|Hidden Paths|Walker in Dreams',Shepherd:'Speech of the Woods / Spirit Totem|Mighty Summoner|Guardian Spirit|Faithful Summons',Spores:'Halo of Spores / Symbiotic Entity / Circle Spells|Fungal Infestation|Spreading Spores|Fungal Body',Stars:'Star Map / Starry Form / Circle Spells|Cosmic Omen|Twinkling Constellations|Full of Stars',Wildfire:'Circle Spells / Summon Wildfire Spirit|Enhanced Bond|Cauterizing Flames|Blazing Revival'},
    Fighter:{Champion:'Improved Critical|Remarkable Athlete|Additional Fighting Style|Superior Critical|Survivor','Battle Master':'Combat Superiority / Student of War|Know Your Enemy|Improved Combat Superiority|Relentless|Improved Combat Superiority','Eldritch Knight':'Spellcasting / Weapon Bond|War Magic|Eldritch Strike|Arcane Charge|Improved War Magic','Arcane Archer':'Arcane Archer Lore / Arcane Shot|Magic Arrow / Curving Shot|Arcane Shot Option|Ever-Ready Shot|Arcane Shot Improvement',Cavalier:'Bonus Proficiency / Born to the Saddle / Unwavering Mark|Warding Maneuver|Hold the Line|Ferocious Charger|Vigilant Defender',Samurai:'Bonus Proficiency / Fighting Spirit|Elegant Courtier|Tireless Spirit|Rapid Strike|Strength Before Death','Echo Knight':'Manifest Echo / Unleash Incarnation|Echo Avatar|Shadow Martyr|Reclaim Potential|Legion of One','Psi Warrior':'Psionic Power|Telekinetic Adept|Guarded Mind|Bulwark of Force|Telekinetic Master','Rune Knight':'Bonus Proficiencies / Rune Carver / Giant’s Might|Runic Shield|Great Stature|Master of Runes|Runic Juggernaut'},
    Monk:{'Open Hand':'Open Hand Technique|Wholeness of Body|Tranquility|Quivering Palm',Shadow:'Shadow Arts|Shadow Step|Cloak of Shadows|Opportunist','Four Elements':'Disciple of the Elements|Elemental Discipline|Elemental Discipline|Elemental Discipline','Long Death':'Touch of Death|Hour of Reaping|Mastery of Death|Touch of the Long Death','Sun Soul':'Radiant Sun Bolt|Searing Arc Strike|Searing Sunburst|Sun Shield','Drunken Master':'Bonus Proficiencies / Drunken Technique|Tipsy Sway|Drunkard’s Luck|Intoxicated Frenzy',Kensei:'Path of the Kensei|One with the Blade|Sharpen the Blade|Unerring Accuracy',Mercy:'Implements of Mercy / Hand of Healing / Hand of Harm|Physician’s Touch|Flurry of Healing and Harm|Hand of Ultimate Mercy','Astral Self':'Arms of the Astral Self|Visage of the Astral Self|Body of the Astral Self|Awakened Astral Self'},
    Paladin:{Devotion:'Oath Spells / Channel Divinity|Aura of Devotion|Purity of Spirit|Holy Nimbus',Ancients:'Oath Spells / Channel Divinity|Aura of Warding|Undying Sentinel|Elder Champion',Vengeance:'Oath Spells / Channel Divinity|Relentless Avenger|Soul of Vengeance|Avenging Angel',Crown:'Oath Spells / Channel Divinity|Divine Allegiance|Unyielding Spirit|Exalted Champion',Conquest:'Oath Spells / Channel Divinity|Aura of Conquest|Scornful Rebuke|Invincible Conqueror',Redemption:'Oath Spells / Channel Divinity|Aura of the Guardian|Protective Spirit|Emissary of Redemption',Glory:'Oath Spells / Channel Divinity|Aura of Alacrity|Glorious Defense|Living Legend',Watchers:'Oath Spells / Channel Divinity|Aura of the Sentinel|Vigilant Rebuke|Mortal Bulwark',Oathbreaker:'Oath Spells / Channel Divinity|Aura of Hate|Supernatural Resistance|Dread Lord'},
    Ranger:{Hunter:'Hunter’s Prey|Defensive Tactics|Multiattack|Superior Hunter’s Defense','Beast Master':'Ranger’s Companion|Exceptional Training|Bestial Fury|Share Spells','Gloom Stalker':'Dread Ambusher / Umbral Sight|Iron Mind|Stalker’s Flurry|Shadowy Dodge','Horizon Walker':'Detect Portal / Planar Warrior|Ethereal Step|Distant Strike|Spectral Defense','Monster Slayer':'Hunter’s Sense / Slayer’s Prey|Supernatural Defense|Magic-User’s Nemesis|Slayer’s Counter','Fey Wanderer':'Dreadful Strikes / Otherworldly Glamour|Beguiling Twist|Fey Reinforcements|Misty Wanderer',Swarmkeeper:'Gathered Swarm / Swarmkeeper Magic|Writhing Tide|Mighty Swarm|Swarming Dispersal',Drakewarden:'Draconic Gift / Drake Companion|Bond of Fang and Scale|Drake’s Breath|Perfected Bond'},
    Rogue:{Thief:'Fast Hands / Second-Story Work|Supreme Sneak|Use Magic Device|Thief’s Reflexes',Assassin:'Bonus Proficiencies / Assassinate|Infiltration Expertise|Impostor|Death Strike','Arcane Trickster':'Spellcasting / Mage Hand Legerdemain|Magical Ambush|Versatile Trickster|Spell Thief',Inquisitive:'Ear for Deceit / Eye for Detail / Insightful Fighting|Steady Eye|Unerring Eye|Eye for Weakness',Mastermind:'Master of Intrigue / Master of Tactics|Insightful Manipulator|Misdirection|Soul of Deceit',Scout:'Skirmisher / Survivalist|Superior Mobility|Ambush Master|Sudden Strike',Swashbuckler:'Fancy Footwork / Rakish Audacity|Panache|Elegant Maneuver|Master Duelist',Phantom:'Whispers of the Dead / Wails from the Grave|Tokens of the Departed|Ghost Walk|Death’s Friend',Soulknife:'Psionic Power / Psychic Blades|Soul Blades|Psychic Veil|Rend Mind'},
    Sorcerer:{Draconic:'Dragon Ancestor / Draconic Resilience|Elemental Affinity|Dragon Wings|Draconic Presence','Wild Magic':'Wild Magic Surge / Tides of Chaos|Bend Luck|Controlled Chaos|Spell Bombardment','Divine Soul':'Divine Magic / Favored by the Gods|Empowered Healing|Otherworldly Wings|Unearthly Recovery',Shadow:'Eyes of the Dark / Strength of the Grave|Hound of Ill Omen|Shadow Walk|Umbral Form',Storm:'Wind Speaker / Tempestuous Magic|Heart of the Storm / Storm Guide|Storm’s Fury|Wind Soul','Aberrant Mind':'Psionic Spells / Telepathic Speech|Psionic Sorcery / Psychic Defenses|Revelation in Flesh|Warping Implosion','Clockwork Soul':'Clockwork Magic / Restore Balance|Bastion of Law|Trance of Order|Clockwork Cavalcade',Lunar:'Lunar Embodiment / Moon Fire|Lunar Boons|Waxing and Waning|Lunar Phenomenon'},
    Warlock:{Archfey:'Fey Presence|Misty Escape|Beguiling Defenses|Dark Delirium',Fiend:'Dark One’s Blessing|Dark One’s Own Luck|Fiendish Resilience|Hurl Through Hell','Great Old One':'Awakened Mind|Entropic Ward|Thought Shield|Create Thrall',Celestial:'Bonus Cantrips / Healing Light|Radiant Soul|Celestial Resilience|Searing Vengeance',Hexblade:'Expanded Spells / Hexblade’s Curse / Hex Warrior|Accursed Specter|Armor of Hexes|Master of Hexes',Fathomless:'Tentacle of the Deeps / Gift of the Sea|Oceanic Soul / Guardian Coil|Grasping Tentacles|Fathomless Plunge',Genie:'Genie’s Vessel / Genie’s Wrath|Elemental Gift|Sanctuary Vessel|Limited Wish',Undead:'Form of Dread|Grave Touched|Mortal Husk|Spirit Projection'},
    Wizard:{Abjuration:'Abjuration Savant / Arcane Ward|Projected Ward|Improved Abjuration|Spell Resistance',Conjuration:'Conjuration Savant / Minor Conjuration|Benign Transposition|Focused Conjuration|Durable Summons',Divination:'Divination Savant / Portent|Expert Divination|The Third Eye|Greater Portent',Enchantment:'Enchantment Savant / Hypnotic Gaze|Instinctive Charm|Split Enchantment|Alter Memories',Evocation:'Evocation Savant / Sculpt Spells|Potent Cantrip|Empowered Evocation|Overchannel',Illusion:'Illusion Savant / Improved Minor Illusion|Malleable Illusions|Illusory Self|Illusory Reality',Necromancy:'Necromancy Savant / Grim Harvest|Undead Thralls|Inured to Undeath|Command Undead',Transmutation:'Transmutation Savant / Minor Alchemy|Transmuter’s Stone|Shapechanger|Master Transmuter',Bladesinging:'Training in War and Song / Bladesong|Extra Attack|Song of Defense|Song of Victory','War Magic':'Arcane Deflection / Tactical Wit|Power Surge|Durable Magic|Deflecting Shroud',Chronurgy:'Chronal Shift / Temporal Awareness|Momentary Stasis|Arcane Abeyance|Convergent Future',Graviturgy:'Adjust Density|Gravity Well|Violent Attraction|Event Horizon',Scribes:'Wizardly Quill / Awakened Spellbook|Manifest Mind|Master Scrivener|One with the Word'},
    Artificer:{Alchemist:'Tool Proficiency / Alchemist Spells / Experimental Elixir|Alchemical Savant|Restorative Reagents|Chemical Mastery',Artillerist:'Tool Proficiency / Artillerist Spells / Eldritch Cannon|Arcane Firearm|Explosive Cannon|Fortified Position','Battle Smith':'Tool Proficiency / Battle Smith Spells / Battle Ready / Steel Defender|Extra Attack|Arcane Jolt|Improved Defender',Armorer:'Tools of the Trade / Armorer Spells / Arcane Armor / Armor Model|Extra Attack|Armor Modifications|Perfected Armor'}
  };

  const subclassLevels={Barbarian:[3,6,10,14],Bard:[3,6,14],Druid:[2,6,10,14],Fighter:[3,7,10,15,18],Monk:[3,6,11,17],Paladin:[3,7,15,20],Ranger:[3,7,11,15],Rogue:[3,9,13,17],Sorcerer:[1,6,14,18],Warlock:[1,6,10,14],Wizard:[2,6,10,14],Artificer:[3,5,9,15]};
  const subclassRules={};
  for(const [className,entries] of Object.entries(subclassSpecs)){
    subclassRules[className]={};
    for(const [name,text] of Object.entries(entries)){
      const names=text.split('|'),levels=subclassLevels[className]||[];
      subclassRules[className][name]=Object.freeze(names.map((featureName,index)=>Object.freeze({level:levels[index]??levels.at(-1)??3,name:featureName})));
    }
    Object.freeze(subclassRules[className]);
  }

  const fullSlots=[
    [],[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],
    [4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],
    [4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
  ];
  const halfSlots=[[],[],[2],[3],[3],[4,2],[4,2],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2]];
  const artificerSlots=[[],[2],[2],[3],[3],[4,2],[4,2],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2]];
  const values=(...rows)=>Object.freeze(rows);
  const spellcasting=Object.freeze({
    Bard:{ability:'CHA',mode:'known',slots:fullSlots,cantrips:values(0,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4),known:values(0,4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22)},
    Cleric:{ability:'WIS',mode:'prepared',slots:fullSlots,cantrips:values(0,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5),formula:'level+mod'},
    Druid:{ability:'WIS',mode:'prepared',slots:fullSlots,cantrips:values(0,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4),formula:'level+mod'},
    Paladin:{ability:'CHA',mode:'prepared',slots:halfSlots,cantrips:values(...Array(21).fill(0)),formula:'half+mod'},
    Ranger:{ability:'WIS',mode:'known',slots:halfSlots,cantrips:values(...Array(21).fill(0)),known:values(0,0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11)},
    Sorcerer:{ability:'CHA',mode:'known',slots:fullSlots,cantrips:values(0,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6),known:values(0,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15)},
    Warlock:{ability:'CHA',mode:'pact',cantrips:values(0,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4),known:values(0,2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15),pactSlots:values(0,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4),pactLevel:values(0,1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5)},
    Wizard:{ability:'INT',mode:'spellbook',slots:fullSlots,cantrips:values(0,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5),formula:'level+mod'},
    Artificer:{ability:'INT',mode:'prepared',slots:artificerSlots,cantrips:values(0,2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4,4,4,4,4),formula:'half+mod'}
  });

  const artificerSpellNames=Object.freeze([
    'Acid Splash','Dancing Lights','Fire Bolt','Guidance','Light','Mage Hand','Mending','Message','Poison Spray','Prestidigitation','Produce Flame','Ray of Frost','Resistance','Shocking Grasp','Spare the Dying','Thorn Whip',
    'Alarm','Cure Wounds','Detect Magic','Disguise Self','Expeditious Retreat','Faerie Fire','False Life','Feather Fall','Grease','Identify','Jump','Longstrider','Purify Food and Drink','Sanctuary',
    'Aid','Alter Self','Arcane Lock','Blur','Continual Flame','Darkvision','Enhance Ability','Enlarge/Reduce','Heat Metal','Invisibility','Lesser Restoration','Levitate','Magic Mouth','Magic Weapon','Protection from Poison','Rope Trick','See Invisibility','Spider Climb','Web',
    'Blink','Create Food and Water','Dispel Magic','Elemental Weapon','Flame Arrows','Fly','Glyph of Warding','Haste','Protection from Energy','Revivify','Water Breathing','Water Walk',
    'Arcane Eye','Elemental Bane','Fabricate','Freedom of Movement','Secret Chest','Faithful Hound','Private Sanctum','Resilient Sphere','Stone Shape','Stoneskin',
    'Animate Objects','Arcane Hand','Creation','Greater Restoration','Wall of Stone'
  ]);

  root.V53_ABILITIES=abilities;
  root.V53_POINT_BUY=Object.freeze({8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9});
  root.V53_SPECIES=Object.freeze(speciesRules);
  root.V53_CLASSES=Object.freeze(classRules);
  root.V53_SUBCLASS_FEATURES=Object.freeze(subclassRules);
  root.V53_SUBCLASS_LEVELS=Object.freeze(subclassLevels);
  root.V53_SPELLCASTING=spellcasting;
  root.V53_ARTIFICER_SPELL_NAMES=artificerSpellNames;
  root.V53_META=Object.freeze({version:53,edition:'2014 legacy 5e',species:Object.keys(speciesRules).length,subspecies:Object.values(speciesRules).reduce((sum,row)=>sum+Object.keys(row.subs||{}).length,0),classes:Object.keys(classRules).length,subclasses:Object.values(subclassRules).reduce((sum,row)=>sum+Object.keys(row).length,0)+Object.keys(root.V52_CLERIC_DOMAINS||{}).length});
})(typeof window!=='undefined'?window:globalThis);
