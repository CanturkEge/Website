// Player-facing notes. Keep this timeline aligned with CHANGELOG.md.
window.FNF_RELEASES = [
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
