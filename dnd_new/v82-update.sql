-- Build 82: DM-gated Wizard spellbook editing, preparation and Arcane Recovery.
begin;

create or replace function public.wizard_spellbook_set_v81(
 p_session_token text,p_campaign uuid,p_subclass text,p_spellbook jsonb,p_prepared jsonb,p_cantrips jsonb
) returns boolean language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); st jsonb; ch jsonb; idx integer; lvl integer; int_score integer;
 prepare_limit integer; cantrip_limit integer; learned_limit integer; max_spell_level integer; rowd jsonb; spell_id text;
 rows jsonb; old_book_ids jsonb; new_book_ids jsonb; old_prepared_ids jsonb; new_prepared_ids jsonb;
 old_cantrip_ids jsonb; new_cantrip_ids jsonb; library_changed boolean; prepared_changed boolean; initial_setup boolean;
begin
 if u is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=u and role='player') then raise exception 'Oturum veya oyuncu üyeliği geçersiz'; end if;
 if jsonb_typeof(coalesce(p_spellbook,'null'))<>'array' or jsonb_typeof(coalesce(p_prepared,'null'))<>'array' or jsonb_typeof(coalesce(p_cantrips,'null'))<>'array' then raise exception 'Wizard büyü listeleri geçersiz'; end if;
 if jsonb_array_length(p_spellbook)>200 or jsonb_array_length(p_prepared)>30 or jsonb_array_length(p_cantrips)>10 then raise exception 'Wizard büyü listesi sınırı aşıldı'; end if;
 select state into st from public.campaigns where id=p_campaign for update;
 if st is null then raise exception 'Kampanya bulunamadı'; end if;
 select entry.ordinality-1,entry.value into idx,ch
 from jsonb_array_elements(coalesce(st->'characters','[]')) with ordinality entry(value,ordinality)
 where entry.value->>'userId'=u::text limit 1;
 if idx is null or ch->>'className'<>'Wizard' then raise exception 'Hesabına bağlı Wizard bulunamadı'; end if;

 lvl:=greatest(1,least(20,coalesce((ch->>'level')::integer,1)));
 int_score:=coalesce((ch#>>'{stats,INT}')::integer,(ch#>>'{baseStats,INT}')::integer,10);
 prepare_limit:=greatest(1,lvl+floor((int_score-10)::numeric/2)::integer);
 cantrip_limit:=case when lvl>=10 then 5 when lvl>=4 then 4 else 3 end;
 learned_limit:=6+greatest(0,lvl-1)*2;
 max_spell_level:=least(9,(lvl+1)/2);
initial_setup:=coalesce(ch->>'wizardSpellbookVersion','')='';
rows:=coalesce(ch->'resources','{}');
 if initial_setup and exists(select 1 from jsonb_array_elements(p_spellbook) x where coalesce(x->>'source','level')='copied') then raise exception 'İlk Wizard kurulumunda kopya büyü eklenemez'; end if;

 select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into old_book_ids
 from (select distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','') id from jsonb_array_elements(coalesce(ch->'spellbookSpells','[]')) x) q where id<>'';
 select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into new_book_ids
 from (select distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','') id from jsonb_array_elements(p_spellbook) x) q where id<>'';
 select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into old_cantrip_ids
 from (
  select distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','') id
  from jsonb_array_elements(coalesce(ch->'preparedSpells','[]')) x
  join public.adventure_rules_v74 ar on ar.id='spell:'||replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','')
  where coalesce((ar.data->>'level')::integer,-1)=0
 ) q where id<>'';
 select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into new_cantrip_ids
 from (select distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','') id from jsonb_array_elements(p_cantrips) x) q where id<>'';
 select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into old_prepared_ids
 from (
  select distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','') id
  from jsonb_array_elements(coalesce(ch->'preparedSpells','[]')) x
  join public.adventure_rules_v74 ar on ar.id='spell:'||replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','')
  where coalesce((ar.data->>'level')::integer,-1)>0
 ) q where id<>'';
 select coalesce(jsonb_agg(id order by id),'[]'::jsonb) into new_prepared_ids
 from (select distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','') id from jsonb_array_elements(p_prepared) x) q where id<>'';

 library_changed:=old_book_ids<>new_book_ids or old_cantrip_ids<>new_cantrip_ids;
 prepared_changed:=old_prepared_ids<>new_prepared_ids;
 if library_changed and not initial_setup and coalesce((rows->>'v82_spellbook_edit_ready')::integer,0)<1 then raise exception 'Büyü kitabı ve cantrip düzenlemesini önce DM açmalı'; end if;
 if prepared_changed and not initial_setup and coalesce((rows->>'v82_prepare_ready')::integer,0)<1 then raise exception 'Hazırlanan büyüler yalnız uzun dinlenmeden sonra değiştirilebilir'; end if;

 if coalesce(ch->>'subclass','')<>'' and trim(coalesce(p_subclass,''))<>ch->>'subclass' then raise exception 'Wizard geleneği kilitli; yalnız DM değiştirebilir'; end if;
 if lvl>=2 and trim(coalesce(p_subclass,''))='' then raise exception 'Wizard geleneği seçilmedi'; end if;
 if jsonb_array_length(p_prepared)>prepare_limit then raise exception 'Hazırlanan büyü sınırı %',prepare_limit; end if;
 if jsonb_array_length(p_cantrips)>cantrip_limit then raise exception 'Cantrip sınırı %',cantrip_limit; end if;
 if (select count(*) from jsonb_array_elements(p_spellbook) x where coalesce(x->>'source','legacy')<>'copied')>learned_limit then raise exception 'Seviye kazanımı büyü kotası %',learned_limit; end if;
 if (select count(distinct replace(coalesce(x->>'id',x->>'sourceId',''),'v47-','')) from jsonb_array_elements(p_spellbook) x)<>jsonb_array_length(p_spellbook) then raise exception 'Büyü kitabında yinelenen kayıt var'; end if;
 for rowd in select value from jsonb_array_elements(p_spellbook) loop
  spell_id:=replace(coalesce(rowd->>'id',rowd->>'sourceId',''),'v47-','');
  if spell_id='' or not exists(select 1 from public.adventure_rules_v74 where id='spell:'||spell_id and coalesce((data->>'level')::integer,0) between 1 and max_spell_level) then raise exception 'Kitap büyüsü geçersiz: %',spell_id; end if;
 end loop;
 for rowd in select value from jsonb_array_elements(p_prepared) loop
  spell_id:=replace(coalesce(rowd->>'id',rowd->>'sourceId',''),'v47-','');
  if not exists(select 1 from public.adventure_rules_v74 where id='spell:'||spell_id and coalesce((data->>'level')::integer,0) between 1 and max_spell_level) then raise exception 'Hazırlanan büyü geçersiz: %',spell_id; end if;
  if not exists(select 1 from jsonb_array_elements(p_spellbook) b where replace(coalesce(b->>'id',b->>'sourceId',''),'v47-','')=spell_id) then raise exception 'Hazırlanan büyü kitapta değil: %',spell_id; end if;
 end loop;
 for rowd in select value from jsonb_array_elements(p_cantrips) loop
  spell_id:=replace(coalesce(rowd->>'id',rowd->>'sourceId',''),'v47-','');
  if spell_id='' or not exists(select 1 from public.adventure_rules_v74 where id='spell:'||spell_id and coalesce((data->>'level')::integer,-1)=0) then raise exception 'Cantrip geçersiz: %',spell_id; end if;
 end loop;

 if library_changed then rows:=rows-'v82_spellbook_edit_ready'; end if;
 if prepared_changed then rows:=rows-'v82_prepare_ready'; end if;
 ch:=jsonb_set(ch,'{resources}',rows,true);
 ch:=jsonb_set(ch,'{subclass}',to_jsonb(trim(coalesce(nullif(p_subclass,''),ch->>'subclass',''))),true);
 ch:=jsonb_set(ch,'{spellbookSpells}',p_spellbook,true);
 ch:=jsonb_set(ch,'{preparedSpells}',p_cantrips||p_prepared,true);
 ch:=jsonb_set(ch,'{wizardSpellbookVersion}','82'::jsonb,true);
 st:=public.v74_put_character(st,ch);
 update public.campaigns set state=st,updated_at=now() where id=p_campaign;
 return true;
end $$;

create or replace function public.wizard_rest_v82(p_session_token text,p_campaign uuid,p_character text,p_kind text)
returns boolean language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); st jsonb; ch jsonb; idx integer; lvl integer; cfg jsonb; rows jsonb; x jsonb; d jsonb;
begin
 if u is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=u and role='dm') then raise exception 'Yalnız kampanya DM’i dinlenmeyi tamamlayabilir'; end if;
 if p_kind not in ('short','long') then raise exception 'Dinlenme türü geçersiz'; end if;
 select state into st from public.campaigns where id=p_campaign for update;
 if st is null then raise exception 'Kampanya bulunamadı'; end if;
 select entry.ordinality-1,entry.value into idx,ch
 from jsonb_array_elements(coalesce(st->'characters','[]')) with ordinality entry(value,ordinality)
 where entry.value->>'id'=p_character limit 1;
 if idx is null or ch->>'className'<>'Wizard' then raise exception 'Wizard karakter bulunamadı'; end if;
 lvl:=greatest(1,least(20,coalesce((ch->>'level')::integer,1)));
 select data into cfg from public.adventure_rules_v74 where id='class:Wizard:'||lvl;
 rows:=coalesce(ch->'resources','{}');
 for x in select value from jsonb_array_elements(coalesce(cfg->'resources','[]')) loop
  if p_kind='long' or x->>'rest'='short' then rows:=rows-(x->>'id'); end if;
 end loop;
 if p_kind='long' then
  rows:=rows-'v74_recovery'-'v82_arcane_recovery_ready';
  rows:=rows||jsonb_build_object('v82_prepare_ready',1);
  ch:=jsonb_set(ch,'{spellSlotsUsed}','{}'::jsonb,true);
 else
  if coalesce((rows->>'v74_recovery')::integer,0)<1 then rows:=rows||jsonb_build_object('v82_arcane_recovery_ready',1); end if;
 end if;
 ch:=jsonb_set(ch,'{resources}',rows,true);
 st:=public.v74_put_character(st,ch);
 update public.campaigns set state=st,updated_at=now() where id=p_campaign;
 insert into public.campaign_tools_v74(campaign_id,data) values(p_campaign,'{}') on conflict(campaign_id) do nothing;
 select data into d from public.campaign_tools_v74 where campaign_id=p_campaign for update;
 d:=jsonb_set(coalesce(d,'{}'),'{log}',jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'userId',ch->>'userId','text',(ch->>'name')||' · '||case when p_kind='short' then 'kısa' else 'uzun' end||' dinlenme tamamlandı','createdAt',now(),'public',true))||coalesce(d->'log','[]'),true);
 update public.campaign_tools_v74 set data=d,updated_at=now() where campaign_id=p_campaign;
 return true;
end $$;

create or replace function public.wizard_spellbook_unlock_v82(p_session_token text,p_campaign uuid,p_character text)
returns boolean language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); st jsonb; ch jsonb; idx integer; rows jsonb;
begin
 if u is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=u and role='dm') then raise exception 'Yalnız kampanya DM’i kitap düzenlemesini açabilir'; end if;
 select state into st from public.campaigns where id=p_campaign for update;
 if st is null then raise exception 'Kampanya bulunamadı'; end if;
 select entry.ordinality-1,entry.value into idx,ch
 from jsonb_array_elements(coalesce(st->'characters','[]')) with ordinality entry(value,ordinality)
 where entry.value->>'id'=p_character limit 1;
 if idx is null or ch->>'className'<>'Wizard' then raise exception 'Wizard karakter bulunamadı'; end if;
 rows:=coalesce(ch->'resources','{}')||jsonb_build_object('v82_spellbook_edit_ready',1);
 ch:=jsonb_set(ch,'{resources}',rows,true);
 st:=public.v74_put_character(st,ch);
 update public.campaigns set state=st,updated_at=now() where id=p_campaign;
 return true;
