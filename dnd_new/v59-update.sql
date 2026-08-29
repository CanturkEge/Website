-- Kadim Masa Defteri v59: şeytanla anlaşma bildirimleri.
-- Hesapları, kampanyaları ve mevcut anlaşma mesajlarını silmez.

create or replace function public.pact_notify_v59()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.sender_role='player' then
    insert into campaign_notifications(campaign_id,user_id,title,body)
    select new.campaign_id,cm.user_id,'Yeni şeytan anlaşması',a.display_name||' gizli bir dilek gönderdi.'
    from campaign_members cm
    join accounts a on a.id=new.player_id
    where cm.campaign_id=new.campaign_id and cm.role='dm';
  else
    insert into campaign_notifications(campaign_id,user_id,title,body)
    values(new.campaign_id,new.player_id,'Karanlıktan cevap geldi',left(new.body,160));
  end if;
  return new;
end
$$;

drop trigger if exists pact_message_notify_v59 on public.pact_messages;
create trigger pact_message_notify_v59
after insert on public.pact_messages
for each row execute function public.pact_notify_v59();

revoke all on function public.pact_notify_v59() from public,anon,authenticated;
