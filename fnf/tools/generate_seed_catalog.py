"""Editable seed taxonomy. Run: python3 fnf/tools/generate_seed_catalog.py.

The 100 wild plant records are distinct species. Their propagules share an
illustration with the adult plant but have separate stock and farming rules.
"""
from pathlib import Path
import importlib.util
import json

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('fieldguide',Path(__file__).with_name('generate_fieldguide.py'))
fieldguide=importlib.util.module_from_spec(spec)
spec.loader.exec_module(fieldguide)

MAGIC=[
  ('Sis İnci Otu','ot','Gümüş Sis','sulak dere kıyısı','Saydam damarlı yaprakları sisin içinde inci gibi parıldar.','herbs','marsh,loam',4,2,55,100,-2,22),
  ('Yıldız Saçağı','çiçek','Yıldız Dönemi','yüksek orman açıklığı','Altı ince taç yaprağının ucunda yıldız tozu gibi noktalar taşır.','herbs','loam,sand',6,5,20,85,7,35),
  ('Seraf Çanı','çiçek','Yıldız Dönemi','rüzgârlı kayalık sırt','Altı kat çan biçimli çiçeği gece ışığını yansıtır.','herbs','loam,sand',8,5,15,75,8,38),
  ('Ay Perdesi Asması','sarmaşık','Gümüş Sis','gölgeli yaşlı ağaçlar','Soluk, ince yaprakları sisin üzerinde perde gibi katlanır.','herbs','loam,marsh',7,2,50,100,-4,24),
  ('Kırağı Mercanı','mantar','Gümüş Sis','soğuk çürük kütük','Dallanmış soluk spor gövdesi kırağıya benzeyen çizgiler taşır.','herbs','loam,marsh',5,1,70,100,-8,17),
  ('Alev Damarı Kökü','kök','Yıldız Dönemi','kurak taşlık oyuk','Kökün iç damarları yalnız yıldız gecelerinde sıcak bir iz bırakır.','herbs','sand,loam',9,5,10,70,12,42),
  ('Yankı Yosunu','yosun','Gümüş Sis','yankılı orman kayası','Katmanlı lifleri gece çiyinde gümüş halkalar oluşturur.','herbs','marsh,loam',5,1,55,100,-5,20),
  ('Gök Yağmuru Sazı','su bitkisi','Gümüş Sis','sığ ve durgun gölet','Uzun yapraklarında su damlası gibi küçük ışık izleri tutulur.','fodder','marsh',6,2,75,100,-3,24),
  ('Şafak Kapısı Düğümü','sarmaşık','Yıldız Dönemi','sıcak koru sınırı','Yaprak boğumları şafakla birlikte açılır, geceleri kapanır.','herbs','loam,sand',7,4,30,90,7,36),
  ('Uyku Çanı','çiçek','Gümüş Sis','nemli patika açıklığı','Aşağı bakan soluk çiçekleri gece ağır bir koku yayar.','herbs','loam,marsh',5,2,55,100,0,23),
  ('Gökyüzü Darısı','tahıl','Yıldız Dönemi','yüksek ve rüzgârlı çayır','Tanelerinin kabuğunda ince yıldız çizgileri bulunur.','grain','loam,sand',7,5,20,80,6,34),
  ('Eşik Ağacı','ağaç','Gümüş Sis,Yıldız Dönemi','sisli eski orman sınırı','Gövdesi çatallanır; yeni filizleri iki farklı mevsimde de yeşerir.','wood','loam,marsh',30,2,40,100,-5,31),
  ('Ay Camı Armudu','ağaç','Gümüş Sis','dere kenarındaki yaşlı koru','İnce kabuklu iri armutları sisli gecede yarı saydam görünür.','food','loam,marsh',25,3,45,95,-3,26),
  ('Kızıl Yıldız Elması','ağaç','Yıldız Dönemi','yüksek ve açık meyve bahçesi','Beş köşeli çiçek izleri taşıyan koyu kızıl elmaları dallarında olgunlaşır.','food','loam',26,5,25,80,7,36),
  ('Serap İnciri','ağaç','Yıldız Dönemi','sıcak kayalık vadi','Geniş yapraklarının altında damla biçimli çizgili incir salkımları yetişir.','food','sand,loam',22,6,15,65,12,42),
  ('Ay Sis Böğürtleni','çalı','Gümüş Sis','ıslak çalılık ve orman kıyısı','Dikenli dallarında çiy altında parlayan koyu renkli böğürtlen kümeleri taşır.','food','loam,marsh',9,3,45,100,-2,25),
  ('Melek Narısı','çalı','Yıldız Dönemi','rüzgârdan korunaklı taş teras','Dallarından sarkan küçük kabuklu narların taçları altı sivri dişlidir.','food','loam,sand',13,5,20,75,9,39),
  ('Gümüş Çiy Üzümü','sarmaşık','Gümüş Sis','yaşlı söğütlere sarılan nemli kıyı','Yapraklarının arasından ağır, yuvarlak, çiy kaplı üzüm salkımları iner.','food','loam,marsh',11,3,50,100,-1,26),
]

