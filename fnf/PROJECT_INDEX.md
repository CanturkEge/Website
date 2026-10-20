# FNF proje haritası

Bu dosyadan başla. `fnf/` dışına yalnızca istenen karşılaştırma için çık; D&D kodunu FNF'ye kopyalama. Önce `rg -n 'aranan_ad' fnf/`, sonra ilgili küçük bölümü oku.

| İhtiyaç | Dosya / giriş noktası |
| --- | --- |
| Sayfa yükleme, script sırası | `index.html` |
| Renkler, sol menü, düzen | `style.css` (`:root`, `#sidebar`, `.game-mode`) |
| Tür, yol, uzmanlık, nitelik, beceri ve ekran metinleri | `game-data.js` |
| Oturum, oda, yönlendirme, render akışı | `app.js`: `refreshRooms`, `openRoom`, `render`, `renderSidebar` |
| Kayıt, eski hesaba kullanıcı adı, giriş, oda kurma/katılma | `app.js`: `renderAuth`, `renderLegacyClaim`, `renderLobby` |
| Karakter oluşturma ve görüntüleme | `app.js`: `renderCreation`, `renderGame` içindeki `character` dalı |
| Gün akışı, tarla, ansiklopedi | `app.js`: `renderGame`, `renderFarm`, `renderCodex`; sunucu kuralları `v04-farming-day-codex.sql` |
| Kampanya yedekleme, geri yükleme, silme | `app.js`: `renderLobby`, `renderGame`; SQL `v05-campaign-backup.sql` |
| Köyler, davetler, üye yetkileri | `village.js`, `village.css`; sunucu `v08-villages-permissions.sql` |
| 20 kare parseller, su ve kamp başlangıcı | `parcels.js`, `parcels.css`, `v09-parcels-camps.sql` |
| Köy yapıları, adaylar, NPC işleri | `village-ops.js`, `village-ops.css`, `v10-village-ops.sql`; üretim onarımları `v11`–`v13` |
| Yerleşim, ahır, pazar, araştırma, keşif | `world-systems.js`, `world-systems.css`; sunucu `v06-world-systems.sql`, hazırlık `v08-villages-permissions.sql` |
| Ansiklopedi çizimleri | `assets/codex/*.svg`; katalog ve kilit durumu veritabanında |
| Sürüm notu içeriği / arayüzü | `patch-notes.js` ve `CHANGELOG.md` / `app.js`: `renderPatchNotes` |
| Auth kayıt sunucusu | `functions/fnf-auth/index.ts` (`register`, `claim`) |
| Veritabanı ve yetkiler | `schema.sql`, `v02-update.sql`, `v03-username-auth.sql`, `v04-farming-day-codex.sql`, `v05-campaign-backup.sql`, `v06-world-systems.sql` |
| Canlı kuralların özeti | `GAME_DESIGN.md` |
| 20 Ekim görüşmesi, sonraki hedef kurallar ve açık sorular | `DESIGN_DECISIONS_2026-10-20.md` |
| Kurulum ve sınırlar | `README.md` |

## Canlı akış

`egecanturk.dev/fnf/` → `index.html` → `config.js` + `game-data.js` + `patch-notes.js` + `app.js` + `world-systems.js` / `world-systems.css`. Aynı GitHub deposunda, D&D'den ayrı Supabase projesi ve ayrı `fnf-auth-v1` oturumu vardır. Kimlik anahtarı `config.js` içindeki **yayınlanabilir** anahtardır; yetkili anahtar ve kurucu şifresi repoda bulunmaz.

v0.10.0 veritabanı geçişleri v08–v13 uygulandı. Köy, parsel ve köy işleri kendi RPC'leriyle; eski yerleşim durumu `fnf_sim_snapshot` ile yürür.

Kullanıcı adıyla kayıt Edge Function üzerinden davetsiz yapılır; giriş Supabase Auth ile olur. Oda kurucusu `dm`, kodla katılan kişi `player` olur. DM karakter açmaz. Oda/karakter/tarla/keşif yazmaları sunucuda doğrulanan RPC'lerle yapılır; tarayıcı tabloları doğrudan değiştirmez. Eski, onaylı e-posta hesabı bir kez girip kullanıcı adı alabilir.

DM yedeği JSON indirilir; yükleme şifre kapısından geçerek yeni kodlu oda açar. Karakterler aynı kullanıcı kimliği yeni odaya katılınca geri gelir. Silme oda adını aynen ister ve oda altındaki veriyi kaldırır.

## Değişiklik ritmi

1. Yalnızca ilgili dosyayı ve bu haritayı oku. Veri alanı/kural değişiyorsa SQL doğrulamasını da birlikte değiştir.
2. Gerçekten tamamlanan özellik için `patch-notes.js` ile `CHANGELOG.md`'yi aynı sürümde tut. Taslak ekranları oynanabilir diye yazma.
3. İlgili JS dosyalarını tek tek `node --check` ile kontrol et; sunucu kuralı değiştiyse ilgili Supabase sorgusunu çalıştır. GitHub Pages yayınını canlı URL'de kontrol et.
4. Menüye her alt özellik için yeni sekme ekleme; yerleşim, tarım ve keşif altındaki küçük panellerle büyüt.

Son doğrulama: 20 Ekim 2026. Gerçek hesapla tüm kayıt/oyun akışı uçtan uca denenmedi; eski onaysız e-posta hesabı otomatik etkinleştirilmedi. Bu dosyayı sonraki değişiklikte güncel tut.

20 Ekim görüşmesinden ilk uygulama dilimi köy kurma, davet/başvuru, ayrı yetkiler, 20 günlük mevsim, 20 kare parseller ve günlük NPC işidir. Şehir pazarları, tarif bazlı üretim ve NPC aileleri hâlâ tasarım hedefidir.

v0.7.0 SQL geçişi üretime uygulandı. DM gün geçişi, yapı, ticaret ve tarla işlemleri geri alınan veritabanı denemelerinde çalıştı; oyuncu DM eylemine erişemedi. Gerçek hesapla tüm oyun akışı, eski yedeğin şifreli geri yüklenmesi ve mobil ekran uçtan uca denenmedi; ilk oyun raporuyla incele.

## Taslak geçiş sırası

v08 → v09 → v10 → v11 → v12 → v13 sırası zorunludur. İlk üçü yeni sistemleri, son üçü üretim RPC doğrulama düzeltmelerini taşır. JSON yedek zinciri genişletildi; eski kayıtlar korundu. Köy, parsel, yapı, iş, DM gün geçişi ve yedek üretimde geri alınan işlemlerle kontrol edildi; gerçek tarayıcı hesabı ve şifreli yükleme uçtan uca sınanmadı. README.md içindeki dağıtım notlarına bak.
