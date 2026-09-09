/* Build 77: DM-controlled casino, solo games and shared tables. */
(()=>{
 'use strict';
 const R=window.v77CasinoRules;
 const A=window.v77Casino={data:null,scope:'',loading:false,busy:false,error:'',request:0};
 const h=value=>esc(value??''),isDm=()=>current?.role==='dm';
 const scope=()=>current&&auth?.sessionToken?`${current.id}:${current.role}:${auth.id}:${auth.sessionToken}`:'';
 const opId=()=>globalThis.crypto?.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const n=Math.random()*16|0;return(c==='x'?n:n&3|8).toString(16)});
 const gameBy=id=>(A.data?.games||[]).find(row=>row.id===id);
 const roundFor=id=>(A.data?.rounds||[]).find(row=>row.gameId===id&&row.status==='open');
 const money=value=>typeof exMoney==='function'?exMoney(value):`<span>${h(R.money(value))}</span>`;
 const date=value=>value?new Date(value).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'}):'';
 const outcome={pending:'Bekliyor',win:'Kazandı',partial:'Kısmi ödeme',lose:'Kaybetti',cancelled:'İade edildi'};

 function ensureScope(){const next=scope();if(A.scope!==next){A.scope=next;A.data=null;A.error='';A.loading=false;A.request++}return next}
 function loading(){return `<section class="v77-loading"><span>⬡</span><h2>Masalar hazırlanıyor…</h2><p>Kumarhane defteri ve keseler sayılıyor.</p></section>`}
 function error(){return `<section class="card v77-error"><h3>Kumarhane açılamadı</h3><p>${h(A.error)}</p><button class="ghost" data-v77="reload">Yeniden Dene</button></section>`}
 function statusMark(){const open=A.data?.settings?.isOpen;return `<span class="v77-status ${open?'open':'closed'}"><i></i>${open?'AÇIK':'KAPALI'}</span>`}

 A.load=async(force=false)=>{
  const key=ensureScope();if(!key||A.loading||!force&&A.data)return;
  const request=++A.request;A.loading=true;
  const {data,error}=await db.rpc('casino_load_v77',{p_session_token:auth.sessionToken,p_campaign:current.id});
  if(request!==A.request||scope()!==key)return;
  A.loading=false;
  if(error){A.error=error.message||'Kumarhane yüklenemedi';A.data=null}else{A.error='';A.data=data}
  if(page==='casino')A.refresh();
 };
 A.refresh=()=>{
  if(page!=='casino')return;
  const node=document.querySelector('[data-v77-live]');if(!node)return render();
  const update=()=>{node.innerHTML=A.content()};
  window.kadimUiState?.safeUpdate?window.kadimUiState.safeUpdate(node,update):update();
 };
 A.action=async(action,payload={},operation=opId())=>{
  if(A.busy)return null;A.busy=true;A.refresh();
  const campaign=current.id,{data,error}=await db.rpc('casino_action_v77',{p_session_token:auth.sessionToken,p_campaign:campaign,p_action:action,p_payload:payload,p_operation:operation});
  A.busy=false;
  if(current?.id!==campaign)return null;
  if(error){A.refresh();alert(`${error.message}\n\nKumarhane SQL’i için v77-update.sql uygulanmış olmalı.`);return null}
  A.data=data;A.error='';if(typeof exWalletCampaign!=='undefined')exWalletCampaign=null;A.refresh();
  return {data,operation};
 };

 function hero(){const settings=A.data.settings||{};return `<section class="v77-hero"><div class="v77-crest">♠</div><div><span class="v77-kicker">KADİM ŞANS SALONU</span><h2>${h(settings.title||'Altın Zar Kumarhanesi')}</h2><p>${h(settings.houseNote||'Masaların kaderi zarlarla yazılır.')}</p></div><div class="v77-hero-meta">${statusMark()}${!isDm()?`<span class="v77-wallet"><small>KESEN</small><b>${money(A.data.wallet||0)}</b></span>`:''}</div></section>`}
 function settings(){const row=A.data.settings||{};return `<section class="card v77-settings"><div><span class="v77-kicker">DM KUMANDASI</span><h3>Salon Yönetimi</h3><p>Salon kapalıyken oyuncular bahis koyamaz. Açık masaları yine sonuçlandırabilir veya iade ederek kapatabilirsin.</p></div><div class="v77-settings-form"><label class="v77-switch"><input id="v77Open" data-ui-key="v77-open" type="checkbox" ${row.isOpen?'checked':''}><span></span><b>${row.isOpen?'Kumarhane açık':'Kumarhane kapalı'}</b></label><label>Kumarhane adı<input id="v77Title" data-ui-key="v77-title" maxlength="80" value="${h(row.title)}"></label><label>Kapı yazısı / atmosfer<textarea id="v77HouseNote" data-ui-key="v77-note" maxlength="1000" rows="3">${h(row.houseNote)}</textarea></label><button class="primary" data-v77="settings-save" ${A.busy?'disabled':''}>Salon Ayarlarını Kaydet</button></div></section>`}
 function closedNotice(){return A.data.settings?.isOpen?'':`<section class="v77-closed"><span>♜</span><div><h3>Salon kapıları mühürlü</h3><p>${isDm()?'Ayarları kaydedip salonu açtığında oyuncular bahis koyabilir.':'DM kumarhaneyi açtığında oyun kontrolleri etkinleşecek.'}</p></div></section>`}

 function betButtons(game){const values=[game.minBet,10,100,500,1000,game.maxBet].map(Number).filter(value=>value>=game.minBet&&value<=game.maxBet);return [...new Set(values)].slice(0,5).map(value=>`<button type="button" class="ghost" data-v77-bet="${h(game.id)}" data-amount="${value}">${h(R.money(value))}</button>`).join('')}
 function selectField(game,prefix){const rows=R.selections(game);return rows.length?`<label>${game.kind==='sigil_draw'?'Mührün':'Seçimin'}<select data-ui-key="v77-${prefix}-selection" data-v77-selection>${rows.map(([value,label])=>`<option value="${h(value)}">${h(label)}</option>`).join('')}</select></label>`:''}
 function betBox(game,mode,roundId=''){
  const disabled=A.busy||!A.data.settings?.isOpen||!game.enabled;
  return `<div class="v77-bet-box" data-v77-bet-box="${h(game.id)}">${selectField(game,mode+'-'+game.id)}<label>Bahis (CP)<input data-ui-key="v77-${mode}-${h(game.id)}-bet" data-v77-bet-input type="number" inputmode="numeric" min="${game.minBet}" max="${game.maxBet}" step="1" value="${game.minBet}"></label><div class="v77-quick">${betButtons(game)}</div><button class="primary" data-v77="${mode}" data-game="${h(game.id)}" data-round="${h(roundId)}" ${disabled?'disabled':''}>${mode==='solo'?(game.kind==='wheel'?'Çarkı Döndür':'Bahsi Oyna'):'Masaya Katıl'}</button></div>`
 }
 function participants(round,game){
  const bets=round?.bets||[];
  return `<div class="v77-players">${bets.map(row=>`<div><span class="v77-avatar">${h((row.playerName||'?').slice(0,1).toUpperCase())}</span><span><b>${h(row.playerName)}</b><small>${money(row.stake)}${row.selection?.choice&&row.selection.choice!=='d20'?` · ${h(R.selections(game).find(x=>x[0]===row.selection.choice)?.[1]||row.selection.choice)}`:''}</small></span></div>`).join('')||'<p>İlk bahis henüz konmadı.</p>'}</div>`
 }
 function roundResult(round,game){
  const result=round?.result||{};
  if(round.status==='cancelled')return `Masa iptal edildi · ${R.money(result.refunded||0)} iade`;
  if(game.kind==='high_roll')return `En yüksek zar ${result.highestRoll||'—'} · ${result.winnerCount||0} kazanan · ${R.money(result.pot||0)} pot`;
  if(game.kind==='sigil_draw')return `${result.drawnSeal||'—'}. mühür · ${result.winnerCount||0} kazanan · ${R.money(result.pot||0)} pot`;
  return '';
 }
 function tableArea(game){
  const round=roundFor(game.id),open=A.data.settings?.isOpen&&game.enabled;
  if(!round)return isDm()?`<div class="v77-table-empty"><p>Bu oyun için açık masa yok.</p><button class="primary" data-v77="round-open" data-game="${h(game.id)}" ${A.busy||!open?'disabled':''}>Yeni Masa Aç</button></div>`:`<div class="v77-table-empty"><p>DM bu oyun için henüz masa açmadı.</p></div>`;
  const own=(round.bets||[]).find(row=>row.userId===auth.id),minimum=Number(game.config?.minPlayers||2),ready=(round.bets||[]).length>=minimum;
  return `<div class="v77-round"><header><span><small>AÇIK MASA</small><b>${round.bets.length}/${game.config?.maxPlayers||10} oyuncu</b></span><span>En az ${minimum}</span></header>${participants(round,game)}${isDm()?`<div class="v77-round-actions"><button class="primary" data-v77="round-resolve" data-round="${h(round.id)}" ${A.busy||!ready?'disabled':''}>Zarları At ve Sonuçlandır</button><button class="danger" data-v77="round-cancel" data-round="${h(round.id)}" ${A.busy?'disabled':''}>İptal Et · İade</button></div>${ready?'':`<p class="v77-hint">Sonuç için ${minimum-round.bets.length} oyuncu daha gerekli.</p>`}`:own?`<div class="v77-joined">✓ Bahsin masada. DM’nin zarları atması bekleniyor.</div>`:betBox(game,'round-join',round.id)}</div>`;
 }
 function gameCard(game){
  const meta=R.KINDS[game.kind]||{label:game.kind,icon:'◇'},active=roundFor(game.id);
  return `<article class="v77-game ${game.enabled?'':'disabled'}" data-entity-id="${h(game.id)}"><header><span class="v77-game-icon">${meta.icon}</span><span><small>${h(meta.label)} · ${game.mode==='solo'?'TEK KİŞİ':'ÇOK OYUNCULU'}</small><h3>${h(game.name)}</h3></span>${isDm()?`<button class="ghost" data-v77="game-edit" data-game="${h(game.id)}" ${A.busy||active?'disabled':''}>Düzenle</button>`:''}</header><p>${h(game.description)}</p><div class="v77-rules"><span>Bahis ${R.money(game.minBet)} – ${R.money(game.maxBet)}</span><span>${h(R.configSummary(game))}</span>${!game.enabled?'<b>DM TARAFINDAN KAPALI</b>':''}</div>${game.mode==='solo'?(isDm()?'<div class="v77-spectator">Oyuncu tek atışta oynar; sonuç ve ödeme sunucuda hesaplanır.</div>':betBox(game,'solo')):tableArea(game)}</article>`
 }
 function games(){const all=A.data.games||[],solo=all.filter(row=>row.mode==='solo'),tables=all.filter(row=>row.mode==='table');return `<section class="v77-section"><div class="v77-section-title"><div><span class="v77-kicker">HIZLI OYUNLAR</span><h2>Tek Kişilik Şans Oyunları</h2><p>Seçimini ve bahsini koy; sonuç tek hamlede belli olsun.</p></div><b>${solo.length}</b></div><div class="v77-grid">${solo.map(gameCard).join('')}</div></section><section class="v77-section"><div class="v77-section-title"><div><span class="v77-kicker">ORTAK MASALAR</span><h2>Çok Oyunculu Oyunlar</h2><p>Bahisler ortak potta toplanır; DM masayı sonuçlandırır.</p></div><b>${tables.length}</b></div><div class="v77-grid table">${tables.map(gameCard).join('')}</div></section>`}

 function historyRow(play){const game=gameBy(play.gameId)||{kind:play.gameKind,name:play.gameName},net=Number(play.payout||0)-Number(play.stake||0),detail=R.result(game,play);return `<article class="v77-history-row ${h(play.outcome)}"><span class="v77-history-mark">${play.outcome==='win'?'♛':play.outcome==='lose'?'×':play.outcome==='cancelled'?'↶':'◇'}</span><div><header><b>${h(play.gameName||game.name)}</b><span>${h(outcome[play.outcome]||play.outcome)}</span></header><p>${isDm()?`${h(play.playerName)} · `:''}${detail?h(detail)+' · ':''}${play.roundId?'Masa oyunu':'Tek kişilik oyun'}</p><small>${date(play.resolvedAt||play.createdAt)}</small></div><div class="v77-history-money"><small>BAHİS</small><b>${money(play.stake)}</b><span class="${net>=0?'up':'down'}">${net>=0?'+':'−'}${R.money(Math.abs(net))}</span></div></article>`}
 function history(){const rows=A.data.history||[];return `<section class="v77-section v77-history"><div class="v77-section-title"><div><span class="v77-kicker">KASA DEFTERİ</span><h2>${isDm()?'Tüm Oyun Geçmişi':'Oyun Geçmişim'}</h2><p>Bahis, ödeme ve sonuçlar sessizce burada kaydedilir.</p></div>${isDm()&&rows.length?`<button class="danger" data-v77="history-clear" ${A.busy?'disabled':''}>Geçmişi Temizle</button>`:`<b>${rows.length}</b>`}</div><div class="v77-history-list">${rows.map(historyRow).join('')||'<div class="v77-empty">Henüz sonuçlanan bir bahis yok.</div>'}</div></section>`}
 A.content=()=>A.loading&&!A.data?loading():A.error?error():A.data?`${hero()}${isDm()?settings():''}${closedNotice()}${games()}${history()}`:loading();
 function pageView(){queueMicrotask(()=>A.load());return `<div class="v77-page" data-v77-live>${A.content()}</div>`}

 function configFields(game){const cfg=game.config||{};
  if(game.kind==='coin_flip')return `<label>Kazanç çarpanı<input name="multiplier" type="number" min="1" max="10" step="0.05" value="${Number(cfg.winMultiplierBps||19000)/10000}"></label>`;
  if(game.kind==='bone_dice')return `<div class="v77-edit-grid"><label>Düşük / yüksek çarpanı<input name="lowHigh" type="number" min="1" max="10" step="0.05" value="${Number(cfg.lowHighMultiplierBps||20000)/10000}"></label><label>Tam yedi çarpanı<input name="seven" type="number" min="1" max="10" step="0.05" value="${Number(cfg.sevenMultiplierBps||50000)/10000}"></label></div>`;
  if(game.kind==='shells')return `<div class="v77-edit-grid"><label>Kupa sayısı<input name="cups" type="number" min="2" max="10" step="1" value="${cfg.cupCount||3}"></label><label>Kazanç çarpanı<input name="multiplier" type="number" min="1" max="10" step="0.05" value="${Number(cfg.winMultiplierBps||27000)/10000}"></label></div>`;
  if(game.kind==='wheel')return `<label>Çark dilimleri · çarpanları virgülle ayır<input name="segments" value="${h((cfg.segments||[]).map(value=>Number(value)/10000).join(', '))}"><small>Örnek: 0, 0, 0.5, 1, 1.5, 2, 3 · en az 4, en çok 20 dilim.</small></label>`;
  return `<div class="v77-edit-grid"><label>Kasa payı (%)<input name="houseCut" type="number" min="0" max="25" step="0.25" value="${Number(cfg.houseCutBps||0)/100}"></label><label>En az oyuncu<input name="minPlayers" type="number" min="2" max="12" step="1" value="${cfg.minPlayers||2}"></label><label>En çok oyuncu<input name="maxPlayers" type="number" min="2" max="20" step="1" value="${cfg.maxPlayers||10}"></label>${game.kind==='sigil_draw'?`<label>Mühür sayısı<input name="sides" type="number" min="2" max="12" step="1" value="${cfg.sides||6}"></label>`:''}</div>`;
 }
 function editGame(game){modal('Kumarhane Oyununu Düzenle',`<div class="v77-editor" data-v77-editor="${h(game.id)}"><div class="v77-editor-head"><span>${R.KINDS[game.kind]?.icon||'◇'}</span><div><small>${h(R.KINDS[game.kind]?.label||game.kind)}</small><h3>${h(game.name)}</h3></div></div><label class="v77-editor-check"><input name="enabled" type="checkbox" ${game.enabled?'checked':''}> Oyunculara açık</label><label>Oyun adı<input name="name" maxlength="80" value="${h(game.name)}"></label><label>Açıklama<textarea name="description" maxlength="1000" rows="4">${h(game.description)}</textarea></label><div class="v77-edit-grid"><label>En az bahis (CP)<input name="minBet" type="number" min="1" max="2000000000" value="${game.minBet}"></label><label>En çok bahis (CP)<input name="maxBet" type="number" min="1" max="2000000000" value="${game.maxBet}"></label></div>${configFields(game)}<div class="v77-editor-actions"><button type="button" class="primary" data-v77="game-save" data-game="${h(game.id)}">Ayarları Kaydet</button><button type="button" class="ghost" data-modal-close>Vazgeç</button></div></div>`)}
 function readConfig(game,form){const n=name=>Number(form.querySelector(`[name="${name}"]`)?.value);if(game.kind==='coin_flip')return{winMultiplierBps:Math.round(n('multiplier')*10000)};if(game.kind==='bone_dice')return{lowHighMultiplierBps:Math.round(n('lowHigh')*10000),sevenMultiplierBps:Math.round(n('seven')*10000)};if(game.kind==='shells')return{cupCount:Math.round(n('cups')),winMultiplierBps:Math.round(n('multiplier')*10000)};if(game.kind==='wheel')return{segments:(form.querySelector('[name="segments"]')?.value||'').split(',').map(value=>Math.round(Number(value.trim())*10000))};return{houseCutBps:Math.round(n('houseCut')*100),minPlayers:Math.round(n('minPlayers')),maxPlayers:Math.round(n('maxPlayers')),sides:game.kind==='sigil_draw'?Math.round(n('sides')):20}}
 function showSoloResult(data,operation){const play=(data.history||[]).find(row=>row.operationId===operation),game=play&&gameBy(play.gameId);if(!play||!game)return;const net=play.payout-play.stake,won=play.outcome==='win';modal(won?'Kader Yüzüne Güldü':play.outcome==='partial'?'Kısmi Ödeme':'Kasa Kazandı',`<div class="v77-result ${h(play.outcome)}"><span>${won?'♛':play.outcome==='partial'?'◇':'♜'}</span><h3>${h(game.name)}</h3><p>${h(R.result(game,play))}</p><div><small>Bahis ${R.money(play.stake)}</small><b>${net>=0?'+':'−'}${h(R.money(Math.abs(net)))}</b><small>Ödeme ${R.money(play.payout)}</small></div><button type="button" class="primary" data-modal-close>Tamam</button></div>`)}

 function install(nav){if(nav.some(row=>row[0]==='casino'))return;const index=nav.findIndex(row=>row[0]==='market');nav.splice(index<0?nav.length:index+1,0,['casino','♠','Kumarhane'])}
 install(dmNav);install(playerNav);dmPages.casino=pageView;playerPages.casino=pageView;window.kadimUiState?.registerPage('casino',[]);

 document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.v77Bet){const box=button.closest('[data-v77-bet-box]'),input=box?.querySelector('[data-v77-bet-input]');if(input){input.value=button.dataset.amount;window.kadimUiState?.markDirty(input)}return}
  const action=button.dataset.v77;if(!action||!current)return;
  if(action==='reload'){A.data=null;await A.load(true);return}
  if(action==='settings-save'){const payload={isOpen:document.querySelector('#v77Open')?.checked,title:document.querySelector('#v77Title')?.value.trim(),houseNote:document.querySelector('#v77HouseNote')?.value.trim()};const result=await A.action('settings_save',payload);if(result)toast(payload.isOpen?'Kumarhane açıldı':'Kumarhane kapatıldı');return}
  if(action==='game-edit'){const game=gameBy(button.dataset.game);if(game)editGame(game);return}
  if(action==='game-save'){const game=gameBy(button.dataset.game),form=button.closest('[data-v77-editor]');if(!game||!form)return;const payload={gameId:game.id,enabled:form.querySelector('[name="enabled"]').checked,name:form.querySelector('[name="name"]').value.trim(),description:form.querySelector('[name="description"]').value.trim(),minBet:Math.round(Number(form.querySelector('[name="minBet"]').value)),maxBet:Math.round(Number(form.querySelector('[name="maxBet"]').value)),config:readConfig(game,form)};const result=await A.action('game_save',payload);if(result){document.querySelector('#modal')?.close();toast('Oyun ayarları kaydedildi')}return}
  if(action==='solo'){const game=gameBy(button.dataset.game),box=button.closest('[data-v77-bet-box]'),bet=Math.round(Number(box?.querySelector('[data-v77-bet-input]')?.value)),selection=box?.querySelector('[data-v77-selection]')?.value||'spin',operation=opId();if(!game||!Number.isFinite(bet))return alert('Geçerli bir bahis yaz.');const result=await A.action('solo_play',{gameId:game.id,bet,selection},operation);if(result)showSoloResult(result.data,operation);return}
  if(action==='round-open'){const result=await A.action('round_open',{gameId:button.dataset.game});if(result)toast('Yeni oyun masası açıldı');return}
  if(action==='round-join'){const box=button.closest('[data-v77-bet-box]'),bet=Math.round(Number(box?.querySelector('[data-v77-bet-input]')?.value)),selection=box?.querySelector('[data-v77-selection]')?.value||'';if(!Number.isFinite(bet))return alert('Geçerli bir bahis yaz.');const result=await A.action('round_join',{roundId:button.dataset.round,bet,selection});if(result)toast('Bahsin masaya kondu');return}
  if(action==='round-resolve'){const result=await A.action('round_resolve',{roundId:button.dataset.round});if(result)toast('Masa sonuçlandı ve ödemeler yapıldı');return}
  if(action==='round-cancel'){if(!confirm('Masa iptal edilip bütün bekleyen bahisler eksiksiz iade edilsin mi?'))return;const result=await A.action('round_cancel',{roundId:button.dataset.round});if(result)toast('Masa kapatıldı; bahisler iade edildi');return}
  if(action==='history-clear'){if(!confirm('Kapanmış tüm kumarhane oyun geçmişi temizlensin mi? Para hareketleri geri alınmaz.'))return;const result=await A.action('history_clear',{});if(result)toast('Kumarhane geçmişi temizlendi')}
 },true);
 document.addEventListener('change',event=>{if(event.target?.id==='v77Open'){const label=event.target.closest('.v77-switch')?.querySelector('b');if(label)label.textContent=event.target.checked?'Kumarhane açık':'Kumarhane kapalı'}});
 setInterval(()=>{if(page==='casino')A.load(true)},6500);
 if(current)render();
})();
