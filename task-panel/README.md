# EK Hotel Operasyon Paneli

Rol tabanlı otel yönetim demosu. Frontend GitHub Pages'te, .NET 10 API ayrı bir web servisinde, kullanıcı ve görev verileri Supabase'de çalışır.

Roller: sistem yöneticisi, otel yönetimi, resepsiyon, tedarik, mutfak, temizlik ve teknik servis.

- `hotel-roles-update.sql`: Eski görev paneli veritabanını bu sürüme yükseltir.
- `supabase-schema.sql`: Sıfırdan yeni Supabase kurulumu içindir.
- `backend/`: Controller, Service, Middleware ve Supabase REST bağlantısını içeren .NET 10 API.
- `DEPLOY.md`: Yayınlama sırası.
