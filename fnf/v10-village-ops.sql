-- FNF v0.10 draft; apply after v09. Village buildings and daily NPC assignments.
create table public.fnf_village_buildings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  village_id uuid not null,
  kind text not null check(kind in ('cottage','well','workshop','school')),
  started_day integer not null,
  ready_day integer not null,
  remaining_days smallint not null check(remaining_days between 0 and 100),
  finished_day integer,
  durability smallint not null default 100 check(durability between 0 and 100),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade
);
create index fnf_village_buildings_village_idx on public.fnf_village_buildings(room_id,village_id);
create table public.fnf_npc_candidates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  village_id uuid not null,
  name text not null check(char_length(name) between 2 and 40),
  profession text not null check(profession in ('farmer','builder','miner','scholar','teacher')),
  aptitude smallint not null check(aptitude between 1 and 5),
  health smallint not null default 100 check(health between 0 and 100),
  created_day integer not null,
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade
);
create index fnf_npc_candidates_village_idx on public.fnf_npc_candidates(room_id,village_id);
create table public.fnf_village_npcs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  village_id uuid not null,
  name text not null check(char_length(name) between 2 and 40),
  profession text not null,
  aptitude smallint not null check(aptitude between 1 and 5),
  loyalty smallint not null default 60 check(loyalty between 0 and 100),
  health smallint not null default 100 check(health between 0 and 100),
  fatigue smallint not null default 0 check(fatigue between 0 and 100),
  skill_xp jsonb not null default '{}'::jsonb,
  sick_until integer not null default 0,
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade
);
create index fnf_village_npcs_village_idx on public.fnf_village_npcs(room_id,village_id);
create table public.fnf_npc_jobs (
  room_id uuid not null,
  npc_id uuid not null references public.fnf_village_npcs(id) on delete cascade,
  day integer not null,
  job text not null check(job in ('farm','build','mine','research','rest')),
  assigned_by uuid not null references auth.users(id),
  completed boolean not null default false,
  primary key(room_id,npc_id,day)
);
create index fnf_npc_jobs_day_idx on public.fnf_npc_jobs(room_id,day);
create table public.fnf_player_labor (
  room_id uuid not null,
  village_id uuid not null,
  user_id uuid not null references auth.users(id),
  day integer not null,
  building_id uuid not null references public.fnf_village_buildings(id) on delete cascade,
  primary key(room_id,user_id,day),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade
);
alter table public.fnf_village_buildings enable row level security;
alter table public.fnf_npc_candidates enable row level security;
alter table public.fnf_village_npcs enable row level security;
alter table public.fnf_npc_jobs enable row level security;
alter table public.fnf_player_labor enable row level security;
revoke all on public.fnf_village_buildings,public.fnf_npc_candidates,
  public.fnf_village_npcs,public.fnf_npc_jobs,public.fnf_player_labor from public,anon,authenticated;

create function fnf_private.village_ops_snapshot(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); dm boolean; mine uuid; today integer;
begin
  select role='dm' into dm from public.fnf_room_members where room_id=p_room_id and user_id=actor;
  if dm is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  select village_id into mine from public.fnf_village_members where room_id=p_room_id and user_id=actor;
  select day into today from public.fnf_world where room_id=p_room_id;
  return jsonb_build_object('day',today,'mine',mine,
    'buildings',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'village_id',b.village_id,
      'kind',b.kind,'ready_day',b.ready_day,'remaining_days',b.remaining_days,
      'finished_day',b.finished_day,'durability',b.durability))
      from public.fnf_village_buildings b where b.room_id=p_room_id
      and (dm or b.village_id=mine)),'[]'::jsonb),
    'candidates',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'village_id',c.village_id,
      'name',c.name,'profession',c.profession,'aptitude',c.aptitude,'health',c.health,
      'created_day',c.created_day))
      from public.fnf_npc_candidates c where c.room_id=p_room_id
      and (dm or c.village_id=mine)),'[]'::jsonb),
    'my_labor',coalesce((select jsonb_agg(jsonb_build_object('building_id',building_id,'day',day))
      from public.fnf_player_labor where room_id=p_room_id and user_id=actor
        and day=today),'[]'::jsonb),
    'npcs',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'village_id',n.village_id,
      'name',n.name,'profession',n.profession,'aptitude',n.aptitude,
      'loyalty',n.loyalty,'health',n.health,'fatigue',n.fatigue,
      'skill_xp',n.skill_xp,'sick_until',n.sick_until,'job',j.job,
      'job_completed',j.completed))
      from public.fnf_village_npcs n left join public.fnf_npc_jobs j
        on j.npc_id=n.id and j.room_id=p_room_id and j.day=today
      where n.room_id=p_room_id and (dm or n.village_id=mine)),'[]'::jsonb));
