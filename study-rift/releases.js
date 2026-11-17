export const RELEASES = [
  {
    version: "0.4.0",
    date: "2026-11-17",
    title: "Öğrenme yolu, oda sınavları ve mana dengesi",
    groups: [
      {
        title: "Öğrenme yolu",
        items: [
          "OOD için 6 ünite ve 18 alt bölüm eklendi. Her alt bölümde ayrı konu anlatımı, örnekler, iki flash kart ve iki isteğe bağlı kontrol sorusu var.",
          "Okunan bölümler, kartların biliyorum/tekrar durumları ve kontrol yanıtları ders bazında kalıcı kaydedilir.",
          "Öğrenme yolunda istediğin bölüme geri dönebilir, kaldığın yerden devam edebilirsin. Kontrol soruları anlatımdan ayrı sekmede açılır.",
        ],
      },
      {
        title: "Oda sınavları ve süre",
        items: [
          "Yeni zindanlar 8 ayrı oda sınavı ve toplam 23 sorudan oluşur. Odalarda 2–4 soru ve farklı soru türleri bulunur.",
          "Beş oda sürelidir; üç oda süresizdir. Süreli odaların sayacı ilk girişte başlar ve yenilemeyle sıfırlanmaz.",
          "Doğru veya yanlış cevap sonrası aynı odada kalırsın. Tüm soruların ardından oda raporu, sonra harita açılır.",
          "Son soruyu zamanında yanıtlayınca oda sayacı durur. Süre dolarsa keşif biter ve aynı zorluk ilk odadan yeniden başlar.",
          "Önceki sürümde yarım kalan koşular tek soruluk odalarıyla korunur; geriye dönük süre sınırı uygulanmaz.",
        ],
      },
      {
        title: "Günlük meydan okumalar",
        items: [
          "Günlük antrenman görevi: 5 dakikada 5 farklı doğru. Süre dolunca tekrar denenebilir; 35 altın ve Can İksiri ödülü günde bir kez alınır.",
          "Günlük Ustalık sınavına herkes için 10 dakikalık süre eklendi. Sayaç sunucuda kontrol edilir, ara verince durmaz.",
          "Ustalıkta süre dolunca kazanılan puan korunur; kalan sorular boş sayılır. Hız bonusu ve sınıf/ekipman avantajı yoktur.",
        ],
      },
      {
        title: "Mana dengesi",
        items: [
          "Temel doğru-cevap mana yenilenmesi 12’den 3’e düşürüldü; sınıf, eşya ve yetenek katkıları ayrıca uygulanır.",
          "Yanlış cevap E/D/C/B/S zorluklarında sırasıyla 8/10/12/14/16 mana kaybettirir.",
          "Aktif yeteneklerin kullanım sınırı soru başına yenilenmez; oda boyunca geçerlidir. Her yeni odada kullanım hakları açılır.",
        ],
      },
      {
        title: "Hesap ayarları",
        items: [
          "Giriş kullanıcı adından ayrı görünen ad eklendi. Karakter ekranı ve Ustalık tablosu aynı adı kullanır.",
          "Görünen adı değiştirmek puanı, denemeyi ve sırayı korur; yalnız ad güncellenir.",
          "Mevcut şifre ve SİL onayıyla Study Rift hesabı kalıcı silinebilir. Karakter, notlar, öğrenme ilerlemesi ve tüm sıralama sonuçları kaldırılır.",
          "Hesap işlemleri oturum ve sahiplik kontrolüyle sunucuda yapılır; diğer uygulama verileri korunur.",
        ],
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-11-17",
    title: "Ustalık, odalar ve daha ağır sınavlar",
    groups: [
      {
        title: "Ustalık tablosu",
        items: [
          "Karakter XP’sinden bağımsız, sunucuda puanlanan günlük sıralama eklendi.",
          "Aynı derste herkes aynı 10 soruyu çözer. Her zorluktan 2 soru ve toplam 200 puan vardır.",
          "Günde tek deneme; yarım kalan sınav devam eder. Eşit puan/doğru sayısı aynı sırayı paylaşır.",
          "Sınıf, ekipman, ipucu, mana, XP ve hız bonusları sıralama puanına etki etmez.",
        ],
      },
      {
        title: "Sorular",
        items: [
          "Soru havuzu 84’ten 168’e çıkarıldı.",
          "Çoklu seçim, sıralama ve kısa yanıt eklendi; toplam 6 soru türü destekleniyor.",
          "Kısa yanıtta harf büyüklüğü, gereksiz boşluklar ve tanımlanmış eş anlamlı yanıtlar dikkate alınıyor.",
          "Sıralama ve çoklu seçimde tam doğruluk gerekir; tek bir şık işaretlemek yeterli değildir.",
        ],
      },
      {
        title: "Zindan dengesi",
        items: [
          "8 odalı etkileşimli zindan haritası eklendi; her odada ayrı soru bulunur.",
          "Yanlış cevapların can hasarı yükseltildi. Elit ve boss odaları daha ağır vurur.",
          "Ölümde sonraki odaya geçilemez; aynı zorluk yeniden başlatıldığında ilk odadan başlanır.",
          "İkinci Şans, ölümden dönüş ve koruma yetenekleri kendi sınırlarıyla istisna sağlar.",
          "Her sınıfa bir pasif hasar azaltma düğümü eklendi: artık 16 düğüm/sınıf, toplam 48 yetenek var.",
        ],
      },
      {
        title: "Arayüz ve kayıt",
        items: [
          "Yama Notları sayfası ve üç bileşenli sürümleme eklendi.",
          "Önceki karakterler, eşyalar, sınıflar ve notlar korunur.",
          "Sıralama sonuçları tarayıcıdaki XP kaydından alınmaz; yanıtlar sunucuda kontrol edilir.",
          "Sorular hâlâ özgün örnek içeriktir. Hocanın slaytları bu sürüme dahil değildir.",
        ],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-11-17",
    title: "Sınıflar ve ders dünyaları",
    groups: [
      {
        title: "Eklenenler",
        items: [
          "Kullanıcı adı/şifreyle zorunlu giriş ve isteğe bağlı kurtarma adresi.",
          "Üç sınıf ve sınıf başına 15 düğümlü yetenek ağacı.",
          "89 eşya, nadirlik garantisi ve eşya tekrarını azaltan ganimet seçimi.",
          "84 soruluk havuz, karışan şıklar ve zorluk bazlı soru desteleri.",
          "OOD dışındaki dört ders için kilitli ders kartları, ayrı notlar ve temalar.",
          "Açılış ve zindana giriş animasyonları.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-11-17",
    title: "İlk uyanış",
    groups: [
      {
        title: "İlk sürüm",
        items: [
          "Karakter ekranı, ekipman, loot ve can/mana sistemi.",
          "Beş zindan, antrenman alanı, bonus notlar ve yanlış defteri.",
          "36 örnek OOD sorusu ve Supabase üzerinde özel ilerleme kayıtları.",
        ],
      },
    ],
  },
];
export const VERSION = RELEASES[0].version;
export function compareVersions(a, b) {
  const parse = (v) => {
    if (!/^\d+\.\d+\.\d+$/.test(v))
      throw Error("Sürüm üç sayısal bileşenden oluşmalı.");
    return v.split(".").map(Number);
  };
  const x = parse(a),
    y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}
