/* FNF v0.10 draft · village construction and one NPC job per game day. */
(() => {
 'use strict';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={cottage:'Ev',well:'Kuyu',workshop:'Atölye',school:'Okul',
   farmer:'Çiftçi',builder:'Yapıcı',miner:'Madenci',scholar:'Araştırmacı',teacher:'Öğretmen',
   farm:'Tarla',build:'İnşaat',mine:'Maden',research:'Araştırma',rest:'Dinlenme'};
 const choices=new Map();
 async function render(main,ctx){
   const block=document.createElement('section');
   block.className='sim-sheet stacked village-ops';
   block.innerHTML='<span class="eyebrow">KÖY İŞLERİ</span><h3>İş defteri yükleniyor…</h3>';
   main.append(block);
   const results=await Promise.all([
     ctx.db.rpc('fnf_village_ops_snapshot',{p_room_id:ctx.room.id}),
     ctx.db.rpc('fnf_village_snapshot',{p_room_id:ctx.room.id})
   ]);
   if(!block.isConnected)return;
   const [ops,base]=results;
   if(ops.error||base.error||ops.data?.error||base.data?.error){
     block.innerHTML='<h3>Köy işleri açılamadı</h3><p class="feedback">'+esc(ops.error?.message||base.error?.message||ops.data?.error||base.data?.error)+'</p>';return;
   }
   const data=ops.data, villages=base.data.villages||[],dm=ctx.room.role==='dm';
   const selected=choices.get(ctx.room.id)||data.mine||villages[0]?.id;
   const village=villages.find(v=>v.id===selected)||villages[0];
   const id=village?.id, buildings=(data.buildings||[]).filter(x=>x.village_id===id);
   const candidates=(data.candidates||[]).filter(x=>x.village_id===id);
   const npcs=(data.npcs||[]).filter(x=>x.village_id===id);
   const my=base.data.mine?.village_id===id?base.data.mine:null;
   const canBuild=dm||my?.can_build,canDecide=dm||my?.can_decide,canAssign=dm||my?.can_assign;
   block.innerHTML='<div class="sim-section-head"><div><span class="eyebrow">KÖY İŞLERİ · GÜN '+esc(data.day)+'</span><h3>Evler, yolcular ve emek</h3></div><span>Bir kişi · bir iş · bir gün</span></div>'
     +'<p>Malzeme inşa başında harcanır. Her gün bir oyuncu veya atanmış yapıcı çalışırsa inşaat ilerler. Bitmemiş yapı kullanılamaz.</p>'
     +(dm&&villages.length?'<label>Köy <select id="opsVillage">'+villages.map(v=>'<option value="'+esc(v.id)+'" '+(v.id===id?'selected':'')+'>'+esc(v.name)+'</option>').join('')+'</select></label>':'')
     +(village?'<div class="ops-grid"><div class="ops-column"><h4>Yapılar</h4>'
       +(buildings.map(b=>'<div class="ops-entry"><b>'+esc(names[b.kind]||b.kind)+'</b><small>'+(b.finished_day==null?esc(b.remaining_days)+' gün emek bekliyor':'Hazır · dayanıklılık %'+esc(b.durability))+'</small>'
         +(canBuild&&b.finished_day==null?'<button class="button secondary" data-op="work_build" data-target="'+esc(b.id)+'" '+((data.my_labor||[]).some(x=>x.day===data.day)?'disabled':'')+'>Bugün inşaatta çalış</button>':'')+'</div>').join('')||'<p class="muted">Henüz yapı yok.</p>')
       +(canBuild?'<form id="opsBuild"><select name="kind"><option value="cottage">Ev · 4 odun / 2 taş</option><option value="well">Kuyu · 3 odun / 3 taş</option><option value="workshop">Atölye · 8 odun / 5 taş</option><option value="school">Okul · 6 odun / 4 taş</option></select><button class="button">İnşaata başla</button></form>':'')
       +'</div><div class="ops-column"><h4>Köy kapısı</h4>'
       +(candidates.map(c=>'<div class="ops-entry"><b>'+esc(c.name)+'</b><small>'+esc(names[c.profession])+' · yatkınlık '+esc(c.aptitude)+' · sağlık '+esc(c.health)+'</small>'
         +(canDecide?'<div class="sim-actions"><button class="button secondary" data-op="accept" data-target="'+esc(c.id)+'">Kabul</button><button class="text-button" data-op="decline" data-target="'+esc(c.id)+'">Geri çevir</button></div>':'')+'</div>').join('')||'<p class="muted">Henüz başvuran yok. Yolcular oyun günlerinde gelebilir.</p>')
       +(dm?'<form id="opsNominate"><input name="name" required minlength="2" maxlength="40" placeholder="Aday adı"><select name="profession">'+['farmer','builder','miner','scholar','teacher'].map(k=>'<option value="'+k+'">'+names[k]+'</option>').join('')+'</select><input name="aptitude" type="number" min="1" max="5" value="2" aria-label="Yatkınlık"><button class="button secondary">Aday getir</button></form>':'')
       +'</div></div><div class="ops-roster"><h4>Sakinler · '+esc(npcs.length)+' kişi</h4>'
       +(npcs.map(n=>'<div class="ops-entry"><b>'+esc(n.name)+'</b><small>'+esc(names[n.profession])+' · sağlık '+esc(n.health)+' · yorgunluk '+esc(n.fatigue)+' · XP '+esc(Object.values(n.skill_xp||{}).reduce((a,b)=>a+Number(b),0))+'</small>'
         +(canAssign?'<div class="sim-actions"><select data-job-for="'+esc(n.id)+'" aria-label="'+esc(n.name)+' işi">'+['farm','build','mine','research','rest'].map(k=>'<option value="'+k+'" '+(n.job===k?'selected':'')+'>'+names[k]+'</option>').join('')+'</select><button class="button secondary" data-op="assign" data-target="'+esc(n.id)+'" '+(n.job&&!dm?'disabled':'')+'>'+esc(n.job&&!dm?'İş kilitli':n.job?'DM düzelt':'Bugünün işini ata')+'</button></div>':'')
         +(n.job?'<small>Bugünkü işi: '+esc(names[n.job])+'</small>':'')+'</div>').join('')||'<p class="muted">Sakin yok. Önce ev yap, sonra bir başvuruyu kabul et.</p>')
       +'</div>':'<p class="muted">Önce köy seç veya köy kur.</p>')
     +'<p class="ops-feedback feedback" role="status"></p>';
   const feedback=block.querySelector('.ops-feedback');
   async function action(op,payload,button){
     button.disabled=true;
     const {data:result,error}=await ctx.db.rpc('fnf_village_ops_action',
       {p_room_id:ctx.room.id,p_action:op,p_payload:{village_id:id,...payload}});
     if(error||result?.error){button.disabled=false;feedback.textContent=error?.message||result.error;return}
     await ctx.loadWorld();ctx.render();
   }
   block.querySelector('#opsVillage')?.addEventListener('change',e=>{
     choices.set(ctx.room.id,e.target.value);block.remove();render(main,ctx);
   });
   block.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>action(b.dataset.op,
     {target_id:b.dataset.target,job:b.dataset.op==='assign'?
       block.querySelector('[data-job-for="'+b.dataset.target+'"]').value:undefined},b));
   block.querySelector('#opsBuild')?.addEventListener('submit',e=>{
     e.preventDefault();action('build',{kind:e.target.elements.kind.value},e.submitter);
   });
   block.querySelector('#opsNominate')?.addEventListener('submit',e=>{
     e.preventDefault();action('nominate',{name:e.target.elements.name.value,
       profession:e.target.elements.profession.value,aptitude:e.target.elements.aptitude.value},e.submitter);
   });
 }
 window.FNF_VILLAGE_OPS={render};
})();
