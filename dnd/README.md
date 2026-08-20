# Kadim Masa Defteri — Kurulum

## v29 — Placeholder Açıklama Temizliği

- Karakter oluşturma önizlemesi, karakter trait kartı ve seviye özellikleri ayrıntılı alt tür/subclass verisine bağlandı.
- `Temasına uygun güç kazanır`, `mirası güçlenir` ve `kesin mekaniği DM belirler` şeklindeki eski otomatik metinler kaldırıldı.
- Subspecies özellikleri seviye 1’de, subclass özelliği ise classın gerçek seçim seviyesinde gösterilir.

v29 yeni SQL gerektirmez.

## v28.1 — Subspecies ve Subclass Gerçek Mekanikleri

- `Türe uygun güç kazanır` gibi belirsiz placeholder açıklamalar kaldırıldı.
- Alt türlerde ability, direnç, hareket, büyü, action/bonus action ve kullanım hakkı açıkça yazıldı.
- Subclasslarda ilk açılan temel mekanikler, kullanılan action/reaction, zar, save ve dinlenmede yenilenme özeti eklendi.
- 2014/5e ile 2024/5.5e ayrımı korundu; homebrew seçenekler açıkça etiketlendi ve ölçülebilir kampanya kuralları verildi.

v28.1 yeni SQL gerektirmez.

## v28 — DM Eşya Aktarımı ve Karakter Ansiklopedisi

- v27.1 açık panel ve kaydırma konumu koruması bu pakete dahildir.
- DM, Karakterler menüsünde bir oyuncunun eşyasını adet seçerek başka karaktere aktarabilir; eşyanın bonusları korunur ve kuşanılmış durumu güvenlik için kapanır.
- Zar Günlüğü başlığına DM için `Geçmişi Temizle` düğmesi geri eklendi.
- Rehbere ayrı `Karakter Ansiklopedisi` bölümü eklendi.
- Ansiklopedi sitedeki bütün species/subspecies ve 2014 class/subclass seçeneklerini listeler; classların 1–20 seviye gelişimi açılır satırlardadır.
- Ansiklopedi araması ve mobil tek sütun görünümü eklendi.

v28 yeni SQL gerektirmez. Zar geçmişi temizleme için önceki paketteki `progression-update.sql` daha önce çalıştırılmadıysa bir kez çalıştır.

## v27.1 — Açık Paneller Korunur

- Bulut eşitlemesi veya arka plan yenilemesi sırasında açık karakter, skill, spell, yaratık, market ve kasa ayrıntıları artık kapanmaz.
- Aynı sayfa yeniden çizildiğinde sayfa ve masaüstü sol menü kaydırma konumu korunur.
- Sayfa değiştirip geri dönüldüğünde o sayfada açık bırakılan ayrıntılar yeniden açılır.

v27.1 yeni SQL gerektirmez.

## v27 — Ekran Ekran UX ve Yaratık Ansiklopedisi

- Masaüstü sol menü kendi içinde kaydırılabilir hale getirildi.
- Karakterler sayfası kompakt özet kartlarına çevrildi; stat, trait, class, subclass, spell ve envanter ayrıntıları kapalı başlar.
- Oyuncu Yetenekler sayfasındaki uzun açıklamalar başlığa basınca açılır.
- Kasa kartları özet görünür; DM para düzenleme alanları karta basınca açılır.
- Market iki bölümlü düzene kavuştu; ürün açıklama ve yönetim araçları kapalı başlar.
- Yaratıklar kategori ve CR filtreli ansiklopediye çevrildi.
- Yaratık kartlarında STR/DEX/CON/INT/WIS/CHA, HP, AC, hız, CR, saldırılar, yetenekler, dirençler, bağışıklıklar ve karşı oyun bilgisi bulunur.
- Hazır yaratık kataloğu Beast, Humanoid, Undead, Ooze, Giant, Dragon, Construct, Aberration ve Monstrosity kategorilerinde genişletildi.
- NPC kartları kompakt/açılır hale getirildi.
- Bütün sayfalara açıklayıcı kısa menü notu ve tutarlı boşluk/buton düzeni uygulandı.

v27 yeni SQL gerektirmez. v26 `guild-update.sql` daha önce çalıştırılmadıysa yalnız onu çalıştır.

## v26 — 2014 Kuralları, Okunabilir Arayüz ve Lonca

- Mevcut karakter, species/subspecies, class/subclass, para ve envanter kayıtları korunur.
- Yeni class/subclass seçimlerinden 2024 ve homebrew sınıf karmaşası temizlendi; eski karakterde kullanılıyorsa seçim gösterilmeye devam eder.
- Seviye düşürme veya düzenleme artık mevcut subclassı otomatik silmez.
- Class özellikleri 2014 akışına göre yeniden düzenlendi; karaktere özel fight kartına silah proficiency, saldırı, hasar, spell attack ve DC eklendi.
- Rehber kısa, aranabilir ve oturum odaklı bir 2014 metnine çevrildi.
- Tüm sayfalarda okunabilirlik, kart, buton, form ve menü aralıkları geliştirildi.
- Mobil sol menüye görünür X kapatma tuşu eklendi.
- Lonca kurma, kodla katılma, çıkma, ortak kasaya para yatırma/çekme ve ortak envantere eşya yatırma/geri alma eklendi.

