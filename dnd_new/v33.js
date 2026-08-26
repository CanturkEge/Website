/* v33: populated castle atlas and a deliberately simple map/editor split. */
const V33_SERVICE_DEFS={
  healer:'Şifacı',alchemist:'Simyacı',blacksmith:'Demirci',armorer:'Zırhçı',
  fletcher:'Okçu',general:'Genel Eşya',tavern:'Han / Bar',restaurant:'Restoran',
  mystic:'Gizemli Dükkân',cursed:'Lanetli Dükkân',stable:'Ahır',temple:'Tapınak'
};
const V33_DANGER={
  1:['Güvenli','#6fc58a'],2:['Düşük','#a7c96b'],3:['Orta','#e0ae55'],
  4:['Yüksek','#df795d'],5:['Ölümcül','#c94f59']
};
const V33_CASTLE_CONTENT=[
  {
    id:'map-castle-01',name:'Karaçam Hisarı',region:'Kadim Karaçam Ormanı',dangerTier:2,areaLevel:'1–3',
    summary:'Batı ormanının dev çamları arasına kurulmuş küçük bir avcı ve ormancı hisarı.',
    history:'Hisar, iki yüz yıl önce ormandan çıkan yaratıkları ovadan uzak tutmak için kuruldu. İlk komutanı Leydi Meral Karaçam kayıp bir av seferinden dönmedi; halk, ruhunun hâlâ kuzey kapısındaki feneri yaktığını söyler.',
    services:'Avcı pazarı, küçük bir revir, ok atölyesi, ortak yatakhane ve yol erzağı bulunur.',
    threat:'Duvarlar sağlam fakat garnizon küçüktür. Geceleri ormanın derinlerinden gelen çan sesleri devriyeleri tedirgin eder.',
    intel:'Hisarı Muhafızbaşı Orven yönetir. Kuzey kapısı gün batımında kapanır; ormancılar loncası kayıp avcılar için ödül vermektedir.',
    serviceTiers:{healer:1,alchemist:1,blacksmith:1,armorer:0,fletcher:2,general:1,tavern:1,restaurant:0,mystic:0,cursed:0,stable:1,temple:0},
    dungeonName:'Kökaltı Höyüğü',recommendedLevel:'2–3',monsters:'Dev örümcekler, iğne yaratıkları, goblin izciler ve uyanmış kökler.',
    dungeonNotes:'Eski bir druid mezarının üstü dev köklerle kapanmıştır. Dar geçitler, zehirli sporlar ve ay ışığında açılan taş bir kapı vardır.',
    dmNotes:'Kayıp Leydi Meral ölmedi; höyüğün kalbinde yarı bitki hâlinde mühürlüdür.'
  },
  {
    id:'map-castle-02',name:'Buzdiş Kalesi',region:'Akdoruk Sıradağları',dangerTier:4,areaLevel:'5–8',
    summary:'Karlı geçidi ve kuzey maden yolunu kontrol eden sert taş dağ kalesi.',
    history:'Buzdiş, cüce ustalar ile ova krallarının ortak yemininden doğdu. Yüz on yıl önceki Beyaz Fırtına’da üç ay kuşatma altında kaldı ve kapılarını hiç açmadı; kale halkı bu olayı her kış Sessiz Nöbet ile anar.',
    services:'Güçlü demir ve zırh atölyeleri, sıcak bir dağ hanı ve sınırlı simya malzemesi bulunur; düzenli şifacı yoktur.',
    threat:'Çığlar, buz köprüleri ve dağ trolleri yaklaşımı zorlaştırır. Garnizon seçkin fakat ikmal yolu kırılgandır.',
    intel:'Kale lordu Dagna Taşkıran, kayıp maden işçileri yüzünden dışarıdan maceracı aramaktadır. Eski maden asansörü geceleri kendiliğinden çalışır.',
    serviceTiers:{healer:0,alchemist:1,blacksmith:3,armorer:3,fletcher:1,general:1,tavern:1,restaurant:0,mystic:0,cursed:0,stable:0,temple:1},
    dungeonName:'Donmuş Damar Madenleri',recommendedLevel:'6–8',monsters:'Duergar yağmacılar, buz mephitleri, tünel solucanları ve genç remorhaz.',
    dungeonNotes:'Terk edilmiş gümüş damarları aşağıda kadim bir sıcak su mağarasına bağlanır. Donmuş vinçler ve çöken galeriler çevresel tehlikedir.',
    dmNotes:'Madenin en altındaki yumurta çatlamak üzeredir; genç remorhaz henüz tam gücünde değildir.'
  },
  {
    id:'map-castle-03',name:'Kültaç Hisarı',region:'Kor Dağı',dangerTier:5,areaLevel:'8–12',
    summary:'Sönmemiş volkanın siyah kayalıklarına zincirlenmiş ürkütücü bir sınır kalesi.',
    history:'Kültaç, eski ateş rahiplerinin mabedi üzerine inşa edildi. Kırk yıl önce lav kanalları açıldığında kale yanmadı; bunun üzerine hanedan, dağı koruyucu ilan etti fakat askerlerin çoğu kalenin geceleri nefes aldığını düşünür.',
    services:'Usta silah ve ağır zırh işçiliği vardır; yiyecek, şifa ve binek hizmetleri çok sınırlıdır.',
    threat:'Zehirli duman, lav yarıkları ve ateşe dayanıklı yaratıklar bölgeyi ölümcül kılar. İç garnizon disiplinlidir ama fanatiktir.',
    intel:'Hisarı Mareşal Varkan yönetir. Alt sarnıçlara giriş yasaktır; son ay içinde üç mahkûm iz bırakmadan kaybolmuştur.',
    serviceTiers:{healer:0,alchemist:2,blacksmith:3,armorer:3,fletcher:0,general:1,tavern:0,restaurant:0,mystic:0,cursed:0,stable:0,temple:1},
    dungeonName:'Kor Zindanı',recommendedLevel:'9–11',monsters:'Ateş elementalleri, magminler, salamander muhafızları ve alev kültistleri.',
    dungeonNotes:'Volkanın kalbine inen zincirli hücreler üç mühürle kapalıdır. Her mühür kırıldığında sıcaklık ve ateş hasarı artar.',
    dmNotes:'Son hücrede hapsedilen şey bir iblis değil, kaleyi ayakta tutan yaralı ateş devidir.'
  },
  {
    id:'map-castle-04',name:'Sisardı Kalesi',region:'Fısıltı Çamlıkları',dangerTier:3,areaLevel:'3–6',
    summary:'Doğu çamlıklarının sisli tepelerinde kaybolup yeniden beliren gözcü kalesi.',
    history:'Sisardı, doğu yolundaki akınları haber vermek için yedi fener kulesinden biri olarak başladı. Diğer altı kule yıkıldı; yalnız Sisardı’nın mavi feneri hâlâ sis içinden görünür.',
    services:'İyi okçular, av malzemeleri, küçük şifacı ve yolculara açık bir han vardır.',
    threat:'Yoğun sis görüşü kısıtlar; yanlış patika yolcuları peri çemberlerine veya kurt sürülerine götürebilir.',
    intel:'Kale yöneticisi Elyra Vens, doğudaki eski kulelerden gelen ışık mesajlarını araştıracak kişiler arıyor.',
    serviceTiers:{healer:1,alchemist:1,blacksmith:1,armorer:1,fletcher:3,general:2,tavern:1,restaurant:0,mystic:0,cursed:0,stable:1,temple:0},
    dungeonName:'Yankısız Mağara',recommendedLevel:'4–6',monsters:'Dire wolf sürüsü, karanlık mantarlar, ettercap ve yankı taklitçisi.',
    dungeonNotes:'Mağarada sesler birkaç dakika gecikmeyle geri döner. Yanlış yankıyı takip edenler döngüye giren tünellere düşer.',
    dmNotes:'Mavi fener mesajları eski bir peri elçisinden geliyor; saldırı uyarısı değil yardım çağrısıdır.'
  },
  {
    id:'map-castle-05',name:'Taçova Kalesi',region:'Altınova Ovası',dangerTier:1,areaLevel:'1–4',
    summary:'Krallığın yollarının birleştiği, kalabalık pazarı ve altın renkli surlarıyla bilinen merkez kalesi. Grup şu anda buradadır.',
    history:'Taçova, üç küçük krallığın savaşını bitiren Ova Yemini’nin imzalandığı yerde kuruldu. Kale avlusundaki kırık taç anıtına göre hiçbir hükümdar ovaya tek başına sahip olamaz. Bugün kervanlar, loncalar ve maceracılar için bölgenin en güvenli başlangıç noktasıdır.',
    services:'Orta seviye şifacı, simyacı, demirci ve zırhçı; genel pazar, hanlar, restoranlar, ahırlar ve büyük bir tapınak hizmet verir.',
    threat:'Kale içinde açık tehdit düşüktür. Dış mahallelerde yankesiciler, kaçakçılar ve gece kanalizasyonundan çıkan küçük yaratıklar görülür.',
    intel:'Kale Naibi Selene Arvend tarafından yönetilir. Maceracılar Loncası ana meydandadır; kuzey kapısı madene, doğu kapısı nehir yoluna çıkar. Son günlerde eski su kemerinden metalik sesler gelmektedir.',
    serviceTiers:{healer:2,alchemist:2,blacksmith:2,armorer:2,fletcher:1,general:2,tavern:2,restaurant:2,mystic:0,cursed:0,stable:2,temple:2},
    dungeonName:'Eski Su Kemerleri',recommendedLevel:'2–4',monsters:'Dev sıçanlar, gri ooze, haydut kaçakçılar ve zayıf bir mimic.',
    dungeonNotes:'Giriş doğu sarnıcının altında gizlidir. Sular yükselip alçalır; paslı kapakların bazıları eski saray tünellerine açılır.',
    dmNotes:'Kaçakçılar yalnızca paravan; su kemerindeki ooze büyümesini biri şehir içinden besliyor.',
    initialPlayerLocation:true
  },
  {
    id:'map-castle-06',name:'Üçköprü Hisarı',region:'Gümüşçay Geçidi',dangerTier:2,areaLevel:'2–5',
    summary:'Üç taş köprünün birleştiği yerde nehir vergisini ve doğu ticaretini koruyan canlı bir hisar.',
    history:'Hisar, Büyük Sel’den sonra tek gecede kurulan ahşap tahkimatın yerine yapıldı. Köprülerin altındaki kurucu taşlarda işçi isimleri kazılıdır; isimlerden biri her yıl kendiliğinden silinir.',
    services:'Ticaret pazarı, han, ahır, temel demirci, şifacı ve nehir taşımacılığı bulunur.',
    threat:'Nehir kabardığında alt mahalleler su altında kalır. Köprü altında yaşayan haraç çeteleri ve su yaratıkları sorun çıkarır.',
    intel:'Vergi memuru Halvek ile köprü muhafızları birbirini yolsuzlukla suçluyor. Kayıp kervan malları gece tünellerinden taşınıyor.',
    serviceTiers:{healer:1,alchemist:0,blacksmith:2,armorer:1,fletcher:1,general:2,tavern:2,restaurant:1,mystic:0,cursed:0,stable:2,temple:1},
    dungeonName:'Batık Geçişler',recommendedLevel:'3–5',monsters:'Sahuagin izcileri, dev kurbağalar, haydutlar ve su yosunu yaratıkları.',
    dungeonNotes:'Köprü ayaklarının içinde eski vergi kasalarına açılan su dolu tüneller vardır. Akıntı turdan tura yön değiştirebilir.',
    dmNotes:'Silinen isimler, nehir ruhuna verilen unutulmuş işçi borcunun göstergesidir.'
  },
  {
    id:'map-castle-07',name:'Gümüşgöl Şatosu',region:'Aynalı Göl',dangerTier:3,areaLevel:'4–7',
    summary:'Sakin gölün ortasındaki kayalık adaya kurulmuş zarif fakat içine kapanık bir şato.',
    history:'Şato, gölde boğulan Prenses Liora’nın anısına yapıldı. Her dolunayda göl yüzeyinde ikinci bir şatonun yansıması belirir; balıkçılar yansımanın asıl yapı olduğunu iddia eder.',
    services:'Kaliteli şifacı ve simyacı, iyi restoran, küçük pazar ve göl kayıkçıları vardır; ağır silah üretimi yoktur.',
    threat:'Göl geceleri yön duygusunu bozar. Su altından gelen şarkılar ve kaybolan kayıklar halkı korkutmaktadır.',
    intel:'Şato Vekili Armand, prensesin mezar odasına girilmesini yasakladı. Mutfak mahzenindeki taş kapı son dolunayda açıldı.',
    serviceTiers:{healer:2,alchemist:2,blacksmith:0,armorer:1,fletcher:0,general:1,tavern:1,restaurant:2,mystic:0,cursed:0,stable:0,temple:2},
    dungeonName:'Aykuyu Katakompu',recommendedLevel:'5–7',monsters:'Boğulmuş zombiler, will-o-wisp, göl cadısı hizmetkârları ve su garipleri.',
    dungeonNotes:'Katakomp yalnız dolunay yansıması şatonun kapısıyla çakışınca açılır. Bazı odalar suyun altında ters yönde bulunur.',
    dmNotes:'Prenses Liora göl cadısına dönüşmedi; şatonun danışmanı onun adını kullanarak kurban topluyor.'
  },
  {
    id:'map-castle-08',name:'Fırtınaburnu Kalesi',region:'Batı Uçurumları',dangerTier:3,areaLevel:'3–6',
    summary:'Denize inen siyah uçurumun üzerine kurulmuş, feneri yüzlerce kilometreden görülen kıyı kalesi.',
    history:'Fırtınaburnu’nun feneri, korsan filosunu kayalıklara sürükleyen Amiral Yaren tarafından yakıldı. Amiral dönüş yolunda kayboldu; zırhı hâlâ kale salonunda boş bir tahtta durur.',
    services:'Liman pazarı, gemi malzemeleri, orta seviye demirci ve zırhçı, denizci hanları ve temel şifa bulunur.',
    threat:'Şiddetli rüzgâr, kaygan uçurum ve korsan gözcüleri yaklaşımı tehlikeli kılar.',
    intel:'Liman komutanı son üç geminin aynı gecede kaybolduğunu saklıyor. Eski fener merdiveninde tuzlu ayak izleri görülüyor.',
    serviceTiers:{healer:1,alchemist:1,blacksmith:2,armorer:2,fletcher:1,general:2,tavern:2,restaurant:1,mystic:0,cursed:0,stable:0,temple:1},
    dungeonName:'Kaçakçı Yarığı',recommendedLevel:'4–6',monsters:'Korsanlar, harpyler, reef shark ve mağara mimicleri.',
    dungeonNotes:'Uçurumdaki dar yarık gelgitte kapanır. İçeride ip köprüler, barut fıçıları ve denize açılan gizli iskele bulunur.',
    dmNotes:'Kayıp gemiler korsan işi değil; Amiral Yaren’in boş zırhı geceleri fenerden sinyal veriyor.'
  },
  {
    id:'map-castle-09',name:'Kızılkapı Kalesi',region:'Kızılbozkır Sınırı',dangerTier:4,areaLevel:'6–9',
    summary:'Taş ovanın kızıl kumlara dönüştüğü sınırda kervanları ve tek su kuyusunu koruyan kale.',
    history:'Kızılkapı, çölde kaybolan bir ordunun son sancak taşının çevresine inşa edildi. Sancak hiç çürümez; rüzgârsız gecelerde bile doğuyu gösterir.',
    services:'Güçlü simyacı, orta seviye silahçı ve pazar; sınırlı zırhçı, han ve ahır bulunur. Düzenli şifacı yoktur.',
    threat:'Kum fırtınaları, su kıtlığı, ankheg yuvaları ve çöl akıncıları dış bölgeyi tehlikeli yapar.',
    intel:'Kale kumandanı kuyu suyunun her gün azaldığını gizliyor. Güney kapısının altında yeni bir çatlak açıldı.',
    serviceTiers:{healer:0,alchemist:2,blacksmith:2,armorer:1,fletcher:1,general:2,tavern:1,restaurant:0,mystic:0,cursed:0,stable:2,temple:1},
    dungeonName:'Cam Mezarlar',recommendedLevel:'7–9',monsters:'Mumyalar, ankhegler, toz mephitleri ve kumdan yapılmış muhafızlar.',
    dungeonNotes:'Yıldırımın kuma vurmasıyla oluşmuş cam koridorlar güneşi içeride odaklar. Gündüz ateş, gece soğuk tehlikesi vardır.',
    dmNotes:'Kuyuyu tüketen mezarlar değil; kalenin simyacısı yeraltı suyunu gizli deneylerinde kullanıyor.'
  },
  {
    id:'map-castle-10',name:'Tuzhisar',region:'Kırıkadalar Geçidi',dangerTier:2,areaLevel:'2–5',
    summary:'Taş bir köprüyle karaya bağlı küçük ada kalesi; balıkçıların ve tuz tüccarlarının uğrak yeridir.',
    history:'Tuzhisar eskiden korsan hapishanesiydi. Mahkûmlar özgürlüklerini satın almak için adanın altındaki tuz damarlarında çalıştı; bazı hücre kapıları hâlâ deniz çekildiğinde görünür.',
    services:'Genel pazar, balık restoranı, han, temel şifacı ve küçük tekne tamiri vardır.',
    threat:'Gelgit köprüyü kesebilir. Kaçakçılar ve kıyı yaratıkları dışında kale çevresi görece güvenlidir.',
    intel:'Ada reisi Mera Dalgakıran, eski hapishane defterinin çalındığını söylüyor. Köprünün altındaki zincir geceleri geriliyor.',
    serviceTiers:{healer:1,alchemist:0,blacksmith:1,armorer:0,fletcher:0,general:2,tavern:2,restaurant:2,mystic:0,cursed:0,stable:0,temple:1},
    dungeonName:'Boğuk Nöbet',recommendedLevel:'3–5',monsters:'Boğulmuş haydutlar, giant crab, swarm of quippers ve specter.',
    dungeonNotes:'Eski hücreler yalnız alçak gelgitte erişilebilir. Su yükseldiğinde çıkış rotası tamamen değişir.',
    dmNotes:'Çalınan defter, bugün saygın tüccar olan eski korsan ailelerinin isimlerini içeriyor.'
  },
  {
    id:'map-castle-11',name:'Ayhalka Kalesi',region:'Güney Ay Adası',dangerTier:3,areaLevel:'5–8',
    summary:'Dairesel surları ayın evrelerine göre hizalanmış, rahipler ve denizcilerce kutsal sayılan ada kalesi.',
    history:'Ayhalka, denizin ortasında bulunan dev taş çemberin çevresinde büyüdü. Her tutulmada çemberin bir taşı eksilir ve şafakta geri döner; rahipler bunun dünyanın nefes alışverişi olduğunu söyler.',
    services:'Güçlü tapınak ve şifacı, iyi restoran, küçük simyacı ve temel pazar bulunur; silah üretimi sınırlıdır.',
    threat:'Ada sakin görünür fakat tutulma gecelerinde gölgeler bağımsız hareket eder. Deniz yolu fırtınaya açıktır.',
    intel:'Başrahibe Vaela, yaklaşan tutulma için yabancıların adadan ayrılmasını istedi. Genç rahiplerden biri çemberin altında bir kapı gördüğünü iddia ediyor.',
    serviceTiers:{healer:2,alchemist:1,blacksmith:1,armorer:0,fletcher:0,general:1,tavern:1,restaurant:2,mystic:0,cursed:0,stable:0,temple:3},
    dungeonName:'Gelgit Ayini Mahzeni',recommendedLevel:'6–8',monsters:'Shadow, specter, deniz spawnları ve ay ışığıyla güçlenen gargoyleler.',
    dungeonNotes:'Odaların kapıları ay evresine göre açılır. Yanlış sırada çevrilen taş halkalar odayı deniz suyuyla doldurur.',
    dmNotes:'Rahiplerin sakladığı kapı başka bir düzleme değil, adanın gelecekteki harabesine açılıyor.'
  },
  {
    id:'map-castle-12',name:'Sazlık Nöbeti',region:'Çürüksaz Bataklığı',dangerTier:4,areaLevel:'4–8',
    summary:'Bataklığın tek kuru taş adasına kurulmuş, ahşap kazıklarla ayakta duran izole sınır kalesi.',
    history:'Sazlık Nöbeti, yüz yıl önceki Yeşil Humma sırasında karantina kalesi olarak kullanıldı. Kapılarındaki siyah çizgiler ölenlerin sayısını gösterir; son haftalarda yeni çizgiler belirmeye başladı.',
    services:'Usta simyacı, temel şifacı ve küçük genel eşya noktası vardır. Düzenli han, restoran, zırhçı veya ahır bulunmaz.',
    threat:'Zehirli su, hastalık, bataklık gazı, dev böcekler ve görünmeyen çukurlar bölgeyi yüksek riskli yapar.',
    intel:'Nöbet komutanı Hadrik kimsenin gece sur dışına çıkmasına izin vermiyor. Simyacı kulübesine getirilen örneklerin bazıları içeriden kapıyı tırmalıyor.',
    serviceTiers:{healer:1,alchemist:3,blacksmith:0,armorer:0,fletcher:1,general:1,tavern:0,restaurant:0,mystic:0,cursed:0,stable:0,temple:0},
    dungeonName:'Çürükfen Yuvası',recommendedLevel:'5–7',monsters:'Giant crocodile yavruları, violet fungus, bullywuglar, venom slime ve shambling mound.',
    dungeonNotes:'Yuva bataklığın altında hava cepleriyle bağlanan çamur odalarından oluşur. Zehirli gaz açık alevle patlayabilir.',
    dmNotes:'Yeni karantina çizgilerini kalenin içindeki bir doppelganger çiziyor; paniği kullanarak örnekleri kaçıracak.'
  }
];

