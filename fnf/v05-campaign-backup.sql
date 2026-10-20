-- FNF v0.6.0 · Already applied to independent FNF Supabase project.

-- DM-only backup, fresh room restore, typed deletion.

create table fnf_private.pending_characters (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  user_id uuid not null,
  character_data jsonb not null,
  primary key(room_id,user_id)
);
revoke all on fnf_private.pending_characters from public, anon, authenticated;

+CREATE OR REPLACE FUNCTION fnf_private.attach_restored_character()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare saved jsonb;
begin
  if new.role <> 'player' then return new; end if;
  select character_data into saved from fnf_private.pending_characters
    where room_id=new.room_id and user_id=new.user_id for update;
  if saved is null then return new; end if;
  insert into public.fnf_characters
    (room_id,user_id,name,species,class_id,specialty,skills,abilities,skill_choices)
  values (
    new.room_id,new.user_id,
    saved->>'name',saved->>'species',saved->>'class_id',saved->>'specialty',
    saved->'skills',saved->'abilities',
    array(select jsonb_array_elements_text(saved->'skill_choices'))
  ) on conflict(room_id,user_id) do nothing;
  delete from fnf_private.pending_characters
    where room_id=new.room_id and user_id=new.user_id;
  return new;
end;
$function$

;
create trigger fnf_restore_character_on_join after insert on public.fnf_room_members
  for each row execute function fnf_private.attach_restored_character();

