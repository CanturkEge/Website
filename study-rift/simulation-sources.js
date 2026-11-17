export const SIMULATION_SOURCES = [
  ["Introduction", 16, "Giriş & model kurma"],
  ["Simulation Examples", 7, "Elle simülasyon"],
  ["Concepts", 13, "DES kavramları"],
  ["Distributions", 22, "Olasılık & dağılımlar"],
  ["Queuing Models", 27, "Kuyruk modelleri"],
  ["Random_Number_Generation", 22, "Rastgele sayı üretimi"],
  ["Random_Variate_Generation", 15, "Rastgele değişken üretimi"],
  ["Input_Modeling", 25, "Girdi modelleme"],
  ["Verification_Validation", 19, "Doğrulama & geçerleme"],
  ["Output_Analysis", 26, "Çıktı analizi"],
  [
    "Comparison and Evaluation of Alternative System Designs",
    25,
    "Alternatif sistemler",
  ],
].map(([name, pages, title], i) => ({
  chapter: i + 1,
  title,
  pages,
  file: "Subject_" + (i + 1) + "_" + name + "_2pp.pdf",
}));
export function slideSource(chapter, pages) {
  const file = SIMULATION_SOURCES[chapter - 1].file;
  return {
    sourceFile: file,
    sourcePages: pages,
    source: file + " · PDF s. " + pages.join(", "),
  };
}
export const SIMULATION_CREDITS =
  "Mujdat Soyturk · Marmara University · Modeling and Discrete Simulation, Fall 2026 · Yüklenen Subject 1–11 slaytları temel alınarak özgün anlatım ve sorular hazırlandı. Kaynak sayfa numaraları 2 slayt/sayfa PDF düzenine aittir; 6 slayt/sayfa ZIP aynı içeriktir.";
export const SIMULATION_CORRECTIONS = [
  "Box–Muller’de Z1 ve Z2 için standart √(−2 ln U) yarıçapı kullanılır; Z1²+Z2², hız 1/2 olan üstel dağılıma (χ²₂) karşılık gelir. Normal ölçeklemede σ kullanılır, σ² değil.",
  "Geometrik dağılımda X ilk başarıya kadarki deneme sayısıysa destek 1, 2, …; başarıdan önceki başarısızlık sayısıysa 0, 1, … olarak kullanılır. Soruda hangi tanımın seçildiği açıkça belirtilir.",
  "Normal dağılım N(μ, σ²) olarak yazılır. Weibull için ölçek α, şekil β; lognormal için ln(X) dağılımının μ ve σ parametreleri kullanılır. Slaytlardaki karışabilen sembol ve yazım yerleri bu tanımlarla netleştirildi.",
  "RNG ki-kare örneklerinde sınıf sınırları çakışmaz: [a,b) aralıkları kullanılır. H0 reddedilmediğinde modelin veya üretecin kesin doğru olduğu söylenmez.",
];
