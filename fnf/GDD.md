# Farms & Fields — Oyun Tasarım Belgesi

**Belge türü:** Hedef oyunun GDD'si · **Tarih:** 21 Ekim 2026 · **Durum:** Yaşayan tasarım belgesi

> Bu belge konuşmada istenen **tam oyun yönünü** anlatır. Bir başlığın burada yer alması, özelliğin sitede tamamlandığı anlamına gelmez. Mevcut uygulama ve hedef arasındaki fark §17'de açıkça gösterilir. Kuralları belirtilmemiş konularda sayı veya kesin davranış uydurulmaz.

## 1. Oyun vaadi ve sınırları

Farms & Fields (FNF), arkadaş grubunun bir DM eşliğinde oynadığı, rol yapma ağırlıklı bir fantastik **yerleşim, keşif, tarım, üretim ve topluluk** oyunudur. Oyuncular bilinmeyen bir dünyada küçük bir geçici kampla başlar; araziyi tanır, köy kurar veya bir köye katılır, insanlarla ve canlılarla ilişkiler geliştirir. Gündelik kararların ve keşiflerin zaman içindeki sonucu oynanır. Savaş ve zindan oyunun ana ekseni değildir; tehlike, savunma ve baskınlar dünya baskısı ve RP için yer alabilir.

Oyun başlangıçta web üzerinden `egecanturk.dev/fnf/` altında yayımlanır. D&D sitesiyle **aynı GitHub deposunda**, fakat farklı görünüm, farklı oyun kimliği, **ayrı Supabase projesi ve ayrı oturumla** yaşar. D&D sitesi sol menü, bilgi yoğunluğu, karakter becerisi ve sürüm notu düzeni için yapısal referanstır; onun kartları, kuralları, verileri ve görünümü FNF'ye kopyalanmaz.

### Oyuncu deneyiminin dört dayanağı

1. **Bilinmeyen dünya:** Oyuncu gördüğü ve araştırdığı kadarını öğrenir. Bilgi edinmek başlı başına ilerlemedir.
2. **Yaşayan yerleşim:** Yiyecek, su, emek, yapı, nüfus, güvenlik ve mevsim kararların sonucunu taşır.
3. **DM yönetimi, oyuncu iradesi:** DM dünyayı ve gizli kuralları yönetir; oyuncular kendi karakterlerinin, köylerinin ve ilişkilerinin kararlarını verir.
4. **Oyun gününden RP'ye geçiş:** Sabah/gün başı hesaplamaları tutarlı şekilde yapılır; kalan zaman konuşma, keşif ve sahne canlandırmasına açıktır.

### Şimdilik kapsam dışı

Oyuncu karakterinin yaşlılık nedeniyle kaybı ve zorunlu kalıcı ölüm sistemi istenmiyor. NPC için ilk aşamada hastalık, sakatlık ve geçici iş görememe yeterli. Savaş merkezli bir ilerleme ağacı, D&D ile ortak oturum/veritabanı ve bütün kuralları başlangıçta oyuncuya gösteren açık katalog da hedef değildir.

## 2. Kimlik, oda ve roller

### Hesap ve katılım

- Arkadaş grubu için **kullanıcı adı + şifre** ile kayıt/giriş. Kullanıcıdan e-posta doğrulaması istenmez.
- Hesap açmak için oda kodu gerekmez. Hesap açıldıktan sonra oyuncu bir odaya katılmak için **oda kodu** girer.
- Oda oluşturmak ayrı bir işlemdir ve yalnız DM'ye/kurucunun şifreyi verdiği arkadaşına ait **oda kurma şifresi** gerektirir. Şifre ve yetkili Supabase anahtarları istemciye veya depoya konmaz.
- Odayı oluşturan hesap **oda DM'i** olur; diğerleri kodla **oyuncu** rolüyle katılır. DM bir oyuncu karakteri oluşturmak zorunda değildir, normal akışta oluşturmaz.
- Bir kişinin hesap kimliği, oda üyeliği ve köy üyeliği ayrı kavramlardır. Eski hesapların, odaların ve karakterlerin korunması gerekir.

### Yetki matrisi

| İşlem | DM | Köy sahibi/eş kurucu | Yetkili üye | Diğer oyuncu |
| --- | --- | --- | --- | --- |
| Oda açma | Kurucu şifresiyle | Yalnız kurucu şifresi varsa | Yalnız kurucu şifresi varsa | Yalnız kurucu şifresi varsa |
| Odaya katılma | Kendi odasını açar | Oda koduyla | Oda koduyla | Oda koduyla |
| Karakter oluşturma | Gerekmez | Kendi karakteri | Kendi karakteri | Kendi karakteri |
| Oyun gününü ilerletme | Evet | Oylama kararı netleşince | Oylama kararı netleşince | Oylama kararı netleşince |
| Köy kurma/üyelik kararı | Dünya müdahalesi | Sahiplik ve ortak kurucu hakkı | Yalnız açıkça verilen karar hakkı | Başvuru/davet kabulü |
| Köy inşaatı | Müdahale edebilir | Evet | `inşa` yetkisiyle | Hayır |
| Aday kabul/red | Müdahale edebilir | Evet | `karar` yetkisiyle | Hayır |
| NPC günlük işi | Düzeltme yetkisi | Evet | `iş atama` yetkisiyle | Hayır |
| Gizli kural/ansiklopedi açma | Evet | Hayır | Hayır | Hayır |
| Kampanya yedeği/yükleme/silme | Evet | Hayır | Hayır | Hayır |

Bu tablo hedef yetki sınırını gösterir. Oylamanın eşiği, DM vetosu ve her köy yetkisinin devir/geri alma ayrıntıları §18'de açıktır. İstemcide saklanan bir düğme yetki kanıtı değildir; kritik işlemler sunucuda oda, oyuncu, köy ve rol bağlamıyla doğrulanır.

