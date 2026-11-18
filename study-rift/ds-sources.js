export const DS_SOURCES = [
  [33, "Bellek & veri yapıları"],
  [67, "Analiz & özyineleme"],
  [27, "Yığınlar"],
  [30, "Kuyruklar"],
  [83, "Ağaçlar & BST"],
  [76, "Dengeli ağaçlar"],
].map(([pages, title], i) => ({
  week: i + 1,
  title,
  pages,
  file: `Week${i + 1}.pdf`,
}));
export function dsSource(week, pages) {
  const file = DS_SOURCES[week - 1].file;
  return {
    sourceFile: file,
    sourcePages: pages,
    source: `${file} · PDF s. ${pages.join(", ")}`,
  };
}
export const DS_CREDITS =
  "Borahan Tümer, Ph.D. · Data Structures, Week 1–6 · Yüklenen 6 PDF, toplam 316 sayfa. Türkçe anlatımlar, sorular ve notlar bu slaytlar temelinde özgün olarak hazırlandı. Kaynaklar, basılı slayt numarası yerine dosyanın 1’den başlayan PDF sayfasını gösterir.";
export const DS_CONVENTIONS = [
  "C örneklerinde tür boyutu platforma bağlıdır; bellek hesabında sizeof(int) gibi değerler soruda açıkça verilir. Array bir pointer değişkeni değildir; çoğu ifadede ilk elemanına işaretçiye dönüşür. n eleman için geçerli indeksler 0…n−1’dir.",
  "Ω alt sınırında c·g(n) ≤ f(n); little-o ve little-ω tanımlarında her c > 0 için uygun eşik gerekir. Tek bir sabit c bulmak yeterli değildir.",
  "n hücreli stack’te top son dolu indeksi gösteriyorsa boş top=−1, dolu top=n−1’dir. Postfix ifadede art arda operatör gelmesi tek başına hata değildir; her operatör için yeterli operand ve sonda tek sonuç aranır.",
  "Circular queue sorularında front/rear’ın anlamı ve doluluk kuralı ayrıca belirtilir. Bir boş hücre ayrılan n hücreli düzende kullanılabilir kapasite n−1’dir; indis güncellemelerinde modulo n kullanılır.",
  "AVL’de LL/LR/RL/RR yolu dengesiz kökten eklenen düğüme doğru okunur; slayttaki bazı çapraz vaka etiketleri bu yaygın adlandırmanın tersidir. Rotasyonun yönü ayrıca açıkça yazılır. Ağaç yüksekliği ve B-tree minimum degree t tanımı soruda belirtilir; kök istisnası korunur. B-tree yükseklik sınırındaki n, düğüm değil anahtar sayısıdır.",
];
