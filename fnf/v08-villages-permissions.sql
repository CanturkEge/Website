
-- FNF v0.8.0: village ownership, invitations, granular permissions, twenty-day seasons.
-- The old room farm ledger stays intact until its backup format can migrate safely.
create table public.fnf_villages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 36),
  location_seed text not null,
  terrain_hint text not null,
  created_at timestamptz not null default now(),
  unique(room_id,id),
  unique(room_id,name)
);
create table public.fnf_village_members (
  room_id uuid not null,
  village_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','cofounder','member')),
  can_build boolean not null default false,
  can_decide boolean not null default false,
  can_assign boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key(room_id,user_id),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade,
  foreign key(room_id,user_id) references public.fnf_room_members(room_id,user_id) on delete cascade
);
create index fnf_village_members_village_idx on public.fnf_village_members(village_id);
create table public.fnf_village_requests (
  room_id uuid not null,
  village_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(room_id,village_id,user_id),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade,
  foreign key(room_id,user_id) references public.fnf_room_members(room_id,user_id) on delete cascade
);
create table public.fnf_village_invites (
  room_id uuid not null,
  village_id uuid not null,
  user_id uuid not null,
  invited_role text not null check (invited_role in ('member','cofounder')),
  created_at timestamptz not null default now(),
  primary key(room_id,village_id,user_id),
  foreign key(room_id,village_id) references public.fnf_villages(room_id,id) on delete cascade,
  foreign key(room_id,user_id) references public.fnf_room_members(room_id,user_id) on delete cascade
);
alter table public.fnf_villages enable row level security;
alter table public.fnf_village_members enable row level security;
alter table public.fnf_village_requests enable row level security;
alter table public.fnf_village_invites enable row level security;
revoke all on public.fnf_villages,public.fnf_village_members,
  public.fnf_village_requests,public.fnf_village_invites from public,anon,authenticated;

create function fnf_private.village_snapshot(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); room_role text; my_village uuid;
begin
  select m.role into room_role from public.fnf_room_members m
    where m.room_id=p_room_id and m.user_id=actor;
  if room_role is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  select vm.village_id into my_village from public.fnf_village_members vm
    where vm.room_id=p_room_id and vm.user_id=actor;
  return jsonb_build_object(
    'villages',coalesce((select jsonb_agg(jsonb_build_object(
      'id',v.id,'name',v.name,'terrain_hint',v.terrain_hint,
      'member_count',(select count(*) from public.fnf_village_members x where x.village_id=v.id)
    ) order by v.created_at) from public.fnf_villages v where v.room_id=p_room_id),'[]'::jsonb),
    'mine',(select jsonb_build_object('village_id',vm.village_id,'role',vm.role,
      'can_build',vm.can_build or vm.role in ('owner','cofounder'),
      'can_decide',vm.can_decide or vm.role in ('owner','cofounder'),
      'can_assign',vm.can_assign or vm.role in ('owner','cofounder'))
      from public.fnf_village_members vm where vm.room_id=p_room_id and vm.user_id=actor),
    'members',coalesce((select jsonb_agg(jsonb_build_object(
      'village_id',vm.village_id,'user_id',vm.user_id,
      'name',coalesce(c.name,left(vm.user_id::text,8)),
      'role',vm.role,'can_build',vm.can_build,'can_decide',vm.can_decide,
      'can_assign',vm.can_assign) order by vm.joined_at)
      from public.fnf_village_members vm
      left join public.fnf_characters c on c.room_id=vm.room_id and c.user_id=vm.user_id
      where vm.room_id=p_room_id and (vm.village_id=my_village or room_role='dm')),'[]'::jsonb),
    'requests',coalesce((select jsonb_agg(jsonb_build_object(
      'village_id',q.village_id,'user_id',q.user_id,
      'name',coalesce(c.name,left(q.user_id::text,8))) order by q.created_at)
      from public.fnf_village_requests q
      left join public.fnf_characters c on c.room_id=q.room_id and c.user_id=q.user_id
      where q.room_id=p_room_id and (room_role='dm' or exists(
        select 1 from public.fnf_village_members vm
        where vm.village_id=q.village_id and vm.user_id=actor
          and vm.role in ('owner','cofounder')))),'[]'::jsonb),
    'invites',coalesce((select jsonb_agg(jsonb_build_object(
      'village_id',i.village_id,'name',v.name,'role',i.invited_role) order by i.created_at)
      from public.fnf_village_invites i join public.fnf_villages v on v.id=i.village_id
      where i.room_id=p_room_id and i.user_id=actor),'[]'::jsonb),
    'eligible',coalesce((select jsonb_agg(jsonb_build_object(
      'user_id',m.user_id,'name',coalesce(c.name,left(m.user_id::text,8))))
      from public.fnf_room_members m
      left join public.fnf_characters c on c.room_id=m.room_id and c.user_id=m.user_id
      where m.room_id=p_room_id and m.role='player'
        and not exists(select 1 from public.fnf_village_members vm
          where vm.room_id=p_room_id and vm.user_id=m.user_id)),'[]'::jsonb)
  );
