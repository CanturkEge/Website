# Proje Durumu

Son doğrulama: **2026-08-28**  
Referans branch: `main`  
Profesyonel baseline: `0ed6a2a` (`chore(website): establish professional baseline v2.5.0`)

## Aktif durum

- Güncel sürüm: **2.6 / v54 / Build 54**
- Giriş noktası: `index.html`
- İlk yüklenen çekirdek: `config.js`, ardından `app.js`, `expansion.js`, `progression.js`, `admin.js`, `session.js`
- Ek sürüm modülleri `config.js` içindeki sıralı listeden, `window.load` sonrasında yüklenir.
- Veri katmanı: Supabase RPC + kampanya JSON state'i
- Ana kayıt güvenliği: `v31.js` ve `v31-update.sql` birleştirme hattı
- Aktif karakter yaratımı RPC'si: `character_create_player_v53`
- Kampanya sesli sohbeti: `voice.js` + Supabase `livekit-token` Edge Function + LiveKit Cloud
- Ses erişimi: ham değeri yalnız istemcide bulunan, veritabanında SHA-256 özeti tutulan `account_sessions_v54`
- Cleric seçim RPC'si: `character_choices_set_v52`
- Build seçim RPC'si: `character_build_set_v30`

## Korunması gereken sözleşmeler

- Mevcut kampanya, karakter, envanter, market, görev, harita ve geçmiş state alanları sebepsiz yeniden adlandırılmaz veya silinmez.
- `v31` kayıt/birleştirme davranışı, açık veri taşıma planı olmadan değiştirilmez.
- `config.js` içindeki script sırası bağımlılık sırasıdır; alfabetik düzenlenmez.
- `*-data.js` dosyaları veri kaynağı, karşılık gelen normal `.js` dosyaları davranış/arayüz olarak ele alınır.
- SQL değişikliği idempotent olmalı veya tek seferlik çalıştırma koşulu açıkça yazılmalıdır.
- `Map.png`, PDF ve diğer binary dosyalar yalnız görev doğrudan gerektiriyorsa okunur/değiştirilir.

## Bilinen teknik borç

- Uygulama, çok sayıda global ve sıralı yüklenen sürüm dosyasına dayanıyor.
- README geçmişte sürüm günlüğü olarak kullanıldığı için büyümüştü; ayrıntılar artık `CHANGELOG.md` içinde.
- Aynı sistemin davranışı eski temel dosya ile daha yeni patch dosyaları arasında dağılmış olabilir.
- Otomatik test paketi görünmüyor; değişiklikler hedeflenen akışta manuel smoke test gerektirir.
- `config.js` içindeki Supabase publishable/anon anahtarı istemci anahtarıdır; güvenlik RLS politikalarına bağlıdır. Service-role anahtarı repoya konmamalıdır.

## Sonraki çalışma kuralı

Yeni bir görevde bütün repo taranmaz. Önce `PROJECT_INDEX.md` içindeki rota seçilir; yalnız ilgili dosyalar, `config.js` yükleme sırası ve doğrudan çağrılan RPC/state alanları okunur. Proje-geneli audit ancak açıkça istendiğinde yapılır.
