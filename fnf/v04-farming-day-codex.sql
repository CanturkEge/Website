-- FNF v0.5.0 · Apply only to the independent FNF project after v03.
-- Four shared plots, a small seed bank, DM day advance and room-scoped discovery.
create table fnf_private.codex_catalog (
  id text primary key,
  category text not null check (category in ('seed','plant','animal')),
  name text not null,
  kind text not null,
  rarity text not null,
  image text not null,
  description text not null,
  uses text not null,
  conditions text not null,
  growth_days integer,
  soils text[],
  seasons text[]
);
insert into fnf_private.codex_catalog
  (id,category,name,kind,rarity,image,description,uses,conditions,growth_days,soils,seasons)
values
  ('seed_01','seed','Amber Buğdayı','Tahıl','Yaygın','seed_01.svg','Altın başakları hafif rüzgârda dalgalanır.','Un ve temel yiyecek için öğütülür.','Tınlı veya kumlu toprak; bahar ya da yaz; her gün su.',2,array['loam','sand'],array['Bahar','Yaz']),
  ('seed_02','seed','Gece Yemişi','Çalı meyvesi','Nadir','seed_02.svg','Alacakaranlıkta mor meyveler veren dayanıklı bir çalı.','Yiyecek ve boya için toplanır.','Tınlı veya sulak toprak; bahar ya da yaz; her gün su.',3,array['loam','marsh'],array['Bahar','Yaz']),
  ('seed_03','seed','Ay Kökü','Kök bitkisi','Çok nadir','seed_03.svg','Soğuk toprakta gümüş damarlı bir kök geliştirir.','Simya deneylerinde değerlendirilebilir.','Sulak toprak; güz ya da kış; her gün su.',3,array['marsh'],array['Güz','Kış']),
  ('plant_01','plant','Fısıltı Eğreltisi','Yabani bitki','Seyrek','plant_01.svg','Nemli ormanlarda bulunan kıvrık yapraklı bir bitki.','Araştırma ve rol yapma sahnelerinde kullanılabilir.','Nemli gölge; yetiştirme kuralı henüz yok.',null,null,null),
  ('animal_01','animal','Yosun Tavşanı','Küçük memeli','Yaygın','animal_01.svg','Sırtında yosun benzeri tüyler taşır.','İz sürme ve yetiştirme hikâyelerine konu olabilir.','Orman kenarı; yetiştirme kuralı henüz yok.',null,null,null),
  ('animal_02','animal','Sis Turnası','Kuş','Nadir','animal_02.svg','Sabah sisinde görülen uzun kanatlı bir kuş.','Keşif ve alamet sahnelerinde kullanılabilir.','Sulak alan; yetiştirme kuralı henüz yok.',null,null,null);

create table public.fnf_world (
  room_id uuid primary key references public.fnf_rooms(id) on delete cascade,
  day integer not null default 1 check (day between 1 and 1000000),
  weather text not null default 'Açık',
  event text not null default 'İlk gün. Yerleşim henüz sessiz.',
  updated_at timestamptz not null default now()
);
create table public.fnf_day_log (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  day integer not null,
  season text not null,
  weather text not null,
  event text not null,
  primary key(room_id,day)
);
create table public.fnf_codex_reveals (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  entry_id text not null references fnf_private.codex_catalog(id),
  image_open boolean not null default false,
  identity_open boolean not null default false,
  rarity_open boolean not null default false,
  details_open boolean not null default false,
  conditions_open boolean not null default false,
  primary key(room_id,entry_id)
);
create table public.fnf_seed_stock (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  seed_id text not null references fnf_private.codex_catalog(id),
  amount integer not null check (amount between 0 and 9999),
  primary key(room_id,seed_id)
);
create table public.fnf_farm_plots (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  slot smallint not null check (slot between 1 and 4),
  soil text not null check (soil in ('loam','sand','marsh')),
  seed_id text references fnf_private.codex_catalog(id),
  growth integer not null default 0 check (growth between 0 and 100),
  watered boolean not null default false,
  primary key(room_id,slot),
  check (seed_id is not null or (growth=0 and watered=false))
);
create index fnf_codex_reveals_entry_idx on public.fnf_codex_reveals(entry_id);