SOILS={
  'ağaç':['loam','loam','loam','marsh','loam','sand'],
  'çiçek':['loam','sand','loam','marsh'],
  'ot':['loam','marsh','loam','sand'],
  'mantar':['loam','marsh'],
  'su bitkisi':['marsh'],
  'çalı':['loam','sand','marsh'],
  'sarmaşık':['loam','marsh'],
  'kök':['loam','sand','marsh'],
  'tahıl':['loam','sand'],
  'yosun':['marsh','loam'],
}
YIELD={'ağaç':'wood','çiçek':'herbs','ot':'herbs','mantar':'herbs','su bitkisi':'fodder','çalı':'food','sarmaşık':'herbs','kök':'food','tahıl':'grain','yosun':'herbs'}
GROW={'ağaç':24,'çiçek':5,'ot':4,'mantar':4,'su bitkisi':5,'çalı':9,'sarmaşık':8,'kök':6,'tahıl':4,'yosun':5}
SEASONS={
  'ağaç':['Bahar','Yaz','Güz'], 'çiçek':['Bahar','Yaz'],
  'ot':['Bahar','Güz'], 'mantar':['Güz','Gümüş Sis'],
  'su bitkisi':['Bahar','Yaz','Gümüş Sis'], 'çalı':['Yaz','Güz'],
  'sarmaşık':['Bahar','Yaz','Yıldız Dönemi'], 'kök':['Güz','Kış'],
  'tahıl':['Bahar','Yaz','Yıldız Dönemi'], 'yosun':['Güz','Kış','Gümüş Sis'],
}
SOIL_NAMES={'loam':'tınlı','sand':'kumlu','marsh':'sulak'}
YIELD_NAMES={'wood':'odun','herbs':'ot','food':'yiyecek','fodder':'yem','grain':'tahıl'}
STARTER={'plant_081':'seed_01','plant_051':'seed_02','plant_071':'seed_03'}