end;
$$;
create function public.fnf_village_ops_snapshot(p_room_id uuid)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.village_ops_snapshot(p_room_id);
$$;

create function fnf_private.village_ops_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); role text; v uuid; world_day integer;
  permission_build boolean; permission_decide boolean; permission_assign boolean;
  kind text; cost_wood integer; cost_stone integer; duration integer;
  stock jsonb; candidate public.fnf_npc_candidates%rowtype;
  worker public.fnf_village_npcs%rowtype; candidate_id uuid;
begin
  select m.role into role from public.fnf_room_members m where m.room_id=p_room_id and m.user_id=actor;
  if role is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>1200
  then return jsonb_build_object('error','İşlem verisi geçersiz.'); end if;
  perform 1 from public.fnf_world where room_id=p_room_id for update;
  select day into world_day from public.fnf_world where room_id=p_room_id;
  if coalesce(p_payload->>'village_id','') !~
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Köy seç.'); end if;
  v:=(p_payload->>'village_id')::uuid;
  if not exists(select 1 from public.fnf_villages where id=v and room_id=p_room_id)
  then return jsonb_build_object('error','Köy bulunamadı.'); end if;
  if role<>'dm' then
    select vm.can_build or vm.role in ('owner','cofounder'),
      vm.can_decide or vm.role in ('owner','cofounder'),
      vm.can_assign or vm.role in ('owner','cofounder')
      into permission_build,permission_decide,permission_assign
      from public.fnf_village_members vm
      join public.fnf_characters c on c.room_id=vm.room_id and c.user_id=vm.user_id
      where vm.room_id=p_room_id and vm.village_id=v and vm.user_id=actor;
    if not found then return jsonb_build_object('error','Bu köyün üyesi değilsin.'); end if;
  end if;
  if p_action='build' then
    if role<>'dm' and not permission_build then return jsonb_build_object('error','İnşa yetkin yok.'); end if;
    kind:=p_payload->>'kind';
    if kind not in ('cottage','well','workshop','school')
    then return jsonb_build_object('error','Yapı bilinmiyor.'); end if;
    if kind in ('workshop','school') and not exists(
      select 1 from public.fnf_village_buildings where village_id=v and kind='cottage'
        and finished_day is not null and durability>0)
    then return jsonb_build_object('error','İleri yapı için önce kullanılabilir bir ev gerekli.'); end if;
    cost_wood:=case kind when 'cottage' then 4 when 'well' then 3
      when 'workshop' then 8 else 6 end;
    cost_stone:=case kind when 'cottage' then 2 when 'well' then 3
      when 'workshop' then 5 else 4 end;
    duration:=case kind when 'cottage' then 2 when 'well' then 2
      when 'workshop' then 4 else 3 end;
    select resources into stock from public.fnf_sim_state where room_id=p_room_id for update;
    if (stock->>'wood')::integer<cost_wood or (stock->>'stone')::integer<cost_stone
    then return jsonb_build_object('error','Malzemeler baştan tam olmalı.'); end if;
    update public.fnf_sim_state set resources=jsonb_set(jsonb_set(stock,'{wood}',
      to_jsonb((stock->>'wood')::integer-cost_wood)),'{stone}',
      to_jsonb((stock->>'stone')::integer-cost_stone)) where room_id=p_room_id;
    insert into public.fnf_village_buildings(room_id,village_id,kind,started_day,ready_day,remaining_days)
      values(p_room_id,v,kind,world_day,world_day+duration,duration);
    return jsonb_build_object('ok',true,'message','Malzemeler ayrıldı; inşa başladı.');
  elsif p_action='nominate' then
    if role<>'dm' then return jsonb_build_object('error','Adayı DM getirir.'); end if;
    kind:=p_payload->>'profession';
    if kind not in ('farmer','builder','miner','scholar','teacher')
      or char_length(btrim(coalesce(p_payload->>'name',''))) not between 2 and 40
      or coalesce(p_payload->>'aptitude','') !~ '^[1-5]$'
    then return jsonb_build_object('error','Aday bilgileri geçersiz.'); end if;
    insert into public.fnf_npc_candidates(room_id,village_id,name,profession,aptitude,created_day)
      values(p_room_id,v,btrim(p_payload->>'name'),kind,(p_payload->>'aptitude')::integer,world_day);
    return jsonb_build_object('ok',true,'message','Aday köy kapısına geldi.');
  end if;
  if coalesce(p_payload->>'target_id','') !~
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Kişi seç.'); end if;
  candidate_id:=(p_payload->>'target_id')::uuid;
  if p_action='work_build' then
    if role<>'dm' and not permission_build then return jsonb_build_object('error','İnşa yetkin yok.'); end if;
    if not exists(select 1 from public.fnf_village_buildings where id=candidate_id
      and room_id=p_room_id and village_id=v and finished_day is null)
    then return jsonb_build_object('error','Etkin inşaat bulunamadı.'); end if;
    insert into public.fnf_player_labor(room_id,village_id,user_id,day,building_id)
      values(p_room_id,v,actor,world_day,candidate_id) on conflict do nothing;
    if not found then return jsonb_build_object('error','Bugünkü inşa emeğini zaten verdin.'); end if;
    return jsonb_build_object('ok',true,'message','Bugünün inşa emeği kaydedildi.');
  end if;
  if p_action in ('accept','decline') then
    if role<>'dm' and not permission_decide then return jsonb_build_object('error','Karar yetkin yok.'); end if;
    select * into candidate from public.fnf_npc_candidates
      where id=candidate_id and room_id=p_room_id and village_id=v for update;
    if not found then return jsonb_build_object('error','Aday bulunamadı.'); end if;
    if p_action='accept' then
      if (select count(*) from public.fnf_village_npcs where village_id=v)>=
        (select count(*)*2 from public.fnf_village_buildings
         where village_id=v and kind='cottage' and finished_day is not null and durability>0)
      then return jsonb_build_object('error','Önce hazır bir evde yer aç.'); end if;
      insert into public.fnf_village_npcs(room_id,village_id,name,profession,aptitude,health)
        values(p_room_id,v,candidate.name,candidate.profession,candidate.aptitude,candidate.health);
    end if;
    delete from public.fnf_npc_candidates where id=candidate.id;
    return jsonb_build_object('ok',true);
  elsif p_action='assign' then
    if role<>'dm' and not permission_assign then return jsonb_build_object('error','İş atama yetkin yok.'); end if;
    select * into worker from public.fnf_village_npcs
      where id=candidate_id and room_id=p_room_id and village_id=v for update;
    if not found then return jsonb_build_object('error','Köylü bulunamadı.'); end if;
    kind:=p_payload->>'job';
    if kind not in ('farm','build','mine','research','rest')
    then return jsonb_build_object('error','İş bilinmiyor.'); end if;
    if worker.health<30 or worker.sick_until>=world_day
    then return jsonb_build_object('error','Köylü bugün çalışamayacak durumda.'); end if;
    if kind='research' and not exists(select 1 from public.fnf_village_buildings
      where village_id=v and kind='workshop' and finished_day is not null and durability>0)
    then return jsonb_build_object('error','Araştırma için çalışan bir atölye gerekli.'); end if;
    if kind='build' and not exists(select 1 from public.fnf_village_buildings
      where village_id=v and finished_day is null)
    then return jsonb_build_object('error','Süren bir inşaat yok.'); end if;
    insert into public.fnf_npc_jobs(room_id,npc_id,day,job,assigned_by)
      values(p_room_id,worker.id,world_day,kind,actor)
      on conflict(room_id,npc_id,day) do update
      set job=excluded.job,assigned_by=excluded.assigned_by
      where role='dm' and not public.fnf_npc_jobs.completed;
    if not found then return jsonb_build_object('error','Bu köylünün bugünkü işi kilitli; yalnız DM düzeltebilir.'); end if;
    return jsonb_build_object('ok',true,'message','Günlük iş atandı.');
  end if;
  return jsonb_build_object('error','Bilinmeyen köy işi.');
