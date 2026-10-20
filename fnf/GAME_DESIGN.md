# Farms & Fields — oyun fikri ve sınırlar

Bu dosya önceki çalışan sürümün **tarihsel kısa kaydıdır**; aşağıdaki “canlı v0.7.0” paragrafları güncel durum değildir. Konuşmanın bütün hedef oyunu, güncel sürümle farkı ve açık kararlar [GDD.md](GDD.md) içinde; 20 Ekim ayrıntılı kararları [DESIGN_DECISIONS_2026-10-20.md](DESIGN_DECISIONS_2026-10-20.md) içinde bulunur.

## v0.11.0 içerik durumu

`v15-field-guide.sql` 100 bitki ve 30 hayvanı aşamalı ansiklopediye ekler; her türün benzersiz çizimi `assets/codex/` altındadır. Metin ve adların düzenlenebilir kaynağı `tools/generate_fieldguide.py` dosyasıdır. Bunlar doğal yaşam ve gözlem kayıtlarıdır; türlerin ekim, tüketim, işleme, evcilleştirme ve genetik kuralı henüz tanımlanmadı. Başlangıçta var olan üç tohumun yetiştirme kuralı korunur.

`v16-divine-hierarchy.sql` tek Kaynak → dört başmelek → sekiz elçi düzenini kurar. Bu isimler geçicidir; DM oda bazında ad değiştirebilir. Tapınak kapalı başlar, DM açınca ad, alan ve anlatı ayrı ayrı açıklanır. Alamet, nimet, günah puanı ve başmelek yolu için sayısal etki henüz yoktur.

## Kesinleşen yön

- Arkadaşlarla oynanan, mitolojik yerleşim ve üretim oyunu. Zindan/savaş merkezli D&D kopyası değil; D&D sitesi yalnızca arayüz ve beceri düzeni için yapısal örnek.
- Odayı kuran kişi DM; kurucu şifresi yalnız yetki verilenlerde. Hesap herkesçe kodsuz açılır, oyuncular oda koduyla girer. DM karakter oluşturmaz.
- Karakterde tür, ana yol, uzmanlık, altı nitelik ve eğitim/ustalık başlangıcı vardır. Mevcut rakamlar `v02-update.sql` ve `game-data.js` içinde; beceri deneyimi v0.7'de başlar, tam seviye sistemi henüz tanımlı değil.
- Köy yapıları/bakım, kaynak/depo/taşıma, tarım, hayvan yetiştirme ve kalıtım, araştırma, yolcular, ticaret/arz-talep, vergi, baskın, mevsim/hava ve günlük olayların ilk oynanabilir kuralları `v06-world-systems.sql` içindedir.
- Tek yüce tanrı; yardımcı tanrılar/melekler habercilik, alamet, görev, nimet ve sonuçlar getirebilir. Nadir doğum nimetleri ve tür yatkınlıkları düşünüldü; nasıl seçileceği henüz kararlaştırılmadı.
- Bilinmeyen tohum ve alamet bilgisi araştırma, soru sorma veya deney yoluyla açılmalı. Tohumun **zorunlu büyüme koşulu** ile bakım/gübre/büyü gibi **verim değiştiricisi** ayrı tutulmalı. Dünya tohumu farklı başlangıçlar yaratmalı.

## Canlı sürüm ve sonraki hedef

Canlı v0.7.0: hesap/oda/karakter, dört tarla, DM gün geçişi, keşif ansiklopedisi, yedek/yükleme/silme ve yerleşim sistemleri.

`v06-world-systems.sql` ve `world-systems.js` içindeki ilk oynanabilir rakamlar: 10 günlük mevsim, bölgesel iklim, hava evreleri, toprak/güneş/nem/sıcaklık koşulları, alan ve bakım verimi, köy tüketim/bakımı, yapı, kervan/depo, yolcu/köylü, ahır ve kalıtım, araştırma/keşif/soru, pazar/han, vergi/baskın, alamet/lütuf ve XP. Bu değerler arkadaş oyunuyla denge testi sonrası değişebilir. Sonraki hedefte 20 günlük mevsim, hazır tarlasız başlangıç, köy sahipliği ve parsel bazlı tarım var; ayrıntı bağlantılı tasarım kaydında.

## Eski ilk dilim kaydı

| Çalışan | Yalnızca taslak ekran |
| --- | --- |
| Kullanıcı adı + şifreyle kodsuz kayıt; DM oda kurma, oyuncu kodla katılma; karakter ve beceri; dört ortak tarla, 3 tohum, sulama/hasat; DM gün geçişi ve basit RP sabah kancaları; aşamalı ansiklopedi; sürüm notları | Bina/üretim, hayvan genetiği, pazar, araştırma, dünya tohumu, melek/alamet, görev, etkili rastgele olay ve savaş/tehdit döngüleri |

İlk oynanabilir dilim 7 günlük mevsim ve basit hasatla `v04-farming-day-codex.sql` içinde başlamıştı. Güncel 10 günlük mevsim ve verim hesapları `v06-world-systems.sql` içindedir.

## Sonraki tasarım çalışması

Kesinleşen kurallar, geri çekilen fikirler, canlı sürümle farklar ve cevap bekleyen sorular [20 Ekim tasarım kaydında](DESIGN_DECISIONS_2026-10-20.md). Özellikle 20 günlük mevsim, hazır varlık olmadan küçük yiyecek payıyla başlama, çoklu köy ve izinler henüz uygulanmadı. İlk “Fantasy Genesis” kaynak notlarının tam dosyası bu repoda yok; özel adları, bitki/hayvan listesini ve rakamları kaynak görülmeden kesin kanon sayma.