let v33MapCampaign=null;
let v33SelectedLocationId=null;
let v33EditMode=false;
let v33PlayerPreview=false;
let v33PlaceMode='';
let v33PendingPoint=null;
let v33MapZoom=100;
let v33SeedSaveCampaign=null;

function v33ServiceTiers(values={}){
  return Object.fromEntries(Object.keys(V33_SERVICE_DEFS).map(key=>[key,Math.max(0,Math.min(3,+values[key]||0))]));
}
function v33Blank(value){return value==null||(typeof value==='string'&&!value.trim())}
function v33EnsureMap(){
  let map=v32EnsureMap();
  if(v33MapCampaign!==current?.id){
    v33MapCampaign=current?.id||null;v33SelectedLocationId=null;v33EditMode=false;
    v33PlayerPreview=false;v33PlaceMode='';v33PendingPoint=null;v33MapZoom=100;
  }
  let changed=false;
  for(let seed of V33_CASTLE_CONTENT){
    let location=map.locations.find(row=>row.id===seed.id);
    if(!location)continue;
    for(let key of ['name','region','summary','history','services','threat','intel','dungeonName','recommendedLevel','monsters','dungeonNotes','dmNotes','areaLevel']){
      if(v33Blank(location[key])){location[key]=seed[key];changed=true}
    }
    if(location.dangerTier==null){location.dangerTier=seed.dangerTier;changed=true}
    if(!location.serviceTiers||typeof location.serviceTiers!=='object'){
      let legacyBlacksmith=Math.max(0,Math.min(3,+location.blacksmithTier||0));
      location.serviceTiers=v33ServiceTiers(seed.serviceTiers);
      if(legacyBlacksmith)location.serviceTiers.blacksmith=legacyBlacksmith;
      changed=true;
    }else{
      for(let service of Object.keys(V33_SERVICE_DEFS)){
        if(location.serviceTiers[service]==null){location.serviceTiers[service]=seed.serviceTiers[service]||0;changed=true}
      }
    }
    if(location.serviceTiers.mystic!==0){location.serviceTiers.mystic=0;changed=true}
    if(location.serviceTiers.cursed!==0){location.serviceTiers.cursed=0;changed=true}
    if(Number(location.blacksmithTier)!==Number(location.serviceTiers.blacksmith)){
      location.blacksmithTier=location.serviceTiers.blacksmith;changed=true;
    }
  }
  for(let location of map.locations){
    if(!location.serviceTiers||typeof location.serviceTiers!=='object'){
      location.serviceTiers=v33ServiceTiers();changed=true;
    }
    if(location.dangerTier==null){location.dangerTier=2;changed=true}
    if(v33Blank(location.areaLevel)){location.areaLevel='DM belirlemedi';changed=true}
  }
  if((+map.contentVersion||0)<1){
    let currentCastle=map.locations.find(row=>row.id==='map-castle-05');
    if(currentCastle){
      currentCastle.revealMap=true;currentCastle.revealMarker=true;
      currentCastle.revealHistory=true;currentCastle.revealIntel=true;
      currentCastle.revealDungeon=false;
    }
    map.partyLocationId='map-castle-05';
    map.contentVersion=1;changed=true;
  }
  if(!map.partyLocationId){map.partyLocationId='map-castle-05';changed=true}
  if(changed&&current?.role==='dm'&&v33SeedSaveCampaign!==current.id){
    v33SeedSaveCampaign=current.id;
    queueMicrotask(()=>{if(current?.id===v33SeedSaveCampaign)save()});
  }
  return map;
}