## 3. Karakter oluşturma ve beceri

Karakter oluşturma yalnız oyuncu içindir. Oyuncu bir tür, bir ana yol, onun altından uzmanlık, nitelikler ve başlangıç eğitimlerini seçer. DM bunları seçmeden yönetim ekranına geçer. Karakterin geçmişi başlangıçta diğer oyuncularla **kardeş gibi/ortak yol arkadaşlığı** duygusu taşır; gerçek akrabalık oyuncuların RP tercihidir.

**Mevcut içerik kataloğu — denge ve adlar değişebilir:**

| Alan | Mevcut seçenekler |
| --- | --- |
| Tür | İnsan, Elf, Cüce, Ork, Ejderdoğan, Buçukluk |
| Ana yol | Doğa Bilimleri, Köylü, Fiziksel, Mühendislik |
| Uzmanlık | Her ana yolda üç seçenek; ör. Şifacı/Simyacı/Üretici, Hayvancı/Çiftçi/Bahçeci, Savaşçı/Madenci/Kaşif, Yapı Ustası/Kimyager/Araştırmacı |
| Altı nitelik | Güç, Çeviklik, Dayanıklılık, Akıl, Sezgi, Etki |
| Beceri alanları | Botanik, Hayvancılık, Zanaat, Mühendislik, Araştırma, Keşif, Savunma, Diplomasi |

Nitelikler başlangıç tabanından dağıtılır; tür eğilimi, ana yol/uzmanlık eğitimi ve seçilen beceriler başlangıç yatkınlığı verir. **Beceriler sıfırdan tek tek puanlanan boş çubuklar değildir.** Aynı eğitimin çakışması ustalık doğurabilir. Oyuncu yaptığı eylemle ilgili beceri pratiği ve genel deneyim kazanır. Kesin seviye eşikleri, ileride nitelik artışı ve her yolun özel yetenek ağacı ayrı denge tasarımıdır; mevcut oyundaki geçici XP sayıları nihai GDD kararı sayılmaz.

Karakter föyü seçimi, beceri kaynağını, eğitim/ustalık düzeyini, kazanılan deneyimi ve oyun içinde neye yarayacağını açıkça gösterir. Güvenlik ve köy yetkisi karakterin ekranda yazan mesleğine değil, sunucudaki üyelik ve izinlerine bağlanır.

## 4. Ana oyun döngüsü ve zaman

### Oturum döngüsü

1. Grup odaya girer; karakterler ve köyler mevcut günün durumunu görür.
2. Yetkili oyuncular köy işlerini, su/ekin işlerini, inşaat emeğini ve NPC görevlerini belirler. DM sahneyi, gizli bilgiyi ve gerektiğinde başlangıç varlıklarını yönetir.
3. Grup RP yapar: ziyaret, pazarlık, deney, keşif, ilişkiler, ahlaki kararlar, üretim ve günlük olaylar.
4. DM günü geçirir; ileride oyuncu oylaması da bu geçişe yol açabilir. Gün başı işlemleri **bir kez** ve öngörülebilir sırayla çalışır.
5. Sonuçlar günlüğe yazılır; hava, mevsim, tüketim, büyüme, iş, sağlık, adaylar, olaylar ve keşifler yeni güne taşınır. Grup isterse uygun günleri hızlı geçebilir.

### Gün geçişi sözleşmesi

Bir gün geçişi çift tıklama/yeniden gönderim yüzünden iki kez işlememelidir. Önce önceki günün kayıtlı emek ve sulaması kapanır; ekin büyümesi ve NPC işi hesaplanır; tüketim, bakım, tehlike ve olaylar çözülür; yeni günün hava/haber/adayları üretilir; sonuç günlüğü yayımlanır. Sistemin gerçek işlemsel sırası ileride teknik tasarımda sabitlenir. İş oyuncu tarafından bir kez atandıktan sonra o gün kilitlenir; DM'in düzeltme hakkı bulunur. Oylama akışı henüz netleşmediğinden DM gün geçişi temel yetkidir.

### Mevsimler ve dünya tohumu

Normal dört mevsimin her biri **20 oyun günü** sürer. Her bitkinin kendine özgü yetişme günü ve uygun mevsimi vardır; bütün bitkilere tek kısa/orta/uzun süre konmaz. Kutsal veya olağanüstü mevsimler ileride ayrı olaylar olarak eklenebilir. Dünya tohumu ve iklim tekrar oynanabilir farklı başlangıçlar, arazi ve hava dizileri üretir. Aynı girdiler denetlenebilir sonuç doğurmalı; DM dünya anlatımını ve özel olayları ekleyebilmelidir. Buğdayın 10 gün büyümesi gibi konuşulmuş sayılar **örnektir**, onaylı denge değildir.

## 5. Dünya, konum, yolculuk ve keşif

Oyuncuya seçim yaptırmadan bir başlangıç konumu/dünya tohumu türevi atanması hedeflenir. **Konum atanması otomatik köy kurmak değildir.** Oyuncular birlikte kalabilir, sonra ayrılıp kendi köylerini kurabilir veya davetle başka bir köye girebilir. Köyler krallıklar arasındaki bir kuruluş bölgesindedir. Ana şehirlere ve kalelere dış yol mesafesi bölgenin çıkışından hesaplanabilir; köyler arası mesafeyi DM belirler. D&D sitesinin şehir/kale haritası yalnız yapısal örnektir.

