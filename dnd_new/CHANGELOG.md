# Kadim Masa Defteri — Kurulum

## v68 — Market Bildirimleri ve Tek Para Merkezi

- Oyuncunun gönderdiği yeni market teklifi kampanyadaki DM hesaplarına kalıcı bildirim üretir.
- DM karşı teklif verdiğinde, teklifi reddettiğinde veya alışveriş tamamlandığında oyuncuya bildirim gider.
- Eski güvenli oturum bilgisi bulunmayan tarayıcıda market artık sessizce durmaz; yeniden giriş gerektiğini açıkça gösterir.
- Oyuncuya para gönderme, NPC’ye para gönderme ve keseden kalıcı silme kontrolleri **Kesem → Para İşlemleri** altında birleştirildi; NPC para kontrolü Envanter ekranından kaldırıldı.
- Market teklifi ve üç para işlemi canlı Supabase üzerinde tek transaction içinde test edilip geri alındı; test hesabı veya kampanya verisi bırakılmadı.

Kurulumda `v68-update.sql` dosyasını Supabase'te bir kez çalıştır. Migration yalnız market siparişi bildirim tetikleyicisini ekler; mevcut hesap, kampanya, sipariş, cüzdan, NPC ve envanter kayıtlarını değiştirmez.

## v67 — Kutsal Sembol ve NPC Aktarım Hotfix

- Eski envanterlerde alanları eksik kalan `Kutsal Sembol` ve `Gezgin Kutsal Sembolü` kayıtları artık yeni eşya almadan büyü odağı olarak kuşanılabilir.
- Odak tanıma, istemci kuşanma denetimi ile sunucudaki `equipment_slot_v45` doğrulamasında aynı geriye uyumlu kuralları kullanır.
- **NPC’ye Ver** işlemi, oyuncunun gerçekten kullanılan v46 envanter kartına bağlandı; eşya ayrıntıları açıldığında görünür.
- `npc_transfer_v66` eşyanın adedini oyuncudan düşürüp NPC envanterine eklemeye devam eder; hesap ve kampanya verileri değiştirilmez.

Kurulumda `v67-update.sql` dosyasını Supabase'te bir kez çalıştır. Migration yalnız `equipment_slot_v45` fonksiyonunu geriye uyumlu biçimde günceller; mevcut kayıtları yeniden yazmaz veya silmez.

## v66 — Büyü Odağı, Pazarlıklı Sepet ve NPC Transferi

- Kutsal sembol, kalkana işlenen sembol, arcane/druidic odak ve Bard çalgıları kuşanılabilir büyü odağı hâline getirildi.
- Hazırlanmış büyüler için odakla karşılanabilen materyaller ile GP bedelli özel materyaller ayrı gösterilir.
- Wizard, Sorcerer, Warlock, Cleric, Druid, Bard ve Paladin için yeni asa, pelerin, cübbe ve odaklar; Revivify/Raise Dead gibi büyüler için bedelli materyaller eklendi.
- Oyuncu markette çoklu ürün sepeti oluşturup DM'e indirimli teklif gönderebilir. DM kabul, ret veya karşı teklif verebilir; karşı teklif oyuncu onayıyla tamamlanır.
- Satış tamamlanırken para, stok ve karakter envanteri tek veritabanı işlemi içinde güncellenir.
- Oyuncu kendi eşyasını veya PP/GP/SP/CP parasını seçilen NPC'ye gönderebilir; eşyanın bütün bonus alanları korunur.

Kurulumda `v66-update.sql` dosyasını Supabase'te bir kez çalıştır. Migration mevcut hesap, kampanya, karakter, NPC, envanter ve cüzdan verilerini silmez.

## v65 — Tekil Büyü Emanetleri

- Cleric, Wizard, Warlock, Druid, Sorcerer, Bard, Paladin, Ranger ve Artificer için üçer tane olmak üzere **27 özgün isimli emanet** eklendi.
- Her kayıt yalnız **1 stok**, tier 3, attunement ve açık class şartıyla markete eklenir.
- Emanetler sıradan seri adları yerine **Kırık Merhamet**, **Geceyi İkiye Bölen Asa**, **Borçsuz Gölge**, **Köklerin Hafızası**, **İçindeki Fırtına**, **Unutulan Nakarat**, **Eğilmeyen Şafak**, **Ufkun Öteki Ucu** ve **Mükemmel Hata** gibi tekil adlar taşır.
- Spell Attack/DC, AC, saving throw, attack/damage veya ana stat bonusları satın alım ve DM hediyesi sırasında korunur.

SQL değişikliği yoktur. Market seed v7, mevcut ürünlerin fiyat ve stoklarına dokunmadan yalnız eksik v65 kayıtlarını ekler.

## v64 — Yaratık, Boss, NPC ve Ekonomi Temizliği

- Kör rütbe üreten 100 yaratık kombinasyonu kaldırıldı; 40 ayrı isim, stat, saldırı, özellik ve karşı oyun taşıyan yaratık eklendi.
- 24 boss için ayrı **Bosslar** sayfası; saldırı, legendary özellik, lair action, faz değişimi ve karşı oyun kartları eklendi.
- Ganimet kataloğu yüzeysel kombinasyonlar ayıklanarak 4.124 kayıttan 2.154 tekrarsız kayda indirildi; 36 class-özel bonuslu ekipman eklendi.
- NPC yönetimi katalogdan bütün bonus alanlarıyla eşya verme, eşyayı geri alma ve PP/GP/SP/CP ekleme-çıkarma akışında birleştirildi.
- Ayrı **Büyücü Dükkânı** ve kalelere bağlı tierleri eklendi; materyaller Genel Eşya, Simyacı ve Tapınak raflarına da dağıtıldı.
- 30 yeni market ürününün GP/CP değeri, tier ve stok miktarı dengelendi.

SQL değişikliği yoktur. Mevcut kampanya, karakter, NPC, envanter ve para kayıtları korunur; yeni alanlar kampanya JSON state'inde geriye uyumlu biçimde tamamlanır.

## v63 — Büyücü Eşyaları ve Rünlü Ekipman

- Ganimet kataloğu 4.000 kayıttan **4.124** kayda çıkarıldı.
- 16 büyü kitabı, 52 class/genel caster eşyası, 40 rünlü eşya ve 16 kutsal büyü emaneti eklendi.
- Artificer, Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock ve Wizard için class odakları, asalar, değnekler ve aksesuarlar eklendi.
- Kuşanılan ve class şartı sağlanan `magicBonus`, karakter kartı, class paneli, Cleric paneli ve büyü saldırısı zarına gerçek Spell Attack/DC bonusu olarak bağlandı.
- Yeni eşyalar ganimet ansiklopedisinde **Büyücü ekipmanları**, **Büyü kitapları**, **Rünlü eşyalar** ve **Kutsal emanetler** filtreleriyle bulunabilir.

SQL değişikliği yoktur. Site dosyalarını güncelledikten sonra `v63` cache anahtarı yeni katalog ve hesaplama dosyalarını yükler.

## v62 — Kesem Görünürlük Düzeltmesi

- Geç yüklenen `v27.js` dosyasının oyuncu Kesem ekranını eski şablonla ezmesi giderildi.
- **Parayı Yere At** kontrolü artık oyuncu hesabında Kesem sayfasının altında görünür.
- Veritabanı veya SQL değişikliği yoktur; mevcut `wallet_discard_v61` RPC'si kullanılmaya devam eder.

Site dosyalarını güncelledikten sonra yeni `v62` cache anahtarı dosyaların yeniden indirilmesini sağlar.

## v61 — Oyuncu Para Yok Etme

- Oyuncunun Kesem ekranına para türü ve miktarı seçilen **Parayı Yere At** işlemi eklendi.
- Atılan para yerde alınabilir eşya oluşturmaz; oyuncunun kesesinden kalıcı olarak silinir.
- İşlem geri alınamaz onayı ister; yetersiz bakiye ve geçersiz miktar sunucuda reddedilir.
- `wallet_discard_v61` RPC'si oyuncuyu ham kullanıcı kimliği yerine v54 oturum tokenından doğrular ve cüzdanı satır kilidiyle günceller.

Kurulumda `v61-update.sql` dosyasını Supabase SQL Editor'da bir kez çalıştır ve site dosyalarını güncelledikten sonra `Ctrl + Shift + R` yap. SQL mevcut hesapları, kampanyaları veya cüzdan bakiyelerini kendiliğinden değiştirmez ve tekrar çalıştırılabilir.

