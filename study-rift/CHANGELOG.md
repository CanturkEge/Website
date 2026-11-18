# Study Rift — Yama notları

Sürüm biçimi: `ana.özellik.düzeltme`. Bileşenler bağımsız tam sayıdır; `0.3.9 → 0.3.10`, `1.20.0` geçerlidir.

## 0.8.0 · 2026-11-18

Database · Kayıtlar Mahzeni açıldı

- Arşivdeki 21 PDF (151 fiziksel sayfa) ve 5 SQL metninden 7 konu ve 210 özgün soru. Her konuda 5 zorluk × 6 soru formatı; işlem izleri, model kararları ve SQL çıktıları.
- 31 alt bölüm, 93 anlatım adımı, 62 flash kart ve 62 mini kontrol. Özgün ve açıklamalı ER/EER diyagramları; kaynak dosya/sayfa bilgileri.
- Ortam/süreç, ER, EER, ilişkisel mapping, DDL, SELECT/JOIN/gruplama, alt sorgular/view/routines/triggers. Normalizasyon ayrıntılarının arşivde bulunmadığı açıkça belirtilir.
- SQL Server lehçesi ve kaynak hataları ayrıştırıldı. SQL sorgu sonucu örnekleri geçici yerel veritabanlarında test edilir.
- 7 konu notu + bir efsanevi atlas, kursa özel loot/market ve ücretsiz not ipuçları. Mavi tema, 5 zindan ve 8 oda adı.
- 778 soruluk Ustalık havuzu; mevcut 10 soru/200 puan, süre ve sınıftan bağımsız sıralama kuralları. Auth ve veri şeması değişmedi, eski kayıtlar korunur.

## 0.8.0 · 2026-11-18

Database · Kayıtlar Mahzeni açıldı

- Yüklenen 21 PDF (151 sayfa) ve 5 SQL notu incelenerek 210 özgün soru eklendi. 7 konu × 5 zorluk × 6 format; toplam havuz 778 soru.
- 7 ünite, 31 alt bölüm, 93 anlatım adımı, 62 flash kart ve 62 mini kontrol. ER/EER için özgün, erişilebilir diyagramlar.
- ER/EER, ilişkisel mapping, SQL Server DDL/DML, JOIN/NULL/gruplama, alt sorgular, view ve programlanabilir SQL. Kaynaklarda ayrıntısı bulunmayan normalizasyon/merge açıkça kapsam dışında işaretlenir.
- Mavi Kayıtlar Mahzeni, 5 zindan/8 oda adı, 7 konu cheat sheet’i ve efsanevi Kayıp Katalog. Loot/market, öğrenme ve adil günlük Ustalık sistemiyle bütünleşir.
- Kaynak SQL/kardinalite hataları açıklanarak düzeltilir; SQL çıktı örnekleri geçici yerel veritabanlarında sınanır. Eski kayıtlar, Auth ve sunucu şeması korunur.

## 0.7.0 · 2026-11-18

Data Structures · Düğüm Korusu açıldı

- Yüklenen Week1–6 PDF’lerinden 180 özgün, kaynak sayfalı soru: her haftada 5 zorluk ve 6 format. Bellek/pointer, analiz/sparse/recursion, stack, queue, BST, AVL, splay ve B-tree.
- 6 ünite, 24 alt bölüm, 72 anlatım adımı, 48 flash kart ve 48 isteğe bağlı mini kontrol. İlerleme diğer derslerden ayrı kaydedilir.
- Lobiden erişilen turkuaz Düğüm Korusu; hareketli düğüm sahnesi, 5 zindan ve 8 oda adı. Mevcut sınav, süre, can/mana ve loot kuralları korunur.
- 6 konu cheat sheet’i + efsanevi atlas; dersle sınırlı ücretsiz ipuçları, market ve ganimet entegrasyonu.
- C boyutu/indis, asimptotik tanım, stack/queue sınırı ve AVL adlandırma hataları kaynak notlarında açıklandı.
- Data Structures, aynı 10 soru/200 puan ve sınıf/ekipman bonusu olmayan günlük Ustalık sistemine eklendi. Soru bankası 568 soruya çıktı. Auth, veri şeması ve önceki kayıtlar değişmedi.

## 0.6.1 · 2026-11-18

Ekipman aktif yetenekleri düzeltildi

