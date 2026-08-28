let kadimAdminPassword='';

function adminDate(value){return new Date(value).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'})}
async function loadAdminCampaigns(){
 const area=document.querySelector('#adminCampaigns');
 if(area)area.innerHTML='<div class="empty">Kayıtlar açılıyor…</div>';
 const {data,error}=await db.rpc('kadim_admin_campaign_list',{p_username:'admin',p_password:kadimAdminPassword});
 if(error){if(area)area.innerHTML=`<div class="admin-error">${esc(error.message)}<br><small>ZIP içindeki admin-update.sql dosyasını çalıştırdığından emin ol.</small></div>`;return}
 const rows=data||[],members=rows.reduce((n,x)=>n+(+x.member_count||0),0),characters=rows.reduce((n,x)=>n+(+x.character_count||0),0);
 document.querySelector('#adminStats').innerHTML=`<article><b>${rows.length}</b><span>Kampanya</span></article><article><b>${members}</b><span>Üyelik</span></article><article><b>${characters}</b><span>Karakter</span></article>`;
 area.innerHTML=rows.map(x=>`<article class="admin-campaign"><div><small>${esc(x.code)} • ${x.age_days===0?'Bugün açıldı':x.age_days+' gündür açık'}</small><h3>${esc(x.name)}</h3><p>DM: <b>${esc(x.dm_name)}</b></p></div><div class="admin-meta"><span>${x.member_count} üye</span><span>${x.character_count} karakter</span><span>Kuruluş: ${adminDate(x.created_at)}</span><span>Son kayıt: ${adminDate(x.updated_at)}</span></div><button class="danger" data-admin-delete="${x.id}" data-name="${esc(x.name)}">Kampanyayı Sil</button></article>`).join('')||'<div class="empty">Sunucuda kampanya yok.</div>';
}
function renderAdminPanel(){
 document.body.classList.remove('landing-mode');
 document.body.innerHTML=`<main class="admin-shell"><header class="admin-head"><div><small>KADİM MASA • SUNUCU YÖNETİMİ</small><h1>Admin Paneli</h1><p>Tüm kampanyalar, kullanım süreleri ve masa yoğunluğu.</p></div><button id="adminLogout" class="ghost">Çıkış</button></header><section id="adminStats" class="admin-stats"></section><section id="adminCampaigns" class="admin-list"></section></main>`;
 document.querySelector('#adminLogout').onclick=()=>location.reload();
 document.addEventListener('click',async e=>{let b=e.target.closest('[data-admin-delete]');if(!b)return;let name=b.dataset.name;if(!confirm(`“${name}” kampanyası ve içindeki tüm karakterler kalıcı olarak silinecek. Emin misin?`))return;let typed=prompt('Onaylamak için kampanya adını aynen yaz:', '');if(typed!==name)return alert('Kampanya adı eşleşmedi; silme iptal edildi.');b.disabled=true;b.textContent='Siliniyor…';let {error}=await db.rpc('kadim_admin_campaign_delete',{p_username:'admin',p_password:kadimAdminPassword,p_campaign:b.dataset.adminDelete});if(error){b.disabled=false;b.textContent='Kampanyayı Sil';return alert(error.message)}await loadAdminCampaigns()});
 loadAdminCampaigns();
}

const normalAuthSubmit=document.querySelector('#authSubmit').onclick;
document.querySelector('#authSubmit').onclick=async()=>{
 const username=document.querySelector('#authUser').value.trim();
 if(!registerMode&&username.toLowerCase()==='admin'){
  const password=document.querySelector('#authPass').value;
  document.querySelector('#authMsg').textContent='Yönetim mührü kontrol ediliyor…';
  const {data,error}=await db.rpc('kadim_admin_valid',{p_username:username,p_password:password});
  if(error||!data){document.querySelector('#authMsg').textContent=error?.message||'Admin kullanıcı adı veya şifre yanlış';return}
  kadimAdminPassword=password;renderAdminPanel();return;
 }
 return normalAuthSubmit();
};

document.querySelector('#deleteCampaign').onclick=async()=>{
 if(!current||current.role!=='dm')return;
 if(!confirm(`“${current.name}” kampanyası; karakterler, envanterler ve bütün kayıtlarıyla kalıcı olarak silinecek. Emin misin?`))return;
 let typed=prompt('Onaylamak için kampanya adını aynen yaz:','');
 if(typed!==current.name)return alert('Kampanya adı eşleşmedi; silme iptal edildi.');
 let {error}=await db.rpc('campaign_delete_dm',{p_user:auth.id,p_campaign:current.id});
 if(error)return alert(error.message);
 current=null;await refreshCampaigns();toast('Kampanya silindi');
};
