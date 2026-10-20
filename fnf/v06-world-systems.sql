-- FNF v0.7.0 · One room-scoped simulation ledger. Apply after v05.
-- Balance values are starting values; all authority stays in database RPCs.
alter table public.fnf_farm_plots
  add column area smallint not null default 1 check (area between 1 and 5),
  add column fertility smallint not null default 80 check (fertility between 20 and 100),
  add column care smallint not null default 0 check (care between 0 and 2),
  add column fertilizer smallint not null default 0 check (fertilizer between 0 and 2),
  add column magic smallint not null default 0 check (magic between 0 and 2);

alter table fnf_private.codex_catalog
  add column min_sun smallint,
  add column min_humidity smallint,
  add column max_humidity smallint,
  add column min_temperature smallint,
  add column max_temperature smallint;
update fnf_private.codex_catalog set min_sun=5,min_humidity=20,max_humidity=80,
  min_temperature=8,max_temperature=32,
  conditions='Tınlı/kumlu; bahar-yaz; günlük su; güneş ≥5, nem %20–80, sıcaklık 8–32°C.'
  where id='seed_01';
update fnf_private.codex_catalog set min_sun=4,min_humidity=50,max_humidity=90,
  min_temperature=12,max_temperature=28,
  conditions='Tınlı/sulak; bahar-yaz; günlük su; güneş ≥4, nem %50–90, sıcaklık 12–28°C.'
  where id='seed_02';
update fnf_private.codex_catalog set min_sun=2,min_humidity=65,max_humidity=100,
  min_temperature=-5,max_temperature=16,
  conditions='Sulak; güz-kış; günlük su; güneş ≥2, nem %65–100, sıcaklık -5–16°C.'
  where id='seed_03';

create table public.fnf_sim_state (
  room_id uuid primary key references public.fnf_rooms(id) on delete cascade,
  world_seed text not null,
  climate text not null default 'Ilıman' check (climate in ('Ilıman','Kurak','Nemli','Soğuk')),
  phase smallint not null default 0 check (phase between 0 and 2),
  weather_phases jsonb not null default '["Açık","Açık","Serin"]'::jsonb,
  conditions jsonb not null default '{"sun":6,"humidity":55,"temperature":18}'::jsonb,
  resources jsonb not null default '{"coin":60,"wood":18,"stone":12,"grain":8,"food":10,"fodder":8,"ore":0,"herbs":0,"fertilizer":2}'::jsonb,
  buildings jsonb not null default '{"hall":1,"warehouse":1,"barn":1,"study":0,"tavern":0,"palisade":0}'::jsonb,
  population smallint not null default 3 check (population between 0 and 300),
  morale smallint not null default 65 check (morale between 0 and 100),
  visitors jsonb not null default '[]'::jsonb,
  villagers jsonb not null default '[{"name":"Aren","species":"human","class_id":"villager","skill":"botany","ability":11},{"name":"Mira","species":"elf","class_id":"nature","skill":"research","ability":12},{"name":"Boran","species":"dwarf","class_id":"engineering","skill":"craft","ability":12}]'::jsonb,
  animals jsonb not null default '[{"id":"A1","kind":"animal_01","sex":"F","age":2,"yield":2,"hardiness":2,"blessing":false},{"id":"A2","kind":"animal_01","sex":"M","age":2,"yield":3,"hardiness":2,"blessing":false}]'::jsonb,
  research jsonb not null default '{"active":null,"progress":0,"done":[]}'::jsonb,
  market jsonb not null default '{"wood":0,"stone":0,"grain":0,"food":0,"fodder":0,"ore":0,"herbs":0,"fertilizer":0}'::jsonb,
  threat smallint not null default 0 check (threat between 0 and 100),
  extortion_due integer not null default 0,
  favor smallint not null default 0 check (favor between 0 and 100),
  omen jsonb not null default '{"text":"Henüz bir alamet görülmedi.","task":null,"due":null}'::jsonb,
  news text not null default 'Han yolu sakindir; ilk yolcular bekleniyor.',
  last_result text not null default 'Yerleşim yeni kuruldu.',
  last_explore_day integer not null default 0,
  last_ask_day integer not null default 0,
  last_tavern_day integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.fnf_sim_state enable row level security;
revoke all on public.fnf_sim_state from public,anon,authenticated;

create table public.fnf_player_progress (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp between 0 and 1000000),
  skill_xp jsonb not null default '{}'::jsonb,
  primary key(room_id,user_id)
);
alter table public.fnf_player_progress enable row level security;
revoke all on public.fnf_player_progress from public,anon,authenticated;

create function fnf_private.init_sim()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.fnf_sim_state(room_id,world_seed)
    values(new.id,substr(md5(new.id::text),1,8));
  return new;
end;
$$;
create trigger fnf_room_sim_after_insert
after insert on public.fnf_rooms for each row execute function fnf_private.init_sim();
insert into public.fnf_sim_state(room_id,world_seed)
  select id,substr(md5(id::text),1,8) from public.fnf_rooms on conflict do nothing;
update public.fnf_day_log set season=(array['Bahar','Yaz','Güz','Kış'])[1+(((day-1)/10)%4)];

-- All integer resources have explicit weight and bulk. The two limits are different:
-- warehouse uses weight, and a single caravan trip uses bulk.
create function fnf_private.weight(p_resources jsonb)
returns integer language sql immutable set search_path = '' as $$
  select coalesce(sum((value::integer)*case key
    when 'wood' then 3 when 'stone' then 4 when 'ore' then 4
    when 'grain' then 2 when 'food' then 2 when 'fodder' then 2
    when 'herbs' then 1 when 'fertilizer' then 2 else 0 end),0)::integer
  from jsonb_each_text(p_resources) where value ~ '^[0-9]+$';
$$;
create function fnf_private.bulk(p_resource text)
returns integer language sql immutable set search_path = '' as $$
  select case p_resource
    when 'wood' then 3 when 'stone' then 2 when 'ore' then 2
    when 'grain' then 1 when 'food' then 1 when 'fodder' then 2
    when 'herbs' then 1 when 'fertilizer' then 1 else 0 end;