create function fnf_private.init_world()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.fnf_world(room_id) values(new.id);
  insert into public.fnf_farm_plots(room_id,slot,soil)
  values(new.id,1,'loam'),(new.id,2,'loam'),(new.id,3,'sand'),(new.id,4,'marsh');
  insert into public.fnf_seed_stock(room_id,seed_id,amount)
  values(new.id,'seed_01',4),(new.id,'seed_02',3),(new.id,'seed_03',2);
  insert into public.fnf_codex_reveals(room_id,entry_id)
  select new.id,c.id from fnf_private.codex_catalog c;
  return new;
end;
$$;
create trigger fnf_room_world_after_insert
after insert on public.fnf_rooms for each row execute function fnf_private.init_world();

-- Backfill existing rooms without touching their members or characters.
insert into public.fnf_world(room_id) select id from public.fnf_rooms on conflict do nothing;
insert into public.fnf_farm_plots(room_id,slot,soil)
select r.id,p.slot,p.soil from public.fnf_rooms r
cross join (values(1,'loam'),(2,'loam'),(3,'sand'),(4,'marsh')) p(slot,soil)
on conflict do nothing;
insert into public.fnf_seed_stock(room_id,seed_id,amount)
select r.id,s.id,s.amount from public.fnf_rooms r
cross join (values('seed_01',4),('seed_02',3),('seed_03',2)) s(id,amount)
on conflict do nothing;
insert into public.fnf_codex_reveals(room_id,entry_id)
select r.id,c.id from public.fnf_rooms r cross join fnf_private.codex_catalog c
on conflict do nothing;

alter table public.fnf_world enable row level security;
alter table public.fnf_day_log enable row level security;
alter table public.fnf_codex_reveals enable row level security;
alter table public.fnf_seed_stock enable row level security;
alter table public.fnf_farm_plots enable row level security;
revoke all on public.fnf_world,public.fnf_day_log,public.fnf_codex_reveals,
  public.fnf_seed_stock,public.fnf_farm_plots from public,anon,authenticated;
revoke all on fnf_private.codex_catalog from public,anon,authenticated;

create function fnf_private.snapshot(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := auth.uid(); dm boolean; w public.fnf_world%rowtype;
begin
  select m.role='dm' into dm from public.fnf_room_members m
    where m.room_id=p_room_id and m.user_id=actor;
  if dm is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  select * into w from public.fnf_world where room_id=p_room_id;
  return jsonb_build_object(
    'day',w.day,
    'season',(array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/7)%4)],
    'weather',w.weather,'event',w.event,
    'log',coalesce((select jsonb_agg(to_jsonb(l) order by l.day desc)
      from (select day,season,weather,event from public.fnf_day_log
        where room_id=p_room_id order by day desc limit 5) l),'[]'::jsonb),
    'catalog',coalesce((select jsonb_agg(jsonb_build_object(
      'id',c.id,'category',c.category,'image_open',r.image_open,
      'identity_open',r.identity_open,'rarity_open',r.rarity_open,
      'details_open',r.details_open,'conditions_open',r.conditions_open,
      'image',case when dm or r.image_open then c.image end,
      'name',case when dm or r.identity_open then c.name end,
      'kind',case when dm or r.identity_open then c.kind end,
      'rarity',case when dm or r.rarity_open then c.rarity end,
      'description',case when dm or r.details_open then c.description end,
      'uses',case when dm or r.details_open then c.uses end,
      'conditions',case when dm or r.conditions_open then c.conditions end,
      'growth_days',case when dm or r.conditions_open then c.growth_days end
    ) order by c.id) from fnf_private.codex_catalog c
      join public.fnf_codex_reveals r on r.entry_id=c.id and r.room_id=p_room_id),'[]'::jsonb),
    'plots',coalesce((select jsonb_agg(jsonb_build_object(
      'slot',p.slot,'soil',p.soil,'seed_id',p.seed_id,'growth',p.growth,'watered',p.watered,
      'ready',coalesce(p.growth >= (select c.growth_days from fnf_private.codex_catalog c where c.id=p.seed_id),false)
    ) order by p.slot) from public.fnf_farm_plots p where p.room_id=p_room_id),'[]'::jsonb),
    'stock',coalesce((select jsonb_object_agg(s.seed_id,s.amount)
      from public.fnf_seed_stock s where s.room_id=p_room_id),'{}'::jsonb)
  );
