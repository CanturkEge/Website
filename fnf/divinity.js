/* Temple field notes. The server decides which names and lore each member may see. */
(() => {
  'use strict';
  const safe = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rank = {source:'YÜCE KAYNAK',archangel:'BAŞMELEK',messenger:'ELÇİ'};
  const icon = {source:'✺',archangel:'✧',messenger:'◇'};
  let serial = 0;
  async function render(main,{db,room}){
    const ticket=++serial;
    main.innerHTML='<section class="temple-intro"><span class="eyebrow">MANEVİ DÜNYA</span><h2>Tapınak kayıtları</h2><p>Görünür bilgi, DM’in açtığı işaretlerle ilerler.</p></section><p class="feedback">Kayıtlar getiriliyor…</p>';
    const {data,error}=await db.rpc('fnf_divinity_snapshot',{p_room_id:room.id});
    if(ticket!==serial || !main.isConnected || !document.querySelector('[data-nav="temple"]')?.classList.contains('active')) return;
    if(error||data?.error){main.querySelector('.feedback').textContent=error?.message||data.error;return}
    const dm=room.role==='dm';
    const nodes=data.nodes||[];
    main.innerHTML=`<section class="temple-intro"><span class="eyebrow">MANEVİ DÜNYA · ODA KAYDI</span><h2>Bir kaynak, birçok iz.</h2><p>Tek yüce iradenin altında dört başmelek ve onların elçileri bulunur. İsimler geçicidir; DM her odada değiştirebilir. Nimet ve ceza için otomatik kurallar henüz tanımlanmadı.</p><div class="temple-status"><span>${data.open?'Tapınak açık':'Tapınak kapalı'}</span>${dm?`<button class="button secondary" id="templeToggle" type="button">${data.open?'Tapınağı kapat':'Tapınağı aç'}</button>`:''}</div></section>${!data.open&&!dm?'<div class="temple-locked"><span>✧</span><h3>Kapılar henüz açılmadı</h3><p>DM tapınağı açtığında keşfedilen kayıtlar burada görünecek.</p></div>':`<div class="divine-tree">${nodes.map(n=>`<article class="divine-node ${safe(n.rank)}"><span class="divine-mark" aria-hidden="true">${icon[n.rank]||'✧'}</span><div class="divine-body"><span class="panel-kicker">${rank[n.rank]||'ELÇİ'}</span><h3>${safe(n.name||'???')}</h3><p class="divine-domain">${safe(n.domain||'Alanı henüz bilinmiyor')}</p><p>${safe(n.lore||'Anlatısı henüz açılmadı.')}</p>${dm?`<div class="divine-controls"><button type="button" class="text-button" data-rename="${safe(n.id)}">Adı değiştir</button>${[['identity','Ad'],['domain','Alan'],['lore','Anlatı']].map(([f,label])=>`<label><input type="checkbox" data-divine="${f}" data-entity="${safe(n.id)}" ${n[f+'_open']?'checked':''}> ${label}</label>`).join('')}</div>`:''}</div></article>`).join('')}</div>`}<p id="templeFeedback" class="feedback" role="status"></p>`;
    async function action(entity,operation,value,button){
      if(button)button.disabled=true;
      const {data:result,error:err}=await db.rpc('fnf_divinity_action',{p_room_id:room.id,p_entity_id:entity,p_action:operation,p_value:value});
      if(err||result?.error){if(button)button.disabled=false;main.querySelector('#templeFeedback').textContent=err?.message||result.error;return false}
      await render(main,{db,room});return true;
    }
    if(dm){
      main.querySelector('#templeToggle').onclick=e=>action(null,'temple',String(!data.open),e.currentTarget);
      main.querySelectorAll('[data-divine]').forEach(input=>input.onchange=async e=>{
        const ok=await action(e.currentTarget.dataset.entity,e.currentTarget.dataset.divine,String(e.currentTarget.checked),e.currentTarget);
        if(!ok)e.currentTarget.checked=!e.currentTarget.checked;
      });
      main.querySelectorAll('[data-rename]').forEach(button=>button.onclick=()=>{
        const original=nodes.find(n=>n.id===button.dataset.rename)?.name||'';
        const form=document.createElement('form');form.className='divine-rename';
        form.innerHTML=`<label class="sr-only">Yeni ad</label><input required minlength="2" maxlength="48" value="${safe(original)}" aria-label="Yeni ad"><button class="button" type="submit">Kaydet</button><button class="button secondary" type="button">Vazgeç</button>`;
        button.replaceWith(form);form.querySelector('input').focus();
        form.querySelector('[type="button"]').onclick=()=>form.replaceWith(button);
        form.onsubmit=async e=>{e.preventDefault();const value=form.querySelector('input').value.trim();if(value.length<2)return;await action(button.dataset.rename,'rename',value,form.querySelector('[type="submit"]'))};
      });
    }
  }
  window.FNF_DIVINITY={render};
})();
