-- FNF v0.11.0 · Provisional one-source divine hierarchy, room-specific aliases.
-- The hierarchy is narrative-only until blessings and consequences are designed.
create table fnf_private.divine_catalog (
  id text primary key,
  parent_id text references fnf_private.divine_catalog(id),
  rank text not null check (rank in ('source','archangel','messenger')),
  sort_order integer not null unique,
  name text not null,
  domain text not null,
  lore text not null
);
insert into fnf_private.divine_catalog(id,parent_id,rank,sort_order,name,domain,lore) values
('source',null,'source',1,'Kaynak','Varlık ve denge','Bütün yolların çıktığı tek yüce irade; yüzü ve iradesi kimsece bütünüyle bilinmez.'),
('arch_earth','source','archangel',10,'Taşın Bekçisi','Toprak ve emek','Toprağı sahiplenmeyi değil, ona bakmayı öğütleyen başmelek.'),
('arch_season','source','archangel',20,'Devrin Sözcüsü','Mevsimler ve değişim','Hiçbir hasadın ve hiçbir kışın sonsuza dek sürmediğini hatırlatır.'),
('arch_path','source','archangel',30,'Yolun Gözcüsü','Yol ve seçim','Yol ayrımlarında yolcuya kararın sorumluluğunu bırakır.'),
('arch_memory','source','archangel',40,'İzin Muhafızı','Hatıra ve tanıklık','Unutulan söz ve saklı izler üzerine tanıklık eder.'),
('herald_root','arch_earth','messenger',11,'Kök Taşıyan','Kök ve onarım','Toprakla emek arasındaki küçük işaretleri taşıyan elçi.'),
('herald_harvest','arch_earth','messenger',12,'Başak Sayıcısı','Hasat ve ölçü','Paylaşımın hesabını hatırlatan elçi.'),
('herald_rain','arch_season','messenger',21,'Çiy Habercisi','Yağmur ve çiy','Hava değişimini küçük işaretlerle duyuran elçi.'),
('herald_winter','arch_season','messenger',22,'Kırağı Bekçisi','Soğuk ve hazırlık','Kıştan önce hazırlık yapılmasını anımsatan elçi.'),
('herald_crossing','arch_path','messenger',31,'Eşik Yolcusu','Geçitler ve konuklar','Yeni gelenlerin ve gidilen yolların hikâyelerini taşır.'),
('herald_compass','arch_path','messenger',32,'İz Okuyucu','Yön ve iz sürme','Kaybolan patikaların küçük belirtilerini gösterir.'),
('herald_echo','arch_memory','messenger',41,'Yankı Yazıcısı','Anlatı ve söz','Söylenen sözün unutulmamasını gözeten elçi.'),
('herald_seed','arch_memory','messenger',42,'Tohum Saklayıcı','Miras ve gelecek','Bir kuşağın bıraktığı bilgiyi ötekine taşır.');

create table public.fnf_temple_state (
  room_id uuid primary key references public.fnf_rooms(id) on delete cascade,
  is_open boolean not null default false
);
create table public.fnf_divine_reveals (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  entity_id text not null references fnf_private.divine_catalog(id),
  name_override text,
  identity_open boolean not null default false,
  domain_open boolean not null default false,
  lore_open boolean not null default false,
  primary key(room_id,entity_id),
  constraint fnf_divine_name_length check (name_override is null or char_length(name_override) between 2 and 48)
);
alter table public.fnf_temple_state enable row level security;
alter table public.fnf_divine_reveals enable row level security;
revoke all on fnf_private.divine_catalog,public.fnf_temple_state,public.fnf_divine_reveals from public,anon,authenticated;

create function fnf_private.init_divinity() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.fnf_temple_state(room_id) values(new.id);
  insert into public.fnf_divine_reveals(room_id,entity_id)
    select new.id,d.id from fnf_private.divine_catalog d;
  return new;
end;$$;
create trigger fnf_divinity_on_room after insert on public.fnf_rooms
  for each row execute function fnf_private.init_divinity();
insert into public.fnf_temple_state(room_id) select id from public.fnf_rooms on conflict do nothing;
insert into public.fnf_divine_reveals(room_id,entity_id)
  select r.id,d.id from public.fnf_rooms r cross join fnf_private.divine_catalog d on conflict do nothing;

