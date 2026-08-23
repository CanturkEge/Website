# Kadim Masa Defteri — Kurulum

## v41 — Efekt ve Lonca Yönetimi Düzeltmesi

- Karakter efektleri artık hem eski düz metin kayıtlarını hem de savaştan gelen süreli kayıtları aynı anda tanır. **Efektleri Yönet** penceresinden tek tek kaldırılabilir veya topluca temizlenebilir.
- Karakter ile encounter arasındaki eşitleme efekt adı, süre ve kimliğini kaybetmeden iki yönlü çalışır. Oyuncu ekranlarındaki `[object Object]` görünümü giderildi.
- Lonca sayfasına tam bir **DM Müdahale Paneli** eklendi: lonca adını değiştirme, oyuncuyu üye yapma/çıkarma, ortak eşya ekleme, düzenleme, silme ve karaktere aktarma.
- Lonca kasasının PP/GP/SP/CP ekleme–çıkarma araçları doğrudan Lonca ekranında görünür. İlk yüklemede eski bakiyede kalma sorunu düzeltildi.
- Lonca eşyası aktarılırken zırh, AC, saldırı/hasar/save, stat bonusları ve diğer özel alanlar korunur; kaynak adet güvenli biçimde azaltılır.
- NPC Defteri’ndeki eski işlevsiz **Eşya** düğmesi çalışır hale getirildi. DM artık NPC envanterine eşya ekleyip kaldırabilir.
- DM tarafından verilen özel yetenekler artık düzenlenebilir ve silinebilir.
- Yeni yönetim ekranları telefon ve tablette tek sütuna iner; düğmeler dokunma için tam genişlik kullanır.

v41 için yeni SQL gerekmez. Mevcut karakter, efekt, encounter, lonca, kasa ve envanter verileri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v40 — Market Buton Çakışması Hotfix

- Market hediyesindeki onay düğmesinin **Bonuslu Eşya Ver** penceresini açmasına neden olan `data-item` çakışması kaldırıldı.
- Market onayı artık yalnız kendisine ait `data-v39-market-item` etiketiyle çalışır.
- Bonuslu eşya dinleyicisi yalnız gerçekten var olan bir karakter ID’sine bağlı düğmeyi kabul eder; başka menülerin butonlarını yakalayamaz.
- Build 39’daki tam özellikli eşya kopyalama, benzersiz ID, isteğe bağlı stok düşme ve sıralı bulut kaydı aynen korunur.

v40 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalayıp tarayıcıda `Ctrl + Shift + R` yapman yeterli.

## v39 — Market Eşyasını Oyuncuya Verme Düzeltmesi

- DM market kartındaki **Oyuncuya Ver / Hizmeti Tanımla** düğmesi artık eski `inventory_give_market` SQL fonksiyonuna bağlı değildir.
- Hedef karakter ve adet doğrulanır; eşya benzersiz envanter ID’siyle ve kaynak market ID’si korunarak verilir.
- Zırh AC alanları, silah bonusları, stat bonusları, binek yolculuk bilgileri, hizmet türü ve diğer bütün mekanik alanlar eksiksiz kopyalanır.
- Ücretsiz DM hediyesi market stokunu varsayılan olarak azaltmaz. İstenirse penceredeki **Market stokundan da düş** seçeneği açılabilir; yetersiz stokta işlem durdurulur.
- İşlem v31’in sıralı/birleştirmeli bulut kayıt hattını kullanır; eşzamanlı oyuncu değişikliklerini korur ve kayıt tamamlanınca sonuç bildirir.
- Hediye penceresi masaüstü ve telefonda okunabilir, büyük dokunma alanlı düzene geçirildi.

v39 için yeni SQL gerekmez. Mevcut kampanya, karakter, market, stok, fiyat ve oyuncu envanterleri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v38 — Yol Ağı ve Taktik Savaş Alanı

