/* v54: campaign-scoped LiveKit voice chat. */
let voiceRoom=null,voiceMicEnabled=true,voiceDeafened=false,voiceJoining=false,voiceOutputId='';

function voiceMount(){
  if($('#voiceDock'))return;
  document.body.insertAdjacentHTML('beforeend',`<section id="voiceDock" class="voice-dock" hidden>
    <button id="voiceToggle" class="voice-toggle" aria-expanded="false" title="Sesli sohbet">♬ <span>Ses</span><i id="voiceCount">0</i></button>
    <div id="voicePanel" class="voice-panel" hidden>
      <div class="voice-head"><div><small>KAMPANYA SESİ</small><b id="voiceStatus">Bağlı değil</b></div><button id="voiceClose" class="ghost" aria-label="Ses panelini kapat">×</button></div>
      <div id="voicePeople" class="voice-people"><p class="muted">Odaya katılınca masa burada görünecek.</p></div>
      <label class="voice-device">Mikrofon<select id="voiceInput"><option value="">Varsayılan mikrofon</option></select></label>
      <label class="voice-device">Hoparlör / ses çıkışı<select id="voiceOutput"><option value="">Sistem varsayılanı</option></select><small id="voiceOutputHelp"></small></label>
      <div class="voice-actions">
        <button id="voiceJoin" class="primary">Sese Katıl</button>
        <button id="voiceMic" class="ghost" hidden>🎙 Mikrofon</button>
        <button id="voiceDeafen" class="ghost" hidden>🎧 Kulaklık</button>
        <button id="voiceResume" class="ghost" hidden>🔊 Sesi Aç</button>
        <button id="voiceLeave" class="danger" hidden>Çık</button>
      </div>
      <div id="voiceAudio" hidden></div>
    </div>
  </section>`);
  $('#voiceToggle').onclick=()=>voiceSetOpen($('#voicePanel').hidden);
  $('#voiceClose').onclick=()=>voiceSetOpen(false);
  $('#voiceJoin').onclick=voiceJoin;
  $('#voiceLeave').onclick=()=>voiceDisconnect();
  $('#voiceMic').onclick=voiceToggleMic;
  $('#voiceDeafen').onclick=voiceToggleDeafen;
  $('#voiceResume').onclick=()=>voiceResumeAudio().catch(()=>{});
  $('#voiceInput').onchange=voiceSwitchInput;
  $('#voiceOutput').onchange=voiceSwitchOutput;
  voiceOnCampaignChange();
}

function voiceSetOpen(open){
  $('#voicePanel').hidden=!open;
  $('#voiceToggle').setAttribute('aria-expanded',String(open));
}

function voiceSetStatus(text,bad=false){
  let el=$('#voiceStatus');if(!el)return;el.textContent=text;el.classList.toggle('bad',bad);
}

function voiceOnCampaignChange(){
  let dock=$('#voiceDock');if(!dock)return;
  dock.hidden=!current;
  if(voiceRoom&&voiceRoom.name!==`campaign-${current?.id}`)voiceDisconnect(false);
  voiceRenderPeople();
}
window.voiceOnCampaignChange=voiceOnCampaignChange;

