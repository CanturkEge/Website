const config=window.TASK_PANEL_CONFIG||{};
const apiBase=(config.API_BASE_URL||"").replace(/\/$/,"");
const state={token:sessionStorage.getItem("task_token"),user:null,tasks:[],users:[],view:"dashboard"};
const $=id=>document.getElementById(id);
const statuses=["pending","in_progress","completed"];
const labels={pending:"Bekliyor",in_progress:"Devam ediyor",completed:"Tamamlandı",low:"Düşük",normal:"Normal",high:"Yüksek"};
const roles={
  admin:{label:"Sistem yöneticisi",short:"Yönetim",icon:"◆",color:"admin",description:"Tüm otel operasyonu, kullanıcılar ve roller"},
  manager:{label:"Otel yönetimi",short:"Yönetim",icon:"◈",color:"manager",description:"Departmanlar, görev atamaları ve operasyon takibi"},
  reception:{label:"Resepsiyon",short:"Resepsiyon",icon:"⌂",color:"reception",description:"Misafir girişleri, çıkışları ve talepleri"},
  procurement:{label:"Tedarik",short:"Tedarik",icon:"▣",color:"procurement",description:"Satın alma, stok ve teslimat süreçleri"},
  kitchen:{label:"Mutfak",short:"Mutfak",icon:"♨",color:"kitchen",description:"Sipariş, hazırlık ve mutfak operasyonu"},
  housekeeping:{label:"Temizlik",short:"Temizlik",icon:"✦",color:"housekeeping",description:"Oda temizliği, minibar ve kat kontrolleri"},
  maintenance:{label:"Teknik servis",short:"Teknik",icon:"⚙",color:"maintenance",description:"Arıza kayıtları ve bakım süreçleri"},
  employee:{label:"Genel personel",short:"Personel",icon:"•",color:"employee",description:"Kişisel görev ve operasyon takibi"}
};
const quickActions={
  admin:[
    {icon:"◎",title:"Kullanıcı oluştur",description:"Yeni personel hesabı aç",action:"user"},
    {icon:"⌁",title:"Görev ata",description:"Departmana veya personele iş ata",action:"task"},
    {icon:"◈",title:"Ekip rollerini düzenle",description:"Yetki ve departman değiştir",action:"team"},
    {icon:"▦",title:"Operasyon özeti",description:"Tüm açık işleri görüntüle",action:"tasks"}
  ],
  manager:[
    {icon:"⌁",title:"Görev ata",description:"Personele yeni iş ata",action:"task"},
    {icon:"◈",title:"Ekip durumunu gör",description:"Departman yükünü kontrol et",action:"team"},
    {icon:"!",title:"Acil operasyon",description:"Yüksek öncelikli kayıt oluştur",task:"Acil operasyon kontrolü",priority:"high"},
    {icon:"▦",title:"Açık işleri incele",description:"Bekleyen işleri görüntüle",action:"tasks"}
  ],
  reception:[
    {icon:"↪",title:"Check-in hazırlığı",description:"Yeni giriş için kontrol listesi",task:"Misafir check-in hazırlığı"},
    {icon:"☏",title:"Misafir talebi",description:"Misafir isteğini göreve dönüştür",task:"Misafir talebini karşıla",priority:"high"},
    {icon:"↩",title:"Check-out kontrolü",description:"Çıkış işlemlerini tamamla",task:"Misafir check-out kontrolü"},
    {icon:"⌂",title:"Oda durumu kontrolü",description:"Resepsiyon oda listesini doğrula",task:"Oda durumlarını kontrol et"}
  ],
  procurement:[
    {icon:"＋",title:"Satın alma talebi",description:"Yeni tedarik ihtiyacı oluştur",task:"Satın alma talebini hazırla"},
    {icon:"▣",title:"Stok kontrolü",description:"Kritik stokları gözden geçir",task:"Kritik stok kontrolü",priority:"high"},
    {icon:"⇣",title:"Teslimat takibi",description:"Beklenen sevkiyatı kontrol et",task:"Tedarikçi teslimatını takip et"},
    {icon:"✓",title:"Fatura eşleştirme",description:"Teslimat ve faturayı doğrula",task:"Tedarik faturalarını doğrula"}
  ],
  kitchen:[
    {icon:"♨",title:"Servis hazırlığı",description:"Vardiya hazırlığını başlat",task:"Mutfak servis hazırlığı"},
    {icon:"!",title:"Eksik malzeme",description:"Tedarik ihtiyacını bildir",task:"Eksik mutfak malzemelerini bildir",priority:"high"},
    {icon:"✓",title:"Hijyen kontrolü",description:"Kontrol listesini tamamla",task:"Mutfak hijyen kontrolü"},
    {icon:"≋",title:"Özel misafir notu",description:"Diyet ve alerji bilgisini işle",task:"Özel yemek talebini hazırla",priority:"high"}
  ],
  housekeeping:[
    {icon:"✦",title:"Oda temizliği",description:"Yeni oda işi oluştur",task:"Oda temizlik kontrolü"},
    {icon:"▤",title:"Minibar kontrolü",description:"Eksikleri ve tüketimi kaydet",task:"Minibar stok kontrolü"},
    {icon:"!",title:"Hasar bildirimi",description:"Teknik servis için kayıt aç",task:"Odada tespit edilen hasarı bildir",priority:"high"},
    {icon:"▱",title:"Çamaşır takibi",description:"Kat çamaşır durumunu kontrol et",task:"Çamaşır ve tekstil kontrolü"}
  ],
  maintenance:[
    {icon:"⚙",title:"Arıza kaydı",description:"Yeni teknik iş oluştur",task:"Teknik arıza kontrolü",priority:"high"},
    {icon:"↻",title:"Periyodik bakım",description:"Bakım listesini başlat",task:"Periyodik bakım kontrolü"},
    {icon:"⌂",title:"Oda teknik kontrolü",description:"Oda ekipmanlarını denetle",task:"Oda teknik ekipman kontrolü"},
    {icon:"✓",title:"İş teslimi",description:"Tamamlanan onarımı doğrula",task:"Tamamlanan teknik işi doğrula"}
  ],
  employee:[
    {icon:"＋",title:"Kişisel görev ekle",description:"Yeni iş kaydı oluştur",task:"Yeni kişisel görev"},
    {icon:"▦",title:"Görevlerimi gör",description:"Tüm işlerini görüntüle",action:"tasks"}
  ]
};