end;
$$;

create function fnf_private.set_discovery(p_room_id uuid,p_entry_id text,p_field text,p_open boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=auth.uid() and role='dm') then
    return jsonb_build_object('error','Yalnızca DM açabilir.');
  end if;
  if p_open is null or p_field not in ('image','identity','rarity','details','conditions') then
    return jsonb_build_object('error','Geçersiz keşif alanı.');
  end if;
  update public.fnf_codex_reveals set
    image_open=case when p_field='image' then p_open else image_open end,
    identity_open=case when p_field='identity' then p_open else identity_open end,
    rarity_open=case when p_field='rarity' then p_open else rarity_open end,
    details_open=case when p_field='details' then p_open else details_open end,
    conditions_open=case when p_field='conditions' then p_open else conditions_open end
  where room_id=p_room_id and entry_id=p_entry_id;
  if not found then return jsonb_build_object('error','Kayıt bulunamadı.'); end if;
  return jsonb_build_object('ok',true);
end;
$$;

create function fnf_private.farm_action(p_room_id uuid,p_slot integer,p_action text,p_seed_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); w public.fnf_world%rowtype;
  p public.fnf_farm_plots%rowtype; c fnf_private.codex_catalog%rowtype;
  season text;
begin
  if actor is null or not exists(select 1 from public.fnf_room_members m
    where m.room_id=p_room_id and m.user_id=actor and
      (m.role='dm' or exists(select 1 from public.fnf_characters ch
        where ch.room_id=p_room_id and ch.user_id=actor))) then
    return jsonb_build_object('error','Bu tarlada işlem yetkin yok.');
  end if;
  select * into w from public.fnf_world where room_id=p_room_id for update;
  season := (array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/7)%4)];
  select * into p from public.fnf_farm_plots
    where room_id=p_room_id and slot=p_slot for update;
  if not found then return jsonb_build_object('error','Tarla bulunamadı.'); end if;
  if p_action='plant' then
    if p.seed_id is not null then return jsonb_build_object('error','Bu göz dolu.'); end if;
    select * into c from fnf_private.codex_catalog where id=p_seed_id and category='seed';
    if not found then return jsonb_build_object('error','Geçersiz tohum.'); end if;
    if p.soil <> all(c.soils) or season <> all(c.seasons) then
      return jsonb_build_object('error','Bu tohumun toprak/mevsim koşulları uygun değil.');
    end if;
    update public.fnf_seed_stock set amount=amount-1
      where room_id=p_room_id and seed_id=p_seed_id and amount>0;
    if not found then return jsonb_build_object('error','Bu tohum stokta kalmadı.'); end if;
    update public.fnf_farm_plots set seed_id=p_seed_id,growth=0,watered=true
      where room_id=p_room_id and slot=p_slot;
  elsif p_action='water' then
    if p.seed_id is null then return jsonb_build_object('error','Bu göz boş.'); end if;
    update public.fnf_farm_plots set watered=true where room_id=p_room_id and slot=p_slot;
  elsif p_action='harvest' then
    if p.seed_id is null then return jsonb_build_object('error','Hasat edilecek ekin yok.'); end if;
    select * into c from fnf_private.codex_catalog where id=p.seed_id;
    if p.growth<c.growth_days then return jsonb_build_object('error','Ekin henüz olgunlaşmadı.'); end if;
    update public.fnf_seed_stock set amount=least(9999,amount+2)
      where room_id=p_room_id and seed_id=p.seed_id;
    update public.fnf_farm_plots set seed_id=null,growth=0,watered=false
      where room_id=p_room_id and slot=p_slot;
  else return jsonb_build_object('error','Geçersiz tarla işlemi.'); end if;
  return jsonb_build_object('ok',true);
