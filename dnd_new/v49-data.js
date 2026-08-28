/* v49: 2014 deity encyclopedia data. Factual table fields follow Appendix B;
   Turkish play guidance is an original, table-facing summary. */
(()=>{
  'use strict';

  const rows=`
fr-auril|Auril|Unutulmuş Diyarlar|NE|Doğa,Fırtına|kış, dondurucu soğuk ve acımasız doğa|Altı köşeli kar tanesi
fr-azuth|Azuth|Unutulmuş Diyarlar|LN|Bilgi|büyücüler, büyü disiplini ve büyü sanatının düzenli kullanımı|Ateşle çevrelenmiş, yukarıyı gösteren sol el
fr-bane|Bane|Unutulmuş Diyarlar|LE|Savaş|zorbalık, korkuyla kurulan düzen ve mutlak iktidar|Parmakları bitişik, dik duran siyah sağ el
fr-beshaba|Beshaba|Unutulmuş Diyarlar|CE|Hile|talihsizlik, uğursuzluk ve felaket|Siyah boynuzlar
fr-bhaal|Bhaal|Unutulmuş Diyarlar|NE|Ölüm|cinayet, suikast ve kan dökme|Kan damlaları halkası içindeki kafatası
fr-chauntea|Chauntea|Unutulmuş Diyarlar|NG|Yaşam|tarım, bereket, ekin ve toprağı besleme|Buğday demeti veya ekin üstünde açmış gül
fr-cyric|Cyric|Unutulmuş Diyarlar|CE|Hile|yalan, entrika, ihanet ve delilik|Siyah ya da mor güneş üstünde çenesiz beyaz kafatası
fr-deneir|Deneir|Unutulmuş Diyarlar|NG|Bilgi|yazı, haritalar, kayıt tutma ve okuryazarlık|Açık gözün üstünde yanan mum
fr-eldath|Eldath|Unutulmuş Diyarlar|NG|Yaşam,Doğa|barış, sükûnet, pınarlar ve şiddetsiz çözüm|Durgun havuza dökülen şelale
fr-gond|Gond|Unutulmuş Diyarlar|N|Bilgi|zanaat, icat, mühendislik ve üretim|Dört kollu dişli çark
fr-helm|Helm|Unutulmuş Diyarlar|LN|Yaşam,Işık|koruma, nöbet, tetikte olma ve görev|Dik sol eldivenin üstünde açık göz
fr-ilmater|Ilmater|Unutulmuş Diyarlar|LG|Yaşam|dayanıklılık, acıya katlanma ve başkası için fedakârlık|Kırmızı iple bileklerinden bağlanmış eller
fr-kelemvor|Kelemvor|Unutulmuş Diyarlar|LN|Ölüm|ölüler, ölümün doğal düzeni ve adil yargı|Dengeli terazi tutan dik iskelet kol
fr-lathander|Lathander|Unutulmuş Diyarlar|NG|Yaşam,Işık|doğum, şafak, yenilenme ve yeni başlangıçlar|Gündoğumuna uzanan yol
fr-leira|Leira|Unutulmuş Diyarlar|CN|Hile|illüzyon, sis, aldatıcı görüntü ve gizem|İçinde sis girdabı bulunan aşağı dönük üçgen
fr-lliira|Lliira|Unutulmuş Diyarlar|CG|Yaşam|sevinç, dans, kutlama ve özgür ruh|Üç adet altı köşeli yıldızdan üçgen
fr-loviatar|Loviatar|Unutulmuş Diyarlar|LE|Ölüm|acı, işkence, zalim disiplin ve korku|Dokuz kuyruklu dikenli kırbaç
fr-malar|Malar|Unutulmuş Diyarlar|CE|Doğa|av, vahşi yırtıcılık ve kanlı takip|Pençeli pati
fr-mask|Mask|Unutulmuş Diyarlar|CN|Hile|hırsızlar, gölgeler, gizli işler ve kurnazlık|Siyah maske
fr-mielikki|Mielikki|Unutulmuş Diyarlar|NG|Doğa|ormanlar, orman yaratıkları ve yol gösteren vahşi doğa|Tekboynuz başı
fr-milil|Milil|Unutulmuş Diyarlar|NG|Işık|şiir, şarkı, hitabet ve ilham|Yapraklardan yapılmış beş telli arp
fr-myrkul|Myrkul|Unutulmuş Diyarlar|NE|Ölüm|ölüm korkusu, çürüme ve kaçınılmaz son|Beyaz insan kafatası
fr-mystra|Mystra|Unutulmuş Diyarlar|NG|Bilgi|büyü, büyü ağı ve sihrin korunması|Yedi yıldızlı çember; bazen kırmızı sis çevresinde dokuz yıldız
fr-oghma|Oghma|Unutulmuş Diyarlar|N|Bilgi|bilgi, fikirler, keşif ve bilginin paylaşılması|Boş tomar
fr-savras|Savras|Unutulmuş Diyarlar|LN|Bilgi|kehanet, yazgı, öngörü ve gerçeği görme|İçinde çok sayıda göz bulunan kristal küre
fr-selune|Selûne|Unutulmuş Diyarlar|CG|Bilgi,Yaşam|ay, yıldızlar, denizciler ve gece yolculuğu|Yedi yıldızla çevrili iki göz
fr-shar|Shar|Unutulmuş Diyarlar|NE|Ölüm,Hile|karanlık, kayıp, unutma ve gizli kin|Kenarlıklı siyah disk
fr-silvanus|Silvanus|Unutulmuş Diyarlar|N|Doğa|vahşi doğa, doğal denge ve medenileşmemiş topraklar|Meşe yaprağı
fr-sune|Sune|Unutulmuş Diyarlar|CG|Yaşam,Işık|aşk, güzellik, sanat ve tutku|Güzel kızıl saçlı bir yüz
fr-talona|Talona|Unutulmuş Diyarlar|CE|Ölüm|hastalık, zehir, salgın ve çürüme|Üçgen üstünde üç gözyaşı damlası
fr-talos|Talos|Unutulmuş Diyarlar|CE|Fırtına|fırtına, yıkım, yıldırım ve doğal felaket|Merkezden çıkan üç şimşek
fr-tempus|Tempus|Unutulmuş Diyarlar|N|Savaş|savaş, savaşçıların cesareti ve çarpışmanın kuralları|Dik alevli kılıç
fr-torm|Torm|Unutulmuş Diyarlar|LG|Savaş|cesaret, görev, sadakat ve özveri|Beyaz sağ eldiven
fr-tymora|Tymora|Unutulmuş Diyarlar|CG|Hile|iyi talih, cesur risk ve maceracı şansı|Yazı yüzü yukarı bakan para
fr-tyr|Tyr|Unutulmuş Diyarlar|LG|Savaş|adalet, hukuk, doğru yargı ve onurlu savaş|Savaş çekici üstünde dengeli terazi
fr-umberlee|Umberlee|Unutulmuş Diyarlar|CE|Fırtına|deniz, dalgaların öfkesi, boğulma ve denizci korkusu|Sola ve sağa kıvrılan dalga
fr-waukeen|Waukeen|Unutulmuş Diyarlar|N|Bilgi,Hile|ticaret, para, pazarlar ve servetin dolaşımı|Sola bakan profil taşıyan dik para
celtic-daghdha|The Daghdha|Kelt|CG|Doğa,Hile|hava, ekin, bolluk ve cömertlik|Kaynayan kazan veya kalkan
celtic-arawn|Arawn|Kelt|NE|Yaşam,Ölüm|yaşam, ölüm ve öte dünyanın karanlık dengesi|Gri zemin üstünde siyah yıldız
celtic-belenus|Belenus|Kelt|NG|Işık|güneş, ışık, sıcaklık ve şifa veren aydınlık|Güneş diski ve dikili taşlar
celtic-brigantia|Brigantia|Kelt|NG|Yaşam|nehirler, çiftlik hayvanları ve bereketli kırsal yaşam|Taş veya ahşap yaya köprüsü
celtic-diancecht|Diancecht|Kelt|LG|Yaşam|tıp, şifa ve yarayı ustalıkla iyileştirme|Çapraz meşe ve ökseotu dalları
celtic-dunatis|Dunatis|Kelt|N|Doğa|dağlar, zirveler ve taşın dayanıklılığı|Kırmızı güneş başlıklı dağ zirvesi
celtic-goibhniu|Goibhniu|Kelt|NG|Bilgi,Yaşam|demircilik, zanaat ve iyileştiren ustalık|Kılıç üstünde dev tokmak
celtic-lugh|Lugh|Kelt|CN|Bilgi,Yaşam|sanat, yolculuk, ticaret ve çok yönlü ustalık|Bir çift uzun el
celtic-manannan|Manannan mac Lir|Kelt|LN|Doğa,Fırtına|okyanuslar, deniz yaratıkları ve güvenli geçiş|Yeşil zemin üstünde beyaz su dalgası
celtic-math|Math Mathonwy|Kelt|NE|Bilgi|büyü, sırlar ve tehlikeli büyü bilgisi|Asa
celtic-morrigan|Morrigan|Kelt|CE|Savaş|savaş, uğursuz kehanet ve kanlı zafer|Çapraz iki mızrak
celtic-nuada|Nuada|Kelt|N|Savaş|savaş, savaşçılar ve hükümdarın askerî gücü|Siyah zemin üstünde gümüş el
celtic-oghma|Oghma|Kelt|NG|Bilgi|konuşma, yazı, belagat ve bilginin aktarılması|Açılmış tomar
celtic-silvanus|Silvanus|Kelt|N|Doğa|doğa, ormanlar ve yaşlı ağaçların gücü|Yaz mevsimindeki meşe
greek-zeus|Zeus|Yunan|N|Fırtına|gökyüzü, yıldırım, hükümdarlık ve tanrıların düzeni|Şimşeklerle dolu yumruk
greek-aphrodite|Aphrodite|Yunan|CG|Işık|aşk, güzellik, arzu ve çekicilik|Deniz kabuğu
greek-apollo|Apollo|Yunan|CG|Bilgi,Yaşam,Işık|ışık, müzik, şifa ve kehanet|Lir
greek-ares|Ares|Yunan|CE|Savaş|savaşın vahşeti, çatışma ve öfke|Mızrak
greek-artemis|Artemis|Yunan|NG|Yaşam,Doğa|avcılık, doğum, ay ve vahşi hayvanlar|Ay diski üstünde yay ve ok
greek-athena|Athena|Yunan|LG|Bilgi,Savaş|bilgelik, medeniyet ve stratejik savaş|Baykuş
greek-demeter|Demeter|Yunan|NG|Yaşam|tarım, hasat ve toprağın bereketi|Kısrak başı
greek-dionysus|Dionysus|Yunan|CN|Yaşam|şenlik, şarap, coşku ve özgürleşme|Çam kozalağı uçlu asa
greek-hades|Hades|Yunan|LE|Ölüm|yeraltı dünyası, ölüler ve gömülü zenginlik|Siyah koç
greek-hecate|Hecate|Yunan|CE|Bilgi,Hile|büyü, ay, kavşaklar ve gizli ayinler|Batan ay
greek-hephaestus|Hephaestus|Yunan|NG|Bilgi|demircilik, zanaat, ateş ve icat|Çekiç ve örs
greek-hera|Hera|Yunan|CN|Hile|evlilik, iktidar entrikası ve kraliçelik|Tavus kuşu tüyü yelpazesi
greek-hercules|Hercules|Yunan|CG|Fırtına,Savaş|güç, macera, kahramanlık ve zorlu sınavlar|Aslan başı
greek-hermes|Hermes|Yunan|CG|Hile|yolculuk, ticaret, habercilik ve kurnazlık|Kanatlı ve yılanlı asa
greek-hestia|Hestia|Yunan|NG|Yaşam|ev, aile, ocak ve misafirperverlik|Ocak ateşi
greek-nike|Nike|Yunan|LN|Savaş|zafer, yarış ve başarı|Kanatlı kadın
greek-pan|Pan|Yunan|CN|Doğa|vahşi doğa, çobanlar ve içgüdü|Pan flütü
greek-poseidon|Poseidon|Yunan|CN|Fırtına|deniz, deprem, atlar ve denizin öfkesi|Üç dişli mızrak
greek-tyche|Tyche|Yunan|N|Hile|iyi talih, şehirlerin kaderi ve rastlantı|Kırmızı beş köşeli yıldız
egypt-rehorakhty|Re-Horakhty|Mısır|LG|Yaşam,Işık|güneş, hükümdarlık ve kozmik düzen|Yılanla çevrili güneş diski
egypt-anubis|Anubis|Mısır|LN|Ölüm|ölülerin yargısı, mezarlar ve öte dünyaya geçiş|Siyah çakal
egypt-apep|Apep|Mısır|NE|Hile|kötülük, ateş, yılanlar ve kozmik kaos|Alevli yılan
egypt-bast|Bast|Mısır|CG|Savaş|kediler, koruyucu öç ve evin savunulması|Kedi
egypt-bes|Bes|Mısır|CN|Hile|şans, müzik, ev neşesi ve kötü ruhlardan korunma|Biçimsiz tanrının sureti
egypt-hathor|Hathor|Mısır|NG|Yaşam,Işık|aşk, müzik, annelik ve sevinç|Ay diskli boynuzlu inek başı
egypt-imhotep|Imhotep|Mısır|NG|Bilgi|zanaat, mimari, tıp ve öğrenme|Basamaklı piramit
egypt-isis|Isis|Mısır|NG|Bilgi,Yaşam|bereket, büyü, annelik ve koruyucu bilgelik|Ankh ve yıldız
egypt-nephthys|Nephthys|Mısır|CG|Ölüm|ölüm, yas, cenaze koruması ve merhamet|Ay diski çevresinde boynuzlar
egypt-osiris|Osiris|Mısır|LG|Yaşam,Doğa|doğa, yeraltı dünyası, yeniden doğuş ve adil hüküm|Çoban değneği ve harman döveni
egypt-ptah|Ptah|Mısır|LN|Bilgi|zanaat, bilgi, yaratım ve sırlar|Boğa
egypt-set|Set|Mısır|CE|Ölüm,Fırtına,Hile|karanlık, çöl fırtınaları, cinayet ve kargaşa|Kıvrılmış kobra
egypt-sobek|Sobek|Mısır|LE|Doğa,Fırtına|su, timsahlar, askerî güç ve yırtıcılık|Boynuzlu ve tüylü timsah başı
egypt-thoth|Thoth|Mısır|N|Bilgi|bilgi, bilgelik, yazı ve ölçüm|Aynak kuşu
norse-odin|Odin|İskandinav|NG|Bilgi,Savaş|bilgi, savaş, runeler, şiir ve hükümdarlık|Bakan mavi göz
norse-aegir|Aegir|İskandinav|NE|Fırtına|deniz, fırtına ve denizcilerin korkusu|Kaba okyanus dalgaları
norse-balder|Balder|İskandinav|NG|Yaşam,Işık|güzellik, şiir, saflık ve umut|Mücevherli gümüş kadeh
norse-forseti|Forseti|İskandinav|N|Işık|adalet, hukuk, uzlaşma ve doğru hüküm|Sakallı adam başı
norse-frey|Frey|İskandinav|NG|Yaşam,Işık|bereket, güneş, barış ve bolluk|Buz mavisi büyük kılıç
norse-freya|Freya|İskandinav|NG|Yaşam|bereket, aşk, güzellik ve büyü|Şahin
norse-frigga|Frigga|İskandinav|N|Yaşam,Işık|doğum, bereket, aile ve önsezi|Kedi
norse-heimdall|Heimdall|İskandinav|LG|Işık,Savaş|nöbet, sadakat, sınırlar ve yaklaşan tehlike|Kıvrık savaş borusu
norse-hel|Hel|İskandinav|NE|Ölüm|yeraltı dünyası, hastalıktan ölenler ve soğuk ölüm|Bir yanı çürümüş kadın yüzü
norse-hermod|Hermod|İskandinav|CN|Hile|şans, habercilik ve tehlikeli yolculuk|Kanatlı tomar
norse-loki|Loki|İskandinav|CE|Hile|hırsızlık, hile, ateş ve bozulan düzen|Alev
norse-njord|Njord|İskandinav|NG|Doğa,Fırtına|deniz, rüzgâr, kıyı bereketi ve servet|Altın para
norse-odur|Odur|İskandinav|CG|Işık|ışık, güneş ve uzak yolculuk özlemi|Güneş diski
norse-sif|Sif|İskandinav|CG|Savaş|savaş, cesaret ve bereketli toprak|Yukarı kalkmış kılıç
norse-skadi|Skadi|İskandinav|N|Doğa|toprak, dağlar, kış ve avcılık|Dağ zirvesi
norse-surtur|Surtur|İskandinav|LE|Savaş|ateş devleri, savaş ve dünyanın yakıcı sonu|Alevli kılıç
norse-thor|Thor|İskandinav|CG|Fırtına,Savaş|fırtına, gök gürültüsü, güç ve koruma|Çekiç
norse-thrym|Thrym|İskandinav|CE|Savaş|don devleri, soğuk, güç ve yağma|Beyaz çift ağızlı balta
norse-tyr|Tyr|İskandinav|LN|Bilgi,Savaş|cesaret, strateji, ant ve adil savaş|Kılıç
norse-uller|Uller|İskandinav|CN|Doğa|av, kış, okçuluk ve kayak|Uzun yay
nonhuman-bahamut|Bahamut|İnsan Olmayan Halklar|LG|Yaşam,Savaş|iyi ejderhalar, adalet, koruma ve onurlu güç|Yandan görülen ejderha başı
nonhuman-blibdoolpoolp|Blibdoolpoolp|İnsan Olmayan Halklar|NE|Ölüm|kuo-toa, derin deniz korkusu ve yabancı kurban ayinleri|Istakoz başı veya siyah inci
nonhuman-corellon|Corellon Larethian|İnsan Olmayan Halklar|CG|Işık|elfler, sanat, büyü, güzellik ve özgür ifade|Çeyrek ay veya yıldız patlaması
nonhuman-deep-sashelas|Deep Sashelas|İnsan Olmayan Halklar|CG|Doğa,Fırtına|deniz elfleri, okyanus, yaratıcılık ve keşif|Yunus
nonhuman-eadro|Eadro|İnsan Olmayan Halklar|N|Doğa,Fırtına|merfolk, locathah, deniz ve sürü hâlinde yaşam|Sarmal desen
nonhuman-garl|Garl Glittergold|İnsan Olmayan Halklar|LG|Hile|gnomlar, mizah, değerli taşlar ve zekice oyunlar|Altın külçesi
nonhuman-grolantor|Grolantor|İnsan Olmayan Halklar|CE|Savaş|tepe devleri, savaş, zorbalık ve açgözlü güç|Tahta sopa
nonhuman-gruumsh|Gruumsh|İnsan Olmayan Halklar|CE|Fırtına,Savaş|orklar, fetih, fırtına ve bitmeyen savaş|Kapanmayan göz
nonhuman-hruggek|Hruggek|İnsan Olmayan Halklar|CE|Savaş|bugbearlar, şiddet, pusu ve güçlünün üstünlüğü|Sabah yıldızı
nonhuman-kurtulmak|Kurtulmak|İnsan Olmayan Halklar|LE|Savaş|koboldlar, madencilik, tuzaklar ve intikam|Gnom kafatası
nonhuman-laogzed|Laogzed|İnsan Olmayan Halklar|CE|Ölüm|troglodyteler, açlık, çürüme ve tüketme|Kertenkele-kurbağa tanrı sureti
nonhuman-lolth|Lolth|İnsan Olmayan Halklar|CE|Hile|drowlar, örümcekler, entrika ve acımasız hiyerarşi|Örümcek
nonhuman-maglubiyet|Maglubiyet|İnsan Olmayan Halklar|LE|Savaş|goblinoidler, fetih, askerî düzen ve korku|Kanlı balta
nonhuman-moradin|Moradin|İnsan Olmayan Halklar|LG|Bilgi,Savaş|cüceler, yaratım, ocak, klan ve demircilik|Çekiç ve örs
nonhuman-rillifane|Rillifane Rallathil|İnsan Olmayan Halklar|CG|Doğa|orman elfleri, ağaçlar ve doğal yaşamın döngüsü|Meşe
nonhuman-sehanine|Sehanine Moonbow|İnsan Olmayan Halklar|CG|Bilgi|elfler, ay, rüyalar, yolculuk ve ölümden sonraki geçiş|Hilal
nonhuman-sekolah|Sekolah|İnsan Olmayan Halklar|LE|Doğa,Fırtına|sahuaginler, av, köpekbalıkları ve denizin kanunu|Köpekbalığı
nonhuman-semuanya|Semuanya|İnsan Olmayan Halklar|N|Yaşam|lizardfolk, hayatta kalma, üreme ve sürüngen sabrı|Yumurta
nonhuman-skerrit|Skerrit|İnsan Olmayan Halklar|N|Doğa|centaurlar, satyrler, doğa ve sürü yaşamı|Palamuttan büyüyen meşe
nonhuman-skoraeus|Skoraeus Stonebones|İnsan Olmayan Halklar|N|Bilgi|taş devleri, taş, yeraltı ve taş sanatı|Sarkıt
nonhuman-surtur|Surtur|İnsan Olmayan Halklar|LE|Bilgi,Savaş|ateş devleri, zanaat, ateş ve savaş|Alevli kılıç
nonhuman-thrym|Thrym|İnsan Olmayan Halklar|CE|Savaş|don devleri, soğuk, güç ve yağma|Beyaz çift ağızlı balta
nonhuman-tiamat|Tiamat|İnsan Olmayan Halklar|LE|Hile|kötü kromatik ejderhalar, açgözlülük ve hükmetme|Beş pençeli ejderha izi
nonhuman-yondalla|Yondalla|İnsan Olmayan Halklar|LG|Yaşam|halflingler, bereket, yuva ve topluluğun korunması|Kalkan
`.trim();

  const alignmentLabels={LG:'Yasal İyi',NG:'Nötr İyi',CG:'Kaotik İyi',LN:'Yasal Nötr',N:'Nötr',CN:'Kaotik Nötr',LE:'Yasal Kötü',NE:'Nötr Kötü',CE:'Kaotik Kötü'};
  const fold=value=>String(value||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');

  const profiles=[
    [/tarim|ekin|bereket|hasat|dogum|annelik|aile|ev|ocak|ciftlik|bolluk|ureme/,{worshippers:'Çiftçiler, ebeler, aileler, köy önderleri ve geçimini toprağın döngüsünden sağlayanlar.',tenets:['Beslediğin şeyi koru.','Emeğin ürününü paylaş.','Yaşam döngüsüne saygı göster.'],roleplay:'Kıtlıkta erzak paylaşmak, mahsulü veya aileyi korumak ve topluluğun uzun vadeli iyiliğini öne almak bu inancı masada görünür kılar.',offering:'İlk hasattan bir pay, ekmek, süt, tohum veya ev ocağında yakılan temiz bir mum.',quest:'Kuruyan tarlanın nedenini bulmak, kaçırılan bir ebeyi kurtarmak ya da lanetli hasadı temizlemek.'}],
    [/sifa|tip|iyilestir|yara|dayaniklilik|aciya|merhamet/,{worshippers:'Şifacılar, bakıcılar, savaş cerrahları, acı çekenler ve başkasının yükünü taşımaya yemin edenler.',tenets:['Acıyı görmezden gelme.','Gücünü zayıfı ayağa kaldırmak için kullan.','Merhameti korkaklık sanma.'],roleplay:'Yaralıya önce yardım etmek, bedel ödeyerek başkasını kurtarmak ve tedaviyi çıkar aracı yapmamak güçlü bir inanç çizgisidir.',offering:'Temiz sargı, şifalı ot, su, gönüllü hizmet veya iyileşen kişinin teşekkür adağı.',quest:'Salgının kaynağını bulmak, kuşatma altındaki reviri beslemek ya da çalınmış bir şifa emanetini geri getirmek.'}],
    [/olum|olu|yer alti|mezar|cenaze|yas|curume|ote dunya|kacinilmaz son/,{worshippers:'Mezar bekçileri, cenaze görevlileri, yas tutanlar, ölülerle uğraşan din adamları ve ölümün düzenini koruyanlar.',tenets:['Ölüyü huzursuz etme.','Yaşam ile ölümün sınırını koru.','Yası sömürme; gerçeği saklama.'],roleplay:'Ölüye saygı göstermek, undead tehdidini ayırmak ve ölümün doğal son mu yoksa cinayet mi olduğunu araştırmak bu temayı işler.',offering:'İsim yazılı taş, cenaze parası, tütsü, sessiz nöbet veya unutulmuş bir mezarın temizlenmesi.',quest:'Mezardan çalınan adı geri getirmek, huzursuz ruhun son isteğini tamamlamak ya da sahte bir diriliş kültünü durdurmak.'}],
    [/bilgi|yazi|kayit|harita|bilgelik|konusma|kehanet|yazgi|ongoru|rune|olcum|fikir|ogrenme|sırlar/,{worshippers:'Kâtipler, bilginler, öğretmenler, kâşifler, kütüphaneciler, kâhinler ve gerçeğin peşinden gidenler.',tenets:['Bilgiyi doğrula.','Öğrendiğini kaybetme.','Gerçeğin bedelini bil ama cehaleti kutsama.'],roleplay:'Not tutmak, kanıt aramak, bir sırrın açıklanmasının sonuçlarını tartmak ve bilgiyi doğru kişiye ulaştırmak bu inanca uygun oynanır.',offering:'Yeni bir bilgi, düzgün kopyalanmış metin, harita, çözülmüş bilmece veya kütüphaneye bağış.',quest:'Kayıp tomarın izini sürmek, sahte kehaneti çürütmek ya da unutulmuş bir dili çözmek.'}],
    [/buyu|illüzyon|buyu agi|gizli ayin|sihir/,{worshippers:'Büyücüler, büyü araştırmacıları, cadılar, büyülü zanaatkârlar ve sihrin sınırlarını gözetenler.',tenets:['Büyünün sonucunu sahiplen.','Bilmediğin gücü hafife alma.','Sihrin bilgisini korurken onu körce zincirleme.'],roleplay:'Yeni büyüyü incelemek, büyüsel felaketi kapatmak ve gücü gösteriş yerine amaçla kullanmak takipçiyi belirginleştirir.',offering:'Kullanılmış parşömen, nadir mürekkep, küçük bir büyü gösterisi veya güvenli biçimde etkisizleştirilmiş lanet.',quest:'Bozulan büyü ağını onarmak, yasak ayinin bedelini öğrenmek ya da çalınan spellbook’u geri almak.'}],
    [/zanaat|demircilik|icat|muhendislik|yaratim|mimari|uretim|tas sanati/,{worshippers:'Demirciler, taş ustaları, mucitler, mimarlar, madenciler ve eserine ismini koyan zanaatkârlar.',tenets:['İşi sağlam yap.','Aleti hor kullanma.','Ustalığı sonraki kuşağa aktar.'],roleplay:'Bozuk bir şeyi onarmak, ustalık yemini tutmak ve kolay ama kusurlu çözüm yerine güvenilir iş çıkarmak uygun karakter davranışıdır.',offering:'Kendi yaptığın küçük bir parça, iyi bilenmiş alet, ilk çekiç darbesi veya ustaya ücretsiz yardım.',quest:'Efsanevi ocağı yeniden yakmak, sabotajcıyı bulmak ya da tamamlanmamış başyapıtın son parçasını getirmek.'}],
    [/savas|catism|askeri|zafer|strateji|guc|kahraman|fetih|siddet|pusu|cesaret/,{worshippers:'Askerler, muhafızlar, paralı savaşçılar, komutanlar, düellocular ve kendini savaşla sınayanlar.',tenets:['Savaşın nedenini bil.','Korkuyu inkâr etme; ona rağmen davran.','Zaferin bedelini başkasına gizleme.'],roleplay:'Savaş öncesi yemin, rakibe yaklaşım, esirlerin kaderi ve emre itaat sınırı tanrının alignmentına göre karakteri sınar.',offering:'Kırık silah parçası, kazanılmış nişan, nöbet, savaş şarkısı veya düşen bir yoldaşın adının anılması.',quest:'Kayıp sancağı geri almak, haksız savaşı ortaya çıkarmak ya da düelloyla kan davasını bitirmek.'}],
    [/adalet|hukuk|yargi|hukum|gorev|sadakat|nobet|koruma|sinir|ant|duzen/,{worshippers:'Yargıçlar, şövalyeler, şehir muhafızları, nöbetçiler, arabulucular ve yemine bağlı görevliler.',tenets:['Verdiğin sözü tart.','Gücü kuralla sınırla.','Suç ile şüpheyi birbirine karıştırma.'],roleplay:'Kanıt toplamak, tarafları dinlemek, yeminin kelimesiyle amacı çatışınca seçim yapmak ve savunmasızı korumak iyi sahneler üretir.',offering:'Yazılı yemin, dengeli terazi taşı, gece nöbeti, dürüst tanıklık veya düzeltilmiş bir haksızlık.',quest:'Rüşvet alan yargıcı açığa çıkarmak, bozulan antlaşmayı yenilemek ya da sınır karakolunu savunmak.'}],
    [/baris|sukunet|sevinç|dans|kutlama|ask|guzellik|siir|sarki|muzik|sanat|senlik|sarap|umut/,{worshippers:'Sanatçılar, müzisyenler, âşıklar, barış elçileri, şenlik düzenleyenler ve karanlıkta umut arayanlar.',tenets:['Güzelliği paylaş.','Sevinci baskı aracına dönüştürme.','Sözün ve sanatın yarayı kapatabileceğini unutma.'],roleplay:'Kavga yerine uzlaşma aramak, karanlık anda moral vermek ve sanatla hakikati göstermek bu inancı canlı tutar.',offering:'Şarkı, çiçek, güzel bir eser, ortak ziyafet, dans veya barıştırılan iki kişi adına adak.',quest:'Yasaklanan festivali kurtarmak, çalınmış başyapıtı bulmak ya da iki düşman haneyi barıştırmak.'}],
    [/ticaret|para|pazar|servet|yolculuk|habercilik|kervan/,{worshippers:'Tüccarlar, kervancılar, gezginler, haberciler, gemi kaptanları ve anlaşmayla geçinenler.',tenets:['Sözleşmeyi açık yap.','Yolcuyu sebepsiz bırakma.','Kazancı dolaşımda tut; hile ile ticareti ayır.'],roleplay:'Pazarlıkta sınır koymak, güvenli rota açmak, borcu kaydetmek ve yol arkadaşını yarı yolda bırakmamak belirgin seçimlerdir.',offering:'İlk kazancın küçük payı, yabancı para, yol taşı, dürüst tartı veya ücretsiz ulaştırılan bir haber.',quest:'Kaybolan kervanı bulmak, sahte para ağını bozmak ya da kapanan geçidi yeniden açmak.'}],
    [/deniz|okyanus|dalga|su|ruzgar|firtina|yildirim|gok gurultusu|gokyuzu|nehir|timsah|kopekbaligi/,{worshippers:'Denizciler, balıkçılar, kıyı halkı, fırtına kâhinleri, nehir yolcuları ve hava ile geçinenler.',tenets:['Doğayı kontrol ettiğini sanma.','Yolculuk öncesi hazırlık yap.','Fırtınada ekibini terk etme.'],roleplay:'Hava işaretlerini okumak, denize saygılı davranmak ve felakette önce mürettebatı kurtarmak inancın olumlu; korkuyla kurban istemek karanlık yüzüdür.',offering:'Temiz su, denize bırakılan çiçek, düğümlü ip, ilk avdan pay veya fırtına sonrası onarılan iskele.',quest:'Batık geminin çanını bulmak, kayıp deniz fenerini yakmak ya da nehir ruhuyla bozulan anlaşmayı düzeltmek.'}],
    [/orman|vahsi doga|av|hayvan|dag|zirve|toprak|tas|kış|soguk|dogal denge|coban/,{worshippers:'Avcılar, çobanlar, ormancılar, druidler, dağ halkı, izciler ve vahşi bölgelerde yaşayanlar.',tenets:['İhtiyacından fazlasını alma.','Av ile katliamı ayır.','Toprağın işaretlerini dinle.'],roleplay:'İz sürmek, kutsal alanı korumak, avın tamamını değerlendirmek ve yerleşimle doğa arasındaki dengeyi tartmak güçlü sahneler verir.',offering:'Düşmüş dal, avdan ölçülü pay, temizlenmiş pınar, dikilmiş fidan veya zirvede sessiz nöbet.',quest:'Kutsal koruyu kurtarmak, dengesiz avcıyı durdurmak ya da dağ geçidindeki eski ruhu yatıştırmak.'}],
    [/hile|yalan|entrika|hirsiz|gizli|gizem|talih|sans|rastlanti|ugursuz|intikam|aldatici|tuzak/,{worshippers:'Kumarbazlar, casuslar, hırsızlar, diplomatlar, şakacılar, kaçaklar ve kaderle pazarlık edenler.',tenets:['Her sırrın bir sahibi vardır.','Riskin bedelini kabul et.','Kurnazlık ile anlamsız zalimliği karıştırma.'],roleplay:'Kimliğini saklamak, plan içinde plan kurmak, şansı zorlamak ve bir yalanın kime zarar verdiğini tartmak bu temayı masaya taşır.',offering:'Yazı-tura parası, çözülen bilmece, saklanan küçük sır, oyun taşı veya kimseyi incitmeyen iyi bir şaka.',quest:'Çalınamaz denilen mührü almak, talihsizliği taşıyan parayı yok etmek ya da çift taraflı ajanı ortaya çıkarmak.'}],
    [/karanlik|kotu|cinayet|iskence|zehir|hastalik|zalim|korku|yikim|acgoz|kargaşa|kaos|kanli|yirtici/,{worshippers:'Genellikle korkuyla boyun eğenler, çıkar arayan kültistler, zalimler veya bu gücü yatıştırmaya çalışan çaresiz topluluklar.',tenets:['Gücü ele geçir.','Zayıflığı kullan.','Bedeli başkasına ödet.'],roleplay:'Bu inanç çoğunlukla düşman kültü, yozlaşma veya ağır ahlaki çatışma üretir. Oyuncu karakter için seçim yapmadan önce DM ile masa sınırlarını konuş.',offering:'Karanlık kültler sır, korku, ganimet veya kurban ister; ayrıntıyı güvenli masa sınırları içinde DM belirlemelidir.',quest:'Kült hücresini ortaya çıkarmak, zorla toplanan adağı kurtarmak ya da lanetli sunağın etkisini kırmak.'}],
    [/.*/,{worshippers:'Bu kavramla hayatı kesişen halk, din adamları, gezginler ve kişisel bir yemin arayan maceracılar.',tenets:['İnancın idealini eyleme dönüştür.','Sembolün taşıdığı sorumluluğu hatırla.','DM’nin dünya yorumuna uyum sağla.'],roleplay:'Tanrının portfolio alanını kararlarına, dualarına ve hedeflerine bağla; yalnız isim yazmak yerine çatışmalarda bu ideali görünür kıl.',offering:'Tanrının alanını temsil eden küçük bir nesne, hizmet veya yerine getirilen yemin.',quest:'Kayıp bir kutsal emaneti bulmak, tapınağın anlaşmazlığını çözmek ya da sahte rahibi ortaya çıkarmak.'}]
  ];

  const domainGuidance={
    Bilgi:'araştırma, kehanet, dil ve sır çözme temasını destekler',
    Yaşam:'iyileştirme, koruma ve grubu ayakta tutma temasını destekler',
    Işık:'aydınlatma, umut ve ateş/radiant baskısını destekler',
    Doğa:'hayvanlar, bitkiler, elementler ve vahşi arazi temasını destekler',
    Fırtına:'şimşek, gök gürültüsü ve sert hava temasını destekler',
    Hile:'aldatma, gizlilik, illüzyon ve taktik şaşırtmayı destekler',
    Savaş:'silah, savaş desteği ve ön cephe temasını destekler',
    Ölüm:'ölüm/necrotic temasını destekler; 2014 DMG alanıdır ve oyuncu için DM onayı ister'
  };

  function enrich(line){
    const [id,name,pantheon,alignment,domainText,portfolio,symbol]=line.split('|');
    const domains=domainText.split(',');
    const profile=profiles.find(([pattern])=>pattern.test(fold(portfolio)))[1];
    const cleric=`Önerilen ${domains.length>1?'domainler':'domain'}: ${domains.join(', ')}. ${domains.map(domain=>domainGuidance[domain]).join('; ')}. Tanrı seçimi tek başına STR, AC, zar veya proficiency bonusu vermez; mekanik özellikler class/domain seçimi ve DM kararından gelir.`;
    return {
      id,name,pantheon,alignment,alignmentLabel:alignmentLabels[alignment]||alignment,domains,portfolio,symbol,
      description:`${name}, ${pantheon} geleneğinde ${portfolio} ile ilişkilidir. Takipçinin duası ve davranışı özellikle bu kavramlarla sınandığında inanç oyunda anlam kazanır.`,
      worshippers:profile.worshippers,tenets:profile.tenets,roleplay:profile.roleplay,offering:profile.offering,quest:profile.quest,cleric,
      deathDomain:domains.includes('Ölüm'),historical:['Kelt','Yunan','Mısır','İskandinav'].includes(pantheon),
      source:pantheon==='İnsan Olmayan Halklar'?'2014 Player’s Handbook, Appendix B':'2014 Basic Rules, Appendix B'
    };
  }

  const deities=rows.split('\n').map(enrich);
  Object.defineProperty(window,'V49_DEITIES',{value:Object.freeze(deities.map(row=>Object.freeze({...row,domains:Object.freeze(row.domains),tenets:Object.freeze(row.tenets)}))),writable:false,configurable:false});
  Object.defineProperty(window,'V49_DEITY_META',{value:Object.freeze({count:deities.length,sourceUrl:'https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-b-gods-of-the-multiverse',rulesYear:2014}),writable:false,configurable:false});
})();