İlk bakışta arazi sadece yaklaşık ipuçları verir: ağaç yoğunluğu, kabaca odun potansiyeli, toprak, su ve yeraltı zenginliği işareti. Değerli madenin miktarı, altın/platin ya da olağanüstü kaynak, araştırma/kazı/keşifle açılır. Bilginin üç katmanı vardır: **dünyanın gerçek/gizli durumu**, **DM'in gördüğü kayıt**, **oyuncuya keşifle açılmış bilgi**. Oyuncu API'si bile gizli katmanı taşımamalıdır.

Keşif eylemi rota, beceri, hava, hazırlık, zaman ve tehlike bağlamında iz/örnek/haber bulur. Bulmak her zaman tam tanımak demek değildir; bir soru işareti, siluet veya kısmi bilgi ansiklopediye işlenebilir. Yağmur, fırtına, kıtlık, baskın ve doğaüstü olaylar seyrek, bağlama duyarlı ve farklı sonuçlu olmalı; tekdüze her sabah metni olmamalıdır. Kesin olay havuzu ve olasılıklar §18'de açık bırakılır.

## 6. Köy yaşam döngüsü ve yetkiler

**Geçici kamp → keşfedilmiş konum → köy kurma/katılma → yapı ve nüfus → uzmanlaşma → başka köy ve şehirlerle ilişki.** Başlangıçta otomatik ev, hazır tarla, tohum, hayvan veya köylü verilmez. Küçük bir ortak yiyecek payı vardır; DM ihtiyaç duyarsa varlıkları rol yapma içinde dağıtır. Yiyecek tüketimi yok sayılmaz; kıtlık, moral ve olaylar doğurur.

Bir oyuncu köy kurabilir; aday kurucular davet edilip **kabul edince** eşit kurucu olur. Köy sahibi ile oda DM'i aynı rol değildir. Oyuncu bir köyden ayrılabilir veya başka köye katılabilir. Sahip/eş kurucu normal üyeye **inşa**, **karar alma**, **NPC iş atama** haklarını birbirinden bağımsız verir ve geri alır. İşlem günlüğünde kimin hangi yetkiyle ne yaptığı görülebilir. DM müdahalesi ve eş kurucu devir protokolü ayrı kararlaştırılacaktır; sessiz sahiplik devri yapılmaz.

Köy kaydı üyeleri, sahipliği, konumu, keşfedilmiş arazi bilgisini, parselleri, yapıları, sakinleri, suyu ve ekonomiyi ilişkilendirir. Mevcut ortak oda deposu hedefte köy bazlı varlıkların yerine geçmez; geçişte eski oda kayıtları kaybolmaz. Köyler arası stok/NPC devri ve ayrılan kişinin hakları §18'de netleşmeden otomatik mülkiyet kuralı yazılmaz.

## 7. Tarım ve arazi

### Parsel ve ekim

- İstenildiği kadar ayrı tarla açılabilir. **Bir tarla 20 ekim karesinden oluşur**; bunun bir kısmı boş, kalan kısımları farklı tohumlarla dolu olabilir.
- Türler ekim alanını farklı kullanır. Kare başına tohum/bitki alanı tür verisidir; karpuzun dört kare olması yalnız bir örnekti.
- Tarla açmada para bedeli yoktur; gerçek kısıt iş gücü, hazırlık ve oyun günüdür. Bina ile tarla aynı "düzlük kotasını" tüketmez. Önceki ortak arsa/düzlük sınırı fikri **geri çekildi**.
- Meyve ağacı, çalı, tarla bitkisi ve suda yetişen türlerin yer ve büyüme gereksinimi ayrıdır. Bunlar basit tarla düğmesine sıkıştırılmaz.
- Komşu tohumların faydalı/zararlı etkileri olabilir. Ateş tohumu örneği onaylı katalog maddesi değildir; gizli etki deneyle ortaya çıkar.

### Yetişme, verim ve iş sırası

**Zorunlu yetişme şartı** (uygun toprak/yer, mevsim, su, güneş, nem, sıcaklık ve türe özgü koşullar) sağlanmadan "yüksek verim" bonusu bitkiyi büyütmez. Şartlar sağlandıktan sonra sağlık ve **verim değiştiricileri** (toprak kalitesi, gerçek bakım, uygun gübre, çevre ve varsa manevi/olağanüstü etki) uygulanır. Türün büyüme günü ayrı takip edilir. DM gerçek etkiyi görür; oyuncu yalnız açığa çıkardığı koşul ve gözlemi görür.

Oyun işleri ekim → su/bakım → günlerle büyüme → hasat → kalıntı temizliği → gerekiyorsa nadas/yeniden ekim olarak ayrı eylemlerdir. Toprak yorgunluğu ve kimi ürünlerin gizli kalıcı etkileri gözlem ve deneyle öğrenilir. Her ürüne aynı şekilde çalışan anlık “toprağı yenile / gübre / büyü” düğmeleri hedef tasarım değildir; gübre türleri kaynak, üretim yolu, uygunluk, etkinlik ve keşif koşuluyla ele alınır. Bakım eylemi de somut iş ve zaman taşır.

### Su zinciri

Uygun yağmur sulama sayılır. Elle sulama için dereye gidip su taşıma veya kuyudan çekme, otomasyon için tank/kanal gibi tamamlanmış altyapı gerekir. Su miktarı, taşıma iş gücü, mevcut kaynak ve hangi ekinlere verildiği izlenir. Kaynaksız sınırsız “sula” tuşu bulunmaz. Kuyu inşaatı bittiğinde kullanılabilir olur; bozuk/kullanılamayan altyapı bedava su sağlamaz. 20 karede kaç birim su/iş gerektiği kesinleşmemiştir.

## 8. Keşif ansiklopedisi ve gizli kurallar

