-- FNF v0.9 draft; apply after v08. Room legacy farm remains solely for old backups.
-- All gameplay writes use security-definer RPCs; direct table access is closed.
create table public.fnf_parcels (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  village_id uuid not null,
  number integer not null check(number between 1 and 100000),
  soil text not null check(soil in ('loam','sand','marsh')),
  terrain text not null default 'field' check(terrain in ('field','orchard','water')),
  ready_day integer not null,
  fertility smallint not null default 80 check(fertility between 20 and 100),
  fallow_until integer not null default 0,
  created_at timestamptz not null default now(),
  unique(room_id,village_id,number),
  unique(room_id,id),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade
);
create index fnf_parcels_village_idx on public.fnf_parcels(room_id,village_id);
create table public.fnf_parcel_crops (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  parcel_id uuid not null,
  first_tile smallint not null check(first_tile between 1 and 20),
  tile_count smallint not null check(tile_count between 1 and 20),
  seed_id text not null references fnf_private.codex_catalog(id),
  growth integer not null default 0 check(growth between 0 and 1000),
  watered_day integer not null default 0,
  residue boolean not null default false,
  planted_day integer not null,
  check(first_tile+tile_count<=21),
  foreign key(room_id,parcel_id) references public.fnf_parcels(room_id,id) on delete cascade
);
create index fnf_crops_parcel_idx on public.fnf_parcel_crops(parcel_id);
create table public.fnf_village_water (
  room_id uuid not null,
  village_id uuid not null,
  day integer not null default 1,
  carried integer not null default 3 check(carried between 0 and 30),
  source text not null default 'river' check(source in ('river','well','canal')),
  primary key(room_id,village_id),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade
);
alter table public.fnf_parcels enable row level security;
alter table public.fnf_parcel_crops enable row level security;
alter table public.fnf_village_water enable row level security;
revoke all on public.fnf_parcels,public.fnf_parcel_crops,public.fnf_village_water from public,anon,authenticated;

create function fnf_private.parcels_snapshot(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); dm boolean; mine uuid;
begin
  select m.role='dm' into dm from public.fnf_room_members m where m.room_id=p_room_id and m.user_id=actor;
  if dm is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  select village_id into mine from public.fnf_village_members where room_id=p_room_id and user_id=actor;
  return jsonb_build_object(
    'mine',mine,
    'parcels',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'village_id',p.village_id,'number',p.number,'soil',p.soil,
      'terrain',p.terrain,'ready_day',p.ready_day,'fallow_until',p.fallow_until,
      'fertility',p.fertility,'crops',coalesce((select jsonb_agg(jsonb_build_object(
        'id',c.id,'first_tile',c.first_tile,'tile_count',c.tile_count,
        'seed_id',c.seed_id,'name',case when dm or r.identity_open then k.name end,
        'image',case when dm or r.image_open then k.image end,
        'growth',c.growth,'ready',c.growth>=k.growth_days,'residue',c.residue,
        'watered_day',c.watered_day) order by c.first_tile)
        from public.fnf_parcel_crops c join fnf_private.codex_catalog k on k.id=c.seed_id
        left join public.fnf_codex_reveals r on r.room_id=p_room_id and r.entry_id=k.id
        where c.parcel_id=p.id),'[]'::jsonb)
      ) order by p.created_at,p.number)
      from public.fnf_parcels p where p.room_id=p_room_id and (dm or p.village_id=mine)),'[]'::jsonb),
    'water',coalesce((select jsonb_agg(jsonb_build_object('village_id',village_id,'day',day,
      'carried',carried,'source',source)) from public.fnf_village_water
      where room_id=p_room_id and (dm or village_id=mine)),'[]'::jsonb),
    'villages',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name))
      from public.fnf_villages where room_id=p_room_id and (dm or id=mine)),'[]'::jsonb)
  );
end;
$$;
create function public.fnf_parcels_snapshot(p_room_id uuid)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.parcels_snapshot(p_room_id);
$$;

create function fnf_private.parcel_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); role text; v uuid; p public.fnf_parcels%rowtype;
  crop public.fnf_parcel_crops%rowtype; k fnf_private.codex_catalog%rowtype;
  w public.fnf_world%rowtype; s public.fnf_sim_state%rowtype;
  first_pos integer; tiles integer; requested text; season text; can_build boolean;
  amount integer; water_left integer;