end;
$$;

create function fnf_private.advance_day(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare w public.fnf_world%rowtype; next_day integer; next_season text;
  next_weather text; next_event text;
begin
  if auth.uid() is null or not exists(select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=auth.uid() and role='dm') then
    return jsonb_build_object('error','Günü yalnızca DM geçirebilir.');
  end if;
  select * into w from public.fnf_world where room_id=p_room_id for update;
  if not found or w.day>=1000000 then return jsonb_build_object('error','Gün ilerletilemedi.'); end if;
  update public.fnf_farm_plots p set
    growth=case when p.watered and p.soil=any(c.soils) and
      (array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/7)%4)]=any(c.seasons)
      then least(c.growth_days,p.growth+1) else p.growth end,
    watered=false
  from fnf_private.codex_catalog c
  where p.room_id=p_room_id and p.seed_id=c.id;
  next_day:=w.day+1;
  next_season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((next_day-1)/7)%4)];
  next_weather:=(array['Açık','Hafif yağmur','Sisli','Serin rüzgâr'])[1+((next_day-1)%4)];
  next_event:=(array[
    'Köy uyanıyor; günün hikâyesini DM başlatır.',
    'Yol kenarında yeni ayak izleri bulundu.',
    'Ufukta kısa süreli bir ışık belirdi.',
    'Pazardan bir yolcu haberi geldi.'
  ])[1+((next_day-1)%4)];
  update public.fnf_world set day=next_day,weather=next_weather,
    event=next_event,updated_at=now() where room_id=p_room_id;
  insert into public.fnf_day_log(room_id,day,season,weather,event)
    values(p_room_id,next_day,next_season,next_weather,next_event);
  return jsonb_build_object('ok',true,'day',next_day,'event',next_event);
end;
$$;

create function public.fnf_world_snapshot(p_room_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.snapshot(p_room_id);
$$;
create function public.fnf_set_discovery(p_room_id uuid,p_entry_id text,p_field text,p_open boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.set_discovery(p_room_id,p_entry_id,p_field,p_open);
$$;
create function public.fnf_farm_action(p_room_id uuid,p_slot integer,p_action text,p_seed_id text default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.farm_action(p_room_id,p_slot,p_action,p_seed_id);
$$;
create function public.fnf_advance_day(p_room_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.advance_day(p_room_id);
$$;
revoke execute on function fnf_private.init_world(),fnf_private.snapshot(uuid),
  fnf_private.set_discovery(uuid,text,text,boolean),
  fnf_private.farm_action(uuid,integer,text,text),fnf_private.advance_day(uuid)
  from public,anon;
revoke execute on function public.fnf_world_snapshot(uuid),
  public.fnf_set_discovery(uuid,text,text,boolean),
  public.fnf_farm_action(uuid,integer,text,text),public.fnf_advance_day(uuid)
  from public,anon;
grant execute on function fnf_private.snapshot(uuid),
  fnf_private.set_discovery(uuid,text,text,boolean),
  fnf_private.farm_action(uuid,integer,text,text),fnf_private.advance_day(uuid)
  to authenticated;
grant execute on function public.fnf_world_snapshot(uuid),
  public.fnf_set_discovery(uuid,text,text,boolean),
  public.fnf_farm_action(uuid,integer,text,text),public.fnf_advance_day(uuid)
  to authenticated;
