# Farms & Fields — Unity 2D Pixel Art Oyun Tasarımı ve Devir Dosyası

**Tarih:** 23 Ekim 2026  
**Durum:** Unity geliştirmesi için hedef belge. Web prototipinin çalışan özellikleri aşağıda ayrı belirtilir.  
**Yeni sohbet için kullanım:** Bu dosyayı temel al. Oyunu Unity 2D pixel art olarak geliştir. Eski web arayüzünü görsel veya karakter kuralı şablonu yapma; mevcut veri ve yetki kurallarını gerektiğinde kullan.

## 1. Oyun kimliği

Farms & Fields (FNF), arkadaş grubunun birlikte oynadığı, fantastik bir bölgede **keşif, tarım, köy kurma, üretim, topluluk ilişkileri ve mitolojik olaylar** üzerine kurulu bir 2D pixel art oyunudur. Oyuncular küçük, geçici bir kamptan başlar; araziyi tanır, kendi köylerini kurar veya başka bir köye katılır. Dünya, oyuncuların kararlarına ve geçen günlere göre değişir. Oyun günü bir kişi tarafından ilerletilir; gün içindeki görüşme, keşif ve kararlar serbestçe oynanır.

Ana deneyim, ekilen bir tohumun mevsim ve bakım şartlarıyla büyümesini, bulunan canlıların bilgisinin açılmasını, köyün sakinlerle gelişmesini ve zamanla farklı yerleşimlerin birbirine bağlanmasını **görsel dünyada yaşamak**tır. Tehlike ve savunma olabilir; ana oyun döngüsü savaş üzerine kurulmaz.

### Tasarım ilkeleri

- Kendine ait isimler, canlılar, karakter tasarımları, pixel art varlıkları, müzik ve arayüz dili kullanılacak. Başka bir oyunun haritası, sprite'ı, karakteri, metni veya ekran düzeni alınmayacak.
- İşlemler animasyonlu ve mekânsal hissettirmeli: tarlaya yürümek, ekmek, su taşımak, ürünü görmek, köy sakininin işe gitmesini izlemek.
- Oyuncu neyi bildiğini ve bilmediğini anlayacak. Gizli bilgi yanlışlıkla istemciye gönderilmeyecek.
- Kurallar veri odaklı olacak: yeni tohum, mevsim, tarif, canlı, bina veya olay eklemek için büyük kod değişikliği gerekmeyecek.
- Geliştirme küçük oynanabilir dilimlerle ilerleyecek. Bu belge hedefleri açıklar; mevcut web sürümünde olmayan bir şey çalışıyor sayılmayacak.

## 2. Platform, görüntü ve sunum

- **Ana hedef:** Unity ile geliştirilen 2D pixel art oyun. İlk hedef masaüstü; diğer platformlar oynanabilir prototipten sonra değerlendirilecek.
- **Kamera:** Üstten veya hafif açılı üstten görünüm. İlk prototip için 32×32 dünya karosu ve tam sayı yakınlaştırma bir çalışma varsayımıdır; nihai çözünürlük sprite testinde seçilir.
- **Sahneler:** Başlangıç kampı, köy, tarla, orman, gölet/dere, yol, tapınak, pazar/şehir. Her alan aynı evrenin devamı gibi görünür.
- **Mevsimler:** Çevre paleti, yapraklar, mahsul evreleri, hava, çevre sesi ve küçük animasyonlar değişir. Büyülü mevsimlerde ışık/sis/bitki tepkileri belirgin ama okunaklıdır.
- **Meyve görünürlüğü:** Meyve çalı veya ağacın dalında görünür; tek tip çiçek sprite'ı kullanılmaz. Tahıl, kök, mantar, su bitkisi, ağaç, çalı ve sarmaşık farklı büyüme siluetlerine sahiptir.
- **Ansiklopedi sanatı:** Mevcut parşömen üstü grafit habitat çizimleri saha defterinde kullanılabilir. Dünya içindeki hareketli varlıklar ayrıca pixel art sprite ve animasyon olarak hazırlanır. Bir defter görseli otomatik olarak oyun sprite'ı sayılmaz.
- **Arayüz:** Koyu, zarif ve okunaklı oyun arayüzü. Ana merkezler solda veya oyun içi defter/harita üzerinden açılabilir; her küçük işlem için ayrı ana menü açılmaz. Tarla ızgarası, köy haritası, ansiklopedi ve iş çizelgesi kendi biçiminde gösterilir.

## 3. Oturum ve roller