begin
  select m.role into role from public.fnf_room_members m where m.room_id=p_room_id and m.user_id=actor;
  if role is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>1000
  then return jsonb_build_object('error','İşlem verisi geçersiz.'); end if;
  perform 1 from public.fnf_world where room_id=p_room_id for update;
  select * into w from public.fnf_world where room_id=p_room_id;
  if coalesce(p_payload->>'village_id','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Köy seç.'); end if;
  v:=(p_payload->>'village_id')::uuid;
  if not exists(select 1 from public.fnf_villages where id=v and room_id=p_room_id)
  then return jsonb_build_object('error','Köy bulunamadı.'); end if;
  if role<>'dm' and not exists(select 1 from public.fnf_village_members vm
    join public.fnf_characters c on c.room_id=vm.room_id and c.user_id=vm.user_id
    where vm.room_id=p_room_id and vm.village_id=v and vm.user_id=actor)
  then return jsonb_build_object('error','Bu köye erişimin yok.'); end if;
  select coalesce(vm.can_build or vm.role in ('owner','cofounder'),false) into can_build
    from public.fnf_village_members vm where vm.room_id=p_room_id and vm.village_id=v and vm.user_id=actor;
  if p_action='open' then
    if role<>'dm' and not coalesce(can_build,false) then return jsonb_build_object('error','Tarla açma yetkisi gerekli.'); end if;
    requested:=p_payload->>'soil';
    if requested not in ('loam','sand','marsh') then return jsonb_build_object('error','Toprak seç.'); end if;
    insert into public.fnf_parcels(room_id,village_id,number,soil,terrain,ready_day)
      values(p_room_id,v,coalesce((select max(number)+1 from public.fnf_parcels where village_id=v),1),
        requested,case when requested='marsh' then 'water' else 'field' end,w.day+2);
    insert into public.fnf_village_water(room_id,village_id,day)
      values(p_room_id,v,w.day) on conflict do nothing;
    return jsonb_build_object('ok',true,'message','İş gücü ayrıldı; tarla iki gün sonra hazır.');
  end if;
  if coalesce(p_payload->>'parcel_id','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Tarla seç.'); end if;
  select * into p from public.fnf_parcels where id=(p_payload->>'parcel_id')::uuid
    and room_id=p_room_id and village_id=v for update;
  if not found then return jsonb_build_object('error','Tarla bulunamadı.'); end if;
  if p.ready_day>w.day then return jsonb_build_object('error','Tarla işçilerin hazırlamasını bekliyor.'); end if;
  if p_action='plant' then
    if p.fallow_until>=w.day then return jsonb_build_object('error','Tarla nadasa bırakıldı.'); end if;
    requested:=p_payload->>'seed_id';
    select * into k from fnf_private.codex_catalog where id=requested and category='seed';
    if not found then return jsonb_build_object('error','Tohum bulunamadı.'); end if;
    if coalesce(p_payload->>'first_tile','') !~ '^[0-9]{1,2}$'
      or coalesce(p_payload->>'tile_count','') !~ '^[0-9]{1,2}$'
    then return jsonb_build_object('error','Kare ve miktar seç.'); end if;
    first_pos:=(p_payload->>'first_tile')::integer;tiles:=(p_payload->>'tile_count')::integer;
    if first_pos<1 or tiles<1 or first_pos+tiles>21
    then return jsonb_build_object('error','Tarla yirmi karedir.'); end if;
    if exists(select 1 from public.fnf_parcel_crops c where c.parcel_id=p.id
      and int4range(c.first_tile,c.first_tile+c.tile_count) &&
          int4range(first_pos,first_pos+tiles))
    then return jsonb_build_object('error','Bu karelerde ekin veya kalıntı var.'); end if;
    season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/20)%4)];
    if p.soil<>all(k.soils) or season<>all(k.seasons)
    then return jsonb_build_object('error','Toprak veya mevsim uygun değil.'); end if;
    update public.fnf_seed_stock set amount=amount-tiles where room_id=p_room_id
      and seed_id=requested and amount>=tiles;
    if not found then return jsonb_build_object('error','Yeterli tohum yok.'); end if;
    insert into public.fnf_parcel_crops(room_id,parcel_id,first_tile,tile_count,seed_id,planted_day)
      values(p_room_id,p.id,first_pos,tiles,requested,w.day);
    return jsonb_build_object('ok',true,'message','Tohumlar seçilen karelere ekildi.');
  end if;
  if p_action='fallow' then
    if exists(select 1 from public.fnf_parcel_crops where parcel_id=p.id)
    then return jsonb_build_object('error','Nadas için önce bütün kareleri temizle.'); end if;
    update public.fnf_parcels set fallow_until=w.day+2 where id=p.id;
    return jsonb_build_object('ok',true,'message','Tarla iki gün dinlenecek.');
  end if;
  if coalesce(p_payload->>'crop_id','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Ekin seç.'); end if;
  select * into crop from public.fnf_parcel_crops where id=(p_payload->>'crop_id')::uuid and parcel_id=p.id for update;
  if not found then return jsonb_build_object('error','Ekin bulunamadı.'); end if;
  if p_action='water' then
    if crop.residue or crop.watered_day>=w.day then return jsonb_build_object('error','Bu ekin bugün sulandı veya hasat edildi.'); end if;
    insert into public.fnf_village_water(room_id,village_id,day) values(p_room_id,v,w.day) on conflict do nothing;
    update public.fnf_village_water set carried=carried-1 where room_id=p_room_id and village_id=v
      and day=w.day and carried>0 returning carried into water_left;
    if not found then return jsonb_build_object('error','Günlük taşınan su bitti.'); end if;
    update public.fnf_parcel_crops set watered_day=w.day where id=crop.id;
    return jsonb_build_object('ok',true,'message','Kaynağından bir birim su kullanıldı.');
  elsif p_action='harvest' then
    select * into k from fnf_private.codex_catalog where id=crop.seed_id;
    if crop.residue or crop.growth<k.growth_days
    then return jsonb_build_object('error','Ekin henüz hasada hazır değil.'); end if;
    select * into s from public.fnf_sim_state where room_id=p_room_id for update;
    amount:=crop.tile_count*greatest(1,(p.fertility/40));
    update public.fnf_sim_state set resources=jsonb_set(s.resources,
      case when k.id='seed_01' then '{grain}'::text[] else '{food}'::text[] end,
      to_jsonb((s.resources->>case when k.id='seed_01' then 'grain' else 'food' end)::integer+amount))
      where room_id=p_room_id;
    update public.fnf_seed_stock set amount=least(9999,amount+crop.tile_count)
      where room_id=p_room_id and seed_id=crop.seed_id;
    update public.fnf_parcel_crops set residue=true where id=crop.id;
    update public.fnf_parcels set fertility=greatest(20,fertility-2) where id=p.id;
    return jsonb_build_object('ok',true,'message','Ürün depoya alındı; kalıntıyı temizle.');
  elsif p_action='clean' then
    if not crop.residue then return jsonb_build_object('error','Önce hasat et.'); end if;
    delete from public.fnf_parcel_crops where id=crop.id;
    return jsonb_build_object('ok',true,'message','Hasat kalıntısı temizlendi.');
  end if;
  return jsonb_build_object('error','Bilinmeyen tarla işi.');
