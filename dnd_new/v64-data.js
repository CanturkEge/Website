/* v64: curated creatures, bosses, class gear and arcane economy. */
((root)=>{
  'use strict';

  const creatureRows=[
    ['vampire-bat','Vampir Yarasa',7,13,40,'Beast','1/4',[6,16,11,3,12,6],'Kan Isırığı +5: 1d4+3 delici; yaralı hedefe ek 1d4 nekrotik.','Uçuş, kör görüş 60 ft; yarı HP altındaki canlıları 60 ft içinde sezer.','Nekrotik','Yok','Radiant hasar ve parlak ışık.'],
    ['giant-bat','Dev Yarasa',22,13,60,'Beast','1/4',[15,16,11,2,12,6],'Isırık +5: 1d6+3 delici.','Uçuş 60 ft, kör görüş 60 ft, keskin işitme.','Yok','Yok','Sağırlaştırılırsa kör görüşünü kullanamaz.'],
    ['dire-rat','Ulu Sıçan',18,13,30,'Beast','1/2',[12,16,14,3,12,6],'Hastalıklı Isırık +5: 1d6+3; DC 11 CON veya poisoned.','Sürü Taktiği ve keskin koku.','Yok','Yok','Alan hasarı ve yüksek AC.'],
    ['giant-boar','Dev Yaban Domuzu',42,12,40,'Beast','2',[17,10,16,2,7,5],'Boynuz +5: 2d6+3; 20 ft koşarsa DC 13 STR veya prone.','Amansız: 1/gün 0 HP yerine 1 HP.','Yok','Yok','Düşük WIS ve menzilli kontrol.'],
    ['cave-bear','Mağara Ayısı',52,12,40,'Beast','2',[20,10,16,2,13,7],'Multiattack: ısırık +7 1d8+5, pençe +7 2d6+5.','Karanlık görüş ve keskin koku.','Cold','Yok','Düşük DEX, dar alanda çevrilebilir.'],
    ['saber-tiger','Kılıç Dişli Kaplan',52,12,40,'Beast','2',[18,14,15,3,12,8],'Isırık +6: 1d10+4; sıçrayış sonrası prone hedefe bonus pençe.','Pounce, keskin koku.','Yok','Yok','Sıçrama hattını boz ve yüksek zemine çık.'],
    ['phase-spider','Faz Örümceği',32,13,30,'Monstrosity','3',[15,15,12,6,10,6],'Isırık +4: 1d10+2 delici + DC 11 CON, 4d8 poison (yarı).','Bonus action ile Ethereal Plane arasında geçiş.','Poison','Poisoned','Hazır action ve force/radiant baskısı.'],
    ['ettercap','Ettercap',44,13,30,'Monstrosity','2',[14,15,13,7,12,8],'Multiattack: ısırık +4 ve pençe +4; ağ DC 11 restrained.','Örümcek tırmanışı, ağ duyusu ve ağ yürüyüşü.','Yok','Yok','Ateş ve açık alan.'],
    ['yuan-ti-pureblood','Yuan-ti Safkan',40,11,30,'Monstrosity','1',[11,12,11,13,12,14],'Scimitar +3 veya shortbow +3; poison spray.','Büyü direnci, innate suggestion 1/gün.','Magic','Poison; poisoned','Fiziksel baskı ve grapple.'],
    ['gray-ooze','Gri Ooze',22,8,10,'Ooze','1/2',[12,6,16,1,6,2],'Pseudopod +3: 1d6+1 bludgeoning +2d6 acid; metal aşındırır.','Amorphous ve false appearance.','Acid, cold, fire','Blinded, charmed, deafened, exhaustion, frightened, prone','Çok yavaş ve düşük AC.'],
    ['black-pudding','Kara Puding',85,7,20,'Ooze','4',[16,5,16,1,6,1],'Pseudopod +5: 1d6+3 bludgeoning +4d8 acid; zırh aşındırır.','Amorphous, spider climb; lightning/slashing ile bölünür.','Cold','Acid, lightning, slashing; birçok condition','Ranged bludgeoning, force ve radiant.'],
    ['hobgoblin-captain','Hobgoblin Kaptanı',39,17,30,'Humanoid','3',[15,14,14,12,10,13],'Multiattack longsword +4; Martial Advantage 1/tur +3d6.','Leadership 1/rest: müttefiklerin attack/save’lerine d4.','Yok','Yok','Lideri ayır, concentrationı boz.'],
    ['orc-eye-gruumsh','Gruumsh’un Gözü',45,16,30,'Humanoid','2',[16,12,16,9,14,12],'Spear +5; Spiritual Weapon benzeri bonus saldırı.','Aggressive; ork müttefiklerine savaş duası.','Yok','Yok','Silence ve WIS baskısı.'],
    ['gnoll-pack-lord','Gnoll Sürü Lordu',49,15,30,'Humanoid','2',[16,14,13,8,11,9],'Multiattack glaive +5; Incite Rampage ile müttefike reaction saldırısı.','Rampage ve aura liderliği.','Yok','Yok','Sürüden ayır ve reactionları tüket.'],
    ['berserker','Berserker',67,13,30,'Humanoid','2',[16,12,17,9,11,9],'Greataxe +5: 1d12+3.','Reckless: avantajla saldırır; ona saldırılar da avantajlı olur.','Yok','Yok','Reckless açığını kullan.'],
    ['knight','Şövalye',52,18,30,'Humanoid','3',[16,11,14,11,11,15],'Multiattack greatsword +5; heavy crossbow +2.','Leadership; Parry reaction AC +2.','Yok','Yok','DEX save ve büyülü kontrol.'],
    ['veteran','Kıdemli Asker',58,17,30,'Humanoid','3',[16,13,14,10,11,10],'Multiattack longsword +5 ve shortsword +5; heavy crossbow +3.','Disiplinli silah değişimi ve siper kullanımı.','Yok','Yok','Mental save’ler ve alan kontrolü.'],
    ['gladiator','Gladyatör',112,16,30,'Humanoid','5',[18,15,16,10,12,15],'Multiattack spear +7; Shield Bash; Parry AC +3.','Brave ve Brute; silah zarını bir ekstra zarla atar.','Yok','Yok','Save tabanlı hasar ve hareket kısıtlama.'],
    ['flameskull','Alev Kafatası',40,13,40,'Undead','4',[1,17,14,16,10,11],'Fire Ray iki saldırı; 3. seviye spellcasting ve Fireball.','Uçuş, Magic Resistance, Rejuvenation.','Lightning, necrotic, piercing','Cold, fire, poison; prone','Holy water veya remove curse ile geri dönüşü durdur.'],
    ['mummy','Mumya',58,11,20,'Undead','3',[16,8,15,6,10,12],'Çürüyen Yumruk +5: 2d6+3 +3d6 necrotic; Dreadful Glare.','Mummy Rot iyileşmeyi engeller.','Nonmagical fiziksel','Necrotic, poison; charmed, exhaustion, frightened, paralyzed, poisoned','Fire hasarına vulnerable.'],
    ['revenant','İntikamcı Ruh',136,13,30,'Undead','5',[18,14,18,13,16,18],'Multiattack yumruk +7; yeminli hedefe ek 4d6.','Regeneration 10, Vengeful Tracker; yeni bedende dönebilir.','Necrotic, psychic','Poison; charmed, exhaustion, frightened, paralyzed, poisoned, stunned','Yeminini çözmek veya radiant baskı.'],
    ['air-elemental','Hava Elementali',90,15,90,'Elemental','5',[14,20,14,6,10,6],'Multiattack slam +8; Whirlwind recharge 4–6.','Air Form; dar aralıklardan geçer.','Lightning, thunder; nonmagical fiziksel','Poison; exhaustion, grappled, paralyzed, petrified, poisoned, prone, restrained, unconscious','Kapalı alan ve earth/force kontrolü.'],
    ['earth-elemental','Toprak Elementali',126,17,30,'Elemental','5',[20,8,20,5,10,5],'Multiattack slam +8: 2d8+5.','Earth Glide, Siege Monster.','Nonmagical fiziksel','Poison; exhaustion, paralyzed, petrified, poisoned, unconscious','Thunder hasarı ve uçan hedefler.'],
    ['fire-elemental','Ateş Elementali',102,13,50,'Elemental','5',[10,17,16,6,10,7],'Multiattack touch +6; temas eden tutuşur.','Fire Form ve Illumination.','Nonmagical fiziksel','Fire, poison; grappled, paralyzed, petrified, poisoned, prone, restrained, unconscious','Cold hasarı; su her galonda 1 hasar.'],
    ['water-elemental','Su Elementali',114,14,30,'Elemental','5',[18,14,18,5,10,8],'Multiattack slam +7; Whelm recharge 4–6.','Water Form, Freeze.','Acid; nonmagical fiziksel','Poison; exhaustion, grappled, paralyzed, petrified, poisoned, prone, restrained, unconscious','Cold hasarı hızını düşürür.'],
    ['flesh-golem','Et Golemi',93,9,30,'Construct','5',[19,9,18,6,10,5],'Multiattack slam +7: 2d8+4.','Berserk, Aversion of Fire, Lightning Absorption, Magic Resistance.','Nonmagical/non-adamantine fiziksel','Lightning, poison; birçok condition','Fire hasarı ve sakinleştirme.'],
    ['helmed-horror','Miğferli Dehşet',60,20,30,'Construct','4',[18,13,16,10,10,10],'Multiattack longsword +6: 1d8+4 force sayılır.','Magic Resistance; yaratılırken seçilen üç büyüye bağışık.','Nonmagical fiziksel','Force, necrotic, poison; birçok condition','DM’in seçmediği save büyüleri.'],
    ['wyvern','Wyvern',110,13,80,'Dragon','6',[19,10,16,5,12,6],'Multiattack bite +7 ve stinger +7; stinger 7d6 poison.','Flyby değil; güçlü dalış ve taşıma.','Yok','Yok','Poison resistance ve menzilli baskı.'],
    ['young-brass-dragon','Genç Pirinç Ejderha',110,17,80,'Dragon','6',[19,10,17,12,11,15],'Multiattack; Fire Breath çizgi veya Sleep Breath koni.','Burrow 20, uçuş 80; konuşkan ve pazarlığa açık.','Yok','Fire','DEX save ve dağınık formasyon.'],
    ['young-silver-dragon','Genç Gümüş Ejderha',168,18,80,'Dragon','9',[23,10,21,14,11,19],'Multiattack; Cold Breath veya Paralyzing Breath.','Uçuş 80; bulutlarda yürür.','Yok','Cold','DEX save, breath recharge arası baskı.'],
    ['succubus-incubus','Succubus / Incubus',66,15,60,'Fiend','4',[8,17,13,15,12,20],'Claw +5; Draining Kiss grappled/charmed hedefe psychic.','Shapechanger, Charm, Etherealness, telepatik bağ.','Cold, fire, lightning, poison; nonmagical fiziksel','Yok','Charm immunity, protection from evil and good.'],
    ['barbed-devil','Dikenli Şeytan',110,15,30,'Fiend','5',[16,17,18,12,14,14],'Multiattack claw/claw/tail; Hurl Flame +5.','Barbed Hide, Devil’s Sight, Magic Resistance.','Cold; nonmagical/non-silver fiziksel','Fire, poison; poisoned','Silvered silah ve radiant.'],
    ['nightmare','Kâbus Atı',68,13,90,'Fiend','3',[18,15,16,10,13,15],'Hooves +6: 2d8+4 bludgeoning +2d6 fire.','Ethereal Stride; bindiği yaratığa fire resistance verir.','Yok','Fire','Radiant ve bineğini düşürme.'],
    ['displacer-beast','Yer Değiştiren Canavar',85,13,40,'Monstrosity','3',[18,15,16,6,12,8],'Multiattack tentacle +6: 1d6+4 piercing.','Displacement saldırılara dezavantaj; Avoidance.','Yok','Yok','İsabet aldıktan sonra displacement tur sonuna dek kapanır.'],
    ['bulette','Bulette',94,17,40,'Monstrosity','5',[19,11,21,2,10,5],'Bite +7: 4d12+4; Deadly Leap prone ve 3d6+4.','Burrow 40, tremorsense 60.','Yok','Yok','INT/WIS kontrolü ve uçuş.'],
    ['chimera','Kimera',114,14,60,'Monstrosity','6',[19,11,19,3,14,10],'Üç saldırılı multiattack; Fire Breath recharge 5–6.','Uçuş 60, üç başlı görüş.','Yok','Yok','Başları bölmeye çalışma; save hasarı.'],
    ['roper','Roper',93,20,10,'Monstrosity','5',[18,8,17,7,16,6],'Dört tendril grapple + reel + bite 4d8+4.','False Appearance, Spider Climb.','Yok','Yok','Tendrilleri kes ve menzili koru.'],
    ['owlbear','Baykuş Ayısı',59,13,40,'Monstrosity','3',[20,12,17,3,12,7],'Multiattack beak +7 1d10+5, claws +7 2d8+5.','Keskin görme ve koku.','Yok','Yok','Düşük mental save ve menzil.'],
    ['giant-scorpion','Dev Akrep',52,15,40,'Beast','3',[15,13,15,1,9,3],'İki claw grapple + stinger 4d10 poison.','Blindsight 60.','Yok','Yok','Poison resistance ve grapple kaçışı.'],
    ['giant-crocodile','Dev Timsah',85,14,50,'Beast','5',[21,9,17,2,10,7],'Bite grapple/restrained + tail prone.','Nefesini 30 dakika tutar.','Yok','Yok','Karada dönüş kabiliyeti zayıf; ranged baskı.']
  ];
  root.V64_MONSTERS=Object.freeze(creatureRows.map((x,i)=>Object.freeze({id:`v64-${x[0]}`,name:x[1],hp:x[2],maxHp:x[2],ac:x[3],speed:x[4],category:x[5],cr:x[6],stats:x[7],attacks:x[8],traits:x[9],resist:x[10],immune:x[11],weak:x[12],note:x[9],release:'v64'})));

  const bosses=[
    ['ancient-red','Kadim Kızıl Ejderha','Dragon','24',22,546,80,'Ateş Nefesi DC 24: 26d6 fire; 3 saldırılı multiattack.',['Legendary Resistance (3/gün)','Frightful Presence','Detect, Tail ve Wing Attack legendary action'],['Magma yarıkları açılır','Duman görüşü 30 ft ile sınırlar'],['Yarı HP’de nefesini hemen yeniler; zeminde lav bölgeleri oluşturur.'],'Cold hazırlığı, dağınık duruş ve uçuşunu sınırlama.'],
    ['ancient-blue','Kadim Mavi Ejderha','Dragon','23',22,481,80,'Yıldırım Nefesi DC 23: 16d10 lightning; bite/claw/claw.',['Legendary Resistance (3/gün)','Burrow ve çöl kamuflajı','Tail/Wing legendary action'],['Kum bulutu difficult terrain','Statik arklar rastgele iki hedefi bağlar'],['Yarı HP’de kum fırtınası başlar; menzilli saldırılar dezavantajlı.'],'Lightning resistance, çizgi nefesine karşı yayılma.'],
    ['lich','Lich','Undead','21',17,135,30,'Paralyzing Touch +12; 9. seviye spellcasting.',['Legendary Resistance (3/gün)','Rejuvenation ve Turn Resistance','Cantrip, Paralyzing Touch, Frightening Gaze legendary action'],['Ruh zincirleri concentration save ister','Lair büyü slotu baskısı yaratır'],['Phylactery etkinse ilk düşüşte gölge fazına geçer ve 60 geçici HP alır.'],'Phylactery’yi bul, Counterspell/Dispel hazırla, radiant baskı kur.'],
    ['vampire','Vampir Lordu','Undead','13',16,144,30,'Multiattack; Unarmed Strike grapple, Bite HP maksimumunu düşürür.',['Legendary Resistance (3/gün)','Regeneration 20','Move, Unarmed Strike ve Bite legendary action'],['Gölgeler ışıkları söndürür','Kapılar kendiliğinden kilitlenir'],['Yarı HP’de sis biçimine geçip üç kan hizmetkârı çağırır.'],'Sunlight/radiant, running water ve kazığı hazırlama.'],
    ['mummy-lord','Mumya Lordu','Undead','15',17,97,20,'Rotting Fist +9 ve Mummy Rot; 6. seviye Cleric büyüleri.',['Magic Resistance','Rejuvenation','Blinding Dust ve Dreadful Glare legendary action'],['Lanetli kum silence alanı oluşturur','Mezar duvarları hedefleri ayırır'],['Lahdi kırılmadıysa 0 HP’de bir tur sonra 40 HP ile döner.'],'Fire hasarı, lahdi yok etme ve curse temizliği.'],
    ['kraken','Kraken','Monstrosity','23',18,472,60,'Üç tentacle + bite; Lightning Storm.',['Amphibious, Freedom of Movement','Siege Monster','Tentacle/Lightning/Ink Cloud legendary action'],['Dev dalga prone eder','Gemi parçaları hareketli siper olur'],['Yarı HP’de güverteyi ikiye ayırır; su altı fazı başlar.'],'Lightning immunityyi unutma; tentacle grapplelarından kaçış planla.'],
    ['tarrasque','Tarrasque','Monstrosity','30',25,676,40,'Beş saldırılı multiattack; Bite grapple ve Swallow.',['Legendary Resistance (3/gün)','Magic Resistance ve Reflective Carapace','Move, Claw/Bite legendary action'],['Yer çatlağı 20 ft hat oluşturur','Bina çöküşü alan hasarı verir'],['Yarı HP’de Siege Frenzy: hareketi +20 ft, opportunity attack çekmez.'],'Doğrudan DPS yerine görev hedefi, tahliye ve özel zayıflık kullan.'],
    ['pit-fiend','Pit Fiend','Fiend','20',19,300,30,'Dört saldırılı multiattack; bite infernal yara ve poison.',['Fear Aura','Magic Resistance','At-will fireball ve hold monster'],['Cehennem zincirleri alanı daraltır','Ateş sütunları tur sonunda patlar'],['Yarı HP’de çağırdığı iki barbed devil savaş alanına girer.'],'Silvered/magic silah, fire/poison savunması, aura mesafesi.'],
    ['balor','Balor','Fiend','19',19,262,40,'Longsword lightning + whip fire; Death Throes 20d6.',['Fire Aura','Magic Resistance','Teleport'],['Köprü parçaları çöker','Alev çemberi güvenli alanı küçültür'],['Yarı HP’de whip hedefi 30 ft çekip ateş aurasına kilitler.'],'Death Throes için bitirişten önce dağıl; cold/radiant hazırla.'],
    ['solar','Düşmüş Solar','Celestial','21',21,243,50,'Greatsword +15; Slaying Longbow ölüm save’i.',['Legendary Resistance (3/gün)','Angelic Weapons ve Healing Touch','Teleport ve Searing Burst legendary action'],['Kutsal mühürler büyüyü yansıtır','Işık sütunları kör eder'],['Yarı HP’de uçuş 120 ft olur ve radiant fırtına başlar.'],'Korunma değil sebebini çözmek anahtar; save çeşitliliği hazırla.'],
    ['storm-giant','Fırtına Devi Hükümdarı','Giant','15',16,230,50,'Greatsword +14; Lightning Strike 12d8.',['Amphibious','Rock Catching','Fırtına Buyruğu: 3/gün hava kontrolü'],['Şimşek direkleri sıra sonunda çakar','Şiddetli rüzgâr ranged saldırıları bozar'],['Yarı HP’de gök gürültüsü aurası concentration save’i zorlar.'],'Lightning resistance, melee dışı save baskısı ve pazarlık.'],
    ['purple-worm','Kadim Mor Solucan','Monstrosity','18',19,350,50,'Bite +15, swallow; tail stinger 12d6 poison.',['Tunneler','Tremorsense 120','Legendary burrow move'],['Tünel çöküşü difficult terrain','Asit havuzları açılır'],['Yarı HP’de yer altından her tur farklı noktada çıkar.'],'Poison savunması, uçuş ve yutulanı hızlı çıkarma.'],
    ['demilich','Demilich','Undead','18',20,80,30,'Howl DC 15 CON; Life Drain.',['Avoidance','Legendary Resistance (3/gün)','Energy Drain ve Vile Curse legendary action'],['Anti-life alanları','Ruh yankısı spell slot baskısı'],['Can taşlarından biri duruyorsa 0 HP’de tek bir Howl daha yapar.'],'Save bonusları, radiant ve can taşlarını önceden yok et.'],
    ['death-knight','Ölüm Şövalyesi','Undead','17',20,180,30,'Üç longsword saldırısı; Hellfire Orb 20d6.',['Magic Resistance','Marshal Undead','Parry reaction'],['Ölü askerler tekrar kalkar','Lanetli sancak fear aurası verir'],['Yarı HP’de bineği Nightmare ile birleşip 90 ft hareket kazanır.'],'Radiant, dönüş engeli ve Hellfire Orb öncesi yayılma.'],
    ['archmage','Başbüyücü Vael','Humanoid','16',17,150,30,'9. seviye spellcasting; Arcane Burst +10.',['Magic Resistance','Counterspell Ustalığı','Teleport reaction'],['Rün sütunları seçili okulu güçlendirir','Büyü aynaları hedef değiştirir'],['Yarı HP’de ikinci concentration etkisini aynı anda sürdürebilir.'],'Counterspell kaynak yönetimi ve rün sütunlarını kırma.'],
    ['iron-colossus','Demir Kolos','Construct','18',22,310,30,'İki Titan Yumruğu +13; Furnace Beam 12d8 fire.',['Immutable Form','Magic Resistance','Siege Monster'],['Dişli zemin iter','Buhar menfezleri obscure eder'],['Yarı HP’de zırhı çatlar: AC 19, hareket 50, saldırı +1.'],'Adamantine, lightning ile bir reactionını kapatma, arka çekirdek.'],
    ['hag-coven','Üç Kader Cadısı','Fey','14',18,210,30,'Ortak büyü havuzu; pençe ve Nightmare Hex.',['Shared Spell Slots','Legendary Resistance cadı başına 1','Coven reaction büyü devri'],['Aynalar klon yaratır','Kazan dumanı charm eder'],['Her cadı düştüğünde kalanlar yeni bir lair action kazanır.'],'Aynı turda odak hasarı; Counterspell ve charm savunması.'],
    ['shadow-dragon','Gölge Ejderhası Nhal','Dragon','17',20,256,80,'Gölge Nefesi 14d8 necrotic; öldürülen humanoid shadow olur.',['Shadow Stealth','Legendary Resistance (3/gün)','Wing/Tail/Hide legendary action'],['Işık kaynakları söner','Gölgeler geçici duvar olur'],['Yarı HP’de bright light dışındaki alanlarda resistance kazanır.'],'Daylight/radiant ile güvenli bölgeler kur.'],
    ['elder-brain','Kadim Beyin','Aberration','20',18,260,10,'Mind Blast DC 18 INT; Psychic Link üzerinden büyü.',['Creature Sense','Legendary Resistance (3/gün)','Psychic Pulse ve Break Concentration legendary action'],['Zihin havuzu difficult terrain','Telepatik emir friendly fire doğurur'],['Yarı HP’de dört mind flayer bodyguard uyanır.'],'INT save, telepatik bağı kesme ve havuzu boşaltma.'],
    ['leviathan','Fırtına Leviathanı','Elemental','20',20,360,60,'Tidal Slam; Deluge recharge 5–6, 12d10 bludgeoning.',['Water Form','Siege Monster','Wave Move legendary action'],['Su seviyesi her tur yükselir','Akıntı tokenları 20 ft taşır'],['Yarı HP’de savaş alanı su altında sayılır.'],'Water breathing, lightning değil cold/force planı ve yüksek zemin.'],
    ['clock-king','Saat Kralı','Construct','16',21,240,30,'Zaman Kılıcı +11; yaşlandıran pulse.',['Temporal Parry','Legendary Resistance (2/gün)','Bir tokenın tur sırasını erteleme'],['Saat kadranı zemini döndürür','Kırılan dişliler zamanı yavaşlatır'],['Yarı HP’de tur başına bir ek reaction kazanır.'],'Reaction tüket, çekirdek dişlileri parçala, force kullan.'],
    ['root-mother','Kök Ana','Plant','15',19,280,20,'Kök kamçıları grapple; Spore Bloom poison/confusion.',['Regeneration 20 (fire keser)','Siege Roots','Üç legendary root action'],['Kökler 10 ft kareleri kapatır','Spor bulutu görüşü sınırlar'],['Yarı HP’de çiçek açar; AC 16 ama spell DC +2.'],'Fire, rüzgâr ve grapple kaçışı.'],
    ['glass-emperor','Cam İmparator','Elemental','17',20,245,40,'Cam Mızrak +12; Prismatic Shatter 10d8 seçili enerji.',['Reflective Guard','Legendary Resistance (3/gün)','Shard Step teleport'],['Cam zemin bleed uygular','Yansımalar sahte hedef üretir'],['Yarı HP’de zırh parçalanır: AC 17, dört mızrak saldırısı.'],'Thunder/bludgeoning, yansımaları kır ve görüşü kapat.'],
    ['void-saint','Boşluk Azizi','Aberration','19',21,270,40,'Void Touch force+necrotic; Event Horizon STR save.',['Magic Resistance','Legendary Resistance (3/gün)','Gravity Shift legendary action'],['Kütle kuyuları hareketi büker','Sessiz bölgeler verbal büyüyü kapatır'],['Yarı HP’de merkezde kara delik açılır; kenara değil sütun arkasına kaçılır.'],'Force direnç, STR save ve hareket büyüleri.']
  ];
  root.V64_BOSSES=Object.freeze(bosses.map((x,i)=>Object.freeze({id:`v64-boss-${x[0]}`,name:x[1],category:x[2],cr:x[3],ac:x[4],hp:x[5],maxHp:x[5],speed:x[6],attacks:x[7],skills:Object.freeze(x[8]),lairActions:Object.freeze(x[9]),phases:Object.freeze(x[10]),counterplay:x[11],stats:[22,14,20,16,16,18],traits:x[8].join(' • '),resist:'Stat bloğundaki temaya göre büyülü ve element dirençleri.',immune:'Boss kartındaki özel savunmalar.',weak:x[11],note:x[8].join(' • '),boss:true,release:'v64',source:i<14?'SRD 5.1 uyumlu özet':'Özgün Kadim Masa bossu'})));

  const gear=[
    ['Siperbüyücü Pelerini','Wizard','back','rare',{saveBonus:1},'Concentration save’lerine +1; 1/long rest Shield kullandığında 5 ft geri çekilebilirsin.'],
    ['Sekiz Mühürlü Cüppe','Wizard','body','veryRare',{acBonus:1},'Zırhsızken AC +1; 1/long rest hazırladığın bir 3. seviye veya düşük büyüyü slot harcamadan at.'],
    ['Canlı Mürekkep Eldiveni','Wizard','hands','uncommon',{statBonuses:{INT:1}},'INT +1 (en fazla doğal sınır 20); büyü kopyalama süresi %25 azalır.'],
    ['Yıldız Okuru Merceği','Wizard','eyes','rare',{magicBonus:1},'Focus olarak kuşanıldığında Spell Attack/DC +1; divination Arcana check’ine avantaj.'],
    ['Koronun Omuzluğu','Druid','back','rare',{saveBonus:1},'Save +1; Wild Shape sonrası proficiency kadar geçici HP, 1/long rest.'],
    ['Dört Mevsim Tacı','Druid','head','veryRare',{statBonuses:{WIS:1}},'WIS +1; long restte cold, fire, lightning veya poison türlerinden birine 1 saat direnç.'],
    ['Kök Yürüyen Çizme','Druid','feet','uncommon',{},'Bitkisel difficult terrain’i yok say; entangle alanında avantaj.'],
    ['Ay Suyu Totemi','Druid','focus','rare',{magicBonus:1},'Druid focus; Spell Attack/DC +1, iyileştirme büyüsünde bir adet 1’i yeniden at.'],
    ['İtirafçı Pelerini','Cleric','back','rare',{saveBonus:1},'Save +1; frightened veya charmed hedefe şifa verdiğinde yeni save attır, 1/long rest.'],
    ['Yedi Dua Eldiveni','Cleric','hands','uncommon',{statBonuses:{WIS:1}},'WIS +1; Medicine ve Religion check’lerinde kullanılan proficiency iki kat sayılır, 1/long rest.'],
    ['Şafak Emanetliği','Cleric','focus','rare',{magicBonus:1},'Holy focus; Spell Attack/DC +1, turn undead DC’sine ayrıca etki etmez.'],
    ['Hac Yolcusu Sandalı','Cleric','feet','uncommon',{},'Hareket +5 ft; unconscious müttefike yaklaşırken opportunity attack’a karşı AC +1.'],
    ['Yemin Muhafızı Pelerini','Paladin','back','rare',{saveBonus:1},'Save +1; aura içindeki bir müttefik prone olunca reaction ile ayağa kaldır, 1/long rest.'],
    ['Gümüş Ant Pulu','Paladin','neck','uncommon',{statBonuses:{CHA:1}},'CHA +1; yemin veya fiend/undead hakkında Insight check’ine +2.'],
    ['Arınmış Savaş Eldiveni','Paladin','hands','rare',{damageBonus:1},'Melee weapon hasarına +1; Divine Smite zarını artırmaz.'],
    ['Nöbetçi Aziz Miğferi','Paladin','head','veryRare',{acBonus:1},'AC +1; 1/long rest 0 HP’ye düşecek aura müttefiki 1 HP’de bırak.'],
    ['Onuncu Ezgi Pelerini','Bard','back','rare',{saveBonus:1},'Save +1; Bardic Inspiration verdiğinde hedef 5 ft hareket edebilir, 1/long rest.'],
    ['Rezonans Yüzüğü','Bard','ring','uncommon',{statBonuses:{CHA:1}},'CHA +1; Performance check’ine 1/long rest avantaj.'],
    ['Söz Hokkası','Bard','focus','rare',{magicBonus:1},'Bard focus; Spell Attack/DC +1, charm büyüsünü tanıma check’ine +2.'],
    ['Sessiz Sahne Çizmesi','Bard','feet','uncommon',{},'Stealth check’inde ayakkabı sesi çıkarmaz; sahne hareketi Acrobatics’e +1.'],
    ['Patronun Gölge Pelerini','Warlock','back','rare',{saveBonus:1},'Save +1; pact slot harcadığında loş ışıkta 10 ft teleport, 1/long rest.'],
    ['Mühürlü Ahit Zinciri','Warlock','neck','uncommon',{statBonuses:{CHA:1}},'CHA +1; patron ve fiend lore Arcana check’ine +2.'],
    ['Boşluk Gözü','Warlock','focus','rare',{magicBonus:1},'Warlock focus; Spell Attack/DC +1, Eldritch Blast menzilini değiştirmez.'],
    ['Borç Tahsildarı Eldiveni','Warlock','hands','veryRare',{damageBonus:1},'Pact weapon hasarına +1; curse hedefi düşünce proficiency kadar geçici HP.'],
    ['İlk Kıvılcım Pelerini','Sorcerer','back','rare',{saveBonus:1},'Save +1; Metamagic sonrası 5 ft fırsat saldırısız hareket, 1/long rest.'],
    ['Soydamar Kemeri','Sorcerer','waist','uncommon',{statBonuses:{CHA:1}},'CHA +1; sorcery point sayısını değiştirmez, Arcana check’ine +1.'],
    ['Ham Büyü Prizması','Sorcerer','focus','rare',{magicBonus:1},'Sorcerer focus; Spell Attack/DC +1, Wild Magic sonucunu yeniden atmaz.'],
    ['Metamagic İğnesi','Sorcerer','brooch','veryRare',{},'1/long rest bir büyüye Distant veya Subtle Spell’i sorcery point harcamadan uygula.'],
    ['Ufuk Avcısı Pelerini','Ranger','back','rare',{saveBonus:1},'Save +1; işaretli hedefe yaklaşırken difficult terrain’i bir tur yok say, 1/long rest.'],
    ['Uzak İz Pusulası','Ranger','focus','uncommon',{statBonuses:{WIS:1}},'WIS +1; Survival ile yön bulmaya +2.'],
    ['Sessiz Kiriş Eldiveni','Ranger','hands','rare',{attackBonus:1},'Ranged weapon attack +1; hasar bonusu vermez.'],
    ['Yaban Nöbetçisi Çizmesi','Ranger','feet','uncommon',{},'Doğal difficult terrain’de ilk 10 ft normal sayılır.'],
    ['Yaşayan Atölye Pelerini','Artificer','back','rare',{saveBonus:1},'Save +1; attuned infüzyonlu eşya ile check’e 1/long rest +1d4.'],
    ['Usta Kalibrasyon Gözlüğü','Artificer','eyes','uncommon',{statBonuses:{INT:1}},'INT +1; tool check’ine 1/long rest avantaj.'],
    ['Eterik Tornavida','Artificer','focus','rare',{magicBonus:1},'Artificer focus; Spell Attack/DC +1, tamir check’ine +2.'],
    ['Acil Durum Eldiveni','Artificer','hands','veryRare',{acBonus:1},'AC +1; reaction ile 30 ft müttefiğin aldığı hasarı 1d8 azalt, 1/long rest.']
  ];
  root.V64_CLASS_GEAR=Object.freeze(gear.map((x,i)=>Object.freeze({name:x[0],classRestriction:[x[1]],slot:x[2],rarity:i%4===1?'uncommon':i%4===3?'veryRare':'rare',category:x[2]==='focus'?'focus':'accessory',themes:['mixed',x[1]==='Cleric'||x[1]==='Paladin'?'sacred':x[1]==='Druid'||x[1]==='Ranger'?'nature':'arcane'],lootKind:'classGear',release:'v64',attunement:true,minLevel:3,valueCopper:i%4===3?22000:i%4===1?1200:5500,qtyMax:1,size:'small',...x[4],effect:x[5],note:`${x[1]} özel ekipmanı • Bonuslar yalnız kuşanıldığında uygulanır.`,activation:'Pasif / açıklamadaki kullanım',uses:'Attunement boyunca'})));

  const oldBuild=root.V48_BUILD_LOOT;
  if(typeof oldBuild==='function')root.V48_BUILD_LOOT=function(add,context={}){
    oldBuild(add,context);
    const catalogue=context.catalogue||[],limits={everyday:180,delightDrink:80,utility:220},seen={},legacySeen={};
    const cleaned=catalogue.filter(item=>{
      if(!item.release&&['weapon','armor','accessory','junk'].includes(item.category)){
        const step={weapon:3,armor:2,accessory:3,junk:3}[item.category];legacySeen[item.category]=(legacySeen[item.category]||0)+1;return (legacySeen[item.category]-1)%step===0;
      }
      if(item.release!=='v48'||item.lootKind==='spellComponent'||item.lootKind==='specialUtility')return true;
      const kind=item.lootKind||'legacy';seen[kind]=(seen[kind]||0)+1;return seen[kind]<=(limits[kind]||0);
    });
    catalogue.splice(0,catalogue.length,...cleaned);
    const names=new Set(catalogue.map(item=>String(item.name).toLocaleLowerCase('tr-TR')));
    for(const item of root.V64_CLASS_GEAR)if(!names.has(item.name.toLocaleLowerCase('tr-TR'))){add({...item});names.add(item.name.toLocaleLowerCase('tr-TR'))}
  };
  root.V48_LOOT_KIND_LABELS=Object.freeze({...root.V48_LOOT_KIND_LABELS,classGear:'Class özel ekipmanları'});

  EX_SHOPS.arcane='Büyücü Dükkânı';
  if(typeof V33_SERVICE_DEFS!=='undefined')V33_SERVICE_DEFS.arcane='Büyücü Dükkânı';
  const marketRows=[
    ['blank-spellbook','Boş Büyü Kitabı','arcane',1,5000,12,'100 parşömen sayfalı, dayanıklı büyü kayıt kitabı.','Büyü Kitabı'],
    ['component-pouch','Component Pouch','arcane',1,2500,12,'GP değeri yazmayan sıradan materyal bileşenleri taşır.','Büyü Odağı'],
    ['arcane-focus-crystal','Arcane Focus — Kristal','arcane',1,1000,10,'Wizard, Sorcerer ve Warlock büyüleri için uygun odak.','Büyü Odağı'],
    ['arcane-focus-wand','Arcane Focus — Değnek','arcane',1,1000,10,'Büyü materyali yerine kullanılabilen sıradan değnek odağı.','Büyü Odağı'],
    ['druidic-focus-yew','Porsuk Ağacı Druid Odağı','general',1,1000,8,'Druid büyüleri için oyulmuş doğal odak.','Büyü Odağı'],
    ['holy-symbol-traveler','Gezgin Kutsal Sembolü','general',1,500,12,'Cleric ve Paladin için sade kutsal odak.','Kutsal Eşya'],
    ['fine-ink-vial','Kaliteli Büyü Mürekkebi','arcane',1,5000,15,'Büyü kitabına 1 seviye büyü kopyalama masrafının bir kısmı; süreyi kaldırmaz.','Yazım Malzemesi'],
    ['silver-dust-25','25 GP Gümüş Tozu','alchemist',1,2500,8,'Ceremony ve benzeri büyüler için tam değerli materyal.','Büyü Materyali'],
    ['pearl-100','100 GP İnci','general',2,10000,5,'Identify büyüsünün tüketilmeyen, değeri yazılı materyali.','Büyü Materyali'],
    ['diamond-dust-100','100 GP Elmas Tozu','temple',2,10000,5,'Greater Restoration ve Stoneskin gibi büyüler için ölçülü materyal.','Büyü Materyali'],
    ['incense-divination','Kehanet Tütsüsü','temple',1,2500,8,'Divination ayinleri için 25 GP değerinde kutsanmış tütsü.','Büyü Materyali'],
    ['familiar-brazier-kit','Find Familiar Mangal Kiti','arcane',1,1000,10,'10 GP kömür, tütsü ve ot; büyü kullanıldığında tüketilir.','Büyü Materyali'],
    ['chromatic-diamond','Kromatik Küre Elması','arcane',2,5000,4,'Chromatic Orb için 50 GP değerinde tüketilmeyen elmas.','Büyü Materyali'],
    ['scrying-focus','Scrying Odağı','arcane',3,100000,2,'Scrying için en az 1.000 GP değerinde ayna/küre/font.','Büyü Materyali'],
    ['revivify-diamonds','Revivify Elmas Seti','temple',3,30000,3,'Toplam 300 GP değerinde elmas; büyü tarafından tüketilir.','Büyü Materyali'],
    ['ruby-dust-continual','50 GP Yakut Tozu','arcane',2,5000,5,'Continual Flame için tüketilen materyal.','Büyü Materyali'],
    ['warding-incense','Koruma Tütsüsü Paketi','general',1,350,15,'Ritüel alanını işaretler; tek başına büyü bonusu vermez.','Büyü Malzemesi'],
    ['scroll-case-waterproof','Su Geçirmez Parşömen Kutusu','general',1,150,20,'Altı parşömeni yağmur ve sıçramadan korur.','Macera Ekipmanı'],
    ['apprentice-scroll-1','1. Seviye Büyü Parşömeni','arcane',2,7500,6,'DM’in seçtiği 1. seviye büyüyü içerir; class listesi ve check kuralları uygulanır.','Spell Scroll'],
    ['adept-scroll-2','2. Seviye Büyü Parşömeni','arcane',2,15000,4,'DM’in seçtiği 2. seviye büyüyü içerir.','Spell Scroll'],
    ['mage-scroll-3','3. Seviye Büyü Parşömeni','arcane',3,30000,3,'DM’in seçtiği 3. seviye büyüyü içerir.','Spell Scroll'],
    ['wand-war-mage-1','Savaş Büyücüsü Değneği +1','arcane',3,50000,2,'Attunement: spell attack +1; half cover büyü saldırısını engellemez.','Nadir Focus'],
    ['pearl-power','Güç İncisi','arcane',3,60000,2,'Attunement: 1/gün action ile harcanmış 3. seviye veya düşük slot yeniler.','Nadir Büyülü Eşya'],
    ['cloak-protection','Koruma Pelerini','arcane',3,80000,2,'Attunement: AC ve saving throwlara +1.','Nadir Pelerin'],
    ['broom-flight-balanced','Uçan Süpürge','arcane',3,90000,1,'Komutla uçar; yük hızını etkiler, attunement istemez.','Nadir Büyülü Eşya'],
    ['alchemist-supplies','Simyacı Malzemeleri','general',1,5000,6,'Alchemist’s supplies takımının eksiksiz seti.','Tool'],
    ['herbalism-kit','Herbalism Kit','general',1,500,8,'Bitki tanıma ve uygun crafting için araç seti.','Tool'],
    ['calligrapher-supplies','Hattat Malzemeleri','general',1,1000,8,'Parşömen, mürekkep ve yazım aracı seti.','Tool'],
    ['moonseed','Ay Tohumu Kesesi','alchemist',2,1200,6,'Druid ritüelleri için nadir ama mekanik bonus vermeyen tohum.','Büyü Malzemesi'],
    ['consecrated-wax','Kutsanmış Mühür Mumu','temple',1,500,10,'Kutsal yazıt ve ward hazırlıklarında kullanılan balmumu.','Kutsal Malzeme']
  ];
  root.V64_MARKET_CATALOG=Object.freeze(marketRows.map(row=>Object.freeze({id:`ex-v64-${row[0]}`,name:row[1],shop:row[2],tier:row[3],priceCopper:row[4],stock:row[5],note:row[6],effect:row[7],active:true,ready:true,release:'v64'})));
  EX_ALL_CATALOG.push(...root.V64_MARKET_CATALOG);
  for(const tiers of Object.values(V34_CASTLE_TIERS||{}))tiers.arcane=tiers.mystic||tiers.temple>=3?Math.max(1,tiers.mystic||0):tiers.alchemist>=3?2:tiers.general>=2?1:0;
})(typeof window!=='undefined'?window:globalThis);
