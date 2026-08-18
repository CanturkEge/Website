# DM Guidebook - egecanturk.dev kurulumu

## 1. GitHub Pages'e ekleme

Bu `dnd` klasörünü mevcut sitende `index.html`, `style.css` ve `CNAME` ile aynı seviyeye koy. Ana sayfayı değiştirme.

```text
Website/
  Assets/
  dnd/
  CNAME
  index.html
  script.js
  style.css
```

Repo klasöründe PowerShell veya terminal aç:

```bash
git status
git add dnd
git commit -m "Add DnD campaign companion"
git push origin main
```

GitHub Pages birkaç dakika sonra uygulamayı şu adreste yayınlar:

```text
https://egecanturk.dev/dnd/
```

`CNAME` dosyasını değiştirme. Ana sayfaya buton eklemek gerekmez.

## 2. Yerel kayıt

Supabase kurulmadan kampanyalar tarayıcının `localStorage` alanında saklanır. Aynı cihaz ve tarayıcıdan geri geldiğinde devam eder. Tarayıcı verisi silinirse kayıt gider; düzenli olarak **Yedek al** düğmesini kullan.

## 3. Gerçek oda kodu ve telefonlar arası kayıt

1. https://supabase.com üzerinden ücretsiz proje oluştur.
2. SQL Editor ekranında `supabase-setup.sql` dosyasının tamamını çalıştır.
3. Project Settings > API bölümünden Project URL ve anon public key değerlerini al.
4. `config.js` dosyasını düzenle:

```js
window.DM_CONFIG={
  SUPABASE_URL:'https://PROJE.supabase.co',
  SUPABASE_ANON_KEY:'BURAYA_ANON_KEY',
  DEFAULT_DM_PASSWORD:'123123'
};
```

5. Değişikliği gönder:

```bash
git add dnd/config.js
git commit -m "Configure DnD cloud saves"
git push origin main
```

Bundan sonra DM kampanya kurduğunda 6 haneli oda kodu oluşur. Oyuncular kendi telefonlarında `/dnd/` adresini açıp kodla katılır. Kampanya Supabase üzerinde kalır.

## Güvenlik

`123123` demo şifresidir. Kampanya kurarken farklı ve güçlü bir DM şifresi yaz. `SUPABASE_ANON_KEY` tarayıcı uygulamalarında görünür olması amaçlanan anahtardır; service role key'i asla `config.js` içine koyma.

Google Drive bu uygulama için uygun bir canlı veritabanı değildir. JSON yedek dosyalarını Drive'a elle koyabilirsin ama oda/lobi senkronizasyonu için Supabase kullanılmalıdır.