end;
$$;
create function public.fnf_village_ops_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.village_ops_action(p_room_id,p_action,p_payload);
$$;

-- The base day routine updates fnf_world before fnf_sim_state. Process jobs in
-- a BEFORE trigger on the latter so earned supplies cannot be overwritten.
create function fnf_private.finish_village_jobs()
returns trigger language plpgsql security definer set search_path = '' as $$
declare world_day integer; job_record record; labor_record record; worker public.fnf_village_npcs%rowtype;
  xp integer; resource_key text;
begin
  select day into world_day from public.fnf_world where room_id=new.room_id;
  for job_record in select j.* from public.fnf_npc_jobs j
    where j.room_id=new.room_id and j.day=world_day-1 and not j.completed
  loop
    select * into worker from public.fnf_village_npcs where id=job_record.npc_id for update;
    if job_record.job='rest' then
      update public.fnf_village_npcs set fatigue=greatest(0,fatigue-15),health=least(100,health+5)
        where id=worker.id;
    else
      xp:=coalesce((worker.skill_xp->>job_record.job)::integer,0)+
        case job_record.job when 'research' then 2 when 'mine' then 2 else 1 end;
      update public.fnf_village_npcs set skill_xp=jsonb_set(skill_xp,array[job_record.job],to_jsonb(xp)),
        fatigue=least(100,fatigue+8),
        sick_until=case when fatigue>88 then world_day+1 else sick_until end
        where id=worker.id;
      if job_record.job='build' then
        update public.fnf_village_buildings b set remaining_days=greatest(0,remaining_days-1),
          finished_day=case when remaining_days=1 then world_day else finished_day end
          where b.id=(select x.id from public.fnf_village_buildings x
            where x.village_id=worker.village_id and x.finished_day is null
            order by x.started_day,x.id limit 1);
      end if;
      if job_record.job in ('farm','mine') then
        resource_key:=case when job_record.job='farm' then 'food' else 'stone' end;
        new.resources:=jsonb_set(new.resources,array[resource_key],
          to_jsonb((new.resources->>resource_key)::integer+greatest(1,worker.aptitude/2)));
      end if;
    end if;
    update public.fnf_npc_jobs set completed=true
      where room_id=new.room_id and npc_id=worker.id and day=world_day-1;
  end loop;
  for labor_record in select * from public.fnf_player_labor where room_id=new.room_id and day=world_day-1 loop
    update public.fnf_village_buildings set remaining_days=greatest(0,remaining_days-1),
      finished_day=case when remaining_days=1 then world_day else finished_day end
      where id=labor_record.building_id and finished_day is null;
  end loop;
  return new;
