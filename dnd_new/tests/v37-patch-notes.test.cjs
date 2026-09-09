const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');

function fixture(){
  const c={console,current:null,dmNav:[['guide','⌕','Rehber']],playerNav:[['guide','⌕','Rehber']],dmPages:{},playerPages:{}};
  c.window=c;c.globalThis=c;
  c.document={addEventListener:()=>{},querySelectorAll:()=>[]};
  c.$=()=>null;
  c.esc=(value='')=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  c.v26Head=(kicker,title,summary)=>`<header><span>${kicker}</span><h1>${title}</h1><p>${summary}</p></header>`;
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','v37.js'),'utf8'),c,{filename:'v37.js'});
  return c;
}

test('patch notes hero derives its version, build and summary from the latest release',()=>{
  const html=fixture().dmPages.patchnotes();
  assert.match(html,/<h2>v3\.8\.0 • Build 78<\/h2>/);
  assert.match(html,/Milestone yerine toplam XP/);
  assert.match(html,/v0\.1\.0–v3\.8\.0/);
});

test('latest release card is opened by default instead of a hard-coded older release',()=>{
  const html=fixture().playerPages.patchnotes();
  assert.match(html,/<details class="v37-release current" open><summary><span class="v37-version">v3\.8\.0<\/span>/);
  assert.doesNotMatch(html,/<details class="v37-release current" open><summary><span class="v37-version">v3\.7\.0<\/span>/);
});