const initials=name=>(name||"K").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
const currentRole=()=>state.user?.role||"employee";
const canManage=()=>["admin","manager"].includes(currentRole());
const isAdmin=()=>currentRole()==="admin";

async function request(path,options={}){
  const response=await fetch(apiBase+path,{...options,headers:{"Content-Type":"application/json",...(state.token?{Authorization:`Bearer ${state.token}`}:{}) ,...(options.headers||{})}});
  if(response.status===401){logout();throw new Error("Oturumun sona erdi.")}
  const text=await response.text();
  if(!response.ok){let message=text||"İşlem başarısız.";try{const data=JSON.parse(text);message=data.message||data.title||data.error_description||data.error||message}catch{}throw new Error(message)}
  if(!text)return null;
  try{return JSON.parse(text)}catch{return text}
}

function toast(message,error=false){const el=$("toast");el.textContent=`${error?"✕":"✓"} ${message}`;el.classList.toggle("error-toast",error);el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),2800)}

function applyRoleUi(){
  const role=currentRole();const info=roles[role]||roles.employee;
  document.querySelectorAll("[data-roles]").forEach(el=>{const allowed=el.dataset.roles.split(",");el.classList.toggle("hidden",!allowed.includes(role))});
  $("profileName").textContent=state.user.fullName||state.user.email;$("profileRole").textContent=info.label;$("avatar").textContent=initials(state.user.fullName||state.user.email);
  renderHeaderActions();
}

