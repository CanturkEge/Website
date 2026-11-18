// Original Turkish adaptations of uploaded Week5–6 slides. PDF pages are 1-based.
export const DS_TREES = [
  {
    "week": 5,
    "questions": [
      {
        "difficulty": 1,
        "type": "mc",
        "prompt": "Bir binary tree düğümünün doğrudan çocuk sayısı için doğru sınır hangisidir?",
        "options": [
          "Tam olarak iki",
          "En fazla iki",
          "En fazla bir",
          "Sınırsız; yalnız yapraklar sınırlıdır"
        ],
        "answer": 1,
        "explanation": "Binary tree, her düğümün en fazla iki çocuğu olmasıyla tanımlanır. Sıfır veya bir çocuk da mümkündür; bu tanım anahtarların sıralı olduğunu söylemez.",
        "hint": "Çocuk sayısı ile anahtar sırası farklı koşullardır.",
        "pages": [
          12
        ]
      },
      {
        "difficulty": 1,
        "type": "tf",
        "prompt": "Yüksekliği kenar sayısıyla ölçtüğümüzde her yaprağın yüksekliği 0’dır.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Yapraktan kendisine uzanan en uzun aşağı yol sıfır kenar içerir. Kökün derinliği de 0’dır, fakat ağaç birden fazla seviyeliyse kökün yüksekliği 0 olmak zorunda değildir.",
        "hint": "Depth yukarıdaki köke, height aşağıdaki yaprağa bakar.",
        "pages": [
          7,
          9
        ]
      },
      {
        "difficulty": 1,
        "type": "short",
        "prompt": "Kök derinliği 0 olarak tanımlanıyor. Kök → A → B → C yolunda C’nin derinliği kaçtır?",
        "options": [],
        "answer": [
          "3"
        ],
        "explanation": "Kökten C’ye üç kenar geçilir. Depth düğüm sayısını değil kökten itibaren kenar sayısını ölçer; yolun dört düğüm içermesi sonucu 4 yapmaz.",
        "hint": "Yoldaki okları say.",
        "pages": [
          7
        ],
        "numeric": {
          "value": 3,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 1,
        "type": "multi",
        "prompt": "Köklü bir ağaç için doğru ifadelerin tümünü seç.",
        "options": [
          "Aynı ebeveynin çocukları siblings’tir",
          "Çocuğu olmayan düğüm leaf’tir",
          "Kökün ebeveyni yoktur",
          "Her düğümün tam iki çocuğu vardır"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Sibling ve leaf ilişkileri çocuk/ebeveyn bağlantılarından tanımlanır. İki çocuk zorunluluğu genel ağaçta da binary tree’de de yoktur; binary tree yalnız üst sınır koyar.",
        "hint": "Bir ilişki tanımını ağacın zorunlu biçimiyle karıştırma.",
        "pages": [
          5,
          6,
          12
        ]
      },
      {
        "difficulty": 1,
        "type": "match",
        "prompt": "Binary tree dolaşımlarını işlem sırasıyla eşleştir. L/R işlemleri ilgili alt ağacın tamamını dolaşır.",
        "options": [
          "Inorder",
          "Preorder",
          "Postorder"
        ],
        "answer": [
          "Sol → düğüm → sağ",
          "Düğüm → sol → sağ",
          "Sol → sağ → düğüm"
        ],
        "explanation": "Düğümün işlenme yeri dolaşım adını belirler. Sol veya sağ alt ağaca gitmek tek çocuğu yazmak değil, o alt ağacı aynı kuralla bütünüyle işlemektir.",
        "hint": "N harfinin L ve R’ye göre konumuna bak.",
        "pages": [
          14,
          15,
          16,
          17
        ]
      },
      {
        "difficulty": 1,
        "type": "order",
        "prompt": "Boş olmayan bir BST’de tek bir anahtarı aramanın tekrarlanan karar döngüsünü sırala.",
        "options": [
          "Aramaya kök düğümden başla",
          "Aranan anahtarı mevcut düğümün anahtarıyla karşılaştır",
          "Eşitse bitir; değilse küçük için sol, büyük için sağ bağlantıyı seç",
          "Seçilen bağlantı NULL ise yok de; değilse yeni düğümde karşılaştırmayı tekrarla"
        ],
        "answer": [
          "Aramaya kök düğümden başla",
          "Aranan anahtarı mevcut düğümün anahtarıyla karşılaştır",
          "Eşitse bitir; değilse küçük için sol, büyük için sağ bağlantıyı seç",
          "Seçilen bağlantı NULL ise yok de; değilse yeni düğümde karşılaştırmayı tekrarla"
        ],
        "explanation": "BST araması tek bir uygun alt ağaca iner. NULL’a ulaşmak yokluk kanıtıdır; her düğümde iki alt ağacı birden taramak sıralama özelliğini kullanmaz.",
        "hint": "Başlangıç, karşılaştırma, yön seçimi ve durma koşulunu ayır.",
        "pages": [
          38,
          58,
          59
        ]
      },
      {
        "difficulty": 2,
        "type": "mc",
        "prompt": "Anahtarlar tekrarsızdır. Kök 40’ın sol çocuğu 20, 20’nin sağ çocuğu 45; kökün sağ çocuğu 60. Bu yapı neden BST değildir?",
        "options": [
          "20’nin iki çocuğu olmadığı için",
          "45, 20’den büyük olduğu için",
          "45 kökün sol alt ağacında olmasına rağmen 40’tan büyük olduğu için",
          "60 kökün doğrudan çocuğu olduğu için"
        ],
        "answer": 2,
        "explanation": "BST koşulu yalnız ebeveyn ile çocuk arasında değil, düğüm ile tüm sol/sağ alt ağaç anahtarları arasında geçerlidir. 45 yerel olarak 20’nin sağına uyar, fakat üstteki 40 sınırını bozar.",
        "hint": "Atadan gelen anahtar aralığını koru.",
        "pages": [
          38
        ]
      },
      {
        "difficulty": 2,
        "type": "tf",
        "prompt": "Her binary tree’nin inorder dolaşımı anahtarları küçükten büyüğe verir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "Artan inorder sırası, tekrarsız anahtarlı BST’nin sıralama koşulundan gelir. Sıradan binary tree’de sol/sağ çocukların anahtar büyüklüğü hakkında zorunlu bir kural yoktur.",
        "hint": "Binary tree ile binary search tree aynı sınıf mı?",
        "pages": [
          12,
          14,
          38
        ]
      },
      {
        "difficulty": 2,
        "type": "short",
        "prompt": "Boş BST’ye 40, 20, 60, 10, 30, 50, 70 sırasıyla ekleniyor. 30 aranırken her ziyaret edilen düğümü bir karşılaştırma sayarsak kaç karşılaştırma yapılır?",
        "options": [],
        "answer": [
          "3"
        ],
        "explanation": "Arama yolu 40 → 20 → 30’dur. Başarılı aramada düğüm ziyaret sayısı depth+1 olur; burada 30’un derinliği 2 olduğu için üç ziyaret gerekir.",
        "hint": "Yalnız aranan anahtarın belirlediği dala ilerle.",
        "pages": [
          38,
          58,
          59,
          75
        ],
        "numeric": {
          "value": 3,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 2,
        "type": "multi",
        "prompt": "Tekrarsız anahtarlı bir BST için doğru ifadeleri seç.",
        "options": [
          "Minimum anahtar için mümkün olduğu sürece sola gidilir",
          "Maksimum anahtar için mümkün olduğu sürece sağa gidilir",
          "Inorder dolaşımı artan sıralıdır",
          "Kök her zaman aritmetik ortalama anahtarı taşır"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Sol alt ağacın bütün anahtarları daha küçüktür; minimum en solda, maksimum en sağda bulunur. Kökün hangi değer olduğu ekleme sırasına bağlıdır; ortalama olma zorunluluğu yoktur.",
        "hint": "Anahtar aralığı kuralından çıkarım yap.",
        "pages": [
          14,
          38,
          73,
          74,
          75
        ]
      },
      {
        "difficulty": 2,
        "type": "match",
        "prompt": "Aynı ifade ağacı için gösterimleri eşleştir: kök +, sol yaprak A; sağ çocuk * ve onun yaprakları B ile C.",
        "options": [
          "Preorder çıktısı",
          "Postorder çıktısı",
          "Parantezli inorder ifadesi"
        ],
        "answer": [
          "+ A * B C",
          "A B C * +",
          "A + (B * C)"
        ],
        "explanation": "Preorder operatörü operandlarından önce, postorder sonra üretir. Inorder gösteriminde parantezler ağacın gruplamasını korur; A+B*C’de çarpmanın alt ağaç olması bu örnekte öncelikle de uyumludur.",
        "hint": "Önce sağ alt ağacın B*C olduğunu belirle.",
        "pages": [
          14,
          18,
          19
        ]
      },
      {
        "difficulty": 2,
        "type": "order",
        "prompt": "Kök 4; sol alt ağaç 2’nin çocukları 1 ve 3, sağ alt ağaç 6’nın çocukları 5 ve 7. Postorder düğüm sırasını oluştur.",
        "options": [
          "1",
          "3",
          "2",
          "5",
          "7",
          "6",
          "4"
        ],
        "answer": [
          "1",
          "3",
          "2",
          "5",
          "7",
          "6",
          "4"
        ],
        "explanation": "Postorder, önce sol alt ağacı 1,3,2; sonra sağ alt ağacı 5,7,6 olarak bitirir, en son kök 4’ü işler. Her alt ağacın kökü kendi çocuklarından sonra gelir.",
        "hint": "Sol → sağ → düğüm kuralını her alt ağaçta yeniden uygula.",
        "pages": [
          14,
          17
        ]
      },
      {
        "difficulty": 3,
        "type": "mc",
        "prompt": "BST’de 40’ın iki çocuğu var. Sağ alt ağacının kökü 70, 70’in sol çocuğu 50, 50’nin sağ çocuğu 60; 50’nin solu boş. Successor kullanarak 40 silinince eski 50 konumuna hangi bağlantı taşınır?",
        "options": [
          "NULL; 60 da silinir",
          "60; 70’in sol bağlantısı artık 60 olur",
          "70; sağ alt ağaç bütünüyle köke çıkar",
          "40; eski anahtar aşağı kopyalanır"
        ],
        "answer": 1,
        "explanation": "40’ın inorder successor’ı sağ alt ağacın minimumu 50’dir. 50 köke kopyalanır; eski 50 düğümü silinirken tek sağ çocuğu 60 ebeveynine bağlanır. 60 verisi kaybedilmez.",
        "hint": "Successor’ın sol çocuğu olamaz; sağ çocuğu olabilir.",
        "pages": [
          73,
          76
        ]
      },
      {
        "difficulty": 3,
        "type": "tf",
        "prompt": "Anahtarlar farklı olsa bile yalnız preorder ve postorder dizileri, her binary tree’yi tek biçimde belirlemek zorunda değildir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Tek çocuklu bir düğümde çocuğun solda veya sağda olması preorder/postorder sırasını değiştirmeyebilir. Örneğin kök A ve tek çocuk B iki konumda da preorder A,B; postorder B,A verir.",
        "hint": "İki düğümlü ağacı iki farklı çocuk yönüyle düşün.",
        "pages": [
          12,
          14,
          16,
          17
        ]
      },
      {
        "difficulty": 3,
        "type": "short",
        "prompt": "Boş BST’ye 50,30,70,20,40,60,80,65 ekleniyor. Yaprak yüksekliği 0, boş alt ağaç yüksekliği −1 kabulüyle ağacın yüksekliği kaçtır?",
        "options": [],
        "answer": [
          "3"
        ],
        "explanation": "En uzun yol 50 → 70 → 60 → 65’tir ve üç kenar içerir. Son eklenen anahtar 65, 60’ın sağına gider; bütün düğümleri tek zincir saymak da yalnız ilk üç seviyeyi görmek de yanlıştır.",
        "hint": "Anahtarları eklerken her atanın aralık koşulunu uygula.",
        "pages": [
          7,
          9,
          38,
          75
        ],
        "numeric": {
          "value": 3,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 3,
        "type": "multi",
        "prompt": "Recursive BST insert/remove işlevi güncellenmiş alt ağaç kökünü döndürüyor. Doğru tasarım kararlarını seç.",
        "options": [
          "Sol alt ağaç değişirse p->left dönüş değerine atanır",
          "Ana kök silinebilirse çağıran root dönüş değerini tutar",
          "Tek çocuklu düğüm silinirken çocuk ebeveyne bağlanır",
          "Düğüm free edildikten sonra eski düğümün çocuk alanları güvenle okunabilir"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Alt ağacın kökü ekleme veya silmeyle değişebilir; dönüş değerini bağlantıya yazmak bu değişimi korur. Serbest bırakılmış düğüme sonradan erişmek geçerli bir pointer işlemi değildir; gereken bağlantı önce alınır.",
        "hint": "Dönüş değeri yalnız başarı bayrağı değil, yeni bağlantı olabilir.",
        "pages": [
          75,
          76
        ]
      },
      {
        "difficulty": 3,
        "type": "match",
        "prompt": "Genel ağacın first-child / next-sibling gösteriminde A’nın çocukları B,C,D; B’nin tek çocuğu E. Bağlantıları hedefleriyle eşleştir.",
        "options": [
          "A.child",
          "B.sibling",
          "C.sibling",
          "B.child"
        ],
        "answer": [
          "B",
          "C",
          "D",
          "E"
        ],
        "explanation": "child ilk çocuğu, sibling aynı ebeveyn altındaki bir sonraki kardeşi gösterir. B.sibling=C bağlantısı C’yi B’nin çocuğu yapmaz; iki pointer alanının anlamı farklıdır.",
        "hint": "İlk çocuk aşağı, sonraki kardeş aynı seviyede ilerler.",
        "pages": [
          10,
          11
        ]
      },
      {
        "difficulty": 3,
        "type": "order",
        "prompt": "A+(B*C) ifade ağacını postfix ile yaz. Her tokenı bir kez kullan.",
        "options": [
          "A",
          "B",
          "C",
          "*",
          "+"
        ],
        "answer": [
          "A",
          "B",
          "C",
          "*",
          "+"
        ],
        "explanation": "Önce A yaprağı, sonra B*C alt ağacının B,C,* sırası, en son + kökü gelir. Postfix’te * ile + sırasını değiştirmek farklı bir ifade ağacı kurar.",
        "hint": "Operatör her iki operand alt ağacından sonra yazılır.",
        "pages": [
          17,
          18,
          19
        ]
      },
      {
        "difficulty": 4,
        "type": "mc",
        "prompt": "Tekrarsız bir binary tree’nin preorder’ı 40,20,10,30,60,50,70; inorder’ı 10,20,30,40,50,60,70. Postorder hangisidir?",
        "options": [
          "10,30,20,50,70,60,40",
          "40,20,30,10,60,70,50",
          "10,20,30,40,50,60,70",
          "70,50,60,30,10,20,40"
        ],
        "answer": 0,
        "explanation": "Preorder’ın ilk değeri kök 40’tır. Inorder kökü ayırınca sol bölüm 10,20,30; sağ bölüm 50,60,70 olur. Alt kökler 20 ve 60; postorder’da çocukları önce yazınca 10,30,20,50,70,60,40 elde edilir.",
        "hint": "Inorder’daki kök konumunu sol/sağ sınırlarını belirlemek için kullan.",
        "pages": [
          14,
          15,
          16,
          17
        ]
      },
      {
        "difficulty": 4,
        "type": "tf",
        "prompt": "Bir BST’de f(n) düğüm derinliklerinin toplamıysa, her anahtar eşit olasılıkla başarıyla arandığında ortalama düğüm ziyareti f(n)/n’dir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "Her başarılı arama, derinliği d olan düğüm için kök dahil d+1 düğüm ziyaret eder. Toplam ziyaret f(n)+n, ortalama ise f(n)/n+1’dir. Derinlik ile kök karşılaştırmasını ayrı saymak gerekir.",
        "hint": "Kökün derinliği 0 iken kökte bulunan anahtar sıfır ziyaret gerektirmez.",
        "pages": [
          59,
          60,
          62,
          63,
          83
        ]
      },
      {
        "difficulty": 4,
        "type": "short",
        "prompt": "Kök 4; çocukları 2 ve 6; onların yaprakları 1,3,5,7 olan BST’de her anahtar bir kez aranıyor. Ziyaret edilen her düğüm bir karşılaştırma sayılırsa toplam kaçtır?",
        "options": [],
        "answer": [
          "17"
        ],
        "explanation": "Derinlikler 0; iki kez 1; dört kez 2’dir. f=0+2+8=10. Yedi aramanın her birindeki kök ziyareti için 7 daha eklenir: toplam 17.",
        "hint": "Her seviyedeki düğüm sayısını depth+1 ile çarp.",
        "pages": [
          59,
          62,
          63,
          83
        ],
        "numeric": {
          "value": 17,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 4,
        "type": "multi",
        "prompt": "İki çocuklu bir BST düğümünü sağ alt ağacın minimumuyla silme yöntemi için doğru ifadeleri seç.",
        "options": [
          "Successor anahtarı silinen düğüme taşınır",
          "Eski successor düğümü sağ alt ağaçtan ayrıca kaldırılır",
          "Successor’ın sağ çocuğu varsa silme sırasında uygun ebeveyne bağlanır",
          "Minimumu bulmak için sağ alt ağaçta sürekli sağa gidilir"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Sağ alt ağacın minimumu inorder successor’dır. Kopyalamak tek başına silme değildir: eski düğüm kaldırılmazsa tekrarsızlık bozulur. Minimum ararken sola gidilir, olası sağ çocuk korunur.",
        "hint": "İki farklı yeri izle: anahtarın taşındığı yer ve eski düğümün kaldırıldığı yer.",
        "pages": [
          73,
          76,
          77,
          78,
          79,
          80
        ]
      },
      {
        "difficulty": 4,
        "type": "match",
        "prompt": "Boş BST’ye 10,20,30,40 sırayla ekleniyor. Her anahtarın derinliğini eşleştir; kök derinliği 0.",
        "options": [
          "Anahtar 10",
          "Anahtar 20",
          "Anahtar 30",
          "Anahtar 40"
        ],
        "answer": [
          "0 kenar",
          "1 kenar",
          "2 kenar",
          "3 kenar"
        ],
        "explanation": "Artan anahtarlar her adımda sağ bağlantıya gider ve zincir oluşturur. BST anahtarları sıralı tutar, fakat kendiliğinden dengeli tutmaz; son anahtar derinlik 3’tedir.",
        "hint": "Dengeli ağaç varsayma; ekleme sırasını izle.",
        "pages": [
          38,
          69,
          75
        ]
      },
      {
        "difficulty": 4,
        "type": "order",
        "prompt": "40 köklü iki çocuklu bir BST’de successor ile kök silme işleminin mantıksal adımlarını sırala. Sağ alt ağaç boş değildir.",
        "options": [
          "Sağ alt ağacın en sol düğümünü bul",
          "Bu düğümün anahtarını mevcut köke kopyala",
          "Sağ alt ağaçta eski successor düğümünü sil",
          "Silmenin döndürdüğü alt ağaç kökünü sağ bağlantıya yaz",
          "Güncellenen ana kök bağlantısını çağırana döndür"
        ],
        "answer": [
          "Sağ alt ağacın en sol düğümünü bul",
          "Bu düğümün anahtarını mevcut köke kopyala",
          "Sağ alt ağaçta eski successor düğümünü sil",
          "Silmenin döndürdüğü alt ağaç kökünü sağ bağlantıya yaz",
          "Güncellenen ana kök bağlantısını çağırana döndür"
        ],
        "explanation": "Successor sağ alt ağacın en küçüğüdür. Anahtarın kopyalanması, eski successor’ın silinmesi ve değişebilen alt ağaç bağlantısının tutulması birlikte BST yapısını korur.",
        "hint": "Anahtar kopyalamak ile düğüm bağlantısını kaldırmak farklı adımlardır.",
        "pages": [
          73,
          76
        ]
      },
      {
        "difficulty": 5,
        "type": "mc",
        "prompt": "Boş BST’ye 40,20,60,10,30,50,70,55 ekleniyor. 40 successor yöntemiyle siliniyor. 55 aramasının düğüm yolu hangisidir?",
        "options": [
          "50 → 60 → 55",
          "50 → 55",
          "40 → 60 → 50 → 55",
          "60 → 50 → 55"
        ],
        "answer": 0,
        "explanation": "Başlangıçta 55, 50’nin sağ çocuğudur. 40 yerine successor 50 kopyalanır; eski 50’nin tek çocuğu 55, 60’ın soluna bağlanır. Yeni kök 50’den 55 araması sağdaki 60’a, oradan soldaki 55’e gider.",
        "hint": "Kopyalanan anahtarın eski yerindeki bağlantıyı da güncelle.",
        "pages": [
          38,
          73,
          75,
          76
        ]
      },
      {
        "difficulty": 5,
        "type": "tf",
        "prompt": "Tekrarsız anahtarlı ve dengelenmeyen bir BST’de anahtarlar artan sırayla eklenirse en büyük anahtarın aranması Θ(n) düğüm ziyareti gerektirebilir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Her yeni anahtar sağ uçtaki düğüme eklenir; n düğümlü zincirin yüksekliği n−1’dir. En büyük anahtar derinlik n−1’de olduğundan arama n ziyaret yapar; BST adı tek başına logaritmik garanti vermez.",
        "hint": "Arama süresini düğüm sayısından önce oluşan yüksekliğe bağla.",
        "pages": [
          38,
          69,
          70,
          75
        ]
      },
      {
        "difficulty": 5,
        "type": "short",
        "prompt": "Bir BST’nin kökü 40; sol çocuğu 20’nin çocukları 10 ve 30; sağ çocuğu yaprak 60. Her anahtar eşit olasılıkla başarıyla aranıyor. Her düğüm ziyareti bir karşılaştırma sayılırsa ortalama kaçtır? Sayısal değer yaz.",
        "options": [],
        "answer": [
          "2.2"
        ],
        "explanation": "Derinlikler sırasıyla 0,1,2,2,1’dir; toplamları 6’dır. Beş başarılı aramada toplam 6+5=11 ziyaret olur, ortalama 11/5=2,2’dir. C’deki birden fazla if ifadesini ayrı karşılaştırma saymıyoruz.",
        "hint": "Düğüm ziyareti = depth+1; ağırlıklar bütün anahtarlar için eşit.",
        "pages": [
          59,
          60,
          62,
          83
        ],
        "numeric": {
          "value": 2.2,
          "tolerance": 1e-08,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 1e-08
        }
      },
      {
        "difficulty": 5,
        "type": "multi",
        "prompt": "Aşağıdaki BST analizlerinden doğru olanları seç. n düğüm sayısı, h kenar cinsinden yükseklik; bir ziyaret bir birim maliyet.",
        "options": [
          "Belirli bir aramanın maliyeti izlediği yol uzunluğuna bağlıdır",
          "Artan ekleme sırası h=n−1 üretebilir",
          "Bütün anahtarların birer kez aranmasının toplamı f(n)+n olur; f derinlikler toplamıdır",
          "Ortalama O(log n) ifadesi, her ekleme sırası için en kötü aramanın O(log n) olduğunu garanti eder"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Arama maliyeti yapıya ve aranan anahtara bağlıdır. Ortalama analizinin dağılım/şekil varsayımları, tek bir kötü ekleme sırasını yasaklamaz; toplam derinlik de tek aramanın maliyetiyle aynı nicelik değildir.",
        "hint": "Toplam maliyet, ortalama maliyet ve en kötü tek aramayı birbirinden ayır.",
        "pages": [
          59,
          60,
          62,
          65,
          68,
          69,
          70
        ]
      },
      {
        "difficulty": 5,
        "type": "match",
        "prompt": "Bir anahtarın varlığı/yokluğu için BST’deki arama kanıtlarını eşleştir. Anahtarlar tekrarsızdır.",
        "options": [
          "Kök anahtarı aranana eşit",
          "Aranan küçük; sol bağlantı NULL",
          "Sağ alt ağaçta minimum aranıyor",
          "İki çocuklu düğüm successor ile siliniyor"
        ],
        "answer": [
          "Başarılı arama: bir düğüm ziyareti",
          "Başarısız arama: uygun küçük anahtar alt ağacı yok",
          "Sağ alt ağacın en sol düğümünü bul",
          "Anahtarı taşı; eski successor düğümünü kaldır"
        ],
        "explanation": "Arama bir dala yönelince diğer daldaki anahtarların aralıkları dışlanır. NULL ilgili aralığın boş olduğunu, eşitlik başarıyı kanıtlar; successor silmesi ayrıca bağlantı onarımı gerektirir.",
        "hint": "Hangi bilgi sonuca yeterli, hangi bilgi sonraki işlem için kullanılıyor?",
        "pages": [
          38,
          58,
          73,
          76
        ]
      },
      {
        "difficulty": 5,
        "type": "order",
        "prompt": "((A+B)*(C−D))/E ifade ağacının postfix token sırasını oluştur. Her sembol bir token ve her operand farklıdır.",
        "options": [
          "A",
          "B",
          "+",
          "C",
          "D",
          "−",
          "*",
          "E",
          "/"
        ],
        "answer": [
          "A",
          "B",
          "+",
          "C",
          "D",
          "−",
          "*",
          "E",
          "/"
        ],
        "explanation": "Sol çarpım alt ağacı önce A,B,+ ve C,D,− parçalarını, sonra * operatörünü verir. Bölmenin sağ yaprağı E bundan sonra gelir; en son / yazılır. Operand/operatör sırasını değiştirmek bölme ve çıkarmanın yönünü de değiştirebilir.",
        "hint": "Her operatörü iki alt ağacı tamamen bittikten sonra yerleştir.",
        "pages": [
          17,
          18,
          19,
          37
        ]
      }
    ],
    "lessons": [
      {
        "title": "Ağaç dili: ilişki, derinlik ve yükseklik",
        "summary": "Düğümleri saymadan önce hangi yolu ölçtüğünü belirle.",
        "pages": [
          5,
          6,
          7,
          8,
          9,
          10,
          11
        ],
        "sections": [
          {
            "title": "Root, parent, child, sibling",
            "text": "Ağaç (tree), bir kök (root) ve ona bağlı alt ağaçlardan oluşan hiyerarşidir. Doğrudan üstteki düğüm parent, doğrudan alttaki child’dır. Aynı ebeveyni paylaşan düğümler sibling olur. Bir düğümün torunu olması onun doğrudan çocuğu olması anlamına gelmez; ancestor/descendant yolu birden fazla kenar içerebilir.",
            "example": "A’nın çocukları B ve C, B’nin çocuğu D ise B ile C kardeştir. D, A’nın torunu; B’nin doğrudan çocuğudur."
          },
          {
            "title": "Depth ve height farklı yönlerden ölçülür",
            "text": "Depth, kökten düğüme giden yolun kenar sayısıdır; kökün derinliği 0’dır. Height, düğümden bir yaprağa giden en uzun aşağı yolun kenar sayısıdır; yaprak yüksekliği 0’dır. Burada boş alt ağacın yüksekliğini −1 seçiyoruz. Bu seçim, height(node)=1+max(height(left),height(right)) ifadesinin yaprakta da çalışmasını sağlar.",
            "example": "Kök→B→D yolunda D’nin derinliği 2’dir. D yapraksa yüksekliği 0’dır; bu iki sayı aynı ölçü değildir."
          },
          {
            "title": "Çok çocuklu düğümü temsil et",
            "text": "Genel ağaçta çocuk sayısı düğümden düğüme değişebilir. First-child/next-sibling gösterimi iki bağlantıyla değişken sayıda çocuğu temsil eder: child ilk çocuğa, sibling sonraki kardeşe gider. Sibling bağlantısını çocuk ilişkisi sanmak ağacın hiyerarşisini yanlış okutur. Binary tree’deki left/right alanlarının anlamıyla bu gösterimi karıştırma."
          }
        ],
        "cards": [
          [
            "Kökün derinliği ve yaprağın yüksekliği?",
            "İkisi de kenar sayısı tanımıyla 0’dır; fakat farklı yolları ölçerler."
          ],
          [
            "child ve sibling bağlantıları neyi gösterir?",
            "child ilk çocuğu, sibling aynı ebeveynin sonraki çocuğunu gösterir."
          ]
        ],
        "checks": [
          {
            "prompt": "Kök→A→B yolunda B yaprak. B’nin (depth,height) çifti nedir?",
            "options": [
              "(2,0)",
              "(0,2)",
              "(3,1)"
            ],
            "answer": 0,
            "explanation": "Köke iki kenar uzaklık depth=2; aşağıda çocuk olmadığından height=0."
          },
          {
            "prompt": "A.child=B ve B.sibling=C ise kesin doğru yorum hangisi?",
            "options": [
              "C, B’nin çocuğudur",
              "B ve C, A’nın çocuklarıdır",
              "A ile C kardeştir"
            ],
            "answer": 1,
            "explanation": "İlk çocuk B’den kardeş bağlantısıyla C’ye geçilir; C’nin ebeveyni de A’dır."
          }
        ]
      },
      {
        "title": "Binary tree dolaşımları ve ifade ağaçları",
        "summary": "Önce alt ağacı bütünüyle bitir; sonra kökün sırasını düşün.",
        "pages": [
          12,
          14,
          15,
          16,
          17,
          18,
          19,
          24,
          28,
          37
        ],
        "sections": [
          {
            "title": "Üç traversal kuralı",
            "text": "Binary tree her düğümde en fazla iki çocuk bulundurur. Preorder, düğüm-sol-sağ (NLR); inorder, sol-düğüm-sağ (LNR); postorder, sol-sağ-düğüm (LRN) sırasını uygular. Her sol/sağ adımı tek düğüme bakmak değil, aynı kuralla bütün alt ağacı dolaşmaktır. Tek bir ağacı üç farklı sırada yazmak, üç ayrı ağaç kurmak değildir."
          },
          {
            "title": "Operatörler iç düğümlerde, operandlar yapraklarda",
            "text": "İfade ağacının iç düğümleri operatörleri; yaprakları operandları temsil eder. Preorder prefix, postorder postfix gösterimini verir. Inorder’da parantezler alt ağaçların gruplamasını korur. Çıkarma ve bölmede sol/sağ operand yerini değiştirmek sonucu değiştirir.",
            "example": "A−B ağacında preorder − A B; postorder A B − olur. B A − aynı işlem değildir."
          },
          {
            "title": "Postfix’ten alt ağaçları yığınla kur",
            "text": "Operand gelince tek yapraklı ağacı stack’e push et. İkili operatör gelince önce pop edilen ağaç sağ operand, ikinci pop edilen sol operand olur; yeni operatör köklü ağacı tekrar push et. Geçerli ifade bittiğinde tek ağaç kalır. Slayttaki pop sırası ifadesini soldan-sağa operand anlamıyla birlikte okumak gerekir.",
            "example": "A B C * +: B ve C’den * alt ağacı, sonra A ve bu alt ağaçtan + kökü kurulur."
          }
        ],
        "cards": [
          [
            "Postorder’da kök ne zaman işlenir?",
            "Sol ve sağ alt ağaçların tamamından sonra."
          ],
          [
            "Postfix ikili operatöründe ilk pop edilen hangi operanddır?",
            "Sağ operand; ikinci pop edilen sol operanddır."
          ]
        ],
        "checks": [
          {
            "prompt": "Kök *, sol A, sağ kökü + olan B/C alt ağacı. Prefix hangisi?",
            "options": [
              "A B C + *",
              "* A + B C",
              "A * B + C"
            ],
            "answer": 1,
            "explanation": "NLR: * kökü, A solu, sonra + B C sağ alt ağacı."
          },
          {
            "prompt": "A B − postfix’inde stack’ten önce B pop edildi. Sağ operand hangisi?",
            "options": [
              "A",
              "B",
              "−"
            ],
            "answer": 1,
            "explanation": "İlk pop en son eklenen B’dir ve sağ operand olur; ikinci pop A soldadır."
          }
        ]
      },
      {
        "title": "BST anahtar aralıkları ve arama",
        "summary": "Yalnız komşu değerleri değil ataların bütün sınırlarını koru.",
        "pages": [
          38,
          39,
          40,
          41,
          57,
          58,
          59,
          69,
          73,
          74,
          75
        ],
        "sections": [
          {
            "title": "Binary search tree bir sıralama invariantı ekler",
            "text": "Tekrarsız anahtar varsayımıyla her düğümün sol alt ağacındaki bütün anahtarlar daha küçük, sağ alt ağacındaki bütün anahtarlar daha büyüktür. Bu yalnız ebeveyn-çocuk karşılaştırması değildir. Bir torun, kendi ebeveynine uygun yerde olsa bile üst atanın sınırını bozabilir. Duplicate anahtarlara izin verilecekse ayrıca tutarlı bir politika gerekir.",
            "example": "40’ın solundaki 20’nin sağ çocuğu 45 olamaz; 45>20 yerel olarak doğru olsa da 45<40 üst sınırını ihlal eder."
          },
          {
            "title": "Arama, minimum ve maksimum",
            "text": "Aramada aranan k mevcut değerden küçükse sol, büyükse sağ alt ağaca in. Eşitlik başarı, ilgili bağlantının NULL olması başarısızlık demektir. Minimum için sürekli sola, maksimum için sürekli sağa gidilir. Tekrarsız bir BST’nin inorder dolaşımı anahtarları artan verir; sıradan binary tree için bu sonuç geçerli değildir."
          },
          {
            "title": "Ekleme sırası biçimi belirler",
            "text": "Yeni anahtar arama yolundaki boş bağlantıya eklenir. Artan sırada eklemek sağa doğru zincir üretebilir; “search tree” olması “balanced tree” olması değildir. Arama ve ekleme maliyeti yüksekliğe bağlıdır. Recursive insert’in döndürdüğü alt kök, ebeveynin ilgili bağlantısında tutulmalıdır.",
            "example": "10,20,30,40 eklemek h=3 zinciri verir; 20,10,30,40 aynı anahtarları farklı şekle yerleştirir."
          }
        ],
        "cards": [
          [
            "BST’de minimum nerede?",
            "Boş olmayan ağaçta sürekli sol bağlantılar izlenerek bulunan düğümde."
          ],
          [
            "Sıralı anahtar kümesi dengeli BST garantiler mi?",
            "Hayır. Ekleme sırası ve dengeleme yöntemi ağacın şeklini belirler."
          ]
        ],
        "checks": [
          {
            "prompt": "40 kökünün sol alt ağacında 45 bulundu. 45’in ebeveyni 20 olsa da sorun nedir?",
            "options": [
              "45 çift sayıya yakın",
              "Atadan gelen 40 üst sınırı bozulmuş",
              "Sol alt ağaçta sağ çocuk olamaz"
            ],
            "answer": 1,
            "explanation": "Sol alt ağacın bütün anahtarları 40’tan küçük olmalıdır; koşul yalnız doğrudan çocuklara ait değildir."
          },
          {
            "prompt": "Aranan 25, mevcut düğüm 20; sağ bağlantı NULL. Ne sonuç çıkar?",
            "options": [
              "25 ağaçta yok",
              "Sol alt ağacın tamamı taranmalı",
              "25 kesin köktedir"
            ],
            "answer": 0,
            "explanation": "25>20 olduğundan uygun aralık sağdadır; o alt ağaç boşsa anahtar bulunamaz."
          }
        ]
      },
      {
        "title": "BST silme ve arama maliyetini birlikte izle",
        "summary": "Anahtarı taşımak, eski düğümü kaldırmak ve maliyeti saymak ayrı işlerdir.",
        "pages": [
          59,
          60,
          62,
          63,
          68,
          69,
          70,
          75,
          76,
          77,
          78,
          79,
          80,
          83
        ],
        "sections": [
          {
            "title": "Yaprak ve tek çocuklu silme",
            "text": "Yaprağı silerken ebeveynin bağlantısı NULL olur. Tek çocuk varsa düğümün yerine o çocuk bağlanır. Recursive remove güncellenmiş alt ağaç kökünü döndürür; ana kök değişebilirse çağıran da root dönüş değerini tutmalıdır. Gerekli çocuk pointer’ını almadan düğümü free edip sonra okumak geçerli değildir."
          },
          {
            "title": "İki çocukta successor veya predecessor",
            "text": "Slayttaki yöntem, sağ alt ağacın minimumunu yani inorder successor’ı kullanır. Anahtarı hedef düğüme kopyala, ardından successor’ın eski düğümünü sağ alt ağaçtan gerçekten kaldır. Successor’ın sol çocuğu yoktur; sağ çocuğu olabilir ve o bağlantı korunmalıdır. Simetrik predecessor yöntemi de uygun uygulanırsa geçerlidir.",
            "example": "40 yerine 50 taşınıyorsa eski 50’nin sağındaki 55 kaybedilmez; eski 50’nin ebeveynine bağlanır."
          },
          {
            "title": "Depth, toplam maliyet ve ortalama",
            "text": "Bir düğüm ziyaretini bir karşılaştırma sayarsak depth=d olan anahtarın başarılı araması d+1 ziyaret ister. Derinlikler toplamı f ve n eşit olasılıklı anahtar için toplam f+n, ortalama f/n+1’dir. Zincirde en kötü tek arama Θ(n); uygun rastgele ekleme varsayımlarında ortalama logaritmik davranış görülebilir. Ortalama iddiasını bütün ekleme sıraları için garanti diye okuma.",
            "example": "Kök ve iki yaprak: depth toplamı 2; toplam başarılı ziyaret 2+3=5, ortalama 5/3. Kök araması bir ziyaret gerektirir."
          }
        ],
        "cards": [
          [
            "Successor anahtarını kopyalamak silmeyi bitirir mi?",
            "Hayır. Successor’ın eski düğümü de kaldırılmalı ve bağlantıları onarılmalıdır."
          ],
          [
            "Eşit olasılıklı başarılı BST aramasında ortalama ziyaret?",
            "Derinlikler toplamı f ise f/n+1; kök ziyareti her aramada sayılır."
          ]
        ],
        "checks": [
          {
            "prompt": "Successor’ın sağ çocuğu var. Eski successor kaldırılınca ne yapılır?",
            "options": [
              "Çocuk da silinir",
              "Çocuk uygun ebeveyn bağlantısına taşınır",
              "İki kopya successor bırakılır"
            ],
            "answer": 1,
            "explanation": "Successor sol alt ağaca sahip değildir; tek sağ çocuğu düğümün yerine bağlanabilir."
          },
          {
            "prompt": "4 anahtarlı BST’de derinlikler toplamı 5. Her anahtar bir kez aranırsa toplam ziyaret?",
            "options": [
              "5",
              "9",
              "20"
            ],
            "answer": 1,
            "explanation": "Her anahtarın maliyeti depth+1; toplam 5+4=9’dur."
          }
        ]
      }
    ],
    "sheet": {
      "name": "Dallanmış Arşivin Yol Haritası",
      "rarity": "epic",
      "entries": [
        {
          "title": "Yükseklik ve derinlik",
          "text": "Depth kökten düğüme, height düğümden en uzak yaprağa kenar sayısıdır. Kök depth=0, yaprak height=0, burada boş alt ağaç height=−1."
        },
        {
          "title": "Traversal",
          "text": "Preorder=NLR; inorder=LNR; postorder=LRN. İfade ağacında prefix=preorder, postfix=postorder. Postfix ikili operatörde ilk pop sağ, ikinci pop sol operanddır."
        },
        {
          "title": "BST sınırları",
          "text": "Tekrarsız anahtar: sol alt ağacın TAMAMI küçük, sağın TAMAMI büyük. Min için sola, max için sağa git. Inorder artan çıkar; binary tree tek başına bunu sağlamaz."
        },
        {
          "title": "Silme bağlantıları",
          "text": "Yaprak→NULL; tek çocuk→çocuğu bağla. İki çocuk→sağın minimum successor anahtarını taşı, eski düğümünü sil. Successor sağ çocuğa sahip olabilir. Recursive dönüşü ilgili pointer’a yaz."
        },
        {
          "title": "Arama maliyeti",
          "text": "Bir düğüm ziyareti bir birim: başarılı arama depth+1. f derinlik toplamı, n eşit olasılıklı anahtar: toplam=f+n, ortalama=f/n+1. Zincirde h=n−1, en kötü arama Θ(n)."
        }
      ]
    }
  },
  {
    "week": 6,
    "questions": [
      {
        "difficulty": 1,
        "type": "mc",
        "prompt": "Bir BST’nin AVL olması için gerekli denge koşulu hangisidir?",
        "options": [
          "Yalnız kökün çocuk sayıları eşittir",
          "Her düğümde sol ve sağ alt ağaç yüksekliklerinin farkının mutlak değeri en fazla 1’dir",
          "Bütün yaprak anahtarları eşittir",
          "Her düğümün iki çocuğu vardır"
        ],
        "answer": 1,
        "explanation": "AVL koşulu her düğümün alt ağaç yüksekliklerini sınırlar. Yalnız kökü kontrol etmek yetmez; çocuk sayısını eşitlemek veya bütün seviyeleri doldurmak AVL’nin tanımı değildir.",
        "hint": "Koşul anahtar değerine değil yüksekliğe uygulanır.",
        "pages": [
          5,
          6
        ]
      },
      {
        "difficulty": 1,
        "type": "tf",
        "prompt": "Başarılı bir splay erişiminde erişilen düğüm rotasyonlarla köke taşınır.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Splaying’in amacı erişilen düğümü sonraki olası erişimler için yukarı taşımaktır. İşlem sonunda erişilen düğüm köke gelir; yöntem BST sıralama özelliğini koruyan rotasyonlar kullanır.",
        "hint": "Erişilen düğümün hedef konumu neresi?",
        "pages": [
          34,
          35,
          36,
          37,
          43
        ]
      },
      {
        "difficulty": 1,
        "type": "short",
        "prompt": "Minimum degree t=3 olan bir B-tree düğümü en fazla kaç anahtar taşıyabilir?",
        "options": [],
        "answer": [
          "5"
        ],
        "explanation": "Slayttaki minimum derece t tanımında üst anahtar sınırı 2t−1’dir. t=3 için 5 anahtar, iç düğümse en fazla 6 çocuk bulunur; t burada order veya maksimum çocuk sayısı değildir.",
        "hint": "Anahtar sınırını çocuk sınırından ayır.",
        "pages": [
          49,
          50
        ],
        "numeric": {
          "value": 5,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 1,
        "type": "multi",
        "prompt": "Slayttaki minimum degree t tanımıyla B-tree’nin doğru özelliklerini seç.",
        "options": [
          "Bir iç düğüm k anahtar taşıyorsa k+1 çocuğu vardır",
          "Bütün yaprakların derinliği aynıdır",
          "Kök dışındaki düğümler en az t−1 anahtar taşır",
          "Yapraklar zorunlu olarak t çocuk taşır"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "İç düğümlerin anahtarları çocuk aralıklarını ayırır; yaprakların ise çocukları yoktur. Doluluk alt sınırında kök istisnası bulunur; boş olmayan kök bir anahtarla başlayabilir.",
        "hint": "İç düğüm ile yaprağa aynı çocuk koşulunu uygulama.",
        "pages": [
          47,
          48,
          49,
          50
        ]
      },
      {
        "difficulty": 1,
        "type": "match",
        "prompt": "Etiketleri kökten eklenen düğüme doğru yol olarak okuyarak AVL durumlarını düzeltmeleriyle eşleştir.",
        "options": [
          "LL: sol çocuğun solu",
          "RR: sağ çocuğun sağı",
          "LR: sol çocuğun sağı",
          "RL: sağ çocuğun solu"
        ],
        "answer": [
          "Dengesiz düğümde sağa tek rotasyon",
          "Dengesiz düğümde sola tek rotasyon",
          "Önce sol çocukta sola, sonra düğümde sağa rotasyon",
          "Önce sağ çocukta sağa, sonra düğümde sola rotasyon"
        ],
        "explanation": "Dış LL/RR durumları tek, iç LR/RL durumları çift rotasyon ister. Burada adlandırma kökten aşağı yol sırasıdır; slayttaki bazı R/L ve L/R başlıkları ters sıra kullanır, bu yüzden açık yönleri esas alırız.",
        "hint": "LL sağa düzeltilir; harfler rotasyonun yönü değildir.",
        "pages": [
          9,
          10,
          11,
          12,
          13,
          17
        ]
      },
      {
        "difficulty": 1,
        "type": "order",
        "prompt": "X düğümü kök R’nin doğrudan sol çocuğu. X’e erişim için son splay (zig) adımını sırala.",
        "options": [
          "X’in kökün doğrudan çocuğu olduğunu belirle",
          "R üzerinde sağa tek rotasyon uygula",
          "Yeni kökü X olarak bağla",
          "X kökte olduğu için splay işlemini bitir"
        ],
        "answer": [
          "X’in kökün doğrudan çocuğu olduğunu belirle",
          "R üzerinde sağa tek rotasyon uygula",
          "Yeni kökü X olarak bağla",
          "X kökte olduğu için splay işlemini bitir"
        ],
        "explanation": "Kökün doğrudan çocuğu için grandparent içeren zig-zig/zig-zag çiftine ihtiyaç yoktur. X soldaysa sağa rotasyon onu kök yapar; BST anahtar sırası korunur.",
        "hint": "Parent zaten kökse son adım tek rotasyondur.",
        "pages": [
          35
        ]
      },
      {
        "difficulty": 2,
        "type": "mc",
        "prompt": "Boş AVL’ye 30,10,20 sırasıyla ekleniyor. Kökten aşağı yol adlandırmasıyla ilk denge düzeltmesi ve yeni kök hangisidir?",
        "options": [
          "LL; kök 10",
          "RR; kök 30",
          "LR: 10’da sola, 30’da sağa; kök 20",
          "RL: 30’da sola; kök 10"
        ],
        "answer": 2,
        "explanation": "20, 30’un sol çocuğu 10’un sağına girer: standart LR durumu. Önce 10’da sola rotasyon 20’yi yukarı alır; sonra 30’da sağa rotasyonla kök 20, çocukları 10 ve 30 olur.",
        "hint": "Önce kökten yeni anahtara giden iki yönü yaz.",
        "pages": [
          9,
          12,
          13,
          16,
          17,
          18
        ]
      },
      {
        "difficulty": 2,
        "type": "tf",
        "prompt": "AVL’de her iki alt ağacın yüksekliği her düğümde tam olarak eşit olmak zorundadır.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "AVL farkın mutlak değerini en fazla 1 tutar; bir alt ağaç diğerinden bir seviye uzun olabilir. Eşitlik istemek daha güçlü bir şarttır ve slaytta neden böyle seçilmediği ayrıca tartışılır.",
        "hint": "En fazla 1 fark, mutlaka 0 fark demek değildir.",
        "pages": [
          5,
          6
        ]
      },
      {
        "difficulty": 2,
        "type": "short",
        "prompt": "Yaprak yüksekliği 0, boş alt ağaç yüksekliği −1. AVL minimum düğüm sayısı S(0)=1,S(1)=2 ve S(h)=1+S(h−1)+S(h−2). Yüksekliği 3 olan AVL en az kaç düğüm içerir?",
        "options": [],
        "answer": [
          "7"
        ],
        "explanation": "Önce S(2)=1+2+1=4; ardından S(3)=1+4+2=7 bulunur. Dengeli olmak bütün seviyelerin dolu olmasını gerektirmediğinden 15 düğüm zorunlu değildir.",
        "hint": "İki önceki minimumu sırayla hesapla.",
        "pages": [
          31
        ],
        "numeric": {
          "value": 7,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 2,
        "type": "multi",
        "prompt": "Geçerli BST rotasyonları için doğru ifadeleri seç.",
        "options": [
          "Inorder anahtar sırası korunur",
          "Döndürülen alt ağacın kökü değişebilir",
          "Taşınan ara alt ağacın doğru bağlantıya geçirilmesi gerekir",
          "Her rotasyon ağacın toplam düğüm sayısını bir azaltır"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Rotasyon düğüm ekleyip silmez; bağlantıları yerel olarak yeniden düzenler. Ara alt ağacın anahtar aralığı korunacak biçimde taşınması ve çağıranın yeni alt kökü bağlaması BST özelliği için gereklidir.",
        "hint": "Yapı değişir, anahtar kümesi ve inorder sırası değişmez.",
        "pages": [
          8,
          10,
          11,
          13
        ]
      },
      {
        "difficulty": 2,
        "type": "match",
        "prompt": "Splay için X’in parent P ve grandparent G’ye göre konumunu vaka adıyla eşleştir.",
        "options": [
          "P kök; X onun çocuğu",
          "P, G’nin solu; X, P’nin solu",
          "P, G’nin sağı; X, P’nin sağı",
          "P, G’nin solu; X, P’nin sağı"
        ],
        "answer": [
          "Zig: son tek rotasyon",
          "Zig-zig: sol-sol aynı yön",
          "Zig-zig: sağ-sağ aynı yön",
          "Zig-zag: yönler farklı"
        ],
        "explanation": "Aynı yönlü iki kenar zig-zig, farklı yönlü kenarlar zig-zag verir. Parent zaten kökse grandparent yoktur ve son işlem zig olur; bütün durumlar tek isim altında aynı sırayla döndürülemez.",
        "hint": "Önce iki kenarın yönlerinin aynı olup olmadığını kontrol et.",
        "pages": [
          35,
          36,
          37
        ]
      },
      {
        "difficulty": 2,
        "type": "order",
        "prompt": "t=2 B-tree’nin tek kök yaprağı [5,10,15] dolu. Top-down yöntemle 12 eklemenin mantıksal adımlarını sırala.",
        "options": [
          "Yeni boş iç kökü oluştur; eski kökü onun çocuğu yap",
          "Dolu eski kökü ortanca 10’dan böl",
          "10’u yeni köke çıkar; yaprakları [5] ve [15] yap",
          "12 için sağ yaprağı seç",
          "12’yi sağ yaprağa sıralı ekleyip [12,15] elde et"
        ],
        "answer": [
          "Yeni boş iç kökü oluştur; eski kökü onun çocuğu yap",
          "Dolu eski kökü ortanca 10’dan böl",
          "10’u yeni köke çıkar; yaprakları [5] ve [15] yap",
          "12 için sağ yaprağı seç",
          "12’yi sağ yaprağa sıralı ekleyip [12,15] elde et"
        ],
        "explanation": "t=2 için dolu düğüm 3 anahtarlıdır. Kök bölünürken median 10 yukarı çıkar; 12 sağ aralığa girer. Root split ağacın yüksekliğini bir artırır, yapraklar aynı derinlikte kalır.",
        "hint": "Dolu köke doğrudan dördüncü anahtarı kalıcı olarak yerleştirme.",
        "pages": [
          50,
          55,
          56,
          61
        ]
      },
      {
        "difficulty": 3,
        "type": "mc",
        "prompt": "Splay ağacında G=30 kök, onun sol çocuğu P=20, P’nin sol çocuğu X=10; başka düğüm yok. X’e zig-zig uygulanınca sonuç hangisidir?",
        "options": [
          "Kök 10; sağı 20; 20’nin sağı 30",
          "Kök 20; solu 10; sağı 30",
          "Kök 30; solu 10; 10’un sağı 20",
          "Kök 10; sağı 30; 30’un solu 20"
        ],
        "answer": 0,
        "explanation": "Sol-sol zig-zig’de önce G=30 üzerinde sağa, sonra P=20 üzerinde sağa rotasyon yapılır. Sonuç 10’un kök olduğu sağ zincirdir. Yalnız 10 ile 20’yi önce döndürmek standart zig-zig sırasını vermez.",
        "hint": "Aynı yönlü vakada önce parent–grandparent, sonra X–parent döner.",
        "pages": [
          35,
          37
        ]
      },
      {
        "difficulty": 3,
        "type": "tf",
        "prompt": "Splay için amortized O(log n) işlem maliyeti, tek bir erişimin O(n) sürmesiyle çelişmez.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Amortized sınır işlem dizisinin toplamını dağıtarak hesaplanır; her tekil işlem için aynı üst sınırı vaat etmez. Splay ağacı zincir biçiminde olabilir ve derin düğüme tek erişim doğrusal maliyetli olabilir.",
        "hint": "Tek işlem garantisi ile uzun işlem dizisinin ortalama maliyetini ayır.",
        "pages": [
          33,
          34
        ]
      },
      {
        "difficulty": 3,
        "type": "short",
        "prompt": "Minimum degree t=4 B-tree’de kök olmayan bir iç düğümün en az kaç çocuğu vardır?",
        "options": [],
        "answer": [
          "4"
        ],
        "explanation": "Kök dışındaki iç düğüm en az t−1=3 anahtar taşır ve k anahtar için k+1 çocuk gerekir. Bu nedenle minimum çocuk sayısı 4’tür; yaprakların çocuk sayısı 0’dır.",
        "hint": "Soruda yaprak değil iç düğüm deniyor.",
        "pages": [
          48,
          49
        ],
        "numeric": {
          "value": 4,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 3,
        "type": "multi",
        "prompt": "B-tree’den top-down silmede, gidilecek kök dışı çocuk yalnız t−1 anahtar taşıyor. Doğru olabilecek onarımları seç.",
        "options": [
          "Yeterli anahtarlı komşudan ebeveyn üzerinden ödünç alma",
          "Uygun minimum dolu kardeş ve aradaki ebeveyn anahtarıyla birleşme",
          "Alt sınıra düşmeden güvenle silmek için aşağı inmeden çocuğu güçlendirme",
          "Kardeşin herhangi bir anahtarını ebeveyne uğramadan rastgele kopyalama"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Amaç, aşağı inilen düğümün en az t anahtar taşımasını sağlamaktır. Borrow/merge, ebeveynin ayırıcı anahtarını ve gerekiyorsa çocuk pointer’larını düzenleyerek aralık sırasını korur; rastgele doğrudan kopyalama bunu sağlamaz.",
        "hint": "Anahtar transferinde ebeveyn ayırıcı anahtarı köprü görevi görür.",
        "pages": [
          67,
          70,
          71
        ]
      },
      {
        "difficulty": 3,
        "type": "match",
        "prompt": "B-tree silmesinde aranan k, iç düğüm x’in anahtarıdır. Koşulları uygulanacak yöntemle eşleştir.",
        "options": [
          "k’den önceki çocuk en az t anahtarlı",
          "Önceki çocuk minimumda; sonraki çocuk en az t anahtarlı",
          "İki komşu çocuk da t−1 anahtarlı"
        ],
        "answer": [
          "Predecessor’ı bul, yerine taşı ve eski yerinden sil",
          "Successor’ı bul, yerine taşı ve eski yerinden sil",
          "İki çocuğu k ile birleştir; birleşenden k’yi sil"
        ],
        "explanation": "İç düğümden silme, uygun komşu alt ağacın predecessor/successor’ını taşıyabilir. İkisi de minimumda ise ayırıcı k dahil birleşim 2t−1 anahtara ulaşır ve silme bu düğümde sürer.",
        "hint": "Hangi komşu bir anahtar kaybetmeyi karşılayabilir?",
        "pages": [
          68,
          69
        ]
      },
      {
        "difficulty": 3,
        "type": "order",
        "prompt": "AVL’de kökten aşağı LR dengesizliği: A’nın sol çocuğu B, B’nin sağ çocuğu C. Çift rotasyonun bağlantı mantığını sırala.",
        "options": [
          "B üzerinde sola rotasyonla C’yi sol alt ağacın kökü yap",
          "A’nın sol bağlantısını yeni alt kök C’ye bağla",
          "A üzerinde sağa rotasyonla C’yi tüm bu parçanın kökü yap",
          "Yükseklikleri aşağıdaki düğümlerden yukarı doğru güncelle",
          "Çağıranın ilgili bağlantısını yeni kök C’ye bağla"
        ],
        "answer": [
          "B üzerinde sola rotasyonla C’yi sol alt ağacın kökü yap",
          "A’nın sol bağlantısını yeni alt kök C’ye bağla",
          "A üzerinde sağa rotasyonla C’yi tüm bu parçanın kökü yap",
          "Yükseklikleri aşağıdaki düğümlerden yukarı doğru güncelle",
          "Çağıranın ilgili bağlantısını yeni kök C’ye bağla"
        ],
        "explanation": "İç LR şekli önce dış LL biçimine dönüştürülür, ardından ikinci rotasyon yapılır. Ara alt ağaçlar uygun aralıklara taşınır; yükseklikler yeni çocuk bağlantıları üzerinden hesaplanır.",
        "hint": "İlk dönüş çocukta, ikinci dönüş dengesiz atada yapılır.",
        "pages": [
          7,
          9,
          12,
          13
        ]
      },
      {
        "difficulty": 4,
        "type": "mc",
        "prompt": "t=2 B-tree: kök [20], sol yaprak [10], sağ yaprak [30,40]. Top-down silmede 10 kaldırılıyor; sağ kardeşten ebeveyn üzerinden ödünç alınıyor. Son yapı hangisidir?",
        "options": [
          "Kök [30], sol [20], sağ [40]",
          "Kök [20], sol boş, sağ [30,40]",
          "Kök [40], sol [10], sağ [20,30]",
          "Tek kök yaprak [20,30,40,10]"
        ],
        "answer": 0,
        "explanation": "Sol yaprak minimum 1 anahtarlıdır; sağ kardeşin 2 anahtarı olduğundan ödünç verebilir. Ebeveyn 20 sola iner, sağın minimumu 30 köke çıkar; ardından 10 silinince sol [20], sağ [40] kalır.",
        "hint": "Ödünç alınan anahtar doğrudan sağdan sola geçmez; ebeveynden geçer.",
        "pages": [
          49,
          70,
          71
        ]
      },
      {
        "difficulty": 4,
        "type": "tf",
        "prompt": "Top-down B-tree eklemesinde dolu kökün bölünmesi, yeni kök oluşturarak ağacın yüksekliğini bir artırabilir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 0,
        "explanation": "Eski kök yeni kökün çocuğu yapılır, median yeni köke taşınır ve eski kök iki parçaya ayrılır. Bütün eski yapraklara eşit bir yeni üst seviye eklendiği için yaprak derinlikleri yine eşittir.",
        "hint": "Yeni seviye ağacın tepesine eklenir.",
        "pages": [
          48,
          55,
          61
        ]
      },
      {
        "difficulty": 4,
        "type": "short",
        "prompt": "Minimum degree t=3, kenar cinsinden yüksekliği 2 olan boş olmayan bir B-tree en az kaç anahtar taşır? Kök istisnasını kullan.",
        "options": [],
        "answer": [
          "17"
        ],
        "explanation": "Minimum kökte 1 anahtar ve 2 çocuk vardır. Derinlik 1’de 2 düğümün her biri 2 anahtar; derinlik 2’de 2×3=6 yaprağın her biri 2 anahtar taşır: 1+4+12=17. Burada n düğüm değil toplam anahtar sayısıdır.",
        "hint": "Kökte en az 1 anahtar; diğer düğümlerde en az t−1.",
        "pages": [
          48,
          49,
          50
        ],
        "numeric": {
          "value": 17,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 4,
        "type": "multi",
        "prompt": "Yükseklik kenar sayısı; S(0)=1,S(1)=2 ile AVL minimum düğüm sayısı için doğru çıkarımları seç.",
        "options": [
          "S(2)=4",
          "S(4)=12",
          "S(5)=20",
          "Yükseklik h olan her AVL tam olarak 2^(h+1)−1 düğümlüdür"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "S(h)=1+S(h−1)+S(h−2) sırasıyla 1,2,4,7,12,20 üretir. Bu minimumlar, tam dolu binary tree’nin maksimumundan farklıdır; AVL her seviyenin dolu olmasını istemez.",
        "hint": "Minimum AVL sayısı iki önceki yüksekliği birleştirir.",
        "pages": [
          5,
          6,
          31
        ]
      },
      {
        "difficulty": 4,
        "type": "match",
        "prompt": "Standart kökten aşağı yol adlandırmasıyla, boş AVL’ye üç anahtarın eklenmesinde gereken ilk düzeltmeyi eşleştir.",
        "options": [
          "50,30,10 eklenmesi",
          "10,30,50 eklenmesi",
          "50,10,30 eklenmesi",
          "10,50,30 eklenmesi"
        ],
        "answer": [
          "50’de sağa tek rotasyon",
          "10’da sola tek rotasyon",
          "10’da sola; ardından 50’de sağa rotasyon",
          "50’de sağa; ardından 10’da sola rotasyon"
        ],
        "explanation": "Her dizide üçüncü anahtar ilk kökün denge koşulunu bozar. Dış yollar tek, iç yollar çift rotasyon ister; her dört sonucun kökü de ortanca 30’dur fakat gerekli işlem sırası aynı değildir.",
        "hint": "Sonucun ortanca olması işlem sırasını belirlemeye tek başına yetmez.",
        "pages": [
          9,
          10,
          11,
          12,
          13,
          16,
          17
        ]
      },
      {
        "difficulty": 4,
        "type": "order",
        "prompt": "Splay: kök 40’ın sol çocuğu 20; 20’nin sağ çocuğu 30. 30’a erişimde standart zig-zag adımlarını sırala.",
        "options": [
          "30’un, 20’nin sağı ve 20’nin 40’ın solu olduğunu belirle",
          "20 üzerinde sola rotasyon yap",
          "40 üzerinde sağa rotasyon yap",
          "30’u yeni kök olarak bağla ve bitir"
        ],
        "answer": [
          "30’un, 20’nin sağı ve 20’nin 40’ın solu olduğunu belirle",
          "20 üzerinde sola rotasyon yap",
          "40 üzerinde sağa rotasyon yap",
          "30’u yeni kök olarak bağla ve bitir"
        ],
        "explanation": "Yönler farklıdır: left-right zig-zag. İlk rotasyon X=30’u parent 20’nin üstüne; ikincisi grandparent 40’ın üstüne çıkarır. Sonuç kök 30, sol 20, sağ 40’tır.",
        "hint": "İç şekli önce dış şekle dönüştür.",
        "pages": [
          35,
          36
        ]
      },
      {
        "difficulty": 5,
        "type": "mc",
        "prompt": "Boş AVL’ye 50,30,70,20,40,60,80,10,25 eklenmiş; ardından 5 ekleniyor. Her ekleme sonrası en alttaki ilk dengesiz atada onarım yapılıyor. 5’ten sonra hangi ata ilk bozulur ve bu alt ağacın yeni kökü ne olur?",
        "options": [
          "50 bozulur; yeni kök 30",
          "30 bozulur; sağa rotasyon sonrası yeni alt kök 20",
          "20 bozulur; sola rotasyon sonrası yeni alt kök 25",
          "70 bozulur; yeni alt kök 60"
        ],
        "answer": 1,
        "explanation": "5, 50→30→20→10 yolunun soluna eklenir. 10 ve 20 hâlâ en fazla 1 yükseklik farkındadır; 30’un sol yüksekliği 2, sağdaki 40’ın yüksekliği 0 olur. İlk bozuk ata 30’dur; LL yönünde sağa rotasyon onu 20’nin sağına alır, 25 de 30’un soluna taşınır.",
        "hint": "Yükseklikleri eklenen yapraktan yukarı hesapla; ilk bozuk düğüm kök olmak zorunda değil.",
        "pages": [
          5,
          8,
          9,
          10,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22
        ]
      },
      {
        "difficulty": 5,
        "type": "tf",
        "prompt": "Minimum degree t=3 olan B-tree’de kenar yüksekliği 2 ve toplam 16 anahtar aynı anda mümkün olabilir.",
        "options": [
          "Doğru",
          "Yanlış"
        ],
        "answer": 1,
        "explanation": "Kök en az 1, derinlik 1’deki en az 2 düğüm toplam 4, derinlik 2’deki en az 6 yaprak toplam 12 anahtar taşır; minimum 17’dir. 16 anahtar yüksekliği 2’yi sağlayamaz. n burada anahtar sayısıdır.",
        "hint": "En az dolulukta bile kaç anahtar gerektiğini seviye seviye topla.",
        "pages": [
          48,
          49,
          50
        ]
      },
      {
        "difficulty": 5,
        "type": "short",
        "prompt": "Minimum degree t=3, kenar yüksekliği 2 olan tamamen dolu B-tree toplam en fazla kaç anahtar taşır?",
        "options": [],
        "answer": [
          "215"
        ],
        "explanation": "Her düğüm 2t−1=5 anahtar, her iç düğüm 2t=6 çocuk taşır. Üç seviyede düğüm sayıları 1,6,36’dır; toplam anahtar 5×(1+6+36)=215. Maksimum çocukla maksimum anahtarı aynı sayı sanmak hatalıdır.",
        "hint": "Önce her seviyenin düğüm sayısını, sonra düğüm başına anahtarı say.",
        "pages": [
          48,
          50
        ],
        "numeric": {
          "value": 215,
          "tolerance": 0,
          "units": []
        },
        "answerFormat": {
          "kind": "number",
          "units": [],
          "tolerance": 0
        }
      },
      {
        "difficulty": 5,
        "type": "multi",
        "prompt": "Top-down B-tree ekleme/silme invariantları için doğru ifadeleri seç.",
        "options": [
          "Eklemede dolu çocuğu aşağı inmeden bölmek, median için üstte yer bulunmasını sağlar",
          "Silmede minimum dolu çocuğa inmeden borrow/merge yapılması alttaki silmeye anahtar bütçesi sağlar",
          "Dolu kökün bölünmesi yüksekliği artırabilir; kökün boşalıp tek çocuğunun kök olması azaltabilir",
          "B-tree dengesi için bütün düğümlerin aynı sayıda anahtar taşıması gerekir"
        ],
        "answer": [
          0,
          1,
          2
        ],
        "explanation": "Top-down yöntemler sonraki adım için gerekli boşluk veya doluluk payını önceden kurar. Kök, alt sınırın istisnasıdır ve yükseklik değişimleri orada gerçekleşir; denge bütün yaprakların aynı derinlikte olmasıyla ilgilidir, eşit anahtar sayısıyla değil.",
        "hint": "Insert boş yer; remove kaybedilebilecek anahtar payı hazırlar.",
        "pages": [
          48,
          49,
          55,
          56,
          61,
          67,
          70,
          71
        ]
      },
      {
        "difficulty": 5,
        "type": "match",
        "prompt": "Üç ağaç ailesine ilişkin teşhisleri temel gerekçeleriyle eşleştir.",
        "options": [
          "Splay’de bir erişim n düğüm dolaştı; uygulama hemen hatalı sayılmıyor",
          "AVL rotasyonundan sonra inorder anahtar sırası değişti",
          "B-tree’nin bir yaprağı diğerlerinden bir seviye aşağıda",
          "B-tree’de dolu kök yeni bir kökle ikiye bölündü"
        ],
        "answer": [
          "Amortized logaritmik sınır tekil doğrusal erişimi yasaklamaz",
          "Bağlantılar veya ara alt ağaç transferi BST invariantını bozmuş",
          "Bütün yaprakların eşit derinlik koşulu ihlal edilmiş",
          "Geçerli root split yüksekliği bir artırmış"
        ],
        "explanation": "Performans garantisi, anahtar sırası ve yaprak seviyesi farklı invariantlardır. Bir yöntemde pahalı tek erişim normal olabilirken, sıralama veya yaprak derinliği ihlali yapısal bir hatadır.",
        "hint": "Hangi olay maliyet, hangisi doğruluk koşulu?",
        "pages": [
          10,
          13,
          33,
          34,
          48,
          61
        ]
      },
      {
        "difficulty": 5,
        "type": "order",
        "prompt": "Minimum degree t=2 B-tree’ye 1,2,3,4,5,6,7 sırasıyla top-down ekleniyor. Verilen dönüm noktalarını kronolojik sırala.",
        "options": [
          "Tek yaprak kök [1] olur",
          "Tek yaprak kök [1,2,3] ile dolar",
          "4 eklenirken kök bölünür: kök [2], yapraklar [1] ve [3,4]",
          "5 eklendikten sonra sağ yaprak [3,4,5] ile dolar",
          "6 eklenirken sağ çocuk bölünür: kök [2,4], yapraklar [1], [3], [5,6]",
          "7 eklenince son sağ yaprak [5,6,7] olur"
        ],
        "answer": [
          "Tek yaprak kök [1] olur",
          "Tek yaprak kök [1,2,3] ile dolar",
          "4 eklenirken kök bölünür: kök [2], yapraklar [1] ve [3,4]",
          "5 eklendikten sonra sağ yaprak [3,4,5] ile dolar",
          "6 eklenirken sağ çocuk bölünür: kök [2,4], yapraklar [1], [3], [5,6]",
          "7 eklenince son sağ yaprak [5,6,7] olur"
        ],
        "explanation": "İlk split dolu köktedir ve yüksekliği artırır. İkinci split aşağı inilecek dolu sağ çocukta gerçekleşir; median 4 mevcut köke eklenir. 7 eklemesinden önce sağ çocuk henüz dolu olmadığından yeni split gerekmez.",
        "hint": "Split kontrolü yeni anahtar eklenmeden önce gidilecek dolu düğümde yapılır.",
        "pages": [
          50,
          55,
          56,
          61,
          66
        ]
      }
    ],
    "lessons": [
      {
        "title": "AVL dengesi ve rotasyon dilini kur",
        "summary": "Sıralama invariantına her düğümde yükseklik sınırı ekle.",
        "pages": [
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          16,
          17,
          18
        ],
        "sections": [
          {
            "title": "Neden normal BST yetmez?",
            "text": "BST anahtar sırasını korur fakat zincirleşebilir. AVL, her düğümde |h(left)−h(right)|≤1 koşuluyla yüksekliği logaritmik düzeyde tutar. Koşul yalnız kökte değil her alt ağaçta geçerlidir. Yaprak yüksekliği 0, boş alt ağaç yüksekliği −1; balance factor burada h(left)−h(right) olarak seçilir. Aynı işareti bütün hesap boyunca koru."
          },
          {
            "title": "LL/RR dış, LR/RL iç durum",
            "text": "Burada harfler dengesiz atadan eklenen anahtara doğru iki adımın yönüdür. LL sağa tek; RR sola tek; LR önce sol çocukta sola sonra atada sağa; RL önce sağ çocukta sağa sonra atada sola rotasyonla düzeltilir. Week6 s.9/13/17’de bazı çift rotasyon başlıkları yönleri ters sırayla adlandırır. Sorular açık bağlantı ve bu standart kökten aşağı convention’ını kullanır.",
            "example": "30→10→20 kökten aşağı LR’dir. Önce 10’da sola, ardından 30’da sağa; yeni kök 20 olur."
          },
          {
            "title": "Rotasyon veri kümesini değiştirmez",
            "text": "Rotasyon yerel bağlantıları değiştirirken inorder anahtar sırasını ve düğüm sayısını korur. Örneğin sağa rotasyonda sol çocuğun sağ alt ağacı eski kökün soluna geçer; bu ara alt ağaç kaybedilemez. Yeni alt kök çağıranın bağlantısına yazılır. Height bilgileri önce aşağıda kalan düğümler, sonra yeni üst düğüm için güncellenir."
          }
        ],
        "cards": [
          [
            "AVL balance factor burada nasıl tanımlı?",
            "h(sol)−h(sağ); geçerli düğümde −1,0 veya +1."
          ],
          [
            "Standart kökten aşağı LR nasıl düzeltilir?",
            "Sol çocukta sola, sonra dengesiz atada sağa rotasyon."
          ]
        ],
        "checks": [
          {
            "prompt": "30 kök, sol çocuk 10, 10’un sağında 20 eklendi. Gerekli dönüşler?",
            "options": [
              "30’da sola tek",
              "10’da sola; 30’da sağa",
              "10’da sağa; 30’da sola"
            ],
            "answer": 1,
            "explanation": "Kökten aşağı sol-sağ yoludur; ilk dönüş çocukta, ikinci atadadır."
          },
          {
            "prompt": "Rotasyon sonrası inorder sırası değişti. Bu beklenen mi?",
            "options": [
              "Evet, denge için sıralama bozulabilir",
              "Hayır, pointer aktarımında hata vardır",
              "Yalnız yapraksa değişebilir"
            ],
            "answer": 1,
            "explanation": "Geçerli BST rotasyonu inorder anahtar sırasını korur; denge için sıralamadan vazgeçilmez."
          }
        ]
      },
      {
        "title": "AVL eklemesini ve minimum düğüm sayısını izle",
        "summary": "İlk bozuk atayı yüksekliklerden bul; tam ağaç varsayma.",
        "pages": [
          5,
          7,
          8,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31
        ],
        "sections": [
          {
            "title": "BST eklemesiyle başla",
            "text": "Yeni anahtar önce normal BST aralığına uygun yere eklenir. Sonra eklenen yapraktan köke doğru yükseklikler güncellenir. Alt ağaçlardan birinin yüksekliği büyüse bile her ata bozulmaz; farkın mutlak değeri 2’ye çıkan en alttaki atayı belirlemek gerekir. Yalnız yeni anahtarı kökle karşılaştırarak rotasyon seçme."
          },
          {
            "title": "Bağlantı yolu hangi dönüşü gerektiriyor?",
            "text": "Dengesiz ata ile ondan sonraki çocuk ve torunun yönü dış mı iç mi sorusunu cevaplar. Dönüşten sonra bu parçanın yeni kökü eski atanın ebeveynine bağlanır. Bütün ağacın kökü her eklemede değişmez. Ara alt ağaçlar ve yüksekliği tekrar kontrol etmek, yalnız üç anahtarı ezberlemekten daha güvenlidir.",
            "example": "50→30→20→10→5 yolunda ilk bozuk ata 30 olabilir; 50 daha üstte olsa da önce 30 parçası onarılır."
          },
          {
            "title": "Minimum düğüm sayısı",
            "text": "Yüksekliği h olan en küçük AVL, yükseklikleri h−1 ve h−2 olan iki minimum alt ağaç ve bir kökten oluşur: S(h)=1+S(h−1)+S(h−2). S(0)=1,S(1)=2 ile 1,2,4,7,12,20 dizisi çıkar. Bu minimum, bütün seviyeleri dolu binary tree’nin 2^(h+1)−1 maksimumuyla aynı değildir."
          }
        ],
        "cards": [
          [
            "AVL eklemede ilk kontrol yönü?",
            "Eklenen yapraktan yukarı; yükseklikleri güncelleyip en alttaki bozuk atayı bul."
          ],
          [
            "Minimum AVL düğüm recurrence’ı?",
            "S(h)=1+S(h−1)+S(h−2), S(0)=1,S(1)=2."
          ]
        ],
        "checks": [
          {
            "prompt": "h(sol)=2,h(sağ)=0. Buradaki balance factor ve durum?",
            "options": [
              "+2; AVL koşulu bozuk",
              "−2; geçerli",
              "0; geçerli"
            ],
            "answer": 0,
            "explanation": "Seçilen BF=h(sol)−h(sağ)=2; mutlak fark 1’i aşmıştır."
          },
          {
            "prompt": "Yükseklik 4 için minimum AVL sayısı; S(2)=4,S(3)=7?",
            "options": [
              "11",
              "12",
              "31"
            ],
            "answer": 1,
            "explanation": "S(4)=1+7+4=12. 31 tüm seviyeleri dolu ağacın maksimumudur."
          }
        ]
      },
      {
        "title": "Splay: erişime göre kendini düzenleyen BST",
        "summary": "Tek pahalı işlem ile amortized garanti arasındaki farkı gör.",
        "pages": [
          32,
          33,
          34,
          35,
          36,
          37,
          38,
          39,
          40,
          41,
          42,
          43
        ],
        "sections": [
          {
            "title": "Erişilen düğüm yukarı çıkar",
            "text": "Splay ağacı başarılı erişilen düğümü köke taşır. Yakın zamanda tekrar kullanılacak verinin daha kısa yoldan bulunması hedeflenir; sabit AVL balance factor koşulu tutulmaz. BST anahtar sırası korunur ama ağacın şekli erişimler boyunca değişebilir. Splaying bir düğümü rastgele yeni anahtarla değiştirmek değildir."
          },
          {
            "title": "Zig, zig-zig ve zig-zag",
            "text": "X’in parent’ı kökse son adım zig, tek rotasyondur. X-parent ve parent-grandparent aynı yönse zig-zig: önce grandparent-parent, sonra parent-X yönünde iki dönüş yapılır. Yönler farklıysa zig-zag: önce X parent’ın, sonra grandparent’ın üstüne çıkar. Simetrik sağ/sol durumlarda dönüş yönleri tersine çevrilir.",
            "example": "30’un solunda 20, onun solunda 10: zig-zig sonunda 10 kök, sağı 20, 20’nin sağı 30 olur. Yalnız dengeli üçlü kurmak splay’in hedefi değildir."
          },
          {
            "title": "Amortized sınır tekil işlem garantisi değildir",
            "text": "Splay’de belirli bir erişim doğrusal yol izleyebilir. Amortized O(log n), uygun işlem dizisinin toplam maliyetini işlemlere dağıtır; her işlem mutlaka logaritmik sürer demek değildir. AVL’nin yükseklik üzerinden en kötü arama garantisiyle bu iddiayı aynı cümleymiş gibi okuma. Tek pahalı erişim splay’in otomatik olarak hatalı olduğunu kanıtlamaz."
          }
        ],
        "cards": [
          [
            "Splay’in başarılı erişim sonrası hedefi?",
            "Erişilen düğümü BST sırasını koruyan rotasyonlarla köke taşımak."
          ],
          [
            "Amortized O(log n), her erişim O(log n) midir?",
            "Hayır. Bazı tekil erişimler O(n) olabilir; sınır işlem dizisinin toplamına ilişkindir."
          ]
        ],
        "checks": [
          {
            "prompt": "X ve parent’ı iki sol kenarla grandparent’a bağlı. Hangi vaka?",
            "options": [
              "Zig-zag",
              "Zig-zig",
              "Yalnız zig"
            ],
            "answer": 1,
            "explanation": "İki yön aynı; grandparent bulunduğu için son tek zig değil zig-zig gerekir."
          },
          {
            "prompt": "Bir splay erişimi çok uzun sürdü. Hangi yorum doğru?",
            "options": [
              "Amortized garanti mutlaka bozuldu",
              "Tek işlem uzun olabilir; dizi maliyeti ayrıca değerlendirilir",
              "Ağaç artık BST olamaz"
            ],
            "answer": 1,
            "explanation": "Amortized analiz bütün işlem dizisine bakar; tek doğrusal erişime izin verebilir."
          }
        ]
      },
      {
        "title": "B-tree: sayfa, doluluk ve top-down onarım",
        "summary": "Minimum degree t ile anahtar/çocuk sınırlarını ve kök istisnasını ayır.",
        "pages": [
          45,
          46,
          47,
          48,
          49,
          50,
          52,
          53,
          54,
          55,
          56,
          61,
          62,
          65,
          66,
          67,
          68,
          69,
          70,
          71
        ],
        "sections": [
          {
            "title": "Çok yollu düğüm ve eşit yaprak derinliği",
            "text": "B-tree, bir düğümde birden fazla sıralı anahtar tutar. k anahtarlı iç düğüm k+1 çocuk aralığını ayırır; yaprakta çocuk yoktur. Bütün yapraklar aynı derinliktedir. Sayfalar halinde saklama ve yüksek fan-out, özellikle ikincil depolamada erişilen sayfa sayısını azaltmayı hedefler. Slayttaki donanım zamanları tarihsel örnektir; değişmez performans sabiti sayılmaz."
          },
          {
            "title": "Burada t minimum derecedir",
            "text": "Slayt minimum degree t≥2 kullanır: kök dışındaki düğümde t−1..2t−1 anahtar, iç düğümde t..2t çocuk olur. Boş olmayan kök en az 1 anahtarlı; iç kök en az 2 çocukludur. B-tree order terimini doğrudan t yerine koyma. Yükseklik kenarla ölçülür; h için minimum toplam anahtar 2t^h−1’dir. s.50’deki sınırdaki n burada düğüm değil anahtar sayısı olarak okunmalıdır.",
            "example": "t=3,h=2 minimum doluluk: kök 1; iki iç düğüm 4; altı yaprak 12 anahtar. Toplam 17."
          },
          {
            "title": "Aşağı inmeden bütçe hazırla",
            "text": "Top-down insert, dolu çocuğa inmeden median’ı ebeveyne çıkarıp çocuğu böler. Dolu kök yeni kökle bölünür; yükseklik artabilir. Delete ise minimum dolu çocuğa inmeden borrow veya merge ile en az t anahtar sağlar. İç anahtar silmede yeterli komşudan predecessor/successor taşınabilir; iki taraf minimumsa ayırıcı anahtarla birleşir. Ebeveyn ayırıcısı ve çocuk pointer’ları korunmalıdır.",
            "example": "t=2 kök [20], çocuklar [10] ve [30,40]: 10 silmeden önce 20 sola iner, 30 köke çıkar; sonra soldan 10 kaldırılır."
          }
        ],
        "cards": [
          [
            "t minimum dereceyse en fazla anahtar/çocuk?",
            "Düğümde 2t−1 anahtar; iç düğümde 2t çocuk."
          ],
          [
            "Insert ve delete aşağı inmeden ne hazırlar?",
            "Insert boş yer açar; delete anahtar kaybetmeye yetecek doluluk payı sağlar."
          ]
        ],
        "checks": [
          {
            "prompt": "t=3 kök dışı iç düğüm 2 anahtarlı. Çocuk sayısı?",
            "options": [
              "2",
              "3",
              "6"
            ],
            "answer": 1,
            "explanation": "İç düğüm k anahtarla k+1 çocuk taşır; 2+1=3."
          },
          {
            "prompt": "Dolu t=2 düğüm [4,8,12] bölünürse yukarı hangi anahtar çıkar?",
            "options": [
              "4",
              "8",
              "12"
            ],
            "answer": 1,
            "explanation": "Median 8 ebeveyne taşınır; iki parça birer anahtar [4] ve [12] tutar."
          }
        ]
      }
    ],
    "sheet": {
      "name": "Denge Ustasının Düğüm Mührü",
      "rarity": "epic",
      "entries": [
        {
          "title": "AVL koşulu",
          "text": "Her düğümde |h(sol)−h(sağ)|≤1. Burada BF=h(sol)−h(sağ), boş yükseklik −1, yaprak 0. Koşul yalnız kökte denetlenmez."
        },
        {
          "title": "Rotasyon yönleri",
          "text": "Kökten aşağı adlandırma: LL→sağa; RR→sola; LR→sol çocukta sola, atada sağa; RL→sağ çocukta sağa, atada sola. Bazı slayt çift-vaka etiketleri ters sırada; açık bağlantı yönlerini esas al."
        },
        {
          "title": "Minimum AVL",
          "text": "S(h)=1+S(h−1)+S(h−2), S(0)=1,S(1)=2: 1,2,4,7,12,20. Tam dolu ağacın 2^(h+1)−1 maksimumuyla karıştırma."
        },
        {
          "title": "Splay",
          "text": "Erişilen düğüm köke çıkar. Zig parent kökse tek; zig-zig aynı yönlerde önce G–P sonra P–X; zig-zag farklı yönlerde önce X–P sonra X–G. Amortized O(log n), tek erişimin O(n) olmasını yasaklamaz."
        },
        {
          "title": "B-tree minimum degree t",
          "text": "Kök dışı anahtar t−1..2t−1, iç çocuk t..2t; boş olmayan kök min1 anahtar. k anahtarlı iç düğüm k+1 çocuk; tüm yapraklar aynı derinlikte. t order değildir."
        },
        {
          "title": "B-tree bütçe ve yükseklik",
          "text": "Insert’te dolu çocuğu median’dan böl; delete’te minimum dolu çocuğu borrow/merge ile güçlendir. Root split yükseklik artırır. Kenar yüksekliği h için min anahtar 2t^h−1, tam dolu max anahtar (2t)^(h+1)−1; sayılan n anahtardır."
        }
      ]
    }
  }
];
