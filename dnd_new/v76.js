/* Build 76: validated DM-only campaign state restore. */
(()=>{
  'use strict';
  const B=window.v76Backup,MAX_FILE=10*1024*1024;let candidate=null;
  const clone=value=>globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));
  const cleanName=value=>String(value||'kampanya').replace(/[\\/:*?"<>|]+/g,'-').trim().slice(0,80)||'kampanya';
  function download(value,suffix='yedek'){
    const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`${cleanName(current?.name)}-${suffix}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  function updateButton(){const button=$('#importBtn');if(button)button.hidden=!current||current.role!=='dm'}
  function countRows(now,next){const labels={characters:'Karakter',npcs:'NPC',items:'Envanter eşyası',relations:'İlişki',quests:'Görev',encounter:'Aktif savaşçı',market:'Market ürünü'};return Object.entries(labels).map(([key,label])=>`<tr><th>${label}</th><td>${now[key]||0}</td><td>${next[key]||0}</td></tr>`).join('')}
  function preview(result,file){
    candidate={...result,campaignId:current.id,fileName:file.name};const currentCounts=B.counts(state),sourceName=result.campaign?.name||file.name;
    modal('Kampanya Yedeğini İçe Aktar',`<div class="v76-restore"><p><b>${esc(sourceName)}</b> dosyası okunup doğrulandı.</p><table><thead><tr><th>İçerik</th><th>Şu an</th><th>Yedek</th></tr></thead><tbody>${countRows(currentCounts,result.counts)}</tbody></table><div class="v76-warning"><b>Bu işlem mevcut kampanya state’ini değiştirir.</b><p>Onayladığında önce şu anki durum ayrıca bilgisayarına indirilecek. Hesaplar, üyeler, başarımlar, market teklif geçmişi, işlem logu ve Build 74’ün ayrı macera kayıtları bu JSON tarafından değiştirilmez.</p></div>${result.wrapped?`<small>Yedek tarihi: ${esc(result.createdAt||'Belirtilmemiş')}</small>`:'<small>Eski biçimli yedek algılandı; doğrudan kampanya state’i olarak alınacak.</small>'}<label class="v76-confirm"><input id="v76Acknowledge" type="checkbox"> Sayıları kontrol ettim ve bu kampanyanın üstüne yüklemek istiyorum.</label><button type="button" id="v76RestoreConfirm" class="danger" disabled>Yedeği Geri Yükle</button></div>`);
  }
  async function readFile(file){
    if(!current||current.role!=='dm')throw Error('Yalnız DM yedek içe aktarabilir.');
    if(!file)throw Error('Dosya seçilmedi.');if(file.size>MAX_FILE)throw Error('Yedek 10 MB sınırını aşıyor.');
    let raw;try{raw=JSON.parse(await file.text())}catch{throw Error('JSON okunamadı; dosya bozuk veya yanlış biçimde.')}
    return B.validate(raw);
  }
  async function restore(button){
    if(!candidate||!current||current.role!=='dm'||candidate.campaignId!==current.id)return alert('Kampanya değişti; dosyayı yeniden seç.');
    const before=clone(state),stamp=new Date().toISOString().replace(/[:.]/g,'-');download(before,`otomatik-oncesi-${stamp}`);button.disabled=true;button.textContent='Geri yükleniyor…';
    try{
      if(typeof flushSave==='function'&&!await flushSave())throw Error('Bekleyen kayıt tamamlanamadı. İnternet bağlantısını kontrol et.');
      state=normalized(clone(candidate.state));if(typeof v31NormalizeIds==='function')v31NormalizeIds(state);if(typeof prEnsure==='function')prEnsure();
      save();if(typeof flushSave==='function'&&!await flushSave())throw Error('Yedek Supabase’e kaydedilemedi.');
      candidate=null;$('#backupFile').value='';$('#modal').close();render();toast('Yedek başarıyla geri yüklendi');
    }catch(error){
      state=before;try{save();await window.flushSave?.()}catch{}button.disabled=false;button.textContent='Yedeği Geri Yükle';alert(`Geri yükleme tamamlanamadı: ${error.message}`);
    }
  }
  const renderBase=render;render=function(){const result=renderBase();updateButton();return result};updateButton();
  $('#importBtn')?.addEventListener('click',()=>{if(current?.role!=='dm')return toast('Yalnız DM içe aktarabilir',true);candidate=null;const input=$('#backupFile');input.value='';input.click()});
  $('#backupFile')?.addEventListener('change',async event=>{try{const file=event.target.files?.[0],result=await readFile(file);preview(result,file)}catch(error){event.target.value='';candidate=null;alert(error.message)}});
  document.addEventListener('change',event=>{if(event.target.id==='v76Acknowledge'){const button=$('#v76RestoreConfirm');if(button)button.disabled=!event.target.checked}});
  document.addEventListener('click',event=>{const button=event.target.closest('#v76RestoreConfirm');if(button)restore(button)},true);
})();