async function boot(){
  if(!state.token)return showLogin();
  try{state.user=await request("/api/users/me");applyRoleUi();$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");await refresh();switchView("dashboard")}
  catch(error){showLogin(error.message)}
}
function showLogin(error=""){$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("loginError").textContent=error}
function logout(){sessionStorage.removeItem("task_token");state.token=null;state.user=null;state.tasks=[];state.users=[];showLogin()}

async function refresh(){
  $("loading").classList.remove("hidden");
  try{state.tasks=await request("/api/tasks")||[];state.users=canManage()?(await request("/api/users")||[]):[];renderDashboard();renderTasks();renderUsers()}
  catch(error){toast(error.message,true)}finally{$("loading").classList.add("hidden")}
}

function renderHeaderActions(){
  const actions=[];
  if(canManage())actions.push('<button class="primary" id="headerTaskButton">+ Görev ata</button>');
  if(isAdmin())actions.unshift('<button class="secondary" id="headerUserButton">+ Kullanıcı</button>');
  $("headerActions").innerHTML=actions.join("");
  if($("headerTaskButton"))$("headerTaskButton").onclick=openTaskModal;
  if($("headerUserButton"))$("headerUserButton").onclick=openUserModal;
}

function renderDashboard(){
  const role=currentRole();const info=roles[role]||roles.employee;
  const pending=state.tasks.filter(t=>t.status==="pending").length;const progress=state.tasks.filter(t=>t.status==="in_progress").length;const done=state.tasks.filter(t=>t.status==="completed").length;
  $("welcomeBanner").innerHTML=`<span class="role-chip">${info.icon} ${escapeHtml(info.label.toUpperCase())}</span><h2>Hoş geldin, ${escapeHtml((state.user.fullName||state.user.email).split(" ")[0])}</h2><p>${escapeHtml(info.description)}. Bu ekranda yalnızca rolünün yetkili olduğu kontroller gösteriliyor.</p>`;
  $("hotelStats").innerHTML=`<article><strong>${pending}</strong><small>Bekleyen iş</small><span>◷</span></article><article><strong>${progress}</strong><small>Devam eden</small><span>↻</span></article><article><strong>${done}</strong><small>Tamamlanan</small><span>✓</span></article><article><strong>${canManage()?state.users.length:state.tasks.length}</strong><small>${canManage()?"Aktif personel":"Toplam görevim"}</small><span>◎</span></article>`;
  $("quickActions").innerHTML=(quickActions[role]||quickActions.employee).map((item,index)=>`<button class="quick-action" data-quick="${index}"><i>${item.icon}</i><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span></button>`).join("");
  document.querySelectorAll("[data-quick]").forEach(button=>button.onclick=()=>runQuickAction((quickActions[role]||quickActions.employee)[Number(button.dataset.quick)]));
  const priority=[...state.tasks].filter(t=>t.status!=="completed").sort((a,b)=>(a.priority==="high"?-1:1)-(b.priority==="high"?-1:1)).slice(0,5);
  $("priorityTasks").innerHTML=priority.length?priority.map(task=>`<article class="compact-item ${task.priority}"><i></i><div><strong>${escapeHtml(task.title)}</strong><small>${labels[task.status]} · ${escapeHtml(task.profiles?.full_name||task.assigneeName||"Personel")}</small></div><b>${labels[task.priority]||task.priority}</b></article>`).join(""):'<div class="empty">Açık görev bulunmuyor.</div>';
}

async function runQuickAction(item){
  if(item.action==="user")return openUserModal();if(item.action==="task")return openTaskModal();if(item.action==="team")return switchView("team");if(item.action==="tasks")return switchView("tasks");
  if(item.task){try{await request("/api/tasks",{method:"POST",body:JSON.stringify({title:item.task,description:item.description,assigneeId:state.user.id,priority:item.priority||"normal"})});toast("Yeni iş kaydı oluşturuldu");await refresh()}catch(error){toast(error.message,true)}}
}

function renderTasks(){
  $("taskStats").innerHTML=statuses.map((status,index)=>`<article><strong>${state.tasks.filter(t=>t.status===status).length}</strong><small>${labels[status]}</small><span>${index===0?"◷":index===1?"↻":"✓"}</span></article>`).join("");
  $("board").innerHTML=statuses.map(status=>{const items=state.tasks.filter(t=>t.status===status);return `<section class="column"><h2>${labels[status]} <small>${items.length}</small></h2>${items.map(task=>`<article class="task-card"><span class="priority ${task.priority}">${labels[task.priority]||task.priority}</span><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.description)}</p><small>${task.profiles?.full_name||task.assigneeName?"Atanan: "+escapeHtml(task.profiles?.full_name||task.assigneeName):"Kişisel görev"}</small><select data-task-id="${task.id}">${statuses.map(value=>`<option value="${value}" ${value===task.status?"selected":""}>${labels[value]}</option>`).join("")}</select></article>`).join("")||'<div class="empty">Burada görev yok.</div>'}</section>`}).join("");
  document.querySelectorAll("[data-task-id]").forEach(select=>select.onchange=async event=>{const old=state.tasks.find(t=>String(t.id)===String(event.target.dataset.taskId))?.status;try{event.target.disabled=true;await request(`/api/tasks/${event.target.dataset.taskId}/status`,{method:"PATCH",body:JSON.stringify({status:event.target.value})});toast("Görev durumu güncellendi");await refresh()}catch(error){event.target.value=old;toast(error.message,true)}finally{event.target.disabled=false}})
}

