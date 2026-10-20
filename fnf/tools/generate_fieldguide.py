"""Generate the FNF field guide migration and individual pencil-on-parchment SVG plates.

Run from the repository root: python3 fnf/tools/generate_fieldguide.py
The lists below are the editable source for the provisional fantasy taxonomy.
"""
from pathlib import Path
import hashlib
import html
import json
import math
import random

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "assets" / "codex"

# Ten distinct silhouettes per ecological group. The description and habitat of each
# entry are stable lore; no mechanical harvest or breeding effect is implied here.
PLANTS = {
    "ağaç": "Kızıl Sis Sediri|Ayaz Meşesi|Çan Kabuğu|Kül Ihlamuru|Cam Yapraklı Kavak|Gece Çınarı|Bakır Söğüt|Yıldız Karaağacı|Koru Ardıcı|Duman Dişbudağı",
    "çiçek": "Şafak Çanı|Mor Ağıt|Gümüş Gelincik|Kırık Taç|Ateş Kesiği|Sis Zambağı|Çiy Tacı|Alaca Kandil|Bal Yıldızı|Karanfil Gölgesi",
    "ot": "Fısıltı Eğreltisi|Gölge Nanesi|Kaya Kekliği|Çam İğnesi Otu|Sedef Adaçayı|Pus Kekiği|İnce Damar Otu|Kum Fesleğeni|Kül Isırganı|Sabah Mercanköşkü",
    "mantar": "Çan Şapkası|Soluk Mürekkep|Kök Feneri|Benekli Kadeh|Yosun Kulak|Duman Süngeri|Kuzgun Şapkası|Cam Spor|Kıvrık Raf|Gece Fincanı",
    "su bitkisi": "Gölet Aynası|Saz Dili|Kıyı Feneri|Suyolu Sümbülü|Bataklık Tarakotu|Derin Kök|Yüzen Düğme|Sıska Kamış|Nehir Tüyü|Yağmur Yaprağı",
    "çalı": "Gece Yemişi Çalısı|Kızıl Diken|Bal Çiti|Ay Pıtrağı|Sis Böğürtleni|Demir Yaban Mersini|Kum Tırnağı|Gümüş Çit|Kırlangıç Diken|Sarı Yuva Çalısı",
    "sarmaşık": "Rüzgâr İpi|Kaya Saçı|Meşe Sarmaşığı|Yıldız Bağı|Kuyu İpliği|Kül Asması|Orman Zinciri|Sis Sarmalı|Çan Asması|Şafak Düğümü",
    "kök": "Ay Kökü|Kızıl Yumru|Taş Havuç|Pus Soğanı|Yaban Şalgamı|Sedef Kök|Kül Yumrusu|Kırk Damar|Don Pancarı|Dere Turpu",
    "tahıl": "Amber Buğdayı|Güz Darısı|Sis Çavdarı|Kıraç Arpası|Bakır Yulaf|Gölge Pirinci|İnci Taneli Darı|Rüzgâr Başak|Kara Tohumlu Keten|Şafak Susamı",
    "yosun": "Taş Kadifesi|Çiy Halısı|Kuyu Yosunu|Kızıl Liken|Gölge Halısı|Gümüş Kabuk Yosunu|Pus Örtüsü|Kış Likeni|Ağaç Sakalı|Bataklık Kadifesi",
}
ANIMALS = {
    "memeli": "Yosun Tavşanı|Kızıl Sırt Tilkisi|Kül Geyiği|Orman Porsuğu|Ayaz Sansarı|Sis Keçisi|Kaya Kirpisi|Bal Rengi Sincap|Gece Gelinciği|Çan Boynuzlu Ceylan",
    "kuş": "Sis Turnası|Bakır Kanatlı İspinoz|Kuzgun Kâtibi|Ay Balıkçılı|Şafak Baykuşu|Koru Ağaçkakanı|Gümüş Sığırcık|Çiy Bülbülü|Kül Kartalı|Kıyı Kırlangıcı",
    "küçük canlı": "Fener Böceği|Cam Kanatlı Güve|Kırmızı Kabuklu Kaplumbağa|Dere Semenderi|Yaprak Kelebeği|Kum Kertenkelesi|Çan Kurbağası|Yıldız Salyangozu|Saz Yılanı|Kök Yengeci",
}
HABITATS = {
    "ağaç": ["eski ormanın yüksek sırtları", "serin vadi yamaçları", "rüzgârlı orman sınırı"],
    "çiçek": ["orman açıklıkları", "gün ışığı alan taşlıklar", "çiyli çayırlar"],
    "ot": ["nemli orman tabanı", "patika kenarları", "yarı gölgeli toprak"],
    "mantar": ["çürük kütüklerin gölgesi", "ıslak yaprak örtüsü", "köklere yakın serin yerler"],
    "su bitkisi": ["durgun gölet kıyıları", "sığ dere yatakları", "sulak bataklık sınırı"],
    "çalı": ["koru sınırı", "açık yamaçlar", "taşlı orman kenarı"],
    "sarmaşık": ["yaşlı gövdeler", "gölge taş duvarlar", "ağaçlarla örtülü yamaçlar"],
    "kök": ["gevşek orman toprağı", "serin yamaç dipleri", "nemli dere kıyısı"],
    "tahıl": ["güneşli açıklıklar", "kuru çayır toprağı", "rüzgârlı düzlükler"],
    "yosun": ["gölgeli taş yüzleri", "ıslak kütükler", "serin kaynak çevresi"],
    "memeli": ["orman kenarı", "çalılık patikalar", "taşlı yamaç"],
    "kuş": ["yüksek dallar", "sulak alan sınırı", "açık gökyüzlü koru"],
    "küçük canlı": ["nemli yaprak örtüsü", "dere taşları", "çayır kenarı"],
}
DETAILS = {
    "ağaç": ["çatallı gövdesi ve dar yaprakları", "pullu kabuğu ve seyrek tacı", "alçak dalları ve geniş yaprakları"],
    "çiçek": ["kat kat taç yaprakları", "sarkık çan biçimli çiçekleri", "ince saplı yıldız çiçekleri"],
    "ot": ["dişli yaprak uçları", "karşılıklı küçük yaprakları", "kıvrık ince filizleri"],
    "mantar": ["kavisli şapkası", "ince sap ve halka izi", "küme hâlinde yükselen şapkaları"],
    "su bitkisi": ["uzun ince yaprakları", "yüzer yuvarlak yaprakları", "su üstüne çıkan saz başları"],
    "çalı": ["sık dalları ve küçük meyveleri", "uzun dikenleri", "oval yapraklarının damarları"],
    "sarmaşık": ["sarmal dalları", "üç parçalı yaprakları", "ince tutunma kolları"],
    "kök": ["çatallı yumrusu", "kalın kök damarları", "toprak üstündeki rozet yaprakları"],
    "tahıl": ["çok taneli başağı", "uzun kılçıkları", "eğilen ince sapları"],
    "yosun": ["sık küçük sürgünleri", "yumuşak kabartılı örtüsü", "taşa yapışan ince kolları"],
    "memeli": ["belirgin kulakları ve kuyruk izi", "çizgili sırt tüyleri", "uzun bacakları ve dikkatli duruşu"],
    "kuş": ["uzun kanat tüyleri", "ince gagası ve boynu", "kabarık göğüs tüyleri"],
    "küçük canlı": ["desenli sırt çizgileri", "ince uzuvları", "benekli kabuğu"],
}
USES = {
    "ağaç": ["Kabuk örneği ve odun niteliği araştırılabilir.", "Gölgesi ve dalları yol işareti olabilir.", "Tohumları koru gözlemlerine eklenir."],
    "çiçek": ["Pigment denemelerine konu olabilir; etkisi henüz kanıtlanmadı.", "Çiçeklenme zamanı mevsim kaydına işlenir.", "Koku ve nektar izi saha defterine alınır."],
    "ot": ["Yaprak örneği inceleme için saklanabilir.", "Koku ve lif niteliği zanaat denemelerinde araştırılır.", "Yetişme izi keşif rotalarına yardımcı olabilir."],
    "mantar": ["Yenebilirliği doğrulanmadan tüketilmez; spor örneği araştırılır.", "Spor izi toprağın nemini anlamaya yardımcı olabilir.", "Yalnız gözlem ve çizim için kayda alınır; tüketim bilgisi yok."],
    "su bitkisi": ["Su düzeyi ve akış gözleminde işaret olabilir.", "Lif yapısı zanaat araştırmasına açılabilir.", "Sığ suyun yerini gösteren bir saha ipucudur."],
    "çalı": ["Meyvesinin kullanımı DM araştırmasıyla belirlenir; doğrudan yenmez.", "Dallar çit ve iz sürme denemelerinde incelenir.", "Çiçek ve meyve zamanı gözlem defterine işlenir."],
    "sarmaşık": ["Lif dayanımı yapım denemesinde sınanabilir.", "Sardığı gövdenin yaşını okumaya yardımcı olabilir.", "Yön bulmada bitki örtüsü işareti olabilir."],
    "kök": ["Kök örneği işleme bilgisi açılana kadar yalnız kaydedilir.", "Toprağın yapısını anlamak için kesiti incelenir.", "Yetiştirme olasılığı araştırma konusudur."],
    "tahıl": ["Tane yapısı değirmen araştırmasında incelenebilir.", "Tohum toplama ve ekim koşulları henüz doğrulanmadı.", "Hasat potansiyeli DM araştırmasıyla açılabilir."],
    "yosun": ["Nem göstergesi olarak gözlemlenir.", "Dokusu boya veya dolgu denemesi için incelenebilir.", "Yaşadığı yüzey saha defterine işlenir."],
    "memeli": ["İzleri ve beslenmesi gözlenebilir; evcilleştirme kuralı henüz yok.", "Davranışları RP keşfi ve bakım araştırmasına konu olabilir.", "Yaşam alanı ekosistem gözlemine işlenir."],
    "kuş": ["Göç ve çağrı örüntüsü mevsim haberi olabilir.", "Tüy ve yuva izi yalnız gözlem amacıyla kayda alınır.", "Uçuş yolu keşif sahnesine ipucu verebilir."],
    "küçük canlı": ["Yaşadığı mikrohabitat gözlemlenebilir.", "Kabuğu veya kanadı çizim defterine kaydedilir.", "Mevsimsel hareketi araştırma konusu olabilir."],
}