- Haritadaki 12 kale, arazi ve risk açıklaması olan **23 yol** ile bağlandı. Her yolun yaya temel süresi haritada görünür; rota planlayıcı keşfedilmiş kaleler arasında en kısa güzergâhı hesaplar.
- DM seyahati uyguladığında parti konumu, kampanya tarihi ve o kalenin market tierleri birlikte güncellenir. Son 100 yolculuk kayıt içinde korunur.
- Ahır ve Binekler kartlarına yolculuk süresini kaç yüzde kısalttığı ve hangi arazide uygun olduğu eklendi. Bu oranlar D&D 2014’ün evrensel olmayan binek kurallarını masada hızlandıran, açıkça işaretlenmiş kampanya yardımcısıdır.
- Encounter ekranına eski initiative/HP/efekt sistemini kullanan **kareli taktik savaş alanı** eklendi. 1 kare 5 ft’tir; her token hızını ve o tur kaç ft yürüdüğünü gösterir.
- DM; oyuncu, NPC ve hazır yaratıkları masaüstünde sürükleyip bırakarak, telefonda öğeye ve ardından kareye dokunarak ekleyebilir. Eklenen savaşçı encounter listesine ve haritaya aynı anda girer.
- Altı hazır alan bulunur: Karaçam Pususu, Yıkık Taç Salonu, Eşkıya Kampı, Meşalesiz Mahzen, Kırık Köprü Savunması ve Kale Kapısı Kuşatması. Boyut 8–40 sütun ve 8–30 satır arasında değiştirilebilir.
- Ağaç, çalılık, kaya, su, çamur, duvar, parmaklık, barikat, yıkık sütun, moloz, lahit, sandık, kapı, çadır, meşale ve kamp ateşi yerleştirilebilir. Boyut, hareket/görüş engeli ve ışık ayarları düzenlenebilir.
- Parlak, loş ve karanlık ışık; normal görüş, darkvision, ışık kaynakları, görüş kesen engeller ve kare bazlı sis bulunur. DM sisi fırçayla açıp kapatabilir veya oyuncu görünümünü önizleyebilir.
- Savaş tahtası hazırlıkta oyuncuya görünmez. DM **Oyuncuya Aç** dediğinde veya **Savaşı Başlat** kullandığında yayınlanır; savaş bitince tekrar gizlenir.
- Masaüstü üç panelli düzen kullanır; tablet ve telefonda araçlar tek sütuna iner, büyük savaş tahtası iki yönde dokunarak kaydırılır.

v38 için yeni SQL gerekmez. Mevcut kampanya, karakter, encounter, market ve harita verileri korunur. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v37 — Uygulama İçi Sürüm Notları

- DM ve oyuncu sol menüsüne ayrı **Sürüm Notları** sayfası eklendi.
- Projenin başlangıcından bugüne bütün büyük değişiklikler oyuncuya açık `v0.1–v1.4` kilometre taşları halinde yazıldı.
- Her sürümde **Yeni / Düzeltildi / Değiştirildi** ayrımı ve kapsadığı teknik build etiketi bulunur.
- Özellik arama, eski/yeni sıralama, tüm sürümleri açma ve kapatma kontrolleri eklendi.
- Masaüstünde üç sütunlu değişiklik özeti; tablet ve telefonda tek sütunlu, dokunma dostu görünüm kullanılır.

v37 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v36 — 380 Kayıtlık Market

- Market kataloğu **286’dan 380 ürün/hizmete** çıkarıldı.
- 94 yeni kayıt; şifacı, demirci, zırhçı, okçu, genel eşya, han, restoran, gizemli/lanetli dükkân, simyacı, ahır ve tapınağa dengeli dağıtıldı.
- Eksik 2014 silahları ve macera ekipmanları; resmî büyülü/lanetli eşya aileleri, örnek zehirler, ulaşım ve açık kurallı hizmetler eklendi.
- Eski kampanyalarda yalnız eksik v36 kayıtları eklenir. Oyuncu envanterleri, özel ürünler, stoklar ve DM’nin elle değiştirdiği fiyatlar korunur.
- v35 responsive market ve telefon/harita düzeltmeleri aynen korunur.

v36 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v35 — Responsive Market Düzeltmesi

- DM marketindeki üst üste binme ve kataloğun dar sol sütuna düşmesi düzeltildi.
- Masaüstünde market ayarları solda, ürün kataloğu kalan genişlikte çok sütunlu görünür.
- Tablet ve telefonda market kontrollü biçimde tek sütuna iner; kartlar ekran dışına taşmaz.
- Haritada dokunarak iki yönde kaydırma, küçük ekran tuvali ve düzenleme penceresi iyileştirildi.

v35 için yeni SQL gerekmez. Paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v34 — Kale Ekonomisi, Binekler, Tapınak Hizmetleri ve Görev Havuzu

