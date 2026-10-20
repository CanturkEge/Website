# FNF Sürüm Notları

Oyuncuya görünen sürümler bu dosyada ve `patch-notes.js` içinde aynı sırayla tutulur. Teknik dağıtım ile oyun mekaniği henüz ayrı sürümlenmez.

Sürüm biçimi `major.minor.patch`: yeni bir özellik için minor, küçük düzeltme için patch artar. `0.9.0` sonrasında `0.10.0`, sonra `0.11.0` gelir; `1.0.0` otomatik bir eşik değildir. Örneğin `0.11.23` geçerli bir sürümdür.

## v0.11.1 — Saha Çizimleri (20 Ekim 2026)

- Parşömen defteri çizimlerinde bitki yaprak damarları ve hayvan türlerine göre ayırt edici vücut, kanat, kabuk ve kuyruk biçimleri güçlendirildi. Görseller için önbellek sürümü yenilendi.

## v0.11.0 — Orman Defteri ve Tapınak (20 Ekim 2026)

- Ansiklopedide 100 ayrı bitki, 30 hayvan ve mevcut üç başlangıç tohumu var. Her kaydın ayrı parşömen/kara kalem SVG çizimi, nadirliği, doğal yaşam koşulu ve gözlem notu bulunur. Yeni kayıtlar var olan odalarda ve yeni odalarda gizli başlar; DM beş bilgi alanını ayrı açar.
- Kategori sayısı, bilinen bilgilerde arama ve 12 kayıtlık sayfalama eklendi. Gizli ad ve açıklamalar arama sonucunda ifşa edilmez.
- Tek yüce kaynak, dört başmelek, sekiz elçi hiyerarşisi; oda başına kapalı tapınak, DM tarafından açma, her ad için oda özelinde düzenleme ve ad/alan/anlatı için ayrı gösterme kontrolü eklendi.
- Tapınak durumu, isimler ve açılan bilgiler kampanya yedeğine katıldı; eski yedekler bu bölüm olmadan yüklenebilir. Adlar ve anlatılar değiştirilebilir taslaktır. Katalog kayıtları kendiliğinden ekim, hasat, hayvan yetiştirme, nimet ya da ceza mekaniği başlatmaz.

## v0.10.1 — Oda Yapıları (20 Ekim 2026)

- DM ortak depodan çalışma evi, ahır, han, depo ve çiti yeniden kurabilir. Bunlar oda desteğidir; köy evleri, kuyuları ve işçilikle yapılan yapılar ayrı kalır.
- Yeni odalarda araştırma, ahır ve hanın önceki yapı önkoşulları tekrar ulaşılabilir olur. Sunucu DM rolünü ve malzeme bedelini doğrular.

## v0.10.0 — Köyde Emek (20 Ekim 2026)

- İnşa yetkisiyle köy başına ev, kuyu, atölye ve okul başlatılır. Malzeme başta ödenir; oyuncu emeği veya atanmış yapıcıyla gün içinde ilerler, tamamlanmadan kullanılmaz.
- DM aday getirebilir; adaylar seyrek günlük gelişlerle de görünür. Ev kapasitesi içinde köye kabul veya ret, ayrı karar yetkisiyle yapılır.
- NPC'ye yalnız yetkili üye veya DM günün bir işini atar. Oyuncu aynı gün ikinci kez değiştiremez; DM tamamlanmadan düzeltebilir. Gün geçişinde meslek deneyimi, yorgunluk, dinlenme ve temel ürünler işlenir.
- Kampanya yedeği yapıları, adayları, köylüleri, güncel işleri ve oyuncu inşa emeğini içerir.
- **Durum:** v08–v13 veritabanı geçişleri uygulandı. Köy işi RPC'leri geri alınan işlemlerle doğrulandı; gerçek tarayıcı hesabı ve şifreli yedek yükleme uçtan uca sınanmadı.

## v0.9.0 — Yirmi Kare Toprak (20 Ekim 2026)

- Köy başına çoklu 20 kare parsel; kare aralığına tohum, iki gün tarla açma, sınırlı dere suyu, yağmur, hasat kalıntısı ve nadas.
- Yeni odada hazır ekin/tohum/hayvan/köylü bulunmaz; altı yiyeceklik geçici kamp payını DM kaynak veya tohumla genişletebilir. Eski odaların stoğu korunur.
- Yedek köy parsellerini, ekinleri ve suyu geri yükler. Dört eski boş tarla kaydı yalnız önceki yedek biçimi için tutulur.
- **Durum:** Veritabanı geçişi uygulandı; parsel açma ve günlük akış geri alınan işlemlerle doğrulandı.

## v0.8.0 — Köylerin İlk Adımı (20 Ekim 2026)

- Oyuncular rastgele arazi ipucuyla kendi köylerini kurar veya başvuru/davetle bir köye katılır. İlk gün en çok üç eş kurucu, kabul ederek katılabilir.
- Köy yöneticileri inşa, karar ve NPC iş atama yetkilerini üyeye ayrı ayrı verebilir. Yetkiler sunucuda saklanır; ortak oda deposu ve mevcut DM inşa işlemleri henüz köylere ayrılmadı.
- Mevsimler 20 oyun gününe çıkar. Günlük ve ekim koşulları aynı takvimi kullanır; on günlük vergi döngüsü ayrıca sürer.
- Yedek köyleri ve kabul edilmiş üyelikleri içerir. Yüklemede oyuncu yeni odaya katıldığında köy hakkını geri alır. Bekleyen davet/başvurular aktarılmaz.
- **Durum:** Veritabanı geçişi uygulandı; köy kurma ve yetki RPC'leri kontrol edildi. Eski kampanyalar korundu.

