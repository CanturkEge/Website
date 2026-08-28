/* v52: canonical 2014-era Cleric domains, progression and curated deity choices. */
(()=>{
  'use strict';

  const v52Domain=(id,name,icon,source,role,spells,features,options={})=>Object.freeze({
    id,name,icon,source,role,spells:Object.freeze(spells.map(row=>Object.freeze(row.slice()))),
    features:Object.freeze(features.map(row=>Object.freeze({...row}))),
    dmApproval:!!options.dmApproval,core2014:!!options.core2014,
    note:options.note||''
  });

  const domains={
    Knowledge:v52Domain('Knowledge','Bilgi','⌘','Player’s Handbook (2014)','Araştırma, dil, kehanet ve bilgi uzmanlığı',[
      [1,'Command','Identify'],[3,'Augury','Suggestion'],[5,'Nondetection','Speak with Dead'],[7,'Arcane Eye','Confusion'],[9,'Legend Lore','Scrying']
    ],[
      {level:1,name:'Blessings of Knowledge',kind:'Pasif / seçim',action:'—',uses:'Sürekli',summary:'İki ek dil öğren; Arcana, History, Nature ve Religion arasından iki proficiency seç ve bu iki check için proficiency bonusunu iki kez kullan.'},
      {level:2,name:'Channel Divinity: Knowledge of the Ages',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',duration:'10 dakika',summary:'Bir skill veya tool seç; süre boyunca o seçimde proficient sayılırsın.'},
      {level:6,name:'Channel Divinity: Read Thoughts',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'60 ft',duration:'1 dakika',save:'WIS',summary:'Başarısız save’de hedefin yüzey düşüncelerini okursun. Süre içinde action ile okumayı bitirip slot harcamadan Suggestion yaparsın ve hedef save’i otomatik kaybeder; ilk save başarılıysa uzun dinlenmeye kadar aynı hedefte yeniden deneyemezsin.'},
      {level:8,name:'Potent Spellcasting',kind:'Hasar buffı',action:'Pasif',uses:'Her uygun isabet',summary:'Cleric cantrip hasarına WIS modifierını ekle.'},
      {level:17,name:'Visions of the Past',kind:'Kehanet',action:'1 dakika odaklanma',uses:'Kısa veya uzun dinlenmede 1',summary:'Dokunduğun nesnenin önceki sahibine ya da bulunduğun yerin yakın geçmişine dair DM’nin verdiği görüntüler alırsın.'}
    ],{core2014:true}),

    Life:v52Domain('Life','Yaşam','✚','Player’s Handbook (2014) / Basic Rules','İyileştirme, dayanıklılık ve grubu ayakta tutma',[
      [1,'Bless','Cure Wounds'],[3,'Lesser Restoration','Spiritual Weapon'],[5,'Beacon of Hope','Revivify'],[7,'Death Ward','Guardian of Faith'],[9,'Mass Cure Wounds','Raise Dead']
    ],[
      {level:1,name:'Bonus Proficiency',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Heavy armor proficiency kazanırsın.'},
      {level:1,name:'Disciple of Life',kind:'İyileştirme buffı',action:'Büyüyle birlikte',uses:'Her uygun büyü',summary:'1. seviye veya üstü bir büyüyle HP yenilediğinde hedef ayrıca 2 + kullanılan spell seviyesi kadar HP kazanır.'},
      {level:2,name:'Channel Divinity: Preserve Life',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft',summary:'Toplam Cleric seviyenin 5 katı HP’yi seçtiğin canlılara dağıt; kimseyi maksimum HP’sinin yarısının üstüne çıkaramaz, undead ve construct etkilenmez.'},
      {level:6,name:'Blessed Healer',kind:'Kendini iyileştirme',action:'Büyüyle birlikte',uses:'Her uygun büyü',summary:'Başka bir canlıyı 1. seviye veya üstü büyüyle iyileştirdiğinde sen de 2 + spell seviyesi HP kazanırsın.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 radiant hasar ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Supreme Healing',kind:'İyileştirme buffı',action:'Pasif',uses:'Her iyileştirme büyüsü',summary:'Bir büyünün iyileştirme zarlarını atmak yerine her zarı maksimum sonucu vermiş say.'}
    ],{core2014:true}),

    Light:v52Domain('Light','Işık','☀','Player’s Handbook (2014)','Ateş/radiant baskısı, görüş ve savunma',[
      [1,'Burning Hands','Faerie Fire'],[3,'Flaming Sphere','Scorching Ray'],[5,'Daylight','Fireball'],[7,'Guardian of Faith','Wall of Fire'],[9,'Flame Strike','Scrying']
    ],[
      {level:1,name:'Bonus Cantrip',kind:'Cantrip',action:'—',uses:'Sınırsız',summary:'Light cantripini bilmiyorsan öğrenirsin; Cleric cantripi sayılır.'},
      {level:1,name:'Warding Flare',kind:'Savunma',action:'Reaction',uses:'WIS modifierı kadar / uzun dinlenme (en az 1)',range:'30 ft',summary:'Görebildiğin bir yaratık sana saldırırken, isabet sonucu açıklanmadan önce saldırıya disadvantage ver; blinded bağışıklığı olan hedef etkilenmez.'},
      {level:2,name:'Channel Divinity: Radiance of the Dawn',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft',save:'CON',summary:'Büyülü karanlığı dağıt; seçmediğin düşmanlar 2d10 + Cleric seviyesi radiant hasar alır, başarılı save yarıya indirir. Total cover korur.'},
      {level:6,name:'Improved Flare',kind:'Savunma',action:'Reaction',uses:'Warding Flare hakkı',range:'30 ft',summary:'Warding Flare’ı artık 30 ft içindeki görebildiğin bir müttefiğe yapılan saldırıya karşı da kullanabilirsin.'},
      {level:8,name:'Potent Spellcasting',kind:'Hasar buffı',action:'Pasif',uses:'Her uygun isabet',summary:'Cleric cantrip hasarına WIS modifierını ekle.'},
      {level:17,name:'Corona of Light',kind:'Aura',action:'Action',uses:'Etkinleştirme sınırsız',duration:'1 dakika',summary:'60 ft bright light ve ardından 30 ft dim light yayarsın; bright light içindeki düşmanlar fire veya radiant hasar veren büyülerine karşı save’leri disadvantage ile atar.'}
    ],{core2014:true}),

    Nature:v52Domain('Nature','Doğa','❧','Player’s Handbook (2014)','Bitki, hayvan, element ve ağır zırhlı doğa rahibi',[
      [1,'Animal Friendship','Speak with Animals'],[3,'Barkskin','Spike Growth'],[5,'Plant Growth','Wind Wall'],[7,'Dominate Beast','Grasping Vine'],[9,'Insect Plague','Tree Stride']
    ],[
      {level:1,name:'Acolyte of Nature',kind:'Proficiency / cantrip',action:'—',uses:'Sürekli',summary:'Bir Druid cantripi öğren; Animal Handling, Nature veya Survival arasından bir proficiency seç.'},
      {level:1,name:'Bonus Proficiency',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Heavy armor proficiency kazanırsın.'},
      {level:2,name:'Channel Divinity: Charm Animals and Plants',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft',save:'WIS',duration:'1 dakika',summary:'Görebilen her beast ve plant başarısız save’de charmed olur; hasar alınca etki o hedef için biter.'},
      {level:6,name:'Dampen Elements',kind:'Savunma',action:'Reaction',uses:'Sınırsız',range:'30 ft',summary:'Sen veya yakındaki bir yaratık acid, cold, fire, lightning ya da thunder hasarı alırken o hasar örneğine resistance ver.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'İsabete seçtiğin cold, fire veya lightning türünde +1d8 ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Master of Nature',kind:'Kontrol',action:'Bonus Action',uses:'Sınırsız',summary:'Channel Divinity özelliğinle charmed durumda tuttuğun beast ve plant yaratıkların her birine kendi turlarında ne yapacaklarını söyle.'}
    ],{core2014:true}),

    Tempest:v52Domain('Tempest','Fırtına','ϟ','Player’s Handbook (2014)','Yıldırım, gök gürültüsü, itme ve ön cephe',[
      [1,'Fog Cloud','Thunderwave'],[3,'Gust of Wind','Shatter'],[5,'Call Lightning','Sleet Storm'],[7,'Control Water','Ice Storm'],[9,'Destructive Wave','Insect Plague']
    ],[
      {level:1,name:'Bonus Proficiencies',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Martial weapon ve heavy armor proficiency kazanırsın.'},
      {level:1,name:'Wrath of the Storm',kind:'Karşı hasar',action:'Reaction',uses:'WIS modifierı kadar / uzun dinlenme (en az 1)',range:'5 ft',save:'DEX',summary:'Sana isabet eden yakındaki yaratık 2d8 lightning veya thunder hasar alır; başarılı save yarıya indirir.'},
      {level:2,name:'Channel Divinity: Destructive Wrath',kind:'Channel Divinity',action:'Hasarla birlikte',uses:'Channel Divinity havuzu',summary:'Lightning veya thunder hasarı zarlarını atmak yerine mümkün olan en yüksek sonucu kullan.'},
      {level:6,name:'Thunderbolt Strike',kind:'Kontrol',action:'Lightning hasarıyla',uses:'Her uygun hasar',summary:'Large veya daha küçük bir yaratığa lightning hasarı verdiğinde onu senden uzağa 10 ft itebilirsin.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 thunder ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Stormborn',kind:'Hareket',action:'Pasif',uses:'Sürekli',summary:'Yeraltında veya kapalı bir yapının içinde değilken yürüyüş hızına eşit flying speed kazanırsın.'}
    ],{core2014:true}),

    Trickery:v52Domain('Trickery','Hile','◈','Player’s Handbook (2014)','Gizlilik, illüzyon, konum oyunu ve aldatma',[
      [1,'Charm Person','Disguise Self'],[3,'Mirror Image','Pass without Trace'],[5,'Blink','Dispel Magic'],[7,'Dimension Door','Polymorph'],[9,'Dominate Person','Modify Memory']
    ],[
      {level:1,name:'Blessing of the Trickster',kind:'Skill buffı',action:'Action',uses:'Yeniden kullanana kadar',duration:'1 saat',summary:'Kendin dışında istekli bir yaratığa Stealth checklerinde advantage ver.'},
      {level:2,name:'Channel Divinity: Invoke Duplicity',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',duration:'1 dakika / concentration',range:'30 ft yaratım; senden en fazla 120 ft',summary:'İllüzyon kopyası yarat; bonus action ile 30 ft hareket ettir. Büyüleri kopyanın alanından yapabilir, ikiniz hedefin 5 ft yakınındaysanız saldırıda advantage alırsın.'},
      {level:6,name:'Channel Divinity: Cloak of Shadows',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',duration:'Sonraki turun sonuna kadar',summary:'Invisible olursun; saldırı yapmak veya büyü atmak görünmezliği erken bitirir.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 poison ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Improved Duplicity',kind:'İllüzyon buffı',action:'Invoke Duplicity ile',uses:'Channel Divinity havuzu',summary:'Invoke Duplicity kullandığında bir yerine dört kopya yaratırsın; bonus action ile hepsini 30 ft hareket ettirebilirsin.'}
    ],{core2014:true}),

    War:v52Domain('War','Savaş','⚔','Player’s Handbook (2014)','Silah saldırısı, ağır zırh ve müttefik isabet desteği',[
      [1,'Divine Favor','Shield of Faith'],[3,'Magic Weapon','Spiritual Weapon'],[5,'Crusader’s Mantle','Spirit Guardians'],[7,'Freedom of Movement','Stoneskin'],[9,'Flame Strike','Hold Monster']
    ],[
      {level:1,name:'Bonus Proficiencies',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Martial weapon ve heavy armor proficiency kazanırsın.'},
      {level:1,name:'War Priest',kind:'Ek saldırı',action:'Bonus Action',uses:'WIS modifierı kadar / uzun dinlenme (en az 1)',summary:'Attack actionı ile saldırdıktan sonra bir silah saldırısı daha yap.'},
      {level:2,name:'Channel Divinity: Guided Strike',kind:'Saldırı buffı',action:'Attack roll sonrası',uses:'Channel Divinity havuzu',summary:'Kendi attack roll’una +10 ekle; zarı gördükten sonra fakat sonuç açıklanmadan önce seçebilirsin.'},
      {level:6,name:'Channel Divinity: War God’s Blessing',kind:'Müttefik buffı',action:'Reaction',uses:'Channel Divinity havuzu',range:'30 ft',summary:'Yakındaki bir yaratığın attack roll’una +10 ekle; zarı gördükten sonra fakat sonuç açıklanmadan önce seç.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine silahın türünde +1d8 ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Avatar of Battle',kind:'Direnç',action:'Pasif',uses:'Sürekli',summary:'Büyülü olmayan silahların bludgeoning, piercing ve slashing hasarına resistance kazanırsın.'}
    ],{core2014:true}),

    Death:v52Domain('Death','Ölüm','☠','Dungeon Master’s Guide (2014)','Necrotic hasar, ölüm büyüsü ve kötü kült/NPC teması',[
      [1,'False Life','Ray of Sickness'],[3,'Blindness/Deafness','Ray of Enfeeblement'],[5,'Animate Dead','Vampiric Touch'],[7,'Blight','Death Ward'],[9,'Antilife Shell','Cloudkill']
    ],[
      {level:1,name:'Bonus Proficiency',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Martial weapon proficiency kazanırsın.'},
      {level:1,name:'Reaper',kind:'Cantrip buffı',action:'Cantrip ile',uses:'Her uygun kullanım',summary:'Bir necromancy cantripi öğrenirsin. Tek hedefli necromancy cantripini, menzilde ve birbirine 5 ft yakın iki hedefe birden uygulayabilirsin.'},
      {level:2,name:'Channel Divinity: Touch of Death',kind:'Channel Divinity',action:'Melee isabetiyle',uses:'Channel Divinity havuzu',summary:'Yakın saldırı isabetine 5 + Cleric seviyenin 2 katı necrotic hasar ekle.'},
      {level:6,name:'Inescapable Destruction',kind:'Hasar buffı',action:'Pasif',uses:'Sürekli',summary:'Cleric büyülerin ve Channel Divinity ile verdiğin necrotic hasar, necrotic resistance’ı yok sayar.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 necrotic ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Improved Reaper',kind:'Büyü buffı',action:'Büyüyle',uses:'Her uygun büyü',summary:'1–5. seviye, tek hedefli necromancy büyüsünü menzilde ve birbirine 5 ft yakın iki hedefe uygulayabilirsin; tüketilen materyal her hedef için ayrıca gerekir.'}
    ],{dmApproval:true,note:'2014 DMG seçeneğidir; çoğu kullanım kötü NPC/kült içindir. Oyuncu karakter için DM onayı gerekir.'}),

    Arcana:v52Domain('Arcana','Gizem','✧','Sword Coast Adventurer’s Guide (2015)','Cleric ile Wizard büyüsünü birleştiren büyü uzmanı',[
      [1,'Detect Magic','Magic Missile'],[3,'Magic Weapon','Nystul’s Magic Aura'],[5,'Dispel Magic','Magic Circle'],[7,'Arcane Eye','Leomund’s Secret Chest'],[9,'Planar Binding','Teleportation Circle']
    ],[
      {level:1,name:'Arcane Initiate',kind:'Proficiency / cantrip',action:'—',uses:'Sürekli',summary:'Arcana proficiency ve iki Wizard cantripi kazanırsın; bu cantripler senin için Cleric cantripidir ve WIS kullanır.'},
      {level:2,name:'Channel Divinity: Arcane Abjuration',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft',save:'WIS',duration:'1 dakika',summary:'Bir celestial, elemental, fey veya fiend hedefi turn edersin. Lv5’ten sonra uygun düşük CR hedef başarısız save’de 1 dakika kendi düzlemine sürülür: Lv5 CR 1/2, Lv8 CR 1, Lv11 CR 2, Lv14 CR 3, Lv17 CR 4.'},
      {level:6,name:'Spell Breaker',kind:'Temizleme buffı',action:'İyileştirme büyüsüyle',uses:'Her uygun büyü',summary:'Bir müttefiğe 1. seviye veya üstü büyüyle HP verdiğinde, hedef üstündeki kullanılan slot seviyesini aşmayan bir büyüyü sona erdirebilirsin.'},
      {level:8,name:'Potent Spellcasting',kind:'Hasar buffı',action:'Pasif',uses:'Her uygun isabet',summary:'Cleric cantrip hasarına WIS modifierını ekle.'},
      {level:17,name:'Arcane Mastery',kind:'Büyü seçimi',action:'—',uses:'Domain spell olarak',summary:'Wizard listesinden 6., 7., 8. ve 9. seviyeden birer büyü seç; bunlar daima hazırlanmış domain spell olur.'}
    ],{note:'Resmî 5e 2014 kurallarıyla çalışan ek kitap domainidir; PHB 2014’ün yedi çekirdek domaininden biri değildir.'}),

    Forge:v52Domain('Forge','Ocak','⚒','Xanathar’s Guide to Everything (2017)','Zırh, silah, ateş direnci ve zanaat',[
      [1,'Identify','Searing Smite'],[3,'Heat Metal','Magic Weapon'],[5,'Elemental Weapon','Protection from Energy'],[7,'Fabricate','Wall of Fire'],[9,'Animate Objects','Creation']
    ],[
      {level:1,name:'Bonus Proficiencies',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Heavy armor ve smith’s tools proficiency kazanırsın.'},
      {level:1,name:'Blessing of the Forge',kind:'Ekipman buffı',action:'Uzun dinlenme sonunda',uses:'Aynı anda 1 eşya',duration:'Sonraki uzun dinlenmeye kadar',summary:'Büyülü olmayan bir zırha +1 AC veya silaha +1 attack ve damage ver; büyülü eşyayı etkileyemez.'},
      {level:2,name:'Channel Divinity: Artisan’s Blessing',kind:'Channel Divinity / üretim',action:'1 saatlik ritüel',uses:'Channel Divinity havuzu',summary:'Eşit değerde metal sererek 100 gp’yi aşmayan büyüsüz bir eşya üret: simple/martial silah, zırh, 10 mühimmat, tool seti veya metal içeren başka bir nesne.'},
      {level:6,name:'Soul of the Forge',kind:'Savunma buffı',action:'Pasif',uses:'Sürekli',summary:'Fire resistance kazan; heavy armor giyerken AC +1 al.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 fire ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Saint of Forge and Fire',kind:'Direnç',action:'Pasif',uses:'Sürekli',summary:'Fire damage bağışıklığı kazan; heavy armor giyerken büyülü olmayan saldırıların bludgeoning, piercing ve slashing hasarına resistance al.'}
    ],{note:'Resmî 5e 2014 kurallarıyla çalışan ek kitap domainidir; PHB 2014 çekirdek listesine sonradan eklenmiştir.'}),

    Grave:v52Domain('Grave','Mezar','⚱','Xanathar’s Guide to Everything (2017)','Ölüm eşiği, kritik engelleme ve doğal ölüm düzeni',[
      [1,'Bane','False Life'],[3,'Gentle Repose','Ray of Enfeeblement'],[5,'Revivify','Vampiric Touch'],[7,'Blight','Death Ward'],[9,'Antilife Shell','Raise Dead']
    ],[
      {level:1,name:'Circle of Mortality',kind:'İyileştirme buffı',action:'Büyüyle',uses:'Her uygun büyü',summary:'0 HP’deki hedefe iyileştirme büyüsü yaptığında iyileştirme zarlarını maksimum say. Spare the Dying öğrenir, 30 ft menzilden bonus action ile kullanırsın.'},
      {level:1,name:'Eyes of the Grave',kind:'Algı',action:'Action',uses:'WIS modifierı kadar / uzun dinlenme (en az 1)',range:'60 ft',duration:'Sonraki turun sonuna kadar',summary:'Total cover arkasında olmayan ve divinationdan korunmayan undead varlıkların yerini hissedersin; kimliğini öğrenmezsin.'},
      {level:2,name:'Channel Divinity: Path to the Grave',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft',duration:'Sonraki turun sonuna kadar',summary:'Bir hedefi lanetle; ona isabet eden sonraki saldırının bütün hasarına vulnerability uygula, sonra lanet biter.'},
      {level:6,name:'Sentinel at Death’s Door',kind:'Savunma',action:'Reaction',uses:'WIS modifierı kadar / uzun dinlenme (en az 1)',range:'30 ft',summary:'Sen veya yakındaki bir yaratığa yapılan critical hit’i normal isabete çevir.'},
      {level:8,name:'Potent Spellcasting',kind:'Hasar buffı',action:'Pasif',uses:'Her uygun isabet',summary:'Cleric cantrip hasarına WIS modifierını ekle.'},
      {level:17,name:'Keeper of Souls',kind:'İyileştirme',action:'Bir düşman öldüğünde',uses:'Turda 1',range:'60 ft',summary:'Görebildiğin düşman öldüğünde sen veya yakındaki bir müttefik, düşmanın Hit Die sayısı kadar HP yeniler; incapacitated iken çalışmaz.'}
    ],{note:'Death Domain ile aynı değildir: Grave ölümün doğal sınırını korur ve genellikle undead karşıtıdır.'}),

    Order:v52Domain('Order','Düzen','⚖','Guildmasters’ Guide to Ravnica (2018) / Tasha’s Cauldron of Everything (2020)','Komuta, ağır zırh ve müttefik reaction saldırıları',[
      [1,'Command','Heroism'],[3,'Hold Person','Zone of Truth'],[5,'Mass Healing Word','Slow'],[7,'Compulsion','Locate Creature'],[9,'Commune','Dominate Person']
    ],[
      {level:1,name:'Bonus Proficiencies',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Heavy armor proficiency; Intimidation veya Persuasion proficiency kazanırsın.'},
      {level:1,name:'Voice of Authority',kind:'Müttefik buffı',action:'Büyüyle',uses:'Her tur en fazla 1 hedef',summary:'Spell slot harcayan bir büyüyle müttefiği hedeflediğinde, hedeflerden biri reaction kullanıp senin seçtiğin bir yaratığa tek silah saldırısı yapabilir.'},
      {level:2,name:'Channel Divinity: Order’s Demand',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft',save:'WIS',duration:'Sonraki turun sonuna kadar',summary:'Seçtiğin yaratıklar başarısız save’de charmed olur; ayrıca elde tuttuklarını düşürmelerini emredebilirsin. Hasar etkiyi bitirir.'},
      {level:6,name:'Embodiment of the Law',kind:'Action ekonomisi',action:'Bonus Action büyü',uses:'WIS modifierı kadar / uzun dinlenme (en az 1)',summary:'Normalde action isteyen bir enchantment büyüsünü bonus action olarak at.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 psychic ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Order’s Wrath',kind:'Müttefik hasar buffı',action:'Divine Strike ile',uses:'Turda 1 işaret',duration:'Sonraki turunun başlangıcına kadar',summary:'Divine Strike vurduğun hedefi işaretle; bir müttefiğin sonraki silah isabeti +2d8 psychic verir ve işaret biter.'}
    ],{note:'Resmî 5e 2014 kurallarıyla çalışan ek kitap domainidir; PHB çekirdek domaini değildir.'}),

    Peace:v52Domain('Peace','Barış','☮','Tasha’s Cauldron of Everything (2020)','Bağ kurma, takım d4 desteği ve hasarı paylaşma',[
      [1,'Heroism','Sanctuary'],[3,'Aid','Warding Bond'],[5,'Beacon of Hope','Sending'],[7,'Aura of Purity','Otiluke’s Resilient Sphere'],[9,'Greater Restoration','Rary’s Telepathic Bond']
    ],[
      {level:1,name:'Implement of Peace',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Insight, Performance veya Persuasion arasından bir proficiency kazanırsın.'},
      {level:1,name:'Emboldening Bond',kind:'Takım buffı',action:'Action',uses:'Proficiency bonusu kadar / uzun dinlenme',range:'30 ft',duration:'10 dakika',summary:'Proficiency bonusun kadar gönüllü yaratığı bağla. Bağlı hedef, başka bağlı hedefin 30 ft yakınındayken turda bir attack, ability check veya save’e +1d4 ekleyebilir.'},
      {level:2,name:'Channel Divinity: Balm of Peace',kind:'Channel Divinity',action:'Action',uses:'Channel Divinity havuzu',summary:'Hızın kadar fırsat saldırısı tetiklemeden hareket et; bu hareket sırasında 5 ft yakınına geldiğin her yaratığı bir kez 2d6 + WIS kadar iyileştirebilirsin.'},
      {level:6,name:'Protective Bond',kind:'Hasar paylaşımı',action:'Reaction',uses:'Bağ sürerken',range:'30 ft',summary:'Bağlı bir yaratık hasar alacakken başka bağlı yaratık yanına ışınlanıp bütün hasarı kendi üstüne alabilir.'},
      {level:8,name:'Potent Spellcasting',kind:'Hasar buffı',action:'Pasif',uses:'Her uygun isabet',summary:'Cleric cantrip hasarına WIS modifierını ekle.'},
      {level:17,name:'Expansive Bond',kind:'Bağ buffı',action:'Pasif',uses:'Bağ sürerken',summary:'Bağ menzili 60 ft olur; Protective Bond ile başkasının hasarını üstlenen yaratık o hasara resistance kazanır.'}
    ],{note:'Resmî 5e 2014 kurallarıyla çalışan geç dönem domainidir; PHB çekirdek domaini değildir.'}),

    Twilight:v52Domain('Twilight','Alacakaranlık','☾','Tasha’s Cauldron of Everything (2020)','Gece görüşü, initiative desteği, geçici HP aurası ve uçuş',[
      [1,'Faerie Fire','Sleep'],[3,'Moonbeam','See Invisibility'],[5,'Aura of Vitality','Leomund’s Tiny Hut'],[7,'Aura of Life','Greater Invisibility'],[9,'Circle of Power','Mislead']
    ],[
      {level:1,name:'Bonus Proficiencies',kind:'Proficiency',action:'Pasif',uses:'Sürekli',summary:'Martial weapon ve heavy armor proficiency kazanırsın.'},
      {level:1,name:'Eyes of Night',kind:'Görüş buffı',action:'Action ile paylaşım',uses:'1 ücretsiz / uzun dinlenme; sonra spell slot',range:'Kendin 300 ft; paylaşım hedefi 10 ft',duration:'1 saat paylaşım',summary:'300 ft darkvision kazan. 10 ft içinde görebildiğin WIS modifierın kadar istekli yaratığa (en az 1) aynı görüşü 1 saat verebilirsin.'},
      {level:1,name:'Vigilant Blessing',kind:'Initiative buffı',action:'Action',uses:'Yeniden kullanana kadar',summary:'Dokunduğun yaratık bir sonraki initiative roll’unu advantage ile atar; kullanınca veya başka hedefe verince biter.'},
      {level:2,name:'Channel Divinity: Twilight Sanctuary',kind:'Channel Divinity / aura',action:'Action',uses:'Channel Divinity havuzu',range:'30 ft aura',duration:'1 dakika',summary:'Seninle hareket eden dim light küresi yarat. Bir yaratık turunu kürede bitirince ona 1d6 + Cleric seviyesi temporary HP ver veya üstündeki charmed/frightened durumlarından birini bitir.'},
      {level:6,name:'Steps of Night',kind:'Hareket',action:'Bonus Action',uses:'Proficiency bonusu kadar / uzun dinlenme',duration:'1 dakika',summary:'Dim light veya darkness içindeyken yürüyüş hızına eşit flying speed kazan.'},
      {level:8,name:'Divine Strike',kind:'Hasar buffı',action:'Silah isabetiyle',uses:'Turda 1',summary:'Silah isabetine +1d8 radiant ekle; Cleric 14’te +2d8 olur.'},
      {level:17,name:'Twilight Shroud',kind:'Aura buffı',action:'Pasif',uses:'Twilight Sanctuary sürerken',summary:'Twilight Sanctuary içindeki sen ve müttefiklerin half cover kazanır.'}
    ],{note:'Resmî 5e 2014 kurallarıyla çalışan geç dönem domainidir; PHB çekirdek domaini değildir.'})
  };

  const coreFeatures=Object.freeze([
    Object.freeze({level:1,name:'Spellcasting',kind:'Class',action:'Büyüye göre',uses:'Spell slot tablosu',summary:'WIS kullanırsın. Hazırlama sınırı Cleric seviyesi + WIS modifierı (en az 1); cantrip slot harcamaz, ritual için büyü hazırlanmış olmalıdır.'}),
    Object.freeze({level:1,name:'Divine Domain',kind:'Class',action:'Seçim',uses:'Bir kez; sonra DM',summary:'Tanrının portfolio alanlarından birini seçersin. Domain spellleri daima hazırlanır ve normal hazırlama sınırına sayılmaz.'}),
    Object.freeze({level:2,name:'Channel Divinity: Turn Undead',kind:'Class',action:'Action',uses:'Lv2: 1, Lv6: 2, Lv18: 3 / kısa veya uzun dinlenme',range:'30 ft',save:'WIS',duration:'1 dakika veya hasar alana kadar',summary:'Seni görüp duyabilen undead başarısız save’de kaçar; reaction kullanamaz, çoğunlukla Dash yapmak zorundadır.'}),
    Object.freeze({level:4,name:'Ability Score Improvement',kind:'Class',action:'Seçim',uses:'Lv4, 8, 12, 16, 19',summary:'Bir ability +2, iki ability +1 veya masada kullanılıyorsa feat seç; normal ability sınırı 20’dir.'}),
    Object.freeze({level:5,name:'Destroy Undead',kind:'Class',action:'Turn Undead ile',uses:'Channel Divinity havuzu',summary:'Turn Undead save’ini kaybeden düşük CR undead anında yok olur: Lv5 CR 1/2, Lv8 CR 1, Lv11 CR 2, Lv14 CR 3, Lv17 CR 4.'}),
    Object.freeze({level:10,name:'Divine Intervention',kind:'Class',action:'Action',uses:'Başarısızsa uzun dinlenme; başarılıysa 7 gün',summary:'d100 sonucu Cleric seviyene eşit veya düşükse DM uygun ilahi müdahaleyi belirler. Lv20’de zar atmadan otomatik başarılıdır.'})
  ]);

  const spellSlots=Object.freeze([
    null,
    [2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],
    [4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],
    [4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],
    [4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],
    [4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
  ].map(row=>row&&Object.freeze(row)));

  const domainTrToId=Object.freeze({Bilgi:'Knowledge',Yaşam:'Life',Işık:'Light',Doğa:'Nature',Fırtına:'Tempest',Hile:'Trickery',Savaş:'War',Ölüm:'Death'});
  const mainDeityIds=Object.freeze([
    'fr-auril','fr-azuth','fr-bane','fr-beshaba','fr-bhaal','fr-chauntea','fr-cyric','fr-eldath','fr-gond','fr-helm',
    'fr-ilmater','fr-kelemvor','fr-lathander','fr-loviatar','fr-malar','fr-mask','fr-mielikki','fr-myrkul','fr-mystra','fr-oghma',
    'fr-selune','fr-shar','fr-silvanus','fr-sune','fr-talona','fr-talos','fr-tempus','fr-torm','fr-tymora','fr-tyr'
  ]);
  const expandedDomains=Object.freeze({
    'fr-auril':['Twilight'],'fr-azuth':['Arcana'],'fr-bane':['Order'],'fr-bhaal':['Grave'],'fr-chauntea':['Nature','Peace'],
    'fr-cyric':['Death'],'fr-eldath':['Peace'],'fr-gond':['Forge'],'fr-helm':['Order','Twilight'],'fr-ilmater':['Peace'],
    'fr-kelemvor':['Grave'],'fr-lathander':['Peace'],'fr-loviatar':['Order'],'fr-malar':['War'],'fr-mielikki':['Life'],
    'fr-myrkul':['Grave'],'fr-mystra':['Arcana'],'fr-selune':['Twilight'],'fr-shar':['Twilight'],'fr-sune':['Peace'],
    'fr-talona':['Grave'],'fr-talos':['War'],'fr-torm':['Order'],'fr-tyr':['Order']
  });
  const fallbackNames=Object.freeze({
    'fr-auril':'Auril','fr-azuth':'Azuth','fr-bane':'Bane','fr-beshaba':'Beshaba','fr-bhaal':'Bhaal','fr-chauntea':'Chauntea','fr-cyric':'Cyric','fr-eldath':'Eldath','fr-gond':'Gond','fr-helm':'Helm',
    'fr-ilmater':'Ilmater','fr-kelemvor':'Kelemvor','fr-lathander':'Lathander','fr-loviatar':'Loviatar','fr-malar':'Malar','fr-mask':'Mask','fr-mielikki':'Mielikki','fr-myrkul':'Myrkul','fr-mystra':'Mystra','fr-oghma':'Oghma',
    'fr-selune':'Selûne','fr-shar':'Shar','fr-silvanus':'Silvanus','fr-sune':'Sune','fr-talona':'Talona','fr-talos':'Talos','fr-tempus':'Tempus','fr-torm':'Torm','fr-tymora':'Tymora','fr-tyr':'Tyr'
  });

  const deitySource=Array.isArray(window.V49_DEITIES)?window.V49_DEITIES:[];
  const mainDeities=mainDeityIds.map(id=>{
    const base=deitySource.find(row=>row.id===id)||{id,name:fallbackNames[id]||id,pantheon:'Unutulmuş Diyarlar',alignment:'N',alignmentLabel:'Nötr',domains:[],portfolio:'',symbol:'—'};
    const coreDomains=(base.domains||[]).map(name=>domainTrToId[name]).filter(Boolean);
    const compatibleDomains=[...new Set([...coreDomains,...(expandedDomains[id]||[])])].filter(name=>domains[name]);
    return Object.freeze({...base,coreDomains:Object.freeze(coreDomains),compatibleDomains:Object.freeze(compatibleDomains)});
  });

  Object.defineProperty(window,'V52_CLERIC_DOMAINS',{value:Object.freeze(domains),writable:false,configurable:false});
  Object.defineProperty(window,'V52_CLERIC_CORE_FEATURES',{value:coreFeatures,writable:false,configurable:false});
  Object.defineProperty(window,'V52_CLERIC_SPELL_SLOTS',{value:spellSlots,writable:false,configurable:false});
  Object.defineProperty(window,'V52_CLERIC_MAIN_DEITIES',{value:Object.freeze(mainDeities),writable:false,configurable:false});
  Object.defineProperty(window,'V52_CLERIC_META',{value:Object.freeze({rulesYear:2014,mainDeityCount:mainDeities.length,domainCount:Object.keys(domains).length,coreDomainCount:Object.values(domains).filter(row=>row.core2014).length,sourceUrl:'https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes',deitySourceUrl:'https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-b-gods-of-the-multiverse'}),writable:false,configurable:false});
})();