def species():
    rows = [{"id":"plant_01", "category":"plant", "name":"Fısıltı Eğreltisi", "group":"ot", "index":0}]
    plant_index = 2
    for group, names in PLANTS.items():
        for index, name in enumerate(names.split("|")):
            if name == "Fısıltı Eğreltisi":
                continue
            rows.append({"id":f"plant_{plant_index:03d}","category":"plant","name":name,"group":group,"index":index})
            plant_index += 1
    animal_index = 3
    for group, names in ANIMALS.items():
        for index, name in enumerate(names.split("|")):
            if name == "Yosun Tavşanı":
                ident = "animal_01"
            elif name == "Sis Turnası":
                ident = "animal_02"
            else:
                ident = f"animal_{animal_index:03d}"
                animal_index += 1
            rows.append({"id":ident,"category":"animal","name":name,"group":group,"index":index})
    assert len(rows)==130 and len({x['name'] for x in rows})==130 and len({x['id'] for x in rows})==130
    for x in rows:
        group,index=x['group'],x['index']
        x['kind']={"memeli":"Memeli","kuş":"Kuş","küçük canlı":"Küçük canlı"}.get(group,group.capitalize())
        x['rarity']=["Yaygın","Seyrek","Nadir","Yaygın","Seyrek","Yaygın","Nadir","Seyrek","Çok nadir","Yaygın"][index]
        x['image']=x['id']+'.svg'
        habitat=HABITATS[group][index%3]
        x['description']=f"{x['name']}, {DETAILS[group][index%3]} ile tanınır. {habitat.capitalize()} çevresinde gözlemlenir."
        x['uses']=USES[group][index%3]
        x['conditions']=f"Doğal yaşam: {habitat}; mevsimsel sıklığı saha keşfiyle belirlenir. Üretim ve yetiştirme kuralı henüz yok."
    return rows

