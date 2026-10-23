/* FNF v0.9 draft · Village parcels. SQL authorizes every action. */
(() => {
  'use strict';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const soil={loam:'Tınlı',sand:'Kumlu',marsh:'Sulak'};
  const resources={food:'Yiyecek',wood:'Odun',stone:'Taş',coin:'Para',grain:'Tahıl',fodder:'Yem',ore:'Cevher',herbs:'Ot',fertilizer:'Gübre'};
  const chosen=new Map();
  async function render(main,ctx) {
    main.innerHTML='<section class="parcel-scene"><span class="eyebrow">KÖY TARLALARI</span><h2>Toprak beklemeyi bilir.</h2><p>Parsel defteri yükleniyor…</p></section>';
    const {data,error}=await ctx.db.rpc('fnf_parcels_snapshot',{p_room_id:ctx.room.id});
    if(!main.isConnected)return;
    if(error||data?.error){main.querySelector('p').textContent=error?.message||data?.error;return}
    const villages=data.villages||[],mine=data.mine,dm=ctx.room.role==='dm';
    const active=chosen.get(ctx.room.id)||mine||villages[0]?.id;
    if(!villages.some(v=>v.id===active)&&villages.length)chosen.set(ctx.room.id,villages[0].id);
    const village=active&&villages.some(v=>v.id===active)?active:villages[0]?.id;
    const plots=(data.parcels||[]).filter(p=>p.village_id===village);
    const water=(data.water||[]).find(x=>x.village_id===village);
    const seeds=(ctx.world.catalog||[]).filter(x=>x.category==='seed');
    const available=seeds.filter(x=>(ctx.world.stock?.[x.id]||0)>0);
    main.innerHTML='<section class="parcel-scene"><span class="eyebrow">20 KARE / PARSEL</span><h2>Bir tarla, birçok olasılık.</h2><p>Tarla açmak iki oyun günü sürer. Ekim, su, hasat ve temizleme ayrı işlerdir; gün geçişini DM yönetir.</p></section>'
      +'<div class="parcel-toolbar"><label>Köy <select id="parcelVillage">'+villages.map(v=>'<option value="'+esc(v.id)+'" '+(v.id===village?'selected':'')+'>'+esc(v.name)+'</option>').join('')+'</select></label>'
      +(village?'<form id="openParcel"><label>Toprak <select name="soil"><option value="loam">Tınlı</option><option value="sand">Kumlu</option><option value="marsh">Sulak</option></select></label><button class="button" type="submit">Yeni tarla aç · 2 gün</button></form>':'')+'</div>'
      +(village?'<p class="parcel-water">Su kaynağı: '+esc(water?.source||'dere')+' · Bugün taşınan '+esc(water?.carried??3)+' birim · Yağmur sulama sayılır.</p>':'<p class="muted">Tarla açmak için önce Yerleşim bölümünden bir köy kur.</p>')
      +'<div class="parcel-grid">'+plots.map(p=>{
        const occupied=new Set;for(const c of p.crops||[])for(let i=c.first_tile;i<c.first_tile+c.tile_count;i++)occupied.add(i);
        return '<article class="parcel-card"><div class="parcel-head"><span>PARSEL '+esc(p.number)+'</span><span>'+esc(soil[p.soil])+' · Verim %'+esc(p.fertility)+'</span></div>'
          +'<div class="parcel-tiles" aria-label="20 kare">'+Array.from({length:20},(_,i)=>'<i class="'+(occupied.has(i+1)?'occupied':'')+'" title="'+(i+1)+'. kare"></i>').join('')+'</div>'
          +(p.ready_day>ctx.world.day?'<p>İşçiler hazırlıyor · '+esc(p.ready_day)+'. günde hazır</p>':
            '<p>'+esc((p.crops||[]).length)+' ekim grubu · '+(p.fallow_until>=ctx.world.day?'Nadasta':'Ekim yapılabilir')+'</p>'
            +(p.crops||[]).map(c=>'<div class="parcel-crop"><b>'+esc(c.name||'?')+'</b><small>'+esc(c.first_tile)+'–'+esc(c.first_tile+c.tile_count-1)+'. kare · '+(c.residue?'Kalıntı temizlenecek':c.ready?'Hasada hazır':'Büyüme '+esc(c.growth))+'</small><div class="sim-actions">'
              +(c.residue?'<button data-work="clean"':'<button data-work="'+(c.ready?'harvest':'water')+'"')
              +' data-parcel="'+esc(p.id)+'" data-crop="'+esc(c.id)+'" class="button secondary" '+(!c.residue&&!c.ready&&c.watered_day===ctx.world.day?'disabled':'')+'>'
              +(c.residue?'Temizle':c.ready?'Hasat et':c.watered_day===ctx.world.day?'Sulandı ✓':'Dereden sula')+'</button></div></div>').join('')
            +'<form class="parcel-plant" data-parcel="'+esc(p.id)+'"><input type="search" name="seed_search" placeholder="Tohum ara…" aria-label="Ekimlik tohumlarda ara"><select name="seed_id" aria-label="Tohum">'
            +available.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name||'?')+' · '+esc(ctx.world.stock?.[s.id]||0)+'</option>').join('')
            +'</select><input name="first_tile" type="number" min="1" max="20" value="1" aria-label="Başlangıç karesi"><input name="tile_count" type="number" min="1" max="20" value="1" aria-label="Kare sayısı"><button class="button" '+(!available.length?'disabled':'')+'>Ekim yap</button></form>'
            +'<button class="text-button" data-work="fallow" data-parcel="'+esc(p.id)+'" '+((p.crops||[]).length?'disabled':'')+'>İki gün nadasa bırak</button>')
          +'</article>';
      }).join('')+'</div>'
      +(dm?'<section class="parcel-grant sim-sheet stacked"><span class="eyebrow">DM · BAŞLANGIÇ PAYI</span><h3>Malzeme dağıt</h3><form id="parcelGrant"><select name="kind"><option value="seed">Tohum</option><option value="resource">Kaynak</option></select><input type="search" name="search" placeholder="Malzeme ara…" aria-label="Dağıtılacak malzemede ara"><select name="id">'+seeds.map(s=>'<option value="'+esc(s.id)+'" data-kind="seed">'+esc(s.name||s.id)+'</option>').join('')+Object.entries(resources).map(([id,name])=>'<option value="'+esc(id)+'" data-kind="resource" hidden>'+esc(name)+'</option>').join('')+'</select><input name="amount" type="number" min="0" max="100" value="1" aria-label="Miktar"><button class="button">Dağıt</button></form></section>':'')
      +'<p class="parcel-feedback feedback" role="status"></p>';
    const feedback=main.querySelector('.parcel-feedback');
    async function work(action,payload,button,rpc='fnf_parcel_action'){
      button.disabled=true;
      try{
        const {data,error}=await ctx.db.rpc(rpc,{p_room_id:ctx.room.id,...(rpc==='fnf_parcel_action'?{p_action:action,p_payload:{village_id:village,...payload}}:payload)});
        if(error||data?.error)throw error||new Error(data.error);
        await ctx.loadWorld();ctx.render();
      }catch(e){button.disabled=false;feedback.textContent=e.message||'İşlem tamamlanamadı.'}
    }
    main.querySelector('#parcelVillage')?.addEventListener('change',e=>{chosen.set(ctx.room.id,e.target.value);render(main,ctx)});
    main.querySelector('#openParcel')?.addEventListener('submit',e=>{e.preventDefault();work('open',{soil:e.target.elements.soil.value},e.submitter)});
    main.querySelectorAll('.parcel-plant').forEach(f=>f.addEventListener('submit',e=>{
      e.preventDefault();work('plant',{parcel_id:f.dataset.parcel,seed_id:f.elements.seed_id.value,
        first_tile:f.elements.first_tile.value,tile_count:f.elements.tile_count.value},e.submitter);
    }));
    main.querySelectorAll('.parcel-plant').forEach(f=>f.elements.seed_search.oninput=()=>{
      const q=f.elements.seed_search.value.toLocaleLowerCase('tr-TR');
      for(const option of f.elements.seed_id.options)option.hidden=!option.text.toLocaleLowerCase('tr-TR').includes(q);
      if(f.elements.seed_id.selectedOptions[0]?.hidden)f.elements.seed_id.value=Array.from(f.elements.seed_id.options).find(o=>!o.hidden)?.value||'';
    });
    main.querySelectorAll('[data-work]').forEach(b=>b.onclick=()=>work(b.dataset.work,{parcel_id:b.dataset.parcel,crop_id:b.dataset.crop},b));
    const grant=main.querySelector('#parcelGrant');
    if(grant){
      const kind=grant.elements.kind,id=grant.elements.id;
      const filter=()=>{const q=grant.elements.search.value.toLocaleLowerCase('tr-TR');Array.from(id.options).forEach(o=>{o.hidden=o.dataset.kind!==kind.value||!o.text.toLocaleLowerCase('tr-TR').includes(q)});id.value=Array.from(id.options).find(o=>!o.hidden)?.value||''};
      kind.onchange=filter;grant.elements.search.oninput=filter;
      grant.onsubmit=e=>{e.preventDefault();work('',{p_kind:kind.value,p_id:id.value,p_amount:Number(grant.elements.amount.value)},e.submitter,'fnf_grant_supplies')};
    }
  }
  window.FNF_PARCELS={render};
})();
