# EK Hotel yayınlama sırası

1. Supabase SQL Editor'da mevcut kurulum için `hotel-roles-update.sql` dosyasını çalıştır.
2. `task-panel/` klasörünü mevcut Website içindeki eski klasörün üstüne yaz.
3. GitHub'a push et.
4. Render'da New > Web Service ile aynı GitHub reposunu seç.
5. Language olarak Docker, Root Directory olarak `task-panel/backend`, Dockerfile olarak `Dockerfile` seç.
6. Environment bölümüne `Supabase__SecretKey` ekle ve Supabase secret key değerini yalnızca Render'a gir.
7. Deploy tamamlanınca verilen `https://....onrender.com` adresini kopyala.
8. `config.js` içindeki `https://BURAYA-RENDER-ADRESIN.onrender.com` değerini bu adresle değiştirip yeniden push et.
9. `https://egecanturk.dev/task-panel/` adresinden giriş yap.

Secret key, `appsettings.Development.json`, `bin/` ve `obj/` GitHub'a gönderilmez.