| Rol | Oyun içindeki işi |
| --- | --- |
| Dünya Yöneticisi | Odayı kurar; oyunun gününü ilerletir, olayları ve gizli bilgiyi yönetir, başlangıç kaynakları verebilir, keşif alanlarını açar. Oyuncu karakteri oluşturmaz. |
| Oyuncu | Karakterini yönetir; keşfeder, köy kurar/katılır, izinleri kapsamında üretim ve köy işleri yapar. |
| Köy sahibi/eş kurucu | Köy üyeliği, inşa, karar ve iş atama yetkilerini düzenler. Dünya Yöneticisi ile aynı rol değildir. |

- Hesap **kullanıcı adı + şifre** ile, e-posta doğrulaması ve oda kodu olmadan açılabilir.
- Oda kurma ayrı bir gizli **kurucu şifresi** gerektirir. Şifre yalnız Ege ve şifreyi verdiği arkadaşlarında olur; oyun istemcisine veya depoya gömülmez.
- Oyuncular odaya **oda koduyla** katılır. Kod, kurucu şifresi değildir.
- Kritik yetkiler sunucuda doğrulanır. Unity arayüzünde düğmenin gizlenmesi tek başına güvenlik sağlamaz.
- Dünya Yöneticisi gün geçişi, keşif onayı, olay, malzeme dağıtımı, tapınak ve gerekli düzeltmeler için ayrı bir yönetim görünümü kullanır.

## 4. Karakter ve beceriler

Oyuncu karakterinin görünümü, geçmişi, kişiliği ve yaşadığı bölgeyle ilişkisi önemlidir. Karakter başlangıçta işe yarar yatkınlıklarla başlar; bütün beceriler sıfırdan başlamaz. **Meslek ve uzmanlaşma**, oyuncunun yapabileceği iş, öğrenme hızı ve RP seçenekleri için temel olur. Örnek alanlar: tarım/doğa, şifacılık, simya, zanaat, inşa/mühendislik, keşif, ticaret ve topluluk işleri.

- Başlangıç becerileri seçimlerle dağıtılır; yapılan işle ilgili pratik zamanla gelişir.
- Eğitim, deneyim ve uzmanlık etkileri anlaşılır, oyun içi eylemlere bağlı ve dengelenebilir olur.
- Oynanabilir halklar/kültürler bu evrene özgü tasarlanacak. Web prototipindeki geçici tür, sınıf, alt dal, altı nitelik ve seviye rakamları Unity oyununun kesin karakter sistemi değildir.
- Dünya Yöneticisi karakter yaratma adımına zorlanmaz.
- Kalıcı karakter ölümü ve yaşlanma yüzünden zorunlu kayıp, ilk sürüm hedefi değildir.

## 5. Gün ve mevsim döngüsü

1. Gün başında hava, haber, olay ipuçları ve uygun yeni ziyaretçiler görünür.
2. Oyuncular keşif, konuşma, ekim, su taşıma, hasat, inşa ve üretim yapar; yetkililer sakinlere iş atar.
3. Dünya Yöneticisi günü bitirir. Sunucu bu geçişi **yalnız bir kez** işler: bakım/su ve işçilik → büyüme/üretim → tüketim/sağlık → olaylar → yeni gün/hava/günlük.
4. Sonuçlar okunur bir günlükte kalır. Grup isterse sakin günleri hızlı geçebilir; aktif RP sahneleri gün atlamaya zorlanmaz.

**Mevcut mevsim dizisi:** Bahar, Yaz, Güz, Kış, Gümüş Sis, Yıldız Dönemi. Her biri 20 oyun günü; toplam döngü 120 gün. Olağanüstü hava veya nadir olaylar ayrıca mevsimin içine gelebilir. Dünya tohumu ve bölge iklimi farklı başlangıç şartları üretir. Büyüme koşulları toprağı, suyu, güneşi, nemi, sıcaklığı ve mevsimi birlikte değerlendirir.

## 6. Dünya, harita ve köyler

- Başlangıçta geçici kamp ve küçük bir ortak yiyecek payı vardır; hazır köy, tarla, ekin, hayvan ve sakin verilmez. Dünya Yöneticisi hikâye gereği malzeme/NPC verebilir.
- Arazi görünür ipuçları sunar: toprak, su, ağaç, geçit ve olası kaynaklar. Yeraltı miktarı ve nadir kaynaklar keşif/araştırmayla anlaşılır.
- Oyuncu bir köy kurabilir, mevcut köye katılabilir veya ortak kamptan sonra ayrı yerleşimlere ayrılabilir. Köy üyeliği ve yetkiler açık işlemlerle değişir.
- Sahip ve eş kurucu; **inşa**, **karar alma**, **sakin işi atama** haklarını bağımsız verir/geri alır. Kaynak sahipliği ve işlem günlüğü köy bazında tasarlanır.
- Binalar önce malzeme, sonra işçilik ve gün ister. Yarım inşaat korunur; hasarlı yapı onarılmadan tam kapasite çalışmaz.
- Yolculuk süre ve taşıma kapasitesi gerektirir. Şehir, pazar, diğer köyler ve keşif alanları haritada anlamlı uzaklıklara sahiptir.

