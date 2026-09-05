const assert=require('node:assert/strict');
const {createUiStateManager}=require('../ui-state-manager.js');

function harness(field){
  let fields=[field];
  const body={dataset:{uiScope:'campaign:market'}};
  const document={body,activeElement:null,addEventListener(){},querySelectorAll(selector){
    if(selector.startsWith('input'))return fields;
    return [];
  }};
  const host={document,scrollX:0,scrollY:0,scrollTo(){},requestAnimationFrame(fn){fn()}};
  const manager=createUiStateManager(host);
  field.focus=()=>{document.activeElement=field};
  return {manager,document,replace(next){next.focus=()=>{document.activeElement=next};fields=[next]}};
}

function input(id,value,type='text'){
  return {id,value,type,checked:type==='checkbox'?!!value:false,dataset:{},tagName:'INPUT',disabled:false,parentElement:null,
    matches(selector){return selector.startsWith('input')},closest(){return null},setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end},selectionStart:0,selectionEnd:0};
}

{
  const old=input('counterOffer','125'),fresh=input('counterOffer','100');
  const h=harness(old);h.manager.markDirty(old);h.manager.safeRender(()=>h.replace(fresh));
  assert.equal(fresh.value,'125','dirty text input survives a server render');
  assert.ok(h.manager.getConflict(fresh),'different server and local values are recorded as a conflict');
}

{
  const old=input('enabled',true,'checkbox'),fresh=input('enabled',false,'checkbox');
  const h=harness(old);h.manager.markDirty(old);h.manager.safeRender(()=>h.replace(fresh));
  assert.equal(fresh.checked,true,'dirty checkbox survives a server render');
}

{
  const old=input('shopTier','2'),fresh=input('shopTier','1');old.tagName=fresh.tagName='SELECT';
  const h=harness(old);h.manager.markDirty(old);h.manager.safeRender(()=>h.replace(fresh));
  assert.equal(fresh.value,'2','dirty select survives a server render');
}

{
  const old=input('activeEditor','draft'),fresh=input('activeEditor','server');
  const h=harness(old);h.document.activeElement=old;h.manager.safeRender(()=>h.replace(fresh));
  assert.equal(fresh.value,'draft','focused edit survives without waiting for an input event');
  assert.equal(h.document.activeElement,fresh,'focus is restored to the replacement control');
}

{
  const h=harness(input('x','x'));
  assert.deepEqual(h.manager.changedRoots({characters:[{hp:10}],notes:'a'},{characters:[{hp:9}],notes:'a'}),['characters']);
  assert.equal(h.manager.shouldRender('market',['characters']),false,'unrelated campaign updates skip the market render');
  assert.equal(h.manager.shouldRender('encounter',['characters']),true,'combat renders when character state changes');
  const payload={campaignId:'c1',clientId:'client',eventId:'event-1',at:1};
  assert.equal(h.manager.acceptRealtimeEvent('campaign:c1',payload),true);
  assert.equal(h.manager.acceptRealtimeEvent('campaign:c1',payload),false,'duplicate realtime echoes are ignored');
}

{
  const field=input('notes','first');const h=harness(field);h.manager.markDirty(field);
  const commit=h.manager.beginCommit(h.document);field.value='second';h.manager.markDirty(field);h.manager.finishCommit(commit);
  assert.equal(h.manager.isDirty(field),true,'a later edit is not cleared by an earlier save response');
  const latest=h.manager.beginCommit(h.document);h.manager.finishCommit(latest);
  assert.equal(h.manager.isDirty(field),false,'the matching saved draft clears after confirmation');
}

{
  const body={dataset:{uiScope:'campaign:party'}},summary={textContent:'Inventory'};
  const oldDetail={tagName:'DETAILS',id:'',dataset:{entityId:'char-1'},open:true,parentElement:null,matches(){return false},closest(){return null},querySelector(){return summary}};
  const freshDetail={...oldDetail,open:false,dataset:{entityId:'char-1'}};
  const oldClosed={...oldDetail,open:false,dataset:{entityId:'char-2'}};
  const freshClosed={...oldDetail,open:true,dataset:{entityId:'char-2'}};
  const oldDialog={tagName:'DIALOG',id:'modal',open:true,showModal(){this.open=true}};
  const freshDialog={tagName:'DIALOG',id:'modal',open:false,showModal(){this.open=true}};
  let details=[oldDetail,oldClosed],dialogs=[oldDialog];
  const document={body,activeElement:null,addEventListener(){},querySelectorAll(selector){
    if(selector.startsWith('input'))return [];
    if(selector==='details[open]')return details.filter(row=>row.open);
    if(selector==='details')return details;
    if(selector==='dialog[open]')return dialogs.filter(row=>row.open);
    if(selector==='dialog')return dialogs;
    return [];
  }};
  const manager=createUiStateManager({document,scrollX:0,scrollY:0,scrollTo(){},requestAnimationFrame(fn){fn()}});
  manager.safeRender(()=>{details=[freshDetail,freshClosed];dialogs=[freshDialog]});
  assert.equal(freshDetail.open,true,'open entity details survive a render');
  assert.equal(freshClosed.open,false,'closed entity details survive a render');
  assert.equal(freshDialog.open,true,'open modal survives a render');
}

(async()=>{
  const h=harness(input('x','x'));let value='server';
  await assert.rejects(h.manager.optimistic('save',{apply(){value='optimistic';return ()=>{value='server'}},async commit(){throw new Error('network')}}));
  assert.equal(value,'server','failed optimistic updates roll back');
  let cleaned=0;h.manager.replaceSubscription('campaign',{},()=>cleaned++);h.manager.replaceSubscription('campaign',{},()=>cleaned++);
  assert.equal(cleaned,1,'replacing a subscription cleans the previous one');
  h.manager.clearSubscription('campaign');assert.equal(cleaned,2,'explicit cleanup runs once');
  console.log('ui-state-manager: 15 checks passed');
})().catch(error=>{console.error(error);process.exitCode=1});
