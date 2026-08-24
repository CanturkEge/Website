/* v48: 4,000-record loot expansion, spell components and daily-use curios. */
((root)=>{
  'use strict';

  const TARGETS=Object.freeze({
    mundane:900,
    common:1000,
    uncommon:750,
    rare:550,
    veryRare:380,
    legendary:310,
    artifact:110
  });

  const KIND_LABELS=Object.freeze({
    all:'Tüm kullanım türleri',
    spellComponent:'Büyü materyalleri',
    everyday:'Gündelik eşyalar',
    delightDrink:'Keyif veren sıvılar',
    utility:'Kullanışlı büyülü eşyalar',
    specialUtility:'Özel etkili eşyalar',
    legacy:'Önceki ganimetler'
  });

  const MIN_LEVEL=Object.freeze({mundane:1,common:1,uncommon:2,rare:4,veryRare:6,legendary:8,artifact:10});
  const VALUE=Object.freeze({mundane:8,common:80,uncommon:450,rare:2400,veryRare:9500,legendary:40000,artifact:250000});

  function themesForSpell(spell){
    const themes=['arcane'];
    if(spell.classes?.some(name=>name==='Cleric'||name==='Paladin'))themes.push('sacred');
    if(spell.classes?.some(name=>name==='Druid'||name==='Ranger'))themes.push('nature');
    if(spell.school==='Necromancy')themes.push('cursed');
    if(/fire|cold|lightning|thunder|acid|ateş|soğuk|yıldırım|gök gürültüsü|asit/i.test(`${spell.name} ${spell.description}`))themes.push('elemental');
    return [...new Set(themes)];
  }

  function materialRarity(level){
    if(level<=0)return 'mundane';
    if(level<=2)return 'common';
    if(level<=4)return 'uncommon';
    if(level<=7)return 'rare';
    return 'veryRare';
  }

  function gpCost(source=''){
    const matches=[...String(source).matchAll(/worth(?: at least)?\s*([\d,]+)\s*gp/gi)];
    return matches.reduce((sum,match)=>sum+Number(match[1].replaceAll(',','')||0),0);
  }

  function spellComponentItem(spell){
    const source=String(spell.materialSource||''),cost=gpCost(source),consumed=/\bconsume(?:d|s)?\b/i.test(source),rarity=materialRarity(spell.level);
    const large=/coffin|vessel|container filled|large urn|büyük vazo|tabut|kapaklı kap/i.test(`${source} ${spell.materialTr}`);
    const exact=cost>0;
    const costRule=exact
      ?`Yazılı maliyet: en az ${cost.toLocaleString('tr-TR')} GP. GP değeri yazdığı için component pouch veya spellcasting focus bunun yerini tutmaz.`
      :'GP değeri yazmadığı için 2014 kuralında component pouch veya uygun spellcasting focus bunun yerine kullanılabilir.';
    const consumedRule=consumed?'Büyü metni en az bir parçanın tüketildiğini söylüyor; yalnız materyal cümlesinde tüketildiği belirtilen kısmı envanterden düş, diğer parçalar kalır.':'Büyü metni tüketildiğini söylemez; kullanımdan sonra elde kalır.';
    return {
      name:`Büyü Materyal Kiti: ${spell.name}${spell.nameTr&&spell.nameTr!==spell.name?` / ${spell.nameTr}`:''}`,
      category:'component',size:large?'large':'small',themes:themesForSpell(spell),rarity,minLevel:Math.max(1,Math.min(10,spell.level||1)),
      effect:`${spell.name} (${spell.level?`${spell.level}. seviye`:'Cantrip'}) için materyal: ${spell.materialTr} ${costRule} ${consumedRule}`,
      note:`2014 SRD büyü bileşeni • ${spell.schoolTr||spell.school} • ${spell.classes.join(', ')}.`,
      valueCopper:cost?cost*100:Math.max(4,(spell.level+1)*18),qtyMax:consumed?3:1,
      lootKind:'spellComponent',release:'v48',linkedSpellId:spell.id,linkedSpellName:spell.name,spellLevel:spell.level,
      materialSource:source,componentConsumed:consumed,componentCostGp:cost,requiresExactComponent:exact,
      activation:'Büyü atılırken materyal bileşen olarak kullanılır',uses:consumed?'Metinde belirtilen kısım tüketilir':'Tekrar kullanılabilir'
    };
  }

  const MUNDANE_BASES=[
    ['Yün Battaniye','tool','medium',['nature'],'Soğuk gecede yatak veya yük sargısı olarak kullanılabilir.'],
    ['Keten Havlu','tool','small',['mixed'],'Kurulama, pansuman desteği veya eşya sarma işine yarar.'],
    ['Tahta Kase','trinket','small',['mixed'],'Yemek, su veya küçük malzeme taşır.'],
    ['Bakır Kaşık','trinket','tiny',['noble'],'Yemek yemek veya küçük ölçü almak için kullanılır.'],
    ['Teneke Kupa','trinket','small',['martial'],'Sıcak ve soğuk içecek taşır.'],
    ['Kapaklı Kil Testi','tool','medium',['nature'],'Su, yağ veya kuru erzak saklar.'],
    ['Boş Şarap Tulumu','tool','small',['nature'],'Doldurulduğunda yaklaşık bir günlük su taşır.'],
    ['Kuru Ekmek Paketi','consumable','small',['mixed'],'Bir kişilik sade öğündür; yenince tüketilir.'],
    ['Tuzlu Peynir Bezi','consumable','small',['nature'],'Bir kişilik dayanıklı yol yiyeceğidir; yenince tüketilir.'],
    ['Kurutulmuş Elma Kesesi','consumable','small',['nature'],'İki küçük porsiyon yol atıştırmalığı içerir.'],
    ['Baharatlı Et Şeridi','consumable','small',['nature'],'Bir kişilik yol yiyeceğidir; keskin kokusu iz bırakabilir.'],
    ['Arpa Çayı Şişesi','consumable','small',['nature'],'Susuzluğu gideren sıradan içecektir; içilince tüketilir.'],
    ['Çakmak Taşı Kutusu','tool','small',['nature'],'Uygun kuru yakıtla sıradan ateş yakmaya yarar.'],
    ['On Mum Demeti','tool','small',['sacred'],'Her mum yaklaşık bir saat loş ışık verir.'],
    ['Kandil Yağı Şişesi','consumable','small',['elemental'],'Bir kandili yaklaşık altı saat besler; dökülürse yanıcıdır.'],
    ['İğne İplik Zarfı','tool','tiny',['noble'],'Yırtık kumaşı onarmak veya küçük dikiş yapmak için kullanılır.'],
    ['Yedek Çizme Bağı','trinket','tiny',['nature'],'Çizme bağlamak veya çok hafif bir nesneyi tutturmak için kullanılır.'],
    ['Düz Deri Kemer','trinket','small',['martial'],'Kıyafeti veya küçük bir keseyi sabitler; büyülü değildir.'],
    ['Yağmurluk Pelerini','tool','medium',['nature'],'Hafif yağmurda giysi ve küçük yükü kuru tutar.'],
    ['Yamalı Yolcu Şapkası','trinket','small',['nature'],'Güneşten ve hafif yağmurdan korur.'],
    ['Çalışma Eldiveni','tool','small',['martial'],'Kaba yüzey ve kıymığa karşı elleri korur; AC vermez.'],
    ['Yün Çorap Çifti','trinket','small',['nature'],'Soğukta rahatlık sağlar; mekanik direnç vermez.'],
    ['Cep Aynası','trinket','small',['noble'],'Köşe arkasını görmek veya ışık yansıtmak için kullanılabilir.'],
    ['Boynuz Tarak','trinket','tiny',['noble'],'Saç, kürk veya iplik düzenlemek için kullanılır.'],
    ['Kokulu Sabun Kalıbı','consumable','small',['noble'],'Yaklaşık on yıkanma sürer; sıradan kokuları temizler.'],
    ['Küçük Tebeşir Kutusu','tool','small',['arcane','sacred'],'Yüzey işaretlemek veya yol izi bırakmak için on parça içerir.'],
    ['Kömür Kalem Demeti','tool','small',['document'],'Çizim ve kısa notlar için altı kalem içerir.'],
    ['Boş Parşömen Rulosu','document','small',['document','arcane'],'Yaklaşık beş sayfalık yazı veya harita alanı sağlar.'],
    ['Dikişli Cep Defteri','document','small',['document'],'Kırk küçük sayfalık not defteridir.'],
    ['Sıradan Mürekkep Şişesi','component','small',['document','arcane'],'Yaklaşık yirmi sayfa yazmaya yeter.'],
    ['Mühür Mumu Çubuğu','component','tiny',['noble','document'],'Üç küçük mektup mührüne yeter.'],
    ['Kenevir Sicim Topu','tool','small',['nature','rogue'],'Yaklaşık 50 ft ince sicim içerir; ağır yük taşımaz.'],
    ['Beş Demir Kanca','tool','small',['martial','rogue'],'Küçük yük, örtü veya ip sabitlemeye yarar.'],
    ['Ahşap Takoz Seti','tool','small',['martial','rogue'],'Kapıyı açık ya da kapalı tutmak için üç takoz içerir.'],
    ['Küçük Çekiç','tool','medium',['martial'],'Çivi, kama ve hafif kamp onarımı için kullanılır.'],
    ['Katlanır Kürek','tool','medium',['martial','nature'],'Yumuşak zeminde küçük çukur veya ateş yeri kazmaya yarar.'],
    ['Balık Oltası Zarfı','tool','tiny',['nature'],'Altı kanca ve iki şamandıra içerir; ip ayrıca gerekir.'],
    ['Basit Fare Kapanı','tool','small',['rogue'],'Tiny haşere için yemli mekanik tuzaktır.'],
    ['Tahta Oyun Taşları','trinket','small',['noble'],'İki kişilik sade bir strateji oyunu setidir.'],
    ['Kemik Zar Çifti','trinket','tiny',['rogue'],'Büyüsüz altı yüzlü iki oyun zarıdır.'],
    ['İşaretsiz Oyun Kartları','trinket','small',['rogue'],'Elli iki kartlık sıradan destedir.'],
    ['Ucuz Flüt','tool','medium',['noble'],'Basit ezgiler çalınabilir; enstrüman proficiency kuralları değişmez.'],
    ['Teneke Düdük','tool','tiny',['martial'],'Açık alanda dikkat çekmek için keskin ses çıkarır.'],
    ['Boş Kuş Kafesi','tool','medium',['nature'],'Tiny bir hayvanı kısa süre güvenle taşır.'],
    ['Kuru Çiçek Demeti','trinket','small',['nature'],'Dekorasyon, hediye veya sıradan ritüel süsüdür.'],
    ['Renkli Cam Boncuklar','trinket','tiny',['noble','arcane'],'Yirmi ucuz boncuk içerir; takas ve el işi için kullanılır.'],
    ['Yontulmamış Tahta Figür','trinket','small',['nature'],'Boyanabilir, oyuncak veya basit bir işaret olarak kullanılabilir.'],
    ['Kalın Bakır Tel','component','small',['martial','arcane'],'10 ft yumuşak tel; onarım ve sıradan düzeneklerde işe yarar.'],
    ['Küçük Demir Zincir','tool','medium',['martial'],'10 ft hafif zincir; ağır yaratık bağlamak için güvenilir değildir.'],
    ['Boş Bez Çuval','tool','medium',['mixed'],'Kuru yük veya yaklaşık 30 lb gevşek malzeme taşır.'],
    ['Numaralı Anahtar Boşluğu','trinket','tiny',['rogue'],'Henüz kesilmemiş sıradan anahtar parçasıdır.'],
    ['Sade Ahşap Rozet','trinket','tiny',['noble'],'Boyanıp lonca, görev veya kamp işareti yapılabilir.'],
    ['Çiftçi Alışveriş Listesi','document','tiny',['document'],'Beş temel erzak ve yerel bir dükkân adı içerir.'],
    ['Yarım Kalmış Mektup','document','small',['document'],'Gündelik bir vedanın ortasında kesilir; DM isterse küçük ipucu yapabilir.'],
    ['Yerel Han Fişi','document','tiny',['noble','document'],'Adı yazılı handa bir gecelik ödemenin eski makbuzudur.'],
    ['Boş Küçük Şişe','tool','small',['alchemy'],'Yaklaşık bir bardak sıvı veya toz tutar.'],
    ['Kaba Tuz Kesesi','component','small',['alchemy','nature'],'Yiyecek saklama, temizlik veya sıradan yemek için kullanılır.'],
    ['Un Kesesi','consumable','medium',['nature'],'Yaklaşık beş sade öğünlük hamur hazırlanabilir.'],
    ['Kurutulmuş Ot Demeti','component','small',['nature','alchemy'],'Yemek, koku veya sıradan bitki karışımlarında kullanılabilir.'],
    ['Kömür Torbası','component','medium',['alchemy','elemental'],'Küçük bir kamp ateşini birkaç saat besler.'],
    ['Yedek Nal Çifti','tool','medium',['martial','nature'],'Bir binek için iki yedek nal; takmak için uygun alet gerekir.'],
    ['Eyer Onarım Kayışı','tool','small',['nature'],'Kopan sıradan bir eyer kayışını değiştirebilir.'],
    ['Kalın Yün İp','tool','medium',['nature'],'25 ft ip; hafif kamp yükü için uygundur.'],
    ['Tahta Su Matarası','tool','small',['nature'],'Bir günlük kişisel suyun bir kısmını taşır.'],
    ['Sade Şemsiye','tool','medium',['noble'],'Yağmur veya güneşe karşı tek kişilik koruma sağlar.'],
    ['Pirinç El Zili','tool','small',['sacred','noble'],'Yakın çevrede duyulan temiz bir zil sesi çıkarır.'],
    ['Kaba Büyüteç','tool','small',['arcane','noble'],'Küçük yazı ve yüzey ayrıntısını büyütür; Investigation bonusu vermez.'],
    ['Yedek Gözlük Camı','trinket','tiny',['noble'],'Belirli bir çerçeveye uyan sıradan mercektir.'],
    ['Katlanır Tahta Tabure','tool','medium',['mixed'],'Bir Medium yaratığın oturabileceği basit taburedir.'],
    ['Küçük Yağ Bezi','tool','small',['martial'],'Metal alet ve sıradan silah bakımında kullanılır.'],
    ['Süpürge Başı','tool','medium',['mixed'],'Sap takılırsa sıradan temizlik aleti olur.'],
    ['Bakır Dikiş Yüksüğü','trinket','tiny',['noble'],'İnce dikişte parmağı koruyan sıradan yüksüktür.']
  ];

  const MUNDANE_ORIGINS=[
    ['Yeni Alınmış','Temiz ve yeni görünür; sahibine dair iz taşımaz.'],
    ['Yol Tozlu','Üzerindeki yol tozu yakın zamanda taşındığını gösterir.'],
    ['Kale Damgalı','Altında hangi kaleden geldiğini gösteren küçük bir üretici damgası vardır.'],
    ['Lonca İşaretli','Üzerindeki küçük işaret eski sahibinin loncasına bağlanabilir.'],
    ['El Yapımı','Ufak kusurları onu benzersiz yapar ve yerel zanaatı gösterir.'],
    ['Asker Fazlası','Eski bir birlik numarası veya silik depo işareti taşır.'],
    ['Kervan Malı','İp ve yağ lekeleri uzun kervan yolculuğunu belli eder.'],
    ['Han Hatırası','Üzerinde bir hanın adı ya da kaba çizilmiş amblemi vardır.'],
    ['Çocuk Süslemeli','Üzerine zararsız bir hayvan veya yıldız resmi çizilmiştir.'],
    ['Yağmur Görmüş','Nem lekesi vardır ama temel işlevini sürdürür.'],
    ['Özenle Onarılmış','Bir önceki sahibi tarafından dikkatle tamir edilmiştir.'],
    ['İsimsiz Gezginin','Kenarında okunamayan iki baş harf bulunur.'],
    ['Pazar Artığı','Ucuz alınmış olsa da kullanılabilir durumdadır.'],
    ['Köy Yapımı','Yerel, sade ve dayanıklı yöntemlerle üretilmiştir.'],
    ['Sınır Kasabası','Üzerindeki çizikler tehlikeli bir bölgeden geldiğini düşündürür.']
  ];

  const DRINK_BASES=[
    ['Mavi Ay Şerbeti','Yaban mersini ve serin nane tadındadır.',['arcane','noble']],
    ['Gülen Armut Gazozu','Armut kokulu, hafif köpüklü ve alkolsüzdür.',['noble','nature']],
    ['Köpükcüce Birası','Kavrulmuş arpa tadında hafif alkollü bir cüce içkisidir.',['martial','noble']],
    ['Peri Çiyi Limonatası','Işıkta parlayan tatlı-ekşi bir limonatadır.',['arcane','nature']],
    ['Kızıl Elma Şırası','Baharatlı elma tadında, düşük alkollü sıcak içkidir.',['nature','noble']],
    ['Bulut Sütü','Vanilyalı, köpüklü ve alkolsüz bir süt içeceğidir.',['sacred','noble']],
    ['Ejder Meyvesi Tonik','Keskin meyve tadı ve dilde hafif karıncalanma bırakır.',['elemental','alchemy']],
    ['Uykusuz Arı Balı','Ballı ve zencefilli, alkolsüz bir toniğe benzer.',['nature','alchemy']],
    ['Kuzgun Üzümü Şarabı','Koyu renkli, buruk ve alkollü bir sofra şarabıdır.',['cursed','noble']],
    ['Şafak Portakalı Suyu','Turunçgil kokulu, parlak altın renkli ve alkolsüzdür.',['sacred','nature']],
    ['Bataklık Nanesi Çayı','Yeşil, yoğun naneli ve şaşırtıcı derecede ferahlatıcıdır.',['nature','alchemy']],
    ['Köz Tarçın Kahvesi','Sıcak tarçınlı ve isli aromalıdır.',['elemental','noble']],
    ['Ayçiçeği Bal Şarabı','Çiçek kokulu, orta alkollü bir bal şarabıdır.',['nature','noble']],
    ['Fısıltı Erik Suyu','İçildiğinde boğazda hafif bir uğultu bırakır.',['arcane','rogue']],
    ['Deniz Köpüğü Sodası','Tuzlu limon tadında, yoğun gazlı ve alkolsüzdür.',['elemental','nature']],
    ['Karamel Mantar Kvası','Topraksı-karamel tadında çok düşük alkollü fermente içkidir.',['nature','alchemy']],
    ['Gümüş Ihlamur Çayı','Sakin kokulu, açık renkli bitki çayıdır.',['sacred','nature']],
    ['Gece Kirazı Likörü','Tatlı, koyu ve güçlü alkollü bir likördür.',['cursed','noble']],
    ['Kristal Kavun Suyu','Buz gibi servis edilen tatlı ve alkolsüz meyve suyudur.',['elemental','noble']],
    ['Tarla Çileği Ayranı','Tuzlu-tatlı, yoğun ve alkolsüz bir köy içeceğidir.',['nature']],
    ['Altın Köpük Kola','Baharatlı, yoğun gazlı ve alkolsüzdür.',['noble','alchemy']],
    ['Kırmızı Biber Kakao','Tatlı başlayıp boğazı ısıtan sıcak kakaodur.',['elemental','noble']],
    ['Uyuyan Dev Kefiri','Ekşi, yoğun ve alkolsüz bir fermente süt içeceğidir.',['martial','nature']],
    ['Puslu Üzüm Şerbeti','Soğuk içilen, dumansı kokulu ve alkolsüzdür.',['arcane','noble']]
  ];

  const DRINK_QUIRKS=[
    ['Gökkuşağı Köpüğü','İçenin ağzından 10 dakika boyunca konuşurken zararsız renkli kabarcıklar çıkar; mekanik bonus vermez.'],
    ['Kıkırdama Mayası','İçen 1 dakika boyunca gülmeye daha yatkın olur; charmed sayılmaz ve eylemleri engellenmez.'],
    ['Sıcak Anı','İçen 10 dakika boyunca seçtiği hoş bir anıyı canlı biçimde hatırlar; Insight veya büyü etkisi değildir.'],
    ['Tını Değişimi','İçenin sesi 10 dakika boyunca bir oktav incelir ya da kalınlaşır; isterse etkisini erken bitirir.'],
    ['Parıltılı Nefes','İçenin nefesi 10 dakika boyunca loş ışıkta hafifçe parlar; alanı aydınlatmaz.'],
    ['Dans Eden Dil','İçen bir dakika boyunca söylediği cümlelerin sonunda istemsizce küçük bir melodi mırıldanır; spellcasting engellenmez.'],
    ['Tatlı Cesaret','İçen sonraki 10 dakika içinde yaptığı tek bir Performance kontrolüne +1 ekleyebilir.'],
    ['Dost Sofrası','En az iki kişi şişeyi paylaşırsa sonraki 10 dakika birbirlerine karşı ilk Insight kontrolünde +1 alırlar.'],
    ['Serin Baş','İçen bir dakika boyunca sıradan sıcak veya soğuk havayı daha rahat hisseder; resistance vermez.'],
    ['Renkli Gölge','İçenin gölgesi 10 dakika boyunca istediği renge döner; ışık ve görüş kurallarını değiştirmez.'],
    ['Köpük Bıyığı','İçenin yüzünde bir dakika kalan zararsız köpük bıyık oluşur; action ile silinebilir.'],
    ['İyi Uyku','Yatmadan önce içilirse o gece sıradan gürültüye rağmen rahat uyur; long rest şartlarını veya büyülü uykuyu değiştirmez.']
  ];

  const COMMON_UTILITY_BASES=[
    ['Cep Feneri','tool','small',['arcane']],['Pirinç Anahtarlık','trinket','tiny',['rogue']],['Dikiş Kutusu','tool','small',['noble']],['Yolcu Kupası','tool','small',['nature']],
    ['Katlanır Yelpaze','trinket','small',['noble']],['Küçük Çan','tool','tiny',['sacred']],['Tahta Tarak','trinket','tiny',['nature']],['Cep Defteri','document','small',['document']],
    ['Kristal Düğme','trinket','tiny',['arcane']],['Teneke Kaşık','trinket','tiny',['mixed']],['Küçük Kum Saati','tool','small',['arcane']],['Bakır Pusula','tool','small',['nature']],
    ['Deri Para Kesesi','tool','small',['rogue']],['Mantar Tıpalı Şişe','tool','small',['alchemy']],['El Aynası','trinket','small',['noble']],['Tebeşir Kutusu','tool','small',['arcane','sacred']],
    ['Pirinç Düdük','tool','tiny',['martial']],['Keten Mendil','trinket','tiny',['noble']],['Mühür Mumu','component','tiny',['document']],['Küçük Şemsiye','tool','medium',['noble']],
    ['İp Bileklik','trinket','tiny',['nature']],['Cam Boncuk','trinket','tiny',['arcane']],['Taş Oyun Pulu','trinket','tiny',['rogue']],['Cep Tabağı','tool','small',['mixed']],
    ['Yedek Çizme Bağı','tool','tiny',['nature']],['Minik Baharatlık','tool','small',['alchemy']],['Ahşap Rozet','trinket','tiny',['noble']],['Gözlük Kabı','tool','small',['noble']],
    ['Kamp Mandalı','tool','tiny',['nature']],['Kuş Tüyü Kalem','tool','small',['document']],['Boş Kart Destesi','trinket','small',['rogue']],['Küçük Sabunluk','tool','small',['noble']],
    ['Yün Boyunluk','trinket','small',['nature']],['Çakmak Kutusu','tool','small',['elemental']],['Bakır Ölçü Kaşığı','tool','tiny',['alchemy']],['Tahta Oyuncak Kuş','trinket','small',['nature']]
  ];

  const COMMON_UTILITY_POWERS=[
    ['Kıvılcım Veren','Action ile günde 1 kez yakındaki mum, kandil veya kamp ateşi büyüklüğündeki sıradan yakıtı tutuşturur; yaratığa hasar vermez.','Action','1/gün'],
    ['Temizleyen','Action ile günde 1 kez en fazla 1 cubic ft büyüsüz eşyanın sıradan kirini temizler; zehir, lanet veya hastalık kaldırmaz.','Action','1/gün'],
    ['Renk Değiştiren','Action ile kendi rengini seçilen sıradan bir renge çevirir; bir sonraki long rest’e kadar kalır.','Action','İstendiğinde'],
    ['Kuzeyi Gösteren','Action ile bir dakika boyunca gerçek kuzeyi işaret eder; başka düzlemde veya güçlü manyetik büyüde çalışmayabilir.','Action','3/gün'],
    ['Fısıltı Saklayan','Action ile en çok 6 saniyelik bir sesi kaydeder; başka bir action ile bir kez oynatınca kayıt silinir.','Action','Tek kayıt'],
    ['Ilık Tutan','İçindeki veya temas ettiği büyüsüz yiyeceği bir saat boyunca hoş sıcaklıkta tutar; pişirmez ve hasar vermez.','Action','3/gün'],
    ['Kuru Tutan','Kendi içini ve içindeki Tiny eşyaları sıradan yağmur ve sıçramaya karşı kuru tutar; suya batırılırsa korumaz.','Pasif','Sürekli'],
    ['Hırsız Uyaran','Sahibinden 10 ft uzaklaştırılırsa bir dakika boyunca hafifçe titreşir; sesi yalnız tutan kişi hisseder.','Pasif','1/long rest'],
    ['Koku Seçen','Action ile bir saat boyunca çiçek, odun, yağmur veya baharat kokularından birini yayar; zehirli kokuyu bastırmaz.','Action','3/gün'],
    ['Uğur Taşıyan','Long rest başına 1 kez savaş dışında yapılan bir ability check sonucu görüldükten sonra +1 eklenebilir.','Zar sonrası','1/long rest'],
    ['Işık Noktalı','Action ile bir saat boyunca 5 ft bright ve ilave 5 ft dim light verir; action ile söndürülür.','Action','1/gün'],
    ['Hatıra Isıtan','Sahibi adını söylediğinde bir dakika ılıklaşır; 30 ft dışına mesaj göndermez ve yaratık bulmaz.','Bonus Action','İstendiğinde']
  ];

  const UNCOMMON_BASES=[
    ['Gezgin Pusulası','tool','small',['nature']],['Kapı Dinleme Taşı','tool','tiny',['rogue']],['Kampçı Battaniyesi','tool','medium',['nature']],['Rünlü Tebeşir Kutusu','tool','small',['arcane']],
    ['Sessiz Çaydanlık','tool','medium',['noble']],['Kendini Toplayan İp','tool','medium',['nature']],['Duman Camı Mercek','tool','small',['arcane']],['Katlanır Küçük Sandal','tool','medium',['nature']],
    ['Gölge Ölçer Saat','tool','small',['arcane']],['Koku Saklayan Kutu','tool','small',['rogue']],['Yankı Şişesi','trinket','small',['arcane']],['Masa Kurma Örtüsü','tool','medium',['noble']],
    ['Cep Boyu Harita Taşı','trinket','small',['nature']],['Dostluk Kupası','trinket','small',['noble']],['Uyarı Çanı','tool','small',['sacred']],['Kuru Mürekkep Kalemi','tool','small',['document','arcane']],
    ['Gizli Bölmeli Defter','document','small',['rogue','document']],['Açlık Bastıran Kaşık','tool','tiny',['nature']],['Uyku Maskesi','trinket','small',['arcane']],['Mırıldanan Flüt','tool','medium',['noble']],
    ['Su Bulan Çubuk','tool','medium',['nature']],['Yol Kısaltan Baston','tool','medium',['nature']],['Tırmanış Eldiveni','tool','small',['martial']],['Güvenli Mumluk','tool','small',['sacred']],
    ['Sahte Mühür Kutusu','tool','small',['rogue','noble']],['Cep Tamir Örümceği','tool','tiny',['arcane']],['Hava Koklayan Rozet','trinket','tiny',['nature']],['Kilit Hatırlayan Anahtar','trinket','tiny',['rogue']],
    ['Yolcu Aynası','trinket','small',['noble']],['Fısıltı Hunisi','tool','small',['rogue']],['Sıcak Taş Matarası','tool','small',['elemental']],['Yağmur Kaçıran Şapka','trinket','small',['nature']]
  ];

  const UNCOMMON_POWERS=[
    ['Yol Hafızalı','Action ile günde 1 kez son bir saatte yürüdüğün rotanın yönünü ve önemli dönüşlerini 10 dakika boyunca hatırlatır; teleport veya bilinç kaybını aşamaz.','Action','1/gün'],
    ['Keskin Duyulu','Action ile günde 1 kez 10 dakika boyunca kapı, duvar veya sandık ardındaki sıradan sesleri dinlemek için yapılan Perception kontrolüne +2 verir; magical silence’ı aşmaz.','Action','1/gün'],
    ['Küçük Sığınaklı','10 dakikada kurulduğunda dört Medium yaratığı sıradan yağmur ve rüzgârdan sekiz saat koruyan kuru bir kamp alanı oluşturur; saldırılara karşı cover vermez.','10 dakika','1/long rest'],
    ['Geri Çağrılan','Bonus action ile 30 ft içinden sahibinin boş eline döner; başka yaratık tarafından tutuluyorsa gelmez.','Bonus Action','3/gün'],
    ['Sessizlik Örtülü','Action ile günde 1 kez 10 dakika boyunca kendi çıkardığı küçük eşya seslerini bastırır ve savaş dışı tek bir Stealth kontrolüne +2 verir; konuşmayı veya spell component’ini susturmaz.','Action','1/gün'],
    ['Usta Yardımcısı','Long rest başına 1 kez bu eşyanın doğal kullanımına uygun bir tool check sonucuna, zar görüldükten sonra +1d4 ekler.','Zar sonrası','1/long rest'],
    ['Gece İşaretli','Action ile bir saat boyunca yalnız sahibi ve 10 ft içindeki seçtiği yaratıkların görebildiği soluk işaretler bırakır; truesight veya Detect Magic işaretleri görebilir.','Action','1/gün'],
    ['Dürüst Ölçülü','Action ile günde 3 kez küçük bir büyüsüz nesnenin yaklaşık ağırlığını, sıcaklığını ya da doluluk oranını söyler; zehir veya büyü teşhis etmez.','Action','3/gün']
  ];

  const UNCOMMON_CONSUMABLES=[
    ['Kısa Dil Damlası','İçen 10 dakika boyunca seçtiği, son 24 saatte duyduğu bir dili konuşamaz ama temel niyetini ve gündelik kelimeleri anlamak için yapılan INT check’e +2 alır.',['arcane']],
    ['Yol Yorgunluğu Şurubu','İçen, normal seyahatten gelen bir seviye exhaustion’ı bir saat görmezden gelir; süre bitince seviye geri döner ve yeni exhaustion silinmez.',['nature','alchemy']],
    ['Ayak İzi Mürekkebi','Bir zemine dökülürse son bir saat içinde geçmiş Medium veya daha büyük yaratıkların izleri bir dakika solukça parlar; yaratık kimliği vermez.',['nature','arcane']],
    ['Yalan Köpüğü','İçen bir dakika boyunca bilerek yalan söylediğinde ağzından mavi köpük çıkar; hedef bunu bilerek içmelidir, saving throw yoktur.',['arcane','noble']],
    ['Kayıp Koku Yağı','Bir nesneye sürülürse bir saat boyunca onu takip eden Survival kontrolüne +2 verir; 24 saatten eski izi geri getirmez.',['nature','alchemy']],
    ['Sessiz Geğirti Gazozu','İçen bir saat boyunca yediği ve içtiği şeylerin kokusunu dışarı vermez; Stealth veya zehir bağışıklığı sağlamaz.',['rogue','alchemy']],
    ['Cep Ateşi Çorbası','İçen bir saat boyunca doğal soğuk hava save’lerine +2 alır; cold damage resistance vermez.',['elemental','nature']],
    ['Serin Göl İçeceği','İçen bir saat boyunca doğal sıcak hava save’lerine +2 alır; fire damage resistance vermez.',['elemental','nature']],
    ['Uyanık Gece Kahvesi','İçen iki saat boyunca sıradan uykuya dalmaz; magical sleep’i engellemez ve long rest yerine geçmez.',['alchemy','noble']],
    ['Sahne Cesareti Tonuğu','İçen sonraki bir saat içindeki tek bir Performance veya Persuasion check’ine +1d4 ekler; zar atıldıktan önce seçilir.',['noble','alchemy']],
    ['Balık Soluğu Şekeri','Çiğneyen 10 dakika nefesini normalin iki katı tutabilir; su altında nefes aldırmaz.',['nature','alchemy']],
    ['Süratli Düğüm Yağı','Bir ipe sürülürse sonraki bir saat içindeki ilk bağlama veya çözme Sleight of Hand check’ine +1d4 verir.',['rogue','alchemy']],
    ['Rüya Mürekkebi','Uyumadan önce ele sürülürse kullanıcı uyandığında gördüğü rüyayı bir sayfalık görüntü olarak kâğıda aktarabilir; kehanet sağlamaz.',['arcane']],
    ['Taze Sofra Tuzu','Bir günlük bozulmaya başlamış ama zehirlenmemiş yiyeceği güvenle yenebilir hâle getirir; poison veya disease kaldırmaz.',['nature','sacred']],
    ['İz Bırakmaz Sabun','On dakika yıkanan yaratığın sıradan kokusunu bir saat bastırır ve kokuyla iz sürmeye karşı +2 DC sağlar.',['rogue','nature']],
    ['Söz Tutma Şerbeti','İçen kendi isteğiyle bir cümlelik söz söyler; 24 saat içinde sözünü bozarsa sıvı dilini morartır ama hasar veya condition vermez.',['sacred','noble']]
  ];

  const RARE_ITEMS=[
    {name:'Ölülerin Son İzleri Kolyesi',category:'accessory',slot:'neck',themes:['cursed','sacred'],effect:'Action ile günde 1 kez etkinleştirilir. 1 dakika boyunca 60 ft içinde son 24 saatte ölmüş yaratıkların ölüm anında kaldığı yerde soluk siluetlerini görürsün. Kimlik, düşünce veya konuşma vermez; duvarların arkasını göstermez ve undead tespit etmez.',activation:'Action',uses:'1/gün'},
    {name:'Yalanı Morartan Broş',category:'accessory',slot:'brooch',themes:['noble','arcane'],effect:'Günde 1 kez 10 dakika etkinleştirilir. 10 ft içindeki bir yaratık bilerek yalan söylediğinde broş morarır; yanlış bilgiye inanmak veya eksik konuşmak tetiklemez. Broş kimin yalan söylediğini belirtmez.',activation:'Action',uses:'1/gün'},
    {name:'Kayıp Kapı Pusulası',category:'tool',themes:['arcane','rogue'],effect:'Action ile günde 1 kez son 7 gün içinde sahibinin geçtiği ve 1 mil içinde bulunan seçili bir kapının yönünü 10 dakika gösterir. Kap taşındıysa eski yerini, teleport kapısıysa fiziksel çerçeveyi işaret eder.',activation:'Action',uses:'1/gün'},
    {name:'Sessiz Piknik Örtüsü',category:'tool',size:'medium',themes:['noble','arcane'],effect:'1 dakikada serilir. Üzerindeki en fazla altı Medium yaratığın yemek, çatal ve sohbet sesini 10 ft dışından duyulmaz yapar; spellcasting, bağırma ve savaş sesi normal çıkar.',activation:'1 dakika',uses:'3/gün'},
    {name:'Son Öğünün Kaşığı',category:'tool',themes:['sacred','cursed'],effect:'Action ile bir cesedin son 24 saat içinde yediği son yiyeceğin tadını ve yaklaşık ne zaman yendiğini sahibine hissettirir. Zehrin adını söylemez; aynı cesette bir kez çalışır.',activation:'Action',uses:'1/ceset'},
    {name:'Unutkan Anahtar',category:'trinket',themes:['rogue','arcane'],effect:'Action ile günde 1 kez sıradan bir kilide dokundurulur. Anahtar kilidi açmaz; fakat sonraki 10 dakika kilidi daha önce açmış bir yaratığın yaptığı son hatayı gösterir ve Thieves’ Tools check’ine avantaj verir.',activation:'Action',uses:'1/gün'},
    {name:'Düşmeyen Mum',category:'tool',themes:['sacred','arcane'],effect:'Action ile yakılır ve 4 saat yanar. Taşındığı yüzey eğilse bile dik kalır; normal rüzgâr söndüremez. Su, magical darkness veya action ile söner. Bir sonraki şafakta yeniden oluşur.',activation:'Action',uses:'1/şafak'},
    {name:'Fısıltı Şişesi',category:'tool',themes:['arcane','rogue'],effect:'Action ile 1 dakikaya kadar bir konuşmayı kaydeder. Şişe kapatılınca yalnız kapağı açan ilk yaratığa sesi bir kez oynatır ve kayıt silinir. Günde 1 kayıt alır.',activation:'Action',uses:'1/gün'},
    {name:'Misafir Sayar Kapı Tokmağı',category:'tool',size:'medium',themes:['noble','arcane'],effect:'Bir kapıya 10 dakikada takılır. Son long rest’ten beri kapıdan geçen Tiny veya daha büyük yaratıkların sayısını söyler; kimlik veya yön söylemez. Başka kapıya takılınca sayaç sıfırlanır.',activation:'10 dakika',uses:'Sürekli'},
    {name:'Hırsızın Mahcup Eldiveni',category:'accessory',slot:'hands',themes:['rogue','cursed'],effect:'Sahibi, rızası olmayan birinden eşya çaldığında eldiven bir saat kırmızı parlar. Buna karşılık günde 1 kez kendi eşyasını birinin cebine fark ettirmeden koymak için Sleight of Hand check’ine avantaj verir.',activation:'Pasif / zar öncesi',uses:'1/gün'},
    {name:'Geri Dönen Alışveriş Sepeti',category:'tool',size:'medium',themes:['noble','arcane'],effect:'Boşken bonus action ile 60 ft içindeki sahibinin yanındaki boş alana ışınlanır. İçinde canlı, büyülü eşya veya 20 lb’den fazla yük varsa gelmez.',activation:'Bonus Action',uses:'3/gün'},
    {name:'Yol Arkadaşı Çaydanlığı',category:'tool',size:'medium',themes:['nature','noble'],effect:'Short rest sırasında temiz suyla doldurulursa altı sıcak içecek hazırlar. İçenler sonraki bir saat içindeki ilk frightened save’lerine +1 alır; aynı demlikten bonus birikmez.',activation:'Short rest',uses:'1/long rest'},
    {name:'Bir Dakikalık Hayalet Feneri',category:'tool',size:'medium',themes:['cursed','sacred'],effect:'Action ile günde 1 kez yakılır. 1 dakika boyunca 30 ft içindeki incorporeal undead soluk çerçeveyle görünür; invisible durumunu kaldırmaz ama konumlarını gizleyemezler.',activation:'Action',uses:'1/gün'},
    {name:'Unutulmuş İsim Defteri',category:'document',themes:['arcane','cursed'],effect:'Bir cesedin kanından bir damla sayfaya sürülürse o yaratığın hayatta en sık duyduğu ad veya lakap belirir. Gerçek ad olmak zorunda değildir; aynı cesette bir kez çalışır ve kan tüketilir.',activation:'1 dakika',uses:'1/ceset'},
    {name:'Kavgayı Soğutan Sürahi',category:'tool',size:'medium',themes:['sacred','noble'],effect:'Action ile günde 1 kez kırılır gibi masaya vurulur. 20 ft içindeki gönüllü yaratıklar 1 dakika boyunca bağırdıklarında sesleri fısıltıya dönüşür; saldırı ve büyüler etkilenmez.',activation:'Action',uses:'1/gün'},
    {name:'Yarın Yağacak Şemsiye',category:'tool',size:'medium',themes:['nature','arcane'],effect:'Her şafakta iç yüzünde bulunduğu konumun önümüzdeki 24 saatlik doğal hava durumunu simgeleyen resim belirir. Büyülü hava ve başka düzlem etkileri tahmin edilmez.',activation:'Pasif',uses:'Her şafak'},
    {name:'Kokuyu Hatırlayan Mendil',category:'trinket',themes:['nature','rogue'],effect:'Action ile bir kokuyu kaydeder. Sonraki 7 gün boyunca action ile kokunun 1 mil içindeki genel yönünü gösterebilir; akan su, teleport ve başka düzlem izi bozar. Tek koku saklar.',activation:'Action',uses:'Tek kayıt'},
    {name:'Yolculuk Sayacı Halhal',category:'accessory',slot:'anklet',themes:['nature','noble'],effect:'Giyildiğinde gün içinde yürüdüğün mesafeyi, çıkılan merdivenleri ve kaç kez düştüğünü sayar. Günde 1 kez son düşüşün yönünü ve yüksekliğini gösterir; combat bonusu vermez.',activation:'Pasif',uses:'1/gün ayrıntı'},
    {name:'Kayıp Eşya Çanı',category:'tool',themes:['arcane','noble'],effect:'Action ile sahibinin son 24 saatte dokunduğu, 5 lb’den hafif ve 120 ft içindeki büyüsüz bir eşyanın adı söylenir. Çan yönüne göre daha yüksek çalar; duvarları aşmaz.',activation:'Action',uses:'2/gün'},
    {name:'Kırılmadan Önceki Ayna',category:'trinket',size:'small',themes:['arcane','noble'],effect:'Kırık bir büyüsüz nesne aynaya tutulursa günde 1 kez bir dakika boyunca sağlam hâlinin görüntüsünü gösterir. Onarmaz, iç mekanizmayı veya görünmeyen parçayı uydurmaz.',activation:'Action',uses:'1/gün'},
    {name:'Masum Kanı Kararan İğne',category:'tool',themes:['sacred','cursed'],effect:'Bir kan damlasına dokundurulduğunda kan son 24 saatte rızası dışında ciddi zarar görmüş bir humanoid’e aitse iğne kararır. Kimin zarar verdiğini veya suçun bağlamını söylemez.',activation:'Action',uses:'3/gün'},
    {name:'Sessiz Alarm İpi',category:'tool',size:'medium',themes:['rogue','arcane'],effect:'10 dakikada en fazla 30 ft çevreye gerilir. Tiny’den büyük bir yaratık geçtiğinde yalnız kuran kişinin bileği titreşir; aynı düzlemde 1 mil içinde çalışır ve sonra söner.',activation:'10 dakika',uses:'1/long rest'},
    {name:'Gölge Boyu Cetveli',category:'tool',themes:['arcane','cursed'],effect:'Bir yaratığın gölgesini ölçerek onun gerçek boyut kategorisini ve shapeshift etkisi altında olup olmadığını söyler. İllüzyonun türünü veya asıl formu açıklamaz.',activation:'Action',uses:'3/gün'},
    {name:'Yeniden Isınan Akşam Yemeği Tası',category:'tool',themes:['noble','arcane'],effect:'Action ile içindeki bir porsiyon büyüsüz yiyeceği güvenli servis sıcaklığına getirir. Günde 3 kez çalışır; zehir, hastalık veya bozulmayı kaldırmaz.',activation:'Action',uses:'3/gün'},
    {name:'Gözcünün Uykusuz Boncuğu',category:'consumable',themes:['martial','alchemy'],effect:'Action ile yutulur. 4 saat boyunca sıradan uykuya dalamazsın ve doğal gece nöbeti Perception check’lerine +1 alırsın. Süre bitince bir saat boyunca WIS check’lerine −1 alırsın. Tek kullanımlıktır.',activation:'Action',uses:'Tek kullanım',consumable:true},
    {name:'Bir Yudumluk Şenlik Şişesi',category:'consumable',themes:['noble','arcane'],effect:'Action ile içilir. Bir dakika boyunca 20 ft içinde yalnız gönüllü yaratıkların başının üstünde zararsız havai fişekler belirir ve müzik duyulur. Stealth’i bozar; savaş bonusu vermez. Tek kullanımlıktır.',activation:'Action',uses:'Tek kullanım',consumable:true},
    {name:'Taşın Sözünü Çözen Toz',category:'consumable',themes:['arcane','nature'],effect:'Bir taş yüzeye serpilirse son 24 saatte yüzeye vurulan en güçlü darbenin yönünü ve yaklaşık büyüklüğünü bir görüntüyle gösterir. Toz tüketilir; konuşma veya geçmiş sahnesi vermez.',activation:'Action',uses:'Tek kullanım',consumable:true},
    {name:'Kaderi Bir Kez Dürten Kahve',category:'consumable',themes:['arcane','noble'],effect:'10 dakikada içilir. Sonraki bir saat içindeki ilk natural 1 ability check yeniden atılır ve yeni sonuç kullanılır. Attack/save/death save etkilemez. Tek kullanımlıktır.',activation:'10 dakika',uses:'Tek kullanım',consumable:true},
    {name:'Hafıza Şeridi Mürekkebi',category:'component',themes:['arcane','document'],effect:'Bir sayfaya bir saat boyunca anı yazılırsa yazan kişi sonraki 30 gün o olayı unutamaz. Modify Memory gibi büyüleri engellemez. Bir şişe tek sayfada tüketilir.',activation:'1 saat',uses:'Tek kullanım',componentConsumed:true},
    {name:'Ay Işığına Açılan Tohum',category:'component',themes:['nature','sacred'],effect:'Dolunay altında toprağa ekilirse bir dakika içinde 10 ft çapında çiçek alanı oluşturur. Çiçekler undead 30 ft yakındayken kapanır; bir sonraki şafakta solar. Tohum tüketilir.',activation:'Action',uses:'Tek kullanım',componentConsumed:true},
    {name:'Kilitli Rüya Mektubu',category:'document',themes:['arcane','noble'],effect:'Mektup, adı yazılı alıcı ilk long rest’ini tamamladığında rüyasında okunur ve sonra kâğıt boşalır. Başka düzleme ulaşmaz; alıcı mesajı cevaplayamaz.',activation:'Yazmak 10 dakika',uses:'Tek mesaj'},
    {name:'Yol Vermeyen Sınır Taşı',category:'trinket',themes:['martial','arcane'],effect:'Action ile yere konur. 10 dakika boyunca 10 ft içindeki sıradan küçük hayvanlar ve haşere çizgiyi geçmek istemez; Beast saldırısını, summon’ı veya kontrol edilen yaratığı durdurmaz.',activation:'Action',uses:'1/gün'},
    {name:'Ödünç Yüz İğnesi',category:'trinket',themes:['rogue','arcane'],effect:'Bir kumaşa takıldığında 10 dakika boyunca sahibinin yüzünü daha sıradan ve unutulabilir gösterir; kimliği değiştirmez. Onu tarif etmek için yapılan Investigation check’ine DC +2 verir. Günde 1 kez.',activation:'Action',uses:'1/gün'},
    {name:'Kırık Kalbi Dinleyen Fincan',category:'trinket',themes:['noble','sacred'],effect:'Günde 1 kez iki gönüllü yaratık bu fincandan paylaşırsa 10 dakika boyunca birbirlerine karşı Insight check’lerinde avantaj alır; yalan söylemeyi veya charm etkisini engellemez.',activation:'1 dakika',uses:'1/gün'},
    {name:'Çalıntı Malı Utandıran Mühür',category:'tool',themes:['sacred','noble'],effect:'Bir eşyaya basıldığında son 30 gün içinde rızası dışında sahibinden alınmışsa mühür kırmızı görünür. Gerçek sahibi, hırsız veya satış zincirini açıklamaz. Günde 3 kez.',activation:'Action',uses:'3/gün'},
    {name:'Son Söz Balmumu',category:'component',themes:['cursed','document'],effect:'Yeni ölmüş bir yaratığın dudaklarına bir dakika içinde sürülürse söylediği son altı kelime balmumuna yazılır. Sessiz öldüyse boş kalır. Speak with Dead değildir; balmumu tüketilir.',activation:'Action',uses:'Tek kullanım',componentConsumed:true},
    {name:'Gece Bekçisinin Ayakkabı Boyası',category:'consumable',themes:['rogue','alchemy'],effect:'Bir çift ayakkabıya 10 dakikada sürülür. 8 saat boyunca yürürken sıradan zeminde iz bırakmaz; koku, kan, kar, çamur ve magical tracking etkilenmez. Tek kullanımlıktır.',activation:'10 dakika',uses:'Tek kullanım',consumable:true},
    {name:'Yanlış Duvar Tebeşiri',category:'tool',themes:['arcane','rogue'],effect:'Action ile bir duvara çizgi çekilir. 10 dakika boyunca çizgi 1 ft’den ince illüzyon veya gizli kapı sınırından geçiyorsa parlar. Mekanik tuzak veya kalın taş ardını bulmaz. Günde 3 çizgi.',activation:'Action',uses:'3/gün'},
    {name:'Kendi Kendine Dönen Kütüphane Merdiveni',category:'tool',size:'large',themes:['arcane','noble'],effect:'Sahibi bir kitap adı söylediğinde aynı odadaki açıkça görülebilen o kitaba doğru yavaşça yuvarlanır. Merdiven çıkmaz, kilit açmaz ve 10 ft/tur hızla hareket eder.',activation:'Bonus Action',uses:'İstendiğinde'},
    {name:'Bir Gecelik Hayalet Oda Anahtarı',category:'trinket',themes:['arcane','cursed'],effect:'Long rest sırasında yastık altına konursa uyuyan kişi odanın son 100 yıldaki önceki bir gecesinden zararsız bir rüya sahnesi görür. DM sahneyi seçer; kesin kehanet veya tüm gerçeği vermez. Anahtar şafakta yok olur.',activation:'Long rest',uses:'Tek kullanım',consumable:true}
  ];

  const VERY_RARE_ITEMS=[
    {name:'Eşikler Arası Hatıra Sandığı',category:'tool',size:'medium',themes:['arcane','noble'],effect:'Sandık 20 lb’ye kadar büyüsüz eşya tutar. Günde 1 kez action ile sahibinin son 30 gün içinde en az bir saat kaldığı, aynı düzlemdeki güvenli bir odaya içeriğini yollar; canlı, cursed item ve planar ward geçmez. Sandığın kendisi kalır.',activation:'Action',uses:'1/gün'},
    {name:'Kayıp Ruhların Çay Saati Takımı',category:'tool',size:'medium',themes:['sacred','cursed'],effect:'10 dakikalık ritüelde en fazla dört fincan hazırlanır. Son 7 günde ölen ve mekâna bağlı kalmış bir ruh varsa bir dakika boyunca fincanlardan biri buğulanır ve ruh tek bir duygu ile kaba bir yön gösterebilir. Konuşma, isim veya zorunlu cevap vermez.',activation:'10 dakika',uses:'1/long rest'},
    {name:'Yaşanmamış Sabahın Saati',category:'trinket',themes:['arcane'],effect:'Günde 1 kez bir ability check atılmadan önce kurulur. Atış başarısız olursa kullanıcı başarısızlığın bir dakikalık olası sonucunu görür ve aynı check’i yeniden atabilir; ikinci sonuç zorunludur. Attack, save ve death save etkilemez.',activation:'Zar öncesi',uses:'1/gün'},
    {name:'Taşların Hafıza Feneri',category:'tool',size:'medium',themes:['arcane','nature'],effect:'Action ile bir saat yakılır. 30 ft içindeki duvarlarda son 100 yıldaki büyük yangın, çökme veya yoğun şiddet izleri renk olarak görünür. Canlı görüntü, kimlik ya da konuşma vermez; her şafakta bir saat yenilenir.',activation:'Action',uses:'1 saat/şafak'}
  ];

  const LEGENDARY_ITEMS=[
    {name:'On İki Yolun Sofra Bezi',category:'tool',size:'medium',themes:['arcane','noble'],effect:'Long rest başına 1 kez 10 dakikada serilir ve sekiz kişilik sıcak yemek çıkarır. Yiyen her yaratık exhaustion seviyesini 1 azaltır ve 24 saat açlık/susuzluk yaşamaz. Aynı yaratık bu faydayı 7 günde bir alabilir.',activation:'10 dakika',uses:'1/long rest'},
    {name:'İsmi Silinmeyen Misafir Defteri',category:'document',themes:['arcane','noble'],effect:'Bir yapı girişine bırakıldığında içeri kendi isteğiyle giren her sapient yaratığın kullandığı adı yazar. Disguise bunu değiştirmez; gerçek ad zorlanmaz. Sayfa koparılamaz, kayıtlar DM action ile tek tek silebilir; başka düzlemde çalışmaz.',activation:'Pasif',uses:'Sürekli'},
    {name:'Ölümden Sonraki Bir Dakika Saati',category:'trinket',themes:['sacred','cursed'],effect:'Long rest başına 1 kez, 30 ft içinde bir yaratık öldüğünde reaction ile çalıştırılır. O yaratığın ruhu varsa 1 dakika görünür ve konuşabilir; dirilmez, hareket edemez ve cevap vermeye zorlanmaz. Süre sonunda ruh normal yoluna devam eder.',activation:'Reaction',uses:'1/long rest'},
    {name:'Kayıp Şehrin Sokak Lambası',category:'tool',size:'large',themes:['arcane','noble'],effect:'Action ile bir saat yakılır. Işığında, 120 ft içindeki yıkılmış yolların ve yapıların son sağlam hâllerinin saydam hatları görünür. Gizli oda yalnız yapının parçasıysa belirir; içerik, yaratık veya tuzak göstermez.',activation:'Action',uses:'1/gün'},
    {name:'Dünyanın Son Hanına Ait Anahtar',category:'trinket',themes:['arcane','noble'],effect:'7 günde 1 kez action ile uygun bir kapıda çevrilir. Kapı 1 saat boyunca güvenli, boş ve büyüsüz bir han odasına açılır; en fazla sekiz yaratık girebilir. Odadan çıkarılan eşya kapıda küle dönüşür; kapı kapanınca içeride kimse kalamaz.',activation:'Action',uses:'1/7 gün'},
    {name:'Bin Sesli Şenlik Fıçısı',category:'tool',size:'large',themes:['noble','arcane'],effect:'Ayda 1 kez açıldığında 60 ft alanda bir saat süren illüzyon müzik, ışık ve yüz kişiye yetecek alkolsüz içecek üretir. Gönüllü katılımcılar frightened condition’ı bitirmek için anında yeni save atabilir. İçecek alan dışına çıkarılınca su olur.',activation:'Action',uses:'1/ay'}
  ];

  const ARTIFACT_ITEMS=[
    {name:'İlk Cenazenin Çanı',category:'tool',size:'large',themes:['sacred','cursed'],effect:'Kampanyada yalnız DM onayıyla çalınır. Aynı düzlemde son bir yıl içinde ölmüş ve geri dönmek isteyen tek bir ruhun adını söyleyerek çalındığında ruhun bulunduğu düzleme giden bir görev yolu açar; doğrudan diriltmez. Çan her kullanımda dünyadan önemli bir hatırayı kalıcı olarak siler; bedeli DM seçer.',activation:'1 saatlik ritüel',uses:'Kampanya bedeliyle'},
    {name:'Bitmeyen Festival Şişesi',category:'trinket',themes:['arcane','noble'],effect:'Action ile açıldığında 300 ft yarıçapta gece göğünü zararsız ışıklarla doldurur ve herkesin kendi kültüründen tanıdığı müziği duymasını sağlar. Bir saat boyunca gönüllü yaratıklar charm ve frightened save’lerine avantaj alır. Şişe kapatılınca o bölgede bir yıl çalışmaz; savaş başlatmak etkisini herkes için bitirir.',activation:'Action',uses:'Bölge başına 1/yıl'}
  ];

  function weave(pools){
    const out=[];let index=0,remaining=pools.reduce((sum,pool)=>sum+pool.length,0);
    while(remaining){
      for(const pool of pools)if(index<pool.length){out.push(pool[index]);remaining--}
      index++;
    }
    return out;
  }

  function mundanePool(){
    const rows=[];
    for(const [prefix,lore] of MUNDANE_ORIGINS)for(const [name,category,size,themes,effect] of MUNDANE_BASES)rows.push({
      name:`${prefix} ${name}`,category,size,themes,rarity:'mundane',minLevel:1,
      effect:`${effect} ${lore} Mekanik bonus vermez; gündelik kullanım ve rol yapma eşyasıdır.`,
      note:'Sıradan gündelik eşya • Kuşanılamaz; açıklamasına göre kullanılabilir.',valueCopper:3+(rows.length%27),qtyMax:['consumable','component'].includes(category)?4:2,
      lootKind:'everyday',release:'v48',activation:category==='consumable'?'Yemek/içmek için action':'Açıklamaya göre',uses:category==='consumable'?'Tüketilir':'Tekrar kullanılabilir',consumable:category==='consumable'
    });
    return rows;
  }

  function commonPool(){
    const drinks=[];
    for(const [name,flavor,themes] of DRINK_BASES)for(const [quirk,effect] of DRINK_QUIRKS)drinks.push({
      name:`${name} — ${quirk}`,category:'consumable',size:'small',themes:[...themes,'alchemy'],rarity:'common',minLevel:1,
      effect:`Action ile içilir. ${flavor} ${effect} Tek kullanımlıktır.`,note:'Yaygın keyif içeceği • Etkisi açıklandığı kadar sürer; spell değildir.',
      valueCopper:35+(drinks.length%45),qtyMax:3,lootKind:'delightDrink',release:'v48',activation:'Action',uses:'Tek kullanım',consumable:true
    });
    const utilities=[];
    for(const [name,category,size,themes] of COMMON_UTILITY_BASES)for(const [power,effect,activation,uses] of COMMON_UTILITY_POWERS)utilities.push({
      name:`${power} ${name}`,category,size,themes,rarity:'common',minLevel:1,effect,note:'Yaygın gündelik büyülü eşya • Attunement gerekmez.',
      valueCopper:90+(utilities.length%110),qtyMax:1,lootKind:'utility',release:'v48',activation,uses
    });
    return weave([drinks,utilities]);
  }

  function uncommonPool(){
    const utilities=[];
    for(const [name,category,size,themes] of UNCOMMON_BASES)for(const [power,effect,activation,uses] of UNCOMMON_POWERS)utilities.push({
      name:`${power} ${name}`,category,size,themes,rarity:'uncommon',minLevel:2,effect,note:'Seyrek kullanışlı büyülü eşya • Etkinleştirme ve yenilenme açıklamadadır.',
      valueCopper:450+(utilities.length%350),qtyMax:1,lootKind:'utility',release:'v48',activation,uses
    });
    const consumables=UNCOMMON_CONSUMABLES.map(([name,effect,themes],index)=>({
      name,category:'consumable',size:'small',themes:[...themes,'alchemy'],rarity:'uncommon',minLevel:2,effect:`Action ile kullanılır. ${effect} Tek kullanımlıktır.`,
      note:'Seyrek tek kullanımlık gündelik yardımcı.',valueCopper:420+index*18,qtyMax:2,lootKind:'utility',release:'v48',activation:'Action',uses:'Tek kullanım',consumable:true
    }));
    return weave([utilities,consumables]);
  }

  function preparedSpecial(rows,rarity){
    return rows.map((row,index)=>({
      size:'small',minLevel:MIN_LEVEL[rarity],valueCopper:VALUE[rarity]+index*Math.max(1,Math.round(VALUE[rarity]*.04)),qtyMax:1,
      lootKind:'specialUtility',release:'v48',rarity,note:`${rarity==='veryRare'?'Çok nadir':rarity==='legendary'?'Efsanevi':rarity==='artifact'?'Artefakt':'Nadir'} özel kullanım eşyası • Sınırlar açıklamadadır.`,
      ...row
    }));
  }

  function buildLoot(add,context={}){
    const catalogue=context.catalogue||[];
    if(catalogue.some(item=>item?.release==='v48'))return;
    const names=new Set(catalogue.map(item=>String(item.name||'').toLocaleLowerCase('tr-TR')));
    const safeAdd=item=>{
      let record={...item},base=record.name,attempt=2;
      while(names.has(String(record.name).toLocaleLowerCase('tr-TR')))record.name=`${base} (${attempt++})`;
      names.add(String(record.name).toLocaleLowerCase('tr-TR'));add(record);
    };

    for(const spell of Array.isArray(root.V47_SPELLS)?root.V47_SPELLS:[])if(spell.materialTr)safeAdd(spellComponentItem(spell));

    const pools={
      mundane:mundanePool(),
      common:commonPool(),
      uncommon:uncommonPool(),
      rare:preparedSpecial(RARE_ITEMS,'rare'),
      veryRare:preparedSpecial(VERY_RARE_ITEMS,'veryRare'),
      legendary:preparedSpecial(LEGENDARY_ITEMS,'legendary'),
      artifact:preparedSpecial(ARTIFACT_ITEMS,'artifact')
    };

    for(const rarity of Object.keys(TARGETS)){
      let count=catalogue.reduce((sum,item)=>sum+(item.rarity===rarity?1:0),0),need=Math.max(0,TARGETS[rarity]-count),pool=pools[rarity]||[];
      if(pool.length<need)throw new Error(`v48 ${rarity} pool is short: ${pool.length}/${need}`);
      for(let index=0;index<need;index++)safeAdd(pool[index]);
    }

    const finalTotal=catalogue.length;
    if(finalTotal!==4000)throw new Error(`v48 loot catalogue must contain exactly 4000 records; got ${finalTotal}`);
  }

  root.V48_LOOT_TARGETS=TARGETS;
  root.V48_LOOT_KIND_LABELS=KIND_LABELS;
  root.V48_BUILD_LOOT=buildLoot;
})(typeof window!=='undefined'?window:globalThis);