function v33LocationVisible(location){return !!(location?.revealMap&&location?.revealMarker)}
function v33Danger(location){return V33_DANGER[Math.max(1,Math.min(5,+location?.dangerTier||2))]||V33_DANGER[2]}
function v33MapMarkers(map,playerMode){
  return map.locations.map(location=>{
    if(playerMode&&!v33LocationVisible(location))return '';
    let selected=location.id===v33SelectedLocationId,currentHere=map.partyLocationId===location.id;
    let label=String(location.name||'').trim()||v32TypeName(location);
    return `<button class="v32-map-marker ${selected?'selected':''} ${location.fixedCastle?'castle':''} ${currentHere?'party-location':''}" style="left:${v32Percent(location.x)}%;top:${v32Percent(location.y)}%" data-v33-location="${esc(location.id)}" title="${esc(label)}" aria-label="${esc(label)}"><span>${v32Icon(location)}</span><small>${esc(label)}</small>${currentHere?'<b>●</b>':(!playerMode&&location.fixedCastle?`<b>${location.seedOrder}</b>`:'')}</button>`;
  }).join('');
}
function v33Switch(id,checked,label,sub=''){
  return `<label class="v33-switch"><input id="${id}" type="checkbox" ${checked?'checked':''}><i></i><span><b>${label}</b>${sub?`<small>${sub}</small>`:''}</span></label>`;
}
function v33ServiceGrid(location,showAll=true){
  let tiers=v33ServiceTiers(location.serviceTiers);
  return `<div class="v33-service-grid">${Object.entries(V33_SERVICE_DEFS).filter(([key])=>showAll||tiers[key]>0).map(([key,label])=>`<article class="${tiers[key]?'open':'closed'}"><span>${esc(label)}</span><b>${tiers[key]?`Tier ${tiers[key]}`:'Yok'}</b></article>`).join('')}</div>`;
}
function v33Locked(title,text){return `<section class="v33-locked"><b>⌁ ${title}</b><p>${text}</p></section>`}