$$;
create function fnf_private.roll(p_seed text,p_day integer,p_salt text,p_mod integer)
returns integer language sql immutable set search_path = '' as $$
  select mod(abs(hashtext(p_seed||':'||p_day||':'||p_salt')::bigint),p_mod)::integer;
$$;
create function fnf_private.price(p_resource text,p_day integer,p_season text,p_climate text,p_demand integer)
returns integer language sql immutable set search_path = '' as $$
  select greatest(1, (case p_resource
    when 'wood' then 3 when 'stone' then 4 when 'grain' then 2
    when 'food' then 4 when 'fodder' then 2 when 'ore' then 8
    when 'herbs' then 6 when 'fertilizer' then 5 else 1 end)
    + p_demand + case when p_season='Kış' and p_resource in ('food','fodder','wood') then 2 else 0 end
    + case when p_climate='Kurak' and p_resource in ('grain','food') then 1 else 0 end
    + (p_day%3)-1);
$$;

create function fnf_private.sim_snapshot(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base jsonb; s public.fnf_sim_state%rowtype; d integer; season text;
begin
  base:=fnf_private.snapshot(p_room_id);
  if base ? 'error' then return base; end if;
  select * into s from public.fnf_sim_state where room_id=p_room_id;
  d:=(base->>'day')::integer;
  season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((d-1)/10)%4)];
  return base || jsonb_build_object(
    'season',season,'sim',to_jsonb(s)-'room_id',
    'progress',coalesce((select jsonb_build_object('xp',p.xp,'skill_xp',p.skill_xp)
      from public.fnf_player_progress p where p.room_id=p_room_id and p.user_id=auth.uid()),
      '{"xp":0,"skill_xp":{}}'::jsonb),
    'capacity',180+80*(s.buildings->>'warehouse')::integer,
    'weight',fnf_private.weight(s.resources),
    'carry',25+5*(s.buildings->>'barn')::integer,
    'quotes',coalesce((select jsonb_object_agg(m.key,jsonb_build_object(
      'buy',fnf_private.price(m.key,d,season,s.climate,m.value::integer),
      'sell',greatest(1,fnf_private.price(m.key,d,season,s.climate,m.value::integer)-1),
      'weight',case m.key when 'wood' then 3 when 'stone' then 4 when 'ore' then 4
        when 'herbs' then 1 else 2 end,
      'bulk',fnf_private.bulk(m.key),
      'density',round((case m.key when 'wood' then 3 when 'stone' then 4 when 'ore' then 4
        when 'herbs' then 1 else 2 end)::numeric/greatest(1,fnf_private.bulk(m.key)),2)))
      from jsonb_each_text(s.market) m),'{}'::jsonb),
    'plots',coalesce((select jsonb_agg(jsonb_build_object(
      'slot',p.slot,'soil',p.soil,'seed_id',p.seed_id,'growth',p.growth,
      'watered',p.watered,'area',p.area,'fertility',p.fertility,
      'care',p.care,'fertilizer',p.fertilizer,'magic',p.magic,
      'ready',coalesce(p.growth>=c.growth_days,false)) order by p.slot)
      from public.fnf_farm_plots p
      left join fnf_private.codex_catalog c on c.id=p.seed_id
      where p.room_id=p_room_id),'[]'::jsonb)
  );
end;
$$;
create function public.fnf_sim_snapshot(p_room_id uuid)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.sim_snapshot(p_room_id);
$$;
create or replace function public.fnf_world_snapshot(p_room_id uuid)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.sim_snapshot(p_room_id);
$$;

create function fnf_private.sim_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s public.fnf_sim_state%rowtype; w public.fnf_world%rowtype;
  actor uuid:=auth.uid(); role text; r jsonb; b jsonb; visitors jsonb; animals jsonb;
  research jsonb; market jsonb; omen jsonb; target text; choice text; discovery text;
  qty integer; cost integer; price integer; current_level integer; i integer;
  a jsonb; mate jsonb; child jsonb; result text:='İşlem tamamlandı.'; skill text;
  season text; capacity integer; carry integer;
begin
  select m.role into role from public.fnf_room_members m
    where m.room_id=p_room_id and m.user_id=actor;
  if role is null or (role='player' and not exists(
    select 1 from public.fnf_characters c where c.room_id=p_room_id and c.user_id=actor))
  then return jsonb_build_object('error','Önce odada karakter oluştur.'); end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>2000
  then return jsonb_build_object('error','İşlem verisi geçersiz.'); end if;
  select * into w from public.fnf_world where room_id=p_room_id for update;
  select * into s from public.fnf_sim_state where room_id=p_room_id for update;
  r:=s.resources; b:=s.buildings; visitors:=s.visitors; animals:=s.animals;
  research:=s.research; market:=s.market; omen:=s.omen;
  season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/10)%4)];
  capacity:=180+80*(b->>'warehouse')::integer;
  carry:=25+5*(b->>'barn')::integer;
  target:=p_payload->>'target'; choice:=p_payload->>'choice';

  if p_action='set_world' then
    if role<>'dm' or w.day<>1 then return jsonb_build_object('error','Dünya tohumu yalnız DM tarafından ilk gün seçilir.'); end if;
    if char_length(coalesce(target,'')) not between 4 and 32 or target !~ '^[a-zA-Z0-9_-]+$'
       or coalesce(choice,'') not in ('Ilıman','Kurak','Nemli','Soğuk')
    then return jsonb_build_object('error','4–32 karakterlik tohum ve geçerli iklim seç.'); end if;
    s.world_seed:=target;s.climate:=choice;
    result:='Dünya tohumu ve iklim kaydedildi.';
  elsif p_action='phase' then
    if role<>'dm' or s.phase>=2 then return jsonb_build_object('error','Günün sonraki evresi yok. Yeni günü DM geçirir.'); end if;
    s.phase:=s.phase+1;
    update public.fnf_world set weather=s.weather_phases->>s.phase,updated_at=now() where room_id=p_room_id;
    result:='Günün hava evresi değişti.';
  elsif p_action='field' then
    if coalesce(target,'') !~ '^[1-4]$' or coalesce(choice,'') not in ('expand','care','fertilize','magic','restore')
    then return jsonb_build_object('error','Geçersiz tarla işlemi.'); end if;
    if choice='expand' then
      if role<>'dm' or (r->>'wood')::integer<4 then return jsonb_build_object('error','Tarla genişletmek için 4 odun ve DM gerekir.'); end if;
      update public.fnf_farm_plots set area=area+1 where room_id=p_room_id and slot=target::integer and area<5;
      if not found then return jsonb_build_object('error','Tarla en geniş alanında.'); end if;
      r:=jsonb_set(r,'{wood}',to_jsonb((r->>'wood')::integer-4));
      result:='Tarla alanı büyüdü.';
    elsif choice='care' then
      update public.fnf_farm_plots set care=care+1 where room_id=p_room_id and slot=target::integer and seed_id is not null and care<2;
      if not found then return jsonb_build_object('error','Ekin yok ya da bakım sınırına ulaşıldı.'); end if;
      result:='Ekinle ilgilenildi; hasat verimi yükseldi.';
    elsif choice='fertilize' then
      if (r->>'fertilizer')::integer<1 then return jsonb_build_object('error','Gübre yok.'); end if;
      update public.fnf_farm_plots set fertilizer=fertilizer+1 where room_id=p_room_id and slot=target::integer and seed_id is not null and fertilizer<2;
      if not found then return jsonb_build_object('error','Ekin yok ya da gübre sınırına ulaşıldı.'); end if;
      r:=jsonb_set(r,'{fertilizer}',to_jsonb((r->>'fertilizer')::integer-1));
      result:='Gübre kullanıldı.';
    elsif choice='magic' then
      if s.favor<2 then return jsonb_build_object('error','Büyü için 2 ilahi lütuf gerekli.'); end if;
      update public.fnf_farm_plots set magic=magic+1 where room_id=p_room_id and slot=target::integer and seed_id is not null and magic<2;
      if not found then return jsonb_build_object('error','Ekin yok ya da büyü sınırına ulaşıldı.'); end if;
      s.favor:=s.favor-2;result:='Ekin kutsandı.';
    else
      if (r->>'fertilizer')::integer<1 then return jsonb_build_object('error','Toprağı yenilemek için gübre gerekli.'); end if;
      update public.fnf_farm_plots set fertility=least(100,fertility+15) where room_id=p_room_id and slot=target::integer and fertility<100;
      if not found then return jsonb_build_object('error','Toprak zaten verimli.'); end if;
      r:=jsonb_set(r,'{fertilizer}',to_jsonb((r->>'fertilizer')::integer-1));
      result:='Toprak verimliliği arttı.';
    end if;
  elsif p_action='build' then
    if role<>'dm' or coalesce(target,'') not in ('warehouse','barn','study','tavern','palisade')
    then return jsonb_build_object('error','Yapıyı yalnız DM kurabilir.'); end if;
    current_level:=(b->>target)::integer;
    if current_level>=3 then return jsonb_build_object('error','Yapı en yüksek seviyesinde.'); end if;
    cost:=4+3*current_level;
    if (r->>'wood')::integer<cost or (r->>'stone')::integer<2+current_level
    then return jsonb_build_object('error',format('%s odun ve %s taş gerekli.',cost,2+current_level)); end if;
    r:=jsonb_set(jsonb_set(r,'{wood}',to_jsonb((r->>'wood')::integer-cost)),
      '{stone}',to_jsonb((r->>'stone')::integer-2-current_level));
    b:=jsonb_set(b,array[target],to_jsonb(current_level+1));
    result:='Yapı kuruldu veya yükseltildi.';
  elsif p_action='trade' then
    if coalesce(target,'') not in ('wood','stone','grain','food','fodder','ore','herbs','fertilizer')
       or coalesce(choice,'') not in ('buy','sell') or coalesce(p_payload->>'amount','') !~ '^[0-9]{1,2}$'
    then return jsonb_build_object('error','Geçerli mal, işlem ve miktar seç.'); end if;
    qty:=(p_payload->>'amount')::integer;
    if qty<1 or qty>20 or qty*fnf_private.bulk(target)>carry
    then return jsonb_build_object('error','Tek seferde kervan taşıma sınırı aşıldı.'); end if;
    price:=fnf_private.price(target,w.day,season,s.climate,(market->>target)::integer);
    if choice='buy' then
      cost:=qty*price;
      if (r->>'coin')::integer<cost then return jsonb_build_object('error','Para yetersiz.'); end if;
      if fnf_private.weight(r)+qty*(case target when 'wood' then 3 when 'stone' then 4 when 'ore' then 4 when 'herbs' then 1 else 2 end)>capacity
      then return jsonb_build_object('error','Depo ağırlık sınırı dolu.'); end if;
      r:=jsonb_set(jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer-cost)),
        array[target],to_jsonb((r->>target)::integer+qty));
      market:=jsonb_set(market,array[target],to_jsonb(least(3,(market->>target)::integer+1)));
      result:=format('%s birim alındı. Arz-talep değişti.',qty);
    else
      if (r->>target)::integer<qty then return jsonb_build_object('error','Depoda yeterli mal yok.'); end if;
      r:=jsonb_set(jsonb_set(r,array[target],to_jsonb((r->>target)::integer-qty)),
        '{coin}',to_jsonb((r->>'coin')::integer+qty*greatest(1,price-1)));
      market:=jsonb_set(market,array[target],to_jsonb(greatest(-3,(market->>target)::integer-1)));
      result:=format('%s birim satıldı. Arz-talep değişti.',qty);
    end if;
  elsif p_action='breed' then
    if (b->>'barn')::integer<1 or jsonb_array_length(animals)>=2+4*(b->>'barn')::integer
       or (r->>'fodder')::integer<2
    then return jsonb_build_object('error','Ahır, yem veya boş hayvan yeri gerekli.'); end if;
    select value into a from jsonb_array_elements(animals) value where value->>'id'=target;
    select value into mate from jsonb_array_elements(animals) value where value->>'id'=choice;
    if a is null or mate is null or target=choice or a->>'kind'<>mate->>'kind'
      or a->>'sex'=mate->>'sex' or (a->>'age')::integer<2 or (mate->>'age')::integer<2
    then return jsonb_build_object('error','Aynı türden yetişkin dişi ve erkek seç.'); end if;
    i:=jsonb_array_length(animals)+1;
    child:=jsonb_build_object('id','A'||i,'kind',a->>'kind',
      'sex',case when fnf_private.roll(s.world_seed,w.day,target||choice||i,2)=0 then 'F' else 'M' end,
      'age',0,
      'yield',greatest(1,least(5,round(((a->>'yield')::numeric+(mate->>'yield')::numeric)/2)::integer
        +fnf_private.roll(s.world_seed,w.day,'gene-y'||i,3)-1)),
      'hardiness',greatest(1,least(5,round(((a->>'hardiness')::numeric+(mate->>'hardiness')::numeric)/2)::integer
        +fnf_private.roll(s.world_seed,w.day,'gene-h'||i,3)-1)),
      'blessing',fnf_private.roll(s.world_seed,w.day,'blessing'||i,100)=0);
    animals:=animals||jsonb_build_array(child);
    r:=jsonb_set(r,'{fodder}',to_jsonb((r->>'fodder')::integer-2));
    result:=case when child->>'blessing'='true' then 'Nadir doğum nimetiyle bir yavru doğdu.' else 'Yeni yavru doğdu; özellikleri ebeveynlerinden aktarıldı.' end;
  elsif p_action='research' then
    if role<>'dm' or coalesce(target,'') not in ('seedcraft','husbandry','weather','faith')
      or (b->>'study')::integer<1 or target=any(array(select jsonb_array_elements_text(research->'done')))
      or research->>'active' is not null
    then return jsonb_build_object('error','Araştırma için çalışma evi ve boş proje yuvası gerekli.'); end if;
    if (r->>'coin')::integer<6 then return jsonb_build_object('error','Araştırma 6 para ister.'); end if;
    r:=jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer-6));
    research:=jsonb_build_object('active',target,'progress',0,'done',research->'done');
    result:='Araştırma başladı; her DM günü ilerler.';
  elsif p_action='recruit' then
    if role<>'dm' or coalesce(p_payload->>'index','') !~ '^[0-9]{1,2}$' then return jsonb_build_object('error','Yolcuyu yalnız DM yerleştirir.'); end if;
    i:=(p_payload->>'index')::integer;
    if i>=jsonb_array_length(visitors) or (r->>'food')::integer<2 or s.population>=300
    then return jsonb_build_object('error','Yolcu bulunamadı veya 2 yiyecek gerekli.'); end if;
    s.villagers:=s.villagers||jsonb_build_array(visitors->i);
    visitors:=(select coalesce(jsonb_agg(value order by ord),'[]'::jsonb) from jsonb_array_elements(visitors) with ordinality t(value,ord) where ord<>i+1);
    r:=jsonb_set(r,'{food}',to_jsonb((r->>'food')::integer-2));
    s.population:=s.population+1;result:='Yolcu köye katıldı.';
  elsif p_action='explore' then
    if s.last_explore_day=w.day then return jsonb_build_object('error','Bugün zaten keşfe çıkıldı.'); end if;
    target:=(array['wood','stone','herbs','ore'])[1+fnf_private.roll(s.world_seed,w.day,'explore',4)];
    qty:=1+fnf_private.roll(s.world_seed,w.day,'explore-qty',3);
    r:=jsonb_set(r,array[target],to_jsonb((r->>target)::integer+qty));
    s.threat:=least(100,s.threat+2);
    s.last_explore_day:=w.day;
    result:=format('Gün %s keşfi: %s birim %s bulundu. İzler DM tarafından ansiklopedide açılabilir.',w.day,qty,target);
  elsif p_action='ask' then
    if s.last_ask_day=w.day or coalesce(target,'') !~ '^[0-2]$'
      or (r->>'coin')::integer<1
    then return jsonb_build_object('error','Günde bir yolcuya soru sorulur; 1 para gerekli.'); end if;
    i:=target::integer;
    if i>=jsonb_array_length(visitors)
    then return jsonb_build_object('error','Sorulacak yolcu yok.'); end if;
    discovery:=case visitors->i->>'skill'
      when 'botany' then 'plant_01' when 'craft' then 'seed_03'
      when 'exploration' then 'animal_02' else 'animal_01' end;
    update public.fnf_codex_reveals set image_open=true
      where room_id=p_room_id and entry_id=discovery;
    r:=jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer-1));
    s.last_ask_day:=w.day;
    result:='Yolcunun anlattığı iz ansiklopedide resim olarak açıldı.';
  elsif p_action='tavern' then
    if (b->>'tavern')::integer<1 then return jsonb_build_object('error','Han önce kurulmalı.'); end if;
    if choice='drink' then
      if (r->>'coin')::integer<2 then return jsonb_build_object('error','İçecek 2 para.'); end if;
      r:=jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer-2));
      s.morale:=least(100,s.morale+3);result:='Han sohbeti morali yükseltti.';
    elsif choice='game' then
      if (r->>'coin')::integer<2 or s.last_tavern_day=w.day
      then return jsonb_build_object('error','Günde bir han oyunu oynanır; 2 para gerekli.'); end if;
      cost:=case when fnf_private.roll(s.world_seed,w.day,'tavern-game',2)=0 then 4 else -2 end;
      r:=jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer+cost));
      s.last_tavern_day:=w.day;
      result:=format('Gün %s han oyunu: %s para.',w.day,cost);
    else return jsonb_build_object('error','Han işlemi geçersiz.'); end if;
  elsif p_action='omen' then
    if role<>'dm' or omen->>'task' is null then return jsonb_build_object('error','Bekleyen alamet yok.'); end if;
    if choice='help' then
      if (r->>'food')::integer<3 then return jsonb_build_object('error','Görevi tamamlamak için 3 yiyecek gerekli.'); end if;
      r:=jsonb_set(r,'{food}',to_jsonb((r->>'food')::integer-3));
      s.favor:=least(100,s.favor+5);result:='Yardımcı elçinin isteği yerine getirildi; lütuf arttı.';
    elsif choice='refuse' then
      s.threat:=least(100,s.threat+3);result:='İstek reddedildi; uğursuz işaret güçlendi.';
    else return jsonb_build_object('error','Geçerli karar seç.'); end if;
    omen:=jsonb_set(omen,'{task}','null'::jsonb);
  elsif p_action='guard' then
    if role<>'dm' or (r->>'wood')::integer<3 then return jsonb_build_object('error','Nöbet için DM ve 3 odun gerekli.'); end if;
    r:=jsonb_set(r,'{wood}',to_jsonb((r->>'wood')::integer-3));
    s.threat:=greatest(0,s.threat-6-(b->>'palisade')::integer);
    result:='Nöbetler tehlikeyi azalttı.';
  elsif p_action='extortion' then
    if role<>'dm' or s.extortion_due=0 then return jsonb_build_object('error','Bekleyen harç talebi yok.'); end if;
    if choice='pay' then
      if (r->>'coin')::integer<4 then return jsonb_build_object('error','Harç için 4 para gerekli.'); end if;
      r:=jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer-4));
      s.threat:=greatest(0,s.threat-2);result:='Harç ödendi; yol sakinleşti.';
    elsif choice='refuse' then
      s.threat:=least(100,s.threat+5);result:='Harç reddedildi; tehdit arttı.';
    else return jsonb_build_object('error','Geçerli harç kararı seç.'); end if;
    s.extortion_due:=0;
  else return jsonb_build_object('error','Bilinmeyen işlem.'); end if;

  if fnf_private.weight(r)>180+80*(b->>'warehouse')::integer
  then return jsonb_build_object('error','Depo ağırlık sınırı dolu.'); end if;
  s.visitors:=visitors;s.animals:=animals;s.research:=research;s.market:=market;s.omen:=omen;
  update public.fnf_sim_state set world_seed=s.world_seed,climate=s.climate,
    phase=s.phase,resources=r,buildings=b,visitors=s.visitors,animals=s.animals,
    research=s.research,market=s.market,omen=s.omen,population=s.population,
    villagers=s.villagers,
    morale=s.morale,threat=s.threat,extortion_due=s.extortion_due,
    favor=s.favor,last_result=result,
    last_explore_day=s.last_explore_day,last_ask_day=s.last_ask_day,
    last_tavern_day=s.last_tavern_day,updated_at=now()
  where room_id=p_room_id;
  if role='player' and p_action in ('field','trade','breed','explore','ask','tavern') then
    skill:=case p_action when 'field' then 'botany' when 'breed' then 'husbandry'
      when 'explore' then 'exploration' when 'ask' then 'diplomacy'
      when 'trade' then 'diplomacy' else 'craft' end;
    insert into public.fnf_player_progress as prog(room_id,user_id,xp,skill_xp)
      values(p_room_id,actor,2,jsonb_build_object(skill,2))
    on conflict(room_id,user_id) do update set
      xp=least(1000000,prog.xp+2),
      skill_xp=jsonb_set(prog.skill_xp,array[skill],
        to_jsonb(coalesce((prog.skill_xp->>skill)::integer,0)+2));
  end if;
  return jsonb_build_object('ok',true,'message',result);
