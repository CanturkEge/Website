/* v38 data: world roads, travel rules and tactical battle-map presets. */

const V38_ROADS=[
  ['road-01-02','map-castle-01','map-castle-02',4,'Yüksek ova yolu','Orta','Taş köprüler sağlam; kışın yan rüzgâr ve eşkıya riski artar.'],
  ['road-01-08','map-castle-01','map-castle-08',3,'Batı orman patikası','Orta','Sık ağaçlar görüşü kısaltır; yağmurdan sonra çamur yolculuğu yavaşlatır.'],
  ['road-01-05','map-castle-01','map-castle-05',5,'Kraliyet şosesi','Düşük','Devriye gören geniş yol; konak yerleri bulunduğu için kervanlara uygundur.'],
  ['road-02-03','map-castle-02','map-castle-03',4,'Buz sırtı geçidi','Yüksek','Dar dağ geçidi, kaya düşmesi ve ani tipi ihtimali taşır.'],
  ['road-02-05','map-castle-02','map-castle-05',4,'Taç yolu','Düşük','İki kale arasındaki bakımlı ticaret yolu ve düzenli haberci menzilleri.'],
  ['road-02-06','map-castle-02','map-castle-06',3,'Maden kervan yolu','Orta','Ağır yük arabaları ve maden galerilerinden çıkan yaratıklar yolu paylaşır.'],
  ['road-03-04','map-castle-03','map-castle-04',3,'Kül geçidi','Yüksek','Sıcak kül, keskin obsidyen ve zaman zaman zehirli buhar çıkar.'],
  ['road-03-06','map-castle-03','map-castle-06',3,'Demir omurga','Orta','Basamaklı taş yol; tırmanış zor fakat yön kaybetmek güçtür.'],
  ['road-04-07','map-castle-04','map-castle-07',4,'Kızıl yamaç yolu','Yüksek','Volkanik çatlaklar ve açık arazide avlanan uçan yaratıklar görülür.'],
  ['road-04-12','map-castle-04','map-castle-12',5,'Külbatak hattı','Çok yüksek','Yanardağ eteğinden zehirli bataklığa iner; rehbersiz yolculuk tavsiye edilmez.'],
  ['road-05-06','map-castle-05','map-castle-06',2,'Taç köprüsü','Düşük','Düzenli devriye edilen en kısa ana yol; köprü geçişleri kalabalık olabilir.'],
  ['road-05-08','map-castle-05','map-castle-08',5,'Batı kervan halkası','Orta','Köyler ve avcı barınakları üzerinden dolanan güvenli fakat uzun rota.'],
  ['road-05-09','map-castle-05','map-castle-09',3,'Güney posta yolu','Düşük','Posta arabalarının kullandığı işaretli yol; ilkbaharda nehir taşabilir.'],
  ['road-05-11','map-castle-05','map-castle-11',4,'Ay yolu','Orta','Açık düzlükten antik menhirlere uzanır; geceleri fey ışıkları görülür.'],
  ['road-06-07','map-castle-06','map-castle-07',3,'Üçköprü hattı','Orta','Nehir geçişleri hızlıdır; köprülerden biri her mevsim onarım ister.'],
  ['road-06-09','map-castle-06','map-castle-09',4,'Bakır dere yolu','Orta','Dere yatağını izler; dar boğazlarda pusu noktaları vardır.'],
  ['road-07-12','map-castle-07','map-castle-12',3,'Sazlık seti','Yüksek','Yükseltilmiş toprak set bataklığı geçer; sis bastığında işaretler kaybolur.'],
  ['road-08-09','map-castle-08','map-castle-09',3,'Karaçam izi','Orta','Avcıların kullandığı gölgeli orman yolu; büyük yırtıcı izleri yaygındır.'],
  ['road-08-10','map-castle-08','map-castle-10',4,'Batı kıyı yolu','Orta','Kayalık kıyıya iner; fırtınada bazı bölümler tamamen kapanır.'],
  ['road-09-10','map-castle-09','map-castle-10',3,'Tuz arabası yolu','Düşük','Kıyı ticaretinin kullandığı geniş toprak yol ve iki ücretli geçit.'],
  ['road-09-11','map-castle-09','map-castle-11',4,'Gümüş göl yolu','Orta','Sazlık kıyı ve eski taş döşeme dönüşümlüdür; gece ışıkları yolcuyu şaşırtabilir.'],
  ['road-10-11','map-castle-10','map-castle-11',4,'Fener sahili','Yüksek','Uçurum kenarı, sert rüzgâr ve korsan gözcüleri nedeniyle gündüz geçilmesi önerilir.'],
  ['road-11-12','map-castle-11','map-castle-12',6,'Güney sınır yolu','Çok yüksek','Uzun ve seyrek yerleşimli rota; su, erzak ve iki güvenli kamp gerekir.']
].map(row=>({id:row[0],from:row[1],to:row[2],days:row[3],terrain:row[4],danger:row[5],note:row[6]}));

