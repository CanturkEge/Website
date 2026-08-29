-- v61: Oyuncunun kendi kesesindeki parayı kalıcı olarak yok etmesi.
-- Mevcut hesap, kampanya ve cüzdan verilerini silmez. Tekrar çalıştırılabilir.

create or replace function public.wallet_discard_v61(
  p_session_token text,
  p_campaign uuid,
  p_coin text,
  p_amount integer
) returns jsonb
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  session_user_id uuid;
  multiplier bigint;
  discard_value bigint;
  total bigint;
begin
  if length(coalesce(p_session_token,'')) < 32 then
    raise exception 'Oturum geçersiz; yeniden giriş yap';
  end if;
  if p_amount is null or p_amount<=0 then
    raise exception 'Miktar sıfırdan büyük olmalı';
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

  multiplier:=case p_coin
    when 'platinum' then 1000
    when 'gold' then 100
    when 'silver' then 10
    when 'copper' then 1
    else null
  end;
  if multiplier is null then raise exception 'Geçersiz para türü'; end if;
  discard_value:=p_amount::bigint*multiplier;

  insert into public.campaign_wallets(campaign_id,user_id)
  values(p_campaign,session_user_id)
  on conflict do nothing;

  select w.platinum*1000::bigint+w.gold*100::bigint+w.silver*10::bigint+w.copper
  into total
  from public.campaign_wallets w
  where w.campaign_id=p_campaign and w.user_id=session_user_id
  for update;

  if total<discard_value then raise exception 'Yeterli paran yok'; end if;
  total:=total-discard_value;

  update public.campaign_wallets
  set platinum=(total/1000)::integer,
      gold=((total%1000)/100)::integer,
      silver=((total%100)/10)::integer,
      copper=(total%10)::integer,
      updated_at=now()
  where campaign_id=p_campaign and user_id=session_user_id;

  return jsonb_build_object(
    'platinum',(total/1000)::integer,
    'gold',((total%1000)/100)::integer,
    'silver',((total%100)/10)::integer,
    'copper',(total%10)::integer,
    'discardedCopper',discard_value
  );
end
$$;

revoke all on function public.wallet_discard_v61(text,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.wallet_discard_v61(text,uuid,text,integer) to anon;

comment on function public.wallet_discard_v61(text,uuid,text,integer)
is 'v61: session-authenticated player discards currency from their own campaign wallet';