## v60 — Yaratık Ansiklopedisi ve Oyuncu Hareketi

- Build 59 ile eklenen yaratıkların eksik detay alanları güvenli varsayılanlarla tamamlandı; Yaratıklar sekmesinin açılırken çökmesi giderildi.
- Oyuncular aktif savaşta yalnız kendi sıralarındaki tokenı seçip kalan hızları kadar yürütebilir.
- Zor arazi iki kat hareket harcar; geçilemez objeler ve harita sınırı hem istemcide hem sunucuda denetlenir.
- `battle_token_move_v60` RPC'si oturum, kampanya üyeliği, karakter sahipliği, aktif sıra ve hız sınırını doğrular.

Kurulumda `v60-update.sql` dosyasını Supabase SQL Editor'da bir kez çalıştır ve site dosyalarını güncelledikten sonra `Ctrl + Shift + R` yap. SQL mevcut hesapları, kampanyaları veya karakterleri silmez ve tekrar çalıştırılabilir.

## v59 — Lonca, Büyü Kaynakları ve Taktik İçerik

- NPC’ler lonca kadrosuna eklenebilir, lonca ekranında görüntülenebilir ve ayrı para kesesi taşıyabilir.
- DM için spell slot harcama/geri alma/yenileme tablosu; oyuncu için salt okunur slot görünümü ve rehber eklendi.
- Ganimette çıkan para tek adımda seçilen karakterin güvenli Supabase cüzdanına gönderilebilir.
- Şeytanla anlaşma mesajları DM’e, cevaplar ilgili oyuncuya bildirim üretir.
- 100 yeni hazır yaratık, 44 yeni taktik harita ve 18 yeni obje eklendi; toplam hazır harita sayısı 51’e çıktı.
- Savaş ekranındaki araç grupları ve yan paneller daha sakin bir hiyerarşiye alındı.

## v58 — DM Susturma Sonrası Otomatik Mikrofon Dönüşü

- DM susturmayı kaldırdığında, oyuncunun mikrofonu daha önce açıksa track otomatik yeniden yayınlanır.
- Oyuncu mikrofonunu kendi kapattıysa DM izin değişikliği mikrofonu zorla açmaz.
- DM susturma ve sağırlaştırma durumları oyuncunun ses panelinde açık durum mesajıyla gösterilir.

## v57 — Mobil ve Tek Yönlü Ses Düzeltmesi

- Token servisinin başarılı olduğu fakat tarayıcı medya oturumunun tek yönde kalabildiği akış düzeltildi.
- Mikrofon yayını açıldıktan sonra gelen ses başlatılır; mobil kullanıcı etkileşimi için erken audio başlatma denemesi yapılır.
- Gelen audio elementleri `hidden` DOM'dan çıkarılıp görünmez fakat oynatılabilir bir ses hostuna taşındı.
- Autoplay engeli, cihaz hatası ve track subscription hatası kullanıcıya açık durum mesajıyla gösterilir.
- Sekme geri geldiğinde veya LiveKit yeniden bağlandığında mikrofon ve gelen ses otomatik toparlanır.

## v56 — DM Kontrolleri ve Veritabanı Sağlık Düzeltmesi

- v53 karakter oluşturmadaki geçersiz `jsonb_object_length` çağrısı veri silmeden düzeltildi.
- Hesapları ve kampanyaları değiştirmeyen `health-check-v56.sql` sağlık raporu eklendi.
- DM karakter silme işlemi gecikmeli istemci kaydından çıkarılıp yetki kontrollü, atomik Supabase RPC'sine taşındı.
- Karakter silme için karakter adını yazarak onaylama ve bağlı savaş kaydını temizleme eklendi.
- DM, LiveKit ses odasında oyuncuların konuşma ve dinleme izinlerini sunucu tarafından kapatıp açabilir.
- Mobil ve masaüstünde destekleyen tarayıcılar için hoparlör, kulaklık ve Bluetooth ses çıkışı seçimi eklendi.
- Cihaz değişiminden sonra mikrofon ve gelen ses akışının yeniden başlamaması düzeltildi; başarısız seçim önceki cihaza geri döner.
- LiveKit katılımcı/track eventlerinin konuşanlar kümesi sanılması nedeniyle yeni bağlantıda ses listesinin kırılması düzeltildi.

## v55 — Admin Girişi Güvenlik Düzeltmesi

- Admin şifresi kaynak koddan ve istemcinin doğrudan çağırabildiği RPC akışından çıkarıldı.
- Supabase yalnız bcrypt özetini saklar; düz şifre veritabanında tutulmaz.
- Admin giriş, kampanya listeleme ve silme işlemleri service-role kullanan `kadim-admin` Edge Function arkasına alındı.
- Admin ayar tablosu ile yönetim RPC'lerinin `anon` ve `authenticated` erişimleri kapatıldı.
- Eski admin şifresi geçersiz kılındı; yeni şifre yalnız teslim sırasında paylaşılır.

## v54 — Kampanya Sesli Sohbeti

- Her kampanya kendi LiveKit ses odasına bağlandı; başka kampanyaya geçildiğinde önceki ses bağlantısı otomatik kapatılır.
- Katıl/ayrıl, mikrofon aç/kapat, gelen sesi susturma, mikrofon seçimi, katılımcı listesi ve konuşan kişi göstergesi eklendi.
- LiveKit API secret tarayıcıya veya repository'ye yazılmaz; katılım JWT'si Supabase `livekit-token` Edge Function içinde üretilir.
- Özel hesap sistemine 30 gün süreli uygulama oturumları eklendi. Ham token yalnız istemciye verilir, veritabanında SHA-256 özeti tutulur ve ses tokenı yalnız doğrulanmış kampanya üyelerine üretilir.
- Eski açık tarayıcı oturumları oyun verilerini kaybetmez; sesli sohbete ilk katılımda yalnız bir defa yeniden giriş ister.

Kurulumda `v54-update.sql` bir kez uygulanmalı, `LIVEKIT_URL`, `LIVEKIT_API_KEY` ve `LIVEKIT_API_SECRET` Edge Function secret'ı olarak tanımlanmalı ve `livekit-token` fonksiyonu JWT doğrulaması kapalı şekilde yayınlanmalıdır. Fonksiyon kendi uygulama oturumunu ve kampanya üyeliğini doğrular.

## v53 — Karakter Kuralları Büyük Yenilemesi

- **29 ana species / 95 alt tür ve miras** tek denetlenmiş katalogda toplandı. Parent species ile subspecies ability bonusları artık birlikte hesaplanır; hız, darkvision, direnç ve özel hareketler kaynak etiketiyle gösterilir. Standard Human +1 bütün statlar, Variant Human iki farklı +1, Half-Elf ve Half-Orc 2014 değerleriyle çalışır.
- **13 legacy class / 113 subclass** için subclass açılma seviyesi, 1–20 çekirdek özellikleri, subclass kilometre taşları, Hit Die, save proficiency ve ana statlar yenilendi. Homebrew/kampanya seçenekleri resmî seçenek gibi gizli buff vermez; etiketlenerek korunur.
- Oyuncu büyü hazırlama ekranı eski kısa listeden çıkarılıp mevcut **319 büyülük 2014 SRD kataloğuna** bağlandı. Class listesi, açılmış spell seviyesi, cantrip sayısı, bilinen/hazırlanan büyü sınırı, Warlock pact slotu ve Mystic Arcanum ayrı hesaplanır; ad, okul ve seviye filtresi bulunur. Divine Soul Cleric listesine, Eldritch Knight/Arcane Trickster sınırlı Wizard listesine ve Bard Magical Secrets class dışı seçime erişir; okul ve ek seçim sınırları kayıtta doğrulanır.
- Yeni karakter oluştururken üç ability yöntemi vardır: sınıfa göre otomatik **15/14/13/12/10/8**, değerleri elle yerleştirilen Standard Array ve skor maliyetleri denetlenen **27 Point Buy**. Esnek species bonusları da hangi ability’ye gideceği seçilerek kaydedilir.
- Tür + alt tür + esnek bonus + seviye ASI + DM düzeltmesi + kuşanılmış eşya bonusu tek stat motorunda birleşir ve karakter kartında kaynak kaynak açıklanır. Hill Dwarf HP, Dwarf ağır zırh hız istisnası, alt tür/özel hareket hızları ve Barbarian Lv20 **STR/CON +4 (tavan 24)** gibi eksik etkiler de uygulanır.
- Mevcut karakter, subclass, hazırlanmış büyü, envanter, market, görev, tanrı/domain, karma/adalet ve tüm kampanya state’i korunur. Legacy veya özel seçimler katalog dışına düştüğü için silinmez.

