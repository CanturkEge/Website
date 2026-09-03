/* v66: usable spell focuses, class caster gear and priced spell materials. */
((root)=>{
  'use strict';
  const rows=[
    ['shield-holy-emblem','Kalkana İşlenen Kutsal Sembol','temple',1,1000,10,'Cleric ve Paladin','shield','Kalkan kuşanılıyken somatic eli boşaltmadan kutsal odak olarak kullanılabilir.'],
    ['amulet-holy-focus','Gümüş Kutsal Muska','temple',1,500,12,'Cleric ve Paladin','neck','Boyunda taşınan kutsal sembol; GP bedeli olmayan M bileşenlerinin yerini tutar.'],
    ['reliquary-holy-focus','Kutsal Emanet Kutusu','temple',2,7500,5,'Cleric ve Paladin','focus','Kutsal odak. Turn Undead ve Channel Divinity sırasında görünür biçimde tutulur.'],
    ['wizard-oak-staff','Rünlü Meşe Asa +1','arcane',2,18000,4,'Wizard','focus','Kuşanıldığında Wizard Spell Attack ve Spell Save DC +1.'],
    ['sorcerer-crystal-focus','Rezonans Kristali +1','arcane',2,18000,4,'Sorcerer','focus','Kuşanıldığında Sorcerer Spell Attack ve Spell Save DC +1.'],
    ['warlock-obsidian-rod','Obsidyen Pact Değneği +1','arcane',2,18000,4,'Warlock','focus','Kuşanıldığında Warlock Spell Attack ve Spell Save DC +1.'],
    ['druid-mistletoe-focus','Canlı Ökseotu Odağı +1','general',2,16000,4,'Druid','focus','Kuşanıldığında Druid Spell Attack ve Spell Save DC +1.'],
    ['bard-resonant-lute','Rezonanslı Lavta +1','arcane',2,17000,4,'Bard','focus','Kuşanıldığında Bard Spell Attack ve Spell Save DC +1.'],
    ['cleric-vestment-mercy','Merhamet Ayin Cübbesi','temple',2,22000,3,'Cleric','body','Kuşanıldığında concentration save +1; Life Domain şifa zarına tur başına bir kez +1.'],
    ['wizard-cloak-runes','Rün Dokumalı Pelerin','arcane',2,24000,3,'Wizard','back','Arcana check +2; günde bir kez concentration save yeniden atılabilir.'],
    ['sorcerer-cloak-embers','Kor Pelerini','arcane',2,24000,3,'Sorcerer','back','Bir Metamagic kullanımından sonra proficiency bonusu kadar geçici HP (1/short rest).'],
    ['warlock-cloak-whispers','Fısıltı Pelerini','arcane',2,24000,3,'Warlock','back','Patron büyüsü kullanıldığında bir tur Stealth +2 (1/short rest).'],
    ['paladin-prayer-beads','Yemin Dua Taneleri','temple',2,15000,4,'Paladin','neck','Kutsal odak; Lay on Hands hedefinde Medicine check gerekmez.'],
    ['diamond-300','300 GP Elmas Paketi','temple',3,30000,4,'Tümü','component','Revivify gibi 300 GP tüketilen materyal isteyen büyüler için.'],
    ['diamond-500','500 GP Elmas','temple',3,50000,3,'Tümü','component','Raise Dead gibi 500 GP değer şartı olan büyüler için.'],
    ['diamond-1000','1.000 GP Elmas','temple',3,100000,2,'Tümü','component','Resurrection ve benzeri pahalı ilahi büyüler için.'],
    ['ivory-strips-50','50 GP Fildişi Şeritleri','arcane',2,5000,5,'Tümü','component','Legend Lore ve benzeri yazılı bedelli materyaller için.'],
    ['jade-dust-10','10 GP Yeşim Tozu','arcane',1,1000,8,'Tümü','component','Magic Mouth gibi tüketilen materyaller için.'],
    ['holy-water-silver-25','25 GP Kutsal Su ve Gümüş','temple',1,2500,8,'Tümü','component','Protection from Evil and Good gibi tüketilen materyaller için.']
  ];
  const focusTypes={
    'shield-holy-emblem':'divine','amulet-holy-focus':'divine','reliquary-holy-focus':'divine','paladin-prayer-beads':'divine',
    'wizard-oak-staff':'arcane','sorcerer-crystal-focus':'arcane','warlock-obsidian-rod':'arcane','druid-mistletoe-focus':'druidic','bard-resonant-lute':'instrument'
  };
  const items=rows.map(r=>Object.freeze({id:`ex-v66-${r[0]}`,name:r[1],shop:r[2],tier:r[3],priceCopper:r[4],stock:r[5],classRestriction:r[6]==='Tümü'?[]:r[6].split(' ve '),slot:r[7],category:r[7]==='component'?'component':r[7]==='back'||r[7]==='body'||r[7]==='neck'?'accessory':'focus',focusType:focusTypes[r[0]]||null,magicBonus:/\+1/.test(r[1])?1:0,effect:r[8],note:`${r[6]} için ${r[7]==='component'?'büyü materyali':'büyü ekipmanı'}.`,active:true,ready:true,release:'v66',attunement:/\+1|Pelerin|Cübbesi/.test(r[1])}));
  root.V66_CASTER_MARKET=Object.freeze(items);
  if(Array.isArray(root.EX_ALL_CATALOG))root.EX_ALL_CATALOG.push(...items);
})(typeof window!=='undefined'?window:globalThis);
