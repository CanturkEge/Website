-- Build 83: secure campaign hubs, private traps/notebooks and advanced campaign systems.
begin;

create table if not exists public.campaign_systems_v83 (
  campaign_id uuid primary key references public.campaigns(id) on delete cascade,
  public_data jsonb not null default '{}'::jsonb,
  private_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_notebooks_v83 (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.accounts(id) on delete cascade,
  book jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key(campaign_id,user_id)
);

create index if not exists campaign_notebooks_v83_user_idx on public.campaign_notebooks_v83(user_id,campaign_id);
alter table public.campaign_systems_v83 enable row level security;
alter table public.campaign_notebooks_v83 enable row level security;
revoke all on table public.campaign_systems_v83,public.campaign_notebooks_v83 from public,anon,authenticated;

insert into public.campaign_systems_v83(campaign_id,public_data,private_data)
select c.id,
 jsonb_build_object(
  'bastion',coalesce(c.state#>'{v80,bastion}','{"name":"","level":1,"morale":50,"defense":10,"treasury":0,"buildings":[],"rooms":[],"projects":[],"hirelings":[],"requests":[],"dmNotes":""}'::jsonb),
  'factions',coalesce(c.state#>'{v80,factions}','[]'::jsonb),
  'worldEvents',coalesce(c.state#>'{v80,worldEvents}','[]'::jsonb),
  'pets',coalesce(c.state#>'{v80,pets}','[]'::jsonb),
  'chronicle','{"title":"Macera Kroniği","pages":[]}'::jsonb
 ),
 jsonb_build_object(
  'traps',coalesce(c.state#>'{v80,traps}','[]'::jsonb),
  'advancedQuests','[]'::jsonb,
  'encounters','[]'::jsonb,
  'crimes','{"laws":[],"cases":[]}'::jsonb,
  'divine','[]'::jsonb,
  'dmNotebook',coalesce(c.state#>'{v80,notebooks,dm}','{"title":"DM Notları","pages":[]}'::jsonb)
 )
from public.campaigns c
on conflict(campaign_id) do nothing;

insert into public.campaign_notebooks_v83(campaign_id,user_id,book)
select c.id,m.user_id,e.value
from public.campaigns c
cross join lateral jsonb_each(coalesce(c.state#>'{v80,notebooks,players}','{}'::jsonb)) e
join public.campaign_members m on m.campaign_id=c.id and m.user_id::text=e.key
on conflict(campaign_id,user_id) do nothing;

-- Private v80 fields must no longer travel inside campaign JSON returned to every member.
update public.campaigns
set state=(state #- '{v80,traps}') #- '{v80,notebooks}',updated_at=now()
where state#>'{v80,traps}' is not null or state#>'{v80,notebooks}' is not null;

-- An older tab must not be able to put the retired private paths back into shared state.
create or replace function public.v83_strip_private_campaign_state()
returns trigger language plpgsql set search_path=public as $$
begin
 new.state:=(coalesce(new.state,'{}'::jsonb) #- '{v80,traps}') #- '{v80,notebooks}';
 return new;
end $$;

drop trigger if exists v83_strip_private_campaign_state on public.campaigns;
create trigger v83_strip_private_campaign_state
before insert or update of state on public.campaigns
for each row execute function public.v83_strip_private_campaign_state();
revoke all on function public.v83_strip_private_campaign_state() from public,anon,authenticated;

create or replace function public.campaign_systems_load_v83(p_session_token text,p_campaign uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); role_name text; pub jsonb; priv jsonb; st jsonb; ch jsonb; book jsonb;
 rows jsonb; wis integer:=10; lvl integer:=1; pb integer:=2; mod integer:=0; passive integer:=10; proficient boolean:=false; expert boolean:=false;
begin
 if u is null then raise exception 'Güvenli oturum bulunamadı'; end if;
 select role into role_name from public.campaign_members where campaign_id=p_campaign and user_id=u;
 if role_name is null then raise exception 'Kampanya üyeliği bulunamadı'; end if;

 insert into public.campaign_systems_v83(campaign_id,public_data,private_data)
 values(p_campaign,
  '{"bastion":{"name":"","level":1,"morale":50,"defense":10,"treasury":0,"buildings":[],"rooms":[],"projects":[],"hirelings":[],"requests":[],"dmNotes":""},"factions":[],"worldEvents":[],"pets":[],"chronicle":{"title":"Macera Kroniği","pages":[]}}'::jsonb,
  '{"traps":[],"advancedQuests":[],"encounters":[],"crimes":{"laws":[],"cases":[]},"divine":[],"dmNotebook":{"title":"DM Notları","pages":[]}}'::jsonb)
 on conflict(campaign_id) do nothing;

 select s.public_data,s.private_data,c.state into pub,priv,st
 from public.campaign_systems_v83 s join public.campaigns c on c.id=s.campaign_id where s.campaign_id=p_campaign;

 if role_name='dm' then
  return jsonb_build_object('role','dm','public',pub,'private',priv,'notebook','{}'::jsonb,'passivePerception',0);
 end if;

 select value into ch from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) where value->>'userId'=u::text limit 1;
 if ch is not null then
  wis:=coalesce(nullif(ch#>>'{stats,WIS}','')::integer,nullif(ch#>>'{baseStats,WIS}','')::integer,10);
  lvl:=greatest(1,least(20,coalesce(nullif(ch->>'level','')::integer,1)));
  pb:=2+floor((lvl-1)::numeric/4)::integer;
  mod:=floor((wis-10)::numeric/2)::integer;
  proficient:=coalesce(ch->'classSkillChoices','[]'::jsonb)?'Perception'
   or coalesce(ch->'bonusSkillChoices','[]'::jsonb)?'Perception'
   or ch->>'background'='Sailor'
   or ch->>'species' in ('Elf','Tabaxi','Harengon')
   or (ch->>'species'='Owlin' and ch->>'subspecies'='Barn');
  expert:=coalesce(ch->'expertise','[]'::jsonb)?'Perception';
  passive:=10+mod+case when proficient then pb*case when expert then 2 else 1 end else 0 end;
 end if;

 -- Only detected/revealed traps leave the database; secret trigger/disarm/DM notes never do.
 select coalesce(jsonb_agg((x-'dmNote'-'trigger'-'disarm')||jsonb_build_object('detected',true)),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(priv->'traps','[]'::jsonb)) x
 where coalesce((x->>'revealed')::boolean,false) or coalesce((x->>'triggered')::boolean,false)
    or (coalesce((x->>'armed')::boolean,true) and coalesce((x->>'dc')::integer,10)<=passive);
 priv:=jsonb_set(priv,'{traps}',rows,true);

 select coalesce(jsonb_agg(x-'dmNote'-'secrets'),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(priv->'advancedQuests','[]'::jsonb)) x where coalesce((x->>'visible')::boolean,false);
 priv:=jsonb_set(priv,'{advancedQuests}',rows,true);
 select coalesce(jsonb_agg(x-'dmTactics'-'secrets'),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(priv->'encounters','[]'::jsonb)) x where coalesce((x->>'visible')::boolean,false);
 priv:=jsonb_set(priv,'{encounters}',rows,true);
 select coalesce(jsonb_agg(x-'dmNote'),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(priv#>'{crimes,laws}','[]'::jsonb)) x where coalesce((x->>'visible')::boolean,true);
 priv:=jsonb_set(priv,'{crimes,laws}',rows,true);
 select coalesce(jsonb_agg(x-'dmNote'),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(priv#>'{crimes,cases}','[]'::jsonb)) x
 where x->>'targetUserId'=u::text or coalesce((x->>'visible')::boolean,false);
 priv:=jsonb_set(priv,'{crimes,cases}',rows,true);
 select coalesce(jsonb_agg(x-'dmNote'),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(priv->'divine','[]'::jsonb)) x where coalesce((x->>'visible')::boolean,true);
 priv:=jsonb_set(priv,'{divine}',rows,true)-'dmNotebook';

 -- Bastion DM notes and other players' private pet notes do not cross the RPC boundary.
 pub:=jsonb_set(pub,'{bastion}',coalesce(pub->'bastion','{}'::jsonb)-'dmNotes'-'notes',true);
 select coalesce(jsonb_agg(x-'dmNote'),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(pub->'factions','[]'::jsonb)) x where coalesce((x->>'visible')::boolean,true);
 pub:=jsonb_set(pub,'{factions}',rows,true);
 select coalesce(jsonb_agg(x),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(pub->'worldEvents','[]'::jsonb)) x where coalesce((x->>'visible')::boolean,true);
 pub:=jsonb_set(pub,'{worldEvents}',rows,true);
 select coalesce(jsonb_agg(case when x->>'ownerUserId'=u::text then x-'dmNote' else x-'dmNote'-'notes' end),'[]'::jsonb) into rows
 from jsonb_array_elements(coalesce(pub->'pets','[]'::jsonb)) x
 where x->>'ownerUserId'=u::text or coalesce((x->>'public')::boolean,true);
 pub:=jsonb_set(pub,'{pets}',rows,true);

 select n.book into book from public.campaign_notebooks_v83 n where n.campaign_id=p_campaign and n.user_id=u;
 return jsonb_build_object('role','player','public',pub,'private',priv,'notebook',coalesce(book,'{"title":"Maceracının Defteri","pages":[]}'::jsonb),'passivePerception',passive);
end $$;

create or replace function public.campaign_systems_save_v83(p_session_token text,p_campaign uuid,p_public jsonb,p_private jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare u uuid:=public.v66_session_user(p_session_token);
begin
 if u is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=u and role='dm') then raise exception 'Yalnız kampanya DM’i sistemleri düzenleyebilir'; end if;
 if jsonb_typeof(coalesce(p_public,'null'::jsonb))<>'object' or jsonb_typeof(coalesce(p_private,'null'::jsonb))<>'object' then raise exception 'Kampanya sistemi verisi geçersiz'; end if;
 if octet_length(p_public::text)>3000000 or octet_length(p_private::text)>3000000 then raise exception 'Kampanya sistemi veri sınırı aşıldı'; end if;
 insert into public.campaign_systems_v83(campaign_id,public_data,private_data,updated_at)
 values(p_campaign,p_public,p_private,now())
 on conflict(campaign_id) do update set public_data=excluded.public_data,private_data=excluded.private_data,updated_at=now();
 return true;
end $$;

create or replace function public.campaign_notebook_save_v83(p_session_token text,p_campaign uuid,p_book jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare u uuid:=public.v66_session_user(p_session_token);
begin
 if u is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=u) then raise exception 'Kampanya üyeliği bulunamadı'; end if;
 if jsonb_typeof(coalesce(p_book,'null'::jsonb))<>'object' or jsonb_typeof(coalesce(p_book->'pages','null'::jsonb))<>'array' then raise exception 'Defter verisi geçersiz'; end if;
 if jsonb_array_length(p_book->'pages')>100 or octet_length(p_book::text)>1500000 then raise exception 'Defter sayfa veya dosya sınırı aşıldı'; end if;
 insert into public.campaign_notebooks_v83(campaign_id,user_id,book,updated_at) values(p_campaign,u,p_book,now())
 on conflict(campaign_id,user_id) do update set book=excluded.book,updated_at=now();
 return true;
end $$;

create or replace function public.campaign_pet_action_v83(p_session_token text,p_campaign uuid,p_action text,p_payload jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); role_name text; st jsonb; pub jsonb; pets jsonb; pet jsonb; rows jsonb; pid text; owner_character jsonb;
 amount integer:=0;
begin
 if u is null then raise exception 'Güvenli oturum bulunamadı'; end if;
 select role into role_name from public.campaign_members where campaign_id=p_campaign and user_id=u;
 if role_name is null then raise exception 'Kampanya üyeliği bulunamadı'; end if;
 select s.public_data,c.state into pub,st from public.campaign_systems_v83 s join public.campaigns c on c.id=s.campaign_id where s.campaign_id=p_campaign for update of s;
 if pub is null then raise exception 'Kampanya sistemi bulunamadı'; end if;
 pets:=coalesce(pub->'pets','[]'::jsonb);
 if p_action='create' then
  if char_length(trim(coalesce(p_payload->>'name',''))) not between 1 and 80 then raise exception 'Pet adı 1–80 karakter olmalı'; end if;
  select value into owner_character from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb))
  where value->>'id'=p_payload->>'ownerCharacterId' and (role_name='dm' or value->>'userId'=u::text) limit 1;
  if owner_character is null then raise exception 'Pet sahibi karakter bulunamadı'; end if;
  pet:=jsonb_build_object('id',gen_random_uuid()::text,'name',trim(p_payload->>'name'),'species',left(coalesce(p_payload->>'species','Bilinmeyen'),80),
   'ownerCharacterId',owner_character->>'id','ownerUserId',owner_character->>'userId','relationship',0,'training',0,
   'hp',greatest(1,least(999,coalesce((p_payload->>'hp')::integer,1))),'maxHp',greatest(1,least(999,coalesce((p_payload->>'hp')::integer,1))),
   'ac',greatest(1,least(40,coalesce((p_payload->>'ac')::integer,10))),'notes',left(coalesce(p_payload->>'notes',''),2000),'dmNote','','public',true);
  pets:=pets||jsonb_build_array(pet);
 elsif p_action in ('feed','play','train') then
  pid:=p_payload->>'id';select value into pet from jsonb_array_elements(pets) where value->>'id'=pid limit 1;
  if pet is null or (role_name<>'dm' and pet->>'ownerUserId'<>u::text) then raise exception 'Bu peti yönetme yetkin yok'; end if;
  amount:=case p_action when 'feed' then 2 when 'play' then 3 else 1 end;
  pet:=jsonb_set(pet,'{relationship}',to_jsonb(least(100,coalesce((pet->>'relationship')::integer,0)+amount)),true);
  if p_action='train' then pet:=jsonb_set(pet,'{training}',to_jsonb(least(100,coalesce((pet->>'training')::integer,0)+1)),true); end if;
  select coalesce(jsonb_agg(case when x->>'id'=pid then pet else x end),'[]'::jsonb) into rows from jsonb_array_elements(pets) x;pets:=rows;
 else raise exception 'Pet işlemi geçersiz';
 end if;
 pub:=jsonb_set(pub,'{pets}',pets,true);update public.campaign_systems_v83 set public_data=pub,updated_at=now() where campaign_id=p_campaign;
 return true;
end $$;

revoke all on function public.campaign_systems_load_v83(text,uuid) from public;
revoke all on function public.campaign_systems_save_v83(text,uuid,jsonb,jsonb) from public;
revoke all on function public.campaign_notebook_save_v83(text,uuid,jsonb) from public;
revoke all on function public.campaign_pet_action_v83(text,uuid,text,jsonb) from public;
grant execute on function public.campaign_systems_load_v83(text,uuid) to anon,authenticated;
grant execute on function public.campaign_systems_save_v83(text,uuid,jsonb,jsonb) to anon,authenticated;
grant execute on function public.campaign_notebook_save_v83(text,uuid,jsonb) to anon,authenticated;
grant execute on function public.campaign_pet_action_v83(text,uuid,text,jsonb) to anon,authenticated;
comment on table public.campaign_systems_v83 is 'Build 83 server-owned campaign hub data; direct API access is denied';
comment on table public.campaign_notebooks_v83 is 'Build 83 private per-member notebooks; only token RPC access is allowed';
comment on function public.campaign_systems_load_v83(text,uuid) is 'Role-filtered Build 83 campaign systems loader with server-side trap detection';

commit;
