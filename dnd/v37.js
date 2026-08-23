/* v37: player-facing patch notes timeline. */
let v37PatchQuery='';
let v37PatchOrder='desc';

const V37_PATCH_NOTES=[
  {
    version:'1.6',build:'Build 39',title:'Market Hediye Akışı Düzeltmesi',tag:'GÜNCEL',tone:'current',
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
  return rows.slice().sort((a,b)=>v37PatchOrder==='asc'?parseFloat(a.version)-parseFloat(b.version):parseFloat(b.version)-parseFloat(a.version));
}

function v37PatchGroup(kind,title,items){
  return `<section class="v37-change-group ${kind}"><h4><span></span>${title}<b>${items.length}</b></h4><ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section>`;
}

function v37PatchCards(){
  let rows=v37PatchRows();
  return rows.map(note=>`<details class="v37-release ${note.tone}" ${note.version==='1.6'?'open':''}><summary><span class="v37-version">v${note.version}</span><span class="v37-release-title"><b>${esc(note.title)}</b><small>${esc(note.build)} • ${esc(note.summary)}</small></span><span class="v37-tag">${esc(note.tag)}</span><i>＋</i></summary><div class="v37-release-body">${v37PatchGroup('added','Yeni',note.added)}${v37PatchGroup('fixed','Düzeltildi',note.fixed)}${v37PatchGroup('changed','Değiştirildi',note.changed)}</div></details>`).join('')||'<div class="empty">Bu aramada eşleşen sürüm notu yok.</div>';
}

function v37PatchPage(){
  let rows=v37PatchRows();
  return `${v26Head('GELİŞİM GÜNLÜĞÜ','Sürüm Notları','Eklenen özellikler, giderilen hatalar ve değişen sistemler. En yeni sürüm varsayılan olarak üsttedir.')}
  <section class="v37-patch-page">
    <div class="v37-patch-hero">
      <div><span class="v26-kicker">KADİM MASA DEFTERİ</span><h2>v1.6 • Build 39</h2><p>Market eşyasını oyuncuya ücretsiz verme akışı SQL bağımlılığından kurtarıldı ve bulut kaydı güçlendirildi.</p></div>
      <div class="v37-patch-stats"><span><b>16</b>Sürüm</span><span><b>23</b>Kale yolu</span><span><b>6</b>Hazır savaş alanı</span><span><b>380</b>Market kaydı</span></div>
    </div>
    <div class="v37-patch-tools card">
      <input id="v37PatchSearch" class="input" value="${esc(v37PatchQuery)}" placeholder="Sürüm veya özellik ara…">
      <select id="v37PatchOrder" aria-label="Sürüm sıralaması"><option value="desc" ${v37PatchOrder==='desc'?'selected':''}>Yeni sürüm üstte</option><option value="asc" ${v37PatchOrder==='asc'?'selected':''}>Eski sürüm üstte</option></select>
      <button class="ghost" data-v37-patch-open="all">Tümünü Aç</button>
      <button class="ghost" data-v37-patch-open="none">Kapat</button>
      <b id="v37PatchCount">${rows.length}/${V37_PATCH_NOTES.length}</b>
    </div>
    <p class="v37-version-note">v0.1–v1.6 oyuncuya açık kilometre taşı numaralarıdır. “Build” etiketi ZIP içindeki teknik geliştirme paketini gösterir.</p>
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