Bu sürümde yalnızca `guild-update.sql` dosyasının tamamını Supabase SQL Editor'de çalıştır.

## v25.1 — Açıklamalı Yetenek ve Savaş Kartı

- Bütün görünen class özelliklerinde kullanım türü, kaynak, süre ve masada uygulanış alanları bulunur.
- Hazırlanmış spell kartlarında casting time, menzil, süre, V/S/M, slot ve gerçek zar/save çözümü gösterilir.
- Karaktere özel “Nasıl Dövüşürüm?” kartı saldırı bonusunu, hasarı, spell DC’yi ve temel tur akışını otomatik hesaplar.
- Monk/Plasmoid, Druid, Paladin, Rogue ve Fighter için doğrudan oynanış yönlendirmesi vardır.
- 2014, 2024 ve homebrew özellikleri birbirinden ayrılır.

## v25 — Oturum ve Savaş Düzeltme Paketi

- Savaş/skill/AC/büyü rehberi genişletildi.
- Akıllı zar menüsü seçilen skill'in ability ve proficiency bonusunu otomatik yazar.
- Aktif form alanları bulut senkronu tarafından artık sıfırlanmaz.
- Market eşyaları ID ile DM tarafından ücretsiz verilebilir.
- Zırh, kalkan ve stat bonuslu eşyalar kuşanılabilir; AC/stat hesabına uygulanır.
- Oyuncu envanteri açılır kompakt aksiyon menüsüne kavuştu.
- Species/subspecies başlangıç seçimi ve canlı karakter önizlemesi geliştirildi.

Bu sürüm için güncel `inventory-update.sql` dosyasının tamamını SQL Editor'de çalıştır.

Bu sürümde kullanıcı hesabı, kalıcı kampanya üyeliği ve ayrı DM/oyuncu panelleri bulunur.

Karakter oluşturma ve düzenleme penceresinde Species → Subspecies ile Class → Subclass seçimleri birbirine bağlıdır; üst seçim değiştiğinde alt seçenekler anında yenilenir.

Kampanya değişiklikleri Supabase Realtime Broadcast ile diğer açık cihazlara anında bildirilir. Bağlantı kısa süreli kesilirse 30 saniyelik yedek kontrol otomatik olarak devreye girer. Bunun için ek SQL çalıştırmak gerekmez.

## 1. Supabase güncellemesi (zorunlu)

Supabase > SQL Editor > New query aç. `supabase-setup.sql` dosyasının tamamını yapıştır ve **Run** düğmesine bas. `Success. No rows returned` görünmelidir. Eski kampanyalar silinmez.

Önceki sürüm zaten kuruluysa tüm dosya yerine yalnızca `pact-update.sql` içeriğini bir kez çalıştırman yeterlidir. Bu işlem mevcut hesapları, kampanyaları ve kayıtları silmez.

Para, gelişmiş market, otomatik para bozma ve oyuncular arası transfer için güncel `economy-update.sql` dosyasını SQL Editor'de çalıştır. Daha önce çalıştırmış olsan da tekrar çalıştırman gerekir; mevcut para ve kampanya kayıtlarını silmez.

Ortak zar günlüğü, oyuncunun kendi seviye 1 karakterini oluşturması ve tek seferlik subclass seçimi için `progression-update.sql` dosyasının güncel halini SQL Editor'de çalıştır. Önceki sürümünü çalıştırdıysan bunu tekrar çalıştırmak güvenlidir; mevcut kampanya ve karakterleri silmez.

DM kampanya silme ve `admin / Admin27!` sunucu yönetim paneli için `admin-update.sql` dosyasını SQL Editor'de bir kez çalıştır. Bu kurulum mevcut kayıtları silmez; yalnızca silme yetkilerini ve yönetim sorgularını ekler.

Kalıcı genel/özel yazışmalar ve bildirim merkezi için `session-update.sql` dosyasını SQL Editor'de bir kez çalıştır. Karakter onayı, kampanya tarihi, Long Rest ve savaş turu verileri mevcut kampanya kaydının içinde saklanır.

Oyuncuların eşyayı bütün bonuslarıyla başka oyuncuya vermesi, lonca envanterine koyması veya yere bırakması için `inventory-update.sql` dosyasını SQL Editor'de bir kez çalıştır. Yerdeki eşyaları diğer oyuncular alabilir; eşyanın tüm özel alanları korunur.

## 2. GitHub Pages

Bu ZIP içindeki `dnd` klasörünü sitenin kök klasöründeki eski `dnd` klasörünün üzerine kopyala. GitHub Desktop'ta değişiklikleri commit edip pushla. Adres: `https://egecanturk.dev/dnd/`

## 3. İlk kullanım

1. DM, Kayıt Ol ekranından hesap açar.
2. Giriş yaptıktan sonra Kampanya Kur der; otomatik oda kodu oluşur.
3. Oyuncular hesap açar, oda koduyla bir kez katılır.
4. DM > Karakterler ekranında bekleyen oyuncunun adına basıp karakter oluşturur.
5. Sonraki girişlerde kampanya ve karakter otomatik hatırlanır.

`config.js` içindeki publishable anahtar tarayıcı kullanımı içindir. Secret/service_role anahtarını bu klasöre koyma.
