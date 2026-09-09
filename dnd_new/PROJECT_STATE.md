# Proje Durumu

Son doğrulama: **2026-09-09**
Referans branch: `main`
Profesyonel baseline: `0ed6a2a` (`chore(website): establish professional baseline v2.5.0`)

## Aktif durum

- Canlı hedef: **3.6.0 / v75 / Build 75**; Build 74 ve SQL’i uygulanmış güncel `main` temel alınmıştır.
- Giriş noktası: `index.html`
- İlk yüklenen çekirdek: `config.js`, ardından `ui-state-manager.js`, `app.js`, `expansion.js`, `progression.js`, `admin.js`, `session.js`
- Ek sürüm modülleri `config.js` içindeki sıralı listeden, `window.load` sonrasında yüklenir.
- Veri katmanı: Supabase RPC + kampanya JSON state'i
- Ana kayıt güvenliği: `v31.js` ve `v31-update.sql` birleştirme hattı
- Aktif karakter yaratımı RPC'si: `character_create_player_v53`
- Kampanya sesli sohbeti: `voice.js` + Supabase `livekit-token` Edge Function + LiveKit Cloud
- Ses erişimi: ham değeri yalnız istemcide bulunan, veritabanında SHA-256 özeti tutulan `account_sessions_v54`
- Admin erişimi: bcrypt özeti + yalnız service-role erişimli RPC'ler + Supabase `kadim-admin` Edge Function
- Karakter silme: DM doğrulamalı atomik `character_delete_dm_v56` RPC'si
- Ses moderasyonu: DM tarafından LiveKit `canPublish` / `canSubscribe` izin yönetimi
- Ses toparlama: mikrofon sonrası playback başlatma + autoplay düğmesi + görünürlük/reconnect kurtarma akışı
- DM susturma dönüşü: oyuncunun önceki mikrofon tercihini koruyarak permission değişiminde otomatik track yeniden yayını
- Cleric seçim RPC'si: `character_choices_set_v52`
- Build seçim RPC'si: `character_build_set_v30`
- NPC lonca üyeliği, para kesesi ve tüm özellik alanlarını koruyan envanteri kampanya state'inde tutulur.
- Spell slot kullanımı `spellSlotsUsed` alanında tutulur; DM tablosu ve Long Rest aynı alanı kullanır.
- Hazır taktik içerik: 51 map, rütbe kopyalarından arındırılmış yaratık kataloğu, 24 ayrı boss ve genişletilmiş arazi/obje paleti.
- Build 59 yaratıkları ansiklopedi için eksik detay alanları güvenli varsayılanlarla tamamlanarak açılış hatasından korunur.
- Oyuncu, yalnız aktif sırasındaki kendi savaş tokenını kalan hızı kadar hareket ettirebilir; yetki ve mesafe `battle_token_move_v60` RPC'sinde doğrulanır.
- Taktik savaş tahtası sağ sütunun genişliğini kare oranını koruyarak doldurur ve yerel zoom sunar; DM paleti ile seçili öğe detayları soldaki tek kaydırılabilir rayda üst üste gösterilir.
- Oyuncu kendi kesesinden seçtiği parayı geri alınamayacak biçimde yok edebilir; `wallet_discard_v61` oturum ve sahipliği sunucuda doğrular.
- Geç yüklenen `v27.js`, Kesem ekranındaki para yok etme kontrolünü artık ezmez.
- Ganimet kataloğu yüzeysel kombinasyonları temizlenerek 2.181 tekrarsız kayda indirildi; v63 caster paketi, 36 class-özel v64 ekipmanı ve 27 tekil v65 emaneti korunur.
- Kuşanılmış ve class şartı sağlanan `magicBonus`, Spell Attack ve Spell Save DC hesaplarına `v63SpellBonus` üzerinden eklenir.
- `v64-data.js` 40 mantıksal yaratık, 24 boss, 36 class ekipmanı ve 30 dengeli market ürünü sağlar; `v64.js` Bosslar sayfası, NPC varlık paneli ve veri kaybetmeyen market seed v6 geçişini uygular.
- Büyücü Dükkânı kale hizmet tierlerine bağlanır; büyü materyalleri ayrıca Genel Eşya, Simyacı ve Tapınak raflarına dağıtılır.
- `v65-data.js`, dokuz büyü kullanan class için üçer tane olmak üzere 27 özgün isimli, attunement isteyen ve markette yalnız 1 stok bulunan emanet sağlar; market seed v7 mevcut fiyat/stokları ezmeden yalnız eksik kayıtları ekler.
- `v66-data.js`, kullanılabilir kutsal/arcane/druidic/instrument odakları, class pelerin/asa/cübbeleri ve bedelli büyü materyallerini market seed v8 ile ekler.
- Oyuncu market sepetini DM'e teklif olarak yollar; oyuncu ile DM kilitlenmemiş karşı tekliflere sırayla yanıt verebilir. DM normal fiyatın üstünde/altında teklif verebilir ve fiyatı pazarlığa kapatabilir. Para, stok ve envanter yalnız son kabulde atomik güncellenir.
- Market karşı teklif ve sepet taslakları otomatik yenilemede korunur; aktif alan düzenlenirken çizim ertelenir, cüzdan/teklif sonucu değişmediyse gereksiz yeniden çizim yapılmaz.
- `v70-update.sql`, market pazarlığı bildirim tetikleyicisini kaldırır. Market teklifi, karşı teklif, kabul, ret ve iptal bildirim üretmeden Market sayfasından izlenir.
- `market_order_clear_history_v70` DM için kampanyadaki tüm, oyuncu için yalnız kendine ait kapanmış teklif kayıtlarını temizler.
- `campaign_audit_log_v69` yalnız DM'in okuyabildiği, bildirim üretmeyen işlem geçmişini tutar. Market alımı, para/eşya aktarımı, yere bırakma/alma, para silme, NPC ve ganimet hareketleri kaydedilir; DM listeyi temizleyebilir.
- Oyuncu kendi envanterinden NPC'ye eşya gönderebilir; bütün para işlemleri Kesem'deki tek Para İşlemleri alanında toplanır. `npc_transfer_v66` oturum, sahiplik, adet ve bakiye doğrular.
- v67, eski `Kutsal Sembol` ve `Gezgin Kutsal Sembolü` kayıtlarını veri taşımadan hem istemcide hem `equipment_slot_v45` RPC zincirinde büyü odağı olarak tanır.
- NPC'ye eşya aktarımı, aktif `v46` envanter kartının işlem alanına doğrudan bağlanır; eski renderer sırası düğmeyi artık gizlemez.
- Oyuncu büyü paneli kuşanılmış odağı ve hazırlanmış büyülerin özel materyal gereksinimlerini gösterir.
- Anlaşma mesajları `pact_notify_v59` trigger'ıyla ilgili DM veya oyuncuya bildirim üretir.
- `ui-state-manager.js`, Supabase yenilemeleri sırasında dirty/aktif alanları, açık details/modal/sekme durumunu ve scroll konumunu korur; sayfa bağımlılıkları alakasız server-state değişikliklerinde full render'ı engeller.
- `v73.js`, DM’in bir veya birden fazla oyuncuya verdiği mekanik etkisiz başarımları ayrı Hatıra Arşivi sayfasında gösterir. `v73-update.sql`, oyuncunun yalnız kendi kayıtlarını görebildiği token doğrulamalı RPC’leri ve RLS korumalı ayrı tabloyu sağlar.