Ansiklopedi tohum, bitki, hayvan, gübre, işlenmiş ürün, **her ayrı üretim tarifi** ve diğer keşifleri kategorilere ayırır. Bilinmeyen kayıt başlangıçta `?` veya siluet olarak görünür. Keşif tek adım değildir; **resim**, **ad/tür**, **nadirlik**, **tanım ve kullanım**, **yetişme/yaşam koşulları**, **yan etki** gibi alanlar ayrı açılır. DM her alanı tiklerle açıp kapatabilir. Örneğin bir hayvanın resmi görülmüş ama adı ve davranışı bilinmiyor olabilir. Görseller bilginin açılma durumuna uygun çıkar.

DM için ayrıca gerçek kuralları anlatan bir **gizli dünya/olay ansiklopedisi** gerekir: bitki etkileri, hava/afet etkileri, manevi olayların gerçek koşulları ve sonuçları burada yer alır. Oyuncu sayfası ve oyuncu RPC yanıtı bu gizli kayıtları içermez. DM keşfi rol yapma sahnesinden sonra açıklamayı seçebilir; otomatik keşif ve DM onayı arasındaki sınır ayrıca belirlenecektir.

Ansiklopedi kartı ilgili gözlem, araştırma notu, kaynak, yetişme/yaşam ortamı, nadirlik, kullanım ve bağlı tarifleri gösterir; **bağlı tariflerin kendileri ayrı kilittir**. “Üzümü tanıdı” → “şarap, sirke, reçel öğrendi” gibi toplu açılma yapılmaz. Görsel ve metinler kaynak katalogda yönetilir; bilinmeyen bilgi HTML'de gizlenip API'de açık bırakılmaz.

## 9. Araştırma, deney ve üretim

Araştırma menüsü keşiften gelen ipuçlarını, oyuncunun önerdiği fikirleri, deney kayıtlarını ve köyün kullanılabilir bilgilerini bir araya getirir. Bir uzmanın veya atölyenin bulunması tek başına araştırmayı **tamamlamaz**; öğrenilecek konu önce ortaya çıkmalıdır. Konu ortaya çıktıktan sonra uygun uzman/araştırmacı/öğretmen/mühendis, yapı, malzeme ve gün emeği gerekebilir. Başarısız deney ve beklenmedik yan etki mümkündür; kesin maliyet/olasılık §18'de açıktır.

Her üretim tarifi bağımsız karttır: girdiler, araç/yapı, süreç, süre, beklenen ürün, güvenlik veya kalite, öğrenilme ve DM'in görünür/aktif etme durumu. Bir tarifin açılması diğer tarifi açmaz. Oyuncular gözlem ve denemeyle yeni tarif önerir; DM katalogda konu/tarif ekleyip bilgi alanlarını kademeli açabilir. Köyler arasında bilginin otomatik mi, ticaret/öğretimle mi aktarılacağı kesinleşmedi.

**Örnek akış:** Oyuncu yabani bir meyve bulur → ansiklopedide belirsiz kayıt belirir → DM resmi ve adı açar → oyuncular yetişme koşulunu deneyle anlar → işleme önerisi ayrı bir araştırma konusuna dönüşür → başarıyla öğrenilen tek tarif, uygun yapıda ve malzemeyle üretilebilir. Bu örnek belirli meyve/tarif listesini kanonlaştırmaz.

Teknoloji/yapı ağacı belirgin aşamalara sahip olur: basit iş ve yapılar baştan görülebilir; okul, arşiv, sağlık, eğitim, mühendislik, maden ve üretimhane gibi gelişmiş alanlar ilgili bilgi ve gerektiğinde uzmanlık keşfedilince görünür. Sadece menüde kilitli düğme gösterip sunucuda erişimi açık bırakmak kabul edilmez.

## 10. Yapılar, onarım ve yerleşim kaynakları

Ev, kuyu, depo, işlik, okul, arşiv, sağlık ve savunma yapıları aynı şey değildir. Basit bina görünür olabilir; gelişmiş bina bilgi ve nitelikli emek ister. **Yapı sayısını veya tarla sayısını kısıtlayan ortak arsa kotası yoktur.** Her yapının işlevi, kullanabilirlik durumu, kapasitesi, malzeme listesi, iş gücü, uzman gereksinimi, yapım süresi, bakım ve dayanıklılığı ayrı kayıtlıdır.

İnşaat başlamadan **bütün gerekli malzeme** toplanır ve ayrılıp/tüketilir. Sonra atanmış oyuncu/NPC işçiliği ve oyun günleriyle ilerler. İş durursa yarım yapı kaybolmaz; sonraki gün sürdürülebilir. Hasarlı yapı onarım tamamlanana kadar işlevini vermez. İnşa/onarım yetkisi sunucuda kontrol edilir. Konfor düzeyi farklı evler mümkündür; tüm NPC'leri bir zorunlu “koğuş/otel” sınıfına koyma fikri istenmiyor. Başlangıç kampı geçicidir, otomatik kalıcı ev sayılmaz.

Depo/yük taşıma, barınma, yiyecek ve ileride cep parası/ücret gereksinimi ekonomiye bağlanır. **Hedefte köy varlıkları köyle ilişkilidir.** Mevcut v0.10.1 oda ortak deposu ve DM ortak yapıları geçiş davranışıdır; kalıcı çoklu köy ekonomisinin kararı olarak alınmaz. Eski kayıtlar dönüştürülürken hangi eşyanın hangi köye ait olduğu DM/oyuncu kararı gerektirebilir.

## 11. NPC, başvuru, günlük iş ve aile

Yolcular ve işe aday insanlar başlangıçta azdır; köyün barınması, refahı, güvenliği, zenginliği ve gelişimi aday gelme olasılığı/kalitesini etkiler. Çok yetenekli birinin erken görünmesi nadir de olsa mümkündür. Hanlarda çalışan aramak ayrı yol olabilir. Adayın adı, hikâyesi, kökeni, mesleği, yeteneği, öğrenmesi, sadakati, sağlığı ve ilişki durumu tutulur. Aday **otomatik köylü olmaz**: yetkili kişi ev kapasitesi ve koşullara göre kabul/ret verir.