## v0.7.0 — Yaşayan Yerleşim (20 Ekim 2026)

- On günlük mevsimler, seçilebilir dünya tohumu ve iklim, üç günlük hava evresi; güneş, nem, sıcaklık, toprak, su ve mevsim zorunlu büyüme koşullarıdır.
- Hasat alanı ve ekin türüyle taban verim, toprak verimi/bakım/gübre/büyü ile verim değiştiricisi hesaplanır. Depo ağırlığı ve kervan hacmi ayrıdır.
- Yapılar, günlük bakım, nüfus tüketimi, özgün yolcu ve köylü profilleri; hayvan eşleştirme ve özellik kalıtımı, yem/ürün döngüsü.
- Gün/mevsim/iklim/arz-talep pazar fiyatı, han haberleri, içki ve yalnız oyun içi paralı oyun.
- Keşif, yolcuya soru sorma, DM kontrollü araştırma; yardımcı elçi görevi ve lütuf, nadir doğum nimeti, vergi, yol harcı, nöbet ve baskın.
- Oyuncu eylemleri genel ve beceri deneyimi kazandırır. Yedek yeni yerleşim durumunu ve deneyimi kapsar; eski v0.6 yedekleri okunur.
- Veritabanı geçişi uygulandı. DM eylemleri ve gün geçişi geri alınan denemelerde doğrulandı; oyun dengesi arkadaş grubunun raporlarıyla geliştirilecek.

## v0.6.0 — Kampanya Defteri (20 Ekim 2026)

- DM kampanyayı JSON olarak indirir; gün, günlük, tarla, stok, ansiklopedi keşfi ve karakterler saklanır.
- Yedek yüklenince önceki kampanya korunarak yeni kodlu oda açılır. Oyuncular eski hesaplarıyla yeni koda katıldığında kayıtlı karakterleri geri gelir.
- DM oda adını aynen yazarak kampanyayı silebilir. Silme geri alınamaz; önce yedek önerilir.

## v0.5.0 — İlk Hasat (20 Ekim 2026)

- Kayıt oda kodundan ayrıldı; kullanıcı adı ve şifre yeterli. Oda kurma şifresi ve katılım kodu kendi işlemlerinde kaldı.
- Dört ortak tarla, tohum stoğu, koşullara göre ekim, sulama ve hasat.
- Günü yalnız DM geçirir. Geçişte önceki gün sulanan uygun ekin büyür, ardından yeni günün hava ve sabah RP olayı kaydolur. 7 gün bir mevsimdir.
- Ansiklopedide üç tohum, bir yabani bitki ve iki hayvan; DM her kaydın resim, kimlik, nadirlik, detay ve koşullarını bağımsız olarak açar.
- FNF arayüzü bakır/lacivert tarla defteri görünümüne geçti. Ekonomi ve hayvan yetiştirme henüz taslak.

## v0.4.0 — Dünyanın Taslağı (20 Ekim 2026)

### Yeni
- Yerleşim, tarım ve keşif sayfalarında FNF'nin ana oyun fikirleri kısa kapsam kartlarıyla gösterildi.
- `PROJECT_INDEX.md`, `GAME_DESIGN.md` ve `AGENTS.md` ile hedefli geliştirme haritası eklendi.

### Değişti
- Tür, yol, beceri ve ekran metinleri `game-data.js` kataloğuna taşındı.
- Bu kartlar kayıt/simülasyon içermez; oyun kuralları netleştikten sonra oynanabilir olacak.

## v0.3.0 — Arkadaş Masası (20 Ekim 2026)

### Yeni
- Kullanıcı adı ve şifreyle hesap açma; davet olarak oda kodu veya kurucu şifresi gerekir.
- Eski e-postalı FNF hesapları giriş yaptıktan sonra kullanıcı adı alabilir, odaları ve karakterleri korunur.

### Düzeltildi
- Yeni hesapta e-posta ve doğrulama bağlantısı istenmez.

### Değişti
- Kayıt sunucuda yapılır; kurucu şifresi ve yetkili anahtarlar istemci koduna gömülmez.

## v0.2.0 — İlk Yerleşim Masası (20 Ekim 2026)

### Yeni
- Koyu oyun arayüzü ve rolüne göre sol menü: genel bakış, yerleşim, halk/karakter, tarım, keşif ve sürüm notları.
- Sürüm notları için aranabilir, sıralanabilir ve açılır kartlar.
- Oyuncu karakterinde altı temel nitelik (10 taban + 8 dağıtım puanı, en çok 14), tür niteliği +1, iki seçmeli eğitim; tür ve uzmanlık sabit eğitimleri. Eğitim bonusu +2, örtüşen sabit eğitim ustalık +4 verir.

### Düzeltildi
- DM karakter oluşturma zorunluluğu olmadan doğrudan oda yönetimine girer.
- Başlangıç becerileri sıfırdan tek tek yükseltilmez; ilişkili nitelik değişkeni ve eğitim/ustalık bonusu üzerinden hesaplanır.

### Değişti
- DM hesabındaki daha önce oluşturulmuş karakter verisi silinmez ama DM ekranında oyuncu karakteri olarak kullanılmaz.
- Tarım, yerleşim ve keşif başlıkları ilk sürümde durum ekranıdır; oynanabilir simülasyon olarak sunulmaz.

## v0.1.0 — İlk Filiz (20 Ekim 2026)

### Yeni
- `/fnf/` için bağımsız site ve ayrı Supabase projesi/oturumu.
- Kurucu şifresiyle oda kurma, oyuncular için davet koduyla katılım.
- Altı tür, dört ana yol, on iki uzmanlık ve ilk karakter akışı.