end $$;

create or replace function public.wizard_arcane_recovery_v81(p_session_token text,p_campaign uuid,p_recovery jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare
 u uuid:=public.v66_session_user(p_session_token); st jsonb; ch jsonb; idx integer; lvl integer; budget integer; spent integer:=0;
 pair record; slot_level integer; amount integer; used integer; rows jsonb;
begin
 if u is null or not exists(select 1 from public.campaign_members where campaign_id=p_campaign and user_id=u and role='player') then raise exception 'Oturum veya oyuncu üyeliği geçersiz'; end if;
 if jsonb_typeof(coalesce(p_recovery,'null'))<>'object' then raise exception 'Arcane Recovery seçimi geçersiz'; end if;
 select state into st from public.campaigns where id=p_campaign for update;
 if st is null then raise exception 'Kampanya bulunamadı'; end if;
 select entry.ordinality-1,entry.value into idx,ch
 from jsonb_array_elements(coalesce(st->'characters','[]')) with ordinality entry(value,ordinality)
 where entry.value->>'userId'=u::text limit 1;
 if idx is null or ch->>'className'<>'Wizard' then raise exception 'Hesabına bağlı Wizard bulunamadı'; end if;
 rows:=coalesce(ch->'resources','{}');
 if coalesce((rows->>'v74_recovery')::integer,0)>0 then raise exception 'Arcane Recovery uzun dinlenmeden önce tekrar kullanılamaz'; end if;
 if coalesce((rows->>'v82_arcane_recovery_ready')::integer,0)<1 then raise exception 'Arcane Recovery için önce DM kısa dinlenmeyi tamamlamalı'; end if;
 lvl:=greatest(1,least(20,coalesce((ch->>'level')::integer,1)));
 budget:=ceil(lvl::numeric/2)::integer;
 for pair in select key,value from jsonb_each_text(p_recovery) loop
  if pair.key!~'^[1-5]$' or pair.value!~'^[0-9]+$' then raise exception 'Yalnız 1–5. seviye slotlar geri alınabilir'; end if;
  slot_level:=pair.key::integer;amount:=pair.value::integer;used:=coalesce((ch#>>array['spellSlotsUsed',pair.key])::integer,0);
  if amount<0 or amount>used then raise exception '% seviyesinde geri kazanım harcanmış slottan fazla',slot_level; end if;
  spent:=spent+slot_level*amount;
  ch:=jsonb_set(ch,array['spellSlotsUsed',pair.key],to_jsonb(used-amount),true);
 end loop;
 if spent<1 or spent>budget then raise exception 'Arcane Recovery bütçesi %; seçilen %',budget,spent; end if;
 rows:=(rows-'v82_arcane_recovery_ready')||jsonb_build_object('v74_recovery',1);
 ch:=jsonb_set(ch,'{resources}',rows,true);
 st:=public.v74_put_character(st,ch);
 update public.campaigns set state=st,updated_at=now() where id=p_campaign;
 return true;
end $$;

revoke all on function public.wizard_spellbook_set_v81(text,uuid,text,jsonb,jsonb,jsonb) from public;
revoke all on function public.wizard_rest_v82(text,uuid,text,text) from public;
revoke all on function public.wizard_spellbook_unlock_v82(text,uuid,text) from public;
revoke all on function public.wizard_arcane_recovery_v81(text,uuid,jsonb) from public;
grant execute on function public.wizard_spellbook_set_v81(text,uuid,text,jsonb,jsonb,jsonb) to anon,authenticated;
grant execute on function public.wizard_rest_v82(text,uuid,text,text) to anon,authenticated;
grant execute on function public.wizard_spellbook_unlock_v82(text,uuid,text) to anon,authenticated;
grant execute on function public.wizard_arcane_recovery_v81(text,uuid,jsonb) to anon,authenticated;
comment on function public.wizard_spellbook_set_v81(text,uuid,text,jsonb,jsonb,jsonb) is 'Build 82: rest and DM-gated player Wizard spell persistence';
comment on function public.wizard_rest_v82(text,uuid,text,text) is 'Build 82: DM-owned Wizard short and long rest transition';
comment on function public.wizard_spellbook_unlock_v82(text,uuid,text) is 'Build 82: one-use DM Wizard library edit authorization';
comment on function public.wizard_arcane_recovery_v81(text,uuid,jsonb) is 'Build 82: short-rest-gated once-per-long-rest Wizard slot recovery';

commit;
