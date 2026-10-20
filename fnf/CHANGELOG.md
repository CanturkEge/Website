# FNF Sürüm Notları

Oyuncuya görünen sürümler bu dosyada ve `patch-notes.js` içinde aynı sırayla tutulur. Teknik dağıtım ile oyun mekaniği henüz ayrı sürümlenmez.

## v0.2.0 — İlk Yerleşim Masası (20 Ekim 2026)

### Yeni
- Koyu oyun arayüzü ve rolüne göre sol menü: genel bakış, yerleşim, halk/karakter, tarım, keşif ve sürüm notları.
- Sürüm notları için aranabilir, sıralanabilir ve açılır kartlar.
- Oyuncu karakterinde altı temel nitelik (10 taban + 8 dağıtım puanı, en çok 14), tür niteliği +1, iki seçmeli eğitim; tür ve uzmanlık sabit eğitimleri. Eğitim bonusu +2, örtüşen sabit eğitim ustalık +4 verir.

### Düzeltildi
- DM karakter oluşturma zorunluluğu olmadan doğrudan oda yönetimine girer.
- Başlangıç becerileri sıfırdan tek tek yükseltilmez; ilişkili nitelik değişkeni ve eğitim/ustalık bonusu üzerinden hesaplanır.

### Değişti
- DM hesabındaki daha önce oluşturulmuş karakter verisi silinmez ama DM ekranında oyuncu karakteri olarak kullanılmaz.
- Tarım, yerleşim ve keşif başlıkları ilk sürümde durum ekranıdır; oynanabilir simülasyon olarak sunulmaz.

## v0.1.0 — İlk Filiz (20 Ekim 2026)

### Yeni
- `/fnf/` için bağımsız site ve ayrı Supabase projesi/oturumu.
- Kurucu şifresiyle oda kurma, oyuncular için davet koduyla katılım.
- Altı tür, dört ana yol, on iki uzmanlık ve ilk karakter akışı.