end;
$$;
create trigger fnf_sim_finish_village_jobs before update of resources on public.fnf_sim_state
for each row execute function fnf_private.finish_village_jobs();
create function fnf_private.advance_village_ops()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v record; next_apt integer; name_pick text;
begin
  if new.day<=old.day then return new; end if;
  update public.fnf_village_npcs set fatigue=greatest(0,fatigue-3)
    where room_id=new.room_id;
  if new.day%5=0 then
    for v in select id,location_seed from public.fnf_villages where room_id=new.room_id loop
      if (select count(*) from public.fnf_npc_candidates where village_id=v.id)<3 then
        next_apt:=1+fnf_private.roll(v.location_seed,new.day,'candidate-apt',5);
        name_pick:=(array['Ela','Tan','Mira','Lora','Boran','Nora'])
          [1+fnf_private.roll(v.location_seed,new.day,'candidate-name',6)];
        insert into public.fnf_npc_candidates(room_id,village_id,name,profession,aptitude,created_day)
          values(new.room_id,v.id,name_pick||' '||new.day,
            (array['farmer','builder','miner','scholar','teacher'])
              [1+fnf_private.roll(v.location_seed,new.day,'candidate-prof',5)],
            case when next_apt=5 and fnf_private.roll(v.location_seed,new.day,'rare',10)<>0
              then 3 else next_apt end,new.day);
      end if;
    end loop;
  end if;
  return new;
end;
$$;
create trigger fnf_world_village_ops_day after update of day on public.fnf_world
for each row execute function fnf_private.advance_village_ops();
revoke execute on function fnf_private.village_ops_snapshot(uuid),
  fnf_private.village_ops_action(uuid,text,jsonb),fnf_private.advance_village_ops(),
  fnf_private.finish_village_jobs(),
  public.fnf_village_ops_snapshot(uuid),public.fnf_village_ops_action(uuid,text,jsonb)
  from public,anon;
grant execute on function fnf_private.village_ops_snapshot(uuid),
  fnf_private.village_ops_action(uuid,text,jsonb),
  public.fnf_village_ops_snapshot(uuid),public.fnf_village_ops_action(uuid,text,jsonb)
  to authenticated;

