// Each pair belongs to one lesson's two flash-card concepts, not a later unit.
export const SIMULATION_DISTRACTORS = [
  [
    [
      "Entity bir özellik, attribute nesnenin kendisidir.",
      "İkisi de yalnız olay zamanını gösterir.",
    ],
    [
      "Gerçek sistemin her ayrıntısını kopyalamak zorundadır.",
      "Modelin amacı davranışla ilgilenmemektir.",
    ],
  ],
  [
    [
      "Evet, bütün stochastic modeller mutlaka dynamic olur.",
      "Dynamic olmak hiçbir zaman rastgelelik içermez.",
    ],
    [
      "Evet, saat yalnız tam sayılar alabilir.",
      "Hayır, DES’te olay zamanı tutulmaz.",
    ],
  ],
  [
    [
      "Gerçek sistemle amaç uyumunu; kod kuralları önemsizdir.",
      "Her alternatifin kesin optimum olup olmadığını.",
    ],
    [
      "Kodun derlenip derlenmediğini.",
      "Bütün rastgele sayıların eşit olup olmadığını.",
    ],
  ],
  [
    [
      "Her olasılığı ayrı ayrı ters çevirerek.",
      "Her olasılığı ilk sonuca eşitleyerek.",
    ],
    [
      "Evet, her uniform sayı doğrudan dakika değeridir.",
      "Evet, U her zaman müşteri sayısıdır.",
    ],
  ],
  [
    [
      "İlki mutlak saat, ikincisi iki gelişin süre farkıdır.",
      "İkisi her müşteride aynı sayıdır.",
    ],
    [
      "Evet, eski müşteriler o anda silinir.",
      "Evet, yeni geliş yoksa hizmet de olamaz.",
    ],
  ],
  [
    [
      "Bi=Ai+Ci−1; koşuldan bağımsız.",
      "Bi=min(Ai,Ci−1); sunucu dolu olsa da başlar.",
    ],
    ["W yalnız bekleme, Wq yalnız hizmettir.", "İkisi her durumda eşittir."],
  ],
  [
    [
      "İkisi de aynı anda olan sıfır süreli oluşumlardır.",
      "Activity anlık; event bütün hizmet süresidir.",
    ],
    [
      "Çünkü bütün delay süreleri baştan sabit0’dır.",
      "Çünkü simülasyon saati tutulmaz.",
    ],
  ],
  [
    [
      "Bir sonraki müşterinin alfabetik adını.",
      "En son gerçekleşmiş olayın zamanını.",
    ],
    [
      "İki olaydan biri açıklamasız silinmelidir.",
      "Öncelik kuralı hiç gerekmez.",
    ],
  ],
  [
    [
      "Sadece dağılım histogramı.",
      "Yalnız bütün olayların kaynak kodu boyutu.",
    ],
    [
      "Önce C koşulları, sonra A zamanı, en son B.",
      "Üç fazın hepsi aynı listeyi hiç işlemeden bekler.",
    ],
  ],
  [
    ["F(x)=P(X=x) her sürekli değişkende.", "F(x)=1/P(X≤x)."],
    [
      "Evet, yoğunluğun yüksekliği daima tek nokta olasılığıdır.",
      "Hayır, sürekli değişkende hiçbir aralık olasılığı bulunmaz.",
    ],
  ],
  [
    ["Her zaman X ile aynı birimdedir.", "Bütün varyanslar boyutsuzdur."],
    ["Evet, bütün dağılımlarda aynıdır.", "İkisinin toplamı daima0’dır."],
  ],
  [
    ["İlk başarıya kadar kaç deneme?", "Değişen zamanda kaç geliş?"],
    [
      "λ her aralıkta kesin geliş sayısı;λt hizmet süresidir.",
      "Aralarında fark yoktur, ikisi daima aynıdır.",
    ],
  ],
  [
    [
      "(x−μ)/σ²; ikinci parametreyi doğrudan kullan.",
      "(μ−x)σ; karekök gerekmez.",
    ],
    [
      "Doğrudan X’in aritmetik ortalaması ve varyansı.",
      "Her zaman uniform aralığın uçları.",
    ],
  ],
  [
    [
      "Aynı süreçte her ikisi de müşteri sayısıdır.",
      "Poisson sürekli süre, üstel ayrık sayımdır.",
    ],
    [
      "Sadece akışların aynı ismi taşıması.",
      "Akışların tek bir müşteriyi paylaşması zorunluluğu.",
    ],
  ],
  [
    [
      "Balking sıradayken; reneging katılmadan ayrılmaktır.",
      "İkisi de yalnız sunucu sayısıdır.",
    ],
    ["Toplam müşteri nüfusunu.", "Sistem kapasitesini."],
  ],
  [
    ["μ=E[S]; hız ve süre aynı sayıdır.", "μ=E[S]²; varyans yok sayılır."],
    ["Müşteri sayısı × zaman².", "Dakika + müşteri; birim uyumu gerekmez."],
  ],
  [
    ["Var(S)−(E[S])².", "Yalnız(E[S])²; varyans etkilemez."],
    [
      "Negatif W geçerli bir kararlı ortalamadır.",
      "Bütün müşteriler kesin sıfır bekler.",
    ],
  ],
  [
    ["Yalnız dış kaynak gelişleri.", "Sunucu sayısı−hizmet süresi."],
    [
      "Evet, bütün bekleme olasılıkları bu tek değişimle bulunur.",
      "Hayır, kullanım oranı bile hiçbir biçimde tanımlanamaz.",
    ],
  ],
  [
    ["1 ve1/2.", "0 ve1."],
    [
      "Diziyi her seferinde farklı yapması zorunlu olduğu için.",
      "Bütün sayıların eşit olduğunu kanıtlamak için.",
    ],
  ],
  [
    ["Bölümün kendisini verir.", "Sayının karekökünü verir."],
    [
      "R=m/X; sıfıra bölme dikkate alınmaz.",
      "R=X+m; her durumda uniform olur.",
    ],
  ],
  [
    ["i/N.", "N/i."],
    [
      "Evet, düzgün histogram tüm ilişkileri kanıtlar.",
      "Hayır, uniformluk testi yalnız modelin kodunu derler.",
    ],
  ],
  [
    [
      "1/F(U), yani sayısal karşılığın tersi.",
      "F’nin bütün değerlerini U ile toplamak.",
    ],
    [
      "Doğrudan uniform sayının dakika olmasından.",
      "Her zaman standart sapmanın karesinden.",
    ],
  ],
  [
    [
      "Sıfır değerli hedef örnek diye kaydedilir.",
      "Önceki çıktının üzerine zorla yazılır.",
    ],
    ["p.", "1−p."],
  ],
  [
    ["λ*/λ(t),1’i aşsa da geçerlidir.", "λ(t)+λ*, birim gerekmez."],
    ["Logaritmasını al; X=ln(Y).", "Normal örneği karesine böl."],
  ],
  [
    [
      "En yüksek p-değerini seçip sonra veri uydurmak.",
      "Önce çıktı puanını sabitlemek.",
    ],
    [
      "Evet; histogram benziyorsa diğer bütün varsayımlar doğrudur.",
      "Hayır; histogram tek başına her durumda hiç bilgi vermez.",
    ],
  ],
  [
    [
      "n; bu sorudaki standart örneklem varyansı tanımıdır.",
      "√n; çünkü standart hatadır.",
    ],
    ["H0 kesin doğrudur.", "Dağılımın doğru olma olasılığı p’dir."],
  ],
  [
    ["Toplam geliş × toplam süre.", "Gün sayısı / geliş sayısı."],
    [
      "φ mutlaka1’den büyük olmalı.",
      "Yenilik varyansı her zaman süreç varyansına eşit olmalı.",
    ],
  ],
  [
    [
      "Bütün olasılıkları aynı sayıya çevirmeye.",
      "Her modelin gerçek sistemi kusursuz taklit ettiğini kanıtlamaya.",
    ],
    [
      "80; çıkan sayısı içeride kalandır.",
      "100; ayrılanlar asla state’i değiştirmez.",
    ],
  ],
  [
    [
      "Rastgele sayıları hiçbir amaç olmadan değiştirmek.",
      "Kodun derlenme süresini ölçmek.",
    ],
    [
      "Evet, tek ortalama tuttuğunda her koşul geçerlidir.",
      "Hayır, hiçbir model herhangi bir amaç için değerlendirilemez.",
    ],
  ],
  [
    ["Yanlış H0’ı reddetmemek.", "Doğru H0’ı reddetmemek."],
    [
      "Evet, ret yoksa fark her zaman0’dır.",
      "Evet, her CI zorunlu olarak tolerans bandının içindedir.",
    ],
  ],
  [
    [
      "State değerlerini sürelerine bakmadan sıradan ortalamak.",
      "En son state değerini toplam süreyle çarpmak.",
    ],
    [
      "Evet, aynı koşudaki bütün müşteriler bağımsızdır.",
      "Hayır, farklı koşuların uygun planla bağımsız olması da imkânsızdır.",
    ],
  ],
  [
    ["S/R; karekök kullanılmaz.", "S√R; daha çok koşu hatayı büyütür."],
    ["2 kat.", "Yarıya düşürmek yeterlidir."],
  ],
  [
    [
      "Evet, aynı yanlı koşuyu çoğaltınca bias tam0 olur.",
      "Evet, yeni seed yapısal model hatalarını kesin giderir.",
    ],
    [
      "Bütün veriyi tek en küçük değere dönüştürür.",
      "Ham gözlemlerin her birini otomatik bağımsız ilan eder.",
    ],
  ],
  [
    [
      "A daha düşük bekler; yön A lehinedir.",
      "İki tasarım mutlaka aynı bekler.",
    ],
    [
      "Evet, uygulama maliyeti her zaman önemsizdir.",
      "Hayır, ama yalnız hangi tasarımın adı uzun olduğuna bakılır.",
    ],
  ],
  [
    [
      "Tasarımların standart sapmalarını açıklamasız toplayarak.",
      "Bütün bireysel müşterilerin ortalama servis süresinden.",
    ],
    [
      "Evet, sayıların hangi amaçla tüketildiği önemsizdir.",
      "Hayır, CRN’de hiçbir ortak girdi kullanılmaz.",
    ],
  ],
  [
    ["αE×C.", "C/αE."],
    [
      "Evet, bütün heuristikler her problemde küresel optimum bulur.",
      "Evet, tek bir iyi koşu her tasarımı kanıtlar.",
    ],
  ],
];