end;
$$;
create function public.fnf_parcel_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.parcel_action(p_room_id,p_action,p_payload);
$$;
-- v08 advances the day while locking fnf_world. The trigger sees OLD day,
-- using today's watering and weather; rain meets the watering requirement.
create function fnf_private.advance_parcels()
returns trigger language plpgsql security definer set search_path = '' as $$
declare old_season text;
begin
  if new.day<=old.day then return new; end if;
  old_season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((old.day-1)/20)%4)];
  update public.fnf_parcel_crops c set
    growth=least(k.growth_days,c.growth+1)
    from public.fnf_parcels p,fnf_private.codex_catalog k,public.fnf_sim_state s
    where c.room_id=new.room_id and c.parcel_id=p.id and c.seed_id=k.id
      and s.room_id=new.room_id and not c.residue and p.ready_day<=old.day
      and old_season=any(k.seasons) and p.soil=any(k.soils)
      and (c.watered_day=old.day or old.weather ilike '%yağmur%'
        or s.weather_phases::text ilike '%yağmur%')
      and (s.conditions->>'sun')::integer>=k.min_sun
      and (s.conditions->>'humidity')::integer between k.min_humidity and k.max_humidity
      and (s.conditions->>'temperature')::integer between k.min_temperature and k.max_temperature;
  update public.fnf_parcels set fertility=least(100,fertility+5)
    where room_id=new.room_id and fallow_until=old.day;
  update public.fnf_village_water set day=new.day,
    carried=case source when 'canal' then 20 when 'well' then 8 else 3 end
    where room_id=new.room_id;
  return new;
end;
$$;
create trigger fnf_world_parcels_day after update of day on public.fnf_world
for each row execute function fnf_private.advance_parcels();

