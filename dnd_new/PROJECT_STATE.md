# Proje Durumu

Son doğrulama: **2026-09-23**
Referans branch: `main`
Profesyonel baseline: `0ed6a2a` (`chore(website): establish professional baseline v2.5.0`)

## Aktif durum

- Canlı hedef: **3.10.1 / v82 / Build 82**; Build 81 güncel `main` commit'i temel alınmıştır.
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
- Wizard büyü kitabı `spellbookSpells`, günlük hazırlık ve cantripler `preparedSpells` alanında tutulur. Eski Wizard kayıtları ilk kayıtta kitaba geriye uyumlu taşınır.
- `wizard_spellbook_set_v81`, `wizard_ritual_cast_v81` ve `wizard_arcane_recovery_v81` güvenli oturum, kampanya üyeliği ve karakter sahipliğini sunucuda doğrular.
- Oyuncu normal zamanda yalnız bilinen cantriplerini ve kitabındaki büyüleri görür. Kitap/cantrip değişikliği DM'in tek kullanımlık iznine, günlük hazırlık uzun dinlenmeye, Arcane Recovery kısa dinlenmeye bağlıdır.
- `wizard_rest_v82` ve `wizard_spellbook_unlock_v82` yalnız kampanya DM'i tarafından çalıştırılabilir; izinler başarılı kayıt veya kullanımdan sonra tüketilir.
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
- `v77.js`, DM’in açıp kapattığı Kadim Şans Salonu’nda dört tek kişilik ve iki çok oyunculu varsayılan oyun sunar. DM bahis sınırı, çarpan, çark dilimi, kasa payı ve masa kapasitesini düzenleyebilir.
- Kumarhane bahisleri `campaign_wallets` ile atomik çalışır; aynı işlem kimliği iki kez ücretlendirilmez. Ortak masa iptali bütün bekleyen bahisleri aynı transaction içinde iade eder.
- Karakter seviyesi milestone veya elle seviye düğmesi yerine toplam `xp` değerinden 1–20 eşiklerine göre otomatik belirlenir.
- Eski, XP alanı bulunmayan karakterler mevcut seviyelerinin taban XP’siyle açılır; `xpHistory` son 50 gerekçeli DM işlemini kampanya state’inde tutar.
- Sürüm Notları üst özeti, aralık metni ve açık kartı `V37_PATCH_NOTES` içindeki en yüksek sürümden otomatik belirlenir; Build 78 görünüm hotfix’i `v78.1` cache anahtarıyla dağıtılır.
- Ganimet sandıkları yalnız para vermez; ilk eşya kalite tabanına ve ödül kategorisine bağlıdır. Kalite artışı aday eşya seviyesine de uygulanır, çöp ağırlığı azaltılır ve nadirlik eğrisi oyuncu lehine yükseltilir.

## Build 82 çalışma rotası

- `v81.js`, `v81.css`: kilitli normal kitap görünümü, uzun dinlenme hazırlık hakkı, kısa dinlenme Arcane Recovery hakkı ve DM kitap düzenleme kumandası.
- `v82-update.sql`: mevcut v81 kayıt RPC'sini izinlerle sertleştirir; DM doğrulamalı Wizard dinlenme ve kitap açma RPC'lerini ekler.
- `supabase/migrations/20260921233000_wizard_rest_locks_v82.sql`: v82 canlı migration kaydı.
- `tests/v81-wizard.test.cjs`: kilitli katalog, ayrık hazırlık/kitap izinleri ve SQL dinlenme bağları dahil sekiz test.
- Mevcut Wizard kitap/cantrip/hazırlık verileri taşınmaz veya silinmez; yeni tablo eklenmez.

## Build 81 çalışma rotası

- `v81-core.js`: Wizard kitap/hazırlık limitleri, eski kayıt normalizasyonu ve kopyalama maliyeti için saf kurallar.
- `v81.js`, `v81.css`: Büyü Kitabım / Bugün Hazırladıklarım ayrımı, parşömen veya kitaptan kopya kaydı, ritüel kullanımı ve Arcane Recovery arayüzü.
- `v81-update.sql`: oyuncunun kendi Wizard karakterine bağlı kitap/hazırlık kaydı, slotsuz ritüel logu ve sınırlı slot geri kazanımı için token doğrulamalı RPC'ler.
- `tests/v81-wizard.test.cjs`: eski kayıt koruması, kitap-hazırlık alt kümesi, seviye/INT sınırları, kopyalama maliyeti ve katalog erişimi testleri.
- Mevcut karakter, envanter, XP, büyü slotu ve kampanya kimlikleri korunur; ayrı tablo eklenmez.

