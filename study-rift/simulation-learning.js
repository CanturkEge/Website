import { SIMULATION_DISTRACTORS } from "./simulation-checks.js";
import { SIMULATION_SOURCES, slideSource } from "./simulation-sources.js";
const S = (title, text, example) => ({ title, text, example });
const L = (title, summary, pages, sections, cards) => ({
  title,
  summary,
  pages,
  sections,
  cards,
});
const content = [
  [
    L(
      "Sistem, model ve simülasyon",
      "Önce neyi taklit ettiğimizi ve neyi ölçtüğümüzü kur.",
      [2, 7, 8, 10],
      [
        S(
          "Sistem (system) birlikte çalışan bütündür",
          "Bir banka; müşteriler, gişeler, kuyruk ve kurallarıyla bir sistemdir. Entity ilgilendiğin nesne, attribute o nesnenin özelliği, state ise sistemin belirli andaki durumudur. Sınır, hangi etkileşimleri modele dahil ettiğini belirler.",
          "Müşteri: entity. İşlem türü: attribute. Kuyruktaki müşteri sayısı: state variable.",
        ),
        S(
          "Model bir soyutlamadır",
          "Model gerçek sistemin kendisi değildir; belirli bir amaç için gerekli özelliklerini temsil eder. Her ayrıntıyı kopyalamak yerine sonucu etkileyen mekanizmalar seçilir. Amaç bekleme ise kuyruk mantığını dışarıda bırakmak önemli bir hatadır.",
        ),
        S(
          "Simülasyon (simulation) modeli işletir",
          "Bir modeli zaman veya örnekleme boyunca çalıştırıp yapay bir geçmiş üretiriz; buradan performans ölçeriz. Sonuç bir tahmindir. Model ve rastgelelik nedeniyle belirsizlik taşıyabilir. Simülasyonu çalıştırmak otomatik optimum arama anlamına gelmez.",
        ),
      ],
      [
        [
          "Entity ile attribute farkı?",
          "Entity nesnenin kendisi, attribute o nesneye ait özelliktir.",
        ],
        [
          "Model neden bütün ayrıntıları içermez?",
          "Amaç için gerekli davranışı koruyan bir soyutlamadır.",
        ],
      ],
    ),
    L(
      "Model türlerini ayır",
      "Zaman, rastgelelik ve state değişimini üç ayrı eksende düşün.",
      [9, 11, 12],
      [
        S(
          "Static / dynamic",
          "Static model zaman evrimini açıkça izlemez; dynamic model sistemin zamanla değişimini inceler. Bir zar deneyi rastgele olabilir ama olay saati izlenmiyorsa dinamik olmak zorunda değildir.",
        ),
        S(
          "Deterministic / stochastic",
          "Deterministic modelde aynı giriş ve başlangıç koşulları aynı sonucu verir; stochastic model rastgele bileşen içerir. Bu sınıflandırma zaman ekseninden ayrıdır. Dinamik bir fizik modeli deterministik de olabilir.",
        ),
        S(
          "Discrete-event / continuous",
          "Discrete-event modelde önemli state değişimleri olay anlarında olur. Continuous modelde ilgili state kesintisiz değişebilir. DES saati kesirli zamanlara sıçrayabilir; discrete sözcüğü zamanın tam sayı olması demek değildir.",
          "Geliş t=2,7’de olabilir; kuyruk sayısı o anda değişir.",
        ),
      ],
      [
        [
          "Stochastic olmak dynamic olmak mıdır?",
          "Hayır. Rastgelelik ve zaman farklı eksenlerdir.",
        ],
        [
          "DES’te zaman yalnız tam sayı mı?",
          "Hayır; önemli değişimler ayrık olay anlarında olur, zaman sürekli değerli olabilir.",
        ],
      ],
    ),
    L(
      "Bir simülasyon çalışmasını kur",
      "Problemi tanımla, doğrula, geçerle ve belirsizliği raporla.",
      [3, 4, 5, 6, 13, 14, 15, 16],
      [
        S(
          "Önce amaç ve ölçüt",
          "Hangi kararı destekleyeceğini, hangi koşulları inceleyeceğini ve bekleme, maliyet veya kullanım gibi hangi ölçütü hesaplayacağını belirle. Basit yeterli analitik çözüm varsa önce onu değerlendirmek mantıklıdır.",
        ),
        S(
          "Verification ve validation",
          "Verification, kodun kavramsal kuralları doğru uygulamasıdır. Validation, modelin gerçek sistemi belirli amaç için yeterince temsil etmesidir. Kusursuz yazılmış kod yanlış bir modeli uygulayabilir.",
        ),
        S(
          "Deney, sonuç ve sınır",
          "Girdi verilerini, varsayımları, başlangıç/bitişi, stream planını ve replikasyonları kaydet. Sonucu belirsizliğiyle raporla. Çalışma iteratiftir; başarısız validation önceki adımlara dönmeyi gerektirebilir.",
        ),
      ],
      [
        ["Verification hangi soruyu sorar?", "Modeli doğru uyguladık mı?"],
        [
          "Validation hangi soruyu sorar?",
          "Karar amacı için doğru modeli mi kurduk?",
        ],
      ],
    ),
  ],
  [
    L(
      "Uniform sayıdan ayrık sonuca",
      "Olasılıkları birikimli aralıklara dönüştür.",
      [2, 3, 4],
      [
        S(
          "U temel ham girdidir",
          "U~U(0,1),0 ile1 arasında eşit yoğunluklu bir sayıdır. Bu sayı henüz dakika veya müşteri sayısı değildir. Sonucun dağılımına göre dönüşüm gerekir.",
        ),
        S(
          "Kümülatif sınır kur",
          "Olasılıkları sırayla topla. Her sonucun aralığının uzunluğu kendi olasılığına eşit olur. Aralıklar çakışmamalı, bir U iki farklı sonuca gitmemelidir.",
          "3/5/8 dakika olasılıkları0,30/0,45/0,25 ise sınırlar0,30;0,75;1 olur.",
        ),
        S(
          "Aralığı bul, sonucu al",
          "U=0,62 ikinci aralığa düşer,5 dakika seçilir. Birikimli sınır0,75 ikinci sonucun olasılığı değildir; ilk iki olasılığın toplamıdır. U=0,30 gibi sınırlar için[alt,üst) kuralı kullanıyoruz.",
        ),
      ],
      [
        [
          "Kümülatif sınır nasıl bulunur?",
          "Önceki olasılıklarla mevcut olasılığı toplayarak.",
        ],
        [
          "U’nun birimi dakika mı?",
          "Hayır; zaman birimi hedef süreye dönüştürünce gelir.",
        ],
      ],
    ),
    L(
      "Geliş aralığı ve mutlak saat",
      "Sürenin biriktiğini gör; sistemdeki müşteri sayısıyla karıştırma.",
      [5],
      [
        S(
          "Interarrival bir süredir",
          "İki ardışık geliş arasındaki farktır. Arrival time ise simülasyon başlangıcına göre gelişin mutlak zamanıdır. İkisinin birimi dakika olsa da anlamları farklıdır.",
        ),
        S(
          "Gelişleri biriktir",
          "İlk geliş başlangıçtan4 dakika sonra, sonraki aralar7 ve2 ise geliş zamanları4,11,13 olur. Her aralığı önceki geliş zamanına eklersin; son aralık2 diye üçüncü geliş2’de olmaz.",
        ),
        S(
          "Geliş yokluğu boş sistem değildir",
          "Bir zaman aralığında0 yeni müşteri gelmesi, önceki müşterilerin yok olması demek değildir. Sistemdeki sayı gelişle artar, ayrılışla azalır. Sayım değişkeni ile birikmiş state’i ayrı izle.",
        ),
      ],
      [
        [
          "Interarrival ile arrival farkı?",
          "İlki iki geliş arasındaki süre, ikincisi başlangıca göre geliş zamanıdır.",
        ],
        [
          "Bir aralıkta0 geliş sistem boş demek mi?",
          "Hayır; önceden gelenler içeride olabilir.",
        ],
      ],
    ),
    L(
      "Tek sunucuyu elle çalıştır",
      "Her satırda başlangıç, bitiş ve beklemeyi hesapla.",
      [6, 7],
      [
        S(
          "Başlangıç iki koşulu bekler",
          "Müşteri gelmiş ve sunucu boş olmalıdır. FCFS, kesintisiz tek sunucuda Bi=max(Ai,Ci−1). A geliş, B başlangıç, C önceki müşterinin bitiş zamanıdır.",
        ),
        S(
          "Süreleri ayır",
          "Ci=Bi+Si; Si hizmet süresi. Kuyruk beklemesi Wiq=Bi−Ai; sistemde kalış Wi=Ci−Ai=Wiq+Si. Bunları aynı sütuna yazma.",
          "A=4, öncekiC=9,S=3 → B=9,C=12,Wq=5,W=8 dakika.",
        ),
        S(
          "Ölçüm penceresine dikkat",
          "Ortalama beklemeye sıfır bekleyenleri de dahil et. Kullanım oranı gözlem ufku içindeki meşgul süre/toplam süredir. Ufuk dışına taşan hizmetin yalnız pencere içinde kalan kısmını say.",
        ),
      ],
      [
        ["Tek sunucuda başlangıç formülü?", "Bi=max(Ai,Ci−1)."],
        [
          "W ile Wq farkı?",
          "W toplam kalış, Wq yalnız hizmet öncesi kuyruk beklemesidir.",
        ],
      ],
    ),
  ],
  [
    L(
      "State, event, activity ve delay",
      "Bir fotoğrafı, bir anı ve bir süreyi ayır.",
      [3, 4, 5],
      [
        S(
          "State bir anlık fotoğraftır",
          "Kuyruk sayısı, sunucuların dolu/boş durumları ve stok miktarı sistem state’ini oluşturabilir. Hangi değişkenlerin gerektiği model amacına bağlıdır.",
        ),
        S(
          "Event anlık oluşumdur",
          "Geliş veya servis bitişi belirli bir anda gerçekleşir ve state değişikliğini tetikleyebilir. Hizmetin bütün süresi ise tek anlık event değildir.",
        ),
        S(
          "Activity ve delay süre kaplar",
          "Activity süresi başladığında tanımlanabilir; örneklenmiş5 dakikalık hizmet gibi. Delay, kuyruğun boşalması gibi koşullara bağlı beklemedir. Bu fark gelecekte neyi önceden planlayabileceğimizi etkiler.",
        ),
      ],
      [
        [
          "Event ve activity farkı?",
          "Event bir anda oluşur; activity bir süre kaplar.",
        ],
        [
          "Delay neden başta bilinmeyebilir?",
          "Bitişi sistemdeki diğer olayların koşulları değiştirmesine bağlıdır.",
        ],
      ],
    ),
    L(
      "FEL ve next-event saati",
      "Gelecek olayları zamanlarına göre yönet.",
      [6, 7, 8, 9],
      [
        S(
          "Future Event List",
          "FEL planlanmış gelecek olayları, zamanlarını ve gerekli kayıtları tutar. En erken olay imminent event’tir. Müşteri kuyruğu ile FEL aynı liste değildir.",
        ),
        S(
          "Zamana sıçra, olayı işle",
          "En erken olayı çıkar, saati o zamana ilerlet, state ve istatistikleri güncelle, yeni olayları planla.",
          "Saat4,FEL7/9/12 → saat7. Bu olay6 dakika hizmet başlatırsa t=13 bitişi eklenebilir.",
        ),
        S(
          "Sınır ve eşzaman kuralları",
          "Geçmişe olay planlama. Aynı anda geliş ve ayrılış varsa önceliği açık belirle. Son zaman veya belirli tamamlanma sayısı gibi stopping koşulunu çıktı ölçütünle uyumlu tanımla.",
        ),
      ],
      [
        [
          "FEL’in minimumu neyi seçer?",
          "Bir sonraki işlenecek olayın zamanını.",
        ],
        [
          "Aynı zamanlı olaylarda ne gerekir?",
          "Tutarlı ve açık bir öncelik/işleme kuralı.",
        ],
      ],
    ),
    L(
      "Modelleme bakışları ve listeler",
      "Aynı sistemi farklı yürütme bakışlarıyla tanı.",
      [9, 10, 11, 12, 13],
      [
        S(
          "Event scheduling ve process interaction",
          "İlki olay işleyicileri ve kronolojik takvim etrafında kurulur. İkincisi tek entity’nin geliş, hizmet, bekleme ve ayrılış yaşam döngüsünü izler. Aynı sistemi farklı biçimde ifade edebilirler.",
        ),
        S(
          "Activity scanning ve three-phase",
          "Activity scanning etkinliklerin başlama koşullarını tarar. Three-phase yaklaşımı A saat ilerletme, B zamanlı koşulsuz olaylar ve C koşullu aktiviteleri ayırır; koşullar yeni başlangıçlara göre yeniden değerlendirilebilir.",
        ),
        S(
          "Liste işlemleri ve performans",
          "FEL’de en erkeni bulma, ekleme ve çıkarma maliyeti önemlidir. FCFS müşteri kuyruğunun sıralama anahtarı farklıdır. Doğru veri yapısı hız kazandırır ama modelin davranış kurallarını değiştirmemelidir.",
        ),
      ],
      [
        [
          "Process interaction merkezinde ne var?",
          "Entity’nin sistem içindeki yaşam döngüsü.",
        ],
        [
          "Three-phase sırası?",
          "A: zaman, B: zamanlı olaylar, C: koşullu aktiviteler.",
        ],
      ],
    ),
  ],
  [
    L(
      "Olasılık, PMF ve CDF",
      "Sembolleri sıfırdan kur; olasılığın neyi ölçtüğünü anla.",
      [3, 4, 5],
      [
        S(
          "Rastgele değişken (random variable)",
          "X, rastgele deneyin sayısal sonucudur. Ayrık X sayılabilir değerler alır; sürekli T bir aralıktaki süreyi gösterebilir. P(X=x), belirtilen olayın olasılığıdır;0 ile1 arasındadır.",
        ),
        S(
          "PMF ile PDF farklıdır",
          "Ayrık p(x) tek değerin olasılığını verir ve toplamı1’dir. Sürekli f(x) yoğunluktur; olasılık alanla bulunur. Sürekli değişkende tek noktanın olasılığı0 olabilir; yoğunluk1’den büyük olabilir.",
        ),
        S(
          "CDF birikimli olasılıktır",
          "F(x)=P(X≤x). Sürekli dağılımda P(a<X≤b)=F(b)−F(a). Ayrık durumda alt uca dahil olma kuralı önemlidir.",
          "F(5)=0,8 veF(2)=0,3 ise sürekli X içinP(2<X≤5)=0,5.",
        ),
      ],
      [
        ["CDF neyi verir?", "F(x)=P(X≤x)."],
        [
          "Yoğunluk ile olasılık aynı mı?",
          "Hayır; sürekli olasılık yoğunluğun bir aralıktaki alanıdır.",
        ],
      ],
    ),
    L(
      "Beklenen değer, varyans ve birimler",
      "Ortalama ile tek gerçekleşmeyi; yayılma ile standart sapmayı ayır.",
      [6, 7],
      [
        S(
          "Beklenen değer E[X]",
          "Uzun dönem ağırlıklı ortalamadır. Ayrık durumdaΣx p(x);Σ toplama işaretidir. Beklenen değer destek içinde gözlenebilir bir değer olmak zorunda değildir.",
          "0 ve1 eşit olasılıklıysaE[X]=0,5; tek denemede0,5 gerçekleşmez.",
        ),
        S(
          "Varyans ve standart sapma",
          "Var(X)=E[X²]−(E[X])² yayılmayı ölçer. σ=√Var(X) standart sapmadır. X dakika ise varyans dakika², standart sapma dakika cinsindedir. E[X²] ile(E[X])² aynı değildir.",
        ),
        S(
          "Mode ve median",
          "Mode en yüksek olasılık/yoğunluğun olduğu değerdir. Median olasılığı iki tarafa yaklaşık bölen merkezdir. Çarpık dağılımlarda mean, median ve mode farklı olabilir; her birini aynı şey sayma.",
        ),
      ],
      [
        ["Varyansın birimi?", "X’in biriminin karesi."],
        ["E[X²] ileE[X]² aynı mı?", "Genellikle hayır; farkları varyanstır."],
      ],
    ),
    L(
      "Ayrık dağılımlar",
      "Deneme, başarı ve sabit aralıkta olay sayısını ayır.",
      [11, 12, 13],
      [
        S(
          "Bernoulli ve binomial",
          "Bernoulli tek0/1 başarıdır, başarı olasılığıp. Binomial bağımsız ve aynıp’li n denemede başarı sayısıdır: P(X=k)=C(n,k)p^k(1−p)^(n−k), E=np, Var=np(1−p).",
        ),
        S(
          "Geometric ve negative binomial",
          "İlk başarıya kadarki deneme sayısı geometric ise destek1,2,…, E=1/p. İlk r başarıya kadarki toplam deneme sayısı negative binomial tanımında en az r deneme gerekir. Başarısızlık sayısı tanımı seçilirse destek ve ortalama kayar; sorunun tanımını oku.",
        ),
        S(
          "Poisson sayımı",
          "Sabit aralıktaki olay sayısı içina=λt, P(N=k)=e^(−a)a^k/k!, E[N]=Var(N)=a. λ birim zamandaki hız; a o ufuktaki beklenen sayıdır.",
          "λ=3/saat,t=2 saat → a=6. Tam6 geliş zorunlu değildir.",
        ),
      ],
      [
        [
          "Binomial hangi soruyu cevaplar?",
          "Sabit n bağımsız denemede kaç başarı?",
        ],
        [
          "Poisson’daλ ileλt farkı?",
          "λ hız;λt belirli ufuktaki beklenen sayıdır.",
        ],
      ],
    ),
    L(
      "Sürekli dağılımlar ve parametreler",
      "Uniform, üstel, normal ve pozitif çarpık dağılımları tanı.",
      [15, 16, 17, 18, 19],
      [
        S(
          "Uniform ve exponential",
          "U(a,b): yoğunluk1/(b−a), E=(a+b)/2, Var=(b−a)²/12. Exponential hızλ: E=1/λ, Var=1/λ² ve P(T>t)=e^(−λt). Üstel belleksizlik özelliği taşır; bütün süre modelleri böyle değildir.",
        ),
        S(
          "Normal ve lognormal",
          "N(μ,σ²) gösteriminde ikinci sayı varyanstır. Standardize z=(x−μ)/σ. Lognormal X içinlnX normaldir veX>0; E[X]=exp(μ+σ²/2). μ burada logaritmik ölçektedir.",
          "N(12,4) → σ=2. x=10 içinz=−1.",
        ),
        S(
          "Gamma, Weibull, triangular ve beta",
          "Gamma pozitif süreleri ve üstel toplamlarını; Weibull değişen hazard/ömür davranışını modelleyebilir. Burada Weibull F(x)=1−exp(−(x/α)^β), α ölçek, β şekildir. Triangular min/en olası/max bilgisiyle; beta sınırlı aralıkta esnek şekille kullanılır. Aday seçiminde fiziksel destek ve veri birlikte incelenir.",
        ),
      ],
      [
        [
          "N(μ,σ²)’de z nasıl hesaplanır?",
          "(x−μ)/σ; varyansa doğrudan bölünmez.",
        ],
        [
          "Lognormal parametreleri hangi ölçekte?",
          "ln(X)’in normal dağılımındaki μ veσ ölçeğinde.",
        ],
      ],
    ),
    L(
      "Poisson süreçleri ve empirik modeller",
      "Aralık sayımı, gelişler arası süre ve akış dönüşümlerini bağla.",
      [20, 21, 22],
      [
        S(
          "Poisson süreci sayımları biriktirir",
          "N(t),[0,t] aralığındaki geliş sayısıdır. Homojen süreçte durağan ve bağımsız artışlar vardır; N(t)~Poisson(λt). Gelişler arası süreler bağımsızExponential(λ) olarak modellenir. Bir aralıkta0 geliş önceki müşterileri silmez.",
        ),
        S(
          "Splitting ve pooling",
          "Bağımsız p olasılığıyla işaretlenen alt akışın hızıλp olur. Bağımsız Poisson akışları birleşirse hızları toplanır. Bağımsızlık koşullarını göz ardı ederek bu kuralları her akışa uygulama.",
          "10/saat akışının%30’uA iseA hızı3/saat.",
        ),
        S(
          "Empirik dağılım",
          "Kuramsal bir aile uygun değilse gözlemlerin frekansları veya sıralı değerleriyle empirik model kurulabilir. Veri aralığı dışında davranış otomatik öğrenilmiş olmaz; örnekleme ve kuyruk davranışı kapsamı değerlendirilir.",
        ),
      ],
      [
        [
          "Poisson sayımı ile üstel süre bağlantısı?",
          "Aynı homojen süreçte sayım Poisson, ardışık geliş arası süre üstel olabilir.",
        ],
        [
          "Pooling için hangi temel koşul önemli?",
          "Birleştirilen Poisson akışlarının bağımsızlığı.",
        ],
      ],
    ),
  ],
  [
    L(
      "Kuyruğun yapısını oku",
      "Müşteri davranışı, kapasite, disiplin ve notasyonu ayır.",
      [3, 4, 5, 6, 7, 8],
      [
        S(
          "Model bileşenleri",
          "Calling population potansiyel müşteri kaynağı; kapasite içeride izin verilen toplam sayıdır. Kuyruk disiplini hizmet sırasını belirler. Sonlu kaynakta dışarıda kalan müşteri sayısı geliş hızını etkileyebilir.",
        ),
        S(
          "Balk, renege, jockey",
          "Balking kuyruğa hiç girmemek; reneging girdikten sonra vazgeçmek; jockeying kuyruk değiştirmektir. FCFS geliş sırasına göre hizmettir; davranış türü değil disiplindir.",
        ),
        S(
          "Kendall gösterimi",
          "A/B/c/N/K: gelişler arası dağılım, hizmet dağılımı, sunucu sayısı, sistem kapasitesi, kaynak büyüklüğü. M Markovian/üstel, D sabit, G genel dağılımı belirtir.",
          "M/M/2: Poisson gelişler, üstel hizmetler,2 sunucu; atlanan kapasite/kaynak varsayımları ayrıca belirtilir.",
        ),
      ],
      [
        [
          "Reneging ile balking farkı?",
          "Reneging kuyruğa girdikten sonra; balking hiç katılmadan ayrılmaktır.",
        ],
        ["c neyi gösterir?", "Paralel sunucu sayısını."],
      ],
    ),
    L(
      "Little yasası ve kullanım",
      "Sayı, süre ve hız arasındaki birimleri kur.",
      [9, 10, 11, 12, 13, 14],
      [
        S(
          "Dört ana ölçü",
          "L sistemdeki, Lq kuyruktaki ortalama sayıdır. W toplam kalış, Wq kuyruk bekleme süresidir. λ etkin giriş hızı, μ sunucu başına hizmet hızıdır; E[S]=1/μ.",
        ),
        S(
          "Little yasası",
          "Uyumlu kararlı ölçülerdeL=λW veLq=λWq. Aynı sınır ve kabul edilen akış kullanılmalıdır. Bloklanan gelişler varsa dış teklif hızı ile etkin giriş hızı ayrılabilir.",
          "λ=5/saat,W=0,4 saat → L=2 müşteri.",
        ),
        S(
          "Kullanım ve kararlılık",
          "Tek sunucudaρ=λ/μ, c özdeş sunucudaρ=λ/(cμ). Standart sonsuz kuyruktaρ<1 kararlılık için gereklidir. Kararlı olmak hiç beklememek anlamına gelmez. λ veμ aynı zaman biriminde olmalıdır.",
        ),
      ],
      [
        ["μ ile ortalama hizmet süresi ilişkisi?", "μ=1/E[S]."],
        ["L=λW’de birimler nasıl?", "1/zaman × zaman = müşteri sayısı."],
      ],
    ),
    L(
      "M/M/1 ve M/G/1 hesabı",
      "Önce varsayımı, sonra formülü seç.",
      [16, 17, 18, 19, 20, 21],
      [
        S(
          "M/M/1 dengesi",
          "Poisson geliş, bağımsız üstel hizmet, tek sunucu veλ<μ altındaρ=λ/μ, P0=1−ρ, L=ρ/(1−ρ), Lq=ρ²/(1−ρ). W=1/(μ−λ), Wq=W−1/μ.",
          "λ=6,μ=10/saat → W=0,25 saat=15 dakika.",
        ),
        S(
          "M/G/1 ve ikinci moment",
          "Genel hizmetteE[S²]=Var(S)+E[S]². Pollaczek–Khinchine: Wq=λE[S²]/(2(1−ρ)), Lq=λWq. Bu formül standart Poisson/tek sunucu/FCFS bağımsız hizmet varsayımlarıyla kullanılır.",
        ),
        S(
          "Değişkenlik ve yüksek yük",
          "λ ve ortalama hizmet aynı olsa da hizmet varyansı arttığında M/G/1 beklemesi artar. ρ1’e yaklaşırken bekleme hızla büyüyebilir. Negatif sonuç veren kararsız hesap fiziksel bir bekleme değildir; geçersiz formül uygulamasıdır.",
        ),
      ],
      [
        ["M/G/1’deE[S²] nasıl bulunur?", "Var(S)+(E[S])²."],
        [
          "ρ≥1 iken standart sonsuz kuyruk dengesi?",
          "Sonlu kararlı ortalama bekleme formülleri uygulanamaz.",
        ],
      ],
    ),
    L(
      "Çoklu sunucu, sonlu kaynak ve ağlar",
      "Merkezler arası yükü ve kapasiteyi takip et.",
      [22, 23, 24, 25, 26],
      [
        S(
          "M/M/c ve kapasite",
          "c sunucunun her biriμ hızındaysa toplam kapasitecμ’dir. ρ=λ/(cμ). M/M/c bekleme olasılıkları M/M/1 formülüne yalnızμ yerinecμ yazarak genelde bulunmaz; çoklu sunucu yapısı ayrıca hesaba katılır.",
        ),
        S(
          "Sonlu kaynak ve kapasite",
          "Sonlu kaynakta sistemde hizmet isteyenlerin artması yeni arıza/geliş üretebilecek kaynak sayısını azaltabilir. Sonlu kapasitede dolu sisteme gelen müşteri reddedilebilir; kayıp oranı ve etkin hız incelenir.",
        ),
        S(
          "Kuyruk ağları",
          "Merkezj içinλj=aj+Σiλi pij. aj dış giriş; pij i merkezindenj’ye yönlenme olasılığıdır. Tüm merkezlerin yükü ve kararlılığı incelenir.",
          "B’ye4/saat dış, A’dan10/saat çıkışın%30’u → λB=7/saat.",
        ),
      ],
      [
        [
          "Ağda bir merkezin toplam girişi?",
          "Dış giriş + diğer merkezlerden yönlenen akışlar.",
        ],
        [
          "M/M/c, M/M/1’deμ’yücμ yapmak mı?",
          "Hayır; kullanım hesabı böyle yazılsa da bekleme olasılıkları çoklu sunucu yapısına bağlıdır.",
        ],
      ],
    ),
  ],
  [
    L(
      "Pseudo-random sayı ve seed",
      "Tekrarlanabilirliğin neden yararlı olduğunu anla.",
      [3, 4, 5, 10],
      [
        S(
          "Hedef özellikler",
          "Simülasyonda temel sayılar genellikleU(0,1)’e benzer uniform ve bağımsız davranış göstermelidir. İdeal ortalama1/2,varyans1/12’dir. Düzgün histogram bağımsızlığı tek başına sağlamaz.",
        ),
        S(
          "Seed ve periyot",
          "Pseudo-random üreteç deterministik bir algoritmadır. Seed başlangıç durumudur; aynı plan aynı diziyi yeniden verir. Periyot dizinin tekrar döngüsüdür; deney ihtiyacına göre yeterince uzun olmalıdır.",
        ),
        S(
          "Stream planı",
          "Replikasyonlar ve farklı girdi süreçleri için uygun stream/substream planı kullanılır. Herhangi iki farklı seed’in bağımsız dizi garantisi verdiği varsayılmaz. Üreteç, parametre ve atamalar kaydedilir.",
        ),
      ],
      [
        ["İdealU(0,1)’in ortalama ve varyansı?", "1/2 ve1/12."],
        [
          "Seed neden kaydedilir?",
          "Deneyi aynı başlangıç ve sayı dizisiyle yeniden üretmek için.",
        ],
      ],
    ),
    L(
      "LCG’yi adım adım hesapla",
      "Mod, durum ve uniform ölçeklemeyi ayır.",
      [6, 7, 8, 9],
      [
        S(
          "Doğrusal eşlenik bağıntı",
          "X(i+1)=(aXi+c) modm. a çarpan,c artış,m modül,X0 seed’dir. mod bölme kalanı verir; X durumları0…m−1 aralığındadır.",
        ),
        S(
          "Her adımdan sonra mod al",
          "a=5,c=1,m=16,X0=0 içinX1=1,X2=6,X3=15. SonraR=X/m ile ölçeklenir. R’nin sıfır olabildiği dönüşümlerde logaritma gibi uç durumlar dikkat ister.",
        ),
        S(
          "Kalite sadece formülde değil",
          "Parametreler periyodu ve örüntüleri etkiler. Çok kısa döngü veya kötü çok-boyutlu yapı simülasyonu bozabilir. Birleşik üreteçler daha uzun periyot hedefleyebilir; rastgele parametre seçmek kaliteyi garanti etmez.",
        ),
      ],
      [
        ["mod işlemi nedir?", "Bölmeden kalan değeri verir."],
        [
          "LCG durumu uniform aralığa nasıl ölçeklenir?",
          "R=X/m ile; uç nokta davranışı kullanılan üretece bağlıdır.",
        ],
      ],
    ),
    L(
      "Uniformluk ve bağımsızlık testleri",
      "Test istatistiğini kararın sınırlarıyla yorumla.",
      [11, 12, 13, 14, 19, 21, 22],
      [
        S(
          "K-S ve ki-kare",
          "K-S sıralı sayılar ile uniformCDF farkını ölçer: D+=max(i/N−U(i)),D−=max(U(i)−(i−1)/N). Ki-kareΣ(Oi−Ei)²/Ei kullanır; uniform eşit sınıflardaEi=N/k.",
        ),
        S(
          "Otokorelasyon",
          "Lag, karşılaştırılan değerlerin sıra uzaklığıdır. Pozitif ilişki benzer büyüklükleri, negatif ilişki yüksek/düşük dönüşümünü teşvik edebilir. Korelasyonun bulunmaması her tür bağımlılığın yokluğunu kanıtlamaz.",
        ),
        S(
          "Ret ve reddetmeme",
          "H0’ı reddetmemek üretecin kusursuz olduğunu kanıtlamaz. Küçük örneklem bazı sapmaları kaçırır. Çok sayıda test yanlış alarmı artırır.",
          "10 bağımsız doğruH0,α=0,05 → en az bir yanlış ret1−0,95^10≈0,4013.",
        ),
      ],
      [
        ["D− içinde hangi sıra kullanılır?", "(i−1)/N."],
        [
          "Uniformluk testi bağımsızlığı kanıtlar mı?",
          "Hayır; farklı özellikleri sınarlar.",
        ],
      ],
    ),
  ],
  [
    L(
      "Inverse transform",
      "CDF’nin tersini kullanarak hedef örneği üret.",
      [3, 4, 5, 8],
      [
        S(
          "CDF’yi geri çöz",
          "U~U(0,1) üret, F(X)=U eşitliğini çöz: X=F⁻¹(U). F⁻¹ fonksiyonun tersidir,1/F değildir. Ayrık durumda kümülatif aralıktan sonuç seçilir.",
        ),
        S(
          "Uniform ve üstel örnek",
          "Uniform(a,b):X=a+(b−a)U. Üstel hızλ:X=−ln(1−U)/λ. −lnU/λ aynı dağılımı verir ama aynı sabitU için genelde aynı sayıyı vermez.",
          "λ=2,U=0,5 → X=0,3466 saat.",
        ),
        S(
          "Birim ve uç değer",
          "Logaritmanın argümanı pozitif olmalı. MatematikteU açık aralıkta alınır; sayısal üreteç uçları için uygun koruma gerekir. Hız1/saat ise üstel sonuç saat cinsindedir.",
        ),
      ],
      [
        ["F⁻¹ ne demek?", "F(X)=U eşitliğini X için geri çözmek."],
        [
          "Üstel dönüşümde birim nereden gelir?",
          "Hız parametresinin tersinden.",
        ],
      ],
    ),
    L(
      "Empirik dönüşüm ve acceptance-rejection",
      "Kapalı ters bulunmadığında başka yolları tanı.",
      [6, 7, 9, 10, 11, 12],
      [
        S(
          "Empirik CDF parçası",
          "İki nokta(c0,x0),(c1,x1) arasındaysa X=x0+(x1−x0)(U−c0)/(c1−c0). Gözlem olasılık ekseninde hangi parçaya düşüyorsa o parçada interpolasyon yapılır.",
        ),
        S(
          "Aday üret, kabul veya reddet",
          "Acceptance-rejection uygun aday dağılımından örnek üretir ve hedefe göre bir olasılıkla kabul eder. Reddedilen aday çıktı listesine sıfır diye yazılmaz; yeni aday denenir.",
        ),
        S(
          "Verimlilik",
          "Her bağımsız aday p olasılıkla kabul ediliyorsa bir kabul için beklenen aday sayısı1/p’dir. Kötü bir aday zarfı çok reddetme yaratır; doğru ama verimsiz olabilir.",
          "p=0,25 → ortalama4 aday; her çıktıda kesin4 değildir.",
        ),
      ],
      [
        ["Reddedilen aday ne olur?", "Atılır; hedef örnek diye kaydedilmez."],
        ["Kabul olasılığıp ise beklenen deneme?", "1/p."],
      ],
    ),
    L(
      "Thinning, normal ve lognormal",
      "Zamana bağlı akışı ve özel dönüşümleri bağla.",
      [12, 13, 14, 15],
      [
        S(
          "Non-stationary Poisson thinning",
          "Tüm ilgili zamandaλ*≥λ(t) üst hızı seç. Exp(λ*) aday aralığı üretip saati ilerlet. Adayıλ(t)/λ* olasılığıyla kabul et. Ret olursa saat geri alınmaz.",
        ),
        S(
          "Box–Muller ve normal ölçek",
          "Bağımsız uniformR1,R2 ileZ1=√(−2lnR1)cos(2πR2),Z2=√(−2lnR1)sin(2πR2). Bunlar standart normal örneklerdir. Hedef normal içinX=μ+σZ; varyansσ²’yi doğrudan çarpma.",
        ),
        S(
          "Lognormal ve diğer özellikler",
          "Y normal iseexp(Y) lognormal üretir. Dağılımların toplam ve dönüşüm özellikleri başka üreteçler kurabilir. Kullanılanμ,σ’nin log ölçekte mi özgün ölçekte mi olduğunu açıkça belirt.",
        ),
      ],
      [
        ["Thinning kabul olasılığı?", "λ(t)/λ*."],
        ["Normalden lognormal üretimi?", "Normal örneğin üssünü al: X=exp(Y)."],
      ],
    ),
  ],
  [
    L(
      "Veriden aday dağılıma",
      "Veri toplama bağlamı ve fiziksel destekle başla.",
      [2, 3, 4, 6, 7, 8, 9],
      [
        S(
          "Neyi ölçtüğünü tanımla",
          "Geliş sayısı mı, aralarındaki süre mi, hizmet mi? Birim, örnekleme saati, yoğunluk dönemi ve veri hatalarını kaydet. Karışık dönemler tek dağılımı yanıltabilir.",
        ),
        S(
          "Histogram ve Q-Q",
          "Histogram ampirik şekli gösterir; sınıf sayısı görünümü etkiler. Q-Q sıralı verileri teorik quantile’larla karşılaştırır. Yaklaşık doğrusallık bir tanıdır; kesin uyum veya bağımsızlık kanıtı değildir.",
        ),
        S(
          "Fiziksel gerekçe",
          "Sabit deneme başarıları binomial, aralık sayımı Poisson, sınırlı min/en olası/max bilgisi triangular adayını düşündürebilir. Gerçek negatif olamayan bir süre için negatif değer üreten modeli sadece iyi p-değeriyle seçme.",
        ),
      ],
      [
        [
          "Girdi modelleme ilk adımı?",
          "Değişkeni ve bağlamı tanımlayıp uygun veri toplamak.",
        ],
        [
          "Histogram tek başına yeterli mi?",
          "Hayır; fiziksel gerekçe, parametre, uyum ve bağımlılık da incelenir.",
        ],
      ],
    ),
    L(
      "Parametre tahmini ve uyum testi",
      "Örneklem ortalaması, varyans ve test kararını ayır.",
      [9, 10, 12, 13, 14, 15, 16, 17, 18],
      [
        S(
          "Tahmin edici (estimator)",
          "X̄=ΣXi/n; S²=Σ(Xi−X̄)²/(n−1). Parametre bilinmeyen sabit, tahmin edici örneklemle değişen istatistiktir. Gruplu veride orta nokta kullanımı yaklaşık sonuç verir.",
        ),
        S(
          "Ki-kare ve serbestlik",
          "Ei=npi, istatistikΣ(Oi−Ei)²/Ei. Standart parametrik uyumda son sınıf sayısık ve tahmin edilen parametre sayısıs ise df=k−1−s. Küçük beklenen frekanslar ve gruplama sonuçları etkiler.",
        ),
        S(
          "p-değeri ve K-S uyarısı",
          "p>α yalnız yeterli ret kanıtı olmadığını söyler; dağılımın doğru olma olasılığı değildir. Parametreleri aynı veriden tahmin edilen dağılım için standart sabit-parametre K-S kritiklerini sorgusuz kullanma; uygun kalibrasyon gerekir.",
        ),
      ],
      [
        [
          "Örneklem varyansının paydası?",
          "n−1; bu bölümdeki standart örneklem varyansı tanımı.",
        ],
        [
          "p>α ne demek?",
          "Bu testte H0 reddedilmez; kesin doğruluk kanıtı değildir.",
        ],
      ],
    ),
    L(
      "Zamana bağlı ve ilişkili girdiler",
      "Bağımlılığı kaybetmeden modelle.",
      [19, 20, 21, 22, 23, 24],
      [
        S(
          "Döneme göre hız",
          "Her zaman aralığında günlerdeki toplam geliş/toplam gözlem süresi hız tahminidir. Aynı yarım saatte12,18,15 geliş üç günde görülürse45/(3×0,5)=30/saat bulunur.",
        ),
        S(
          "Kovaryans ve korelasyon",
          "corr(X,Y)=cov(X,Y)/(σXσY). Korelasyon−1 ile1 arasındadır ve doğrusal ilişkiyi ölçer. Sıfır korelasyon genel durumda bağımsızlık değildir. İlişkili girdileri bağımsız üretmek çıktıyı değiştirebilir.",
        ),
        S(
          "AR(1)",
          "Xt=μ+φ(Xt−1−μ)+εt. Uygun bağımsız yenilikler ve|φ|<1 altında durağan varyansσe²/(1−φ²), lag-h korelasyonuφ^h olur. Süreç varyansı ile yenilik varyansı aynı şey değildir.",
        ),
      ],
      [
        [
          "Parça bazlı hız tahmini?",
          "O parçadaki toplam geliş / toplam gözlem süresi.",
        ],
        [
          "AR(1)’de durağanlık için temel koşul?",
          "Standart modelde |φ|<1 ve uygun başlangıç/yenilik koşulları.",
        ],
      ],
    ),
  ],
  [
    L(
      "Verification araçları",
      "Kod ve model arasındaki tutarlılığı incele.",
      [2, 4, 5, 6],
      [
        S(
          "Modeli doğru uygulama",
          "Verification kodun kavramsal kuralları izleyip izlemediğini sorgular. Bir çıktı ortalamasının tutması bütün kodun doğru olduğu anlamına gelmez.",
        ),
        S(
          "Trace ve uç durumlar",
          "Az müşterili elle çözülen örnek, olay izi, boş sistem, sıfır geliş gibi durumlar hesapları görünür yapar. Sunucu dolulukları ve kuyruk sayaçları birlikte izlenir.",
        ),
        S(
          "Korunum denklemleri",
          "Başlangıç + giren − çıkan = içeride kalan gibi denklemler mantık kontrolü sağlar. Boş kuyruktan müşteri çıkarma, negatif stok veya geçmişe olay planlama gibi çelişkiler araştırılır.",
        ),
      ],
      [
        [
          "Trace ne işe yarar?",
          "Olay ve state değişimlerini adım adım izleyerek mantık hatası bulmaya.",
        ],
        [
          "Giren100,çıkan80,başlangıç0 ise kalan?",
          "20; modelin kapsamındaki kayıp/transferler de varsa ayrıca sayılmalıdır.",
        ],
      ],
    ),
    L(
      "Validation ve calibration",
      "Amaç için yeterliliği verilerle değerlendir.",
      [7, 8, 9, 10, 11, 12, 18, 19],
      [
        S(
          "Geçerlilik kapsamı",
          "Validation bütün zamanlar ve bütün kararlar için sınırsız onay değildir. Hangi performans, koşul ve tolerans için yeterli temsil arandığı belirtilir. Yoğun saat kararı sakin saat uyumuyla kanıtlanmaz.",
        ),
        S(
          "Calibration ayarlamadır",
          "Model parametrelerini gerçek davranışa yaklaştırmak için güncelleriz. Aynı veriye aşırı uyum riski vardır; mümkünse farklı veri veya koşulla da kontrol et. Daha çok ayrıntı her zaman maliyetine değmez.",
        ),
        S(
          "Gerçek veri ve uzman",
          "Aynı dönemin girdileri/çıktılarıyla karşılaştırma, tarihsel girdilerle çalıştırma ve uzman Turing testi yardımcıdır. Rastgele modelin her müşteri süresini birebir taklit etmesi genellikle beklenmez; istatistiksel örüntü hedeflenir.",
        ),
      ],
      [
        [
          "Calibration nedir?",
          "Model ayarlarını gözlenen gerçek davranışa göre güncelleme süreci.",
        ],
        [
          "Validation bütün koşulları kapsar mı?",
          "Hayır; amaç, ölçüt, veri ve kullanım alanıyla sınırlıdır.",
        ],
      ],
    ),
    L(
      "Test, hata türü ve tolerans",
      "Eşitlik ile yeterince yakın olmayı aynı sanma.",
      [12, 13, 14, 15, 16, 17, 18],
      [
        S(
          "t testi ve standart hata",
          "Bağımsız replikasyon özetleri içinSE=S/√n, t0=(Ȳ−μ0)/SE. İki taraflı kararda|t0| kritik değerle kıyaslanır. Normal teori ve bağımsızlık varsayımları değerlendirilir.",
        ),
        S(
          "Type I / Type II",
          "DoğruH0’ı reddetmek Type I; yanlışH0’ı reddetmemek Type II’dir. Reddetmemek, eşitliğin veya model doğruluğunun kanıtı değildir. Örneklem büyüklüğü ve test gücü önemlidir.",
        ),
        S(
          "Yakınlık bandı",
          "Kabul edilebilir sapmaε ise model ortalaması aralığını[μ0−ε,μ0+ε] bandıyla kıyasla. TümCI bant içindeyse yakınlık lehine; tamamen dışındaysa aleyhine kanıt; kısmen örtüşüyorsa hassasiyet artırılabilir.",
          "μ0=10,ε=1,CI=[9,4;10,6] tamamen[9;11] içinde.",
        ),
      ],
      [
        ["Type I hata?", "Doğru H0’ı reddetmek."],
        [
          "Eşitlik reddedilmediğinde yakınlık kanıtlanır mı?",
          "Hayır; yeterince dar bir belirsizlik aralığıyla tolerans da değerlendirilmelidir.",
        ],
      ],
    ),
  ],
  [
    L(
      "Çıktı ve bağımsız gözlem birimi",
      "Tek koşunun müşterileri ile farklı koşuların özetlerini ayır.",
      [4, 5, 6, 7, 9, 10, 11],
      [
        S(
          "Terminating / steady-state",
          "Terminating deney belirli doğal bitişle sonlanır; günlük vardiya gibi. Steady-state hedef uzun dönem davranıştır. Uzun bir koşunun bulunması tek başına uzun dönem etkilerin doğru ölçüldüğünü garanti etmez.",
        ),
        S(
          "Aritmetik ve zaman ortalaması",
          "Müşteri beklemeleriΣWi/n ile; sürekli state’in ortalaması süre ağırlıklı alan/toplam zaman ile hesaplanır. Aynı state’i kaydettiğin her satıra eşit ağırlık vermek yanlış olabilir.",
        ),
        S(
          "Within / across replication",
          "Tek koşudaki müşteriler ortak state nedeniyle bağımlı olabilir. Bağımsız replikasyonların birer gün ortalaması farklı analiz birimidir. R harfi replikasyon sayısını gösteriyorsa müşteri sayısı gibi kullanılmaz.",
        ),
      ],
      [
        [
          "Sürekli state ortalaması nasıl?",
          "State-zaman eğrisinin alanı / gözlem süresi.",
        ],
        [
          "Tek koşudaki müşteriler bağımsız mı?",
          "Otomatik değil; kuyruk state’i aralarında ilişki yaratabilir.",
        ],
      ],
    ),
    L(
      "CI, PI ve hassasiyet",
      "Ortalama belirsizliği ile tek gelecekteki sonucu ayır.",
      [8, 11, 12, 13, 14, 15],
      [
        S(
          "Ortalama için güven aralığı",
          "Bağımsız uygun özetlerdeȲ±tS/√R. S standart sapma, SE=S/√R standart hata, H=tSE yarı genişliktir. Tam genişlik2H’dir. Kritik değer güven düzeyi ve serbestlik derecesine bağlıdır.",
        ),
        S(
          "CI ve PI anlamı",
          "CI hedef ortalamanın tahmin belirsizliğini; PI gelecek tek bir çıktının değişkenliğini de taşır. Çok replikasyon tahmin hatasını azaltabilir ama yeni günün doğal rastgeleliğini sıfırlamaz. %95CI müşterilerin%95’i aralıkta demek değildir.",
        ),
        S(
          "Hassasiyet planı ve quantile",
          "S ve kritik değer yaklaşık sabitkenH∝1/√R; H’yi yarıya indirmek yaklaşık4 kat koşu ister. Quantile hesaplarında sıra ve interpolasyon tanımını raporla; nearest-rank içink=ceil(np).",
        ),
      ],
      [
        ["Standart hata?", "Bağımsız R özetin ortalaması için S/√R."],
        [
          "H’yi yarıya indirmek yaklaşık kaç kat koşu?",
          "S ve kritik değer sabit yaklaşımında4 kat.",
        ],
      ],
    ),
    L(
      "Warm-up, replikasyon ve batch means",
      "Başlangıç yanlılığını ve otokorelasyonu ayrı ele al.",
      [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
      [
        S(
          "Initialization bias",
          "Boş/idle başlangıç uzun dönem davranışını geçici olarak düşük gösterebilir. Intelligent initialization, warm-up silme veya daha uzun koşu değerlendirilir. Aynı yanlı kısa koşuyu çok tekrarlamak yanlılığı kendiliğinden kaldırmaz.",
        ),
        S(
          "Bağımsız replikasyon özetleri",
          "Aynı warm-up ve ölçüm tanımıyla, uygun ayrı stream’lerle koşular yap. Her koşudan bir özet çıkarıp ortalama ve standart hatayı bu bağımsız özetlerde hesapla. Warm-up ve uzunluk seçimini gerekçelendir.",
        ),
        S(
          "Batch means ve bağımlılık",
          "Uzun koşunun warm-up sonrası verilerini gruplara ayır, grup ortalamalarını kullan. Büyük batch’ler kalan ilişkiyi azaltabilir; bağımsızlık otomatik değildir. Ham veriyi bağımsız saymak pozitif otokorelasyonda CI’yi aşırı dar gösterebilir.",
        ),
      ],
      [
        [
          "Daha çok koşu başlangıç bias’ını siler mi?",
          "Hayır; aynı başlangıç yanlılığını daha hassas biçimde tekrarlayabilir.",
        ],
        [
          "Batch means ne yapar?",
          "Uzun koşuyu gruplara bölüp grup ortalamalarıyla belirsizlik tahmini yapar.",
        ],
      ],
    ),
  ],
  [
    L(
      "Farkı tanımla ve örneklemeyi seç",
      "Karşılaştırmanın yönünü, birimini ve önemini kur.",
      [4, 6, 7, 8, 9],
      [
        S(
          "Ölçüt ve fark yönü",
          "θA−θB hangi sırada çıkarıldığını açıkça gösterir. Daha düşük bekleme iyi ise pozitif fark B lehinedir. Maliyet ve pratik olarak önemli en küçük fark baştan belirlenmelidir.",
        ),
        S(
          "Bağımsız örnekleme",
          "Tasarımlar arası bağımsız özetlerdeSE=√(S1²/R1+S2²/R2). Eşit varyans gerekçesi varsa pooled yaklaşım; yoksa uygun unequal-variance yöntem kullanılır. Formül seçimi varsayımdan sonra gelir.",
        ),
        S(
          "Anlamlılık ve eşdeğerlik",
          "CI’nin0’ı içermesi kesin eşdeğerlik kanıtı değildir; içermezse fark istatistiksel olarak ayrışabilir. Çok küçük kesin fark pratikte önemsiz olabilir. Etki büyüklüğü ve tolerans ayrıca raporlanır.",
        ),
      ],
      [
        [
          "PozitifA−B, bekleme küçültülüyorsa?",
          "A daha yüksek bekler; yön B lehinedir.",
        ],
        [
          "İstatistiksel anlamlılık yeterli mi?",
          "Hayır; farkın pratik önemi ve maliyeti de gerekir.",
        ],
      ],
    ),
    L(
      "CRN ve eşlenmiş farklar",
      "Aynı rastgele koşulları doğru amaçlara eşle.",
      [10, 11, 12, 13],
      [
        S(
          "Common Random Numbers",
          "Aynı replikasyonda tasarımlara senkron rastgele girdiler verilir. Amaç pozitif ilişkiyle fark varyansını azaltmaktır: Var(A−B)=Var(A)+Var(B)−2cov(A,B). Negatif kovaryans yararı tersine çevirebilir.",
        ),
        S(
          "Aynı seed tek başına yetmez",
          "Sayılar aynı entity, işlem ve girdi amacı için kullanılmalıdır. Model sırası ayrışınca aynı stream’in tüketimi farklı yerlere kayabilir. Farklı replikasyon çiftleri uygun bağımsız stream planıyla yürütülür.",
        ),
        S(
          "Eşlenmiş analiz",
          "Her çift içinDr=YrA−YrB bul. CI=D̄±t SD/√R, serbestlikR−1. SD farkların standart sapmasıdır. Tasarımların ayrı standart sapmalarını açıklamasız toplayarak paired analizi değiştirme.",
        ),
      ],
      [
        [
          "CRN’de SE hangi standart sapmadan?",
          "Eşlenmiş replikasyon farklarının SD değerinden.",
        ],
        [
          "Aynı seed yeterli mi?",
          "Hayır; rastgele sayıların aynı amaçlara senkron atanması gerekir.",
        ],
      ],
    ),
    L(
      "Çoklu karşılaştırma ve metamodel",
      "Karar ailesini, yaklaşımı ve arama sınırını raporla.",
      [14, 15, 16, 18, 19, 20, 21, 22, 23, 24],
      [
        S(
          "Bonferroni",
          "Aile hata bütçesiαE ve C karşılaştırma içinαj=αE/C. Tüm ikili karşılaştırmaK(K−1)/2; tek referansa karşıK−1’dir. Daha çok karşılaştırma bireysel aralıkları genellikle genişletir.",
        ),
        S(
          "Regresyon metamodeli",
          "E[Y|x]=β0+β1x yaklaşık yanıt modelidir. β0 kesişim,β1 eğim, ε açıklanmayan hatadır. Anlamlı eğim, doğrusal modelin her yerde yeterli veya ilişkinin nedensel olduğu anlamına gelmez.",
        ),
        S(
          "Simülasyonla optimizasyon",
          "Stochastic çıktılarda tek iyi koşu en iyi tasarım kanıtı değildir. Arama yöntemi, bütçe, belirsizlik ve doğrulama birlikte planlanır. Robust heuristic yöntemler pratikte yararlı olabilir ama genel küresel optimum garantisi vermez.",
        ),
      ],
      [
        ["Bonferroni’deαj?", "αE/C."],
        [
          "Heuristik arama küresel optimum garantiler mi?",
          "Genel olarak hayır; yöntem ve problem varsayımlarına bağlıdır.",
        ],
      ],
    ),
  ],
];
let checkLessonIndex = 0;
export const SIMULATION_UNITS = content.map((lessons, i) => {
  const chapter = i + 1,
    root = "sim-" + String(chapter).padStart(2, "0");
  return {
    id: root + "-unit",
    course: "simulation",
    topic: i,
    title: SIMULATION_SOURCES[i].title,
    desc: lessons.map((l) => l.title).join(" · "),
    ...slideSource(
      chapter,
      [...new Set(lessons.flatMap((l) => l.pages))].sort((a, b) => a - b),
    ),
    lessons: lessons.map((l, j) => {
      const id = root + "-lesson-" + (j + 1),
        { pages, cards, ...base } = l;
      const distractors = SIMULATION_DISTRACTORS[checkLessonIndex++];
      return {
        id,
        ...base,
        ...slideSource(chapter, pages),
        cards: cards.map(([front, back], k) => ({
          id: id + "-card-" + k,
          front,
          back,
        })),
        checks: cards.map(([front, back], k) => {
          const answer = (i + j + k) % 3,
            options = [...distractors[k]];
          options.splice(answer, 0, back);
          return {
            id: id + "-check-" + k,
            prompt: front,
            options,
            answer,
            explanation: back,
            source: slideSource(chapter, pages).source,
          };
        }),
      };
    }),
  };
});