function renderUsers(){
  if(!canManage())return;
  $("teamCount").textContent=`${state.users.length} personel kayıtlı. Rol değişiklikleri kullanıcı yeniden giriş yaptığında etkinleşir.`;
  $("roleLegend").innerHTML=Object.entries(roles).filter(([key])=>key!=="employee").map(([key,value])=>`<span class="role-badge ${key}">${value.label}</span>`).join("");
  $("userList").innerHTML=state.users.map(user=>{const name=user.fullName||user.full_name||user.email;return `<article><i>${initials(name)}</i><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(user.email)}</small></span>${isAdmin()?`<select data-role-user="${user.id}" data-old-role="${user.role}">${roleOptions(user.role)}</select>`:`<span class="role-badge ${user.role}">${roles[user.role]?.label||user.role}</span>`}<em>${state.tasks.filter(t=>t.assignee_id===user.id||t.assigneeId===user.id).length} görev</em></article>`}).join("");
  document.querySelectorAll("[data-role-user]").forEach(select=>select.onchange=async event=>{const old=event.target.dataset.oldRole;try{event.target.disabled=true;await request(`/api/users/${event.target.dataset.roleUser}/role`,{method:"PATCH",body:JSON.stringify({role:event.target.value})});event.target.dataset.oldRole=event.target.value;toast("Rol güncellendi; kullanıcı yeniden giriş yapmalı");await refresh()}catch(error){event.target.value=old;toast(error.message,true)}finally{event.target.disabled=false}})
}

function roleOptions(selected){return Object.entries(roles).filter(([key])=>key!=="employee").map(([key,value])=>`<option value="${key}" ${key===selected?"selected":""}>${value.label}</option>`).join("")}

function switchView(view){
  if(view==="team"&&!canManage())view="dashboard";state.view=view;
  document.querySelectorAll("[data-view]").forEach(element=>{if(element.tagName==="BUTTON"&&element.closest("nav"))element.classList.toggle("active",element.dataset.view===view)});
  document.querySelectorAll(".view").forEach(element=>element.classList.add("hidden"));$(`${view}View`).classList.remove("hidden");
  const titles={dashboard:["Genel bakış","Bugünkü operasyonu ve departman akışını takip et."],tasks:[canManage()?"Görev merkezi":"Görevlerim",canManage()?"Tüm departmanların iş akışını yönet.":"Sana atanan işleri güncelle."],team:["Ekip ve roller","Personel rollerini ve görev yükünü yönet."]};
  $("pageTitle").textContent=titles[view][0];$("pageSubtitle").textContent=titles[view][1];
}