/* These percentages are an explicit campaign helper. 2014 5e has travel pace and
   mount rules, but no single universal percentage table for every mount. */
const V38_MOUNT_RULES={
  foot:{name:'Yaya / binek yok',percent:0,terrain:'Her rota',note:'Yolun temel gün süresini kullanır.'},
  'ex-v34-donkey-mule':{name:'Eşek veya Katır',percent:10,terrain:'Dağ ve yük yolu',note:'Dayanıklı ve dengeli; hızdan çok mola ve yük kaybını azaltır.'},
  'ex-v34-pony':{name:'Midilli',percent:15,terrain:'Ova ve orman',note:'Small sürücüler ve hafif yükle düzenli tempo sağlar.'},
  'ex-v34-draft-horse':{name:'Koşum Atı',percent:10,terrain:'Yol ve araba',note:'Ağır yükte grubun yavaşlamasını azaltır; hızlı savaş bineği değildir.'},
  'ex-v34-riding-horse':{name:'Binek Atı',percent:25,terrain:'Bakımlı yol ve ova',note:'Uzun yol için ana hızlı binek seçeneğidir.'},
  'ex-v34-camel':{name:'Deve',percent:20,terrain:'Kurak ve sıcak bölge',note:'Kurak rotalarda su molalarını azaltır; bataklık ve dağda DM oranı düşürebilir.'},
  'ex-v34-mastiff':{name:'Mastiff',percent:10,terrain:'Small sürücü',note:'Yalnız uygun boydaki sürücü için yolculuk bineği sayılır.'},
  'ex-v34-pack-goat':{name:'Yük Keçisi',percent:5,terrain:'Dağ patikası',note:'Yükü hafifletir; grubun gerçek hareket hızını çok az değiştirir.'},
  'ex-v34-warhorse':{name:'Savaş Atı',percent:25,terrain:'Yol ve ova',note:'Binek Atı kadar hızlı yolculuk eder; asıl farkı çatışma eğitimidir.'},
  'ex-v34-elephant':{name:'Fil',percent:10,terrain:'Geniş ve sağlam yol',note:'Çok yük taşır; dar geçit ve köprülerde oran uygulanmayabilir.'},
  'ex-v34-giant-lizard-mount':{name:'Dev Kertenkele',percent:20,terrain:'Mağara ve sıcak kaya',note:'Kayalık ve yeraltı rotalarında düzenli ilerler.'},
  'ex-v34-giant-goat-mount':{name:'Dev Keçi',percent:25,terrain:'Dağ',note:'Tırmanış ve dar dağ patikalarında önemli zaman kazandırır.'},
  'ex-v34-axe-beak-mount':{name:'Balta Gagalı Binek',percent:25,terrain:'Açık arazi',note:'Hızlıdır fakat korku ve gürültüde Animal Handling isteyebilir.'},
  'ex-v34-giant-boar-mount':{name:'Dev Yaban Domuzu',percent:20,terrain:'Orman ve engebeli arazi',note:'Dayanıklı; bakımlı yolda attan daha hızlı değildir.'},
  'ex-v34-war-dog-pair':{name:'Savaş Köpeği Çifti',percent:0,terrain:'Yolculuk bineği değil',note:'Muhafız ve savaş yardımcısıdır; bütün partinin seyahat süresini kısaltmaz.'},
  'ex-v34-armored-warhorse':{name:'Plaka Zırhlı Savaş Atı',percent:15,terrain:'Yol ve ova',note:'Barding koruma sağlar ama uzun yol temposunu düşürür.'},
  'ex-v34-hippogriff-mount':{name:'Eğitimli Hippogriff',percent:60,terrain:'Uçuşa açık rota',note:'Engelleri aşar; fırtına, gece ve iniş alanı DM tarafından değerlendirilir.'},
  'ex-v34-griffon-lease':{name:'Griffon Seferi',percent:60,terrain:'Uçuşa açık rota',note:'Görevlik hava ulaşımı; yük ve hava şartı sınırları vardır.'},
  'ex-v34-giant-eagle-contract':{name:'Dev Kartal İttifakı',percent:65,terrain:'Uçuşa açık rota',note:'Hızlı hava taşıması; anlaşma, yük ve güvenli iniş alanı gerekir.'},
  'ex-v34-pegasus-bond':{name:'Pegasus Bağı',percent:65,terrain:'Uçuşa açık rota',note:'Yüksek hızlı uçuş; satın alınan sıradan bir hizmet değildir.'},
  'ex-v34-dire-wolf-mount':{name:'Eğitimli Ulu Kurt',percent:25,terrain:'Orman ve kar',note:'Uygun sürücüyle yolsuz arazide hızını iyi korur.'},
  'ex-v34-giant-elk-mount':{name:'Dev Geyik',percent:35,terrain:'Orman ve açık arazi',note:'Hafif yükte hızlıdır; şehir kapıları ve dar geçitler sorun olabilir.'},
  'ex-v34-wyvern-lease':{name:'Wyvern Uçuşu',percent:60,terrain:'Uçuşa açık rota',note:'Uzman biniciyle tek seferlik hızlı hava yolu; risklidir.'},
  'ex-v34-courier-relay':{name:'Kurye Menzil Ağı',percent:40,terrain:'Bakımlı ana yollar',note:'Sadece haberci veya küçük paket için; bütün partiye uygulanmaz.'}
};