## Build 79 çalışma rotası

- `v44-data.js`: sandık eşya garantisi, ilk kaliteli ödül tabanı, kaliteyle genişleyen aday havuzu, yeni nadirlik ve kategori ağırlıkları.
- `v44.js`: DM’e hangi kalitenin hangi asgari nadirliği garanti ettiğini gösteren güncel açıklama.
- `tests/v79-loot-balance.test.cjs`: bütün gerçek sandık türleri ve kalite seviyelerinde deterministik eşya/ödül garantisi, nadirlik ilerlemesi, zorlanmış DM ödülü ve cache zinciri testleri.
- Mevcut eşya ID’leri, envanterler, geçmiş kayıtları ve cüzdanlar korunur; yeni SQL gerekmez.

## Build 78 çalışma rotası

- `v78-core.js`: 1–20 XP eşikleri, eski karakter normalizasyonu, ilerleme hesabı ve saf XP işlem/geçmiş kuralları.
- `v78.js`, `v78.css`: oyuncu XP göstergesi; DM ekleme/çıkarma/ayarlama/geri alma ve toplu parti ödülü; telefon görünümü.
- `tests/v78-*.cjs`: eşik sınırları, geriye uyumluluk, seviye değişimi ve rol bazlı arayüz bağları.
- `tests/v37-patch-notes.test.cjs`: en güncel sürümün üst özet, sürüm aralığı ve varsayılan açık kartta otomatik gösterilmesini doğrular.
- XP mevcut karakter nesnesinde ve `campaign_save_v31` hattında saklanır; yeni SQL veya ayrı tablo gerekmez.

## Build 77 çalışma rotası

- `v77-core.js`: para/çarpan biçimi, oyun türleri, seçimler ve sonuç etiketleri.
- `v77.js`, `v77.css`: DM salon kumandası, oyun ayarları, oyuncu bahisleri, ortak masalar, geçmiş ve telefon görünümü.
- `v77-update.sql`: RLS-korumalı ayar/oyun/tur/bahis/işlem tabloları ile token doğrulamalı yükleme ve atomik işlem RPC’leri; canlı Supabase projesine uygulanmıştır.
- `tests/v77-*.cjs`: saf kural, rol bazlı arayüz ve izole PGlite/Postgres güvenlik/para testleri.
- CLI migration zinciri: temel `20260909171706_casino_v77.sql`, FK indeksleri `20260909175000_casino_v77_fk_indexes.sql` ve dar kapsamlı fonksiyon sertleştirmesi `20260909180000_casino_v77_hardening.sql`.

## Build 76 çalışma rotası

- `v76-core.js`: yedek biçimi doğrulama, güvenli derin kopya, alan tipi kontrolü ve içerik sayımı.
- `v76.js`, `v76.css`, `index.html`: DM dosya seçici, fark özeti, açık onay, otomatik geri dönüş yedeği ve `v31` üzerinden kayıt.
- Eski düz state JSON yedekleri desteklenir. İçe aktarma hesapları, üyeleri ve ayrı SQL tablolarını değiştirmez; yeni SQL gerekmez.

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
- `npm ci && npm test`: ortak UI state, başarımlar, v74 kuralları, v75 ilişki kuralları, v76 yedek doğrulaması, v77 kumarhane ve v78 XP kuralları/arayüzü ile izole PGlite/Postgres entegrasyon testleri. Test fixture gerçek Supabase bağlantısı açmaz; v66 token çözümü yerel test oturumlarıyla temsil edilir.
- `config.js` içindeki Supabase publishable/anon anahtarı istemci anahtarıdır; güvenlik RLS politikalarına bağlıdır. Service-role anahtarı repoya konmamalıdır.

## Sonraki çalışma kuralı

Yeni bir görevde bütün repo taranmaz. Önce `PROJECT_INDEX.md` içindeki rota seçilir; yalnız ilgili dosyalar, `config.js` yükleme sırası ve doğrudan çağrılan RPC/state alanları okunur. Proje-geneli audit ancak açıkça istendiğinde yapılır.