def entries():
    plants=[p for p in fieldguide.species() if p['category']=='plant']
    ids=set(); names=set(); seeds=[]; adults=[]
    for p in plants:
        group=p['group']; i=p['index']; sid=STARTER.get(p['id'],f"seed_{p['id']}")
        season=SEASONS[group][i%len(SEASONS[group]):]+SEASONS[group][:i%len(SEASONS[group])]
        # Never hide the only growing season behind an arbitrary choice.
        chosen=season[:2] if len(season)>2 else season
        soils=SOILS[group][:2] if group not in ('su bitkisi','mantar') else SOILS[group]
        sun=1 if group in ('mantar','yosun') else 3 if group in ('ot','sarmaşık','ağaç') else 5
        hum=(60,100) if group in ('mantar','su bitkisi','yosun') else (20,95)
        temp=(-8,28) if 'Kış' in chosen or 'Gümüş Sis' in chosen else (4,39)
        growth=GROW[group]+i%3+(i%4 if group=='ağaç' else 0)
        yield_resource='herbs' if p['id']=='plant_071' else YIELD[group]
        phrase='; '.join([f"{', '.join(SOIL_NAMES[s] for s in soils)} toprak",', '.join(chosen),f"{growth} uygun büyüme günü",'günlük su',f"güneş ≥{sun}, nem %{hum[0]}–{hum[1]}, sıcaklık {temp[0]}–{temp[1]}°C"])
        label='sporları' if group in ('mantar','yosun') else 'rizomu' if group=='su bitkisi' else 'çeliği' if group=='sarmaşık' else 'tohumu'
        image=f"{p['id']}.webp" if (ROOT/'assets'/'codex'/f"{p['id']}.webp").exists() else p['image']
        seeds.append(dict(id=sid,category='seed',name=f"{p['name']} {label}",kind=f"{p['kind']} çoğaltım malzemesi",rarity=p['rarity'],image=image,description=f"{p['name']} türünün {label}; yetişkin örnek {p['conditions'].split(';')[0].lower()} çevresinde görülür. {p['description'].split('.')[0]}.",uses=f"Hasatta {YIELD_NAMES[yield_resource]} kaynağı ve yeniden ekimlik malzeme verir.",conditions=phrase,growth_days=growth,soils=soils,seasons=chosen,min_sun=sun,min_humidity=hum[0],max_humidity=hum[1],min_temperature=temp[0],max_temperature=temp[1],plant_id=p['id'],yield_resource=yield_resource,is_magic='Gümüş Sis' in chosen or 'Yıldız Dönemi' in chosen))
    for i,(name,group,season,habitat,form,yield_resource,soils,growth,sun,hlo,hhi,tlo,thi) in enumerate(MAGIC,1):
        pid=f'plant_m{i:03d}'; sid=f'seed_m{i:03d}'
        season_list=season.split(',');soil_list=soils.split(',')
        conditions='; '.join([f"{', '.join(SOIL_NAMES[s] for s in soil_list)} toprak",', '.join(season_list),f"{growth} uygun büyüme günü",'günlük su',f"güneş ≥{sun}, nem %{hlo}–{hhi}, sıcaklık {tlo}–{thi}°C"])
        adults.append(dict(id=pid,category='plant',name=name,kind=group.capitalize(),rarity='Çok nadir',image=f'{sid}.webp',description=f'{name}, {habitat} içinde bulunur. {form}',uses='Manevi etki için otomatik kural yok; DM araştırmayla anlamını açar.',conditions=f'Doğal yaşam: {habitat}; {season} döneminde ortaya çıkar.',is_magic=True))
        seeds.append(dict(id=sid,category='seed',name=f'{name} tohumu' if group!='mantar' else f'{name} sporları',kind=f'{group.capitalize()} çoğaltım malzemesi',rarity='Çok nadir',image=f'{sid}.webp',description=f'{name} türünün çoğaltım kaydı. {form}',uses=f'Hasatta {YIELD_NAMES[yield_resource]} kaynağı ve yeniden ekimlik malzeme verir; doğaüstü etkisi DM araştırmasıyla açılır.',conditions=conditions,growth_days=growth,soils=soil_list,seasons=season_list,min_sun=sun,min_humidity=hlo,max_humidity=hhi,min_temperature=tlo,max_temperature=thi,plant_id=pid,yield_resource=yield_resource,is_magic=True))
    for s in seeds:
        assert s['id'] not in ids and s['name'] not in names
        ids.add(s['id']);names.add(s['name'])
    assert len(seeds)==118 and len(adults)==18 and len(plants)==100
    return seeds,adults

