# EK Hotel .NET 10 API

Akış: GitHub Pages frontend → .NET Controller → Service → Supabase REST/Auth.

## Yerel kullanım

`appsettings.Development.example.json` dosyasını `appsettings.Development.json` olarak kopyala, secret key'i gir ve çalıştır:

```powershell
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run --urls "http://localhost:5000"
```

## Canlı yayın

Klasördeki Dockerfile Render gibi Docker destekli bir serviste kullanılabilir. Secret key'i dosyaya yazma; host paneline `Supabase__SecretKey` environment variable olarak ekle. Render kullanırken Root Directory `task-panel/backend`, Dockerfile Path `Dockerfile` seçilir.
