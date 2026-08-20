-- Kadim Masa Defteri v24: tam eşya verisiyle oyuncu/lonca/yer transferi.
-- Mevcut kampanya ve envanterleri silmez.

create or replace function public.inventory_move(p_user uuid,p_campaign uuid,p_item_index integer,p_quantity integer,p_destination text,p_target uuid default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; source_idx integer; target_idx integer; inv jsonb; target_inv jsonb; item jsonb; moved jsonb; available integer; remaining integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if p_item_index<0 or p_quantity<1 then raise exception 'Geçersiz eşya veya miktar'; end if;
  if p_destination not in ('ground','guild','player') then raise exception 'Geçersiz hedef'; end if;
  select c.state into st from campaigns c where c.id=p_campaign for update;
  select (e.ordinality-1)::integer into source_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if source_idx is null then raise exception 'Karakterin bulunamadı'; end if;
  inv:=coalesce(st#>array['characters',source_idx::text,'inventory'],'[]'::jsonb);
  if p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya artık envanterde değil'; end if;
  item:=inv->p_item_index; available:=greatest(1,coalesce((item->>'qty')::integer,1));
  if p_quantity>available then raise exception 'Bu kadar eşyan yok'; end if;
  remaining:=available-p_quantity; moved:=jsonb_set(item,'{qty}',to_jsonb(p_quantity),true);
  if remaining=0 then inv:=inv-p_item_index; else inv:=jsonb_set(inv,array[p_item_index::text,'qty'],to_jsonb(remaining),true); end if;
  st:=jsonb_set(st,array['characters',source_idx::text,'inventory'],inv,true);
  if p_destination='guild' then
    target_inv:=coalesce(st->'guildInventory','[]'::jsonb)||jsonb_build_array(moved);
    st:=jsonb_set(st,'{guildInventory}',target_inv,true);
  elsif p_destination='ground' then
    moved:=moved||jsonb_build_object('groundId',gen_random_uuid(),'droppedBy',p_user,'droppedAt',now());
    target_inv:=coalesce(st->'groundLoot','[]'::jsonb)||jsonb_build_array(moved);
    st:=jsonb_set(st,'{groundLoot}',target_inv,true);
  else
    if p_target is null or p_target=p_user then raise exception 'Geçerli başka bir oyuncu seç'; end if;
    if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_target and role='player') then raise exception 'Alıcı bu kampanyada değil'; end if;
    select (e.ordinality-1)::integer into target_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_target::text limit 1;
    if target_idx is null then raise exception 'Alıcının karakteri yok'; end if;
    target_inv:=coalesce(st#>array['characters',target_idx::text,'inventory'],'[]'::jsonb)||jsonb_build_array(moved);
    st:=jsonb_set(st,array['characters',target_idx::text,'inventory'],target_inv,true);
  end if;
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

create or replace function public.inventory_take_ground(p_user uuid,p_campaign uuid,p_ground_index integer,p_quantity integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; char_idx integer; ground jsonb; inv jsonb; item jsonb; moved jsonb; available integer; remaining integer;
begin
  if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
  if p_ground_index<0 or p_quantity<1 then raise exception 'Geçersiz eşya veya miktar'; end if;
  select c.state into st from campaigns c where c.id=p_campaign for update;
  select (e.ordinality-1)::integer into char_idx from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
  if char_idx is null then raise exception 'Karakterin bulunamadı'; end if;
  ground:=coalesce(st->'groundLoot','[]'::jsonb);
  if p_ground_index>=jsonb_array_length(ground) then raise exception 'Eşya artık yerde değil'; end if;
  item:=ground->p_ground_index; available:=greatest(1,coalesce((item->>'qty')::integer,1));
  if p_quantity>available then raise exception 'Yerde bu kadar eşya yok'; end if;
  remaining:=available-p_quantity; moved:=(item-'groundId'-'droppedBy'-'droppedAt')||jsonb_build_object('qty',p_quantity);
  if remaining=0 then ground:=ground-p_ground_index; else ground:=jsonb_set(ground,array[p_ground_index::text,'qty'],to_jsonb(remaining),true); end if;
  inv:=coalesce(st#>array['characters',char_idx::text,'inventory'],'[]'::jsonb)||jsonb_build_array(moved);
  st:=jsonb_set(st,'{groundLoot}',ground,true); st:=jsonb_set(st,array['characters',char_idx::text,'inventory'],inv,true);
  update campaigns set state=st,updated_at=now() where id=p_campaign;
  return true;
end $$;

revoke all on function public.inventory_move(uuid,uuid,integer,integer,text,uuid),public.inventory_take_ground(uuid,uuid,integer,integer) from public;
grant execute on function public.inventory_move(uuid,uuid,integer,integer,text,uuid),public.inventory_take_ground(uuid,uuid,integer,integer) to anon,authenticated;

-- v25: oyuncu ekipman kuşanma/çöpe atma ve DM marketten ücretsiz eşya verme.
create or replace function public.inventory_equip(p_user uuid,p_campaign uuid,p_item_index integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; inv jsonb; item jsonb; slot text; next_value boolean; i integer;
begin
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
 select c.state into st from campaigns c where c.id=p_campaign for update;
 select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
 if ci is null then raise exception 'Karakterin bulunamadı'; end if;
 inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
 if p_item_index<0 or p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya artık envanterde değil'; end if;
 item:=inv->p_item_index;
 if not(item ? 'slot') then
  slot:=case coalesce(item->>'sourceItemId',item->>'id')
   when 'ex-leather' then 'armor' when 'ex-studded' then 'armor' when 'ex-padded' then 'armor' when 'ex-hide' then 'armor' when 'ex-chain-shirt' then 'armor' when 'ex-scale-mail' then 'armor' when 'ex-breastplate' then 'armor' when 'ex-chain-mail' then 'armor' when 'ex-splint' then 'armor' when 'ex-plate' then 'armor' when 'ex-adamantine-plate' then 'armor'
   when 'ex-shield' then 'shield' when 'ex-sentinel-shield' then 'shield' when 'ex-spellguard-shield' then 'shield' when 'ex-animated-shield' then 'shield' when 'ex-tower-shield' then 'shield' else null end;
  if slot is not null then item:=item||jsonb_build_object('slot',slot); inv:=jsonb_set(inv,array[p_item_index::text],item,true); end if;
 end if;
 slot:=coalesce(item->>'slot',case when item ? 'armorBase' then 'armor' else null end);
 if slot is null and not(item ? 'acBonus' or item ? 'attackBonus' or item ? 'damageBonus' or item ? 'magicBonus' or item ? 'bonuses' or item ? 'statBonuses') then raise exception 'Bu eşya kuşanılamaz'; end if;
 next_value:=not coalesce((item->>'equipped')::boolean,false);
 if next_value and slot is not null then
  for i in 0..jsonb_array_length(inv)-1 loop
   if i<>p_item_index and coalesce(inv->i->>'slot',case when inv->i ? 'armorBase' then 'armor' else null end)=slot then inv:=jsonb_set(inv,array[i::text,'equipped'],'false'::jsonb,true); end if;
  end loop;
 end if;
 inv:=jsonb_set(inv,array[p_item_index::text,'equipped'],to_jsonb(next_value),true);
 st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true); update campaigns set state=st,updated_at=now() where id=p_campaign; return next_value;
end $$;

create or replace function public.inventory_delete(p_user uuid,p_campaign uuid,p_item_index integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; inv jsonb;
begin
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='player') then raise exception 'Bu kampanyada oyuncu değilsin'; end if;
 select c.state into st from campaigns c where c.id=p_campaign for update;
 select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'userId'=p_user::text limit 1;
 if ci is null then raise exception 'Karakterin bulunamadı'; end if;
 inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb);
 if p_item_index<0 or p_item_index>=jsonb_array_length(inv) then raise exception 'Eşya artık envanterde değil'; end if;
 inv:=inv-p_item_index; st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true); update campaigns set state=st,updated_at=now() where id=p_campaign; return true;
end $$;

create or replace function public.inventory_give_market(p_user uuid,p_campaign uuid,p_target_character text,p_item_id text,p_quantity integer default 1)
returns boolean language plpgsql security definer set search_path=public as $$
declare st jsonb; ci integer; market_item jsonb; inv jsonb; gifted jsonb;
begin
 if not exists(select 1 from campaign_members where campaign_id=p_campaign and user_id=p_user and role='dm') then raise exception 'Yalnızca DM eşya verebilir'; end if;
 if p_quantity<1 then raise exception 'Adet en az 1 olmalı'; end if;
 select c.state into st from campaigns c where c.id=p_campaign for update;
 select e.value into market_item from jsonb_array_elements(coalesce(st->'market','[]'::jsonb)) e(value) where e.value->>'id'=p_item_id limit 1;
 if market_item is null then raise exception 'Market eşyası bulunamadı'; end if;
 select (e.ordinality-1)::integer into ci from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) with ordinality e(value,ordinality) where e.value->>'id'=p_target_character limit 1;
 if ci is null then raise exception 'Hedef karakter bulunamadı'; end if;
 gifted:=(market_item-'stock'-'active'-'shop'-'priceCopper'-'tier'-'ready'-'custom')||jsonb_build_object('id',gen_random_uuid(),'sourceItemId',p_item_id,'qty',p_quantity,'equipped',false);
 inv:=coalesce(st#>array['characters',ci::text,'inventory'],'[]'::jsonb)||jsonb_build_array(gifted);
 st:=jsonb_set(st,array['characters',ci::text,'inventory'],inv,true); update campaigns set state=st,updated_at=now() where id=p_campaign; return true;
end $$;

revoke all on function public.inventory_equip(uuid,uuid,integer),public.inventory_delete(uuid,uuid,integer),public.inventory_give_market(uuid,uuid,text,text,integer) from public;
grant execute on function public.inventory_equip(uuid,uuid,integer),public.inventory_delete(uuid,uuid,integer),public.inventory_give_market(uuid,uuid,text,text,integer) to anon,authenticated;
