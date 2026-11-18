export const DB_SOURCES = [
  {
    "file": "CSE3055_exercise_1.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "CSE3055_exercise_2.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "CSE3055_exercise_3.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "CSE3055_exercise_4.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "CSE3055_exercise_5.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "CSE3055_exercise_6_flight.pdf",
    "pages": 2,
    "kind": "pdf"
  },
  {
    "file": "Slides_01_Database_Env_Proc.pdf",
    "pages": 18,
    "kind": "pdf"
  },
  {
    "file": "Slides_02_Modeling_Data.pdf",
    "pages": 27,
    "kind": "pdf"
  },
  {
    "file": "Slides_03_EER.pdf",
    "pages": 18,
    "kind": "pdf"
  },
  {
    "file": "Slides_04_Logical_DB_Design.pdf",
    "pages": 20,
    "kind": "pdf"
  },
  {
    "file": "advanced sql chapter 6.pdf",
    "pages": 23,
    "kind": "pdf"
  },
  {
    "file": "company rdb.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "company_sql_01_create.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "company_sql_02_insert.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "company_sql_03_alter.pdf",
    "pages": 1,
    "kind": "pdf"
  },
  {
    "file": "company_sql_statements_questions_only.pdf",
    "pages": 3,
    "kind": "pdf"
  },
  {
    "file": "intro to sql chapter 5.pdf",
    "pages": 21,
    "kind": "pdf"
  },
  {
    "file": "mapping in tutorial.pdf",
    "pages": 2,
    "kind": "pdf"
  },
  {
    "file": "midterm2020 database.pdf",
    "pages": 4,
    "kind": "pdf"
  },
  {
    "file": "tuto er part 2.pdf",
    "pages": 2,
    "kind": "pdf"
  },
  {
    "file": "tuto er_part 1.pdf",
    "pages": 2,
    "kind": "pdf"
  },
  {
    "file": "sql part1.txt",
    "pages": 1,
    "kind": "text"
  },
  {
    "file": "sql part2.txt",
    "pages": 1,
    "kind": "text"
  },
  {
    "file": "sql part3.txt",
    "pages": 1,
    "kind": "text"
  },
  {
    "file": "sql part4.txt",
    "pages": 1,
    "kind": "text"
  },
  {
    "file": "sql part5.txt",
    "pages": 1,
    "kind": "text"
  }
];

export function dbSource(refs) {
  return {
    sourceRefs: refs,
    source: refs.map(({file,pages}) => file + (file.endsWith('.pdf') ? ' · PDF s. '+pages.join(', ') : ' · ders SQL notu')).join(' | '),
  };
}
export const DB_CREDITS = "Yüklenen mstfnggrsn(2).zip: 21 PDF (151 fiziksel PDF sayfası) ve 5 SQL metni. Modern Database Management bölüm 1–6 slaytları, CSE3055 tutorial/alıştırma ve 2020 vize materyalleri konu kapsamını belirlemek için incelendi. Anlatımlar ve sorular özgün Türkçe senaryolarla hazırlandı; PDF sayfaları ve özgün sınav soruları yeniden yayımlanmaz. Kaynak göstermek kullanım lisansı anlamına gelmez.";
export const DB_CONVENTIONS = [
  "ER’de maksimum cardinality (1:1, 1:N, M:N) ile minimum katılım (0 veya 1) ayrı kurallardır. Bir 1:1 ilişki her iki tarafta zorunlu katılım anlamına gelmez. Tekrarlanan kayıtlar için dönem/tarih veya olay kimliği gerekebilir.",
  "Diyagram ve senaryolar yeni örneklerdir. Crow’s foot ile Chen işaretleri karıştırılmaz; min/max kısıtlar soruda sözcüklerle de belirtilir. Kullanıcı veya üretilen rapor, iş alanında bağımsız kimliği ve kayıt gereksinimi varsa entity olabilir.",
  "1:1 mapping’de foreign key ile birlikte UNIQUE ve zorunlu tarafta NOT NULL gerekebilir. Birçok 1:N/M:N/ternary katılım kuralı yalnız standart FK/UNIQUE ile tam olarak ifade edilemez.",
  "SQL Server’a özgü TOP, IDENTITY, NVARCHAR, LEN/DATALENGTH, GETDATE ve tarih fonksiyonları ilgili örnekte açıkça belirtilir. Standart SELECT örnekleri başka bir SQL ürününün tür/NULL/collation kurallarıyla karıştırılmaz.",
  "LEFT JOIN eşleşme koşulu ON bölümündedir. Sağ tabloyu WHERE ile kısıtlamak eşleşmeyen satırları silebilir. COUNT(*) ile COUNT(column), NOT IN ile NOT EXISTS ve NULL üç değerli mantığı ayrı incelenir. ORDER BY olmadan satır sırası garanti edilmez.",
  "Kaynak SQL notundaki tamamlanmamış ON DELETE satırı kullanılabilir bir komut değildir. Slayttaki WHERE’de SELECT alias kullanımı SQL Server’da geçerli değildir. DATEDIFF(year,...) tek başına tamamlanmış yaş hesabı değildir.",
  "Logical DB Design dosyası normalizasyon/merging hedeflerini listelese de ayrıntılı FD, 2NF/3NF ve merging slaytlarını içermiyor. Bu sürüm bu başlıklarda tam bir ders sunduğunu iddia etmez; atomiklik, anahtarlar ve sağlanan mapping içeriği kapsanır.",
];