- Aktif yetenekler artık silah, zırh ve tılsım yuvalarının tamamından okunur. Uyanmış/Kadim Akıl Pusulası ve Nöbetçi Yeleği gibi ekipmanlar üzerlerinde yazan Eleme’yi açar.
- Aynı yeteneği sınıftan ve birden fazla eşyadan almak tek düğme ve ortak oda kullanım hakkı sağlar; ek kullanım veya ücretsiz mana avantajı vermez.
- Eşya detayında ve markette kullanım şekli, aktif/pasif ayrımı, mana bedeli ve soru türü koşulu açıklanır. Yetenek paneli, aktif yeteneği veren kuşanılmış eşyaları gösterir.
- Eleme yalnız çoktan seçmeli soruda, yanıtlamadan önce 25 MP ile kullanılabilir. Kehanet yalnız eşleştirmede çalışır; sıralama ve eşleştirme kuralları değiştirilmedi.

## 0.6.0 · 2026-11-18

Modeling dünyası ve kısa cevap düzeltmesi

### Giriş alanları düzeltildi

- Kısa cevap kutusuna ve diğer form alanlarına tıklamak sayfayı yeniden açıyordu. Menü yönlendirmesi yalnız gerçek bağlantı ve işlem düğmelerine sınırlandı; yazarken odak ve cevap kaybolmaz.
- Sayısal kısa cevaplar ondalık virgül/nokta, bilimsel gösterim, basit kesir ve belirtilen isteğe bağlı birimleri kabul eder. Soruda açıklanan yuvarlama toleransı hem oyunda hem sunucudaki Ustalık değerlendirmesinde uygulanır.

### Modeling & Discrete Simulation

- Olasılık Gözlemevi açıldı. Yüklenen Subject1–11 ders slaytlarından özgün, PDF sayfa kaynaklı içerik hazırlandı; iki ZIP’in farklı sayfa düzenleri aynı ders olarak işlendi.
- Modelleme, elle simülasyon, DES kavramları, dağılımlar, kuyruklar, RNG, değişken üretimi, girdi modelleme, verification/validation, çıktı analizi ve alternatif sistem tasarımları ayrı konulardır.
- 220 yeni soru: her konuda20 soru, her zorlukta44 soru ve6 soru türü. Sayısal çözümler işlem adımlarını, birimleri ve varsayımları açıklar. Toplam oyun havuzu388 soruya çıktı.

### Konu yolu ve başvuru notları

- 11 ünite ve36 alt bölüm:108 anlatım bölümü,72 flash kart ve72 alt bölüme özel kısa kontrol. Önce anlatım açılır; kartlar ve kontroller isteğe bağlıdır.
- Görülen bölümler, kart durumları, mini kontroller ve kişisel notlar ders bazında ayrı kalıcı kaydedilir.
- 12 Modeling cheat sheet’i eklendi:11 konu parşömeni ve efsanevi ortak atlas. Eşyaların kendi formül, gösterim, varsayım ve tuzak notları çantadan okunabilir; kuşanınca uygun konuda ücretsiz ipucu sağlar.
- Slaytlardaki karışabilen geometrik destek, normal/Weibull parametreleri ve Box–Muller gösterimleri açık tanımlarla ele alındı. Kaynak ve gösterim notları öğrenme yolunda bulunur.

### Dünyaya bağlı oyun sistemleri

- Modeling’e özel5 zindan adı,8 oda adı, gözlemevi teması ve derse ait ganimet/market not havuzu bağlandı. Bütün zorluklarda23 soruluk, tekrarsız oda sınavları çalışır.
- Antrenman, yanlış defteri, konu hâkimiyeti, günlük görev ve günlük200 puanlık Ustalık sınavı Modeling havuzunu kullanır. Ustalık puanlaması sınıf ve ekipmanlardan bağımsızdır.
- Mevcut OOD ilerlemesi ve168 sorusu korunur. Veritabanı, işletim sistemleri ve dijital mantık kaynakları hazır olana kadar kilitli kalır.

## 0.5.0 · 2026-11-18

Ana lobi, ders dünyaları ve Gezgin Pazarı

### Ana lobi ve ders dünyaları

- Giriş sonrası ana lobi açılır. Buradan dersin karargâhına, öğrenme yoluna ve zindanlarına geçilir; devam eden keşif lobiden sürdürülebilir.
- Beş dersin ayrı sahnesi ve renk paleti var: OOD rün arşivleri, veritabanı kayıt kuleleri, işletim sistemleri çekirdek demirhanesi, dijital mantık devre tapınağı ve simülasyon gözlemevi.
- İçeriği beklenen dört ders lobide önizlenebilir; kilitleri korunur. Ders önizlemek aktif dersi veya ilerlemeyi değiştirmez.

