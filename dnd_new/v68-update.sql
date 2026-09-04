-- v68: Market offer notifications for DMs and players.
-- Existing accounts, campaigns, market orders, wallets and inventory are preserved.

create or replace function public.market_order_notify_v68()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  player_name text;
  line_count integer;
begin
  select coalesce(a.display_name,'Oyuncu') into player_name
  from public.accounts a
  where a.id=new.user_id;

  line_count:=case when jsonb_typeof(new.items)='array' then jsonb_array_length(new.items) else 0 end;

  if tg_op='INSERT' then
    insert into public.campaign_notifications(campaign_id,user_id,title,body)
    select new.campaign_id,cm.user_id,'Yeni market teklifi',
      left(player_name||' marketten '||line_count||' kalem için '||new.player_offer||' CP teklif gönderdi.',500)
    from public.campaign_members cm
    where cm.campaign_id=new.campaign_id and cm.role='dm';
  elsif old.status is distinct from new.status then
    if new.status='countered' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      values(new.campaign_id,new.user_id,'DM karşı teklif gönderdi',
        left('Market sepetin için karşı teklif: '||coalesce(new.dm_offer,new.player_offer)||' CP.',500));
    elsif new.status='completed' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      values(new.campaign_id,new.user_id,'Market alışverişi tamamlandı',
        'Ödeme alındı; satın aldığın eşyalar envanterine aktarıldı.');
    elsif new.status='rejected' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      values(new.campaign_id,new.user_id,'Market teklifi reddedildi','DM market teklifini reddetti.');
    elsif new.status='cancelled' then
      insert into public.campaign_notifications(campaign_id,user_id,title,body)
      select new.campaign_id,cm.user_id,'Market teklifi iptal edildi',
        left(player_name||' market teklifini iptal etti.',500)
      from public.campaign_members cm
      where cm.campaign_id=new.campaign_id and cm.role='dm';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists market_order_notify_v68_trigger on public.market_orders_v66;
create trigger market_order_notify_v68_trigger
after insert or update on public.market_orders_v66
for each row execute function public.market_order_notify_v68();

revoke all on function public.market_order_notify_v68() from public,anon,authenticated;

comment on function public.market_order_notify_v68()
is 'Creates campaign notifications for market offer submission and status changes.';
