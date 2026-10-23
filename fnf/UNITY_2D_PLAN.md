# FNF — Unity 2D pixel art yolu

**Karar:** Web prototipinin dünya, oda, DM ve tarım verisi korunur. Unity 2D yeni istemci olur; mevcut tarayıcı arayüzü oynanabilir kalabilir. Bu dosya henüz çalışan Unity projesi olduğunu iddia etmez.

## Oyun görüntüsü

- Üstten bakış 2D pixel art: köy, tarla, orman, gölet, tapınak ve pazar sahneleri. Başlangıç kılavuzu 32×32 dünya karoları, karakterler 32×48, yakınlaştırma tam sayı oranlarında. Nihai ölçek prototipte denenir.
- Tarla açma ve ekim, yirmi karelik parsel üstünde seçme/sulama/hasat etkileşimidir. Mevsim ortam paletini, suyu, mahsul görünümünü ve sesleri değiştirir.
- Meyveler çalının/ağacın üstünde görünür; çiçek, tahıl, mantar, kök ve su bitkisi ayrı sprite aileleri olur. Parşömen grafit çizimleri ansiklopedide konsept plakası olarak kullanılabilir; oyun içi sprite'ların ayrıca pixel art üretilmesi gerekir.
- Oyuncu keşifleri soru işareti → silüet → tür görseli → açıklama olarak açılır; DM'nin izinleri sunucuda kalır.

## Teknik sınır

- Unity yalnız istemci. Supabase Auth oturumu ve veritabanı RPC'leri HTTPS üzerinden çağrılır; oda kurma şifresi, service-role anahtarı ve gün/hasat kuralları istemciye gömülmez.
- Aynı oda kimlikleri, karakterler, tohum stokları, parseller, keşif açmaları ve yedek JSON biçimi korunur. Unity envanter/katalog ekranı mevcut `fnf_*_snapshot` RPC'lerinden veriyi okur; eylemler `fnf_*_action` ile sunucuda doğrulanır.
- Başlangıç prototipi: kullanıcı adıyla giriş, oda koduyla katılım, bir köy sahnesi, 20 kare tarla, tohum seçimi, sulama/hasat, DM gün geçirme ve ansiklopedi. Sonra NPC, hayvan, pazar, hava animasyonu ve çoklu harita eklenir.
- Çok oyunculu dolaşım gerekirse yalnız konum/görsel olaylar için gerçek zamanlı senkron eklenir. Envanter, kaynak ve gün geçişi kalıcı sunucu işlemi olarak kalır.

## İlk deneme için kabul ölçütü

1. İki oyuncu aynı odayı açar; DM karakter olmadan günü geçirir.
2. Bir oyuncu verilen meyve tohumu için uygun toprağa ekim yapar; başka oyuncu aynı parsel durumunu görür.
3. Su, iklim ve mevsim büyüme süresini belirler; hasat yiyecek ve yeniden ekimlik tohum verir.
4. Keşfedilmemiş türün adı ve resmi oyuncuya sızmaz; DM ayrı ayrı açar.
5. Tarayıcı ve Unity aynı odayı okur, aynı kaynak miktarını gösterir.
