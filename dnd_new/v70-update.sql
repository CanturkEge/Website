-- v70: Stable market editing, silent negotiations and role-scoped history cleanup.
-- Existing accounts, campaigns, orders, wallets, characters, NPCs and inventory are preserved.

drop trigger if exists market_order_notify_v68_trigger on public.market_orders_v66;

create or replace function public.market_order_clear_history_v70(
  p_session_token text,p_campaign uuid
) returns integer
language plpgsql security definer set search_path=public as $$
declare uid uuid; member_role text; removed integer;
begin
  uid:=public.v66_session_user(p_session_token);
  if uid is null then raise exception 'Oturum geçersiz veya süresi dolmuş'; end if;

  select m.role into member_role
  from public.campaign_members m
  where m.campaign_id=p_campaign and m.user_id=uid;
  if member_role is null then raise exception 'Kampanya üyesi değilsin'; end if;

  delete from public.market_orders_v66 o
  where o.campaign_id=p_campaign
    and o.status in ('completed','rejected','cancelled')
    and (member_role='dm' or o.user_id=uid);
  get diagnostics removed=row_count;
  return removed;
end
$$;

revoke all on function public.market_order_clear_history_v70(text,uuid) from public,anon,authenticated;
grant execute on function public.market_order_clear_history_v70(text,uuid) to anon;

comment on function public.market_order_clear_history_v70(text,uuid)
is 'DM tüm kapalı market kayıtlarını, oyuncu yalnız kendi kapalı kayıtlarını temizler.';