CREATE OR REPLACE FUNCTION fnf_private.backup_room(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.fnf_rooms%rowtype; w public.fnf_world%rowtype;
begin
  if auth.uid() is null or not exists(
    select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=auth.uid() and role='dm'
  ) then return jsonb_build_object('error','Yedeği yalnızca DM alabilir.'); end if;
  select * into r from public.fnf_rooms where id=p_room_id;
  select * into w from public.fnf_world where room_id=p_room_id;
  return jsonb_build_object(
    'format','fnf-room-backup','version',1,'exported_at',now(),
    'room',jsonb_build_object('name',r.name),
    'world',jsonb_build_object('day',w.day,'weather',w.weather,'event',w.event),
    'day_log',coalesce((select jsonb_agg(to_jsonb(l)-'room_id' order by l.day)
      from public.fnf_day_log l where l.room_id=p_room_id),'[]'::jsonb),
    'plots',coalesce((select jsonb_agg(to_jsonb(p)-'room_id' order by p.slot)
      from public.fnf_farm_plots p where p.room_id=p_room_id),'[]'::jsonb),
    'stock',coalesce((select jsonb_agg(to_jsonb(s)-'room_id' order by s.seed_id)
      from public.fnf_seed_stock s where s.room_id=p_room_id),'[]'::jsonb),
    'codex',coalesce((select jsonb_agg(to_jsonb(c)-'room_id' order by c.entry_id)
      from public.fnf_codex_reveals c where c.room_id=p_room_id),'[]'::jsonb),
    'characters',coalesce((
      select jsonb_agg(ch order by ch->>'user_id') from (
        select jsonb_build_object(
          'user_id',c.user_id,'name',c.name,'species',c.species,'class_id',c.class_id,
          'specialty',c.specialty,'skills',c.skills,'abilities',c.abilities,
          'skill_choices',c.skill_choices
        ) ch from public.fnf_characters c where c.room_id=p_room_id
        union all
        select jsonb_build_object('user_id',p.user_id)||p.character_data ch
        from fnf_private.pending_characters p where p.room_id=p_room_id
      ) saved
    ),'[]'::jsonb)
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION fnf_private.delete_room(p_room_id uuid, p_confirmation text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare name text;
begin
  if auth.uid() is null or not exists(
    select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=auth.uid() and role='dm'
  ) then return jsonb_build_object('error','Kampanyayı yalnızca DM silebilir.'); end if;
  select r.name into name from public.fnf_rooms r where r.id=p_room_id for update;
  if name is null or p_confirmation is distinct from name then
    return jsonb_build_object('error','Silmek için oda adını aynen yaz.');
  end if;
  delete from public.fnf_rooms where id=p_room_id;
  return jsonb_build_object('ok',true);
end;
$function$
;

CREATE OR REPLACE FUNCTION fnf_private.restore_room(p_backup jsonb, p_password text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare result jsonb; new_id uuid; new_name text; affected integer;
begin
  if auth.uid() is null then return jsonb_build_object('error','Önce giriş yap.'); end if;
  if p_backup is null or jsonb_typeof(p_backup) is distinct from 'object'
     or octet_length(p_backup::text)>1000000
     or p_backup->>'format' is distinct from 'fnf-room-backup'
     or p_backup->>'version' is distinct from '1' then
    return jsonb_build_object('error','Geçerli bir FNF oda yedeği seç.');
  end if;
  if jsonb_typeof(p_backup->'world') is distinct from 'object'
     or jsonb_typeof(p_backup->'plots') is distinct from 'array'
     or jsonb_typeof(p_backup->'stock') is distinct from 'array'
     or jsonb_typeof(p_backup->'codex') is distinct from 'array'
     or jsonb_typeof(p_backup->'day_log') is distinct from 'array'
     or jsonb_typeof(p_backup->'characters') is distinct from 'array' then
    return jsonb_build_object('error','Yedek alanları eksik veya bozuk.');
  end if;
  if char_length(btrim(coalesce(p_backup->'room'->>'name',''))) not between 2 and 48
     or jsonb_array_length(p_backup->'plots')<>4
     or jsonb_array_length(p_backup->'stock')>100
     or jsonb_array_length(p_backup->'codex')>300
     or jsonb_array_length(p_backup->'day_log')>5000
     or jsonb_array_length(p_backup->'characters')>200 then
    return jsonb_build_object('error','Yedek sınırları veya oda adı geçersiz.');
  end if;
  if (p_backup->'world'->>'day') !~ '^[0-9]{1,6}$'
     or (p_backup->'world'->>'day')::integer not between 1 and 1000000
     or char_length(coalesce(p_backup->'world'->>'weather','')) not between 1 and 100
     or char_length(coalesce(p_backup->'world'->>'event','')) not between 1 and 1000 then
    return jsonb_build_object('error','Yedekteki gün bilgisi geçersiz.');
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_backup->'characters') ch
    where jsonb_typeof(ch) is distinct from 'object'
      or char_length(coalesce(ch->>'name','')) not between 2 and 32
      or ch->>'species' not in ('human','elf','dwarf','orc','dragonborn','halfling')
      or ch->>'class_id' not in ('nature','villager','physical','engineering')
      or char_length(coalesce(ch->>'specialty',''))<2
      or jsonb_typeof(ch->'skills') is distinct from 'object'
      or jsonb_typeof(ch->'abilities') is distinct from 'object'
      or jsonb_typeof(ch->'skill_choices') is distinct from 'array'
      or ch->>'user_id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) then return jsonb_build_object('error','Yedekteki karakter verisi geçersiz.'); end if;

  new_name:=left(btrim(p_backup->'room'->>'name'),36)||' · Yedek';
  result:=fnf_private.create_room(new_name,p_password);
  if result ? 'error' then return result; end if;
  new_id:=(result->>'id')::uuid;

  -- Any constraint or malformed record error rolls back the new room as well.
  update public.fnf_world set
    day=(p_backup->'world'->>'day')::integer,
    weather=p_backup->'world'->>'weather',
    event=p_backup->'world'->>'event',
    updated_at=now()
  where room_id=new_id;
  insert into public.fnf_day_log(room_id,day,season,weather,event)
    select new_id,x.day,x.season,x.weather,x.event
    from jsonb_to_recordset(p_backup->'day_log')
      as x(day integer,season text,weather text,event text);

  update public.fnf_farm_plots p set
    soil=x.soil,seed_id=x.seed_id,growth=x.growth,watered=x.watered
  from jsonb_to_recordset(p_backup->'plots')
    as x(slot smallint,soil text,seed_id text,growth integer,watered boolean)
  where p.room_id=new_id and p.slot=x.slot;
  get diagnostics affected=row_count;
  if affected<>4 then raise exception 'Yedekteki tarla gözleri geçersiz.'; end if;

  delete from public.fnf_seed_stock where room_id=new_id;
  insert into public.fnf_seed_stock(room_id,seed_id,amount)
    select new_id,x.seed_id,x.amount from jsonb_to_recordset(p_backup->'stock')
      as x(seed_id text,amount integer);
  if exists(select 1 from public.fnf_seed_stock s
    left join fnf_private.codex_catalog c on c.id=s.seed_id
    where s.room_id=new_id and c.category is distinct from 'seed') then
    raise exception 'Yedekteki tohum deposu geçersiz.';
  end if;
  update public.fnf_codex_reveals c set
    image_open=x.image_open,identity_open=x.identity_open,
    rarity_open=x.rarity_open,details_open=x.details_open,
    conditions_open=x.conditions_open
  from jsonb_to_recordset(p_backup->'codex')
    as x(entry_id text,image_open boolean,identity_open boolean,
      rarity_open boolean,details_open boolean,conditions_open boolean)
  where c.room_id=new_id and c.entry_id=x.entry_id;
  get diagnostics affected=row_count;
  if affected<>jsonb_array_length(p_backup->'codex') then
    raise exception 'Yedekteki ansiklopedi kayıtları geçersiz.';
  end if;
  insert into fnf_private.pending_characters(room_id,user_id,character_data)
    select new_id,(ch->>'user_id')::uuid,ch-'user_id'
    from jsonb_array_elements(p_backup->'characters') ch;
  return jsonb_build_object('ok',true,'id',new_id,'code',result->>'code');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.fnf_backup_room(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select fnf_private.backup_room(p_room_id);
$function$
;

CREATE OR REPLACE FUNCTION public.fnf_delete_room(p_room_id uuid, p_confirmation text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select fnf_private.delete_room(p_room_id,p_confirmation);
$function$
;

CREATE OR REPLACE FUNCTION public.fnf_restore_room(p_backup jsonb, p_password text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select fnf_private.restore_room(p_backup,p_password);
$function$
;

revoke all on function public.fnf_backup_room(uuid),
  public.fnf_delete_room(uuid,text), public.fnf_restore_room(jsonb,text) from public, anon;
grant execute on function public.fnf_backup_room(uuid),
  public.fnf_delete_room(uuid,text), public.fnf_restore_room(jsonb,text) to authenticated;