async function voiceJoin(){
  if(voiceJoining||voiceRoom)return;
  if(!current)return;
  if(!auth?.sessionToken){
    alert('Güvenli ses oturumu için bir kez yeniden giriş yapmalısın.');
    localStorage.removeItem('kadim-auth');
    location.reload();
    return;
  }
  if(!window.LivekitClient)return voiceSetStatus('Ses kütüphanesi yüklenemedi',true);
  voiceJoining=true;$('#voiceJoin').disabled=true;voiceSetStatus('Bağlanıyor…');
  try{
    const response=await fetch(`${cfg.SUPABASE_URL}/functions/v1/livekit-token`,{
      method:'POST',headers:{apikey:cfg.SUPABASE_ANON_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({campaignId:current.id,sessionToken:auth.sessionToken})
    });
    const payload=await response.json();
    if(!response.ok)throw Error(payload.error||'Ses anahtarı alınamadı');
    const {Room,RoomEvent,Track}=window.LivekitClient;
    const room=new Room({adaptiveStream:true,dynacast:true});
    voiceRoom=room;
    room.on(RoomEvent.TrackSubscribed,(track)=>{
      if(track.kind!==Track.Kind.Audio)return;
      const element=track.attach();element.autoplay=true;element.muted=voiceDeafened;if(voiceOutputId&&typeof element.setSinkId==='function')element.setSinkId(voiceOutputId).catch(()=>{});$('#voiceAudio').appendChild(element);
    });
    room.on(RoomEvent.TrackUnsubscribed,track=>track.detach().forEach(element=>element.remove()));
    room.on(RoomEvent.ParticipantConnected,voiceRenderPeople);
    room.on(RoomEvent.ParticipantDisconnected,voiceRenderPeople);
    room.on(RoomEvent.TrackPublished,voiceRenderPeople);
    room.on(RoomEvent.TrackUnpublished,voiceRenderPeople);
    if(RoomEvent.ParticipantPermissionsChanged)room.on(RoomEvent.ParticipantPermissionsChanged,voiceRenderPeople);
    room.on(RoomEvent.AudioPlaybackStatusChanged,()=>{$('#voiceResume').hidden=room.canPlaybackAudio;if(!room.canPlaybackAudio)voiceSetStatus('Gelen sesi açmak için Sesi Aç’a dokun',true)});
    room.on(RoomEvent.ActiveSpeakersChanged,speakers=>voiceRenderPeople(new Set(speakers.map(x=>x.identity))));
    room.on(RoomEvent.Disconnected,()=>voiceDisconnectedUI());
    await room.connect(payload.serverUrl,payload.participantToken);
    await room.startAudio();
    await room.localParticipant.setMicrophoneEnabled(true);
    voiceMicEnabled=true;voiceConnectedUI();await voiceLoadDevices();voiceRenderPeople();
  }catch(error){
    console.error(error);if(voiceRoom){voiceRoom.disconnect();voiceRoom=null}voiceSetStatus(error.message||'Bağlantı kurulamadı',true);
  }finally{voiceJoining=false;$('#voiceJoin').disabled=false}
}

function voiceConnectedUI(){
  voiceSetStatus('Ses odasına bağlı');
  $('#voiceJoin').hidden=true;$('#voiceMic').hidden=false;$('#voiceDeafen').hidden=false;$('#voiceLeave').hidden=false;
  voiceUpdateButtons();
}

function voiceDisconnectedUI(){
  voiceRoom=null;voiceSetStatus('Bağlı değil');
  $('#voiceJoin').hidden=false;$('#voiceMic').hidden=true;$('#voiceDeafen').hidden=true;$('#voiceLeave').hidden=true;
  $('#voiceAudio').replaceChildren();voiceRenderPeople();
}

function voiceDisconnect(closePanel=true){
  if(voiceRoom){const room=voiceRoom;voiceRoom=null;room.disconnect()}
  voiceDisconnectedUI();if(closePanel)voiceSetOpen(false);
}
window.voiceDisconnect=voiceDisconnect;

async function voiceToggleMic(){
  if(!voiceRoom)return;voiceMicEnabled=!voiceMicEnabled;
  try{await voiceRoom.localParticipant.setMicrophoneEnabled(voiceMicEnabled);voiceUpdateButtons()}catch(error){voiceMicEnabled=!voiceMicEnabled;voiceSetStatus('Mikrofon değiştirilemedi',true)}
}

function voiceToggleDeafen(){
  voiceDeafened=!voiceDeafened;$('#voiceAudio').querySelectorAll('audio').forEach(audio=>audio.muted=voiceDeafened);voiceUpdateButtons();
}

function voiceUpdateButtons(){
  $('#voiceMic').textContent=voiceMicEnabled?'🎙 Mikrofon açık':'🔇 Mikrofon kapalı';
  $('#voiceMic').classList.toggle('active',!voiceMicEnabled);
  $('#voiceDeafen').textContent=voiceDeafened?'🔕 Ses kapalı':'🎧 Ses açık';
  $('#voiceDeafen').classList.toggle('active',voiceDeafened);
}

async function voiceLoadDevices(){
  try{
    const devices=await navigator.mediaDevices.enumerateDevices(),inputs=devices.filter(x=>x.kind==='audioinput'),outputs=devices.filter(x=>x.kind==='audiooutput');
    $('#voiceInput').innerHTML='<option value="">Varsayılan mikrofon</option>'+inputs.map((d,i)=>`<option value="${esc(d.deviceId)}">${esc(d.label||`Mikrofon ${i+1}`)}</option>`).join('');
    let output=$('#voiceOutput'),supported=typeof HTMLMediaElement.prototype.setSinkId==='function';
    output.disabled=!supported;output.innerHTML='<option value="">Sistem varsayılanı</option>'+outputs.map((d,i)=>`<option value="${esc(d.deviceId)}">${esc(d.label||`Hoparlör ${i+1}`)}</option>`).join('');
    $('#voiceOutputHelp').textContent=supported?(outputs.length?'Telefon hoparlörü, kulaklık veya Bluetooth çıkışını seç.':'Çıkış seçimi cihaz listesine göre açılır.'):'Bu tarayıcıda çıkışı telefonun ses menüsünden değiştir.';
  }catch(error){console.warn('Mikrofonlar listelenemedi',error)}
}

async function voiceSwitchInput(event){
  if(!voiceRoom)return;
  let previous=voiceRoom.getActiveDevice?.('audioinput')||'';
  try{
    await voiceRoom.switchActiveDevice('audioinput',event.target.value||'default',false);
    if(voiceMicEnabled&&voiceRoom.localParticipant.permissions?.canPublish!==false)await voiceRoom.localParticipant.setMicrophoneEnabled(true);
    await voiceResumeAudio();voiceSetStatus('Mikrofon değiştirildi');
  }catch(error){event.target.value=previous;voiceSetStatus('Mikrofon değiştirilemedi; önceki cihaz korunuyor',true)}
}

async function voiceSwitchOutput(event){
  if(!voiceRoom)return;
  let previous=voiceRoom.getActiveDevice?.('audiooutput')||voiceOutputId;
  try{
    let next=event.target.value||'default';await voiceRoom.switchActiveDevice('audiooutput',next,false);
    voiceOutputId=next;await voiceResumeAudio();voiceSetStatus('Ses çıkışı değiştirildi');
  }catch(error){event.target.value=previous;voiceSetStatus('Ses çıkışı değiştirilemedi; önceki cihaz korunuyor',true)}
}

async function voiceResumeAudio(){
  if(!voiceRoom)return;
  try{await voiceRoom.startAudio();$('#voiceResume').hidden=true;$('#voiceAudio').querySelectorAll('audio').forEach(audio=>{audio.muted=voiceDeafened;audio.play().catch(()=>{})})}
  catch(error){$('#voiceResume').hidden=false;throw error}
}

function voiceRenderPeople(active=new Set()){
  if(!(active instanceof Set))active=new Set();
  let box=$('#voicePeople'),count=$('#voiceCount');if(!box||!count)return;
  if(!voiceRoom){count.textContent='0';box.innerHTML='<p class="muted">Odaya katılınca masa burada görünecek.</p>';return}
  const people=[voiceRoom.localParticipant,...voiceRoom.remoteParticipants.values()];
  count.textContent=String(people.length);
  box.innerHTML=people.map(person=>{let local=person===voiceRoom.localParticipant,dmMuted=person.permissions?.canPublish===false,dmDeafened=person.permissions?.canSubscribe===false,controls=current?.role==='dm'&&!local?`<div class="voice-mod"><button data-voice-mod="mute" data-identity="${esc(person.identity)}" data-enabled="${dmMuted?'false':'true'}">${dmMuted?'Konuştur':'Sustur'}</button><button data-voice-mod="deafen" data-identity="${esc(person.identity)}" data-enabled="${dmDeafened?'false':'true'}">${dmDeafened?'Duyur':'Sağırlaştır'}</button></div>`:'';return `<article class="${active.has(person.identity)||person.isSpeaking?'speaking':''} ${dmMuted?'dm-muted':''} ${dmDeafened?'dm-deafened':''}"><i>${esc((person.name||'?').slice(0,1).toUpperCase())}</i><span><b>${esc(person.name||'Maceracı')}</b><small>${local?'Sen':'Masada'}${dmMuted?' • DM susturdu':''}${dmDeafened?' • DM sağırlaştırdı':''}</small></span><em>${person.isMicrophoneEnabled&&!dmMuted?'🎙':'🔇'}</em>${controls}</article>`}).join('');
  box.querySelectorAll('[data-voice-mod]').forEach(button=>button.onclick=()=>voiceModerate(button));
}

async function voiceModerate(button){
  if(!voiceRoom||current?.role!=='dm')return;
  button.disabled=true;
  try{
    const response=await fetch(`${cfg.SUPABASE_URL}/functions/v1/livekit-token`,{
      method:'POST',headers:{apikey:cfg.SUPABASE_ANON_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({action:'moderate',campaignId:current.id,sessionToken:auth.sessionToken,targetIdentity:button.dataset.identity,moderation:button.dataset.voiceMod,enabled:button.dataset.enabled==='true'})
    });
    const payload=await response.json();
    if(!response.ok)throw Error(payload.error||'Ses yetkisi değiştirilemedi');
    setTimeout(()=>voiceRenderPeople(),350);
  }catch(error){voiceSetStatus(error.message||'Ses yetkisi değiştirilemedi',true)}
  finally{button.disabled=false}
}

window.addEventListener('beforeunload',()=>voiceRoom?.disconnect());
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',voiceMount);else voiceMount();
