# Kadim Masa Defteri — Proje İndeksi

Güncel sürüm: **v79 / uygulama v3.8.1 / Build 79**
Mimari: statik HTML/CSS + klasik global JavaScript + Supabase RPC. Script sırası `config.js` içinden yönetilir.

## Hızlı kullanım

1. Önce `PROJECT_STATE.md` okunur.
2. Aşağıdaki tabloda istekle eşleşen tek rota seçilir.
3. Yalnız "ilk okunacak" dosyalar ve ihtiyaç olursa doğrudan bağımlılıklar açılır.

| İstek | İlk okunacak | Gerekirse |
|---|---|---|
| Giriş, hesap, lobi, kampanya | `app.js` içinde hedef sembol | `supabase-setup.sql`, ilgili RPC SQL'i |
| Mobil menü veya genel görünüm | ilgili CSS + DOM id'si | `mobile.css`, `style.css`, sürüm CSS'i |
| Karakter oluşturma/stat/species/class | `v53.js`, hedef kayıt için `v53-data.js` | `v30.js`, `v31.js`, `v53-update.sql` |
| XP, seviye göstergesi ve DM ilerleme yönetimi | `v78.js`, `v78-core.js`, `v78.css` | `progression.js`, güvenli kampanya kaydı için `v31.js` |
| Büyü hazırlama veya büyü kuralı | `v53.js`, hedef büyü için `v47-data.js` | `v47.js`, `v52.js` |
| Cleric/tanrı/domain | `v52.js`, hedef tanrı/domain için `v52-data.js` | `v49-data.js`, `v52-update.sql` |
| Envanter/kuşanma/aktarım | `inventory-actions.js`, `v45.js`, `v46.js`; NPC transferi için `v66.js` | `v31.js`, `inventory-update.sql`, `v66-update.sql`, eski odak uyumluluğu için `v67-update.sql` |
| Market/loot/eşya kataloğu | hedef veri ve ganimet dengesi için `v44-data.js`, `v48-data.js`, caster eşyaları için `v63-data.js`, temizlik/class eşya/arcane market için `v64-data.js`, tekil emanetler için `v65-data.js`, odak/materyal için `v66-data.js` | `v34.js`, `v44.js`, ganimet dengesi testi için `tests/v79-loot-balance.test.cjs`, `v64.js`, `v65.js`, sepet/çok turlu teklif için `v66.js`, `v66-update.sql`, `v68-update.sql`, `v69-update.sql`, sessiz bildirim/geçmiş için `v70-update.sql`; büyü bonusu için `v63.js`; Kesem para merkezi için `expansion.js`, `v27.js`, `v61-update.sql` |
| Kumarhane, bahis ve ortak masalar | `v77.js`, `v77-core.js`, `v77.css` | `v77-update.sql`, `campaign_wallets` için `economy-update.sql`, DM log etiketi için `v66.js`, `tests/v77-*.cjs` |
| Görev panosu | `v50.js`, hedef görev için `v50-data.js` | eski `state.quests` için `app.js` |
| Harita/kale | `v32.js`, `v33.js` | `v34-data.js`, `Map.png` yalnız görsel gerekirse |
| Yol/binek/seyahat | `v38.js`, `v38-data.js` | `v34-data.js` |
| Kampanya yedeği alma / içe aktarma | `v76.js`, `v76-core.js`, `v76.css`, `index.html` | güvenli kayıt için `v31.js`; yeni SQL gerekmez |
| İlişkiler ve ayrıntılı parti statları | `v75.js`, `v75-core.js`, `v75.css` | kampanya state birleştirmesi için `v31.js`; yeni SQL gerekmez |
| Savaş büyüleri, kaynaklar, etkiler, DM zar isteği | `v74-combat.js`, `v74-core.js`, `v74.css` | `v74.js`, `v74-update.sql`, `tests/v74-database.test.cjs` |
| Belgeler, topluluk itibarı, dinlenme faaliyetleri | `v74.js`, `v74.css` | `v74-update.sql`, `RELEASE_V74.md` |
| Taktik savaş | `v38-battle.js`, `v38.css` | encounter state'i için `app.js`, `v31.js`; oyuncu hareketi için `v60-update.sql` |
| Karma/adalet/alignment | `v44.js`, `v51.js` | `v51-data.js` |
| Notlar/oturum/bildirim | `session.js` | `session-update.sql`, hedef state için `app.js` |
| Sesli sohbet/LiveKit | `voice.js`, `voice.css` | `v54-update.sql`, `supabase/functions/livekit-token/index.ts`, hesap oturumu için `app.js` |
| Veritabanı sağlık kontrolü | `health-check-v56.sql`, `v56-update.sql` | `v53-update.sql` |
| Admin girişi ve kampanya yönetimi | `admin.js`, `admin-update.sql` | `supabase/functions/kadim-admin/index.ts` |
| Sürüm notları | `CHANGELOG.md`, `v37.js` | `config.js`, `PROJECT_STATE.md` |
| Başarımlar / hatıralar | `v73.js`, `v73.css` | `v73-update.sql`, `config.js` |

## Çekirdek

| Sistem | Ana dosyalar | Doğrudan bağımlılıklar |
|---|---|---|
| Başlangıç, hesap, kampanya state'i, ana sayfalar | `index.html`, `config.js`, `app.js` | `ui-state-manager.js`, `UI_STATE.md`, Supabase JS, sürüm scriptleri |
| Temel market/dükkân/dünya genişletmesi | `expansion.js`, `expansion.css` | `app.js` |
| Karakter gelişimi, temel class/species/stat/spell akışı | `progression.js`, `progression.css` | `app.js` |
| Admin | `admin.js`, `admin.css`, `admin-update.sql` | kampanya RPC'leri |
| Oturum mesaj/bildirim | `session.js`, `session.css`, `session-update.sql` | kampanya üyeliği |