## Build 75 çalışma rotası

- `v75-core.js`: ilişki türleri, puan bantları, geriye uyumlu normalizasyon, çift anahtarı ve filtre kuralları.
- `v75.js`: DM ilişki editörü, gerekçeli puan geçmişi, karakter/NPC dizini ve oyunculara açık ayrıntılı parti föyleri.
- `v75.css`: masaüstü ve telefon için ilişki kartları, filtreler, editör ve parti stat düzeni.
- İlişkiler `state.relationshipsV75` içinde kararlı kimliklerle tutulur ve `v31` üç yönlü kampanya birleştirmesini kullanır. Yeni SQL gerekmez.

## Build 74 çalışma rotası

- `v74-core.js`: ortak slot, sınıf kaynağı, seçili/domain büyüsü ve süre kuralları; `v59.js` slot tablosu bu hesabı paylaşır.
- `v74.js`: tek kampanya/hesap kapsamlı yükleyici ve tekrar gönderim korumalı işlem kuyruğu; Belgeler, Topluluklar, Dinlenme Faaliyetleri sayfaları.
- `v74-combat.js`, `v74.css`: savaş sekmeleri, büyü kullanımı, sınıf kaynakları, DM atış istekleri ve etki takibi. `v51.js` menü gruplarına bağlar.
- `style.css`, `mobile.css`, `v27.css`, `v51.css`: ana menü yerleşimi/kaydırma stilleri `#appShell>aside` ile sınırlıdır; savaş içindeki `aside` panellerini taşırmaz.
- `v74-update.sql`: ayrı RLS kapalı erişimli araç/kural tabloları, token RPC’leri ve kampanya HP/sıra değişimi tetikleyicisi. Canlı Supabase projesine uygulanmıştır.
- `scripts/build-v74-rules.cjs` ilgili mevcut kataloglardan sunucu meta verisini üretir; hem kurulum SQL’ini hem CLI migration’ını günceller. SQL içindeki generated bölümü elle düzenleme.
- `RELEASE_V74.md`: v74 yedek SHA/branch, rollout, geri dönüş ve test sınırları.

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
- `npm ci && npm test`: ortak UI state, başarımlar, v74 kuralları, v75 ilişki kuralları ve izole PGlite/Postgres entegrasyon testleri. Test fixture gerçek Supabase bağlantısı açmaz; v66 token çözümü yerel test oturumlarıyla temsil edilir.
- `config.js` içindeki Supabase publishable/anon anahtarı istemci anahtarıdır; güvenlik RLS politikalarına bağlıdır. Service-role anahtarı repoya konmamalıdır.

## Sonraki çalışma kuralı

Yeni bir görevde bütün repo taranmaz. Önce `PROJECT_INDEX.md` içindeki rota seçilir; yalnız ilgili dosyalar, `config.js` yükleme sırası ve doğrudan çağrılan RPC/state alanları okunur. Proje-geneli audit ancak açıkça istendiğinde yapılır.
