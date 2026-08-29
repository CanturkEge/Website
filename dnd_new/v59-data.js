/* v59: additional ready creatures, tactical props and encounter maps. */
(function(){
  const families=[
    ['Bat','Yarasa',3,12,30,'Uçuş; Echolocation'],['Rat','Sıçan',3,10,20,'Keen Smell'],['Boar','Yaban Domuzu',11,11,40,'Charge'],['Bear','Ayı',34,12,40,'Multiattack'],['Panther','Panter',13,12,50,'Pounce'],
    ['Spider','Örümcek',12,13,30,'Web Walker'],['Serpent','Yılan',11,13,30,'Poison Bite'],['Slime','Balçık',18,8,20,'Amorphous'],['Goblin','Goblin',9,14,30,'Nimble Escape'],['Kobold','Kobold',7,12,30,'Pack Tactics'],
    ['Orc','Ork',18,13,30,'Aggressive'],['Gnoll','Gnoll',22,14,30,'Rampage'],['Bandit','Haydut',14,12,30,'Dirty Fighting'],['Cultist','Kültist',16,12,30,'Dark Devotion'],['Skeleton','İskelet',18,13,30,'Undead'],
    ['Zombie','Zombi',28,9,20,'Undead Fortitude'],['Ghoul','Gulyabani',26,12,30,'Paralyzing Claws'],['Elemental','Elemental',35,14,40,'Elemental Form'],['Golem','Golem',45,16,25,'Immutable Form'],['Drake','Ejdercik',38,15,40,'Breath Weapon'],
    ['Harpy','Harpi',32,13,40,'Luring Song'],['Worg','Worg',30,13,50,'Knock Prone'],['Ogre','Ogre',58,11,40,'Heavy Swing'],['Troll','Trol',76,15,30,'Regeneration'],['Wraith','Hortlak',48,14,40,'Life Drain']
  ];
  const ranks=[['İzci',.65,-1,0,'Hızlı'],['Avcı',.9,0,0,'Takipçi'],['Kıdemli',1.2,1,0,'Tecrübeli'],['Reis',1.6,2,10,'Lider']];
  window.V59_MONSTERS=[];
  families.forEach((f,fi)=>ranks.forEach((r,ri)=>window.V59_MONSTERS.push({
    id:`v59-monster-${fi+1}-${ri+1}`,name:`${r[0]} ${f[1]}`,hp:Math.max(3,Math.round(f[2]*r[1]+r[3])),maxHp:Math.max(3,Math.round(f[2]*r[1]+r[3])),ac:Math.max(8,f[3]+r[2]),speed:f[4],cr:['1/8','1/4','1/2','2'][ri],category:f[0],note:`${f[5]} • ${r[4]}`
  })));

  window.V59_PROP_DEFS={
    pit:{label:'Çukur',icon:'◯',w:2,h:2,difficult:true,kind:'hazard'},web:{label:'Örümcek Ağı',icon:'⌘',w:2,h:2,difficult:true,kind:'hazard'},spikes:{label:'Diken Tuzağı',icon:'⋀',w:2,h:1,difficult:true,kind:'hazard'},
    boulder:{label:'Yuvarlak Taş',icon:'●',w:1,h:1,blocksMove:true,blocksVision:true,kind:'nature'},stalagmite:{label:'Dikilitaş',icon:'▲',w:1,h:1,blocksMove:true,blocksVision:true,kind:'nature'},log:{label:'Devrik Kütük',icon:'▬',w:3,h:1,blocksMove:true,cover:'half',kind:'nature'},
    altar:{label:'Sunak',icon:'♰',w:2,h:1,blocksMove:true,cover:'half',kind:'ruin'},statue:{label:'Heykel',icon:'♟',w:1,h:1,blocksMove:true,blocksVision:true,kind:'ruin'},bones:{label:'Kemik Yığını',icon:'☠',w:2,h:1,difficult:true,kind:'ruin'},
    acid:{label:'Asit Birikintisi',icon:'≈',w:2,h:2,difficult:true,kind:'hazard'},lava:{label:'Lav',icon:'≋',w:3,h:2,blocksMove:true,light:3,kind:'hazard'},ice:{label:'Kaygan Buz',icon:'◇',w:3,h:2,difficult:true,kind:'hazard'},
    table:{label:'Masa',icon:'▭',w:2,h:1,blocksMove:true,cover:'half',kind:'object'},barrel:{label:'Fıçı',icon:'◍',w:1,h:1,blocksMove:true,cover:'half',kind:'object'},cart:{label:'Araba',icon:'▣',w:3,h:2,blocksMove:true,cover:'three-quarters',kind:'object'},
    ropebridge:{label:'Halat Köprü',icon:'═',w:4,h:1,difficult:true,kind:'structure'},stairs:{label:'Merdiven',icon:'▥',w:2,h:2,difficult:true,kind:'structure'},smoke:{label:'Yoğun Duman',icon:'☁',w:3,h:3,difficult:true,blocksVision:true,kind:'hazard'}
  };

  const names=['Orman Pususu','Bataklık Geçidi','Terk Edilmiş Maden','Örümcek Yuvası','Köy Meydanı','Han Baskını','Liman Deposu','Korsan Güvertesi','Buz Mağarası','Lav Yarığı','Mezarlık','Karanlık Tapınak','Kanalizasyon','Dağ Geçidi','Kervan Pususu','Haydut Kampı','Goblin Tüneli','Kobold Tuzakhanesi','Yıkık Kule','Saray Salonu','Zindan Hücreleri','Gizli Laboratuvar','Büyücü Kulesi','Mantar Mağarası','Kadim Sunak','Çökmüş Köprü','Nehir Geçişi','Sahil Mağarası','Çöl Harabesi','Vaha Kampı','Kar Fırtınası','Sisli Koruluk','Avcı Kulübesi','Çiftlik Savunması','Şehir Kapısı','Pazar Yeri','Arena','Yeraltı Gölü','Kristal Mağara','Ejder İni','Nekromant Odası','Dev Mutfağı','Trol Köprüsü','Gnoll Kampı'];
  const themes=['forest','plain','ruins','crypt','camp','bridge','courtyard'];
  const props=['tree','rock','rubble','wall','column','pit','web','boulder','bones','barrel','table','smoke','spikes','stalagmite','log','altar','statue','acid','ice'];
  window.V59_BATTLE_PRESETS={};
  names.forEach((name,index)=>{let cols=18+(index%5)*2,rows=12+(index%3)*2,a=props[index%props.length],b=props[(index*3+5)%props.length];window.V59_BATTLE_PRESETS[`v59-${index+1}`]={name,desc:'Hızlı kurulabilen hazır taktik alan.',cols,rows,theme:themes[index%themes.length],lighting:index%7===2?'dark':index%5===1?'dim':'bright',props:[[a,3,3],[a,cols-6,rows-5],[b,Math.floor(cols/2)-1,Math.floor(rows/2)],[b,6,rows-4],['startPlayer',2,rows-3],['startEnemy',cols-5,1]]}});
})();