Kurulumda paketteki `dnd` klasörünü mevcut klasörün üzerine kopyala, ardından **`v53-update.sql` dosyasını Supabase SQL Editor’da bir kez çalıştır** ve `Ctrl + Shift + R` yap. v52 daha önce kurulmadıysa Cleric tanrı/domain kaydı için `v52-update.sql` de bir kez çalıştırılmalıdır. v53 SQL’i veri silmez; yalnız yeni oyuncu karakter yaratımı için doğrulanmış RPC ekler ve v31 kayıt birleştirme hattını değiştirmez.

## v52 — Cleric Tanrı Bağı ve İlahi Alanlar

- Cleric yaratımına **30 ana Forgotten Realms tanrısı** eklendi. Tanrı seçimi, yalnız onun 2014 Appendix B domainlerini ve portfolio alanıyla uyumlu resmî ek kitap domainlerini açar.
- Toplam **14 resmî 5e domaini** bulunur: Knowledge, Life, Light, Nature, Tempest, Trickery, War; DM onaylı Death; Arcana, Forge, Grave, Order, Peace ve Twilight.
- Her domainin 1/3/5/7/9. seviyede açılan **10 daima hazırlanmış büyüsü** ile 1–20 arasındaki bütün subclass özellikleri action, kullanım hakkı, menzil, süre ve save bilgisiyle gösterilir.
- Açılmış domain büyüleri normal hazırlama seçicisinden çıkarılır; böylece hazırlama sınırını yanlışlıkla tüketmez. Forge Cleric’in 6. seviyedeki ağır zırh **+1 AC** özelliği aktif AC hesabına da uygulanır.
- Cleric ekranında seviyeye ve WIS değerine göre Spell Save DC, spell attack, bilinen cantrip, normal hazırlanmış büyü hakkı, 1–9. seviye slotlar, Channel Divinity hakkı, Destroy Undead CR eşiği ve Divine Intervention kuralı otomatik hesaplanır.
- Tanrı adı kendi başına STR, AC, proficiency veya zar bonusu vermez. Asıl buff ve yetenekler seçilen domain kartlarından gelir.
- Eski **128 tanrılık ansiklopedi** aynen korunur; yalnız Cleric yaratım seçicisi masada kullanışlı olması için 30 ana tanrıyla sınırlıdır.
- Eski Clericler silinmez. Eksik tanrı/domain seçimi oyuncu tarafından bir kez tamamlanır ve sonra kilitlenir; DM karakter düzenleme ekranından değiştirebilir.

Kurulumda önce paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala, ardından **`v52-update.sql` dosyasını Supabase SQL Editor’da bir kez çalıştır** ve tarayıcıda `Ctrl + Shift + R` yap. SQL veri silmez, eski RPC’leri değiştirmez ve v31 kayıt birleştirme hattını korur. Mevcut kampanya, karakter, büyü, envanter, market, lonca, harita, görev, karma, adalet, tanrı ve bütün geçmiş kayıtları korunur.

## v51 — Adalet, Alignment ve İlahi Düzen

- DM’ye özel **Karma & Adalet** ekranı iki ayrı −100 / +100 eksen kullanır. Karma, Kötü ↔ İyi davranışı; Adalet ise Kaos ↔ Düzen, adil süreç, hak, yemin ve hesap verebilirliği izler.
- Adalet için beş kademe ve **44 uygulanabilir eylem referansı** eklendi. Zalim yasaya körü körüne uymak otomatik artı sayılmaz; kanıt, orantı, eşit hak ve sorumluluk özellikle değerlendirilir.
- İki puan otomatik olarak **LG, NG, CG, LN, N, CN, LE, NE veya CE alignment eğilimi** üretir. Bu sonuç class değildir, karakteri kilitlemez ve yalnız DM’ye karar desteği verir.
- Her karakter için gerçek class/subclass, species/subspecies, iki ahlaki eksen ve mevcut 128 tanrının alignment/domain/portfolio alanı birlikte değerlendirilir; **en yakın üç tanrı** gerekçeleriyle gösterilir. Yakınlık otomatik bonus veya ibadet zorunluluğu vermez.
- Oyuncu ve DM menüsüne kampanyaya özel **İlahi Düzen Ansiklopedisi** eklendi: dokuz melek düzeni, altı yönetim katmanı, 12 kozmik yasa, yedi ölümcül günahın üç aşamalı yozlaşması/telafisi ve 18 DM görev kancası bulunur.
- İlahi Düzen sayfası açıkça **homebrew lore** olarak işaretlidir; 2014 çekirdek mekaniği değildir ve kendi başına stat, spell, condition veya alignment değiştirmez.
- Uzayan sol ana menü altı açılır gruba ayrıldı. Aktif sayfanın grubu otomatik açılır; açık/kapalı gruplar kampanya ve role göre hatırlanır. Mevcut sayfa butonları taşındığı için eski tıklama akışları korunur.
- Eski `v44KarmaLedger` değerleri ve geçmişi aynen korunur. Adalet ayrı `v51JusticeLedger` kaydında tutulur; mevcut karakter, envanter, market, lonca, harita, görev veya tanrı verisi dönüştürülmez.

v51 için yeni SQL gerekmez; **v45-update.sql daha önce çalıştırılmış olmalıdır**. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala ve tarayıcıda `Ctrl + Shift + R` yap.

## v50 — 200 Görevlik Atama Panosu

- DM ve oyuncu sol menüsüne **Görev Panosu** eklendi. Rehberdeki eski 50 görev düğmesi de 200 görevlik yeni panoya yönlendirilir.
- Toplam **200 benzersiz ve ayrıntılı görev** bulunur: önceki 50 fikir korunup genişletildi, 150 yeni görev eklendi. Altı seviye bandı, 12 harita bölgesi ve 25’ten fazla görev türü aranabilir.
- Her kayıtta oyuncuya açık özet, hedefler, bilinen ipuçları, önerilen skill/DC kontrolleri, karşılaşma, süre, zorluk ve bölge; ayrı **yalnız DM** alanında ters köşe, sır, gizli ödül, başarısızlık sonucu ve ölçekleme bulunur.
- DM görevi bütün partiye veya seçili karakter/oyunculara atayabilir. Karakteri henüz bağlanmamış oyuncu hesapları da seçilebilir.
- **Taslak, Teklif Edildi, Aktif, Tamamlandı, Başarısız ve Arşiv** durumları; yeniden atama, ödülü göster/gizle ve son 24 işlem geçmişi bulunur.
- Oyuncu ekranı yalnız kendisine/tüm partiye açık kayıtları üretir. Taslak/arşiv, ters köşe, DM sırrı, başarısızlık planı ve kapalı ödül metni oyuncu HTML’inde gösterilmez.
- Eski Masa ekranındaki basit görevler silinmez; panoya bir defa **Eski Görev** etiketiyle taşınır. Orijinal `state.quests` kayıtları korunur.
- Katalog ilk 30 kartı çizer, 30’ar yüklenir; arama 120 ms gecikmeli çalışır. Masaüstü filtre çubuğu ve telefon için yatay kaydırmalı/dokunmatik düzen eklendi.

v50 için yeni SQL gerekmez; **v45-update.sql daha önce çalıştırılmış olmalıdır**. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala ve tarayıcıda `Ctrl + Shift + R` yap. Mevcut kampanya, karakter, class/subclass, envanter, market, lonca, harita, karma, tanrı ve bütün geçmiş kayıtları korunur.

## v49 — 2014 Tanrılar Ansiklopedisi

