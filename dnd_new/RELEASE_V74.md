# Build 74 / 3.5.0 — teslim ve geri dönüş

## Durum

- Kod `feat/adventure-v74` branch’inde hazırlanır; canlı `main` henüz değiştirilmedi.
- Başlangıç ve uzak yedek SHA: `103bf17ea6ef83c2e26ea147bd6c741eeceb143d`.
- Uzak yedek branch: `backup/main-before-adventure-v74-20260908`.
- Canlı Supabase projesi: `okxtjzyudhsvenetpmin`.
- Canlı `adventure_tools_v74` migration isteği otomatik onay incelemesinde reddedildi. Gerekçe: security-definer RPC, kampanya tetikleyicisi ve cüzdan/karaktere dokunan işlemlerin üretimde geniş etki alanı. Bu yüzden canlı DDL çalışmadı. Açık canlı uygulama onayı gerekiyor.
- Kod, yedek, kurulum SQL’i ve testler onaya hazırdır. Bu branch SQL uygulanmadan `main`e birleştirilmemelidir.

## Değişen davranış

Oyuncu savaş ekranında harita/hareket ve büyü/sınıf sekmeleri vardır. Büyü kullanımı mevcut `spellSlotsUsed` alanını günceller. Yeni sınıf kaynakları `character.resources.v74_*` anahtarlarını kullanır; eski anahtarlar korunur. Mystic Arcanum normal pact slotundan ayrıdır. Artificer’ın 1. seviye slotu düzeltilmiştir.

DM atış isteği gönderebilir, belgeleri seçili oyuncularla paylaşabilir, topluluk itibarını değiştirebilir, dinlenme faaliyetlerini onaylayıp sonuçlandırabilir. Süreli etkiler ve konsantrasyon takip edilir. Hasar/şifa, isabet, aksiyon ekonomisi, pahalı/tüketilen büyü bileşenleri ve öyküsel eğitim sonuçları DM çözümlemesidir.

## Veri değişikliği

- `campaign_tools_v74`: kampanya başına etkiler, atışlar, belgeler, itibar, faaliyetler ve kullanım geçmişi. RLS etkin; `anon`/`authenticated` için doğrudan tablo erişimi yok.
- `adventure_rules_v74`: mevcut 319 büyü ve sınıf kataloglarından üretilen slot/süre/kaynak meta verisi. İstemci doğrudan değiştiremez.
- `tools_load_v74`: üyelik ve oturum doğrulaması; oyuncuya kendi kayıtları ve açık belgeler gelir. Gizli atışın sonucu/DC’si ve DM belge notu RPC yanıtından çıkarılır.
- `tools_action_v74`: rol/sahiplik doğrulaması, kampanya → araçlar → cüzdan kilit sırası, tekrar gönderilen istekler için işlem kimliği. Faaliyet tamamlama maliyet, malzeme, ödül ve DM audit kaydını tek transaction’da işler.
- `campaign_combat_tools_v74`: eski HP ve sıra düğmeleri dahil kampanya state değişiminden süre/konsantrasyon takibi. Yeni sistem eski kampanya JSON’undaki etki alanlarını yeniden adlandırmaz.
- Migration mevcut hesapları, kampanyaları, karakter/eşya kimliklerini silmez veya topluca taşımaz.

## Onaydan sonra yayın sırası

1. Uzak `main` tekrar kontrol edilir. Yeni commit varsa özellik branch’i güncel main üzerine alınır ve etkilenen testler tekrarlanır.
2. `supabase/migrations/20260908121357_adventure_tools_v74.sql` uygulanır. `v74-update.sql` aynı içeriği taşır; iki farklı migration gibi uygulanmaz.
3. Supabase security/performance advisor yeni v74 nesneleri açısından kontrol edilir. Sentetik hesap/kampanya ile transaction içinde smoke test yapılıp rollback edilir; gerçek oyuncu kayıtlarında deneme yapılmaz.
4. Özellik branch’i `main`e birleştirilir; cache anahtarı 74’tür. GitHub Pages dağıtımı ve yüklenen dosyalar doğrulanır.
5. `PROJECT_STATE.md` ve bu belgedeki bekleme durumu gerçek yayın durumuyla güncellenir.

## Geri dönüş

GitHub’da yedek branch eski arayüzün tamamını korur. Yalnız v74 yayın commitini geri alan bir **revert commit** tercih edilir; daha sonra gelen ilgisiz commitler kaybedilmez. SQL eklemelidir; v74 tablolarını düşürmek gerekmez ve içlerindeki yeni belgeler/faaliyetler korunabilir.

