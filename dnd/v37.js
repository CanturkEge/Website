/* v37: player-facing patch notes timeline. */
let v37PatchQuery='';
let v37PatchOrder='desc';

const V37_PATCH_NOTES=[
  {
    version:'2.4',build:'Build 52',title:'Cleric Tanrı Bağı ve 14 İlahi Alan',tag:'CLERIC',tone:'current',
    summary:'Cleric yaratımı 30 ana Forgotten Realms tanrısı, kanonik domain uyumu ve 1–20 seviyeye göre açılan gerçek class/domain mekanikleriyle tamamlandı.',
    added:[
      'Cleric karakter yaratımına 30 ana Forgotten Realms tanrısı eklendi; tanrı seçilince yalnız portfolio alanıyla uyumlu domainler gösterilir.',
      'PHB 2014’ün yedi çekirdek domaini ile Death, Arcana, Forge, Grave, Order, Peace ve Twilight olmak üzere toplam 14 resmî 5e domaini eklendi.',
      'Her domain için 1/3/5/7/9. Cleric seviyelerinde açılan on daima hazırlanmış büyü ve bütün domain özellikleri seviye, action, kullanım, menzil, süre ve save bilgisiyle işlendi.',
      'Cleric ekranına canlı Spell Save DC, spell attack, cantrip sayısı, normal hazırlama hakkı, domain spell sayısı ve 1–9. seviye spell slotları eklendi.',
      'Channel Divinity kullanım sayısı, Turn/Destroy Undead CR eşiği ve Divine Intervention başarı kuralı karakter seviyesine göre otomatik gösterilir.',
      '30 tanrının Appendix B domainleri ile resmî ek kitap uyumlarını karşılaştıran, 128 tanrılık ansiklopedi kartına bağlanan kısa atlas eklendi.'
    ],
    fixed:[
      'Tanrı adının kendi başına STR, AC, proficiency, zar veya spell bonusu verdiği yanılgısı karakter ekranında açık kuralla giderildi; mekanik güç domain özelliğinden gelir.',
      'Eski Cleric karakterleri silinmeden korunur; eksik tanrı/domain bağı oyuncu tarafından bir kez tamamlanabilir, sonra yalnız DM değiştirebilir.',
      'Death Domain oyuncu seçimi DM onayı uyarısıyla korundu; uyumsuz tanrı/domain eşleşmesi hem arayüzde hem sunucu fonksiyonunda reddedilir.',
      'Seçilmiş ana tanrı, v51 Tanrı Yakınlığı hesabında artık açık ve en güçlü gerekçelerden biri olarak tanınır.'
    ],
    changed:[
      'Cleric ağır zırh, martial silah, tool, dil ve skill proficiency özeti seçilen domainin gerçek özelliklerine göre genişler.',
      'Normal hazırlanmış Cleric büyüsü sınırı WIS modifierı + Cleric seviyesi olarak hesaplanır; açılmış domain büyüleri seçiciden çıkarılır ve bu sınıra dahil edilmez.',
      'Forge Cleric’in 6. seviyedeki Soul of the Forge özelliği, heavy armor kuşanıldığında aktif AC hesabına gerçek +1 bonus olarak uygulanır.',
      'Oyuncunun ilk tanrı/domain kaydı tek atomik işlemde yapılır ve mevcut v31 kayıt birleştirme hattı, karakterler ile hazırlanmış büyüler korunur.',
      'v52 kurulumu için v52-update.sql dosyası Supabase SQL Editor’da bir kez çalıştırılmalıdır; dosya veri silmez ve eski RPC’leri değiştirmez.'
    ]
  },
  {
    version:'2.3',build:'Build 51',title:'Adalet, Alignment ve İlahi Düzen',tag:'İLAHİ',tone:'current',
    summary:'Gizli Karma defteri ikinci bir Adalet ekseniyle birleşti; otomatik 9’lu alignment, class/species tabanlı tanrı yakınlığı, ilahi lore ansiklopedisi ve gruplanmış kısa ana menü eklendi.',
    added:[
      'DM’ye özel −100 / +100 Adalet ekseni eklendi: kaotik/keyfî tutumdan yasal, tutarlı ve hesap verebilir adalete uzanan beş açıklamalı kademe bulunur.',
      'Adil süreç, yemin, yetki, haklar, ceza, düzen, yolsuzluk, isyan, merhamet, sözleşme ve hesap verme için 44 uygulanabilir Adalet referansı eklendi.',
      'Karma İyi/Kötü, Adalet Yasal/Kaotik ekseni olarak birleştirildi; LG, NG, CG, LN, N, CN, LE, NE ve CE eğilimi puan eşiklerinden otomatik hesaplanır.',
      'Her karakter için class, subclass, species, subspecies, Karma, Adalet, deity alignmentı, domaini ve portfolio alanını birlikte değerlendiren ilk üç Tanrı Yakınlığı önerisi eklendi.',
      'İlahi Düzen Ansiklopedisine dokuz melek düzeni, altı ilahi yönetim katmanı, on iki kozmik yasa, yedi ölümcül günah yozlaşma yolu ve 18 DM görev kancası eklendi.',
      'Ana menü Karakter & Parti, Macera & Savaş, Lonca & Ekonomi, Dünya & Kayıtlar, Masa İletişimi ve Rehber & Arşiv olarak açılır/kapanır gruplara ayrıldı.'
    ],
    fixed:[
      '“Neutral Evil class mı?” belirsizliği giderildi; sonuç açıkça class değil, otomatik alignment eğilimi olarak etiketlendi ve gerçek class ayrı gösterildi.',
      'Karma ile kurala uyma davranışının tek puanda karışması giderildi; iyi amaç ile adil yöntem artık iki ayrı geçmişte takip edilebilir.',
      'Zalim yasaya körü körüne uymanın otomatik Adalet artışı sayılması engellendi; hak, delil, orantı ve hesap verebilirlik açık değerlendirme ölçütü oldu.',
      'Uzayan sol menüde masaüstünde sayfa bulma ve telefonda gereksiz kaydırma azaltıldı; aktif sayfanın grubu otomatik açık kalır.',
      'Eski Karma hareketlerinin kaybolması önlendi; v44KarmaLedger kayıt biçimi, değerleri ve son 100 geçmiş satırı değiştirilmeden kullanılır.'
    ],
    changed:[
      'Karma ekranı karakter şeridi, iki canlı eksen kartı, 3×3 alignment matrisi, tanrı yakınlığı, ayrı geçmişler ve sekmeli referans tablosuyla tamamen yenilendi.',
      'Tanrı yakınlığı rol yapma önerisidir; karaktere otomatik stat, proficiency, AC, spell, domain veya zar bonusu vermez ve oyuncuya gizli kalır.',
      'Melek hiyerarşisi, ilahi yönetim, kozmik yasalar ve ölümcül günahlar açıkça kampanyaya özel homebrew lore olarak ayrıldı; 2014 çekirdek kuralı gibi sunulmaz.',
      'Menü grupları açık/kapalı durumunu kampanya ve role göre yerelde hatırlar; mevcut sayfa buttonları taşınır, yeniden üretilmediği için eski eylem akışları korunur.',
      'v51 yeni SQL gerektirmez; Adalet mevcut kampanya state’i ve bulut kayıt kuyruğunda saklanır, karakter ve diğer sistem verileri değiştirilmez.'
    ]
  },
  {
    version:'2.2',build:'Build 50',title:'200 Görevlik Atama Panosu',tag:'GÖREV',tone:'current',
    summary:'200 ayrıntılı görev; oyuncuya açık bilgi ile DM sırrını ayıran, partiye veya seçili oyunculara atama ve durum takibi yapan gerçek görev panosunda toplandı.',
    added:[
      'DM ve oyuncu sol menüsüne ayrı Görev Panosu eklendi; Rehberdeki eski 50 fikir düğmesi yeni panoya yönlenen 200 görev kısayoluyla değiştirildi.',
      'Mevcut 50 görev genişletildi, 150 yeni görev eklendi: toplam 200 benzersiz görev; altı seviye bandı, 12 bölge ve 25+ görev türü içerir.',
      'Her görevde oyuncu özeti, hedefler, bilinen ipuçları, önerilen skill/DC kontrolleri, beklenen karşılaşma, süre, zorluk ve bölge bilgisi bulunur.',
      'Her görevde yalnız DM’nin gördüğü ters köşe, gizli bilgi, gizli ödül, başarısızlık sonucu ve parti/seviye ölçekleme alanları bulunur.',
      'Görevler bütün partiye veya seçili karakter/oyunculara atanabilir; karakteri henüz bağlanmamış oyuncu hesabı da hedeflenebilir.',
      'Taslak, Teklif Edildi, Aktif, Tamamlandı, Başarısız ve Arşiv durumları; yeniden atama, ödülü aç/gizle ve son işlem geçmişi eklendi.',
      'Katalog dışından görev yazmak için aynı açık/gizli ayrımını kullanan Özel Görev formu eklendi.'
    ],
    fixed:[
      'Oyuncunun gizli ödülü, ters köşeyi veya DM notunu görev kartında görmesi engellendi; ödül varsayılan olarak kapalıdır.',
      'Eski Masa ekranındaki basit görevlerin kaybolması önlendi; kayıtlar silinmeden panoya bir kez “Eski Görev” olarak taşınır.',
      'Uzun görev listelerinin sayfayı ve telefonu yavaşlatması önlendi; katalog ilk 30 kartı çizer ve arama 120 ms gecikmeyle çalışır.',
      'Bulut eşitlemesinde açık görev detaylarının kapanmaması için kartlar mevcut açık-panel/scroll koruma sistemiyle uyumlu tutuldu.'
    ],
    changed:[
      'Atanmış görevler oyuncu hesabı/karakter bağlantısına göre filtrelenir; Taslak ve Arşiv kayıtları oyuncu tarafında çizilmez.',
      'Görev filtreleri masaüstünde sabit araç çubuğu, telefonda yatay kaydırılabilen dokunmatik şerit olarak düzenlendi.',
      'Her durum değişikliği, yeniden atama, ödül görünürlüğü ve arşiv işlemi son 24 kayıtlık DM geçmişinde tutulur.',
      'v50 yeni SQL gerektirmez; görev panosu mevcut kampanya state’i ve güvenli bulut kayıt kuyruğunu kullanır.'
    ]
  },
  {
    version:'2.1',build:'Build 49',title:'2014 Tanrılar Ansiklopedisi',tag:'REHBER',tone:'current',
    summary:'Altı pantheon grubundaki 128 tanrı; domain, sembol, inanç yorumu, cleric karşılığı ve DM kancalarıyla aranabilir bir ansiklopedide toplandı.',
    added:[
      'DM ve oyuncu sol menüsüne ayrı Tanrılar sayfası; Rehberin üstüne de tek dokunuşluk Tanrılar Ansiklopedisi kısayolu eklendi.',
      'Unutulmuş Diyarlar, Kelt, Yunan, Mısır, İskandinav ve insan olmayan halklar için toplam 128 ayrı tanrı kaydı eklendi.',
      'Her kayda alignment, 2014 Appendix B önerilen domaini, kutsal sembol, etki alanı, tipik takipçiler, üç inanç ilkesi, adak fikri ve rol yapma yönü eklendi.',
      'Her tanrıya doğrudan kullanılabilir bir DM görev kancası ve Cleric/domain mekanik açıklaması eklendi.',
      'Tanrı adı, kavram, sembol, takipçi, alignment, domain ve görev kancalarında çalışan birleşik arama; pantheon/domain/alignment filtreleri eklendi.'
    ],
    fixed:[
      'Tanrı seçiminin otomatik STR, AC, proficiency, zar veya spell bonusu verdiği yanılgısı sayfanın üstündeki açık mekanik notla giderildi.',
      'Aynı adı taşıyan fakat farklı pantheonlarda yorumlanan Tyr, Oghma, Silvanus, Surtur ve Thrym kayıtlarının birbirine karışması ayrı kimliklerle önlendi.',
      'Ölüm Domaininin 2014 DMG seçeneği olduğu ve oyuncu kullanımı için DM onayı gerektiği ilgili kartlarda açıkça işaretlendi.',
      'Uzun inanç açıklamalarının menüyü şişirmesi önlendi; tanrı kartları varsayılan olarak kapalı başlar.'
    ],
    changed:[
      'Liste ilk 36 kartı çizer; arama 128 kaydın tamamında çalışır ve yazarken 120 ms gecikmeyle yenilenir.',
      'Pantheon sayaçları tıklanabilir hızlı filtreye dönüştürüldü; masaüstü, tablet ve telefonda yatay kaydırılabilir yapı kullanır.',
      'Tarihsel pantheonlar gerçek dünya din anlatısı olarak değil, 2014 kitabındaki fantastik oyun yorumu olarak açıkça etiketlendi.',
      'v49 yeni SQL gerektirmez; ansiklopedi salt okunurdur ve mevcut kampanya, karakter, class/subclass, envanter veya bulut kayıtlarına dokunmaz.'
    ]
  },
  {
    version:'2.0',build:'Build 48',title:'4.000 Ganimet, Büyü Materyalleri ve Gündelik Harikalar',tag:'GANİMET',tone:'current',
    summary:'Ganimet kataloğu tam 4.000 açıklamalı kayda çıktı; büyü materyalleri, gündelik eşyalar, keyif içecekleri ve oynanabilir özel araçlar dengeli nadirlik katmanlarına yerleştirildi.',
    added:[
      'Katalog nadirlik dağılımı 900 Sıradan, 1.000 Yaygın, 750 Seyrek, 550 Nadir, 380 Çok Nadir, 310 Efsanevi ve 110 Artefakt olacak şekilde tam 4.000 kayda dengelendi.',
      'Materyal kullanan 184 adet 2014 SRD büyüsü için büyü adıyla eşleşen gerçek Büyü Materyal Kiti eklendi.',
      'Her büyü kitine materyalin Türkçe açıklaması, varsa zorunlu GP değeri, focus/component pouch ile ikame kuralı ve büyünün materyali tüketip tüketmediği eklendi.',
      '722 sıradan gündelik eşya; kamp, sofra, giyim, yazı, zanaat, kervan ve rol yapma kullanım açıklamalarıyla eklendi.',
      '288 keyif veren fantastik içecek; süreli zararsız eğlence etkileri veya küçük sosyal katkılarla eklendi.',
      '500 tekrar kullanılabilir/tüketilebilir gündelik büyülü yardımcı ve 46 özel isimli eşya eklendi.',
      'Ölülerin Son İzleri Kolyesi, Kayıp Eşya Çanı, Son Söz Balmumu, Bir Dakikalık Hayalet Feneri ve benzeri açık activation/kullanım sınırı taşıyan özel eşyalar eklendi.'
    ],
    fixed:[
      'Katalog sayısı büyürken sıradan ve yaygın kayıtların nadir eşyalardan az kalması giderildi.',
      'Büyü materyalinin ne zaman gerektiği, focus ile değiştirilip değiştirilemeyeceği ve kullanım sonunda silinip silinmeyeceği belirsizliği giderildi.',
      'Ganimetin yalnız silah, zırh ve aksesuar hissi vermesi; çok sayıda gündelik, tüketilebilir, alet, belge ve bileşen kaydıyla dengelendi.',
      '4.000 uzun açıklamanın her arama tuşunda tekrar normalize edilmesi engellendi; arama metni önbelleğe alındı ve 120 ms gecikmeli filtreleme eklendi.'
    ],
    changed:[
      'Ganimet Ansiklopedisine Büyü Materyalleri, Gündelik Eşyalar, Keyif Veren Sıvılar, Kullanışlı Büyülü Eşyalar ve Özel Etkili Eşyalar filtresi eklendi.',
      'Eşya kartları artık Action/Bonus Action/ritüel kullanımını, günlük hakkı, bağlı büyüyü ve zorunlu materyal GP değerini ayrı okunabilir etiketlerde gösterir.',
      'Nadirlik adetleri ganimet ekranının üstünde tıklanabilir sayaçlar olarak gösterilir; telefonda yatay kaydırılır ve kart listesi yine yalnız ilk 60 sonucu çizer.',
      'Önceki 2.260 kaydın katalog sırası ve ID’leri aynen korundu; mevcut karakter, envanter, kuşanım, yerdeki eşya ve ganimet geçmişi değişmez.',
      'v48 yeni SQL gerektirmez; v45-update.sql daha önce çalıştırılmış olmalıdır.'
    ]
  },
  {
    version:'1.9',build:'Build 47',title:'2014 Büyü Kitabı ve Gerçek Büyü Sayfaları',tag:'BÜYÜ',tone:'current',
    summary:'2014 SRD büyülerinin tamamı aranabilir bir kitapta toplandı; aynı kayıtlar artık ganimet üreticide tek tek büyü sayfası olarak düşer.',
    added:[
      'DM ve oyuncu menüsüne cantrip–9. seviye 319 kayıtlık Büyü Kitabı eklendi.',
      'Büyü adı, seviye, class, okul, Action türü, concentration ve ritüel için birlikte çalışan arama/filtreler eklendi.',
      'Her büyüye masada adım adım kullanım, spell attack/save formülü, menzil, alan, süre, komponent, materyal, zarlar ve yüksek slot açıklaması eklendi.',
      'Ganimet kataloğuna her 2014 SRD büyüsü için adı ve gerçek seviyesi belli tek kullanımlık Büyü Sayfası eklendi.',
      'Büyü sayfalarına 2014 scroll rarity, sabit save DC/saldırı bonusu ve yüksek seviye okuma kontrolü eklendi.'
    ],
    fixed:[
      'Genel “DM bir büyü seçsin” parşömenleri kaldırıldı; ganimette hangi büyünün çıktığı artık açıkça yazıyor.',
      'Büyü kartlarında hangi zarı kimin atacağı, hangi class statının kullanılacağı ve concentration takibinin belirsiz kalması giderildi.',
      'Uzun büyü metinlerinin sayfayı kaplaması önlendi; kart ve tam kural metni ayrı ayrı kapalı başlar.',
      '8. seviye scroll nadirliği 2014 tablosuna göre Very Rare olarak düzeltildi.'
    ],
    changed:[
      'Rehberin üstüne tek dokunuşla Büyü Kitabı’na geçiş eklendi; katalog telefonda yatay filtre şeridi ve tek sütun kartlarla çalışır.',
      'Büyü Kitabı ile loot sayfaları aynı veri kaynağını kullanır; ad, seviye, class veya açıklama iki yerde farklılaşmaz.',
      'Liste performans için 48 kartlık parçalar hâlinde açılır; arama her zaman 319 kaydın tamamında yapılır.',
      'v47 yeni SQL gerektirmez; mevcut karakter, hazırlanmış büyü, envanter, ganimet geçmişi ve kampanya kayıtları korunur.'
    ]
  },
  {
    version:'1.8',build:'Build 46',title:'Karakter Föyü ve Sınıflandırılmış Envanter',tag:'GÖRSEL',tone:'current',
    summary:'Karakter ekranı tam bir oyun föyüne dönüştü; envanter kullanım türlerine ayrıldı ve bütün kuşanma yuvaları tek menüden görünür oldu.',
    added:[
      'Karakterim ekranına HP, aktif AC, hız, inisiyatif, proficiency, pasif Farkındalık, büyü statı/Hit Die ve ability özetleri eklendi.',
      'İki silah, zırh, kalkan, büyü odağı ve bütün aksesuar/beden yuvalarını gösteren ayrı Kuşanma Menüsü eklendi.',
      'Envantere sekiz kullanım sınıfı, kategori filtreleri, metin araması ve kayıt/adet sayaçları eklendi.',
      'Karakter föyüne background, skill/save proficiency, hazır büyü, lonca, species/subspecies, subclass, direnç/zayıflık ve efekt özetleri eklendi.'
    ],
    fixed:[
      'Kuşanılabilir, tüketilebilir, mühimmat, malzeme, değerli ve hikâyesel eşyaların aynı uzun listede birbirine karışması giderildi.',
      'Hangi ekipmanın hangi yuvada aktif olduğunun yalnız eşya kartı aranarak anlaşılabilmesi giderildi.',
      'Çok uzun envanterlerde gerekli eşyaya ve işlem butonlarına ulaşmanın zor olması arama, filtre ve kapalı grup yapısıyla düzeltildi.',
      'Dar ekranlarda eşya aksiyonlarının sıkışması ve karakter değerlerinin okunmasının zorlaşması yeni responsive düzenle giderildi.'
    ],
    changed:[
      'Eşya açıklaması ve eylemleri varsayılan olarak kapalıdır; karta basıldığında mevcut Kuşan/Çıkar, transfer, yere atma ve silme butonları açılır.',
      'Karakter kartı, ekipman alanı ve envanter görünümü ortak parşömen/panel diliyle görsel olarak yenilendi.',
      'Sınıflandırma yalnız arayüz katmanındadır; mevcut eşya kayıtları, ID’ler, kuşanılmış durumlar ve bulut işlem akışları değiştirilmez.',
      'v46 yeni SQL gerektirmez; sunucu tarafındaki güvenli yuva doğrulaması v45-update.sql üzerinden devam eder.'
    ]
  },
  {
    version:'1.7.1',build:'Build 45',title:'Kuşanma Sistemi ve Ganimet Dengesi',tag:'GÜNCEL',tone:'current',
    summary:'Yalnız gerçek ekipman kuşanılabilir hâle getirildi; sandıklar artık katalogdaki silah bolluğuna kapılmadan çeşitli ve kotalı ganimet üretir.',
    added:[
      'Silah, zırh, kalkan, büyü odağı ve gerçekten giyilen aksesuarlar için açık kuşanma yuvaları eklendi.',
      'Tek zırh, kalkan, odak ve beden yuvası; en fazla iki silah, iki yüzük ve üç genel büyülü eşya sınırı eklendi.',
      'Taş, toprak, kömür, kırık çivi, cam, kemik, yaprak ve benzeri 100 açıklamalı ıvır zıvır kaydı ganimet kataloğuna eklendi.',
      'Kuşanma türünü ve yuva sınırını bulutta da doğrulayan inventory_equip_v45 işlemi eklendi.'
    ],
    fixed:[
      'Yalnız AC, saldırı, hasar, büyü veya stat bonusu alanı bulunduğu için iksir, taş, mücevher, mühimmat ve diğer ganimetlerin Kuşan düğmesi göstermesi giderildi.',
      'Eski kayıtlarda yanlışlıkla kuşanılmış kuşanılamaz eşyaların AC, save ve stat hesaplarına bonus vermesi engellendi.',
      'Rastgele üreticide 672 silah kaydının katalog büyüklüğü nedeniyle aynı sandığı silahla doldurması giderildi.',
      'Ayna, fener, kum saati ve zar takımı gibi elde kullanılan aksesuarların giyilebilir aksesuar sayılması engellendi.'
    ],
    changed:[
      'Her kap artık kategori ağırlığı ve kesin kota kullanır: genel sandıklarda en fazla iki silah, bir zırh ve kap türüne göre sınırlı toplam ekipman çıkar.',
      'Savaşçı kasası savaş malzemesi ağırlığını korurken kalan sonuçları mühimmat, bakım aleti, tüketim ve hurdayla doldurur; yaratık ini özellikle kırık/önemsiz ganimete ağırlık verir.',
      'Kolye, yüzük, broş, bileklik, küpe, pelerin, eldiven, kemer, çizme, mercek ve taç artık kendi mantıksal beden yuvasını kullanır.',
      'Mevcut karakterler, class/subclass, envanter eşyaları ve ganimet geçmişi silinmez; yalnız hatalı equipped işareti temizlenir.'
    ]
  },
  {
    version:'1.7',build:'Build 44',title:'Gizli Karma ve Ganimet Üretici',tag:'GANİMET',tone:'system',
    summary:'DM’ye özel karma defteri ile fiziksel kap kurallarına uyan, 1.900’den fazla açıklamalı kayıt kullanan rastgele ganimet sistemi eklendi.',
    added:[
      'Oyuncu menülerinde görünmeyen −100 / +100 aralıklı karakter karma defteri, yedi ahlaki kademe ve DM event fikirleri eklendi.',
      'İyilik, merhamet, adalet, hırsızlık, masuma zarar, ihanet, zulüm ve bağlam için 48 satırlık uygulanabilir karma referans tablosu eklendi.',
      'Her karma hareketi için neden, önceki/sonraki değer, tarih ve son işlemi geri alma geçmişi eklendi.',
      'Seviye 1–10, 14 fiziksel kap, 10 tema, dört hazine kalitesi ve yedi nadirlik seçebilen DM Ganimet Üretici eklendi.',
      'Silah, zırh, kalkan, aksesuar, odak, iksir, parşömen, bileşen, taş, belge, alet ve mühimmat içeren 1.900’den fazla açıklamalı ganimet kaydı eklendi.',
      'Üretilen eşyaları seçerek yerdeki ortak alana bırakma veya bütün mekanik alanlarıyla karakter envanterine verme eklendi.',
      'Son 30 ganimeti saklayan geçmiş ve elle arayıp sonuca eşya ekleten Ganimet Ansiklopedisi eklendi.'
    ],
    fixed:[
      'Madeni para kesesinden gürz, yay, zırh veya şişe gibi fiziksel olarak sığmayan eşya çıkması kap boyutu ve kategori kurallarıyla engellendi.',
      'Büyücü, savaşçı, simyacı, tapınak, avcı ve hırsız kaplarının alakasız ganimet üretmesi tema ağırlığıyla engellendi.',
      'Binlerce katalog kaydının tek seferde DOM’a basılıp menüyü ağırlaştırması önlendi; filtreli ilk 60 kayıt gösterilir.'
    ],
    changed:[
      'Düşük seviye/yıpranmış sandıklarda bile artefakt için 1/100.000.000, efsanevi sürpriz için sonraki 1/10.000.000 uç ihtimal bulunur.',
      'Sandık sonucu yalnız para, yalnız eşya veya birden çok eşya + para olabilir; kap türü adet ve para dağılımını değiştirir.',
      'Karma otomatik değişmez: niyet ve bağlam kararını DM verir; oyunculara herhangi bir puan veya geçmiş gösterilmez.',
      'Yeni iki yönetim ekranı masaüstü, tablet ve telefonda yeniden akışkan tek sütun düzene iner; mevcut buton ve kayıt sistemleri korunur.'
    ]
  },
  {
    version:'1.6.4',build:'Build 43',title:'Hazırlanmış Büyü Görünümü Hotfix',tag:'HOTFIX',tone:'system',
    summary:'DM ve oyuncu karakter ekranlarında hazırlanmış büyülerin ad, seviye ve açıklama alanlarını undefined gösteren veri biçimi çakışması giderildi.',
    added:[
      'Hazırlanmış büyüler için nesne, eski dizi, yalnız ID, yalnız ad ve eski snake_case kayıtlarını okuyabilen ortak dönüştürücü eklendi.',
      'Hazır kütüphanede bulunmayan eski büyüler silinmek yerine mevcut ad, seviye ve açıklamasıyla gösterilir.'
    ],
    fixed:[
      'Karakter ayrıntısında “undefined. seviye — undefined” görünen hazırlanmış büyü kartları düzeltildi.',
      'DM Karakterler ve oyuncu Yetenekler ekranlarının aynı büyü kaydını farklı biçimde yorumlaması giderildi.',
      'Boş veya bozuk tek bir eski kaydın bütün hazırlanmış büyü bölümünü bozması engellendi.'
    ],
    changed:[
      'Büyü kartları artık her zaman ad, cantrip/seviye, açıklama, kullanım süresi, menzil, süre, bileşen, slot ve zar/çözüm alanlarıyla açılır.',
      'Mevcut hazırlanmış büyü seçimleri korunur; yeni SQL veya oyuncuların büyüleri yeniden seçmesi gerekmez.'
    ]
  },
  {
    version:'1.6.3',build:'Build 42',title:'Zar Seçimi Kalıcılık Hotfix',tag:'ZAR',tone:'combat',
    summary:'Zar ocağındaki seçimler günlük yenilendiğinde, bulut eşitlemesinde, sayfaya dönünce veya tarayıcı yenilenince artık sıfırlanmıyor.',
    added:[
      'Zar tercihleri oyuncu ve kampanya bazında cihazda saklanır; başka oyuncunun veya başka kampanyanın seçimiyle karışmaz.',
      'Son zar sonucu, formül ve tek tek zar değerleri ekran yeniden çizildikten sonra Zar Ocağı üzerinde kalır.',
      'Seçili zar düğmesine erişilebilir aria-pressed durumu eklendi.'
    ],
    fixed:[
      'Zar günlüğü yenilendiğinde seçili d2–d100/Fate zarının görsel seçiminin kaybolması giderildi.',
      'Bulut eşitlemesi ve sayfa yeniden çizimi sırasında kontrol/saldırı seçimi, zar adedi, bonus ve özel formülün varsayılana dönmesi giderildi.',
      'Bir atıştan hemen sonra sonuç alanının tekrar “Zar türünü seç” yazısına dönmesi giderildi.'
    ],
    changed:[
      'Otomatik skill bonusu yeniden hesaplanmaya devam eder; oyuncunun elle yazdığı bonus ise yeniden çizimde korunur.',
      'Zar tercihleri ortak kampanya verisine yazılmadığı için diğer oyuncuların ekranını veya bulut kayıt sırasını etkilemez.'
    ]
  },
  {
    version:'1.6.2',build:'Build 41',title:'Efekt ve Lonca Yönetimi Düzeltmesi',tag:'YÖNETİM',tone:'system',
    summary:'Efektlerin kaldırılamaması giderildi; lonca, NPC eşyası ve özel yetenekler için eksik DM müdahale kontrolleri tamamlandı.',
    added:[
      'Karakter kartlarına süreli ve süresiz kayıtları birlikte gösteren Efektleri Yönet penceresi eklendi.',
      'Lonca sayfasına üye ekleme/çıkarma, ad değiştirme, ortak eşya ekleme/düzenleme/silme ve karaktere aktarma araçları eklendi.',
      'Lonca kasası DM para düzenleme kontrolleri doğrudan Lonca menüsüne taşındı.',
      'NPC Eşya düğmesine çalışan envanter penceresi; özel yeteneklere düzenleme ve silme araçları eklendi.'
    ],
    fixed:[
      'Savaştan gelen nesne biçimli efektlerin eski metin karşılaştırması yüzünden kaldırılamaması giderildi.',
      'Karakter ile encounter arasında efekt süresi ve kimliğinin kaybolması önlendi.',
      'Oyuncu Karakterim ve Parti kartlarında nesne efektlerin [object Object] görünmesi giderildi.',
      'Lonca sayfası açıldığında kasa verisinin yüklenmesine rağmen ekranın eski bakiyede kalması düzeltildi.',
      'Yeni lonca görünümünde kaybolan DM envanter ve üyelik müdahalesi geri getirildi.',
      'NPC Defteri içindeki işlevsiz Eşya düğmesi çalışır hale getirildi.'
    ],
    changed:[
      'Efektler düz metin veya süreli kayıt olarak gelse de tek uyumlu veri hattından yönetilir.',
      'DM’nin lonca üyeliği, para ve eşya düzenlemeleri oyuncu lonca hareket geçmişine eklenmez.',
      'Yeni yönetim panelleri masaüstünde çok sütunlu, telefonda tek sütun ve büyük dokunma alanlıdır.'
    ]
  },
  {
    version:'1.6.1',build:'Build 40',title:'Market Buton Çakışması Hotfix',tag:'HOTFIX',tone:'system',
    summary:'Market hediyesinin onay düğmesini Bonuslu Eşya Ver penceresine yönlendiren ortak veri etiketi çakışması kaldırıldı.',
    added:[],
    fixed:[
      'Market hediyesi onaylanırken yanlışlıkla Bonuslu Eşya Ver penceresinin açılması giderildi.',
      'Karakter ekranındaki Bonuslu Eşya Ver dinleyicisi yalnız gerçek bir karakter ID’si taşıyan düğmelerle sınırlandı.',
      'Market onay düğmesi kendine ait data-v39-market-item etiketiyle diğer envanter işlemlerinden tamamen ayrıldı.'
    ],
    changed:[
      'Market hediyesi ve manuel bonuslu eşya verme akışları artık aynı sayfada birbirini yakalamadan bağımsız çalışır.'
    ]
  },
  {
    version:'1.6',build:'Build 39',title:'Market Hediye Akışı Düzeltmesi',tag:'MARKET',tone:'system',
    summary:'DM artık marketteki herhangi bir eşya, hizmet veya bineği eski SQL fonksiyonuna bağlı kalmadan güvenle karaktere verebilir.',
    added:[
      'Hedef karakter, adet ve isteğe bağlı stoktan düşme seçeneği olan yeni market hediye penceresi eklendi.',
      'Hediye edilen kayda benzersiz envanter ID’si ve kaynak market ID’si atanır; zırh, silah, stat, binek ve hizmet özellikleri eksiksiz korunur.'
    ],
    fixed:[
      'Eski inventory_give_market SQL fonksiyonu eksik veya sürümü eski olduğunda Oyuncuya Ver düğmesinin çalışmaması giderildi.',
      'Geçersiz hedef, hatalı adet ve yetersiz stok seçimlerinin sessizce bozuk işlem üretmesi engellendi.',
      'Aynı market kaydının farklı oyunculara verilmesinde tekrarlanan envanter ID’sinin bulut birleşmesinde çakışma ihtimali kaldırıldı.'
    ],
    changed:[
      'Ücretsiz DM hediyesi varsayılan olarak market stokunu değiştirmez; DM isterse Stoktan düş seçeneğini açabilir.',
      'İşlem mevcut sıralı bulut kayıt hattından geçirilir ve kayıt tamamlanmadan başarılı bildirimi gösterilmez.',
      'Hediye penceresi telefon ekranlarında tam genişlikte, büyük dokunma alanlarıyla gösterilir.'
    ]
  },
  {
    version:'1.5',build:'Build 38',title:'Yol Ağı ve Taktik Savaş Alanı',tag:'SAVAŞ',tone:'combat',
    summary:'On iki kale gerçek yol süreleriyle bağlandı; encounter sistemi sis ve görüş kullanan kareli savaş tahtasına dönüştü.',
    added:[
      'Haritadaki 12 kale arasına 23 bağlantılı yol, yol parçası süreleri, arazi/risk açıklamaları ve en kısa rota hesabı eklendi.',
      'Yaya, sıradan binek, savaş bineği, egzotik binek ve uçan ulaşım için açık yüzde süre azaltma kuralları eklendi.',
      'DM için 8–40 sütun ve 8–30 satır arasında boyutlandırılabilen kareli taktik savaş alanı eklendi.',
      'Oyuncu, NPC ve hazır yaratıkları sürükle-bırak veya telefonda dokun-yerleştir ile encounter ve haritaya birlikte ekleme eklendi.',
      'Karaçam Pususu, Yıkık Taç Salonu, Eşkıya Kampı, Meşalesiz Mahzen, Kırık Köprü ve Kale Kapısı hazır savaş alanları eklendi.',
      'Ağaç, sık çalılık, kaya, su, çamur, duvar, parmaklık, barikat, yıkık sütun, moloz, lahit, sandık, kapı, çadır, meşale ve kamp ateşi objeleri eklendi.',
      'Parlak/loş/karanlık ışık, normal görüş, darkvision, ışık kaynakları, görüş kesen engeller ve kare bazlı savaş sisi eklendi.'
    ],
    fixed:[
      'Savaş haritasının DM hazırlığı sırasında oyuncuya görünmesi engellendi; tahta yalnız DM açınca veya savaş başlayınca yayınlanır.',
      'Encounter’a eski butonlardan eklenen veya silinen savaşçıların taktik tokenlarla ayrışması otomatik eşitlemeyle giderildi.',
      'Tur değişiminde token hareket sayacının sıfırlanmaması ve HP değişiminin karakter kaydından ayrışması önlendi.'
    ],
    changed:[
      'Mevcut initiative, HP, efekt ve encounter şablonları kaldırılmadı; taktik tahta aynı veri kaynağını kullanır.',
      'Tokenlarda hız, tur içi gidilen mesafe, HP, AC ve initiative tek bakışta görünür; 1 kare 5 ft olarak hesaplanır.',
      'Ahırdaki binek kartları hangi arazide işe yaradığını ve yol süresini yüzde kaç kısalttığını açıkça gösterir.',
      'Savaş editörü masaüstünde üç panelli, telefon ve tablette kaydırılabilir tek sütunlu düzene geçer.'
    ]
  },
  {
    version:'1.4',build:'Build 37',title:'Sürüm Notları Merkezi',tag:'ARŞİV',tone:'system',
    summary:'Oyunun gelişim geçmişi artık DM ve oyuncular tarafından uygulama içinden okunabilir.',
    added:[
      'Sol menüye DM ve oyuncu için ayrı Sürüm Notları sayfası eklendi.',
      'v0.1’den güncel sürüme kadar bütün büyük özellikler tek zaman çizelgesinde toplandı.',
      'Sürüm arama, eski/yeni sıralama ve bütün kartları açıp kapatma kontrolleri eklendi.'
    ],
    fixed:[
      'Önceki değişikliklerin yalnız ZIP içindeki README dosyasından takip edilebilmesi sorunu giderildi.',
      'Teknik build numaraları ile oyuncuya gösterilen sürüm numaraları birbirinden açıkça ayrıldı.'
    ],
    changed:[
      'Notlar Yeni, Düzeltildi ve Değiştirildi başlıklarıyla kısa ve taranabilir hale getirildi.',
      'Sayfa masaüstünde üç sütun, telefonda tek sütun ve büyük dokunma alanları kullanır.'
    ]
  },
  {
    version:'1.3',build:'Build 34–36',title:'Kale Ekonomisi ve 380 Kayıtlık Market',tag:'İÇERİK',tone:'content',
    summary:'Kaleler kendi ekonomilerine kavuştu; market yüzlerce gerçek kullanılabilir ürün ve hizmetle büyüdü.',
    added:[
      'Simyacı, Ahır ve Binekler ile Tapınak dükkânları eklendi.',
      'Market 141 kayıttan önce 286’ya, ardından 380 benzersiz ürün ve hizmete çıkarıldı.',
      'Binekler, taşıtlar, tapınak ayinleri, 2014 silahları, ekipmanlar, zehirler ve büyülü/lanetli eşyalar eklendi.',
      'DM rehberine seviyelere ayrılmış 50 hazır görev fikri eklendi.',
      'Partinin bulunduğu kalenin hizmet ve tierlerini markete uygulama özelliği eklendi.'
    ],
    fixed:[
      'İyileştirme İksiri, Antitoksin, Meşale ve güçlü büyülü eşyalardaki bariz fiyat hataları düzeltildi.',
      'DM marketindeki üst üste binme, kataloğun dar sol sütuna düşmesi ve sağ alanın boş kalması giderildi.',
      'Yeni katalog göçünün DM’nin değiştirdiği fiyat, stok, görünürlük ve özel ürünleri ezmesi engellendi.'
    ],
    changed:[
      '12 kalenin dükkânları biyom, zorluk ve lore’a göre ayrı ayrı dengelendi.',
      'Market arama ve tier filtresi aldı; ürün, hizmet ve binek türleri açıkça ayrıldı.',
      'Masaüstü katalog çok sütunlu, tablet/telefon kataloğu tek sütunlu responsive düzene geçti.',
      'Harita küçük ekranda ezilmek yerine dokunarak iki yönde kaydırılabilir hale getirildi.'
    ]
  },
  {
    version:'1.2',build:'Build 32–33',title:'Etkileşimli Dünya Haritası ve Dolu Kale Atlası',tag:'DÜNYA',tone:'world',
    summary:'12 kalelik dünya haritası sis, keşif, kale bilgisi ve DM düzenleme araçlarıyla oyuna bağlandı.',
    added:[
      'Ana menüye Map.png üzerinde çalışan 12 kalelik Harita bölümü eklendi.',
      'DM için arazi sisi, konum, geçmiş, içerisi, istihbarat ve dungeon görünürlük katmanları eklendi.',
      'Kale, dungeon, yerleşim, özel nokta, gizli dükkân ve lanetli dükkân ekleme/taşıma araçları eklendi.',
      'Her kaleye isim, bölge, kısa hikâye, zorluk, önerilen seviye, tehlike, yaratık, hizmet ve DM sırrı yazıldı.',
      'Grubun başlangıç konumu 5 numaralı Taçova Kalesi olarak hazırlandı.',
      'Oyuncuların lonca kasası ve ortak envanter hareketleri için son 200 işlem geçmişi eklendi.'
    ],
    fixed:[
      'DM’nin manuel kasa/envanter düzenlemelerinin oyuncu işlem geçmişini kirletmesi engellendi.',
      'Oyuncuya açılmamış kale sırlarının ve DM notlarının keşif ayarlarıyla sızması önlendi.'
    ],
    changed:[
      'Harita düzenleme araçları normal görünümden ayrılıp Kalem düğmesiyle açılan sade bir pencereye taşındı.',
      'Kale hizmetleri Yok veya Tier 1–3 olarak ayrı ayrı yönetilebilir hale geldi.',
      'Oyuncuya göster ve İçerisi keşfedildi kontrolleri seçili kale kartına alındı.'
    ]
  },
  {
    version:'1.1',build:'Build 30–31',title:'Gerçek Proficiency, ASI ve Veri Güvenilirliği',tag:'SİSTEM',tone:'system',
    summary:'Karakter matematiği gerçek 2014 proficiency akışına geçirildi; eşzamanlı kayıt çakışmaları güçlendirildi.',
    added:[
      '18 skill bağlı ability ve hesaplanmış bonuslarıyla karakter ekranına eklendi.',
      'Class skill seçimi, background skill/tool/dil proficiencyleri ve species ek skillleri kaydedilir hale geldi.',
      'Bard ve Rogue için gerçek proficiency listesinden Expertise seçimi eklendi.',
      'Save, silah, zırh, tool ve language proficiencyleri tek panelde görünür hale geldi.',
      'ASI haklarını ability veya feat olarak oyuncunun harcayacağı sistem eklendi.'
    ],
    fixed:[
      'Level atlayınca STR/DEX’in kendiliğinden artması kaldırıldı; ASI bütçesini aşan artışlar engellendi.',
      'DM kaydının aynı anda gelen oyuncu HP, eşya veya market işlemlerini eski JSON ile ezmesi giderildi.',
      'Liste başka sekmede değiştiğinde yanlış eşyanın taşınması/silinmesi ID ve ad doğrulamasıyla engellendi.',
      'Karakter ile encounter savaşçısının HP ve efektlerinin ayrışması düzeltildi.',
      'Monk+kalkan, büyülü zırh bonusu, tek zırh/tek kalkan ve proficiency uyarılarıyla AC hesapları düzeltildi.',
      'Subclass açılışları classın gerçek 2014 seviye 1/2/3 kuralına göre düzeltildi.'
    ],
    changed:[
      'Bulut kayıtları sıraya alındı; kampanya değiştirme ve çıkış öncesi bekleyen kayıt tamamlanır hale geldi.',
      'Kampanya değişiminde sayfa filtreleri ve geçici cache’ler güvenli biçimde temizlenir hale geldi.',
      'Arka plan sekmesindeki gereksiz polling ve tekrar tekrar bağlanan yaratık filtre eventleri azaltıldı.'
    ]
  },
  {
    version:'1.0',build:'Build 27–29',title:'Kompakt Arayüz ve Ansiklopediler',tag:'BÜYÜK SÜRÜM',tone:'major',
    summary:'Uzun sayfalar açılır kartlara dönüştü; yaratık ve karakter bilgileri ansiklopedi düzenine geçti.',
    added:[
      'Yaratıklar kategori ve CR filtreli ansiklopediye dönüştürüldü.',
      'Yaratık kartlarına altı stat, HP, AC, hız, CR, saldırı, özellik, direnç, bağışıklık, zayıflık ve karşı oyun bilgisi eklendi.',
      'Rehbere bütün species/subspecies ile 2014 class/subclassların 1–20 ilerleyişini içeren Karakter Ansiklopedisi eklendi.',
      'Ansiklopedi araması ve mobil tek sütun görünümü eklendi.',
      'DM için karakterler arasında adet seçerek eşya aktarma ve zar geçmişini temizleme eklendi.'
    ],
    fixed:[
      'Bulut eşitlemesinde açık karakter, skill, spell, yaratık, market ve kasa kartlarının kapanması giderildi.',
      'Sayfa ile masaüstü sol menü kaydırma konumlarının eşitlemede sıfırlanması düzeltildi.',
      '“Temasına uygun güç kazanır” gibi hiçbir mekanik söylemeyen placeholder açıklamalar kaldırıldı.',
      'Subspecies ve subclass kartlarında action, save, zar, süre ve kullanım hakları açıkça yazıldı.'
    ],
    changed:[
      'Karakterler, kasa, market, NPC ve skill sayfaları kapalı başlayan kompakt kartlara geçirildi.',
      'Masaüstü sol menü kendi içinde kaydırılabilir hale getirildi.',
      'Bütün menüler tutarlı boşluk, buton ve kısa açıklama düzenine geçirildi.'
    ]
  },
  {
    version:'0.9',build:'Build 26',title:'2014 Kural Temizliği ve Lonca Sistemi',tag:'KURALLAR',tone:'rules',
    summary:'Kurallar 2014 5e odağına çekildi; arayüz okunabilirliği ve ortak lonca yönetimi büyütüldü.',
    added:[
      'Lonca kurma, kodla katılma ve loncadan çıkma akışları eklendi.',
      'Lonca kasasına para yatırma/çekme ve ortak envantere eşya koyma/geri alma eklendi.',
      'Karaktere özel fight kartına silah proficiency, saldırı, hasar, spell attack ve spell save DC bilgileri eklendi.',
      'Mobil sol menüye görünür X kapatma düğmesi eklendi.'
    ],
    fixed:[
      'Yeni seçimlerdeki 2024 ve ölçüsüz homebrew class/subclass karmaşası temizlendi.',
      'Seviye düşürme veya karakter düzenlemenin mevcut subclassı otomatik silmesi engellendi.',
      'Rehberdeki gereksiz uzun ve masa sırasında cevap vermeyen bölümler ayıklandı.'
    ],
    changed:[
      'Class özellikleri ve rehber 2014 akışına göre yeniden düzenlendi.',
      'Kartlar, formlar, menüler ve butonlar masaüstü/telefon için ortak okunabilirlik düzenine geçirildi.'
    ]
  },
  {
    version:'0.8',build:'Build 25–25.1',title:'Akıllı Zarlar ve “Nasıl Dövüşürüm?” Kartları',tag:'SAVAŞ',tone:'combat',
    summary:'Oyuncunun hangi zarı, hangi bonusla ve hangi action türüyle kullanacağı karakter üzerinden açıklanır hale geldi.',
    added:[
      'Skill seçildiğinde bağlı ability, proficiency ve Expertise bonusunu otomatik hazırlayan akıllı zar menüsü eklendi.',
      'Karaktere özel saldırı bonusu, hasar, spell DC ve temel tur akışını hesaplayan Nasıl Dövüşürüm kartı eklendi.',
      'Görünen class özelliklerine kullanım türü, kaynak, süre ve masada uygulama açıklaması eklendi.',
      'Hazırlanmış spell kartlarına casting time, menzil, süre, V/S/M, slot, zar ve save çözümü eklendi.',
      'DM’nin marketteki ID’li eşyayı oyuncuya ücretsiz vermesi eklendi.',
      'Zırh, kalkan ve stat bonuslu eşyaları kuşanma sistemi eklendi.'
    ],
    fixed:[
      'Zar/para/HP gibi aktif form değerlerinin bulut eşitlemesinde varsayılana dönmesi engellendi.',
      'Zırh ve kalkan bonuslarının AC’ye, eşya stat bonuslarının karaktere uygulanmaması düzeltildi.',
      'Subspecies seçiminin seviye 3’e kalması kaldırılarak karakter oluşturma başlangıcına alındı.'
    ],
    changed:[
      'Oyuncu envanteri, eşyaya basınca açılan ver/at/sil işlemlerine sahip kompakt düzene geçti.',
      'Species, subspecies, class ve subclass seçimi canlı açıklama/önizleme gösterecek şekilde genişletildi.'
    ]
  },
  {
    version:'0.7',build:'Build 24',title:'Tam Envanter Transferi',tag:'ENVANTER',tone:'inventory',
    summary:'Eşyalar oyuncular, lonca ve yer arasında adet ve bütün özellikleri korunarak taşınabilir hale geldi.',
    added:[
      'Oyuncudan oyuncuya eşya gönderme eklendi.',
      'Lonca envanterine eşya koyma ve geri alma eklendi.',
      'Eşyayı yere bırakma ve başka oyuncunun yerden alması eklendi.',
      'Yığının tamamı yerine seçilen adedi taşıma eklendi.',
      'DM eşya verme penceresine AC, saldırı, hasar, büyü ve özel bonus alanları eklendi.'
    ],
    fixed:[
      'Transfer sırasında eşyanın yalnız adının kopyalanıp bonuslarının kaybolması düzeltildi.',
      'Aynı eşyanın hem kaynakta kalıp hem hedefte çoğalmasına yol açabilecek kopyalama akışı kaldırıldı.'
    ],
    changed:[
      'Transferler eşyanın tam JSON kaydını koruyup kaynaktan atomik çıkaracak yapıya geçirildi.',
      'Market üzerinden verilen eşyalar bütün mekanik alanlarıyla envantere düşer hale geldi.'
    ]
  },
  {
    version:'0.6',build:'Oturum Güncellemeleri',title:'Mesajlar, Bildirimler ve Şeytanla Anlaşma',tag:'OTURUM',tone:'session',
    summary:'Masa dışı iletişim, gizli DM anlaşmaları, dünya tarihi ve dinlenme işlemleri tek uygulamada toplandı.',
    added:[
      'Kampanya içi genel sohbet ve kullanıcıya özel mesajlaşma eklendi.',
      'Karakter onayı, Long Rest ve mesajlar için kalıcı bildirim merkezi eklendi.',
      'Oyuncunun yalnız DM ile görebildiği Şeytanla Anlaşma sistemi eklendi.',
      'Dünya tarihi, oturum numarası, görevler ve DM notları eklendi.',
      'HP, temp HP, spell slot, Hit Die, kaynak ve geçici efektleri yenileyen Long Rest işlemi eklendi.'
    ],
    fixed:[
      'Özel mesajların ilgisiz oyuncular tarafından görülmesi engellendi.',
      'Dinlenme sonrasında savaş kaynaklarının parçalı veya eksik sıfırlanması toparlandı.'
    ],
    changed:[
      'Kampanya değişiklikleri periyodik kontrolün yanında Realtime Broadcast ile daha hızlı yayılır hale geldi.'
    ]
  },
  {
    version:'0.5',build:'Ekonomi Güncellemeleri',title:'Para, Kasa ve Katmanlı Market',tag:'EKONOMİ',tone:'economy',
    summary:'Oyuncu cüzdanları, lonca kasası ve DM kontrollü satın alma sistemi oyuna eklendi.',
    added:[
      'PP, GP, SP ve CP bakiyeleri ile otomatik para bozma sistemi eklendi.',
      'Oyuncular arası para gönderme ve ayrı lonca kasası eklendi.',
      'Şifacı, demirci, zırhçı, okçu, genel eşya, han, restoran, gizemli ve lanetli dükkânlar eklendi.',
      'Dükkân aç/kapat, Tier 1–3, stok, fiyat, indirim ve satın alma onayı eklendi.',
      'DM’nin özel market ürünü oluşturması eklendi.'
    ],
    fixed:[
      'Para çıkarırken bakiye eksiye düşmesi engellendi.',
      'Satın alma sırasında yetersiz para veya stokla işlemin yarım kalması atomik sunucu işlemiyle giderildi.',
      'Eski prompt tabanlı para düzenleme görünür miktar alanı ve Ekle/Çıkar düğmeleriyle değiştirildi.'
    ],
    changed:[
      'Oyuncu yalnız kendi cüzdanını görürken DM’nin bütün bakiyeleri yönetebileceği rol ayrımı kuruldu.'
    ]
  },
  {
    version:'0.4',build:'Savaş Güncellemeleri',title:'Encounter, Yaratıklar ve Kalıcı Zar Günlüğü',tag:'SAVAŞ',tone:'combat',
    summary:'DM savaş sırasını, yaratıkları, HP’yi ve efektleri tek ekrandan yönetebilir hale geldi.',
    added:[
      'Oyuncu, yaratık ve NPC’leri encounter alanına ekleme eklendi.',
      'Initiative sıralama, aktif tur, round ve encounter bitirme araçları eklendi.',
      'Hazır encounter şablonları, yaklaşık 30+ yaratık ve özel yaratık oluşturma eklendi.',
      'DM hasar/iyileştirme ve süreli efekt uygulama araçları eklendi.',
      'd2–d100, Fate dF, özel formül ve d20 avantaj/dezavantaj desteği eklendi.',
      'Atan kişi, formül, toplam ve tek tek zarları saklayan ortak zar günlüğü eklendi.'
    ],
    fixed:[
      'Encounter temizlenmeden yeni savaşa geçildiğinde kalan tur/round durumları ayrıştırıldı.',
      'Oyuncunun DM yönetim butonlarını görmesi engellenip salt okunur savaş görünümü ayrıldı.'
    ],
    changed:[
      'Yaratıklar hazır şablondan kopyalanıp HP, AC, hız ve notları bozmadan özelleştirilebilir hale geldi.'
    ]
  },
  {
    version:'0.3',build:'Karakter Güncellemeleri',title:'Karakter Oluşturma ve İlerleme',tag:'KARAKTER',tone:'character',
    summary:'Species, class, stat, büyü ve seviye bilgileri DM onaylı karakter sistemine dönüştü.',
    added:[
      'Oyuncu karakter oluşturma ve DM onay/red akışı eklendi.',
      'Species, subspecies, class ve subclass katalogları eklendi.',
      'STR, DEX, CON, INT, WIS, CHA; HP, AC, proficiency ve saving throw hesapları eklendi.',
      'Spell, cantrip, prepared spell, spell slot ve class kaynak gösterimleri eklendi.',
      'DM’nin kampanyaya özel species/subspecies ve class/subclass eklemesi eklendi.',
      'Level, HP, AC ve ana stat düzenleme araçları eklendi.'
    ],
    fixed:[
      'Eski karakterlerin yeni onay sistemi yüzünden kilitlenmemesi için geriye uyumluluk sağlandı.',
      'Karakter seçimi kaydedilmediğinde varsayılanların yanlış gösterilmesi azaltıldı.'
    ],
    changed:[
      'DM ve oyuncu karakter ekranları yetki ve görünürlüklerine göre ayrıldı.'
    ]
  },
  {
    version:'0.2',build:'Bulut Temeli',title:'Kalıcı Kampanyalar ve Canlı Eşitleme',tag:'ALTYAPI',tone:'cloud',
    summary:'Kampanyalar tarayıcı oturumundan çıkıp Supabase üzerinde kalıcı ve paylaşılabilir hale geldi.',
    added:[
      'Kampanya state’i, üyelikler ve roller için bulut veritabanı eklendi.',
      'Kampanya değişiklikleri için Realtime Broadcast ve yedek periyodik kontrol eklendi.',
      'Hesap ve kampanya bilgilerinin sonraki girişte hatırlanması eklendi.',
      'DM ve yönetici için kampanya silme araçları eklendi.'
    ],
    fixed:[
      'Yanlış sunucu adresinden doğan NetworkError bağlantı sorunu düzeltildi.',
      'Şifre hash fonksiyonundaki pgcrypto/search_path kurulum sorunu düzeltildi.',
      'Bulut veri geldiğinde aktif form girişlerinin gereksiz yere ezilmesini azaltan korumalar başlatıldı.'
    ],
    changed:[
      'Parolalar açık metin yerine bcrypt hash olarak saklanır hale geldi.'
    ]
  },
  {
    version:'0.1',build:'İlk Sürüm',title:'Kadim Masa Defteri Temeli',tag:'BAŞLANGIÇ',tone:'start',
    summary:'Arkadaş grubunun tek bağlantı üzerinden oynayacağı DM Guidebook + Campaign Companion doğdu.',
    added:[
      'Kullanıcı adı ve şifreyle kayıt/giriş ekranı eklendi.',
      'Altı karakterli oda koduyla kampanya kurma ve katılma eklendi.',
      'Dungeon Master ve Oyuncu için ayrı rol ve menüler eklendi.',
      'Masa özeti, karakter, NPC, yaratık, görev, not ve temel rehber ekranları eklendi.',
      'Eski çağ/parşömen temalı masaüstü ve mobil uygulama kabuğu oluşturuldu.'
    ],
    fixed:[
      'İlk mobil menü taşmaları ve temel küçük ekran yerleşimleri toparlandı.'
    ],
    changed:[
      'Proje bağımsız bir oyun yerine masayı yöneten ortak yardımcı uygulama olarak konumlandırıldı.'
    ]
  }
];

