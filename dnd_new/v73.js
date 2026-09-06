/* v73: account-scoped campaign achievements and memory archive. */
let v73Achievements=[],v73AchievementsCampaign='',v73AchievementsLoading=false,v73AchievementsError='';

function v73AchievementDate(value){
  if(!value)return '';
  try{return new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value))}catch(_error){return String(value)}
}

function v73AchievementGroups(){
  let groups=new Map();
  for(let row of v73Achievements){
    let key=row.award_group_id||row.id,group=groups.get(key);
    if(!group){group={...row,players:[]};groups.set(key,group)}
    group.players.push({id:row.player_user_id,name:row.player_name||'Oyuncu'});
  }
  return [...groups.values()];
}

function v73AchievementCards(){
  if(v73AchievementsCampaign!==current?.id||v73AchievementsLoading)return '<div class="empty">Hatıralar açılıyor…</div>';
  if(v73AchievementsError)return `<div class="pact-error">${esc(v73AchievementsError)}</div>`;
  let rows=v73AchievementGroups();
  if(!rows.length)return `<div class="v73-empty"><span>✦</span><h3>İlk hatıra henüz yazılmadı</h3><p>${current.role==='dm'?'Masada unutulmayacak bir an yaşandığında oyunculara başarım ver.':'DM bir başarım verdiğinde burada kalıcı bir hatıra olarak görünecek.'}</p></div>`;
  return `<div class="v73-achievement-grid">${rows.map(row=>`<article class="v73-achievement-card" data-entity-id="${esc(row.award_group_id||row.id)}"><div class="v73-medallion">✦</div><div class="v73-achievement-copy"><span class="v73-kicker">KADİM HATIRA</span><h3>${esc(row.title)}</h3><p>${esc(row.description)}</p><footer><time>${esc(v73AchievementDate(row.created_at))}</time>${current.role==='dm'?`<span>${row.players.map(player=>esc(player.name)).join(' • ')}</span>`:row.granted_by_name?`<span>${esc(row.granted_by_name)} tarafından verildi</span>`:''}</footer></div>${current.role==='dm'?`<button class="danger v73-revoke" data-v73-revoke="${esc(row.award_group_id||row.id)}" aria-label="Başarımı geri al">×</button>`:''}</article>`).join('')}</div>`;
}

function v73AchievementPage(){
  queueMicrotask(()=>v73LoadAchievements());
  let players=members.filter(member=>member.role==='player');
  let composer=current.role==='dm'?`<section id="v73AchievementComposer" class="card v73-achievement-compose"><div><span class="v73-kicker">YENİ HATIRA</span><h2>Başarım Ver</h2><p>Oyuna mekanik bonus eklemez; yalnızca oyuncunun anı arşivinde kalır.</p></div><div class="v73-achievement-form"><label>Başarım adı<input id="v73AchievementTitle" class="input" maxlength="80" placeholder="Ejderin Son Şahidi"></label><label>Açıklama<textarea id="v73AchievementDescription" maxlength="1000" placeholder="Kızıl ejderin nefesi altında köprüyü tek başına tuttu."></textarea></label><fieldset><legend>Oyuncular</legend><div class="v73-player-list">${players.map(player=>`<label><input type="checkbox" data-ui-key="v73-player-${esc(player.userId)}" data-v73-achievement-player="${esc(player.userId)}"><span>${esc(player.name)}</span></label>`).join('')||'<p class="muted">Kampanyada henüz oyuncu yok.</p>'}</div>${players.length>1?'<button id="v73AchievementSelectAll" class="ghost" type="button">Tümünü Seç</button>':''}</fieldset><button id="v73GrantAchievement" class="primary" type="button" ${players.length?'':'disabled'}>Hatırayı Mühürle</button></div></section>`:'';
  return `<div class="v73-achievement-page"><section class="v73-achievement-hero"><div class="v73-hero-mark">✦</div><div><span class="v73-kicker">MASANIN HATIRALARI</span><h2>${current.role==='dm'?'Başarımlar Arşivi':'Başarımlarım'}</h2><p>${current.role==='dm'?'Unutulmayacak anları seçtiğin oyuncuların arşivine işle.':'Maceran boyunca kazandığın, oyuna etkisi olmayan hatıralar.'}</p></div><b>${v73AchievementsCampaign===current.id?v73AchievementGroups().length:'—'}</b></section>${composer}<section class="v73-memory-section"><div class="between row"><div><span class="v73-kicker">ARŞİV</span><h2>${current.role==='dm'?'Masanın Hatıraları':'Kazandığın Hatıralar'}</h2></div><button id="v73RefreshAchievements" class="ghost" type="button">Yenile</button></div><div id="v73AchievementList">${v73AchievementCards()}</div></section></div>`;
}