revoke execute on function fnf_private.parcels_snapshot(uuid),
  fnf_private.parcel_action(uuid,text,jsonb),
  fnf_private.advance_parcels(),public.fnf_parcels_snapshot(uuid),
  public.fnf_parcel_action(uuid,text,jsonb) from public,anon;
grant execute on function fnf_private.parcels_snapshot(uuid),
  fnf_private.parcel_action(uuid,text,jsonb),public.fnf_parcels_snapshot(uuid),
  public.fnf_parcel_action(uuid,text,jsonb) to authenticated;

-- New campaigns start as temporary camps. Existing campaigns are not reset.
-- Four inert legacy rows persist to keep v05/v08 backup validation compatible.
create or replace function fnf_private.init_world()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.fnf_world(room_id) values(new.id);
  insert into public.fnf_farm_plots(room_id,slot,soil)
    values(new.id,1,'loam'),(new.id,2,'loam'),(new.id,3,'sand'),(new.id,4,'marsh');
  insert into public.fnf_seed_stock(room_id,seed_id,amount)
    select new.id,id,0 from fnf_private.codex_catalog where category='seed';
  insert into public.fnf_codex_reveals(room_id,entry_id)
    select new.id,id from fnf_private.codex_catalog;
  return new;
end;
$$;
create or replace function fnf_private.init_sim()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.fnf_sim_state(room_id,world_seed,resources,buildings,population,
    villagers,animals,morale)
    values(new.id,substr(md5(new.id::text),1,8),
      '{"coin":0,"wood":0,"stone":0,"grain":0,"food":6,"fodder":0,"ore":0,"herbs":0,"fertilizer":0}'::jsonb,
      '{"hall":0,"warehouse":0,"barn":0,"study":0,"tavern":0,"palisade":0}'::jsonb,
      0,'[]'::jsonb,'[]'::jsonb,65);
  return new;
end;
$$;
create function fnf_private.grant_supplies(p_room_id uuid,p_kind text,p_id text,p_amount integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_resources jsonb;
begin
  if not exists(select 1 from public.fnf_room_members where room_id=p_room_id
    and user_id=auth.uid() and role='dm') then return jsonb_build_object('error','Yalnız DM dağıtabilir.'); end if;
  if p_amount<0 or p_amount>100 or p_amount is null
  then return jsonb_build_object('error','Miktar 0–100 olmalı.'); end if;
  perform 1 from public.fnf_world where room_id=p_room_id for update;
  if p_kind='seed' then
    if not exists(select 1 from fnf_private.codex_catalog where id=p_id and category='seed')
    then return jsonb_build_object('error','Tohum bulunamadı.'); end if;
    update public.fnf_seed_stock set amount=least(9999,amount+p_amount)
      where room_id=p_room_id and seed_id=p_id;
  elsif p_kind='resource' and p_id in
    ('coin','wood','stone','grain','food','fodder','ore','herbs','fertilizer') then
    select resources into current_resources from public.fnf_sim_state where room_id=p_room_id for update;
    update public.fnf_sim_state set resources=jsonb_set(current_resources,array[p_id],
      to_jsonb(least(9999,coalesce((current_resources->>p_id)::integer,0)+p_amount)))
      where room_id=p_room_id;
  else return jsonb_build_object('error','Malzeme bilinmiyor.'); end if;
  return jsonb_build_object('ok',true);
end;
$$;
create function public.fnf_grant_supplies(p_room_id uuid,p_kind text,p_id text,p_amount integer)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.grant_supplies(p_room_id,p_kind,p_id,p_amount);
$$;
revoke execute on function fnf_private.grant_supplies(uuid,text,text,integer),
  public.fnf_grant_supplies(uuid,text,text,integer) from public,anon;
grant execute on function fnf_private.grant_supplies(uuid,text,text,integer),
  public.fnf_grant_supplies(uuid,text,text,integer) to authenticated;

-- Include new game state in the existing JSON campaign backup. Restores create
-- a new room; village IDs are remapped through stable village names.
alter function fnf_private.backup_room(uuid) rename to backup_room_v08;
create function fnf_private.backup_room(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base jsonb;
begin
  base:=fnf_private.backup_room_v08(p_room_id);
  if base ? 'error' then return base; end if;
  return base||jsonb_build_object(
    'parcels',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'village',v.name,'number',p.number,'soil',p.soil,
      'terrain',p.terrain,'ready_day',p.ready_day,'fertility',p.fertility,
      'fallow_until',p.fallow_until) order by p.number)
      from public.fnf_parcels p join public.fnf_villages v on v.id=p.village_id
      where p.room_id=p_room_id),'[]'::jsonb),
    'parcel_crops',coalesce((select jsonb_agg(jsonb_build_object(
      'parcel_id',c.parcel_id,'first_tile',c.first_tile,'tile_count',c.tile_count,
      'seed_id',c.seed_id,'growth',c.growth,'watered_day',c.watered_day,
      'residue',c.residue,'planted_day',c.planted_day))
      from public.fnf_parcel_crops c where c.room_id=p_room_id),'[]'::jsonb),
    'village_water',coalesce((select jsonb_agg(jsonb_build_object(
      'village',v.name,'day',x.day,'carried',x.carried,'source',x.source))
      from public.fnf_village_water x join public.fnf_villages v on v.id=x.village_id
      where x.room_id=p_room_id),'[]'::jsonb));
