/* Build 78: XP-driven character levels and detailed progression UI. */
(function(){
  'use strict';
  const R=window.v78Xp;if(!R)return;
  const number=value=>Math.max(0,Math.trunc(Number(value)||0)).toLocaleString('tr-TR');
  const signedNumber=value=>`${Number(value)>=0?'+':'−'}${number(Math.abs(Number(value)||0))}`;
  const time=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?'Tarih yok':date.toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};

  function syncLevel(character,targetLevel){
    const oldLevel=Math.max(1,+character.level||1);if(oldLevel===targetLevel)return false;
    const oldMax=Math.max(1,+character.maxHp||1),currentHp=character.hp==null?oldMax:+character.hp,ratio=Math.max(0,Math.min(1,currentHp/oldMax));
    character.level=targetLevel;
    if(typeof prStats==='function')character.stats=prStats(character);
    if(character.autoVitals!==false&&typeof prAutoHP==='function'){
      character.maxHp=prAutoHP(character);character.hp=Math.round(character.maxHp*ratio);
      if(typeof prAutoAC==='function')character.ac=prAutoAC(character);
    }
    return true;
  }
  function ensureCharacter(character){
    const normalized=R.normalize(character),changed=character.xp!==normalized.xp||character.level!==normalized.level||!Array.isArray(character.xpHistory);
    character.xp=normalized.xp;character.xpHistory=normalized.xpHistory;syncLevel(character,normalized.level);return changed;
  }
  function thresholdRows(activeLevel){
    return R.THRESHOLDS.map((xp,index)=>`<span class="${index+1===activeLevel?'active':''}"><b>Lv ${index+1}</b><small>${number(xp)} XP</small></span>`).join('');
  }
  function historyRows(character,limit=8){
    const rows=(character.xpHistory||[]).slice(0,limit);
    return rows.map(row=>`<article><div><b>${signedNumber(row.delta)} XP</b><small>${esc(row.reason||'XP düzenlemesi')}</small></div><span>${number(row.beforeXp)} → ${number(row.afterXp)}</span><small>${esc(row.actor||'DM')} · ${time(row.at)}</small>${row.beforeLevel!==row.afterLevel?`<em>Lv ${row.beforeLevel} → ${row.afterLevel}</em>`:''}</article>`).join('')||'<p class="empty">Henüz XP işlemi yok.</p>';
  }
  function panel(character,options={}){
    ensureCharacter(character);const p=R.progress(character),compact=!!options.compact;
    return `<section class="v78-xp-panel ${compact?'compact':''}" data-v78-xp-panel="${esc(character.id||'')}"><div class="v78-xp-head"><div><small>XP İLERLEMESİ</small><h3>Seviye ${p.level}${p.next==null?' · Ustalık sınırı':''}</h3></div><strong>${number(p.xp)} <small>XP</small></strong></div><div class="v78-xp-track" role="progressbar" aria-label="Seviye ${p.level} XP ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(p.percent)}"><i style="width:${p.percent.toFixed(2)}%"></i></div><div class="v78-xp-facts"><span><small>Bu seviyede</small><b>${number(p.earned)}${p.next==null?' XP':` / ${number(p.span)} XP`}</b></span><span><small>${p.next==null?'Seviye sınırı':'Sonraki seviye'}</small><b>${p.next==null?'Lv 20':`Lv ${p.level+1} · ${number(p.next)} XP`}</b></span><span><small>${p.next==null?'Toplam deneyim':'Kalan'}</small><b>${p.next==null?`${number(p.xp)} XP`:`${number(p.remaining)} XP`}</b></span></div>${compact?'':`<details class="v78-xp-thresholds"><summary>1–20 XP eşiklerini göster</summary><div>${thresholdRows(p.level)}</div></details><details class="v78-xp-history"><summary>Son XP işlemleri (${(character.xpHistory||[]).length})</summary><div>${historyRows(character)}</div></details>`}</section>`;
  }
  function modalBody(character){
    return `${panel(character)}<div class="v78-xp-quick"><button type="button" class="ghost" data-v78-quick="${esc(character.id)}|50">+50</button><button type="button" class="ghost" data-v78-quick="${esc(character.id)}|100">+100</button><button type="button" class="ghost" data-v78-quick="${esc(character.id)}|250">+250</button><button type="button" class="ghost" data-v78-quick="${esc(character.id)}|500">+500</button></div><div class="v78-xp-form"><label>İşlem<select id="v78XpMode"><option value="add">XP ekle</option><option value="remove">XP çıkar</option><option value="set">Toplam XP’yi ayarla</option></select></label><label>Miktar<input id="v78XpAmount" class="input" type="number" min="0" max="${R.MAX_XP}" step="1" value="100"></label><label class="wide">Neden<input id="v78XpReason" class="input" maxlength="240" placeholder="Görev, savaş, keşif, düzeltme…"></label><button type="button" id="v78ApplyXp" class="primary" data-character="${esc(character.id)}">Uygula</button>${character.xpHistory?.length?`<button type="button" class="ghost" data-v78-undo="${esc(character.id)}">Son işlemi geri al</button>`:''}</div>`;
  }
  function partyBody(){
    return `<p class="muted">Seçili karakterlerin her birine aynı miktarda XP eklenir. Seviye eşiği geçilirse seviye otomatik değişir.</p><label>Kişi başı XP<input id="v78PartyAmount" class="input" type="number" min="1" max="${R.MAX_XP}" step="1" value="100"></label><label>Neden<input id="v78PartyReason" class="input" maxlength="240" placeholder="Oturum ödülü, görev tamamlandı…"></label><fieldset><legend>Karakterler</legend><div class="v78-party-list">${(state.characters||[]).map(character=>`<label><input type="checkbox" data-v78-party-character value="${esc(character.id)}" checked><span>${esc(character.name)}<small>Lv ${character.level} · ${number(R.total(character))} XP</small></span></label>`).join('')||'<p class="empty">Karakter yok.</p>'}</div></fieldset><button type="button" id="v78ApplyPartyXp" class="primary">Seçili karakterlere ver</button>`;
  }
  function openManager(character){modal(`${character.name} — XP Yönetimi`,modalBody(character))}
  function refreshManager(character){
    const dialog=$('#modal');if(!dialog?.open)return;$('#modalTitle').textContent=`${character.name} — XP Yönetimi`;$('#modalBody').innerHTML=modalBody(character);
  }
  function applyToCharacter(character,operation){
    ensureCharacter(character);const result=R.apply(character,{...operation,id:operation.id||uid(),at:operation.at||new Date().toISOString(),actor:operation.actor||auth?.name||'DM'});
    if(!result.changed)return result;
    character.xp=result.character.xp;character.xpHistory=result.character.xpHistory;syncLevel(character,result.character.level);return result;
  }
  function saveAndRender(message){save();render();if(message)toast(message)}

  const ensureBase=prEnsure;
  prEnsure=function(){const out=ensureBase();for(const character of state.characters||[])ensureCharacter(character);return out};

  const progressBase=prProgress;
  prProgress=function(character){return `${panel(character)}${progressBase(character)}`};

  const dashBase=playerDash;
  playerDash=function(){
    const character=myChar(),html=dashBase();if(!character)return html;ensureCharacter(character);const xp=panel(character,{compact:true});
    return html.includes('<div class="v46-character-page">')?html.replace('<div class="v46-character-page">',`<div class="v46-character-page">${xp}`):`${xp}${html}`;
  };

  if(typeof v27CharActions==='function'){
    const actionsBase=v27CharActions;
    v27CharActions=function(character){
      const button=`<button class="ghost" data-v78-manage-xp="${esc(character.id)}">XP Yönet</button>`;
      return actionsBase(character).replace(/<button class="ghost" data-pr-level="[^"]+">Seviye<\/button>/,button);
    };
  }

  const formBase=charForm;
  charForm=function(character={},userId=''){
    const normalized=R.normalize(character),html=formBase({...character,level:normalized.level},userId),old=field('cLevel','Seviye','number',normalized.level);
    return html.replace(old,`<label>Seviye <small>(XP ile otomatik)</small><input class="input" id="cLevel" type="number" value="${normalized.level}" disabled><small class="v78-form-note">Değiştirmek için karakter kartındaki XP Yönet’i kullan.</small></label>`);
  };

  const partyBase=dmPages.party;
  dmPages.party=function(){
    const award=`<section class="card v78-party-award"><div><small>XP TABANLI İLERLEME</small><h3>Parti Deneyimi</h3><p>Milestone yerine toplam XP kullanılır; eşik geçilince seviye otomatik artar.</p></div><button type="button" id="v78PartyXp" class="primary">Partiye XP Ver</button></section>`;
    return award+partyBase();
  };

  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!current)return;
    if(button.dataset.v78ManageXp){event.preventDefault();event.stopImmediatePropagation();if(current.role!=='dm')return;const character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.v78ManageXp));if(character)openManager(character);return}
    if(button.id==='v78PartyXp'){event.preventDefault();event.stopImmediatePropagation();if(current.role==='dm')modal('Partiye XP Ver',partyBody());return}
    if(button.dataset.v78Quick){event.preventDefault();event.stopImmediatePropagation();if(current.role!=='dm')return;const [id,amount]=button.dataset.v78Quick.split('|'),character=(state.characters||[]).find(row=>String(row.id)===String(id));if(!character)return;const result=applyToCharacter(character,{mode:'add',amount:+amount,reason:`Hızlı +${amount} XP`});if(!result.changed)return;save();render();refreshManager(character);toast(`${character.name}: +${number(result.delta)} XP`);return}
    if(button.id==='v78ApplyXp'){event.preventDefault();event.stopImmediatePropagation();if(current.role!=='dm')return;const character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.character));if(!character)return;const mode=$('#v78XpMode')?.value||'add',amount=Math.trunc(+($('#v78XpAmount')?.value||0)),reason=$('#v78XpReason')?.value?.trim();if(amount<0||!Number.isFinite(amount))return alert('Geçerli bir XP miktarı yaz.');if(mode!=='set'&&!amount)return alert('Sıfırdan büyük bir XP miktarı yaz.');if(!reason)return alert('XP işlemi için kısa bir neden yaz.');const result=applyToCharacter(character,{mode,amount,reason});if(!result.changed)return alert('XP değişmedi.');$('#modal')?.close();saveAndRender(`${character.name}: ${signedNumber(result.delta)} XP${result.before.level!==result.after.level?` · Lv ${result.after.level}`:''}`);return}
    if(button.dataset.v78Undo){event.preventDefault();event.stopImmediatePropagation();if(current.role!=='dm')return;const character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.v78Undo)),last=character?.xpHistory?.[0];if(!character||!last)return;if(!confirm(`${character.name} için son XP işlemi geri alınsın mı?`))return;const result=applyToCharacter(character,{mode:'set',amount:last.beforeXp,reason:`Geri alındı: ${last.reason||'XP işlemi'}`});if(!result.changed)return;save();render();refreshManager(character);toast('Son XP işlemi geri alındı');return}
    if(button.id==='v78ApplyPartyXp'){event.preventDefault();event.stopImmediatePropagation();if(current.role!=='dm')return;const amount=Math.trunc(+($('#v78PartyAmount')?.value||0)),reason=$('#v78PartyReason')?.value?.trim(),ids=[...document.querySelectorAll('[data-v78-party-character]:checked')].map(input=>input.value);if(!amount||amount<1)return alert('Kişi başı XP miktarını yaz.');if(!reason)return alert('Toplu XP için kısa bir neden yaz.');if(!ids.length)return alert('En az bir karakter seç.');let changed=0;for(const id of ids){const character=(state.characters||[]).find(row=>String(row.id)===String(id));if(character&&applyToCharacter(character,{mode:'add',amount,reason}).changed)changed++}$('#modal')?.close();saveAndRender(`${changed} karaktere kişi başı ${number(amount)} XP verildi`);return}
  },true);

  window.v78XpUi={panel,ensureCharacter,applyToCharacter,historyRows,thresholdRows};
  if(typeof V27_PAGE_HELP!=='undefined')V27_PAGE_HELP.party='Karakterleri, XP ilerlemesini ve seviyeleri yönet; seviye toplam XP eşiğine göre otomatik belirlenir.';
  if(current){prEnsure();render()}
})();