end;
$$;
create function public.fnf_sim_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.sim_action(p_room_id,p_action,p_payload);
$$;

alter function fnf_private.farm_action(uuid,integer,text,text) rename to farm_action_v04;
create function fnf_private.farm_action(p_room_id uuid,p_slot integer,p_action text,p_seed_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare p public.fnf_farm_plots%rowtype; s public.fnf_sim_state%rowtype;
  result jsonb; product text; base integer; yield_amount integer; r jsonb;
begin
  if p_action<>'harvest' then
    return fnf_private.farm_action_v04(p_room_id,p_slot,p_action,p_seed_id);
  end if;
  if auth.uid() is null or not exists(
    select 1 from public.fnf_room_members m where m.room_id=p_room_id and m.user_id=auth.uid()
    and (m.role='dm' or exists(select 1 from public.fnf_characters c
      where c.room_id=p_room_id and c.user_id=auth.uid())))
  then return jsonb_build_object('error','Bu tarlada işlem yetkin yok.'); end if;
  -- Lock in the same order as the day and simulation actions.
  perform 1 from public.fnf_world where room_id=p_room_id for update;
  select * into s from public.fnf_sim_state where room_id=p_room_id for update;
  select * into p from public.fnf_farm_plots where room_id=p_room_id and slot=p_slot for update;
  product:=case p.seed_id when 'seed_01' then 'grain'
    when 'seed_02' then 'food' when 'seed_03' then 'herbs' else null end;
  if product is null then return jsonb_build_object('error','Hasat edilecek ekin yok.'); end if;
  base:=case p.seed_id when 'seed_01' then 3 when 'seed_02' then 2 else 1 end;
  yield_amount:=greatest(1,round(p.area*base*p.fertility/100.0*
    (1+p.care*0.15+p.fertilizer*0.25+p.magic*0.35))::integer);
  r:=jsonb_set(s.resources,array[product],
    to_jsonb((s.resources->>product)::integer+yield_amount));
  if fnf_private.weight(r)>180+80*(s.buildings->>'warehouse')::integer
  then return jsonb_build_object('error','Hasat için depoda yer aç.'); end if;
  result:=fnf_private.farm_action_v04(p_room_id,p_slot,p_action,p_seed_id);
  if result ? 'error' then return result; end if;
  update public.fnf_sim_state set resources=r,
    last_result=format('%s birim %s hasat edildi.',yield_amount,product),updated_at=now()
    where room_id=p_room_id;
  update public.fnf_farm_plots set fertility=greatest(20,fertility-5),
    care=0,fertilizer=0,magic=0 where room_id=p_room_id and slot=p_slot;
  if exists(select 1 from public.fnf_room_members m where m.room_id=p_room_id
    and m.user_id=auth.uid() and m.role='player') then
    insert into public.fnf_player_progress as prog(room_id,user_id,xp,skill_xp)
      values(p_room_id,auth.uid(),3,'{"botany":3}'::jsonb)
    on conflict(room_id,user_id) do update set
      xp=least(1000000,prog.xp+3),
      skill_xp=jsonb_set(prog.skill_xp,'{botany}',
        to_jsonb(coalesce((prog.skill_xp->>'botany')::integer,0)+3));
  end if;
  return jsonb_build_object('ok',true,'yield',yield_amount,'product',product);
end;
$$;
create or replace function public.fnf_farm_action(p_room_id uuid,p_slot integer,p_action text,p_seed_id text default null)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.farm_action(p_room_id,p_slot,p_action,p_seed_id);
$$;

create or replace function fnf_private.advance_day(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare w public.fnf_world%rowtype; s public.fnf_sim_state%rowtype;
  d integer; season text; phases jsonb; sky text; midday text; night text;
  r jsonb; research jsonb; omen jsonb; market jsonb; visitors jsonb; animals jsonb;
  event_text text; food_need integer; feed_need integer; milk integer;
  building_upkeep integer; idx integer; new_visitor jsonb; discovery text;
begin
  if auth.uid() is null or not exists(
    select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=auth.uid() and role='dm')
  then return jsonb_build_object('error','Günü yalnız DM geçirir.'); end if;
  select * into w from public.fnf_world where room_id=p_room_id for update;
  select * into s from public.fnf_sim_state where room_id=p_room_id for update;
  if w.day>=1000000 then return jsonb_build_object('error','Gün sınırına ulaşıldı.'); end if;
  d:=w.day+1;
  season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((d-1)/10)%4)];
  sky:=(case s.climate
    when 'Kurak' then array['Açık','Sıcak','Kuru rüzgâr','Açık','Hafif yağmur']
    when 'Nemli' then array['Yağmur','Sisli','Bulutlu','Hafif yağmur','Açık']
    when 'Soğuk' then array['Serin','Ayaz','Bulutlu','Kar','Açık']
    else array['Açık','Hafif yağmur','Sisli','Serin','Bulutlu'] end)
      [1+fnf_private.roll(s.world_seed,d,'sabah',5)];
  midday:=(case s.climate
    when 'Kurak' then array['Sıcak','Açık','Kuru rüzgâr','Sıcak','Yağmur']
    when 'Nemli' then array['Bulutlu','Yağmur','Açık','Sisli','Hafif yağmur']
    when 'Soğuk' then array['Ayaz','Serin','Kar','Bulutlu','Açık']
    else array['Açık','Yağmur','Bulutlu','Serin','Hafif yağmur'] end)
      [1+fnf_private.roll(s.world_seed,d,'öğle',5)];
  night:=(array['Serin','Açık','Sisli','Bulutlu','Ayaz'])[1+fnf_private.roll(s.world_seed,d,'gece',5)];
  phases:=jsonb_build_array(sky,midday,night);
  -- Mandatory soil/season/water (including rain) is separate from yield modifiers.
  update public.fnf_farm_plots p set
    growth=case when p.soil=any(c.soils)
      and (array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/10)%4)]=any(c.seasons)
      and (p.watered or s.weather_phases::text ilike '%yağmur%')
      and (s.conditions->>'sun')::integer>=c.min_sun
      and (s.conditions->>'humidity')::integer between c.min_humidity and c.max_humidity
      and (s.conditions->>'temperature')::integer between c.min_temperature and c.max_temperature
    then least(c.growth_days,p.growth+1) else p.growth end,
    watered=false
  from fnf_private.codex_catalog c where p.room_id=p_room_id and p.seed_id=c.id;

  r:=s.resources;research:=s.research;omen:=s.omen;market:=s.market;
  visitors:=s.visitors;animals:=s.animals;
  event_text:='Köy yeni güne uyandı.';
  food_need:=greatest(1,ceil(s.population/3.0)::integer);
  if (r->>'food')::integer>=food_need then
    r:=jsonb_set(r,'{food}',to_jsonb((r->>'food')::integer-food_need));
  else
    r:=jsonb_set(r,'{food}','0'::jsonb);
    s.morale:=greatest(0,s.morale-6);
    event_text:=event_text||' Yiyecek azlığı halkın moralini düşürdü.';
  end if;
  building_upkeep:=greatest(1,((s.buildings->>'study')::integer+
    (s.buildings->>'tavern')::integer+(s.buildings->>'palisade')::integer)/2);
  if (r->>'wood')::integer>=building_upkeep then
    r:=jsonb_set(r,'{wood}',to_jsonb((r->>'wood')::integer-building_upkeep));
  else
    s.morale:=greatest(0,s.morale-3);
    event_text:=event_text||' Yapı bakımı aksadı.';
  end if;
  feed_need:=greatest(1,ceil(jsonb_array_length(animals)/2.0)::integer);
  if (r->>'fodder')::integer>=feed_need then
    r:=jsonb_set(r,'{fodder}',to_jsonb((r->>'fodder')::integer-feed_need));
    select coalesce(sum(case when s.climate='Soğuk' and w.weather='Ayaz'
      and (value->>'hardiness')::integer<3 then 0
      else (value->>'yield')::integer+case when value->>'blessing'='true' then 1 else 0 end end),0)
      into milk from jsonb_array_elements(animals) value
      where (value->>'age')::integer>=2;
    milk:=least(milk/2, greatest(0,(180+80*(s.buildings->>'warehouse')::integer-fnf_private.weight(r))/2));
    r:=jsonb_set(r,'{food}',to_jsonb((r->>'food')::integer+milk));
  else
    s.morale:=greatest(0,s.morale-2);
    event_text:=event_text||' Ahırda yem yetmedi.';
  end if;
  animals:=(select coalesce(jsonb_agg(jsonb_set(value,'{age}',
    to_jsonb(least(99,(value->>'age')::integer+1))) order by ord),'[]'::jsonb)
    from jsonb_array_elements(animals) with ordinality t(value,ord));
  if research->>'active' is not null then
    idx:=(research->>'progress')::integer+1;
    if idx>=3 then
      discovery:=research->>'active';
      research:=jsonb_build_object('active',null,'progress',0,
        'done',(research->'done')||to_jsonb(discovery));
      s.favor:=least(100,s.favor+case when discovery='faith' then 2 else 0 end);
      if discovery='seedcraft' then
        update public.fnf_codex_reveals set conditions_open=true
          where room_id=p_room_id and entry_id='seed_03';
      elsif discovery='husbandry' then
        update public.fnf_codex_reveals set details_open=true
          where room_id=p_room_id and entry_id='animal_01';
      elsif discovery='weather' then
        update public.fnf_codex_reveals set image_open=true
          where room_id=p_room_id and entry_id='plant_01';
      end if;
      event_text:=event_text||' Araştırma tamamlandı: '||discovery||'.';
    else research:=jsonb_set(research,'{progress}',to_jsonb(idx)); end if;
  end if;
  if d%3=0 and jsonb_array_length(visitors)<3 then
    idx:=fnf_private.roll(s.world_seed,d,'visitor',6);
    new_visitor:=jsonb_build_object(
      'name',(array['Lira','Boran','Mira','Tarin','Eryn','Nora'])[idx+1]||' '||d,
      'species',(array['human','elf','dwarf','orc','dragonborn','halfling'])[idx+1],
      'class_id',(array['nature','villager','physical','engineering'])[1+fnf_private.roll(s.world_seed,d,'class',4)],
      'skill',(array['botany','craft','exploration','engineering'])[1+fnf_private.roll(s.world_seed,d,'skill',4)],
      'ability',10+fnf_private.roll(s.world_seed,d,'ability',5),
      'abilities',jsonb_build_object(
        'power',8+fnf_private.roll(s.world_seed,d,'power',7),
        'agility',8+fnf_private.roll(s.world_seed,d,'agility',7),
        'endurance',8+fnf_private.roll(s.world_seed,d,'endurance',7),
        'intellect',8+fnf_private.roll(s.world_seed,d,'intellect',7),
        'insight',8+fnf_private.roll(s.world_seed,d,'insight',7),
        'presence',8+fnf_private.roll(s.world_seed,d,'presence',7)));
    visitors:=visitors||jsonb_build_array(new_visitor);
    event_text:=event_text||' Yeni bir yolcu geldi.';
  end if;
  if omen->>'task' is not null and (omen->>'due')::integer<d then
    s.favor:=greatest(0,s.favor-3);
    omen:=jsonb_build_object('text','Elçinin isteği cevapsız kaldı.','task',null,'due',null);
    event_text:=event_text||' Alametin süresi doldu.';
  elsif omen->>'task' is null and fnf_private.roll(s.world_seed,d,'omen',5)=0 then
    omen:=jsonb_build_object('text','Tek yüce tanrının yardımcı elçisi yiyecek yardımı istiyor.',
      'task','food_help','due',d+2);
    event_text:=event_text||' Gökte bir alamet görüldü.';
  end if;
  if d%10=0 then
    if (r->>'coin')::integer>=5 then
      r:=jsonb_set(r,'{coin}',to_jsonb((r->>'coin')::integer-5));
      event_text:=event_text||' Mevsim vergisi ödendi (5 para).';
    else s.morale:=greatest(0,s.morale-8);s.threat:=least(100,s.threat+3);
      event_text:=event_text||' Vergi ödenemedi; huzursuzluk arttı.'; end if;
  end if;
  if s.extortion_due>0 and d>s.extortion_due then
    s.threat:=least(100,s.threat+4);s.morale:=greatest(0,s.morale-4);
    s.extortion_due:=0;event_text:=event_text||' Cevapsız harç talebi huzursuzluk getirdi.';
  end if;
  if d%7=0 and s.extortion_due=0 then
    s.extortion_due:=d+1;event_text:=event_text||' Yol eşkıyaları harç istedi.';
  end if;
  s.threat:=least(100,s.threat+case when s.population>8 then 2 else 1 end);
  if s.threat>=9 and fnf_private.roll(s.world_seed,d,'raid',3)=0 then
    idx:=greatest(1,4-(s.buildings->>'palisade')::integer);
    r:=jsonb_set(r,'{food}',to_jsonb(greatest(0,(r->>'food')::integer-idx)));
    s.morale:=greatest(0,s.morale-5);s.threat:=greatest(0,s.threat-5);
    event_text:=event_text||' Baskın depodan yiyecek götürdü.';
  end if;
  discovery:=(array['wood','grain','food','fodder','herbs'])[1+fnf_private.roll(s.world_seed,d,'market',5)];
  market:=jsonb_set(market,array[discovery],to_jsonb(greatest(-3,least(3,
    (market->>discovery)::integer+fnf_private.roll(s.world_seed,d,'demand',3)-1))));
  s.conditions:=jsonb_build_object(
    'sun',case when sky ilike '%yağmur%' or sky in ('Sisli','Bulutlu','Kar') then 3 else 7 end,
    'humidity',greatest(20,least(100,case s.climate when 'Kurak' then 35
      when 'Nemli' then 75 when 'Soğuk' then 65 else 55 end
      +case when sky ilike '%yağmur%' then 20 else 0 end)),
    'temperature',(case season when 'Bahar' then 18 when 'Yaz' then 27
      when 'Güz' then 13 else 3 end)
      +(case s.climate when 'Kurak' then 5 when 'Soğuk' then -7 else 0 end));
  s.news:=case when jsonb_array_length(visitors)>0
    then 'Yolcular '||season||' yollarında '||discovery||' fiyatlarını konuşuyor.'
    else 'Han yolundan '||discovery||' pazarına dair haberler geldi.' end;
  update public.fnf_world set day=d,weather=sky,event=event_text,updated_at=now()
    where room_id=p_room_id;
  insert into public.fnf_day_log(room_id,day,season,weather,event)
    values(p_room_id,d,season,sky,event_text);
  s.research:=research;s.omen:=omen;s.market:=market;s.visitors:=visitors;s.animals:=animals;
  update public.fnf_sim_state set phase=0,weather_phases=phases,conditions=s.conditions,
    resources=r,research=s.research,omen=s.omen,market=s.market,
    visitors=s.visitors,animals=s.animals,morale=s.morale,threat=s.threat,
    extortion_due=s.extortion_due,
    favor=s.favor,news=s.news,last_result=event_text,updated_at=now()
    where room_id=p_room_id;
  return jsonb_build_object('ok',true,'day',d,'event',event_text);
