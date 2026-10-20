# Farms & Fields — Tasarım kararları ve açık konular (20 Ekim 2026)

Bu belge, oyuncuyla yapılan ayrıntılı tasarım görüşmesinin kaydıdır. **Hedef tasarımdır; v0.7.0'da çalıştığı anlamına gelmez.** Canlı kurallar için GAME_DESIGN.md ve SQL dosyalarına bak. Örnek olarak söylenen sayılar denge kararı değildir.

## Oyun akışı ve roller

- Oyun bir DM'in yönettiği, rol yapma ağırlıklı yerleşim oyunudur. Günü DM geçirebilir; oyuncuların ortak oylamayla gün geçirmesi de hedefleniyor. Oylamanın eşik, süre ve veto kuralı henüz belirlenmedi. Günler gerektiğinde hızlı geçebilir.
- Hesap açmak için oda kodu gerekmez. DM oda kurmak için özel kurucu şifresini kullanır; oyuncular kodla katılır. DM oyuncu karakteri açmaz.
- Oyuncular başlangıçta kardeş gibi bir geçmiş ve geçici kamp ile yola çıkar; beraber kalıp ayrılmayı kendileri seçerler. Kuruluş sırasında davet edilip kabul edenler eşit kurucu olabilir.
- DM ile köy sahibi farklı rollerdir. Bir oyuncu kendi köyünü kurabilir, başka bir köye katılabilir veya kurduğu köyden ayrılabilir. Köy sahibi diğer oyunculara ayrı ayrı inşa, karar alma ve NPC'ye iş atama yetkileri verebilir. Kurucuların eşit yetkisi, sonradan yetki devri ve DM müdahalesi ayrıntılı bir yetki modeliyle korunmalı.
- NPC günlük işini yetkili köy yöneticileri atar. Oyuncu atama yetkisi olmadan iş dağıtamaz. Aynı NPC aynı gün ikinci bir işe bölünmez. İş gün başında kilitlenir; oyuncular o gün değiştiremez, DM gerektiğinde düzeltebilir.

## Dünya, konum ve keşif

- Her oyuncuya seçim yaptırmadan rastgele bir konum ve dünya tohumu türevi atanması hedefleniyor. Konum atanması otomatik köy kuruluşu demek değildir; kendi köyü veya ortak köy seçimi ayrı akıştır.
- Köyler krallıkların arasında bir kuruluş bölgesindedir. Ana şehirlere ve kalelere yolculuk mesafesi bu bölgenin çıkışından hesaplanır; bütün köyler için aynı dış mesafe kullanılabilir. Köylerin birbirine mesafesini DM belirler. D&D sitesindeki kale/şehir haritası yapısal referanstır, FNF verisiyle karıştırılmaz.
- Başlangıçta arazi hakkında yaklaşık ipuçları görünür: ağaçlık/sıklık, yaklaşık ağaç miktarı, yeraltı zenginliği gibi. Altın, platin ve olağanüstü kaynakların ayrıntısı araştırma, kazı ve keşifle açılır. Oyuncuya sunulan bilgi, gerçekten keşfettiği düzeyi aşmamalı.
- Doğa olayları ve olağanüstü olaylar seyrek ve çeşitli olur; günlük durum/haber tekdüze sırayla değil, koşullara bağlı rastgele belirlenir. Yağmurun, afetin ve manevi olayların gerçek etkileri yalnız DM'in gördüğü bir oyun kuralları ansiklopedisinde açıklanır.
- İyilik/kötülük ve günah davranışlarının izlenmesi, olağanüstü olaylar ve ürün etkileriyle bağlantısı hedefleniyor. Tapınak menüsü başlangıçta kilitlidir; DM açar, başmelek seçimi oradan ilerler. Ayrıntılı ahlak puanı ve olay havuzu henüz kararlaştırılmadı.

## Gün, mevsim ve tarım