Yetkili kişi NPC'ye **günde bir iş** atar: tarım, inşaat, maden, araştırma, dinlenme gibi işler genişleyebilir. Aynı kişi aynı gün iki işe bölünmez. Oyuncu tarafından atanmış iş kilitlenir; DM gereken düzeltmeyi yapabilir. İş, zorluğuna göre meslek deneyimi ve verim kazandırır. Yorgunluk, düşük refah, güvensizlik, hastalık ve sakatlanma işi yavaşlatabilir veya geçici engelleyebilir; dinlenme hasta kişinin erişebileceği bir seçenektir. Sağlık/iş göremezlik kalıcı ölüm anlamına gelmez.

NPC ilişkileri ve aileleri izlenir. Çocuk için ilişki, uygun **özel ev**, yer, yiyecek, güvenlik ve refah gibi koşullar sağlanır; otomatik nüfus artışı olmaz. Çocuğun eğitim alanı seçilebilir, okul özellikle gençlere yöneliktir. Gebelik, çocuk büyüme, ücret ve iş günü saatlerinin kesin rakamları belirlenmemiştir. Oyuncu karakteri için ölüm/yaşlılık sistemi bu aşamada eklenmez.

## 12. Hayvanlar ve ekosistem

Hayvan türleri keşif ansiklopedisinde kademeli tanınır. Sürünün yeri, yem ve su ihtiyacı, yaş, cinsiyet, sağlık, verim, dayanıklılık, yatkınlık ve üreme durumu ayrı izlenir. Ebeveyn özellikleri yavruya küçük farklılıklarla geçebilir; nadir/olağanüstü nitelik çok ender görülebilir. Türlere özgü gebelik/yetişkinlik/üreme aralıkları nihai sayı değildir. Hayvan yerleşimi ve üretimi uygun barınak/mera, bakım ve güvenliğe bağlıdır. Başlangıç kampı otomatik hayvanla başlamaz; DM dağıtabilir veya dünya içinde edinilir.

Bitki, hayvan ve doğa olaylarının birbirine etkisi keşfedildikçe açılır. Hayvanların kalıtımı, NPC aile sisteminden ayrı zaman ve kaynak mantığına sahiptir. Gün geçişi bunları işleyebilir; oyuncu her sonucu beklemeden RP ile bakım ve seçim yapabilmelidir.

## 13. Envanter, işleme, ticaret ve şehirler

Kaynaklar (odun, taş, cevher vb.), temel gıdalar, işlenmiş ürünler, tohum, gübre ve inşaat malzemeleri ayrı anlam taşır. Deponun ağırlık/kapasitesi ile taşınabilir yük/hacim ayrı hesaplanır. Tüketim halkı, hayvanı ve yapıyı etkiler. Ürün işleme tarifle yapılır; ham malı dönüştürmek bilgi, girdi, araç ve zaman ister. Bir ürünü elde etmek o ürünün bütün kullanım yollarını öğrenmek değildir.

Tek bir sürekli açık “bugünün tezgâhı” nihai pazar modeli değildir. **Her şehrin kendi pazarı ve kurulma günleri** vardır; han, köy yapısı, NPC evi ve şehir pazarı ayrı işlev görür. Şehre varan oyuncu bilgi panosunda o yerin pazar takvimini, duyurularını ve **öğrendiği** fiyatları görür. Fiyatı hiç öğrenmediği mal için kesin değer gösterilmez; soruşturma, haber, pazarlık veya ziyaretle öğrenilir. Şehirlerin arz/talebi, olayları, fiyatları ve satılabilecek malları farklıdır. Ürün işlenip şehirde veya uygun NPC evine gidilerek satılabilir.

Yolculuk zaman ve taşıma kapasitesi gerektirir; köyler arası mesafeyi DM belirler, dış şehir mesafesi kuruluş bölgesinden hesaplanır. Pazar günleri, rota, şehir sayısı, ulaşım süresi ve fiyat formülü henüz kesinleşmediği için GDD bunlara uydurma takvim yazmaz. Eski oda ölçekli pazar, hedef şehir ekonomisine geçiş için geçmiş sistem olarak korunabilir; hedefin yerine geçtiği iddia edilmez.

## 14. Tehdit, olaylar ve manevi dünya

Dünya güvenli ve tekdüze değildir: hava, kıtlık, vergi, eşkıya, hastalık, afet ve nadir doğaüstü olaylar koşullara göre çıkabilir. Savunma, hazırlık, diplomasi, kaynak ve köy refahı sonuçları etkiler. Olayın oyuncuya görünen hikâyesi ile arka plandaki etkisi ayrıdır; DM hangi durumun ne yaptığını gizli kurallar ansiklopedisinden görür. Gündelik olayların rastgeleliği dünya tohumuna ve mevcut koşullara dayanabilir; sırf sıradaki metni göstermek için dönen sabit liste olmamalıdır.

Mitolojinin yönü **tek yüce tanrı** ve ona bağlı yardımcı elçi/meleklerdir. Alamet, görev, nimet, reddetme/yardım etme ve sonuçları RP ve dünya mekaniğine bağlanır. İyilik/kötülük ve günah davranışlarının izlenmesi, belirli ürün ve doğaüstü olaylara etkisi hedeflenir. Oyuncu bunun bütün formülünü başlangıçta görmez. **Tapınak başlangıçta kilitlidir**, DM açınca başmelek seçimi ve ilgili yol ilerler. Başmelek listesi, puan eşikleri, olay havuzu ve ödül/ceza formülü henüz onaylı değildir. Nadir doğum nimeti ve tür yatkınlığı mümkündür; kesin oran uydurulmaz.

