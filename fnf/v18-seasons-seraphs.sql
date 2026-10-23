-- Six 20-day seasons. World generation, parcels, old farm plots and the day log
-- all use the same deterministic clock; existing worlds keep their current day.
create or replace function fnf_private.current_season(p_day integer)
returns text language sql immutable set search_path='' as $$
  select (array['Bahar','Yaz','Güz','Kış','Gümüş Sis','Yıldız Dönemi'])[1+(((p_day-1)/20)%6)];
$$;
revoke all on function fnf_private.current_season(integer) from public,anon,authenticated;

do $migration$
declare f regprocedure; body text; old_text text; new_text text;
begin
  for f,old_text,new_text in
    select * from (values
      ('fnf_private.sim_snapshot(uuid)'::regprocedure,
       '(array[''Bahar'',''Yaz'',''Güz'',''Kış''])[1+(((d-1)/20)%4)]',
       'fnf_private.current_season(d)'),
      ('fnf_private.sim_action(uuid,text,jsonb)'::regprocedure,
       '(array[''Bahar'',''Yaz'',''Güz'',''Kış''])[1+(((w.day-1)/20)%4)]',
       'fnf_private.current_season(w.day)'),
      ('fnf_private.advance_day(uuid)'::regprocedure,
       '(array[''Bahar'',''Yaz'',''Güz'',''Kış''])[1+(((d-1)/20)%4)]',
       'fnf_private.current_season(d)'),
      ('fnf_private.advance_day(uuid)'::regprocedure,
       '(array[''Bahar'',''Yaz'',''Güz'',''Kış''])[1+(((w.day-1)/20)%4)]',
       'fnf_private.current_season(w.day)'),
      ('fnf_private.parcel_action(uuid,text,jsonb)'::regprocedure,
       '(array[''Bahar'',''Yaz'',''Güz'',''Kış''])[1+(((w.day-1)/20)%4)]',
       'fnf_private.current_season(w.day)'),
      ('fnf_private.advance_parcels()'::regprocedure,
       '(array[''Bahar'',''Yaz'',''Güz'',''Kış''])[1+(((old.day-1)/20)%4)]',
       'fnf_private.current_season(old.day)'),
      ('fnf_private.restore_room_v05(jsonb,text)'::regprocedure,
       'jsonb_array_length(p_backup->''stock'')>100',
       'jsonb_array_length(p_backup->''stock'')>300'),
      ('fnf_private.restore_room(jsonb,text)'::regprocedure,
       'jsonb_array_length(v->''reveals'')>13',
       'jsonb_array_length(v->''reveals'')>32')
    ) replacements(proc,needle,replacement)
  loop
    body:=pg_get_functiondef(f);
    if strpos(body,old_text)=0 then
      raise exception 'Expected migration marker missing in %: %', f,old_text;
    end if;
    execute replace(body,old_text,new_text);
  end loop;

  body:=pg_get_functiondef('fnf_private.advance_day(uuid)'::regprocedure);
  if strpos(body,'when ''Güz'' then 13 else 3 end')=0 then
    raise exception 'Temperature season marker missing';
  end if;
  execute replace(body,'when ''Güz'' then 13 else 3 end',
    'when ''Güz'' then 13 when ''Gümüş Sis'' then 10 when ''Yıldız Dönemi'' then 21 else 3 end');

  body:=pg_get_functiondef('fnf_private.parcel_action(uuid,text,jsonb)'::regprocedure);
  if strpos(body,'case when k.id=''seed_01'' then ''{grain}''::text[] else ''{food}''::text[] end')=0 then
    raise exception 'Harvest marker missing';
  end if;
  body:=replace(body,'case when k.id=''seed_01'' then ''{grain}''::text[] else ''{food}''::text[] end',
    'array[coalesce(k.yield_resource,''food'')]');
  body:=replace(body,'case when k.id=''seed_01'' then ''grain'' else ''food'' end',
    'coalesce(k.yield_resource,''food'')');
  execute body;

  body:=pg_get_functiondef('fnf_private.snapshot(uuid)'::regprocedure);
  if strpos(body,'''growth_days'',case when dm or r.conditions_open then c.growth_days end')=0 then
    raise exception 'Codex snapshot marker missing';
  end if;
  execute replace(body,
    '''growth_days'',case when dm or r.conditions_open then c.growth_days end',
    '''growth_days'',case when dm or r.conditions_open then c.growth_days end,
       ''plant_id'',case when dm or r.identity_open then c.plant_id end,
       ''yield_resource'',case when dm or r.conditions_open then c.yield_resource end,
       ''is_magic'',case when dm or r.identity_open then c.is_magic end');
end;$migration$;

update public.fnf_day_log set season=fnf_private.current_season(day)
where season is distinct from fnf_private.current_season(day);

-- Seraphs mediate the source and four archangels. Room aliases and unlocks
-- remain independent, and restored saves can hold the new entries.
alter table fnf_private.divine_catalog drop constraint divine_catalog_rank_check;
alter table fnf_private.divine_catalog add constraint divine_catalog_rank_check
  check(rank in ('source','seraph','archangel','messenger'));
update fnf_private.divine_catalog set sort_order=sort_order+100;
insert into fnf_private.divine_catalog(id,parent_id,rank,sort_order,name,domain,lore) values
('seraph_dawn','source','seraph',10,'Altı Kanatlı Nûr','Doğuş ve bereket','Sis dağılmadan önce tohumun içinde saklı olasılığı gözeten seraf.'),
('seraph_horizon','source','seraph',20,'Serabın Ötesi','Ufuk ve seçim','Gerçek yol ile göz aldanmasını ayıran, yüksek yolları gözleyen seraf.'),
('seraph_echo','source','seraph',30,'Sessiz Hâle','Hatıra ve süreklilik','Kaybolmuş adların izini ve yeniden yeşeren soyları taşıyan seraf.');
update fnf_private.divine_catalog set
  parent_id=case id when 'arch_earth' then 'seraph_dawn' when 'arch_season' then 'seraph_dawn'
    when 'arch_path' then 'seraph_horizon' when 'arch_memory' then 'seraph_echo' else parent_id end,
  sort_order=case id
    when 'source' then 1 when 'arch_earth' then 11 when 'herald_root' then 12
    when 'herald_harvest' then 13 when 'arch_season' then 14 when 'herald_rain' then 15
    when 'herald_winter' then 16 when 'arch_path' then 21 when 'herald_crossing' then 22
    when 'herald_compass' then 23 when 'arch_memory' then 31 when 'herald_echo' then 32
    when 'herald_seed' then 33 else sort_order end
where id not like 'seraph_%';
insert into public.fnf_divine_reveals(room_id,entity_id)
select r.id,d.id from public.fnf_rooms r cross join fnf_private.divine_catalog d
on conflict(room_id,entity_id) do nothing;
