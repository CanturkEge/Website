-- Farms & Fields · initial schema for a dedicated Supabase project.
-- Deploy only to the NEW FNF project. Never run against kadim-masa.
create schema if not exists fnf_private;
create extension if not exists pgcrypto with schema extensions;

create table public.fnf_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 48),
  code text not null unique check (code ~ '^[A-F0-9]{10}$'),
  creator_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.fnf_room_members (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('dm','player')),
  joined_at timestamptz not null default now(),
  primary key(room_id,user_id)
);
create index fnf_room_members_user_idx on public.fnf_room_members(user_id,joined_at desc);

create table public.fnf_characters (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  user_id uuid not null,
  name text not null check (char_length(btrim(name)) between 2 and 32),
  species text not null check (species in ('human','elf','dwarf','orc','dragonborn','halfling')),
  class_id text not null check (class_id in ('nature','villager','physical','engineering')),
  specialty text not null,
  skills jsonb not null,
  created_at timestamptz not null default now(),
  unique(room_id,user_id),
  foreign key(room_id,user_id) references public.fnf_room_members(room_id,user_id) on delete cascade
);
create index fnf_characters_room_idx on public.fnf_characters(room_id);

-- This table is not in an API-exposed schema. Store only a salted digest,
-- never the room creation password itself or a frontend copy of it.
create table fnf_private.room_gate (
  singleton boolean primary key default true check(singleton),
  salt text not null,
  secret_hash text not null
);
create table fnf_private.gate_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  attempts integer not null default 0,
  window_start timestamptz not null default now()
);

-- Run after choosing a random creator password; pass the value through the
-- SQL editor/connector, never commit it to this repository:
-- insert into fnf_private.room_gate(singleton,salt,secret_hash)
-- select true, s.salt,
--   encode(extensions.digest(:password || s.salt,'sha256'),'hex')
-- from (select encode(extensions.gen_random_bytes(24),'hex') as salt) s;

create function fnf_private.is_member(p_room_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.fnf_room_members m
                where m.room_id = p_room_id and m.user_id = (select auth.uid()));
$$;

alter table public.fnf_rooms enable row level security;
alter table public.fnf_room_members enable row level security;
alter table public.fnf_characters enable row level security;

create policy "members can read their rooms" on public.fnf_rooms
for select to authenticated using (fnf_private.is_member(id));
create policy "members can see their party" on public.fnf_room_members
for select to authenticated using (fnf_private.is_member(room_id));
create policy "members can see room characters" on public.fnf_characters
for select to authenticated using (fnf_private.is_member(room_id));

-- All writes go through validated functions; no direct client write grants.
revoke all on public.fnf_rooms,public.fnf_room_members,public.fnf_characters from anon,authenticated;
grant select on public.fnf_rooms,public.fnf_room_members,public.fnf_characters to authenticated;
revoke all on schema fnf_private from public,anon;
grant usage on schema fnf_private to authenticated;
revoke all on all tables in schema fnf_private from public,anon,authenticated;

