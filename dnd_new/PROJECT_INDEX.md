# Kadim Masa Defteri — Proje İndeksi

Güncel sürüm: **v53 / uygulama v2.5 / Build 53**  
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
| Büyü hazırlama veya büyü kuralı | `v53.js`, hedef büyü için `v47-data.js` | `v47.js`, `v52.js` |
| Cleric/tanrı/domain | `v52.js`, hedef tanrı/domain için `v52-data.js` | `v49-data.js`, `v52-update.sql` |
| Envanter/kuşanma/aktarım | `inventory-actions.js`, `v45.js`, `v46.js` | `v31.js`, `inventory-update.sql` |
| Market/loot/eşya kataloğu | hedef veri için `v44-data.js` veya `v48-data.js` | `v34.js`, `v44.js` |
| Görev panosu | `v50.js`, hedef görev için `v50-data.js` | eski `state.quests` için `app.js` |
| Harita/kale | `v32.js`, `v33.js` | `v34-data.js`, `Map.png` yalnız görsel gerekirse |
| Yol/binek/seyahat | `v38.js`, `v38-data.js` | `v34-data.js` |
| Taktik savaş | `v38-battle.js`, `v38.css` | encounter state'i için `app.js`, `v31.js` |
| Karma/adalet/alignment | `v44.js`, `v51.js` | `v51-data.js` |
| Notlar/oturum/bildirim | `session.js` | `session-update.sql`, hedef state için `app.js` |
| Sürüm notları | `CHANGELOG.md`, `v37.js` | `config.js`, `PROJECT_STATE.md` |

## Çekirdek

| Sistem | Ana dosyalar | Doğrudan bağımlılıklar |
|---|---|---|
| Başlangıç, hesap, kampanya state'i, ana sayfalar | `index.html`, `config.js`, `app.js` | Supabase JS, sürüm scriptleri |
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
| Eşya/loot ana veri kümeleri | `v34-data.js`, `v36-data.js`, `v44-data.js`, `v48-data.js` | `v34.js`, `v44.js` |
| Kuşanma, slotlar, sürekli bonuslar | — | `inventory-actions.js`, `v31.js`, `v45.js`, `v46.js` |
| Envanter görünümü ve karakter föyü | — | `v46.js`, `v46.css` |

## Dünya ve oyun yönetimi

| Sistem | Ana dosyalar |
|---|---|
| Harita ve kaleler | `v32.js`, `v33.js`, `v34-data.js` |
| Yollar, seyahat ve binekler | `v38.js`, `v38-data.js` |
| Taktik savaş alanı | `v38-battle.js`, `v38.css` |
| Gelişmiş yaratık/DM müdahalesi | `v27.js`, `v41.js` |
| 200 görevlik görev panosu | `v50-data.js`, `v50.js`, `v50.css` |
| Karma, adalet, alignment ve ilahi düzen | `v44.js`, `v51-data.js`, `v51.js` |
| Sürüm notları | `v37.js`, `v37.css` |

## SQL sırası ve veri güvenliği

- Temel kurulum: `supabase-setup.sql`; sonra kullanılan modüllerin sürümlü `*-update.sql` dosyaları.
- Güncel karakter yaratımı `character_create_player_v53`; Cleric kimliği `character_choices_set_v52`; build seçimleri `character_build_set_v30` kullanır.
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