- DM ve oyuncu sol menüsüne **Tanrılar** eklendi; Rehberin üstünde de doğrudan ansiklopedi kısayolu bulunur.
- **128 tanrı** altı grupta toplandı: Unutulmuş Diyarlar, Kelt, Yunan, Mısır, İskandinav ve insan olmayan halklar.
- Her tanrıda alignment, 2014 Appendix B önerilen domainleri, kutsal sembol, etki alanı, kimlerin taptığı, üç inanç ilkesi, adak/ibadet fikri, karakteri oynama biçimi ve DM görev kancası bulunur.
- Cleric bölümü domainin oyun tarzını açıklar. Tanrı seçiminin tek başına STR, AC, proficiency, zar veya spell bonusu vermediği özellikle belirtilir; mekanik güç class/domain ve DM kararından gelir.
- Tanrı, kavram, sembol, takipçi ve görev kancasında çalışan arama; pantheon, alignment ve domain filtreleri eklenmiştir.
- Uzun kartlar kapalı başlar. Liste ilk 36 kartı çizer, arama 128 kaydın tamamında çalışır; telefon filtreleri yatay kaydırılır.
- Tarihsel pantheonlar gerçek din anlatısı değil, 2014 Appendix B’deki fantastik oyun yorumu olarak işaretlenir. Ölüm Domaini bulunan kartlarda 2014 DMG/DM onayı uyarısı vardır.
- Veri salt okunurdur; kampanya state’ine veya buluta yazılmaz. Mevcut karakter, class/subclass, envanter, market, lonca ve geçmiş kayıtları değişmez.

v49 için yeni SQL gerekmez; **v45-update.sql daha önce çalıştırılmış olmalıdır**. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala ve tarayıcıda `Ctrl + Shift + R` yap.

## v48 — 4.000 Ganimet, Büyü Materyalleri ve Gündelik Harikalar

- Ganimet kataloğu tam **4.000 açıklamalı kayda** çıkarıldı. Dağılım: **900 Sıradan, 1.000 Yaygın, 750 Seyrek, 550 Nadir, 380 Çok Nadir, 310 Efsanevi, 110 Artefakt**.
- Materyal bileşeni bulunan **184 adet 2014 SRD büyüsü** için adı belli Büyü Materyal Kiti eklendi. Her kit bağlı büyüyü, gerçek materyali, varsa zorunlu GP değerini, component pouch/focus ikamesini ve materyalin tüketilip tüketilmediğini açıklar.
- **722 gündelik eşya** eklendi: kamp, sofra, kıyafet, yazı, kervan, hayvan bakımı, zanaat ve rol yapma malzemeleri. Hepsi mekanik bonus vermediğini veya tam olarak nasıl kullanıldığını söyler.
- **288 keyif veren fantastik içecek** eklendi. Renkli köpük, değişen ses, iyi uyku, sosyal +1 gibi küçük ve süreli etkiler açık kurallıdır; gerçek dünyaya yönelik tarif içermez.
- **500 gündelik büyülü yardımcı** ile **46 özel isimli eşya** eklendi. Ölülerin Son İzleri Kolyesi gibi her özel kayıtta activation, menzil/süre, kullanım hakkı ve neyi yapamadığı yazılıdır.
- Ganimet Ansiklopedisine kullanım türü filtresi ve tıklanabilir nadirlik sayaçları eklendi. Arama 4.000 kaydın tamamında çalışır ama yalnız ilk 60 kartı çizer; arama metni önbelleğe alınır ve telefonda yazarken takılmaması için 120 ms gecikmeyle yenilenir.
- Önceki 2.260 katalog kaydının sırası ve ID’leri aynen korunur. Yeni kayıtlar sonuna eklenir; mevcut envanter, kuşanılmış durum, yerdeki eşya, lonca, market ve ganimet geçmişi silinmez.

v48 için yeni SQL gerekmez; **v45-update.sql daha önce çalıştırılmış olmalıdır**. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala ve tarayıcıda `Ctrl + Shift + R` yap.

## v47 — 2014 Büyü Kitabı ve Büyü Sayfası Ganimetleri

- DM ve oyuncu sol menüsüne **Büyü Kitabı** eklendi: 319 adet 2014 SRD 5.1 büyüsü cantrip’ten 9. seviyeye kadar aranabilir.
- Seviye, class, büyü okulu, Action/Bonus Action/Reaction, concentration ve ritüel filtreleri birlikte kullanılabilir.
- Her kartta büyü attack/save çözümü, kullanılan zarlar, menzil/alan, süre, komponent, materyal, class büyü statı, yüksek slot ve masada adım adım kullanım bulunur.
- Uzun açıklamalar kapalı başlar; liste 48 kartlık parçalarla çizildiği için telefonda ve eski bilgisayarlarda bütün katalog tek seferde DOM’a yüklenmez.
- Ganimet üreticideki 80 genel okul parşömeni kaldırıldı; yerlerine gerçek adı belli **319 Büyü Sayfası** eklendi.
- Büyü sayfaları class listesi, seviye, rarity, sabit scroll save DC/saldırı bonusu ve `DC 10 + büyü seviyesi` yüksek seviye okuma kontrolünü taşır.
- Büyü Kitabı ile loot aynı veri kaynağını kullanır; rehber ve ganimet açıklaması birbirinden kopmaz.

v47 için yeni SQL gerekmez; **v45-update.sql daha önce çalıştırılmış olmalıdır**. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala ve tarayıcıda `Ctrl + Shift + R` yap. Mevcut kampanya, karakter, hazırlanmış büyü, class/subclass, envanter, kuşanılmış durum, market, lonca, harita, karma ve ganimet geçmişi korunur.

## v46 — Karakter Föyü ve Sınıflandırılmış Envanter

- Oyuncu **Karakterim** ekranı baştan düzenlendi: HP, aktif AC, hız, inisiyatif, proficiency, pasif Farkındalık, büyü statı/Hit Die ve altı ability tek bakışta görünür.
- Karakter ekranına ayrı **Kuşanma Menüsü** eklendi. İki silah yuvası, zırh, kalkan, büyü odağı ve bütün aksesuar/beden yuvaları dolu veya boş durumuyla gösterilir; kuşanılmış eşya buradan doğrudan çıkarılabilir.
- Envanter artık tek uzun liste değildir. Eşyalar **Kuşanılabilir**, **Tüketilebilir & Parşömen**, **Mühimmat**, **Alet & Kamp Malzemesi**, **Bileşen & Hammadde**, **Değerli & Hikâyesel**, **Binek & Hizmet** ve **Diğer & Hurda** olarak ayrılır.
- Eşya adı, açıklaması, etkisi ve bonusunda çalışan arama; kategori filtreleri ve her grupta kayıt/adet sayacı eklendi.
- Eşya kartlarının özeti kısa tutuldu. Kuşan, çıkar, arkadaşa ver, loncaya koy, yere at ve çöpe at araçları karta basınca açılır; mevcut işlem ve bulut kayıt altyapısı değiştirilmedi.
- Species/subspecies, class/subclass, background, saving throw proficiencyleri, hazırlanmış büyü sayısı, direnç/zayıflık ve aktif efektler karakter föyünde düzenli, açılır bölümlere bağlandı.
- Masaüstü görünümü geniş ekipman ızgarası; tablet ve telefon görünümü tek sütun, büyük dokunma alanları ve yatay kaydırılabilen kategori şeridi kullanır.
- Genel kart, aktif menü, focus ve buton görselleri okunabilirliği artıracak şekilde yenilendi; eski menü ID’leri ve buton veri etiketleri korunur.

v46 için yeni SQL gerekmez; **v45-update.sql daha önce çalıştırılmış olmalıdır**. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyala ve tarayıcıda `Ctrl + Shift + R` yap. Mevcut kampanya, karakter, class/subclass, envanter, kuşanılmış durum, market, lonca, harita ve geçmiş kayıtları korunur.

## v45 — Kuşanma Sistemi ve Ganimet Dengesi

- **Kuşan** artık yalnız gerçek ekipmanda görünür: silah, zırh, kalkan, büyü odağı ve gerçekten giyilen aksesuarlar. İksir, parşömen, taş, mücevher, mühimmat, alet, belge, bileşen ve ıvır zıvır bonus alanı taşısa bile kuşanılamaz.
- Tek zırh, tek kalkan, tek odak ve her beden yuvasından tek eşya kullanılabilir. Silah ve yüzük sınırı ikidir; eski genel `wondrous` kayıtlarında sınır üçtür.
- Kolye, yüzük, broş, bileklik, halhal, küpe, pelerin, eldiven, kemer, çizme, mercek ve taç ayrı mantıksal yuvalara ayrıldı. Kehanet Aynası, Ruh Feneri, Cep Kum Saati ve Kemik Zar Takımı gibi elde kullanılan kayıtlar artık giyilebilir sayılmaz.
- Eski kayıtta yanlışlıkla kuşanılmış taş/iksir gibi bir eşya varsa eşya silinmez; yalnız `equipped` işareti temizlenir ve AC/stat/save hesabına etkisi kesilir.
- Ganimet seçimi katalog adetinden bağımsız kategori ağırlığı kullanır. Böylece 672 silah kaydı bulunduğu için sandığın beş silahla dolması engellendi.
- Genel sandıklarda en fazla **2 silah**, **1 zırh**, **1 kalkan** ve kap türüne göre sınırlı toplam kuşanılabilir eşya çıkar. Küçük kaplar daha sıkı; savaşçı kasası savaş ağırlıklı ama yine kotalıdır.
- Kataloğa taş, toprak, kömür, kırık çivi, cam, kemik, yaprak, bez ve benzeri **100 açıklamalı ıvır zıvır** kaydı eklendi. Toplam katalog **2.021 kayıt** oldu; yaratık ini ve yıpranmış kaplar bunlara daha fazla ağırlık verir.
- Her sonuçta aynı katalog kaydı iki kez seçilmez; zorlanan nadirlik başka bir nadirliğe düşmeden korunur. Kap boyutu, tema, para ve uç jackpot sistemi devam eder.