- Hedef normal mevsim uzunluğu **20 oyun günü**. Dört olağan mevsime ek kutsal/olağanüstü mevsimler ileride olabilir. Her bitkinin kendine ait yetişme gün sayısı vardır; “kısa/orta/uzun” diye tek ortak süre dayatılmaz. Buğdayın 10 gün olması konuşmada bir örnektir, kesin denge sayısı değildir.
- Başlangıçta küçük bir ortak yiyecek payı bulunur; hazır tarla, tohum, hayvan veya köylü otomatik verilmesi istenmiyor. DM başlangıç varlıklarını dağıtabilir. Yiyecek günlük azalır ve kıtlık olayları yaratabilir.
- İstenildiği kadar ayrı tarla açılabilir. Her tarla **20 ekim karesi/birimi** kapasiteli bir parseldir. Bir parsel bölünerek farklı tohumlar ekilebilir; bir kısmı boş kalabilir. Ürünlerin kare başına alan ihtiyacı farklıdır. Karpuz için “dört kare” yalnız örnektir. Tarla açmada para bedeli yoktur; iş gücü ve oyun günü gerekir.
- Bina ve tarla arasında ortak bir düzlük/arsa kotası **istenmiyor**. Önceki “düzlük alanı tükensin” fikri geri çekildi. İleride arazi düzenlemesi farklı bir mekanik olabilir, şimdiki tasarımın önkoşulu değildir.
- Meyve ağacı, çalı ve suda yetişen bitki farklı ekim/yer gereksinimleri taşır. Komşu tohumların birbirine faydalı veya zararlı etkileri olabilir; ateş tohumu örneği kesin içerik değildir.
- Yağmur uygun durumda sulama sayılır. Elle sulama için dereden su taşıma veya kuyudan çekme; otomatik sulama için tank ve kanal gerekir. Su kaynağı, taşıma ve altyapı hesaba katılmadan sınırsız sulama düğmesi olmamalı.
- Ekim, bakım, hasat sonrası kalıntıyı temizleme ve gerektiğinde nadas ayrı işlerdir. Bazı bitkiler toprağı sonradan etkiler; oyuncu gizli etkiyi deney ve gözlemle anlar. “Toprağı yenile”, “gübre”, “büyü” gibi anlık genel tuşların mevcut şekli hedef deneyim değil; bakım rol yapımı ve somut kaynak/iş akışıyla yürümeli.
- Gübrelerin farklı türleri, üretim yolları, etkileri ve keşif koşulları olacak. Zorunlu yetişme koşulu ile bakımın verime etkisi ayrı hesaplanacak.

## Ansiklopedi, araştırma ve üretim

- Ansiklopedi tohum, bitki, hayvan, gübre, üretim tarifi ve diğer keşifleri kategorilere ayırır. Başta bilinmeyen kayıt “?” görünür; resim, ad, nadirlik, yetişme koşulu, yan etki, kullanım gibi alanları DM bağımsız tiklerle açar. DM bütün gizli kuralı görebilir; oyuncu ancak açıklanan bilgiyi görür.
- Bir şeyin keşfi otomatik olarak bütün ilişkili tarifleri açmaz. Örneğin üzümden şarap öğrenmek, sirkeyi veya reçeli açmaz. Her üretim tarifi DM'in ayrı kartıyla görünür/aktif hâle gelir; oyuncular deney ve araştırma yapar.
- Araştırma konuları genel olarak keşif, deneme yanılma ve oyuncunun fikir yürütmesiyle ortaya çıkar. Uzman bulunması tek başına araştırmayı tamamlamaz. Teknoloji ağacında ilgili bilgi ortaya çıktıktan sonra ilerleme yapılır; araştırmacı, öğretmen, mühendis ve uzmanlar gerekli işlerde rol oynar. DM'in konu ekleme yetkisi ve araştırma maliyetleri ayrıca kararlaştırılacak.
- Başarısız deney, gizli yan etki ve köyler arası bilgi aktarımının kesin kuralları henüz belirlenmedi. Gizli mekanikler sadece arayüzde saklanmamalı; oyuncuya açık API yanıtları da bunları vermemeli.

## Yapılar, envanter ve ticaret

- Binalar sayı veya ortak arazi kotasıyla kısıtlanmaz. Basit binalar baştan görülebilir; okul, arşiv, sağlık, eğitim, mühendislik, maden, üretimhane gibi gelişmiş yapılar bilgi/araştırma ve gerekirse uzmanlıkla görünür. Tarlalar, bahçeler, depolar ve evler farklı işlevler taşır.
- İnşaata başlamadan bütün gerekli malzeme toplanır ve başlangıçta tüketilir. Ardından işçi, gerekiyorsa mühendis/uzman ve oyun günü gerekir. Hasarlı binanın onarımı tamamlanana dek bina kullanılamaz; yarım inşaat ileride sürdürülür. Konforu farklı evler vardır; “koğuş/otel” gibi ayrı zorunlu bina sınıfları istenmiyor. Başlangıç kampı geçicidir.
- Ortak envanterde kaynaklar, temel yiyecek, işlenmiş ürünler ve malzemeler ayrı izlenir. Halkın yiyeceği, barınma ve ilerleyen aşamada cep parası/ücret gereksinimi günlük ekonomiyi etkiler.
- Tek “bugünün tezgâhı” üzerinde odun, cevher, yiyecek gibi tüm malların yan yana satılması istenmiyor. Şehirlerin ayrı pazarları belirli günlerde kurulur; han, köy yapısı ve şehir pazarı ayrı işlevler görür. Oyuncu şehre gittiğinde bilgi panosundan o şehrin takvimini, duyurularını ve öğrendiği fiyatları görür. Şehirlerin olayları ve fiyatları farklıdır; mallar işlenip satılabilir, NPC evlerine giderek satış da yapılabilir.
- Bilinmeyen fiyatlar araştırılarak öğrenilebilir. Dinamik fiyatın şehir, gün, arz/talep, yolculuk ve ürün işleme kuralları ayrıca dengelenecek.