**v0.12.0 uygulama notu:** 100 eski bitki türüne karşılık ayrı stokta tutulan ekimlik kayıt açıldı; 18 büyülü türle toplam 118 tohum/spor/rizom ve 118 yetişkin bitki vardır. Altı 20 günlük mevsimin son ikisi Gümüş Sis ve Yıldız Dönemi’dir. Meyveli çalılar ve altı büyülü meyve yiyecek hasadı verir. Türlerin özel tıbbi veya kutsal etkileri DM keşfine bağlı anlatıdır. Kaynak → üç seraf → dört başmelek → sekiz elçi düzeni geçerlidir. 63 türün yeni doğal habitat grafit çizimi vardır; kalan eski türlerin SVG çizimleri korunur. Unity 2D pixel art için [UNITY_2D_PLAN.md](UNITY_2D_PLAN.md) ayrı istemci taslağıdır.

**v0.11.0 uygulama notu:** Geçici hiyerarşi `Kaynak` → `Taşın Bekçisi`, `Devrin Sözcüsü`, `Yolun Gözcüsü`, `İzin Muhafızı` → her başmeleğe bağlı iki elçi biçimindedir. Kimlikler sabit teknik anahtarlardır, DM görünen adları oda özelinde değiştirebilir. Başmelek seçimi ve mekanik sonuçlar hâlâ tasarımdır. Ansiklopedide 100 bitki ve 30 hayvanın çizim/gözlem kaydı vardır; üretim, işleme ve ekolojik etkilerinin tamamlandığı anlamına gelmez.

## 15. Arayüz, navigasyon ve erişilebilirlik

Görsel yön **koyu, zarif, yaşayan oyun dünyası**dır; beyaz yönetim paneli veya D&D sitesinin birebir kopyası değildir. Arka planda koyu tonlar, okunaklı kontrast, tarla/harita/defter çağrışımları ve yerinde küçük animasyonlar kullanılabilir. İçerik tek tip durağan kart yığınına dönmez: gün özeti, köy haritası/yerleşim görünümü, parsel ızgarası, ansiklopedi sayfası ve iş çizelgesi kendi bilgi biçimine göre düzenlenir. Görsellik bilgi gizleme durumuyla uyumlu olur.