- Market kataloğu 141 kayıttan **286 ürün/hizmete** çıkarıldı; mevcut hazır içerik neredeyse iki katına ulaştı.
- Market içinde ayrı **Simyacı**, **Ahır ve Binekler** ve **Tapınak** dükkânları eklendi.
- Ahırda resmî 2014 fiyat mantığındaki sıradan binekler, taşıtlar, binek ekipmanları; daha yüksek tierlerde DM onaylı fantastik binek ve ulaşım sözleşmeleri bulunur.
- Tapınakta yalnız eşya değil; Bless, Lesser/Greater Restoration, Remove Curse, Death Ward, diriltme ayinleri, kehanet ve alan koruması gibi açık kurallı hizmetler satın alınabilir. Hizmet alımı karakter envanterine uygulanmayı bekleyen bir hizmet kaydı bırakır.
- Market araması ve tier filtresi eklendi. Hizmet, binek ve normal ürün kartları birbirinden ayrıldı.
- Bariz fiyat hataları düzeltildi: örneğin İyileştirme İksiri ve Antitoksin 5 GP yerine 50 GP, Meşale 1 SP yerine 1 CP oldu. Nadir/çok nadir büyülü eşyalar hikâye seviyesindeki güçlerine göre pahalılaştırıldı. DM’nin elle değiştirdiği fiyat aynı eski varsayılanla eşleşmiyorsa korunur.
- 12 kalenin dükkân tierleri zorluk, biyom ve lore’a göre yeniden dengelendi. Karaçam yalnız uygun T1 hizmetlerle başlar; Kültaç’ın şifacı, simyacı, demirci, zırhçı ve ateş tapınağı T3’tür; dağ, liman, ticaret, çöl ve bataklık kaleleri kendi uzmanlıklarına sahiptir.
- Market, grubun bulunduğu kalenin açık dükkân ve tierlerini tek tuşla uygulayabilir. DM partiyi başka kaleye aldığında market ayarı da o kaleye geçer. Mevcut elle kurulmuş açık market ilk kurulumda zorla ezilmez.
- DM Rehberi’ne **50 Görev Fikri** bölümü eklendi. Görevler Lv 1–2, 3–4, 5–7, 8–10, 11–14 ve 15–20 olarak ayrılır; başlangıç, ters köşe ve ödül fikri içerir. Seçilen fikir tek tuşla aktif görevlere eklenebilir.

v34 için yeni SQL gerekmez. Alışveriş ve ekonomi SQL’leri daha önce kuruluysa bu paketteki `dnd` klasörünü mevcut `dnd` klasörünün üzerine kopyalaman yeterli.

## v33 — Dolu Kale Atlası ve Sade Harita Düzenleyicisi

- Haritadaki 12 kalenin adı, bölgesi, kısa hikâyesi, zorluğu, önerilen seviye aralığı, tehlikeleri, istihbaratı, dungeonı ve DM sırrı hazırlandı.
- Her kalede Şifacı, Simyacı, Demirci, Zırhçı, Okçu, Genel Eşya, Han/Bar, Restoran, Ahır ve Tapınak ayrı ayrı `Yok / Tier 1–3` olarak tanımlandı. Her hizmet her kalede bulunmaz.
- Gizemli ve Lanetli Dükkânlar kale hizmeti olamaz; DM bunları haritaya ayrı bir nokta olarak ekleyebilir.
- Grup başlangıçta **5 numaralı Taçova Kalesi**ndedir. Kale, geçmişi ve içerideki hizmetler oyuncuya açık; bağlı dungeon bilgisi keşfedilmemiş başlar.
- Normal Harita sayfası sadeleştirildi. DM üstteki **Kalem** düğmesini açıp bir kaleye dokunduğunda ayrı düzenleme penceresi açılır.
- Seçili kale kartındaki **Oyuncuya göster** ve **İçerisi keşfedildi** sürgüleri hızlı görünürlük kontrolü sağlar. Ayrıntılı sis, geçmiş ve dungeon izinleri düzenleme penceresindedir.
- Önceden yazdığın kale bilgileri korunur; yalnız boş alanlar hazır atlas verisiyle tamamlanır.

v33 için yeni SQL gerekmez. v32 lonca işlem geçmişi daha önce kurulmadıysa `v32-update.sql` dosyasını bir kez çalıştır; ardından bu paketteki `dnd` klasörünü sitendeki `dnd` klasörünün üzerine kopyala.

## v32 — Etkileşimli Harita ve Lonca İşlem Geçmişi

- Ana menüye DM ve oyuncu için ayrı davranan **Harita** bölümü eklendi.
- `Map.png` üzerinde tam 12 sabit kale noktası bulunur. Kale, bölge ve orman adları görsele gömülü değildir; DM bunları oyun içinden yazar.
- DM arazi sisi, konum işareti/adı, geçmiş, içerisi/istihbarat ve dungeon bilgisini birbirinden bağımsız açabilir.
- Kale kartlarında normal hizmetler, demirci tieri, savunma/tehlike, içeridekiler, bağlı dungeon, önerilen seviye ve yaratık bilgileri tutulur. Yalnızca DM notu hiçbir keşif ayarıyla oyuncuya gösterilmez.
- DM haritaya sonradan bölge, dungeon, yerleşim, özel nokta, gizli dükkân veya lanetli dükkân ekleyip taşıyabilir. Bu iki dükkân türü kale içi hizmetlerden ayrı konum olarak tasarlanmıştır.
- Oyuncular yalnızca DM’nin sisini kaldırdığı araziyi ve ayrıca açtığı bilgi katmanlarını görür. DM tek tuşla oyuncu görünümünü önizleyebilir.
- Oyuncuların lonca kasasına para yatırması/çekmesi ve ortak envantere eşya koyması/alması ortak işlem geçmişine kaydedilir. Diğer lonca üyeleri son 200 işlemi görür.
- DM’nin Kasa veya envanter yönetiminden yaptığı manuel düzeltmeler işlem geçmişine yazılmaz.

