const section = (title, text, example) => ({ title, text, example });
const check = (prompt, options, answer, explanation) => ({
  prompt,
  options,
  answer,
  explanation,
});
const lesson = (id, title, summary, sections, cards, checks) => ({
  id,
  title,
  summary,
  sections,
  cards: cards.map(([front, back], i) => ({
    id: id + "-card-" + i,
    front,
    back,
  })),
  checks: checks.map((q, i) => ({ ...q, id: id + "-check-" + i })),
});
export const LEARNING_UNITS = [
  {
    id: "java",
    course: "oop",
    topic: 0,
    title: "Java & Nesneler",
    desc: "Sınıftan davranışa: nesnenin neyi temsil ettiğini kur.",
    lessons: [
      lesson(
        "java-1",
        "Sınıf, nesne ve sorumluluk",
        "Önce sistemdeki şeyleri ve onların üstlendiği işi ayırt et.",
        [
          section(
            "Sınıf (class) bir tanımdır",
            "Sınıf, aynı tür nesnelerin hangi bilgileri taşıyabileceğini ve hangi davranışları sunacağını tanımlar. Nesne (object) ise bu tanımın çalışma anındaki belirli bir örneğidir. İki Customer nesnesinin tipi aynı olabilir; isimleri ve siparişleri farklıdır. Sınıf ile tek bir müşteriyi aynı şey gibi düşünme.",
            "Customer sınıfı → Ege müşterisi ve Ayşe müşterisi. İki ayrı nesne, ortak tanım.",
          ),
          section(
            "Durum ve davranış birlikte anlam taşır",
            "State, nesnenin o andaki alan değerleridir; behavior, sunulan operasyonlardır. İyi bir model yalnızca veri depolamaz: o verinin geçerli biçimde değişmesini sağlayan sorumlulukları da belirler. Ancak her iş domain nesnesine yüklenmez; koordinasyon ve dış sistemlerle konuşma ayrı sorumluluklar olabilir.",
          ),
          section(
            "Sınavda senaryoyu oku",
            "“Bu sınıf kaç metot içerir?” yerine “Hangi bilgiyi biliyor, hangi işi yapmalı?” diye sor. Aynı isimli iki kavramın aynı nesne olduğu sonucuna atlama. Bir nesnenin kimliği ile alanlarının o anki eşitliği de ayrı konulardır.",
          ),
        ],
        [
          [
            "Class ile object farkı?",
            "Class tanım; object bu tanımın belirli bir örneğidir.",
          ],
          [
            "State ve behavior nedir?",
            "State alan değerleri; behavior nesnenin sunduğu operasyonlardır.",
          ],
        ],
        [
          check(
            "Aynı sınıftan iki müşteri için hangisi zorunludur?",
            [
              "Tüm alan değerleri aynıdır",
              "Aynı tür tanımını paylaşırlar",
              "Tek bir nesnedirler",
            ],
            1,
            "Aynı tip, aynı kimlik veya aynı alan değeri demek değildir.",
          ),
          check(
            "Bir nesnenin bakiyesi değişti. En doğrudan değişen nedir?",
            ["Class tanımı", "Nesnenin state’i", "Paket adı"],
            1,
            "Belirli nesnenin o anki alan değeri değişti.",
          ),
        ],
      ),
      lesson(
        "java-2",
        "Encapsulation, constructor ve enum",
        "İç durumu koru; başlangıç ile izin verilen seçenekleri ayır.",
        [
          section(
            "Encapsulation: kontrollü erişim",
            "Encapsulation, iç durumun ve uygulama ayrıntılarının bir sınır arkasında tutulmasıdır. private alanlar bu sınırı kurmaya yardımcı olur. Fakat her alana sınırsız setter açmak, kuralları yine dışarıya bırakabilir. Örneğin stok miktarı negatif olamıyorsa değişim operasyonu bu kuralı korumalıdır.",
          ),
          section(
            "Constructor: başlangıç",
            "Constructor yeni nesnenin başlangıç durumunu kurar; metot gibi bir dönüş tipi yazılmaz. Nesnenin ihtiyaç duyduğu zorunlu bilgileri almak için kullanılabilir. Bir constructor’ın bulunması tek başına bütün nesnelerin her zaman geçerli kalacağını garanti etmez: sonraki operasyonlar da kuralları korumalıdır.",
          ),
          section(
            "Enum: adlandırılmış seçenekler",
            "Enum, belirli bir kavramın izin verilen adlandırılmış değerlerini bir tip altında toplar. OrderStatus için NEW, PAID ve CANCELLED gibi değerler kullanmak, rastgele String yazım hatalarını azaltır. Enum’u bir seçim kutusunun seçenekleri gibi düşünebilirsin; hangi durumdan hangisine geçilebileceği ise ayrıca tanımlanmalıdır.",
            "OrderStatus.PAID bir durum değeridir. NEW → PAID geçişinin hangi koşulda yapılacağı ayrı bir iş kuralıdır.",
          ),
        ],
        [
          [
            "private alan immutable mı olur?",
            "Hayır. Alan erişimi sınırlanır; sınıfın kendi operasyonları durumu değiştirebilir.",
          ],
          [
            "Enum neyi garanti etmez?",
            "İş sürecindeki her durum geçişinin geçerli olduğunu kendiliğinden garanti etmez.",
          ],
        ],
        [
          check(
            "Negatif stok engellenmek isteniyor. Hangisi daha anlamlı?",
            [
              "Her değeri kabul eden setter",
              "Kuralları kontrol eden stok değiştirme operasyonu",
              "Alanı public yapmak",
            ],
            1,
            "Sınırın amacı geçerli durumu korumaktır.",
          ),
          check(
            "OrderStatus enum’u için hangisi doğrudur?",
            [
              "Her String kabul edilir",
              "Adlandırılmış durum değerleri tanımlar",
              "Tüm durum geçişlerini otomatik yönetir",
            ],
            1,
            "Durum kümesi ile geçiş kuralları aynı şey değildir.",
          ),
        ],
      ),
      lesson(
        "java-3",
        "Referans, immutable ve dinamik davranış",
        "Bir değişkeni, gösterdiği nesneden ayrı düşün.",
        [
          section(
            "Referans ile nesne",
            "Bir referans değişkeni bir nesneye erişmek için referans değeri taşır. Java’da metoda argüman geçerken değer kopyalanır; nesne referansının değeri de buna dahildir. Metot paylaşılan mutable nesneyi değiştirebilir. Yerel parametreyi başka nesneye bağlamak ise çağıranın referans değişkenini yeniden atamaz.",
          ),
          section(
            "String ve final ayrımı",
            "String immutable’dır: karakter içeriği mevcut nesne üzerinde değişmez. toUpperCase gibi bir operasyonun sonucunu kullanmalısın. final referans ise değişkenin yeniden atanmasını kısıtlar; gösterdiği listenin içeriğini otomatik olarak immutable yapmaz.",
            'String s="rift"; s.toUpperCase(); → s hâlâ "rift" değerini gösterir.',
          ),
          section(
            "Overload ve override",
            "Overload, aynı isim için farklı parametre imzaları sunar; uygun imza derleme aşamasındaki tür bilgileriyle seçilir. Override edilmiş instance metodunun gerçek implementasyonu, çalışma anındaki nesne tipine göre bulunabilir. Referans tipi ile gerçek nesne tipi farklı olduğunda bu iki aşamayı karıştırma. static metotlar bu biçimde override edilmez.",
          ),
        ],
        [
          [
            "final List ne demek?",
            "Referans yeniden atanamaz; listenin içeriği ayrıca korunmadıkça değişebilir.",
          ],
          [
            "Override seçiminde hangi tip önemli?",
            "Seçilmiş instance imzasının implementasyonu için çalışma anındaki gerçek nesne tipi.",
          ],
        ],
        [
          check(
            "final List<String> xs için yalnız final ne sağlar?",
            [
              "add çağrısı yasaktır",
              "Referans yeniden atanamaz",
              "Liste otomatik thread-safe olur",
            ],
            1,
            "final, nesnenin bütün davranışlarını kısıtlamaz.",
          ),
          check(
            "Metot parametresine başka nesne atandı. Çağıranın değişkeni zorunlu olarak değişir mi?",
            ["Evet", "Hayır", "Yalnız nesne String ise"],
            1,
            "Yerel referans değeri kopyası yeniden atanmıştır.",
          ),
        ],
      ),
    ],
  },
  {
    id: "solid",
    course: "oop",
    topic: 1,
    title: "Tasarım İlkeleri & İlişkiler",
    desc: "Değişikliklerin etkisini ve sınıflar arasındaki sözleşmeleri gör.",
    lessons: [
      lesson(
        "solid-1",
        "is-a, has-a ve kullanma ilişkisi",
        "Yeniden kullanım ihtiyacı her zaman inheritance anlamına gelmez.",
        [
          section(
            "Inheritance ve substitutability",
            "Inheritance, alt türün üst türle bir tür ilişkisi kurmasını sağlar. Tasarımda asıl soru, alt türün üst tür beklenen yerde davranış sözleşmesini koruyup korumadığıdır. Yalnız kodu kopyalamamak için inheritance seçmek, anlamsız bir is-a ilişkisi yaratabilir.",
          ),
          section(
            "Composition ve delegation",
            "Bir sınıf işi başka bir nesneye devredebilir; buna delegation denir. Davranışları parçalara bölerek birleştirmek composition yaklaşımıdır. UML’de güçlü parça–bütün composition ilişkisi daha özel bir yaşam döngüsü sahipliği anlamı taşır; her alan veya has-a ifadesini dolu elmasla çizme.",
          ),
          section(
            "Dependency ile kalıcı bağlantı",
            "Bir operasyonda başka bir nesneyi kullanmak dependency yaratabilir. Kalıcı bağlantıyı temsil eden association ile geçici kullanım ihtiyacını ayırt et. Bir ilişkinin doğru gösterimi, senaryonun nesneler arasında gerçekten neyi sakladığına ve vaat ettiğine bağlıdır.",
          ),
        ],
        [
          [
            "Her has-a UML composition mı?",
            "Hayır. Güçlü sahiplik ve parça yaşam döngüsü anlamı ayrıca değerlendirilir.",
          ],
          [
            "Delegation nedir?",
            "Bir sorumluluğun yürütülmesini başka bir nesneye devretmek.",
          ],
        ],
        [
          check(
            "Sadece kod tekrarını azaltmak için alakasız iki türü inheritance ile bağlamak neden riskli?",
            [
              "Daha az dosya olur",
              "Gerçek bir yerine-geçme ilişkisi olmayabilir",
              "Metot adı uzar",
            ],
            1,
            "Yeniden kullanım, davranış sözleşmesini tek başına doğrulamaz.",
          ),
          check(
            "Bir metot parametre olarak aldığı servisi yalnız çağrı sırasında kullanıyor. En temel ilişki?",
            ["Dependency", "Zorunlu composition", "Zorunlu inheritance"],
            0,
            "Kullanım bağımlılığı tek başına sahiplik veya alt tür ilişkisi değildir.",
          ),
        ],
      ),
      lesson(
        "solid-2",
        "SRP, OCP ve tasarım çürümesi",
        "Sınıfın büyüklüğünden çok değişiklik nedenlerini değerlendir.",
        [
          section(
            "Single Responsibility Principle",
            "SRP, bir modülün değişmesi için tek bir sorumluluk ekseni olması gerektiğini anlatır. Fiyat hesaplama, veritabanına yazma ve PDF düzenini aynı sınıfta toplamak farklı değişiklik nedenlerini bir araya getirir. Tek metotlu bir sınıf bile birden fazla sorumluluk taşıyabilir.",
          ),
          section(
            "Open–Closed Principle",
            "OCP, beklenen yeni davranışları mevcut kararlı kodu sürekli bozarak eklemek yerine genişletme noktalarıyla karşılamayı hedefler. Bu, hiçbir dosyanın asla değiştirilemeyeceği anlamına gelmez. Hata düzeltme ve refactoring yapılabilir; amaç her yeni varyantta aynı merkezî koşul zincirini büyütmemektir.",
          ),
          section(
            "Belirtiyi etkisinden tanı",
            "Rigidity: bir değişikliğin zincirleme ve zor değişiklikler gerektirmesi. Fragility: değişikliğin ilgisiz yerleri bozması. Immobility: bir parçayı başka bağlamda kullanmanın gereksiz bağlar yüzünden zorlaşması. Viscosity: doğru tasarımı izlemek yerine hızlı yamayı seçmenin daha kolay olması.",
          ),
        ],
        [
          [
            "SRP metot sayısı mı?",
            "Hayır. Bağımsız değişiklik nedenleri ve sorumluluk eksenleriyle ilgilidir.",
          ],
          [
            "Viscosity nedir?",
            "Tasarımı koruyan doğru yolun hızlı yamadan daha fazla sürtünme yaratması.",
          ],
        ],
        [
          check(
            "PDF biçimi değişince fiyat hesaplama sınıfı da değişiyor. En doğrudan ilke?",
            ["SRP", "Yalnız polymorphism", "Enum"],
            0,
            "Birbirinden bağımsız değişim nedenleri aynı sınıfta.",
          ),
          check(
            "Yeni ödeme yöntemi eklemek için hep merkezî if zinciri büyüyor. Hangi ilke incelenmeli?",
            ["OCP", "Constructor kuralı", "String immutability"],
            0,
            "Varyantlar için uygun bir genişletme noktası düşünülebilir.",
          ),
        ],
      ),
      lesson(
        "solid-3",
        "LSP, ISP ve DIP",
        "Arayüzün şekli kadar davranış vaadi de önemlidir.",
        [
          section(
            "Liskov Substitution Principle",
            "LSP, üst türün beklenen davranışının alt türle de korunmasıdır. Alt tür daha güçlü önkoşullar ister veya daha zayıf sonkoşullar sağlarsa mevcut istemciler bozulabilir. Aynı metot isimlerine sahip olmak tek başına yerine geçebilirlik kanıtı değildir.",
          ),
          section(
            "Interface Segregation Principle",
            "ISP, istemcileri ihtiyaç duymadıkları operasyonlara bağımlı bırakmamayı önerir. Yalnız yazdıran bir cihazın scan ve fax operasyonlarını da taşıması, yetenekleri ayrı arayüzlerle ifade etme ihtiyacını gösterebilir. Başarılı görünerek hiçbir şey yapmamak iyi bir sözleşme çözümü değildir.",
          ),
          section(
            "Dependency Inversion Principle",
            "DIP, üst düzey iş politikalarının düşük düzey ayrıntılara doğrudan bağlanmak yerine soyutlamalara dayanmasını hedefler. Bir PaymentPort arayüzü ile banka adaptörünü ayırmak buna örnektir. Kaynak kod bağımlılığının yönü ile çalışma anındaki çağrı yönü farklı olabilir; sadece interface yazmak bütün bağımlılıkları çözmez.",
          ),
        ],
        [
          [
            "Alt tür önkoşulu güçlendirebilir mi?",
            "Üst türün geçerli istemci kullanımlarını bozuyorsa LSP sorunudur.",
          ],
          [
            "ISP ile DIP farkı?",
            "ISP arayüzün istemciye uygun kapsamı; DIP politika ve ayrıntılar arasındaki bağımlılık yönü.",
          ],
        ],
        [
          check(
            "Alt tür, üst türün kabul ettiği geçerli girdiyi reddediyor. İlk şüphe?",
            ["LSP ihlali", "Her zaman SRP", "Sorun yok"],
            0,
            "İstemci üst tür sözleşmesine dayanıyordu.",
          ),
          check(
            "Print istemcisi scan/fax metotlarına da bağımlı. Hangi ilke?",
            ["ISP", "String immutability", "WIP"],
            0,
            "İstemcinin gereksiz operasyonlara bağımlılığı sorgulanır.",
          ),
        ],
      ),
    ],
  },
  {
    id: "agile",
    course: "oop",
    topic: 2,
    title: "Süreç & Agile",
    desc: "Ürünü büyütmeyi, çözümü iyileştirmeyi ve iş akışını ayır.",
    lessons: [
      lesson(
        "agile-1",
        "Iterative ve incremental geliştirme",
        "İki kavram farklı eksenleri anlatır; birlikte kullanılabilir.",
        [
          section(
            "Incremental: ürüne parça ekle",
            "Incremental geliştirme, çalışan ürünü yeni yetenek parçaları ekleyerek büyütür. Önce kayıt, sonra arama, sonra ödeme eklemek buna örnek olabilir. Parçaların küçük olması, öncekilerin tekrar değerlendirildiğini tek başına kanıtlamaz.",
          ),
          section(
            "Iterative: çözümü tekrar ele al",
            "Iterative geliştirme, mevcut çözümü geri bildirimle yeniden değerlendirip iyileştirir. İlk arama ekranının davranışını kullanıcı testinden sonra değiştirmek bir iterasyondur. Sık teslim yapmak ile çözümü öğrenerek düzeltmek aynı ölçüt değildir.",
          ),
          section(
            "Risk ve geri bildirim",
            "Erken bir mimari prototip, en belirsiz kısmı test etmeye yarayabilir. Sürecin amacı yalnız faz isimlerini takip etmek değil, belirsizliği azaltmak ve çalışan sonuçlardan öğrenmektir. Unified Process bağlamında da gereksinim, tasarım ve test faaliyetleri iterasyonlar içinde farklı ağırlıklarla yürüyebilir.",
          ),
        ],
        [
          [
            "Increment ile iteration farkı?",
            "Increment yeni yetenek parçası; iteration çözümü tekrar inceleyip iyileştirme döngüsüdür.",
          ],
          [
            "Sık teslim tek başına iterative mı?",
            "Hayır. Önceki çözümün geri bildirimle tekrar ele alınması ayrıca gerekir.",
          ],
        ],
        [
          check(
            "Mevcut arama ekranı kullanıcı geri bildirimiyle yeniden düzenleniyor. Baskın yön?",
            ["Iterative", "Yalnız incremental", "Değişmezlik"],
            0,
            "Var olan çözüm iyileştiriliyor.",
          ),
          check(
            "Çalışan ürüne yeni rapor modülü ekleniyor. Baskın yön?",
            ["Incremental", "Yalnız regression", "Encapsulation"],
            0,
            "Ürünün yetenek kapsamı büyüyor.",
          ),
        ],
      ),
      lesson(
        "agile-2",
        "Scrum: hedefler, roller, etkinlikler",
        "Ürün odağını, günlük planı ve süreç iyileştirmesini ayır.",
        [
          section(
            "Üç sorumluluk alanı",
            "Product Owner ürün değerine ve Product Backlog yönetimine odaklanır. Scrum Master Scrum’ın anlaşılmasına ve uygulanmasına yardım eder. Developers kullanılabilir Increment üretmek ve günlük işlerini planlamakla sorumludur. Bunları klasik bir patron–çalışan raporlama zinciri gibi ezberleme.",
          ),
          section(
            "Backlog ve hedef",
            "Product Backlog ürün için gerekenlerin gelişen, sıralanan listesidir. Sprint Backlog, Sprint Goal, seçilen işler ve bunların nasıl yapılacağına dair plandır. Sprint Goal yalnız bir görev listesi değildir; Sprint’in tutarlı amacını anlatır.",
          ),
          section(
            "Etkinliklerin inceleme odağı",
            "Daily Scrum yakın vadeli planın Sprint Goal’e göre uyarlanmasıdır. Sprint Review ürünün sonucu ve gelecekteki uyarlamalarla ilgilidir. Retrospective çalışma biçimini iyileştirmeye odaklanır. Definition of Done, Increment’in tamam sayılması için kalite koşullarını ifade eder; işin piyasada başarılı olacağını garanti etmez.",
          ),
        ],
        [
          [
            "Review ile retrospective?",
            "Review ürün/sonuç ve uyarlama; retrospective ekip çalışma biçimini iyileştirme odağı taşır.",
          ],
          [
            "Definition of Done ne işe yarar?",
            "Tamamlanma için ortak kalite eşiğini açıklar; pazar değeri garantisi değildir.",
          ],
        ],
        [
          check(
            "Ekip test süreçlerini nasıl iyileştireceğini tartışıyor. En uygun etkinlik?",
            ["Retrospective", "Sprint Review", "Yalnız Product Backlog"],
            0,
            "İncelenen şey ürün özelliğinden çok çalışma biçimi.",
          ),
          check(
            "Daily Scrum’ın ana amacı?",
            [
              "Yöneticiye bireysel performans raporu",
              "Sprint Goal için yakın planı inceleyip uyarlamak",
              "Yeni maaş belirlemek",
            ],
            1,
            "Günlük etkinlik bir performans notlandırma toplantısı değildir.",
          ),
        ],
      ),
      lesson(
        "agile-3",
        "Kanban, WIP ve akış",
        "Daha çok iş başlatmak, daha çok iş bitirmek değildir.",
        [
          section(
            "İşi görünür kıl",
            "Kanban yaklaşımında işin durumlarını ve akış kurallarını görünür kılmak önemlidir. To do, In progress ve Done gibi sütunlar bir başlangıç olabilir. Sütunların anlamı ve bir işin ne zaman ilerleyeceği belirsizse kartların görünür olması tek başına yeterli değildir.",
          ),
          section(
            "WIP limiti",
            "Work in Progress limiti, ilgili akış bölümünde aynı anda bulunan iş sayısını sınırlar. Limit doluyken yeni işe başlamak yerine mevcut işi bitirmeye veya darboğazı çözmeye odaklanılır. Amaç insanların sürekli meşgul görünmesi değil, akışın iyileşmesidir.",
          ),
          section(
            "Ölçüleri ayır",
            "Throughput belli sürede biten iş sayısıdır. Cycle time, tanımlanan başlangıç ve bitiş noktaları arasında bir işin geçirdiği süredir. Lead time daha geniş bir talep–teslim aralığı için kullanılabilir; ölçüm sınırlarını açık belirtmek gerekir. Çok sayıda yarım iş, bekleme ve bağlam değiştirme maliyetini artırabilir.",
          ),
        ],
        [
          [
            "WIP limiti neyi sınırlar?",
            "Aynı anda akışın belirli bölümünde bulunan iş sayısını.",
          ],
          [
            "Throughput ile cycle time?",
            "Biri birim zamanda tamamlanan iş sayısı; diğeri tek işin tanımlı akışta geçirdiği süre.",
          ],
        ],
        [
          check(
            "Test sütunu dolu; herkes yeni kodlamaya başlıyor. Hangi davranış akışı destekler?",
            [
              "Daha fazla iş açmak",
              "Test darboğazını çözmeye yardım etmek",
              "Limiti yok saymak",
            ],
            1,
            "Bitirmeye odaklanmak yığılmayı azaltabilir.",
          ),
          check(
            "Bir haftada bitirilen 12 iş hangi ölçüye örnek?",
            ["Throughput", "Tek işin cycle time’ı", "Inheritance"],
            0,
            "Birim zamanda tamamlanan iş sayısı ölçülüyor.",
          ),
        ],
      ),
    ],
  },
  {
    id: "requirements",
    course: "oop",
    topic: 3,
    title: "Gereksinimler",
    desc: "İhtiyacı açık, sınanabilir ve bağlamı belli bir ifadeye dönüştür.",
    lessons: [
      lesson(
        "req-1",
        "Davranış, kalite ve kısıt",
        "“Ne yapar?” ile “hangi kalitede?” sorularını ayır.",
        [
          section(
            "Functional requirement",
            "Fonksiyonel gereksinim sistemin sunması gereken davranışı ifade eder. Örneğin müşterinin siparişi iptal edebilmesi, hangi koşulda izin verildiğiyle birlikte tanımlanabilir. Bir butonun adını söylemek, arkasındaki iş davranışını tam tanımlamak değildir.",
          ),
          section(
            "Quality requirement ve constraint",
            "Kalite gereksinimi performans, güvenilirlik veya kullanılabilirlik gibi nitelikleri somutlaştırır. Teknoloji veya mevzuat gibi sınırlar tasarım kısıtı olabilir. Sınıflandırmada tek bir anahtar kelimeye bakmak yerine ifadenin sistemi hangi açıdan sınırlandırdığını değerlendir.",
          ),
          section(
            "Sınanabilirlik",
            "“Hızlı”, “kolay” veya “güvenli” tek başına açık kabul ölçütü değildir. Ölçü, bağlam ve eşik yazılmalıdır. Beklenen yük belirtilmeden verilen yanıt süresi hedefi eksik kalabilir. İyi gereksinim, geliştirici ile değerlendiricinin aynı şeyi sınamasını kolaylaştırır.",
            "Belirsiz: Hızlı yanıt verir. Daha açık: Belirtilen 100 eşzamanlı kullanıcı yükünde isteklerin %95’i 2 saniye içinde yanıtlanır.",
          ),
        ],
        [
          [
            "Functional gereksinim?",
            "Sistemin hangi davranışı sunacağını anlatır.",
          ],
          [
            "Ölçülebilirlik için ne gerekir?",
            "Yalnız sıfat değil; bağlam, ölçüm yöntemi ve kabul eşiği.",
          ],
        ],
        [
          check(
            "“Sipariş durumunu görüntüle” en doğrudan hangi kategori?",
            [
              "Fonksiyonel davranış",
              "Yalnız performans",
              "Yalnız teknoloji kısıtı",
            ],
            0,
            "Sistemden beklenen bir işlev tanımlanıyor.",
          ),
          check(
            "“Sistem hızlı olsun” neden zayıf?",
            [
              "Her zaman gereksizdir",
              "Sınanabilir eşik ve bağlamı belirsizdir",
              "Sadece İngilizce yazılmalıdır",
            ],
            1,
            "Farklı okuyucular farklı hız beklentileri çıkarabilir.",
          ),
        ],
      ),
      lesson(
        "req-2",
        "EARS ile koşulları netleştir",
        "Tetikleyici, durum ve istenmeyen davranışı birbirine karıştırma.",
        [
          section(
            "Olay ve durum",
            "Event-driven gereksinim bir olay gerçekleştiğinde yapılacak davranışı ifade eder: WHEN ... the system SHALL ... . State-driven gereksinim, bir durum sürdüğü müddetçe geçerli davranışı anlatır: WHILE ... . Olay bir anı, durum bir koşulun devamını vurgular.",
          ),
          section(
            "İstenmeyen durum",
            "Unwanted behavior kalıbında IF bir istenmeyen koşulu, THEN SHALL sistemin buna tepkisini belirtir. Sadece hatanın adını yazmak yeterli değildir; sistemin ne yapacağı da gözlenebilir olmalıdır. Her IF ifadesini kod düzeyinde bir algoritma zorunluluğu gibi okuma.",
          ),
          section(
            "Kalıp açık anlamın yerini tutmaz",
            "Ubiquitous gereksinimler sürekli geçerlidir. Optional feature için WHERE gibi bir özellik koşulu kullanılabilir. Kalıplar ifadenin yapısını düzeltir; yanlış iş kuralını kendiliğinden doğru hale getirmez. Aktör, veri ve sınır değerler hâlâ dikkatle seçilmelidir.",
          ),
        ],
        [
          [
            "WHEN ile WHILE farkı?",
            "WHEN olay tetikleyicisi; WHILE devam eden durum koşulu.",
          ],
          [
            "EARS tek başına neyi çözmez?",
            "İş kuralının doğruluğunu ve eksik kapsamı otomatik doğrulamaz.",
          ],
        ],
        [
          check(
            "“Ödeme onaylandığında makbuz oluştur.” Baskın yapı?",
            ["Event-driven", "State-driven", "Optional feature"],
            0,
            "Bir olayın gerçekleşmesi davranışı tetikliyor.",
          ),
          check(
            "“Bakım modu sürdüğü müddetçe yeni sipariş kabul etme.” Baskın yapı?",
            ["State-driven", "Yalnız ubiquitous", "Overload"],
            0,
            "Devam eden bir durum koşulu var.",
          ),
        ],
      ),
      lesson(
        "req-3",
        "Use case: aktör ve hedef",
        "Ekran tıklamalarından önce aktörün amacını bul.",
        [
          section(
            "Aktör sistem sınırının dışındadır",
            "Actor bir rolü temsil eder; mutlaka insan olması gerekmez. Bir ödeme servisi de belirlenen sistem sınırına göre aktör olabilir. Sistem içindeki veritabanını her zaman dış aktör saymak hatalıdır; önce hangi sistemi modellediğini açıkla.",
          ),
          section(
            "Ana ve alternatif akış",
            "Use case, aktörün hedefe ulaşmak için sistemle etkileşimini anlatır. Main success scenario başarılı ana yolu, alternative/exception akışlar farklı koşulları anlatır. Her tıklamayı bağımsız use case yapmak, kullanıcının amacını parçalayabilir.",
          ),
          section(
            "include ve extend",
            "include, ortak davranışın başka bir use case tarafından dahil edilmesini ifade eder. extend, belirli koşulda temel use case’e eklenen davranışı anlatır. Yalnız “önce/sonra” sırası çizmek için bu ilişkileri kullanma. Temel use case’in kendi anlamlı akışını ve ek davranışın koşulunu değerlendir.",
          ),
        ],
        [
          [
            "Actor kişi midir?",
            "Bir dış rolü temsil eder; insan veya başka bir sistem olabilir.",
          ],
          [
            "include / extend?",
            "Ortak dahil edilen davranış ile koşullu ek davranış arasındaki ayrım.",
          ],
        ],
        [
          check(
            "Ödeme gateway’i sistem sınırının dışında. Aktör olabilir mi?",
            ["Evet", "Hayır, yalnız insan olabilir", "Yalnız class ise"],
            0,
            "Aktörün insan olma zorunluluğu yoktur.",
          ),
          check(
            "Use case için hangi başlık daha hedef odaklı?",
            ["Yeşil butona bas", "Sipariş ver", "Fareyi oynat"],
            1,
            "Aktörün ulaşmak istediği iş hedefini anlatır.",
          ),
        ],
      ),
    ],
  },
  {
    id: "domain",
    course: "oop",
    topic: 4,
    title: "Domain Model",
    desc: "Gerçek problem kavramlarını, yazılım tasarımından önce düzenle.",
    lessons: [
      lesson(
        "domain-1",
        "Kavramsal model ve tasarım modeli",
        "Bir domain kavramını görmek, Java sınıfı yazmakla aynı aşama değildir.",
        [
          section(
            "Domain model ne anlatır?",
            "Domain model, problem alanındaki önemli kavramları, nitelikleri ve bağlantıları görünür kılar. Amaç önce alanı ortak anlamla konuşabilmektir. Her isim otomatik olarak ayrı bir sınıf değildir; senaryodaki sorumluluk ve anlamı değerlendirmek gerekir.",
          ),
          section(
            "Kavramsal ile yazılımsal ayrımı",
            "Kavramsal modelde Customer, Order ve Payment gibi alan kavramları yer alabilir. Controller, Repository veya JDBC bağlantısı gibi yazılım ayrıntıları ise tasarım kararlarıdır. Domain model çizilirken erken implementasyon tercihleriyle problem dilini karıştırma.",
          ),
          section(
            "İsim ve attribute seçimi",
            "Bağımsız kimliği veya anlamlı ilişkileri olan bir kavram sınıf olarak değerlendirilebilir. Basit bir değer attribute olarak tutulabilir. Fakat yalnız ekranda metin görünmesi, kavramın domain’de basit String olduğu anlamına gelmez. Kararı modelin amacı ve iş kurallarıyla ver.",
          ),
        ],
        [
          [
            "Domain modelin ilk odağı?",
            "Problem alanının kavramları ve aralarındaki anlamlı ilişkiler.",
          ],
          [
            "Repository domain kavramı mı?",
            "Genellikle yazılım tasarım ayrıntısıdır; kavramsal alan modelinin odağı farklıdır.",
          ],
        ],
        [
          check(
            "İlk kavramsal domain modelde hangisi en doğal aday?",
            ["Order", "SQLConnectionPool", "HTTPRouter"],
            0,
            "Order problem alanının iş kavramıdır.",
          ),
          check(
            "Metindeki her isim otomatik sınıf olur mu?",
            [
              "Evet",
              "Hayır; anlamı ve modelin amacı değerlendirilir",
              "Yalnız büyük harfle başlıyorsa",
            ],
            1,
            "İsim bulma bir aday üretme yöntemi olabilir; son karar değildir.",
          ),
        ],
      ),
      lesson(
        "domain-2",
        "Association ve multiplicity",
        "Çokluğu ilişkinin doğru ucundan oku.",
        [
          section(
            "Association neyi saklar?",
            "Association, kavram örnekleri arasındaki anlamlı bağlantıyı ifade eder. Order ile OrderLine bağlantısı, bir siparişin hangi satırlardan oluştuğunu anlatabilir. Diyagramı yalnız çizgi ezberiyle değil, “bir örnek için kaç karşı örnek?” sorusuyla oku.",
          ),
          section(
            "Multiplicity uçta okunur",
            "Bir ucun yanındaki multiplicity, karşı uçtaki bir örnek için o uçta kaç örnek olabileceğini anlatır. 0..1 isteğe bağlı en fazla bir; 1 tam bir; 0..* sıfır veya çok; 1..* en az bir demektir. İki ucu ayrı ayrı cümleye çevir.",
            "Order yanında 1, OrderLine yanında 1..* varsa: bir sipariş en az bir satıra; her satır bir siparişe bağlıdır.",
          ),
          section(
            "İş kuralı modelin sınırını belirler",
            "Taslak siparişin satırsız olması mümkünse 1..* kuralı her yaşam evresine uymayabilir. Modelin hangi durumu temsil ettiğini belirtmek gerekir. Görünüşte aynı iki diyagram, farklı kapsam veya varsayımlarda farklı doğruluk taşıyabilir.",
          ),
        ],
        [
          ["0..1 ne demek?", "Hiç olmayabilir; varsa en fazla bir tane."],
          [
            "Çokluk hangi soruyla okunur?",
            "Karşı uçtaki bir örnek için bu uçta kaç örnek olabilir?",
          ],
        ],
        [
          check(
            "0..* hangi duruma izin verir?",
            ["Mutlaka en az bir", "Hiç örnek olmamasına", "Yalnız bir örneğe"],
            1,
            "Alt sınır sıfırdır.",
          ),
          check(
            "Bir siparişin satır ucu 1..*. Ne söyler?",
            [
              "Bir siparişte en az bir satır",
              "Her satırda birçok sipariş",
              "Sipariş kimliği 1 olur",
            ],
            0,
            "Çokluk, karşı uçtaki bir sipariş için satır sayısını belirtir.",
          ),
        ],
      ),
      lesson(
        "domain-3",
        "Sahiplik, composition ve invariant",
        "Bir çizgi kadar yaşam döngüsü kuralı da önemlidir.",
        [
          section(
            "Güçlü parça–bütün sahipliği",
            "UML composition, güçlü parça–bütün sahipliği anlamı taşır. Dolu elmas bütün ucunda gösterilir. Parçanın bağımsızlığı ve bütünle ilişkili yaşam döngüsü varsayımları değerlendirilmelidir. Sadece “içerir” fiilini görmek yeterli değildir.",
          ),
          section(
            "Aggregation otomatik çözüm değil",
            "Shared aggregation boş elmasla gösterilir; birçok durumda sade association daha açık bir tercih olabilir. Bir ilişkiye elmas eklemek modeli otomatik olarak daha ayrıntılı veya daha doğru yapmaz. Önce iş kuralını cümleyle belirt; ardından uygun gösterimi seç.",
          ),
          section(
            "Invariant geçerli durumlarda korunur",
            "Invariant, modelin geçerli durumlarında korunması gereken kuraldır. Örneğin bir sipariş toplamının satır toplamlarıyla tutarlı olması bir invariant olabilir. Operasyonlar bu kuralı korumalıdır. Veritabanındaki her teknik kolon, kavramsal modelde aynı biçimde gösterilmek zorunda değildir.",
          ),
        ],
        [
          ["Dolu elmas hangi uçta?", "Bütün / sahip olan uçta."],
          [
            "Invariant nedir?",
            "Modelin geçerli durumlarında korunması beklenen kural.",
          ],
        ],
        [
          check(
            "Bir sınıfta başka sınıf tipinden alan var. Kesin composition mı?",
            [
              "Evet",
              "Hayır; sahiplik ve yaşam döngüsü anlamı gerekir",
              "Yalnız private ise",
            ],
            1,
            "Alan bulunması tek başına güçlü parça–bütün kuralı değildir.",
          ),
          check(
            "Sipariş toplamı her geçerli durumda satır toplamlarına eşit olmalı. Bu nedir?",
            ["Invariant", "Yalnız UI rengi", "Constructor adı"],
            0,
            "Durumlar boyunca korunan iş kuralı tanımlanıyor.",
          ),
        ],
      ),
    ],
  },
  {
    id: "ssd",
    course: "oop",
    topic: 5,
    title: "SSD & Contracts",
    desc: "Dış olayları ve durum değişikliklerini tutarlı bir zincire bağla.",
    lessons: [
      lesson(
        "ssd-1",
        "Sistem sınırı ve SSD",
        "Sistemi önce bir kara kutu olarak gör.",
        [
          section(
            "System Sequence Diagram",
            "SSD, seçilen senaryoda dış aktör ile sistem arasındaki olay sırasını gösterir. Sistemi kara kutu olarak ele alır; içeride hangi controller’ın hangi repository’yi çağırdığı bu diyagramın ana odağı değildir. Önce dışarıdan gözlenen etkileşimi netleştir.",
          ),
          section(
            "System event ve operasyon",
            "Aktörün sisteme gönderdiği olay, sistemin sunması gereken bir operasyonu belirlemeye yardım eder. Parametreler olayın ihtiyaç duyduğu bilgiyi taşır. Teknik UI tıklaması ile iş olayını aynı isimle modellemek zorunda değilsin; amaç aktör niyetini açık ifade etmektir.",
          ),
          section(
            "Sıra ve kapsam",
            "Use case’in belirli bir akışını seç. Ana başarılı yol ile hata durumunu belirsizce karıştırma. SSD’den tek başına iç sınıf sorumluluklarını veya algoritmayı kesin olarak çıkaramazsın; bunun için tasarım kararları gerekir.",
            "Müşteri → Sistem: addItem(productId, quantity). İçeride hangi sınıfların işbirliği yapacağı sonraki tasarım adımıdır.",
          ),
        ],
        [
          [
            "SSD iç nesneleri detaylandırır mı?",
            "Ana odağı dış aktör–sistem olaylarıdır; sistem kara kutudur.",
          ],
          [
            "System event neyi ifade eder?",
            "Aktörün sistemden istediği davranışı tetikleyen dış olay.",
          ],
        ],
        [
          check(
            "SSD’de hangi lifeline en uygundur?",
            [
              "Sistem bir bütün olarak",
              "Her SQL tablosu zorunlu",
              "Tüm private helper’lar",
            ],
            0,
            "İç tasarım yerine sistem sınırı öne çıkar.",
          ),
          check(
            "addItem için ürün kimliği ve miktar nedir?",
            [
              "Operasyon parametreleri",
              "Zorunlu alt sınıflar",
              "Definition of Done",
            ],
            0,
            "Olayın taşımak zorunda olduğu bilgiyi ifade eder.",
          ),
        ],
      ),
      lesson(
        "ssd-2",
        "Precondition ve postcondition",
        "Algoritma tarifinden önce öncesi ve sonrası durumunu yaz.",
        [
          section(
            "Precondition",
            "Önkoşul, operasyon gerçekleşmeden önce doğru olduğu varsayılan durumdur. “Aktif bir satış mevcut” buna örnektir. Önkoşul ile kullanıcının sonradan yaptığı bir eylemi karıştırma. İyi sözleşme, hangi başlangıç durumunda vaat verdiğini açıklar.",
          ),
          section(
            "Postcondition",
            "Sonkoşul, operasyon tamamlandığında oluşan gözlenebilir durum değişikliklerini belirtir: nesne oluşturma, attribute değişimi veya association ekleme/silme gibi. “Bir for döngüsü çalıştırılır” implementasyon adımıdır; kavramsal sonkoşul değildir.",
          ),
          section(
            "Vaat ve doğrulama",
            "Önkoşulun yazılması, arayüzün geçersiz girdileri nasıl yöneteceğini tek başına çözmez. Hata davranışı da uygun yerde açıklanmalıdır. Sonkoşulu test ederken hangi eski durumun değiştiğini ve hangi ilişkinin kurulduğunu somut olarak kontrol edebilmelisin.",
          ),
        ],
        [
          [
            "Precondition ne zaman?",
            "Operasyondan önce doğru olduğu varsayılan koşul.",
          ],
          [
            "Postcondition algoritma mı?",
            "Hayır. Operasyondan sonraki gerekli durum değişikliklerini anlatır.",
          ],
        ],
        [
          check(
            "“Yeni OrderLine oluşturuldu ve Order ile ilişkilendirildi.” Hangi bölüm?",
            ["Postcondition", "Yalnız precondition", "UI teması"],
            0,
            "Operasyon sonrasındaki nesne ve ilişki değişimi.",
          ),
          check(
            "“Bir for döngüsü çalışır.” Neden zayıf sonkoşul?",
            [
              "İstenen durum yerine uygulama adımı anlatır",
              "Çünkü döngüler yasaktır",
              "Çünkü çok kısadır",
            ],
            0,
            "Aynı son durum farklı algoritmalarla sağlanabilir.",
          ),
        ],
      ),
      lesson(
        "ssd-3",
        "Senaryodan tutarlı sözleşmeye",
        "Use case, SSD ve domain modelin aynı hikâyeyi anlatsın.",
        [
          section(
            "Önce olayın amacını netleştir",
            "Örneğin sepete ürün ekleme olayında aktör hangi bilgiyi gönderiyor? Aktif bir sepet var mı? Aynı ürün zaten varsa yeni satır mı açılacak, miktar mı artırılacak? Bu kararlar net değilse diyagram çizmek belirsizliği gizler.",
          ),
          section(
            "Model üzerinde sonucu izle",
            "Sözleşmedeki yeni nesne, ilişki ve attribute değişimleri domain modelde anlamlı karşılıklara sahip olmalıdır. OrderLine oluşturuluyorsa hangi Order’a ve hangi Product’a bağlandığı belirtilmelidir. Yalnız bir ID alanı eklemek kavramsal ilişkinin anlamını her zaman açık anlatmaz.",
          ),
          section(
            "Tutarlılığı çapraz kontrol et",
            "Use case aktörün hedefini, SSD dış olay sırasını, contract ise önemli operasyonun durum değişimini anlatır. Bunlar aynı ayrıntı seviyesinde değildir fakat birbirini çürütmemelidir. Domain modelde olmayan bir ilişkiyi sonkoşulda kullanıyorsan model veya sözleşmenin kapsamını yeniden gözden geçir.",
          ),
        ],
        [
          [
            "Use case → SSD → contract ilişkisi?",
            "Hedef ve akış → dış sistem olayları → operasyonun gerekli durum değişimi.",
          ],
          [
            "Yeni satır sözleşmesinde ne eksik kalabilir?",
            "Oluşturulan nesnenin ilgili sipariş ve ürünle bağlantıları belirtilmemiş olabilir.",
          ],
        ],
        [
          check(
            "Contract yeni OrderLine’dan bahsediyor ama neye bağlandığını söylemiyor. Ne incelenmeli?",
            ["Association sonkoşulları", "Yalnız font boyutu", "WIP limiti"],
            0,
            "Oluşturma kadar bağlantıların kurulması da gerekebilir.",
          ),
          check(
            "Bu belgelerin tutarlı olması ne demek?",
            [
              "Hepsi aynı ayrıntıyı tekrarlar",
              "Farklı bakışlardan aynı davranışı çelişmeden açıklar",
              "Hepsi yalnız kod içerir",
            ],
            1,
            "Amaçları farklıdır; ortak hikâyeleri tutarlı olmalıdır.",
          ),
        ],
      ),
    ],
  },
];
export const courseUnits = (course) =>
  LEARNING_UNITS.filter((u) => u.course === course);
export const courseLessons = (course) =>
  courseUnits(course).flatMap((u) => u.lessons);
export function learningState(s) {
  return (s.learning[s.course] ??= {
    read: [],
    cards: {},
    answers: {},
    lastLesson: null,
  });
}
export function markLesson(s, id) {
  if (!courseLessons(s.course).some((l) => l.id === id))
    throw Error("Bu bölüm bu derste yok.");
  const p = learningState(s);
  if (!p.read.includes(id)) p.read.push(id);
  p.lastLesson = id;
}
