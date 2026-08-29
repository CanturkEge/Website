-- v60: Oyuncunun yalnız kendi aktif savaş tokenını kalan hızı kadar hareket ettirmesi.
-- Mevcut hesap, kampanya, karakter ve savaş verilerini silmez. Tekrar çalıştırılabilir.

create or replace function public.battle_token_move_v60(
  p_session_token text,
  p_campaign uuid,
  p_token_id text,
  p_x integer,
  p_y integer
) returns jsonb
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  session_user_id uuid;
  st jsonb;
  battle jsonb;
  tokens jsonb;
  token_value jsonb;
  fighter jsonb;
  token_index integer;
  cols integer;
  rows_count integer;
  token_size integer;
  old_x integer;
  old_y integer;
  speed integer;
  moved integer;
  distance integer;
  destination_blocked boolean;
  destination_difficult boolean;
begin
  if length(coalesce(p_session_token,'')) < 32 then
    raise exception 'Oturum geçersiz; yeniden giriş yap';
  end if;

  select s.user_id into session_user_id
  from public.account_sessions_v54 s
  where s.token_hash=encode(digest(p_session_token,'sha256'),'hex')
    and s.expires_at>now();
  if session_user_id is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;

  if not exists(
    select 1 from public.campaign_members m
    where m.campaign_id=p_campaign and m.user_id=session_user_id and m.role='player'
  ) then raise exception 'Bu kampanyada oyuncu değilsin'; end if;

  select c.state into st from public.campaigns c where c.id=p_campaign for update;
  if st is null then raise exception 'Kampanya bulunamadı'; end if;
  battle:=coalesce(st->'battleMap','{}'::jsonb);
  if not coalesce((battle->>'published')::boolean,false)
     or not coalesce((st->>'encounterActive')::boolean,false) then
    raise exception 'Savaş henüz aktif değil';
  end if;

  tokens:=coalesce(battle->'tokens','[]'::jsonb);
  select (t.ordinality-1)::integer,t.value into token_index,token_value
  from jsonb_array_elements(tokens) with ordinality t(value,ordinality)
  where t.value->>'id'=p_token_id limit 1;
  if token_index is null then raise exception 'Token bulunamadı'; end if;

  select e.value into fighter
  from jsonb_array_elements(coalesce(st->'encounter','[]'::jsonb)) e(value)
  where e.value->>'id'=token_value->>'combatantId' limit 1;
  if fighter is null or coalesce(fighter->>'kind','')<>'player' then
    raise exception 'Bu token oyuncuya ait değil';
  end if;
  if coalesce(fighter->>'userId','')<>session_user_id::text and not exists(
    select 1 from jsonb_array_elements(coalesce(st->'characters','[]'::jsonb)) ch(value)
    where ch.value->>'id'=fighter->>'characterId'
      and ch.value->>'userId'=session_user_id::text
  ) then raise exception 'Yalnız kendi tokenını hareket ettirebilirsin'; end if;
  if not coalesce((fighter->>'turn')::boolean,false) then raise exception 'Şu an sıra sende değil'; end if;

  cols:=greatest(8,least(coalesce((battle->>'cols')::integer,20),40));
  rows_count:=greatest(8,least(coalesce((battle->>'rows')::integer,14),30));
  token_size:=greatest(1,least(coalesce((token_value->>'size')::integer,1),4));
  if p_x is null or p_y is null or p_x<0 or p_y<0
     or p_x>cols-token_size or p_y>rows_count-token_size then
    raise exception 'Hedef kare haritanın dışında';
  end if;

  select exists(
    select 1 from jsonb_array_elements(coalesce(battle->'props','[]'::jsonb)) prop(value)
    where coalesce((prop.value->>'blocksMove')::boolean,false)
      and p_x<coalesce((prop.value->>'x')::integer,0)+greatest(1,coalesce((prop.value->>'w')::integer,1))
      and p_x+token_size>coalesce((prop.value->>'x')::integer,0)
      and p_y<coalesce((prop.value->>'y')::integer,0)+greatest(1,coalesce((prop.value->>'h')::integer,1))
      and p_y+token_size>coalesce((prop.value->>'y')::integer,0)
  ) into destination_blocked;
  if destination_blocked then raise exception 'Bu karede geçilemez bir obje var'; end if;

  select exists(
    select 1 from jsonb_array_elements(coalesce(battle->'props','[]'::jsonb)) prop(value)
    where coalesce((prop.value->>'difficult')::boolean,false)
      and p_x<coalesce((prop.value->>'x')::integer,0)+greatest(1,coalesce((prop.value->>'w')::integer,1))
      and p_x+token_size>coalesce((prop.value->>'x')::integer,0)
      and p_y<coalesce((prop.value->>'y')::integer,0)+greatest(1,coalesce((prop.value->>'h')::integer,1))
      and p_y+token_size>coalesce((prop.value->>'y')::integer,0)
  ) into destination_difficult;

  old_x:=coalesce((token_value->>'x')::integer,0);
  old_y:=coalesce((token_value->>'y')::integer,0);
  speed:=greatest(5,least(coalesce((token_value->>'speed')::integer,30),200));
  moved:=greatest(0,coalesce((token_value->>'movedFeet')::integer,0));
  distance:=greatest(abs(old_x-p_x),abs(old_y-p_y))*5;
  if destination_difficult then distance:=distance*2; end if;
  if moved+distance>speed then
    raise exception 'Hız sınırı aşılıyor; kalan hareket % ft',greatest(0,speed-moved);
  end if;

  token_value:=jsonb_set(token_value,'{x}',to_jsonb(p_x),true);
  token_value:=jsonb_set(token_value,'{y}',to_jsonb(p_y),true);
  token_value:=jsonb_set(token_value,'{movedFeet}',to_jsonb(moved+distance),true);
  tokens:=jsonb_set(tokens,array[token_index::text],token_value,false);
  st:=jsonb_set(st,'{battleMap,tokens}',tokens,false);
  update public.campaigns set state=st,updated_at=now() where id=p_campaign;

  return jsonb_build_object(
    'x',p_x,
    'y',p_y,
    'movedFeet',moved+distance,
    'remaining',speed-(moved+distance)
  );
end
$$;

revoke all on function public.battle_token_move_v60(text,uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.battle_token_move_v60(text,uuid,text,integer,integer) to anon,authenticated;

comment on function public.battle_token_move_v60(text,uuid,text,integer,integer)
is 'v60: session-authenticated player movement for the caller own active battle token';
