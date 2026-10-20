/* FNF v0.8.0 · Village membership and delegated rights. */
(() => {
  'use strict';
  const selectedByRoom=new Map();
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roleName={owner:'Kurucu',cofounder:'Eş kurucu',member:'Üye'};
  const rights={build:'İnşa',decide:'Karar',assign:'İş atama'};
  async function render(main,ctx){
    const panel=document.createElement('section');
    panel.className='village-panel sim-sheet stacked';
    panel.innerHTML='<span class="eyebrow">KÖYLER</span><h3>Köy defteri yükleniyor…</h3>';
    main.insertBefore(panel,main.firstChild);
    let snapshot;
    try{
      const {data,error}=await ctx.db.rpc('fnf_village_snapshot',{p_room_id:ctx.room.id});
      if(error||data?.error)throw error||new Error(data.error);
      snapshot=data;
    }catch(err){
      panel.innerHTML='<h3>Köy defteri açılamadı</h3><p class="feedback" role="status">'+esc(err.message)+'</p>';
      return;
    }
    if(!panel.isConnected)return;
    const mine=snapshot.mine;
    const villages=snapshot.villages||[];
    const selected=selectedByRoom.get(ctx.room.id)||mine?.village_id||villages[0]?.id;
    const village=villages.find(v=>v.id===selected);
    const managed=ctx.room.role==='dm'||(mine?.village_id===selected&&['owner','cofounder'].includes(mine.role));
    const members=(snapshot.members||[]).filter(m=>m.village_id===selected);
    const requests=(snapshot.requests||[]).filter(r=>r.village_id===selected);
    const eligible=snapshot.eligible||[];
    const day=ctx.world.day;
    panel.innerHTML=`<div class="sim-section-head"><div><span class="eyebrow">YERLEŞİM BÖLGESİ</span><h3>Köyler ve yetkiler</h3></div><span>${villages.length} köy · konumlar ayrı</span></div>
      <p class="muted">Köy seçimi, üyelik ve yetkiler kaydedilir. Ortak depo ve mevcut yapılar henüz köylere ayrılmadı; bu işlemleri DM yönetir.</p>
      ${mine?`<div class="village-self"><b>Senin köyün: ${esc(villages.find(v=>v.id===mine.village_id)?.name||'?')}</b><span>${esc(roleName[mine.role])} · İnşa ${mine.can_build?'✓':'–'} · Karar ${mine.can_decide?'✓':'–'} · İş ${mine.can_assign?'✓':'–'}</span></div>`:''}
      ${(snapshot.invites||[]).map(i=>`<div class="village-invite"><strong>${esc(i.name)} seni ${i.role==='cofounder'?'eş kurucu':'üye'} olarak davet etti.</strong><div class="sim-actions"><button type="button" class="button" data-vaction="accept_invite" data-village-id="${esc(i.village_id)}">Kabul et</button><button type="button" class="button secondary" data-vaction="decline_invite" data-village-id="${esc(i.village_id)}">Reddet</button></div></div>`).join('')}
      <div class="village-grid">${villages.map(v=>`<article class="village-card ${v.id===selected?'selected':''}"><span class="eyebrow">KONUM İPUCU</span><h4>${esc(v.name)}</h4><p>${esc(v.terrain_hint)}</p><small>${v.member_count} kişi · gizli kaynaklar keşifle açılır</small><div class="sim-actions"><button type="button" class="button secondary" data-vselect="${esc(v.id)}">İncele</button>${!mine&&ctx.room.role==='player'?`<button type="button" class="button" data-vaction="request" data-village-id="${esc(v.id)}">Katılma isteği</button>`:''}</div></article>`).join('')||'<p class="muted">Henüz köy kurulmadı. Oyuncular geçici kamptan yola çıkıyor.</p>'}</div>
      ${!mine&&ctx.room.role==='player'?`<form class="village-create"><h4>Yeni köy kur</h4><p>Konum rastgele atanır; önce yalnız yaklaşık arazi ipucunu görürsün.</p><label for="villageName">Köy adı</label><div class="sim-actions"><input id="villageName" name="name" required minlength="2" maxlength="36" placeholder="Örn. Çınar Yurdu"><button class="button" type="submit">Köy kur</button></div></form>`:''}
      ${village?`<div class="village-detail"><div><span class="eyebrow">SEÇİLİ KÖY</span><h4>${esc(village.name)}</h4><p>${esc(village.terrain_hint)} · yeraltı kaynaklarının ayrıntısı bilinmiyor.</p></div>
      ${members.length?`<div class="village-members"><h4>Üyeler</h4>${members.map(m=>`<div class="village-member"><div><b>${esc(m.name)}</b><small>${esc(roleName[m.role])}</small></div>${managed&&m.role==='member'?`<div class="village-permissions">${Object.entries(rights).map(([key,title])=>`<label><input type="checkbox" data-vpermission="${key}" data-village-id="${esc(selected)}" data-user-id="${esc(m.user_id)}" ${m['can_'+key]?'checked':''}><span>${title}</span></label>`).join('')}</div>`:`<small>${m.role==='member'?`İnşa ${m.can_build?'✓':'–'} · Karar ${m.can_decide?'✓':'–'} · İş ${m.can_assign?'✓':'–'}`:'Tüm yetkiler'}</small>`}</div>`).join('')}</div>`:''}
      ${managed&&eligible.length?`<form class="village-invite-form"><h4>Oyuncu davet et</h4><div class="sim-actions"><select name="user_id">${eligible.map(p=>`<option value="${esc(p.user_id)}">${esc(p.name)}</option>`).join('')}</select><select name="role"><option value="member">Üye</option>${day===1&&members.filter(m=>m.role==='owner'||m.role==='cofounder').length<3?'<option value="cofounder">Eş kurucu</option>':''}</select><button class="button secondary">Davet et</button></div></form>`:''}
      ${managed&&requests.length?`<div class="village-requests"><h4>Katılım istekleri</h4>${requests.map(r=>`<div class="village-request"><b>${esc(r.name)}</b><div class="sim-actions"><button type="button" class="button" data-vaction="accept_request" data-village-id="${esc(selected)}" data-user-id="${esc(r.user_id)}">Kabul</button><button type="button" class="button secondary" data-vaction="decline_request" data-village-id="${esc(selected)}" data-user-id="${esc(r.user_id)}">Reddet</button></div></div>`).join('')}</div>`:''}</div>`:''}<p class="village-feedback feedback" role="status"></p>`;
    async function action(name,payload,button){
      if(button)button.disabled=true;
      try{
        const {data,error}=await ctx.db.rpc('fnf_village_action',{
          p_room_id:ctx.room.id,p_action:name,p_payload:payload
        });
        if(error||data?.error)throw error||new Error(data.error);
        if(name==='create'||name==='accept_invite')selectedByRoom.delete(ctx.room.id);
        ctx.render();
      }catch(err){
        if(button){button.disabled=false;if(button.type==='checkbox')button.checked=!button.checked;}
        const feedback=panel.querySelector('.village-feedback');
        if(feedback)feedback.textContent=err.message||'İşlem tamamlanamadı.';
      }
    }
    panel.querySelectorAll('[data-vselect]').forEach(b=>b.onclick=()=>{
      selectedByRoom.set(ctx.room.id,b.dataset.vselect);
      panel.remove();render(main,ctx);
    });
    panel.querySelectorAll('[data-vaction]').forEach(b=>b.onclick=()=>action(b.dataset.vaction,{
      village_id:b.dataset.villageId,user_id:b.dataset.userId
    },b));
    panel.querySelectorAll('[data-vpermission]').forEach(input=>input.onchange=()=>{
      action('permission',{village_id:input.dataset.villageId,
        user_id:input.dataset.userId,permission:input.dataset.vpermission,enabled:input.checked},input);
    });
    const create=panel.querySelector('.village-create');
    if(create)create.onsubmit=e=>{e.preventDefault();action('create',{name:create.elements.name.value},e.submitter)};
    const invite=panel.querySelector('.village-invite-form');
    if(invite)invite.onsubmit=e=>{e.preventDefault();action('invite',{
      village_id:selected,user_id:invite.elements.user_id.value,role:invite.elements.role.value
    },e.submitter)};
  }
  window.FNF_VILLAGES={render};
})();