def svg(row):
    ident=row['id']; group=row['group']; v=row['index']; rng=random.Random(int(hashlib.sha256(ident.encode()).hexdigest()[:12],16))
    ink='#302d29'; pale='#736958'; strokes=[]
    def path(d,width=2.2,opacity=1):
        strokes.append(f'<path d="{d}" fill="none" stroke="{ink}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}"/>')
    def ellipse(cx,cy,rx,ry,fill='none',width=2):
        strokes.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{ink}" stroke-width="{width}"/>')
    def leaf(cx,cy,rx,ry):
        cx,cy,rx,ry=map(round,(cx,cy,rx,ry))
        strokes.append(f'<path d="M{cx} {cy-ry} Q{cx+rx*2} {cy-ry//3} {cx} {cy+ry} Q{cx-rx*2} {cy+ry//3} {cx} {cy-ry} Z" fill="#a89c8320" stroke="{ink}" stroke-width="1.5"/>')
        path(f'M{cx} {cy-ry+3} Q{cx+3} {cy} {cx} {cy+ry-3} M{cx} {cy-ry//3} l{rx//2} {-ry//5} M{cx} {cy+ry//4} l{-rx//2} {-ry//5}',.75,.65)
    # Silhouette families, with species-specific phase, branch counts and angles.
    if group in ('ağaç','çiçek','ot','su bitkisi','çalı','sarmaşık','kök','tahıl','yosun'):
        n={'ağaç':7,'çiçek':5,'ot':8,'su bitkisi':8,'çalı':10,'sarmaşık':7,'kök':6,'tahıl':8,'yosun':12}[group]
        base=440 if group!='su bitkisi' else 410
        if group=='ağaç':
            path('M247 455 C234 380 245 288 253 166 M259 452 C264 355 260 254 253 166',5)
            for j in range(n):
                y=195+j*30; side=-1 if j%2 else 1; reach=48+((v*11+j*9)%53)
                path(f'M251 {y+32} Q{251+side*reach*.48:.0f} {y-22} {251+side*reach} {y-32}',2.5)
                for k in range(3):
                    x=251+side*(reach*.5+k*reach*.16); yy=y-24-k*7
                    leaf(x,yy,5+(v+j+k)%4,13+(v+k)%7)
        elif group=='mantar':
            pass
        elif group=='kök':
            path('M250 282 Q244 348 253 390 Q270 421 252 470 M252 390 Q220 420 229 469 M252 422 Q283 438 280 479',2.7)
            for j in range(n):
                a=(j-n/2)*.32; ex=250+int(math.sin(a)*135); ey=170+abs(j-n/2)*12
                path(f'M250 291 Q{ex} 266 {ex} {ey}',1.8)
                ellipse(ex,ey,10,27, '#a89c8322',1.6)
        elif group=='yosun':
            path('M91 427 Q247 379 409 429 M94 437 Q251 404 407 441',2.5)
            for j in range(n*3):
                x=112+j*8; h=20+((j*13+v*7)%69)
                path(f'M{x} {426-(j%5)*4} q{-9 if j%2 else 8} {-h//2} {(-6 if j%2 else 7)} {-h}',1.3,.75)
        elif group=='sarmaşık':
            path(f'M246 468 C{120+v*5} 380 {380-v*5} 310 240 245 S{170+v*3} 159 250 125',2.6)
            for j in range(n):
                y=156+j*43; x=247+int(math.sin(j*1.7+v)*64); side=-1 if j%2 else 1
                path(f'M{x} {y} q{side*30} -24 {side*58} -32',1.7)
                ellipse(x+side*62,y-38,14+(j%4)*3,8+(v%3)*2,'#a89c8333',1.5)
        else:
            for j in range(n):
                offset=(j-(n-1)/2)*24; peak=150+((j*23+v*17)%93)
                if group=='su bitkisi': peak+=50
                path(f'M250 {base} Q{250+offset*1.9:.0f} 329 {250+offset} {peak}',1.8+(j%3)*.25)
                if group=='tahıl':
                    for k in range(5):
                        x=250+offset; y=peak+k*9
                        path(f'M{x} {y} q{-13 if k%2 else 13} -12 {(-13 if k%2 else 13)} -24',1.3)
                elif group=='çiçek':
                    cx=250+offset
                    for k in range(5+(v%3)):
                        a=k*2*math.pi/(5+v%3); xx=cx+math.sin(a)*19; yy=peak+math.cos(a)*19
                        ellipse(round(xx),round(yy),8,15,'#b4a98b44',1.3)
                    ellipse(cx,peak,7,7, '#69635455',1.2)
                    for k in range(8):
                        a=k*math.pi/4
                        path(f'M{cx+math.sin(a)*8:.0f} {peak+math.cos(a)*8:.0f} l{math.sin(a)*9:.0f} {math.cos(a)*9:.0f}',.7,.55)
                elif group=='çalı':
                    ellipse(250+offset,peak,13+(j+v)%9,24+(j%3)*3,'#a89c8330',1.5)
                    for k in range(3): ellipse(250+offset+(k-1)*9,peak-4+k*5,2,2,ink,1)
                else:
                    leaf(250+offset,peak,8+(j%4)*2,30+(v%3)*5)
                    if group=='ot': path(f'M{250+offset} {peak+27} l{-8-(j%4)*2} -19',.9,.7)
        # Ground line, faint registration and pencil side studies.
        path('M128 473 Q252 466 381 475',1.2,.45)
    elif group=='mantar':
        for j in range(3+(v%3)):
            x=171+j*47; h=42+((j*17+v*11)%75); y=427-h
            path(f'M{x-9} 445 Q{x-17} {y+40} {x-7} {y+8} M{x+9} 445 Q{x+15} {y+34} {x+7} {y+8}',2)
            path(f'M{x-43} {y+17} Q{x-29} {y-49} {x} {y-47} Q{x+32} {y-49} {x+43} {y+17} Q{x} {y+32} {x-43} {y+17} Z',2.3)
            for k in range(5): ellipse(x-20+k*10,y-8+(k%2)*8,2,3,ink,.8)
        path('M125 455 Q250 447 378 455',1.4,.5)
    elif group=='memeli':
        # Observational silhouettes: rabbit, fox, deer, badger, marten, goat,
        # hedgehog, squirrel, ferret, gazelle. Marks vary per individual plate.
        if v==0:  # crouched rabbit, broad haunch and small front paws
            path('M137 345 Q145 275 220 270 Q283 254 326 308 Q339 319 347 318 Q348 288 370 277 Q391 265 409 287 L421 302 Q411 318 379 320 Q366 345 355 355 Q326 386 280 385 Q241 408 187 390 Q142 386 137 345 Z',2.25)
            path('M365 282 Q352 227 361 177 Q379 174 385 247 L381 273 M383 277 Q391 217 411 183 Q428 197 404 273',2.1)
            path('M241 383 Q226 350 191 356 Q166 369 180 391 L253 396 M330 366 Q349 386 377 378 L385 382 M145 331 Q115 313 118 342 Q125 358 143 352',1.8)
            for j in range(5): path(f'M{360+j*8} 306 l{22-j*3} {-6+j*4}',.6,.8)
            ellipse(392,292,2.5,2.5,ink,.8)
        elif v==6:  # low spiny hedgehog
            path('M115 359 Q139 272 233 267 Q315 264 353 337 Q386 343 416 364 L391 381 Q326 391 276 396 L171 395 Q132 389 115 359 Z',2.2)
            for j in range(36):
                x=145+j*6
                path(f'M{x} {301-((j*9)%27)} l{-14+(j%4)*3} {-22-(j%5)*5} l17 16',1.2,.76)
            path('M160 392 l-6 19 28 0 M337 390 l6 21 27 0',1.7)
            ellipse(386,358,2.5,2.5,ink,.8)
        elif v==7:  # squirrel with an arched tufted tail
            path('M223 382 Q183 358 204 313 Q230 278 280 294 Q312 301 324 321 Q345 286 362 280 L397 303 Q381 317 349 319 Q325 370 298 382 Q263 398 223 382 Z',2.1)
            path('M213 338 Q112 327 125 239 Q152 190 192 224 Q227 245 188 268 Q154 272 159 308 Q174 332 213 338 Z',2)
            path('M356 280 l-8 -37 24 25 M373 278 l12 -40 5 43 M276 375 l18 43 30 0 M240 379 l-13 34 26 0',1.8)
            ellipse(376,296,2.2,2.2,ink,.8)
        else:
            slender=v in (2,5,9)
            low=v in (3,4,8)
            cx=239 if low else 246
            ellipse(cx,338,112 if low else (88 if slender else 103),43 if low else (48 if slender else 57),'#b3a68818',2.1)
            path('M304 317 Q336 298 348 272 Q363 244 382 252 L410 273 Q413 287 387 298 L355 300 L335 326',2.2)
            if v in (1,3,4,8):
                path('M367 251 l-12 -37 32 25 M386 252 l15 -37 5 53',1.9)
            elif v in (2,5,9):
                path('M361 251 Q344 202 322 186 M369 247 Q379 200 404 186',2)
                if v==2:
                    path('M338 217 l-28 -20 M338 218 l12 -27 M389 216 l25 -23',1.4)
                if v==5:path('M390 296 q-3 21 11 29',1.3)
            ellipse(390,273,2.4,2.4,ink,.7)
            if low:
                for x in (172,227,296,331):path(f'M{x} 365 l-5 45 22 0',1.9)
            else:
                for x in (192,239,285,323):path(f'M{x} 370 l{-8 if x%2 else 3} 73 23 0',1.9)
            if v==1:
                path('M144 325 Q65 276 88 244 Q130 249 163 306 Q159 337 144 325 Z',2)
                for j in range(11):path(f'M{99+j*5} {263+j*4} l-12 -8',.9,.7)
            elif v in (4,8):path('M132 344 Q79 330 91 306 Q107 292 150 326',1.8)
            else:path('M148 319 Q113 287 117 264 Q144 278 160 308',1.7)
            if v==3:
                for j in range(6):path(f'M{357+j*7} {259+j*4} l-17 30',1.2,.65)
        for j in range(52):
            x=180+(j*19+v*7)%141; y=325+(j*13)%48
            path(f'M{x} {y} l{5+j%4} {2+j%3}',.65,.47)
        path('M103 455 Q262 447 421 456',1.15,.45)
    elif group=='kuş':
        path('M252 432 Q245 387 253 363 M265 430 Q266 388 260 363 M236 431 l21 0 M257 432 l23 0',2)
        ellipse(254,306,58+(v%3)*9,67,'#b3a68818',2.5)
        ellipse(290,233,29,32,'#b3a68818',2.2)
        path('M316 232 l42 8 -40 13 M265 252 Q269 272 270 283',2.1)
        ellipse(301,227,2,2,ink,.8)
        path('M221 288 Q164 339 202 376 Q233 355 267 308 M217 307 Q199 343 205 367 M230 304 Q213 342 217 363',1.8)
        for j in range(19):
            x=202+j*4; y=320+(j%5)*8
            path(f'M{x} {y} l-14 19',.7,.48)
        for j in range(5+(v%4)):
            path(f'M{211+j*8} {367+j%3*6} Q{170+j*9} 427 {149+j*8} 421',1.3,.8)
        path('M146 450 Q255 447 377 452',1.2,.45)
    else:
        # Firefly, moth, turtle, salamander, butterfly, lizard, frog, snail,
        # snake and crab have individual naturalist motifs.
        if v in (0,1,4):
            ellipse(251,344,20,54,'#92866e32',2.1)
            ellipse(251,283,23,20,'#a89c8333',1.8)
            path('M240 266 Q214 236 207 215 M261 266 Q288 237 295 214',1.25)
            wing=85 if v==4 else 68
            path(f'M228 308 Q{150-wing//3} 188 {152-wing//4} 259 Q136 321 226 351 M273 308 Q{350+wing//3} 188 {348+wing//4} 259 Q364 321 275 351',2.1)
            path('M224 352 Q123 327 157 398 Q207 421 244 374 M277 352 Q378 327 343 398 Q293 421 257 374',1.8)
            for j in range(4):
                path(f'M{235-j*3} {322+j*11} Q{171-j*4} {270+j*26} {155-j*2} {260+j*27}',.75,.55)
                path(f'M{266+j*3} {322+j*11} Q{329+j*4} {270+j*26} {345+j*2} {260+j*27}',.75,.55)
            if v==0:
                for j in range(6):ellipse(249,361+j*5,3,2,ink,.7)
        elif v==2:  # turtle
            ellipse(245,345,112,69,'#92866e25',2.3)
            path('M133 347 Q158 266 248 267 Q343 273 358 346 M170 291 l52 65 61 -83 M222 356 l48 50 60 -71 M283 274 l-13 82',1.7)
            ellipse(375,346,28,22,'#a89c8322',1.8)
            ellipse(391,340,2,2,ink,.8)
            for x,y in ((170,385),(309,385),(190,392),(326,371)):
                path(f'M{x} {y} q-13 26 14 31 l15 -25',1.65)
            path('M134 352 Q100 335 111 304',1.5)
        elif v==7:  # snail with spiral shell
            ellipse(225,324,84,78,'#a89c8322',2.1)
            path('M277 315 Q262 244 207 272 Q164 297 193 345 Q238 380 262 338 Q274 309 239 299 Q214 292 209 322 Q209 339 230 332',1.7)
            path('M140 388 Q206 373 281 388 Q327 394 349 364 Q365 329 361 298 M350 365 Q378 345 386 305 M361 298 l-4 -28 M386 305 l16 -26',2)
            ellipse(357,267,3,3,ink,.8);ellipse(403,277,3,3,ink,.8)
        elif v==8:  # coiled snake
            path('M125 344 C151 280 280 293 302 347 C322 391 224 397 205 357 C188 329 242 318 267 352 C295 389 358 367 368 313 Q375 268 410 267 L424 280 Q403 297 382 288',2.5)
            path('M130 351 C161 284 288 302 298 352 M203 356 Q221 386 268 374 M369 311 Q365 286 384 271',1.05,.58)
            ellipse(405,277,2,2,ink,.8)
            for j in range(14):path(f'M{158+j*14} {320+(j%3)*8} l7 9',.7,.5)
        elif v==9:  # crab
            ellipse(246,338,85,53,'#a89c8323',2.1)
            for j in range(4):
                path(f'M{185+j*20} 371 q-40 21 -43 54 M{280+j*17} 373 q40 19 43 52',1.55)
            path('M176 324 Q127 292 115 269 Q80 239 111 220 Q141 219 147 260 L130 272 M316 324 Q365 292 377 269 Q412 239 381 220 Q351 219 345 260 L362 272',2)
            path('M222 291 l-8 -31 M276 291 l8 -31',1.7)
            ellipse(214,256,3,3,ink,.8);ellipse(284,256,3,3,ink,.8)
        else:  # salamander, lizard or frog
            ellipse(247,333,103 if v==5 else 75,39 if v!=6 else 55,'#a89c8322',2)
            path('M323 320 Q358 302 389 318 L406 334 Q379 350 328 345 M146 338 Q101 320 81 338 Q100 351 148 348',2)
            for x,sgn in ((175,-1),(209,1),(288,-1),(317,1)):
                path(f'M{x} 355 q{sgn*24} 32 {sgn*49} 30 l{sgn*18} 20',1.7)
            if v==6:
                ellipse(366,313,7,9,'#a89c8322',1.4)
                path('M360 348 Q381 362 403 347',1.3)
            for j in range(18):
                x=185+(j*17)%120; y=310+(j*11)%33
                ellipse(x,y,2.1+(j%3),1.6,ink,.55)
            ellipse(386,326,2,2,ink,.8)
        path('M103 455 Q258 449 404 456',1.15,.44)
    # Paper flecks, graphite hatching and a slightly imperfect found-page border.
    hatch=[]
    for j in range(130):
        x=rng.randint(4,496); y=rng.randint(4,556)
        hatch.append(f'<circle cx="{x}" cy="{y}" r="{rng.choice((.35,.5,.65,1.1))}" fill="{pale}" opacity="{rng.choice((.12,.18,.25))}"/>')
    for j in range(55):
        x=rng.randint(62,438); y=rng.randint(74,499)
        hatch.append(f'<path d="M{x} {y} l{rng.randint(2,13)} -{rng.randint(2,6)}" stroke="{pale}" stroke-width=".55" opacity=".22"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 560" role="img" aria-label="Doğa defterinde kara kalem tür çizimi">'
      '<rect width="500" height="560" fill="#e5d6b8"/><path d="M2 7 Q85 2 165 8 T331 5 T498 6 V552 Q391 557 292 551 T101 556 T2 552 Z" fill="none" stroke="#9c8967" stroke-width="1.4" opacity=".42"/>'
      '<path d="M39 35 Q246 37 461 35 V525 Q251 522 39 525 Z M46 42 H454 V518 H46 Z" fill="none" stroke="#776c57" stroke-width=".85" opacity=".46"/>'
      '<path d="M66 64 h42 M392 64 h42 M66 496 h42 M392 496 h42" stroke="#655b4b" opacity=".45"/>'
      +''.join(hatch)+''.join(strokes)
      +f'<text x="250" y="507" text-anchor="middle" fill="#625746" font-size="11" font-family="serif" letter-spacing="4">FIELD NOTE · {html.escape(ident.upper())}</text></svg>')