end;
$$;
create function public.fnf_village_snapshot(p_room_id uuid)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.village_snapshot(p_room_id);
$$;

create function fnf_private.village_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid:=auth.uid(); room_role text; v_id uuid; target_id uuid; v_name text;
  own_role text; assigned_role text; world_day integer; n integer; new_id uuid;
  hint text; perm text; enabled boolean;
begin
  select m.role into room_role from public.fnf_room_members m
    where m.room_id=p_room_id and m.user_id=actor;
  if room_role is null then return jsonb_build_object('error','Oda erişimi yok.'); end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>1000
  then return jsonb_build_object('error','İşlem verisi geçersiz.'); end if;
  if p_action='create' then
    if room_role<>'player' or not exists(select 1 from public.fnf_characters
      where room_id=p_room_id and user_id=actor)
    then return jsonb_build_object('error','Köy kurmak için oyuncu karakteri gerekli.'); end if;
    if exists(select 1 from public.fnf_village_members
      where room_id=p_room_id and user_id=actor)
    then return jsonb_build_object('error','Zaten bir köydesin.'); end if;
    v_name:=btrim(coalesce(p_payload->>'name',''));
    if char_length(v_name) not between 2 and 36
    then return jsonb_build_object('error','Köy adı 2–36 karakter olmalı.'); end if;
    perform 1 from public.fnf_rooms where id=p_room_id for update;
    if (select count(*) from public.fnf_villages where room_id=p_room_id)>=50
    then return jsonb_build_object('error','Bu odada köy sınırına ulaşıldı.'); end if;
    new_id:=gen_random_uuid();
    hint:=(array['Orman eşiği','Sulak düzlük','Taşlı yükselti','Açık bozkır'])
      [1+fnf_private.roll(new_id::text,1,'terrain',4)];
    insert into public.fnf_villages(id,room_id,name,location_seed,terrain_hint)
      values(new_id,p_room_id,v_name,substr(md5(new_id::text),1,12),hint);
    insert into public.fnf_village_members(room_id,village_id,user_id,role,
      can_build,can_decide,can_assign)
      values(p_room_id,new_id,actor,'owner',true,true,true);
    delete from public.fnf_village_requests where room_id=p_room_id and user_id=actor;
    delete from public.fnf_village_invites where room_id=p_room_id and user_id=actor;
    return jsonb_build_object('ok',true,'message','Köy kuruldu; konumun ilk ipucu açıldı.');
  end if;
  if coalesce(p_payload->>'village_id','') !~
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Geçersiz köy.'); end if;
  v_id:=(p_payload->>'village_id')::uuid;
  if not exists(select 1 from public.fnf_villages where id=v_id and room_id=p_room_id)
  then return jsonb_build_object('error','Köy bulunamadı.'); end if;
  select vm.role into own_role from public.fnf_village_members vm
    where vm.room_id=p_room_id and vm.village_id=v_id and vm.user_id=actor;

  if p_action='request' then
    if room_role<>'player' or exists(select 1 from public.fnf_village_members
      where room_id=p_room_id and user_id=actor)
    then return jsonb_build_object('error','Başvuru için köysüz oyuncu olmalısın.'); end if;
    insert into public.fnf_village_requests(room_id,village_id,user_id)
      values(p_room_id,v_id,actor) on conflict do nothing;
    return jsonb_build_object('ok',true,'message','Katılım isteği köy yöneticilerine ulaştı.');
  end if;
  if p_action in ('accept_invite','decline_invite') then
    select i.invited_role into assigned_role from public.fnf_village_invites i
      where i.room_id=p_room_id and i.village_id=v_id and i.user_id=actor for update;
    if assigned_role is null then return jsonb_build_object('error','Davet bulunamadı.'); end if;
    if p_action='accept_invite' then
      if room_role<>'player' or exists(select 1 from public.fnf_village_members
        where room_id=p_room_id and user_id=actor)
      then return jsonb_build_object('error','Önce mevcut köy üyeliğini çöz.'); end if;
      if assigned_role='cofounder' then
        select day into world_day from public.fnf_world where room_id=p_room_id;
        select count(*) into n from public.fnf_village_members
          where village_id=v_id and role in ('owner','cofounder');
        if world_day<>1 or n>=3 then return jsonb_build_object('error','Kurucu davetinin süresi doldu.'); end if;
      end if;
      insert into public.fnf_village_members(room_id,village_id,user_id,role,
        can_build,can_decide,can_assign)
        values(p_room_id,v_id,actor,assigned_role,
          assigned_role='cofounder',assigned_role='cofounder',assigned_role='cofounder');
      delete from public.fnf_village_invites where room_id=p_room_id and user_id=actor;
      delete from public.fnf_village_requests where room_id=p_room_id and user_id=actor;
      return jsonb_build_object('ok',true,'message','Köye katıldın.');
    end if;
    delete from public.fnf_village_invites
      where room_id=p_room_id and village_id=v_id and user_id=actor;
    return jsonb_build_object('ok',true,'message','Davet reddedildi.');
  end if;
  if coalesce(own_role,'') not in ('owner','cofounder') and room_role<>'dm'
  then return jsonb_build_object('error','Bu karar için köy yöneticisi olmalısın.'); end if;
  if coalesce(p_payload->>'user_id','') !~
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then return jsonb_build_object('error','Geçersiz oyuncu.'); end if;
  target_id:=(p_payload->>'user_id')::uuid;
  if not exists(select 1 from public.fnf_room_members
    where room_id=p_room_id and user_id=target_id and role='player')
  then return jsonb_build_object('error','Oyuncu bu odada değil.'); end if;
  if p_action='invite' then
    if exists(select 1 from public.fnf_village_members
      where room_id=p_room_id and user_id=target_id)
    then return jsonb_build_object('error','Oyuncu zaten bir köyde.'); end if;
    assigned_role:=coalesce(p_payload->>'role','member');
    if assigned_role not in ('member','cofounder')
    then return jsonb_build_object('error','Geçersiz davet rolü.'); end if;
    if assigned_role='cofounder' then
      select day into world_day from public.fnf_world where room_id=p_room_id;
      select count(*) into n from public.fnf_village_members
        where village_id=v_id and role in ('owner','cofounder');
      if world_day<>1 or n>=3
      then return jsonb_build_object('error','Eş kurucu daveti yalnız ilk gün, en çok üç kurucu.'); end if;
    end if;
    insert into public.fnf_village_invites(room_id,village_id,user_id,invited_role)
      values(p_room_id,v_id,target_id,assigned_role)
      on conflict(room_id,village_id,user_id) do update set invited_role=excluded.invited_role;
    return jsonb_build_object('ok',true,'message','Davet gönderildi.');
  elsif p_action in ('accept_request','decline_request') then
    perform 1 from public.fnf_village_requests
      where room_id=p_room_id and village_id=v_id and user_id=target_id for update;
    if not found then return jsonb_build_object('error','Başvuru bulunamadı.'); end if;
    if p_action='accept_request' then
      if exists(select 1 from public.fnf_village_members
        where room_id=p_room_id and user_id=target_id)
      then return jsonb_build_object('error','Oyuncu artık başka köyde.'); end if;
      insert into public.fnf_village_members(room_id,village_id,user_id,role)
        values(p_room_id,v_id,target_id,'member');
      delete from public.fnf_village_requests where room_id=p_room_id and user_id=target_id;
      delete from public.fnf_village_invites where room_id=p_room_id and user_id=target_id;
      return jsonb_build_object('ok',true,'message','Oyuncu köye kabul edildi.');
    end if;
    delete from public.fnf_village_requests
      where room_id=p_room_id and village_id=v_id and user_id=target_id;
    return jsonb_build_object('ok',true,'message','Başvuru reddedildi.');
  elsif p_action='permission' then
    select role into assigned_role from public.fnf_village_members
      where room_id=p_room_id and village_id=v_id and user_id=target_id for update;
    if assigned_role is null or assigned_role<>'member'
    then return jsonb_build_object('error','Yetki yalnız normal köy üyesine değiştirilebilir.'); end if;
    perm:=p_payload->>'permission';
    if coalesce(perm,'') not in ('build','decide','assign') or coalesce(jsonb_typeof(p_payload->'enabled'),'')<>'boolean'
    then return jsonb_build_object('error','Geçersiz yetki.'); end if;
    enabled:=(p_payload->>'enabled')::boolean;
    update public.fnf_village_members set
      can_build=case when perm='build' then enabled else can_build end,
      can_decide=case when perm='decide' then enabled else can_decide end,
      can_assign=case when perm='assign' then enabled else can_assign end
      where room_id=p_room_id and village_id=v_id and user_id=target_id;
    return jsonb_build_object('ok',true,'message','Köy yetkisi güncellendi.');
  end if;
  return jsonb_build_object('error','Bilinmeyen işlem.');