end;
$$;

-- v05 backups remain readable. New backups include the simulation ledger.
alter function fnf_private.backup_room(uuid) rename to backup_room_v05;
create function fnf_private.backup_room(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base jsonb; s public.fnf_sim_state%rowtype;
begin
  base:=fnf_private.backup_room_v05(p_room_id);
  if base ? 'error' then return base; end if;
  select * into s from public.fnf_sim_state where room_id=p_room_id;
  return base || jsonb_build_object(
    'simulation',to_jsonb(s)-'room_id',
    'progress',coalesce((select jsonb_agg(to_jsonb(p)-'room_id')
      from public.fnf_player_progress p where p.room_id=p_room_id),'[]'::jsonb));
end;
$$;
create or replace function public.fnf_backup_room(p_room_id uuid)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.backup_room(p_room_id);
$$;

alter function fnf_private.restore_room(jsonb,text) rename to restore_room_v05;
create function fnf_private.restore_room(p_backup jsonb,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; saved public.fnf_sim_state%rowtype; v jsonb; key text; amount integer;
begin
  v:=p_backup->'simulation';
  if v is not null then
    if jsonb_typeof(v)<>'object' or octet_length(v::text)>100000
      or coalesce(v->>'world_seed','') !~ '^[a-zA-Z0-9_-]{4,32}$'
      or v->>'climate' not in ('Ilıman','Kurak','Nemli','Soğuk')
      or jsonb_typeof(v->'resources')<>'object'
      or jsonb_typeof(v->'buildings')<>'object'
      or jsonb_typeof(v->'animals')<>'array'
      or jsonb_array_length(v->'animals')>14
      or jsonb_typeof(v->'villagers')<>'array'
      or jsonb_array_length(v->'villagers')>300
    then return jsonb_build_object('error','Yedek yerleşim verisi geçersiz.'); end if;
    for key in select unnest(array['coin','wood','stone','grain','food','fodder','ore','herbs','fertilizer']) loop
      if coalesce(v->'resources'->>key,'') !~ '^[0-9]{1,6}$'
      then return jsonb_build_object('error','Yedekte geçersiz kaynak var.'); end if;
    end loop;
    for key in select unnest(array['hall','warehouse','barn','study','tavern','palisade']) loop
      if coalesce(v->'buildings'->>key,'') !~ '^[0-3]$'
      then return jsonb_build_object('error','Yedekte geçersiz yapı var.'); end if;
    end loop;
    if fnf_private.weight(v->'resources')>180+80*(v->'buildings'->>'warehouse')::integer
    then return jsonb_build_object('error','Yedekte depo sınırı aşılmış.'); end if;
  end if;
  if p_backup ? 'progress' and (jsonb_typeof(p_backup->'progress')<>'array'
    or jsonb_array_length(p_backup->'progress')>200)
  then return jsonb_build_object('error','Yedekte deneyim kaydı geçersiz.'); end if;
  result:=fnf_private.restore_room_v05(p_backup,p_password);
  if result ? 'error' or v is null then return result; end if;
  saved:=jsonb_populate_record(null::public.fnf_sim_state,v);
  update public.fnf_sim_state set world_seed=saved.world_seed,climate=saved.climate,
    phase=saved.phase,weather_phases=saved.weather_phases,conditions=saved.conditions,
    resources=saved.resources,buildings=saved.buildings,population=saved.population,
    morale=saved.morale,visitors=saved.visitors,villagers=saved.villagers,animals=saved.animals,
    research=saved.research,market=saved.market,threat=saved.threat,
    extortion_due=saved.extortion_due,
    favor=saved.favor,omen=saved.omen,news=saved.news,last_result=saved.last_result,
    last_explore_day=saved.last_explore_day,last_ask_day=saved.last_ask_day,
    last_tavern_day=saved.last_tavern_day,
    updated_at=now()
    where room_id=(result->>'id')::uuid;
  update public.fnf_farm_plots p set
    area=coalesce(src.area,1),fertility=coalesce(src.fertility,80),
    care=coalesce(src.care,0),fertilizer=coalesce(src.fertilizer,0),
    magic=coalesce(src.magic,0)
  from jsonb_to_recordset(p_backup->'plots') as src(
    slot smallint,area smallint,fertility smallint,care smallint,
    fertilizer smallint,magic smallint)
  where p.room_id=(result->>'id')::uuid and p.slot=src.slot;
  if p_backup ? 'progress' then
    insert into public.fnf_player_progress(room_id,user_id,xp,skill_xp)
      select (result->>'id')::uuid,p.user_id,p.xp,p.skill_xp
      from jsonb_to_recordset(p_backup->'progress')
        as p(user_id uuid,xp integer,skill_xp jsonb)
      on conflict do nothing;
  end if;
  return result;
end;
$$;
create or replace function public.fnf_restore_room(p_backup jsonb,p_password text)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.restore_room(p_backup,p_password);
$$;

revoke execute on function fnf_private.init_sim(),
  fnf_private.weight(jsonb),fnf_private.bulk(text),
  fnf_private.roll(text,integer,text,integer),
  fnf_private.price(text,integer,text,text,integer),
  fnf_private.sim_snapshot(uuid),fnf_private.sim_action(uuid,text,jsonb),
  fnf_private.farm_action(uuid,integer,text,text),
  fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text),
  public.fnf_sim_snapshot(uuid),public.fnf_sim_action(uuid,text,jsonb)
  from public,anon;
revoke execute on function fnf_private.farm_action_v04(uuid,integer,text,text),
  fnf_private.backup_room_v05(uuid),fnf_private.restore_room_v05(jsonb,text)
  from public,anon,authenticated;
grant execute on function fnf_private.sim_snapshot(uuid),
  fnf_private.sim_action(uuid,text,jsonb),fnf_private.farm_action(uuid,integer,text,text),
  fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text),
  public.fnf_sim_snapshot(uuid),public.fnf_sim_action(uuid,text,jsonb)
  to authenticated;