function v73RefreshAchievementList(){
  if(page!=='achievements'||!current)return;
  let list=document.querySelector('#v73AchievementList');
  if(!list)return render();
  let update=()=>{list.innerHTML=v73AchievementCards();let total=document.querySelector('.v73-achievement-hero>b');if(total)total.textContent=String(v73AchievementGroups().length)};
  if(window.kadimUiState)return window.kadimUiState.safeUpdate(list,update);
  update();
}

async function v73LoadAchievements(force=false){
  if(!current||!auth?.sessionToken)return;
  let campaignId=current.id,previousError=v73AchievementsError;
  if(v73AchievementsLoading||(!force&&v73AchievementsCampaign===campaignId))return;
  v73AchievementsLoading=true;v73AchievementsError='';
  let {data,error}=await db.rpc('achievement_list_v73',{p_session_token:auth.sessionToken,p_campaign:campaignId});
  if(current?.id!==campaignId){v73AchievementsLoading=false;return}
  let next=Array.isArray(data)?data:[],nextError=error?(error.message||'Başarımlar yüklenemedi'):'',changed=JSON.stringify(next)!==JSON.stringify(v73Achievements)||v73AchievementsCampaign!==campaignId||nextError!==previousError;
  v73AchievementsLoading=false;v73AchievementsCampaign=campaignId;v73AchievementsError=nextError;
  if(!error)v73Achievements=next;
  if(changed&&page==='achievements')v73RefreshAchievementList();
}

function v73InstallNav(nav){
  if(nav.some(row=>row[0]==='achievements'))return;
  let guideIndex=nav.findIndex(row=>row[0]==='guide');
  nav.splice(guideIndex<0?nav.length:guideIndex,0,['achievements','✦','Başarımlar']);
}
v73InstallNav(dmNav);v73InstallNav(playerNav);
dmPages.achievements=v73AchievementPage;playerPages.achievements=v73AchievementPage;
window.kadimUiState?.registerPage('achievements',[]);

document.addEventListener('click',async event=>{
  let button=event.target.closest('button');if(!button||page!=='achievements'||!current)return;
  if(button.id==='v73RefreshAchievements'){v73AchievementsCampaign='';await v73LoadAchievements(true);return}
  if(button.id==='v73AchievementSelectAll'){
    let boxes=[...document.querySelectorAll('[data-v73-achievement-player]')],checked=!boxes.every(box=>box.checked);
    boxes.forEach(box=>{box.checked=checked;window.kadimUiState?.markDirty(box)});button.textContent=checked?'Seçimi Kaldır':'Tümünü Seç';return;
  }
  if(button.id==='v73GrantAchievement'){
    let campaignId=current.id,composer=document.querySelector('#v73AchievementComposer'),title=document.querySelector('#v73AchievementTitle')?.value.trim()||'',description=document.querySelector('#v73AchievementDescription')?.value.trim()||'',playerIds=[...document.querySelectorAll('[data-v73-achievement-player]:checked')].map(box=>box.dataset.v73AchievementPlayer);
    if(!title||!description)return alert('Başarım adı ve açıklamasını yaz.');
    if(!playerIds.length)return alert('En az bir oyuncu seç.');
    button.disabled=true;
    let {data,error}=await db.rpc('achievement_grant_v73',{p_session_token:auth.sessionToken,p_campaign:campaignId,p_title:title,p_description:description,p_player_ids:playerIds});
    if(error){button.disabled=false;return alert(`${error.message}\n\nv73-update.sql dosyasını Supabase’te çalıştır.`)}
    if(current?.id!==campaignId)return toast('Başarım verildi');
    window.kadimUiState?.clearWithin(composer);document.querySelector('#v73AchievementTitle').value='';document.querySelector('#v73AchievementDescription').value='';document.querySelectorAll('[data-v73-achievement-player]').forEach(box=>box.checked=false);
    v73AchievementsCampaign='';await v73LoadAchievements(true);toast(`${data||playerIds.length} oyuncuya başarım verildi`);return;
  }
  if(button.dataset.v73Revoke){
    if(!confirm('Bu başarım seçilen tüm oyunculardan geri alınsın mı?'))return;
    let campaignId=current.id;button.disabled=true;let {error}=await db.rpc('achievement_revoke_v73',{p_session_token:auth.sessionToken,p_campaign:campaignId,p_award_group:button.dataset.v73Revoke});
    if(error){button.disabled=false;return alert(error.message)}
    if(current?.id!==campaignId)return toast('Başarım geri alındı');
    v73AchievementsCampaign='';await v73LoadAchievements(true);toast('Başarım geri alındı');
  }
},true);

setInterval(()=>{if(page==='achievements')v73LoadAchievements(true)},12000);
if(current)render();
