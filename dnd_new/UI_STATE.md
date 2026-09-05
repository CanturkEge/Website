# UI ve Realtime State Sözleşmesi

Uygulamada iki farklı state türü vardır:

- **Server state:** Supabase'te kalıcı olan kampanya, karakter, envanter, market, savaş, görev ve benzeri verilerdir.
- **Local UI state:** Kullanıcının henüz kaydetmediği alan değeri, focus, açık details/modal/panel, seçili sekme ve scroll konumudur.

`ui-state-manager.js` bu iki katman arasındaki sınırı yönetir. Supabase verisi yenilenirken local UI state doğrudan ezilmez.

## Kullanım

- DOM'u yeniden kuran işlemler `kadimUiState.safeRender(fn)` veya bölüm bazında `kadimUiState.safeUpdate(element, fn)` üzerinden çalışmalıdır.
- Input, textarea, select, checkbox ve contenteditable alanlar `input`/`change` sırasında otomatik dirty işaretlenir. Gerekirse `markDirty`, `isDirty` ve `clearDirty` doğrudan kullanılabilir.
- Render edilen server değeri local taslakla eşleştiğinde dirty state otomatik temizlenir. Farklıysa local değer korunur ve `getConflict` ile conflict bilgisi okunabilir.
- Realtime handler önce `changedRoots(oldState, newState)` çağırmalı, sonra `shouldRender(page, roots, membersChanged)` ile mevcut sayfanın etkilenip etkilenmediğini kontrol etmelidir.
- İşlem başarıyla tamamlandığında gönderilen alan `clearDirty` veya kapsayıcısı `clearWithin` ile temizlenmelidir; böylece eski taslak onaylanmış server değerinin üzerine geri yazılmaz.
- Yeni bir sayfa eklenirken server-state bağımlılıkları manager içindeki `PAGE_ROOTS` tablosuna eklenmeli veya `registerPage` kullanılmalıdır.
- Dinamik entity ve item DOM'unda `data-entity-id`, `data-character-id` veya `data-item-id` kullanılmalıdır. Liste sırası DOM kimliği olarak kullanılmamalıdır.
- Subscription `replaceSubscription` ile kaydedilmeli ve ekran/kampanya değişiminde `clearSubscription` ile temizlenmelidir.
- Uygun ve geri alınabilir işlemler `optimistic(key, { apply, commit, rollback })` ile uygulanabilir. `commit` başarısızsa rollback zorunludur.

## Render önceliği

1. Tek alan/entity güncellemesi
2. İlgili component/section güncellemesi
3. `safeRender` ile snapshot/restore kullanan tam görünüm render'ı

Tam render yalnız yapısal değişiklikte veya mevcut HTML üreticisi daha küçük bir component sınırı sunmadığında kullanılmalıdır. Sayfaya özel focus, dirty, details veya scroll koruma yamaları eklenmemelidir; eksik yetenek ortak manager'a eklenmelidir.