end;
$$;
create function public.fnf_village_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language sql set search_path = '' as $$
  select fnf_private.village_action(p_room_id,p_action,p_payload);
$$;
revoke execute on function fnf_private.village_snapshot(uuid),
  fnf_private.village_action(uuid,text,jsonb),
  public.fnf_village_snapshot(uuid),
  public.fnf_village_action(uuid,text,jsonb) from public,anon;
grant execute on function fnf_private.village_snapshot(uuid),
  fnf_private.village_action(uuid,text,jsonb),
  public.fnf_village_snapshot(uuid),
  public.fnf_village_action(uuid,text,jsonb) to authenticated;

-- Seasonal calculations in the existing RPCs now use twenty game days.
create or replace function fnf_private.farm_action_v04(p_room_id uuid,p_slot integer,p_action text,p_seed_id text default null)
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
  season := (array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/20)%4)];
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

create or replace function fnf_private.sim_snapshot(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base jsonb; s public.fnf_sim_state%rowtype; d integer; season text;
begin
  base:=fnf_private.snapshot(p_room_id);
  if base ? 'error' then return base; end if;
  select * into s from public.fnf_sim_state where room_id=p_room_id;
  d:=(base->>'day')::integer;
  season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((d-1)/20)%4)];
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

create or replace function fnf_private.sim_action(p_room_id uuid,p_action text,p_payload jsonb default '{}'::jsonb)
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
  season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/20)%4)];
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
  season:=(array['Bahar','Yaz','Güz','Kış'])[1+(((d-1)/20)%4)];
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
      and (array['Bahar','Yaz','Güz','Kış'])[1+(((w.day-1)/20)%4)]=any(c.seasons)
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
update public.fnf_day_log set season=(array['Bahar','Yaz','Güz','Kış'])[1+(((day-1)/20)%4)];