function v33LocationCard(location,playerMode,map){
  if(!location)return `<section class="card v33-empty"><b>Haritada görünen bir kaleye dokun</b><p>Seçtiğin yerin bilinen bilgileri burada açılacak.</p></section>`;
  let dm=current.role==='dm'&&!playerMode,danger=v33Danger(location),isCurrent=map.partyLocationId===location.id;
  let historyOpen=dm||location.revealHistory,intelOpen=dm||location.revealIntel,dungeonOpen=dm||location.revealDungeon;
  return `<section class="card v33-location-card"><div class="v33-location-title"><span>${v32Icon(location)}</span><div><small>${esc(location.region||v32TypeName(location))}</small><h2>${esc(v32LocationName(location))}</h2><div class="v33-badges"><b style="--badge:${danger[1]}">${danger[0]}</b><b>Önerilen bölge seviyesi ${esc(location.areaLevel||'—')}</b>${isCurrent?'<b class="current">Parti burada</b>':''}</div></div>${dm?`<div class="v33-quick-controls">${v33Switch('v33QuickVisible',v33LocationVisible(location),'Oyuncuya göster','Sis + kale adı')}${v33Switch('v33QuickDiscover',!!location.revealIntel,'İçerisi keşfedildi','Dükkânlar ve istihbarat')}<button id="v33OpenEditor" class="primary">✎ Düzenle</button></div>`:''}</div>
  ${historyOpen?`<div class="v33-story"><p>${esc(location.summary||'Kısa tanım yok.')}</p><details ${playerMode?'open':''}><summary>Kalenin geçmişi</summary><p>${esc(location.history||'Geçmiş yazılmamış.')}</p></details></div>`:v33Locked('Geçmiş bilinmiyor','Kaleyi görmek yetmiyor; söylenti, kayıt veya yerel bilgi gerekiyor.')}
  ${intelOpen?`<div class="v33-inside"><div class="v33-section-head"><div><small>KEŞFEDİLEN İÇERİK</small><h3>Dükkânlar ve Hizmetler</h3></div></div>${v33ServiceGrid(location,true)}${location.services?`<p>${esc(location.services)}</p>`:''}${location.threat?`<p><b>Savunma / tehlike:</b> ${esc(location.threat)}</p>`:''}${location.intel?`<p><b>İstihbarat:</b> ${esc(location.intel)}</p>`:''}</div>`:v33Locked('İçerisi keşfedilmedi','Kaleye girmek veya güvenilir istihbarat toplamak gerekiyor.')}
  ${dungeonOpen?`<div class="v33-dungeon"><small>BAĞLI DUNGEON</small><h3>${esc(location.dungeonName||'Dungeon yok')}</h3><p><b>Önerilen seviye:</b> ${esc(location.recommendedLevel||'—')}</p>${location.monsters?`<p><b>Beklenen yaratıklar:</b> ${esc(location.monsters)}</p>`:''}${location.dungeonNotes?`<p>${esc(location.dungeonNotes)}</p>`:''}${dm&&!location.revealDungeon?'<span class="v33-dm-only">Oyuncuya henüz kapalı</span>':''}</div>`:v33Locked('Dungeon bilgisi keşfedilmedi','Giriş ve içerideki tehditler hakkında yeterli bilgi yok.')}
  ${dm&&location.dmNotes?`<details class="v33-dm-note"><summary>Yalnızca DM notu</summary><p>${esc(location.dmNotes)}</p></details>`:''}</section>`;
}