**Ana gezinme soldadır.** Her küçük özellik için yeni ana sekme açılmaz. Önerilen üst düzey merkezler: Günün Akışı, Yerleşim/Köyler, Tarlalar, Halk & Ahır, Keşif & Ansiklopedi, Araştırma & Üretim, Yol & Pazar, Karakterim (DM'de anlatıcı araçları), Sürüm Notları. Bu liste bir bilgi mimarisi önerisidir; ekranın rolüne göre ilgili alt paneller açılır. DM karakter ekranına zorlanmaz. Mobilde sol menü açılıp kapanır, uzun metin ve kontroller taşmaz; klavye erişimi, durum geri bildirimi ve okunaklı dokunma hedefleri korunur.

Ana ekranda DM ve oyuncu aynı bilgiyi görmez. DM gün geçirme, dünya olayları, gizli ansiklopedi, başlangıç varlığı ve gerektiğinde düzeltme araçlarına ulaşır. Oyuncu kendi karakterini, köy izinlerini, bildiği bilgiyi ve yapabileceği işi görür. Düğme kilitliyse **neden** kilitli olduğu, gerekli bilgi/yapı/izin ve malzeme açıkça anlatılır; gizli bilgi bunu gerektiriyorsa yalnız uygun ipucu gösterilir. Hatalı işlemde veri korunur, ekranda anlaşılır sonuç çıkar.

### Sürüm notları

D&D sitesindeki ayrıntılı değişiklik günlüğü **yapısal referanstır**: her sürümde gerçek eklenen/değişen/düzeltilen şey, etkilediği akış ve gerekirse veri geçişi açıklanır. Oyuncu ekranı tarih, sürüm, kısa özet, arama/sıralama ve açılır ayrıntılar sunar. Sürüm `major.minor.patch` olarak ilerler; küçük düzeltmeler patch artırır: `0.10.1`, `0.11.23` mümkündür. `0.9`dan `0.10`a geçiş normaldir; `0.10` otomatik `1.0` olmaz. **Taslak veya yalnız veritabanına atılmış özellik tamamlanmış sürüm notunda duyurulmaz.** GDD, patch notes yerine geçmez.

## 16. Kampanya sürekliliği, veri ve güvenlik

DM kampanyayı JSON olarak **yedekleyebilir**, şifre kapısından geçerek **yeni kodlu ayrı bir odaya yükleyebilir** ve oda adını doğrulayarak **silebilir**. Geri yükleme eski odayı üzerine yazmaz. Oyuncu aynı hesapla yeni oda koduna katıldığında yedekteki karakteri ve kabul edilmiş köy üyeliği uygun kimlik eşlemesiyle geri gelir. Köy, parsel, su, ekin, yapı, aday, NPC, iş, keşif, gün/günlük ve envanter kaybı olmadan taşınmalıdır. Bekleyen davet/başvuruların yedeğe dahil edilmemesi mevcut tercih; uzun vadeli karar olarak ayrıca gözden geçirilebilir. Silme öncesi yedek önerisi görünür olmalı; silme geri alınamaz.

Yedek dosyasının sürümü/şeması okunur, bozuk veya aşırı büyük dosya yükleme sırasında doğrulanır; kısmi yükleme başarısızlıkta yeni odayı yarım bırakmaz. Eski yedek biçimleri ve eski odalar mümkün olduğunca okunur. Gerçek hesapla **yedekten yükleme ve silme** senaryoları ayrıca uçtan uca test gerektirir.

FNF istemcisi aynı depoda olsa da D&D oturum anahtarını, tablosunu ve kullanıcı verisini kullanmaz. Parolalar ve servis anahtarları repoda bulunmaz. Oda kodu ile kurucu şifresi farklıdır. Rol ve oda bağlamı, köy mülkiyeti, izin, stok ve gizli keşif sunucu işlemlerinde denetlenir; doğrudan tablo yazması ve diğer odanın gizli bilgisini okuma kapalıdır. Sunucu tarafındaki gün geçişi ve stok hareketleri eşzamanlı çağrıda çift işlenmemelidir. Oyuncuya dönen veri yalnız görünür bilgi alanlarını içerir.

### Kavramsal kayıtlar

| Kayıt | İlişkisi ve amacı |
| --- | --- |
| Hesap, oda, oda üyeliği | Kullanıcı adıyla giriş, DM/oyuncu rolü, oda kodu |
| Karakter, eğitim ve deneyim | Oyuncuya ait seçimler, beceri kaynağı, ilerleme |
| Dünya/gün/günlük/olay | Dünya tohumu, hava/mevsim, gün sonuçları ve RP izi |
| Konum ve köy | Arazi gerçeği, keşfedilen ipucu, sahiplik ve mesafe |
| Köy üyeliği/izin/davet/başvuru | Ayrı inşa, karar, iş atama hakları |
| Parsel/ekin/su/toprak | 20 kare, tür koşulu, büyüme, sulama ve nadas |
| Kaynak/envanter/yapı | Sahiplik, malzeme tüketimi, iş ve kullanılabilirlik |
| NPC/adayı/iş/ilişki/aile | Günlük iş, sağlık, öğrenme, barınma ve aile |
| Hayvan/soy | Tür, bakım, kalıtım, üreme, verim |
| Keşif/ansiklopedi/tarif | Gerçek gizli kayıt ile oyuncuya açılmış alanlar |
| Şehir/pazar/rota | Yerel takvim, bilgi, arz/talep, seyahat ve satış |
| Yedek sürümü | Eski kayıtları kaybetmeden dışa/içe aktarma |

## 17. Uygulama gerçeği ve hedef farkı

Bu tablo 21 Ekim 2026'da depodaki **v0.10.1** ve önceki doğrulama notlarını esas alır. “Var” sütunu bir özelliğin bütün hedef ayrıntılarıyla tamamlandığı iddiası değildir.

| Konu | Depodaki mevcut dilim | GDD hedefinde kalan |
| --- | --- | --- |
| Hesap/oda | Kullanıcı adı–şifre, kodsuz kayıt, şifreli oda kurma, kodla katılma, DM karakter açmadan yönetim | Gerçek arkadaş hesaplarıyla tam uçtan uca deneme ve şifre kurtarma yaklaşımı |
| Karakter | Tür/yol/uzmanlık, altı nitelik, başlangıç eğitimi ve beceri XP'si | Tam seviye/uzmanlık ilerlemesi ve denge |
| Köy | Kurma, davet/başvuru, eş kurucu ve üç izin | Ayrılma, devir, ortak kurucuların anlaşmazlığı, DM müdahale günlüğü, köy bazlı ekonomi |
| Gün/dünya | DM gün geçişi, 20 günlük mevsim, hava, temel tüketim ve olaylar | Oyuncu oylaması, zengin koşullu olay havuzu, kutsal mevsimler, kesin işlem sözleşmesi |
| Tarım/su | 20 kare parsel, parçalı ekim, günle hazırlık, sınırlı su, hasat/temizlik/nadas | Ağaç/çalı/su türü arazileri, farklı alan ihtiyacı, komşuluk, somut bakım/gübre/tank/kanal |
| Yapı/NPC | Ev/kuyu/atölye/okul ve günlük emek, aday kabulü, tek NPC işi; DM ortak yapı köprüsü | Geniş yapı ağacı, onarım/konfor, bireysel uzmanlık, refah/ücret, ilişkiler/aile/eğitim |
| Hayvan | İlk ahır ve kalıtım döngüsü | Türlere özgü bakım ve uzun üreme/aile düzeni |
| Ansiklopedi | Soru işareti ve DM'in temel alanları ayrı açması | Geniş tür/gübre/tarif kataloğu, gizli DM kuralları, kısmi keşif/yan etkiler |
| Araştırma/üretim | Eski oda ölçekli sabit projeler ve çalışma evi | İpucuyla konu üretme, ayrı tarif kartları, deney, teknoloji/yapı ağacı |
| Pazar/yol | Oda ölçekli günlük tezgâh ve han | Şehre özgü pazar günleri, fiyat bilgisi, rota/seyahat, ev satışı ve işlenmiş mallar |
| Maneviyat | Basit alamet, görev ve lütuf | Gizli kural kitabı, ahlak etkisi, DM açmalı tapınak ve başmelek yolu |
| Kampanya yönetimi | JSON yedek, yeni odaya yükleme, silme; yeni kayıtlar yedeğe ekli | Gerçek şifreli geri yükleme ve eski yedeklerle uçtan uca doğrulama |

**Önemli:** Eski `GAME_DESIGN.md` ve 20 Ekim karar dosyasında “canlı v0.7” yazan paragraflar tarihsel anlık görüntüdür. Bu GDD onların hedef kararlarını toplar; güncel kod durumunu bu tablodan ve `PROJECT_INDEX.md`/`CHANGELOG.md` üzerinden ayırır. Geçici v0.10.1 rakamları (ör. altı yiyecek, iki günlük tarla hazırlığı, NPC kapasitesi) burada ayrıca onaylanmadıkça nihai denge sayılmaz.

## 18. Açık kararlar — cevabı gereken tasarım soruları

Bu sorular **onay isteme listesi değildir**; kalıcı kural uydurmadan sistemi tamamlamak için eksik tasarım bilgisidir. Kullanıcı karar verdikçe yanıt bu belgeye yazılır; sorunun varlığı çalışan dilimi durdurmaz.

1. **Gün oylaması:** Kim oy verir, kaç oy gerekir, çevrimdışı oyuncular sayılır mı? DM erken geçiş, veto veya oylama iptali yapabilir mi?
2. **Konum ve köy:** Başlangıç konumu kişiye mi köye mi aittir? Ayrılan sahip/eş kurucu köyü, NPC'leri, yapıları ve stokları nasıl bırakır/devreder? Aynı anda birden çok köy üyeliği mümkün müdür?
3. **Ortak kampın bölünmesi:** Başlangıç ortak yiyeceği ve sonradan edinilmiş oda varlıkları köylere hangi kararla dağıtılır? DM dağıtımı kayda geçirir mi?
4. **Tarla emeği/su:** Bir oyuncu veya NPC günde kaç kare ekebilir/hasat edebilir; 20 kare için su birimi nasıl hesaplanır? Ağaç, çalı ve su bitkisi ayrı parsel mi ister?
5. **NPC günü:** İş atama hangi anda kapanır; DM gün içinde ne zamana kadar düzeltebilir? Ücret/cep parası ne zaman başlar? Sağlık, refah ve iş zorluğunun verim formülü nedir?
6. **Aile ve hayvan:** İlişki, özel ev, doğum ve çocuk eğitimi için takvim ve sınırlar nelerdir? Hayvan türlerinin gebelik/yetişkinlik süresi nasıl seçilir?
7. **Araştırma ve üretim:** Oyuncu fikri nasıl konu olur; deney girdisi, başarısızlık ve yan etki nasıl çözülür? DM doğrudan konu/tarif ekleyebilir mi? Köyler bilgiyi nasıl paylaşır?
8. **Şehir ekonomisi:** İlk şehir/kale/rota listesi, pazar günleri, seyahat süresi, fiyat öğrenme yöntemi ve NPC evine satışın koşulları nelerdir?
9. **Gizli dünya:** Olay/bitki/ahlak etkisi hangi eylemle oyuncu ansiklopedisine açılır? Tapınak ve başmelek seçimi neyi değiştirir? DM oyuncu keşfini geri kapatabilir mi?
10. **Kaynak katalog:** Önceden anılmış ayrı “Fantasy Genesis” listesi/tam özel tür ve madde dosyası mevcut depoda bulunmuyor. O listedeki özel adlar ve sayılar kaynağı görülmeden kanon kabul edilmez; kaynak geldiğinde bu GDD'ye ayrı katalog ekiyle işlenir.

## 19. Tamamlama ölçütleri ve geliştirme sırası

Bir özellik yalnız ekranı çizildi diye tamamlanmış sayılmaz. İlgili **rol akışı**, sunucu doğrulaması, gizli bilgi sınırı, gün geçişi, yedek biçimi ve eski kayıtların korunması birlikte çalışmalıdır. Örnek kabul senaryoları:

- Kodsuz hesap açan oyuncu oda koduyla katılır; DM karakter açmadan odayı yönetir. Yanlış kurucu şifresi oda açmaz.
- Oyuncular geçici kamptan ayrılıp iki köy kurar. Bir oyuncuya yalnız NPC iş yetkisi verilince inşaat veya üye kabulü yapamaz.
- 20 kare tarlada farklı ürünler yan yana ekilir; geçersiz yer/mevsim/su büyümez. Yağmur gerçekten uygun ekini sular; kalıntı temizlenmeden aynı kareye yeniden ekim olmaz.
- Ürünün resmi açılırken gizli koşulu/API yanıtı kapalı kalır. Bir tarif öğrenilince öbür tarifler açılmaz.
- DM günü bir kere geçirir; işçilik, su, büyüme, tüketim ve olay tek sefer işlenir. Oyuncu DM yetkisi gerektiren gün veya gizli olay işlemini çağıramaz.
- Yeterli malzemeyle başlayan bina, emek günleri bitmeden kullanılmaz; hasarlı bina onarılmadan kapasite vermez. Hasta NPC dinlenebilir.
- Yedek başka koda açılır; eski oda, karakter, köy, parsel ve NPC verisi kaybolmaz. Bozuk yedek yarım oda bırakmaz.
- Şehirde öğrenilmemiş fiyat görünmez; bir şehrin pazarı diğer şehirle aynı gün ve fiyata zorlanmaz.

**Geliştirme sırası bir sürüm taahhüdü değildir:** (A) mevcut hesap/gün/yedek akışının gerçek kullanıcılarla doğrulanması ve köy bazlı kaynak sahipliği; (B) tarım-su-bitki türleri ve ansiklopedi/tekil tarifler; (C) araştırma/üretim-yapı ağacı; (D) NPC refahı/aile/hayvan; (E) şehir pazarı/yolculuk; (F) oylama, tapınak ve gizli olaylar. Bağımsız modüller paralel tasarlanabilir, fakat belirsiz denge sayıları sürüm duyurusu olmadan kalıcı kurala dönüşmez.

---

**Belgenin kaynakları:** Bu konuşmadaki kullanıcı istekleri; `DESIGN_DECISIONS_2026-10-20.md` (hedef kararlar), `GAME_DESIGN.md` (önceki yön), `PROJECT_INDEX.md`, `README.md`, `CHANGELOG.md`, `game-data.js` (mevcut uygulama). D&D `CHANGELOG.md` yalnız sürüm notu yapısı için karşılaştırıldı. Bu kaynaklarda bulunmayan eski özel liste, bitki/hayvan adları veya rakamlar eklenmedi.