-- Preserve villages and accepted permissions across campaign JSON backups.
create table fnf_private.pending_village_members (
  room_id uuid not null references public.fnf_rooms(id) on delete cascade,
  village_id uuid not null references public.fnf_villages(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','cofounder','member')),
  can_build boolean not null,
  can_decide boolean not null,
  can_assign boolean not null,
  primary key(room_id,user_id)
);
revoke all on fnf_private.pending_village_members from public,anon,authenticated;
create function fnf_private.attach_restored_village_member()
returns trigger language plpgsql security definer set search_path = '' as $$
declare saved fnf_private.pending_village_members%rowtype;
begin
  if new.role<>'player' then return new; end if;
  select * into saved from fnf_private.pending_village_members
    where room_id=new.room_id and user_id=new.user_id for update;
  if not found then return new; end if;
  insert into public.fnf_village_members(room_id,village_id,user_id,role,
    can_build,can_decide,can_assign)
    values(new.room_id,saved.village_id,new.user_id,saved.role,
      saved.can_build,saved.can_decide,saved.can_assign)
    on conflict(room_id,user_id) do nothing;
  delete from fnf_private.pending_village_members
    where room_id=new.room_id and user_id=new.user_id;
  return new;
end;
$$;
create trigger fnf_village_member_on_join after insert on public.fnf_room_members
  for each row execute function fnf_private.attach_restored_village_member();

alter function fnf_private.backup_room(uuid) rename to backup_room_v06;
create function fnf_private.backup_room(p_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base jsonb;
begin
  base:=fnf_private.backup_room_v06(p_room_id);
  if base ? 'error' then return base; end if;
  return base || jsonb_build_object(
    'villages',coalesce((select jsonb_agg(jsonb_build_object(
      'id',v.id,'name',v.name,'location_seed',v.location_seed,
      'terrain_hint',v.terrain_hint) order by v.created_at)
      from public.fnf_villages v where v.room_id=p_room_id),'[]'::jsonb),
    'village_members',coalesce((select jsonb_agg(jsonb_build_object(
      'village_id',m.village_id,'user_id',m.user_id,'role',m.role,
      'can_build',m.can_build,'can_decide',m.can_decide,'can_assign',m.can_assign))
      from public.fnf_village_members m where m.room_id=p_room_id),'[]'::jsonb));
end;
$$;
alter function fnf_private.restore_room(jsonb,text) rename to restore_room_v06;
create function fnf_private.restore_room(p_backup jsonb,p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; old_v jsonb; old_m jsonb; mapping jsonb:='{}'::jsonb;
  new_room uuid; new_v uuid; old_id text;
begin
  if p_backup ? 'villages' then
    if jsonb_typeof(p_backup->'villages') is distinct from 'array'
      or jsonb_array_length(p_backup->'villages')>50
      or jsonb_typeof(p_backup->'village_members') is distinct from 'array'
      or jsonb_array_length(p_backup->'village_members')>200
    then return jsonb_build_object('error','Köy yedeği geçersiz.'); end if;
  end if;
  result:=fnf_private.restore_room_v06(p_backup,p_password);
  if result ? 'error' or not (p_backup ? 'villages') then return result; end if;
  new_room:=(result->>'id')::uuid;
  for old_v in select value from jsonb_array_elements(p_backup->'villages') loop
    old_id:=old_v->>'id';
    if old_id is null or old_id !~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or char_length(btrim(coalesce(old_v->>'name',''))) not between 2 and 36
      or coalesce(old_v->>'location_seed','') !~ '^[0-9a-f]{12}$'
      or coalesce(old_v->>'terrain_hint','') not in
        ('Orman eşiği','Sulak düzlük','Taşlı yükselti','Açık bozkır')
      or mapping ? old_id
    then raise exception 'Köy yedeği bozuk; geri yükleme iptal edildi.'; end if;
    new_v:=gen_random_uuid();
    insert into public.fnf_villages(id,room_id,name,location_seed,terrain_hint)
      values(new_v,new_room,old_v->>'name',old_v->>'location_seed',
        old_v->>'terrain_hint');
    mapping:=mapping||jsonb_build_object(old_id,new_v::text);
  end loop;
  for old_m in select value from jsonb_array_elements(p_backup->'village_members') loop
    if not (mapping ? (old_m->>'village_id'))
      or coalesce(old_m->>'user_id','') !~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or coalesce(old_m->>'role','') not in ('owner','cofounder','member')
      or jsonb_typeof(old_m->'can_build') is distinct from 'boolean'
      or jsonb_typeof(old_m->'can_decide') is distinct from 'boolean'
      or jsonb_typeof(old_m->'can_assign') is distinct from 'boolean'
    then raise exception 'Köy üyesi yedeği bozuk; geri yükleme iptal edildi.'; end if;
    insert into fnf_private.pending_village_members(room_id,village_id,user_id,
      role,can_build,can_decide,can_assign)
      values(new_room,(mapping->>(old_m->>'village_id'))::uuid,
        (old_m->>'user_id')::uuid,old_m->>'role',
        (old_m->>'can_build')::boolean,(old_m->>'can_decide')::boolean,
        (old_m->>'can_assign')::boolean);
  end loop;
  return result;
end;
$$;
revoke execute on function fnf_private.attach_restored_village_member(),
  fnf_private.backup_room_v06(uuid),fnf_private.restore_room_v06(jsonb,text),
  fnf_private.backup_room(uuid),fnf_private.restore_room(jsonb,text)
  from public,anon,authenticated;
grant execute on function fnf_private.backup_room(uuid),
  fnf_private.restore_room(jsonb,text) to authenticated;