## 7. Tarla, tohum ve meyveler

**Katalog:** Şu an web verisinde 100 eski bitki türüne karşılık ekilebilir kayıt, 18 yeni büyülü tür; toplam **118 ekilebilir tohum/spor/rizom** ve bunlara eşleşen **118 yetişkin bitki** vardır. Tohum ve olgun bitki tek türün iki kullanım kaydıdır; ayrı biyolojik tür diye sayılmaz. Adı/özelliği gerçekten tekrar eden türler zorla tutulmaz.

- İlk Unity diliminde bir tarla **20 ekim karesi** taşır. Oyuncu aynı tarlanın farklı karelerine farklı ürün eker. Sonraki tasarımda arazi üstünden şekil seçme ve küçük/büyük parsel açma geliştirilebilir.
- Tohumun kendi büyüme günü, geçerli toprak ve mevsimleri, güneş/nem/sıcaklık sınırları ve hasat kaynağı vardır. Yanlış şartta büyüme ilerlemez; gübre zorunlu şartın yerini almaz.
- Sulama su kaynağına ve günlük kapasiteye bağlıdır; uygun yağmur sulama yerine geçebilir. Hasattan sonra kalıntı temizlenir; nadas toprağı dinlendirir.
- Hasat türüne göre **tahıl, yiyecek, ot, yem veya odun** verir ve yeniden ekimlik malzeme sağlar. Meyveli ağaç ve çalılar görsel olarak meyve verir; meyvenin özel/büyülü etkisi ayrı keşif olabilir.
- Çiftçilik ekranında tohum arama, eldeki miktar ve uygun/uygunsuz koşul nedeni görünür. Komşu bitkilerin birbirini etkilemesi ileride deney ve keşif sistemiyle eklenir.
- Mevcut fantastik meyve örnekleri: Ay Camı Armudu, Kızıl Yıldız Elması, Serap İnciri, Ay Sis Böğürtleni, Melek Narısı ve Gümüş Çiy Üzümü. Sıradan meyveli çalılar da katalogdadır.

## 8. Ansiklopedi ve keşif

Kategoriler en az tohum, bitki ve hayvan; ileride gübre, ürün, malzeme, tarif ve yer/olay bilgisi açılır. Kayıt ilk başta `?` veya silüettir. Dünya Yöneticisi **resim, ad/tür, nadirlik, tanım/kullanım, yetişme veya yaşam koşulları** alanlarını ayrı ayrı açabilir. Oyuncu yalnız açıklanmış alanları API yanıtında alır. Bilinmeyen türün arama sonucu adı veya resmi sızmaz.

- 30 hayvan türü mevcut gözlem kataloğundadır; evcilleştirme ve üreme kuralları tamamlanmış sayılmaz.
- 63 tür için yeni, doğal habitatlı grafit/parşömen çizimi bulunur. Kalan 55 eski bitki ve 30 hayvanda mevcut SVG saha çizimleri vardır. Unity dünya sprite seti ayrıca yapılmalıdır.
- Keşif, gözlem/deney/RP olayıyla anlam kazanır. Bilgiyi açan kişinin yetkisi sunucuda tutulur. Bir türün tanınması bütün tariflerinin öğrenildiği anlamına gelmez.

## 9. Üretim, sakinler ve hayvanlar

- Her üretim tarifi kendi malzemesi, aracı/yapısı, süresi ve öğrenme durumuyla kayıt olur. Bir tarifin açılması başka tarifi kendiliğinden açmaz.
- Ziyaretçiler köye katılma isteği ve kısa geçmişle gelebilir. Oyuncu veya yetkili kişi kabul/ret ve günlük iş kararını verir.
- Sakinlerin becerisi, yorgunluğu, sağlığı, barınması, ilişkileri ve deneyimi zamanla gelişir. Önce basit iş döngüsü, sonra aile ve kalıtım gibi derin sistemler kurulur.
- Hayvanlar kara/su/hava, evcil/yırtıcı, ürün verme ve yaşam alanı gibi **oyuna ait** etiketlerle ayrılır. Bakım ve iş ataması görünür eylem olmalı; nadir fantastik canlıların etkileri keşifle açılmalı.
- Köy stokları, işçilik, depo, taşıma, bakım ve yiyecek tüketimi birbirine bağlıdır. Kıtlık yalnız sayı düşürmez; moral ve hikâye olayı doğurur.

