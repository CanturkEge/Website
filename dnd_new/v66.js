/* v66-v69: focus readiness, negotiated market cart, audit log and player-to-NPC transfers. */
((root)=>{
  'use strict';
  let orders=[],ordersCampaign='',ordersLoading=false,ordersError='';
  let auditRows=[],auditCampaign='',auditLoading=false,auditError='';
  const cartKey=()=>`kadim-cart-v66:${current?.id||''}:${auth?.id||''}`;
  const readCart=()=>{try{return JSON.parse(localStorage.getItem(cartKey())||'[]')}catch{return []}};
  const writeCart=rows=>localStorage.setItem(cartKey(),JSON.stringify(rows));
  const money=n=>typeof exMoney==='function'?exMoney(n):`${n} CP`;
  const orderPrice=o=>o.last_offer_by==='player'?o.player_offer:(o.dm_offer??o.player_offer);
  const orderStatus={pending:'DM yanıtı bekliyor',countered:'Oyuncu yanıtı bekliyor',completed:'Tamamlandı',rejected:'Reddedildi',cancelled:'İptal edildi'};
  const orderActive=o=>['pending','countered'].includes(o.status);
  const timeLabel=value=>value?new Date(value).toLocaleString('tr-TR'):'—';

  const oldEnsure=exEnsureState;
  function classFocus(item){const allowed=Array.isArray(item?.classRestriction)?item.classRestriction:[];if(!allowed.length)return 'universal';const groups=new Set(allowed.map(name=>['Cleric','Paladin'].includes(name)?'divine':['Druid','Ranger'].includes(name)?'druidic':name==='Bard'?'instrument':'arcane'));return groups.size===1?[...groups][0]:'universal'}
  function focusKind(item){if(['arcane','divine','druidic','instrument','universal'].includes(item?.focusType))return item.focusType;const text=`${item?.name||''} ${item?.effect||''} ${item?.note||''}`.toLocaleLowerCase('tr-TR');if(/kutsal sembol|kutsal odak|holy symbol/.test(text))return 'divine';if(/druid (odağı|totemi)|druidic focus/.test(text))return 'druidic';if(/lavta|çalgı|instrument/.test(text))return 'instrument';if(/component pouch|bileşen (kesesi|çantası)/.test(text))return 'universal';if(/arcane focus|savaş büyücüsü değneği|war mage/.test(text))return 'arcane';if(item?.category==='focus'||item?.slot==='focus'||/büyü odağı/.test(text))return classFocus(item);return ''}
  function upgradeFocus(item){const kind=focusKind(item),text=`${item?.name||''} ${item?.effect||''}`.toLocaleLowerCase('tr-TR'),pouch=/component pouch|bileşen (kesesi|çantası)/.test(text);if(!kind||(item.category==='component'&&!pouch))return false;let changed=false;if(!item.focusType){item.focusType=kind;changed=true}if(!item.slot){item.slot='focus';changed=true}if(!item.category||['tool','trinket'].includes(item.category)||pouch){item.category='focus';changed=true}return changed}
  root.v66FocusKind=focusKind;
  root.v66InventoryItemActions=(item,index)=>current?.role==='player'&&(state.npcs||[]).length?`<button class="ghost" data-v66-npc-item="${index}">NPC’ye Ver</button>`:'';
  exEnsureState=function(){oldEnsure();if(current?.role!=='dm')return;let changed=false;state.market=Array.isArray(state.market)?state.market:[];if((+state.shopSeedVersion||0)<8){for(const item of V66_CASTER_MARKET)if(!state.market.some(x=>x.id===item.id||x.name===item.name)){state.market.push({...item});changed=true}state.shopSeedVersion=8;changed=true}if((+state.focusSchemaVersion||0)<2){const groups=[state.market,state.guildInventory,state.groundLoot,...(state.characters||[]).map(c=>c.inventory),...(state.npcs||[]).map(n=>n.inventory)];for(const rows of groups)for(const item of Array.isArray(rows)?rows:[])changed=upgradeFocus(item)||changed;state.focusSchemaVersion=2;changed=true}if(changed)setTimeout(save,0)};

  async function loadOrders(force=false){
    if(!current||ordersLoading||(!force&&ordersCampaign===current.id))return;
    const campaign=current.id;
    if(!auth?.sessionToken){orders=[];ordersError='Güvenli market oturumu bulunamadı. Çıkış yapıp yeniden giriş yap.';ordersCampaign=campaign;if(page==='market')render();return}
    ordersLoading=true;let data,error;
    try{({data,error}=await db.rpc('market_order_list_v69',{p_session_token:auth.sessionToken,p_campaign:campaign}))}catch(failure){error={message:failure?.message||'Market bağlantısı kurulamadı'}}
    ordersLoading=false;
    if(current?.id!==campaign)return;if(error){orders=[];ordersError=error.message||'Teklifler alınamadı';ordersCampaign=campaign;if(page==='market')render();return}orders=data||[];ordersError='';ordersCampaign=campaign;if(page==='market')render();
  }
  function cartRows(){return readCart().map(row=>{const item=state.market.find(x=>x.id===row.itemId);return item?{...row,item,price:exPrice(item)}:null}).filter(Boolean)}
  function cartPanel(){
    const rows=cartRows(),total=rows.reduce((n,r)=>n+r.price*r.qty,0);
    return `<section class="card v66-cart"><div class="between row"><div><span class="v26-kicker">PAZARLIK SEPETİ</span><h2>Sepet <span class="v66-cart-count">${rows.reduce((n,r)=>n+r.qty,0)}</span></h2></div><b>${money(total)}</b></div><div class="v66-cart-lines">${rows.map(r=>`<div class="v66-cart-line"><span><b>${esc(r.item.name)}</b><small>${money(r.price)} × ${r.qty}</small></span><div><button class="ghost" data-v66-cart-minus="${esc(r.itemId)}">−</button><button class="ghost" data-v66-cart-plus="${esc(r.itemId)}" ${r.qty>=r.item.stock?'disabled':''}>＋</button><button class="danger" data-v66-cart-remove="${esc(r.itemId)}">×</button></div></div>`).join('')||'<div class="empty">Sepet boş. Ürün kartlarından eşya ekle.</div>'}</div>${rows.length?`<div class="v66-cart-actions"><label>Teklifin (CP)<input id="v66CartOffer" type="number" min="1" max="${total}" value="${total}"></label><button id="v66SubmitCart" class="primary" ${auth?.sessionToken?'':'disabled'}>DM’e Teklif Gönder</button><button id="v66ClearCart" class="ghost">Sepeti Temizle</button></div>${auth?.sessionToken?'<p class="muted">DM kabul edebilir, reddedebilir veya karşı teklif yollar. Para ve stok yalnız son onayda değişir.</p>':'<p class="pact-error">Güvenli market oturumu bulunamadı. Çıkış yapıp yeniden giriş yap.</p>'}`:''}</section>`;
  }
  function offerHistory(o){
    const rows=Array.isArray(o.offer_history)?o.offer_history:[];
    return `<details class="v69-offer-history"><summary>Pazarlık geçmişi (${rows.length})</summary><div>${rows.map((row,index)=>`<span><b>${row.by==='dm'?'DM':'Oyuncu'} • ${money(+row.amount||0)}</b><small>${row.locked?'Son fiyat • ':''}${timeLabel(row.at)}${index===rows.length-1?' • Güncel':''}</small></span>`).join('')||'<small>Eski kayıtta ayrıntılı teklif geçmişi yok.</small>'}</div></details>`;
  }
  function orderCard(o){
    const isDm=current.role==='dm',history=Array.isArray(o.offer_history)?o.offer_history:[],active=orderActive(o);
    const dmTurn=isDm&&o.status==='pending'&&(o.last_offer_by||'player')==='player';
    const playerTurn=!isDm&&o.status==='countered'&&o.last_offer_by==='dm';
    return `<article class="v66-order ${active?'active':'closed'}"><header><span><b>${esc(o.player_name)}</b><small>${esc(orderStatus[o.status]||o.status)} • ${timeLabel(o.updated_at)}</small></span><span class="v69-current-price"><small>Güncel teklif</small><b>${money(orderPrice(o))}</b></span></header>${o.negotiation_locked&&active?'<div class="v69-final-price">🔒 DM son fiyatı — pazarlığa kapalı</div>':''}<ul class="v69-order-items">${(o.items||[]).map(i=>{const qty=Math.max(1,+i.qty||1),unit=Math.max(0,+i.unitPrice||0);return `<li><span>${esc(i.name)} ×${qty}</span><small>Normal: ${money(unit*qty)}${qty>1?` • adet ${money(unit)}`:''}</small></li>`}).join('')}</ul><div class="v69-value-line"><span>Normal toplam <b>${money(o.list_total)}</b></span><span>Son oyuncu teklifi <b>${money(o.player_offer)}</b></span>${o.dm_offer!=null?`<span>Son DM teklifi <b>${money(o.dm_offer)}</b></span>`:''}</div>${history.length>1?offerHistory(o):''}<div class="v66-order-actions">${dmTurn?`<button class="primary" data-v66-order-approve="${o.id}">Oyuncu Teklifini Kabul Et</button><div class="v69-counter-box"><label>DM karşı teklifi (CP)<input class="v69-number" data-v69-dm-amount="${o.id}" type="number" min="1" step="1" value="${Math.max(1,orderPrice(o))}" inputmode="numeric"></label><label class="v69-lock"><input data-v69-dm-lock="${o.id}" type="checkbox"> Son fiyat — oyuncu geri teklif veremesin</label><button class="ghost" data-v69-dm-counter="${o.id}">Karşı Teklif Gönder</button></div><button class="danger" data-v66-order-reject="${o.id}">Reddet</button>`:''}${isDm&&o.status==='countered'?'<span class="v69-waiting">Oyuncunun yanıtı bekleniyor.</span>':''}${playerTurn?`<button class="primary" data-v66-order-accept="${o.id}">${o.negotiation_locked?'Son Fiyatı Kabul Et':'DM Teklifini Kabul Et'}</button>${o.negotiation_locked?'':`<div class="v69-counter-box"><label>Yeni teklifin (CP)<input class="v69-number" data-v69-player-amount="${o.id}" type="number" min="1" step="1" value="${Math.max(1,+o.player_offer||1)}" inputmode="numeric"></label><button class="ghost" data-v69-player-counter="${o.id}">Karşı Teklif Gönder</button></div>`}`:''}${!isDm&&active?`<button class="danger" data-v66-order-cancel="${o.id}">İptal Et</button>`:''}</div></article>`;
  }
  function ordersPanel(){
    const visible=orders.filter(o=>current.role==='dm'||o.user_id===auth.id),active=visible.filter(orderActive),closed=visible.filter(o=>!orderActive(o));
    return `<section class="card v66-orders"><div class="between row"><div><span class="v26-kicker">TEKLİF MASASI</span><h2>${current.role==='dm'?'Gelen Sepetler':'Tekliflerim'}</h2></div><button id="v66RefreshOrders" class="ghost">Yenile</button></div><div class="v66-order-list">${active.map(orderCard).join('')||(ordersError?`<div class="empty">${esc(ordersError)}</div>`:'<div class="empty">Aktif teklif yok.</div>')}</div>${closed.length?`<details class="v69-closed-orders"><summary>Tamamlanan / kapanan işlemler (${closed.length})</summary><div class="v66-order-list">${current.role==='dm'?'<button id="v69ClearOrderHistory" class="danger">Biten Geçmişi Temizle</button>':''}${closed.map(orderCard).join('')}</div></details>`:''}</section>`;
  }

  root.v69Audit=async(action,title,body,metadata={})=>{
    if(!auth?.sessionToken||!current)return false;
    const {error}=await db.rpc('audit_record_v69',{p_session_token:auth.sessionToken,p_campaign:current.id,p_action:action,p_title:title,p_body:body,p_metadata:metadata});
    if(error){console.warn('İşlem loglanamadı:',error.message);return false}auditCampaign='';return true;
  };
  async function loadAudit(force=false){
    if(current?.role!=='dm'||!auth?.sessionToken||auditLoading||(!force&&auditCampaign===current.id))return;
    auditLoading=true;const campaign=current.id,{data,error}=await db.rpc('dm_audit_list_v69',{p_session_token:auth.sessionToken,p_campaign:campaign});auditLoading=false;
    if(current?.id!==campaign)return;if(error){auditRows=[];auditError=error.message||'İşlem logu alınamadı'}else{auditRows=data||[];auditError=''}auditCampaign=campaign;if(page==='auditlog')render();
  }
  function auditPage(){
    queueMicrotask(()=>loadAudit());
    const labels={market_purchase:'Market',money_transfer:'Para',money_discard:'Silme',npc_money:'NPC para',npc_item:'NPC eşya',item_transfer:'Eşya',item_ground:'Yere bırakma',item_take:'Yerden alma',dm_item_grant:'DM eşya',wallet_adjust:'Kese',loot_money:'Ganimet',guild_action:'Lonca'};
    return `<section class="v69-audit-head"><div><span class="v26-kicker">YALNIZCA DM</span><h2>İşlem Logu</h2><p>Alışveriş, eşya ve para hareketleri burada tutulur; bunlar bildirim üretmez.</p></div><div><button id="v69RefreshAudit" class="ghost">Yenile</button><button id="v69ClearAudit" class="danger" ${auditRows.length?'':'disabled'}>Logu Temizle</button></div></section><details class="card v69-audit-shell" open><summary>${auditRows.length} kayıt • ayrıntıları küçült / aç</summary><div class="v69-audit-list">${auditRows.map(row=>`<article><span class="v69-audit-kind">${esc(labels[row.action]||row.action)}</span><div><b>${esc(row.title)}</b><p>${esc(row.body)}</p><small>${esc(row.actor_name)} • ${timeLabel(row.created_at)}</small></div></article>`).join('')||(auditError?`<div class="empty">${esc(auditError)}</div>`:'<div class="empty">Henüz kayıtlı işlem yok.</div>')}</div></details>`;
  }
  dmPages.auditlog=auditPage;
  if(!dmNav.some(row=>row[0]==='auditlog')){const index=dmNav.findIndex(row=>row[0]==='market');dmNav.splice(index<0?dmNav.length:index+1,0,['auditlog','▤','İşlem Logu'])}

  const oldCard=exItemCard;
  exItemCard=function(item){
    let html=oldCard(item);if(current?.role!=='player')return html;
    return html.replace(/<button data-buy-item="[^"]+"[^>]*>.*?<\/button>/,`<button data-v66-cart-add="${esc(item.id)}" class="primary buy-button" ${state.shopSettings.buyingEnabled&&item.stock>0?'':'disabled'}>${item.stock>0?'Sepete Ekle':'Tükendi'}</button>`);
  };
  const oldMarket=exMarket;
  exMarket=function(){queueMicrotask(()=>loadOrders());const base=oldMarket();return `${current.role==='player'?cartPanel():''}${ordersPanel()}${base}`};dmPages.market=exMarket;playerPages.market=exMarket;

  function inferredFocus(item,c){
    if(!item?.equipped)return false;if(Array.isArray(item.classRestriction)&&item.classRestriction.length&&!item.classRestriction.includes(c.className))return false;
    const kind=item.focusType||focusKind(item);if(kind==='universal')return true;return c.className==='Cleric'||c.className==='Paladin'?kind==='divine':c.className==='Druid'||c.className==='Ranger'?kind==='druidic':c.className==='Bard'?kind==='instrument':['arcane','instrument'].includes(kind);
  }
  function focusPanel(){
    const c=myChar();if(!c||!['Cleric','Paladin','Druid','Ranger','Wizard','Sorcerer','Warlock','Bard','Artificer'].includes(c.className))return '';
    const focuses=(c.inventory||[]).filter(x=>inferredFocus(x,c)),allSpells=root.V47_SPELLS||[],prepared=(c.preparedSpells||[]).map(p=>allSpells.find(s=>s.id===p.id||s.name===p.name)||p),inv=c.inventory||[];
    return `<section class="card v66-focus-panel"><div class="between row"><div><span class="v26-kicker">BÜYÜ DONANIMI</span><h2>Odak ve Materyal Kontrolü</h2></div><span class="v66-badge ${focuses.length?'v66-focus-ok':'v66-focus-warn'}">${focuses.length?'Odak hazır':'Odak kuşanılmadı'}</span></div><p>${focuses.length?`Aktif: <b>${focuses.map(x=>esc(x.name)).join(', ')}</b>. GP değeri olmayan M bileşenlerinin yerine kullanılabilir.`:'Envanterindeki uygun kutsal sembolü, odağı, asayı veya çalgıyı kuşan.'}</p><div class="v66-focus-list">${prepared.filter(s=>s.components?.includes?.('M')||s.materialTr).map(s=>{const kit=inv.find(i=>i.linkedSpellId===s.id),priced=kit?.requiresExactComponent||/\b\d[\d.,]*\s*gp\b/i.test(s.materialSource||'');const ok=priced?!!kit:focuses.length>0||!!kit;return `<article><b>${esc(s.nameTr||s.name)}</b><span class="v66-badge ${ok?'v66-focus-ok':'v66-focus-warn'}">${ok?'Hazır':'Eksik'}</span><small>${priced?'Bedelli özel materyal gerekir':'Odak veya component pouch yeterli'}${kit?` • ${esc(kit.name)}`:''}</small></article>`}).join('')||'<div class="empty">Hazırlanmış materyalli büyü yok.</div>'}</div></section>`;
  }
  const oldSkills=playerPages.skills;playerPages.skills=()=>`${focusPanel()}${oldSkills()}`;

  const oldIaItem=iaItem;
  iaItem=function(item,index,actions=false){let html=oldIaItem(item,index,actions);if(actions&&focusKind(item))html=html.replace(item.equipped?'Çıkar':'Kuşan',item.equipped?'Odağı Bırak':'Odak Olarak Kullan');if(actions&&current?.role==='player'&&(state.npcs||[]).length&&!html.includes(`data-v66-npc-item="${index}"`))html=html.replace('<button class="danger" data-v25-trash',`<button class="ghost" data-v66-npc-item="${index}">NPC’ye Ver</button><button class="danger" data-v25-trash`);return html};
  root.v66NpcCoinCard=()=>`<section class="card money-transfer v66-npc-transfer"><div><small>OYUNCUDAN NPC’YE</small><h3>NPC’ye Para Gönder</h3><p>Seçtiğin para kesenden çıkar ve NPC’nin kesesine eklenir.</p></div>${(state.npcs||[]).length?`<div class="transfer-form v66-transfer-grid"><label>NPC<select id="v66NpcCoinTarget">${state.npcs.map(n=>`<option value="${esc(n.id)}">${esc(n.name)}</option>`).join('')}</select></label><label>Para<select id="v66NpcCoin"><option value="platinum">PP</option><option value="gold" selected>GP</option><option value="silver">SP</option><option value="copper">CP</option></select></label><label>Miktar<input id="v66NpcCoinAmount" type="number" min="1" value="1" inputmode="numeric"></label><button id="v66NpcCoinSend" class="primary">NPC’ye Gönder</button></div>`:'<p class="muted">Kampanyada para gönderilebilecek NPC yok.</p>'}</section>`;

  async function finishOrder(id,action){if(!auth?.sessionToken)return alert('Güvenli market oturumu bulunamadı. Çıkış yapıp yeniden giriş yap.');let error;try{({error}=await db.rpc('market_order_finish_v66',{p_session_token:auth.sessionToken,p_campaign:current.id,p_order:id,p_action:action}))}catch(failure){error={message:failure?.message||'Market bağlantısı kurulamadı'}}if(error)return alert(error.message);ordersCampaign='';auditCampaign='';exWalletCampaign=null;await Promise.all([loadOrders(true),syncFromServer(false),exLoadWallets(true)]);render();toast('Teklif işlemi tamamlandı')}
  document.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b||!current)return;
    if(b.dataset.v66CartAdd){event.preventDefault();event.stopImmediatePropagation();const item=state.market.find(x=>x.id===b.dataset.v66CartAdd),cart=readCart(),row=cart.find(x=>x.itemId===item?.id);if(!item)return;if(row)row.qty=Math.min(item.stock,row.qty+1);else cart.push({itemId:item.id,qty:1});writeCart(cart);render();toast(item.name+' sepete eklendi');return}
    for(const [key,delta] of [['v66CartPlus',1],['v66CartMinus',-1]])if(b.dataset[key]){const cart=readCart(),row=cart.find(x=>x.itemId===b.dataset[key]);if(row)row.qty+=delta;writeCart(cart.filter(x=>x.qty>0));render();return}
    if(b.dataset.v66CartRemove){writeCart(readCart().filter(x=>x.itemId!==b.dataset.v66CartRemove));render();return}
    if(b.id==='v66ClearCart'){writeCart([]);render();return}
    if(b.id==='v66SubmitCart'){const rows=cartRows(),offer=Math.trunc(+$('#v66CartOffer')?.value||0);if(!rows.length)return;if(!auth?.sessionToken)return alert('Güvenli market oturumu bulunamadı. Çıkış yapıp yeniden giriş yap.');b.disabled=true;let error;try{({error}=await db.rpc('market_order_submit_v69',{p_session_token:auth.sessionToken,p_campaign:current.id,p_items:rows.map(r=>({itemId:r.itemId,qty:r.qty})),p_offer:offer}))}catch(failure){error={message:failure?.message||'Market bağlantısı kurulamadı'}}if(error){b.disabled=false;return alert('Teklif gönderilemedi: '+error.message+'\n\nv69-update.sql dosyasını Supabase’te çalıştır.')};writeCart([]);ordersCampaign='';await loadOrders(true);render();toast('Teklif DM’e gönderildi ve DM bildirimi oluşturuldu');return}
    if(b.id==='v66RefreshOrders'){ordersCampaign='';await loadOrders(true);return}
    if(b.dataset.v69DmCounter){const id=b.dataset.v69DmCounter,amount=Math.trunc(+document.querySelector(`[data-v69-dm-amount="${id}"]`)?.value||0),locked=!!document.querySelector(`[data-v69-dm-lock="${id}"]`)?.checked;if(amount<1)return alert('Geçerli bir karşı teklif gir.');b.disabled=true;const {error}=await db.rpc('market_order_counter_v69',{p_session_token:auth.sessionToken,p_campaign:current.id,p_order:id,p_amount:amount,p_locked:locked});if(error){b.disabled=false;return alert(error.message)}ordersCampaign='';await loadOrders(true);toast(locked?'Son fiyat gönderildi':'Karşı teklif gönderildi');return}
    if(b.dataset.v69PlayerCounter){const id=b.dataset.v69PlayerCounter,amount=Math.trunc(+document.querySelector(`[data-v69-player-amount="${id}"]`)?.value||0);if(amount<1)return alert('Geçerli bir karşı teklif gir.');b.disabled=true;const {error}=await db.rpc('market_order_player_counter_v69',{p_session_token:auth.sessionToken,p_campaign:current.id,p_order:id,p_amount:amount});if(error){b.disabled=false;return alert(error.message)}ordersCampaign='';await loadOrders(true);toast('Yeni teklifin DM’e gönderildi');return}
    if(b.id==='v69ClearOrderHistory'){if(!confirm('Tamamlanmış, reddedilmiş ve iptal edilmiş market kayıtları temizlensin mi?'))return;b.disabled=true;const {data,error}=await db.rpc('market_order_clear_history_v69',{p_session_token:auth.sessionToken,p_campaign:current.id});if(error){b.disabled=false;return alert(error.message)}ordersCampaign='';await loadOrders(true);toast(`${data||0} geçmiş kayıt temizlendi`);return}
    if(b.id==='v69RefreshAudit'){auditCampaign='';await loadAudit(true);return}
    if(b.id==='v69ClearAudit'){if(!confirm('DM işlem logunun tamamı silinsin mi? Bu geri alınamaz.'))return;b.disabled=true;const {data,error}=await db.rpc('dm_audit_clear_v69',{p_session_token:auth.sessionToken,p_campaign:current.id});if(error){b.disabled=false;return alert(error.message)}auditCampaign='';await loadAudit(true);toast(`${data||0} log kaydı temizlendi`);return}
    if(b.dataset.v66OrderApprove)return finishOrder(b.dataset.v66OrderApprove,'approve');
    if(b.dataset.v66OrderReject)return finishOrder(b.dataset.v66OrderReject,'reject');
    if(b.dataset.v66OrderAccept)return finishOrder(b.dataset.v66OrderAccept,'accept');
    if(b.dataset.v66OrderCancel)return finishOrder(b.dataset.v66OrderCancel,'cancel');
    if(b.dataset.v66NpcItem!=null){const item=myChar()?.inventory?.[+b.dataset.v66NpcItem];if(!item)return;modal('NPC’ye Eşya Ver',`<label>NPC<select id="v66NpcItemTarget">${state.npcs.map(n=>`<option value="${esc(n.id)}">${esc(n.name)}</option>`).join('')}</select></label><label>Adet<input id="v66NpcItemQty" type="number" min="1" max="${Math.max(1,+item.qty||1)}" value="1"></label><button id="v66NpcItemSend" class="primary" data-index="${b.dataset.v66NpcItem}">Gönder</button>`);return}
    if(b.id==='v66NpcItemSend'||b.id==='v66NpcCoinSend'){const itemMode=b.id==='v66NpcItemSend',args={p_session_token:auth.sessionToken,p_campaign:current.id,p_npc:itemMode?$('#v66NpcItemTarget').value:$('#v66NpcCoinTarget').value,p_kind:itemMode?'item':'coin',p_item_index:itemMode?+b.dataset.index:null,p_coin:itemMode?null:$('#v66NpcCoin').value,p_amount:Math.max(1,Math.trunc(+(itemMode?$('#v66NpcItemQty').value:$('#v66NpcCoinAmount').value)||1))};b.disabled=true;const {error}=await db.rpc('npc_transfer_v66',args);if(error){b.disabled=false;return alert(error.message+'\n\nv69-update.sql dosyasını Supabase’te çalıştır.')};$('#modal')?.close();auditCampaign='';exWalletCampaign=null;await Promise.all([syncFromServer(false),exLoadWallets(true)]);render();toast(itemMode?'Eşya NPC’ye gönderildi':'Para NPC’ye gönderildi');return}
  },true);
  setInterval(()=>{if(page==='market')loadOrders(true);if(page==='auditlog')loadAudit(true)},8000);
  if(current){exEnsureState();render()}
})(typeof window!=='undefined'?window:globalThis);