-- Keep village labor and people in campaign JSON backups. A malformed extension
-- raises inside the restore transaction so the new room is rolled back.
alter function fnf_private.backup_room(uuid) rename to backup_room_v09;
create function fnf_private.backup_room(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base jsonb;
begin
  base:=fnf_private.backup_room_v09(p_room_id);
  if base ? 'error' then return base; end if;
  return base||jsonb_build_object(
    'village_buildings',coalesce((select jsonb_agg(jsonb_build_object(
      'id',b.id,'village',v.name,'kind',b.kind,'started_day',b.started_day,
      'ready_day',b.ready_day,'remaining_days',b.remaining_days,
      'finished_day',b.finished_day,'durability',b.durability))
      from public.fnf_village_buildings b join public.fnf_villages v on v.id=b.village_id
      where b.room_id=p_room_id),'[]'::jsonb),
    'npc_candidates',coalesce((select jsonb_agg(jsonb_build_object(
      'village',v.name,'name',c.name,'profession',c.profession,
      'aptitude',c.aptitude,'health',c.health,'created_day',c.created_day))
      from public.fnf_npc_candidates c join public.fnf_villages v on v.id=c.village_id
      where c.room_id=p_room_id),'[]'::jsonb),
    'village_npcs',coalesce((select jsonb_agg(jsonb_build_object(
      'id',n.id,'village',v.name,'name',n.name,'profession',n.profession,
      'aptitude',n.aptitude,'loyalty',n.loyalty,'health',n.health,
      'fatigue',n.fatigue,'skill_xp',n.skill_xp,'sick_until',n.sick_until))
      from public.fnf_village_npcs n join public.fnf_villages v on v.id=n.village_id
      where n.room_id=p_room_id),'[]'::jsonb),
    'npc_jobs',coalesce((select jsonb_agg(jsonb_build_object(
      'npc_id',j.npc_id,'day',j.day,'job',j.job,
      'assigned_by',j.assigned_by,'completed',j.completed))
      from public.fnf_npc_jobs j join public.fnf_world w on w.room_id=j.room_id
      where j.room_id=p_room_id and j.day>=w.day-7),'[]'::jsonb),
    'player_labor',coalesce((select jsonb_agg(jsonb_build_object(
      'village',v.name,'building_id',l.building_id,'user_id',l.user_id,'day',l.day))
      from public.fnf_player_labor l join public.fnf_villages v on v.id=l.village_id
      join public.fnf_world w on w.room_id=l.room_id
      where l.room_id=p_room_id and l.day>=w.day-7),'[]'::jsonb));
end;
$$;
alter function fnf_private.restore_room(jsonb,text) rename to restore_room_v09;
create function fnf_private.restore_room(p_backup jsonb,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; new_room uuid; item jsonb; old_id text; new_id uuid;
  mapping_b jsonb:='{}'::jsonb; mapping_n jsonb:='{}'::jsonb; village_id uuid;
begin
  if p_backup ? 'village_buildings' then
    if jsonb_typeof(p_backup->'village_buildings') is distinct from 'array'
      or jsonb_typeof(p_backup->'npc_candidates') is distinct from 'array'
      or jsonb_typeof(p_backup->'village_npcs') is distinct from 'array'
      or jsonb_typeof(p_backup->'npc_jobs') is distinct from 'array'
      or jsonb_typeof(p_backup->'player_labor') is distinct from 'array'
      or jsonb_array_length(p_backup->'village_buildings')>10000
      or jsonb_array_length(p_backup->'npc_candidates')>10000
      or jsonb_array_length(p_backup->'village_npcs')>10000
      or jsonb_array_length(p_backup->'npc_jobs')>100000
      or jsonb_array_length(p_backup->'player_labor')>100000
    then return jsonb_build_object('error','Köy işleri yedeği geçersiz.'); end if;
  end if;
  result:=fnf_private.restore_room_v09(p_backup,p_password);
  if result ? 'error' or not(p_backup ? 'village_buildings') then return result; end if;
  new_room:=(result->>'id')::uuid;
  for item in select value from jsonb_array_elements(p_backup->'village_buildings') loop
    old_id:=item->>'id';
    if coalesce(old_id,'') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or mapping_b ? old_id then raise exception 'Yapı yedeği bozuk; geri yükleme iptal edildi.'; end if;
    select id into village_id from public.fnf_villages where room_id=new_room and name=item->>'village';
    if village_id is null then raise exception 'Yapının köyü bulunamadı; geri yükleme iptal edildi.'; end if;
    new_id:=gen_random_uuid();
    insert into public.fnf_village_buildings(id,room_id,village_id,kind,
      started_day,ready_day,remaining_days,finished_day,durability)
      values(new_id,new_room,village_id,item->>'kind',
        (item->>'started_day')::integer,(item->>'ready_day')::integer,
        (item->>'remaining_days')::integer,(item->>'finished_day')::integer,
        (item->>'durability')::integer);
    mapping_b:=mapping_b||jsonb_build_object(old_id,new_id::text);
  end loop;
  for item in select value from jsonb_array_elements(p_backup->'npc_candidates') loop
    select id into village_id from public.fnf_villages where room_id=new_room and name=item->>'village';
    if village_id is null then raise exception 'Adayın köyü bulunamadı; geri yükleme iptal edildi.'; end if;
    insert into public.fnf_npc_candidates(room_id,village_id,name,profession,aptitude,health,created_day)
      values(new_room,village_id,item->>'name',item->>'profession',
        (item->>'aptitude')::integer,(item->>'health')::integer,
        (item->>'created_day')::integer);
  end loop;
  for item in select value from jsonb_array_elements(p_backup->'village_npcs') loop
    old_id:=item->>'id';
    if coalesce(old_id,'') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or mapping_n ? old_id then raise exception 'NPC yedeği bozuk; geri yükleme iptal edildi.'; end if;
    select id into village_id from public.fnf_villages where room_id=new_room and name=item->>'village';
    if village_id is null then raise exception 'NPC köyü bulunamadı; geri yükleme iptal edildi.'; end if;
    new_id:=gen_random_uuid();
    insert into public.fnf_village_npcs(id,room_id,village_id,name,profession,
      aptitude,loyalty,health,fatigue,skill_xp,sick_until)
      values(new_id,new_room,village_id,item->>'name',item->>'profession',
        (item->>'aptitude')::integer,(item->>'loyalty')::integer,
        (item->>'health')::integer,(item->>'fatigue')::integer,
        item->'skill_xp',(item->>'sick_until')::integer);
    mapping_n:=mapping_n||jsonb_build_object(old_id,new_id::text);
  end loop;
  for item in select value from jsonb_array_elements(p_backup->'npc_jobs') loop
    if not(mapping_n ? (item->>'npc_id'))
    then raise exception 'İş sahibi bulunamadı; geri yükleme iptal edildi.'; end if;
    insert into public.fnf_npc_jobs(room_id,npc_id,day,job,assigned_by,completed)
      values(new_room,(mapping_n->>(item->>'npc_id'))::uuid,
        (item->>'day')::integer,item->>'job',(item->>'assigned_by')::uuid,
        (item->>'completed')::boolean);
  end loop;
  for item in select value from jsonb_array_elements(p_backup->'player_labor') loop
    if not(mapping_b ? (item->>'building_id'))
    then raise exception 'İşin yapısı bulunamadı; geri yükleme iptal edildi.'; end if;
    select id into village_id from public.fnf_villages where room_id=new_room and name=item->>'village';
    if village_id is null then raise exception 'İşin köyü bulunamadı; geri yükleme iptal edildi.'; end if;
    insert into public.fnf_player_labor(room_id,village_id,user_id,day,building_id)
      values(new_room,village_id,(item->>'user_id')::uuid,(item->>'day')::integer,
        (mapping_b->>(item->>'building_id'))::uuid);
  end loop;
  return result;
end;
$$;
revoke execute on function fnf_private.backup_room_v09(uuid),
  fnf_private.restore_room_v09(jsonb,text),
  fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text)
  from public,anon,authenticated;
grant execute on function fnf_private.backup_room(uuid),
  fnf_private.restore_room(jsonb,text) to authenticated;

-- Retire legacy room-wide shortcuts from the exposed RPC while existing backups
-- retain their historical four-slot ledger for compatibility.
create or replace function public.fnf_farm_action(p_room_id uuid,p_slot integer,
  p_action text,p_seed_id text default null)
returns jsonb language sql set search_path = '' as $$
  select jsonb_build_object('error','Yeni tarlalar için köy parsellerini kullan.');
$$;
create or replace function public.fnf_sim_action(p_room_id uuid,p_action text,
  p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql set search_path = '' as $$
begin
  if p_action in ('field','build','recruit') then
    return jsonb_build_object('error','Bu işlem artık köy defterinden yapılır.');
  end if;
  return fnf_private.sim_action(p_room_id,p_action,p_payload);
end;
$$;
