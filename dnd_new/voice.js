/* v54: campaign-scoped LiveKit voice chat. */
let voiceRoom=null,voiceMicEnabled=true,voiceDeafened=false,voiceJoining=false;

function voiceMount(){
  if($('#voiceDock'))return;
  document.body.insertAdjacentHTML('beforeend',`<section id="voiceDock" class="voice-dock" hidden>
    <button id="voiceToggle" class="voice-toggle" aria-expanded="false" title="Sesli sohbet">♬ <span>Ses</span><i id="voiceCount">0</i></button>
    <div id="voicePanel" class="voice-panel" hidden>
      <div class="voice-head"><div><small>KAMPANYA SESİ</small><b id="voiceStatus">Bağlı değil</b></div><button id="voiceClose" class="ghost" aria-label="Ses panelini kapat">×</button></div>
      <div id="voicePeople" class="voice-people"><p class="muted">Odaya katılınca masa burada görünecek.</p></div>
      <label class="voice-device">Mikrofon<select id="voiceInput"><option value="">Varsayılan mikrofon</option></select></label>
      <div class="voice-actions">
        <button id="voiceJoin" class="primary">Sese Katıl</button>
        <button id="voiceMic" class="ghost" hidden>🎙 Mikrofon</button>
        <button id="voiceDeafen" class="ghost" hidden>🎧 Kulaklık</button>
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
  $('#voiceInput').onchange=voiceSwitchInput;
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
      const element=track.attach();element.autoplay=true;element.muted=voiceDeafened;$('#voiceAudio').appendChild(element);
    });
    room.on(RoomEvent.TrackUnsubscribed,track=>track.detach().forEach(element=>element.remove()));
    room.on(RoomEvent.ParticipantConnected,voiceRenderPeople);
    room.on(RoomEvent.ParticipantDisconnected,voiceRenderPeople);
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
    const devices=(await navigator.mediaDevices.enumerateDevices()).filter(x=>x.kind==='audioinput');
    $('#voiceInput').innerHTML='<option value="">Varsayılan mikrofon</option>'+devices.map((d,i)=>`<option value="${esc(d.deviceId)}">${esc(d.label||`Mikrofon ${i+1}`)}</option>`).join('');
  }catch(error){console.warn('Mikrofonlar listelenemedi',error)}
}

async function voiceSwitchInput(event){
  if(!voiceRoom||!event.target.value)return;
  try{await voiceRoom.switchActiveDevice('audioinput',event.target.value);voiceSetStatus('Mikrofon değiştirildi')}catch(error){voiceSetStatus('Mikrofon seçilemedi',true)}
}

function voiceRenderPeople(active=new Set()){
  let box=$('#voicePeople'),count=$('#voiceCount');if(!box||!count)return;
  if(!voiceRoom){count.textContent='0';box.innerHTML='<p class="muted">Odaya katılınca masa burada görünecek.</p>';return}
  const people=[voiceRoom.localParticipant,...voiceRoom.remoteParticipants.values()];
  count.textContent=String(people.length);
  box.innerHTML=people.map(person=>`<article class="${active.has(person.identity)||person.isSpeaking?'speaking':''}"><i>${esc((person.name||'?').slice(0,1).toUpperCase())}</i><span><b>${esc(person.name||'Maceracı')}</b><small>${person===voiceRoom.localParticipant?'Sen':'Masada'}</small></span><em>${person.isMicrophoneEnabled?'🎙':'🔇'}</em></article>`).join('');
}

window.addEventListener('beforeunload',()=>voiceRoom?.disconnect());
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',voiceMount);else voiceMount();