function openTaskModal(){
  if(!canManage()){return runQuickAction({task:"Yeni kişisel görev",description:"Personel tarafından oluşturuldu"})}
  if(!state.users.length)return toast("Önce bir kullanıcı oluştur.",true);
  $("modalTitle").textContent="Yeni görev ata";
  $("modalForm").innerHTML=`<label>Görev başlığı<input name="title" required minlength="3" maxlength="120" placeholder="Örn. 204 numaralı odayı hazırla"></label><label>Açıklama<textarea name="description" required placeholder="Beklenen işi açıkla"></textarea></label><div class="form-row"><label>Atanan kişi<select name="assigneeId">${state.users.map(user=>`<option value="${user.id}">${escapeHtml(user.fullName||user.full_name||user.email)} · ${roles[user.role]?.short||user.role}</option>`).join("")}</select></label><label>Öncelik<select name="priority"><option value="normal">Normal</option><option value="high">Yüksek</option><option value="low">Düşük</option></select></label></div><label>Bitiş tarihi<input type="date" name="dueDate"></label><button class="primary" type="submit">Görevi ata</button>`;
  $("modalForm").onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector("button[type=submit]");const data=Object.fromEntries(new FormData(event.target));if(!data.dueDate)delete data.dueDate;try{button.disabled=true;button.textContent="Atanıyor…";await request("/api/tasks",{method:"POST",body:JSON.stringify(data)});closeModal();toast("Görev atandı");await refresh()}catch(error){toast(error.message,true)}finally{button.disabled=false;button.textContent="Görevi ata"}};openModal()
}

function openUserModal(){
  if(!isAdmin())return toast("Yeni kullanıcıyı yalnızca sistem yöneticisi oluşturabilir.",true);
  $("modalTitle").textContent="Yeni personel oluştur";
  $("modalForm").innerHTML=`<label>Ad soyad<input name="fullName" required minlength="2" placeholder="Ad Soyad"></label><label>E-posta<input type="email" name="email" required placeholder="isim@ekhotel.com"></label><label>Geçici şifre<input type="password" name="password" required minlength="6" placeholder="En az 6 karakter"></label><label>Departman / rol<select name="role">${roleOptions("reception")}</select></label><button class="primary" type="submit">Kullanıcıyı oluştur</button>`;
  $("modalForm").onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector("button[type=submit]");try{button.disabled=true;button.textContent="Oluşturuluyor…";await request("/api/users",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(event.target)))});closeModal();toast("Kullanıcı oluşturuldu");await refresh()}catch(error){toast(error.message,true)}finally{button.disabled=false;button.textContent="Kullanıcıyı oluştur"}};openModal()
}

function openModal(){$("modalBackdrop").classList.remove("hidden")}
function closeModal(){$("modalBackdrop").classList.add("hidden");$("modalForm").innerHTML="";$("modalForm").onsubmit=null}
function escapeHtml(value=""){return String(value).replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]))}

$("loginForm").addEventListener("submit",async event=>{event.preventDefault();const button=event.target.querySelector("button[type=submit]");$("loginError").textContent="";try{button.disabled=true;button.textContent="Giriş yapılıyor…";const result=await request("/api/auth/login",{method:"POST",body:JSON.stringify({email:$("loginEmail").value.trim(),password:$("loginPassword").value})});state.token=result.access_token;sessionStorage.setItem("task_token",state.token);await boot()}catch(error){$("loginError").textContent=error.message}finally{button.disabled=false;button.textContent="Giriş yap"}});
$("logoutButton").onclick=logout;$("closeModal").onclick=closeModal;$("newUserButton2").onclick=openUserModal;$("modalBackdrop").onmousedown=event=>{if(event.target===$("modalBackdrop"))closeModal()};document.addEventListener("click",event=>{const target=event.target.closest("[data-view]");if(target){event.preventDefault();switchView(target.dataset.view)}});boot();