Kurulumda paketteki `dnd` klasörünü sitendeki mevcut `dnd` klasörünün üzerine kopyala. Sonra Supabase SQL Editor’da **`v45-update.sql`** dosyasını bir kez çalıştır ve tarayıcıda `Ctrl + Shift + R` yap. SQL mevcut kayıtları silmez; kuşanma türü ve yuva sınırını oyuncu isteği geldiğinde sunucuda doğrular. Mevcut kampanya, karakter, class/subclass, envanter, market, lonca, harita ve ganimet geçmişi korunur.

## v44 — Gizli Karma ve Ganimet Üretici

- DM sol menüsüne **Karma** eklendi. Her karakter için −100 / +100 aralığında gizli puan, yedi kademe, event fikri, hızlı/özel değişim ve son işlemi geri alma bulunur. Bu sayfa ve değerler oyuncu menülerinde gösterilmez.
- İyilikten fedakârlığa, hırsızlıktan masuma zarar ve ihanete kadar **48 satırlık karma referans tablosu** eklenmiştir. Puanı sistem otomatik vermez; niyet ve bağlama göre son kararı DM uygular.
- DM sol menüsüne **Ganimet Üretici** eklendi. Seviye 1–10, 14 kap/kaynak, 10 tema, dört kalite ve yedi nadirlik arasından seçim yapılabilir.
- Katalogda silah, zırh, kalkan, aksesuar, büyü odağı, iksir, parşömen, bileşen, değerli taş, belge, alet ve mühimmat dâhil **1.921 açıklamalı kayıt** vardır. Market kaydı olma şartı yoktur.
- Kapların fiziksel boyut ve kategori kuralları vardır: para kesesinden gürz/zırh/şişe; simyacı çantasından ağır savaş teçhizatı; mücevher kutusundan silah çıkmaz.
- Sonuç yalnız para, yalnız eşya veya birden çok eşya + para olabilir. Düşük sandıklarda artefakt ihtimali 1/100.000.000; efsanevi sürpriz için sonraki ihtimal 1/10.000.000’dur.
- Üretilen eşyalar seçilip yerdeki ortak alana bırakılabilir veya açıklama ve bütün bonus alanlarıyla doğrudan karakter envanterine verilebilir. Son 30 üretim saklanır; ansiklopediden elle eşya eklenebilir.
- Katalog performans için filtreli ilk 60 sonucu çizer; bütün 1.921 kayıt bellekte aranabilir. Karma ve ganimet ekranları telefon/tablette tek sütun ve büyük dokunma alanı kullanır.

v44 için yeni SQL gerekmez. Mevcut kampanya, karakter, market, envanter, kasa ve geçmiş verileri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v43 — Hazırlanmış Büyü Görünümü Hotfix

- DM Karakterler ve oyuncu Yetenekler ekranlarında büyülerin `undefined. seviye — undefined` görünmesine neden olan dizi/nesne veri biçimi çakışması giderildi.
- Mevcut hazırlanmış büyüler yeniden seçilmeden ad, seviye, açıklama ve ayrıntılı kullanım kartlarıyla görünür.
- Sistem yeni nesne kayıtlarının yanında eski dizi, yalnız ID/ad ve snake_case kayıtlarını da tanır.
- Hazır kütüphanede bulunmayan eski veya özel büyü kayıtları silinmez; eldeki bilgileriyle okunabilir kart olarak gösterilir.
- Tek bir boş/bozuk kayıt artık diğer hazırlanmış büyülerin görünmesini engellemez.

v43 için yeni SQL gerekmez. Karakterler ve hazırlanmış büyü seçimleri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v42 — Zar Seçimi Kalıcılık Hotfix

- Zar Ocağı’nda seçilen zar türü artık zar günlüğü yenilendiğinde, bulut eşitlemesinde veya sayfa yeniden çizildiğinde kaybolmaz.
- Kontrol/saldırı seçimi, zar adedi, bonus ve özel formül de aynı şekilde korunur.
- Son atışın toplamı, formülü ve tek tek zarları yeniden çizimden sonra sonuç alanında kalır.
- Tercihler oyuncu ve kampanya bazında yalnız o cihazda saklanır; ortak kampanya state’ine yazılmaz ve başka oyuncunun seçimini etkilemez.
- Skill seçiminin otomatik bonus hesabı çalışmaya devam eder; elle değiştirilmiş bonus sıfırlanmaz.

v42 için yeni SQL gerekmez. Mevcut kampanya ve zar geçmişi korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v41 — Efekt ve Lonca Yönetimi Düzeltmesi

- Karakter efektleri artık hem eski düz metin kayıtlarını hem de savaştan gelen süreli kayıtları aynı anda tanır. **Efektleri Yönet** penceresinden tek tek kaldırılabilir veya topluca temizlenebilir.
- Karakter ile encounter arasındaki eşitleme efekt adı, süre ve kimliğini kaybetmeden iki yönlü çalışır. Oyuncu ekranlarındaki `[object Object]` görünümü giderildi.
- Lonca sayfasına tam bir **DM Müdahale Paneli** eklendi: lonca adını değiştirme, oyuncuyu üye yapma/çıkarma, ortak eşya ekleme, düzenleme, silme ve karaktere aktarma.
- Lonca kasasının PP/GP/SP/CP ekleme–çıkarma araçları doğrudan Lonca ekranında görünür. İlk yüklemede eski bakiyede kalma sorunu düzeltildi.
- Lonca eşyası aktarılırken zırh, AC, saldırı/hasar/save, stat bonusları ve diğer özel alanlar korunur; kaynak adet güvenli biçimde azaltılır.
- NPC Defteri’ndeki eski işlevsiz **Eşya** düğmesi çalışır hale getirildi. DM artık NPC envanterine eşya ekleyip kaldırabilir.
- DM tarafından verilen özel yetenekler artık düzenlenebilir ve silinebilir.
- Yeni yönetim ekranları telefon ve tablette tek sütuna iner; düğmeler dokunma için tam genişlik kullanır.

v41 için yeni SQL gerekmez. Mevcut karakter, efekt, encounter, lonca, kasa ve envanter verileri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v40 — Market Buton Çakışması Hotfix

- Market hediyesindeki onay düğmesinin **Bonuslu Eşya Ver** penceresini açmasına neden olan `data-item` çakışması kaldırıldı.
- Market onayı artık yalnız kendisine ait `data-v39-market-item` etiketiyle çalışır.
- Bonuslu eşya dinleyicisi yalnız gerçekten var olan bir karakter ID’sine bağlı düğmeyi kabul eder; başka menülerin butonlarını yakalayamaz.
- Build 39’daki tam özellikli eşya kopyalama, benzersiz ID, isteğe bağlı stok düşme ve sıralı bulut kaydı aynen korunur.

v40 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v39 — Market Eşyasını Oyuncuya Verme Düzeltmesi

- DM market kartındaki **Oyuncuya Ver / Hizmeti Tanımla** düğmesi artık eski `inventory_give_market` SQL fonksiyonuna bağlı değildir.
- Hedef karakter ve adet doğrulanır; eşya benzersiz envanter ID’siyle ve kaynak market ID’si korunarak verilir.
- Zırh AC alanları, silah bonusları, stat bonusları, binek yolculuk bilgileri, hizmet türü ve diğer bütün mekanik alanlar eksiksiz kopyalanır.
- Ücretsiz DM hediyesi market stokunu varsayılan olarak azaltmaz. İstenirse penceredeki **Market stokundan da düş** seçeneği açılabilir; yetersiz stokta işlem durdurulur.
- İşlem v31’in sıralı/birleştirmeli bulut kayıt hattını kullanır; eşzamanlı oyuncu değişikliklerini korur ve kayıt tamamlanınca sonuç bildirir.
- Hediye penceresi masaüstü ve telefonda okunabilir, büyük dokunma alanlı düzene geçirildi.