### Düzenli sol menü

- Dünyalar arası, Aktif ders, Avcı gelişimi ve Sistem menüleri açılıp kapanan gruplara ayrıldı. Her sayfa ayrı emojiyle gösterilir.
- Ana lobi ve Market sol menüye taşındı. Menü grubu tercihleri hesaba kaydedilir; açılan sayfanın grubu otomatik görünür.

### Gezgin Pazarı

- Market artık tam sayfa: Tezgâh, Paketler ve Geliştirme ocağı bölümleri var. Altın ve özün kullanım yerleri açıklanır.
- Derse ve güne bağlı 11 ekipman/cheat sheet seçkisi, nadirliğe göre seviye koşulları, kategori ve arama filtreleri, fiyat/isim/seviye sıralaması ve Alabileceklerim filtresi eklendi.
- İksirler 1–99 adet alınabilir. Üç indirimli iksir paketi ders başına günde bir kez alınabilir. Günlük stok Türkiye saatiyle 00.00'da değişir; aynı ekipman aynı gün yeniden alınamaz.
- Satın almadan önce gerçek etkiler, kuşanılan eşyaya göre fark, adet, toplam ücret ve kalan bakiye gösterilir. Alışveriş sonrası eşya makbuzu açılır.

### Geliştirme ocağı ve kayıt

- Silah, zırh ve tılsımlar altın + öz ile +3'e kadar geliştirilebilir. +1/+2/+3 için karakter seviyesi 2/4/6 gerekir; kaynak bedeli nadirlikle artar.
- Her geliştirme silaha +2 XP/doğru, zırha +8 maksimum can ve +1 savunma, tılsıma +8 maksimum mana verir. Bonus yalnız eşya kuşanıldığında uygulanır.
- Eşya parçalama onay ister; kuşanılan ekipman korunur. Geliştirilmiş eşya ek öz verir ve parçalandığında geliştirmesi kaldırılır.
- Günlük alımlar ve geliştirmeler kalıcı kaydedilir. Mevcut ilerleme korunur. Keşifte market incelenebilir; alışveriş, geliştirme ve parçalama için keşfin bitmesi gerekir.

### Ustalık tablosu

- Sıralamadaki @kullanıcıadı satırı kaldırıldı. Yalnız görünen ad gösterilir; puanlar ve sıralama korunur.

## 0.4.0 · 2026-11-17

Öğrenme yolu, oda sınavları ve mana dengesi

### Öğrenme yolu

- OOD için 6 ünite ve 18 alt bölüm eklendi. Her alt bölümde ayrı konu anlatımı, örnekler, iki flash kart ve iki isteğe bağlı kontrol sorusu var.
- Okunan bölümler, kartların biliyorum/tekrar durumları ve kontrol yanıtları ders bazında kalıcı kaydedilir.
- Öğrenme yolunda istediğin bölüme geri dönebilir, kaldığın yerden devam edebilirsin. Kontrol soruları anlatımdan ayrı sekmede açılır.

### Oda sınavları ve süre

- Yeni zindanlar 8 ayrı oda sınavı ve toplam 23 sorudan oluşur. Odalarda 2–4 soru ve farklı soru türleri bulunur.
- Beş oda sürelidir; üç oda süresizdir. Süreli odaların sayacı ilk girişte başlar ve yenilemeyle sıfırlanmaz.
- Doğru veya yanlış cevap sonrası aynı odada kalırsın. Tüm soruların ardından oda raporu, sonra harita açılır.
- Son soruyu zamanında yanıtlayınca oda sayacı durur. Süre dolarsa keşif biter ve aynı zorluk ilk odadan yeniden başlar.
- Önceki sürümde yarım kalan koşular tek soruluk odalarıyla korunur; geriye dönük süre sınırı uygulanmaz.

### Günlük meydan okumalar

- Günlük antrenman görevi: 5 dakikada 5 farklı doğru. Süre dolunca tekrar denenebilir; 35 altın ve Can İksiri ödülü günde bir kez alınır.
- Günlük Ustalık sınavına herkes için 10 dakikalık süre eklendi. Sayaç sunucuda kontrol edilir, ara verince durmaz.
- Ustalıkta süre dolunca kazanılan puan korunur; kalan sorular boş sayılır. Hız bonusu ve sınıf/ekipman avantajı yoktur.