Kampanya kaydında tetikleyici kaynaklı hata çıkarsa önce aşağıdaki geri alınabilir SQL ile yalnız yeni tetikleyici durdurulur (canlı SQL için gerekli onayla):

```sql
alter table public.campaigns disable trigger campaign_combat_tools_v74;
```

Bu işlem mevcut karakter, para veya belge verilerini geri sarmaz. Yedek arayüz kullanılırken yeni araç RPC’leri devre dışı kalmalıdır; eski istemcinin kullanmadığı yeni tablolar korunur. Daha önce tamamlanan faaliyet bedelleri/ödülleri geçmişten bilinçli olarak düzeltilebilir; otomatik toplu ters işlem uygulanmaz.

Tekrar açma, düzeltme ve test sonrası:

```sql
alter table public.campaigns enable trigger campaign_combat_tools_v74;
```

## Doğrulama

`npm ci && npm test` ile 40 test geçer. Bunlar 25 yerel PostgreSQL entegrasyon senaryosu, 8 ortak kural testi, 6 önceki başarım testi ve içinde 15 kontrol olan ortak UI-state test dosyasını içerir. Migration tekrar uygulanabilirliği, rol/erişim, gizli belgeler/atışlar, karşılaşma sırası, slot yarışları, idempotency, eski v31 save ile birlikte çalışma, konsantrasyon, pact/arcanum, kaynak dinlenmesi ve atomik faaliyet teslimi kapsanır.

Yerel veritabanı PGlite/PostgreSQL’dir. Mevcut v31 merge/save ve v69 audit SQL’i aynen çalıştırılır. Oturum çözümleyicisi sentetik yerel tokenlarla temsil edilir; canlı Supabase/Realtime/oturum altyapısının tamamı taklit edilmez. PGlite tek bağlantı kuyruğu kullanır; iki bağımsız canlı Postgres bağlantısında yük/stres testi yapılmış sayılmaz.

Tarayıcı fixture’ı gerçek üretim JS/CSS yükleme zincirini ve yeni SQL RPC’lerini kullanır; gerçek Supabase/LiveKit bağlantısı açmaz. Fiziksel iOS/Android ve sesli sohbet donanımı bu değişiklik kapsamında test edilmez. Canlı SQL ve GitHub Pages yayını onay beklediği için canlı uçtan uca doğrulama tamamlanmış sayılmaz.

### Tarayıcı gözlemleri

- Gerçek üretim yükleme zinciriyle oyuncu Harita / Büyüler sekmeleri, Life domain otomatik büyüleri ve ikinci seviye Bless kullanımı denendi; slot 3/3 → 2/3 oldu.
- DM’nin yalnız kendisinin göreceği atış isteği oyuncunun harita ekranına geldi; atıştan sonra oyuncuda yalnız “Sonuç DM’ye iletildi” göründü.
- DM’nin seçili Oğuzhan’a yayınladığı belge kaydoldu ve oyuncu tarafından açıldı; gizli DM notu görünmedi. Alıcı dışındaki hesabın erişememesi ayrıca PostgreSQL testinde doğrulandı.
- Topluluk oluşturma ve gerekçeli +15 grup itibarı formdan kaydedildi.
- Oyuncu iki günlük, 1 GP maliyetli ve iki malzemeli faaliyet talebi oluşturdu; DM talebi gördü, 3 GP + katalog eşyası ödülünü onayladı ve günleri ilerletti. Son teslimin tarayıcı onay penceresinde uzak tarayıcı bağlantısı zaman aşımına uğradı; bu son tıklamanın tarayıcı doğrulaması tamamlanmadı. Teslim, maliyet/ödül, tekrar tıklama ve hata halinde geri alma SQL entegrasyon testlerinde geçti.
- 320 / 390 / 768 / 1366 piksel çerçevelerde Topluluklar sayfasının içerik genişliği görünür genişliği aşmadı; yeni görünür düğmeler en az 44 px yüksekliğindeydi. 390 px faaliyet formu görsel olarak incelendi; bütün girişler ve gönder/vazgeç kontrolleri kaydırılarak erişilebilirdi.
- Testte bulunan eski genel `aside` seçicisi, savaş paleti ve token detay panelini mobil menünün üzerine taşıyordu. Ana menü stilleri `#appShell>aside` ile sınırlandı; düzeltmeden sonra hem DM hem oyuncu savaş ekranından yeni sayfalara menü üzerinden geçebildi.
- Market/sesli sohbetin canlı işlemleri veya bütün eski sayfalar için tam tarayıcı regresyonu yapılmış sayılmaz. Test kapsamı yeni akışlar, ortak kayıt katmanı ve önceki otomatik testlerdir.