v39 için yeni SQL gerekmez. Mevcut kampanya, karakter, market, stok, fiyat ve oyuncu envanterleri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v38 — Yol Ağı ve Taktik Savaş Alanı

- Haritadaki 12 kale, arazi ve risk açıklaması olan **23 yol** ile bağlandı. Her yolun yaya temel süresi haritada görünür; rota planlayıcı keşfedilmiş kaleler arasında en kısa güzergâhı hesaplar.
- DM seyahati uyguladığında parti konumu, kampanya tarihi ve o kalenin market tierleri birlikte güncellenir. Son 100 yolculuk kayıt içinde korunur.
- Ahır ve Binekler kartlarına yolculuk süresini kaç yüzde kısalttığı ve hangi arazide uygun olduğu eklendi. Bu oranlar D&D 2014’ün evrensel olmayan binek kurallarını masada hızlandıran, açıkça işaretlenmiş kampanya yardımcısıdır.
- Encounter ekranına eski initiative/HP/efekt sistemini kullanan **kareli taktik savaş alanı** eklendi. 1 kare 5 ft’tir; her token hızını ve o tur kaç ft yürüdüğünü gösterir.
- DM; oyuncu, NPC ve hazır yaratıkları masaüstünde sürükleyip bırakarak, telefonda öğeye ve ardından kareye dokunarak ekleyebilir. Eklenen savaşçı encounter listesine ve haritaya aynı anda girer.
- Altı hazır alan bulunur: Karaçam Pususu, Yıkık Taç Salonu, Eşkıya Kampı, Meşalesiz Mahzen, Kırık Köprü Savunması ve Kale Kapısı Kuşatması. Boyut 8–40 sütun ve 8–30 satır arasında değiştirilebilir.
- Ağaç, çalılık, kaya, su, çamur, duvar, parmaklık, barikat, yıkık sütun, moloz, lahit, sandık, kapı, çadır, meşale ve kamp ateşi yerleştirilebilir. Boyut, hareket/görüş engeli ve ışık ayarları düzenlenebilir.
- Parlak, loş ve karanlık ışık; normal görüş, darkvision, ışık kaynakları, görüş kesen engeller ve kare bazlı sis bulunur. DM sisi fırçayla açıp kapatabilir veya oyuncu görünümünü önizleyebilir.
- Savaş tahtası hazırlıkta oyuncuya görünmez. DM **Oyuncuya Aç** dediğinde veya **Savaşı Başlat** kullandığında yayınlanır; savaş bitince tekrar gizlenir.
- Masaüstü üç panelli düzen kullanır; tablet ve telefonda araçlar tek sütuna iner, büyük savaş tahtası iki yönde dokunarak kaydırılır.

v38 için yeni SQL gerekmez. Mevcut kampanya, karakter, encounter, market ve harita verileri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v37 — Uygulama İçi Sürüm Notları

- DM ve oyuncu sol menüsüne ayrı **Sürüm Notları** sayfası eklendi.
- Projenin başlangıcından bugüne bütün büyük değişiklikler oyuncuya açık `v0.1–v1.4` kilometre taşları halinde yazıldı.
- Her sürümde **Yeni / Düzeltildi / Değiştirildi** ayrımı ve kapsadığı teknik build etiketi bulunur.
- Özellik arama, eski/yeni sıralama, tüm sürümleri açma ve kapatma kontrolleri eklendi.
- Masaüstünde üç sütunlu değişiklik özeti; tablet ve telefonda tek sütunlu, dokunma dostu görünüm kullanılır.

v37 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v36 — 380 Kayıtlık Market

- Market kataloğu **286’dan 380 ürün/hizmete** çıkarıldı.
- 94 yeni kayıt; şifacı, demirci, zırhçı, okçu, genel eşya, han, restoran, gizemli/lanetli dükkân, simyacı, ahır ve tapınağa dengeli dağıtıldı.
- Eksik 2014 silahları ve macera ekipmanları; resmî büyülü/lanetli eşya aileleri, örnek zehirler, ulaşım ve açık kurallı hizmetler eklendi.
- Eski kampanyalarda yalnız eksik v36 kayıtları eklenir. Oyuncu envanterleri, özel ürünler, stoklar ve DM’nin elle değiştirdiği fiyatlar korunur.
- v35 responsive market ve telefon/harita düzeltmeleri aynen korunur.

v36 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v35 — Responsive Market Düzeltmesi

- DM marketindeki üst üste binme ve kataloğun dar sol sütuna düşmesi düzeltildi.
- Masaüstünde market ayarları solda, ürün kataloğu kalan genişlikte çok sütunlu görünür.
- Tablet ve telefonda market kontrollü biçimde tek sütuna iner; kartlar ekran dışına taşmaz.
- Haritada dokunarak iki yönde kaydırma, küçük ekran tuvali ve düzenleme penceresi iyileştirildi.

v35 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v34 — Kale Ekonomisi, Binekler, Tapınak Hizmetleri ve Görev Havuzu

- Market kataloğu 141 kayıttan **286 ürün/hizmete** çıkarıldı; mevcut hazır içerik neredeyse iki katına ulaştı.
- Market içinde ayrı **Simyacı**, **Ahır ve Binekler** ve **Tapınak** dükkânları eklendi.
- Ahırda resmî 2014 fiyat mantığındaki sıradan binekler, taşıtlar, binek ekipmanları; daha yüksek tierlerde DM onaylı fantastik binek ve ulaşım sözleşmeleri bulunur.
- Tapınakta yalnız eşya değil; Bless, Lesser/Greater Restoration, Remove Curse, Death Ward, diriltme ayinleri, kehanet ve alan koruması gibi açık kurallı hizmetler satın alınabilir. Hizmet alımı karakter envanterine uygulanmayı bekleyen bir hizmet kaydı bırakır.
- Market araması ve tier filtresi eklendi. Hizmet, binek ve normal ürün kartları birbirinden ayrıldı.
- Bariz fiyat hataları düzeltildi: örneğin İyileştirme İksiri ve Antitoksin 5 GP yerine 50 GP, Meşale 1 SP yerine 1 CP oldu. Nadir/çok nadir büyülü eşyalar hikâye seviyesindeki güçlerine göre pahalılaştırıldı. DM’nin elle değiştirdiği fiyat aynı eski varsayılanla eşleşmiyorsa korunur.
- 12 kalenin dükkân tierleri zorluk, biyom ve lore’a göre yeniden dengelendi. Karaçam yalnız uygun T1 hizmetlerle başlar; Kültaç’ın şifacı, simyacı, demirci, zırhçı ve ateş tapınağı T3’tür; dağ, liman, ticaret, çöl ve bataklık kaleleri kendi uzmanlıklarına sahiptir.
- Market, grubun bulunduğu kalenin açık dükkân ve tierlerini tek tuşla uygulayabilir. DM partiyi başka kaleye aldığında market ayarı da o kaleye geçer. Mevcut elle kurulmuş açık market ilk kurulumda zorla ezilmez.
- DM Rehberi’ne **50 Görev Fikri** bölümü eklendi. Görevler Lv 1–2, 3–4, 5–7, 8–10, 11–14 ve 15–20 olarak ayrılır; başlangıç, ters köşe ve ödül fikri içerir. Seçilen fikir tek tuşla aktif görevlere eklenebilir.

v34 için yeni SQL gerekmez. Alışveriş ve ekonomi SQL’leri daha önce kuruluysa bu paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v33 — Dolu Kale Atlası ve Sade Harita Düzenleyicisi

