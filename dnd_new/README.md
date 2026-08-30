# Kadim Masa Defteri

Kadim Masa Defteri; D&D 5e 2014 kampanyaları için DM ve oyuncu panelleri, karakter yönetimi, envanter, market, görev, harita, savaş alanı ve kural katalogları sunan web uygulamasıdır.

## Güncel sürüm

- Ürün sürümü: **2.9.0**
- Build/modül sürümü: **v63 / Build 63**
- Son paket: 124 yeni büyücü eşyası, rünlü ekipman ve çalışan Spell Attack/DC eşya bonusları
- Mimari: statik HTML/CSS, klasik global JavaScript ve Supabase RPC

Güncel teknik gerçekler için [`PROJECT_STATE.md`](PROJECT_STATE.md), görevden dosyaya gitmek için [`PROJECT_INDEX.md`](PROJECT_INDEX.md), eski sürümlerin ayrıntıları için [`CHANGELOG.md`](CHANGELOG.md) kullanılır.

## Çalıştırma

1. `config.js` içindeki Supabase ayarlarının hedef ortamı gösterdiğini doğrula.
2. Klasörü statik bir web sunucusuyla aç. Dosyayı doğrudan `file://` ile açmak yerine localhost kullan.
3. Yeni kurulumda `supabase-setup.sql` dosyasını, ardından gereken sürümlü SQL güncellemelerini sırayla çalıştır.
4. Güncel kurulum için `v53-update.sql`, `v56-update.sql`, `v59-update.sql`, `v60-update.sql`, `v61-update.sql`, `livekit-token` ve `kadim-admin` Edge Function'larını kontrol et.
5. Tarayıcı önbelleği eski dosyaları tutuyorsa `Ctrl + Shift + R` yap.

> SQL dosyalarını tekrar çalıştırmadan önce içeriğini ve hedef Supabase projesini kontrol et. Canlı veriye karşı körlemesine SQL çalıştırma.

## Geliştirme akışı

1. Önce [`AGENTS.md`](AGENTS.md) ve [`PROJECT_STATE.md`](PROJECT_STATE.md) oku.
2. İstek için [`PROJECT_INDEX.md`](PROJECT_INDEX.md) içindeki tek modül rotasını seç.
3. Yalnız o rotadaki dosyaları ve doğrudan bağımlılıklarını incele.
4. En küçük patch'i hazırla; mevcut kampanya state'ini ve RPC sözleşmelerini koru.
5. Sürüm değişiyorsa `config.js` cache anahtarını, `PROJECT_STATE.md`, `CHANGELOG.md` ve uygulama içi sürüm notlarını birlikte güncelle.

## Commit ve sürüm standardı

Commit biçimi:

```text
type(dnd): kısa ve somut açıklama
```

Türler: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.

Örnekler:

```text
feat(dnd): add cleric domain selection
fix(dnd): preserve prepared spells on save
docs(dnd): refresh project state and module index
```

- Hotfix: mevcut davranışı düzeltir, veri modelini değiştirmez.
- Build: dağıtılan dosya setindeki her değişiklikte artar.
- Ürün sürümü: kullanıcıya dönük anlamlı paketlerde artar.
- Eski commit geçmişi yeniden yazılmaz; ayrıntılı geçmiş [`CHANGELOG.md`](CHANGELOG.md) içinde korunur.

## Kaynak ve lisans notları

- SRD içeriği için [`SRD-5.1-ATTRIBUTION.md`](SRD-5.1-ATTRIBUTION.md)
- Tanrı kaynakları için [`DEITY-SOURCES.md`](DEITY-SOURCES.md)
- v53 kural kaynakları için [`v53-rules-sources.md`](v53-rules-sources.md)

Bu depo içindeki homebrew içerikler resmî D&D kuralı olarak değerlendirilmemelidir.
