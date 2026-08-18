# Kadim Masa Defteri — Kurulum

Bu sürümde kullanıcı hesabı, kalıcı kampanya üyeliği ve ayrı DM/oyuncu panelleri bulunur.

## 1. Supabase güncellemesi (zorunlu)

Supabase > SQL Editor > New query aç. `supabase-setup.sql` dosyasının tamamını yapıştır ve **Run** düğmesine bas. `Success. No rows returned` görünmelidir. Eski kampanyalar silinmez.

## 2. GitHub Pages

Bu ZIP içindeki `dnd` klasörünü sitenin kök klasöründeki eski `dnd` klasörünün üzerine kopyala. GitHub Desktop'ta değişiklikleri commit edip pushla. Adres: `https://egecanturk.dev/dnd/`

## 3. İlk kullanım

1. DM, Kayıt Ol ekranından hesap açar.
2. Giriş yaptıktan sonra Kampanya Kur der; otomatik oda kodu oluşur.
3. Oyuncular hesap açar, oda koduyla bir kez katılır.
4. DM > Karakterler ekranında bekleyen oyuncunun adına basıp karakter oluşturur.
5. Sonraki girişlerde kampanya ve karakter otomatik hatırlanır.

`config.js` içindeki publishable anahtar tarayıcı kullanımı içindir. Secret/service_role anahtarını bu klasöre koyma.
