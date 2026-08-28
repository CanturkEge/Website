/* v44: DM-only karma reference and deterministic loot catalogue. */
((root)=>{
  'use strict';

  const rarityOrder=['mundane','common','uncommon','rare','veryRare','legendary','artifact'];
  const rarities={
    mundane:{label:'Sıradan',rank:0,color:'#9d9587',value:1},
    common:{label:'Yaygın',rank:1,color:'#d8d0bf',value:2},
    uncommon:{label:'Seyrek',rank:2,color:'#79c98a',value:5},
    rare:{label:'Nadir',rank:3,color:'#6da9ee',value:18},
    veryRare:{label:'Çok Nadir',rank:4,color:'#bb83ef',value:65},
    legendary:{label:'Efsanevi',rank:5,color:'#efad45',value:240},
    artifact:{label:'Artefakt',rank:6,color:'#ef6262',value:900}
  };

  const karmaBands=[
    {min:76,max:100,key:'blessed',label:'Kutlu',tone:'holy',event:'İyilikle bağlı bir ruh yardım ister; kutsal bir mekân karakteri tanır veya mazlumlar ona güvenerek risk alır.'},
    {min:41,max:75,key:'virtuous',label:'Erdemli',tone:'good',event:'Bir tanık eski iyiliği hatırlar; dürüst bir lonca indirim, bilgi veya güvenli geçiş sunabilir.'},
    {min:16,max:40,key:'kind',label:'İyi',tone:'good',event:'Küçük bir iyilik beklenmedik bir kapı açar; sıradan halk ilk yaklaşımda daha sıcak davranabilir.'},
    {min:-15,max:15,key:'neutral',label:'Nötr',tone:'neutral',event:'Evren özel tepki vermez; olayları ün, ilişki ve o andaki seçimler belirler.'},
    {min:-40,max:-16,key:'stained',label:'Lekeli',tone:'warning',event:'Hayvanlar huzursuzlanır, bir rahip şüphelenir veya geçmişte zarar gören biri karakteri tanır.'},
    {min:-75,max:-41,key:'wicked',label:'Kötücül',tone:'evil',event:'Karanlık bir güç teklif sunar; iyi niyetli NPC’ler kanıt olmadan bile karaktere güvenmekte zorlanabilir.'},
    {min:-100,max:-76,key:'damned',label:'Lanetli',tone:'cursed',event:'Lanetli mekânlar karaktere cevap verir; masum ruhlar kaçar, avcılar veya ilahi hesaplaşma peşine düşebilir.'}
  ];

  const karmaRules=[
    ['good-01','Merhamet','Savunmasız birine küçük yardım',2,'Bedeli düşük ama samimi yardım; aynı davranışı ödül toplamak için tekrar etmek puan üretmez.'],
    ['good-02','Merhamet','Aç birini doyurmak veya barındırmak',3,'Gerçek ihtiyacı gideren, karşılıksız yardım.'],
    ['good-03','Merhamet','Yaralı bir yabancıyı güvene almak',5,'Kendine ciddi risk oluşturmuyorsa temel değer.'],
    ['good-04','Merhamet','Bir masumun hayatını kurtarmak',15,'Tehlike ve kişisel bedel arttıkça +5’e kadar yükseltilebilir.'],
    ['good-05','Fedakârlık','Başkasını korumak için ciddi zarar göze almak',20,'Ölümcül risk veya kalıcı kayıp varsa +30’a kadar çıkabilir.'],
    ['good-06','Fedakârlık','Kendi büyük kazancından mazlumlar için vazgeçmek',10,'Vazgeçilen şey karakter için gerçekten önemli olmalı.'],
    ['good-07','Adalet','İşlemediği suçtan yargılananı aklamak',8,'Kanıt aramak ve kişisel risk almak dâhil.'],
    ['good-08','Adalet','Gücü olan bir zalimi durdurmak',12,'İntikam değil başkalarını koruma amacı baskınsa.'],
    ['good-09','Dürüstlük','Zararına rağmen önemli gerçeği söylemek',6,'Önemsiz doğrular veya çıkar sağlayan itiraflar puan getirmez.'],
    ['good-10','Mülkiyet','Çalınmış/değerli malı sahibine döndürmek',5,'Ödül için yapılıyorsa 0–2 puana indirilebilir.'],
    ['good-11','Sadakat','Bir dostu çıkar için satmayı reddetmek',5,'Sadakat kötü bir suçu örtmeye dönüşürse verilmez.'],
    ['good-12','Sorumluluk','Kendi verdiği zararı açıkça telafi etmek',7,'Özür, onarım ve makul bedelin tamamı gerekir.'],
    ['good-13','Barış','Kan dökülmeden çözülebilecek çatışmayı yatıştırmak',6,'Tehlikeli saldırganı serbest bırakmak değil, gerçek çözüm bulmak.'],
    ['good-14','Barış','Teslim olan düşmana adil davranmak',5,'Onu daha sonra masumlara zarar vermeyecek şekilde güvenceye almak gerekir.'],
    ['good-15','Kutsal','Lanetlenmiş bir ruhu özgür bırakmak',10,'Ruhu yok etmek yerine meselesini çözen davranış.'],
    ['good-16','Kutsal','Kutsal alanı kişisel bedelle savunmak',8,'Tapınağın gerçekten iyicil/koruyucu olması gerekir.'],
    ['good-17','Toplum','Bir köyü kıtlık, salgın veya baskından kurtarmak',18,'Grup başarısında paya ve niyete göre 8–18.'],
    ['good-18','Toplum','Yolsuzluğu ortaya çıkarıp mağdurları korumak',10,'Yalnız rakibini devirmek içinse azaltılır.'],
    ['good-19','Doğa','Yaşam alanını sebepsiz yıkımdan korumak',6,'Dengeyi korumak; her ağaç kesimi otomatik ceza değildir.'],
    ['good-20','Doğa','Nesli tükenen/masum yaratığı kurtarmak',8,'Yaratık bilerek halka salınırsa sonuç ayrıca değerlendirilir.'],
    ['bad-01','Dürüstlük','Küçük ve çıkarcı yalan',-1,'Kimseye belirgin zarar vermeyen tek yalan. Sürekli alışkanlıksa oturum başına toplu -2/-3.'],
    ['bad-02','Dürüstlük','Bir masumu suçlu gösterecek yalan',-8,'Hapis, sürgün veya ölüm riski varsa -15’e kadar.'],
    ['bad-03','Mülkiyet','İhtiyaç sahibinden küçük hırsızlık',-5,'Zengin ve zalim hedeften çalmak bağlama göre 0 ile -3 arası olabilir.'],
    ['bad-04','Mülkiyet','Bir ailenin/geçim sahibinin değerli malını çalmak',-8,'Çalınan şey yaşamını doğrudan etkiliyorsa.'],
    ['bad-05','Mülkiyet','Mezar veya kutsal emanet yağmalamak',-7,'Zararlı bir laneti kaldırmak için almak ceza olmayabilir.'],
    ['bad-06','Şiddet','Masuma bilerek zarar vermek',-10,'Kalıcı sakatlık veya ağır travmada -15.'],
    ['bad-07','Şiddet','Savunmasız birini eğlence için dövmek',-12,'Korkutma, aşağılama ve keyif amacı cezayı artırır.'],
    ['bad-08','Şiddet','Teslim olmuş düşmanı infaz etmek',-20,'Kaçınılmaz ve yakın tehlike yoksa.'],
    ['bad-09','Şiddet','Masum birini bilerek öldürmek',-35,'Planlı, çıkarcı veya zalimceyse -40; kaza ise niyet ve telafiye göre -5/-15.'],
    ['bad-10','Şiddet','Birden fazla masumu planlı biçimde öldürmek',-50,'Tek olay için büyük ceza; her kurbanı ayrı ayrı sınırsız çarpmayın.'],
    ['bad-11','Zulüm','Bilgi veya zevk için işkence',-25,'Ağır ve bilinçli zulüm. Tehditle blöf aynı değildir.'],
    ['bad-12','Zulüm','Kölelik yapmak veya bilinçli desteklemek',-30,'Birini kurtarmak için geçici rol yapmak bağlama göre cezasız olabilir.'],
    ['bad-13','Zulüm','Savunmasız topluluğu korkuyla yönetmek',-20,'Sistematik baskı; tek sert tartışma değildir.'],
    ['bad-14','İhanet','Dosta küçük çıkar için ihanet',-10,'Sonuç ağırsa veya güven özellikle kullanıldıysa -20.'],
    ['bad-15','İhanet','Korumaya söz verdiği masumu düşmana teslim etmek',-25,'Zorlama ve gerçek alternatifler puanı değiştirebilir.'],
    ['bad-16','Sorumluluk','Kendi felaketini bilerek başkasına yıkmak',-8,'Sonuç büyüdükçe -15’e kadar.'],
    ['bad-17','Sorumluluk','Önleyebileceği büyük zararı çıkar için görmezden gelmek',-12,'Bilgi, güç ve makul seçenek gerçekten mevcut olmalı.'],
    ['bad-18','Kutsal','İyicil kutsal alanı bilerek kirletmek',-12,'Dini farklılık değil, koruyucu alanı kötü niyetle bozmak.'],
    ['bad-19','Kutsal','Masum ruhu bağlamak veya tüketmek',-20,'Ruhun rızası ve alternatif olup olmadığı önemlidir.'],
    ['bad-20','Doğa','Yaşam alanını yalnız kâr için yok etmek',-10,'Zorunlu barınma/yiyecek kullanımı değil, gereksiz büyük yıkım.'],
    ['bad-21','Toplum','Kıtlık yardımını veya ilacı çalmak',-15,'Çok sayıda mağduru etkiliyorsa -25.'],
    ['bad-22','Toplum','Rüşvetle masumu hapse/ölüme göndermek',-18,'Sonucun ağırlığına göre -25’e kadar.'],
    ['bad-23','Karanlık','Bilerek iblis/ölümsüz tehdidi masumların üzerine salmak',-30,'Kontrol kaybının öngörülebilir olması gerekir.'],
    ['bad-24','Karanlık','Kişisel güç için masum kurban etmek',-40,'En ağır bireysel eylemlerden biri.'],
    ['context-01','Bağlam','Kötü eylemi hemen itiraf edip tam telafi etmek',5,'Asıl ceza silinmez; gerçek telafiyi ayrı olumlu kayıt olarak ekleyin.'],
    ['context-02','Bağlam','Baskı/tehdit altında yapılan eylem',0,'Otomatik puan değildir; temel değeri genelde %25–75 azaltmak için referans.'],
    ['context-03','Bağlam','Bilmeden yapılan ve öngörülemeyen zarar',0,'Karma niyet + öngörülebilir sonuçtur; öğrendikten sonraki tavır ayrıca puanlanır.'],
    ['context-04','Bağlam','Aynı küçük davranışı puan kasmak için tekrarlamak',0,'Tekrarlı bağış/yalan gibi küçük eylemleri sahne veya oturum başına toplulaştırın.']
  ].map(([id,category,name,value,note])=>({id,category,name,value,note}));

  const themes={
    mixed:{label:'Karışık',hint:'Kabın kendi temasını veya genel ganimetleri kullanır.'},
    arcane:{label:'Büyücü / Arkana',hint:'Büyü odağı, parşömen, bileşen ve gizemli eşyalar.'},
    martial:{label:'Savaşçı',hint:'Silah, zırh, mühimmat ve cephe araçları.'},
    alchemy:{label:'Simya',hint:'İksir, zehir, reaktif ve laboratuvar gereçleri.'},
    sacred:{label:'Tapınak / Kutsal',hint:'Kutsal sembol, koruma, şifa ve yadigârlar.'},
    nature:{label:'Avcı / Doğa',hint:'Bitki, izcilik, yay, tuzak ve yaban eşyaları.'},
    rogue:{label:'Hırsız / Kaçakçı',hint:'Kilit, zehir, saklı alet, küçük değerli ve belgeler.'},
    noble:{label:'Soylu / Hazine',hint:'Mücevher, sanat, kaliteli eşya ve para.'},
    cursed:{label:'Lanetli / Nekrotik',hint:'Bedelli güç, karanlık yadigâr ve uğursuz malzeme.'},
    elemental:{label:'Elemental',hint:'Ateş, soğuk, yıldırım, asit ve gök gürültüsü temaları.'}
  };

  const containers={
    purse:{label:'Madeni Para Kesesi',icon:'◉',maxSize:'tiny',allowed:['gem','trinket','accessory','component','document','junk'],nativeThemes:[],itemMin:0,itemMax:2,moneyOnly:.58,itemOnly:.07,coinScale:.32,rule:'Yalnız para, taş, yüzük, küçük belge ve minicik ıvır zıvır. Silah, zırh, şişe veya iri alet çıkmaz.'},
    pouch:{label:'Kemer Çantası',icon:'◒',maxSize:'small',allowed:['gem','trinket','accessory','component','document','consumable','scroll','ammunition','tool','junk'],nativeThemes:[],itemMin:0,itemMax:3,moneyOnly:.30,itemOnly:.16,coinScale:.52,rule:'Küçük iksir, parşömen, yüzük, bileşen ve el aleti sığar; gürz, yay veya zırh sığmaz.'},
    alchemySatchel:{label:'Simyacı Çantası',icon:'⚗',maxSize:'small',allowed:['component','consumable','tool','document','gem','junk'],nativeThemes:['alchemy'],itemMin:1,itemMax:5,moneyOnly:.04,itemOnly:.62,coinScale:.25,rule:'Şişe, iksir, reaktif, kömür ve küçük laboratuvar artığı üretir; savaş teçhizatı üretmez.'},
    hunterPack:{label:'Avcı Heybesi',icon:'⌁',maxSize:'medium',allowed:['ammunition','tool','component','consumable','weapon','document','trinket','junk'],nativeThemes:['nature'],itemMin:1,itemMax:5,moneyOnly:.06,itemOnly:.55,coinScale:.32,rule:'Ok, tuzak, bitki, yiyecek ve en fazla 1 orta boy av silahı; ağır zırh çıkmaz.'},
    lockbox:{label:'Küçük Kilitli Kutu',icon:'▣',maxSize:'medium',allowed:['gem','trinket','accessory','component','document','consumable','scroll','focus','tool','ammunition','weapon','junk'],nativeThemes:[],itemMin:1,itemMax:4,moneyOnly:.18,itemOnly:.17,coinScale:.85,rule:'Değerli ve orta boy eşyalar; en fazla 1 küçük/orta silah, zırh veya büyük silah yok.'},
    jewelryBox:{label:'Soylu Mücevher Kutusu',icon:'◇',maxSize:'small',allowed:['gem','trinket','accessory','document','junk'],nativeThemes:['noble'],itemMin:1,itemMax:5,moneyOnly:.12,itemOnly:.22,coinScale:1.1,rule:'Mücevher, mühür, ince belge ve küçük hatıralar; silah, zırh veya iksir yok.'},
    thiefStash:{label:'Hırsız Zulası',icon:'⌕',maxSize:'medium',allowed:['gem','trinket','accessory','component','document','consumable','scroll','ammunition','tool','weapon','junk'],nativeThemes:['rogue'],itemMin:1,itemMax:6,moneyOnly:.16,itemOnly:.18,coinScale:1.05,rule:'Çalıntı değerli, alet ve en fazla 1 saklanabilir silah; kalanlar para, taş, belge veya ıvır zıvır olabilir.'},
    chest:{label:'Macera Sandığı',icon:'▤',maxSize:'large',allowed:['weapon','armor','shield','accessory','focus','consumable','scroll','component','gem','trinket','tool','ammunition','document','junk'],nativeThemes:[],itemMin:1,itemMax:6,moneyOnly:.10,itemOnly:.17,coinScale:1,rule:'En fazla 2 silah, 1 zırh ve toplam 3 kuşanılabilir eşya; kalan yuvalar para, taş, malzeme, belge veya ıvır zıvırdan seçilir.'},
    reinforced:{label:'Büyük Takviyeli Sandık',icon:'▥',maxSize:'large',allowed:['weapon','armor','shield','accessory','focus','consumable','scroll','component','gem','trinket','tool','ammunition','document','junk'],nativeThemes:[],itemMin:2,itemMax:9,moneyOnly:.05,itemOnly:.12,coinScale:1.8,rule:'Kalabalık ganimet üretir ama en fazla 2 silah, 1 zırh, 1 kalkan ve toplam 4 kuşanılabilir eşya verir.'},
    wizardChest:{label:'Büyücü Sandığı',icon:'✦',maxSize:'large',allowed:['focus','scroll','component','consumable','accessory','document','gem','trinket','weapon','armor','junk'],nativeThemes:['arcane'],itemMin:1,itemMax:6,moneyOnly:.04,itemOnly:.50,coinScale:.8,rule:'Parşömen, bileşen ve gizemli artık ağırlıklı; en fazla 1 silah, 1 zırh ve toplam 3 kuşanılabilir eşya.'},
    warriorCache:{label:'Savaşçı Teçhizat Kasası',icon:'⚔',maxSize:'large',allowed:['weapon','armor','shield','ammunition','tool','consumable','junk'],nativeThemes:['martial'],itemMin:2,itemMax:7,moneyOnly:.02,itemOnly:.72,coinScale:.45,rule:'Savaş ağırlıklıdır ama en fazla 2 silah, 1 zırh ve 1 kalkan; kalanlar mühimmat, bakım aleti, tüketim veya hurda olur.'},
    reliquary:{label:'Tapınak Emanet Sandığı',icon:'✧',maxSize:'medium',allowed:['accessory','focus','consumable','scroll','component','document','gem','trinket','weapon','junk'],nativeThemes:['sacred'],itemMin:1,itemMax:5,moneyOnly:.08,itemOnly:.46,coinScale:.75,rule:'Kutsal yadigâr, şifa, sembol ve bağış parası; en fazla 1 silah ve toplam 2 kuşanılabilir eşya.'},
    lair:{label:'Yaratık İni Ganimeti',icon:'☠',maxSize:'large',allowed:['weapon','armor','shield','accessory','focus','consumable','scroll','component','gem','trinket','tool','ammunition','document','junk'],nativeThemes:[],itemMin:0,itemMax:8,moneyOnly:.15,itemOnly:.10,coinScale:1.35,rule:'Yutulmuş ve kırılmış ganimet ağırlıklı; en fazla 2 silah, 1 zırh ve toplam 3 kuşanılabilir eşya.'},
    cursedChest:{label:'Lanetli Sandık',icon:'♱',maxSize:'large',allowed:['weapon','armor','shield','accessory','focus','consumable','scroll','component','gem','trinket','document','junk'],nativeThemes:['cursed'],itemMin:1,itemMax:5,moneyOnly:.04,itemOnly:.54,coinScale:.95,rule:'Bedelli güç ve uğursuz artıklar; en fazla 2 silah, 1 zırh ve toplam 3 kuşanılabilir eşya.'}
  };

  const quality={
    poor:{label:'Yıpranmış',shift:-2,coin:.55,count:-1},
    standard:{label:'Standart',shift:0,coin:1,count:0},
    rich:{label:'Zengin',shift:2,coin:1.65,count:1},
    royal:{label:'Efsane Hazinesi',shift:4,coin:2.8,count:2}
  };

  const sizeRank={tiny:0,small:1,medium:2,large:3};
  const categoryLabels={weapon:'Silah',armor:'Zırh',shield:'Kalkan',accessory:'Aksesuar',focus:'Büyü Odağı',consumable:'Tüketilebilir',scroll:'Parşömen',component:'Bileşen',gem:'Değerli Taş',trinket:'Ufak Değerli',tool:'Alet',ammunition:'Mühimmat',document:'Belge',junk:'Ivır Zıvır'};
  const catalogue=[];
  let serial=0;
  const add=item=>{
    let rarity=rarities[item.rarity]?item.rarity:'common';
    catalogue.push(Object.freeze({
      id:`v44-loot-${String(++serial).padStart(4,'0')}`,
      name:item.name,
      category:item.category,
      categoryLabel:categoryLabels[item.category]||item.category,
      size:item.size||'small',
      themes:Array.from(new Set(['mixed',...(item.themes||[])])),
      rarity,
      minLevel:Math.max(1,Math.min(10,+item.minLevel||1)),
      effect:item.effect||'Özel bir mekanik etkisi yoktur; değerli veya hikâyesel ganimettir.',
      note:item.note||`${rarities[rarity].label} ${categoryLabels[item.category]||'eşya'}. ${item.effect||''}`.trim(),
      valueCopper:Math.max(1,Math.round(+item.valueCopper||rarities[rarity].value*100)),
      qtyMax:Math.max(1,Math.round(+item.qtyMax||1)),
      ...item,
      rarity
    }));
  };

  const weaponBases=[
    ['Hançer','1d4 delici','small',['martial','rogue']],['Dart','1d4 delici','small',['martial','rogue']],['Sopa','1d4 ezici','medium',['martial','nature']],['Hafif Çekiç','1d4 ezici','small',['martial']],['El Baltası','1d6 kesici','medium',['martial','nature']],['Kısa Kılıç','1d6 delici','medium',['martial','rogue']],['Pala','1d6 kesici','medium',['martial','rogue']],['Topuz','1d6 ezici','medium',['martial','sacred']],['Mızrak','1d6 delici','medium',['martial','nature']],['Çeyrek Asa','1d6 ezici','medium',['martial','arcane','nature']],['Kargı','1d6 delici','large',['martial']],['Uzun Kılıç','1d8 kesici','medium',['martial','noble']],['Savaş Çekici','1d8 ezici','medium',['martial']],['Savaş Baltası','1d8 kesici','medium',['martial']],['Rapier','1d8 delici','medium',['martial','rogue','noble']],['Gürz','1d8 ezici','medium',['martial','sacred']],['Kamçı','1d4 kesici','medium',['martial','rogue']],['Trident','1d6 delici','large',['martial','elemental']],['Kısa Yay','1d6 delici','large',['martial','nature']],['Uzun Yay','1d8 delici','large',['martial','nature']],['Hafif Arbalet','1d8 delici','large',['martial']],['El Arbaleti','1d6 delici','medium',['martial','rogue']],['Ağır Arbalet','1d10 delici','large',['martial']],['Büyük Kılıç','2d6 kesici','large',['martial']],['Büyük Balta','1d12 kesici','large',['martial']],['Maul','2d6 ezici','large',['martial']],['Glaive','1d10 kesici','large',['martial']],['Halberd','1d10 kesici','large',['martial']]
  ].map(([name,die,size,themes])=>({name,die,size,themes}));

  const weaponAffixes=[
    ['Bakımlı','mundane',1,['martial'],0,0,'Normal silah kurallarını kullanır; iyi durumdadır ve tam değerine yakın satılabilir.'],
    ['Dengeli','common',1,['martial'],0,0,'Günde 1 kez bu silahla yaptığın saldırı zarını attıktan sonra +1 ekleyebilirsin.'],
    ['Avcı','common',1,['nature'],0,0,'Bir yaratığın izini en az 10 dakika takip ettiysen ona karşı ilk saldırında +1 alırsın.'],
    ['Gizli','common',1,['rogue'],0,0,'Silahı üstünde saklamak için yapılan Sleight of Hand kontrolüne +2 verir.'],
    ['Keskin','uncommon',2,['martial'],1,1,'Bu silahla saldırı ve hasar zarlarına +1 verir.'],
    ['Közlü','uncommon',2,['elemental'],0,0,'Her tur ilk isabette hedefe +1d4 ateş hasarı verir.'],
    ['Ayazlı','uncommon',2,['elemental'],0,0,'Her tur ilk isabette +1d4 soğuk hasarı; hedefin sonraki tur hızı 5 ft azalır.'],
    ['Fırtına','uncommon',3,['elemental'],0,0,'Her tur ilk isabette +1d4 yıldırım hasarı verir.'],
    ['Koruyucu','uncommon',3,['sacred','martial'],0,0,'Silah eldeyken günde 1 kez reaction ile sana gelen saldırıya karşı AC’ni +2 artırırsın.'],
    ['Zehir Dişli','rare',4,['alchemy','rogue'],1,1,'Saldırı ve hasara +1; günde 1 kez isabette DC 13 CON, başarısızsa 2d6 zehir hasarı.'],
    ['Gölge','rare',4,['cursed','rogue'],1,1,'Saldırı ve hasara +1; loş/karanlıkta ilk isabete +1d6 nekrotik hasar.'],
    ['Şafak','rare',4,['sacred'],1,1,'Saldırı ve hasara +1; undead/fiend hedefe ayrıca +1d6 radiant hasar.'],
    ['Büyübozan','rare',5,['arcane','martial'],1,1,'Saldırı ve hasara +1; konsantrasyon bozmak için verilen hasarın DC’sine +2 ekler.'],
    ['Dev Avcısı','rare',5,['martial'],1,1,'Saldırı ve hasara +1; Large veya daha büyük hedefe her tur ilk isabette +1d6 hasar.'],
    ['Ejder Kıran','veryRare',6,['martial','elemental'],2,2,'Saldırı ve hasara +2; dragon türüne karşı isabette ayrıca +2d6 hasar.'],
    ['Rünlü','veryRare',6,['arcane'],2,2,'Saldırı ve hasara +2; uzun dinlenmede seçilen ateş/soğuk/yıldırım türünde günde 1 kez +3d6 hasar.'],
    ['Hayalet Vuran','veryRare',6,['sacred','cursed'],2,2,'Saldırı ve hasara +2; direnç/bağışıklık izin verdiğinde incorporeal hedefleri normal vurur ve +1d8 force verir.'],
    ['Zaman Çentikli','veryRare',7,['arcane'],2,2,'Saldırı ve hasara +2; günde 1 kez ıskaladığın saldırıyı yeniden atarsın.'],
    ['Can İçen','legendary',8,['cursed'],3,3,'Saldırı ve hasara +3; tur başına ilk kritik vuruşta verdiğin nekrotik hasarın yarısı kadar HP kazanırsın (en çok 15).'],
    ['Taç Muhafızı','legendary',8,['noble','sacred'],3,3,'Saldırı ve hasara +3; 10 ft içindeki müttefikler frightened save’lerine +2 alır.'],
    ['Yıldız Döven','legendary',9,['arcane','elemental'],3,3,'Saldırı ve hasara +3; günde 1 kez 20 ft yarıçapta DC 17 DEX, 6d6 force hasarı oluşturur.'],
    ['Kader Bağlı','legendary',9,['arcane','noble'],3,3,'Saldırı ve hasara +3; uzun dinlenme başına bir d20 sonucunu gördükten sonra 20 yapabilirsin.'],
    ['Dünya Yarığı','artifact',10,['elemental','martial'],3,3,'Saldırı ve hasara +3; günde 1 kez 60 ft çizgide DC 19 DEX, 10d6 force hasarı ve alanı difficult terrain yapar.'],
    ['Adsız Hüküm','artifact',10,['sacred','cursed'],3,3,'Saldırı ve hasara +3; önemli bir yaratığı düşürdüğünde DM onun kaderine bağlı kalıcı bir lütuf veya bedel belirler.']
  ].map(([prefix,rarity,minLevel,themes,attackBonus,damageBonus,effect])=>({prefix,rarity,minLevel,themes,attackBonus,damageBonus,effect}));

  for(let base of weaponBases)for(let affix of weaponAffixes)add({
    name:`${affix.prefix} ${base.name}`,category:'weapon',size:base.size,themes:[...base.themes,...affix.themes],rarity:affix.rarity,minLevel:affix.minLevel,
    effect:`${base.name}: ${base.die}. ${affix.effect}`,note:`${rarities[affix.rarity].label} silah • ${base.die}. ${affix.effect}`,
    valueCopper:Math.round((120+rarities[affix.rarity].value*900)*(base.size==='large'?1.25:1)),slot:'weapon',attackBonus:affix.attackBonus,damageBonus:affix.damageBonus
  });

  const armorBases=[
    ['Dolgulu Zırh','light',11,'medium',true,0],['Deri Zırh','light',11,'medium',false,0],['Çivili Deri','light',12,'medium',false,0],['Post Zırh','medium',12,'large',false,0],['Zincir Gömlek','medium',13,'large',false,0],['Pullu Zırh','medium',14,'large',true,0],['Göğüs Zırhı','medium',14,'large',false,0],['Yarım Plaka','medium',15,'large',true,0],['Halka Zırh','heavy',14,'large',true,0],['Zincir Zırh','heavy',16,'large',true,13],['Şerit Zırh','heavy',17,'large',true,15],['Plaka Zırh','heavy',18,'large',true,15]
  ].map(([name,armorType,armorBase,size,stealthDisadvantage,strRequirement])=>({name,armorType,armorBase,size,stealthDisadvantage,strRequirement}));
  const armorAffixes=[
    ['Onarılmış','mundane',1,['martial'],0,'Temel AC hesabını kullanır; bakımlıdır ancak büyülü bonus vermez.'],
    ['Hafifletilmiş','common',1,['martial'],0,'Giyip çıkarma süresi yarıya iner; ağırlık ve taşıma yükü yarım sayılır.'],
    ['Gizli Cepli','common',1,['rogue'],0,'İçindeki tiny bir eşyayı bulmak için yapılan aramada DC 15 Investigation gerekir.'],
    ['Sessiz','uncommon',2,['rogue'],0,'Zırh normalde Stealth disadvantage veriyorsa günde 1 saat boyunca bunu yok sayabilirsin.'],
    ['Muhafız','uncommon',2,['martial'],1,'Bu zırh giyiliyken AC’ye +1 verir.'],
    ['Köz Kalkanı','uncommon',3,['elemental'],0,'Ateş hasarı aldığında reaction ile hasarı 1d6 azalt; uzun dinlenmede 3 kullanım.'],
    ['Ayaz Kalkanı','uncommon',3,['elemental'],0,'Soğuk hasarı aldığında reaction ile hasarı 1d6 azalt; uzun dinlenmede 3 kullanım.'],
    ['Zehir Savar','rare',4,['alchemy','nature'],1,'AC’ye +1 ve poison saving throw’larına +2 verir.'],
    ['Gölge Örtülü','rare',4,['cursed','rogue'],1,'AC’ye +1; loş veya karanlıkta Stealth kontrollerine +2 verir.'],
    ['Şafak Mührü','rare',4,['sacred'],1,'AC’ye +1; frightened saving throw’larına avantaj verir.'],
    ['Büyü Siperli','rare',5,['arcane'],1,'AC’ye +1; spell kaynaklı saving throw’lara günde 1 kez avantaj sağlar.'],
    ['Element Dirençli','veryRare',6,['elemental'],2,'AC’ye +2; uzun dinlenmede seçilen ateş, soğuk, yıldırım veya asit türüne resistance verir.'],
    ['Faz Dokulu','veryRare',7,['arcane'],2,'AC’ye +2; günde 1 kez reaction ile bir saldırıyı ıskalatıp 10 ft ışınlanırsın.'],
    ['Aziz Siperi','legendary',8,['sacred'],3,'AC’ye +3; 10 ft içindeki müttefikler death save’lerine +2 alır.'],
    ['Ejder Pulu','legendary',9,['elemental','martial'],3,'AC’ye +3; seçilen ejder nefesi hasar türüne resistance ve günde 1 kez immunity verir.'],
    ['Gece Hükümdarı','legendary',9,['cursed','noble'],3,'AC’ye +3; karanlıkta 60 ft darkvision ve günde 1 kez 1 dakika görünmezlik verir.'],
    ['Kaderin Zırhı','artifact',10,['arcane','sacred'],3,'AC’ye +3; uzun dinlenmede bir kez 0 HP’ye düşecekken 1 HP’de kalırsın ve 20 geçici HP kazanırsın.']
  ].map(([prefix,rarity,minLevel,themes,acBonus,effect])=>({prefix,rarity,minLevel,themes,acBonus,effect}));
  for(let base of armorBases)for(let affix of armorAffixes)add({
    name:`${affix.prefix} ${base.name}`,category:'armor',size:base.size,themes:['martial',...affix.themes],rarity:affix.rarity,minLevel:affix.minLevel,
    effect:`Temel AC ${base.armorBase} (${base.armorType}); ${affix.effect}`,note:`${rarities[affix.rarity].label} ${base.armorType} zırh • Temel AC ${base.armorBase}. ${affix.effect}`,
    valueCopper:Math.round(500+rarities[affix.rarity].value*1200),slot:'armor',armorType:base.armorType,armorBase:base.armorBase,stealthDisadvantage:base.stealthDisadvantage,strRequirement:base.strRequirement||0,acBonus:affix.acBonus
  });
  for(let affix of armorAffixes)add({
    name:`${affix.prefix} Kalkan`,category:'shield',size:'large',themes:['martial',...affix.themes],rarity:affix.rarity,minLevel:affix.minLevel,
    effect:`Elde tutulduğunda normal +2 AC; ${affix.effect}`,note:`${rarities[affix.rarity].label} kalkan • Temel +2 AC. ${affix.effect}`,
    valueCopper:Math.round(250+rarities[affix.rarity].value*1000),slot:'shield',armorBase:2,acBonus:2+affix.acBonus
  });

  const accessoryBases=[
    ['Yakut Kolye','tiny',['noble','elemental'],'neck'],['Safir Yüzük','tiny',['noble','elemental'],'ring'],['Zümrüt Broş','tiny',['noble','nature'],'brooch'],['Ametist Bileklik','tiny',['noble','arcane'],'wrist'],['Aytaşı Muska','tiny',['arcane','sacred'],'neck'],['Güneş Madalyonu','tiny',['sacred'],'neck'],['Gümüş Halhal','tiny',['noble'],'anklet'],['Obsidyen Yüzük','tiny',['cursed','elemental'],'ring'],['Ejderdişi Kolye','small',['martial','elemental'],'neck'],['Kuzgun Tüyü Broş','tiny',['rogue','cursed'],'brooch'],['İnci Küpe','tiny',['noble'],'ears'],['Taç Mührü','tiny',['noble'],'ring'],['Gezgin Pelerini','medium',['nature'],'back'],['Gölgeli Pelerin','medium',['rogue','cursed'],'back'],['Runik Eldiven','small',['arcane'],'hands'],['Avcı Eldiveni','small',['nature'],'hands'],['Dev Kemeri','medium',['martial'],'waist'],['İpek Kemer','small',['noble','rogue'],'waist'],['Kanatlı Çizmeler','medium',['arcane'],'feet'],['Bataklık Çizmeleri','medium',['nature'],'feet'],['Kristal Mercek','small',['arcane'],'eyes'],['Kehanet Aynası','small',['arcane'],null],['Ruh Feneri','medium',['sacred','cursed'],null],['Cep Kum Saati','small',['arcane'],null],['Kemik Zar Takımı','small',['rogue','cursed'],null],['Mühürlü Madalyon','tiny',['noble','document'],'neck'],['Mercan Bilezik','tiny',['elemental'],'wrist'],['Kurt Pençesi Tılsımı','small',['nature','martial'],'neck'],['Altın Defne Tacı','small',['noble'],'head'],['Fısıltı Küpesi','tiny',['arcane','rogue'],'ears']
  ].map(([name,size,themes,slot])=>({name,size,themes,slot}));
  const accessoryPowers=[
    ['Hatıra','mundane',1,['noble'],'Mekanik bonus vermez; bir aile, lonca veya kayıp kişiyle bağlantılı hikâye kancası taşır.'],
    ['Uğurlu','common',1,['noble'],'Uzun dinlenmede 1 kez bir ability check sonucuna +1 ekleyebilirsin.'],
    ['Gezgin','common',1,['nature'],'Günde 1 kez yönünü ve son 24 saatteki hava değişimini doğru tahmin edersin.'],
    ['Köz Kalpli','uncommon',2,['elemental'],'Ateş hasarı veren bir saldırı veya büyünde günde 1 kez +1d6 ateş hasarı verirsin.'],
    ['Ayaz Kalpli','uncommon',2,['elemental'],'Soğuk hasarı veren bir saldırı veya büyünde günde 1 kez +1d6 soğuk hasarı verirsin.'],
    ['Zihin Açan','uncommon',3,['arcane'],'Arcana veya Investigation kontrollerinden birine (uzun dinlenmede seç) +2 verir.'],
    ['Şifacı','uncommon',3,['sacred'],'Bir hedefe HP kazandırdığında günde 1 kez iyileştirmeye +1d6 ekler.'],
    ['Sessiz Adım','rare',4,['rogue'],'Stealth kontrollerine +2; günde 1 kez hareket ederken opportunity attack tetiklemezsin.'],
    ['Koruma Mührü','rare',4,['sacred','arcane'],'Saving throw’lara +1 verir.'],
    ['Canlılık','rare',4,['nature'],'Maksimum HP’ye +5 verir; aynı adlı etkiler birikmez.'],
    ['Element Siperi','rare',5,['elemental'],'Uzun dinlenmede seçtiğin ateş/soğuk/yıldırım/asit türünden aldığın hasarı günde 1 kez yarıya indirir.'],
    ['Görünmez El','veryRare',6,['arcane'],'30 ft içinde 10 lb’ye kadar nesneyi bonus action ile hareket ettirirsin; saldırı yapamaz.'],
    ['Ufuk Adımı','veryRare',6,['arcane'],'Günde 2 kez bonus action ile görebildiğin boş bir kareye 30 ft ışınlanırsın.'],
    ['Ölümden Saklayan','veryRare',7,['sacred','cursed'],'Uzun dinlenmede 1 kez başarısız death save’i başarıya çevirirsin.'],
    ['Ejder Yüreği','legendary',8,['elemental','martial'],'Bir elemental türe resistance; günde 1 kez 30 ft konide DC 17 DEX, 6d6 o tür hasar.'],
    ['Kader Okuyan','legendary',9,['arcane'],'Uzun dinlenme başında iki d20 atıp sonuçları kaydet; gün içinde görülen iki d20’den birini bu sonuçla değiştir.'],
    ['Ruh Tahtı','legendary',9,['sacred','noble'],'CHA maksimumunu ve mevcut değerini 2 artırır (en çok 22); 10 ft aura fear save’lerine +2 verir.'],
    ['Dünyanın Anahtarı','artifact',10,['arcane','sacred','cursed'],'Günde 1 kez bilinen bir düzleme kapı açma denemesi yapar; hedef, bedel ve sapma olasılığını DM belirler.']
  ].map(([prefix,rarity,minLevel,themes,effect])=>({prefix,rarity,minLevel,themes,effect}));
  for(let base of accessoryBases)for(let power of accessoryPowers)add({
    name:`${power.prefix} ${base.name}`,category:'accessory',size:base.size,themes:[...base.themes,...power.themes],rarity:power.rarity,minLevel:power.minLevel,
    effect:power.effect,note:`${rarities[power.rarity].label} aksesuar. ${power.effect}`,valueCopper:Math.round(300+rarities[power.rarity].value*1100),slot:base.slot||undefined
  });

  const focusBases=[['Meşe Asa','medium',['arcane','nature']],['Kristal Değnek','small',['arcane']],['Kemik Değnek','small',['arcane','cursed']],['Bakır Küre','small',['arcane','elemental']],['Gümüş Kutsal Sembol','tiny',['sacred']],['Druid Totemi','small',['nature']],['Ejder Camı Küre','small',['arcane','elemental']],['Mühürlü Büyü Kitabı','medium',['arcane','document']]];
  const focusPowers=[
    ['Çırak','common',1,0,'Bir büyü odağıdır; büyü saldırısı veya save DC bonusu vermez.'],['Keskin','uncommon',2,1,'Büyü saldırı zarlarına +1 verir.'],['Mühürlü','uncommon',3,0,'Günde 1 kez bir concentration save’ine +2 ekler.'],['Usta','rare',4,1,'Büyü saldırısı ve spell save DC’ye +1 verir.'],['Yankılı','rare',5,1,'Günde 1 kez 1. veya 2. seviye büyü slotunu harcamadan yeniden kullanır.'],['Başbüyücü','veryRare',6,2,'Büyü saldırısı ve spell save DC’ye +2 verir.'],['Düzlem','legendary',8,3,'Büyü saldırısı ve spell save DC’ye +3; günde 1 kez 60 ft ışınlanma sağlar.'],['Arşivci','artifact',10,3,'Büyü saldırısı ve spell save DC’ye +3; DM’nin seçtiği kayıp bir büyüyü araştırma yoluyla öğrenmeye izin verir.']
  ].map(([prefix,rarity,minLevel,magicBonus,effect])=>({prefix,rarity,minLevel,magicBonus,effect}));
  for(let [name,size,baseThemes] of focusBases)for(let power of focusPowers)add({name:`${power.prefix} ${name}`,category:'focus',size,themes:[...baseThemes,'arcane'],rarity:power.rarity,minLevel:power.minLevel,effect:power.effect,note:`${rarities[power.rarity].label} büyü odağı. ${power.effect}`,valueCopper:Math.round(500+rarities[power.rarity].value*1300),slot:'focus',magicBonus:power.magicBonus});

  const consumableFamilies=[
    ['Şifa İksiri','sacred','İçen yaratık {dice} HP kazanır.'],['Köz Şişesi','elemental','Bir hedefe atılır; isabette {dice} ateş hasarı.'],['Ayaz Şişesi','elemental','Bir hedefe atılır; isabette {dice} soğuk hasarı ve hızı 5 ft azalır.'],['Yıldırım Tuzu','elemental','Bir silaha sürülür; sonraki isabette {dice} yıldırım hasarı.'],['Asit Ampulü','alchemy','Bir hedefe atılır; isabette {dice} asit hasarı.'],['Panzehir','alchemy','1 saat poison saving throw’larına {bonus} verir.'],['Görünmezlik Tozu','arcane','Kullananı {duration} görünmez yapar; saldırı veya büyü etkiyi bitirir.'],['Duman Boncuğu','rogue','10 ft yarıçapı {duration} heavily obscured yapan duman çıkarır.'],['Cesaret Şurubu','sacred','{duration} frightened saving throw’larına avantaj verir.'],['Tırmanış Macunu','nature','{duration} tırmanma kontrollerine {bonus} ve kaygan yüzeylere tutunma sağlar.'],['Gece Gözü Damlası','arcane','{duration} 60 ft darkvision verir.'],['Su Nefesi Tableti','alchemy','{duration} su altında nefes aldırır.'],['Sessiz Adım Yağı','rogue','{duration} Stealth kontrollerine {bonus} verir.'],['Dev Gücü Çayı','martial','{duration} Athletics kontrollerine {bonus} verir.'],['Odak Mürekkebi','arcane','Bir büyü parşömeni yazarken gereken malzeme değerini DM onayıyla %25 azaltır.'],['Kutsal Su Kapsülü','sacred','Undead/fiend hedefe isabette {dice} radiant hasar verir.'],['Uyku Zehri','rogue','Yaralanan hedef DC {dc} CON; başarısızsa 1 dakika unconscious, hasar alınca uyanır.'],['Örümcek Zehri','alchemy','Yaralanan hedef DC {dc} CON; başarısızsa {dice} zehir hasarı.'],['Canlandırma Tuzu','sacred','0 HP’de stabil bir hedefi 1 HP’ye kaldırır; hedef uzun dinlenmeye kadar 1 exhaustion alır.'],['Yaban Merhemi','nature','Bir beast üzerinde kullanılırsa {dice} HP kazandırır ve frightened durumunu bitirir.']
  ];
  const consumableGrades=[
    ['Seyreltilmiş','common',1,'1d4+1','+1','10 dakika',11,120],['Standart','uncommon',2,'2d4+2','+2','1 saat',12,450],['Yoğun','rare',4,'4d4+4','+3','8 saat',14,1800],['Usta','veryRare',6,'6d4+8','+4','24 saat',16,6200],['Kadim','legendary',8,'10d4+20','+5','7 gün',18,24000]
  ];
  for(let [family,theme,text] of consumableFamilies)for(let [grade,rarity,minLevel,dice,bonus,duration,dc,value] of consumableGrades){let effect=text.replaceAll('{dice}',dice).replaceAll('{bonus}',bonus).replaceAll('{duration}',duration).replaceAll('{dc}',dc);add({name:`${grade} ${family}`,category:'consumable',size:'small',themes:[theme,'alchemy'],rarity,minLevel,effect,note:`Tek kullanımlık. ${effect}`,valueCopper:value,qtyMax:rarity==='common'?4:2})}

  const scrollLevels={
    0:{label:'Cantrip',rarity:'common',minLevel:1,value:150,dc:13,attack:5},
    1:{label:'1. Seviye',rarity:'common',minLevel:1,value:300,dc:13,attack:5},
    2:{label:'2. Seviye',rarity:'uncommon',minLevel:2,value:900,dc:13,attack:5},
    3:{label:'3. Seviye',rarity:'uncommon',minLevel:3,value:1800,dc:15,attack:7},
    4:{label:'4. Seviye',rarity:'rare',minLevel:4,value:4000,dc:15,attack:7},
    5:{label:'5. Seviye',rarity:'rare',minLevel:5,value:7500,dc:17,attack:9},
    6:{label:'6. Seviye',rarity:'veryRare',minLevel:6,value:14000,dc:17,attack:9},
    7:{label:'7. Seviye',rarity:'veryRare',minLevel:7,value:25000,dc:18,attack:10},
    8:{label:'8. Seviye',rarity:'veryRare',minLevel:8,value:50000,dc:18,attack:10},
    9:{label:'9. Seviye',rarity:'legendary',minLevel:9,value:90000,dc:19,attack:11}
  };
  const spellPages=Array.isArray(root.V47_SPELLS)?root.V47_SPELLS:[];
  if(spellPages.length){
    for(let spell of spellPages){
      let tier=scrollLevels[spell.level]||scrollLevels[0],classes=spell.classes.join(', '),themes=['arcane'];
      if(spell.classes.some(name=>name==='Cleric'||name==='Paladin'))themes.push('sacred');
      if(spell.classes.some(name=>name==='Druid'||name==='Ranger'))themes.push('nature');
      if(spell.school==='Necromancy')themes.push('cursed');
      if(/fire|cold|lightning|thunder|acid|ateş|soğuk|yıldırım|gök gürültüsü|asit/i.test(`${spell.description} ${spell.name}`))themes.push('elemental');
      let resolution=spell.attackType?`Parşömen büyü saldırısı +${tier.attack}`:(spell.saves||[]).length?`Hedef açıklamadaki aşamada ${spell.saves.join('/')} save atar (DC ${tier.dc})`:'Açıklamadaki etki doğrudan uygulanır';
      let summary=String(spell.description||'').replace(/\s+/g,' ').trim();
      if(summary.length>280)summary=summary.slice(0,277).trimEnd()+'…';
      add({
        name:`Büyü Sayfası: ${spell.name}${spell.nameTr&&spell.nameTr!==spell.name?` / ${spell.nameTr}`:''}`,
        category:'scroll',size:'small',themes:[...new Set(themes)],rarity:tier.rarity,minLevel:tier.minLevel,
        effect:`${summary} Kullanım: ${resolution}. ${spell.concentration?'Concentration gerekir.':'Concentration gerekmez.'} Sayfa yalnız büyü class listendeyse okunur; normalde atabildiğinden yüksek seviyedeyse d20 + spellcasting stat modifier (proficiency eklenmez), DC ${10+spell.level}. Kullanım denemesinde sayfa yok olur.`,
        note:`Tek kullanımlık 2014 SRD büyü sayfası • ${tier.label} • ${spell.schoolTr||spell.school} • ${classes}.`,
        valueCopper:tier.value,spellLevel:spell.level,spellId:spell.id,spellName:spell.name,spellClasses:spell.classes,scrollSaveDc:tier.dc,scrollAttackBonus:tier.attack,consumable:true,qtyMax:1
      });
    }
  }else{
    const scrollSchools=[['Abjuration','Koruma'],['Conjuration','Çağırma'],['Divination','Kehanet'],['Enchantment','Etkileme'],['Evocation','Yıkım'],['Illusion','İllüzyon'],['Necromancy','Nekromansi'],['Transmutation','Dönüşüm']];
    for(let [school,tr] of scrollSchools)for(let level of Object.values(scrollLevels))add({name:`${tr} ${level.label} Parşömeni`,category:'scroll',size:'small',themes:['arcane',school==='Necromancy'?'cursed':'mixed'],rarity:level.rarity,minLevel:level.minLevel,effect:`İçinde DM’nin seçtiği ${school} okulundan ${level.label.toLocaleLowerCase('tr-TR')} bir büyü bulunur. Tek kullanımdır.`,note:`Tek kullanımlık büyü parşömeni • ${tr}.`,valueCopper:level.value,spellLevel:Object.values(scrollLevels).indexOf(level),qtyMax:1});
  }

  const components=[
    ['Kızıl Ejder Pulu','elemental'],['Kış Kurdu Dişi','elemental'],['Fırtına Camı','elemental'],['Saf Cıva','alchemy'],['Mandrake Kökü','alchemy'],['Ay Çiçeği','nature'],['Kara Lotus Yaprağı','cursed'],['Kutsanmış Tütsü','sacred'],['Gümüş Tozu','sacred'],['İnce Mithral Teli','arcane'],['Adamant Parçası','martial'],['Bazilisk Gözü','alchemy'],['Hayalet Tuzu','cursed'],['Peri Kanadı Tozu','arcane'],['Dev Tırnağı','martial'],['Kraken Mürekkebi','elemental'],['Anka Külü','sacred'],['Boşluk Kristali','arcane'],['Mezar Toprağı','cursed'],['Druidik Tohum','nature']
  ];
  const componentGrades=[['Kırık','mundane',1,80,'Düşük güçlü iksir, ritüel veya araştırmada tek bileşen sayılır.'],['Saf','uncommon',2,320,'Orta güçlü üretimde ana bileşen veya 25 gp değerinde özel malzeme sayılır.'],['Yoğun','rare',4,1200,'Nadir üretim, 3–5. seviye ritüel veya özel canavar araştırması için uygundur.'],['Mükemmel','veryRare',6,5000,'Yüksek seviye büyülü eşya üretiminde kritik bileşen olarak kullanılabilir.'],['Efsanevi','legendary',8,22000,'Eşsiz ritüel veya efsanevi eşya görev zincirinin ana bileşenidir.']];
  for(let [name,theme] of components)for(let [grade,rarity,minLevel,value,effect] of componentGrades)add({name:`${grade} ${name}`,category:'component',size:'tiny',themes:[theme],rarity,minLevel,effect,note:`Üretim bileşeni. ${effect}`,valueCopper:value,qtyMax:rarity==='common'?6:3});

  const gems=[['Kuvars','arcane'],['Akik','nature'],['Kehribar','nature'],['Mercan','elemental'],['Yeşim','sacred'],['Oniks','cursed'],['Opal','arcane'],['İnci','noble'],['Yakut','elemental'],['Safir','elemental'],['Zümrüt','nature'],['Elmas','sacred'],['Obsidyen','cursed'],['Ametist','arcane'],['Akuamarin','elemental'],['Topaz','elemental']];
  const gemCuts=[['Ham','mundane',1,25,'Değeri ve üretim malzemesi olarak kullanılabilir.'],['Kesilmiş','common',1,80,'Kaliteli mücevher veya büyü bileşeni olarak kullanılabilir.'],['Parlak','uncommon',2,350,'İçinde zayıf büyü aurası vardır; uyumlu element ritüeline +1 bonus verebilir.'],['Yıldız Kesim','rare',4,1400,'Günde 1 kez temas ettiği temaya uygun hasarı 1d6 güçlendiren tüketilebilir odak olabilir.'],['Ruhlu','veryRare',6,6000,'Bir büyülü eşyaya takıldığında DM’nin seçtiği tematik direnci veya günlük gücü sağlar.']];
  for(let [name,theme] of gems)for(let [cut,rarity,minLevel,value,effect] of gemCuts)add({name:`${cut} ${name}`,category:'gem',size:'tiny',themes:[theme,'noble'],rarity,minLevel,effect,note:`${rarities[rarity].label} değerli taş. ${effect}`,valueCopper:value,qtyMax:rarity==='mundane'?8:3});

  const trinkets=[
    ['Kırık Kraliyet Mührü','noble','Eski hanedana ait yarım mühür; diğer yarısı bir kapıyı veya miras iddiasını doğrulayabilir.'],['Kanlı Anahtar','cursed','Hangi kilidi açtığı bilinmez; dolunayda ılıklaşır.'],['Gümüş Çocuk Düdüğü','sacred','Çalındığında yalnız çocuklar ve ruhlar duyar.'],['Haritasız Pusula','arcane','Kuzeyi değil sahibinin o anda en çok istediği şeyi gösterir.'],['Küçük Ejder Figürü','elemental','Yakındaki gerçek ejder soyuna doğru hafifçe döner.'],['Sahte Altın Sikke','rogue','Bir yüzü her bakışta farklı hükümdar gösterir.'],['Kurumuş Peri Kozası','nature','Gece yıldız ışığında solukça parlar.'],['İsimsiz Asker Künyesi','martial','Unutulmuş bir savaş alanı ve aile hikâyesine bağlanır.'],['Fısıldayan Deniz Kabuğu','elemental','Denizi değil, en yakın yeraltı suyunun sesini verir.'],['Minik Kemik Taht','cursed','Üzerine bırakılan böcekler bir süre sahibinin yönünü izler.'],['Cam Göz','arcane','Günde bir kez kapalı bir sandığın içinden tek renk parıltı gösterir; içerik söylemez.'],['İpek İçinde Saç Tutamı','noble','Bir soylu aileye, kayıp büyücüye veya hag anlaşmasına bağlanabilir.'],['Sönmeyen Kömür','elemental','Isı vermez ama sıradan suyla sönmez.'],['Yedi Düğümlü İp','nature','Her çözülmüş düğüm unutulmuş bir yolculuk anısı çağrıştırır.'],['Kırık Kutsal Çan','sacred','Undead 30 ft yakındaysa duyulmayacak kadar hafif titreşir.'],['Mavi Balmumu Mektup','document','Açılırsa mühür bozulur; içeriğini ve göndereni DM belirler.'],['Hırsız İşareti Taşı','rogue','Bir şehirde güvenli ev veya kaçakçı bağlantısı gösterebilir.'],['Cep Boyu Ay Takvimi','arcane','Bir sonraki tutulmanın yanlış görünen ama gizli düzleme göre doğru tarihini taşır.'],['Paslanmaz Çivi','martial','Kale duvarındaki unutulmuş gizli geçide ait işaret olabilir.'],['Uyuyan Tohum','nature','Doğru yerde ekilirse bir gecede küçük sığınak ağacına dönüşebilir.']
  ];
  for(let [name,theme,effect] of trinkets)add({name,category:theme==='document'?'document':'trinket',size:'tiny',themes:[theme],rarity:'common',minLevel:1,effect,note:`Hikâye ganimeti. ${effect}`,valueCopper:40+serial%90,qtyMax:1});

  const tools=[
    ['Katlanır Maymuncuk Seti','small',['rogue'],'Thieves’ Tools kontrolünde kırılan bir aleti uzun dinlenmede bir kez yok sayar.'],['Gümüş Uçlu Cerrah Seti','medium',['sacred','alchemy'],'Medicine kontrolüne +1; undead kaynaklı yarayı teşhis etmeye yarar.'],['Cep Simya Ocağı','medium',['alchemy'],'Kısa dinlenmede basit bir reaktif veya asit testi yapmaya izin verir.'],['Rün Kazıma Kalemi','small',['arcane'],'Arcana ile rün kopyalama kontrolüne +2 verir.'],['Avcı Tuzak Kiti','medium',['nature'],'Bir dakikada DC 12 fark edilen, hızı 0 yapan küçük tuzak kurar.'],['Sessiz Halat Kancası','medium',['rogue'],'Atılırken normal metal kancaya göre çok daha az ses çıkarır.'],['Cüce Hassas Terazisi','small',['noble','alchemy'],'Taş, para ve toz değerini ölçen Investigation kontrolüne +2 verir.'],['Saha Demirci Çantası','medium',['martial'],'Kısa dinlenmede hasarlı sıradan silah/zırhı kullanılabilir hâle getirir.'],['Haritacı Seti','medium',['nature','document'],'Bilinmeyen rotayı kaydetme ve kaybolmama kontrollerine +1 verir.'],['Mühür Kopyalama Kiti','small',['rogue','noble'],'Sahte mühür üretme Sleight of Hand/Deception kontrolüne +2 verir.']
  ];
  for(let [name,size,itemThemes,effect] of tools)add({name,category:'tool',size,themes:itemThemes,rarity:'uncommon',minLevel:2,effect,note:`Saha aleti. ${effect}`,valueCopper:350,qtyMax:1});

  const ammoTypes=[['Ok Demeti','nature'],['Arbalet Oku Demeti','martial'],['Sapan Mermisi Kesesi','martial'],['Dart Kılıfı','rogue']];
  const ammoPowers=[['Standart','mundane',1,'10 adet normal mühimmat.'],['Gümüşlü','common',1,'10 adet; gümüşlü silaha duyarlı yaratıklarda uygun sayılır.'],['Köz Uçlu','uncommon',2,'5 adet; isabette +1 ateş hasarı verir.'],['Ayaz Uçlu','uncommon',2,'5 adet; isabette +1 soğuk hasarı verir.'],['Patlayıcı','rare',4,'3 adet; isabette hedefin 5 ft çevresine 1d6 ateş hasarı (DC 13 DEX yarı).'],['Ruh Vuran','veryRare',6,'3 adet; isabette +1d6 force hasarı verir ve büyülü sayılır.']];
  for(let [base,theme] of ammoTypes)for(let [prefix,rarity,minLevel,effect] of ammoPowers)add({name:`${prefix} ${base}`,category:'ammunition',size:'small',themes:[theme,'martial'],rarity,minLevel,effect,note:`Mühimmat. ${effect}`,valueCopper:100+rarities[rarity].value*300,qtyMax:3});

  const documents=[
    ['Kale Geçiş Fermanı','noble','İsmi yazılmamış resmî geçiş belgesi; doğru mühürlenirse bir kale kapısında avantaj sağlayabilir.'],['Kaçakçı Rota Defteri','rogue','İki kale arasındaki gizli patika, buluşma saati ve tek kullanımlık parola içerir.'],['Yasak Büyü Sayfası','arcane','Tam büyü değildir; üç sayfa daha bulunursa DM’nin seçtiği ritüel öğrenilebilir.'],['Eksik Vasiyet','noble','Bir mirasın yerini söyler ancak son sayfa ve tanık mührü eksiktir.'],['Yaratık Avı Sözleşmesi','nature','Belirli bir yaratık için ödül ve onu canlı istemelerinin şüpheli gerekçesini içerir.'],['Kara Ay İlahisi','cursed','Yüksek sesle tamamı okunursa DM bir uğursuz işaret veya ruh tepkisi belirler.'],['Şifacı Alan Notları','alchemy','Bölgedeki hastalık için üç olası tedavi bileşeni ve bir yanlış ipucu içerir.'],['Unutulmuş Tapınak Haritası','sacred','Giriş ve ilk odayı gösterir; iç koridorlar özellikle kazınmıştır.']
  ];
  for(let [name,theme,effect] of documents)add({name,category:'document',size:'small',themes:[theme],rarity:'uncommon',minLevel:2,effect,note:`Görev kancası. ${effect}`,valueCopper:250,qtyMax:1});

  const junkBases=[
    ['Düz Çakıl','tiny',['nature']],['Siyah Toprak Kesesi','small',['nature','alchemy','cursed']],['Kil Parçası','small',['nature','alchemy']],['Kömür Parçası','small',['alchemy','elemental']],['Cam Kırığı','tiny',['arcane','rogue']],['Eğri Çivi','tiny',['martial','rogue']],['Eski Düğme','tiny',['noble','rogue']],['Kurumuş Yaprak','tiny',['nature']],['Hayvan Kemiği','small',['nature','cursed']],['Boş Minik Şişe','small',['alchemy']],['Balmumu Topağı','tiny',['sacred','document']],['Sicim Parçası','small',['rogue','nature']],['Renksiz Tüy','tiny',['nature','arcane']],['Deniz Kabuğu','small',['elemental','nature']],['Tahta Kıymığı','small',['nature','martial']],['Bakır Pul','tiny',['noble','martial']],['Bez Parçası','small',['rogue','martial']],['Hayvan Dişi','tiny',['nature','cursed']],['Tebeşir Ucu','tiny',['arcane','sacred']],['Çömlek Parçası','small',['noble','nature']]
  ];
  const junkStates=[
    ['Çamurlu','mundane','Sıradan kir ve aşınma taşır.'],['Kırık','mundane','Artık asıl işlevini yerine getirmez.'],['İsli','mundane','Yakın zamanda ateş veya patlama görmüş olabilir.'],['Eski','common','Kime ait olduğu belirsiz küçük bir hikâye izi taşıyabilir.'],['İşaretli','common','Üzerindeki çizik ya da leke DM isterse basit bir ipucuna dönüşebilir.']
  ];
  for(let [name,size,itemThemes] of junkBases)for(let [state,rarity,effect] of junkStates)add({
    name:`${state} ${name}`,category:'junk',size,themes:itemThemes,rarity,minLevel:1,
    effect:`${effect} Mekanik bonus vermez ve kuşanılamaz.`,note:`Ivır zıvır • ${effect} Mekanik bonus vermez.`,valueCopper:rarity==='common'?3:1,qtyMax:4
  });

  /* A few named pieces make the browser useful even without combining prefixes mentally. */
  add({name:'Alevdamarı Yakut Kolye',category:'accessory',size:'tiny',themes:['elemental','noble'],rarity:'rare',minLevel:4,effect:'Ateş hasarı verdiğinde tur başına 1 kez +1d6 ateş hasarı; günde 1 kez aldığın ateş hasarını yarıya indirir.',note:'Nadir aksesuar • Açık ateş saldırısı ve savunması.',valueCopper:22000,slot:'neck'});
  add({name:'Sıfır Numaralı Kader Sikkesi',category:'consumable',size:'tiny',themes:['arcane','cursed','alchemy'],rarity:'artifact',minLevel:10,effect:'Bir kez yazı-tura atılıp kırılır: yazı, görülen bir d20’yi doğal 20; tura, doğal 1 yapar. Hangi tarafın geleceğini DM bile önceden açıklamak zorunda değildir.',note:'Tek kullanımlık artefakt; kampanya kaderini değiştirebilir.',valueCopper:1000000,qtyMax:1});

  /* v48 keeps all previous IDs stable and appends the expanded catalogue. */
  if(typeof root.V48_BUILD_LOOT==='function')root.V48_BUILD_LOOT(add,{catalogue,rarities,categoryLabels});

  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function randomInt(min,max,rng=Math.random){return Math.floor(rng()*(max-min+1))+min}
  function pick(list,rng=Math.random){return list[Math.min(list.length-1,Math.floor(rng()*list.length))]}
  function effectiveTheme(containerKey,themeKey){let container=containers[containerKey]||containers.chest;if(themeKey&&themeKey!=='mixed')return themeKey;return container.nativeThemes[0]||'mixed'}
  function compatible(item,containerKey,themeKey='mixed'){
    let container=containers[containerKey]||containers.chest;
    if(!container.allowed.includes(item.category))return false;
    if(sizeRank[item.size]>sizeRank[container.maxSize])return false;
    let target=effectiveTheme(containerKey,themeKey);
    return target==='mixed'||item.themes.includes(target)||item.themes.includes('mixed');
  }

  function rollRarity(level=1,qualityKey='standard',rng=Math.random,forced='auto'){
    if(rarities[forced])return forced;
    let ultra=rng();
    if(ultra<1e-8)return 'artifact';             // 1 / 100,000,000
    if(ultra<1.1e-7)return 'legendary';          // next 1 / 10,000,000
    let tier=clamp(Math.round(+level||1)+(quality[qualityKey]?.shift||0),1,14);
    let weights;
    if(tier<=1)weights=[55,37,7.51,.49,0,0,0];
    else if(tier<=3)weights=[27,46,23,3.85,.15,0,0];
    else if(tier<=5)weights=[10,35,38,15.5,1.45,.05,0];
    else if(tier<=7)weights=[3,17,38,32,9.5,.49,.01];
    else if(tier<=9)weights=[1,8,25,38,24,3.9,.1];
    else weights=[.4,3.6,13,32,38,12.5,.5];
    let roll=rng()*weights.reduce((a,b)=>a+b,0),sum=0;
    for(let i=0;i<weights.length;i++){sum+=weights[i];if(roll<sum)return rarityOrder[i]}
    return 'common';
  }

  function coinBundle(level,containerKey,qualityKey,rng=Math.random,forceNonzero=true){
    let container=containers[containerKey]||containers.chest,q=quality[qualityKey]||quality.standard;
    let budget=Math.max(1,Math.round((35+Math.pow(clamp(+level||1,1,10),1.8)*70)*container.coinScale*q.coin));
    budget=Math.max(1,Math.round(budget*(.45+rng()*1.25)));
    let cp=budget;
    if(!forceNonzero&&rng()<.08)cp=0;
    let pp=Math.floor(cp/1000);cp%=1000;let gp=Math.floor(cp/100);cp%=100;let sp=Math.floor(cp/10);cp%=10;
    return {pp,gp,sp,cp,totalCopper:pp*1000+gp*100+sp*10+cp};
  }

  const catalogueByRarity=Object.create(null),catalogueByRarityCategory=Object.create(null);
  for(let item of catalogue){
    (catalogueByRarity[item.rarity]??=[]).push(item);
    let key=`${item.rarity}|${item.category}`;(catalogueByRarityCategory[key]??=[]).push(item);
  }
  const majorLootCategories=new Set(['weapon','armor','shield','accessory','focus']);
  const defaultCategoryWeights={junk:22,trinket:13,component:12,gem:11,document:9,consumable:12,scroll:6,tool:6,ammunition:6,accessory:5,focus:3,weapon:5,armor:3,shield:2};
  const lootProfiles={
    purse:{major:1,limits:{accessory:1},weights:{gem:25,trinket:22,junk:25,component:12,document:10,accessory:6}},
    pouch:{major:1,limits:{accessory:1},weights:{junk:20,consumable:14,component:14,trinket:14,gem:10,document:8,tool:8,scroll:6,ammunition:4,accessory:2}},
    alchemySatchel:{major:0,limits:{},weights:{component:32,consumable:30,junk:22,tool:8,document:5,gem:3}},
    hunterPack:{major:1,limits:{weapon:1},weights:{ammunition:25,component:18,junk:20,tool:12,consumable:10,weapon:7,document:4,trinket:4}},
    lockbox:{major:2,limits:{weapon:1,focus:1,accessory:1},weights:{gem:20,trinket:16,document:13,component:10,junk:10,consumable:8,scroll:7,accessory:6,focus:4,weapon:3,tool:2,ammunition:1}},
    jewelryBox:{major:2,limits:{accessory:2},weights:{gem:35,accessory:20,trinket:20,document:10,junk:15}},
    thiefStash:{major:2,limits:{weapon:1,accessory:1},weights:{junk:16,gem:14,trinket:13,tool:12,document:11,component:9,consumable:8,ammunition:6,scroll:5,accessory:4,weapon:2}},
    chest:{major:3,limits:{weapon:2,armor:1,shield:1,accessory:2,focus:1},weights:{...defaultCategoryWeights}},
    reinforced:{major:4,limits:{weapon:2,armor:1,shield:1,accessory:2,focus:1},weights:{...defaultCategoryWeights,weapon:7,armor:4,shield:3}},
    wizardChest:{major:3,limits:{weapon:1,armor:1,accessory:1,focus:1},weights:{scroll:24,component:20,junk:15,consumable:12,document:9,gem:7,focus:6,accessory:3,weapon:2,armor:2,trinket:8}},
    warriorCache:{major:4,limits:{weapon:2,armor:1,shield:1},weights:{ammunition:24,tool:16,consumable:12,junk:22,weapon:12,armor:8,shield:6}},
    reliquary:{major:2,limits:{weapon:1,accessory:1,focus:1},weights:{consumable:20,component:18,document:15,junk:14,scroll:10,gem:8,trinket:6,accessory:4,focus:3,weapon:2}},
    lair:{major:3,limits:{weapon:2,armor:1,shield:1,accessory:2,focus:1},weights:{junk:30,component:12,trinket:11,gem:10,document:8,consumable:8,ammunition:6,tool:5,weapon:4,accessory:3,armor:1,shield:1,focus:1}},
    cursedChest:{major:3,limits:{weapon:2,armor:1,shield:1,accessory:2,focus:1},weights:{junk:22,component:16,trinket:12,document:10,consumable:9,gem:8,scroll:7,accessory:5,weapon:4,focus:3,armor:2,shield:2}}
  };

  function exactThemeMatch(item,containerKey,themeKey){
    let target=effectiveTheme(containerKey,themeKey);
    return target==='mixed'||item.themes.includes(target);
  }
  function itemCandidates(options,rarity,category='',excluded=new Set(),strictTheme=true){
    let level=clamp(+options.level||1,1,10),containerKey=containers[options.container]?options.container:'chest',themeKey=themes[options.theme]?options.theme:'mixed';
    let source=category?(catalogueByRarityCategory[`${rarity}|${category}`]||[]):(catalogueByRarity[rarity]||[]);
    return source.filter(item=>compatible(item,containerKey,'mixed')&&(!strictTheme||exactThemeMatch(item,containerKey,themeKey))&&(item.minLevel<=level+1||rarities[rarity].rank>=5)&&!excluded.has(item.id));
  }
  function itemFor(options,rarity,rng=Math.random,category='',excluded=new Set()){
    let candidates=itemCandidates(options,rarity,category,excluded,true);
    if(!candidates.length)candidates=itemCandidates(options,rarity,category,excluded,false);
    return candidates.length?pick(candidates,rng):null;
  }
  function weightedPick(entries,rng=Math.random){
    let total=entries.reduce((sum,entry)=>sum+Math.max(0,+entry.weight||0),0);
    if(!total)return null;
    let roll=rng()*total;
    for(let entry of entries){roll-=Math.max(0,+entry.weight||0);if(roll<0)return entry.value}
    return entries[entries.length-1]?.value||null;
  }
  function categoryFor(options,rarity,counts,excluded,rng=Math.random){
    let containerKey=containers[options.container]?options.container:'chest',container=containers[containerKey],profile=lootProfiles[containerKey]||lootProfiles.chest;
    let majorCount=Object.entries(counts).reduce((sum,[category,count])=>sum+(majorLootCategories.has(category)?count:0),0);
    let choices=[];
    for(let category of container.allowed){
      let used=counts[category]||0,limit=majorLootCategories.has(category)?(profile.limits[category]??0):Infinity;
      if(used>=limit||majorLootCategories.has(category)&&majorCount>=profile.major)continue;
      if(!itemFor(options,rarity,()=>0,category,excluded))continue;
      let weight=profile.weights[category]??defaultCategoryWeights[category]??1;
      if(weight>0)choices.push({value:category,weight});
    }
    return weightedPick(choices,rng);
  }

  function generateLoot(options={},rng=Math.random){
    let level=clamp(+options.level||1,1,10),containerKey=containers[options.container]?options.container:'chest',themeKey=themes[options.theme]?options.theme:'mixed',qualityKey=quality[options.quality]?options.quality:'standard',forced=options.rarity||'auto';
    let container=containers[containerKey],q=quality[qualityKey],mode=rng(),moneyOnly=mode<container.moneyOnly,itemOnly=!moneyOnly&&mode<container.moneyOnly+container.itemOnly;
    let min=Math.max(0,container.itemMin+q.count),max=Math.max(min,container.itemMax+q.count),count=moneyOnly?0:randomInt(min,max,rng);
    if(!moneyOnly&&count===0&&itemOnly)count=1;
    let items=[],counts={},excluded=new Set();
    for(let i=0;i<count;i++){
      let rarity=null,category=null,source=null;
      for(let attempt=0;attempt<6&&!source;attempt++){
        rarity=rollRarity(level,qualityKey,rng,forced);
        category=categoryFor({level,container:containerKey,theme:themeKey},rarity,counts,excluded,rng);
        if(category)source=itemFor({level,container:containerKey,theme:themeKey},rarity,rng,category,excluded);
        if(forced!=='auto')break;
      }
      if(!source)break;
      let qty=source.qtyMax>1&&rng()<.22?randomInt(2,Math.min(source.qtyMax,4),rng):1;
      items.push({...source,sourceId:source.id,instanceId:`loot-${Date.now().toString(36)}-${i}-${Math.floor(rng()*1e9).toString(36)}`,qty});
      excluded.add(source.id);counts[category]=(counts[category]||0)+1;
    }
    let coins=itemOnly?{pp:0,gp:0,sp:0,cp:0,totalCopper:0}:coinBundle(level,containerKey,qualityKey,rng,true);
    if(!items.length&&!coins.totalCopper)coins={pp:0,gp:0,sp:0,cp:1,totalCopper:1};
    return {
      id:`haul-${Date.now().toString(36)}-${Math.floor(rng()*1e9).toString(36)}`,at:new Date().toISOString(),level,container:containerKey,theme:themeKey,quality:qualityKey,rarity:forced,
      items,coins,composition:{...counts},summary:items.length?`${items.length} eşya${coins.totalCopper?' + para':''}`:'Yalnız para'
    };
  }

  root.V44_RARITY_ORDER=rarityOrder;
  root.V44_RARITIES=rarities;
  root.V44_KARMA_BANDS=karmaBands;
  root.V44_KARMA_RULES=karmaRules;
  root.V44_LOOT_THEMES=themes;
  root.V44_LOOT_CONTAINERS=containers;
  root.V44_LOOT_QUALITY=quality;
  root.V44_LOOT_CATEGORY_LABELS=categoryLabels;
  root.V44_LOOT_CATALOG=Object.freeze(catalogue);
  root.V45_LOOT_PROFILES=lootProfiles;
  root.V45_MAJOR_LOOT_CATEGORIES=Object.freeze(Array.from(majorLootCategories));
  root.v44LootCompatible=compatible;
  root.v45LootItemFor=itemFor;
  root.v45LootCategoryFor=categoryFor;
  root.v44RollRarity=rollRarity;
  root.v44GenerateLoot=generateLoot;
})(typeof window!=='undefined'?window:globalThis);
