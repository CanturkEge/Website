// Original Turkish SQL practice authored from supplied course concepts; source examples and datasets are not reproduced.
export const DB_SQL_BASIC = [
  {
    "topic": 4,
    "title": "SQL temelleri & DDL",
    "questions": [
      {
        "difficulty": 1,
        "type": "mc",
        "prompt": "Yeni bir tabloyu ve sütun kurallarını tanımlamak istiyorsun. Hangi işlem doğrudan DDL işidir?",
        "options": [
          "CREATE TABLE ile tablo tanımlamak",
          "INSERT ile yeni kayıt eklemek",
          "UPDATE ile bakiyeyi değiştirmek",
          "SELECT ile kayıt okumak"
        ],
        "answer": 0,
        "explanation": "DDL veri tabanının yapısını tanımlar; CREATE TABLE tabloyu oluşturur. INSERT, UPDATE ve SELECT ise tanımlı yapıdaki veriyi ekler, değiştirir veya sorgular.",
        "hint": "Yapı tanımı ile veri üzerinde işlem yapmayı ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              4,
              5,
              6
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "tf",
        "prompt": "SQL bir standart olduğundan bütün ürünlerde veri tipleri, tarih fonksiyonları ve satır sınırlama sözdizimi aynıdır.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "SQL standardı ortak bir temel sağlar; ürünler farklı uygulamalar ve uzantılar sunar. Kaynaklarda Oracle VARCHAR2/SYSDATE ile SQL Server TOP/GETDATE örnekleri yan yanadır.",
        "hint": "Standart ile bir ürünün dialect özellikleri aynı şey değildir.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              2,
              3,
              8,
              9
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "short",
        "prompt": "CREATE, ALTER ve DROP gibi yapı tanımlama komutlarının ait olduğu dil grubunun üç harfli kısaltmasını yaz.",
        "options": [],
        "answer": [
          "DDL"
        ],
        "explanation": "Data Definition Language, şema nesnelerinin yapısını tanımlar. DML veri sorgulama/değiştirme, DCL ise erişim yetkilerini yönetme bağlamında kullanılır.",
        "hint": "Definition sözcüğünü hatırla.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              4,
              5
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "multi",
        "prompt": "Tablonun yapısını doğrudan değiştiren işlemleri seç.",
        "options": [
          "Yeni sütun ekleyen ALTER TABLE",
          "Satırın değerini değiştiren UPDATE",
          "Tabloyu kaldıran DROP TABLE",
          "Tabloyu oluşturan CREATE TABLE"
        ],
        "answer": [
          0,
          2,
          3
        ],
        "explanation": "ALTER/CREATE/DROP şema yapısını değiştirir. UPDATE, tablonun tanımını değil mevcut satırların alan değerlerini değiştirir; aynı değişim sözcüğü iki düzeyi anlatabilir.",
        "hint": "Satır içeriği mi, tablo tanımı mı değişiyor?",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              5,
              6,
              11,
              12
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "match",
        "prompt": "Komutları en doğrudan görevleriyle eşleştir.",
        "options": [
          "CREATE TABLE",
          "INSERT",
          "SELECT",
          "GRANT"
        ],
        "answer": [
          "Tablo yapısı oluşturma",
          "Yeni satır ekleme",
          "Sorgu sonucu üretme",
          "Erişim yetkisi verme"
        ],
        "explanation": "Bu görevler şema, veri ve erişim katmanlarını ayırır. SELECT burada dersin DML grubu içinde anılır; bazı sınıflandırmalar sorgulamaya ayrıca DQL adını verir.",
        "hint": "Fiilin etkilediği katmana odaklan.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              4,
              5,
              6,
              12,
              15
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "order",
        "prompt": "Yeni bir randevu tablosunu kurarken verilen tasarım adımlarını bağımlılık sırasına koy.",
        "options": [
          "Kaydedilecek alanları ve her alanın anlamını belirle",
          "Veri tiplerini ve NULL kabulünü seç",
          "Anahtar, referans, varsayılan ve CHECK kurallarını tanımla",
          "CREATE TABLE tanımını çalıştırıp kuralları sınayan örnek satırlar dene"
        ],
        "answer": [
          "Kaydedilecek alanları ve her alanın anlamını belirle",
          "Veri tiplerini ve NULL kabulünü seç",
          "Anahtar, referans, varsayılan ve CHECK kurallarını tanımla",
          "CREATE TABLE tanımını çalıştırıp kuralları sınayan örnek satırlar dene"
        ],
        "explanation": "Sütunun anlamı belirsizken veri tipi veya kural seçmek sağlam bir başlangıç değildir. Yapı çalıştırıldıktan sonra sınır değerler ve geçersiz örnekler de kontrol edilir.",
        "hint": "Önce veri gereksinimi, sonra fiziksel tanım.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              7
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "mc",
        "prompt": "SQL Server’da DECIMAL(5,2) alanında yuvarlama gerektirmeyen hangi pozitif değer saklanabilir?",
        "options": [
          "999.99",
          "9999.99",
          "1000.00",
          "12345.00"
        ],
        "answer": 0,
        "explanation": "Precision toplam basamak sayısı, scale ondalık basamak sayısıdır. DECIMAL(5,2) için ondalık önünde en çok üç basamak vardır; 999.99 bu aralıktadır, 1000.00 değildir.",
        "hint": "p−s, ondalık önündeki kapasitedir.",
        "refs": [
          {
            "file": "sql part2.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "tf",
        "prompt": "SQL Server’da nullable Qty sütununa yalnız CHECK(Qty>0) yazmak, Qty değerinin NULL olmasını da yasaklar.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "CHECK, koşulun FALSE olmasını reddeder; NULL ile Qty>0 karşılaştırması UNKNOWN olur. Qty mutlaka dolu ve pozitif olmalıysa NOT NULL ile CHECK birlikte gereklidir.",
        "hint": "NULL için karşılaştırma TRUE/FALSE dışında sonuç verebilir.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              8,
              9
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "short",
        "prompt": "SQL Server IDENTITY(10,5) alanında silme, başarısız giriş ve eşzamanlı işlem yok. İlk üç başarılı otomatik değer 10 ile başlıyorsa üçüncü değer kaçtır?",
        "options": [],
        "answer": [
          "20"
        ],
        "explanation": "Başlangıç değeri 10, artış 5 olduğu için değerler 10,15,20 olur. Bu kontrollü örnek IDENTITY değerlerinin gerçek kullanımda boşluksuz bir sıra garanti ettiği anlamına gelmez.",
        "hint": "İlk değer başlangıçtır; üçüncü için iki artış yap.",
        "refs": [
          {
            "file": "sql part1.txt",
            "pages": [
              1
            ]
          }
        ],
        "numeric": {
          "value": 20,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        }
      },
      {
        "difficulty": 2,
        "type": "multi",
        "prompt": "PRIMARY KEY ve FOREIGN KEY için doğru ifadeleri seç.",
        "options": [
          "Bir PRIMARY KEY birden fazla sütundan oluşabilir",
          "FOREIGN KEY eşleşen ebeveyn anahtarlarını denetleyebilir",
          "FOREIGN KEY tanımlamak çocuk tablodaki bütün değerleri otomatik UNIQUE yapar",
          "PRIMARY KEY alanlarının NULL olmaması gerekir"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "Bileşik PK tek bir sütunun değil sütun birleşiminin benzersizliğini denetler. FK ise referansı doğrular; aynı ebeveyne bağlı birden fazla çocuk satır bulunabilir.",
        "hint": "Kimliği belirleme ile referans doğrulama farklı kurallardır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              9,
              10
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "match",
        "prompt": "SQL Server veri tipi ve işlev adlarını temel anlamlarıyla eşleştir.",
        "options": [
          "DATE",
          "NVARCHAR(n)",
          "DECIMAL(p,s)",
          "IDENTITY(seed,increment)"
        ],
        "answer": [
          "Takvim tarihi",
          "Değişken uzunluklu Unicode metin",
          "Belirli precision ve scale ile kesin sayısal değer",
          "Otomatik sayısal değer üretimi"
        ],
        "explanation": "Tür seçimi veri anlamına göre yapılır. IDENTITY bir kimlik üretme özelliğidir; tek başına PK veya iş kimliği kuralının yerine geçmez.",
        "hint": "Tarih, metin, kesin sayı ve üretim görevlerini ayır.",
        "refs": [
          {
            "file": "sql part1.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "order",
        "prompt": "Ebeveyn Category ve çocuk Product tablolarında FK hemen denetleniyor, döngü yok. Verilen somut planı sırala.",
        "options": [
          "Category tablosunu PK ile oluştur",
          "Product tablosunu Category’ye FK ile oluştur",
          "Örnek Category satırını ekle",
          "O Category’ye bağlanan Product satırını ekle"
        ],
        "answer": [
          "Category tablosunu PK ile oluştur",
          "Product tablosunu Category’ye FK ile oluştur",
          "Örnek Category satırını ekle",
          "O Category’ye bağlanan Product satırını ekle"
        ],
        "explanation": "Doğrudan FK tanımı ebeveyn tablonun varlığını, çocuk satır eklemek ise ilgili ebeveyn anahtarın varlığını ister. Sonradan constraint ekleme gibi farklı planlar sorunun dışında tutulmuştur.",
        "hint": "Şema nesnesinin varlığı ile anahtar değerinin varlığını ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              9,
              10,
              12
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "mc",
        "prompt": "Stock tablosunda adet her satırda dolu ve sıfırdan büyük olmalı. Hangi tanım bu iki koşulu birlikte karşılar?",
        "options": [
          "Qty INT NOT NULL CHECK(Qty>0)",
          "Qty INT CHECK(Qty>0)",
          "Qty INT DEFAULT 1",
          "Qty INT UNIQUE"
        ],
        "answer": 0,
        "explanation": "NOT NULL eksik değeri engeller, CHECK(Qty>0) sıfır ve negatifleri engeller. DEFAULT yalnız uygun ekleme durumunda başlangıç değeri sağlar; bütün son değerlerin geçerliliğini tek başına garanti etmez.",
        "hint": "Doluluk ve aralık iki ayrı kısıttır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              8,
              9
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "tf",
        "prompt": "SQL Server’da NVARCHAR(50) tanımı, her satırın metin verisi için daima tam 100 byte kullanacağı anlamına gelir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "NVARCHAR değişken uzunlukludur; gerçek veri uzunluğu içerikle ilişkilidir. Ayrıca n ve Unicode karakter/gösterim birimi ayrımı önemlidir: bütün görünür karakterlerin tek sabit byte sayısına sahip olduğu varsayılamaz.",
        "hint": "Maksimum kapasiteyi gerçek depolanan uzunlukla karıştırma.",
        "refs": [
          {
            "file": "sql part2.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "short",
        "prompt": "SQL Server’da N'AB  ' dört BMP/ASCII karakterinden oluşan NVARCHAR literalidir; sonunda iki boşluk var. DATALENGTH sonucu kaç byte olur?",
        "options": [],
        "answer": [
          "8"
        ],
        "explanation": "Bu açık örnekte dört UTF-16 kod birimi ikişer byte taşır; DATALENGTH son boşlukları da sayarak 8 verir. LEN ise son boşlukları saymaz ve bu literal için 2 döndürür.",
        "hint": "DATALENGTH byte sayar; LEN’in son boşluk davranışı farklıdır.",
        "refs": [
          {
            "file": "sql part2.txt",
            "pages": [
              1
            ]
          }
        ],
        "numeric": {
          "value": 8,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "code": "SELECT LEN(N'AB  '), DATALENGTH(N'AB  '); -- SQL Server"
      },
      {
        "difficulty": 3,
        "type": "multi",
        "prompt": "Aşağıdaki kısıt yorumlarından doğru olanları seç.",
        "options": [
          "NOT NULL tekrarlı değerleri tek başına engellemez",
          "PRIMARY KEY eklenecek eski tabloda mevcut tekrarlar önce ele alınmalıdır",
          "DEFAULT tanımlı sütuna açık NULL göndermek her durumda default’a dönüşür",
          "CHECK iş kuralını ifade edebilir ama sütunun doluluğu ayrıca tasarlanmalıdır"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "Kısıtlar farklı sorumlulukları taşır. Açık NULL genellikle bir değer seçimidir; DEFAULT’ın otomatik yerine geçeceğini varsaymak yanlıştır. Mevcut veriler de yeni constraint’i karşılamalıdır.",
        "hint": "Varsayılan değer, doğrulama ve benzersizlik farklıdır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              9,
              11
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "match",
        "prompt": "Çocuk FK’sinin başvurduğu ebeveyn silindiğinde SQL Server referans eylemlerini eşleştir.",
        "options": [
          "NO ACTION",
          "CASCADE",
          "SET NULL",
          "SET DEFAULT"
        ],
        "answer": [
          "İhlal oluşacak silmeyi reddet",
          "İlgili çocuk satırları da sil",
          "Çocuk FK’sini NULL yap; sütun buna izin vermeli",
          "Çocuk FK’sine default ata; yeni değer de kuralları sağlamalı"
        ],
        "explanation": "Referans eylemi iş anlamına göre seçilir. SET NULL veya SET DEFAULT, hedef değerin NOT NULL/FK gibi diğer kurallardan muaf olduğu anlamına gelmez.",
        "hint": "Eylemin ürettiği son değerin de geçerli olması gerekir.",
        "refs": [
          {
            "file": "sql part3.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "order",
        "prompt": "Department ile Employee arasında yönetici/çalışan döngüsü var. İki tablo da oluşturulmuş, Employee.DeptID FK’si aktif; Department.ManagerID nullable ve FK’si henüz yok. Bu yükleme planını sırala.",
        "options": [
          "Department satırını ManagerID=NULL ile ekle",
          "O departmana bağlı Employee yöneticiyi ekle",
          "Department.ManagerID alanını bu çalışanın kimliğiyle güncelle",
          "ManagerID→Employee FK’sini mevcut verileri doğrulayarak ekle"
        ],
        "answer": [
          "Department satırını ManagerID=NULL ile ekle",
          "O departmana bağlı Employee yöneticiyi ekle",
          "Department.ManagerID alanını bu çalışanın kimliğiyle güncelle",
          "ManagerID→Employee FK’sini mevcut verileri doğrulayarak ekle"
        ],
        "explanation": "Bu plan geçici nullable alanla veri bağımlılığını kırar; FK’nin sonradan eklenmesi doğrulamanın atlanması demek değildir. Şema tasarımı ve yükleme sırası birlikte düşünülür.",
        "hint": "Önce yöneticisi bilinmeyen departman, sonra çalışan, sonra referans.",
        "refs": [
          {
            "file": "company_sql_01_create.pdf",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "mc",
        "prompt": "ValidPair(A,B) bileşik PK’ye sahip. Request(A,B) içinde A ve B ayrı listelere FK ile bağlı, fakat ValidPair’e bileşik FK yok. Ne garanti edilmez?",
        "options": [
          "A ve B birleşiminin izin verilen çiftlerden biri olması",
          "Her A’nın kendi ebeveyn listesinde varlığı",
          "Her B’nin kendi ebeveyn listesinde varlığı",
          "FK sütunlarının veri tipinin tanımlı olması"
        ],
        "answer": 0,
        "explanation": "Ayrı ayrı geçerli A ve B değerleri geçerli bir çift oluşturmak zorunda değildir. Çiftin kendisini denetlemek için uygun UNIQUE/PK hedefe bağlanan bileşik FK veya eşdeğer iş kuralı gerekir.",
        "hint": "Bileşenlerin ayrı geçerliliği birleşimin geçerliliği değildir.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              9,
              10
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "tf",
        "prompt": "SQL Server IDENTITY sütununa sahip olmak, ayrıca bir PK/UNIQUE tanımı olmadan bütün iş kurallarını ve boşluksuz numaralandırmayı garanti eder.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "IDENTITY değer üretir; iş anlamındaki benzersizlik PK/UNIQUE gibi kurallarla korunur. Silme, başarısız işlemler ve üretim ayrıntıları numara aralıklarında boşluk oluşturabilir.",
        "hint": "Üreteç ile constraint aynı araç değildir.",
        "refs": [
          {
            "file": "sql part1.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "short",
        "prompt": "SQL Server DECIMAL(7,3) alanında ondalık noktanın solunda en fazla kaç basamak bulunabilir?",
        "options": [],
        "answer": [
          "4"
        ],
        "explanation": "Precision 7 toplam basamak, scale 3 ondalık basamak demektir. Tamsayı kısmına 7−3=4 basamak kalır; işaret ve ondalık ayırıcı bu basamak hesabına dahil edilmez.",
        "hint": "Toplam kapasiteden scale’i çıkar.",
        "refs": [
          {
            "file": "sql part2.txt",
            "pages": [
              1
            ]
          }
        ],
        "numeric": {
          "value": 4,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        }
      },
      {
        "difficulty": 4,
        "type": "multi",
        "prompt": "Bir tabloda kısıtlar izin veriyor. DELETE, DROP ve UPDATE hakkında doğru sonuçları seç.",
        "options": [
          "WHERE’siz DELETE bütün satırları hedefler ama tablo tanımı kalır",
          "DROP TABLE tablo nesnesini kaldırır",
          "WHERE’siz UPDATE otomatik olarak yalnız ilk satırı günceller",
          "WHERE ile filtrelenen UPDATE yalnız koşulu TRUE olan satırları hedefler"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "Komutların etki düzeyleri farklıdır. WHERE yazılmadığında UPDATE için gizli bir tek-satır filtresi yoktur; DELETE de boşaltma yaparken tablo yapısını korur.",
        "hint": "Nesneyi kaldırmakla içeriğini değiştirmeyi ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              12,
              13,
              14
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "match",
        "prompt": "Kaynak örneklerini ürün ve veri anlamı açısından değerlendirirken sorunları eşleştir.",
        "options": [
          "ON DELETE ile biten, eylemi olmayan tanım",
          "DATEDIFF(year,BirthDate,GETDATE()) ile tam yaş iddiası",
          "Telefon numarasını INT seçmek",
          "SELECT alias’ını SQL Server WHERE’de kullanmak"
        ],
        "answer": [
          "Eksik referans eylemi nedeniyle sözdizimi tamamlanmamış",
          "Doğum günü geçmemiş olsa da yıl sınırlarını sayabilir",
          "Baştaki sıfır ve + gibi biçimsel bilgiyi kaybetme riski",
          "Aynı SELECT düzeyinde alias henüz bu bağlamda kullanılamaz"
        ],
        "explanation": "Slayt veya kod parçası doğrudan her üründe çalışan bir tarif değildir. Dilin değerlendirme bağlamı ve alanın gerçek anlamı, örnek koddan bağımsız denetlenmelidir.",
        "hint": "Sözdizimi, takvim hesabı ve veri temsili farklı hatalardır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              16
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "order",
        "prompt": "Eski Legacy(Code,Name) tablosunda Code’a PK eklemek istiyorsun; NULL ve tekrarlar olabileceği biliniyor. Seçilen düzeltme planını sırala.",
        "options": [
          "NULL ve tekrarlı Code değerlerini sorgulayarak saptama",
          "Hangi gerçek kayıtların hangi kimlikleri taşıması gerektiğini iş anlamıyla belirleme",
          "Bağlı kayıtları koruyarak NULL/tekrar sorunlarını düzeltme",
          "PRIMARY KEY tanımını ekleyip geçersiz eklemelerin reddini deneme"
        ],
        "answer": [
          "NULL ve tekrarlı Code değerlerini sorgulayarak saptama",
          "Hangi gerçek kayıtların hangi kimlikleri taşıması gerektiğini iş anlamıyla belirleme",
          "Bağlı kayıtları koruyarak NULL/tekrar sorunlarını düzeltme",
          "PRIMARY KEY tanımını ekleyip geçersiz eklemelerin reddini deneme"
        ],
        "explanation": "PK eklemek veri anlamındaki çelişkiyi kendiliğinden çözmez. Rastgele satır silmek yerine gerçek kimlikler ve referanslar korunur; sonrasında kısıt gelecekteki ihlalleri engeller.",
        "hint": "Önce mevcut sorunu ve doğru kimliği belirle.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              9,
              11
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "mc",
        "prompt": "SQL Server’da Parent’ta yalnız ID=1 var. Child.ParentID NOT NULL DEFAULT 99 ve Parent(ID)’ye FK. ParentID belirtilmeden Child satırı eklenirse ne olur?",
        "options": [
          "DEFAULT 99 geçerli ebeveyn bulamadığı için ekleme reddedilir",
          "Default değerler FK’den muaf olduğu için 99 eklenir",
          "NOT NULL varsa FK otomatik 1 seçer",
          "Sütun atlanınca her durumda NULL yazılır"
        ],
        "answer": 0,
        "explanation": "Sütun atlandığında default 99 seçilse bile son değer FK’yi karşılamalıdır. Parent’ta 99 yoktur; DEFAULT referans bütünlüğüne bir istisna vermez.",
        "hint": "Default değer üretilir; sonra kısıtlardan muaf mı kalır?",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              9,
              10
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "tf",
        "prompt": "SQL Server CHECK(Price>0), NOT NULL ve uygun FK’ler birlikte kullanılsa bile her müşterinin en az bir siparişi olması gibi tablolar arası bütün iş kuralları otomatik sağlanmış olmaz.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Sütun doluluğu, domain ve FK çocuk→ebeveyn varlığını korur. Her ebeveyne en az bir çocuk zorunluluğu farklı bir çapraz kayıt kuralıdır; mevcut kısıtlar bunu kendiliğinden ifade etmez.",
        "hint": "Referansın yönünü ve ebeveyne çocuk zorunluluğunu ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              8,
              9,
              10
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "short",
        "prompt": "P’de iki ebeveyn, C’de üç çocuk ve G’de dört torun var. P1’e iki çocuk ve o çocuklara toplam üç torun bağlı. Her iki FK ON DELETE CASCADE; başka tetikleyici yok. P1 silinince üç tablonun toplamında kaç satır kalır?",
        "options": [],
        "answer": [
          "3"
        ],
        "explanation": "Başta 2+3+4=9 satır vardır. P1, iki çocuğu ve üç torunu silinir: 6 satır gider. P2, onun tek çocuğu ve o çocuğun tek torunu kalır; toplam 3’tür.",
        "hint": "Silinen ebeveynin bağlı alt ağacını say.",
        "refs": [
          {
            "file": "sql part3.txt",
            "pages": [
              1
            ]
          }
        ],
        "numeric": {
          "value": 3,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "sqlFixture": {
          "setup": [
            "PRAGMA foreign_keys=ON;",
            "CREATE TABLE P(id INTEGER PRIMARY KEY);",
            "CREATE TABLE C(id INTEGER PRIMARY KEY,pid INTEGER REFERENCES P(id) ON DELETE CASCADE);",
            "CREATE TABLE G(id INTEGER PRIMARY KEY,cid INTEGER REFERENCES C(id) ON DELETE CASCADE);",
            "INSERT INTO P VALUES(1),(2);",
            "INSERT INTO C VALUES(10,1),(11,1),(20,2);",
            "INSERT INTO G VALUES(100,10),(101,10),(110,11),(200,20);",
            "DELETE FROM P WHERE id=1;"
          ],
          "query": "SELECT (SELECT COUNT(*) FROM P)+(SELECT COUNT(*) FROM C)+(SELECT COUNT(*) FROM G);",
          "expectedRows": [
            [
              3
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 5,
        "type": "multi",
        "prompt": "R(A,B,C) tablosunda PRIMARY KEY(A,B), UNIQUE(C), A/B/C NOT NULL ve Parent(A,B)’ye bileşik FK var. Kesin olarak doğru olanları seç.",
        "options": [
          "Aynı A farklı B ile birden fazla satırda bulunabilir",
          "Aynı A,B çifti ikinci kez eklenemez",
          "Ayrı A ve B FK’leriyle bileşik FK’nin denetimi her zaman aynıdır",
          "Başka satırın C değeri tekrar kullanılamaz"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "Bileşik anahtar tek tek A’yı veya B’yi benzersiz yapmaz; birlikte kimliktir. UNIQUE ve NOT NULL ile C de tekrarlanamaz. Bileşik FK izin verilen ebeveyn çiftini denetler.",
        "hint": "Her constraint’in hangi sütun birleşimine uygulandığını izle.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              9,
              10
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "match",
        "prompt": "İş kurallarını bu bağlamdaki en doğrudan kısıt tasarımıyla eşleştir.",
        "options": [
          "Her sözleşme tam bir müşteriye bağlı",
          "Aynı öğrenci aynı dönemde aynı derse ikinci kez yazılamaz",
          "İndirim oranı dolu ve 0..1 arasında",
          "Opsiyonel e-posta girildiyse izin verilen biçim ayrıca denetlenecek"
        ],
        "answer": [
          "CustomerID NOT NULL ve uygun FK",
          "UNIQUE(StudentID,CourseID,Term)",
          "NOT NULL ve CHECK(Rate>=0 AND Rate<=1)",
          "NULL kabulü ile biçim kuralını ayrı ele al"
        ],
        "explanation": "Kuralların kimisi satır kimliğini, kimisi referansı, kimisi domain’i sınırlar. E-posta gibi kapsamlı biçim kurallarının seçilen DBMS’de ne ölçüde ifade edileceği ayrıca belirlenir.",
        "hint": "Bir kuralı tek genel anahtar sözcükle çözmeye çalışma.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              9,
              10
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "order",
        "prompt": "Cycle içermeyen P→C→G referans zincirinde ebeveyn silme davranışını seçmek için verilen çözümlemeyi sırala.",
        "options": [
          "Her ilişki için ebeveyn yokken çocuğun anlamlı kalıp kalmadığını belirle",
          "Koruma, cascade veya NULL/default eylemini iş anlamına göre seç",
          "Seçilen son değerlerin NOT NULL ve FK kurallarını karşıladığını kontrol et",
          "P1 silmesi için C ve G etkilerini zincir boyunca hesaplayıp kısıtları dene"
        ],
        "answer": [
          "Her ilişki için ebeveyn yokken çocuğun anlamlı kalıp kalmadığını belirle",
          "Koruma, cascade veya NULL/default eylemini iş anlamına göre seç",
          "Seçilen son değerlerin NOT NULL ve FK kurallarını karşıladığını kontrol et",
          "P1 silmesi için C ve G etkilerini zincir boyunca hesaplayıp kısıtları dene"
        ],
        "explanation": "Cascade kolaylık seçimi değil veri yaşam döngüsü kararıdır. SET NULL/default seçilse bile son değer geçerli kalmalıdır; birden fazla seviye bütün zincirle değerlendirilir.",
        "hint": "Önce iş anlamı, sonra referans eylemi ve zincir sonucu.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              10
            ]
          }
        ]
      }
    ],
    "lessons": [
      {
        "title": "SQL ortamı, dil grupları ve tablo kurma",
        "summary": "Şema tanımını, veri işlemini ve erişim kontrolünü birbirinden ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              2,
              3,
              4,
              5,
              6,
              7
            ]
          },
          {
            "file": "sql part1.txt",
            "pages": [
              1
            ]
          },
          {
            "file": "sql part5.txt",
            "pages": [
              1
            ]
          }
        ],
        "sections": [
          {
            "title": "SQL standardı ve dialect",
            "text": "SQL ortak bir sorgulama ve tanımlama dilidir; bir standart olması bütün ürünlerin birebir aynı özellikleri desteklediği anlamına gelmez. Kaynaktaki Oracle VARCHAR2/SYSDATE ile SQL Server TOP/GETDATE ifadeleri farklı dialect örnekleridir. Soruda SQL Server deniyorsa onun söz dizimini esas al; taşınabilir SQL’i vendor uzantısıyla karıştırma."
          },
          {
            "title": "DDL, DML ve DCL",
            "text": "DDL yapı tanımlar: CREATE, ALTER, DROP. DML veri ekler, sorgular ve değiştirir: INSERT, SELECT, UPDATE, DELETE. DCL erişim yetkileriyle ilgilidir. Bazı sınıflandırmalar SELECT için DQL, COMMIT/ROLLBACK için TCL adını da kullanır; isim ezberinden önce komutun gerçek etkisini anlamak gerekir."
          },
          {
            "title": "Tablo oluşturma planı",
            "text": "Önce alanın anlamını ve veri tipini, ardından NULL, anahtar, referans, default ve domain kurallarını belirle. CREATE TABLE bu kararları somutlaştırır. Bir kodun çalışması iş kurallarının tam kapsandığını göstermez; geçerli, geçersiz ve sınır örneklerini dene. Catalog ve schema nesneler hakkında tanımların düzenlendiği kapsamlardır."
          }
        ],
        "cards": [
          [
            "DDL neyi değiştirir?",
            "Şema nesnelerinin yapısını; örneğin tablo veya sütun tanımını."
          ],
          [
            "SQL standardı tek dialect demek mi?",
            "Hayır; ortak çekirdek yanında ürüne özgü söz dizimi ve davranışlar vardır."
          ]
        ],
        "checks": [
          {
            "prompt": "Mevcut satırın fiyatını değiştiren UPDATE hangi düzeyde iş yapar?",
            "options": [
              "Tablo yapısı",
              "Veri içeriği",
              "Yalnız yetki"
            ],
            "answer": 1,
            "explanation": "UPDATE veri değerlerini değiştirir; sütunun türünü değiştirmez."
          },
          {
            "prompt": "Oracle örneğini SQL Server’a taşırken ne incelenmeli?",
            "options": [
              "Yalnız font",
              "Ürün söz dizimi ve eşdeğer işlevler",
              "Tablo adı uzunsa otomatik çalışır"
            ],
            "answer": 1,
            "explanation": "Tip ve fonksiyon adları ürünler arasında değişebilir."
          }
        ]
      },
      {
        "title": "Tipler, NULL ve varsayılan değer",
        "summary": "Alan anlamı ile saklama ve doğrulama kararını birleştir.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              5,
              8,
              9
            ]
          },
          {
            "file": "sql part2.txt",
            "pages": [
              1
            ]
          }
        ],
        "sections": [
          {
            "title": "Metin ve kesin sayılar",
            "text": "SQL Server CHAR/NCHAR sabit uzunluklu, VARCHAR/NVARCHAR değişken uzunluklu metin tipleridir; Unicode desteği ve collation ayrıca önemlidir. NVARCHAR(n) içindeki n’yi her görünür karakterin aynı byte sayısına sahip olduğu varsayımıyla yorumlama. Telefon, posta kodu gibi hesap yapılmayan biçimsel değerleri sayı seçmek baştaki sıfırları kaybettirebilir."
          },
          {
            "title": "Precision ve scale",
            "text": "DECIMAL(p,s) kesin sayısal bir tiptir: p toplam basamak, s ondalık basamak sayısıdır; ondalık önündeki kapasite p−s’tir. DECIMAL(5,2) için 999.99 aralık içindedir. Dönüşümde yuvarlama veya taşma kuralları ürüne ve dönüşüme bağlıdır; üç ondalık yazılan her değerin otomatik reddedileceğini varsayma."
          },
          {
            "title": "NULL, DEFAULT ve CHECK",
            "text": "NULL eksik/bilinmeyen değerdir; sıfır veya boş metinle aynı şey değildir. DEFAULT uygun ekleme durumunda kullanılacak değeri sunar, açık NULL’u genel olarak silip değiştirmez. CHECK(Qty>0) UNKNOWN sonucu nedeniyle NULL’u tek başına engellemez; doluluk gerekiyorsa NOT NULL da gerekir. Default ile gelen değerler de diğer kısıtları sağlamalıdır."
          }
        ],
        "cards": [
          [
            "DECIMAL(8,3) tamsayı basamağı?",
            "8−3=5 basamak."
          ],
          [
            "CHECK(x>0) NULL’u engeller mi?",
            "Tek başına hayır; NULL’u dışlamak için NOT NULL da gerekir."
          ]
        ],
        "checks": [
          {
            "prompt": "Qty her zaman dolu ve pozitif olsun. Hangisi?",
            "options": [
              "DEFAULT 1 yeter",
              "NOT NULL CHECK(Qty>0)",
              "UNIQUE yeter"
            ],
            "answer": 1,
            "explanation": "Doluluk ve pozitiflik iki ayrı kısıttır."
          },
          {
            "prompt": "SQL Server LEN ve DATALENGTH farkı?",
            "options": [
              "İkisi her zaman aynı",
              "LEN uzunluk, DATALENGTH byte sayısı; son boşluk davranışı da farklı",
              "DATALENGTH satır sayar"
            ],
            "answer": 1,
            "explanation": "Karakter/kod birimi uzunluğu ile byte miktarı aynı nicelik değildir."
          }
        ]
      },
      {
        "title": "Anahtarlar, referanslar ve silme zinciri",
        "summary": "PK, UNIQUE, FK ve referans eylemlerinin farklı görevlerini kur.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              6,
              9,
              10,
              11
            ]
          },
          {
            "file": "sql part3.txt",
            "pages": [
              1
            ]
          },
          {
            "file": "company_sql_01_create.pdf",
            "pages": [
              1
            ]
          },
          {
            "file": "company_sql_03_alter.pdf",
            "pages": [
              1
            ]
          }
        ],
        "sections": [
          {
            "title": "Anahtarın kapsadığı sütun birleşimi",
            "text": "PRIMARY KEY satır kimliğini benzersiz ve NULL olmayan biçimde korur; bileşik PK tek tek her sütunu UNIQUE yapmaz. UNIQUE de iş anahtarlarını korumada kullanılabilir. Ürünlerin nullable UNIQUE davranışları farklı olabilir; genelleme yapmadan sorunun DBMS ve NULL varsayımını oku. Kimlik üretimi IDENTITY, bu kısıtların yerine geçen bir benzersizlik kanıtı değildir."
          },
          {
            "title": "FK’nin yönü ve bileşik eşleşme",
            "text": "FOREIGN KEY çocuktaki değer veya sütun birleşimini uygun ebeveyn anahtara bağlar. Aynı ebeveyn birden fazla çocukta kullanılabilir. Ayrı ayrı geçerli A ve B, geçerli bir (A,B) çifti demek değildir; bileşik referans gerekiyorsa birlikte tanımlanmalıdır. FK, her ebeveyne en az bir çocuk bulunmasını kendiliğinden garanti etmez."
          },
          {
            "title": "Silme eylemini iş anlamıyla seç",
            "text": "SQL Server NO ACTION ihlal yaratan işlemi reddeder; CASCADE ilgili çocuk işlemlerini yayar; SET NULL ve SET DEFAULT yeni bir FK değeri üretir. Bu değerler diğer kısıtları da sağlamalıdır. Bir P→C→G zincirinde P silmenin etkisini yalnız C’de değil G’ye kadar izle. Döngülü yüklemede nullable ara durum veya constraint’i sonra doğrulayarak ekleme gibi açık bir plan gerekir."
          }
        ],
        "cards": [
          [
            "Bileşik PK(A,B), A’yı tek başına unique yapar mı?",
            "Hayır; yalnız (A,B) birleşimi benzersizdir."
          ],
          [
            "SET DEFAULT FK’den muaf mı?",
            "Hayır; default son değer de uygun ebeveyn anahtara bağlanmalıdır."
          ]
        ],
        "checks": [
          {
            "prompt": "Ebeveyn yoksa çocuğu da silmek hangi eylem?",
            "options": [
              "CASCADE",
              "SET DEFAULT",
              "NO ACTION"
            ],
            "answer": 0,
            "explanation": "CASCADE veri yaşam döngüsü anlamı uygunsa çocuğa silmeyi yayar."
          },
          {
            "prompt": "A ve B ayrı FK ile geçerli; (A,B) çiftini doğrular mı?",
            "options": [
              "Her zaman",
              "Hayır; uygun bileşik FK gerekebilir",
              "PK kaldırılırsa doğrular"
            ],
            "answer": 1,
            "explanation": "Bileşenlerin ayrı varlığı çiftin izin verildiğini göstermez."
          }
        ]
      },
      {
        "title": "Veri yükleme, değiştirme ve SQL Server ayrıntıları",
        "summary": "Komutun etki alanını ve örnek kodun sınırlarını denetle.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              11,
              12,
              13,
              14,
              15
            ]
          },
          {
            "file": "sql part1.txt",
            "pages": [
              1
            ]
          },
          {
            "file": "sql part2.txt",
            "pages": [
              1
            ]
          },
          {
            "file": "sql part3.txt",
            "pages": [
              1
            ]
          },
          {
            "file": "company_sql_03_alter.pdf",
            "pages": [
              1
            ]
          }
        ],
        "sections": [
          {
            "title": "INSERT ve açık sütun listesi",
            "text": "INSERT’te alan listesini açık vermek hangi verinin nereye gittiğini okunur kılar. Atlanan alanlar nullable/default/identity tanımlarına göre değerlendirilir; rastgele bir değerle doldurulmaz. Parent-child yüklemede FK hemen denetleniyorsa ebeveyn anahtar önce mevcut olmalıdır. Verilen kolon listesiyle VALUES sayısının uyuşması gerekir; slayttaki eksik/fazla değer örnekleri körlemesine kopyalanmamalıdır."
          },
          {
            "title": "UPDATE, DELETE, DROP ve MERGE",
            "text": "UPDATE tanımlı satırların değerlerini, DELETE satır varlığını değiştirir; WHERE yoksa gizli bir tek-satır sınırı yoktur. DROP TABLE şema nesnesini kaldırır. MERGE eşleşen ve eşleşmeyen kayıtlar için tek bildirimde farklı veri işlemleri tanımlayabilir; detaylı söz dizimi ve eşzamanlılık davranışı ürüne bağlıdır. Etkilenecek veri kümesini önce doğru tanımla."
          },
          {
            "title": "Örnek kodu ürün davranışıyla oku",
            "text": "SQL Server IDENTITY(seed,increment) başlangıç ve artışla değer üretir; boşluksuz iş numarası garantisi değildir. GETDATE/SYSDATETIME tarih-saat verir, CAST/CONVERT dönüşüm yapar. LEN son boşlukları dışlayabilir; DATALENGTH byte sayar. DATEDIFF(year,birth,today) yıl sınırlarını sayar ve doğum günü kontrolü olmadan kesin yaş değildir. Kaynaktaki tamamlanmamış ON DELETE parçası uygun eylemle tamamlanmalıdır."
          }
        ],
        "cards": [
          [
            "WHERE’siz DELETE tabloyu kaldırır mı?",
            "Hayır; satırları hedefler, tablo yapısı kalır."
          ],
          [
            "DATEDIFF(year,...) kesin yaş mı?",
            "Hayır; takvim yıl sınırlarını sayar, doğum günü ayrıca dikkate alınmalıdır."
          ]
        ],
        "checks": [
          {
            "prompt": "Sütun tipi değiştirmek için hangi komut ailesi?",
            "options": [
              "UPDATE",
              "ALTER TABLE",
              "SELECT"
            ],
            "answer": 1,
            "explanation": "ALTER yapıyı, UPDATE veriyi değiştirir."
          },
          {
            "prompt": "IDENTITY numarasında boşluk görüldü. Kesin hata mı?",
            "options": [
              "Evet",
              "Hayır; gapless sıra garantisi yok",
              "Sadece PK varsa hata"
            ],
            "answer": 1,
            "explanation": "Otomatik üretim ile boşluksuz sıra farklı sözleşmelerdir."
          }
        ]
      }
    ],
    "sheet": {
      "name": "Şema Ustasının Kısıt Parşömeni",
      "rarity": "rare",
      "entries": [
        {
          "title": "Dil ve ürün",
          "text": "DDL: CREATE/ALTER/DROP; DML: INSERT/UPDATE/DELETE/SELECT; erişim DCL. Oracle VARCHAR2/SYSDATE ile SQL Server NVARCHAR/TOP/GETDATE sözdizimlerini karıştırma."
        },
        {
          "title": "Tip",
          "text": "DECIMAL(p,s): toplam basamak p, ondalık s, tamsayı basamağı p−s. Kimlik/telefon gibi biçimsel veriler sayı olmak zorunda değildir. LEN uzunluk, DATALENGTH byte sayısıdır; son boşluklar ve Unicode varsayımı önemlidir."
        },
        {
          "title": "Kısıtlar",
          "text": "PK benzersiz ve NULL olmayan kimlik; UNIQUE ayrı iş anahtarı; FK uygun ebeveyn referansı; CHECK domain; NOT NULL doluluk. Bileşik PK tek tek sütunları unique yapmaz."
        },
        {
          "title": "NULL ve default",
          "text": "CHECK(x>0) UNKNOWN sonucunu tek başına dışlamaz; doluluk için NOT NULL ekle. DEFAULT uygun atlanan alan değerini sağlar, FK/CHECK kurallarını aşmaz ve açık NULL’u otomatik değiştirmez."
        },
        {
          "title": "Referans eylemleri",
          "text": "SQL Server NO ACTION ihlali reddeder; CASCADE alt satırlara yayar; SET NULL nullable alan ister; SET DEFAULT son değerin geçerli ebeveyne bağlanmasını ister. Zincir etkisini bütün seviyelerde izle."
        },
        {
          "title": "Veri değişimi",
          "text": "WHERE’siz UPDATE/DELETE bütün satırları hedefleyebilir. DELETE tablo yapısını bırakır; DROP nesneyi kaldırır. IDENTITY boşluksuz numara garantisi değildir. DATEDIFF(year,...) doğum günü kontrolü olmadan tam yaş değildir."
        }
      ]
    }
  },
  {
    "topic": 5,
    "title": "SELECT, JOIN & gruplama",
    "questions": [
      {
        "difficulty": 1,
        "type": "mc",
        "prompt": "Parcel satırları (id,weight): (1,3),(2,7),(3,10). Sorgu hangi id listesini döndürür?",
        "options": [
          "1,2,3",
          "2,3",
          "Yalnız 3",
          "Yalnız 2"
        ],
        "answer": 1,
        "explanation": "WHERE weight>=7 eşitliği de kapsar; ağırlık 7 ve 10 olan satırlar kalır. ORDER BY id bu iki satırı 2,3 sırasına koyar. SELECT yalnız id sütununu çıkarır.",
        "hint": ">= eşit olanı da içerir.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              15,
              16
            ]
          }
        ],
        "code": "SELECT id FROM Parcel WHERE weight>=7 ORDER BY id;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Parcel(id INTEGER PRIMARY KEY, weight INTEGER);",
            "INSERT INTO Parcel VALUES(1,3),(2,7),(3,10);"
          ],
          "query": "SELECT id FROM Parcel WHERE weight>=7 ORDER BY id;",
          "expectedRows": [
            [
              2
            ],
            [
              3
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 1,
        "type": "tf",
        "prompt": "SELECT sorgusunda ORDER BY yazılmasa bile sonuçların PRIMARY KEY sırasıyla gelmesi SQL’in genel garantisidir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "Tablonun veya bir erişim planının mevcut görünümü sonuç sırası sözleşmesi değildir. İstenen sıralama ORDER BY ile belirtilmelidir; plan değiştiğinde gözlenen sıra da değişebilir.",
        "hint": "Satır kimliği ile sonuç sırasını ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              19
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "short",
        "prompt": "Tag tablosunda Value değerleri Mavi,Mavi,Yeşil var ve NULL yok. SELECT COUNT(DISTINCT Value) kaçtır?",
        "options": [],
        "answer": [
          "2"
        ],
        "explanation": "COUNT(DISTINCT Value) farklı ve NULL olmayan değerleri sayar. Mavi iki kez bulunmasına rağmen bir değer, Yeşil de ikinci değer olarak sayılır.",
        "hint": "Satır sayısı ile farklı değer sayısı farklıdır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              17
            ]
          }
        ],
        "numeric": {
          "value": 2,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "code": "SELECT COUNT(DISTINCT Value) FROM Tag;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Tag(Value TEXT);",
            "INSERT INTO Tag VALUES('Mavi'),('Mavi'),('Yeşil');"
          ],
          "query": "SELECT COUNT(DISTINCT Value) FROM Tag;",
          "expectedRows": [
            [
              2
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 1,
        "type": "multi",
        "prompt": "NULL değerleri bulunan bir tabloda doğru SQL yorumlarını seç.",
        "options": [
          "IS NULL eksik/bilinmeyen değeri denetlemek için kullanılır",
          "WHERE yalnız koşulu TRUE olan satırları geçirir",
          "x=NULL yazmak IS NULL ile aynı sonucu garanti eder",
          "NULL içeren karşılaştırma UNKNOWN üretebilir"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "SQL’in üç değerli mantığında UNKNOWN, WHERE için kabul değildir. NULL bir sıradan eşitlik değeri gibi karşılaştırılmaz; IS NULL/IS NOT NULL amaçlanan testi ifade eder.",
        "hint": "TRUE, FALSE ve UNKNOWN ayrımını kullan.",
        "refs": [
          {
            "file": "sql part4.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "match",
        "prompt": "SELECT sorgusunun bölümlerini görevleriyle eşleştir.",
        "options": [
          "SELECT",
          "WHERE",
          "GROUP BY",
          "HAVING",
          "ORDER BY"
        ],
        "answer": [
          "Çıktı sütun ve ifadelerini belirler",
          "Tekil satırları filtreler",
          "Satırları gruplara ayırır",
          "Grupları sonuç koşuluyla filtreler",
          "Sonuç satırlarının sırasını belirler"
        ],
        "explanation": "Sorgu yazılış sırası ile görev sırası aynı kavram değildir. WHERE grup oluşmadan satırları eler; HAVING grupların toplu ölçütleri için kullanılabilir.",
        "hint": "Satır filtresi ile grup filtresini ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              15,
              20,
              21
            ]
          }
        ]
      },
      {
        "difficulty": 1,
        "type": "order",
        "prompt": "Aşağıdaki aşamaları sade bir SELECT sorgusunun mantıksal değerlendirme sırasına koy; fiziksel yürütme planı sorulmuyor.",
        "options": [
          "FROM/JOIN ile aday satır kaynağını oluştur",
          "WHERE ile satırları filtrele",
          "GROUP BY ve aggregate hesaplarıyla grupları oluştur",
          "HAVING ile grupları filtrele",
          "SELECT çıktı ifadelerini ve varsa DISTINCT’i uygula",
          "ORDER BY ile istenen sonuç sırasını kur"
        ],
        "answer": [
          "FROM/JOIN ile aday satır kaynağını oluştur",
          "WHERE ile satırları filtrele",
          "GROUP BY ve aggregate hesaplarıyla grupları oluştur",
          "HAVING ile grupları filtrele",
          "SELECT çıktı ifadelerini ve varsa DISTINCT’i uygula",
          "ORDER BY ile istenen sonuç sırasını kur"
        ],
        "explanation": "Bu mantıksal model clause görevlerini açıklar; optimizer aynı sonucu farklı fiziksel adımlarla üretebilir. SELECT’in metinde başta yazılması, WHERE alias görünürlüğünü değiştirmez.",
        "hint": "Kaynağı kurmadan satırı veya grubu filtreleyemezsin.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              15,
              21
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "mc",
        "prompt": "Score(v) değerleri 5,NULL,5,8. Aşağıdaki üç aggregate’ın çıktısı hangi üçlüdür?",
        "options": [
          "4,3,2",
          "4,4,3",
          "3,3,2",
          "4,2,2"
        ],
        "answer": 0,
        "explanation": "COUNT(*) bütün dört satırı sayar. COUNT(v) NULL olmayan üç girdiyi, COUNT(DISTINCT v) ise farklı NULL olmayan 5 ve 8 değerlerini sayar.",
        "hint": "Önce NULL atılır mı, sonra tekrarlar atılır mı diye sor.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              17,
              20
            ]
          }
        ],
        "code": "SELECT COUNT(*), COUNT(v), COUNT(DISTINCT v) FROM Score;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Score(v INTEGER);",
            "INSERT INTO Score VALUES(5),(NULL),(5),(8);"
          ],
          "query": "SELECT COUNT(*), COUNT(v), COUNT(DISTINCT v) FROM Score;",
          "expectedRows": [
            [
              4,
              3,
              2
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 2,
        "type": "tf",
        "prompt": "LEFT JOIN, sol tablodaki her satırı sonuçta kesinlikle yalnız bir kez gösterir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "Sol satır korunur fakat sağda birden fazla eşleşme varsa aynı sol satır birden fazla sonuç satırına katılır. Koruma ile benzersiz sonuç üretme ayrı özelliklerdir.",
        "hint": "Bir sol satırın kaç sağ eşleşmesi olabileceğini say.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              5,
              6
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "short",
        "prompt": "Name değerleri 'A','AB','ABC','BA','AX' olan tabloda LIKE 'A_%' koşulunu kaç satır sağlar? Büyük/küçük harf farkı yok; tüm karakterler burada gösterildiği gibidir.",
        "options": [],
        "answer": [
          "3"
        ],
        "explanation": "A sabit ilk karakterdir; _ en az bir sonraki karakter ister, % ise kalan sıfır veya daha çok karakteri alabilir. AB, ABC ve AX geçer; tek harfli A ile BA geçmez.",
        "hint": "_ tam bir karakter, % sıfır veya daha fazla karakterdir.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              16,
              17
            ]
          }
        ],
        "numeric": {
          "value": 3,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "code": "SELECT COUNT(*) FROM Label WHERE Name LIKE 'A_%';",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Label(Name TEXT);",
            "INSERT INTO Label VALUES('A'),('AB'),('ABC'),('BA'),('AX');"
          ],
          "query": "SELECT COUNT(*) FROM Label WHERE Name LIKE 'A_%';",
          "expectedRows": [
            [
              3
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 2,
        "type": "multi",
        "prompt": "WHERE A OR B AND C ifadesi hakkında doğru olanları seç. A/B/C, NULL içermeyen mantıksal koşullardır.",
        "options": [
          "AND, OR’dan önce bağlanır",
          "A TRUE ise B/C’den bağımsız koşul TRUE olur",
          "İfade her durumda (A OR B) AND C ile aynıdır",
          "(A OR B) AND C isteniyorsa parantez gereklidir"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "Varsayılan bağlanma A OR (B AND C) biçimindedir. A doğru, C yanlış örneğinde bu ifade doğruyken (A OR B) AND C yanlış olur; parantez anlamı değiştirir.",
        "hint": "A=TRUE ve C=FALSE karşı örneğini dene.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              17,
              18
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "match",
        "prompt": "JOIN yaklaşımını doğru işleviyle eşleştir.",
        "options": [
          "INNER JOIN",
          "LEFT JOIN",
          "CROSS JOIN",
          "Self join için farklı alias’lar"
        ],
        "answer": [
          "Koşulu sağlayan eşleşmeleri döndürür",
          "Sol satırı eşleşme yokken NULL sağ alanlarla da korur",
          "İki kaynağın bütün satır çiftlerini üretir",
          "Aynı tablonun iki rolünü birbirinden ayırır"
        ],
        "explanation": "Self join ayrı bir saklama türü değildir; tabloyu iki rolde kullanma tekniğidir. LEFT JOIN ve INNER JOIN seçimi, eşleşmeyen sol satırların korunup korunmayacağını belirler.",
        "hint": "Koruma, eşleştirme ve kartezyen çarpım farklıdır.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              2,
              5,
              7,
              8
            ]
          }
        ]
      },
      {
        "difficulty": 2,
        "type": "order",
        "prompt": "ORDER BY City ASC, Points DESC uygulanıyor. City değerleri A ve B; aynı şehir ve puan tekrarı yok. Verilen çıktı satırlarını sırala.",
        "options": [
          "(City=A,Points=9)",
          "(City=A,Points=4)",
          "(City=B,Points=8)",
          "(City=B,Points=2)"
        ],
        "answer": [
          "(City=A,Points=9)",
          "(City=A,Points=4)",
          "(City=B,Points=8)",
          "(City=B,Points=2)"
        ],
        "explanation": "Önce City artan sıralanır; Points yalnız aynı City grubunun iç sırasını azalan belirler. B şehrindeki 8, A şehrindeki 4’ten önceye geçmez.",
        "hint": "İlk sıralama anahtarı baskındır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              19
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "mc",
        "prompt": "Client kimlikleri 1,2,3; Sale satırları (10,1,5),(20,2,50). Sağ tabloya amount>10 filtresi ON içinde uygulanıyor. Sonuç hangisi?",
        "options": [
          "(1,NULL),(2,20),(3,NULL)",
          "Yalnız (2,20)",
          "(1,10),(2,20),(3,NULL)",
          "Hiç satır yok"
        ],
        "answer": 0,
        "explanation": "ON filtresi eşleşebilecek sağ satırları seçer fakat sol korumayı kaldırmaz. 1’in düşük tutarlı satırı eşleşmez, 3’ün zaten satırı yoktur; ikisi de NULL sağ alanlarla korunur.",
        "hint": "ON’daki koşul ile JOIN sonrasındaki WHERE filtresi farklı yerlerde işler.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              5,
              6
            ]
          }
        ],
        "code": "SELECT c.id,s.id FROM Client c LEFT JOIN Sale s ON s.cid=c.id AND s.amount>10 ORDER BY c.id;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Client(id INTEGER PRIMARY KEY);",
            "CREATE TABLE Sale(id INTEGER PRIMARY KEY,cid INTEGER,amount INTEGER);",
            "INSERT INTO Client VALUES(1),(2),(3);",
            "INSERT INTO Sale VALUES(10,1,5),(20,2,50);"
          ],
          "query": "SELECT c.id,s.id FROM Client c LEFT JOIN Sale s ON s.cid=c.id AND s.amount>10 ORDER BY c.id;",
          "expectedRows": [
            [
              1,
              null
            ],
            [
              2,
              20
            ],
            [
              3,
              null
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 3,
        "type": "tf",
        "prompt": "SQL Server’da SELECT Cost*2 AS DoubleCost ... WHERE DoubleCost>100 ifadesi aynı sorgu düzeyinde alias kullanımının her zaman geçerli bir örneğidir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "SELECT alias’ı SQL Server’ın aynı düzey WHERE bölümünde henüz kullanılamaz. Cost*2 ifadesini WHERE’de tekrar etmek veya alias’ı bir alt sorgu/view çıktısı üzerinden kullanmak gerekir.",
        "hint": "Yazılış sırası ile alias’ın görünür olduğu mantıksal aşamayı ayır.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              16,
              21
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "short",
        "prompt": "Hub1’e iki Leg ve üç Tag satırı bağlı. Hub→Leg ve Hub→Tag INNER JOIN’leri yalnız hid eşitliğiyle aynı sorguda kuruluyor. Hub1 için kaç sonuç satırı oluşur?",
        "options": [],
        "answer": [
          "6"
        ],
        "explanation": "Her iki Leg satırı üç Tag satırının her biriyle eşleşir: 2×3=6 sonuç satırı oluşur. İki ayrı 1:N ilişki aynı düzeyde birleştirilince fan-out çarpımı ortaya çıkar.",
        "hint": "Aynı ebeveyne bağlı her çocuk çifti yeni satır oluşturur.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              6,
              7
            ]
          }
        ],
        "numeric": {
          "value": 6,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "code": "SELECT COUNT(*) FROM Hub h JOIN Leg l ON l.hid=h.id JOIN Tag t ON t.hid=h.id;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Hub(id INTEGER PRIMARY KEY);",
            "CREATE TABLE Leg(hid INTEGER,code TEXT);",
            "CREATE TABLE Tag(hid INTEGER,label TEXT);",
            "INSERT INTO Hub VALUES(1);",
            "INSERT INTO Leg VALUES(1,'L1'),(1,'L2');",
            "INSERT INTO Tag VALUES(1,'T1'),(1,'T2'),(1,'T3');"
          ],
          "query": "SELECT COUNT(*) FROM Hub h JOIN Leg l ON l.hid=h.id JOIN Tag t ON t.hid=h.id;",
          "expectedRows": [
            [
              6
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 3,
        "type": "multi",
        "prompt": "SQL Server’da GROUP BY DeptID kullanan sorgu için doğru yorumları seç.",
        "options": [
          "SELECT DeptID,COUNT(*) geçerlidir",
          "SELECT DeptID,Name,COUNT(*) ifadesinde Name de uygun şekilde gruplanmalı veya aggregate edilmelidir",
          "WHERE COUNT(*)>2 doğrudan grup filtresi yerine kullanılır",
          "HAVING COUNT(*)>2 grupları sayımına göre eleyebilir"
        ],
        "answer": [
          0,
          1,
          3
        ],
        "explanation": "DeptID başına bir sonuç üretirken tekil bir Name kendiliğinden belirlenmez. WHERE satır aşamasında çalışır; aggregate sonucuyla grup seçimi HAVING ile ifade edilir.",
        "hint": "Her çıktı hücresinin grup için tek değeri olmalı.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              17,
              20,
              21
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "match",
        "prompt": "LIKE desenlerini NULL olmayan metinler için doğru anlamlarıyla eşleştir.",
        "options": [
          "A%",
          "%A",
          "_A_",
          "%A%"
        ],
        "answer": [
          "A ile başlayan metin",
          "A ile biten metin",
          "Tam üç karakterli ve ortası A olan metin",
          "Herhangi bir konumda A içeren metin"
        ],
        "explanation": "% sıfır veya çok karakter, _ tam bir karakterle eşleşir. Desenlerin harf büyüklüğü davranışı kullanılan collation’a bağlıdır; burada yalnız biçim anlamı sorulur.",
        "hint": "_ ile % arasındaki uzunluk farkını kullan.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              16,
              17
            ]
          }
        ]
      },
      {
        "difficulty": 3,
        "type": "order",
        "prompt": "Bir satış raporu için aşağıdaki veri akışı seçildi. Ortadaki adımların girdileri önceki aşamanın çıktısıdır; sırala.",
        "options": [
          "LEFT JOIN ile müşterilere varsa satışları bağla",
          "WHERE ile rapora alınacak müşteri bölgesini filtrele",
          "Müşteri kimliğine göre gruplandır ve COUNT(SaleID) hesapla",
          "HAVING ile en az iki satışlı müşteri gruplarını tut",
          "SELECT ile müşteri kimliği ve sayımı çıkar; sayım DESC, kimlik ASC sırala"
        ],
        "answer": [
          "LEFT JOIN ile müşterilere varsa satışları bağla",
          "WHERE ile rapora alınacak müşteri bölgesini filtrele",
          "Müşteri kimliğine göre gruplandır ve COUNT(SaleID) hesapla",
          "HAVING ile en az iki satışlı müşteri gruplarını tut",
          "SELECT ile müşteri kimliği ve sayımı çıkar; sayım DESC, kimlik ASC sırala"
        ],
        "explanation": "Bu sorguda bölge filtresi sol müşteri alanına uygulanır; satış sayımı sağ PK ile yapılır. İstenen raporun aşamaları, eşleşmeyen satırları yanlışlıkla satır filtresiyle kaybetmeden kurulmalıdır.",
        "hint": "Önce veri kaynağı, sonra satır, grup ve çıktı.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              5,
              6
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "mc",
        "prompt": "Team1’in iki üyesi var, Team2’nin üyesi yok. LEFT JOIN sonrasında COUNT(*) ve COUNT(m.id) çıktıları hangisidir?",
        "options": [
          "Team1:2,2 ve Team2:1,0",
          "Team1:2,2 ve Team2:0,0",
          "Her iki takım:1,1",
          "Team1:1,2 ve Team2:1,1"
        ],
        "answer": 0,
        "explanation": "Takım2 için LEFT JOIN bir NULL-genişletilmiş satır üretir; COUNT(*) onu sayar ama COUNT(m.id) NULL sağ kimliği saymaz. Takım1’in iki gerçek eşleşmesi iki aggregate’ta da sayılır.",
        "hint": "Eşleşmeyen sol satır da sonuçta bir satırdır.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              5,
              6
            ]
          }
        ],
        "code": "SELECT t.id,COUNT(*),COUNT(m.id) FROM Team t LEFT JOIN Member m ON m.tid=t.id GROUP BY t.id ORDER BY t.id;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Team(id INTEGER PRIMARY KEY);",
            "CREATE TABLE Member(id INTEGER PRIMARY KEY,tid INTEGER);",
            "INSERT INTO Team VALUES(1),(2);",
            "INSERT INTO Member VALUES(11,1),(12,1);"
          ],
          "query": "SELECT t.id,COUNT(*),COUNT(m.id) FROM Team t LEFT JOIN Member m ON m.tid=t.id GROUP BY t.id ORDER BY t.id;",
          "expectedRows": [
            [
              1,
              2,
              2
            ],
            [
              2,
              1,
              0
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 4,
        "type": "tf",
        "prompt": "İki ayrı 1:N JOIN yüzünden büyümüş SUM(Hours) değerini, dış SELECT’e DISTINCT eklemek her zaman gerçek toplamına düzeltir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "DISTINCT çıktı satırlarını tekilleştirir; aggregate’a daha önce giren kopya değerleri geri alamaz. İlişki kollarını uygun anahtarda önceden toplamak veya sayım ihtiyacına göre ayrı sorgulamak gerekir.",
        "hint": "Yanlış çoğalma aggregate’dan önce mi sonra mı oluştu?",
        "refs": [
          {
            "file": "company_sql_statements_questions_only.pdf",
            "pages": [
              2
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "short",
        "prompt": "Visit(zone,visitor) verileri A:1,1,2; B:3,3; C:NULL. En az iki farklı, NULL olmayan ziyaretçisi olan kaç zone vardır?",
        "options": [],
        "answer": [
          "1"
        ],
        "explanation": "A grubunun farklı ziyaretçi sayısı 2, B’nin 1 ve C’nin 0’dır. COUNT(DISTINCT visitor) NULL’u dışarıda bırakır; HAVING koşulunu yalnız A sağlar.",
        "hint": "Tekrarı ve NULL’u grup içinde ayrı işle.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              20,
              21
            ]
          }
        ],
        "numeric": {
          "value": 1,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "code": "SELECT COUNT(*) FROM (SELECT zone FROM Visit GROUP BY zone HAVING COUNT(DISTINCT visitor)>=2) g;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Visit(zone TEXT,visitor INTEGER);",
            "INSERT INTO Visit VALUES('A',1),('A',1),('A',2),('B',3),('B',3),('C',NULL);"
          ],
          "query": "SELECT COUNT(*) FROM (SELECT zone FROM Visit GROUP BY zone HAVING COUNT(DISTINCT visitor)>=2) g;",
          "expectedRows": [
            [
              1
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 4,
        "type": "multi",
        "prompt": "Bir çalışanın iki proje satırı ve üç yakını aynı sorguda JOIN ediliyor. Doğru analizleri seç.",
        "options": [
          "Ham JOIN altı satır üretebilir",
          "SUM(DISTINCT Hours) her veri kümesinde gerçek toplam proje saatini garanti eder",
          "COUNT(DISTINCT ProjectID) proje sayımı amacına göre tekrarları giderebilir",
          "Saatleri çalışan başına önce toplamak, yakınlar koluyla oluşan çoğalmayı kontrol etmeye yardımcı olur"
        ],
        "answer": [
          0,
          2,
          3
        ],
        "explanation": "İki kolun fan-out’u 2×3’tür. İki farklı projenin saatleri aynıysa SUM(DISTINCT Hours) meşru bir katkıyı da atar; DISTINCT sütun değerini tekilleştirir, iş olayını değil.",
        "hint": "Proje kimliği ile saat değerinin aynı şey olmadığını düşün.",
        "refs": [
          {
            "file": "company_sql_statements_questions_only.pdf",
            "pages": [
              2
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "match",
        "prompt": "Sorgu hatalarını en doğrudan sonuçlarıyla eşleştir.",
        "options": [
          "WHERE COUNT(*)>2 yazmak",
          "LEFT JOIN sonrası WHERE right.Amount>0 kullanmak",
          "Üyesiz grup için COUNT(*) kullanmak",
          "Şişmiş SUM’un dışına DISTINCT koymak"
        ],
        "answer": [
          "Aggregate’ı satır filtresi aşamasında yanlış kullanma",
          "NULL-genişletilmiş satırları eleyip sol korumayı kaybetme",
          "Yokluğu sıfır yerine bir olarak sayabilme",
          "Aggregate’a girmiş kopyaları geri alamama"
        ],
        "explanation": "Clause seçimi ve aggregate girdisi birlikte değerlendirilir. Sözdizimi geçerli olan bir sorgu bile farklı iş sorusunu yanıtlayabilir; doğru çıktı örneklerle sınanmalıdır.",
        "hint": "Hatanın hangi değerlendirme aşamasında oluştuğunu bul.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              5,
              6
            ]
          }
        ]
      },
      {
        "difficulty": 4,
        "type": "order",
        "prompt": "INNER JOIN ile satışları getirip bölge başına en az iki satıştan oluşan raporda veri aşamalarını verilen ara sonuçlarla eşleştirerek sırala.",
        "options": [
          "JOIN çıktısı: A:10,A:30,A:50,B:80",
          "WHERE Amount>=30 sonrası: A:30,A:50,B:80",
          "GROUP BY sonrası: A(count=2,sum=80),B(count=1,sum=80)",
          "HAVING COUNT(*)>=2 sonrası: yalnız A(count=2,sum=80)",
          "SELECT/ORDER BY sonrası tek rapor satırı: A,80"
        ],
        "answer": [
          "JOIN çıktısı: A:10,A:30,A:50,B:80",
          "WHERE Amount>=30 sonrası: A:30,A:50,B:80",
          "GROUP BY sonrası: A(count=2,sum=80),B(count=1,sum=80)",
          "HAVING COUNT(*)>=2 sonrası: yalnız A(count=2,sum=80)",
          "SELECT/ORDER BY sonrası tek rapor satırı: A,80"
        ],
        "explanation": "WHERE filtrelemesi grup sayısını ve toplamı değiştirir. B’nin toplamı A ile eşit olsa da satış sayısı yetersizdir; HAVING amaçlanan grup koşulunu uygular.",
        "hint": "Önce satır filtresini uygula, sonra grupların ölçütlerini hesapla.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              20,
              21
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "mc",
        "prompt": "Tablolarda yalnız Worker1, ona bağlı 3 ve 5 saatlik iki Work satırı ve iki Relative kaydı var. Verilen ham JOIN hangi değerleri üretir ve gerçek saat toplamı nedir?",
        "options": [
          "SUM=16, yakını=2; gerçek proje saati=8",
          "SUM=8, yakını=2; gerçek proje saati=8",
          "SUM=16, yakını=4; gerçek proje saati=16",
          "SUM=8, yakını=4; gerçek proje saati=16"
        ],
        "answer": 0,
        "explanation": "İki iş satırının her biri iki yakına eşleşir: saatler 3,3,5,5 olur ve SUM 16’dır. COUNT(DISTINCT rid) yakın sayısını 2’ye indirir ama SUM’a etki etmez; gerçek işler 3+5=8 saattir.",
        "hint": "Bir aggregate’taki DISTINCT diğer aggregate’ı değiştirmez.",
        "refs": [
          {
            "file": "company_sql_statements_questions_only.pdf",
            "pages": [
              2
            ]
          }
        ],
        "code": "SELECT SUM(w.hours),COUNT(DISTINCT r.rid) FROM Worker e JOIN Work w ON w.wid=e.id JOIN Relative r ON r.wid=e.id;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Worker(id INTEGER PRIMARY KEY);",
            "CREATE TABLE Work(wid INTEGER,pid INTEGER,hours INTEGER);",
            "CREATE TABLE Relative(wid INTEGER,rid INTEGER);",
            "INSERT INTO Worker VALUES(1);",
            "INSERT INTO Work VALUES(1,10,3),(1,20,5);",
            "INSERT INTO Relative VALUES(1,100),(1,200);"
          ],
          "query": "SELECT SUM(w.hours),COUNT(DISTINCT r.rid) FROM Worker e JOIN Work w ON w.wid=e.id JOIN Relative r ON r.wid=e.id;",
          "expectedRows": [
            [
              16,
              2
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 5,
        "type": "tf",
        "prompt": "SQL Server TOP 3 ... ORDER BY Points DESC sorgusunda üçüncü ve dördüncü kişinin puanı eşitse, eşitlik bozacak başka anahtar olmadan hangi üç kimliğin seçileceği her zaman belirlenmiş değildir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "ORDER BY puanı belirler fakat eşit puanlar arasında kimlik sırası kurmaz. Belirli üç kimlik isteniyorsa ORDER BY Points DESC,ID ASC gibi toplam bir sıra gerekir; WITH TIES ise farklı bir iş isteğidir.",
        "hint": "Sıralama sütununun eşitlik bırakıp bırakmadığını incele.",
        "refs": [
          {
            "file": "sql part5.txt",
            "pages": [
              1
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "short",
        "prompt": "Booking(client,amount) verileri 1:10,40,NULL; 2:40,40; 3:100. Önce amount>=20 filtreleniyor. Sonra en az iki satırı ve toplamı en az70 olan kaç müşteri grubu kalır?",
        "options": [],
        "answer": [
          "1"
        ],
        "explanation": "Müşteri1’de yalnız 40 kaldığından sayım1’dir; müşteri2’de iki40 kalır, sayım2 toplam80 koşulları sağlar. Müşteri3’te toplam100 olsa da yalnız bir satır vardır. NULL satırı WHERE aşamasında geçmez.",
        "hint": "WHERE sonrasındaki sayım ile başlangıçtaki sayımı karıştırma.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              20,
              21
            ]
          }
        ],
        "numeric": {
          "value": 1,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "tolerance": 0,
          "units": []
        },
        "code": "SELECT COUNT(*) FROM (SELECT client FROM Booking WHERE amount>=20 GROUP BY client HAVING COUNT(*)>=2 AND SUM(amount)>=70) x;",
        "sqlFixture": {
          "setup": [
            "CREATE TABLE Booking(client INTEGER,amount INTEGER);",
            "INSERT INTO Booking VALUES(1,10),(1,40),(1,NULL),(2,40),(2,40),(3,100);"
          ],
          "query": "SELECT COUNT(*) FROM (SELECT client FROM Booking WHERE amount>=20 GROUP BY client HAVING COUNT(*)>=2 AND SUM(amount)>=70) x;",
          "expectedRows": [
            [
              1
            ]
          ],
          "ordered": true
        }
      },
      {
        "difficulty": 5,
        "type": "multi",
        "prompt": "SQL Server’da müşteri başına rapor tasarlanıyor. Doğru kararları seç.",
        "options": [
          "Satışı olmayan müşteriyi de sayım0 ile göstermek için LEFT JOIN ve COUNT(SaleID) kullanılabilir",
          "Satış sağ alanına WHERE filtresi koymak sol korumayı her zaman korur",
          "Aynı kimliğin çoklu rol satırları varsa kişi sayımında COUNT(DISTINCT PersonID) gerekebilir",
          "Toplam ve sayımın doğru granularity’de hesaplandığı örnek verilerle denetlenmelidir"
        ],
        "answer": [
          0,
          2,
          3
        ],
        "explanation": "Korunacak nesne, sayılacak iş birimi ve JOIN çoğalması birlikte düşünülür. İnsan, rol kaydı ve satış aynı sayım birimi değildir; sorgunun geçerli çalışması doğru iş sonucunu garanti etmez.",
        "hint": "Kaç satır değil, hangi nesnenin sayıldığını belirle.",
        "refs": [
          {
            "file": "midterm2020 database.pdf",
            "pages": [
              4
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "match",
        "prompt": "Karma bir raporda gözlenen sorunları doğru tasarım düzeltmesiyle eşleştir.",
        "options": [
          "İki ayrı alt ilişki aynı satır kümesinde toplamları çarpıyor",
          "Aynı kişinin iki rolü kişi sayısını artırıyor",
          "TOP sınırında aynı puanlı kimlik seçimi değişiyor",
          "Üyesiz ebeveyn grubu sıfır yerine bir sayılıyor"
        ],
        "answer": [
          "Her kolu doğru anahtar düzeyinde önce aggregate et",
          "İş amacına göre DISTINCT kişi kimliğini say",
          "ORDER BY’a benzersiz eşitlik bozucu anahtar ekle",
          "NULL olmayan çocuk anahtarını COUNT et"
        ],
        "explanation": "Bu sorunların hepsine tek bir DISTINCT eklemek çözüm değildir. Doğru düzeltme, hatanın JOIN granularity’si, sayım kimliği, sıra veya NULL üretimiyle ilgili olmasına bağlıdır.",
        "hint": "Önce hatanın kaynağını sınıflandır; sonra aracı seç.",
        "refs": [
          {
            "file": "company_sql_statements_questions_only.pdf",
            "pages": [
              2,
              3
            ]
          }
        ]
      },
      {
        "difficulty": 5,
        "type": "order",
        "prompt": "Amount>=10 filtreli müşteri raporunda aşağıdaki somut aşamaları sırala. Çıktı SUM DESC,ClientID ASC olacak.",
        "options": [
          "Başlangıç: C1 satışları4,12,15; C2 satışları10,17; C3 satışları9,10",
          "WHERE sonrası: C1:12,15; C2:10,17; C3:10",
          "GROUP BY sonrası: C1(count2,sum27),C2(count2,sum27),C3(count1,sum10)",
          "HAVING COUNT(*)>=2 sonrası: C1 ve C2 kalır",
          "ORDER BY sonrası: (C1,27),(C2,27)"
        ],
        "answer": [
          "Başlangıç: C1 satışları4,12,15; C2 satışları10,17; C3 satışları9,10",
          "WHERE sonrası: C1:12,15; C2:10,17; C3:10",
          "GROUP BY sonrası: C1(count2,sum27),C2(count2,sum27),C3(count1,sum10)",
          "HAVING COUNT(*)>=2 sonrası: C1 ve C2 kalır",
          "ORDER BY sonrası: (C1,27),(C2,27)"
        ],
        "explanation": "İlk filtre C1’in4 ve C3’ün9 değerini kaldırır. C3 grup sayımıyla elenir; kalan toplamlar eşit olduğu için kimlik artan eşitlik bozucu olarak son sırayı belirler.",
        "hint": "Her aşamada hem count hem sum’u güncel veri üzerinden hesapla.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              20,
              21
            ]
          }
        ]
      }
    ],
    "lessons": [
      {
        "title": "SELECT, filtre ve üç değerli mantık",
        "summary": "Sütun, satır, desen ve NULL koşullarını doğru yorumla.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              15,
              16,
              17,
              18,
              19
            ]
          }
        ],
        "sections": [
          {
            "title": "SELECT ve WHERE farklı seçim yapar",
            "text": "SELECT çıktı sütunlarını veya ifadeleri, WHERE ise hangi satırların aday kaldığını belirler. Alias tablo ve sütun adlarını okunur kılar; SQL Server’da aynı SELECT düzeyinin alias’ı WHERE’de kullanılamaz. Kaynaktaki bu örnek düzeltilirken temel sütun/ifade WHERE’de yazılır veya önce bir alt sorgu/view katmanı oluşturulur."
          },
          {
            "title": "Karşılaştırma, LIKE ve mantıksal öncelik",
            "text": "LIKE içinde % sıfır veya daha çok, _ tam bir karakteri temsil eder; harf büyüklüğü collation’a bağlıdır. NOT, AND, OR önceliğini bilmek gerekir ama amaçlanan gruplamayı parantezle açık yazmak daha okunurdur. A OR B AND C, A OR (B AND C) anlamındadır; (A OR B) AND C ile genel olarak eşit değildir."
          },
          {
            "title": "NULL üçüncü sonucu doğurur",
            "text": "NULL ile sıradan karşılaştırma UNKNOWN olabilir; WHERE yalnız TRUE olan satırları geçirir. x=NULL yerine eksik değer için IS NULL, dolu değer için IS NOT NULL kullanılır. NOT UNKNOWN yine UNKNOWN olduğundan filtreyi ters çevirmenin bilinmeyen satırları otomatik geri getireceğini düşünme. Bir koşulun sınır değer ve NULL örneklerini ayrı ayrı dene."
          }
        ],
        "cards": [
          [
            "A_% en az kaç karakter ister?",
            "A ile başlayan en az iki karakter; _ tek karakter gerektirir."
          ],
          [
            "WHERE UNKNOWN satırını geçirir mi?",
            "Hayır; yalnız TRUE koşullu satırlar geçer."
          ]
        ],
        "checks": [
          {
            "prompt": "A OR B AND C nasıl gruplanır?",
            "options": [
              "(A OR B) AND C",
              "A OR (B AND C)",
              "(A AND C) OR B"
            ],
            "answer": 1,
            "explanation": "AND önceliği OR’dan yüksektir."
          },
          {
            "prompt": "Eksik değeri aramak için hangisi?",
            "options": [
              "x=NULL",
              "x IS NULL",
              "x=0"
            ],
            "answer": 1,
            "explanation": "NULL bir sıradan eşitlik değeri değildir."
          }
        ]
      },
      {
        "title": "COUNT, DISTINCT, GROUP BY ve HAVING",
        "summary": "Grup kurmadan önce hangi satırları saydığını belirle.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              17,
              20,
              21
            ]
          }
        ],
        "sections": [
          {
            "title": "Satır, dolu değer ve farklı değer sayımı",
            "text": "COUNT(*) satırları, COUNT(column) NULL olmayan sütun girdilerini, COUNT(DISTINCT column) farklı NULL olmayan değerleri sayar. AVG/SUM gibi aggregate’larda NULL’un dışlanması ile bilinmeyeni sıfır kabul etmek aynı değildir. Saymak istediğin iş nesnesiyle saydığın fiziksel satırların birebir olup olmadığını denetle."
          },
          {
            "title": "Gruplama bir sonuç düzeyi seçer",
            "text": "GROUP BY ortak grup değerleri için tek sonuç satırı oluşturur. SQL Server’da aggregate olmayan SELECT alanları uygun biçimde gruplanmalıdır. Tek bir group için birden fazla kişi adı varsa hangisinin yazılacağı kendiliğinden seçilemez. Kolon eklemek bazen hata vermek yerine daha ince gruplar oluşturarak iş sonucunu değiştirir."
          },
          {
            "title": "WHERE önce, HAVING sonra",
            "text": "WHERE hangi ham satırların gruba gireceğini belirler; HAVING oluşan grubun ölçütüne göre grubu tutar veya eler. Önce yüksek ücretli satırları seçip en az üç satır saymak ile tüm departman en az üç kişi olsun ama yalnız yüksek ücretlileri saymak farklı sorulardır. Her aşamadaki veri kümesini açıkça kurarak count ve sum’u yeniden hesapla."
          }
        ],
        "cards": [
          [
            "COUNT(*) ile COUNT(x) farkı?",
            "İlki bütün sonuç satırlarını; ikincisi x’in NULL olmayan girdilerini sayar."
          ],
          [
            "Grup sayımı filtresi nereye?",
            "Uygun GROUP BY sonrasında HAVING’e; WHERE ham satır filtresidir."
          ]
        ],
        "checks": [
          {
            "prompt": "v=2,NULL,2 için COUNT(v) nedir?",
            "options": [
              "3",
              "2",
              "1"
            ],
            "answer": 1,
            "explanation": "COUNT(v) NULL’u dışlar, tekrarları tutar."
          },
          {
            "prompt": "COUNT(DISTINCT v) aynı örnekte kaç?",
            "options": [
              "1",
              "2",
              "3"
            ],
            "answer": 0,
            "explanation": "Tek farklı NULL olmayan değer 2’dir."
          }
        ]
      },
      {
        "title": "JOIN, sol koruma ve aynı tablonun iki rolü",
        "summary": "Eşleşme koşulu, filtre ve çıktı çoğalmasını birlikte izle.",
        "refs": [
          {
            "file": "advanced sql chapter 6.pdf",
            "pages": [
              2,
              3,
              4,
              5,
              6,
              7,
              8
            ]
          }
        ],
        "sections": [
          {
            "title": "INNER ve LEFT JOIN",
            "text": "INNER JOIN koşulu sağlayan çiftleri döndürür. LEFT JOIN eşleşmeyen sol satırı sağ sütunlarda NULL ile korur; tek sol satır sağda iki eşleşme bulursa iki sonuç satırına katılır. Kaynaktaki LEFT OUTER JOIN örneğinde ON yerine WHERE yazılmıştır; doğru açık biçimde eşleşme koşulu JOIN ... ON altında kurulur."
          },
          {
            "title": "ON ile WHERE aynı yer değildir",
            "text": "LEFT JOIN ... ON right.amount>10, uygun sağ eşleşmeleri sınırlar ama sol satırı korur. Aynı filtre JOIN sonrasında WHERE right.amount>10 olursa NULL-genişletilmiş satırlar UNKNOWN nedeniyle elenir. Üyesiz takım için COUNT(*) bir, COUNT(member.id) sıfır verebilir; hedeflediğin çocuk sayımı için NULL olmayan çocuk anahtarını seç."
          },
          {
            "title": "Çoklu JOIN ve self join",
            "text": "Bir tabloyu çalışan ve yönetici gibi iki rolde kullanmak self join’dir; alias’lar rollerin alanlarını ayırır. Yöneticisiz çalışan da görünmeli ise sol koruma gerekir. Bir ebeveyne iki ayrı 1:N kolunu bağlamak her çocuk çiftini üreterek toplamları şişirebilir. İlişki kollarını amaçlanan anahtar düzeyinde önce toplamak ve doğru kimliği saymak gerekir."
          }
        ],
        "cards": [
          [
            "LEFT JOIN her sol satırı bir kez mi verir?",
            "Hayır; sağ eşleşme sayısı kadar çoğalabilir, eşleşme yoksa bir NULL-genişletilmiş satır kalır."
          ],
          [
            "Self join neden alias ister?",
            "Aynı tablonun farklı rollerini ve alanlarını ayırt etmek için."
          ]
        ],
        "checks": [
          {
            "prompt": "Üyesiz takımı sayım0 ile raporlamak için?",
            "options": [
              "INNER JOIN,COUNT(*)",
              "LEFT JOIN,COUNT(member.id)",
              "CROSS JOIN,COUNT(*)"
            ],
            "answer": 1,
            "explanation": "Sol takım korunur; NULL çocuk kimliği sayılmaz."
          },
          {
            "prompt": "Bir ebeveynin iki ayrı kolunda2 ve3 satır var. Ham JOIN kaç çift?",
            "options": [
              "5",
              "6",
              "3"
            ],
            "answer": 1,
            "explanation": "Her birinci kol satırı her ikinci kol satırına eşleşir:2×3."
          }
        ]
      },
      {
        "title": "Rapor sırası, sınır ve toplam hatalarını denetle",
        "summary": "Çalışan sorgunun doğru iş sonucunu verdiğini örneklerle sınayabil.",
        "refs": [
          {
            "file": "intro to sql chapter 5.pdf",
            "pages": [
              19,
              20,
              21
            ]
          },
          {
            "file": "company_sql_statements_questions_only.pdf",
            "pages": [
              2,
              3
            ]
          },
          {
            "file": "sql part5.txt",
            "pages": [
              1
            ]
          }
        ],
        "sections": [
          {
            "title": "ORDER BY bir sıra sözleşmesidir",
            "text": "ORDER BY City ASC,Points DESC önce şehirleri artan, aynı şehir içinde puanları azalan sıralar. Eşitlikler kalıyorsa belirli bir kimlik sırası için ek benzersiz anahtar gerekir. SQL Server TOP 3 puan sınırında eşitlik bırakıyorsa hangi kimliklerin seçileceği sabit olmak zorunda değildir. ORDER BY olmadan fiziksel tablonun gözlenen sırasına güvenilmez."
          },
          {
            "title": "DISTINCT her toplamı tamir etmez",
            "text": "DISTINCT son çıktı satırlarını tekilleştirir; SUM’a daha önce bir JOIN yüzünden iki kez giren değeri geri alamaz. SUM(DISTINCT Hours) da iki ayrı gerçek işin saati eşitse meşru katkıyı kaybedebilir. Kimlik, rol kaydı ve sayısal değer farklı şeylerdir; COUNT(DISTINCT PersonID) ancak amaç kişi saymaksa doğru düzeltmedir."
          },
          {
            "title": "Küçük özgün veriyle mantıksal iz çıkar",
            "text": "Bir satırsız ebeveyn, iki eşleşmeli ebeveyn, NULL alan, aynı toplamlı grup ve aynı kişiye ait çoklu rol gibi küçük örnekler kur. FROM/JOIN çıktısını, WHERE sonrasını, grupları, HAVING ve son sıralamayı tek tek izle. Bu yöntem yalnız beklenen son tabloyu görmekten daha güçlüdür: yanlış sonucu üreten aşamayı açıkça gösterir."
          }
        ],
        "cards": [
          [
            "TOP sınırında eşit puan varsa ne gerekir?",
            "Belirli kimlik seçimi isteniyorsa benzersiz bir eşitlik bozucu ORDER BY anahtarı."
          ],
          [
            "SUM(DISTINCT Hours) her şişmeyi düzeltir mi?",
            "Hayır; eşit saatli farklı gerçek işlerden birini de dışlayabilir."
          ]
        ],
        "checks": [
          {
            "prompt": "İki farklı projenin saatleri5 ve5. SUM(DISTINCT Hours)?",
            "options": [
              "10",
              "5",
              "0"
            ],
            "answer": 1,
            "explanation": "DISTINCT değer bazındadır; iki iş olayını ayırt etmez."
          },
          {
            "prompt": "ORDER BY City ASC,Points DESC’de baskın anahtar?",
            "options": [
              "Points",
              "City",
              "PK otomatik"
            ],
            "answer": 1,
            "explanation": "İlk anahtar önce gruplar; ikinci yalnız eşit ilk değerler içinde işler."
          }
        ]
      }
    ],
    "sheet": {
      "name": "Birleştirme Muhafızının Rapor Merceği",
      "rarity": "epic",
      "entries": [
        {
          "title": "Mantıksal sıra",
          "text": "FROM/JOIN → WHERE → GROUP BY/aggregate → HAVING → SELECT/DISTINCT → ORDER BY. Bu açıklama fiziksel yürütme planı değildir; optimizer farklı bir plan kurabilir."
        },
        {
          "title": "Filtre",
          "text": "WHERE yalnız TRUE’yu geçirir. NULL için IS NULL/IS NOT NULL; =NULL sıradan eşitlik değildir. NOT→AND→OR önceliği, parantezle istenen biçimde değiştirilir. LIKE _:bir karakter, %:sıfır veya çok karakter."
        },
        {
          "title": "Sayım",
          "text": "COUNT(*) tüm satırlar; COUNT(x) NULL olmayan girdiler; COUNT(DISTINCT x) farklı NULL olmayan değerler. AVG/SUM ile NULL’u dışlamak, sıfır kabul etmek demek değildir."
        },
        {
          "title": "Gruplama",
          "text": "WHERE satır filtresi, HAVING grup filtresidir. SQL Server’da aggregate olmayan SELECT alanlarını uygun GROUP BY’a dahil et. Sonuç granularity’si seçilen grup anahtarına bağlıdır."
        },
        {
          "title": "Sol koruma",
          "text": "LEFT JOIN eşleşmeyen sol satırı NULL sağ alanlarla korur. Sağ alan filtresini WHERE’ye taşımak korumayı kaybettirebilir. Çocuksuz ebeveyni0 saymak için COUNT(childPK), COUNT(*) değil."
        },
        {
          "title": "Fan-out ve sıra",
          "text": "İki bağımsız 1:N kolu n×m satır üretebilir; toplamlardan önce doğru anahtarda aggregate et. Dış DISTINCT şişmiş SUM’u düzeltmez. ORDER BY’da ilk anahtar baskındır; TOP sınırındaki eşitlik için benzersiz tie-breaker belirle."
        }
      ]
    }
  }
];