## NPC, aile ve eğitim

- Rastgele yolcu ve işe aday kişiler gelir; başlangıçta az, yerleşim geliştikçe daha çok. Köyün refahı, zenginliği, güvenliği, barınması ve gelişmişliği aday kalitesini/gelme ihtimalini etkiler. Çok yetenekli birinin erken gelmesi çok düşük olasılıkla mümkündür. Hanlarda çalışan aranabilir.
- Aday köye otomatik katılmaz. Yetkili köy yöneticisi başvuruyu kabul veya reddeder; kapasite kadar kişi alınabilir. Adayın hikâyesi, mesleği, madencilik dâhil becerileri, öğrenme, sadakat, sağlık ve başka özellikleri takip edilir.
- Her gün yapılan tek iş, zorluğuna göre meslek deneyimi ve verimi artırır. Yorgunluk, düşük refah, güvensizlik, hastalık ve sakatlanma iş yavaşlatabilir veya geçici olarak engelleyebilir.
- NPC ilişkileri ve aileleri takip edilir. Doğum; ilişki, uygun özel ev, barınma, yiyecek, güvenlik ve refah gibi koşullara bağlanır. Çocukların eğitim alanı seçilir; okul gençlere yöneliktir. Hayvanlar da özellik/kalıtım ve ayrı üreme döngüsüyle yönetilir. İnsan ve hayvan gebelik süreleri için söylenen yıl/mevsim rakamları kesin değil.
- **Ölüm ve yaşlılıktan oyuncu kaybı şimdilik kapsam dışında.** NPC için de ilk aşamada hastalık/sakatlık ve geçici iş görememe yeterli; kalıcı ölüm kuralı henüz istenmiyor.

## Canlı v0.7.0 ile farklar ve uygulama notu

Canlı sürümde dört hazır tarla, hazır stok/sakin/hayvan, 10 günlük mevsim, anlık bakım düğmeleri, tek oda/yerleşim durumu ve sınırlı pazar akışı bulunuyor. Bu görüşmedeki hedefler bunların yerine geçecek; henüz sitede uygulanmadı. Mevcut odaları veya yedekleri yeni modele geçirirken veri kaybı olmaması, köy sahibi ile oda DM'inin ayrılması ve gizli bilginin sunucuda korunması ayrıca tasarlanmalı. Bu belge tek başına patch notes veya sürüm duyurusu değildir.

## Cevap bekleyen kararlar

1. Oy verme: kimler oy verir, kaç oy gerekir, DM'in veto/erken geçirme hakkı ve çevrimdışı oyuncular nasıl ele alınır?
2. Konum/köy: başlangıç konumu kullanıcının mı köyün mü; başka köye geçince eski köyün sahipliği, stokları ve NPC'leri ne olur; eşit kurucular ayrılırsa yetki nasıl devredilir?
3. Parsel: 20 karede ekim/hasat iş gücü ve su miktarı nasıl ölçülür; meyve ağacı, çalı ve su bitkilerinin parsel türleri nasıl ayrılır?
4. NPC: her sabah görev verme süresi, DM düzeltmesinin sınırı, ücret başlangıcı, aile/çocuk büyüme ve hayvan üreme takvimi nedir?
5. Araştırma: deney maliyeti ve başarısızlık, DM'in doğrudan konu eklemesi, bilgilerin köyler arası aktarımı nasıl işler?
6. Ticaret: şehir pazarı günleri ve rotalar, bilgi panosunun görünürlüğü, şehirler arası seyahat zamanı, NPC ev satışları ve fiyatların öğrenilme yolu nedir?
7. Gizli kurallar: DM ansiklopedisindeki olay/bitki/ahlak etkileri hangi eylemle oyuncu ansiklopedisine açılır; başmelek ve tapınak seçiminin sonuçları nelerdir?

Sorular görüşme ilerledikçe burada cevaplanmalı; boş kalanlara kodda kalıcı kural icat edilmemeli.
