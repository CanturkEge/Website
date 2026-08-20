-- v30: Oyuncunun yalnız kendi karakterinin build/proficiency/ASI seçimlerini kaydetmesi.
-- Mevcut karakter veya kampanya verilerini silmez.
create or replace function public.character_build_set_v30(p_user uuid,p_campaign uuid,p_character text,p_build jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; ch jsonb; caller_role text; safe jsonb;
begin
 select role into caller_role from campaign_members where campaign_id=p_campaign and user_id=p_user;
 if caller_role is null then raise exception 'Bu kampanyaya üye değilsin'; end if;
 select state into st from campaigns where id=p_campaign for update;
 select (e.ordinality-1)::integer,e.value into ci,ch from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'id'=p_character limit 1;
 if ci is null then raise exception 'Karakter bulunamadı'; end if;
 if caller_role<>'dm' and ch->>'userId'<>p_user::text then raise exception 'Yalnız kendi karakterini düzenleyebilirsin'; end if;
 safe:=jsonb_build_object('background',left(coalesce(p_build->>'background','Acolyte'),60),'classSkillChoices',coalesce(p_build->'classSkillChoices','[]'::jsonb),'bonusSkillChoices',coalesce(p_build->'bonusSkillChoices','[]'::jsonb),'expertise',coalesce(p_build->'expertise','[]'::jsonb),'asiAllocations',coalesce(p_build->'asiAllocations','{}'::jsonb),'feats',coalesce(p_build->'feats','[]'::jsonb));
 ch:=ch||safe; st:=jsonb_set(st,array['characters',ci::text],ch,true);
 update campaigns set state=st,updated_at=now() where id=p_campaign; return true;
end $$;
revoke all on function public.character_build_set_v30(uuid,uuid,text,jsonb) from public;
grant execute on function public.character_build_set_v30(uuid,uuid,text,jsonb) to anon,authenticated;
