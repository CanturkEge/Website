# D&D Çalışma Talimatları

Bu klasörde çalışan insan veya AI, bağlam ve token kullanımını düşük tutmak için aşağıdaki sırayı izler.

## Zorunlu okuma sırası

1. `PROJECT_STATE.md`
2. `PROJECT_INDEX.md` içindeki yalnız ilgili görev rotası
3. Rotada listelenen uygulama/veri/stil dosyaları
4. Gerekirse yalnız doğrudan çağrılan RPC'nin SQL tanımı

`CHANGELOG.md`, `guide.txt`, bütün sürüm dosyaları ve büyük veri katalogları varsayılan olarak okunmaz.

## Kapsam kuralları

- Açık proje-geneli audit talebi yoksa `dnd_new/` dışına dokunma.
- Kullanıcının istediği modül dışındaki dosyaları tarama veya biçimlendirme.
- Önce `rg` ile sembol, DOM id, state anahtarı veya RPC adı ara; tüm dosyayı yalnız eşleşme bağlamı yetmezse oku.
- Büyük `*-data.js` dosyalarında tam okuma yerine hedef kayıt/anahtar araması yap.
- Çalışan eski davranışı genel refactor bahanesiyle değiştirme.
- Patch küçük, geri alınabilir ve tek amaca yönelik olsun.

## Değişiklik kontrolü

- Script/CSS eklenirse veya sürüm artarsa `config.js` yükleme listesi ve cache anahtarı kontrol edilir.
- State değişirse eski kaydın eksik alanlarla açılabildiği doğrulanır.
- RPC değişirse ilgili SQL ve çağıran JavaScript birlikte kontrol edilir.
- Karakter, eşya veya görev verisi değişirse mevcut ID'ler korunur; yeni kayıtlar sona eklenir.
- Kullanıcıya görünen sürüm değişirse `PROJECT_STATE.md` ve `CHANGELOG.md` güncellenir.

## Teslim standardı

- Commit: `type(dnd): kısa açıklama`
- Teslim notu: değişen dosyalar, kullanıcı etkisi, veri/SQL etkisi ve yapılan test
- Test edilemeyen bölüm açıkça belirtilir; tahmin doğrulama gibi yazılmaz.
