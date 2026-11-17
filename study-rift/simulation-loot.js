import { SIMULATION_SOURCES, slideSource } from "./simulation-sources.js";
const sheets = [
  [
    "Model Kurucunun Pusulası",
    "rare",
    [
      [
        "Bileşenler",
        "Entity: nesne. Attribute: nesnenin özelliği. State: anlık sistem durumu. Event: belirli andaki oluşum.",
      ],
      [
        "Sınıflandırma",
        "Zaman: static/dynamic. Rastgelelik: deterministic/stochastic. State değişimi: discrete-event/continuous. Bunlar ayrı eksenlerdir.",
      ],
      [
        "Kontrol",
        "Verification: modeli doğru uyguladık mı? Validation: amaç için doğru modeli mi kurduk? Model çalıştırmak otomatik optimizasyon değildir.",
      ],
    ],
  ],
  [
    "Elle Simülasyon Cetveli",
    "rare",
    [
      [
        "Geliş",
        "Ai=Ai−1+IAi. Interarrival bir süre, arrival mutlak saattir. İlk geliş koşulunu açıkça belirle.",
      ],
      [
        "Tek sunucu FCFS",
        "Bi=max(Ai,Ci−1); Ci=Bi+Si; Wqi=Bi−Ai; Wi=Ci−Ai=Wqi+Si.",
      ],
      [
        "Ölçüm",
        "Ortalama bekleme=ΣWqi/n; sıfırlar dahil. Kullanım=ufuk içindeki meşgul süre/ufuk. Hizmet ufuk dışına taşarsa yalnız kesişen zamanı say.",
      ],
    ],
  ],
  [
    "Olay Takviminin Mührü",
    "rare",
    [
      [
        "FEL döngüsü",
        "En erken olayı seç → saati ilerlet → state/istatistikleri güncelle → yeni olayları planla. Geçmişe olay planlama.",
      ],
      [
        "Süre kavramları",
        "Activity süresi başladığında belirlenebilir. Delay, koşula bağlı bekleme olabilir. Event bir an, state o andaki durumdur.",
      ],
      [
        "Bakışlar",
        "Event scheduling: olaylar. Process interaction: entity yaşam döngüsü. Three-phase: A zaman, B zamanlı olaylar, C koşullu aktiviteler.",
      ],
    ],
  ],
  [
    "Dağılımlar Atlası",
    "epic",
    [
      [
        "Temeller",
        "F(x)=P(X≤x). Sürekli aralık olasılığıF(b)−F(a). E[X]=Σxp(x). Var(X)=E[X²]−E[X]²;σ=√Var(X). Yoğunluk tek nokta olasılığı değildir.",
      ],
      [
        "Ayrık",
        "Bernoulli:E=p,Var=p(1−p). Binomial:E=np,Var=np(1−p). Geometric ilk başarıya kadarki deneme sayısı:E=1/p. Poisson(a):P(k)=e^(−a)a^k/k!,E=Var=a=λt.",
      ],
      [
        "Sürekli",
        "Uniform(a,b):E=(a+b)/2,Var=(b−a)²/12. Exp hızλ:E=1/λ,Var=1/λ²,P(T>t)=e^(−λt). NormalN(μ,σ²):z=(x−μ)/σ.",
      ],
      [
        "Pozitif dağılımlar",
        "Lognormal lnX~N(μ,σ²):E[X]=exp(μ+σ²/2). Weibull buradaF=1−exp(−(x/α)^β),α ölçek,β şekil. Parametre adlarını başka kaynakların tanımıyla karıştırma.",
      ],
      [
        "Akış",
        "Bağımsız Poisson pooling: hızları topla. Bağımsız p işaretlemesiyle splitting:λp. Bir aralıkta0 yeni geliş, sistemin boş olması değildir.",
      ],
    ],
  ],
  [
    "Kuyruk Muhafızının Formülleri",
    "epic",
    [
      [
        "Semboller",
        "λ etkin giriş/süre;μ sunucu başına hizmet/süre;c sunucu sayısı. E[S]=1/μ. L toplam sayı,Lq bekleyen sayı,W toplam süre,Wq bekleme.",
      ],
      [
        "Little ve kullanım",
        "L=λW,Lq=λWq. Aynı akış ve sınır kullan. Tek sunucuρ=λ/μ; çok sunucuρ=λ/(cμ). Standart sonsuz kapasitedeρ<1 kontrolü yap.",
      ],
      [
        "M/M/1",
        "Poisson giriş/üstel hizmet/tek sunucu ve kararlı standart modeldeP0=1−ρ,L=ρ/(1−ρ),Lq=ρ²/(1−ρ),W=1/(μ−λ),Wq=W−1/μ.",
      ],
      [
        "M/G/1",
        "Standart bağımsız Poisson/FCFS tek sunucu: E[S²]=Var(S)+E[S]²; Wq=λE[S²]/(2(1−ρ));Lq=λWq. Yalnız ortalama değil varyans da önemlidir.",
      ],
      [
        "Ağ ve tuzak",
        "λj=aj+Σiλi pij. Reddedilen müşteri varsa etkin hız kullan. M/M/c bekleme formüllerini M/M/1’deμ yerinecμ yazarak genelleme.",
      ],
    ],
  ],
  [
    "RNG Tohum Defteri",
    "rare",
    [
      [
        "Üreteç",
        "X(i+1)=(aXi+c) modm;R=X/m. Seed=X0,periyot=tekrar döngüsü. Aynı seed aynı diziyi yeniden üretir.",
      ],
      [
        "Uniform testleri",
        "U(0,1):E=1/2,Var=1/12. K-S:D+=max(i/N−U(i)),D−=max(U(i)−(i−1)/N),D=max(D+,D−).",
      ],
      [
        "Frekans",
        "χ²=Σ(O−E)²/E. Eşit olasılıklı k sınıftaE=N/k. Aralıklar çakışmasın, beklenen frekanslar yeterli olsun.",
      ],
      [
        "Uyarı",
        "Uniformluk bağımsızlık değildir. Reddetmemek kusursuzluk kanıtı değildir. Çoklu testlerde yanlış alarm artar; α=0,05 ile10 bağımsız testte en az bir yanlış ret≈0,4013.",
      ],
    ],
  ],
  [
    "Dönüşüm Büyücüsünün Parşömeni",
    "epic",
    [
      [
        "Ters dönüşüm",
        "U~U(0,1);X=F⁻¹(U). Uniform:X=a+(b−a)U. Exponential hızλ:X=−ln(1−U)/λ. F⁻¹,1/F değildir.",
      ],
      [
        "Empirik parça",
        "(c0,x0) ile(c1,x1) arasında:X=x0+(x1−x0)(U−c0)/(c1−c0). Önce U’nun parçasını bul.",
      ],
      [
        "Kabul/ret ve thinning",
        "Reddedileni çıktı diye yazma. Kabul p ise beklenen aday sayısı1/p. NSPP:λ*≥λ(t),Exp(λ*) aday zamanları, kabulλ(t)/λ*. Ret, saati geri almaz.",
      ],
      [
        "Özel dönüşüm",
        "Box–Muller:Z1=√(−2lnR1)cos(2πR2),Z2=√(−2lnR1)sin(2πR2). Normal:X=μ+σZ. Lognormal:X=exp(Y),Y normal.",
      ],
    ],
  ],
  [
    "Girdi Kâşifinin Ölçüm Kitabı",
    "rare",
    [
      [
        "Tahmin",
        "X̄=ΣXi/n;S²=Σ(Xi−X̄)²/(n−1). Üstel hız tahminiλ̂=1/X̄. Gruplu orta nokta hesabı yaklaşık olabilir.",
      ],
      [
        "Uyum",
        "Ei=npi;χ²=Σ(Oi−Ei)²/Ei; standart df=k−1−s (s tahmin edilen parametre sayısı). Tahminli parametrelerde K-S kalibrasyonunu kontrol et.",
      ],
      [
        "Bağımlılık",
        "corr=cov/(σXσY). Sıfır korelasyon genel olarak bağımsızlık değildir. AR(1):Xt=μ+φ(Xt−1−μ)+εt;|φ|<1,Var=σe²/(1−φ²),ρh=φ^h.",
      ],
      [
        "Hız ve karar",
        "Parça hız=toplam geliş/(gün sayısı×aralık süresi). p>α, H0 reddedilmez demektir; fiziksel uygunluk ve veri temsili ayrıca incelenir.",
      ],
    ],
  ],
  [
    "Geçerleme Denetçisinin Rünleri",
    "rare",
    [
      [
        "Ayrım",
        "Verification: kuralları doğru kodlama. Validation: gerçek sistemi amaç için yeterli temsil. Calibration: modeli verilere göre ayarlama.",
      ],
      [
        "Test",
        "Bağımsız uygun özetlerdeSE=S/√n;t0=(Ȳ−μ0)/SE. İki taraflı ret:|t0|>tcrit. İşaretli t negatife de gidebilir.",
      ],
      [
        "Hatalar",
        "Type I: doğruH0 reddi. Type II: yanlışH0’ın reddedilmemesi. Ret yokluğu eşitlik veya geçerlilik kanıtı değildir.",
      ],
      [
        "Tolerans",
        "ε yakınlık eşiğiyleCI’yi[μ0−ε,μ0+ε] bandına kıyasla. TümCI içinde/yeterince dışında/kısmi örtüşme farklı kararlardır; kapsam ve güven düzeyi belirtilir.",
      ],
    ],
  ],
  [
    "Çıktı Analistinin Merceği",
    "epic",
    [
      [
        "Ortalama ve aralık",
        "BağımsızR özet içinSE=S/√R,H=tSE,CI=Ȳ±H; tam genişlik2H. R replikasyon sayısıdır, aynı koşudaki müşteri sayısı değildir.",
      ],
      [
        "Hassasiyet ve risk",
        "S ve t sabit yaklaşımındaH’yi yarıya indirmek4 katR ister. CI ortalamayı; PI gelecek tek çıktının riskini de kapsar. Daha çok koşu doğal günlük riski yok etmez.",
      ],
      [
        "Bias ve bağımlılık",
        "Warm-up/başlangıç koşulunu incele. Kısa yanlı koşuları çoğaltmak bias’ı gidermez. Pozitif otokorelasyonu yok saymakSE’yi küçümseyebilir.",
      ],
      [
        "Batch ve quantile",
        "Warm-up sonrası batch ortalamaları yaklaşık bağımsız hale gelebilir; boyutu değerlendir. Nearest-rank quantile:k=ceil(np),k’ncı sıralı değer. Kullanılan tanımı belirt.",
      ],
    ],
  ],
  [
    "Alternatifler Terazisi",
    "epic",
    [
      [
        "Bağımsız fark",
        "SE=√(S1²/R1+S2²/R2). Eşit varyans gerekçesi varsaSp²=((R1−1)S1²+(R2−1)S2²)/(R1+R2−2).",
      ],
      [
        "Eşlenmiş CRN",
        "Dr=YrA−YrB;SE=SD/√R;CI=D̄±tSE,df=R−1. Var(A−B)=Var(A)+Var(B)−2cov(A,B). Aynı seed değil, aynı amaçlara senkron girdi gerekir.",
      ],
      [
        "Çoklu karşılaştırma",
        "Bonferroni:αj=αE/C. Tüm çiftlerC=K(K−1)/2; referansa karşıK−1. İstatistiksel anlamlılık pratik önem değildir.",
      ],
      [
        "Metamodel ve arama",
        "E[Y|x]=β0+β1x yaklaşık yanıttır. Anlamlı eğim doğrusallık veya nedensellik garantisi değildir. Heuristik arama genel küresel optimum garantisi vermez.",
      ],
    ],
  ],
];
export const SIMULATION_ITEMS = sheets.map(([name, rarity, entries], i) => ({
  id: "notes-sim-" + String(i + 1).padStart(2, "0"),
  course: "simulation",
  topic: i,
  name,
  rarity,
  slot: "notes",
  icon: "scroll",
  desc:
    SIMULATION_SOURCES[i].title +
    " için formüller, varsayımlar ve sık karışan ayrımlar.",
  effect:
    SIMULATION_SOURCES[i].title +
    " sorularında ücretsiz ipucu · zindanda " +
    (rarity === "epic" ? 3 : 2) +
    " kullanım",
  sheet: entries.map(([title, text]) => ({ title, text })),
  ...slideSource(
    i + 1,
    [...Array(SIMULATION_SOURCES[i].pages - 1)].map((_, j) => j + 2),
  ),
}));
SIMULATION_ITEMS.push({
  id: "notes-sim-atlas",
  course: "simulation",
  topic: -1,
  name: "Gözlemevinin Kayıp Atlası",
  rarity: "legendary",
  slot: "notes",
  icon: "book",
  desc: "On bir simülasyon disiplininin ortak notları ve formül haritası.",
  effect: "Modeling’in bütün konularında ücretsiz ipucu · zindanda4 kullanım",
  source: "Subject1–11 · Yüklenen ders slaytlarından özgün özet",
  sheet: SIMULATION_ITEMS.map((i) => ({
    title: i.name,
    text: i.sheet.map((s) => s.title + ": " + s.text).join("\n"),
  })),
});
export const SIMULATION_NOTES = SIMULATION_ITEMS.filter(
  (i) => i.topic >= 0,
).map((i) => ({
  course: "simulation",
  topic: i.topic,
  title: i.name,
  text: i.sheet.map((s) => s.title + ": " + s.text).join("\n"),
  source: i.source,
}));