def main():
    seeds,adults=entries()
    rows=seeds+adults
    payload=json.dumps(rows,ensure_ascii=False,separators=(',',':')).replace("'","''")
    illustrated=[p['id'] for p in fieldguide.species() if p['category']=='plant' and (ROOT/'assets'/'codex'/f"{p['id']}.webp").exists()]
    illustrated_sql=','.join("'"+name+"'" for name in illustrated)
    sql=f'''-- v0.12.0: 118 plantable seeds, eighteen magical adult species.
-- Starter IDs and existing discovery states remain stable.
alter table fnf_private.codex_catalog add column if not exists plant_id text;
alter table fnf_private.codex_catalog add column if not exists yield_resource text;
alter table fnf_private.codex_catalog add column if not exists is_magic boolean not null default false;
alter table fnf_private.codex_catalog add constraint fnf_seed_yield_resource
  check(yield_resource is null or yield_resource in ('wood','herbs','food','fodder','grain'));

insert into fnf_private.codex_catalog(id,category,name,kind,rarity,image,description,uses,conditions,
  growth_days,soils,seasons,min_sun,min_humidity,max_humidity,min_temperature,max_temperature,
  plant_id,yield_resource,is_magic)
select x.id,x.category,x.name,x.kind,x.rarity,x.image,x.description,x.uses,x.conditions,
  x.growth_days,x.soils,x.seasons,x.min_sun,x.min_humidity,x.max_humidity,x.min_temperature,
  x.max_temperature,x.plant_id,x.yield_resource,x.is_magic
from jsonb_to_recordset('{payload}'::jsonb) as x(
  id text,category text,name text,kind text,rarity text,image text,description text,uses text,
  conditions text,growth_days integer,soils text[],seasons text[],min_sun smallint,
  min_humidity smallint,max_humidity smallint,min_temperature smallint,max_temperature smallint,
  plant_id text,yield_resource text,is_magic boolean)
on conflict(id) do update set
  name=excluded.name,kind=excluded.kind,rarity=excluded.rarity,image=excluded.image,
  description=excluded.description,uses=excluded.uses,conditions=excluded.conditions,
  growth_days=excluded.growth_days,soils=excluded.soils,seasons=excluded.seasons,
  min_sun=excluded.min_sun,min_humidity=excluded.min_humidity,max_humidity=excluded.max_humidity,
  min_temperature=excluded.min_temperature,max_temperature=excluded.max_temperature,
  plant_id=excluded.plant_id,yield_resource=excluded.yield_resource,is_magic=excluded.is_magic;

update fnf_private.codex_catalog set image=id||'.webp' where id in ({illustrated_sql});
update fnf_private.codex_catalog set conditions=replace(conditions,
  'Üretim ve yetiştirme kuralı henüz yok.','Ekim koşulları eşleşen tohum kaydında bulunur.')
where category='plant' and id not like 'plant_m%';
update fnf_private.codex_catalog set uses='Meyvesi hasatta yiyecek stoğuna girer. Özel etkisini DM keşifle açar.'
where category='plant' and id between 'plant_051' and 'plant_060';

update fnf_private.codex_catalog set plant_id='plant_081',yield_resource='grain' where id='seed_01';
update fnf_private.codex_catalog set plant_id='plant_051',yield_resource='food' where id='seed_02';
update fnf_private.codex_catalog set plant_id='plant_071',yield_resource='herbs' where id='seed_03';

insert into public.fnf_codex_reveals(room_id,entry_id)
select r.id,c.id from public.fnf_rooms r cross join fnf_private.codex_catalog c
on conflict(room_id,entry_id) do nothing;
insert into public.fnf_seed_stock(room_id,seed_id,amount)
select r.id,c.id,0 from public.fnf_rooms r cross join fnf_private.codex_catalog c
where c.category='seed' on conflict(room_id,seed_id) do nothing;
'''
    (ROOT/'v17-seeds-and-magic-seasons.sql').write_text(sql,encoding='utf-8')
    print(f"{len(seeds)} seed records, {len(adults)} new magical plants")

if __name__=='__main__':main()
