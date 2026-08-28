/* v51: justice axis and campaign-only divine order reference data. */
(()=>{
  'use strict';

  const alignments={
    LG:{label:'Yasal İyi',law:'Yasal',moral:'İyi',short:'Merhameti adil ve tutarlı kurallarla korur.'},
    NG:{label:'Nötr İyi',law:'Nötr',moral:'İyi',short:'İyiliği düzenden veya özgürlükten daha önde tutar.'},
    CG:{label:'Kaotik İyi',law:'Kaotik',moral:'İyi',short:'Özgürlüğü savunur; zararlı otoriteye karşı çıkar.'},
    LN:{label:'Yasal Nötr',law:'Yasal',moral:'Nötr',short:'Kural, görev ve tutarlılığı kişisel duygudan önde tutar.'},
    N:{label:'Gerçek Nötr',law:'Nötr',moral:'Nötr',short:'Duruma göre denge, ihtiyaç ve ölçülülük arar.'},
    CN:{label:'Kaotik Nötr',law:'Kaotik',moral:'Nötr',short:'Kendi kararını ve hareket serbestisini önde tutar.'},
    LE:{label:'Yasal Kötü',law:'Yasal',moral:'Kötü',short:'Kuralları güç, baskı ve kişisel çıkar için kullanır.'},
    NE:{label:'Nötr Kötü',law:'Nötr',moral:'Kötü',short:'Düzen ya da kaostan bağımsız biçimde kendi çıkarını gözetir.'},
    CE:{label:'Kaotik Kötü',law:'Kaotik',moral:'Kötü',short:'Yıkım, keyfî güç ve sınırsız bencillikle hareket eder.'}
  };

  const justiceBands=[
    {min:-100,max:-70,label:'Kaosun Eli',tone:'chaotic',summary:'Yeminleri, adil süreci ve ortak kuralları sürekli parçalar.'},
    {min:-69,max:-30,label:'Kural Tanımaz',tone:'chaotic',summary:'Kişisel iradeyi çoğu sözleşme ve kurumdan üstün tutar.'},
    {min:-29,max:29,label:'Pragmatik Nötr',tone:'neutral',summary:'Duruma göre düzeni veya özgürlüğü seçer; belirgin eksen yoktur.'},
    {min:30,max:69,label:'Düzen Yanlısı',tone:'lawful',summary:'Tutarlı süreç, söz ve sorumluluğu çoğunlukla korur.'},
    {min:70,max:100,label:'Adalet Muhafızı',tone:'lawful',summary:'Gücü kuralla sınırlar; hak, kanıt ve hesap verebilirliği savunur.'}
  ];

  const justiceRows=[
    ['justice-01','Adil Süreç','Suçlanan kişiyi dinleyip kanıt toplamak',8,'Şüpheyi suç saymadan tanık ve delili karşılaştırır.'],
    ['justice-02','Adil Süreç','Düşmana bile tarafsız yargılama sağlamak',12,'Sonuçtan bağımsız, herkes için aynı temel süreci savunur.'],
    ['justice-03','Adil Süreç','Kanıtı bilerek saklamak veya uydurmak',-15,'Kararı keyfî hâle getirir; kişisel kazanç varsa karma da ayrıca düşebilir.'],
    ['justice-04','Adil Süreç','İşkenceyle itiraf almaya çalışmak',-18,'Güvenilmez yöntem ve keyfî güç kullanımıdır.'],
    ['oath-01','Ant / Yemin','Zor olsa da özgür iradeyle verilen sözü tutmak',8,'Sözün kapsamı ve bedeli baştan biliniyorsa daha güçlüdür.'],
    ['oath-02','Ant / Yemin','Topluluğu koruyan ağır bir yemini tamamlamak',15,'Kişisel bedel ödenmesi puanı artırabilir.'],
    ['oath-03','Ant / Yemin','Çıkar için anlaşmayı tek taraflı bozmak',-10,'Karşı tarafın güvenini ve ortak düzeni parçalar.'],
    ['oath-04','Ant / Yemin','Zararlı veya zorla alınmış yemini açıkça reddetmek',0,'Otomatik eksi değildir; reddetme biçimi ve mağdur koruması değerlendirilir.'],
    ['authority-01','Yetki','Sahip olunan gücü yazılı ve denetlenebilir kullanmak',7,'Emir, gerekçe ve sonuç kayda geçiriliyorsa tutarlılık artar.'],
    ['authority-02','Yetki','Görevi kötüye kullanan amiri kanıtla durdurmak',10,'Körü körüne itaat değil, hesap verebilir düzen ödüllendirilir.'],
    ['authority-03','Yetki','Unvanı kişisel intikam için kullanmak',-14,'Kurumu kişisel silaha çevirir.'],
    ['authority-04','Yetki','“Emir aldım” diyerek açık haksızlığı uygulamak',-8,'Haksız emre itaat adalet sayılmaz; karma sonucu ayrıca puanlanır.'],
    ['rights-01','Haklar','Savunmasızın temel hakkını güçlüye karşı korumak',10,'Mülkiyet, beden güvenliği, söz hakkı veya sığınma gibi hakları korur.'],
    ['rights-02','Haklar','Azınlık veya yabancıya aynı kuralı uygulamak',8,'Kimliğe göre değişmeyen tutarlılık gösterir.'],
    ['rights-03','Haklar','Kişiyi yalnız species, soy veya inanç nedeniyle cezalandırmak',-16,'Bireysel kanıt yerine toplu suçlama yapar.'],
    ['rights-04','Haklar','Mahkûmun temel ihtiyaçlarını keyfî biçimde kesmek',-9,'Ceza sınırını aşan keyfî eziyettir.'],
    ['punishment-01','Ceza','Zararla orantılı ve onarıcı sonuç belirlemek',9,'Mağduru onarmayı ve tekrarını önlemeyi amaçlar.'],
    ['punishment-02','Ceza','Gerçek telafi sonrası cezayı ölçülü azaltmak',6,'Merhameti keyfî ayrıcalık değil, tutarlı ölçüt olarak kullanır.'],
    ['punishment-03','Ceza','Küçük suç için aşırı veya toplu ceza vermek',-14,'Orantısızlık ve suçsuzları cezalandırma düzeni yozlaştırır.'],
    ['punishment-04','Ceza','Rüşvet karşılığı cezayı kaldırmak',-18,'Adaleti satın alınabilir hâle getirir.'],
    ['order-01','Düzen','Savaşta siviller için açık tahliye düzeni kurmak',8,'Kurallar doğrudan yaşamı ve hakkı korur.'],
    ['order-02','Düzen','Nöbet, kayıt veya ortak sorumluluğu eksiksiz yürütmek',5,'Küçük ama tekrarlı görevleri oturum başına toplulaştır.'],
    ['order-03','Düzen','Panik yaratmak için güvenlik düzenini sabote etmek',-12,'Sonuçta zarar olmasa bile ortak güveni hedef alır.'],
    ['order-04','Düzen','Sırf gelenek olduğu için açıkça zararlı uygulamayı sürdürmek',-5,'Gelenek tek başına adalet değildir; reform girişimi puanı değiştirebilir.'],
    ['corruption-01','Yolsuzluk','Rüşveti reddedip olayı yetkili ve güvenli biçimde belgelemek',9,'Kendini riske atma derecesi puanı artırabilir.'],
    ['corruption-02','Yolsuzluk','Kendi tarafının suçunu da açığa çıkarmak',12,'Kuralı yalnız rakibe değil kendine de uygular.'],
    ['corruption-03','Yolsuzluk','Rüşvet almak veya kayırma yapmak',-15,'Küçük iyilikten büyük siyasi karara kadar ölçekle.'],
    ['corruption-04','Yolsuzluk','Yolsuzluğu pay karşılığı örtbas etmek',-18,'Sistemin güvenini kasıtlı olarak satar.'],
    ['rebellion-01','İsyan','Barışçıl çözüm tükendikten sonra zalim düzeni sınırlı hedefle devirmek',3,'İsyan otomatik kaos değildir; hedef, yöntem ve yeni süreç önemlidir.'],
    ['rebellion-02','İsyan','Zalim yasayı bozarken mağdurları koruyan alternatif süreç kurmak',7,'Özgürlük ile sorumluluğu birlikte taşır.'],
    ['rebellion-03','İsyan','Özgürlük bahanesiyle kayıt, anlaşma ve sivilleri rastgele yok etmek',-13,'Amaç iyi olsa bile keyfî yıkım düzen eksenini düşürür.'],
    ['rebellion-04','İsyan','Hiçbir ortak sınıra tabi olmayacağını ilan etmek',-8,'Tek seferlik sözden çok tekrarlanan davranışa göre uygula.'],
    ['mercy-01','Merhamet','Affı mağdur güvenliği ve telafi şartına bağlamak',6,'Merhamet ile sorumluluğu birlikte korur.'],
    ['mercy-02','Merhamet','Teslim olan düşmana açık ve tutarlı şart sunmak',7,'Şart sonradan keyfî değişmemelidir.'],
    ['mercy-03','Merhamet','Sevdiğine ayrı, yabancıya ayrı ceza vermek',-9,'Kuralı kişiye göre eğmek adalet eksenini düşürür.'],
    ['mercy-04','Merhamet','Suçsuzu korumak için usulü geçici bozup sonra hesap vermek',0,'Acil zorunluluk bağlamıdır; gerekçe ve sonradan denetim belirleyicidir.'],
    ['contract-01','Sözleşme','Tarafların anlayacağı açık şartlarla anlaşmak',6,'Gizli bedel ve yanıltıcı küçük yazı kullanmaz.'],
    ['contract-02','Sözleşme','Borç veya emaneti kayıtla ve zamanında iade etmek',5,'Maddi değerden çok güven ilişkisi önemlidir.'],
    ['contract-03','Sözleşme','Sözleşmedeki boşluğu karşı tarafı mahvetmek için kullanmak',-10,'Kelimeye uyup adil amacı kasıtlı bozmak düzen değil istismardır.'],
    ['contract-04','Sözleşme','Zor durumdakine reddedemeyeceği tek taraflı şart dayatmak',-11,'Rıza yoksa şeklen imza adil anlaşma sayılmaz.'],
    ['account-01','Hesap Verme','Kendi hatasını açıklayıp zararı onarmak',8,'Karma telafisiyle birlikte ayrı ayrı puanlanabilir.'],
    ['account-02','Hesap Verme','Kararın bağımsız denetlenmesini kabul etmek',7,'Gücü kişisel iradenin dışındaki ölçüte bağlar.'],
    ['account-03','Hesap Verme','Kayıtları silerek sorumluluktan kaçmak',-12,'Sonuç gizlenmese bile süreci bozar.'],
    ['account-04','Hesap Verme','Altındaki kişiyi kendi kararına günah keçisi yapmak',-14,'Yetkiyi taşıyıp sorumluluğu zayıfa iter.']
  ];
  const justiceRules=justiceRows.map(([id,category,name,value,note])=>({id,category,name,value,note}));

  const classDomains={
    Barbarian:['Savaş','Fırtına','Doğa'],Bard:['Işık','Hile','Bilgi'],Cleric:['Yaşam','Işık','Bilgi'],Druid:['Doğa','Yaşam','Fırtına'],Fighter:['Savaş','Bilgi'],Monk:['Bilgi','Yaşam','Işık'],Paladin:['Savaş','Yaşam','Işık'],Ranger:['Doğa','Savaş','Fırtına'],Rogue:['Hile','Bilgi'],Sorcerer:['Fırtına','Işık','Bilgi'],Warlock:['Hile','Bilgi','Ölüm'],Wizard:['Bilgi','Işık','Hile'],Artificer:['Bilgi','Savaş'],
    'Blood Hunter':['Savaş','Ölüm','Bilgi'],Psion:['Bilgi','Hile']
  };

  const angelOrders=[
    {tier:1,name:'Seraflar',title:'İlk Ateşin Tanıkları',role:'İlahi iradenin ham ışığını ve yaratılış antlarını korur.',signs:'Altı kanat gölgesi, yakmayan beyaz alev ve aynı anda duyulan çoklu ses.',powers:['Kutsal alanı arındırır.','Yalan yemini görünür kılar.','Düzlemler arası büyük yarıkları mühürler.'],limits:['Ölümlü siyasetine doğrudan hükmedemez.','Gerçek adını açıklaması kozmik ant ister.'],encounter:'Savaş hedefi olmak yerine bir antlaşmanın şartlarını sınayan yüksek düzeyli varlık olarak kullan.',corruption:'Kusursuzluk takıntısı, merhametsiz arınmaya dönüşebilir.'},
    {tier:2,name:'Keruvlar',title:'Kapıların ve Hatıranın Bekçileri',role:'Yasak bilgi, kutsal eşik ve tanrıların unutulmaması gereken anılarını korur.',signs:'Dört yöne bakan maskeler, göz işlemeli kanatlar ve kendi kendine açılan arşivler.',powers:['Hatırayı mühürler veya geri çağırır.','Eşik aşan varlığı gerçek biçimiyle görür.','Kutsal emaneti yerinden koparılamaz yapar.'],limits:['Koruduğu bilgiyi yorumlamaz.','Doğru parola olmadan iyi niyetliye de geçit vermez.'],encounter:'Bilmece, anahtar ve ahlaki izin gerektiren ilahi arşiv bekçisi.',corruption:'Koruma görevi, bilginin herkesten saklanmasına dönüşebilir.'},
    {tier:3,name:'Tahtlar',title:'Hükmün Taşıyıcıları',role:'İlahi mahkemelerin tarafsız zeminini ve verilen büyük hükümlerin kaydını taşır.',signs:'Dönen ışık halkaları, yazıyla kaplı taş ve gölgesiz bir mahkeme salonu.',powers:['Yeminli tanıklığı bağlar.','Bir hükmün kozmik sonucunu gösterir.','Keyfî büyüyü geçici olarak susturur.'],limits:['Kanıt olmadan karar vermez.','Tanrının emri bile İlahi Yasalarla çatışırsa kurul ister.'],encounter:'Partinin kanıt sunacağı düzlemsel dava veya antlaşma sahnesi.',corruption:'Usule tapınmak, yaşayan gerçeği ve merhameti görmezden bırakabilir.'},
    {tier:4,name:'Hakimiyetler',title:'Göksel Yönetim Kurulları',role:'Alt melek düzenlerini, görev sınırlarını ve düzlemler arası yetki paylaşımını yönetir.',signs:'Havada beliren mühürlü emirler, altın cetvel ve sessizce değişen yıldız haritası.',powers:['Göksel görevlendirme yapar.','Bir bölgenin ilahi yetki sınırını çizer.','Çatışan emirleri geçici uzlaşmaya bağlar.'],limits:['Ölümlünün özgür iradesini iptal edemez.','Kendi görev alanı dışına kurul kararı olmadan çıkamaz.'],encounter:'Oyuncuları resmî göksel elçi yapan veya görev yetkisini tartışan yönetici.',corruption:'Düzen arzusu, ruhsuz bürokrasi ve sorumluluğu emre atmaya dönüşebilir.'},
    {tier:5,name:'Erdemler',title:'Mucize Akımının Koruyucuları',role:'Umut, şifa ve doğa yasasını tamamen bozmayan küçük mucizeleri dünyaya iletir.',signs:'Yağmurda kuru kalan alan, aynı anda açan çiçekler ve nabız gibi atan ışık.',powers:['Kıtlıkta kısa süreli bereket sağlar.','Kırılmış morali ayağa kaldırır.','Bir hastalığın doğasını görünür kılar.'],limits:['Ölümü bedelsiz geri alamaz.','Mucize, özgür seçimin sonucunu tamamen silemez.'],encounter:'Bir bölgeyi kurtaracak mucizenin gerekli insani şartlarını açıklayan rehber.',corruption:'İyi sonuç uğruna seçimleri manipüle etmeye başlayabilir.'},
    {tier:6,name:'Kudretler',title:'Düzlemsel Sınır Muhafızları',role:'Fiend, aberration ve yozlaşmış kutsal güçlerin düzlemler arası istilasını durdurur.',signs:'Kalkan biçimli şafak, zincir sesi ve havada duran mızrak parçaları.',powers:['Fiend geçidini mühürler.','Kutsal veya infernal enerjiyi ayırır.','Bir alanı kısa süreli sürgün çemberine çevirir.'],limits:['Masum taşıyıcıyı içindeki varlıkla birlikte yok edemez.','Uzun savaşta ölümlü çapalara ihtiyaç duyar.'],encounter:'Savunma, ritüel ve tahliye hedefli yüksek riskli düzlemsel çatışma.',corruption:'Her yabancı varlığı düşman görme ve sonsuz savaş arzusuna kapılabilir.'},
    {tier:7,name:'Beylikler',title:'Halkların ve Bölgelerin Hamileri',role:'Şehir, halk, yol veya kurum gibi büyük ölümlü toplulukları gözler; doğrudan yönetmez.',signs:'Şehir arması biçimli hale, rüyalarda ortak sembol ve aynı saatte çalan çanlar.',powers:['Topluluğun ortak korkusunu hisseder.','Bir bölgenin koruyucu işaretini güçlendirir.','Seçilmiş habercilere rüya yollar.'],limits:['Halkın yöneticisini tek başına seçemez.','Topluluğun toplu tercihini zorla değiştiremez.'],encounter:'Bir kalenin koruyucu ruhu, kayıp antı veya yaklaşan toplumsal felaketi haber verir.',corruption:'Topluluğu korumak adına yabancıları ve değişimi reddedebilir.'},
    {tier:8,name:'Başmelekler',title:'Büyük Görevlerin Kumandanları',role:'Tek bir çağın kaderini değiştirebilecek sınırlı görevleri ve göksel birlikleri yönetir.',signs:'Belirgin tek sembol, isimle yankılanan gök gürültüsü ve göğe uzanan silah ışığı.',powers:['Göksel birlik komuta eder.','Büyük kehanetin bir bölümünü açıklar.','Fiend lordunun tezahürünü geri iter.'],limits:['Kehaneti tek başına tamamlayamaz.','Ölümlü şampiyonların yerine son seçimi yapamaz.'],encounter:'Kampanya arkı veren, yardım isteyen veya yöntemleri tartışmalı güçlü müttefik.',corruption:'Göreve bağlılık, ölümlüleri yalnız araç olarak görmeye dönüşebilir.'},
    {tier:9,name:'Melekler',title:'Elçiler, Rehberler ve Muhafızlar',role:'Dua, uyarı, küçük koruma ve gözlem görevleriyle ölümlülere en yakın göksel tabakadır.',signs:'Tek bir tüy, kısa sıcaklık değişimi, aynada ikinci gölge veya anlamlı rüya.',powers:['Kısa uyarı veya işaret verir.','Bir kişiyi tek tehlikeden korur.','Kutsal mesajı bozulmadan taşır.'],limits:['Bütün geleceği bilmez.','Kişinin kararını zorla iyiliğe çeviremez.'],encounter:'Düşük–orta seviyede rehber, tanık, kurtarılacak elçi veya ahlaki ikilem NPC’si.',corruption:'Koruduğu kişiye aşırı bağlanıp tarafsızlığını kaybedebilir.'}
  ];

  const divineLayers=[
    {order:1,name:'İlk Yasalar',who:'Hiçbir tek tanrının sahip olmadığı kozmik ilkeler.',duty:'Özgür irade, ölümün sınırı, adın gücü ve düzlemler arası dengeyi tanımlar.',conflict:'Bir tanrı bu sınırı aşarsa diğer ilahi makamlar müdahale etmek zorunda kalır.'},
    {order:2,name:'Yüksek İlahi Meclis',who:'Kampanyada etkin büyük tanrıların temsilcileri.',duty:'Düzlemsel kriz, tanrısal savaş ve yeni ilahi makam gibi konularda karar verir.',conflict:'Oy birliği nadirdir; ölümlü şampiyonlar çoğu kez kilidi açan kanıtı taşır.'},
    {order:3,name:'Pantheon Divanları',who:'Aynı gelenek veya halkla ilişkili tanrılar ve elçileri.',duty:'İbadet alanı, kutsal gün, ruhların yönü ve dinî yetki anlaşmazlıklarını yönetir.',conflict:'Aynı kavrama sahip iki tanrı bir şehir üzerinde hak iddia edebilir.'},
    {order:4,name:'Göksel Hiyerarşi',who:'Seraflardan meleklere dokuz görev düzeni.',duty:'Kararları göreve, korumaya, kayda ve sahadaki elçilere dönüştürür.',conflict:'Emrin kelimesiyle amacı çeliştiğinde düzenler arasında açık anlaşmazlık çıkar.'},
    {order:5,name:'Ölümlü Ruhban Yapıları',who:'Tapınak, tarikat, manastır, kutsal şövalye ve yerel rahiplik.',duty:'İlahi mesajı günlük yasa, tören, yardım ve siyaset içinde yorumlar.',conflict:'Ölümlü kurum tanrının idealini yanlış, çıkarcı veya çağ dışı yorumlayabilir.'},
    {order:6,name:'Seçilmişler ve Azizler',who:'İnancıyla iz bırakan fakat tanrı olmayan ölümlüler.',duty:'Belirli bir halka örnek, aracı, emanet koruyucusu veya yerel koruyucu olur.',conflict:'Halkın azize duyduğu bağlılık, resmî tapınağın otoritesiyle çatışabilir.'}
  ];

  const divineLaws=[
    {id:'free-will',name:'Özgür İrade Mührü',rule:'Tanrı ve melek, ölümlünün temel seçimini sürekli ve doğrudan ele geçiremez.',breach:'Kalıcı kutsal zihin kontrolü, ilahi mahkemeyi ve rakip güçleri harekete geçirir.',hook:'Bir şehir görünürde kusursuzdur; herkes aynı meleğin emriyle “mutlu” davranır.'},
    {id:'divine-entry',name:'Davet ve Tezahür Yasası',rule:'Büyük ilahi güç maddi dünyaya tam biçimde girmek için davet, emanet veya kırılmış mühür ister.',breach:'Zorla giriş bölgeyi planar yara ve felaketlere açar.',hook:'Kayıp bir taç aslında bir tanrının dünyaya giriş iznidir.'},
    {id:'true-name',name:'Gerçek Adın Dokunulmazlığı',rule:'Bir varlığın gerçek adı izinsiz silinemez; ad varoluş ve hatıra bağıdır.',breach:'Adı silinen ruh, ölüm düzeninden düşüp hayalet boşluk oluşturur.',hook:'Kayıtlardan çıkarılan bir kraliçe artık aynalarda yardım istemektedir.'},
    {id:'death-boundary',name:'Ölüm Sınırı',rule:'Diriliş mümkün olsa da ruhun rızası, uygun zaman ve bedel görmezden gelinemez.',breach:'Zorla geri getirilen ruh bedeni, anıları veya çevreyi çürütür.',hook:'Bir hanedan her kuşakta aynı kralı zorla diriltmektedir.'},
    {id:'oath-weight',name:'Yemin Ağırlığı',rule:'İlahi tanık önünde özgürce verilen ciddi söz gerçek metafizik bağ oluşturur.',breach:'Kasıtlı ihlal işaret, güç kaybı veya avcı bir yemin ruhu doğurabilir.',hook:'İki düşman kaleyi ayakta tutan barış yemininin son tanığı ölmek üzeredir.'},
    {id:'hospitality',name:'Kutsal Sığınma',rule:'Açık sığınma işareti altındaki silahsız misafir, belirlenen kısa süre korunur.',breach:'Sığınağı bozan tarafın kutsal korumaları zayıflar.',hook:'Bir fiend bile geçerli sığınma hakkı isteyince tapınak ikiye bölünür.'},
    {id:'witness',name:'Tanıklık Zinciri',rule:'Büyük ilahi hüküm tek bir tarafın sözüyle değil, bağımsız tanık veya doğrulanabilir iz ister.',breach:'Kanıtsız hüküm Tahtların kayıtlarında geçersiz sayılır.',hook:'Bir meleğin düşüşünü kanıtlayabilecek tek tanık hafızasını kaybetmiş bir goblindir.'},
    {id:'domain-limit',name:'Etki Alanı Sınırı',rule:'Tanrı, başka bir tanrının temel alanını kalıcı olarak ele geçirmek için meclis, düello veya miras gerekir.',breach:'Çalınan domain doğada ve büyülerde çift anlamlı bozulmalar yaratır.',hook:'Güneş doğuyor ama artık ısıtmıyor; Işık alanı iki güç arasında parçalanmıştır.'},
    {id:'mortal-agency',name:'Ölümlü Aracılık',rule:'Dünyayı kalıcı değiştiren ilahi kararın bir ölümlü seçim, emek veya tanıklık çapası olmalıdır.',breach:'Çapasız mucize kısa sürede çözülür veya beklenmedik bedel ister.',hook:'Mucizevi sur her gece kaybolur; inşayı tamamlayacak gerçek bir yemin eksiktir.'},
    {id:'soul-claim',name:'Ruh Üzerinde Tek Hak Yasağı',rule:'Bir ruhun kaderi yalnız sözde aidiyetle değil yaşamı, özgür antı ve gerçek borçlarıyla değerlendirilir.',breach:'Birden çok güç ruhu çekerse ölüm yolu parçalanır.',hook:'Ölen kahramanın ruhunu üç tanrı ve bir fiend aynı anda talep eder.'},
    {id:'redemption',name:'Dönüş Kapısı',rule:'Pişmanlık tek başına suçu silmez; fakat gerçek telafi yolunu hiçbir ilahi makam tamamen kapatamaz.',breach:'Telafiyi imkânsız kılan mutlak hüküm yeni bir günah veya lanet üretir.',hook:'Düşmüş bir başmelek telafi ister; kurbanları onun yardımını reddeder.'},
    {id:'balance',name:'Karşı Ağırlık',rule:'Sınırsız kutsal ya da karanlık güç, düzlemde kendine karşı bir yankı ve direnç doğurur.',breach:'Bir taraf her şeyi bastırırsa gerçeklik yeni şampiyon veya felaket yaratır.',hook:'Kötülüğün tamamen yok edildiği ülke, özgür seçimi de kaybetmeye başlamıştır.'}
  ];

  const deadlySins=[
    {id:'pride',name:'Kibir',virtue:'Tevazu',temptation:'“Yalnız sen doğru görüyorsun; kimseye hesap verme.”',signs:['Özür dileyememe','Başkasının başarısını küçültme','Eleştiriyi ihanet sayma'],stages:['Küçük başarısızlığı inkâr eder.','Müttefik tavsiyesini reddeder ve yalnız karar verir.','Kendisini yasa veya tanrıdan üstün görür.'],redemption:'Hatasını açıkça kabul etmek, yetki paylaşmak ve başkasının liderliğini gerçekten desteklemek.',cult:'Kusursuzluk Aynası tarikatı, seçilmiş kişiyi bütün ilahi yasaların üstünde ilan eder.'},
    {id:'greed',name:'Açgözlülük',virtue:'Cömertlik',temptation:'“Biraz daha biriktir; güven ancak sahip olmakla gelir.”',signs:['Paylaşmaktan kaçınma','Her ilişkiyi fiyata çevirme','Emaneti sahiplenme'],stages:['Gerekenden fazlasını saklar.','Başkalarının ihtiyacını kendi kazancına kullanır.','İnsan, ruh ve hatırayı bile mülk sayar.'],redemption:'Bedel beklemeden değerli bir şeyi doğru sahibine vermek ve yarattığı zararı onarmak.',cult:'Altın Boğaz loncası, ruhları borç senedine çeviren kutsal görünümlü sözleşmeler satar.'},
    {id:'lust',name:'Şehvet / Saplantı',virtue:'Ölçülülük ve Rıza',temptation:'“İstediğin şey sana ait olmalı; sınırlar yalnız korkaklar içindir.”',signs:['Rızayı önemsememe','Kişiyi arzu nesnesine indirgeme','Reddedilmeyi öfkeyle karşılama'],stages:['Sınırları küçükçe zorlar.','Güç veya büyüyle duyguyu manipüle eder.','Başkasının iradesini tamamen sahiplenmeye çalışır.'],redemption:'Sınırı kabul etmek, manipülasyonu bırakmak ve zarar verdiği kişiden karşılık talep etmeden uzak durmak.',cult:'Kadife Taç, sevgi vaadiyle kişisel iradeyi çalan bir fey–fiend anlaşmasıdır.'},
    {id:'envy',name:'Haset',virtue:'Şükran',temptation:'“Onun sahip olduğu sende değilse ikiniz de kaybetmelisiniz.”',signs:['Sürekli kıyaslama','Müttefikin zaferine içerleme','Taklit ve kimlik çalma'],stages:['Başkasının başarısını değersizleştirir.','Onun yerini almak için gizli sabotaj yapar.','Hedefin adını, yüzünü veya kaderini çalmaya çalışır.'],redemption:'Rakibin başarısını korumak, kendi eksiğini dürüstçe kabul etmek ve özgün bir amaç kurmak.',cult:'İkinci Yüzler, yetenekleri değil insanların toplumdaki yerini çalan maskeler kullanır.'},
    {id:'gluttony',name:'Oburluk / Aşırılık',virtue:'İtidal',temptation:'“Boşluğu doldur; kaynak, büyü ve haz tükenmeden tüket.”',signs:['İhtiyaçtan fazlasını alma','Kaynağın sonucunu umursamama','Doymayan büyü kullanımı'],stages:['Payını aşar.','Topluluğun kaynağını kişisel haz için tüketir.','Can, büyü veya hatıraları yiyen doyumsuz varlığa dönüşür.'],redemption:'Gönüllü sınır koymak, kaynağı yenilemek ve kendine ayırdığı payı ihtiyaç sahibine bırakmak.',cult:'Sonsuz Sofra, her ziyafette çevredeki bir yılın bereketini fark edilmeden emer.'},
    {id:'wrath',name:'Öfke',virtue:'Sabır ve Adil Cesaret',temptation:'“Acın ancak daha büyük acıyla sona erer.”',signs:['Orantısız tepki','Teslim olana saldırma','İntikamı adalet sanma'],stages:['Küçük hakareti büyütür.','Dost ve sivilleri hedefe giden engel sayar.','Yıkım dışında hiçbir çözümü kabul etmez.'],redemption:'Öfkeyi inkâr etmeden hedefi sınırlamak, teslimi kabul etmek ve mağdurun istediği onarıma kulak vermek.',cult:'Kızıl Çan, her çaldığında eski bir haksızlığı bugünkü masumlara yöneltir.'},
    {id:'sloth',name:'Tembellik / İhmâl',virtue:'Gayret',temptation:'“Bir başkası yapar; sen görmezsen sorumluluk da yoktur.”',signs:['Bilinen tehlikeyi erteleme','Sorumluluğu sürekli devretme','Umutsuzluğu rahatlığa dönüştürme'],stages:['Kolay görevi savsaklar.','Koruması altındakileri ihmal eder.','Bütün bir düzenin çürümesine seyirci kalır.'],redemption:'Küçük ama somut bir görevi düzenli tamamlamak, gecikmenin zararını üstlenmek ve yardım istemeyi öğrenmek.',cult:'Sessiz Öğle tarikatı, şehirleri uyku ve “nasıl olsa değişmez” düşüncesiyle teslim alır.'}
  ];

  const divineHooks=[
    'Bir Keruvun koruduğu arşivin anahtarı, partinin unuttuğu ortak bir anıdır.',
    'İki Başmelek aynı iyi amacı savunur fakat biri özgür iradeyi, diğeri düzeni öncelemektedir.',
    'Bir kalenin koruyucu Beyliği, yöneticilerin adaletsizliği yüzünden görevini bırakır.',
    'Tahtlar bir tanrıyı yargılamak için ölümlü tanık çağırır; tanık partiden biridir.',
    'Yedi günahın her biri aynı kutsal emanete farklı bir bedel teklif eder.',
    'Bir Melek, koruduğu çocuğu kurtarmak için görev emrini çiğnemiştir.',
    'Kudretlerin mühürlediği kapının öte yanında yalnız fiendler değil masum tutsaklar da vardır.',
    'Bir Erdemin mucizeleri bölgeyi iyileştirirken halkın seçim yapma isteğini yavaşça silmektedir.',
    'İlahi Mecliste kayıp olan tek oy, tanrılaşmayı reddetmiş eski bir azize aittir.',
    'Ölüm Sınırı bozulur; son bir ayda ölenler rüyalarında eve dönmenin yolunu sorar.',
    'Bir tapınak, gerçek tanrısından değil onu taklit eden yozlaşmış Keruvdan vahiy almaktadır.',
    'Kibir günahı bir kahramanın bütün başarısızlıklarını tarih kayıtlarından silmiştir.',
    'Açgözlülük kültünün paraları harcandıkça sahibinin mutlu bir hatırasını alır.',
    'Haset maskesi, iki karakterin species miraslarını bir gece boyunca değiştirir.',
    'Öfke çanı çalınca eski savaşların ruhları bugünkü tarafları ayırmadan saldırır.',
    'Tembellik sisi kaleyi uyutmuyor; halkın tehlikeyi önemsememesini sağlıyor.',
    'Bir tanrı kendi domainini kurtarmak için Etki Alanı Sınırını kırmayı teklif eder.',
    'Özgür İrade Mührünü onarmak için gönüllü olarak verilmiş üç zıt alignment yemini gerekir.'
  ];

  const freezeRows=rows=>Object.freeze(rows.map(row=>Object.freeze({...row})));
  Object.defineProperty(window,'V51_ALIGNMENTS',{value:Object.freeze(Object.fromEntries(Object.entries(alignments).map(([key,row])=>[key,Object.freeze({...row})]))),writable:false,configurable:false});
  Object.defineProperty(window,'V51_JUSTICE_BANDS',{value:freezeRows(justiceBands),writable:false,configurable:false});
  Object.defineProperty(window,'V51_JUSTICE_RULES',{value:freezeRows(justiceRules),writable:false,configurable:false});
  Object.defineProperty(window,'V51_CLASS_DOMAINS',{value:Object.freeze(Object.fromEntries(Object.entries(classDomains).map(([key,value])=>[key,Object.freeze([...value])]))),writable:false,configurable:false});
  Object.defineProperty(window,'V51_ANGEL_ORDERS',{value:freezeRows(angelOrders),writable:false,configurable:false});
  Object.defineProperty(window,'V51_DIVINE_LAYERS',{value:freezeRows(divineLayers),writable:false,configurable:false});
  Object.defineProperty(window,'V51_DIVINE_LAWS',{value:freezeRows(divineLaws),writable:false,configurable:false});
  Object.defineProperty(window,'V51_DEADLY_SINS',{value:freezeRows(deadlySins),writable:false,configurable:false});
  Object.defineProperty(window,'V51_DIVINE_HOOKS',{value:Object.freeze([...divineHooks]),writable:false,configurable:false});
})();
