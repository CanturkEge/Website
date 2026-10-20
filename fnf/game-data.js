/* FNF content catalog. Change names and descriptions here; rule validation stays in SQL. */
(() => {
'use strict';
  const species = [
    {id:'human',name:'İnsan',icon:'◇',desc:'İnsanlar anlaşmayı ve uyumu öğrenir.',stat:'presence',training:'diplomacy'},
    {id:'elf',name:'Elf',icon:'✧',desc:'Canlıların izlerini sezerek okur.',stat:'insight',training:'botany'},
    {id:'dwarf',name:'Cüce',icon:'◆',desc:'Toprağı ve işlenmiş malzemeyi tanır.',stat:'endurance',training:'craft'},
    {id:'orc',name:'Ork',icon:'◈',desc:'Zor şartlarda ayakta kalır.',stat:'power',training:'defense'},
    {id:'dragonborn',name:'Ejderdoğan',icon:'✦',desc:'Eski yolların işaretlerini bulur.',stat:'intellect',training:'exploration'},
    {id:'halfling',name:'Buçukluk',icon:'❖',desc:'Canlılarla güven kurar.',stat:'agility',training:'husbandry'}
  ];
  const classes = [
    {id:'nature',name:'Doğa Bilimleri',icon:'✳',desc:'Canlıları ve gizemli maddeleri anla.',pool:['botany','husbandry','craft','research','exploration'],specialties:[['healer','Şifacı','Şifalı otlar ve iyileştirme','botany'],['alchemist','Simyacı','Büyülü nesneler ve dönüşüm','research'],['artisan','Üretici','Gıda, içki ve işleme','craft']]},
    {id:'villager',name:'Köylü',icon:'❀',desc:'Toprağı, bahçeyi ve hayvanları büyüt.',pool:['botany','husbandry','craft','diplomacy','exploration'],specialties:[['herder','Hayvancı','Sürülerin bakımı ve yetiştirme','husbandry'],['farmer','Çiftçi','Tarlalar ve ekin verimi','botany'],['gardener','Bahçeci','Ağaçlar ve bahçe bitkileri','botany']]},
    {id:'physical',name:'Fiziksel',icon:'✥',desc:'Sınırları araştır, yerleşimi koru.',pool:['defense','exploration','craft','husbandry','diplomacy'],specialties:[['warrior','Savaşçı','Yerleşim savunması','defense'],['miner','Madenci','Yer altı kaynakları','craft'],['explorer','Kaşif','Yeni bölgeler ve izler','exploration']]},
    {id:'engineering',name:'Mühendislik',icon:'⌁',desc:'Yapılar, deneyler ve bilgiyle ilerle.',pool:['engineering','research','craft','botany','defense'],specialties:[['builder','Yapı Ustası','Sağlam binalar ve inşaat','engineering'],['chemist','Kimyager','Gübre, barut ve maddeler','research'],['researcher','Araştırmacı','Keşifleri çözümleme','research']]}
  ];
  const abilities = [
    ['power','Güç','Bedensel kuvvet'],['agility','Çeviklik','El becerisi ve hız'],
    ['endurance','Dayanıklılık','Zorlu koşullara direnç'],['intellect','Akıl','Bilgi ve çözümleme'],
    ['insight','Sezgi','Gözlem ve canlılarla bağ'],['presence','Etki','İfade ve ikna']
  ];
  const skills = [
    ['botany','Botanik','Bitki ve toprak bilgisi','insight'],['husbandry','Hayvancılık','Bakım ve yetiştirme','insight'],
    ['craft','Zanaat','Üretim ve işleme','agility'],['engineering','Mühendislik','Yapı ve onarım','intellect'],
    ['research','Araştırma','Bilinmeyeni çözme','intellect'],['exploration','Keşif','Yeni yerleri gözleme','insight'],
    ['defense','Savunma','Tehlikeyle baş etme','power'],['diplomacy','Diplomasi','Yolcularla anlaşma','presence']
  ];
  const titles = {overview:'Günün Akışı',settlement:'Yerleşim',livestock:'Ahır',market:'Pazar & Han',research:'Araştırma',people:'Yerleşim Halkı',character:'Karakterim',farming:'Tarlalar',codex:'Ansiklopedi',exploration:'Keşif',patchnotes:'Sürüm Notları'};
  window.FNF_DATA = Object.freeze({species,classes,abilities,skills,titles});
})();