const V38_PROP_DEFS={
  tree:{label:'Ağaç',icon:'♣',w:1,h:1,blocksMove:true,blocksVision:true,kind:'nature'},
  thicket:{label:'Sık Çalılık',icon:'♣♣',w:2,h:2,difficult:true,blocksVision:true,kind:'nature'},
  rock:{label:'Büyük Kaya',icon:'◆',w:1,h:1,blocksMove:true,blocksVision:true,kind:'nature'},
  water:{label:'Su / Dere',icon:'≈',w:3,h:2,difficult:true,kind:'nature'},
  mud:{label:'Çamur',icon:'≋',w:2,h:2,difficult:true,kind:'nature'},
  wall:{label:'Duvar',icon:'▰',w:3,h:1,blocksMove:true,blocksVision:true,kind:'structure'},
  fence:{label:'Parmaklık',icon:'╫',w:3,h:1,blocksMove:true,kind:'structure'},
  barricade:{label:'Barikat',icon:'╬',w:2,h:1,blocksMove:true,cover:'half',kind:'structure'},
  column:{label:'Yıkık Sütun',icon:'◉',w:1,h:1,blocksMove:true,blocksVision:true,cover:'three-quarters',kind:'ruin'},
  rubble:{label:'Moloz',icon:'▧',w:2,h:1,difficult:true,cover:'half',kind:'ruin'},
  tomb:{label:'Lahit',icon:'▣',w:2,h:1,blocksMove:true,cover:'half',kind:'ruin'},
  chest:{label:'Sandık',icon:'▤',w:1,h:1,blocksMove:true,kind:'object'},
  door:{label:'Kapı',icon:'▥',w:1,h:1,blocksMove:true,blocksVision:true,kind:'structure'},
  tent:{label:'Çadır',icon:'⌂',w:2,h:2,blocksVision:true,kind:'object'},
  torch:{label:'Meşale',icon:'✦',w:1,h:1,light:4,kind:'light'},
  campfire:{label:'Kamp Ateşi',icon:'♨',w:1,h:1,light:6,kind:'light'},
  difficult:{label:'Zor Arazi',icon:'░',w:2,h:2,difficult:true,kind:'zone'},
  startPlayer:{label:'Oyuncu Başlangıcı',icon:'P',w:2,h:2,zone:'player',kind:'zone'},
  startEnemy:{label:'Düşman Başlangıcı',icon:'D',w:2,h:2,zone:'enemy',kind:'zone'}
};