end;
$$;
alter function fnf_private.restore_room(jsonb,text) rename to restore_room_v08;
create function fnf_private.restore_room(p_backup jsonb,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; new_room uuid; item jsonb; old_id text; new_id uuid;
  mapping jsonb:='{}'::jsonb; village_id uuid;
begin
  if p_backup ? 'parcels' then
    if jsonb_typeof(p_backup->'parcels') is distinct from 'array'
      or jsonb_typeof(p_backup->'parcel_crops') is distinct from 'array'
      or jsonb_typeof(p_backup->'village_water') is distinct from 'array'
      or jsonb_array_length(p_backup->'parcels')>10000
      or jsonb_array_length(p_backup->'parcel_crops')>50000
      or jsonb_array_length(p_backup->'village_water')>100
    then return jsonb_build_object('error','Tarla yedeği geçersiz.'); end if;
  end if;
  result:=fnf_private.restore_room_v08(p_backup,p_password);
  if result ? 'error' or not(p_backup ? 'parcels') then return result; end if;
  new_room:=(result->>'id')::uuid;
  for item in select value from jsonb_array_elements(p_backup->'parcels') loop
    old_id:=item->>'id';
    if old_id is null or old_id !~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or mapping ? old_id then raise exception 'Tarla yedeği bozuk; geri yükleme iptal edildi.'; end if;
    select id into village_id from public.fnf_villages where room_id=new_room and name=item->>'village';
    if village_id is null then raise exception 'Tarla köyü bulunamadı; geri yükleme iptal edildi.'; end if;
    new_id:=gen_random_uuid();
    insert into public.fnf_parcels(id,room_id,village_id,number,soil,terrain,
      ready_day,fertility,fallow_until)
      values(new_id,new_room,village_id,(item->>'number')::integer,item->>'soil',
        item->>'terrain',(item->>'ready_day')::integer,
        (item->>'fertility')::integer,(item->>'fallow_until')::integer);
    mapping:=mapping||jsonb_build_object(old_id,new_id::text);
  end loop;
  for item in select value from jsonb_array_elements(p_backup->'parcel_crops') loop
    if not(mapping ? (item->>'parcel_id'))
      then raise exception 'Ekin tarlası bulunamadı; geri yükleme iptal edildi.'; end if;
    insert into public.fnf_parcel_crops(room_id,parcel_id,first_tile,tile_count,
      seed_id,growth,watered_day,residue,planted_day)
      values(new_room,(mapping->>(item->>'parcel_id'))::uuid,
        (item->>'first_tile')::integer,(item->>'tile_count')::integer,
        item->>'seed_id',(item->>'growth')::integer,
        (item->>'watered_day')::integer,(item->>'residue')::boolean,
        (item->>'planted_day')::integer);
  end loop;
  for item in select value from jsonb_array_elements(p_backup->'village_water') loop
    select id into village_id from public.fnf_villages where room_id=new_room and name=item->>'village';
    if village_id is null then raise exception 'Su kaynağının köyü bulunamadı; geri yükleme iptal edildi.'; end if;
    insert into public.fnf_village_water(room_id,village_id,day,carried,source)
      values(new_room,village_id,(item->>'day')::integer,
        (item->>'carried')::integer,item->>'source');
  end loop;
  return result;
end;
$$;
revoke execute on function fnf_private.backup_room_v08(uuid),
  fnf_private.restore_room_v08(jsonb,text),
  fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text)
  from public,anon,authenticated;
grant execute on function fnf_private.backup_room(uuid),
  fnf_private.restore_room(jsonb,text) to authenticated;