## Karakter kuralları

| Sistem | Veri | Mantık / arayüz | Kayıt |
|---|---|---|---|
| Species, subspecies, ability bonusları, classlar, subclass kilometre taşları | `v53-data.js` | `v53.js`, `v53.css` | `v53-update.sql` |
| Background, 18 skill, proficiency, expertise, ASI/feat | `v30.js` | `v30.js`, `v30.css` | `v30-update.sql` |
| Subclass listeleri ve açıklamaları | `v26.js`, `v28-details.js` | `v28.js` | mevcut kampanya state'i |
| Güvenli karakter/seçim/envanter birleştirme hattı | — | `v31.js` | `v31-update.sql` |
| Cleric tanrı → domain → özellik/büyü sistemi | `v52-data.js` | `v52.js`, `v52.css` | `v52-update.sql` |
| Tanrı ansiklopedisi | `v49-data.js` | `v49.js`, `v49.css` | salt okunur |

## Büyü ve eşya

| Sistem | Veri | Mantık / arayüz |
|---|---|---|
| 319 kayıtlık 2014 SRD büyü kataloğu | `v47-data.js` | `v47.js`, `v47.css`; karakter seçimi için `v53.js` |
| Eşya/loot ana veri kümeleri | `v34-data.js`, `v36-data.js`, `v44-data.js`, `v48-data.js`, `v63-data.js`, `v64-data.js`, `v65-data.js` | `v34.js`, `v44.js`, `v63.js`, `v64.js`, `v65.js` |
| Kuşanma, slotlar, sürekli bonuslar | — | `inventory-actions.js`, `v31.js`, `v45.js`, `v46.js` |
| Envanter görünümü ve karakter föyü | — | `v46.js`, `v46.css` |

## Dünya ve oyun yönetimi

| Sistem | Ana dosyalar |
|---|---|
| Harita ve kaleler | `v32.js`, `v33.js`, `v34-data.js` |
| Yollar, seyahat ve binekler | `v38.js`, `v38-data.js` |
| Taktik savaş alanı | `v38-battle.js`, `v38.css` |
| Gelişmiş yaratık, Bosslar ve DM müdahalesi | `v27.js`, `v41.js`, `v64-data.js`, `v64.js` |
| 200 görevlik görev panosu | `v50-data.js`, `v50.js`, `v50.css` |
| Karma, adalet, alignment ve ilahi düzen | `v44.js`, `v51-data.js`, `v51.js` |
| Sürüm notları | `v37.js`, `v37.css` |
| Başarımlar ve oyuncu hatıraları | `v73.js`, `v73.css`, `v73-update.sql` |
| Kadim Şans Salonu | `v77.js`, `v77-core.js`, `v77.css`, `v77-update.sql` |
| XP tabanlı karakter ilerlemesi | `v78.js`, `v78-core.js`, `v78.css` |

## SQL sırası ve veri güvenliği

- Temel kurulum: `supabase-setup.sql`; sonra kullanılan modüllerin sürümlü `*-update.sql` dosyaları.
- Güncel karakter yaratımı `character_create_player_v53`; Cleric kimliği `character_choices_set_v52`; build seçimleri `character_build_set_v30` kullanır.
- Oyuncu savaş hareketi `battle_token_move_v60` ile sunucuda oturum, sahiplik, sıra, engel ve hız açısından doğrulanır.
- Oyuncunun kendi parasını yok etmesi `wallet_discard_v61` ile oturum, üyelik, bakiye ve satır kilidi kullanılarak doğrulanır.
- Çok turlu market pazarlığı, son fiyat kilidi ve DM işlem logu `v69-update.sql`; sessiz pazarlık bildirimi ile iki taraflı kapalı geçmiş temizliği `v70-update.sql` içindedir.
- Oyuncuya özel, mekanik etkisiz başarımlar `campaign_achievements_v73` tablosunda; token doğrulamalı liste/verme/geri alma akışı `v73-update.sql` içindedir.
- Kumarhane ayarları, oyunlar, masalar ve bahisler kampanya JSON’undan ayrı v77 tablolarındadır. `casino_action_v77` oturumu/rolü doğrular; cüzdan çekimi, ödeme ve iptal iadesini kilitli ve tekrar gönderim korumalı transaction ile yapar.
- XP, karakterin kampanya JSON nesnesindeki `xp` ve `xpHistory` alanlarında tutulur; yalnız DM arayüzü mevcut `campaign_save_v31` hattı üzerinden kalıcı değişiklik yapar. Yeni SQL gerekmez.
- `v31-update.sql` kampanya JSON birleştirme hattının esas güvenli kayıt katmanıdır; lokal özellik değişikliklerinde sebepsiz değiştirilmemelidir.
- Yeni sürüm eklerken `config.js`, `index.html`, `README.md`, gerekirse `guide-v26.txt` ve `v37.js` sürüm numarası birlikte kontrol edilir.

## Lokal değişiklik rotası

- Class/species/stat/ability: önce `v53-data.js` + `v53.js`.
- Skill/proficiency/ASI/feat: önce `v30.js`.
- Spell içeriği: önce `v47-data.js`; karaktere erişim/seçim kuralı: `v53.js`.
- Cleric/deity/domain: `v52-data.js` + `v52.js`.
- Item/loot: ilgili veri dosyası + `v44.js`; ekipman bonusuysa `v45.js`/`v46.js`.
- Combat map: `v38-battle.js`; quest: `v50-data.js`/`v50.js`.

Yalnız doğrudan ilgili rota ve bağımlılıklar incelenir; açık bir proje-geneli audit talebi yoksa diğer modüllere dokunulmaz.