create function fnf_private.create_room(p_name text,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid(); gate fnf_private.room_gate%rowtype;
  attempt fnf_private.gate_attempts%rowtype; new_room public.fnf_rooms%rowtype;
begin
  if actor is null then return jsonb_build_object('error','Önce giriş yap.'); end if;
  if char_length(btrim(coalesce(p_name,''))) not between 2 and 48 then
    return jsonb_build_object('error','Oda adı 2–48 karakter olmalı.');
  end if;
  insert into fnf_private.gate_attempts(user_id) values(actor) on conflict do nothing;
  select * into attempt from fnf_private.gate_attempts where user_id=actor for update;
  if attempt.window_start < now()-interval '15 minutes' then
    update fnf_private.gate_attempts set attempts=0,window_start=now() where user_id=actor;
    attempt.attempts:=0;
  end if;
  if attempt.attempts>=5 then
    return jsonb_build_object('error','Çok fazla deneme. 15 dakika sonra tekrar dene.');
  end if;
  select * into gate from fnf_private.room_gate where singleton=true;
  if not found then return jsonb_build_object('error','Kurucu şifresi henüz tanımlanmadı.'); end if;
  if p_password is null or
     encode(extensions.digest(p_password || gate.salt,'sha256'),'hex') <> gate.secret_hash then
    update fnf_private.gate_attempts set attempts=attempts+1 where user_id=actor;
    return jsonb_build_object('error','Kurucu şifresi yanlış.');
  end if;
  update fnf_private.gate_attempts set attempts=0,window_start=now() where user_id=actor;
  insert into public.fnf_rooms(name,code,creator_id)
  values(btrim(p_name),upper(encode(extensions.gen_random_bytes(5),'hex')),actor)
  returning * into new_room;
  insert into public.fnf_room_members(room_id,user_id,role)
  values(new_room.id,actor,'dm');
  return jsonb_build_object('id',new_room.id,'code',new_room.code);
end;
$$;

create function fnf_private.join_room(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); found_room public.fnf_rooms%rowtype;
begin
  if actor is null then return jsonb_build_object('error','Önce giriş yap.'); end if;
  if coalesce(p_code,'') !~ '^[A-F0-9]{10}$' then
    return jsonb_build_object('error','Geçerli bir oda kodu gir.');
  end if;
  select * into found_room from public.fnf_rooms where code=p_code;
  if not found then return jsonb_build_object('error','Bu kodla oda bulunamadı.'); end if;
  insert into public.fnf_room_members(room_id,user_id,role)
  values(found_room.id,actor,'player') on conflict(room_id,user_id) do nothing;
  return jsonb_build_object('id',found_room.id);
end;
$$;

create function fnf_private.create_character(
  p_room_id uuid,p_name text,p_species text,p_class_id text,p_specialty text,p_skills jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); new_id uuid; total integer;
begin
  if actor is null or not fnf_private.is_member(p_room_id) then
    return jsonb_build_object('error','Bu odada karakter oluşturamazsın.');
  end if;
  if exists(select 1 from public.fnf_characters where room_id=p_room_id and user_id=actor) then
    return jsonb_build_object('error','Bu odada zaten karakterin var.');
  end if;
  if char_length(btrim(coalesce(p_name,''))) not between 2 and 32 then
    return jsonb_build_object('error','Karakter adı 2–32 karakter olmalı.');
  end if;
  if p_species is null or p_species not in ('human','elf','dwarf','orc','dragonborn','halfling') then
    return jsonb_build_object('error','Geçerli bir tür seç.');
  end if;
  if not (case p_class_id
    when 'nature' then p_specialty in ('healer','alchemist','artisan')
    when 'villager' then p_specialty in ('herder','farmer','gardener')
    when 'physical' then p_specialty in ('warrior','miner','explorer')
    when 'engineering' then p_specialty in ('builder','chemist','researcher')
    else false end) then
    return jsonb_build_object('error','Uzmanlık ve ana yol eşleşmiyor.');
  end if;
  if jsonb_typeof(p_skills) is distinct from 'object' or
     (select count(*) from jsonb_object_keys(p_skills))<>8 or
     exists(select 1 from jsonb_each_text(p_skills) s
       where s.key not in ('botany','husbandry','craft','engineering','research','exploration','defense','diplomacy')
          or s.value !~ '^[0-3]$') then
    return jsonb_build_object('error','Beceri dağılımı geçersiz.');
  end if;
  select sum(s.value::integer) into total from jsonb_each_text(p_skills) s;
  if total<>6 then return jsonb_build_object('error','Tam altı beceri puanı dağıt.'); end if;
  insert into public.fnf_characters(room_id,user_id,name,species,class_id,specialty,skills)
  values(p_room_id,actor,btrim(p_name),p_species,p_class_id,p_specialty,p_skills)
  returning id into new_id;
  return jsonb_build_object('id',new_id);
end;
$$;

-- Public API wrappers run as caller. Only the narrowly scoped private
-- functions can bypass table RLS, and each checks auth.uid() itself.
create function public.fnf_create_room(p_name text,p_password text)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.create_room(p_name,p_password);
$$;
create function public.fnf_join_room(p_code text)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.join_room(p_code);
$$;
create function public.fnf_create_character(p_room_id uuid,p_name text,p_species text,p_class_id text,p_specialty text,p_skills jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
  select fnf_private.create_character(p_room_id,p_name,p_species,p_class_id,p_specialty,p_skills);
$$;

revoke execute on all functions in schema fnf_private from public,anon;
revoke execute on function public.fnf_create_room(text,text),public.fnf_join_room(text),
  public.fnf_create_character(uuid,text,text,text,text,jsonb) from public;
revoke execute on function public.fnf_create_room(text,text),public.fnf_join_room(text),
  public.fnf_create_character(uuid,text,text,text,text,jsonb) from anon;
grant execute on function fnf_private.is_member(uuid),fnf_private.create_room(text,text),
  fnf_private.join_room(text),fnf_private.create_character(uuid,text,text,text,text,jsonb) to authenticated;
grant execute on function public.fnf_create_room(text,text),public.fnf_join_room(text),
  public.fnf_create_character(uuid,text,text,text,text,jsonb) to authenticated;
