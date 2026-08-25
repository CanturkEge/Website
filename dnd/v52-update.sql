-- Kadim Masa Defteri v52
-- Oyuncunun Cleric tanrı + domain seçimini tek kilitli işlemde kaydeder.
-- Veri silmez; mevcut character_choices_set ve v31 kayıt birleştirme hattını değiştirmez.

create or replace function public.character_choices_set_v52(
  p_user uuid,
  p_campaign uuid,
  p_subclass text,
  p_subspecies text,
  p_spells jsonb,
  p_deity_id text
)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  st jsonb;
  idx integer;
  ch jsonb;
  lvl integer;
  domain_name text:=trim(coalesce(p_subclass,''));
  deity_key text:=trim(coalesce(p_deity_id,''));
  allowed_domains text[];
begin
  if not exists(
    select 1 from campaign_members
    where campaign_id=p_campaign and user_id=p_user and role='player'
  ) then
    raise exception 'Bu kampanyada oyuncu değilsin';
  end if;

  select state into st from campaigns where id=p_campaign for update;
  if st is null then raise exception 'Kampanya bulunamadı'; end if;

  select (entry.ordinality-1)::integer,entry.value into idx,ch
  from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality entry(value,ordinality)
  where entry.value->>'userId'=p_user::text
  limit 1;

  if idx is null then raise exception 'Hesabına bağlı karakter yok'; end if;
  if coalesce(ch->>'className','')<>'Cleric' then raise exception 'Tanrı/domain seçimi yalnız Cleric içindir'; end if;

  lvl:=greatest(1,coalesce((ch->>'level')::integer,1));
  if lvl<1 then raise exception 'Cleric domaini 1. seviyede açılır'; end if;
  if deity_key='' then raise exception 'Ana tanrı seçilmedi'; end if;
  if domain_name='' then raise exception 'İlahi Alan seçilmedi'; end if;
  if jsonb_typeof(coalesce(p_spells,'[]'::jsonb))<>'array' then raise exception 'Hazırlanmış büyü listesi geçersiz'; end if;

  allowed_domains:=case deity_key
    when 'fr-auril' then array['Nature','Tempest','Twilight']
    when 'fr-azuth' then array['Knowledge','Arcana']
    when 'fr-bane' then array['War','Order']
    when 'fr-beshaba' then array['Trickery']
    when 'fr-bhaal' then array['Death','Grave']
    when 'fr-chauntea' then array['Life','Nature','Peace']
    when 'fr-cyric' then array['Trickery','Death']
    when 'fr-eldath' then array['Life','Nature','Peace']
    when 'fr-gond' then array['Knowledge','Forge']
    when 'fr-helm' then array['Life','Light','Order','Twilight']
    when 'fr-ilmater' then array['Life','Peace']
    when 'fr-kelemvor' then array['Death','Grave']
    when 'fr-lathander' then array['Life','Light','Peace']
    when 'fr-loviatar' then array['Death','Order']
    when 'fr-malar' then array['Nature','War']
    when 'fr-mask' then array['Trickery']
    when 'fr-mielikki' then array['Nature','Life']
    when 'fr-myrkul' then array['Death','Grave']
    when 'fr-mystra' then array['Knowledge','Arcana']
    when 'fr-oghma' then array['Knowledge']
    when 'fr-selune' then array['Knowledge','Life','Twilight']
    when 'fr-shar' then array['Death','Trickery','Twilight']
    when 'fr-silvanus' then array['Nature']
    when 'fr-sune' then array['Life','Light','Peace']
    when 'fr-talona' then array['Death','Grave']
    when 'fr-talos' then array['Tempest','War']
    when 'fr-tempus' then array['War']
    when 'fr-torm' then array['War','Order']
    when 'fr-tymora' then array['Trickery']
    when 'fr-tyr' then array['War','Order']
    else null
  end;

  if allowed_domains is null then raise exception 'Cleric seçim listesinde olmayan tanrı'; end if;
  if not (domain_name=any(allowed_domains)) then raise exception 'Bu domain seçilen tanrının portfolio alanıyla eşleşmiyor'; end if;

  if coalesce(ch->>'subclass','')<>'' and domain_name<>ch->>'subclass' then
    raise exception 'Domain seçimi kilitli; yalnızca DM değiştirebilir';
  end if;
  if coalesce(ch->>'deityId','')<>'' and deity_key<>ch->>'deityId' then
    raise exception 'Tanrı seçimi kilitli; yalnızca DM değiştirebilir';
  end if;

  st:=jsonb_set(st,array['characters',idx::text,'subclass'],to_jsonb(domain_name),true);
  st:=jsonb_set(st,array['characters',idx::text,'deityId'],to_jsonb(deity_key),true);
  st:=jsonb_set(st,array['characters',idx::text,'preparedSpells'],coalesce(p_spells,'[]'::jsonb),true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end
$$;

revoke all on function public.character_choices_set_v52(uuid,uuid,text,text,jsonb,text) from public;
grant execute on function public.character_choices_set_v52(uuid,uuid,text,text,jsonb,text) to anon,authenticated;

comment on function public.character_choices_set_v52(uuid,uuid,text,text,jsonb,text)
is 'v52: player-owned Cleric deity/domain selection with locked canonical compatibility';
