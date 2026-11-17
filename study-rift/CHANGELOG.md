# Study Rift — Yama notları

Sürüm biçimi: `ana.özellik.düzeltme`. Bileşenler bağımsız tam sayıdır; `0.3.9 → 0.3.10`, `1.20.0` geçerlidir.

## 0.3.0 · 2026-11-17

Ustalık, odalar ve daha ağır sınavlar

### Ustalık tablosu

- Karakter XP’sinden bağımsız, sunucuda puanlanan günlük sıralama eklendi.
- Aynı derste herkes aynı 10 soruyu çözer. Her zorluktan 2 soru ve toplam 200 puan vardır.
- Günde tek deneme; yarım kalan sınav devam eder. Eşit puan/doğru sayısı aynı sırayı paylaşır.
- Sınıf, ekipman, ipucu, mana, XP ve hız bonusları sıralama puanına etki etmez.

### Sorular

- Soru havuzu 84’ten 168’e çıkarıldı.
- Çoklu seçim, sıralama ve kısa yanıt eklendi; toplam 6 soru türü destekleniyor.
- Kısa yanıtta harf büyüklüğü, gereksiz boşluklar ve tanımlanmış eş anlamlı yanıtlar dikkate alınıyor.
- Sıralama ve çoklu seçimde tam doğruluk gerekir; tek bir şık işaretlemek yeterli değildir.

### Zindan dengesi

- 8 odalı etkileşimli zindan haritası eklendi; her odada ayrı soru bulunur.
- Yanlış cevapların can hasarı yükseltildi. Elit ve boss odaları daha ağır vurur.
- Ölümde sonraki odaya geçilemez; aynı zorluk yeniden başlatıldığında ilk odadan başlanır.
- İkinci Şans, ölümden dönüş ve koruma yetenekleri kendi sınırlarıyla istisna sağlar.
- Her sınıfa bir pasif hasar azaltma düğümü eklendi: artık 16 düğüm/sınıf, toplam 48 yetenek var.

### Arayüz ve kayıt

- Yama Notları sayfası ve üç bileşenli sürümleme eklendi.
- Önceki karakterler, eşyalar, sınıflar ve notlar korunur.
- Sıralama sonuçları tarayıcıdaki XP kaydından alınmaz; yanıtlar sunucuda kontrol edilir.
- Sorular hâlâ özgün örnek içeriktir. Hocanın slaytları bu sürüme dahil değildir.

## 0.2.0 · 2026-11-17

Sınıflar ve ders dünyaları

### Eklenenler

- Kullanıcı adı/şifreyle zorunlu giriş ve isteğe bağlı kurtarma adresi.
- Üç sınıf ve sınıf başına 15 düğümlü yetenek ağacı.
- 89 eşya, nadirlik garantisi ve eşya tekrarını azaltan ganimet seçimi.
- 84 soruluk havuz, karışan şıklar ve zorluk bazlı soru desteleri.
- OOD dışındaki dört ders için kilitli ders kartları, ayrı notlar ve temalar.
- Açılış ve zindana giriş animasyonları.

## 0.1.0 · 2026-11-17

İlk uyanış

### İlk sürüm

- Karakter ekranı, ekipman, loot ve can/mana sistemi.
- Beş zindan, antrenman alanı, bonus notlar ve yanlış defteri.
- 36 örnek OOD sorusu ve Supabase üzerinde özel ilerleme kayıtları.