const V38_BATTLE_PRESETS={
  empty:{name:'Boş Savaş Alanı',desc:'Tamamen DM tarafından kurulacak sade kareli alan.',cols:20,rows:14,theme:'plain',props:[]},
  forest:{name:'Karaçam Pususu',desc:'Sık ağaç, çalılık, dere ve kayalarla görüşü daralan orman çatışması.',cols:22,rows:16,theme:'forest',props:[
    ['tree',2,2],['tree',5,1],['tree',9,3],['tree',17,2],['tree',20,5],['tree',3,12],['tree',7,14],['tree',16,13],['tree',20,12],
    ['thicket',0,6],['thicket',6,6],['thicket',17,7],['rock',11,5],['rock',14,10],['water',10,0,2,16],['startPlayer',2,13],['startEnemy',18,1]
  ]},
  ruins:{name:'Yıkık Taç Salonu',desc:'Kırık duvarlar, sütunlar, moloz ve ortada kilitli bir sandık.',cols:20,rows:14,theme:'ruins',props:[
    ['wall',1,1,6,1],['wall',13,1,6,1],['wall',1,12,5,1],['wall',14,12,5,1],['column',4,4],['column',15,4],['column',4,9],['column',15,9],['rubble',8,2],['rubble',10,10],['chest',9,6],['torch',2,6],['torch',17,6],['startPlayer',2,10],['startEnemy',16,2]
  ]},
  camp:{name:'Eşkıya Kampı',desc:'Çadırlar, ateş, sandık, çit ve çevre barikatlarıyla açık hava baskını.',cols:24,rows:16,theme:'camp',props:[
    ['tree',1,1],['tree',22,2],['tree',2,13],['tree',21,14],['tent',7,3],['tent',15,3],['tent',7,10],['tent',15,10],['campfire',11,7],['chest',18,8],['barricade',3,6],['barricade',19,6],['fence',9,1,6,1],['fence',9,14,6,1],['startPlayer',2,12],['startEnemy',19,2]
  ]},
  crypt:{name:'Meşalesiz Mahzen',desc:'Dar görüş, lahitler, taş duvarlar ve tekinsiz bir merkez oda.',cols:18,rows:14,theme:'crypt',lighting:'dark',props:[
    ['wall',0,0,18,1],['wall',0,13,18,1],['wall',0,1,1,12],['wall',17,1,1,12],['tomb',3,3],['tomb',7,3],['tomb',12,3],['tomb',3,9],['tomb',7,9],['tomb',12,9],['column',8,6],['torch',1,6],['chest',15,11],['startPlayer',2,11],['startEnemy',14,1]
  ]},
  bridge:{name:'Kırık Köprü Savunması',desc:'Su, dar geçiş, yıkıntı ve barikatlarla hat tutma savaşı.',cols:24,rows:12,theme:'bridge',props:[
    ['water',0,0,24,3],['water',0,9,24,3],['rubble',8,4],['rubble',14,7],['barricade',10,3],['barricade',12,8],['column',6,5],['column',17,6],['startPlayer',1,5],['startEnemy',21,5]
  ]},
  gate:{name:'Kale Kapısı Kuşatması',desc:'Parmaklık, barikat, sur parçaları ve saldırı koridoruyla kuşatma alanı.',cols:26,rows:16,theme:'courtyard',props:[
    ['wall',0,0,10,2],['wall',16,0,10,2],['door',12,0,2,2],['fence',10,2,6,1],['barricade',8,7],['barricade',16,7],['column',5,5],['column',20,5],['rubble',11,4],['rubble',13,10],['torch',9,2],['torch',16,2],['startPlayer',11,13],['startEnemy',11,1]
  ]}
};
