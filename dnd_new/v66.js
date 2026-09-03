/* v66: focus readiness, negotiated market cart and player-to-NPC transfers. */
((root)=>{
  'use strict';
  let orders=[],ordersCampaign='',ordersLoading=false,ordersError='';
  const cartKey=()=>`kadim-cart-v66:${current?.id||''}:${auth?.id||''}`;
  const readCart=()=>{try{return JSON.parse(localStorage.getItem(cartKey())||'[]')}catch{return []}};
  const writeCart=rows=>localStorage.setItem(cartKey(),JSON.stringify(rows));
  const money=n=>typeof exMoney==='function'?exMoney(n):`${n} CP`;
  const orderPrice=o=>o.dm_offer??o.player_offer;
  const orderStatus={pending:'DM yanıtı bekliyor',countered:'Karşı teklif geldi',completed:'Tamamlandı',rejected:'Reddedildi',cancelled:'İptal edildi'};

  const oldEnsure=exEnsureState;
  function classFocus(item){const allowed=Array.isArray(item?.classRestriction)?item.classRestriction:[];if(!allowed.length)return 'universal';const groups=new Set(allowed.map(name=>['Cleric','Paladin'].includes(name)?'divine':['Druid','Ranger'].includes(name)?'druidic':name==='Bard'?'instrument':'arcane'));return groups.size===1?[...groups][0]:'universal'}
  function focusKind(item){if(['arcane','divine','druidic','instrument','universal'].includes(item?.focusType))return item.focusType;const text=`${item?.name||''} ${item?.effect||''} ${item?.note||''}`.toLocaleLowerCase('tr-TR');if(/kutsal sembol|kutsal odak|holy symbol/.test(text))return 'divine';if(/druid (odağı|totemi)|druidic focus/.test(text))return 'druidic';if(/lavta|çalgı|instrument/.test(text))return 'instrument';if(/component pouch|bileşen (kesesi|çantası)/.test(text))return 'universal';if(/arcane focus|savaş büyücüsü değneği|war mage/.test(text))return 'arcane';if(item?.category==='focus'||item?.slot==='focus'||/büyü odağı/.test(text))return classFocus(item);return ''}
  function upgradeFocus(item){const kind=focusKind(item),text=`${item?.name||''} ${item?.effect||''}`.toLocaleLowerCase('tr-TR'),pouch=/component pouch|bileşen (kesesi|çantası)/.test(text);if(!kind||(item.category==='component'&&!pouch))return false;let changed=false;if(!item.focusType){item.focusType=kind;changed=true}if(!item.slot){item.slot='focus';changed=true}if(!item.category||['tool','trinket'].includes(item.category)||pouch){item.category='focus';changed=true}return changed}
  root.v66FocusKind=focusKind;
  root.v66InventoryItemActions=(item,index)=>current?.role==='player'&&(state.npcs||[]).length?`<button class="ghost" data-v66-npc-item="${index}">NPC’ye Ver</button>`:'';
  exEnsureState=function(){oldEnsure();if(current?.role!=='dm')return;let changed=false;state.market=Array.isArray(state.market)?state.market:[];if((+state.shopSeedVersion||0)<8){for(const item of V66_CASTER_MARKET)if(!state.market.some(x=>x.id===item.id||x.name===item.name)){state.market.push({...item});changed=true}state.shopSeedVersion=8;changed=true}if((+state.focusSchemaVersion||0)<2){const groups=[state.market,state.guildInventory,state.groundLoot,...(state.characters||[]).map(c=>c.inventory),...(state.npcs||[]).map(n=>n.inventory)];for(const rows of groups)for(const item of Array.isArray(rows)?rows:[])changed=upgradeFocus(item)||changed;state.focusSchemaVersion=2;changed=true}if(changed)setTimeout(save,0)};

  async function loadOrders(force=false){
    if(!auth?.sessionToken||!current||ordersLoading||(!force&&ordersCampaign===current.id))return;
    ordersLoading=true;const campaign=current.id,{data,error}=await db.rpc('market_order_list_v66',{p_session_token:auth.sessionToken,p_campaign:campaign});ordersLoading=false;
    if(current?.id!==campaign)return;if(error){orders=[];ordersError=error.message||'Teklifler alınamadı';ordersCampaign=campaign;if(page==='market')render();return}orders=data||[];ordersError='';ordersCampaign=campaign;if(page==='market')render();
  }
  function cartRows(){return readCart().map(row=>{const item=state.market.find(x=>x.id===row.itemId);return item?{...row,item,price:exPrice(item)}:null}).filter(Boolean)}
  function cartPanel(){
    const rows=cartRows(),total=rows.reduce((n,r)=>n+r.price*r.qty,0);
    return `<section class="card v66-cart"><div class="between row"><div><span class="v26-kicker">PAZARLIK SEPETİ</span><h2>Sepet <span class="v66-cart-count">${rows.reduce((n,r)=>n+r.qty,0)}</span></h2></div><b>${money(total)}</b></div><div class="v66-cart-lines">${rows.map(r=>`<div class="v66-cart-line"><span><b>${esc(r.item.name)}</b><small>${money(r.price)} × ${r.qty}</small></span><div><button class="ghost" data-v66-cart-minus="${esc(r.itemId)}">−</button><button class="ghost" data-v66-cart-plus="${esc(r.itemId)}" ${r.qty>=r.item.stock?'disabled':''}>＋</button><button class="danger" data-v66-cart-remove="${esc(r.itemId)}">×</button></div></div>`).join('')||'<div class="empty">Sepet boş. Ürün kartlarından eşya ekle.</div>'}</div>${rows.length?`<div class="v66-cart-actions"><label>Teklifin (CP)<input id="v66CartOffer" type="number" min="1" max="${total}" value="${total}"></label><button id="v66SubmitCart" class="primary">DM’e Teklif Gönder</button><button id="v66ClearCart" class="ghost">Sepeti Temizle</button></div><p class="muted">DM kabul edebilir, reddedebilir veya karşı teklif yollar. Para ve stok yalnız son onayda değişir.</p>`:''}</section>`;
  }
  function ordersPanel(){
    const visible=orders.filter(o=>current.role==='dm'||o.user_id===auth.id);
    return `<section class="card v66-orders"><div class="between row"><div><span class="v26-kicker">TEKLİF MASASI</span><h2>${current.role==='dm'?'Gelen Sepetler':'Tekliflerim'}</h2></div><button id="v66RefreshOrders" class="ghost">Yenile</button></div><div class="v66-order-list">${visible.map(o=>`<article class="v66-order"><header><span><b>${esc(o.player_name)}</b><small>${esc(orderStatus[o.status]||o.status)}</small></span><b>${money(orderPrice(o))}</b></header><ul>${(o.items||[]).map(i=>`<li>${esc(i.name)} ×${i.qty}</li>`).join('')}</ul><small>Liste: ${money(o.list_total)} • Oyuncu: ${money(o.player_offer)}${o.dm_offer?` • DM: ${money(o.dm_offer)}`:''}</small><div class="v66-order-actions">${current.role==='dm'&&o.status==='pending'?`<button class="primary" data-v66-order-approve="${o.id}">Kabul Et</button>`:''}${current.role==='dm'&&['pending','countered'].includes(o.status)?`<button class="ghost" data-v66-order-counter="${o.id}" data-max="${o.list_total}">Karşı Teklif</button><button class="danger" data-v66-order-reject="${o.id}">Reddet</button>`:''}${current.role==='player'&&o.status==='countered'?`<button class="primary" data-v66-order-accept="${o.id}">Karşı Teklifi Kabul Et</button>`:''}${current.role==='player'&&['pending','countered'].includes(o.status)?`<button class="danger" data-v66-order-cancel="${o.id}">İptal Et</button>`:''}</div></article>`).join('')||(ordersError?`<div class="empty">${esc(ordersError)}</div>`:'<div class="empty">Henüz teklif yok.</div>')}</div></section>`;
  }

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
  const oldInventory=playerPages.inventory;
  playerPages.inventory=()=>`${oldInventory()}${(state.npcs||[]).length?`<section class="card v66-npc-transfer"><span class="v26-kicker">NPC TRANSFERİ</span><h2>NPC’ye Para Gönder</h2><div class="v66-transfer-grid"><label>NPC<select id="v66NpcCoinTarget">${state.npcs.map(n=>`<option value="${esc(n.id)}">${esc(n.name)}</option>`).join('')}</select></label><label>Para<select id="v66NpcCoin"><option value="gold">GP</option><option value="silver">SP</option><option value="copper">CP</option><option value="platinum">PP</option></select></label><label>Miktar<input id="v66NpcCoinAmount" type="number" min="1" value="1"></label><button id="v66NpcCoinSend" class="primary">Gönder</button></div></section>`:''}`;

  async function finishOrder(id,action){const {error}=await db.rpc('market_order_finish_v66',{p_session_token:auth.sessionToken,p_campaign:current.id,p_order:id,p_action:action});if(error)return alert(error.message);ordersCampaign='';exWalletCampaign=null;await Promise.all([loadOrders(true),syncFromServer(false),exLoadWallets(true)]);render();toast('Teklif işlemi tamamlandı')}
  document.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b||!current)return;
    if(b.dataset.v66CartAdd){event.preventDefault();event.stopImmediatePropagation();const item=state.market.find(x=>x.id===b.dataset.v66CartAdd),cart=readCart(),row=cart.find(x=>x.itemId===item?.id);if(!item)return;if(row)row.qty=Math.min(item.stock,row.qty+1);else cart.push({itemId:item.id,qty:1});writeCart(cart);render();toast(item.name+' sepete eklendi');return}
    for(const [key,delta] of [['v66CartPlus',1],['v66CartMinus',-1]])if(b.dataset[key]){const cart=readCart(),row=cart.find(x=>x.itemId===b.dataset[key]);if(row)row.qty+=delta;writeCart(cart.filter(x=>x.qty>0));render();return}
    if(b.dataset.v66CartRemove){writeCart(readCart().filter(x=>x.itemId!==b.dataset.v66CartRemove));render();return}
    if(b.id==='v66ClearCart'){writeCart([]);render();return}
    if(b.id==='v66SubmitCart'){const rows=cartRows(),offer=Math.trunc(+$('#v66CartOffer')?.value||0);if(!rows.length)return;b.disabled=true;const {error}=await db.rpc('market_order_submit_v66',{p_session_token:auth.sessionToken,p_campaign:current.id,p_items:rows.map(r=>({itemId:r.itemId,qty:r.qty})),p_offer:offer});if(error){b.disabled=false;return alert(error.message+'\n\nv66-update.sql dosyasını Supabase’te çalıştır.')};writeCart([]);ordersCampaign='';await loadOrders(true);render();toast('Teklif DM’e gönderildi');return}
    if(b.id==='v66RefreshOrders'){ordersCampaign='';await loadOrders(true);return}
    if(b.dataset.v66OrderCounter){const amount=Math.trunc(+(prompt('Karşı teklif (CP)',String(b.dataset.max))||0));if(!amount)return;const {error}=await db.rpc('market_order_counter_v66',{p_session_token:auth.sessionToken,p_campaign:current.id,p_order:b.dataset.v66OrderCounter,p_amount:amount});if(error)return alert(error.message);ordersCampaign='';await loadOrders(true);toast('Karşı teklif gönderildi');return}
    if(b.dataset.v66OrderApprove)return finishOrder(b.dataset.v66OrderApprove,'approve');
    if(b.dataset.v66OrderReject)return finishOrder(b.dataset.v66OrderReject,'reject');
    if(b.dataset.v66OrderAccept)return finishOrder(b.dataset.v66OrderAccept,'accept');
    if(b.dataset.v66OrderCancel)return finishOrder(b.dataset.v66OrderCancel,'cancel');
    if(b.dataset.v66NpcItem!=null){const item=myChar()?.inventory?.[+b.dataset.v66NpcItem];if(!item)return;modal('NPC’ye Eşya Ver',`<label>NPC<select id="v66NpcItemTarget">${state.npcs.map(n=>`<option value="${esc(n.id)}">${esc(n.name)}</option>`).join('')}</select></label><label>Adet<input id="v66NpcItemQty" type="number" min="1" max="${Math.max(1,+item.qty||1)}" value="1"></label><button id="v66NpcItemSend" class="primary" data-index="${b.dataset.v66NpcItem}">Gönder</button>`);return}
    if(b.id==='v66NpcItemSend'||b.id==='v66NpcCoinSend'){const itemMode=b.id==='v66NpcItemSend',args={p_session_token:auth.sessionToken,p_campaign:current.id,p_npc:itemMode?$('#v66NpcItemTarget').value:$('#v66NpcCoinTarget').value,p_kind:itemMode?'item':'coin',p_item_index:itemMode?+b.dataset.index:null,p_coin:itemMode?null:$('#v66NpcCoin').value,p_amount:Math.max(1,Math.trunc(+(itemMode?$('#v66NpcItemQty').value:$('#v66NpcCoinAmount').value)||1))};b.disabled=true;const {error}=await db.rpc('npc_transfer_v66',args);if(error){b.disabled=false;return alert(error.message+'\n\nv66-update.sql dosyasını Supabase’te çalıştır.')};$('#modal')?.close();exWalletCampaign=null;await Promise.all([syncFromServer(false),exLoadWallets(true)]);render();toast(itemMode?'Eşya NPC’ye gönderildi':'Para NPC’ye gönderildi');return}
  },true);
  setInterval(()=>{if(page==='market')loadOrders(true)},8000);
  if(current){exEnsureState();render()}
})(typeof window!=='undefined'?window:globalThis);
