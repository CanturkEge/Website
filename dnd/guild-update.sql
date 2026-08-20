-- Kadim Masa Defteri v26 — Lonca üyeliği, ortak para ve ortak eşya hareketleri.
-- Mevcut kampanya/karakter/lonca envanterini silmez. Tekrar çalıştırılabilir.

create or replace function public.guild_manage_v26(p_user uuid,p_campaign uuid,p_action text,p_value text default '')
returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare st jsonb; g jsonb; code text; ci integer; members_json jsonb;
begin
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user) then raise exception 'Bu kampanyanın üyesi değilsin'; end if;
 select c.state into st from campaigns c where c.id=p_campaign for update;
 g:=st->'guild';
 if p_action='create' then
  if g is not null and g<>'null'::jsonb then raise exception 'Bu kampanyada zaten lonca var'; end if;
  if length(trim(p_value))<2 then raise exception 'Lonca adı çok kısa'; end if;
  code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  g:=jsonb_build_object('name',left(trim(p_value),80),'code',code,'ownerUserId',p_user,'members',jsonb_build_array(p_user::text),'createdAt',now());
 elsif p_action='join' then
  if g is null or g='null'::jsonb then raise exception 'Henüz lonca kurulmadı'; end if;
  if upper(trim(p_value))<>upper(g->>'code') then raise exception 'Lonca kodu yanlış'; end if;
  members_json:=coalesce(g->'members','[]'::jsonb);
  if not members_json ? p_user::text then members_json:=members_json||jsonb_build_array(p_user::text); end if;
  g:=jsonb_set(g,'{members}',members_json,true);
 elsif p_action='leave' then
  if g is null or g='null'::jsonb then raise exception 'Lonca yok'; end if;
  select coalesce(jsonb_agg(value),'[]'::jsonb) into members_json from jsonb_array_elements(coalesce(g->'members','[]'::jsonb)) x(value) where trim(both '"' from value::text)<>p_user::text;
  g:=jsonb_set(g,'{members}',members_json,true);
 else raise exception 'Geçersiz lonca işlemi'; end if;
 st:=jsonb_set(st,'{guild}',g,true);
 select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
 if ci is not null then st:=jsonb_set(st,array['characters',ci::text,'guild'],to_jsonb(case when p_action='leave' then '' else g->>'name' end),true); end if;
 update campaigns set state=st,updated_at=now() where id=p_campaign; return true;
end $$;

create or replace function public.guild_wallet_move_v26(p_user uuid,p_campaign uuid,p_coin text,p_amount integer,p_direction text)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; g jsonb; mult bigint; player_total bigint; guild_total bigint;
begin
 if p_amount<1 or p_coin not in ('platinum','gold','silver','copper') or p_direction not in ('deposit','withdraw') then raise exception 'Geçersiz para işlemi'; end if;
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Oyuncu değilsin'; end if;
 select c.state into st from campaigns c where c.id=p_campaign for update;
 g:=st->'guild'; if g is null or not(coalesce(g->'members','[]'::jsonb) ? p_user::text) then raise exception 'Lonca üyesi değilsin'; end if;
 mult:=case p_coin when 'platinum' then 1000 when 'gold' then 100 when 'silver' then 10 else 1 end;
 insert into campaign_wallets(campaign_id,user_id) values(p_campaign,p_user) on conflict do nothing;
 insert into guild_wallets(campaign_id) values(p_campaign) on conflict do nothing;
 select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into player_total from campaign_wallets where campaign_id=p_campaign and user_id=p_user for update;
 select platinum*1000::bigint+gold*100::bigint+silver*10::bigint+copper into guild_total from guild_wallets where campaign_id=p_campaign for update;
 if p_direction='deposit' then
  if player_total<p_amount*mult then raise exception 'Kişisel kesende yeterli para yok'; end if;
  player_total:=player_total-p_amount*mult; guild_total:=guild_total+p_amount*mult;
 else
  if guild_total<p_amount*mult then raise exception 'Lonca kasasında yeterli para yok'; end if;
  guild_total:=guild_total-p_amount*mult; player_total:=player_total+p_amount*mult;
 end if;
 update campaign_wallets set platinum=(player_total/1000)::integer,gold=((player_total%1000)/100)::integer,silver=((player_total%100)/10)::integer,copper=(player_total%10)::integer,updated_at=now() where campaign_id=p_campaign and user_id=p_user;
 update guild_wallets set platinum=(guild_total/1000)::integer,gold=((guild_total%1000)/100)::integer,silver=((guild_total%100)/10)::integer,copper=(guild_total%10)::integer,updated_at=now() where campaign_id=p_campaign;
 return true;
end $$;

create or replace function public.guild_inventory_move_v26(p_user uuid,p_campaign uuid,p_direction text,p_item_index integer,p_quantity integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; g jsonb; ci integer; source jsonb; target jsonb; item jsonb; moved jsonb; available integer; remaining integer;
begin
 if p_direction not in ('deposit','withdraw') or p_item_index<0 or p_quantity<1 then raise exception 'Geçersiz eşya işlemi'; end if;
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Oyuncu değilsin'; end if;
 select c.state into st from campaigns c where c.id=p_campaign for update;
 g:=st->'guild'; if g is null or not(coalesce(g->'members','[]'::jsonb) ? p_user::text) then raise exception 'Lonca üyesi değilsin'; end if;
 select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
 if ci is null then raise exception 'Karakterin bulunamadı'; end if;
 if p_direction='deposit' then source:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb); target:=coalesce(st->'guildInventory','[]'::jsonb);
 else source:=coalesce(st->'guildInventory','[]'::jsonb); target:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb); end if;
 if p_item_index>=jsonb_array_length(source) then raise exception 'Eşya artık burada değil'; end if;
 item:=source->p_item_index; available:=greatest(1,coalesce((item->>'qty')::integer,1)); if p_quantity>available then raise exception 'Bu kadar eşya yok'; end if;
 remaining:=available-p_quantity; moved:=jsonb_set(item,'{qty}',to_jsonb(p_quantity),true);
 if p_direction='deposit' then moved:=jsonb_set(moved,'{equipped}','false'::jsonb,true); end if;
 if remaining=0 then source:=source-p_item_index; else source:=jsonb_set(source,array[p_item_index::text,'qty'],to_jsonb(remaining),true); end if;
 target:=target||jsonb_build_array(moved);
 if p_direction='deposit' then st:=jsonb_set(st,array['characters',ci::text,'inventory'],source,true); st:=jsonb_set(st,'{guildInventory}',target,true);
 else st:=jsonb_set(st,'{guildInventory}',source,true); st:=jsonb_set(st,array['characters',ci::text,'inventory'],target,true); end if;
 update campaigns set state=st,updated_at=now() where id=p_campaign; return true;
end $$;

revoke all on function public.guild_manage_v26(uuid,uuid,text,text),public.guild_wallet_move_v26(uuid,uuid,text,integer,text),public.guild_inventory_move_v26(uuid,uuid,text,integer,integer) from public;
grant execute on function public.guild_manage_v26(uuid,uuid,text,text),public.guild_wallet_move_v26(uuid,uuid,text,integer,text),public.guild_inventory_move_v26(uuid,uuid,text,integer,integer) to anon,authenticated;