## 10. Şehir, pazar ve olaylar

- Birden çok şehrin kendine ait pazar günleri, arz/talebi, satıcıları ve haber panosu hedeflenir. Fiyatı öğrenilmeyen ürün için kesin bilgi verilmez.
- Şehirde tohum, yiyecek, odun/taş, işlenmiş eşya ve nadir malzeme farklı tezgâhlarda bulunur. Han başlangıçta hazır değildir; köy geliştikçe kurulabilir.
- Hava, kıtlık, hastalık, yol kesme, nadir doğaüstü olaylar ve oyuncu kararlarının sonuçları günlüğe işler. Savunma ve hazırlık köyü etkiler; otomatik olaylar tekrar eden düz metin listesi gibi hissettirmemeli.
- Dünya Yöneticisi koşula bağlı olay ekleyebilir ve görünür/gerçek sonucu ayrı yönetebilir.

## 11. Mitoloji ve manevi dünya

Evrenin **tek yüce Kaynağı** vardır. Hiyerarşi: **Kaynak → 3 seraf → 4 başmelek → 8 elçi**. İsimler şimdilik değiştirilebilir yer tutucudur; Dünya Yöneticisi oda özelinde adları değiştirebilir, tapınağı açabilir, kimlik/alan/anlatıyı kademeli gösterebilir.

- Alamet, görev, iyilik ve verilen kararların karşılığı hikâye ile üretim/yerleşim sistemine bağlanabilir. Otomatik nimet/ceza ve başmelek yolu için sayısal kurallar henüz kesinleşmedi.
- Büyülü mevsimler ve nadir türler mitolojiyi çevrede hissettirir; bütün dünyanın her an parlak büyü efektleriyle dolması hedeflenmez.
- Seraf, başmelek ve elçi tasarımları bu evrene özgü olacak; adlar, semboller ve eylemler daha sonra Ege ile değiştirilebilir.

## 12. Kayıt, yedek ve teknik mimari

- Unity istemcisi görüntü, giriş ve etkileşimleri yönetir. Kalıcı hesap, oda, gün geçişi, kaynak hareketi, keşif gizliliği ve yetki **sunucuda** kalır.
- Mevcut bağımsız Supabase projesi oyun verisinin başlangıç kaynağıdır. Unity, oturum belirteciyle HTTPS üzerinden ilgili snapshot/eylem uçlarını çağırır; yetkili servis anahtarı ve kurucu şifresi oyuna gömülmez.
- Aynı odanın web ve Unity görünümü birlikte kullanılacaksa iki istemcinin aynı kayıtları ve kaynak sayılarını gördüğü test edilir. Mevcut web sürümü **prototip ve veri kaynağıdır**; Unity sahnesi şu anda mevcut değildir.
- Dünya Yöneticisi kampanyayı JSON olarak yedekler, şifreli kapıdan yeni kodlu odaya yükler ve oda adını doğrulayarak silebilir. Yükleme eski odayı ezmez. Karakter, köy, parsel, stok, keşif, gün/günlük ve ilahi kayıtlar korunmalıdır.
- Yedek dosyası sürümlü ve doğrulanabilir olur. Değişiklik notları `major.minor.patch` düzeninde gerçek tamamlanan işleri anlatır; küçük güncelleme için büyük sürüm atlanmaz.

## 13. Önceliklendirilmiş Unity geliştirme dilimleri

### Dilim A — Oynanabilir çekirdek

1. Unity proje yapısı, pixel-perfect kamera, oyuncu hareketi, köy ve 20 kare tarla sahnesi.
2. Kullanıcı adıyla giriş; kurucu şifresiyle oda kurma veya kodla katılma; Dünya Yöneticisi karakter yaratmadan yönetim görünümüne geçer.
3. Sunucudan oda/dünya/tohum stoğu/parsel durumu okuma; doğru rol ve gizlilikle gösterme.
4. Tohum seçme/ekme, su taşıma/sulama, gün geçirme, büyüme evreleri, hasat ve kalıntı temizleme.
5. Basit saha defteri: `?` → açılan görsel → ad → koşullar. Meyveli bir türün dalda görünmesi.
6. İki oyuncunun aynı köy ve tarlada yaptığı işlemlerin doğru sırada görünmesi; günün yalnız bir kez geçmesi.

