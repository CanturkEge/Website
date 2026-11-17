export const NAV_GROUPS = [
  {
    id: "worlds",
    label: "Dünyalar arası",
    emoji: "🗺️",
    items: [
      ["lobby", "🌌", "Ana lobi"],
      ["market", "🛒", "Market"],
    ],
  },
  {
    id: "study",
    label: "Aktif ders",
    emoji: "📚",
    items: [
      ["camp", "🏕️", "Ders karargâhı"],
      ["learning", "🧭", "Öğrenme yolu"],
      ["dungeons", "🏰", "Zindanlar"],
      ["training", "🎯", "Antrenman"],
      ["codex", "📒", "Bilgi defteri"],
    ],
  },
  {
    id: "hunter",
    label: "Avcı gelişimi",
    emoji: "🧬",
    items: [
      ["character", "🧙", "Karakter"],
      ["skills", "🌳", "Yetenek ağacı"],
      ["stats", "📈", "İstatistikler"],
      ["leaderboard", "🏆", "Ustalık tablosu"],
    ],
  },
  {
    id: "system",
    label: "Sistem",
    emoji: "🗂️",
    items: [["patches", "🧾", "Yama notları"]],
  },
];
export const NAVS = NAV_GROUPS.flatMap((g) => g.items);
export const navGroupFor = (page) =>
  NAV_GROUPS.find((g) => g.items.some(([id]) => id === page));
