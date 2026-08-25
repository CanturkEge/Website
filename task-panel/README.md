# Görev Paneli kurulumu

Bu klasör ana siteden bağımsızdır. GitHub Pages üzerinde `/task-panel/` adresinden açılır.

## Dosyalar

- `index.html`, `style.css`, `app.js`: statik GitHub Pages arayüzü.
- `config.js`: yayınlanmış .NET API adresi.
- `supabase-schema.sql`: Supabase tabloları ve RLS kuralları.
- `backend/`: .NET 10 Web API kaynak kodu.

## Kurulum sırası

1. Supabase projesi oluştur.
2. SQL Editor'da `supabase-schema.sql` dosyasını çalıştır.
3. İlk kullanıcıyı Supabase Authentication ekranından oluştur ve SQL ile admin rolü ver.
4. `backend/appsettings.example.json` dosyasını `appsettings.Development.json` adıyla kopyala ve değerleri doldur.
5. Backend'i yerelde çalıştır veya bir .NET servisine yayınla.
6. `config.js` içindeki `API_BASE_URL` değerini yayınlanmış backend adresi yap.
7. `git add task-panel`, `git commit` ve `git push` çalıştır.

GitHub Pages yalnızca frontend'i yayınlar; `.NET` backend'i çalıştırmaz. Secret key ve database connection string kesinlikle `config.js` içine yazılmaz.