### Dilim B — Köy yaşamı

Köy kurma/katılma, izinler, inşa, depo, sakin kabulü ve günlük iş; çevrede çalışan sakin animasyonları.

### Dilim C — Yaşayan dünya

Altı mevsimin çevre grafiği, bütün tohumların büyüme sprite aileleri, daha fazla keşif alanı, hayvan bakım döngüsü ve koşullu olaylar.

### Dilim D — Uzak dünya

Yolculuk, şehir pazarları, üretim zincirleri, tapınak etkileri, daha derin sakin ilişkileri ve dünya haritası.

## 14. Uygulama gerçeği ve açık kararlar

| Konu | Bugünkü web prototipinde var | Unity hedefi / açık iş |
| --- | --- | --- |
| Hesap ve oda | Kullanıcı adı/şifre, kodsuz kayıt, özel kurucu şifresi, oda kodu | Unity giriş ekranı ve rol görünümü; gerçek cihazlarla uçtan uca deneme |
| Gün ve mevsim | Dünya Yöneticisi gün geçişi; altı adet 20 günlük mevsim | Çevre görselleri, animasyonlar, güçlü olay anlatımı |
| Tarla ve tohum | 20 karelik parsel, 118 tohum, şartlı büyüme ve hasat | Fiziksel pixel art tarla, ürün evreleri, daha iyi parsel düzenleme |
| Ansiklopedi | Alan alan açılan katalog; 118 bitki, 118 ekim kaydı, 30 hayvan | Pixel art keşif etkileşimi ve defter; kalan çizimler ve canlı sprite'ları |
| Köy ve sakinler | Köy kurma/üyelik/izin, bazı inşa ve günlük iş akışları | Görünür köy sahnesi, derin ilişkiler, aile, yetkinlik ve refah |
| Mitoloji | Kaynak–seraf–başmelek–elçi kayıtları, yönetici açma/isim verme | Özgün pixel art görsel dil, olaylar ve sonradan belirlenecek etkiler |
| Kayıt yönetimi | Yedek alma, yeni odaya yükleme, silme | Unity arayüzü; eski kayıtlarla uyumluluk testi |
| Karakter | Webde geçici tür/yol/nitelik/XP verileri | Evrene ait karakter ve beceri sistemini yeniden tasarlama |

**Henüz kesinleşmeyenler:** Nihai pixel art çözünürlüğü ve kamera açısı; Unity ilk yayın platformu; özgün oynanabilir halklar; beceri ilerleme sayıları; parsel şekilleri ve işçilik bedeli; gün oylaması; köyden ayrılma/mülkiyet devri; şehirlerin sayısı/takvimi; hayvan üretim ve kalıtım oranları; manevi etkilerin kuralları. Yeni sohbette bunlar mevcut özellik gibi yazılmasın. İlk iş, Dilim A için çalışan Unity proje iskeletini ve bir meyveli tarla sahnesini kurmak olsun.

## 15. Mevcut kaynaklar

- Canlı web prototipi: https://egecanturk.dev/fnf/
- Kaynak depo: https://github.com/CanturkEge/Website/tree/main/fnf
- Web proje haritası: `fnf/PROJECT_INDEX.md`
- Eski ayrıntılı hedef notları: `fnf/GDD.md` (geçmiş kararlar için; Unity kimliği bu dosyadan okunmalı)
- Canlı sürüm gerçekleri: `fnf/CHANGELOG.md`, `fnf/v17-seeds-and-magic-seasons.sql`, `fnf/v18-seasons-seraphs.sql`
- Düzenlenebilir tohum kaynağı: `fnf/tools/generate_seed_catalog.py`
- Ayrı Supabase proje kimliği: `gfmpenydngkwffjrsoez` (yetkili anahtar depoya konmaz)

## Yeni sohbet başlangıç metni

> Farms & Fields'i Unity 2D pixel art oyunu olarak geliştiriyoruz. `fnf/UNITY_PIXEL_ART_GDD_HANDOFF.md` dosyasını ana tasarım kaynağı olarak oku. İlk hedef Dilim A: giriş/oda, bir köy ve 20 kare tarla sahnesi, meyveli bitki sprite'ı, sulama/hasat, gün geçişi ve kademeli ansiklopedi. Mevcut web oyununun verisini ve sunucu yetkilerini koru; eski web karakter kurallarını nihai tasarım sayma. Gerçekte çalışanlarla planlananları ayrı göster. Önce proje iskeletini ve oynanabilir ilk dilimi oluştur, sonra test edip raporla.