- Haritadaki 12 kalenin adı, bölgesi, kısa hikâyesi, zorluğu, önerilen seviye aralığı, tehlikeleri, istihbaratı, dungeonı ve DM sırrı hazırlandı.
- Her kalede Şifacı, Simyacı, Demirci, Zırhçı, Okçu, Genel Eşya, Han/Bar, Restoran, Ahır ve Tapınak ayrı ayrı `Yok / Tier 1–3` olarak tanımlandı. Her hizmet her kalede bulunmaz.
- Gizemli ve Lanetli Dükkânlar kale hizmeti olamaz; DM bunları haritaya ayrı bir nokta olarak ekleyebilir.
- Grup başlangıçta **5 numaralı Taçova Kalesi**ndedir. Kale, geçmişi ve içerideki hizmetler oyuncuya açık; bağlı dungeon bilgisi keşfedilmemiş başlar.
- Normal Harita sayfası sadeleştirildi. DM üstteki **Kalem** düğmesini açıp bir kaleye dokunduğunda ayrı düzenleme penceresi açılır.
- Seçili kale kartındaki **Oyuncuya göster** ve **İçerisi keşfedildi** sürgüleri hızlı görünürlük kontrolü sağlar. Ayrıntılı sis, geçmiş ve dungeon izinleri düzenleme penceresindedir.
- Önceden yazdığın kale bilgileri korunur; yalnız boş alanlar hazır atlas verisiyle tamamlanır.

v33 için yeni SQL gerekmez. v32 lonca işlem geçmişi daha önce kurulmadıysa `v32-update.sql` dosyasını bir kez çalıştır; ardından bu paketteki `dnd` klasörünü sitendeki `dnd` klasörünün üzerine kopyala.

## v32 — Etkileşimli Harita ve Lonca İşlem Geçmişi

- Ana menüye DM ve oyuncu için ayrı davranan **Harita** bölümü eklendi.
- `Map.png` üzerinde tam 12 sabit kale noktası bulunur. Kale, bölge ve orman adları görsele gömülü değildir; DM bunları oyun içinden yazar.
- DM arazi sisi, konum işareti/adı, geçmiş, içerisi/istihbarat ve dungeon bilgisini birbirinden bağımsız açabilir.
- Kale kartlarında normal hizmetler, demirci tieri, savunma/tehlike, içeridekiler, bağlı dungeon, önerilen seviye ve yaratık bilgileri tutulur. Yalnızca DM notu hiçbir keşif ayarıyla oyuncuya gösterilmez.
- DM haritaya sonradan bölge, dungeon, yerleşim, özel nokta, gizli dükkân veya lanetli dükkân ekleyip taşıyabilir. Bu iki dükkân türü kale içi hizmetlerden ayrı konum olarak tasarlanmıştır.
- Oyuncular yalnızca DM’nin sisini kaldırdığı araziyi ve ayrıca açtığı bilgi katmanlarını görür. DM tek tuşla oyuncu görünümünü önizleyebilir.
- Oyuncuların lonca kasasına para yatırması/çekmesi ve ortak envantere eşya koyması/alması ortak işlem geçmişine kaydedilir. Diğer lonca üyeleri son 200 işlemi görür.
- DM’nin Kasa veya envanter yönetiminden yaptığı manuel düzeltmeler işlem geçmişine yazılmaz.

Önce Supabase SQL Editor’de `v32-update.sql` dosyasının tamamını **bir kez çalıştır**, ardından bu paketteki `dnd` klasörünü sitendeki `dnd` klasörünün üzerine kopyala. SQL mevcut kayıtları silmez ve tekrar çalıştırılabilir. `v31-update.sql` ile `guild-update.sql` daha önce kurulmuş olmalıdır.

## v31 — Performans ve Veri Güvenilirliği

- DM kayıtları sıraya alınır; kampanya değiştirme, salona dönme ve çıkış öncesinde bekleyen kayıt tamamlanır.
- DM’in yerel değişiklikleri, aynı anda oyuncuların yaptığı HP/eşya/market güncellemeleriyle üç yönlü birleştirilir; bütün kampanya JSON’unun eski kopyayla ezilmesi önlenir.
- Eşya taşıma, yerden alma, lonca hareketi, kuşanma ve silme işlemleri index yanında ID/ad doğrular. Liste başka sekmede değiştiyse yanlış eşya yerine işlem güvenle durur.
- Bölünen stack yeni bir ID alır; transfer edilen zırh/kalkan kuşanılmış gitmez. Market satın alımı eşyanın AC/stat/özel alanlarını artık korur.
- Kampanya değişince zar, mesaj, bildirim, kasa, filtre ve açık-panel cache’leri temizlenir. Bildirim istekleri üst üste binmez; arka plandaki sekmede gereksiz polling durur.
- Yaratık filtresi artık bütün sayfanın eventlerini her tuşta yeniden bağlamaz; dışa aktarma Blob URL’si kullanımdan sonra serbest bırakılır.
- Karakter ile ona bağlı encounter savaşçısının HP’si iki yönlü eşitlenir; Long Rest ve karakter efektleri aktif savaşa yansır. Oyuncudaki iki ayrı savaş menüsü tek menüye indirilmiştir.
- ASI puanları mevcut seviye bütçesini aşsa bile statlara fazladan uygulanmaz. Subclass açılışı 2014 class seviyesine göre 1/2/3 olarak doğrulanır; Cleric/Sorcerer/Warlock başlangıç subclassını artık karakter oluştururken seçer ve kaydeder.
- Zırh AC formülleri; Monk+kalkan şartı, büyülü zırh AC bonusu, tek zırh/tek kalkan ve zırh proficiency uyarılarıyla düzeltilmiştir.
- Eksik sekiz temel yaratığın stat/saldırı/özellik/zayıflık kartları tamamlanmıştır.

Önce Supabase SQL Editor’de `v31-update.sql` dosyasının tamamını **bir kez çalıştır**, ardından bu paketteki `dnd` klasörünü sitendeki `dnd` klasörünün üzerine kopyala. SQL veri silmez ve tekrar çalıştırılabilir. Bu sürüm, isteğin doğrultusunda mevcut giriş/admin güvenlik mimarisini değiştirmez.

## v30 — Gerçek Proficiency, Background, Expertise ve ASI

- 18 skill bağlı ability ve hesaplanmış bonuslarıyla karakter ekranına eklendi.
- Class skill seçim havuzu ve seçim sınırı, background skill/tool/dil proficiencyleri ve species ek skillleri kaydedilir.
- Bard/Rogue Expertise seçimleri gerçek proficiency listesinden yapılır.
- Save, weapon, armor, tool ve language proficiencyleri tek panelde görünür.
- Zar menüsü artık sabit class tahmini yerine karakterin kaydedilmiş skill proficiency ve Expertise seçimlerini kullanır.
- Level atlayınca STR/DEX otomatik dağıtımı kaldırıldı. ASI hakları oyuncu tarafından ability veya feat olarak harcanır.
- Eski karakterler `Yetenekler > Seçimleri Düzenle`, DM ise `Karakterler > Proficiency / ASI` ile yapılandırılabilir.

Kurulumdan sonra `v30-update.sql` dosyasını Supabase SQL Editor’de bir kez çalıştır. Veri silmez.

## v29 — Placeholder Açıklama Temizliği

- Karakter oluşturma önizlemesi, karakter trait kartı ve seviye özellikleri ayrıntılı alt tür/subclass verisine bağlandı.
- `Temasına uygun güç kazanır`, `mirası güçlenir` ve `kesin mekaniği DM belirler` şeklindeki eski otomatik metinler kaldırıldı.
- Subspecies özellikleri seviye 1’de, subclass özelliği ise classın gerçek seçim seviyesinde gösterilir.

v29 yeni SQL gerektirmez.

## v28.1 — Subspecies ve Subclass Gerçek Mekanikleri

- `Türe uygun güç kazanır` gibi belirsiz placeholder açıklamalar kaldırıldı.
- Alt türlerde ability, direnç, hareket, büyü, action/bonus action ve kullanım hakkı açıkça yazıldı.
- Subclasslarda ilk açılan temel mekanikler, kullanılan action/reaction, zar, save ve dinlenmede yenilenme özeti eklendi.
- 2014/5e ile 2024/5.5e ayrımı korundu; homebrew seçenekler açıkça etiketlendi ve ölçülebilir kampanya kuralları verildi.

v28.1 yeni SQL gerektirmez.

## v28 — DM Eşya Aktarımı ve Karakter Ansiklopedisi

- v27.1 açık panel ve kaydırma konumu koruması bu pakete dahildir.
- DM, Karakterler menüsünde bir oyuncunun eşyasını adet seçerek başka karaktere aktarabilir; eşyanın bonusları korunur ve kuşanılmış durumu güvenlik için kapanır.
- Zar Günlüğü başlığına DM için `Geçmişi Temizle` düğmesi geri eklendi.
- Rehbere ayrı `Karakter Ansiklopedisi` bölümü eklendi.
- Ansiklopedi sitedeki bütün species/subspecies ve 2014 class/subclass seçeneklerini listeler; classların 1–20 seviye gelişimi açılır satırlardadır.
- Ansiklopedi araması ve mobil tek sütun görünümü eklendi.

