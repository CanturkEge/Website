export const RELEASES = [
  {
    version: "0.8.0",
    date: "2026-11-18",
    title: "Database · Kayıtlar Mahzeni açıldı",
    groups: [
      {
        title: "Kaynaklı veritabanı dünyası",
        items: [
          "Yüklenen arşivdeki 21 PDF (151 sayfa) ve 5 SQL metni incelendi. Veritabanı ortamı, ER, EER, ilişkisel mapping, SQL temelleri, sorgular/JOIN ve ileri SQL için 7 ünite açıldı.",
          "210 özgün soru eklendi: her konuda 5 zorluk ve 6 format. Kardinalite/katılım, tekrar eden ilişkiler, PK/FK/UNIQUE, NULL, dış birleşim, gruplama ve ilişkili alt sorgular ayrıntılı senaryolarla çalışılır.",
          "Ana lobiden mavi Kayıtlar Mahzeni’ne giriş, derse özel 5 zindan ve 8 oda adı eklendi. Önceki derslerdeki karakter ve kayıtlar korunur.",
        ],
      },
      {
        title: "Anlatım, diyagram, SQL ve ganimet",
        items: [
          "31 alt bölüm, 93 anlatım adımı, 62 flash kart ve 62 mini kontrol eklendi. Özgün ER/EER diyagramları, açıklamaları ve SQL kod blokları öğrenme yoluna eşlik eder.",
          "7 konu cheat sheet’i ve efsanevi Kayıp Katalog loot/market havuzuna katıldı. Notlar yalnız bu dersin sorularında ücretsiz ipucu verir.",
          "SQL Server’a özgü sözdizimi açıkça etiketlenir. LEFT JOIN ON/WHERE, NULL, alias kapsamı ve eksik ON DELETE gibi kaynak hataları düzeltilerek anlatılır.",
          "Normalizasyon kaynaklarda hedef olarak geçer; ayrıntılı 2NF/3NF ve merge sayfaları arşivde bulunmadığı için tamamlanmış bir ders gibi sunulmaz. Kaynak ve kapsam paneli bütün dosyaları listeler.",
          "Ustalık havuzu toplam 778 soruya çıktı. Aynı günlük 10 soru/200 puan sistemi sınıf, ekipman veya XP bonusu kullanmaz. SQL sonucu soruları ayrıca geçici yerel veritabanlarında doğrulanır.",
        ],
      },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-11-18",
    title: "Data Structures · Düğüm Korusu açıldı",
    groups: [
      {
        title: "Altı haftalık ders dünyası",
        items: [
          "DataStructures.zip içindeki Week1–6 slaytlarından 180 özgün soru eklendi. Bellek/pointer, algoritma analizi, sparse yapılar, recursion, stack, queue, BST, AVL, splay ve B-tree kapsanır.",
          "Her haftada 5 zorluk ve 6 soru türü bulunur: çoktan seçmeli, doğru/yanlış, çoklu seçim, eşleştirme, sıralama ve kısa/sayısal yanıt. Üst seviyeler işlem izleri ve çok adımlı çıkarımlar içerir.",
          "Ana lobiden girilen turkuaz Düğüm Korusu, hareketli düğüm sahnesi, derse özel 5 zindan ve 8 oda adıyla açıldı. Mevcut odalı sınav, can/mana ve ölümde yeniden başlama kuralları geçerlidir.",
        ],
      },
      {
        title: "Öğrenme, ganimet ve Ustalık",
        items: [
          "6 ünite, 24 alt bölüm, 72 anlatım adımı, 48 flash kart ve 48 isteğe bağlı mini kontrol eklendi. Okuma/kart ilerlemesi diğer derslerden ayrı kaydedilir.",
          "6 konu notu ve bir efsanevi atlas loot ve market havuzuna eklendi. Kuşanılan notlar yalnız Data Structures sorularında ücretsiz ipucu verir.",
          "Soruların ve bölümlerin altında PDF sayfa kaynakları bulunur. C boyutları, stack/queue sınırları, asimptotik tanımlar ve AVL rotasyon adlandırmasındaki slayt hataları açıklanarak düzeltildi.",
          "Ustalık havuzu Data Structures’ı içerir. Günlük 10 soru/200 puan sınavı ekipman, sınıf ve XP bonuslarından bağımsızdır. Önceki derslerin kayıtları korunur.",
        ],
      },
    ],
  },
  {
    version: "0.6.1",
    date: "2026-11-18",
    title: "Ekipman aktif yetenekleri düzeltildi",
    groups: [
      {
        title: "Aktif ekipmanlar",
        items: [
          "Aktif yetenekler artık silah, zırh ve tılsım yuvalarının tamamından okunur. Uyanmış/Kadim Akıl Pusulası ve Nöbetçi Yeleği gibi ekipmanlar üzerlerinde yazan Eleme’yi açar.",
          "Aynı yeteneği sınıftan ve birden fazla eşyadan almak tek düğme ve ortak oda kullanım hakkı sağlar; ek kullanım veya ücretsiz mana avantajı vermez.",
          "Eşya detayında ve markette kullanım şekli, aktif/pasif ayrımı, mana bedeli ve soru türü koşulu açıklanır. Yetenek paneli, aktif yeteneği veren kuşanılmış eşyaları gösterir.",
          "Eleme yalnız çoktan seçmeli soruda, yanıtlamadan önce 25 MP ile kullanılabilir. Kehanet yalnız eşleştirmede çalışır; sıralama ve eşleştirme kuralları değiştirilmedi.",
        ],
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-11-18",
    title: "Modeling dünyası ve kısa cevap düzeltmesi",
    groups: [
      {
        title: "Giriş alanları düzeltildi",
        items: [
          "Kısa cevap kutusuna ve diğer form alanlarına tıklamak sayfayı yeniden açıyordu. Menü yönlendirmesi yalnız gerçek bağlantı ve işlem düğmelerine sınırlandı; yazarken odak ve cevap kaybolmaz.",
          "Sayısal kısa cevaplar ondalık virgül/nokta, bilimsel gösterim, basit kesir ve belirtilen isteğe bağlı birimleri kabul eder. Soruda açıklanan yuvarlama toleransı hem oyunda hem sunucudaki Ustalık değerlendirmesinde uygulanır.",
        ],
      },
      {
        title: "Modeling & Discrete Simulation",
        items: [
          "Olasılık Gözlemevi açıldı. Yüklenen Subject1–11 ders slaytlarından özgün, PDF sayfa kaynaklı içerik hazırlandı; iki ZIP’in farklı sayfa düzenleri aynı ders olarak işlendi.",
          "Modelleme, elle simülasyon, DES kavramları, dağılımlar, kuyruklar, RNG, değişken üretimi, girdi modelleme, verification/validation, çıktı analizi ve alternatif sistem tasarımları ayrı konulardır.",
          "220 yeni soru: her konuda20 soru, her zorlukta44 soru ve6 soru türü. Sayısal çözümler işlem adımlarını, birimleri ve varsayımları açıklar. Toplam oyun havuzu388 soruya çıktı.",
        ],
      },
      {
        title: "Konu yolu ve başvuru notları",
        items: [
          "11 ünite ve36 alt bölüm:108 anlatım bölümü,72 flash kart ve72 alt bölüme özel kısa kontrol. Önce anlatım açılır; kartlar ve kontroller isteğe bağlıdır.",
          "Görülen bölümler, kart durumları, mini kontroller ve kişisel notlar ders bazında ayrı kalıcı kaydedilir.",
          "12 Modeling cheat sheet’i eklendi:11 konu parşömeni ve efsanevi ortak atlas. Eşyaların kendi formül, gösterim, varsayım ve tuzak notları çantadan okunabilir; kuşanınca uygun konuda ücretsiz ipucu sağlar.",
          "Slaytlardaki karışabilen geometrik destek, normal/Weibull parametreleri ve Box–Muller gösterimleri açık tanımlarla ele alındı. Kaynak ve gösterim notları öğrenme yolunda bulunur.",
        ],
      },
      {
        title: "Dünyaya bağlı oyun sistemleri",
        items: [
          "Modeling’e özel5 zindan adı,8 oda adı, gözlemevi teması ve derse ait ganimet/market not havuzu bağlandı. Bütün zorluklarda23 soruluk, tekrarsız oda sınavları çalışır.",
          "Antrenman, yanlış defteri, konu hâkimiyeti, günlük görev ve günlük200 puanlık Ustalık sınavı Modeling havuzunu kullanır. Ustalık puanlaması sınıf ve ekipmanlardan bağımsızdır.",
          "Mevcut OOD ilerlemesi ve168 sorusu korunur. Veritabanı, işletim sistemleri ve dijital mantık kaynakları hazır olana kadar kilitli kalır.",
        ],
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-11-18",
    title: "Ana lobi, ders dünyaları ve Gezgin Pazarı",
    groups: [
      {
        title: "Ana lobi ve ders dünyaları",
        items: [
          "Giriş sonrası ana lobi açılır. Buradan dersin karargâhına, öğrenme yoluna ve zindanlarına geçilir; devam eden keşif lobiden sürdürülebilir.",
          "Beş dersin ayrı sahnesi ve renk paleti var: OOD rün arşivleri, veritabanı kayıt kuleleri, işletim sistemleri çekirdek demirhanesi, dijital mantık devre tapınağı ve simülasyon gözlemevi.",
          "İçeriği beklenen dört ders lobide önizlenebilir; kilitleri korunur. Ders önizlemek aktif dersi veya ilerlemeyi değiştirmez.",
        ],
      },
      {
        title: "Düzenli sol menü",
        items: [
          "Dünyalar arası, Aktif ders, Avcı gelişimi ve Sistem menüleri açılıp kapanan gruplara ayrıldı. Her sayfa ayrı emojiyle gösterilir.",
          "Ana lobi ve Market sol menüye taşındı. Menü grubu tercihleri hesaba kaydedilir; açılan sayfanın grubu otomatik görünür.",
        ],
      },
      {
        title: "Gezgin Pazarı",
        items: [
          "Market artık tam sayfa: Tezgâh, Paketler ve Geliştirme ocağı bölümleri var. Altın ve özün kullanım yerleri açıklanır.",
          "Derse ve güne bağlı 11 ekipman/cheat sheet seçkisi, nadirliğe göre seviye koşulları, kategori ve arama filtreleri, fiyat/isim/seviye sıralaması ve Alabileceklerim filtresi eklendi.",
          "İksirler 1–99 adet alınabilir. Üç indirimli iksir paketi ders başına günde bir kez alınabilir. Günlük stok Türkiye saatiyle 00.00'da değişir; aynı ekipman aynı gün yeniden alınamaz.",
          "Satın almadan önce gerçek etkiler, kuşanılan eşyaya göre fark, adet, toplam ücret ve kalan bakiye gösterilir. Alışveriş sonrası eşya makbuzu açılır.",
        ],
      },
      {
        title: "Geliştirme ocağı ve kayıt",
        items: [
          "Silah, zırh ve tılsımlar altın + öz ile +3'e kadar geliştirilebilir. +1/+2/+3 için karakter seviyesi 2/4/6 gerekir; kaynak bedeli nadirlikle artar.",
          "Her geliştirme silaha +2 XP/doğru, zırha +8 maksimum can ve +1 savunma, tılsıma +8 maksimum mana verir. Bonus yalnız eşya kuşanıldığında uygulanır.",
          "Eşya parçalama onay ister; kuşanılan ekipman korunur. Geliştirilmiş eşya ek öz verir ve parçalandığında geliştirmesi kaldırılır.",
          "Günlük alımlar ve geliştirmeler kalıcı kaydedilir. Mevcut ilerleme korunur. Keşifte market incelenebilir; alışveriş, geliştirme ve parçalama için keşfin bitmesi gerekir.",
        ],
      },
      {
        title: "Ustalık tablosu",
        items: [
          "Sıralamadaki @kullanıcıadı satırı kaldırıldı. Yalnız görünen ad gösterilir; puanlar ve sıralama korunur.",
        ],
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-11-17",
    title: "Öğrenme yolu, oda sınavları ve mana dengesi",
    groups: [
      {
        title: "Öğrenme yolu",
        items: [
          "OOD için 6 ünite ve 18 alt bölüm eklendi. Her alt bölümde ayrı konu anlatımı, örnekler, iki flash kart ve iki isteğe bağlı kontrol sorusu var.",
          "Okunan bölümler, kartların biliyorum/tekrar durumları ve kontrol yanıtları ders bazında kalıcı kaydedilir.",
          "Öğrenme yolunda istediğin bölüme geri dönebilir, kaldığın yerden devam edebilirsin. Kontrol soruları anlatımdan ayrı sekmede açılır.",
        ],
      },
      {
        title: "Oda sınavları ve süre",
        items: [
          "Yeni zindanlar 8 ayrı oda sınavı ve toplam 23 sorudan oluşur. Odalarda 2–4 soru ve farklı soru türleri bulunur.",
          "Beş oda sürelidir; üç oda süresizdir. Süreli odaların sayacı ilk girişte başlar ve yenilemeyle sıfırlanmaz.",
          "Doğru veya yanlış cevap sonrası aynı odada kalırsın. Tüm soruların ardından oda raporu, sonra harita açılır.",
          "Son soruyu zamanında yanıtlayınca oda sayacı durur. Süre dolarsa keşif biter ve aynı zorluk ilk odadan yeniden başlar.",
          "Önceki sürümde yarım kalan koşular tek soruluk odalarıyla korunur; geriye dönük süre sınırı uygulanmaz.",
        ],
      },
      {
        title: "Günlük meydan okumalar",
        items: [
          "Günlük antrenman görevi: 5 dakikada 5 farklı doğru. Süre dolunca tekrar denenebilir; 35 altın ve Can İksiri ödülü günde bir kez alınır.",
          "Günlük Ustalık sınavına herkes için 10 dakikalık süre eklendi. Sayaç sunucuda kontrol edilir, ara verince durmaz.",
          "Ustalıkta süre dolunca kazanılan puan korunur; kalan sorular boş sayılır. Hız bonusu ve sınıf/ekipman avantajı yoktur.",
        ],
      },
      {
        title: "Mana dengesi",
        items: [
          "Temel doğru-cevap mana yenilenmesi 12’den 3’e düşürüldü; sınıf, eşya ve yetenek katkıları ayrıca uygulanır.",
          "Yanlış cevap E/D/C/B/S zorluklarında sırasıyla 8/10/12/14/16 mana kaybettirir.",
          "Aktif yeteneklerin kullanım sınırı soru başına yenilenmez; oda boyunca geçerlidir. Her yeni odada kullanım hakları açılır.",
        ],
      },
      {
        title: "Hesap ayarları",
        items: [
          "Giriş kullanıcı adından ayrı görünen ad eklendi. Karakter ekranı ve Ustalık tablosu aynı adı kullanır.",
          "Görünen adı değiştirmek puanı, denemeyi ve sırayı korur; yalnız ad güncellenir.",
          "Mevcut şifre ve SİL onayıyla Study Rift hesabı kalıcı silinebilir. Karakter, notlar, öğrenme ilerlemesi ve tüm sıralama sonuçları kaldırılır.",
          "Hesap işlemleri oturum ve sahiplik kontrolüyle sunucuda yapılır; diğer uygulama verileri korunur.",
        ],
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-11-17",
    title: "Ustalık, odalar ve daha ağır sınavlar",
    groups: [
      {
        title: "Ustalık tablosu",
        items: [
          "Karakter XP’sinden bağımsız, sunucuda puanlanan günlük sıralama eklendi.",
          "Aynı derste herkes aynı 10 soruyu çözer. Her zorluktan 2 soru ve toplam 200 puan vardır.",
          "Günde tek deneme; yarım kalan sınav devam eder. Eşit puan/doğru sayısı aynı sırayı paylaşır.",
          "Sınıf, ekipman, ipucu, mana, XP ve hız bonusları sıralama puanına etki etmez.",
        ],
      },
      {
        title: "Sorular",
        items: [
          "Soru havuzu 84’ten 168’e çıkarıldı.",
          "Çoklu seçim, sıralama ve kısa yanıt eklendi; toplam 6 soru türü destekleniyor.",
          "Kısa yanıtta harf büyüklüğü, gereksiz boşluklar ve tanımlanmış eş anlamlı yanıtlar dikkate alınıyor.",
          "Sıralama ve çoklu seçimde tam doğruluk gerekir; tek bir şık işaretlemek yeterli değildir.",
        ],
      },
      {
        title: "Zindan dengesi",
        items: [
          "8 odalı etkileşimli zindan haritası eklendi; her odada ayrı soru bulunur.",
          "Yanlış cevapların can hasarı yükseltildi. Elit ve boss odaları daha ağır vurur.",
          "Ölümde sonraki odaya geçilemez; aynı zorluk yeniden başlatıldığında ilk odadan başlanır.",
          "İkinci Şans, ölümden dönüş ve koruma yetenekleri kendi sınırlarıyla istisna sağlar.",
          "Her sınıfa bir pasif hasar azaltma düğümü eklendi: artık 16 düğüm/sınıf, toplam 48 yetenek var.",
        ],
      },
      {
        title: "Arayüz ve kayıt",
        items: [
          "Yama Notları sayfası ve üç bileşenli sürümleme eklendi.",
          "Önceki karakterler, eşyalar, sınıflar ve notlar korunur.",
          "Sıralama sonuçları tarayıcıdaki XP kaydından alınmaz; yanıtlar sunucuda kontrol edilir.",
          "Sorular hâlâ özgün örnek içeriktir. Hocanın slaytları bu sürüme dahil değildir.",
        ],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-11-17",
    title: "Sınıflar ve ders dünyaları",
    groups: [
      {
        title: "Eklenenler",
        items: [
          "Kullanıcı adı/şifreyle zorunlu giriş ve isteğe bağlı kurtarma adresi.",
          "Üç sınıf ve sınıf başına 15 düğümlü yetenek ağacı.",
          "89 eşya, nadirlik garantisi ve eşya tekrarını azaltan ganimet seçimi.",
          "84 soruluk havuz, karışan şıklar ve zorluk bazlı soru desteleri.",
          "OOD dışındaki dört ders için kilitli ders kartları, ayrı notlar ve temalar.",
          "Açılış ve zindana giriş animasyonları.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-11-17",
    title: "İlk uyanış",
    groups: [
      {
        title: "İlk sürüm",
        items: [
          "Karakter ekranı, ekipman, loot ve can/mana sistemi.",
          "Beş zindan, antrenman alanı, bonus notlar ve yanlış defteri.",
          "36 örnek OOD sorusu ve Supabase üzerinde özel ilerleme kayıtları.",
        ],
      },
    ],
  },
];
export const VERSION = RELEASES[0].version;
export function compareVersions(a, b) {
  const parse = (v) => {
    if (!/^\d+\.\d+\.\d+$/.test(v))
      throw Error("Sürüm üç sayısal bileşenden oluşmalı.");
    return v.split(".").map(Number);
  };
  const x = parse(a),
    y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}
