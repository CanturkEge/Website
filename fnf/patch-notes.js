// Player-facing notes. Keep this timeline aligned with CHANGELOG.md.
window.FNF_RELEASES = [
  {
    version:'0.7.0', date:'20 Ekim 2026', title:'Yaşayan Yerleşim', tag:'OYUN SİSTEMLERİ',
    summary:'Günlük yerleşim, iklim, yetiştirme, ticaret, araştırma ve keşif döngüsü.',
    added:[
      'On günlük mevsimler; dünya tohumu ve iklimden türeyen sabah, öğle, gece havası. Güneş, nem ve sıcaklık ürün büyümesini etkiler.',
      'Alan, toprak verimi, bakım, gübre ve ilahi lütufla hasat miktarı; zorunlu yetişme koşulları ayrı değerlendirilir.',
      'Ortak depo, ağırlık ve hacim sınırı; inşaat, bakım, köylü ve yolcu gelişleri; ahırda kalıtım ve nadir doğum nimeti.',
      'Gün ve bölgeye göre fiyatlar, alım satımla arz-talep, han haberleri ve oyun içi han oyunu.',
      'Araştırma, soru sorma ve keşifle bilgi açma; yardımcı elçi görevleri, vergi, nöbet ve baskın olayları.',
      'Karakter eylemlerinden deneyim ve beceri pratiği; kampanya yedeğine yeni yerleşim kayıtları.'
    ],
    fixed:['Mevsim uzunluğu tasarımdaki 10 oyun gününe çekildi.'],
    changed:['Sabah işlemleri tek DM gün geçişinde tamamlanır; günün kalanı rol yapma akışına bırakılır.']
  },
  {
    version:'0.6.0', date:'20 Ekim 2026', title:'Kampanya Defteri', tag:'YÖNETİM',
    summary:'DM kampanyayı yedekleyebilir, yedekten ayrı bir oda açabilir ve oda adını yazarak silebilir.',
    added:[
      'Odanın günlüğü, tarlaları, tohumu, ansiklopedi keşfi ve karakterleri JSON yedeğine alınır.',
      'Yedek yeni kodlu ayrı odaya yüklenir; önceki oda korunur. Oyuncu eski hesabıyla koda katılınca karakteri geri gelir.',
      'DM oda adını aynen yazarak kampanyasını silebilir.'
    ],
    fixed:[], changed:['Sürümler major.minor.patch düzeninde ilerler; 0.11.23 gibi sürümler mümkündür.']
  },
  {
    version:'0.5.0', date:'20 Ekim 2026', title:'İlk Hasat', tag:'OYUN DÖNGÜSÜ',
    summary:'Kod istemeyen hesap açma, ortak tarla, gün akışı ve keşif ansiklopedisi.',
    added:[
      'Dört ortak tarla gözü: tohum seç, ek, sula ve olgunlaşınca hasat et.',
      'DM gün geçirince ekinler işlenir; yeni hava, mevsim ve sabah RP kancası kaydedilir.',
      'Tohum, bitki ve hayvan ansiklopedisi; DM resim, ad, nadirlik, kullanım ve koşulları ayrı ayrı açabilir.'
    ],
    fixed:['Hesap açmak için oda kodu veya kurucu şifresi gerekmiyor.'],
    changed:['Arayüz tarla defteri ve gün akışı etrafında yeni bir görsel dile geçti.']
  },
  {
    version:'0.4.0', date:'20 Ekim 2026', title:'Dünyanın Taslağı', tag:'TASARIM',
    summary:'Yerleşim, tarım ve keşif ekranlarında oyunun ana fikirleri görünür hale geldi.',
    added:[
      'Yapılar, halk, ekonomi; tohum, yetişme koşulları ve hayvanlar; araştırma ve alametler için kısa kapsam kartları.',
      'Geliştirme için dosya haritası ve açık tasarım kararları.'
    ],
    fixed:[],
    changed:['Karakter ve ekran metinleri ayrı içerik kataloğuna taşındı. Kartlar henüz oynanabilir sistem değildir.']
  },
  {
    version:'0.3.0', date:'20 Ekim 2026', title:'Arkadaş Masası', tag:'HESAPLAR',
    summary:'Kullanıcı adı ve şifreyle e-postasız kayıt ve giriş.',
    added:[
      'Arkadaşın verdiği oda kodu veya kurucu şifresiyle kullanıcı adı açma.',
      'Eski e-postalı FNF hesabına bir kez girip kullanıcı adı seçme.'
    ],
    fixed:['Yeni hesaplar e-posta doğrulama bağlantısı beklemeden oyuna girer.'],
    changed:['D&D hesabı ve mevcut FNF odaları ayrı kalır; eski FNF hesabının verisi korunur.']
  },
  {
    version:'0.2.0', date:'20 Ekim 2026', title:'İlk Yerleşim Masası', tag:'ARAYÜZ',
    summary:'Koyu oyun arayüzü, sol menü, DM rolü ve yeni karakter beceri sistemi.',
    added:[
      'Odaya girdikten sonra sol menüden yerleşim, halk, tarım, keşif ve sürüm notlarına geçiş.',
      'Sürüm notlarında arama, sıralama ve açılır sürüm kartları.',
      'Oyuncu için altı temel nitelik, başlangıç dağıtımı, tür ve uzmanlık yatkınlığı, iki seçmeli eğitim.'
    ],
    fixed:[
      'Odayı kuran DM artık karakter oluşturmadan yönetim ekranına giriyor.',
      'Beceriler sıfırdan puanlanan alanlar yerine nitelik değişkeni ve eğitim bonusundan hesaplanıyor.'
    ],
    changed:[
      'Oyuncu karakteri ve DM yönetim rolü ayrı akışlar oldu.',
      'Tarım ve keşif menüleri gelecekteki sistemler için açık durum özeti gösteriyor; simülasyon henüz etkin değil.'
    ]
  },
  {
    version:'0.1.0', date:'20 Ekim 2026', title:'İlk Filiz', tag:'BAŞLANGIÇ',
    summary:'Ayrı FNF sitesi, hesaplar, oda kodu ve ilk karakter oluşturma akışı.',
    added:[
      'egecanturk.dev/fnf altında bağımsız oyun sitesi ve Supabase oturumu.',
      'Kurucu şifresiyle oda açma, kodla katılma ve oda halkını görme.',
      'Altı tür, dört ana yol ve on iki uzmanlık seçimi.'
    ],
    fixed:[],
    changed:[]
  }
];