create function fnf_private.divinity_snapshot(p_room_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare is_dm boolean; opened boolean;
begin
  select m.role='dm' into is_dm from public.fnf_room_members m
  where m.room_id=p_room_id and m.user_id=auth.uid();
  if is_dm is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  select is_open into opened from public.fnf_temple_state where room_id=p_room_id;
  if not opened and not is_dm then return jsonb_build_object('open',false,'nodes','[]'::jsonb); end if;
  return jsonb_build_object('open',coalesce(opened,false),'nodes',coalesce((
    select jsonb_agg(jsonb_build_object(
      'id',d.id,'parent_id',d.parent_id,'rank',d.rank,'sort_order',d.sort_order,
      'identity_open',r.identity_open,'domain_open',r.domain_open,'lore_open',r.lore_open,
      'name',case when is_dm or r.identity_open then coalesce(r.name_override,d.name) end,
      'domain',case when is_dm or r.domain_open then d.domain end,
      'lore',case when is_dm or r.lore_open then d.lore end
    ) order by d.sort_order)
    from fnf_private.divine_catalog d join public.fnf_divine_reveals r
      on r.entity_id=d.id and r.room_id=p_room_id
  ),'[]'::jsonb));
end;$$;
create function public.fnf_divinity_snapshot(p_room_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
  select fnf_private.divinity_snapshot(p_room_id);
$$;

create function fnf_private.divinity_action(p_room_id uuid,p_entity_id text,p_action text,p_value text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
  if auth.uid() is null or not exists(select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=auth.uid() and role='dm') then
    return jsonb_build_object('error','Bu işlemi yalnızca DM yapabilir.');
  end if;
  if p_action='temple' and p_entity_id is null and p_value in ('true','false') then
    update public.fnf_temple_state set is_open=p_value::boolean where room_id=p_room_id;
  elsif p_action='rename' and p_entity_id is not null and
    (p_value is null or (char_length(btrim(p_value)) between 2 and 48 and p_value=btrim(p_value))) then
    update public.fnf_divine_reveals set name_override=p_value
    where room_id=p_room_id and entity_id=p_entity_id;
  elsif p_action in ('identity','domain','lore') and p_entity_id is not null and p_value in ('true','false') then
    update public.fnf_divine_reveals set
      identity_open=case when p_action='identity' then p_value::boolean else identity_open end,
      domain_open=case when p_action='domain' then p_value::boolean else domain_open end,
      lore_open=case when p_action='lore' then p_value::boolean else lore_open end
    where room_id=p_room_id and entity_id=p_entity_id;
  else return jsonb_build_object('error','Geçersiz tapınak işlemi.'); end if;
  get diagnostics changed=row_count;
  if changed<>1 then return jsonb_build_object('error','Kayıt bulunamadı.'); end if;
  return jsonb_build_object('ok',true);
end;$$;
create function public.fnf_divinity_action(p_room_id uuid,p_entity_id text,p_action text,p_value text)
returns jsonb language sql security invoker set search_path='' as $$
  select fnf_private.divinity_action(p_room_id,p_entity_id,p_action,p_value);
$$;
revoke all on function fnf_private.init_divinity(),fnf_private.divinity_snapshot(uuid),fnf_private.divinity_action(uuid,text,text,text),
  public.fnf_divinity_snapshot(uuid),public.fnf_divinity_action(uuid,text,text,text) from public,anon;
grant execute on function fnf_private.divinity_snapshot(uuid),fnf_private.divinity_action(uuid,text,text,text) to authenticated;
grant execute on function public.fnf_divinity_snapshot(uuid),public.fnf_divinity_action(uuid,text,text,text) to authenticated;

-- Preserve aliases and reveal state in backups while accepting all older backups.
alter function fnf_private.backup_room(uuid) rename to backup_room_v10;
create function fnf_private.backup_room(p_room_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare base jsonb;
begin
  base:=fnf_private.backup_room_v10(p_room_id);
  if base ? 'error' then return base; end if;
  return base||jsonb_build_object('divinity',jsonb_build_object(
    'open',(select is_open from public.fnf_temple_state where room_id=p_room_id),
    'reveals',coalesce((select jsonb_agg(to_jsonb(d)-'room_id' order by d.entity_id)
      from public.fnf_divine_reveals d where d.room_id=p_room_id),'[]'::jsonb)
  ));
end;$$;
alter function fnf_private.restore_room(jsonb,text) rename to restore_room_v10;
create function fnf_private.restore_room(p_backup jsonb,p_password text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; new_id uuid; v jsonb; entry jsonb;
begin
  v:=p_backup->'divinity';
  if v is not null and (jsonb_typeof(v)<>'object' or jsonb_typeof(v->'open')<>'boolean'
    or jsonb_typeof(v->'reveals')<>'array' or jsonb_array_length(v->'reveals')>13) then
    return jsonb_build_object('error','Tapınak yedeği geçersiz.');
  end if;
  if v is not null and exists(select 1 from jsonb_array_elements(v->'reveals') e
    where jsonb_typeof(e)<>'object' or not exists(select 1 from fnf_private.divine_catalog c where c.id=e->>'entity_id')
      or jsonb_typeof(e->'identity_open')<>'boolean' or jsonb_typeof(e->'domain_open')<>'boolean'
      or jsonb_typeof(e->'lore_open')<>'boolean' or
      (e->>'name_override' is not null and char_length(e->>'name_override') not between 2 and 48)) then
    return jsonb_build_object('error','Tapınak yedeği geçersiz.');
  end if;
  result:=fnf_private.restore_room_v10(p_backup,p_password);
  if result ? 'error' or v is null then return result; end if;
  new_id:=(result->>'id')::uuid;
  update public.fnf_temple_state set is_open=(v->>'open')::boolean where room_id=new_id;
  for entry in select value from jsonb_array_elements(v->'reveals') loop
    update public.fnf_divine_reveals set
      name_override=entry->>'name_override',identity_open=(entry->>'identity_open')::boolean,
      domain_open=(entry->>'domain_open')::boolean,lore_open=(entry->>'lore_open')::boolean
    where room_id=new_id and entity_id=entry->>'entity_id';
  end loop;
  return result;
end;$$;
revoke execute on function fnf_private.backup_room_v10(uuid),fnf_private.restore_room_v10(jsonb,text),
  fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text) from public,anon,authenticated;
grant execute on function fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text) to authenticated;