function v33MapPage(){
  let map=v33EnsureMap(),playerMode=current.role==='player'||v33PlayerPreview;
  let visible=map.locations.filter(location=>!playerMode||v33LocationVisible(location));
  let currentLocation=map.locations.find(row=>row.id===map.partyLocationId);
  if(!visible.some(row=>row.id===v33SelectedLocationId)){
    v33SelectedLocationId=visible.find(row=>row.id===map.partyLocationId)?.id||visible[0]?.id||null;
  }
  let selected=map.locations.find(row=>row.id===v33SelectedLocationId);
  let revealed=map.revealAll?map.locations.length:map.locations.filter(row=>row.revealMap).length;
  return `<div class="v33-map-page"><div class="v33-map-head"><div><span class="v26-kicker">KAMPANYA HARİTASI</span><h2>Kadim Dünya</h2><p>${playerMode?`Keşfedilen ${revealed} bölge görünüyor.`:`Grubun konumu: ${esc(currentLocation?.name||'Belirlenmedi')}`}</p></div>${current.role==='dm'?`<div class="v33-map-actions"><button id="v33EditToggle" class="${v33EditMode?'primary':'ghost'}">${v33EditMode?'✎ Kalem Açık':'✎ Kalem'}</button>${v33EditMode?'<button id="v33AddPoint" class="ghost">＋ Yeni Nokta</button>':''}<button id="v33PlayerPreview" class="${v33PlayerPreview?'primary':'ghost'}">${v33PlayerPreview?'DM Görünümü':'Oyuncu Önizleme'}</button></div>`:''}</div>
  ${v33PlaceMode||v33EditMode?`<div class="v33-tool-notice">${v33PlaceMode==='add'?'Yeni noktanın yerini haritada seç.':v33PlaceMode==='move'?'Taşınacak yeni yeri seç.':'Kalem açık: düzenlemek istediğin kaleye dokun.'}${v33PlaceMode?'<button id="v33CancelPlace" class="ghost">Vazgeç</button>':''}</div>`:''}
  <section class="card v32-map-card v33-map-card"><div class="v32-map-toolbar"><span>${map.locations.filter(row=>row.fixedCastle).length} kale • ${playerMode?visible.length+' görünen nokta':map.locations.length+' toplam nokta'}</span><div><button data-v33-zoom="-20" class="ghost">−</button><b>%${v33MapZoom}</b><button data-v33-zoom="20" class="ghost">＋</button></div></div><div class="v32-map-viewport"><div id="v33MapCanvas" class="v32-map-canvas ${v33PlaceMode?'placing':''}" style="width:${v33MapZoom}%"><img src="${V32_MAP_IMAGE}" alt="12 kaleli fantastik kampanya haritası" draggable="false">${v32RevealRings(map,playerMode)}${v32FogSvg(map,playerMode)}${v33MapMarkers(map,playerMode)}</div></div></section>${v33LocationCard(selected,playerMode,map)}</div>`;
}