Önce Supabase SQL Editor’de `v32-update.sql` dosyasının tamamını **bir kez çalıştır**, ardından bu paketteki `dnd` klasörünü sitendeki `dnd` klasörünün üzerine kopyala. SQL mevcut kayıtları silmez ve tekrar çalıştırılabilir. `v31-update.sql` ile `guild-update.sql` daha önce kurulmuş olmalıdır.

## v31 — Performans ve Veri Güvenilirliği

- DM kayıtları sıraya alınır; kampanya değiştirme, salona dönme ve çıkış öncesinde bekleyen kayıt tamamlanır.
- DM’in yerel değişiklikleri, aynı anda oyuncuların yaptığı HP/eşya/market güncellemeleriyle üç yönlü birleştirilir; bütün kampanya JSON’unun eski kopyayla ezilmesi önlenir.
- Eşya taşıma, yerden alma, lonca hareketi, kuşanma ve silme işlemleri index yanında ID/ad doğrular. Liste başka sekmede değiştiyse yanlış eşya yerine işlem güvenle durur.
- Bölünen stack yeni bir ID alır; transfer edilen zırh/kalkan kuşanılmış gitmez. Market satın alımı eşyanın AC/stat/özel alanlarını artık korur.
- Kampanya değişince zar, mesaj, bildirim, kasa, filtre ve açık-panel cache’leri temizlenir. Bildirim istekleri üst üste binmez; arka plandaki sekmede gereksiz polling durur.
- Yaratık filtresi artık bütün sayfanın eventlerini her tuşta yeniden bağlamaz; dışa aktarma Blob URL’si kullanımdan sonra serbest bırakılır.
- Karakter ile ona bağlı encounter savaşçısının HP’si iki yönlü eşitlenir; Long Rest ve karakter efektleri aktif savaşa yansır. Oyuncudaki iki ayrı savaş menüsü tek menüye indirilmiştir.
- ASI puanları mevcut seviye bütçesini aşsa bile statlara fazladan uygulanmaz. Subclass açılışı 2014 class seviyesine göre 1/2/3 olarak doğrulanır; Cleric/Sorcerer/Warlock başlangıç subclassını artık karakter oluştururken seçer ve kaydeder.
- Zırh AC formülleri; Monk+kalkan şartı, büyülü zırh AC bonusu, tek zırh/tek kalkan ve zırh proficiency uyarılarıyla düzeltilmiştir.
- Eksik sekiz temel yaratığın stat/saldırı/özellik/zayıflık kartları tamamlanmıştır.

Önce Supabase SQL Editor’de `v31-update.sql` dosyasının tamamını **bir kez çalıştır**, ardından bu paketteki `dnd` klasörünü sitendeki `dnd` klasörünün üzerine kopyala. SQL veri silmez ve tekrar çalıştırılabilir. Bu sürüm, isteğin doğrultusunda mevcut giriş/admin güvenlik mimarisini değiştirmez.

## v30 — Gerçek Proficiency, Background, Expertise ve ASI

- 18 skill bağlı ability ve hesaplanmış bonuslarıyla karakter ekranına eklendi.
- Class skill seçim havuzu ve seçim sınırı, background skill/tool/dil proficiencyleri ve species ek skillleri kaydedilir.
- Bard/Rogue Expertise seçimleri gerçek proficiency listesinden yapılır.
- Save, weapon, armor, tool ve language proficiencyleri tek panelde görünür.
- Zar menüsü artık sabit class tahmini yerine karakterin kaydedilmiş skill proficiency ve Expertise seçimlerini kullanır.
- Level atlayınca STR/DEX otomatik dağıtımı kaldırıldı. ASI hakları oyuncu tarafından ability veya feat olarak harcanır.
- Eski karakterler `Yetenekler > Seçimleri Düzenle`, DM ise `Karakterler > Proficiency / ASI` ile yapılandırılabilir.

Kurulumdan sonra `v30-update.sql` dosyasını Supabase SQL Editor’de bir kez çalıştır. Veri silmez.

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