v28 yeni SQL gerektirmez. Zar geçmişi temizleme için önceki paketteki `progression-update.sql` daha önce çalıştırılmadıysa bir kez çalıştır.

## v27.1 — Açık Paneller Korunur

- Bulut eşitlemesi veya arka plan yenilemesi sırasında açık karakter, skill, spell, yaratık, market ve kasa ayrıntıları artık kapanmaz.
- Aynı sayfa yeniden çizildiğinde sayfa ve masaüstü sol menü kaydırma konumu korunur.
- Sayfa değiştirip geri dönüldüğünde o sayfada açık bırakılan ayrıntılar yeniden açılır.

v27.1 yeni SQL gerektirmez.

## v27 — Ekran Ekran UX ve Yaratık Ansiklopedisi

- Masaüstü sol menü kendi içinde kaydırılabilir hale getirildi.
- Karakterler sayfası kompakt özet kartlarına çevrildi; stat, trait, class, subclass, spell ve envanter ayrıntıları kapalı başlar.
- Oyuncu Yetenekler sayfasındaki uzun açıklamalar başlığa basınca açılır.
- Kasa kartları özet görünür; DM para düzenleme alanları karta basınca açılır.
- Market iki bölümlü düzene kavuştu; ürün açıklama ve yönetim araçları kapalı başlar.
- Yaratıklar kategori ve CR filtreli ansiklopediye çevrildi.
- Yaratık kartlarında STR/DEX/CON/INT/WIS/CHA, HP, AC, hız, CR, saldırılar, yetenekler, dirençler, bağışıklıklar ve karşı oyun bilgisi bulunur.
- Hazır yaratık kataloğu Beast, Humanoid, Undead, Ooze, Giant, Dragon, Construct, Aberration ve Monstrosity kategorilerinde genişletildi.
- NPC kartları kompakt/açılır hale getirildi.
- Bütün sayfalara açıklayıcı kısa menü notu ve tutarlı boşluk/buton düzeni uygulandı.

v27 yeni SQL gerektirmez. v26 `guild-update.sql` daha önce çalıştırılmadıysa yalnız onu çalıştır.

## v26 — 2014 Kuralları, Okunabilir Arayüz ve Lonca

- Mevcut karakter, species/subspecies, class/subclass, para ve envanter kayıtları korunur.
- Yeni class/subclass seçimlerinden 2024 ve homebrew sınıf karmaşası temizlendi; eski karakterde kullanılıyorsa seçim gösterilmeye devam eder.
- Seviye düşürme veya düzenleme artık mevcut subclassı otomatik silmez.
- Class özellikleri 2014 akışına göre yeniden düzenlendi; karaktere özel fight kartına silah proficiency, saldırı, hasar, spell attack ve DC eklendi.
- Rehber kısa, aranabilir ve oturum odaklı bir 2014 metnine çevrildi.
- Tüm sayfalarda okunabilirlik, kart, buton, form ve menü aralıkları geliştirildi.
- Mobil sol menüye görünür X kapatma tuşu eklendi.
- Lonca kurma, kodla katılma, çıkma, ortak kasaya para yatırma/çekme ve ortak envantere eşya yatırma/geri alma eklendi.

Bu sürümde yalnızca `guild-update.sql` dosyasının tamamını Supabase SQL Editor'de çalıştır.

## v25.1 — Açıklamalı Yetenek ve Savaş Kartı

- Bütün görünen class özelliklerinde kullanım türü, kaynak, süre ve masada uygulanış alanları bulunur.
- Hazırlanmış spell kartlarında casting time, menzil, süre, V/S/M, slot ve gerçek zar/save çözümü gösterilir.
- Karaktere özel “Nasıl Dövüşürüm?” kartı saldırı bonusunu, hasarı, spell DC’yi ve temel tur akışını otomatik hesaplar.
- Monk/Plasmoid, Druid, Paladin, Rogue ve Fighter için doğrudan oynanış yönlendirmesi vardır.
- 2014, 2024 ve homebrew özellikleri birbirinden ayrılır.

## v25 — Oturum ve Savaş Düzeltme Paketi

- Savaş/skill/AC/büyü rehberi genişletildi.
- Akıllı zar menüsü seçilen skill'in ability ve proficiency bonusunu otomatik yazar.
- Aktif form alanları bulut senkronu tarafından artık sıfırlanmaz.
- Market eşyaları ID ile DM tarafından ücretsiz verilebilir.
- Zırh, kalkan ve stat bonuslu eşyalar kuşanılabilir; AC/stat hesabına uygulanır.
- Oyuncu envanteri açılır kompakt aksiyon menüsüne kavuştu.
- Species/subspecies başlangıç seçimi ve canlı karakter önizlemesi geliştirildi.

Bu sürüm için güncel `inventory-update.sql` dosyasının tamamını SQL Editor'de çalıştır.

Bu sürümde kullanıcı hesabı, kalıcı kampanya üyeliği ve ayrı DM/oyuncu panelleri bulunur.

Karakter oluşturma ve düzenleme penceresinde Species → Subspecies ile Class → Subclass seçimleri birbirine bağlıdır; üst seçim değiştiğinde alt seçenekler anında yenilenir.

Kampanya değişiklikleri Supabase Realtime Broadcast ile diğer açık cihazlara anında bildirilir. Bağlantı kısa süreli kesilirse 30 saniyelik yedek kontrol otomatik olarak devreye girer. Bunun için ek SQL çalıştırmak gerekmez.

## 1. Supabase güncellemesi (zorunlu)

Supabase > SQL Editor > New query aç. `supabase-setup.sql` dosyasının tamamını yapıştır ve **Run** düğmesine bas. `Success. No rows returned` görünmelidir. Eski kampanyalar silinmez.

Önceki sürüm zaten kuruluysa tüm dosya yerine yalnızca `pact-update.sql` içeriğini bir kez çalıştırman yeterlidir. Bu işlem mevcut hesapları, kampanyaları ve kayıtları silmez.

Para, gelişmiş market, otomatik para bozma ve oyuncular arası transfer için güncel `economy-update.sql` dosyasını SQL Editor'de çalıştır. Daha önce çalıştırmış olsan da tekrar çalıştırman gerekir; mevcut para ve kampanya kayıtlarını silmez.

Ortak zar günlüğü, oyuncunun kendi seviye 1 karakterini oluşturması ve tek seferlik subclass seçimi için `progression-update.sql` dosyasının güncel halini SQL Editor'de çalıştır. Önceki sürümünü çalıştırdıysan bunu tekrar çalıştırmak güvenlidir; mevcut kampanya ve karakterleri silmez.

DM kampanya silme ve sunucu yönetim paneli için `admin-update.sql` dosyasını SQL Editor'de bir kez çalıştır. Admin parolası kaynak kodda tutulmaz; yalnız Supabase'te bcrypt özeti olarak saklanır. Bu kurulum mevcut parolayı veya kayıtları değiştirmez.

Kalıcı genel/özel yazışmalar ve bildirim merkezi için `session-update.sql` dosyasını SQL Editor'de bir kez çalıştır. Karakter onayı, kampanya tarihi, Long Rest ve savaş turu verileri mevcut kampanya kaydının içinde saklanır.

Oyuncuların eşyayı bütün bonuslarıyla başka oyuncuya vermesi, lonca envanterine koyması veya yere bırakması için `inventory-update.sql` dosyasını SQL Editor'de bir kez çalıştır. Yerdeki eşyaları diğer oyuncular alabilir; eşyanın tüm özel alanları korunur.

## 2. GitHub Pages

Bu ZIP içindeki `dnd` klasörünü sitenin kök klasöründeki eski `dnd` klasörünün üzerine kopyala. GitHub Desktop'ta değişiklikleri commit edip pushla. Adres: `https://egecanturk.dev/dnd/`

## 3. İlk kullanım

1. DM, Kayıt Ol ekranından hesap açar.
2. Giriş yaptıktan sonra Kampanya Kur der; otomatik oda kodu oluşur.
3. Oyuncular hesap açar, oda koduyla bir kez katılır.
4. DM > Karakterler ekranında bekleyen oyuncunun adına basıp karakter oluşturur.
5. Sonraki girişlerde kampanya ve karakter otomatik hatırlanır.

`config.js` içindeki publishable anahtar tarayıcı kullanımı içindir. Secret/service_role anahtarını bu klasöre koyma.