def main():
    rows=species(); ART.mkdir(parents=True,exist_ok=True)
    for row in rows:
        (ART/row['image']).write_text(svg(row),encoding='utf-8')
    # Starter seed plates match the same archival art direction.
    for ident,base in [('seed_01','plant_081'),('seed_02','plant_051'),('seed_03','plant_071')]:
        sample=next(r for r in rows if r['id']==base)
        (ART/(ident+'.svg')).write_text(svg({**sample,'id':ident}),encoding='utf-8')
    payload=[{k:row[k] for k in ('id','category','name','kind','rarity','image','description','uses','conditions')} for row in rows]
    encoded=json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace("'","''")
    sql=f'''-- FNF v0.11.0 · 100 plants, 30 animals; independent descriptive field guide.
-- Existing starter ids stay stable. These entries have no harvest/breeding effects.
insert into fnf_private.codex_catalog
  (id,category,name,kind,rarity,image,description,uses,conditions)
select x.id,x.category,x.name,x.kind,x.rarity,x.image,x.description,x.uses,x.conditions
from jsonb_to_recordset('{encoded}'::jsonb) as x(
  id text,category text,name text,kind text,rarity text,image text,
  description text,uses text,conditions text)
on conflict(id) do update set category=excluded.category,name=excluded.name,
  kind=excluded.kind,rarity=excluded.rarity,image=excluded.image,
  description=excluded.description,uses=excluded.uses,conditions=excluded.conditions;

-- Existing rooms acquire undiscovered rows; room-init trigger handles future rooms.
insert into public.fnf_codex_reveals(room_id,entry_id)
select r.id,c.id from public.fnf_rooms r cross join fnf_private.codex_catalog c
on conflict(room_id,entry_id) do nothing;
'''
    (ROOT/'v15-field-guide.sql').write_text(sql,encoding='utf-8')
    print(f"Generated {sum(r['category']=='plant' for r in rows)} plants, {sum(r['category']=='animal' for r in rows)} animals and three seed plates")

if __name__=='__main__': main()
