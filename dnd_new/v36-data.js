/* v36: 94 additional 2014-compatible market records. */
const V36_MARKET_CATALOG=[
  // ŞİFACI — mundane care, supplies and downtime services.
  ['healers-kit-refill','Şifacı Çantası Dolumu','healer',1,250,20,'Şifacı çantasına 5 kullanım geri kazandırır; çantanın 10 kullanım sınırını aşamaz.','Tıbbi Malzeme'],
  ['physician-consult','Hekim Muayenesi','healer',1,100,30,'Yara, hastalık veya belirti değerlendirmesi; tanı için gerekirse Medicine kontrolünü DM yapar.','Şifa Hizmeti',{service:true}],
  ['wound-cleaning','Yara Temizleme ve Dikiş','healer',1,200,20,'Sıradan bir yaranın temizlenip kapatılması; doğrudan HP yenilemez.','Şifa Hizmeti',{service:true}],
  ['recovery-cot','Gözetimli Revir Yatağı','healer',1,500,12,'Bir gecelik temiz yatak, pansuman ve gözetim; long rest kurallarını değiştirmez.','Konaklamalı Tedavi',{service:true}],
  ['quarantine-care','Bir Günlük Karantina Bakımı','healer',2,1000,8,'Bulaşıcı hastalık şüphesi taşıyan bir kişi için izole oda, yemek ve gözetim.','Şifa Hizmeti',{service:true}],
  ['antidote-compounding','Özel Panzehir Hazırlama','healer',2,7500,5,'Bilinen bir zehir örneğine karşı panzehir hazırlanır; örnek ve bir günlük çalışma gerekir.','Uzman Hizmeti',{service:true}],
  ['field-surgeon-day','Saha Cerrahı Sözleşmesi','healer',2,10000,3,'Bir günlük görev için cerrah ve temel malzeme desteği; savaşçı NPC değildir.','Uzman Hizmeti',{service:true}],
  ['recovery-week','Bir Haftalık Yoğun Bakım','healer',3,25000,3,'Yedi günlük güvenli bakım ve rehabilitasyon; hastalık/yaralanma sonucunu DM belirler.','Uzun Süreli Tedavi',{service:true}],

  // DEMİRCİ — missing 2014 weapon-table entries.
  ['light-hammer','Hafif Çekiç','blacksmith',1,200,10,'1d4 ezici; hafif, fırlatma 20/60.','Basit Silah'],
  ['sickle','Orak','blacksmith',1,100,10,'1d4 kesici; hafif.','Basit Silah'],
  ['quarterstaff','Sopa','blacksmith',1,20,12,'1d6 ezici; versatile 1d8.','Basit Silah'],
  ['greataxe','Büyük Balta','blacksmith',2,3000,5,'1d12 kesici; ağır, iki elli.','Savaş Silahı'],
  ['glaive','Glaive','blacksmith',2,2000,4,'1d10 kesici; ağır, reach, iki elli.','Savaş Silahı'],
  ['morningstar','Sabah Yıldızı','blacksmith',2,1500,5,'1d8 delici.','Savaş Silahı'],
  ['trident','Üç Dişli Mızrak','blacksmith',2,500,5,'1d6 delici; fırlatma 20/60, versatile 1d8.','Savaş Silahı'],
  ['war-pick','Savaş Kazması','blacksmith',2,500,5,'1d8 delici.','Savaş Silahı'],

  // ZIRHÇI — official 2014 magic armor families.
  ['leather-plus1','Deri Zırh +1','armorer',3,400000,1,'AC 11 + DEX ve büyülü AC +1; attunement istemez.','Nadir Hafif Zırh'],
  ['breastplate-plus1','Göğüs Zırhı +1','armorer',3,600000,1,'AC 14 + DEX (en fazla +2) ve büyülü AC +1; stealth dezavantajı yoktur.','Nadir Orta Zırh'],
  ['plate-plus1','Plaka Zırh +1','armorer',3,1500000,1,'AC 18 yerine büyülü AC 19; STR 15 ve stealth dezavantajı sürer.','Nadir Ağır Zırh'],
  ['shield-plus2','Kalkan +2','armorer',3,1200000,1,'Normal kalkanın AC +2 bonusuna ek büyülü AC +2 sağlar.','Nadir Kalkan'],
  ['elven-chain','Elf Zinciri','armorer',3,1800000,1,'AC 14 + DEX (en fazla +2); medium armor yeterliliği olmadan da kullanılabilir.','Nadir Zırh'],
  ['dwarven-plate','Cüce Plakası','armorer',3,5000000,1,'Plaka zırhın AC’sine büyülü +2 verir ve zorla hareket ettirilmeyi azaltır.','Çok Nadir Ağır Zırh'],
  ['dragon-scale-mail','Ejderha Pulu Zırhı','armorer',3,2000000,1,'AC 14 + DEX (en fazla +2), seçili ejderha hasarına direnç ve ejderha sezme özelliği.','Çok Nadir Zırh'],
  ['armor-invulnerability','Yenilmezlik Zırhı','armorer',3,20000000,1,'Attunement: büyüsüz hasara direnç; günde bir kez 10 dakika bağışıklık sağlayabilir.','Efsanevi Ağır Zırh'],

  // OKÇU — ammunition containers, magic ammunition and ranged gear.
  ['sling-bullets20','20 Sapan Mermisi','fletcher',1,4,30,'Sapan için 20 kurşun veya düzgün taş mühimmat.','Mühimmat'],
  ['crossbow-bolt-case','Arbalet Oku Kutusu','fletcher',1,100,12,'20 arbalet okunu kuru ve erişilebilir taşır.','Mühimmat Kabı'],
  ['quiver','Sadak','fletcher',1,100,12,'20 oku erişilebilir biçimde taşır.','Mühimmat Kabı'],
  ['shortbow-plus1','Kısa Yay +1','fletcher',3,400000,1,'Saldırı ve hasar zarlarına +1; büyülü silah sayılır.','Yaygın Olmayan Silah'],
  ['light-crossbow-plus1','Hafif Arbalet +1','fletcher',3,450000,1,'Saldırı ve hasar zarlarına +1; loading özelliği sürer.','Yaygın Olmayan Silah'],
  ['arrows-plus1-10','10 Ok +1','fletcher',3,250000,2,'İsabet ve hasara +1 veren 10 büyülü ok; isabetten sonra büyüsü sona erer.','Yaygın Olmayan Mühimmat'],
  ['bracers-archery','Okçuluk Bileklikleri','fletcher',3,500000,1,'Attunement: shortbow/longbow yeterliliği ve bu silahların hasar zarlarına +2 verir.','Yaygın Olmayan Eşya'],
  ['efficient-quiver','Verimli Sadak','fletcher',3,400000,1,'Boyutlar arası bölmelerinde çok sayıda ok, yay ve uzun eşya taşır.','Yaygın Olmayan Eşya'],

  // GENEL EŞYA — missing core adventuring gear.
  ['abacus','Abaküs','general',1,200,10,'Hesap tutma ve ticari kayıtlar için mekanik sayı aracı.','Ekipman'],
  ['backpack','Sırt Çantası','general',1,200,15,'1 cubic foot veya 30 libreye kadar normal taşıma kabı.','Ekipman'],
  ['ball-bearings','1000 Bilye','general',1,100,12,'10 ft kareye dökülür; alandan geçen hedef DC 10 DEX save ile prone olmaktan kaçınır.','Ekipman'],
  ['bell','El Çanı','general',1,100,12,'Alarm düzeneği, işaret veya dikkat çekmek için küçük metal çan.','Ekipman'],
  ['blanket','Battaniye','general',1,50,20,'Soğuk gecelerde kamp ve yolculuk için kalın örtü.','Kamp Ekipmanı'],
  ['block-tackle','Makara Takımı','general',1,100,8,'Sağlam sabitlendiğinde normalde kaldırabileceğinin dört katını kaldırmaya yardım eder.','Ekipman'],
  ['caltrops','20 Dikenli Kapan','general',1,100,12,'5 ft kareye yayılır; geçen hedef DC 15 DEX save başarısızsa 1 delici hasar alır ve yavaşlar.','Ekipman'],
  ['candle','Mum','general',1,1,40,'1 saat boyunca 5 ft parlak ve ek 5 ft loş ışık verir.','Aydınlatma'],
  ['chain10','3 m Demir Zincir','general',1,500,8,'10 ft zincir; kırmak için DC 20 STR kontrolü gerekir.','Ekipman'],
  ['manacles','Kelepçe','general',1,200,8,'Small veya Medium hedefi bağlar; kaçış ve kırma DC’si 20’dir.','Ekipman'],
  ['mess-kit','Yemek Takımı','general',1,20,20,'Kutu, tava, tabak ve kupadan oluşan kişisel kamp seti.','Kamp Ekipmanı'],
  ['steel-mirror','Çelik Ayna','general',1,500,8,'Parlatılmış küçük ayna; köşe kontrolü, sinyal ve kişisel bakım için.','Ekipman'],

  // HAN / BAR — practical information, storage and social services.
  ['cloakroom-storage','Bir Günlük Emanet Dolabı','tavern',1,20,20,'Küçük bir çanta veya silahı numaralı dolapta bir gün saklar.','Han Hizmeti',{service:true}],
  ['noticeboard-post','İlan Tahtası Kaydı','tavern',1,50,20,'Görev, alış veya kayıp ilanını bir hafta han panosunda tutar.','İlan Hizmeti',{service:true}],
  ['private-booth','Özel Görüşme Köşesi','tavern',1,100,12,'Bir saatlik perdeli masa; ses geçirmez veya büyüye karşı korumalı değildir.','Han Hizmeti',{service:true}],
  ['letter-scribe','Mektup Yazdırma','tavern',1,50,20,'Bir sayfalık sıradan mektup yazımı, zarf ve mühürleme.','Yazman Hizmeti',{service:true}],
  ['stablehand-day','Seyis Yardımı','tavern',1,20,12,'Bir bineğin bir günlük temel temizliği, suyu ve bakımı; yem ayrıca alınır.','Ahır Hizmeti',{service:true}],
  ['performer-evening','Ozan veya Gösterici Tutma','tavern',2,200,8,'Bir akşamlık müzik ya da gösteri; otomatik mekanik bonus sağlamaz.','Eğlence Hizmeti',{service:true}],
  ['meeting-hall','Toplantı Salonu','tavern',2,500,5,'Yaklaşık 20 kişilik salonun dört saatlik kullanımı.','Mekân Hizmeti',{service:true}],
  ['guarded-lockbox','Korumalı Kasa Gözü','tavern',3,1000,6,'Küçük değerli eşyalar için bir haftalık kilitli ve nöbetli saklama.','Güvenlik Hizmeti',{service:true}],

  // RESTORAN — core-priced food staples and social dining tiers.
  ['bread-loaf','Bir Somun Ekmek','restaurant',1,2,40,'Bir günlük taze somun; sıradan yiyecek.','Yemek'],
  ['cheese-hunk','Bir Parça Peynir','restaurant',1,10,30,'Dayanıklı küçük peynir parçası; yol erzağına uygundur.','Yemek'],
  ['cured-meat','Kurutulmuş Et Paketi','restaurant',1,30,25,'Bir kişilik tuzlanmış veya kurutulmuş et.','Yemek'],
  ['common-meal','Yaygın Sıcak Öğün','restaurant',1,30,30,'Ekmek, çorba ve küçük et porsiyonundan oluşan standart öğün.','Yemek'],
  ['modest-meal','Mütevazı Sofra','restaurant',1,50,25,'Temiz ve doyurucu tek kişilik öğün; mekanik bonus sağlamaz.','Yemek'],
  ['comfortable-meal','Rahat Sofra','restaurant',2,80,20,'İyi malzeme ve tatlı içeren tek kişilik kaliteli öğün.','Yemek'],
  ['wealthy-course','Varlıklı Menü','restaurant',2,200,12,'Birkaç tabaklı seçkin yemek; sosyal sahne için uygun ortam sağlar.','Yemek'],
  ['aristocratic-course','Aristokrat Menüsü','restaurant',3,400,8,'Nadir malzemeli uzun servis; davet ve prestij içindir, otomatik bonus vermez.','Yemek'],

  // GİZEMLİ DÜKKÂN — official 2014 wondrous items.
  ['wand-secrets','Sırlar Asası','mystic',2,25000,2,'Şarj harcayarak 30 ft içindeki en yakın gizli kapı veya tuzağın yönünü gösterir.','Yaygın Olmayan Asa'],
  ['goggles-night','Gece Görüş Gözlüğü','mystic',2,40000,2,'Kullanıcıya 60 ft darkvision verir; zaten darkvision varsa menzili 60 ft artırır.','Yaygın Olmayan Eşya'],
  ['gloves-thievery','Hırsızlık Eldivenleri','mystic',2,50000,2,'Görünmez eldivenler Sleight of Hand ve kilit açma kontrollerine +5 verir.','Yaygın Olmayan Eşya'],
  ['lantern-revealing','İfşa Feneri','mystic',2,70000,1,'Yandığı parlak ışık alanındaki görünmez yaratık ve nesneleri görünür kılar.','Yaygın Olmayan Eşya'],
  ['medallion-thoughts','Düşünce Madalyonu','mystic',2,100000,1,'Attunement: şarj harcayarak Detect Thoughts büyüsünü kullanır.','Yaygın Olmayan Eşya'],
  ['ring-mind-shielding','Zihin Koruma Yüzüğü','mystic',3,150000,1,'Attunement: düşünce okuma, yalan tespiti ve alignment belirlemeye karşı korur.','Yaygın Olmayan Yüzük'],
  ['cloak-elvenkind','Elf Pelerini','mystic',2,100000,1,'Attunement: gizlenirken Stealth avantajı; seni görmeye çalışanların Perception kontrolü dezavantajlıdır.','Yaygın Olmayan Eşya'],
  ['slippers-spider-climbing','Örümcek Tırmanışı Terlikleri','mystic',2,120000,1,'Attunement: eller serbestken duvar ve tavanda yürüme hızı verir.','Yaygın Olmayan Eşya'],

  // LANETLİ DÜKKÂN — official 2014 cursed items; curse is stated up front.
  ['armor-vulnerability','Zayıflık Zırhı','cursed',3,300000,1,'Attunement ve lanet: bir fiziksel hasar türüne direnç verirken diğer iki türe vulnerability verir.','Lanetli Nadir Zırh'],
  ['berserker-axe','Çılgınlık Baltası','cursed',3,400000,1,'Attunement ve lanet: HP’yi artırır fakat hasar aldığında yakındakilere saldırma çılgınlığı doğurabilir.','Lanetli Nadir Silah'],
  ['demon-armor','İblis Zırhı','cursed',3,700000,1,'Attunement ve lanet: AC +1, Abyssal ve pençe saldırıları verir; çıkarılması zordur.','Lanetli Çok Nadir Zırh'],
  ['shield-missile-attraction','Mermi Çeken Kalkan','cursed',3,350000,1,'Attunement ve lanet: menzilli silah hasarına direnç verir fakat yakındaki mermileri sahibine yöneltir.','Lanetli Nadir Kalkan'],
  ['sword-vengeance','İntikam Kılıcı','cursed',3,250000,1,'Attunement ve lanet: hasar aldığında WIS save başarısızsa saldırgana odaklanmaya zorlar.','Lanetli Silah'],
  ['bag-devouring','Yutan Çanta','cursed',2,120000,1,'Taşıma Çantasına benzer; içine uzanan canlıyı çekip yutmaya çalışır.','Lanetli Çok Nadir Eşya'],
  ['stone-ill-luck','Uğursuzluk Taşı','cursed',2,50000,1,'Şans Taşı gibi görünür; gizli laneti ability check ve saving throwlara −2 uygular.','Lanetli Eşya'],
  ['necklace-strangulation','Boğma Kolyesi','cursed',3,150000,1,'Attunement anında boğaza kilitlenen lanetli kolye; güçlü büyüyle çıkarılana kadar boğar.','Lanetli Nadir Eşya'],

  // SİMYACI — 2014 DMG sample poisons.
  ['assassins-blood','Suikastçı Kanı','alchemist',2,15000,3,'Ingested; DC 10 CON save. Başarısız hedef 1d12 poison hasarı alır ve 24 saat poisoned olur.','Zehir'],
  ['burnt-othur-fumes','Yanmış Othur Dumanı','alchemist',3,50000,2,'Inhaled; DC 13 CON save. Başarısızlıkta 3d6 poison ve turlar boyunca tekrarlanan save’ler.','Zehir'],
  ['crawler-mucus','Sürünen Leşçil Salgısı','alchemist',2,20000,2,'Contact; DC 13 CON save. Başarısız hedef 1 dakika poisoned ve bu sırada paralyzed olur.','Zehir'],
  ['drow-poison','Drow Zehri','alchemist',2,20000,3,'Injury; DC 13 CON save. Başarısız hedef 1 saat poisoned; 5+ farkla başarısızsa unconscious olur.','Zehir'],
  ['essence-ether','Eter Özü','alchemist',3,30000,2,'Inhaled; DC 15 CON save. Başarısız hedef 8 saat poisoned ve unconscious olur.','Zehir'],
  ['malice-poison','Kötücüllük Zehri','alchemist',3,25000,2,'Inhaled; DC 15 CON save. Başarısız hedef 1 saat poisoned ve blinded olur.','Zehir'],
  ['midnight-tears','Geceyarısı Gözyaşları','alchemist',3,150000,1,'Ingested; gece yarısında DC 17 CON save. Başarısızlık 9d6 poison, başarı yarı hasar.','Zehir'],
  ['oil-taggit','Taggit Yağı','alchemist',3,40000,2,'Contact; DC 13 CON save. Başarısız hedef 24 saat poisoned ve unconscious olur.','Zehir'],

  // AHIR VE BİNEKLER — core tack, vehicles and transport.
  ['military-saddle','Askerî Eyer','stable',2,2000,8,'Bilinçsizken binekten düşmemek için yapılan save’lerde avantaj sağlar.','Binek Ekipmanı'],
  ['exotic-saddle','Egzotik Eyer','stable',2,6000,5,'Uçan veya suda giden alışılmadık binekleri sürmek için gerekir.','Binek Ekipmanı'],
  ['sled','Kızak','stable',1,2000,5,'Kar veya buz üzerinde yük ve yolcu taşıyan çekili taşıt.','Taşıt'],
  ['rowboat','Kayık','stable',1,5000,3,'Kıyı ve nehir geçişlerinde kullanılan küçük kürekli tekne.','Su Taşıtı'],
  ['ferry-passage','Yerel Feribot Geçişi','stable',1,10,30,'Bir yolcu ve normal yükü bilinen yakın kıyı noktasına geçirir; binek ücreti ayrıdır.','Ulaşım Hizmeti',{service:true}],

  // TAPINAK — additional 2014 divine spell services.
  ['purify-food-service','Yiyecek ve İçecek Arındırma','temple',1,500,12,'Purify Food and Drink ile 5 ft alandaki büyüsüz yiyecek ve içecekleri zehir/hastalıktan arındırır.','Büyü Hizmeti',{service:true}],
  ['protection-poison-service','Zehirden Korunma','temple',2,5000,8,'Protection from Poison; bir zehri etkisizleştirir ve 1 saat poison direnci/save avantajı verir.','Koruma Hizmeti',{service:true}],
  ['water-walk-service','Su Üstünde Yürüme Ayini','temple',2,10000,5,'En fazla 10 gönüllü hedef 1 saat sıvı yüzeylerde batmadan hareket eder.','Büyü Hizmeti',{service:true}],
  ['tongues-service','Dilleri Anlama Kutsaması','temple',2,15000,5,'Hedef 1 saat konuşulan dilleri anlar ve konuştuğu dili bilen herkes onu anlayabilir.','Büyü Hizmeti',{service:true}],
  ['commune-service','Commune Kehaneti','temple',3,50000,3,'Rahip tanrısına üç evet/hayır sorusu yöneltir; art arda kullanım belirsizlik riski taşır.','Kehanet Hizmeti',{service:true}]
].map(row=>({
  id:'ex-v36-'+row[0],name:row[1],shop:row[2],tier:row[3],priceCopper:row[4],stock:row[5],
  note:row[6],effect:row[7],active:true,ready:true,...(row[8]||{})
}));

V34_MARKET_CATALOG.push(...V36_MARKET_CATALOG);
EX_ALL_CATALOG.push(...V36_MARKET_CATALOG);
