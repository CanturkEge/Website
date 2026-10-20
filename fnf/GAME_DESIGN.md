# Farms & Fields — oyun fikri ve sınırlar

## Kesinleşen yön

- Arkadaşlarla oynanan, mitolojik yerleşim ve üretim oyunu. Zindan/savaş merkezli D&D kopyası değil; D&D sitesi yalnızca arayüz ve beceri düzeni için yapısal örnek.
- Odayı kuran kişi DM; kurucu şifresi yalnız yetki verilenlerde. Hesap herkesçe kodsuz açılır, oyuncular oda koduyla girer. DM karakter oluşturmaz.
- Karakterde tür, ana yol, uzmanlık, altı nitelik ve eğitim/ustalık başlangıcı vardır. Mevcut rakamlar `v02-update.sql` ve `game-data.js` içinde; beceri deneyimi v0.7'de başlar, tam seviye sistemi henüz tanımlı değil.
- Köy yapıları/bakım, kaynak/depo/taşıma, tarım, hayvan yetiştirme ve kalıtım, araştırma, yolcular, ticaret/arz-talep, vergi, baskın, mevsim/hava ve günlük olayların ilk oynanabilir kuralları `v06-world-systems.sql` içindedir.
- Tek yüce tanrı; yardımcı tanrılar/melekler habercilik, alamet, görev, nimet ve sonuçlar getirebilir. Nadir doğum nimetleri ve tür yatkınlıkları düşünüldü; nasıl seçileceği henüz kararlaştırılmadı.
- Bilinmeyen tohum ve alamet bilgisi araştırma, soru sorma veya deney yoluyla açılmalı. Tohumun **zorunlu büyüme koşulu** ile bakım/gübre/büyü gibi **verim değiştiricisi** ayrı tutulmalı. Dünya tohumu farklı başlangıçlar yaratmalı.

## Canlı sürüm

Canlı v0.7.0: hesap/oda/karakter, dört tarla, DM gün geçişi, keşif ansiklopedisi, yedek/yükleme/silme ve yerleşim sistemleri.

`v06-world-systems.sql` ve `world-systems.js` içindeki ilk oynanabilir rakamlar: 10 günlük mevsim, bölgesel iklim, hava evreleri, toprak/güneş/nem/sıcaklık koşulları, alan ve bakım verimi, köy tüketim/bakımı, yapı, kervan/depo, yolcu/köylü, ahır ve kalıtım, araştırma/keşif/soru, pazar/han, vergi/baskın, alamet/lütuf ve XP. Bu değerler arkadaş oyunuyla denge testi sonrası değişebilir.

## Eski ilk dilim kaydı

| Çalışan | Yalnızca taslak ekran |
| --- | --- |
| Kullanıcı adı + şifreyle kodsuz kayıt; DM oda kurma, oyuncu kodla katılma; karakter ve beceri; dört ortak tarla, 3 tohum, sulama/hasat; DM gün geçişi ve basit RP sabah kancaları; aşamalı ansiklopedi; sürüm notları | Bina/üretim, hayvan genetiği, pazar, araştırma, dünya tohumu, melek/alamet, görev, etkili rastgele olay ve savaş/tehdit döngüleri |

İlk oynanabilir dilim 7 günlük mevsim ve basit hasatla `v04-farming-day-codex.sql` içinde başlamıştı. Güncel 10 günlük mevsim ve verim hesapları `v06-world-systems.sql` içindedir.

## Sonraki oynanabilir dilim için açık kararlar

1. **Bilgi ve yetki:** Şimdilik keşif oda ortak ve DM tikleriyle açılıyor. Karakter bazlı bilgi veya ekim onayı istenecek mi?
2. **Olay etkisi:** Sabah haberleri şimdilik RP kancası. Sonraki sürümde hangileri mekanik sonuç doğurmalı, DM olayı seçebilmeli mi?
3. **Kaynak belge:** İlk “Fantasy Genesis” notlarının tam dosyası bu repoda yok. Sayılar, tanrı adları, bitki/hayvan listesi ve özel kurallar o belge görüldükten sonra kesinleştirilmeli.

İlk sayıları oyunda deneyip kullanıcı raporuna göre ayarla; kaynak belgedeki özel kuralları görülmeden kesin kanon sayma.
