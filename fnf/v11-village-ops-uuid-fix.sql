-- Production repair for v10: accept canonical five-group UUIDs in village and target validation.
create or replace function fnf_private.village_ops_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
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
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
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
    if kind<>'rest' and (worker.health<30 or worker.sick_until>=world_day)
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
