/* v63: caster gear, spellbooks, holy relics and runed equipment. */
((root)=>{
  'use strict';

  const baseBuild=root.V48_BUILD_LOOT;
  if(typeof baseBuild!=='function')throw new Error('v63 requires v48-data.js before v63-data.js');

  const casterClasses=['Artificer','Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Warlock','Wizard'];
  const rarityMeta={
    common:{minLevel:1,valueCopper:180},uncommon:{minLevel:2,valueCopper:900},rare:{minLevel:4,valueCopper:4200},
    veryRare:{minLevel:7,valueCopper:18000},legendary:{minLevel:10,valueCopper:85000}
  };
  const pack=[];
  const push=item=>{
    const meta=rarityMeta[item.rarity]||rarityMeta.uncommon;
    pack.push({size:'small',qtyMax:1,minLevel:meta.minLevel,valueCopper:meta.valueCopper,release:'v63',attunement:false,...item,themes:[...new Set(['mixed',...(item.themes||[])])]});
  };

  const schools=[
    ['Abjurasyon','koruma rünleri','Bir abjuration büyüsü için yaptığın ilk concentration save’ine +1d4 ekleyebilirsin.','Reaction ile 1/long rest, gördüğün bir müttefikin büyüye karşı save’ine +2 verirsin.',['arcane','sacred']],
    ['Çağırma','gümüş kapı çizimleri','Bir conjuration büyüsünü kitaba kopyalama süresini yüzde 25 azaltır.','1/long rest, conjuration ile oluşturduğun veya çağırdığın bir varlığın geçici HP’sine proficiency bonusunu eklersin.',['arcane']],
    ['Kehanet','yıldız cetvelleri','Divination büyüsüyle yapılan tek bir Arcana veya Investigation check’ine +1d4 verir.','1/long rest, d20 atmadan önce sonucu sezersin; kendi ability check’ine avantaj alırsın.',['arcane','noble']],
    ['Büyüleme','hipnotik kenar yazıları','Bir enchantment büyüsünün etkisini açıklamak için yapılan Arcana check’ine +2 verir.','1/long rest, enchantment büyüne karşı ilk başarılı save’i yeniden attırırsın; ikinci sonuç kullanılır.',['arcane','noble']],
    ['Evokasyon','element denklemleri','Evocation hasar zarındaki bir adet 1 sonucunu bir kez 2 kabul edebilirsin.','1/long rest, bir evocation büyüsünün tek hasar zarını yeniden atarsın; yeni sonuç kullanılır.',['arcane','elemental']],
    ['İllüzyon','hareketli mürekkep','İllüzyonunu inceleyen ilk Investigation check’inin DC’sine +1 ekler.','1/long rest, illüzyon büyünün süresini concentration gerektirmiyorsa iki katına çıkarırsın; en fazla 1 saat.',['arcane','rogue']],
    ['Nekromansi','kemik beyazı sayfalar','Necromancy büyüsünü tanımak için yapılan Arcana check’ine +2 verir.','1/long rest, necromancy büyün hasar verdiğinde proficiency bonusun kadar geçici HP kazanırsın.',['arcane','cursed']],
    ['Dönüşüm','bakır geometriler','Transmutation büyüsüyle değiştirilmiş maddeyi inceleme check’ine +2 verir.','1/long rest, transmutation büyüsü alan gönüllü hedefin hızını bir tur 10 ft artırırsın.',['arcane','nature']]
  ];
  for(const [school,mark,apprentice,master,themes] of schools){
    push({name:`${school} Çırak Büyü Kitabı`,category:'document',themes,rarity:'common',lootKind:'spellbook',classRestriction:['Wizard'],effect:`Wizard büyülerini kaydetmek için 80 sayfalık kitaptır; ${mark} taşır. ${apprentice}`,note:`Wizard • ${school} çalışma kitabı • Attunement gerekmez.`});
    push({name:`${school} Usta Grimoire’i`,category:'focus',slot:'focus',themes,rarity:'rare',lootKind:'spellbook',classRestriction:['Wizard'],attunement:true,magicBonus:1,effect:`Wizard için büyü odağıdır; kuşanıldığında Spell Attack ve Spell Save DC’ye +1 verir. ${master}`,activation:'Büyü sırasında / belirtilen kullanım',uses:'1/long rest özel güç'});
  }

  const classSets=[
    ['Artificer',['Ustanın Rünlü Tornavidası','İnfüzyon Çekici','Eterik Kalibrasyon Asası','Yaşayan Atölye Eldiveni'],['arcane','alchemy'],'Bir tool veya crafting check’ine +1d4','Bir infüzyonlu eşyanın kullanıcısına proficiency kadar geçici HP'],
    ['Bard',['Gümüş Akort Çatalı','İlham Liri','Rezonans Şef Asası','Dokuz Ezginin Tacı'],['arcane','noble'],'Bir Performance check’ine +1d4','Bardic Inspiration alan hedefe ayrıca 2 geçici HP'],
    ['Cleric',['Gezgin Rahip Sembolü','Dua Boncuklu Madalyon','İlahi Nöbet Asası','Duaların Tacı'],['sacred'],'Bir Religion veya Medicine check’ine +1d4','İyileştirme büyüsünün tek zarındaki 1 sonucunu yeniden atma'],
    ['Druid',['Meşe Filizi Totemi','Ay Çemberi Kolyesi','Kadim Koru Asası','Mevsimler Tacı'],['nature','arcane'],'Bir Nature veya Animal Handling check’ine +1d4','Büyüyle iyileşen hedefin hızını bir tur 5 ft artırma'],
    ['Paladin',['Yemin Mührü','Adanmışlık Madalyonu','Işıklı Muhafız Asası','Kutsal Yemin Tacı'],['sacred','martial'],'Bir Persuasion veya Religion check’ine +1d4','Lay on Hands alan hedefe bir tur frightened save avantajı'],
    ['Ranger',['İz Rünü Pusulası','Yaban Gözcüsü Broşu','Uzak Yol Asası','Ufuk Avcısı Başlığı'],['nature','martial'],'Bir Survival veya Perception check’ine +1d4','Hunter’s Mark hedefini izleme check’ine avantaj'],
    ['Sorcerer',['Ham Büyü Kristali','Soy Yankısı Kolyesi','Kaos Damarı Asası','İlk Kıvılcım Tacı'],['arcane','elemental'],'Bir Arcana veya Intimidation check’ine +1d4','Metamagic kullandığın büyünün tek hasar zarındaki 1’i yeniden atma'],
    ['Warlock',['Fısıldayan Pact Taşı','Patronun Mühür Yüzüğü','Uçurum Bağı Asası','Yasak Ahit Tacı'],['arcane','cursed'],'Bir Arcana veya Deception check’ine +1d4','Pact büyüsüyle geçici HP kazandığında proficiency kadar artırma'],
    ['Wizard',['Cep Formül Defteri','Arkanist Merceği','Sekiz Okul Asası','Başbüyücü Tacı'],['arcane'],'Bir Arcana veya Investigation check’ine +1d4','Hazırlanmış bir büyüyü tanıma veya kopyalama check’ine avantaj']
  ];
  for(const [className,names,themes,utility,signature] of classSets){
    push({name:names[0],category:'focus',slot:'focus',themes,rarity:'common',lootKind:'casterGear',classRestriction:[className],effect:`${className} için büyü odağı olarak kullanılabilir. 1/long rest ${utility.toLocaleLowerCase('tr-TR')} verir.`,activation:'Zar öncesi',uses:'1/long rest'});
    push({name:names[1],category:'accessory',slot:names[1].includes('Yüzük')?'ring':names[1].includes('Broş')?'brooch':'neck',themes,rarity:'uncommon',lootKind:'casterGear',classRestriction:[className],attunement:true,effect:`Yalnız ${className} attunement edebilir. 1/long rest: ${signature}.`,activation:'Tetiklendiğinde',uses:'1/long rest'});
    push({name:names[2],category:'focus',slot:'focus',themes,rarity:'rare',lootKind:'casterGear',classRestriction:[className],attunement:true,magicBonus:1,effect:`Yalnız ${className} için büyü odağıdır. Kuşanıldığında Spell Attack ve Spell Save DC’ye +1 verir.`,activation:'Pasif',uses:'Attunement boyunca'});
    push({name:names[3],category:'accessory',slot:'head',themes,rarity:'veryRare',lootKind:'casterGear',classRestriction:[className],attunement:true,saveBonus:1,effect:`Yalnız ${className} attunement edebilir. Saving throw’lara +1; ayrıca 1/long rest ${signature.toLocaleLowerCase('tr-TR')}.`,activation:'Pasif / tetiklendiğinde',uses:'1/long rest özel güç'});
  }

  const runes=[
    ['Alev','fire','Her tur ilk fire hasar zarındaki bir adet 1 sonucunu 2 kabul edersin.','Reaction ile aldığın fire hasarını 1d8 azaltırsın.',['elemental']],
    ['Ayaz','cold','Cold hasarı verdiğin bir hedefin hızını bir tur 5 ft azaltırsın.','Reaction ile aldığın cold hasarını 1d8 azaltırsın.',['elemental']],
    ['Fırtına','lightning veya thunder','Lightning veya thunder büyüsü sonrası 5 ft fırsat saldırısı çekmeden yürürsün.','Reaction ile aldığın lightning/thunder hasarını 1d8 azaltırsın.',['elemental']],
    ['Taş','force','Concentration save’inde günde 1 kez +1d4 alırsın.','Reaction ile düşme veya bludgeoning hasarını 1d8 azaltırsın.',['elemental','nature']],
    ['Şafak','radiant','Radiant büyüyle iyileştirdiğin veya hasar verdiğin ilk hedef 5 ft soluk ışık saçar.','Reaction ile aldığın necrotic hasarını 1d8 azaltırsın.',['sacred']],
    ['Gölge','necrotic','Necrotic büyü kullandıktan sonra bir tur loş ışıkta Stealth’e +2 alırsın.','Reaction ile aldığın radiant hasarını 1d8 azaltırsın.',['cursed','rogue']],
    ['Zihin','psychic','Psychic büyüne karşı ilk concentration save’ini zorlaştırmak için DC’ye +1 eklersin.','Reaction ile aldığın psychic hasarını 1d8 azaltırsın.',['arcane']],
    ['Yaşam','healing','Her long restte ilk iyileştirme büyünün bir zarındaki 1’i yeniden atarsın.','Reaction ile 0 HP’ye düşen 30 ft hedefe 1 geçici HP verirsin; hedef hâlâ unconscious kalır ama death save’e +1 alır.',['sacred','nature']],
    ['Koruma','abjuration','Bir abjuration büyüsü kullandığında bir tur AC’ye +1 alırsın.','Reaction ile gördüğün saldırıya karşı AC’ni +2 artırırsın.',['arcane','sacred']],
    ['Geçit','conjuration','Teleport olduktan sonraki ilk 5 ft hareketin difficult terrain sayılmaz.','Reaction ile zorla itilme veya çekilme mesafeni 10 ft azaltırsın.',['arcane']]
  ];
  for(const [rune,kind,passive,reaction,themes] of runes){
    push({name:`${rune} Rünlü Yüzük`,category:'accessory',slot:'ring',themes,rarity:'uncommon',lootKind:'runedGear',attunement:true,effect:`${rune} rünü taşır. ${passive}`,activation:'Pasif',uses:'Açıklamadaki sınır'});
    push({name:`${rune} Rünlü Bileklik`,category:'accessory',slot:'wrist',themes,rarity:'rare',lootKind:'runedGear',attunement:true,effect:`${reaction}`,activation:'Reaction',uses:'1/long rest'});
    push({name:`${rune} Rünlü Pelerin`,category:'accessory',slot:'back',themes,rarity:'rare',lootKind:'runedGear',attunement:true,saveBonus:1,effect:`Saving throw’lara +1. ${rune} temalı doğal veya büyülü izi tanımak için yapılan Arcana/Religion/Nature check’lerinden uygun olana +2 verir.`,activation:'Pasif',uses:'Attunement boyunca'});
    push({name:`${rune} Rün Odağı`,category:'focus',slot:'focus',themes,rarity:'veryRare',lootKind:'runedGear',classRestriction:casterClasses,attunement:true,magicBonus:2,effect:`Büyü kullanan classlar için odaktır. Spell Attack ve Spell Save DC’ye +2 verir. ${kind} etkili büyülerde ${passive.toLocaleLowerCase('tr-TR')}`,activation:'Pasif',uses:'Attunement boyunca'});
  }

  const relics=[
    ['Bless','Üç Yemin Boncuğu','uncommon','Bless attığında hedeflerden biri sonraki ilk saving throw’una ayrıca +1 ekler.','1/long rest'],
    ['Cure Wounds','Merhamet Eli Madalyonu','uncommon','Cure Wounds iyileştirme zarındaki bir adet 1 sonucunu yeniden atarsın.','1/long rest'],
    ['Healing Word','Uzak Dua Çanı','uncommon','Healing Word ile iyileşen hedef bir sonraki turunda ayağa kalkmak için 5 ft daha az hareket harcar.','1/long rest'],
    ['Guiding Bolt','Şafak Merceği','rare','Guiding Bolt isabet ederse hedefin saçtığı ışık bir tur 10 ft daha genişler.','1/long rest'],
    ['Sanctuary','Sığınak Mührü','rare','Sanctuary hedefi büyüyü aldıktan sonra proficiency bonusun kadar geçici HP kazanır.','1/long rest'],
    ['Shield of Faith','İnanç Tokası','rare','Shield of Faith başladığında hedef zorla itilme ve çekilmeye karşı bir tur avantaj alır.','1/long rest'],
    ['Spiritual Weapon','Ruhani Silah Kabzası','rare','Spiritual Weapon’ın ilk isabetindeki bir hasar zarını yeniden atarsın.','1/long rest'],
    ['Lesser Restoration','Arınma Kasesi','rare','Lesser Restoration kullandığın hedef ayrıca proficiency bonusun kadar geçici HP kazanır.','1/long rest'],
    ['Prayer of Healing','Toplu Dua Tespihi','rare','Prayer of Healing hedeflerinden biri iyileştirme zarlarından birini yeniden atabilir.','1/long rest'],
    ['Revivify','Son Nefes Emaneti','veryRare','Revivify ile dönen hedef ayrıca proficiency bonusun kadar geçici HP kazanır. Elmas maliyetini kaldırmaz.','1/long rest'],
    ['Spirit Guardians','Muhafız Ruh Kandili','veryRare','Spirit Guardians başladığında seçtiğin müttefiklerden biri bir tur difficult terrain etkisini görmezden gelir.','1/long rest'],
    ['Beacon of Hope','Umut Feneri','veryRare','Beacon of Hope kullandığında 30 ft içindeki bir hedef frightened durumuna karşı hemen yeni save atabilir.','1/long rest'],
    ['Death Ward','Son Kapı Anahtarı','veryRare','Death Ward tetiklendiğinde hedef ayrıca bir tur opportunity attack çekmeden 5 ft hareket edebilir.','1/long rest'],
    ['Greater Restoration','Yedi Arınma Halkası','veryRare','Greater Restoration kullandığın hedef bir sonraki saving throw’una +1d4 ekler. Materyal maliyetini kaldırmaz.','1/long rest'],
    ['Mass Cure Wounds','Kalabalığın Şifa Tacı','legendary','Mass Cure Wounds hedeflerinden birinin iyileştirme zarındaki bir adet 1’i yeniden atarsın.','1/long rest'],
    ['Raise Dead','Dönüş Mührü','legendary','Raise Dead ile dönen hedef ilk long rest’ine kadar death save’lerine +1 alır. Materyal ve ceza kurallarını kaldırmaz.','1/7 gün']
  ];
  relics.forEach(([spell,name,rarity,effect,uses],index)=>push({
    name,category:index%2?'accessory':'focus',slot:index%2?'neck':'focus',themes:['sacred'],rarity,lootKind:'holyRelic',
    classRestriction:['Cleric','Paladin'],attunement:rarity!=='uncommon',linkedSpellName:spell,effect:`${spell} ile bağlı kutsal emanet. ${effect}`,
    activation:'Bağlı büyü kullanıldığında',uses
  }));

  const staves=[
    ['Köz Damarı Asası',['arcane','elemental'],'Fire büyüsünde tek hasar zarındaki 1’i yeniden atarsın.'],
    ['Buz Çekirdeği Değneği',['arcane','elemental'],'Cold büyüsünün ilk hedefi bir tur doğal zemindeki kaymaya karşı avantaj alır.'],
    ['Gök Gürültüsü Asası',['arcane','elemental'],'Thunder büyüsü kullandığında 10 ft içindeki büyüsüz küçük alevleri söndürebilirsin.'],
    ['Yeşil Asit Değneği',['arcane','alchemy'],'Acid hasarı verdiğin nesnenin sıradan kilit veya menteşesini inceleme check’ine +2 alırsın.'],
    ['Kuvvet Prizması Asası',['arcane'],'Force hasarı verdiğinde hedef bir tur görünmez olursa konumunu 10 ft içinde sezersin.'],
    ['Gün Işığı Değneği',['sacred','arcane'],'Radiant büyü kullandıktan sonra asa 10 dakika bright light 10 ft saçar.'],
    ['Gece Yarığı Asası',['cursed','arcane'],'Necrotic büyü kullandıktan sonra bir tur darkvision mesafene 30 ft eklenir.'],
    ['Sessiz Düşünce Değneği',['arcane'],'Psychic büyü kullandığın tur telepatik etkileri tanıma Arcana check’ine +2 alırsın.'],
    ['Mühür Bekçisi Asası',['arcane','sacred'],'Abjuration büyüsü kullanınca bir tur zorla hareket ettirilmeye karşı avantaj alırsın.'],
    ['Yıldız Haritası Değneği',['arcane','noble'],'Divination büyüsünden sonra bir sonraki navigation check’ine +1d4 eklersin.'],
    ['Gümüş Kapı Asası',['arcane'],'Conjuration büyüsü kullandıktan sonra çağırdığın nesne veya varlığın yerini 1 mil içinde sezersin.'],
    ['Değişen Madde Değneği',['arcane','nature'],'Transmutation büyüsü sırasında değiştirdiğin büyüsüz maddenin yaklaşık ağırlığını bilirsin.'],
    ['Bin Yüz Asası',['arcane','rogue'],'Illusion büyüsü kullandıktan sonra bir tur Disguise check’ine +2 alırsın.'],
    ['Kemik Yazısı Değneği',['arcane','cursed'],'Necromancy büyüsüyle undead tespit ettiğinde türünü tanıma Religion check’ine +2 alırsın.'],
    ['Şifacı Gezgin Asası',['sacred','nature'],'İyileştirme büyüsü kullandıktan sonra hedefe zararsız biçimde vücut sıcaklığı ve nabız bilgisi verir.'],
    ['Kadim Rün Ustası Asası',['arcane','sacred'],'Bir büyü rününü çözmek için yapılan Arcana check’ine avantaj verir.']
  ];
  staves.forEach(([name,themes,effect],index)=>{
    const tier=Math.floor(index/4),rarity=['uncommon','rare','veryRare','legendary'][tier],magicBonus=[0,1,2,3][tier];
    push({name,category:'focus',slot:'focus',themes,rarity,lootKind:'casterGear',classRestriction:casterClasses,attunement:rarity!=='uncommon',magicBonus,
      effect:`Büyü odağı olarak kullanılabilir.${magicBonus?` Spell Attack ve Spell Save DC’ye +${magicBonus} verir.`:''} ${effect}`,
      activation:'Pasif',uses:'Attunement boyunca'});
  });

  if(pack.length!==124)throw new Error(`v63 caster pack must contain 124 records; got ${pack.length}`);

  root.V48_LOOT_KIND_LABELS=Object.freeze({...root.V48_LOOT_KIND_LABELS,
    casterGear:'Büyücü ekipmanları',spellbook:'Büyü kitapları',runedGear:'Rünlü eşyalar',holyRelic:'Kutsal emanetler'
  });
  root.V48_BUILD_LOOT=function(add,context={}){
    baseBuild(add,context);
    const catalogue=context.catalogue||[];
    if(catalogue.some(item=>item?.release==='v63'))return;
    const names=new Set(catalogue.map(item=>String(item.name||'').toLocaleLowerCase('tr-TR')));
    for(const item of pack){
      let record={...item},base=record.name,suffix=2;
      while(names.has(record.name.toLocaleLowerCase('tr-TR')))record.name=`${base} (${suffix++})`;
      names.add(record.name.toLocaleLowerCase('tr-TR'));
      add(record);
    }
  };
  root.V63_CASTER_LOOT=Object.freeze(pack.map(item=>Object.freeze({...item})));
})(typeof window!=='undefined'?window:globalThis);