### Mana dengesi

- Temel doğru-cevap mana yenilenmesi 12’den 3’e düşürüldü; sınıf, eşya ve yetenek katkıları ayrıca uygulanır.
- Yanlış cevap E/D/C/B/S zorluklarında sırasıyla 8/10/12/14/16 mana kaybettirir.
- Aktif yeteneklerin kullanım sınırı soru başına yenilenmez; oda boyunca geçerlidir. Her yeni odada kullanım hakları açılır.

### Hesap ayarları

- Giriş kullanıcı adından ayrı görünen ad eklendi. Karakter ekranı ve Ustalık tablosu aynı adı kullanır.
- Görünen adı değiştirmek puanı, denemeyi ve sırayı korur; yalnız ad güncellenir.
- Mevcut şifre ve SİL onayıyla Study Rift hesabı kalıcı silinebilir. Karakter, notlar, öğrenme ilerlemesi ve tüm sıralama sonuçları kaldırılır.
- Hesap işlemleri oturum ve sahiplik kontrolüyle sunucuda yapılır; diğer uygulama verileri korunur.

## 0.3.0 · 2026-11-17

Ustalık, odalar ve daha ağır sınavlar

### Ustalık tablosu

- Karakter XP’sinden bağımsız, sunucuda puanlanan günlük sıralama eklendi.
- Aynı derste herkes aynı 10 soruyu çözer. Her zorluktan 2 soru ve toplam 200 puan vardır.
- Günde tek deneme; yarım kalan sınav devam eder. Eşit puan/doğru sayısı aynı sırayı paylaşır.
- Sınıf, ekipman, ipucu, mana, XP ve hız bonusları sıralama puanına etki etmez.

### Sorular

- Soru havuzu 84’ten 168’e çıkarıldı.
- Çoklu seçim, sıralama ve kısa yanıt eklendi; toplam 6 soru türü destekleniyor.
- Kısa yanıtta harf büyüklüğü, gereksiz boşluklar ve tanımlanmış eş anlamlı yanıtlar dikkate alınıyor.
- Sıralama ve çoklu seçimde tam doğruluk gerekir; tek bir şık işaretlemek yeterli değildir.

### Zindan dengesi

- 8 odalı etkileşimli zindan haritası eklendi; her odada ayrı soru bulunur.
- Yanlış cevapların can hasarı yükseltildi. Elit ve boss odaları daha ağır vurur.
- Ölümde sonraki odaya geçilemez; aynı zorluk yeniden başlatıldığında ilk odadan başlanır.
- İkinci Şans, ölümden dönüş ve koruma yetenekleri kendi sınırlarıyla istisna sağlar.
- Her sınıfa bir pasif hasar azaltma düğümü eklendi: artık 16 düğüm/sınıf, toplam 48 yetenek var.

### Arayüz ve kayıt

- Yama Notları sayfası ve üç bileşenli sürümleme eklendi.
- Önceki karakterler, eşyalar, sınıflar ve notlar korunur.
- Sıralama sonuçları tarayıcıdaki XP kaydından alınmaz; yanıtlar sunucuda kontrol edilir.
- Sorular hâlâ özgün örnek içeriktir. Hocanın slaytları bu sürüme dahil değildir.

## 0.2.0 · 2026-11-17

Sınıflar ve ders dünyaları

### Eklenenler

- Kullanıcı adı/şifreyle zorunlu giriş ve isteğe bağlı kurtarma adresi.
- Üç sınıf ve sınıf başına 15 düğümlü yetenek ağacı.
- 89 eşya, nadirlik garantisi ve eşya tekrarını azaltan ganimet seçimi.
- 84 soruluk havuz, karışan şıklar ve zorluk bazlı soru desteleri.
- OOD dışındaki dört ders için kilitli ders kartları, ayrı notlar ve temalar.
- Açılış ve zindana giriş animasyonları.

## 0.1.0 · 2026-11-17

İlk uyanış

### İlk sürüm

- Karakter ekranı, ekipman, loot ve can/mana sistemi.
- Beş zindan, antrenman alanı, bonus notlar ve yanlış defteri.
- 36 örnek OOD sorusu ve Supabase üzerinde özel ilerleme kayıtları.