function v33Input(id,label,value='',placeholder=''){
  return `<label>${label}<input id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`;
}
function v33Textarea(id,label,value='',placeholder=''){
  return `<label>${label}<textarea id="${id}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
}
function v33ServiceEditor(location){
  let tiers=v33ServiceTiers(location.serviceTiers);
  return `<div class="v33-service-editor">${Object.entries(V33_SERVICE_DEFS).map(([key,label])=>{
    let forbidden=location.fixedCastle&&(key==='mystic'||key==='cursed');
    return `<label class="${forbidden?'forbidden':''}"><span>${esc(label)}${forbidden?'<small>Kale içinde olmaz; ayrı harita noktası ekle.</small>':''}</span><select data-v33-service="${key}" ${forbidden?'disabled':''}>${[0,1,2,3].map(tier=>`<option value="${tier}" ${tiers[key]===tier?'selected':''}>${tier?'Tier '+tier:'Yok'}</option>`).join('')}</select></label>`;
  }).join('')}</div>`;
}
function v33EditorHtml(location,map){
  let danger=Math.max(1,Math.min(5,+location.dangerTier||2));
  return `<div class="v33-editor"><details open><summary>Kimlik, hikâye ve zorluk</summary><div class="v33-editor-body"><div class="v33-form-grid">${v33Input('v33EditName','Konum adı',location.name)}${v33Input('v33EditRegion','Bölge / diyar',location.region)}<label>Zorluk<select id="v33EditDanger">${Object.entries(V33_DANGER).map(([tier,row])=>`<option value="${tier}" ${+tier===danger?'selected':''}>${tier} — ${row[0]}</option>`).join('')}</select></label>${v33Input('v33EditAreaLevel','Önerilen bölge seviyesi',location.areaLevel,'Örn. 3–6')}</div>${v33Textarea('v33EditSummary','Kısa tanım',location.summary)}${v33Textarea('v33EditHistory','Geçmiş',location.history)}${v33Textarea('v33EditThreat','Savunma / tehlike',location.threat)}${v33Textarea('v33EditIntel','İçerisi ve istihbarat',location.intel)}</div></details>
  <details open><summary>Dükkânlar ve hizmet tierleri</summary><div class="v33-editor-body">${v33ServiceEditor(location)}${v33Textarea('v33EditServices','Hizmetlerin kısa açıklaması',location.services)}</div></details>
  <details><summary>Bağlı dungeon</summary><div class="v33-editor-body"><div class="v33-form-grid">${v33Input('v33EditDungeon','Dungeon adı',location.dungeonName)}${v33Input('v33EditDungeonLevel','Önerilen seviye',location.recommendedLevel)}</div>${v33Textarea('v33EditMonsters','Beklenen yaratıklar',location.monsters)}${v33Textarea('v33EditDungeonNotes','Dungeon yapısı ve tehlikeleri',location.dungeonNotes)}</div></details>
  <details><summary>Oyuncu görünürlüğü ve DM notu</summary><div class="v33-editor-body"><div class="v33-editor-switches">${v33Switch('v33EditMap',location.revealMap,'Arazi sisini kaldır')}${v33Switch('v33EditMarker',location.revealMarker,'Kale işaretini ve adını göster')}${v33Switch('v33EditHistoryOpen',location.revealHistory,'Geçmişi göster')}${v33Switch('v33EditIntelOpen',location.revealIntel,'İçerisi keşfedildi')}${v33Switch('v33EditDungeonOpen',location.revealDungeon,'Dungeon bilgisi keşfedildi')}</div>${v33Textarea('v33EditDmNotes','Yalnızca DM notu',location.dmNotes)}</div></details>
  <div class="v33-editor-actions"><button id="v33SaveEditor" class="primary">Değişiklikleri Kaydet</button><button id="v33SetPartyHere" class="ghost" ${map.partyLocationId===location.id?'disabled':''}>Partiyi Buraya Al</button><button id="v33MovePoint" class="ghost">Haritada Taşı</button>${location.fixedCastle?'':`<button id="v33DeletePoint" class="danger">Noktayı Sil</button>`}</div></div>`;
}
function v33OpenEditor(location){
  if(!location||current.role!=='dm')return;
  modal(`${v32LocationName(location)} — Düzenle`,v33EditorHtml(location,v33EnsureMap()));
  $('#modal')?.classList.add('v33-map-dialog');
}
function v33ReadEditor(location){
  location.name=$('#v33EditName')?.value.trim()||location.name;
  location.region=$('#v33EditRegion')?.value.trim()||'';
  location.dangerTier=Math.max(1,Math.min(5,+($('#v33EditDanger')?.value||2)));
  location.areaLevel=$('#v33EditAreaLevel')?.value.trim()||'';
  location.summary=$('#v33EditSummary')?.value.trim()||'';
  location.history=$('#v33EditHistory')?.value.trim()||'';
  location.threat=$('#v33EditThreat')?.value.trim()||'';
  location.intel=$('#v33EditIntel')?.value.trim()||'';
  location.services=$('#v33EditServices')?.value.trim()||'';
  location.serviceTiers=v33ServiceTiers(location.serviceTiers);
  document.querySelectorAll('[data-v33-service]').forEach(select=>{location.serviceTiers[select.dataset.v33Service]=Math.max(0,Math.min(3,+select.value||0))});
  if(location.fixedCastle){location.serviceTiers.mystic=0;location.serviceTiers.cursed=0}
  location.blacksmithTier=location.serviceTiers.blacksmith;
  location.dungeonName=$('#v33EditDungeon')?.value.trim()||'';
  location.recommendedLevel=$('#v33EditDungeonLevel')?.value.trim()||'';
  location.monsters=$('#v33EditMonsters')?.value.trim()||'';
  location.dungeonNotes=$('#v33EditDungeonNotes')?.value.trim()||'';
  location.dmNotes=$('#v33EditDmNotes')?.value.trim()||'';
  location.revealMap=!!$('#v33EditMap')?.checked;
  location.revealMarker=!!$('#v33EditMarker')?.checked;
  location.revealHistory=!!$('#v33EditHistoryOpen')?.checked;
  location.revealIntel=!!$('#v33EditIntelOpen')?.checked;
  location.revealDungeon=!!$('#v33EditDungeonOpen')?.checked;
}

dmPages.map=v33MapPage;
playerPages.map=()=>typeof sessionPending==='function'&&sessionPending()?sessionPendingPage():v33MapPage();
const v33RenderBase=render;
render=function(){if(current)v33EnsureMap();return v33RenderBase()};

document.addEventListener('click',event=>{
  let button=event.target.closest('button');
  if(!button||!current)return;
  let map=v33EnsureMap();
  if(button.dataset.v33Location){
    v33SelectedLocationId=button.dataset.v33Location;
    let location=map.locations.find(row=>row.id===v33SelectedLocationId);
    if(current.role==='dm'&&v33EditMode)v33OpenEditor(location);else render();
    return;
  }
  if(button.dataset.v33Zoom){v33MapZoom=Math.max(80,Math.min(220,v33MapZoom+(+button.dataset.v33Zoom||0)));render();return}
  if(button.id==='v33EditToggle'){v33EditMode=!v33EditMode;v33PlayerPreview=false;v33PlaceMode='';render();return}
  if(button.id==='v33PlayerPreview'){v33PlayerPreview=!v33PlayerPreview;v33EditMode=false;v33PlaceMode='';render();return}
  if(button.id==='v33AddPoint'){v33PlaceMode='add';render();return}
  if(button.id==='v33CancelPlace'){v33PlaceMode='';v33PendingPoint=null;render();return}
  if(button.id==='v33OpenEditor'){
    v33OpenEditor(map.locations.find(row=>row.id===v33SelectedLocationId));return;
  }
  if(button.id==='v33SaveEditor'){
    let location=map.locations.find(row=>row.id===v33SelectedLocationId);if(!location)return;
    v33ReadEditor(location);$('#modal')?.close();save();render();toast('Kale bilgileri kaydedildi');return;
  }
  if(button.id==='v33SetPartyHere'){
    let location=map.locations.find(row=>row.id===v33SelectedLocationId);if(!location)return;
    map.partyLocationId=location.id;location.revealMap=true;location.revealMarker=true;location.revealHistory=true;
    $('#modal')?.close();save();render();toast('Parti konumu güncellendi');return;
  }
  if(button.id==='v33MovePoint'){$('#modal')?.close();v33PlaceMode='move';render();return}
  if(button.id==='v33DeletePoint'){
    let location=map.locations.find(row=>row.id===v33SelectedLocationId);
    if(!location||location.fixedCastle||!confirm(`${v32LocationName(location)} silinsin mi?`))return;
    map.locations=map.locations.filter(row=>row.id!==location.id);v33SelectedLocationId=null;$('#modal')?.close();save();render();return;
  }
  if(button.id==='v33ConfirmNewPoint'){
    if(!v33PendingPoint)return;
    let kind=$('#v33NewKind')?.value||'landmark',name=$('#v33NewName')?.value.trim()||'İsimsiz Nokta';
    let location={id:uid(),fixedCastle:false,kind,x:v33PendingPoint.x,y:v33PendingPoint.y,radius:7,name,region:'',summary:'',history:'',services:'',serviceTiers:v33ServiceTiers(),dangerTier:2,areaLevel:'DM belirlemedi',threat:'',intel:'',dungeonName:'',recommendedLevel:'',monsters:'',dungeonNotes:'',dmNotes:'',revealMap:false,revealMarker:false,revealHistory:false,revealIntel:false,revealDungeon:false};
    map.locations.push(location);v33SelectedLocationId=location.id;v33PendingPoint=null;v33PlaceMode='';save();v33OpenEditor(location);return;
  }
},true);

document.addEventListener('change',event=>{
  if(!current||current.role!=='dm')return;
  let map=v33EnsureMap(),location=map.locations.find(row=>row.id===v33SelectedLocationId);
  if(!location)return;
  if(event.target.id==='v33QuickVisible'){
    let open=event.target.checked;location.revealMap=open;location.revealMarker=open;
    if(open)location.revealHistory=true;save();render();return;
  }
  if(event.target.id==='v33QuickDiscover'){
    location.revealIntel=event.target.checked;
    if(event.target.checked){location.revealMap=true;location.revealMarker=true;location.revealHistory=true}
    save();render();return;
  }
},true);

document.addEventListener('click',event=>{
  let canvas=event.target.closest('#v33MapCanvas');
  if(!canvas||event.target.closest('[data-v33-location]')||current?.role!=='dm'||!v33PlaceMode)return;
  let point=v32MapPointFromEvent(event,canvas),map=v33EnsureMap();
  if(v33PlaceMode==='move'){
    let location=map.locations.find(row=>row.id===v33SelectedLocationId);if(!location)return;
    location.x=point.x;location.y=point.y;v33PlaceMode='';save();render();toast('Harita noktası taşındı');return;
  }
  v33PendingPoint=point;
  modal('Yeni Harita Noktası',`<label>Tür<select id="v33NewKind">${Object.entries(V32_MAP_TYPES).filter(([key])=>key!=='castle').map(([key,name])=>`<option value="${key}">${esc(name)}</option>`).join('')}</select></label>${v33Input('v33NewName','Konum adı')}<button id="v33ConfirmNewPoint" class="primary">Noktayı Oluştur</button>`);
});

$('#modal')?.addEventListener('close',()=>$('#modal')?.classList.remove('v33-map-dialog'));
if(current)render();