function v37Fold(value){
  return String(value||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function v37PatchRows(){
  let needle=v37Fold(v37PatchQuery.trim());
  let rows=V37_PATCH_NOTES.filter(note=>!needle||v37Fold(`${note.version} ${note.build} ${note.title} ${note.tag} ${note.summary} ${note.added.join(' ')} ${note.fixed.join(' ')} ${note.changed.join(' ')}`).includes(needle));
  let compare=(a,b)=>{let aa=String(a).split('.').map(Number),bb=String(b).split('.').map(Number),length=Math.max(aa.length,bb.length);for(let i=0;i<length;i++){let diff=(aa[i]||0)-(bb[i]||0);if(diff)return diff}return 0};
  return rows.slice().sort((a,b)=>v37PatchOrder==='asc'?compare(a.version,b.version):compare(b.version,a.version));
}

function v37PatchGroup(kind,title,items){
  return `<section class="v37-change-group ${kind}"><h4><span></span>${title}<b>${items.length}</b></h4><ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section>`;
}

function v37PatchCards(){
  let rows=v37PatchRows();
  return rows.map(note=>`<details class="v37-release ${note.tone}" ${note.version==='2.4'?'open':''}><summary><span class="v37-version">v${note.version}</span><span class="v37-release-title"><b>${esc(note.title)}</b><small>${esc(note.build)} • ${esc(note.summary)}</small></span><span class="v37-tag">${esc(note.tag)}</span><i>＋</i></summary><div class="v37-release-body">${v37PatchGroup('added','Yeni',note.added)}${v37PatchGroup('fixed','Düzeltildi',note.fixed)}${v37PatchGroup('changed','Değiştirildi',note.changed)}</div></details>`).join('')||'<div class="empty">Bu aramada eşleşen sürüm notu yok.</div>';
}

function v37PatchPage(){
  let rows=v37PatchRows();
  return `${v26Head('GELİŞİM GÜNLÜĞÜ','Sürüm Notları','Eklenen özellikler, giderilen hatalar ve değişen sistemler. En yeni sürüm varsayılan olarak üsttedir.')}
  <section class="v37-patch-page">
    <div class="v37-patch-hero">
      <div><span class="v26-kicker">KADİM MASA DEFTERİ</span><h2>v2.4 • Build 52</h2><p>Cleric için 30 ana tanrı, kanonik domain eşleşmesi ve 1–20 seviyeye göre açılan class/domain mekanikleri.</p></div>
      <div class="v37-patch-stats"><span><b>29</b>Sürüm</span><span><b>14</b>Cleric Domain</span><span><b>30</b>Ana Tanrı</span><span><b>128</b>Ansiklopedi</span></div>
    </div>
    <div class="v37-patch-tools card">
      <input id="v37PatchSearch" class="input" value="${esc(v37PatchQuery)}" placeholder="Sürüm veya özellik ara…">
      <select id="v37PatchOrder" aria-label="Sürüm sıralaması"><option value="desc" ${v37PatchOrder==='desc'?'selected':''}>Yeni sürüm üstte</option><option value="asc" ${v37PatchOrder==='asc'?'selected':''}>Eski sürüm üstte</option></select>
      <button class="ghost" data-v37-patch-open="all">Tümünü Aç</button>
      <button class="ghost" data-v37-patch-open="none">Kapat</button>
      <b id="v37PatchCount">${rows.length}/${V37_PATCH_NOTES.length}</b>
    </div>
    <p class="v37-version-note">v0.1–v2.4 oyuncuya açık kilometre taşı numaralarıdır. “Build” etiketi ZIP içindeki teknik geliştirme paketini gösterir.</p>
    <div id="v37PatchList" class="v37-release-list">${v37PatchCards()}</div>
  </section>`;
}

function v37RefreshPatchList(){
  let list=$('#v37PatchList');if(list)list.innerHTML=v37PatchCards();
  let count=$('#v37PatchCount');if(count)count.textContent=`${v37PatchRows().length}/${V37_PATCH_NOTES.length}`;
}

function v37InstallNav(nav){
  if(nav.some(row=>row[0]==='patchnotes'))return;
  let guideIndex=nav.findIndex(row=>row[0]==='guide');
  nav.splice(guideIndex<0?nav.length:guideIndex+1,0,['patchnotes','✧','Sürüm Notları']);
}
v37InstallNav(dmNav);
v37InstallNav(playerNav);
dmPages.patchnotes=v37PatchPage;
playerPages.patchnotes=v37PatchPage;

document.addEventListener('input',event=>{
  if(event.target.id!=='v37PatchSearch')return;
  v37PatchQuery=event.target.value;
  v37RefreshPatchList();
});

document.addEventListener('change',event=>{
  if(event.target.id!=='v37PatchOrder')return;
  v37PatchOrder=event.target.value;
  v37RefreshPatchList();
});

document.addEventListener('click',event=>{
  let button=event.target.closest('button[data-v37-patch-open]');if(!button)return;
  document.querySelectorAll('#v37PatchList .v37-release').forEach(row=>row.open=button.dataset.v37PatchOpen==='all');
});

if(current)render();
