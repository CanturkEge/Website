-- Build 74: additive adventure tools. Existing accounts, items and campaigns are preserved.
-- Generated spell/resource metadata is appended by scripts/build-v74-rules.cjs.
begin;
create table if not exists public.campaign_tools_v74(
 campaign_id uuid primary key references public.campaigns(id) on delete cascade,
 data jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
create table if not exists public.adventure_rules_v74(
 id text primary key,
 data jsonb not null
);
alter table public.campaign_tools_v74 enable row level security;
alter table public.adventure_rules_v74 enable row level security;
revoke all on public.campaign_tools_v74,public.adventure_rules_v74 from public,anon,authenticated;

create or replace function public.tools_load_v74(p_session_token text,p_campaign uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=public.v66_session_user(p_session_token); r text; d jsonb; outd jsonb;
begin
 select role into r from public.campaign_members where campaign_id=p_campaign and user_id=u;
 if u is null or r is null then raise exception 'Oturum veya kampanya üyeliği geçersiz'; end if;
 select data into d from public.campaign_tools_v74 where campaign_id=p_campaign;
 d:=coalesce(d,'{}');
 if r='dm' then return d-'receipts'; end if;
 select jsonb_build_object(
 'effects',coalesce((select jsonb_agg(x) from jsonb_array_elements(coalesce(d->'effects','[]')) x where coalesce((x->>'visible')::boolean,true)),'[]'),
 'rolls',coalesce((select jsonb_agg(case when (x->>'private')::boolean then x-'dice'-'total'-'success'-'dc' else x end) from jsonb_array_elements(coalesce(d->'rolls','[]')) x where x->>'userId'=u::text),'[]'),
 'handouts',coalesce((select jsonb_agg(x-'dmNote'-'recipients') from jsonb_array_elements(coalesce(d->'handouts','[]')) x where (x->>'published')::boolean and (coalesce((x->>'all')::boolean,false) or (x->'recipients') ? u::text)),'[]'),
 'factions',coalesce((select jsonb_agg((x-'dmNote'-'history'-'scores')||jsonb_build_object('scores',jsonb_build_object('party',coalesce(x#>'{scores,party}','0'),u::text,coalesce(x#>array['scores',u::text],'0')),'history',coalesce((select jsonb_agg(h) from jsonb_array_elements(coalesce(x->'history','[]')) h where h->>'target' in ('party',u::text)),'[]'))) from jsonb_array_elements(coalesce(d->'factions','[]')) x where (x->>'visible')::boolean),'[]'),
 'downtime',coalesce((select jsonb_agg(x) from jsonb_array_elements(coalesce(d->'downtime','[]')) x where x->>'userId'=u::text),'[]'),
 'log',coalesce((select jsonb_agg(x) from jsonb_array_elements(coalesce(d->'log','[]')) x where x->>'userId'=u::text or (x->>'public')::boolean),'[]')
 ) into outd;
 return outd;
end $$;

create or replace function public.v74_character(p_state jsonb,p_character text)
returns jsonb language sql immutable set search_path=public as $$
 select x from jsonb_array_elements(coalesce(p_state->'characters','[]')) x where x->>'id'=p_character limit 1
$$;
create or replace function public.v74_put_character(p_state jsonb,p_character jsonb)
returns jsonb language sql immutable set search_path=public as $$
 select jsonb_set(p_state,'{characters}',coalesce(jsonb_agg(case when x->>'id'=p_character->>'id' then p_character else x end),'[]')) from jsonb_array_elements(coalesce(p_state->'characters','[]')) x
$$;
create or replace function public.v74_con_bonus(c jsonb)
returns integer language plpgsql stable set search_path=public as $$
declare n integer:=floor((coalesce((c#>>'{stats,CON}')::numeric,10)-10)/2); lv integer:=coalesce((c->>'level')::integer,1); cfg jsonb;
begin
 select data into cfg from public.adventure_rules_v74 ar where ar.id='class:'||(c->>'className');
 if (cfg->'saves') ? 'CON' or (c->>'className'='Monk' and lv>=14) then n:=n+2+(lv-1)/4; end if;
 select n+coalesce(sum(coalesce((x->>'saveBonus')::integer,0)),0) into n from jsonb_array_elements(coalesce(c->'inventory','[]')) x where coalesce((x->>'equipped')::boolean,false);
 if c->>'className'='Paladin' and lv>=6 then n:=n+greatest(1,floor((coalesce((c#>>'{stats,CHA}')::numeric,10)-10)/2)::integer); end if;
 return n;
end $$;

create or replace function public.v74_incapacitated(c jsonb)
returns boolean language sql immutable set search_path=public as $$
 select coalesce((c->>'hp')::numeric,1)<=0 or exists(
  select 1 from jsonb_array_elements(case when jsonb_typeof(c->'effects')='array' then c->'effects' else '[]' end) z
  where lower(trim(case when jsonb_typeof(z)='string' then z#>>'{}' else z->>'name' end)) in ('incapacitated','unconscious','paralyzed','petrified','stunned')
 )
$$;

create or replace function public.tools_action_v74(p_session_token text,p_campaign uuid,p_action text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); role_name text; s jsonb; d jsonb; c jsonb; rowd jsonb; oldrow jsonb; rows jsonb; x jsonb; item jsonb; rule jsonb; cfg jsonb; targets jsonb; receipt jsonb;
 id text; cid text; bucket text; op text; fingerprint text; lv integer; slot integer; maxuse integer; used integer; amount integer; n integer; dc integer; a integer; b integer; total integer; days integer; cost bigint; coins bigint; reward bigint; owner uuid; statval integer; firstdie integer;
 changed_state boolean:=false; isdm boolean; available boolean; concentration boolean; all_targets boolean; mode text; mat jsonb; inv jsonb; q integer; effect_id text; tstamp text:=clock_timestamp()::text;
begin
 select cm.role into role_name from public.campaign_members cm where cm.campaign_id=p_campaign and cm.user_id=u;
 if u is null or role_name is null then raise exception 'Oturum veya kampanya üyeliği geçersiz'; end if;
 isdm:=role_name='dm';
 if jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>100000 then raise exception 'Geçersiz işlem'; end if;
 op:=p_payload->>'opId';
 if op is null or char_length(op) not between 8 and 100 then raise exception 'İşlem kimliği eksik'; end if;
 fingerprint:=md5(p_action||p_payload::text);
 -- Keep lock order campaign -> tools -> wallet, including the combat trigger.
 select state into s from public.campaigns camp where camp.id=p_campaign for update;
 insert into public.campaign_tools_v74(campaign_id) values(p_campaign) on conflict do nothing;
 select data into d from public.campaign_tools_v74 where campaign_id=p_campaign for update;
 select x0 into receipt from jsonb_array_elements(coalesce(d->'receipts','[]')) x0 where x0->>'op'=op and x0->>'userId'=u::text;
 if receipt is not null then
  if receipt->>'hash'<>fingerprint then raise exception 'İşlem kimliği başka bir istekte kullanılmış'; end if;
  return public.tools_load_v74(p_session_token,p_campaign);
 end if;
 if not isdm and p_action not in ('cast','resource','ability','roll','downtime_request','downtime_cancel','effect_end') then raise exception 'Bu işlem yalnız DM tarafından yapılabilir'; end if;
 cid:=p_payload->>'characterId';
 if p_action in ('cast','resource','ability','downtime_request','rest') then
  c:=public.v74_character(s,cid);
  if c is null or coalesce(c->>'approvalStatus','approved')<>'approved' then raise exception 'Onaylı karakter bulunamadı'; end if;
  if not isdm and c->>'userId'<>u::text then raise exception 'Bu karakter sana ait değil'; end if;
  lv:=greatest(1,least(20,coalesce((c->>'level')::integer,1)));
  if not isdm and p_action in ('cast','resource') and public.v74_incapacitated(c) then raise exception 'Karakterin şu anda aksiyon kullanamıyor'; end if;
 end if;

 if p_action='cast' then
  select data into rule from public.adventure_rules_v74 ar where ar.id='spell:'||(p_payload->>'spellId');
  if rule is null then raise exception 'Büyü katalogda yok'; end if;
  select data into cfg from public.adventure_rules_v74 ar where ar.id='casting:'||(c->>'className')||':'||coalesce(c->>'subclass','');
  if cfg is null then select data into cfg from public.adventure_rules_v74 ar where ar.id='casting:'||(c->>'className')||':'; end if;
  cfg:=cfg->lv;
  available:=false;
  for x in select value from jsonb_array_elements(coalesce(c->'preparedSpells','[]')) loop
   if lower(trim(case when jsonb_typeof(x)='string' then x#>>'{}' else coalesce(x->>'name','') end))=lower(rule->>'name') or replace(case when jsonb_typeof(x)='string' then x#>>'{}' else coalesce(x->>'id',x->>'sourceId','') end,'v47-','')=rule->>'id' then available:=true; end if;
  end loop;
  if coalesce(cfg->'automatic','[]') ? lower(rule->>'name') then available:=true; end if;
  if not available or cfg is null then raise exception 'Büyü karakterin seçili veya otomatik büyüleri arasında değil'; end if;
  if coalesce((s->>'encounterActive')::boolean,false) and not isdm then
   if not coalesce((s#>>'{battleMap,published}')::boolean,false) then raise exception 'Savaş oyunculara açık değil'; end if;
   if not exists(select 1 from jsonb_array_elements(coalesce(s->'encounter','[]')) f where f->>'characterId'=cid and coalesce((f->>'hp')::numeric,0)>0 and ((f->>'turn')::boolean or lower(rule->>'castingTime') like '%reaction%')) then raise exception 'Aksiyon büyüleri kendi sıranda kullanılabilir'; end if;
   if lower(rule->>'castingTime') !~ '(action|reaction)' then raise exception 'Uzun hazırlık gerektiren büyüyü DM ile çözümle'; end if;
  end if;
  slot:=coalesce((p_payload->>'slot')::integer,0);
  if (rule->>'level')::integer=0 then
   if slot<>0 then raise exception 'Cantrip slot harcamaz'; end if;
  else
   if slot<(rule->>'level')::integer or slot>9 then raise exception 'Geçersiz slot seviyesi'; end if;
   if c->>'className'='Warlock' and (rule->>'level')::integer>=6 then
    if slot<>(rule->>'level')::integer or lv<11+(slot-6)*2 then raise exception 'Mystic Arcanum seviyesi uygun değil'; end if;
    id:='v74_arcanum_'||slot;used:=coalesce((c#>>array['resources',id])::integer,0);maxuse:=1;
    if used>=maxuse then raise exception 'Mystic Arcanum kullanılmış'; end if;
    c:=jsonb_set(c,'{resources}',coalesce(c->'resources','{}')||jsonb_build_object(id,used+1));
   else
    maxuse:=coalesce((cfg#>>array['slots',(slot-1)::text])::integer,0);used:=coalesce((c#>>array['spellSlotsUsed',slot::text])::integer,0);
    if used>=maxuse then raise exception 'Bu seviyede kullanılabilir slot yok'; end if;
    c:=jsonb_set(c,'{spellSlotsUsed}',coalesce(c->'spellSlotsUsed','{}')||jsonb_build_object(slot::text,used+1));
   end if;
  end if;
  targets:=coalesce(p_payload->'targets','[]');
  if jsonb_typeof(targets) is distinct from 'array' or jsonb_array_length(targets)>30 then raise exception 'Geçersiz hedefler'; end if;
  for x in select value from jsonb_array_elements(targets) loop
   if not exists(select 1 from jsonb_array_elements(coalesce(s->'characters','[]')) z where 'c:'||(z->>'id')=x#>>'{}') and not exists(select 1 from jsonb_array_elements(coalesce(s->'encounter','[]')) z where 'e:'||(z->>'id')=x#>>'{}') then raise exception 'Hedef artık bulunamıyor'; end if;
  end loop;
  concentration:=coalesce((rule->>'concentration')::boolean,false);
  if concentration then
   select coalesce(jsonb_agg(z),'[]') into rows from jsonb_array_elements(coalesce(d->'effects','[]')) z where not(z->>'sourceId'=cid and coalesce((z->>'concentration')::boolean,false));
   d:=jsonb_set(d,'{effects}',rows);
  end if;
  if concentration or rule->>'rounds' is not null then
   rowd:=jsonb_build_object('id',gen_random_uuid()::text,'name',rule->>'nameTr','sourceId',cid,'userId',c->>'userId','targets',targets,'concentration',concentration,'remaining',rule->'rounds','visible',true,'createdAt',tstamp);
   d:=jsonb_set(d,'{effects}',coalesce(d->'effects','[]')||jsonb_build_array(rowd));
  end if;
  s:=public.v74_put_character(s,c);changed_state:=true;
  rowd:=jsonb_build_object('id',gen_random_uuid()::text,'userId',c->>'userId','text',(c->>'name')||' · '||(rule->>'nameTr')||case when slot=0 then ' · cantrip' else ' · slot '||slot end,'createdAt',tstamp,'public',true);
  d:=jsonb_set(d,'{log}',jsonb_build_array(rowd)||coalesce(d->'log','[]'));

 elsif p_action='resource' then
  select data into cfg from public.adventure_rules_v74 ar where ar.id='class:'||(c->>'className')||':'||lv;
  select z into rule from jsonb_array_elements(coalesce(cfg->'resources','[]')) z where z->>'id'=p_payload->>'resourceId';
  if rule is null then raise exception 'Kaynak bu sınıfta veya seviyede yok'; end if;
  id:=rule->>'id';maxuse:=(rule->>'max')::integer;
  if coalesce(rule->>'ability','')<>'' then maxuse:=greatest(1,floor((coalesce((c#>>array['stats',left(rule->>'ability',3)])::numeric,10)-10)/2)::integer+case when right(rule->>'ability',2)='+1' then 1 else 0 end); end if;
  amount:=coalesce((p_payload->>'amount')::integer,1);used:=coalesce((c#>>array['resources',id])::integer,0);
  if amount<1 or amount>999 or (maxuse<>999 and used+amount>maxuse) then raise exception 'Yeterli sınıf kaynağı yok'; end if;
  c:=jsonb_set(c,'{resources}',coalesce(c->'resources','{}')||jsonb_build_object(id,used+amount));s:=public.v74_put_character(s,c);changed_state:=true;
  d:=jsonb_set(d,'{log}',jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'userId',c->>'userId','text',(c->>'name')||' · '||(rule->>'name')||' ×'||amount,'createdAt',tstamp,'public',true))||coalesce(d->'log','[]'));

 elsif p_action='ability' then
  select data into cfg from public.adventure_rules_v74 ar where ar.id='class:'||(c->>'className');
  select data into rule from public.adventure_rules_v74 ar where ar.id='subclass:'||(c->>'className')||':'||coalesce(c->>'subclass','');
  if not exists(select 1 from jsonb_array_elements(coalesce(cfg->'features','[]')||coalesce(rule->'features','[]')) z where z->>'name'=p_payload->>'name' and (z->>'level')::integer<=lv) then raise exception 'Bu özellik bu seviyede açık değil'; end if;
  d:=jsonb_set(d,'{log}',jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'userId',c->>'userId','text',(c->>'name')||' · '||(p_payload->>'name')||' (DM çözümlemesi)','createdAt',tstamp,'public',true))||coalesce(d->'log','[]'));

 elsif p_action='rest' then
  mode:=p_payload->>'kind';if mode not in ('short','long') then raise exception 'Dinlenme türü geçersiz'; end if;
  select data into cfg from public.adventure_rules_v74 ar where ar.id='class:'||(c->>'className')||':'||lv;
  rows:=coalesce(c->'resources','{}');
  for x in select value from jsonb_array_elements(coalesce(cfg->'resources','[]')) loop
   if mode='long' or x->>'rest'='short' then rows:=rows-(x->>'id'); end if;
  end loop;
  if mode='long' then for n in 6..9 loop rows:=rows-('v74_arcanum_'||n); end loop; end if;
  c:=jsonb_set(c,'{resources}',rows);
  if mode='long' or c->>'className'='Warlock' then c:=jsonb_set(c,'{spellSlotsUsed}','{}'); end if;
  s:=public.v74_put_character(s,c);changed_state:=true;

 elsif p_action='roll_request' then
  targets:=p_payload->'targets';if jsonb_typeof(targets) is distinct from 'array' or jsonb_array_length(targets) not between 1 and 50 then raise exception 'En az bir karakter seç'; end if;
  if char_length(trim(coalesce(p_payload->>'title',''))) not between 1 and 120 then raise exception 'Atış başlığı 1–120 karakter olmalı'; end if;
  if (select count(*) from jsonb_array_elements(coalesce(d->'rolls','[]')) z where z->>'status'='pending')+jsonb_array_length(targets)>100 then raise exception 'Önce bekleyen atışları kapat'; end if;
  for x in select value from jsonb_array_elements(targets) loop
   c:=public.v74_character(s,x->>'characterId');
   if c is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=(c->>'userId')::uuid) then raise exception 'Atış hedefi kampanyada değil'; end if;
   n:=coalesce((x->>'bonus')::integer,0);if n not between -30 and 100 then raise exception 'Atış bonusu geçersiz'; end if;
   dc:=(p_payload->>'dc')::integer;if dc is not null and dc not between 1 and 100 then raise exception 'DC 1–100 olmalı'; end if;
   mode:=coalesce(p_payload->>'mode','normal');if mode not in ('normal','advantage','disadvantage') then raise exception 'Geçersiz atış biçimi'; end if;
   rowd:=jsonb_build_object('id',gen_random_uuid()::text,'userId',c->>'userId','characterId',c->>'id','characterName',c->>'name','title',trim(p_payload->>'title'),'bonus',n,'dc',dc,'private',coalesce((p_payload->>'private')::boolean,false),'mode',mode,'status','pending','createdAt',tstamp);
   d:=jsonb_set(d,'{rolls}',jsonb_build_array(rowd)||coalesce(d->'rolls','[]'));
  end loop;

 elsif p_action in ('roll','roll_cancel') then
  id:=p_payload->>'id';select z into rowd from jsonb_array_elements(coalesce(d->'rolls','[]')) z where z->>'id'=id;
  if rowd is null or rowd->>'status'<>'pending' then raise exception 'Atış zaten yanıtlanmış veya iptal edilmiş'; end if;
  if not isdm and rowd->>'userId'<>u::text then raise exception 'Bu atış sana ait değil'; end if;
  effect_id:=rowd->>'effectId';
  if p_action='roll_cancel' then rowd:=rowd||jsonb_build_object('status','cancelled');
  else
   if effect_id is not null and not exists(select 1 from jsonb_array_elements(coalesce(d->'effects','[]')) z where z->>'id'=effect_id) then raise exception 'Bu konsantrasyon artık etkin değil'; end if;
   a:=floor(random()*20)::integer+1;b:=floor(random()*20)::integer+1;mode:=rowd->>'mode';
   firstdie:=case mode when 'advantage' then greatest(a,b) when 'disadvantage' then least(a,b) else a end;total:=firstdie+coalesce((rowd->>'bonus')::integer,0);dc:=(rowd->>'dc')::integer;
   rowd:=rowd||jsonb_build_object('status','resolved','dice',case when mode='normal' then jsonb_build_array(a) else jsonb_build_array(a,b) end,'total',total,'success',case when dc is null then null else total>=dc end,'resolvedAt',tstamp);
   if effect_id is not null and total<dc then
    select coalesce(jsonb_agg(z),'[]') into rows from jsonb_array_elements(coalesce(d->'effects','[]')) z where z->>'id'<>effect_id;d:=jsonb_set(d,'{effects}',rows);
   end if;
  end if;
  select coalesce(jsonb_agg(case when z->>'id'=id then rowd else z end),'[]') into rows from jsonb_array_elements(d->'rolls') z;d:=jsonb_set(d,'{rolls}',rows);

 elsif p_action='effect_add' then
  if char_length(trim(coalesce(p_payload->>'name',''))) not between 1 and 100 then raise exception 'Etki adı 1–100 karakter olmalı'; end if;
  n:=(p_payload->>'remaining')::integer;if n is not null and n not between 1 and 14400 then raise exception 'Süre 1–14400 tur olmalı'; end if;
  targets:=coalesce(p_payload->'targets','[]');if jsonb_typeof(targets) is distinct from 'array' or jsonb_array_length(targets)=0 then raise exception 'Etki hedefi seç'; end if;
  cid:=nullif(p_payload->>'sourceId','');c:=public.v74_character(s,cid);if cid is not null and c is null then raise exception 'Etki kaynağı bulunamadı'; end if;
  concentration:=coalesce((p_payload->>'concentration')::boolean,false);if concentration and c is null then raise exception 'Konsantrasyon için kaynak karakter seç'; end if;
  if concentration then select coalesce(jsonb_agg(z),'[]') into rows from jsonb_array_elements(coalesce(d->'effects','[]')) z where not(z->>'sourceId'=cid and coalesce((z->>'concentration')::boolean,false));d:=jsonb_set(d,'{effects}',rows);end if;
  rowd:=jsonb_build_object('id',gen_random_uuid()::text,'name',trim(p_payload->>'name'),'sourceId',cid,'userId',c->>'userId','targets',targets,'concentration',concentration,'remaining',n,'visible',coalesce((p_payload->>'visible')::boolean,true),'createdAt',tstamp);
  d:=jsonb_set(d,'{effects}',coalesce(d->'effects','[]')||jsonb_build_array(rowd));

 elsif p_action in ('effect_end','effect_tick') then
  id:=p_payload->>'id';select z into rowd from jsonb_array_elements(coalesce(d->'effects','[]')) z where z->>'id'=id;
  if rowd is null then raise exception 'Etki zaten sona ermiş'; end if;
  if not isdm and (rowd->>'userId' is distinct from u::text or not coalesce((rowd->>'concentration')::boolean,false)) then raise exception 'Yalnız kendi konsantrasyonunu bitirebilirsin'; end if;
  n:=(rowd->>'remaining')::integer;
  if p_action='effect_tick' and n is null then raise exception 'Süresiz etki elle bitirilir'; end if;
  select coalesce(jsonb_agg(case when z->>'id'=id then z||jsonb_build_object('remaining',n-1) else z end),'[]') into rows from jsonb_array_elements(d->'effects') z where z->>'id'<>id or (p_action='effect_tick' and n>1);d:=jsonb_set(d,'{effects}',rows);

 elsif p_action in ('handout_save','faction_save') then
  bucket:=case when p_action='handout_save' then 'handouts' else 'factions' end;id:=coalesce(nullif(p_payload->>'id',''),gen_random_uuid()::text);
  select z into oldrow from jsonb_array_elements(coalesce(d->bucket,'[]')) z where z->>'id'=id;
  if char_length(trim(coalesce(p_payload->>'title',''))) not between 1 and 100 or char_length(coalesce(p_payload->>'body',''))>20000 or char_length(coalesce(p_payload->>'dmNote',''))>5000 then raise exception 'Başlık veya metin uzunluğu geçersiz'; end if;
  if oldrow is null and jsonb_array_length(coalesce(d->bucket,'[]'))>=300 then raise exception 'Arşiv sınırına ulaşıldı'; end if;
  rowd:=jsonb_build_object('id',id,'title',trim(p_payload->>'title'),'body',coalesce(p_payload->>'body',''),'dmNote',coalesce(p_payload->>'dmNote',''),'updatedAt',tstamp);
  if bucket='handouts' then
   targets:=coalesce(p_payload->'recipients','[]');
   if jsonb_typeof(targets) is distinct from 'array' then raise exception 'Alıcı listesi geçersiz'; end if;
   for x in select value from jsonb_array_elements(targets) loop
    if not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id::text=x#>>'{}' and role='player') then raise exception 'Belge alıcısı kampanyada değil'; end if;
   end loop;
   if coalesce(p_payload->>'image','')<>'' and (p_payload->>'image' !~ '^https://[^[:space:]]+$' or char_length(p_payload->>'image')>2000) then raise exception 'Resim bağlantısı HTTPS olmalı'; end if;
   rowd:=rowd||jsonb_build_object('kind',coalesce(p_payload->>'kind','clue'),'image',coalesce(p_payload->>'image',''),'published',coalesce((p_payload->>'published')::boolean,false),'all',coalesce((p_payload->>'all')::boolean,false),'recipients',targets);
  else rowd:=rowd||jsonb_build_object('visible',coalesce((p_payload->>'visible')::boolean,false),'scores',coalesce(oldrow->'scores','{"party":0}'),'history',coalesce(oldrow->'history','[]')); end if;
  select coalesce(jsonb_agg(z),'[]') into rows from jsonb_array_elements(coalesce(d->bucket,'[]')) z where z->>'id'<>id;d:=jsonb_set(d,array[bucket],jsonb_build_array(rowd)||rows);

 elsif p_action in ('handout_delete','faction_delete') then
  bucket:=case when p_action='handout_delete' then 'handouts' else 'factions' end;id:=p_payload->>'id';select coalesce(jsonb_agg(z),'[]') into rows from jsonb_array_elements(coalesce(d->bucket,'[]')) z where z->>'id'<>id;d:=jsonb_set(d,array[bucket],rows);

 elsif p_action='reputation' then
  id:=p_payload->>'id';select z into rowd from jsonb_array_elements(coalesce(d->'factions','[]')) z where z->>'id'=id;
  if rowd is null then raise exception 'Topluluk bulunamadı'; end if;
  cid:=p_payload->>'target';if cid<>'party' and not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id::text=cid and role='player') then raise exception 'İtibar hedefi geçersiz'; end if;
  n:=(p_payload->>'delta')::integer;if n is null or n not between -200 and 200 then raise exception 'İtibar değişimi geçersiz'; end if;
  if char_length(trim(coalesce(p_payload->>'reason',''))) not between 1 and 500 then raise exception 'İtibar değişimi için gerekçe yaz'; end if;
  used:=coalesce((rowd#>>array['scores',cid])::integer,0);amount:=greatest(-100,least(100,used+n));
  rowd:=jsonb_set(rowd,array['scores',cid],to_jsonb(amount));
  rowd:=jsonb_set(rowd,'{history}',jsonb_build_array(jsonb_build_object('target',cid,'delta',amount-used,'value',amount,'reason',p_payload->>'reason','createdAt',tstamp))||coalesce(rowd->'history','[]'));
  select jsonb_agg(case when z->>'id'=id then rowd else z end) into rows from jsonb_array_elements(d->'factions') z;d:=jsonb_set(d,'{factions}',rows);

 elsif p_action='downtime_request' then
  if char_length(trim(coalesce(p_payload->>'title',''))) not between 1 and 100 or char_length(coalesce(p_payload->>'body',''))>3000 then raise exception 'Faaliyet adı/açıklaması geçersiz'; end if;
  mode:=p_payload->>'kind';if mode not in ('craft','research','training','work') then raise exception 'Faaliyet türü geçersiz'; end if;
  days:=(p_payload->>'days')::integer;cost:=coalesce((p_payload->>'cost')::bigint,0);if days is null or days not between 1 and 3650 or cost not between 0 and 1000000000 then raise exception 'Gün veya maliyet geçersiz'; end if;
  targets:=coalesce(p_payload->'materials','[]');if jsonb_typeof(targets) is distinct from 'array' or jsonb_array_length(targets)>30 then raise exception 'Malzeme listesi geçersiz'; end if;
  if (select count(distinct z->>'id') from jsonb_array_elements(targets) z)<>jsonb_array_length(targets) then raise exception 'Aynı malzemeyi iki kez ekleme'; end if;
  for x in select value from jsonb_array_elements(targets) loop
   if (x->>'qty')::integer<1 or not exists(select 1 from jsonb_array_elements(coalesce(c->'inventory','[]')) z where z->>'id'=x->>'id' and coalesce((z->>'qty')::integer,1)>=(x->>'qty')::integer) then raise exception 'Envanterde yeterli malzeme yok'; end if;
  end loop;
  if (select count(*) from jsonb_array_elements(coalesce(d->'downtime','[]')) z where z->>'userId'=c->>'userId' and z->>'status' in ('pending','approved'))>=30 then raise exception 'Önce açık faaliyetleri tamamla'; end if;
  rowd:=jsonb_build_object('id',gen_random_uuid()::text,'userId',c->>'userId','characterId',cid,'characterName',c->>'name','title',trim(p_payload->>'title'),'body',coalesce(p_payload->>'body',''),'kind',mode,'days',days,'progress',0,'cost',cost,'materials',targets,'status','pending','createdAt',tstamp);
  d:=jsonb_set(d,'{downtime}',jsonb_build_array(rowd)||coalesce(d->'downtime','[]'));

 elsif p_action in ('downtime_review','downtime_progress','downtime_complete','downtime_cancel') then
  id:=p_payload->>'id';select z into rowd from jsonb_array_elements(coalesce(d->'downtime','[]')) z where z->>'id'=id;
  if rowd is null then raise exception 'Faaliyet bulunamadı'; end if;
  if not isdm and (rowd->>'userId'<>u::text or rowd->>'status' not in ('pending','approved')) then raise exception 'Bu faaliyeti iptal edemezsin'; end if;
  if rowd->>'status' in ('completed','rejected','cancelled') then raise exception 'Faaliyet zaten kapanmış'; end if;
  if p_action='downtime_review' then
   if rowd->>'status'<>'pending' then raise exception 'Faaliyet daha önce incelenmiş'; end if;
   mode:=p_payload->>'decision';if mode not in ('approved','rejected') then raise exception 'Karar geçersiz'; end if;
   days:=coalesce((p_payload->>'days')::integer,(rowd->>'days')::integer);cost:=coalesce((p_payload->>'cost')::bigint,(rowd->>'cost')::bigint);reward:=coalesce((p_payload->>'rewardCoins')::bigint,0);
   if days not between 1 and 3650 or cost not between 0 and 1000000000 or reward not between 0 and 1000000000 then raise exception 'Faaliyet bedeli veya günü geçersiz'; end if;
   item:=coalesce(p_payload->'rewardItem','null');
   if item<>'null' and (jsonb_typeof(item)<>'object' or char_length(trim(coalesce(item->>'name',''))) not between 1 and 150 or coalesce((item->>'qty')::integer,1) not between 1 and 999) then raise exception 'Ödül eşyası geçersiz'; end if;
   rowd:=rowd||jsonb_build_object('status',mode,'days',days,'cost',cost,'rewardCoins',reward,'rewardItem',item,'dmReply',left(coalesce(p_payload->>'dmReply',''),3000),'reviewedAt',tstamp);
  elsif p_action='downtime_cancel' then rowd:=rowd||jsonb_build_object('status','cancelled');
  elsif p_action='downtime_progress' then
   if rowd->>'status'<>'approved' then raise exception 'Önce DM onayı gerekli'; end if;
   n:=(p_payload->>'days')::integer;if n is null or n not between 1 and 3650 then raise exception 'Geçen gün 1–3650 olmalı'; end if;
   rowd:=rowd||jsonb_build_object('progress',least((rowd->>'days')::integer,(rowd->>'progress')::integer+n));
  else
   if rowd->>'status'<>'approved' or (rowd->>'progress')::integer<(rowd->>'days')::integer then raise exception 'Onaylanan faaliyet süresi henüz dolmadı'; end if;
   c:=public.v74_character(s,rowd->>'characterId');if c is null then raise exception 'Karakter bulunamadı'; end if;
   owner:=(rowd->>'userId')::uuid;cost:=(rowd->>'cost')::bigint;reward:=coalesce((rowd->>'rewardCoins')::bigint,0);
   insert into public.campaign_wallets(campaign_id,user_id) values(p_campaign,owner) on conflict do nothing;
   select platinum::bigint*1000+gold::bigint*100+silver::bigint*10+copper::bigint into coins from public.campaign_wallets where campaign_id=p_campaign and user_id=owner for update;
   if coins<cost then raise exception 'Kesede yeterli para yok; faaliyet tamamlanmadı'; end if;
   inv:=coalesce(c->'inventory','[]');
   for mat in select value from jsonb_array_elements(coalesce(rowd->'materials','[]')) loop
    select z into item from jsonb_array_elements(inv) z where z->>'id'=mat->>'id';q:=(mat->>'qty')::integer;
    if item is null or coalesce((item->>'qty')::integer,1)<q then raise exception 'Gerekli malzeme eksik; faaliyet tamamlanmadı'; end if;
    if coalesce((item->>'equipped')::boolean,false) then raise exception 'Malzemeyi önce kuşanmayı bırak'; end if;
    select coalesce(jsonb_agg(case when z->>'id'=mat->>'id' then z||jsonb_build_object('qty',coalesce((z->>'qty')::integer,1)-q) else z end),'[]') into inv from jsonb_array_elements(inv) z where z->>'id'<>mat->>'id' or coalesce((z->>'qty')::integer,1)>q;
   end loop;
   item:=rowd->'rewardItem';if item is not null and item<>'null' then inv:=inv||jsonb_build_array(item||jsonb_build_object('id',gen_random_uuid()::text,'equipped',false,'qty',coalesce((item->>'qty')::integer,1))); end if;
   c:=jsonb_set(c,'{inventory}',inv);s:=public.v74_put_character(s,c);changed_state:=true;coins:=coins-cost+reward;
   update public.campaign_wallets set platinum=coins/1000,gold=(coins%1000)/100,silver=(coins%100)/10,copper=coins%10,updated_at=now() where campaign_id=p_campaign and user_id=owner;
   rowd:=rowd||jsonb_build_object('status','completed','completedAt',tstamp);
   perform public.audit_insert_v69(p_campaign,u,'downtime','Dinlenme faaliyeti tamamlandı',(c->>'name')||' · '||(rowd->>'title'),jsonb_build_object('costCP',cost,'rewardCP',reward,'materials',rowd->'materials','rewardItem',rowd->'rewardItem'));
  end if;
  select jsonb_agg(case when z->>'id'=id then rowd else z end) into rows from jsonb_array_elements(d->'downtime') z;d:=jsonb_set(d,'{downtime}',rows);
 else raise exception 'Bilinmeyen macera işlemi';
 end if;
 -- Incapacitating manual conditions end concentration even without a legacy state write.
 select coalesce(jsonb_agg(z),'[]') into rows from jsonb_array_elements(coalesce(d->'effects','[]')) z
 where not (coalesce((z->>'concentration')::boolean,false) and exists(
  select 1 from jsonb_array_elements(coalesce(d->'effects','[]')) blocker
  where lower(trim(blocker->>'name')) in ('incapacitated','unconscious','paralyzed','petrified','stunned')
   and (blocker->'targets') ? ('c:'||(z->>'sourceId'))
 ));d:=jsonb_set(d,'{effects}',rows);
 if jsonb_array_length(rows)>200 then raise exception 'Önce süresi dolan etkileri kapat (en çok 200 etki)'; end if;
 -- Obsolete concentration checks must never end a newly cast concentration spell.
 select coalesce(jsonb_agg(case when z->>'status'='pending' and z->>'effectId' is not null and not exists(select 1 from jsonb_array_elements(coalesce(d->'effects','[]')) e where e->>'id'=z->>'effectId') then z||'{"status":"cancelled"}'::jsonb else z end),'[]') into rows from jsonb_array_elements(coalesce(d->'rolls','[]')) z;d:=jsonb_set(d,'{rolls}',rows);
 select coalesce(jsonb_agg(z),'[]') into rows from (select value z from jsonb_array_elements(coalesce(d->'log','[]')) limit 200) q0;d:=jsonb_set(d,'{log}',rows);
 receipt:=jsonb_build_object('op',op,'userId',u::text,'hash',fingerprint,'createdAt',tstamp);
 select coalesce(jsonb_agg(z),'[]') into rows from (select value z from jsonb_array_elements(jsonb_build_array(receipt)||coalesce(d->'receipts','[]')) limit 500) q0;d:=jsonb_set(d,'{receipts}',rows);
 update public.campaign_tools_v74 set data=d,updated_at=now() where campaign_id=p_campaign;
 if changed_state then update public.campaigns camp set state=s,updated_at=now() where camp.id=p_campaign; end if;
 return public.tools_load_v74(p_session_token,p_campaign);
end $$;

-- All legacy turn/HP buttons and RPCs pass through this one hook.
create or replace function public.combat_tools_sync_v74()
returns trigger language plpgsql security definer set search_path=public as $$
declare d jsonb; e jsonb; effects jsonb:='[]'; rolls jsonb; c jsonb; oldc jsonb; f jsonb; oldf jsonb; n integer; loss integer; bonus integer; turn_id text; old_turn text; round_n integer; old_round integer; tick boolean; dead boolean; mode text;
begin
 if new.state is not distinct from old.state then return new; end if;
 if new.state->'characters' is not distinct from old.state->'characters' and new.state->'encounter' is not distinct from old.state->'encounter' and new.state->'encounterRound' is not distinct from old.state->'encounterRound' then return new; end if;
 select data into d from public.campaign_tools_v74 where campaign_id=new.id for update;
 if d is null or jsonb_array_length(coalesce(d->'effects','[]'))=0 then return new; end if;
 select x->>'id' into turn_id from jsonb_array_elements(coalesce(new.state->'encounter','[]')) x where (x->>'turn')::boolean limit 1;
 select x->>'id' into old_turn from jsonb_array_elements(coalesce(old.state->'encounter','[]')) x where (x->>'turn')::boolean limit 1;
 round_n:=coalesce((new.state->>'encounterRound')::integer,1);old_round:=coalesce((old.state->>'encounterRound')::integer,1);rolls:=coalesce(d->'rolls','[]');
 for e in select value from jsonb_array_elements(d->'effects') loop
  c:=public.v74_character(new.state,e->>'sourceId');oldc:=public.v74_character(old.state,e->>'sourceId');
  select x into f from jsonb_array_elements(coalesce(new.state->'encounter','[]')) x where x->>'characterId'=e->>'sourceId' limit 1;
  select x into oldf from jsonb_array_elements(coalesce(old.state->'encounter','[]')) x where x->>'characterId'=e->>'sourceId' limit 1;
  dead:=coalesce((e->>'concentration')::boolean,false) and (c is null or public.v74_incapacitated(c) or (f is not null and public.v74_incapacitated(f)));
  tick:=coalesce((new.state->>'encounterActive')::boolean,false) and coalesce((old.state->>'encounterActive')::boolean,false) and (turn_id is distinct from old_turn or round_n>old_round) and case when e->>'sourceId' is null then round_n>old_round else f->>'id'=turn_id end;
  n:=(e->>'remaining')::integer;if tick and n is not null then n:=n-1;e:=e||jsonb_build_object('remaining',n);end if;
  if dead or n<=0 then continue; end if;
  effects:=effects||jsonb_build_array(e);
  loss:=greatest(0,coalesce((oldc->>'hp')::integer,0)+coalesce((oldc->>'tempHp')::integer,0)-coalesce((c->>'hp')::integer,0)-coalesce((c->>'tempHp')::integer,0));
  if loss=0 and f is not null and oldf is not null then loss:=greatest(0,coalesce((oldf->>'hp')::integer,0)-coalesce((f->>'hp')::integer,0));end if;
  if loss>0 and coalesce((e->>'concentration')::boolean,false) then
   bonus:=public.v74_con_bonus(c);mode:=case when exists(select 1 from jsonb_array_elements_text(coalesce(c->'feats','[]')) feat where lower(trim(feat))='war caster') then 'advantage' else 'normal' end;
   rolls:=jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'userId',c->>'userId','characterId',c->>'id','characterName',c->>'name','title','Konsantrasyon · '||(e->>'name'),'bonus',bonus,'dc',greatest(10,loss/2),'private',false,'mode',mode,'status','pending','effectId',e->>'id','createdAt',clock_timestamp()::text))||rolls;
  end if;
 end loop;
 select coalesce(jsonb_agg(case when z->>'status'='pending' and z->>'effectId' is not null and not exists(select 1 from jsonb_array_elements(effects) a where a->>'id'=z->>'effectId') then z||'{"status":"cancelled"}'::jsonb else z end),'[]') into rolls from jsonb_array_elements(rolls) z;
 d:=jsonb_set(jsonb_set(d,'{effects}',effects),'{rolls}',rolls);
 update public.campaign_tools_v74 set data=d,updated_at=now() where campaign_id=new.id;
 return new;
end $$;
drop trigger if exists campaign_combat_tools_v74 on public.campaigns;
create trigger campaign_combat_tools_v74 after update of state on public.campaigns for each row execute function public.combat_tools_sync_v74();
revoke all on function public.v74_character(jsonb,text),public.v74_put_character(jsonb,jsonb),public.v74_con_bonus(jsonb),public.v74_incapacitated(jsonb),public.combat_tools_sync_v74(),public.tools_load_v74(text,uuid),public.tools_action_v74(text,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.tools_load_v74(text,uuid),public.tools_action_v74(text,uuid,text,jsonb) to anon;
-- BEGIN GENERATED RULES
insert into public.adventure_rules_v74(id,data) values
('spell:acid-arrow','{"id":"acid-arrow","name":"Acid Arrow","nameTr":"Asit Oku","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:acid-splash','{"id":"acid-splash","name":"Acid Splash","nameTr":"Asit Sıçraması","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:aid','{"id":"aid","name":"Aid","nameTr":"Yardım","level":2,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:alarm','{"id":"alarm","name":"Alarm","nameTr":"Alarm","level":1,"castingTime":"1 minute","concentration":false,"rounds":4800}'::jsonb),
('spell:alter-self','{"id":"alter-self","name":"Alter Self","nameTr":"Kendini Değiştir","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:animal-friendship','{"id":"animal-friendship","name":"Animal Friendship","nameTr":"Hayvan Dostluğu","level":1,"castingTime":"1 action","concentration":false,"rounds":14400}'::jsonb),
('spell:animal-messenger','{"id":"animal-messenger","name":"Animal Messenger","nameTr":"Hayvan Habercisi","level":2,"castingTime":"1 action","concentration":false,"rounds":14400}'::jsonb),
('spell:animal-shapes','{"id":"animal-shapes","name":"Animal Shapes","nameTr":"Hayvan Şekilleri","level":8,"castingTime":"1 action","concentration":true,"rounds":14400}'::jsonb),
('spell:animate-dead','{"id":"animate-dead","name":"Animate Dead","nameTr":"Ölüleri Canlandır","level":3,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:animate-objects','{"id":"animate-objects","name":"Animate Objects","nameTr":"Nesneleri Canlandır","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:antilife-shell','{"id":"antilife-shell","name":"Antilife Shell","nameTr":"Hayat Karşıtı Kabuk","level":5,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:antimagic-field','{"id":"antimagic-field","name":"Antimagic Field","nameTr":"Antisihir Alanı","level":8,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:antipathy-sympathy','{"id":"antipathy-sympathy","name":"Antipathy/Sympathy","nameTr":"Antipati/Sempati","level":8,"castingTime":"1 hour","concentration":false,"rounds":144000}'::jsonb),
('spell:arcane-eye','{"id":"arcane-eye","name":"Arcane Eye","nameTr":"Gizemli Göz","level":4,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:arcane-hand','{"id":"arcane-hand","name":"Arcane Hand","nameTr":"Esrarlı El","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:arcane-lock','{"id":"arcane-lock","name":"Arcane Lock","nameTr":"Gizemli Kilit","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:arcane-sword','{"id":"arcane-sword","name":"Arcane Sword","nameTr":"Esrarlı Kılıç","level":7,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:arcanists-magic-aura','{"id":"arcanists-magic-aura","name":"Arcanist''s Magic Aura","nameTr":"Arcanist''in Büyülü Aurası","level":2,"castingTime":"1 action","concentration":false,"rounds":14400}'::jsonb),
('spell:astral-projection','{"id":"astral-projection","name":"Astral Projection","nameTr":"Astral Projeksiyon","level":9,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:augury','{"id":"augury","name":"Augury","nameTr":"Kehanet","level":2,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:awaken','{"id":"awaken","name":"Awaken","nameTr":"Uyan","level":5,"castingTime":"8 hours","concentration":false,"rounds":null}'::jsonb),
('spell:bane','{"id":"bane","name":"Bane","nameTr":"Felaket","level":1,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:banishment','{"id":"banishment","name":"Banishment","nameTr":"Sürgün","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:barkskin','{"id":"barkskin","name":"Barkskin","nameTr":"Barkskin","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:beacon-of-hope','{"id":"beacon-of-hope","name":"Beacon of Hope","nameTr":"Umut Feneri","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:bestow-curse','{"id":"bestow-curse","name":"Bestow Curse","nameTr":"Lanet Ver","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:black-tentacles','{"id":"black-tentacles","name":"Black Tentacles","nameTr":"Siyah Dokunaçlar","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:blade-barrier','{"id":"blade-barrier","name":"Blade Barrier","nameTr":"Bıçak Bariyeri","level":6,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:bless','{"id":"bless","name":"Bless","nameTr":"korusun","level":1,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:blight','{"id":"blight","name":"Blight","nameTr":"Yanıklık","level":4,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:blindness-deafness','{"id":"blindness-deafness","name":"Blindness/Deafness","nameTr":"Körlük/Sağırlık","level":2,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:blink','{"id":"blink","name":"Blink","nameTr":"Yanıp sönüyor","level":3,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:blur','{"id":"blur","name":"Blur","nameTr":"Bulanıklaştırma","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:branding-smite','{"id":"branding-smite","name":"Branding Smite","nameTr":"Markalaşma Çarpması","level":2,"castingTime":"1 bonus action","concentration":true,"rounds":10}'::jsonb),
('spell:burning-hands','{"id":"burning-hands","name":"Burning Hands","nameTr":"Yanan Eller","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:call-lightning','{"id":"call-lightning","name":"Call Lightning","nameTr":"Yıldırım''ı ara","level":3,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:calm-emotions','{"id":"calm-emotions","name":"Calm Emotions","nameTr":"Sakin Duygular","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:chain-lightning','{"id":"chain-lightning","name":"Chain Lightning","nameTr":"Zincir Yıldırım","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:charm-person','{"id":"charm-person","name":"Charm Person","nameTr":"Cazibe Kişisi","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:chill-touch','{"id":"chill-touch","name":"Chill Touch","nameTr":"Sakin Dokunuş","level":0,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:circle-of-death','{"id":"circle-of-death","name":"Circle of Death","nameTr":"Ölüm Çemberi","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:clairvoyance','{"id":"clairvoyance","name":"Clairvoyance","nameTr":"Basiret","level":3,"castingTime":"10 minutes","concentration":true,"rounds":100}'::jsonb),
('spell:clone','{"id":"clone","name":"Clone","nameTr":"Klon","level":8,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:cloudkill','{"id":"cloudkill","name":"Cloudkill","nameTr":"Bulut Öldürme","level":5,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:color-spray','{"id":"color-spray","name":"Color Spray","nameTr":"Renk Spreyi","level":1,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:command','{"id":"command","name":"Command","nameTr":"Komut","level":1,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:commune','{"id":"commune","name":"Commune","nameTr":"Komün","level":5,"castingTime":"1 minute","concentration":false,"rounds":10}'::jsonb),
('spell:commune-with-nature','{"id":"commune-with-nature","name":"Commune With Nature","nameTr":"Doğayla İletişim Kurun","level":5,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:comprehend-languages','{"id":"comprehend-languages","name":"Comprehend Languages","nameTr":"Dilleri Anlayın","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:compulsion','{"id":"compulsion","name":"Compulsion","nameTr":"Zorunluluk","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:cone-of-cold','{"id":"cone-of-cold","name":"Cone of Cold","nameTr":"Soğuk Konisi","level":5,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:confusion','{"id":"confusion","name":"Confusion","nameTr":"Karışıklık","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:conjure-animals','{"id":"conjure-animals","name":"Conjure Animals","nameTr":"Hayvanları Büyüle","level":3,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:conjure-celestial','{"id":"conjure-celestial","name":"Conjure Celestial","nameTr":"Göksel Büyü Yap","level":7,"castingTime":"1 minute","concentration":true,"rounds":600}'::jsonb),
('spell:conjure-elemental','{"id":"conjure-elemental","name":"Conjure Elemental","nameTr":"Elemental''i Büyüle","level":5,"castingTime":"1 minute","concentration":true,"rounds":600}'::jsonb),
('spell:conjure-fey','{"id":"conjure-fey","name":"Conjure Fey","nameTr":"Fey''i Büyüle","level":6,"castingTime":"1 minute","concentration":true,"rounds":600}'::jsonb),
('spell:conjure-minor-elementals','{"id":"conjure-minor-elementals","name":"Conjure Minor Elementals","nameTr":"Minör Elementalleri Büyüle","level":4,"castingTime":"1 minute","concentration":true,"rounds":600}'::jsonb),
('spell:conjure-woodland-beings','{"id":"conjure-woodland-beings","name":"Conjure Woodland Beings","nameTr":"Orman Varlıklarını Çağır","level":4,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:contact-other-plane','{"id":"contact-other-plane","name":"Contact Other Plane","nameTr":"Diğer Uçakla İletişime Geçin","level":5,"castingTime":"1 minute","concentration":false,"rounds":10}'::jsonb),
('spell:contagion','{"id":"contagion","name":"Contagion","nameTr":"Bulaşma","level":5,"castingTime":"1 action","concentration":false,"rounds":100800}'::jsonb),
('spell:contingency','{"id":"contingency","name":"Contingency","nameTr":"beklenmedik durum","level":6,"castingTime":"10 minutes","concentration":false,"rounds":144000}'::jsonb),
('spell:continual-flame','{"id":"continual-flame","name":"Continual Flame","nameTr":"Sürekli Alev","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:control-water','{"id":"control-water","name":"Control Water","nameTr":"Kontrol Suyu","level":4,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:control-weather','{"id":"control-weather","name":"Control Weather","nameTr":"Hava Durumunun Kontrolü","level":8,"castingTime":"10 minutes","concentration":true,"rounds":4800}'::jsonb),
('spell:counterspell','{"id":"counterspell","name":"Counterspell","nameTr":"Karşı büyü","level":3,"castingTime":"1 reaction","concentration":false,"rounds":null}'::jsonb),
('spell:create-food-and-water','{"id":"create-food-and-water","name":"Create Food and Water","nameTr":"Yiyecek ve Su Oluşturun","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:create-undead','{"id":"create-undead","name":"Create Undead","nameTr":"Ölümsüz Yarat","level":6,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:create-or-destroy-water','{"id":"create-or-destroy-water","name":"Create or Destroy Water","nameTr":"Su Yaratın veya Yok Edin","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:creation','{"id":"creation","name":"Creation","nameTr":"Yaratılış","level":5,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:cure-wounds','{"id":"cure-wounds","name":"Cure Wounds","nameTr":"Yaraları İyileştirmek","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:dancing-lights','{"id":"dancing-lights","name":"Dancing Lights","nameTr":"Dans Eden Işıklar","level":0,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:darkness','{"id":"darkness","name":"Darkness","nameTr":"Karanlık","level":2,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:darkvision','{"id":"darkvision","name":"Darkvision","nameTr":"Karanlık görüş","level":2,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:daylight','{"id":"daylight","name":"Daylight","nameTr":"Gün ışığı","level":3,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:death-ward','{"id":"death-ward","name":"Death Ward","nameTr":"Ölüm Koğuşu","level":4,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:delayed-blast-fireball','{"id":"delayed-blast-fireball","name":"Delayed Blast Fireball","nameTr":"Gecikmeli Patlama Ateş Topu","level":7,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:demiplane','{"id":"demiplane","name":"Demiplane","nameTr":"Yarım düzlem","level":8,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:detect-evil-and-good','{"id":"detect-evil-and-good","name":"Detect Evil and Good","nameTr":"Kötüyü ve İyiyi Algıla","level":1,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:detect-magic','{"id":"detect-magic","name":"Detect Magic","nameTr":"Büyüyü Algıla","level":1,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:detect-poison-and-disease','{"id":"detect-poison-and-disease","name":"Detect Poison and Disease","nameTr":"Zehir ve Hastalığı Tespit Et","level":1,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:detect-thoughts','{"id":"detect-thoughts","name":"Detect Thoughts","nameTr":"Düşünceleri Algıla","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:dimension-door','{"id":"dimension-door","name":"Dimension Door","nameTr":"Boyut Kapısı","level":4,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:disguise-self','{"id":"disguise-self","name":"Disguise Self","nameTr":"Kendini Gizle","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:disintegrate','{"id":"disintegrate","name":"Disintegrate","nameTr":"Parçalanmak","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:dispel-evil-and-good','{"id":"dispel-evil-and-good","name":"Dispel Evil and Good","nameTr":"Kötülüğü ve İyiliği Defet","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:dispel-magic','{"id":"dispel-magic","name":"Dispel Magic","nameTr":"Büyüyü Gider","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:divination','{"id":"divination","name":"Divination","nameTr":"Kehanet","level":4,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:divine-favor','{"id":"divine-favor","name":"Divine Favor","nameTr":"İlahi Lütuf","level":1,"castingTime":"1 bonus action","concentration":true,"rounds":10}'::jsonb),
('spell:divine-word','{"id":"divine-word","name":"Divine Word","nameTr":"İlahi Kelime","level":7,"castingTime":"1 bonus action","concentration":false,"rounds":null}'::jsonb),
('spell:dominate-beast','{"id":"dominate-beast","name":"Dominate Beast","nameTr":"Canavara Hakim Ol","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:dominate-monster','{"id":"dominate-monster","name":"Dominate Monster","nameTr":"Canavara Hakim Ol","level":8,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:dominate-person','{"id":"dominate-person","name":"Dominate Person","nameTr":"Hakim Kişi","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:dream','{"id":"dream","name":"Dream","nameTr":"Rüya","level":5,"castingTime":"1 minute","concentration":false,"rounds":4800}'::jsonb),
('spell:druidcraft','{"id":"druidcraft","name":"Druidcraft","nameTr":"Druidcraft","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:earthquake','{"id":"earthquake","name":"Earthquake","nameTr":"Deprem","level":8,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:eldritch-blast','{"id":"eldritch-blast","name":"Eldritch Blast","nameTr":"Tekinsiz Patlama","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:enhance-ability','{"id":"enhance-ability","name":"Enhance Ability","nameTr":"Yeteneği Geliştirin","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:enlarge-reduce','{"id":"enlarge-reduce","name":"Enlarge/Reduce","nameTr":"Büyüt/Küçült","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:entangle','{"id":"entangle","name":"Entangle","nameTr":"dolaşıklık","level":1,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:enthrall','{"id":"enthrall","name":"Enthrall","nameTr":"büyülemek","level":2,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:etherealness','{"id":"etherealness","name":"Etherealness","nameTr":"ruhanilik","level":7,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:expeditious-retreat','{"id":"expeditious-retreat","name":"Expeditious Retreat","nameTr":"Hızlı Geri Çekilme","level":1,"castingTime":"1 bonus action","concentration":true,"rounds":100}'::jsonb),
('spell:eyebite','{"id":"eyebite","name":"Eyebite","nameTr":"göz ısırığı","level":6,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:fabricate','{"id":"fabricate","name":"Fabricate","nameTr":"Fabrikasyon","level":4,"castingTime":"10 minutes","concentration":false,"rounds":null}'::jsonb),
('spell:faerie-fire','{"id":"faerie-fire","name":"Faerie Fire","nameTr":"Peri Ateşi","level":1,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:faithful-hound','{"id":"faithful-hound","name":"Faithful Hound","nameTr":"Sadık Tazı","level":4,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:false-life','{"id":"false-life","name":"False Life","nameTr":"Yanlış Yaşam","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:fear','{"id":"fear","name":"Fear","nameTr":"Korku","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:feather-fall','{"id":"feather-fall","name":"Feather Fall","nameTr":"Tüy Güz","level":1,"castingTime":"1 reaction","concentration":false,"rounds":10}'::jsonb),
('spell:feeblemind','{"id":"feeblemind","name":"Feeblemind","nameTr":"Zayıf akıl","level":8,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:find-familiar','{"id":"find-familiar","name":"Find Familiar","nameTr":"Tanıdık Bul","level":1,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:find-steed','{"id":"find-steed","name":"Find Steed","nameTr":"Steed''i Bul","level":2,"castingTime":"10 minutes","concentration":false,"rounds":null}'::jsonb),
('spell:find-traps','{"id":"find-traps","name":"Find Traps","nameTr":"Tuzakları Bul","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:find-the-path','{"id":"find-the-path","name":"Find the Path","nameTr":"Yolu Bul","level":6,"castingTime":"1 minute","concentration":true,"rounds":14400}'::jsonb),
('spell:finger-of-death','{"id":"finger-of-death","name":"Finger of Death","nameTr":"Ölüm Parmağı","level":7,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:fire-bolt','{"id":"fire-bolt","name":"Fire Bolt","nameTr":"Ateş Oku","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:fire-shield','{"id":"fire-shield","name":"Fire Shield","nameTr":"Yangın Kalkanı","level":4,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('spell:fire-storm','{"id":"fire-storm","name":"Fire Storm","nameTr":"Ateş Fırtınası","level":7,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:fireball','{"id":"fireball","name":"Fireball","nameTr":"Ateş topu","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:flame-blade','{"id":"flame-blade","name":"Flame Blade","nameTr":"Alev Kılıcı","level":2,"castingTime":"1 bonus action","concentration":true,"rounds":100}'::jsonb),
('spell:flame-strike','{"id":"flame-strike","name":"Flame Strike","nameTr":"Alev Saldırısı","level":5,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:flaming-sphere','{"id":"flaming-sphere","name":"Flaming Sphere","nameTr":"Alevli Küre","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:flesh-to-stone','{"id":"flesh-to-stone","name":"Flesh to Stone","nameTr":"Etten Taşa","level":6,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:floating-disk','{"id":"floating-disk","name":"Floating Disk","nameTr":"Yüzen Disk","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:fly','{"id":"fly","name":"Fly","nameTr":"Uçmak","level":3,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:fog-cloud','{"id":"fog-cloud","name":"Fog Cloud","nameTr":"Sis Bulutu","level":1,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:forbiddance','{"id":"forbiddance","name":"Forbiddance","nameTr":"Yasak","level":6,"castingTime":"10 minutes","concentration":false,"rounds":14400}'::jsonb),
('spell:forcecage','{"id":"forcecage","name":"Forcecage","nameTr":"Zorla Kafes","level":7,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:foresight','{"id":"foresight","name":"Foresight","nameTr":"Öngörü","level":9,"castingTime":"1 minute","concentration":false,"rounds":4800}'::jsonb),
('spell:freedom-of-movement','{"id":"freedom-of-movement","name":"Freedom of Movement","nameTr":"Hareket Özgürlüğü","level":4,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:freezing-sphere','{"id":"freezing-sphere","name":"Freezing Sphere","nameTr":"Donma Küresi","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:gaseous-form','{"id":"gaseous-form","name":"Gaseous Form","nameTr":"Gaz Halinde","level":3,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:gate','{"id":"gate","name":"Gate","nameTr":"Kapı","level":9,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:geas','{"id":"geas","name":"Geas","nameTr":"Geas","level":5,"castingTime":"1 minute","concentration":false,"rounds":432000}'::jsonb),
('spell:gentle-repose','{"id":"gentle-repose","name":"Gentle Repose","nameTr":"Nazik Duruş","level":2,"castingTime":"1 action","concentration":false,"rounds":144000}'::jsonb),
('spell:giant-insect','{"id":"giant-insect","name":"Giant Insect","nameTr":"Dev Böcek","level":4,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:glibness','{"id":"glibness","name":"Glibness","nameTr":"Kolaylık","level":8,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:globe-of-invulnerability','{"id":"globe-of-invulnerability","name":"Globe of Invulnerability","nameTr":"Hasar Göremezlik Küresi","level":6,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:glyph-of-warding','{"id":"glyph-of-warding","name":"Glyph of Warding","nameTr":"Koruma Glifi","level":3,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:goodberry','{"id":"goodberry","name":"Goodberry","nameTr":"Çilek","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:grease','{"id":"grease","name":"Grease","nameTr":"Gres","level":1,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:greater-invisibility','{"id":"greater-invisibility","name":"Greater Invisibility","nameTr":"Daha Fazla Görünmezlik","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:greater-restoration','{"id":"greater-restoration","name":"Greater Restoration","nameTr":"Daha Büyük Restorasyon","level":5,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:guardian-of-faith','{"id":"guardian-of-faith","name":"Guardian of Faith","nameTr":"İnancın Koruyucusu","level":4,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:guards-and-wards','{"id":"guards-and-wards","name":"Guards and Wards","nameTr":"Muhafızlar ve Koğuşlar","level":6,"castingTime":"10 minutes","concentration":false,"rounds":14400}'::jsonb),
('spell:guidance','{"id":"guidance","name":"Guidance","nameTr":"Rehberlik","level":0,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:guiding-bolt','{"id":"guiding-bolt","name":"Guiding Bolt","nameTr":"Kılavuz Cıvata","level":1,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:gust-of-wind','{"id":"gust-of-wind","name":"Gust of Wind","nameTr":"Rüzgarın esintisi","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:hallow','{"id":"hallow","name":"Hallow","nameTr":"kutsal","level":5,"castingTime":"24 hours","concentration":false,"rounds":null}'::jsonb),
('spell:hallucinatory-terrain','{"id":"hallucinatory-terrain","name":"Hallucinatory Terrain","nameTr":"Halüsinasyonlu Arazi","level":4,"castingTime":"10 minutes","concentration":false,"rounds":14400}'::jsonb),
('spell:harm','{"id":"harm","name":"Harm","nameTr":"zarar","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:haste','{"id":"haste","name":"Haste","nameTr":"Acele et","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:heal','{"id":"heal","name":"Heal","nameTr":"İyileşmek","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:healing-word','{"id":"healing-word","name":"Healing Word","nameTr":"Şifalı Kelime","level":1,"castingTime":"1 bonus action","concentration":false,"rounds":null}'::jsonb),
('spell:heat-metal','{"id":"heat-metal","name":"Heat Metal","nameTr":"Isı Metali","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:hellish-rebuke','{"id":"hellish-rebuke","name":"Hellish Rebuke","nameTr":"Cehennem Azarlaması","level":1,"castingTime":"1 reaction","concentration":false,"rounds":null}'::jsonb),
('spell:heroes-feast','{"id":"heroes-feast","name":"Heroes'' Feast","nameTr":"Kahramanların Bayramı","level":6,"castingTime":"10 minutes","concentration":false,"rounds":null}'::jsonb),
('spell:heroism','{"id":"heroism","name":"Heroism","nameTr":"Kahramanlık","level":1,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:hideous-laughter','{"id":"hideous-laughter","name":"Hideous Laughter","nameTr":"İğrenç Kahkaha","level":1,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:hold-monster','{"id":"hold-monster","name":"Hold Monster","nameTr":"Canavarı Tut","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:hold-person','{"id":"hold-person","name":"Hold Person","nameTr":"Kişiyi Tut","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:holy-aura','{"id":"holy-aura","name":"Holy Aura","nameTr":"Kutsal Aura","level":8,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:hunters-mark','{"id":"hunters-mark","name":"Hunter''s Mark","nameTr":"Avcı İşareti","level":1,"castingTime":"1 bonus action","concentration":true,"rounds":600}'::jsonb),
('spell:hypnotic-pattern','{"id":"hypnotic-pattern","name":"Hypnotic Pattern","nameTr":"Hipnotik Desen","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:ice-storm','{"id":"ice-storm","name":"Ice Storm","nameTr":"Buz Fırtınası","level":4,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:identify','{"id":"identify","name":"Identify","nameTr":"Tanımla","level":1,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:illusory-script','{"id":"illusory-script","name":"Illusory Script","nameTr":"Hayali Senaryo","level":1,"castingTime":"1 minute","concentration":false,"rounds":144000}'::jsonb),
('spell:imprisonment','{"id":"imprisonment","name":"Imprisonment","nameTr":"hapis","level":9,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:incendiary-cloud','{"id":"incendiary-cloud","name":"Incendiary Cloud","nameTr":"Yangın Çıkarıcı Bulut","level":8,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:inflict-wounds','{"id":"inflict-wounds","name":"Inflict Wounds","nameTr":"Yara Vermek","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:insect-plague','{"id":"insect-plague","name":"Insect Plague","nameTr":"Böcek Vebası","level":5,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:instant-summons','{"id":"instant-summons","name":"Instant Summons","nameTr":"Anında Çağrı","level":6,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:invisibility','{"id":"invisibility","name":"Invisibility","nameTr":"Görünmezlik","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:irresistible-dance','{"id":"irresistible-dance","name":"Irresistible Dance","nameTr":"Dayanılmaz Dans","level":6,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:jump','{"id":"jump","name":"Jump","nameTr":"Atla","level":1,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:knock','{"id":"knock","name":"Knock","nameTr":"Vuruş","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:legend-lore','{"id":"legend-lore","name":"Legend Lore","nameTr":"Efsane Bilgisi","level":5,"castingTime":"10 minutes","concentration":false,"rounds":null}'::jsonb),
('spell:lesser-restoration','{"id":"lesser-restoration","name":"Lesser Restoration","nameTr":"Küçük Restorasyon","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:levitate','{"id":"levitate","name":"Levitate","nameTr":"Havaya yükselme","level":2,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:light','{"id":"light","name":"Light","nameTr":"Işık","level":0,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:lightning-bolt','{"id":"lightning-bolt","name":"Lightning Bolt","nameTr":"Şimşek","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:locate-animals-or-plants','{"id":"locate-animals-or-plants","name":"Locate Animals or Plants","nameTr":"Hayvanların veya Bitkilerin Yerini Belirleyin","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:locate-creature','{"id":"locate-creature","name":"Locate Creature","nameTr":"Yaratığı Bul","level":4,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:locate-object','{"id":"locate-object","name":"Locate Object","nameTr":"Nesneyi Bul","level":2,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:longstrider','{"id":"longstrider","name":"Longstrider","nameTr":"Uzunyolcu","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:mage-armor','{"id":"mage-armor","name":"Mage Armor","nameTr":"Büyücü Zırhı","level":1,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:mage-hand','{"id":"mage-hand","name":"Mage Hand","nameTr":"Büyücü Eli","level":0,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:magic-circle','{"id":"magic-circle","name":"Magic Circle","nameTr":"Sihirli Çember","level":3,"castingTime":"1 minute","concentration":false,"rounds":600}'::jsonb),
('spell:magic-jar','{"id":"magic-jar","name":"Magic Jar","nameTr":"Sihirli Kavanoz","level":6,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:magic-missile','{"id":"magic-missile","name":"Magic Missile","nameTr":"Sihirli Füze","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:magic-mouth','{"id":"magic-mouth","name":"Magic Mouth","nameTr":"Sihirli Ağız","level":2,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:magic-weapon','{"id":"magic-weapon","name":"Magic Weapon","nameTr":"Sihirli Silah","level":2,"castingTime":"1 bonus action","concentration":true,"rounds":600}'::jsonb),
('spell:magnificent-mansion','{"id":"magnificent-mansion","name":"Magnificent Mansion","nameTr":"Muhteşem Konak","level":7,"castingTime":"1 minute","concentration":false,"rounds":14400}'::jsonb),
('spell:major-image','{"id":"major-image","name":"Major Image","nameTr":"Ana Resim","level":3,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:mass-cure-wounds','{"id":"mass-cure-wounds","name":"Mass Cure Wounds","nameTr":"Yaraları Toplu İyileştirme","level":5,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:mass-heal','{"id":"mass-heal","name":"Mass Heal","nameTr":"Toplu İyileşme","level":9,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:mass-healing-word','{"id":"mass-healing-word","name":"Mass Healing Word","nameTr":"Toplu Şifa Kelimesi","level":3,"castingTime":"1 bonus action","concentration":false,"rounds":null}'::jsonb),
('spell:mass-suggestion','{"id":"mass-suggestion","name":"Mass Suggestion","nameTr":"Toplu Öneri","level":6,"castingTime":"1 action","concentration":false,"rounds":14400}'::jsonb),
('spell:maze','{"id":"maze","name":"Maze","nameTr":"Labirent","level":8,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:meld-into-stone','{"id":"meld-into-stone","name":"Meld Into Stone","nameTr":"Taşa Erimek","level":3,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:mending','{"id":"mending","name":"Mending","nameTr":"Tamir","level":0,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:message','{"id":"message","name":"Message","nameTr":"Mesaj","level":0,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:meteor-swarm','{"id":"meteor-swarm","name":"Meteor Swarm","nameTr":"Meteor Sürüsü","level":9,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:mind-blank','{"id":"mind-blank","name":"Mind Blank","nameTr":"Zihin Boş","level":8,"castingTime":"1 action","concentration":false,"rounds":14400}'::jsonb),
('spell:minor-illusion','{"id":"minor-illusion","name":"Minor Illusion","nameTr":"Küçük Yanılsama","level":0,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:mirage-arcane','{"id":"mirage-arcane","name":"Mirage Arcane","nameTr":"Mirage Gizemli","level":7,"castingTime":"10 minutes","concentration":false,"rounds":144000}'::jsonb),
('spell:mirror-image','{"id":"mirror-image","name":"Mirror Image","nameTr":"Ayna Görüntüsü","level":2,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:mislead','{"id":"mislead","name":"Mislead","nameTr":"yanıltıcı","level":5,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:misty-step','{"id":"misty-step","name":"Misty Step","nameTr":"Sisli Adım","level":2,"castingTime":"1 bonus action","concentration":false,"rounds":null}'::jsonb),
('spell:modify-memory','{"id":"modify-memory","name":"Modify Memory","nameTr":"Belleği Değiştir","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:moonbeam','{"id":"moonbeam","name":"Moonbeam","nameTr":"Ay ışığı","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:move-earth','{"id":"move-earth","name":"Move Earth","nameTr":"Dünyayı Taşı","level":6,"castingTime":"1 action","concentration":true,"rounds":1200}'::jsonb),
('spell:nondetection','{"id":"nondetection","name":"Nondetection","nameTr":"Tespit edilmeme","level":3,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:pass-without-trace','{"id":"pass-without-trace","name":"Pass Without Trace","nameTr":"İzsiz Geçiş","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:passwall','{"id":"passwall","name":"Passwall","nameTr":"Geçiş duvarı","level":5,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:phantasmal-killer','{"id":"phantasmal-killer","name":"Phantasmal Killer","nameTr":"Hayalet Katil","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:phantom-steed','{"id":"phantom-steed","name":"Phantom Steed","nameTr":"Hayalet Küheylan","level":3,"castingTime":"1 minute","concentration":false,"rounds":600}'::jsonb),
('spell:planar-ally','{"id":"planar-ally","name":"Planar Ally","nameTr":"Düzlemsel Müttefik","level":6,"castingTime":"10 minutes","concentration":false,"rounds":null}'::jsonb),
('spell:planar-binding','{"id":"planar-binding","name":"Planar Binding","nameTr":"Düzlemsel Bağlama","level":5,"castingTime":"1 hour","concentration":false,"rounds":14400}'::jsonb),
('spell:plane-shift','{"id":"plane-shift","name":"Plane Shift","nameTr":"Düzlem Kayması","level":7,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:plant-growth','{"id":"plant-growth","name":"Plant Growth","nameTr":"Bitki Büyümesi","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:poison-spray','{"id":"poison-spray","name":"Poison Spray","nameTr":"Zehirli Sprey","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:polymorph','{"id":"polymorph","name":"Polymorph","nameTr":"Polimorf","level":4,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:power-word-kill','{"id":"power-word-kill","name":"Power Word Kill","nameTr":"Güç Kelimesi Öldürme","level":9,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:power-word-stun','{"id":"power-word-stun","name":"Power Word Stun","nameTr":"Güç Kelimesi Sersemletme","level":8,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:prayer-of-healing','{"id":"prayer-of-healing","name":"Prayer of Healing","nameTr":"Şifa Duası","level":2,"castingTime":"10 minutes","concentration":false,"rounds":null}'::jsonb),
('spell:prestidigitation','{"id":"prestidigitation","name":"Prestidigitation","nameTr":"Prestijitasyon","level":0,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:prismatic-spray','{"id":"prismatic-spray","name":"Prismatic Spray","nameTr":"Prizmatik Sprey","level":7,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:prismatic-wall','{"id":"prismatic-wall","name":"Prismatic Wall","nameTr":"Prizmatik Duvar","level":9,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('spell:private-sanctum','{"id":"private-sanctum","name":"Private Sanctum","nameTr":"Özel Kutsal Alan","level":4,"castingTime":"10 minutes","concentration":false,"rounds":14400}'::jsonb),
('spell:produce-flame','{"id":"produce-flame","name":"Produce Flame","nameTr":"Alev Üret","level":0,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('spell:programmed-illusion','{"id":"programmed-illusion","name":"Programmed Illusion","nameTr":"Programlanmış İllüzyon","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:project-image','{"id":"project-image","name":"Project Image","nameTr":"Proje Görseli","level":7,"castingTime":"1 action","concentration":true,"rounds":14400}'::jsonb),
('spell:protection-from-energy','{"id":"protection-from-energy","name":"Protection From Energy","nameTr":"Enerjiden Koruma","level":3,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:protection-from-evil-and-good','{"id":"protection-from-evil-and-good","name":"Protection from Evil and Good","nameTr":"Kötülükten ve İyilikten Korunma","level":1,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:protection-from-poison','{"id":"protection-from-poison","name":"Protection from Poison","nameTr":"Zehirden Korunma","level":2,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:purify-food-and-drink','{"id":"purify-food-and-drink","name":"Purify Food and Drink","nameTr":"Yiyecek ve İçecekleri Arındırın","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:raise-dead','{"id":"raise-dead","name":"Raise Dead","nameTr":"Ölüleri Kaldır","level":5,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:ray-of-enfeeblement','{"id":"ray-of-enfeeblement","name":"Ray of Enfeeblement","nameTr":"Zayıflama Işını","level":2,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:ray-of-frost','{"id":"ray-of-frost","name":"Ray of Frost","nameTr":"Don Işını","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:regenerate','{"id":"regenerate","name":"Regenerate","nameTr":"Yenile","level":7,"castingTime":"1 minute","concentration":false,"rounds":600}'::jsonb),
('spell:reincarnate','{"id":"reincarnate","name":"Reincarnate","nameTr":"Reenkarnasyon","level":5,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:remove-curse','{"id":"remove-curse","name":"Remove Curse","nameTr":"Laneti Kaldır","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:resilient-sphere','{"id":"resilient-sphere","name":"Resilient Sphere","nameTr":"Esnek Küre","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:resistance','{"id":"resistance","name":"Resistance","nameTr":"Direnç","level":0,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:resurrection','{"id":"resurrection","name":"Resurrection","nameTr":"Diriliş","level":7,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:reverse-gravity','{"id":"reverse-gravity","name":"Reverse Gravity","nameTr":"Ters Yerçekimi","level":7,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:revivify','{"id":"revivify","name":"Revivify","nameTr":"Canlandır","level":3,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:rope-trick','{"id":"rope-trick","name":"Rope Trick","nameTr":"Halat Hilesi","level":2,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:sacred-flame','{"id":"sacred-flame","name":"Sacred Flame","nameTr":"Kutsal Alev","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:sanctuary','{"id":"sanctuary","name":"Sanctuary","nameTr":"Kutsal alan","level":1,"castingTime":"1 bonus action","concentration":false,"rounds":10}'::jsonb),
('spell:scorching-ray','{"id":"scorching-ray","name":"Scorching Ray","nameTr":"Kavurucu Işın","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:scrying','{"id":"scrying","name":"Scrying","nameTr":"Ağlayan","level":5,"castingTime":"10 minutes","concentration":true,"rounds":100}'::jsonb),
('spell:secret-chest','{"id":"secret-chest","name":"Secret Chest","nameTr":"Gizli Sandık","level":4,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:see-invisibility','{"id":"see-invisibility","name":"See Invisibility","nameTr":"Görünmezliği görün","level":2,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:seeming','{"id":"seeming","name":"Seeming","nameTr":"Görünüşe göre","level":5,"castingTime":"1 action","concentration":false,"rounds":4800}'::jsonb),
('spell:sending','{"id":"sending","name":"Sending","nameTr":"Gönderiliyor","level":3,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:sequester','{"id":"sequester","name":"Sequester","nameTr":"Tecritçi","level":7,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:shapechange','{"id":"shapechange","name":"Shapechange","nameTr":"Şekil değiştirme","level":9,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:shatter','{"id":"shatter","name":"Shatter","nameTr":"Paramparça","level":2,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:shield','{"id":"shield","name":"Shield","nameTr":"Kalkan","level":1,"castingTime":"1 reaction","concentration":false,"rounds":1}'::jsonb),
('spell:shield-of-faith','{"id":"shield-of-faith","name":"Shield of Faith","nameTr":"İnanç Kalkanı","level":1,"castingTime":"1 bonus action","concentration":true,"rounds":100}'::jsonb),
('spell:shillelagh','{"id":"shillelagh","name":"Shillelagh","nameTr":"Shillelagh","level":0,"castingTime":"1 bonus action","concentration":false,"rounds":10}'::jsonb),
('spell:shocking-grasp','{"id":"shocking-grasp","name":"Shocking Grasp","nameTr":"Şok edici Kavrama","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:silence','{"id":"silence","name":"Silence","nameTr":"Sessizlik","level":2,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:silent-image','{"id":"silent-image","name":"Silent Image","nameTr":"Sessiz Görüntü","level":1,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:simulacrum','{"id":"simulacrum","name":"Simulacrum","nameTr":"Simülakr","level":7,"castingTime":"12 hours","concentration":false,"rounds":null}'::jsonb),
('spell:sleep','{"id":"sleep","name":"Sleep","nameTr":"Uyku","level":1,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:sleet-storm','{"id":"sleet-storm","name":"Sleet Storm","nameTr":"Karla karışık yağmur fırtınası","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:slow','{"id":"slow","name":"Slow","nameTr":"Yavaş","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:spare-the-dying','{"id":"spare-the-dying","name":"Spare the Dying","nameTr":"Ölmeyi Koruyun","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:speak-with-animals','{"id":"speak-with-animals","name":"Speak with Animals","nameTr":"Hayvanlarla Konuşun","level":1,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('spell:speak-with-dead','{"id":"speak-with-dead","name":"Speak with Dead","nameTr":"Ölüyle Konuş","level":3,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('spell:speak-with-plants','{"id":"speak-with-plants","name":"Speak with Plants","nameTr":"Bitkilerle Konuşun","level":3,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('spell:spider-climb','{"id":"spider-climb","name":"Spider Climb","nameTr":"Örümcek Tırmanışı","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:spike-growth','{"id":"spike-growth","name":"Spike Growth","nameTr":"Ani Büyüme","level":2,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:spirit-guardians','{"id":"spirit-guardians","name":"Spirit Guardians","nameTr":"Ruh Muhafızları","level":3,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:spiritual-weapon','{"id":"spiritual-weapon","name":"Spiritual Weapon","nameTr":"Ruhsal Silah","level":2,"castingTime":"1 bonus action","concentration":false,"rounds":10}'::jsonb),
('spell:stinking-cloud','{"id":"stinking-cloud","name":"Stinking Cloud","nameTr":"Kokuşmuş Bulut","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:stone-shape','{"id":"stone-shape","name":"Stone Shape","nameTr":"Taş Şekli","level":4,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:stoneskin','{"id":"stoneskin","name":"Stoneskin","nameTr":"Taş Derisi","level":4,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:storm-of-vengeance','{"id":"storm-of-vengeance","name":"Storm of Vengeance","nameTr":"İntikam Fırtınası","level":9,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:suggestion','{"id":"suggestion","name":"Suggestion","nameTr":"Öneri","level":2,"castingTime":"1 action","concentration":true,"rounds":4800}'::jsonb),
('spell:sunbeam','{"id":"sunbeam","name":"Sunbeam","nameTr":"Güneş ışını","level":6,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:sunburst','{"id":"sunburst","name":"Sunburst","nameTr":"Güneş patlaması","level":8,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:symbol','{"id":"symbol","name":"Symbol","nameTr":"Sembol","level":7,"castingTime":"1 minute","concentration":false,"rounds":null}'::jsonb),
('spell:telekinesis','{"id":"telekinesis","name":"Telekinesis","nameTr":"Telekinezi","level":5,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:telepathic-bond','{"id":"telepathic-bond","name":"Telepathic Bond","nameTr":"Telepatik Bağ","level":5,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:teleport','{"id":"teleport","name":"Teleport","nameTr":"Işınlanma","level":7,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:teleportation-circle','{"id":"teleportation-circle","name":"Teleportation Circle","nameTr":"Işınlanma Çemberi","level":5,"castingTime":"1 minute","concentration":false,"rounds":1}'::jsonb),
('spell:thaumaturgy','{"id":"thaumaturgy","name":"Thaumaturgy","nameTr":"Thaumaturji","level":0,"castingTime":"1 action","concentration":false,"rounds":10}'::jsonb),
('spell:thunderwave','{"id":"thunderwave","name":"Thunderwave","nameTr":"Gök gürültüsü dalgası","level":1,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:time-stop','{"id":"time-stop","name":"Time Stop","nameTr":"Zaman Durdurma","level":9,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:tiny-hut','{"id":"tiny-hut","name":"Tiny Hut","nameTr":"Minik Kulübe","level":3,"castingTime":"1 minute","concentration":false,"rounds":4800}'::jsonb),
('spell:tongues','{"id":"tongues","name":"Tongues","nameTr":"Diller","level":3,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:transport-via-plants','{"id":"transport-via-plants","name":"Transport via Plants","nameTr":"Bitkiler Yoluyla Taşıma","level":6,"castingTime":"1 action","concentration":false,"rounds":1}'::jsonb),
('spell:tree-stride','{"id":"tree-stride","name":"Tree Stride","nameTr":"Ağaç Yürüyüşü","level":5,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:true-polymorph','{"id":"true-polymorph","name":"True Polymorph","nameTr":"Gerçek Polimorf","level":9,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:true-resurrection','{"id":"true-resurrection","name":"True Resurrection","nameTr":"Gerçek Diriliş","level":9,"castingTime":"1 hour","concentration":false,"rounds":null}'::jsonb),
('spell:true-seeing','{"id":"true-seeing","name":"True Seeing","nameTr":"Gerçek Görme","level":6,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:true-strike','{"id":"true-strike","name":"True Strike","nameTr":"Gerçek Saldırı","level":0,"castingTime":"1 action","concentration":true,"rounds":1}'::jsonb),
('spell:unseen-servant','{"id":"unseen-servant","name":"Unseen Servant","nameTr":"Görünmeyen Hizmetçi","level":1,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:vampiric-touch','{"id":"vampiric-touch","name":"Vampiric Touch","nameTr":"Vampir Dokunuşu","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:vicious-mockery','{"id":"vicious-mockery","name":"Vicious Mockery","nameTr":"Kötü Alay","level":0,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:wall-of-fire','{"id":"wall-of-fire","name":"Wall of Fire","nameTr":"Ateş Duvarı","level":4,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:wall-of-force','{"id":"wall-of-force","name":"Wall of Force","nameTr":"Güç Duvarı","level":5,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:wall-of-ice','{"id":"wall-of-ice","name":"Wall of Ice","nameTr":"Buz Duvarı","level":6,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:wall-of-stone','{"id":"wall-of-stone","name":"Wall of Stone","nameTr":"Taş Duvar","level":5,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:wall-of-thorns','{"id":"wall-of-thorns","name":"Wall of Thorns","nameTr":"Dikenler Duvarı","level":6,"castingTime":"1 action","concentration":true,"rounds":100}'::jsonb),
('spell:warding-bond','{"id":"warding-bond","name":"Warding Bond","nameTr":"Muhafaza Tahvili","level":2,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:water-breathing','{"id":"water-breathing","name":"Water Breathing","nameTr":"Su Solunumu","level":3,"castingTime":"1 action","concentration":false,"rounds":14400}'::jsonb),
('spell:water-walk','{"id":"water-walk","name":"Water Walk","nameTr":"Su Yürüyüşü","level":3,"castingTime":"1 action","concentration":false,"rounds":600}'::jsonb),
('spell:web','{"id":"web","name":"Web","nameTr":"ağ","level":2,"castingTime":"1 action","concentration":true,"rounds":600}'::jsonb),
('spell:weird','{"id":"weird","name":"Weird","nameTr":"Garip","level":9,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:wind-walk','{"id":"wind-walk","name":"Wind Walk","nameTr":"Rüzgar Yürüyüşü","level":6,"castingTime":"1 minute","concentration":false,"rounds":4800}'::jsonb),
('spell:wind-wall','{"id":"wind-wall","name":"Wind Wall","nameTr":"Rüzgar Duvarı","level":3,"castingTime":"1 action","concentration":true,"rounds":10}'::jsonb),
('spell:wish','{"id":"wish","name":"Wish","nameTr":"Dilek","level":9,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:word-of-recall','{"id":"word-of-recall","name":"Word of Recall","nameTr":"Geri Çağırma Sözü","level":6,"castingTime":"1 action","concentration":false,"rounds":null}'::jsonb),
('spell:zone-of-truth','{"id":"zone-of-truth","name":"Zone of Truth","nameTr":"Hakikat Bölgesi","level":2,"castingTime":"1 action","concentration":false,"rounds":100}'::jsonb),
('class:Barbarian','{"saves":["STR","CON"],"features":[{"name":"Rage","level":1},{"name":"Unarmored Defense","level":1},{"name":"Reckless Attack","level":2},{"name":"Danger Sense","level":2},{"name":"Primal Path","level":3},{"name":"Extra Attack","level":5},{"name":"Fast Movement","level":5},{"name":"Feral Instinct","level":7},{"name":"Brutal Critical","level":9},{"name":"Relentless Rage","level":11},{"name":"Persistent Rage","level":15},{"name":"Indomitable Might","level":18},{"name":"Primal Champion","level":20}]}'::jsonb),
('class:Barbarian:1','{"resources":[{"id":"v74_rage","name":"Rage","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:2','{"resources":[{"id":"v74_rage","name":"Rage","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:3','{"resources":[{"id":"v74_rage","name":"Rage","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:4','{"resources":[{"id":"v74_rage","name":"Rage","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:5','{"resources":[{"id":"v74_rage","name":"Rage","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:6','{"resources":[{"id":"v74_rage","name":"Rage","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:7','{"resources":[{"id":"v74_rage","name":"Rage","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:8','{"resources":[{"id":"v74_rage","name":"Rage","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:9','{"resources":[{"id":"v74_rage","name":"Rage","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:10','{"resources":[{"id":"v74_rage","name":"Rage","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:11','{"resources":[{"id":"v74_rage","name":"Rage","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:12','{"resources":[{"id":"v74_rage","name":"Rage","max":5,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:13','{"resources":[{"id":"v74_rage","name":"Rage","max":5,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:14','{"resources":[{"id":"v74_rage","name":"Rage","max":5,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:15','{"resources":[{"id":"v74_rage","name":"Rage","max":5,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:16','{"resources":[{"id":"v74_rage","name":"Rage","max":5,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:17','{"resources":[{"id":"v74_rage","name":"Rage","max":6,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:18','{"resources":[{"id":"v74_rage","name":"Rage","max":6,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:19','{"resources":[{"id":"v74_rage","name":"Rage","max":6,"rest":"long","ability":""}]}'::jsonb),
('class:Barbarian:20','{"resources":[{"id":"v74_rage","name":"Rage","max":999,"rest":"long","ability":""}]}'::jsonb),
('subclass:Barbarian:Berserker','{"features":[{"name":"Frenzy","level":3},{"name":"Mindless Rage","level":6},{"name":"Intimidating Presence","level":10},{"name":"Retaliation","level":14}]}'::jsonb),
('subclass:Barbarian:Totem Warrior','{"features":[{"name":"Spirit Seeker / Totem Spirit","level":3},{"name":"Aspect of the Beast","level":6},{"name":"Spirit Walker","level":10},{"name":"Totemic Attunement","level":14}]}'::jsonb),
('subclass:Barbarian:Ancestral Guardian','{"features":[{"name":"Ancestral Protectors","level":3},{"name":"Spirit Shield","level":6},{"name":"Consult the Spirits","level":10},{"name":"Vengeful Ancestors","level":14}]}'::jsonb),
('subclass:Barbarian:Storm Herald','{"features":[{"name":"Storm Aura","level":3},{"name":"Storm Soul","level":6},{"name":"Shielding Storm","level":10},{"name":"Raging Storm","level":14}]}'::jsonb),
('subclass:Barbarian:Zealot','{"features":[{"name":"Divine Fury / Warrior of the Gods","level":3},{"name":"Fanatical Focus","level":6},{"name":"Zealous Presence","level":10},{"name":"Rage Beyond Death","level":14}]}'::jsonb),
('subclass:Barbarian:Beast','{"features":[{"name":"Form of the Beast","level":3},{"name":"Bestial Soul","level":6},{"name":"Infectious Fury","level":10},{"name":"Call the Hunt","level":14}]}'::jsonb),
('subclass:Barbarian:Wild Magic','{"features":[{"name":"Magic Awareness / Wild Surge","level":3},{"name":"Bolstering Magic","level":6},{"name":"Unstable Backlash","level":10},{"name":"Controlled Surge","level":14}]}'::jsonb),
('class:Bard','{"saves":["DEX","CHA"],"features":[{"name":"Spellcasting","level":1},{"name":"Bardic Inspiration d6","level":1},{"name":"Jack of All Trades","level":2},{"name":"Song of Rest d6","level":2},{"name":"Bard College / Expertise","level":3},{"name":"Font of Inspiration / d8","level":5},{"name":"Countercharm","level":6},{"name":"Expertise / Magical Secrets / d10","level":10},{"name":"Magical Secrets","level":14},{"name":"Bardic Inspiration d12","level":15},{"name":"Magical Secrets","level":18},{"name":"Superior Inspiration","level":20}]}'::jsonb),
('class:Bard:1','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"long","ability":"CHA"}]}'::jsonb),
('class:Bard:2','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"long","ability":"CHA"}]}'::jsonb),
('class:Bard:3','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"long","ability":"CHA"}]}'::jsonb),
('class:Bard:4','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"long","ability":"CHA"}]}'::jsonb),
('class:Bard:5','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:6','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:7','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:8','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:9','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:10','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:11','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:12','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:13','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:14','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:15','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:16','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:17','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:18','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:19','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('class:Bard:20','{"resources":[{"id":"v74_inspiration","name":"Bardic Inspiration","max":1,"rest":"short","ability":"CHA"}]}'::jsonb),
('casting:Bard:','[null,{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":[]}]'::jsonb),
('subclass:Bard:Lore','{"features":[{"name":"Bonus Proficiencies / Cutting Words","level":3},{"name":"Additional Magical Secrets","level":6},{"name":"Peerless Skill","level":14}]}'::jsonb),
('subclass:Bard:Valor','{"features":[{"name":"Bonus Proficiencies / Combat Inspiration","level":3},{"name":"Extra Attack","level":6},{"name":"Battle Magic","level":14}]}'::jsonb),
('subclass:Bard:Glamour','{"features":[{"name":"Mantle of Inspiration / Enthralling Performance","level":3},{"name":"Mantle of Majesty","level":6},{"name":"Unbreakable Majesty","level":14}]}'::jsonb),
('subclass:Bard:Swords','{"features":[{"name":"Bonus Proficiencies / Fighting Style / Blade Flourish","level":3},{"name":"Extra Attack","level":6},{"name":"Master’s Flourish","level":14}]}'::jsonb),
('subclass:Bard:Whispers','{"features":[{"name":"Psychic Blades / Words of Terror","level":3},{"name":"Mantle of Whispers","level":6},{"name":"Shadow Lore","level":14}]}'::jsonb),
('subclass:Bard:Creation','{"features":[{"name":"Mote of Potential / Performance of Creation","level":3},{"name":"Animating Performance","level":6},{"name":"Creative Crescendo","level":14}]}'::jsonb),
('subclass:Bard:Eloquence','{"features":[{"name":"Silver Tongue / Unsettling Words","level":3},{"name":"Unfailing Inspiration / Universal Speech","level":6},{"name":"Infectious Inspiration","level":14}]}'::jsonb),
('subclass:Bard:Spirits','{"features":[{"name":"Guiding Whispers / Spiritual Focus / Tales from Beyond","level":3},{"name":"Spirit Session","level":6},{"name":"Mystical Connection","level":14}]}'::jsonb),
('class:Cleric','{"saves":["WIS","CHA"],"features":[{"name":"Spellcasting / Divine Domain","level":1},{"name":"Channel Divinity","level":2},{"name":"Destroy Undead","level":5},{"name":"Channel Divinity ×2","level":6},{"name":"Divine Intervention","level":10},{"name":"Channel Divinity ×3","level":18},{"name":"Improved Divine Intervention","level":20}]}'::jsonb),
('class:Cleric:1','{"resources":[]}'::jsonb),
('class:Cleric:2','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:3','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:4','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:5','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:6','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:7','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:8','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:9','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:10','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:11','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:12','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:13','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:14','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:15','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:16','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:17','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:18','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":3,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:19','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":3,"rest":"short","ability":""}]}'::jsonb),
('class:Cleric:20','{"resources":[{"id":"v74_channel","name":"Channel Divinity","max":3,"rest":"short","ability":""}]}'::jsonb),
('casting:Cleric:','[null,{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":[]}]'::jsonb),
('subclass:Cleric:Knowledge','{"features":[{"name":"Blessings of Knowledge","level":1},{"name":"Channel Divinity: Knowledge of the Ages","level":2},{"name":"Channel Divinity: Read Thoughts","level":6},{"name":"Potent Spellcasting","level":8},{"name":"Visions of the Past","level":17}]}'::jsonb),
('casting:Cleric:Knowledge','[null,{"slots":[2],"automatic":["command","identify"]},{"slots":[3],"automatic":["command","identify"]},{"slots":[4,2],"automatic":["command","identify","augury","suggestion"]},{"slots":[4,3],"automatic":["command","identify","augury","suggestion"]},{"slots":[4,3,2],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead"]},{"slots":[4,3,3],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead"]},{"slots":[4,3,3,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion"]},{"slots":[4,3,3,2],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion"]},{"slots":[4,3,3,3,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["command","identify","augury","suggestion","nondetection","speak with dead","arcane eye","confusion","legend lore","scrying"]}]'::jsonb),
('subclass:Cleric:Life','{"features":[{"name":"Bonus Proficiency","level":1},{"name":"Disciple of Life","level":1},{"name":"Channel Divinity: Preserve Life","level":2},{"name":"Blessed Healer","level":6},{"name":"Divine Strike","level":8},{"name":"Supreme Healing","level":17}]}'::jsonb),
('casting:Cleric:Life','[null,{"slots":[2],"automatic":["bless","cure wounds"]},{"slots":[3],"automatic":["bless","cure wounds"]},{"slots":[4,2],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon"]},{"slots":[4,3],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon"]},{"slots":[4,3,2],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify"]},{"slots":[4,3,3],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify"]},{"slots":[4,3,3,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith"]},{"slots":[4,3,3,2],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith"]},{"slots":[4,3,3,3,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["bless","cure wounds","lesser restoration","spiritual weapon","beacon of hope","revivify","death ward","guardian of faith","mass cure wounds","raise dead"]}]'::jsonb),
('subclass:Cleric:Light','{"features":[{"name":"Bonus Cantrip","level":1},{"name":"Warding Flare","level":1},{"name":"Channel Divinity: Radiance of the Dawn","level":2},{"name":"Improved Flare","level":6},{"name":"Potent Spellcasting","level":8},{"name":"Corona of Light","level":17}]}'::jsonb),
('casting:Cleric:Light','[null,{"slots":[2],"automatic":["burning hands","faerie fire"]},{"slots":[3],"automatic":["burning hands","faerie fire"]},{"slots":[4,2],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray"]},{"slots":[4,3],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray"]},{"slots":[4,3,2],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball"]},{"slots":[4,3,3],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball"]},{"slots":[4,3,3,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire"]},{"slots":[4,3,3,2],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire"]},{"slots":[4,3,3,3,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["burning hands","faerie fire","flaming sphere","scorching ray","daylight","fireball","guardian of faith","wall of fire","flame strike","scrying"]}]'::jsonb),
('subclass:Cleric:Nature','{"features":[{"name":"Acolyte of Nature","level":1},{"name":"Bonus Proficiency","level":1},{"name":"Channel Divinity: Charm Animals and Plants","level":2},{"name":"Dampen Elements","level":6},{"name":"Divine Strike","level":8},{"name":"Master of Nature","level":17}]}'::jsonb),
('casting:Cleric:Nature','[null,{"slots":[2],"automatic":["animal friendship","speak with animals"]},{"slots":[3],"automatic":["animal friendship","speak with animals"]},{"slots":[4,2],"automatic":["animal friendship","speak with animals","barkskin","spike growth"]},{"slots":[4,3],"automatic":["animal friendship","speak with animals","barkskin","spike growth"]},{"slots":[4,3,2],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall"]},{"slots":[4,3,3],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall"]},{"slots":[4,3,3,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine"]},{"slots":[4,3,3,2],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine"]},{"slots":[4,3,3,3,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["animal friendship","speak with animals","barkskin","spike growth","plant growth","wind wall","dominate beast","grasping vine","insect plague","tree stride"]}]'::jsonb),
('subclass:Cleric:Tempest','{"features":[{"name":"Bonus Proficiencies","level":1},{"name":"Wrath of the Storm","level":1},{"name":"Channel Divinity: Destructive Wrath","level":2},{"name":"Thunderbolt Strike","level":6},{"name":"Divine Strike","level":8},{"name":"Stormborn","level":17}]}'::jsonb),
('casting:Cleric:Tempest','[null,{"slots":[2],"automatic":["fog cloud","thunderwave"]},{"slots":[3],"automatic":["fog cloud","thunderwave"]},{"slots":[4,2],"automatic":["fog cloud","thunderwave","gust of wind","shatter"]},{"slots":[4,3],"automatic":["fog cloud","thunderwave","gust of wind","shatter"]},{"slots":[4,3,2],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm"]},{"slots":[4,3,3],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm"]},{"slots":[4,3,3,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm"]},{"slots":[4,3,3,2],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm"]},{"slots":[4,3,3,3,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["fog cloud","thunderwave","gust of wind","shatter","call lightning","sleet storm","control water","ice storm","destructive wave","insect plague"]}]'::jsonb),
('subclass:Cleric:Trickery','{"features":[{"name":"Blessing of the Trickster","level":1},{"name":"Channel Divinity: Invoke Duplicity","level":2},{"name":"Channel Divinity: Cloak of Shadows","level":6},{"name":"Divine Strike","level":8},{"name":"Improved Duplicity","level":17}]}'::jsonb),
('casting:Cleric:Trickery','[null,{"slots":[2],"automatic":["charm person","disguise self"]},{"slots":[3],"automatic":["charm person","disguise self"]},{"slots":[4,2],"automatic":["charm person","disguise self","mirror image","pass without trace"]},{"slots":[4,3],"automatic":["charm person","disguise self","mirror image","pass without trace"]},{"slots":[4,3,2],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic"]},{"slots":[4,3,3],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic"]},{"slots":[4,3,3,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph"]},{"slots":[4,3,3,2],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph"]},{"slots":[4,3,3,3,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["charm person","disguise self","mirror image","pass without trace","blink","dispel magic","dimension door","polymorph","dominate person","modify memory"]}]'::jsonb),
('subclass:Cleric:War','{"features":[{"name":"Bonus Proficiencies","level":1},{"name":"War Priest","level":1},{"name":"Channel Divinity: Guided Strike","level":2},{"name":"Channel Divinity: War God’s Blessing","level":6},{"name":"Divine Strike","level":8},{"name":"Avatar of Battle","level":17}]}'::jsonb),
('casting:Cleric:War','[null,{"slots":[2],"automatic":["divine favor","shield of faith"]},{"slots":[3],"automatic":["divine favor","shield of faith"]},{"slots":[4,2],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon"]},{"slots":[4,3],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon"]},{"slots":[4,3,2],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians"]},{"slots":[4,3,3],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians"]},{"slots":[4,3,3,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin"]},{"slots":[4,3,3,2],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin"]},{"slots":[4,3,3,3,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["divine favor","shield of faith","magic weapon","spiritual weapon","crusader’s mantle","spirit guardians","freedom of movement","stoneskin","flame strike","hold monster"]}]'::jsonb),
('subclass:Cleric:Death','{"features":[{"name":"Bonus Proficiency","level":1},{"name":"Reaper","level":1},{"name":"Channel Divinity: Touch of Death","level":2},{"name":"Inescapable Destruction","level":6},{"name":"Divine Strike","level":8},{"name":"Improved Reaper","level":17}]}'::jsonb),
('casting:Cleric:Death','[null,{"slots":[2],"automatic":["false life","ray of sickness"]},{"slots":[3],"automatic":["false life","ray of sickness"]},{"slots":[4,2],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement"]},{"slots":[4,3],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement"]},{"slots":[4,3,2],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch"]},{"slots":[4,3,3],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch"]},{"slots":[4,3,3,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward"]},{"slots":[4,3,3,2],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward"]},{"slots":[4,3,3,3,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["false life","ray of sickness","blindness/deafness","ray of enfeeblement","animate dead","vampiric touch","blight","death ward","antilife shell","cloudkill"]}]'::jsonb),
('subclass:Cleric:Arcana','{"features":[{"name":"Arcane Initiate","level":1},{"name":"Channel Divinity: Arcane Abjuration","level":2},{"name":"Spell Breaker","level":6},{"name":"Potent Spellcasting","level":8},{"name":"Arcane Mastery","level":17}]}'::jsonb),
('casting:Cleric:Arcana','[null,{"slots":[2],"automatic":["detect magic","magic missile"]},{"slots":[3],"automatic":["detect magic","magic missile"]},{"slots":[4,2],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura"]},{"slots":[4,3],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura"]},{"slots":[4,3,2],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle"]},{"slots":[4,3,3],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle"]},{"slots":[4,3,3,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest"]},{"slots":[4,3,3,2],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest"]},{"slots":[4,3,3,3,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["detect magic","magic missile","magic weapon","nystul’s magic aura","dispel magic","magic circle","arcane eye","leomund’s secret chest","planar binding","teleportation circle"]}]'::jsonb),
('subclass:Cleric:Forge','{"features":[{"name":"Bonus Proficiencies","level":1},{"name":"Blessing of the Forge","level":1},{"name":"Channel Divinity: Artisan’s Blessing","level":2},{"name":"Soul of the Forge","level":6},{"name":"Divine Strike","level":8},{"name":"Saint of Forge and Fire","level":17}]}'::jsonb),
('casting:Cleric:Forge','[null,{"slots":[2],"automatic":["identify","searing smite"]},{"slots":[3],"automatic":["identify","searing smite"]},{"slots":[4,2],"automatic":["identify","searing smite","heat metal","magic weapon"]},{"slots":[4,3],"automatic":["identify","searing smite","heat metal","magic weapon"]},{"slots":[4,3,2],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy"]},{"slots":[4,3,3],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy"]},{"slots":[4,3,3,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire"]},{"slots":[4,3,3,2],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire"]},{"slots":[4,3,3,3,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["identify","searing smite","heat metal","magic weapon","elemental weapon","protection from energy","fabricate","wall of fire","animate objects","creation"]}]'::jsonb),
('subclass:Cleric:Grave','{"features":[{"name":"Circle of Mortality","level":1},{"name":"Eyes of the Grave","level":1},{"name":"Channel Divinity: Path to the Grave","level":2},{"name":"Sentinel at Death’s Door","level":6},{"name":"Potent Spellcasting","level":8},{"name":"Keeper of Souls","level":17}]}'::jsonb),
('casting:Cleric:Grave','[null,{"slots":[2],"automatic":["bane","false life"]},{"slots":[3],"automatic":["bane","false life"]},{"slots":[4,2],"automatic":["bane","false life","gentle repose","ray of enfeeblement"]},{"slots":[4,3],"automatic":["bane","false life","gentle repose","ray of enfeeblement"]},{"slots":[4,3,2],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch"]},{"slots":[4,3,3],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch"]},{"slots":[4,3,3,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward"]},{"slots":[4,3,3,2],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward"]},{"slots":[4,3,3,3,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["bane","false life","gentle repose","ray of enfeeblement","revivify","vampiric touch","blight","death ward","antilife shell","raise dead"]}]'::jsonb),
('subclass:Cleric:Order','{"features":[{"name":"Bonus Proficiencies","level":1},{"name":"Voice of Authority","level":1},{"name":"Channel Divinity: Order’s Demand","level":2},{"name":"Embodiment of the Law","level":6},{"name":"Divine Strike","level":8},{"name":"Order’s Wrath","level":17}]}'::jsonb),
('casting:Cleric:Order','[null,{"slots":[2],"automatic":["command","heroism"]},{"slots":[3],"automatic":["command","heroism"]},{"slots":[4,2],"automatic":["command","heroism","hold person","zone of truth"]},{"slots":[4,3],"automatic":["command","heroism","hold person","zone of truth"]},{"slots":[4,3,2],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow"]},{"slots":[4,3,3],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow"]},{"slots":[4,3,3,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature"]},{"slots":[4,3,3,2],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature"]},{"slots":[4,3,3,3,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["command","heroism","hold person","zone of truth","mass healing word","slow","compulsion","locate creature","commune","dominate person"]}]'::jsonb),
('subclass:Cleric:Peace','{"features":[{"name":"Implement of Peace","level":1},{"name":"Emboldening Bond","level":1},{"name":"Channel Divinity: Balm of Peace","level":2},{"name":"Protective Bond","level":6},{"name":"Potent Spellcasting","level":8},{"name":"Expansive Bond","level":17}]}'::jsonb),
('casting:Cleric:Peace','[null,{"slots":[2],"automatic":["heroism","sanctuary"]},{"slots":[3],"automatic":["heroism","sanctuary"]},{"slots":[4,2],"automatic":["heroism","sanctuary","aid","warding bond"]},{"slots":[4,3],"automatic":["heroism","sanctuary","aid","warding bond"]},{"slots":[4,3,2],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending"]},{"slots":[4,3,3],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending"]},{"slots":[4,3,3,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere"]},{"slots":[4,3,3,2],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere"]},{"slots":[4,3,3,3,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["heroism","sanctuary","aid","warding bond","beacon of hope","sending","aura of purity","otiluke’s resilient sphere","greater restoration","rary’s telepathic bond"]}]'::jsonb),
('subclass:Cleric:Twilight','{"features":[{"name":"Bonus Proficiencies","level":1},{"name":"Eyes of Night","level":1},{"name":"Vigilant Blessing","level":1},{"name":"Channel Divinity: Twilight Sanctuary","level":2},{"name":"Steps of Night","level":6},{"name":"Divine Strike","level":8},{"name":"Twilight Shroud","level":17}]}'::jsonb),
('casting:Cleric:Twilight','[null,{"slots":[2],"automatic":["faerie fire","sleep"]},{"slots":[3],"automatic":["faerie fire","sleep"]},{"slots":[4,2],"automatic":["faerie fire","sleep","moonbeam","see invisibility"]},{"slots":[4,3],"automatic":["faerie fire","sleep","moonbeam","see invisibility"]},{"slots":[4,3,2],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut"]},{"slots":[4,3,3],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut"]},{"slots":[4,3,3,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility"]},{"slots":[4,3,3,2],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility"]},{"slots":[4,3,3,3,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":["faerie fire","sleep","moonbeam","see invisibility","aura of vitality","leomund’s tiny hut","aura of life","greater invisibility","circle of power","mislead"]}]'::jsonb),
('class:Druid','{"saves":["INT","WIS"],"features":[{"name":"Druidic / Spellcasting","level":1},{"name":"Wild Shape","level":2},{"name":"Druid Circle","level":2},{"name":"Wild Shape Improvement","level":4},{"name":"Wild Shape Improvement","level":8},{"name":"Timeless Body","level":18},{"name":"Beast Spells","level":18},{"name":"Archdruid","level":20}]}'::jsonb),
('class:Druid:1','{"resources":[]}'::jsonb),
('class:Druid:2','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:3','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:4','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:5','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:6','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:7','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:8','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:9','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:10','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:11','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:12','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:13','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:14','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:15','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:16','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:17','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:18','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:19','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Druid:20','{"resources":[{"id":"v74_wildshape","name":"Wild Shape","max":999,"rest":"short","ability":""}]}'::jsonb),
('casting:Druid:','[null,{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":[]}]'::jsonb),
('subclass:Druid:Land','{"features":[{"name":"Bonus Cantrip / Natural Recovery / Circle Spells","level":2},{"name":"Land’s Stride","level":6},{"name":"Nature’s Ward","level":10},{"name":"Nature’s Sanctuary","level":14}]}'::jsonb),
('subclass:Druid:Moon','{"features":[{"name":"Combat Wild Shape / Circle Forms","level":2},{"name":"Primal Strike / Circle Forms","level":6},{"name":"Elemental Wild Shape","level":10},{"name":"Thousand Forms","level":14}]}'::jsonb),
('subclass:Druid:Dreams','{"features":[{"name":"Balm of the Summer Court","level":2},{"name":"Hearth of Moonlight and Shadow","level":6},{"name":"Hidden Paths","level":10},{"name":"Walker in Dreams","level":14}]}'::jsonb),
('subclass:Druid:Shepherd','{"features":[{"name":"Speech of the Woods / Spirit Totem","level":2},{"name":"Mighty Summoner","level":6},{"name":"Guardian Spirit","level":10},{"name":"Faithful Summons","level":14}]}'::jsonb),
('subclass:Druid:Spores','{"features":[{"name":"Halo of Spores / Symbiotic Entity / Circle Spells","level":2},{"name":"Fungal Infestation","level":6},{"name":"Spreading Spores","level":10},{"name":"Fungal Body","level":14}]}'::jsonb),
('subclass:Druid:Stars','{"features":[{"name":"Star Map / Starry Form / Circle Spells","level":2},{"name":"Cosmic Omen","level":6},{"name":"Twinkling Constellations","level":10},{"name":"Full of Stars","level":14}]}'::jsonb),
('subclass:Druid:Wildfire','{"features":[{"name":"Circle Spells / Summon Wildfire Spirit","level":2},{"name":"Enhanced Bond","level":6},{"name":"Cauterizing Flames","level":10},{"name":"Blazing Revival","level":14}]}'::jsonb),
('class:Fighter','{"saves":["STR","CON"],"features":[{"name":"Fighting Style","level":1},{"name":"Second Wind","level":1},{"name":"Action Surge","level":2},{"name":"Martial Archetype","level":3},{"name":"Extra Attack","level":5},{"name":"Indomitable","level":9},{"name":"Extra Attack ×4","level":20}]}'::jsonb),
('class:Fighter:1','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:2','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:3','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:4','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:5','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:6','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:7','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:8','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Fighter:9','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:10','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:11','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:12','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:13','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:14','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:15','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:16','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":1,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:17','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":2,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:18','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":2,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:19','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":2,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Fighter:20','{"resources":[{"id":"v74_secondwind","name":"Second Wind","max":1,"rest":"short","ability":""},{"id":"v74_surge","name":"Action Surge","max":2,"rest":"short","ability":""},{"id":"v74_indomitable","name":"Indomitable","max":3,"rest":"long","ability":""}]}'::jsonb),
('subclass:Fighter:Champion','{"features":[{"name":"Improved Critical","level":3},{"name":"Remarkable Athlete","level":7},{"name":"Additional Fighting Style","level":10},{"name":"Superior Critical","level":15},{"name":"Survivor","level":18}]}'::jsonb),
('subclass:Fighter:Battle Master','{"features":[{"name":"Combat Superiority / Student of War","level":3},{"name":"Know Your Enemy","level":7},{"name":"Improved Combat Superiority","level":10},{"name":"Relentless","level":15},{"name":"Improved Combat Superiority","level":18}]}'::jsonb),
('subclass:Fighter:Eldritch Knight','{"features":[{"name":"Spellcasting / Weapon Bond","level":3},{"name":"War Magic","level":7},{"name":"Eldritch Strike","level":10},{"name":"Arcane Charge","level":15},{"name":"Improved War Magic","level":18}]}'::jsonb),
('casting:Fighter:Eldritch Knight','[null,{"slots":[],"automatic":[]},{"slots":[],"automatic":[]},{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]}]'::jsonb),
('subclass:Fighter:Arcane Archer','{"features":[{"name":"Arcane Archer Lore / Arcane Shot","level":3},{"name":"Magic Arrow / Curving Shot","level":7},{"name":"Arcane Shot Option","level":10},{"name":"Ever-Ready Shot","level":15},{"name":"Arcane Shot Improvement","level":18}]}'::jsonb),
('subclass:Fighter:Cavalier','{"features":[{"name":"Bonus Proficiency / Born to the Saddle / Unwavering Mark","level":3},{"name":"Warding Maneuver","level":7},{"name":"Hold the Line","level":10},{"name":"Ferocious Charger","level":15},{"name":"Vigilant Defender","level":18}]}'::jsonb),
('subclass:Fighter:Samurai','{"features":[{"name":"Bonus Proficiency / Fighting Spirit","level":3},{"name":"Elegant Courtier","level":7},{"name":"Tireless Spirit","level":10},{"name":"Rapid Strike","level":15},{"name":"Strength Before Death","level":18}]}'::jsonb),
('subclass:Fighter:Echo Knight','{"features":[{"name":"Manifest Echo / Unleash Incarnation","level":3},{"name":"Echo Avatar","level":7},{"name":"Shadow Martyr","level":10},{"name":"Reclaim Potential","level":15},{"name":"Legion of One","level":18}]}'::jsonb),
('subclass:Fighter:Psi Warrior','{"features":[{"name":"Psionic Power","level":3},{"name":"Telekinetic Adept","level":7},{"name":"Guarded Mind","level":10},{"name":"Bulwark of Force","level":15},{"name":"Telekinetic Master","level":18}]}'::jsonb),
('subclass:Fighter:Rune Knight','{"features":[{"name":"Bonus Proficiencies / Rune Carver / Giant’s Might","level":3},{"name":"Runic Shield","level":7},{"name":"Great Stature","level":10},{"name":"Master of Runes","level":15},{"name":"Runic Juggernaut","level":18}]}'::jsonb),
('class:Monk','{"saves":["STR","DEX"],"features":[{"name":"Martial Arts d4","level":1},{"name":"Unarmored Defense","level":1},{"name":"Ki","level":2},{"name":"Unarmored Movement +10","level":2},{"name":"Monastic Tradition / Deflect Missiles","level":3},{"name":"Slow Fall","level":4},{"name":"Extra Attack / Stunning Strike / d6","level":5},{"name":"Ki-Empowered Strikes","level":6},{"name":"Evasion / Stillness of Mind","level":7},{"name":"Unarmored Movement Improvement","level":9},{"name":"Purity of Body","level":10},{"name":"Tongue of Sun and Moon","level":13},{"name":"Diamond Soul","level":14},{"name":"Timeless Body","level":15},{"name":"Empty Body","level":18},{"name":"Perfect Self","level":20}]}'::jsonb),
('class:Monk:1','{"resources":[]}'::jsonb),
('class:Monk:2','{"resources":[{"id":"v74_ki","name":"Ki","max":2,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:3','{"resources":[{"id":"v74_ki","name":"Ki","max":3,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:4','{"resources":[{"id":"v74_ki","name":"Ki","max":4,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:5','{"resources":[{"id":"v74_ki","name":"Ki","max":5,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:6','{"resources":[{"id":"v74_ki","name":"Ki","max":6,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:7','{"resources":[{"id":"v74_ki","name":"Ki","max":7,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:8','{"resources":[{"id":"v74_ki","name":"Ki","max":8,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:9','{"resources":[{"id":"v74_ki","name":"Ki","max":9,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:10','{"resources":[{"id":"v74_ki","name":"Ki","max":10,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:11','{"resources":[{"id":"v74_ki","name":"Ki","max":11,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:12','{"resources":[{"id":"v74_ki","name":"Ki","max":12,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:13','{"resources":[{"id":"v74_ki","name":"Ki","max":13,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:14','{"resources":[{"id":"v74_ki","name":"Ki","max":14,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:15','{"resources":[{"id":"v74_ki","name":"Ki","max":15,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:16','{"resources":[{"id":"v74_ki","name":"Ki","max":16,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:17','{"resources":[{"id":"v74_ki","name":"Ki","max":17,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:18','{"resources":[{"id":"v74_ki","name":"Ki","max":18,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:19','{"resources":[{"id":"v74_ki","name":"Ki","max":19,"rest":"short","ability":""}]}'::jsonb),
('class:Monk:20','{"resources":[{"id":"v74_ki","name":"Ki","max":20,"rest":"short","ability":""}]}'::jsonb),
('subclass:Monk:Open Hand','{"features":[{"name":"Open Hand Technique","level":3},{"name":"Wholeness of Body","level":6},{"name":"Tranquility","level":11},{"name":"Quivering Palm","level":17}]}'::jsonb),
('subclass:Monk:Shadow','{"features":[{"name":"Shadow Arts","level":3},{"name":"Shadow Step","level":6},{"name":"Cloak of Shadows","level":11},{"name":"Opportunist","level":17}]}'::jsonb),
('subclass:Monk:Four Elements','{"features":[{"name":"Disciple of the Elements","level":3},{"name":"Elemental Discipline","level":6},{"name":"Elemental Discipline","level":11},{"name":"Elemental Discipline","level":17}]}'::jsonb),
('subclass:Monk:Long Death','{"features":[{"name":"Touch of Death","level":3},{"name":"Hour of Reaping","level":6},{"name":"Mastery of Death","level":11},{"name":"Touch of the Long Death","level":17}]}'::jsonb),
('subclass:Monk:Sun Soul','{"features":[{"name":"Radiant Sun Bolt","level":3},{"name":"Searing Arc Strike","level":6},{"name":"Searing Sunburst","level":11},{"name":"Sun Shield","level":17}]}'::jsonb),
('subclass:Monk:Drunken Master','{"features":[{"name":"Bonus Proficiencies / Drunken Technique","level":3},{"name":"Tipsy Sway","level":6},{"name":"Drunkard’s Luck","level":11},{"name":"Intoxicated Frenzy","level":17}]}'::jsonb),
('subclass:Monk:Kensei','{"features":[{"name":"Path of the Kensei","level":3},{"name":"One with the Blade","level":6},{"name":"Sharpen the Blade","level":11},{"name":"Unerring Accuracy","level":17}]}'::jsonb),
('subclass:Monk:Mercy','{"features":[{"name":"Implements of Mercy / Hand of Healing / Hand of Harm","level":3},{"name":"Physician’s Touch","level":6},{"name":"Flurry of Healing and Harm","level":11},{"name":"Hand of Ultimate Mercy","level":17}]}'::jsonb),
('subclass:Monk:Astral Self','{"features":[{"name":"Arms of the Astral Self","level":3},{"name":"Visage of the Astral Self","level":6},{"name":"Body of the Astral Self","level":11},{"name":"Awakened Astral Self","level":17}]}'::jsonb),
('class:Paladin','{"saves":["WIS","CHA"],"features":[{"name":"Divine Sense","level":1},{"name":"Lay on Hands","level":1},{"name":"Fighting Style / Spellcasting","level":2},{"name":"Divine Smite","level":2},{"name":"Divine Health / Sacred Oath","level":3},{"name":"Extra Attack","level":5},{"name":"Aura of Protection","level":6},{"name":"Aura of Courage","level":10},{"name":"Improved Divine Smite","level":11},{"name":"Cleansing Touch","level":14}]}'::jsonb),
('class:Paladin:1','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":5,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"}]}'::jsonb),
('class:Paladin:2','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":10,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"}]}'::jsonb),
('class:Paladin:3','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":15,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:4','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":20,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:5','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":25,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:6','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":30,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:7','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":35,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:8','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":40,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:9','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":45,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:10','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":50,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:11','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":55,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:12','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":60,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:13','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":65,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:14','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":70,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:15','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":75,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:16','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":80,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:17','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":85,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:18','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":90,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:19','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":95,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('class:Paladin:20','{"resources":[{"id":"v74_layhands","name":"Lay on Hands (HP)","max":100,"rest":"long","ability":""},{"id":"v74_sense","name":"Divine Sense","max":1,"rest":"long","ability":"CHA+1"},{"id":"v74_channel","name":"Channel Divinity","max":1,"rest":"short","ability":""}]}'::jsonb),
('casting:Paladin:','[null,{"slots":[],"automatic":[]},{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]}]'::jsonb),
('subclass:Paladin:Devotion','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of Devotion","level":7},{"name":"Purity of Spirit","level":15},{"name":"Holy Nimbus","level":20}]}'::jsonb),
('casting:Paladin:Devotion','[null,{"slots":[],"automatic":[]},{"slots":[2],"automatic":["protection from evil and good","sanctuary"]},{"slots":[3],"automatic":["protection from evil and good","sanctuary"]},{"slots":[3],"automatic":["protection from evil and good","sanctuary"]},{"slots":[4,2],"automatic":["lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,2],"automatic":["lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3],"automatic":["lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3],"automatic":["lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,2],"automatic":["beacon of hope","dispel magic","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,2],"automatic":["beacon of hope","dispel magic","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3],"automatic":["beacon of hope","dispel magic","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3],"automatic":["beacon of hope","dispel magic","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,1],"automatic":["beacon of hope","dispel magic","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,1],"automatic":["beacon of hope","dispel magic","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,2],"automatic":["beacon of hope","dispel magic","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,2],"automatic":["beacon of hope","dispel magic","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,3,1],"automatic":["beacon of hope","commune","dispel magic","flame strike","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,3,1],"automatic":["beacon of hope","commune","dispel magic","flame strike","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,3,2],"automatic":["beacon of hope","commune","dispel magic","flame strike","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]},{"slots":[4,3,3,3,2],"automatic":["beacon of hope","commune","dispel magic","flame strike","freedom of movement","lesser restoration","protection from evil and good","sanctuary","zone of truth"]}]'::jsonb),
('subclass:Paladin:Ancients','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of Warding","level":7},{"name":"Undying Sentinel","level":15},{"name":"Elder Champion","level":20}]}'::jsonb),
('subclass:Paladin:Vengeance','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Relentless Avenger","level":7},{"name":"Soul of Vengeance","level":15},{"name":"Avenging Angel","level":20}]}'::jsonb),
('subclass:Paladin:Crown','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Divine Allegiance","level":7},{"name":"Unyielding Spirit","level":15},{"name":"Exalted Champion","level":20}]}'::jsonb),
('subclass:Paladin:Conquest','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of Conquest","level":7},{"name":"Scornful Rebuke","level":15},{"name":"Invincible Conqueror","level":20}]}'::jsonb),
('subclass:Paladin:Redemption','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of the Guardian","level":7},{"name":"Protective Spirit","level":15},{"name":"Emissary of Redemption","level":20}]}'::jsonb),
('subclass:Paladin:Glory','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of Alacrity","level":7},{"name":"Glorious Defense","level":15},{"name":"Living Legend","level":20}]}'::jsonb),
('subclass:Paladin:Watchers','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of the Sentinel","level":7},{"name":"Vigilant Rebuke","level":15},{"name":"Mortal Bulwark","level":20}]}'::jsonb),
('subclass:Paladin:Oathbreaker','{"features":[{"name":"Oath Spells / Channel Divinity","level":3},{"name":"Aura of Hate","level":7},{"name":"Supernatural Resistance","level":15},{"name":"Dread Lord","level":20}]}'::jsonb),
('class:Ranger','{"saves":["STR","DEX"],"features":[{"name":"Favored Enemy","level":1},{"name":"Natural Explorer","level":1},{"name":"Fighting Style / Spellcasting","level":2},{"name":"Ranger Archetype / Primeval Awareness","level":3},{"name":"Extra Attack","level":5},{"name":"Land’s Stride","level":8},{"name":"Hide in Plain Sight","level":10},{"name":"Vanish","level":14},{"name":"Feral Senses","level":18},{"name":"Foe Slayer","level":20}]}'::jsonb),
('class:Ranger:1','{"resources":[]}'::jsonb),
('class:Ranger:2','{"resources":[]}'::jsonb),
('class:Ranger:3','{"resources":[]}'::jsonb),
('class:Ranger:4','{"resources":[]}'::jsonb),
('class:Ranger:5','{"resources":[]}'::jsonb),
('class:Ranger:6','{"resources":[]}'::jsonb),
('class:Ranger:7','{"resources":[]}'::jsonb),
('class:Ranger:8','{"resources":[]}'::jsonb),
('class:Ranger:9','{"resources":[]}'::jsonb),
('class:Ranger:10','{"resources":[]}'::jsonb),
('class:Ranger:11','{"resources":[]}'::jsonb),
('class:Ranger:12','{"resources":[]}'::jsonb),
('class:Ranger:13','{"resources":[]}'::jsonb),
('class:Ranger:14','{"resources":[]}'::jsonb),
('class:Ranger:15','{"resources":[]}'::jsonb),
('class:Ranger:16','{"resources":[]}'::jsonb),
('class:Ranger:17','{"resources":[]}'::jsonb),
('class:Ranger:18','{"resources":[]}'::jsonb),
('class:Ranger:19','{"resources":[]}'::jsonb),
('class:Ranger:20','{"resources":[]}'::jsonb),
('casting:Ranger:','[null,{"slots":[],"automatic":[]},{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]}]'::jsonb),
('subclass:Ranger:Hunter','{"features":[{"name":"Hunter’s Prey","level":3},{"name":"Defensive Tactics","level":7},{"name":"Multiattack","level":11},{"name":"Superior Hunter’s Defense","level":15}]}'::jsonb),
('subclass:Ranger:Beast Master','{"features":[{"name":"Ranger’s Companion","level":3},{"name":"Exceptional Training","level":7},{"name":"Bestial Fury","level":11},{"name":"Share Spells","level":15}]}'::jsonb),
('subclass:Ranger:Gloom Stalker','{"features":[{"name":"Dread Ambusher / Umbral Sight","level":3},{"name":"Iron Mind","level":7},{"name":"Stalker’s Flurry","level":11},{"name":"Shadowy Dodge","level":15}]}'::jsonb),
('subclass:Ranger:Horizon Walker','{"features":[{"name":"Detect Portal / Planar Warrior","level":3},{"name":"Ethereal Step","level":7},{"name":"Distant Strike","level":11},{"name":"Spectral Defense","level":15}]}'::jsonb),
('subclass:Ranger:Monster Slayer','{"features":[{"name":"Hunter’s Sense / Slayer’s Prey","level":3},{"name":"Supernatural Defense","level":7},{"name":"Magic-User’s Nemesis","level":11},{"name":"Slayer’s Counter","level":15}]}'::jsonb),
('subclass:Ranger:Fey Wanderer','{"features":[{"name":"Dreadful Strikes / Otherworldly Glamour","level":3},{"name":"Beguiling Twist","level":7},{"name":"Fey Reinforcements","level":11},{"name":"Misty Wanderer","level":15}]}'::jsonb),
('subclass:Ranger:Swarmkeeper','{"features":[{"name":"Gathered Swarm / Swarmkeeper Magic","level":3},{"name":"Writhing Tide","level":7},{"name":"Mighty Swarm","level":11},{"name":"Swarming Dispersal","level":15}]}'::jsonb),
('subclass:Ranger:Drakewarden','{"features":[{"name":"Draconic Gift / Drake Companion","level":3},{"name":"Bond of Fang and Scale","level":7},{"name":"Drake’s Breath","level":11},{"name":"Perfected Bond","level":15}]}'::jsonb),
('class:Rogue','{"saves":["DEX","INT"],"features":[{"name":"Expertise","level":1},{"name":"Sneak Attack 1d6","level":1},{"name":"Thieves’ Cant","level":1},{"name":"Cunning Action","level":2},{"name":"Roguish Archetype / Sneak 2d6","level":3},{"name":"Uncanny Dodge / Sneak 3d6","level":5},{"name":"Expertise","level":6},{"name":"Evasion / Sneak 4d6","level":7},{"name":"Reliable Talent / Sneak 6d6","level":11},{"name":"Blindsense","level":14},{"name":"Slippery Mind / Sneak 8d6","level":15},{"name":"Elusive","level":18},{"name":"Stroke of Luck / Sneak 10d6","level":20}]}'::jsonb),
('class:Rogue:1','{"resources":[]}'::jsonb),
('class:Rogue:2','{"resources":[]}'::jsonb),
('class:Rogue:3','{"resources":[]}'::jsonb),
('class:Rogue:4','{"resources":[]}'::jsonb),
('class:Rogue:5','{"resources":[]}'::jsonb),
('class:Rogue:6','{"resources":[]}'::jsonb),
('class:Rogue:7','{"resources":[]}'::jsonb),
('class:Rogue:8','{"resources":[]}'::jsonb),
('class:Rogue:9','{"resources":[]}'::jsonb),
('class:Rogue:10','{"resources":[]}'::jsonb),
('class:Rogue:11','{"resources":[]}'::jsonb),
('class:Rogue:12','{"resources":[]}'::jsonb),
('class:Rogue:13','{"resources":[]}'::jsonb),
('class:Rogue:14','{"resources":[]}'::jsonb),
('class:Rogue:15','{"resources":[]}'::jsonb),
('class:Rogue:16','{"resources":[]}'::jsonb),
('class:Rogue:17','{"resources":[]}'::jsonb),
('class:Rogue:18','{"resources":[]}'::jsonb),
('class:Rogue:19','{"resources":[]}'::jsonb),
('class:Rogue:20','{"resources":[]}'::jsonb),
('subclass:Rogue:Thief','{"features":[{"name":"Fast Hands / Second-Story Work","level":3},{"name":"Supreme Sneak","level":9},{"name":"Use Magic Device","level":13},{"name":"Thief’s Reflexes","level":17}]}'::jsonb),
('subclass:Rogue:Assassin','{"features":[{"name":"Bonus Proficiencies / Assassinate","level":3},{"name":"Infiltration Expertise","level":9},{"name":"Impostor","level":13},{"name":"Death Strike","level":17}]}'::jsonb),
('subclass:Rogue:Arcane Trickster','{"features":[{"name":"Spellcasting / Mage Hand Legerdemain","level":3},{"name":"Magical Ambush","level":9},{"name":"Versatile Trickster","level":13},{"name":"Spell Thief","level":17}]}'::jsonb),
('casting:Rogue:Arcane Trickster','[null,{"slots":[],"automatic":[]},{"slots":[],"automatic":[]},{"slots":[2],"automatic":["mage hand"]},{"slots":[3],"automatic":["mage hand"]},{"slots":[3],"automatic":["mage hand"]},{"slots":[3],"automatic":["mage hand"]},{"slots":[4,2],"automatic":["mage hand"]},{"slots":[4,2],"automatic":["mage hand"]},{"slots":[4,2],"automatic":["mage hand"]},{"slots":[4,3],"automatic":["mage hand"]},{"slots":[4,3],"automatic":["mage hand"]},{"slots":[4,3],"automatic":["mage hand"]},{"slots":[4,3,2],"automatic":["mage hand"]},{"slots":[4,3,2],"automatic":["mage hand"]},{"slots":[4,3,2],"automatic":["mage hand"]},{"slots":[4,3,3],"automatic":["mage hand"]},{"slots":[4,3,3],"automatic":["mage hand"]},{"slots":[4,3,3],"automatic":["mage hand"]},{"slots":[4,3,3,1],"automatic":["mage hand"]},{"slots":[4,3,3,1],"automatic":["mage hand"]}]'::jsonb),
('subclass:Rogue:Inquisitive','{"features":[{"name":"Ear for Deceit / Eye for Detail / Insightful Fighting","level":3},{"name":"Steady Eye","level":9},{"name":"Unerring Eye","level":13},{"name":"Eye for Weakness","level":17}]}'::jsonb),
('subclass:Rogue:Mastermind','{"features":[{"name":"Master of Intrigue / Master of Tactics","level":3},{"name":"Insightful Manipulator","level":9},{"name":"Misdirection","level":13},{"name":"Soul of Deceit","level":17}]}'::jsonb),
('subclass:Rogue:Scout','{"features":[{"name":"Skirmisher / Survivalist","level":3},{"name":"Superior Mobility","level":9},{"name":"Ambush Master","level":13},{"name":"Sudden Strike","level":17}]}'::jsonb),
('subclass:Rogue:Swashbuckler','{"features":[{"name":"Fancy Footwork / Rakish Audacity","level":3},{"name":"Panache","level":9},{"name":"Elegant Maneuver","level":13},{"name":"Master Duelist","level":17}]}'::jsonb),
('subclass:Rogue:Phantom','{"features":[{"name":"Whispers of the Dead / Wails from the Grave","level":3},{"name":"Tokens of the Departed","level":9},{"name":"Ghost Walk","level":13},{"name":"Death’s Friend","level":17}]}'::jsonb),
('subclass:Rogue:Soulknife','{"features":[{"name":"Psionic Power / Psychic Blades","level":3},{"name":"Soul Blades","level":9},{"name":"Psychic Veil","level":13},{"name":"Rend Mind","level":17}]}'::jsonb),
('class:Sorcerer','{"saves":["CON","CHA"],"features":[{"name":"Spellcasting / Sorcerous Origin","level":1},{"name":"Font of Magic","level":2},{"name":"Metamagic","level":3},{"name":"Metamagic ×3","level":10},{"name":"Metamagic ×4","level":17},{"name":"Sorcerous Restoration","level":20}]}'::jsonb),
('class:Sorcerer:1','{"resources":[]}'::jsonb),
('class:Sorcerer:2','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":2,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:3','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":3,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:4','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":4,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:5','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":5,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:6','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":6,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:7','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":7,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:8','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":8,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:9','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":9,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:10','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":10,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:11','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":11,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:12','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":12,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:13','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":13,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:14','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":14,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:15','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":15,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:16','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":16,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:17','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":17,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:18','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":18,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:19','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":19,"rest":"long","ability":""}]}'::jsonb),
('class:Sorcerer:20','{"resources":[{"id":"v74_sorcery","name":"Sorcery Points","max":20,"rest":"long","ability":""}]}'::jsonb),
('casting:Sorcerer:','[null,{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":[]}]'::jsonb),
('subclass:Sorcerer:Draconic','{"features":[{"name":"Dragon Ancestor / Draconic Resilience","level":1},{"name":"Elemental Affinity","level":6},{"name":"Dragon Wings","level":14},{"name":"Draconic Presence","level":18}]}'::jsonb),
('subclass:Sorcerer:Wild Magic','{"features":[{"name":"Wild Magic Surge / Tides of Chaos","level":1},{"name":"Bend Luck","level":6},{"name":"Controlled Chaos","level":14},{"name":"Spell Bombardment","level":18}]}'::jsonb),
('subclass:Sorcerer:Divine Soul','{"features":[{"name":"Divine Magic / Favored by the Gods","level":1},{"name":"Empowered Healing","level":6},{"name":"Otherworldly Wings","level":14},{"name":"Unearthly Recovery","level":18}]}'::jsonb),
('subclass:Sorcerer:Shadow','{"features":[{"name":"Eyes of the Dark / Strength of the Grave","level":1},{"name":"Hound of Ill Omen","level":6},{"name":"Shadow Walk","level":14},{"name":"Umbral Form","level":18}]}'::jsonb),
('subclass:Sorcerer:Storm','{"features":[{"name":"Wind Speaker / Tempestuous Magic","level":1},{"name":"Heart of the Storm / Storm Guide","level":6},{"name":"Storm’s Fury","level":14},{"name":"Wind Soul","level":18}]}'::jsonb),
('subclass:Sorcerer:Aberrant Mind','{"features":[{"name":"Psionic Spells / Telepathic Speech","level":1},{"name":"Psionic Sorcery / Psychic Defenses","level":6},{"name":"Revelation in Flesh","level":14},{"name":"Warping Implosion","level":18}]}'::jsonb),
('subclass:Sorcerer:Clockwork Soul','{"features":[{"name":"Clockwork Magic / Restore Balance","level":1},{"name":"Bastion of Law","level":6},{"name":"Trance of Order","level":14},{"name":"Clockwork Cavalcade","level":18}]}'::jsonb),
('subclass:Sorcerer:Lunar','{"features":[{"name":"Lunar Embodiment / Moon Fire","level":1},{"name":"Lunar Boons","level":6},{"name":"Waxing and Waning","level":14},{"name":"Lunar Phenomenon","level":18}]}'::jsonb),
('class:Warlock','{"saves":["WIS","CHA"],"features":[{"name":"Otherworldly Patron / Pact Magic","level":1},{"name":"Eldritch Invocations","level":2},{"name":"Pact Boon","level":3},{"name":"Mystic Arcanum (6th)","level":11},{"name":"Mystic Arcanum (7th)","level":13},{"name":"Mystic Arcanum (8th)","level":15},{"name":"Mystic Arcanum (9th)","level":17},{"name":"Eldritch Master","level":20}]}'::jsonb),
('class:Warlock:1','{"resources":[]}'::jsonb),
('class:Warlock:2','{"resources":[]}'::jsonb),
('class:Warlock:3','{"resources":[]}'::jsonb),
('class:Warlock:4','{"resources":[]}'::jsonb),
('class:Warlock:5','{"resources":[]}'::jsonb),
('class:Warlock:6','{"resources":[]}'::jsonb),
('class:Warlock:7','{"resources":[]}'::jsonb),
('class:Warlock:8','{"resources":[]}'::jsonb),
('class:Warlock:9','{"resources":[]}'::jsonb),
('class:Warlock:10','{"resources":[]}'::jsonb),
('class:Warlock:11','{"resources":[]}'::jsonb),
('class:Warlock:12','{"resources":[]}'::jsonb),
('class:Warlock:13','{"resources":[]}'::jsonb),
('class:Warlock:14','{"resources":[]}'::jsonb),
('class:Warlock:15','{"resources":[]}'::jsonb),
('class:Warlock:16','{"resources":[]}'::jsonb),
('class:Warlock:17','{"resources":[]}'::jsonb),
('class:Warlock:18','{"resources":[]}'::jsonb),
('class:Warlock:19','{"resources":[]}'::jsonb),
('class:Warlock:20','{"resources":[]}'::jsonb),
('casting:Warlock:','[null,{"slots":[1],"automatic":[]},{"slots":[2],"automatic":[]},{"slots":[0,2],"automatic":[]},{"slots":[0,2],"automatic":[]},{"slots":[0,0,2],"automatic":[]},{"slots":[0,0,2],"automatic":[]},{"slots":[0,0,0,2],"automatic":[]},{"slots":[0,0,0,2],"automatic":[]},{"slots":[0,0,0,0,2],"automatic":[]},{"slots":[0,0,0,0,2],"automatic":[]},{"slots":[0,0,0,0,3],"automatic":[]},{"slots":[0,0,0,0,3],"automatic":[]},{"slots":[0,0,0,0,3],"automatic":[]},{"slots":[0,0,0,0,3],"automatic":[]},{"slots":[0,0,0,0,3],"automatic":[]},{"slots":[0,0,0,0,3],"automatic":[]},{"slots":[0,0,0,0,4],"automatic":[]},{"slots":[0,0,0,0,4],"automatic":[]},{"slots":[0,0,0,0,4],"automatic":[]},{"slots":[0,0,0,0,4],"automatic":[]}]'::jsonb),
('subclass:Warlock:Archfey','{"features":[{"name":"Fey Presence","level":1},{"name":"Misty Escape","level":6},{"name":"Beguiling Defenses","level":10},{"name":"Dark Delirium","level":14}]}'::jsonb),
('subclass:Warlock:Fiend','{"features":[{"name":"Dark One’s Blessing","level":1},{"name":"Dark One’s Own Luck","level":6},{"name":"Fiendish Resilience","level":10},{"name":"Hurl Through Hell","level":14}]}'::jsonb),
('subclass:Warlock:Great Old One','{"features":[{"name":"Awakened Mind","level":1},{"name":"Entropic Ward","level":6},{"name":"Thought Shield","level":10},{"name":"Create Thrall","level":14}]}'::jsonb),
('subclass:Warlock:Celestial','{"features":[{"name":"Bonus Cantrips / Healing Light","level":1},{"name":"Radiant Soul","level":6},{"name":"Celestial Resilience","level":10},{"name":"Searing Vengeance","level":14}]}'::jsonb),
('subclass:Warlock:Hexblade','{"features":[{"name":"Expanded Spells / Hexblade’s Curse / Hex Warrior","level":1},{"name":"Accursed Specter","level":6},{"name":"Armor of Hexes","level":10},{"name":"Master of Hexes","level":14}]}'::jsonb),
('subclass:Warlock:Fathomless','{"features":[{"name":"Tentacle of the Deeps / Gift of the Sea","level":1},{"name":"Oceanic Soul / Guardian Coil","level":6},{"name":"Grasping Tentacles","level":10},{"name":"Fathomless Plunge","level":14}]}'::jsonb),
('subclass:Warlock:Genie','{"features":[{"name":"Genie’s Vessel / Genie’s Wrath","level":1},{"name":"Elemental Gift","level":6},{"name":"Sanctuary Vessel","level":10},{"name":"Limited Wish","level":14}]}'::jsonb),
('subclass:Warlock:Undead','{"features":[{"name":"Form of Dread","level":1},{"name":"Grave Touched","level":6},{"name":"Mortal Husk","level":10},{"name":"Spirit Projection","level":14}]}'::jsonb),
('class:Wizard','{"saves":["INT","WIS"],"features":[{"name":"Spellcasting / Spellbook","level":1},{"name":"Arcane Recovery","level":1},{"name":"Arcane Tradition","level":2},{"name":"Spell Mastery","level":18},{"name":"Signature Spells","level":20}]}'::jsonb),
('class:Wizard:1','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:2','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:3','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:4','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:5','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:6','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:7','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:8','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:9','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:10','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:11','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:12','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:13','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:14','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:15','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:16','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:17','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:18','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:19','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('class:Wizard:20','{"resources":[{"id":"v74_recovery","name":"Arcane Recovery","max":1,"rest":"long","ability":""}]}'::jsonb),
('casting:Wizard:','[null,{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,2,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,1,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,1,1,1],"automatic":[]},{"slots":[4,3,3,3,3,2,2,1,1],"automatic":[]}]'::jsonb),
('subclass:Wizard:Abjuration','{"features":[{"name":"Abjuration Savant / Arcane Ward","level":2},{"name":"Projected Ward","level":6},{"name":"Improved Abjuration","level":10},{"name":"Spell Resistance","level":14}]}'::jsonb),
('subclass:Wizard:Conjuration','{"features":[{"name":"Conjuration Savant / Minor Conjuration","level":2},{"name":"Benign Transposition","level":6},{"name":"Focused Conjuration","level":10},{"name":"Durable Summons","level":14}]}'::jsonb),
('subclass:Wizard:Divination','{"features":[{"name":"Divination Savant / Portent","level":2},{"name":"Expert Divination","level":6},{"name":"The Third Eye","level":10},{"name":"Greater Portent","level":14}]}'::jsonb),
('subclass:Wizard:Enchantment','{"features":[{"name":"Enchantment Savant / Hypnotic Gaze","level":2},{"name":"Instinctive Charm","level":6},{"name":"Split Enchantment","level":10},{"name":"Alter Memories","level":14}]}'::jsonb),
('subclass:Wizard:Evocation','{"features":[{"name":"Evocation Savant / Sculpt Spells","level":2},{"name":"Potent Cantrip","level":6},{"name":"Empowered Evocation","level":10},{"name":"Overchannel","level":14}]}'::jsonb),
('subclass:Wizard:Illusion','{"features":[{"name":"Illusion Savant / Improved Minor Illusion","level":2},{"name":"Malleable Illusions","level":6},{"name":"Illusory Self","level":10},{"name":"Illusory Reality","level":14}]}'::jsonb),
('subclass:Wizard:Necromancy','{"features":[{"name":"Necromancy Savant / Grim Harvest","level":2},{"name":"Undead Thralls","level":6},{"name":"Inured to Undeath","level":10},{"name":"Command Undead","level":14}]}'::jsonb),
('subclass:Wizard:Transmutation','{"features":[{"name":"Transmutation Savant / Minor Alchemy","level":2},{"name":"Transmuter’s Stone","level":6},{"name":"Shapechanger","level":10},{"name":"Master Transmuter","level":14}]}'::jsonb),
('subclass:Wizard:Bladesinging','{"features":[{"name":"Training in War and Song / Bladesong","level":2},{"name":"Extra Attack","level":6},{"name":"Song of Defense","level":10},{"name":"Song of Victory","level":14}]}'::jsonb),
('subclass:Wizard:War Magic','{"features":[{"name":"Arcane Deflection / Tactical Wit","level":2},{"name":"Power Surge","level":6},{"name":"Durable Magic","level":10},{"name":"Deflecting Shroud","level":14}]}'::jsonb),
('subclass:Wizard:Chronurgy','{"features":[{"name":"Chronal Shift / Temporal Awareness","level":2},{"name":"Momentary Stasis","level":6},{"name":"Arcane Abeyance","level":10},{"name":"Convergent Future","level":14}]}'::jsonb),
('subclass:Wizard:Graviturgy','{"features":[{"name":"Adjust Density","level":2},{"name":"Gravity Well","level":6},{"name":"Violent Attraction","level":10},{"name":"Event Horizon","level":14}]}'::jsonb),
('subclass:Wizard:Scribes','{"features":[{"name":"Wizardly Quill / Awakened Spellbook","level":2},{"name":"Manifest Mind","level":6},{"name":"Master Scrivener","level":10},{"name":"One with the Word","level":14}]}'::jsonb),
('class:Artificer','{"saves":["CON","INT"],"features":[{"name":"Magical Tinkering / Spellcasting","level":1},{"name":"Infuse Item","level":2},{"name":"Artificer Specialist / Right Tool for the Job","level":3},{"name":"Tool Expertise","level":6},{"name":"Flash of Genius","level":7},{"name":"Magic Item Adept","level":10},{"name":"Spell-Storing Item","level":11},{"name":"Magic Item Savant","level":14},{"name":"Magic Item Master","level":18},{"name":"Soul of Artifice","level":20}]}'::jsonb),
('class:Artificer:1','{"resources":[]}'::jsonb),
('class:Artificer:2','{"resources":[]}'::jsonb),
('class:Artificer:3','{"resources":[]}'::jsonb),
('class:Artificer:4','{"resources":[]}'::jsonb),
('class:Artificer:5','{"resources":[]}'::jsonb),
('class:Artificer:6','{"resources":[]}'::jsonb),
('class:Artificer:7','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:8','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:9','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:10','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:11','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:12','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:13','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:14','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:15','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:16','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:17','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:18','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:19','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('class:Artificer:20','{"resources":[{"id":"v74_genius","name":"Flash of Genius","max":1,"rest":"long","ability":"INT"}]}'::jsonb),
('casting:Artificer:','[null,{"slots":[2],"automatic":[]},{"slots":[2],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[3],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,2],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,2],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,1],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,2],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,1],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]},{"slots":[4,3,3,3,2],"automatic":[]}]'::jsonb),
('subclass:Artificer:Alchemist','{"features":[{"name":"Tool Proficiency / Alchemist Spells / Experimental Elixir","level":3},{"name":"Alchemical Savant","level":5},{"name":"Restorative Reagents","level":9},{"name":"Chemical Mastery","level":15}]}'::jsonb),
('subclass:Artificer:Artillerist','{"features":[{"name":"Tool Proficiency / Artillerist Spells / Eldritch Cannon","level":3},{"name":"Arcane Firearm","level":5},{"name":"Explosive Cannon","level":9},{"name":"Fortified Position","level":15}]}'::jsonb),
('subclass:Artificer:Battle Smith','{"features":[{"name":"Tool Proficiency / Battle Smith Spells / Battle Ready / Steel Defender","level":3},{"name":"Extra Attack","level":5},{"name":"Arcane Jolt","level":9},{"name":"Improved Defender","level":15}]}'::jsonb),
('subclass:Artificer:Armorer','{"features":[{"name":"Tools of the Trade / Armorer Spells / Arcane Armor / Armor Model","level":3},{"name":"Extra Attack","level":5},{"name":"Armor Modifications","level":9},{"name":"Perfected Armor","level":15}]}'::jsonb)
on conflict(id) do update set data=excluded.data;
commit;
