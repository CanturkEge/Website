/* Build 74: one scoped loader/action queue for adventure pages and combat. */
(()=>{
 'use strict';
 const A=window.v74={data:{},scope:'',loading:false,busy:false,error:'',renderers:{},clicks:{},retries:new Map()};
 const scope=()=>current&&auth?.sessionToken?`${current.id}:${current.role}:${auth.id}:${auth.sessionToken}`:'';
 const dm=()=>current?.role==='dm',h=value=>esc(value??''),q=(name,el=document)=>el.querySelector(`[name="${name}"]`);
 const own=()=> (state?.characters||[]).filter(c=>(c.approvalStatus||'approved')==='approved'&&(dm()||c.userId===auth.id));
 const playerOptions=()=>members.filter(m=>m.role==='player');
 const get=(name,el=document)=>q(name,el)?.value||'';
 const checks=(name,el=document)=>[...el.querySelectorAll(`[name="${name}"]:checked`)].map(x=>x.value);
 const btn=(action,label,id='',cls='ghost',disabled=false)=>`<button type="button" class="${cls}" data-v74="${action}" data-id="${h(id)}" ${A.busy||disabled?'disabled':''}>${h(label)}</button>`;
 const field=(name,label,value='',type='text',attrs='')=>`<label>${h(label)}<input name="${name}" data-ui-key="v74-${name}" type="${type}" value="${h(value)}" ${attrs}></label>`;
 const textarea=(name,label,value='',max=3000)=>`<label>${h(label)}<textarea name="${name}" data-ui-key="v74-${name}" maxlength="${max}" rows="4">${h(value)}</textarea></label>`;
 const select=(name,label,options,value='')=>`<label>${h(label)}<select name="${name}" data-ui-key="v74-${name}">${options.map(([v,l])=>`<option value="${h(v)}" ${String(v)===String(value)?'selected':''}>${h(l)}</option>`).join('')}</select></label>`;
 const check=(name,label,on=false,value='1')=>`<label class="v74-check"><input type="checkbox" name="${name}" data-ui-key="v74-${name}-${h(value)}" value="${h(value)}" ${on?'checked':''}><span>${h(label)}</span></label>`;
 const date=v=>v?new Date(v).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'}):'';
 const money=cp=>`${(Number(cp||0)/100).toLocaleString('tr-TR',{maximumFractionDigits:2})} GP`;
 const empty=text=>`<p class="v74-empty">${h(text)}</p>`;
 const find=(bucket,id)=>(A.data[bucket]||[]).find(x=>x.id===id);
 const modalForm=(title,body,action,id='')=>modal(title,`<div class="v74 v74-form" data-v74-form="${action}" data-entity-id="${h(id||'new-'+action)}">${body}<p class="v74-error" data-v74-form-error role="alert"></p><div class="v74-actions">${btn(action,({cast:'Büyüyü kullan',resource:'Kaynağı harca',ability:'Kullanımı kaydet',roll_request:'Atış isteğini gönder',downtime_request:'DM’ye gönder',downtime_review:'Kararı kaydet',downtime_progress:'Günleri ilerlet',handout_save:'Belgeyi kaydet',faction_save:'Topluluğu kaydet',effect_add:'Etkiyi ekle'}[action]||'Kaydet'),id,'primary')}${btn('close','Vazgeç')}</div></div>`);
 A.errorHtml=()=>A.error?`<div class="v74-error" role="status">${h(A.error)} ${btn('reload','Yeniden dene')}</div>`:'';
 A.refresh=()=>{
  if(!current)return;
  for(const node of document.querySelectorAll('[data-v74-live]')){const fn=A.renderers[node.dataset.v74Live];if(fn){const update=()=>{node.innerHTML=fn();};window.kadimUiState?.safeUpdate?window.kadimUiState.safeUpdate(node,update):update();}}
 };
 A.ensureScope=()=>{const k=scope();if(A.scope!==k){A.scope=k;A.data={};A.error='';A.loading=false;A.loaded='';A.request=(A.request||0)+1;A.retries.clear();}return k;};
 A.load=async(force=false)=>{
  const k=A.ensureScope();if(!k)return;
  if(A.loading||!force&&A.loaded===k)return;
  const request=++A.request;A.loading=true;
  try{
   const {data,error}=await db.rpc('tools_load_v74',{p_session_token:auth.sessionToken,p_campaign:current.id});
   if(scope()!==k||request!==A.request)return;
   if(error)throw Error(error.message);
   const changed=JSON.stringify(data||{})!==JSON.stringify(A.data)||A.error||A.loaded!==k;
   A.data=data||{};A.error='';A.loaded=k;if(changed)A.refresh();
  }catch(e){if(scope()===k){A.error=e.message||'Macera araçları yüklenemedi';A.refresh();}}finally{if(scope()===k&&request===A.request)A.loading=false;}
 };
 A.act=async(action,payload,form=null)=>{
  if(A.busy)return false;
  const k=scope(),campaignId=current?.id,sessionToken=auth?.sessionToken;if(!k)return false;
  if(form){for(const el of form.querySelectorAll('input,select,textarea'))if(!el.reportValidity())return false;}
  A.busy=true;const token=window.kadimUiState?.beginCommit(form||document.createElement('div'));
  const key=JSON.stringify([k,action,payload]);const op=A.retries.get(key)||{...payload,opId:uid()};A.retries.set(key,op);
  const disabled=[];for(const el of (form||document).querySelectorAll(form?'input,select,textarea,button':'button[data-v74]')){if(!el.disabled){disabled.push(el);el.disabled=true;}}
  try{
   if(dm()&&typeof flushSave==='function'&&!await flushSave())throw Error('Önce bekleyen kampanya kaydı tamamlanmalı. Tekrar dene.');
   if(scope()!==k)return false;
   const {data,error}=await db.rpc('tools_action_v74',{p_session_token:sessionToken,p_campaign:campaignId,p_action:action,p_payload:op});
   if(error)throw Error(error.message);
   A.retries.delete(key);
   if(scope()!==k)return false;
   A.request++;A.loading=false;A.data=data||{};A.loaded=k;A.error='';
   window.kadimUiState?.finishCommit(token);
   if(['cast','resource','rest','downtime_complete'].includes(action)&&typeof syncFromServer==='function'){try{await syncFromServer(false);}catch(_){A.error='İşlem kaydedildi. Karakter görünümünü yenilemek için Yeniden dene’ye bas.';}}
   // A fresh read includes concentration checks produced by a legacy HP/turn save.
   if(scope()!==k)return false;
   if(form?.isConnected&&document.querySelector('#modal')?.open)document.querySelector('#modal').close();
   A.refresh();return true;
  }catch(e){if(scope()===k){const node=form?.querySelector('[data-v74-form-error]');if(node)node.textContent=e.message;else{A.error=e.message;A.refresh();}}return false;
  }finally{A.busy=false;disabled.forEach(el=>{if(el.isConnected)el.disabled=false;});if(scope()===k)A.refresh();}
 };
 Object.assign(A,{dm,h,q,get,checks,own,playerOptions,btn,field,textarea,select,check,date,money,empty,find,modalForm});
 const kinds={letter:'Mektup',book:'Kitap',clue:'İpucu',map:'Harita'},activities={craft:'Üretim',research:'Araştırma',training:'Eğitim',work:'Çalışma'},statuses={pending:'DM onayı bekliyor',approved:'Devam ediyor',completed:'Tamamlandı',rejected:'Reddedildi',cancelled:'İptal edildi'};
 const hero=(title,copy,button='')=>`<section class="v74-hero"><div><small>MACERA DEFTERİ</small><h2>${title}</h2><p>${copy}</p></div>${button}</section>`;
 const live=(name)=>`<div data-v74-live="${name}">${A.renderers[name]()}</div>`;
 function handouts(){
  return A.errorHtml()+`<div class="v74-grid">${(A.data.handouts||[]).map(r=>`<article class="v74-card" data-entity-id="${h(r.id)}"><small>${h(kinds[r.kind]||'Belge')}${dm()?` · ${r.published?'Paylaşıldı':'DM taslağı'}`:''}</small><h3>${h(r.title)}</h3><p class="v74-excerpt">${h(r.body)}</p><div class="v74-actions">${btn('handout_open','Oku',r.id)}${dm()?btn('handout_edit','Düzenle',r.id):''}</div></article>`).join('')||empty(dm()?'Bir mektup, kitap, harita veya ipucu ekle; alıcılarını sen seç.':'DM seninle bir belge paylaştığında burada görünür.')}</div>`;
 }
 function handoutEditor(r={}){
  modalForm(r.id?'Belgeyi düzenle':'Yeni belge',field('title','Başlık',r.title||'','text','required maxlength="100"')+select('kind','Tür',Object.entries(kinds),r.kind||'clue')+textarea('body','İçerik',r.body||'',20000)+field('image','Harita / görsel bağlantısı (isteğe bağlı)',r.image||'','url','placeholder="https://…" maxlength="2000"')+textarea('dmNote','Yalnız DM için not',r.dmNote||'',5000)+`<fieldset><legend>Paylaşım</legend>${check('published','Oyunculara yayınla',r.published)}${check('all','Tüm oyuncular',r.all)}<div class="v74-checklist">${playerOptions().map(m=>check('recipients',m.name,r.recipients?.includes(m.userId),m.userId)).join('')}</div><small>Tüm oyuncular kapalıysa yalnız işaretlenen kişiler görebilir.</small></fieldset>`+(r.id?btn('handout_delete','Belgeyi sil',r.id,'danger'):''),'handout_save',r.id);
 }
 A.clicks.handout_new=()=>handoutEditor();A.clicks.handout_edit=b=>handoutEditor(find('handouts',b.dataset.id));
 A.clicks.handout_open=b=>{const r=find('handouts',b.dataset.id);if(!r)return;const image=v74Rules.safeImage(r.image);modal(r.title,`<article class="v74 v74-document"><small>${h(kinds[r.kind]||'Belge')}</small>${image?`<img src="${h(image)}" alt="${h(r.title)}" referrerpolicy="no-referrer" loading="lazy">`:''}<div class="v74-prose">${h(r.body)}</div>${dm()&&r.dmNote?`<details><summary>DM notu</summary><p class="v74-prose">${h(r.dmNote)}</p></details>`:''}</article>`);};
 A.clicks.handout_save=(b,f)=>A.act('handout_save',{id:b.dataset.id||undefined,title:get('title',f),kind:get('kind',f),body:get('body',f),image:get('image',f),dmNote:get('dmNote',f),published:q('published',f).checked,all:q('all',f).checked,recipients:checks('recipients',f)},f);
 A.clicks.handout_delete=async b=>{if(confirm('Belge bütün alıcılardan kaldırılsın mı?')){if(await A.act('handout_delete',{id:b.dataset.id}))document.querySelector('#modal').close();}};
 function factions(){
  return A.errorHtml()+`<div class="v74-grid">${(A.data.factions||[]).map(r=>{
   const scores=dm()?Object.entries(r.scores||{}):[['party',r.scores?.party||0],[auth.id,r.scores?.[auth.id]||0]];
   return `<article class="v74-card" data-entity-id="${h(r.id)}"><small>${dm()&&!r.visible?'Yalnız DM':'Topluluk'}</small><h3>${h(r.title)}</h3><p class="v74-prose">${h(r.body)}</p><div class="v74-reputations">${scores.map(([id,n])=>`<div><span>${id==='party'?'Grup':h(members.find(m=>m.userId===id)?.name||'Oyuncu')}</span><b>${n>0?'+':''}${Number(n)||0}</b><small>${v74Rules.reputation(n)}</small><meter min="-100" max="100" value="${Number(n)||0}" aria-label="İtibar"></meter></div>`).join('')}</div><details data-ui-key="faction-${h(r.id)}"><summary>İlişki geçmişi</summary>${(r.history||[]).slice(0,30).map(x=>`<p>${h(x.target==='party'?'Grup':members.find(m=>m.userId===x.target)?.name||'Oyuncu')} · ${x.delta>0?'+':''}${x.delta} · ${h(x.reason)} <small>${h(date(x.createdAt))}</small></p>`).join('')||empty('Henüz ilişki değişimi yok.')}</details>${dm()?`<div class="v74-actions">${btn('reputation_edit','İtibarı değiştir',r.id)}${btn('faction_edit','Düzenle',r.id)}</div>`:''}</article>`;
  }).join('')||empty('Henüz tanışılan bir topluluk yok.')}</div>`;
 }
 function factionEditor(r={}){modalForm(r.id?'Topluluğu düzenle':'Yeni topluluk',field('title','Topluluk adı',r.title||'','text','required maxlength="100"')+textarea('body','Oyuncuların gördüğü açıklama',r.body||'',20000)+textarea('dmNote','Gizli DM notu',r.dmNote||'',5000)+check('visible','Oyuncular bu topluluğu tanıyor',r.visible)+(r.id?btn('faction_delete','Topluluğu sil',r.id,'danger'):''),'faction_save',r.id);}
 A.clicks.faction_new=()=>factionEditor();A.clicks.faction_edit=b=>factionEditor(find('factions',b.dataset.id));
 A.clicks.faction_save=(b,f)=>A.act('faction_save',{id:b.dataset.id||undefined,title:get('title',f),body:get('body',f),dmNote:get('dmNote',f),visible:q('visible',f).checked},f);
 A.clicks.faction_delete=async b=>{if(confirm('Topluluk ve ilişki geçmişi silinsin mi?'))if(await A.act('faction_delete',{id:b.dataset.id}))document.querySelector('#modal').close();};
 A.clicks.reputation_edit=b=>{const r=find('factions',b.dataset.id);modalForm('İtibar · '+r.title,select('target','Kimin itibarı?',[['party','Tüm grup'],...playerOptions().map(m=>[m.userId,m.name])])+field('delta','Değişim (+ / −)',5,'number','required min="-200" max="200" step="1"')+textarea('reason','Gerekçe','',500)+'<p>İtibar −100 ile +100 arasında tutulur. Oyuncu yalnız kendi ve grubun değerini görür.</p>','reputation_save',r.id);};
 A.clicks.reputation_save=(b,f)=>A.act('reputation',{id:b.dataset.id,target:get('target',f),delta:Number(get('delta',f)),reason:get('reason',f)},f);
 function downtime(){
  return A.errorHtml()+`<div class="v74-grid">${(A.data.downtime||[]).map(r=>`<article class="v74-card" data-entity-id="${h(r.id)}"><small>${h(activities[r.kind])} · ${h(r.characterName)}</small><h3>${h(r.title)}</h3><span class="v74-badge">${h(statuses[r.status])}</span><p class="v74-prose">${h(r.body)}</p><div class="v74-facts"><span>Süre <b>${r.progress||0} / ${r.days} gün</b></span><span>Maliyet <b>${money(r.cost)}</b></span>${r.rewardCoins?`<span>Ödül <b>${money(r.rewardCoins)}</b></span>`:''}${r.rewardItem?`<span>Eşya <b>${h(r.rewardItem.name)} ×${r.rewardItem.qty||1}</b></span>`:''}</div>${r.status==='approved'?`<progress value="${r.progress||0}" max="${r.days}" aria-label="Faaliyet ilerlemesi"></progress>`:''}${(r.materials||[]).length?`<p>Malzeme: ${r.materials.map(m=>`${h(m.name||'Envanter malzemesi')} ×${m.qty}`).join(', ')}</p>`:''}${r.dmReply?`<p class="v74-prose"><b>DM:</b> ${h(r.dmReply)}</p>`:''}<div class="v74-actions">${dm()&&r.status==='pending'?btn('downtime_review_open','İncele',r.id,'primary'):''}${dm()&&r.status==='approved'?btn('downtime_progress_open','Gün ilerlet',r.id)+(r.progress>=r.days?btn('downtime_complete','Tamamla ve teslim et',r.id,'primary'):''):''}${['pending','approved'].includes(r.status)?btn('downtime_cancel','İptal et',r.id,'danger'):''}</div></article>`).join('')||empty('Bir üretim, araştırma, eğitim veya çalışma faaliyeti başlat.')}</div>`;
 }
 const materialInputs=c=>`<fieldset><legend>Tüketilecek malzemeler</legend><p>Kullanılacak adedi gir; kullanmayacağın eşyalarda 0 bırak.</p><div class="v74-materials">${(c?.inventory||[]).filter(i=>!i.equipped).map(i=>`<label>${h(i.name)} <small>Mevcut: ${i.qty||1}</small><input type="number" min="0" max="${i.qty||1}" step="1" value="0" data-v74-material="${h(i.id)}" data-name="${h(i.name)}" data-ui-key="material-${h(i.id)}" aria-label="${h(i.name)} adedi"></label>`).join('')||empty('Kullanılabilir malzeme yok. Kuşanılmış eşya tüketilmez.')}</div></fieldset>`;
 A.clicks.downtime_new=()=>{
  const chars=own();if(!chars.length)return;modalForm('Dinlenme faaliyeti',select('characterId','Karakter',chars.map(c=>[c.id,c.name]))+select('kind','Faaliyet',Object.entries(activities))+field('title','Faaliyet adı','','text','required maxlength="100"')+textarea('body','Planın / üretilecek şey')+'<div class="v74-two">'+field('days','Gerekli gün',1,'number','required min="1" max="3650" step="1"')+field('costGP','Maliyet (GP)',0,'number','required min="0" max="10000000" step="0.01"')+'</div><div data-v74-material-list>'+materialInputs(chars[0])+'</div><p class="v74-note">DM süreyi, bedeli ve ödülü onaylar. Para ve malzemeler yalnız tamamlandığında harcanır; o zamana kadar iptal edebilirsin.</p>','downtime_request');
 };
 A.clicks.downtime_request=(b,f)=>A.act('downtime_request',{characterId:get('characterId',f),kind:get('kind',f),title:get('title',f),body:get('body',f),days:Number(get('days',f)),cost:Math.round(Number(get('costGP',f))*100),materials:[...f.querySelectorAll('[data-v74-material]')].filter(i=>Number(i.value)>0).map(i=>({id:i.dataset.v74Material,name:i.dataset.name,qty:Number(i.value)}))},f);
 A.clicks.downtime_review_open=b=>{
  const r=find('downtime',b.dataset.id);modalForm('Faaliyeti incele',`<p><b>${h(r.characterName)} · ${h(r.title)}</b></p><p class="v74-prose">${h(r.body)}</p>`+select('decision','Karar',[['approved','Onayla'],['rejected','Reddet']])+`<div class="v74-two">${field('days','Gerekli gün',r.days,'number','required min="1" max="3650" step="1"')}${field('costGP','Maliyet (GP)',r.cost/100,'number','required min="0" max="10000000" step="0.01"')}${field('rewardGP','Para ödülü (GP)',0,'number','min="0" max="10000000" step="0.01"')}${field('rewardQty','Ödül eşya adedi',1,'number','min="1" max="999" step="1"')}</div>`+select('rewardId','Katalogdan ödül eşyası (bonusları korunur)',[['','Eşya yok'],...(state.market||[]).map(i=>[i.id,i.name])])+textarea('dmReply','DM yanıtı / araştırma sonucu')+'<p>Eğitim ve araştırmanın öyküsel sonucunu yanıta yaz. Stat artışı otomatik verilmez.</p>','downtime_review',r.id);
 };
 A.clicks.downtime_review=(b,f)=>{const item=(state.market||[]).find(i=>i.id===get('rewardId',f));return A.act('downtime_review',{id:b.dataset.id,decision:get('decision',f),days:Number(get('days',f)),cost:Math.round(Number(get('costGP',f))*100),rewardCoins:Math.round(Number(get('rewardGP',f))*100),rewardItem:item?{...item,qty:Number(get('rewardQty',f))}:null,dmReply:get('dmReply',f)},f);};
 A.clicks.downtime_progress_open=b=>modalForm('Faaliyet için geçen gün',field('days','Kaç gün geçti?',1,'number','required min="1" max="3650" step="1"'),'downtime_progress',b.dataset.id);
 A.clicks.downtime_progress=(b,f)=>A.act('downtime_progress',{id:b.dataset.id,days:Number(get('days',f))},f);
 A.clicks.downtime_complete=b=>{const r=find('downtime',b.dataset.id);if(confirm(`${r.title} tamamlanacak; ${money(r.cost)} ve seçilen malzemeler harcanıp ödül verilecek. Devam?`))return A.act('downtime_complete',{id:r.id});};
 A.clicks.downtime_cancel=b=>{if(confirm('Faaliyet iptal edilsin mi? Henüz para veya malzeme harcanmadı.'))return A.act('downtime_cancel',{id:b.dataset.id});};
 A.renderers.handouts=handouts;A.renderers.factions=factions;A.renderers.downtime=downtime;
 const pages=[['handouts','✉','Belgeler',()=>hero('Belgeler & İpuçları','Mektuplar, keşfedilen bilgiler ve maceranın sırları.',dm()?btn('handout_new','+ Belge ekle','','primary'):'')+live('handouts')],['factions','⚑','Topluluklar',()=>hero('Topluluklar & İtibar','Grubun ve karakterinin dünyada bıraktığı iz.',dm()?btn('faction_new','+ Topluluk ekle','','primary'):'')+live('factions')],['downtime','⌛','Dinlenme Faaliyetleri',()=>hero('Dinlenme Faaliyetleri',own().length?'Maceralar arasındaki günlerini değerlendir.':'Faaliyet başlatmak için onaylanmış bir karakter gerekli.',btn('downtime_new','+ Faaliyet başlat','','primary',!own().length))+live('downtime')]];
 for(const [id,icon,title,body]of pages){for(const nav of [dmNav,playerNav])if(!nav.some(n=>n[0]===id)){const at=nav.findIndex(n=>n[0]==='guide');nav.splice(at<0?nav.length:at,0,[id,icon,title]);}dmPages[id]=playerPages[id]=()=>{A.ensureScope();queueMicrotask(()=>A.load());return `<div class="v74 v74-page">${body()}</div>`;};window.kadimUiState?.registerPage(id,id==='downtime'?['characters','market','@members']:['@members']);}
 A.clicks.reload=()=>A.load(true);A.clicks.close=()=>document.querySelector('#modal')?.close();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-v74]');if(!b||b.disabled||!current)return;const fn=A.clicks[b.dataset.v74];if(!fn)return;e.preventDefault();const f=b.closest('[data-v74-form]');Promise.resolve(fn(b,f)).catch(error=>{const node=f?.querySelector('[data-v74-form-error]');if(node)node.textContent=error.message;else{A.error=error.message;A.refresh();}});});
 document.addEventListener('change',e=>{if(e.target.name==='characterId'&&e.target.closest('[data-v74-form="downtime_request"]')){const el=e.target.closest('[data-v74-form]').querySelector('[data-v74-material-list]');window.kadimUiState?.clearWithin(el);el.innerHTML=materialInputs(own().find(c=>c.id===e.target.value));}});
 setInterval(()=>{if(current&&document.visibilityState!=='hidden'&&!A.busy)A.load(true);},5000);
})();
