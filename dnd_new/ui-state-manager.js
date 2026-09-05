/*
 * Kadim UI state manager
 *
 * Server state is the persisted campaign data loaded from Supabase. Local UI
 * state is the browser-only draft/focus/details/scroll state. Realtime handlers
 * must update server state through `changedRoots`/`shouldRender`; DOM writes go
 * through `safeRender` or `safeUpdate` so dirty controls are not overwritten.
 * Mark a field dirty while the user edits it, and clear it after the rendered
 * server value confirms the draft. New pages should register their server-root
 * dependencies below. A full render is reserved for structural changes; prefer
 * a section `safeUpdate` when a stable entity can be updated independently.
 */
(function(root){
  'use strict';

  const EDITABLE='input:not([type="hidden"]),textarea,select,[contenteditable="true"]';
  const PAGE_ROOTS={
    dashboard:['session','notes','quests','characters','encounter','worldDate','@members'],
    party:['characters','guildInventory','@members'],partyview:['characters'],skills:['characters'],
    inventory:['characters','groundLoot'],guild:['guild','guildInventory','groundLoot','characters','npcs'],
    guilddm:['guild','guildInventory','groundLoot','characters','npcs'],world:['quests','questBoard','customEffects','customSpecies','customClasses','worldDate','worldMap','travelHistory'],
    encounter:['encounter','encounterActive','encounterRound','battleMap','characters','npcs'],
    npcs:['npcs'],bestiary:['customMonsters'],market:['market','shopSettings','worldMap'],
    encounterview:['encounter','encounterActive','encounterRound','battleMap','characters','npcs'],map:['worldMap','travelHistory','characters'],questboard:['questBoard','quests'],karma:['characters','v44KarmaLedger','v51JusticeLedger'],
    lootgen:['characters','guildInventory','market','v44LootHistory'],divineorder:['characters','v51JusticeLedger'],
    spellbook:['characters'],deities:['characters'],bosses:['customMonsters'],treasury:[],pacts:[],guide:[],dice:[],chat:['@members'],notifications:[],auditlog:[],patchnotes:[]
  };

  function createUiStateManager(host=root){
    const doc=host.document;
    const local=new Map(),dirty=new Map(),conflicts=new Map(),subscriptions=new Map(),seenEvents=new Map();
    let renderDepth=0;

    const clone=value=>value==null?value:(host.structuredClone?host.structuredClone(value):JSON.parse(JSON.stringify(value)));
    const equal=(a,b)=>{
      if(Object.is(a,b))return true;
      if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
      if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((row,index)=>equal(row,b[index]));
      const ak=Object.keys(a),bk=Object.keys(b);
      return ak.length===bk.length&&ak.every(key=>Object.hasOwn(b,key)&&equal(a[key],b[key]));
    };
    const scope=()=>doc?.body?.dataset?.uiScope||'global';
    const semanticData=element=>{
      const entries=Object.entries(element?.dataset||{}).filter(([key,value])=>value&&key!=='uiDirty'&&key!=='uiScope'&&/(^uiKey$|id$|key$|spell$|field$|page$)/i.test(key));
      return entries.sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>`${key}:${value}`).join('|');
    };
    function domPath(element){
      const parts=[];let node=element;
      while(node&&node!==doc?.body&&parts.length<5){
        if(node.id){parts.unshift(`#${node.id}`);break}
        const parent=node.parentElement;if(!parent)break;
        const peers=[...parent.children].filter(row=>row.tagName===node.tagName);
        parts.unshift(`${String(node.tagName||'node').toLowerCase()}:${peers.indexOf(node)}`);node=parent;
      }
      return parts.join('>');
    }
    function elementKey(element){
      if(!element)return '';
      if(element.dataset?.uiKey)return `ui:${element.dataset.uiKey}`;
      if(element.id)return `id:${element.id}`;
      const owner=element.closest?.('[data-entity-id],[data-character-id],[data-item-id]');
      const ownerKey=owner&&(owner.dataset.entityId||owner.dataset.characterId||owner.dataset.itemId);
      const data=semanticData(element);
      if(ownerKey&&(element.name||data))return `entity:${ownerKey}:${element.name||data}`;
      if(element.name)return `name:${element.name}${element.type==='radio'?':'+(element.value||''):''}`;
      if(data)return `data:${data}`;
      if(element.tagName==='DETAILS'){
        const title=element.querySelector?.(':scope > summary')?.textContent?.trim().replace(/\s+/g,' ')||'';
        return `details:${ownerKey?ownerKey+':':''}${title||domPath(element)}`;
      }
      return `path:${domPath(element)}`;
    }
    const scopedKey=(element,customScope=scope())=>`${customScope}|${elementKey(element)}`;
    function readField(element){
      if(element.matches?.('[contenteditable="true"]'))return {kind:'html',value:element.innerHTML};
      if(element.type==='checkbox'||element.type==='radio')return {kind:'checked',value:!!element.checked};
      return {kind:'value',value:element.value,selectionStart:element.selectionStart,selectionEnd:element.selectionEnd};
    }
    function writeField(element,snapshot,focus=false){
      if(!snapshot)return;
      if(snapshot.kind==='html')element.innerHTML=snapshot.value;
      else if(snapshot.kind==='checked')element.checked=snapshot.value;
      else element.value=snapshot.value;
      if(focus){
        element.focus?.({preventScroll:true});
        if(snapshot.kind==='value'&&Number.isInteger(snapshot.selectionStart))try{element.setSelectionRange(snapshot.selectionStart,snapshot.selectionEnd)}catch(_error){}
      }
    }
    function markDirty(target,value){
      const key=typeof target==='string'?`${scope()}|${target}`:scopedKey(target);
      const snapshot=value===undefined&&typeof target!=='string'?readField(target):clone(value);
      dirty.set(key,snapshot);if(typeof target!=='string'&&target?.dataset)target.dataset.uiDirty='true';return key;
    }
    function isDirty(target){const key=typeof target==='string'?`${scope()}|${target}`:scopedKey(target);return dirty.has(key)}
    function clearDirty(target){
      if(!target){for(const key of [...dirty.keys()])if(key.startsWith(scope()+'|'))dirty.delete(key);return}
      const key=typeof target==='string'?`${scope()}|${target}`:scopedKey(target);dirty.delete(key);conflicts.delete(key);if(typeof target!=='string'&&target?.dataset)delete target.dataset.uiDirty;
    }
    function clearWithin(container){if(!container?.querySelectorAll)return;for(const field of container.querySelectorAll(EDITABLE))clearDirty(field)}
    function beginCommit(container=doc){
      const token=new Map();if(!container?.querySelectorAll)return token;
      for(const field of container.querySelectorAll(EDITABLE)){const key=scopedKey(field);if(dirty.has(key))token.set(key,clone(dirty.get(key)))}
      return token;
    }
    function finishCommit(token){for(const [key,value] of token||[])if(equal(dirty.get(key),value)){dirty.delete(key);conflicts.delete(key)}}
    function set(key,value){local.set(`${scope()}|${key}`,clone(value));return value}
    function get(key,fallback){const value=local.get(`${scope()}|${key}`);return value===undefined?fallback:clone(value)}

    function capture(container=doc){
      if(!container?.querySelectorAll)return {scope:scope(),fields:new Map(),details:new Map(),expanded:new Map(),selected:new Set(),dialogs:new Set(),active:'',scroll:[]};
      const currentScope=scope(),active=doc?.activeElement,fields=new Map();
      for(const element of container.querySelectorAll(EDITABLE)){
        const key=scopedKey(element,currentScope);
        if(dirty.has(key)||element===active)fields.set(key,readField(element));
      }
      const details=new Map([...container.querySelectorAll('details')].map(element=>[`${currentScope}|${elementKey(element)}`,!!element.open]));
      const expanded=new Map([...container.querySelectorAll('[aria-expanded]')].map(element=>[`${currentScope}|${elementKey(element)}`,element.getAttribute('aria-expanded')==='true']));
      const selected=new Set([...container.querySelectorAll('[role="tab"][aria-selected="true"]')].map(element=>`${currentScope}|${elementKey(element)}`));
      const dialogs=new Set([...container.querySelectorAll('dialog[open]')].map(element=>element.id||elementKey(element)));
      const scroll=[...container.querySelectorAll('[data-ui-scroll]')].map(element=>[`${currentScope}|${elementKey(element)}`,element.scrollLeft,element.scrollTop]);
      return {scope:currentScope,fields,details,expanded,selected,dialogs,active:active?.matches?.(EDITABLE)?scopedKey(active,currentScope):'',windowX:host.scrollX||0,windowY:host.scrollY||0,scroll};
    }
    function restore(snapshot,container=doc){
      if(!snapshot||snapshot.scope!==scope()||!container?.querySelectorAll)return;
      for(const element of container.querySelectorAll(EDITABLE)){
        const key=scopedKey(element,snapshot.scope),draft=snapshot.fields.get(key)||dirty.get(key);
        if(!draft)continue;
        const serverValue=readField(element);
        if(equal(serverValue,draft)){dirty.delete(key);conflicts.delete(key);delete element.dataset?.uiDirty;continue}
        conflicts.set(key,{server:serverValue,local:draft});writeField(element,draft,key===snapshot.active);element.dataset.uiDirty='true';
      }
      for(const element of container.querySelectorAll('details')){const key=`${snapshot.scope}|${elementKey(element)}`;if(snapshot.details.has(key))element.open=snapshot.details.get(key)}
      for(const element of container.querySelectorAll('[aria-expanded]')){const key=`${snapshot.scope}|${elementKey(element)}`;if(snapshot.expanded.has(key))element.setAttribute('aria-expanded',snapshot.expanded.get(key)?'true':'false')}
      for(const element of container.querySelectorAll('[role="tab"][aria-selected]'))element.setAttribute('aria-selected',snapshot.selected.has(`${snapshot.scope}|${elementKey(element)}`)?'true':'false');
      for(const dialog of container.querySelectorAll('dialog'))if(snapshot.dialogs.has(dialog.id||elementKey(dialog))&&!dialog.open)dialog.showModal?.();
      for(const [key,left,top] of snapshot.scroll){const element=[...container.querySelectorAll('[data-ui-scroll]')].find(row=>`${snapshot.scope}|${elementKey(row)}`===key);if(element){element.scrollLeft=left;element.scrollTop=top}}
      host.requestAnimationFrame?.(()=>host.scrollTo?.(snapshot.windowX,snapshot.windowY));
    }
    function safeUpdate(container,update){
      if(typeof update!=='function')throw new TypeError('safeUpdate requires an update function');
      if(renderDepth)return update();
      const snapshot=capture(doc||container);renderDepth++;
      try{return update()}finally{renderDepth--;restore(snapshot,doc||container)}
    }
    const safeRender=update=>safeUpdate(doc,update);

    function changedRoots(before,after){
      const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
      return [...keys].filter(key=>!equal(before?.[key],after?.[key]));
    }
    function shouldRender(pageName,roots,membersChanged=false){
      const dependencies=PAGE_ROOTS[pageName];
      if(!dependencies)return roots.length>0;
      return roots.some(key=>dependencies.includes(key))||(membersChanged&&dependencies.includes('@members'));
    }
    function registerPage(pageName,roots){PAGE_ROOTS[pageName]=[...new Set(roots||[])]}

    function acceptRealtimeEvent(channel,payload={}){
      const token=String(payload.eventId||`${payload.clientId||''}:${payload.at||''}:${payload.campaignId||''}`);
      if(token==='::')return true;
      let bucket=seenEvents.get(channel);if(!bucket){bucket=new Set();seenEvents.set(channel,bucket)}
      if(bucket.has(token))return false;bucket.add(token);
      while(bucket.size>100)bucket.delete(bucket.values().next().value);
      return true;
    }
    function realtimePayload(payload={}){const at=Date.now();return {...payload,at,clientId:clientId,eventId:`${clientId}:${at}:${Math.random().toString(36).slice(2)}`}}
    function replaceSubscription(key,value,cleanup){clearSubscription(key);subscriptions.set(key,{value,cleanup});return value}
    function clearSubscription(key){const entry=subscriptions.get(key);if(!entry)return false;subscriptions.delete(key);try{entry.cleanup?.(entry.value)}catch(error){console.warn('UI subscription cleanup failed',error)}return true}
    function clearCampaign(campaignId){
      const prefix=`${campaignId}:`;
      for(const map of [local,dirty,conflicts])for(const key of [...map.keys()])if(key.startsWith(prefix))map.delete(key);
      seenEvents.delete(`campaign:${campaignId}`);
    }
    async function optimistic(key,{apply,commit,rollback}){
      const undo=apply?.();
      try{const result=await commit();clearDirty(key);return result}catch(error){(rollback||undo)?.(error);throw error}
    }

    if(doc?.addEventListener){
      doc.addEventListener('input',event=>{if(event.target?.matches?.(EDITABLE))markDirty(event.target)},true);
      doc.addEventListener('change',event=>{if(event.target?.matches?.(EDITABLE))markDirty(event.target)},true);
      doc.addEventListener('submit',event=>{if(!event.target?.matches?.('[data-native-submit]'))event.preventDefault()},true);
      doc.addEventListener('click',event=>{const close=event.target?.closest?.('[data-modal-close]');if(close)close.closest('dialog')?.close()},true);
      doc.addEventListener('close',event=>{if(event.target?.tagName==='DIALOG')clearWithin(event.target)},true);
    }

    const clientId=host.crypto?.randomUUID?.()||`client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return {set,get,markDirty,isDirty,clearDirty,clearWithin,beginCommit,finishCommit,capture,restore,safeUpdate,safeRender,changedRoots,shouldRender,registerPage,acceptRealtimeEvent,realtimePayload,replaceSubscription,clearSubscription,clearCampaign,optimistic,getConflict:target=>conflicts.get(typeof target==='string'?`${scope()}|${target}`:scopedKey(target)),clientId,_equal:equal};
  }

  root.createKadimUiStateManager=createUiStateManager;
  root.kadimUiState=createUiStateManager(root);
  if(typeof module==='object'&&module.exports)module.exports={createUiStateManager};
})(typeof window!=='undefined'?window:globalThis);
