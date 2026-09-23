const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.basename(__dirname)==='tests'?path.join(__dirname,'..'):__dirname,c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'v81-core.js'),'utf8'),c,{filename:'v81-core.js'});const R=c.v81WizardRules;
const spells=[{id:'fire-bolt',name:'Fire Bolt',nameTr:'Ateş Oku',level:0,classes:['Wizard']},{id:'alarm',name:'Alarm',level:1,ritual:true,classes:['Wizard']},{id:'shield',name:'Shield',level:1,classes:['Wizard']},{id:'misty-step',name:'Misty Step',level:2,classes:['Wizard']},{id:'bless',name:'Bless',level:1,classes:['Cleric']}];
const wizard={className:'Wizard',level:3,stats:{INT:16},preparedSpells:[{id:'v47-alarm',name:'Alarm',spellLevel:1},{id:'v47-fire-bolt',name:'Fire Bolt',spellLevel:0}]};
test('legacy prepared Wizard spells migrate into the book without losing cantrips',()=>{const value=R.model(wizard,spells);assert.equal(value.book.length,1);assert.equal(value.book[0].source,'legacy');assert.equal(value.prepared[0].name,'Alarm');assert.equal(value.cantrips[0].name,'Fire Bolt');});
test('prepared spells must be in the spellbook and stay inside INT plus level limit',()=>{const book=[R.entry(spells[1]),R.entry(spells[2])];assert.deepEqual(JSON.parse(JSON.stringify(R.validate(wizard,{book,prepared:[R.entry(spells[3])],cantrips:[]},spells))),['Misty Step kitapta olmadan hazırlanamaz.']);assert.equal(R.prepareLimit(wizard),6);});
test('Wizard progression limits and copy costs follow 2014 rules',()=>{assert.equal(R.cantripLimit({level:1}),3);assert.equal(R.cantripLimit({level:4}),4);assert.equal(R.cantripLimit({level:10}),5);assert.equal(R.learnedAllowance({level:3}),10);assert.deepEqual(JSON.parse(JSON.stringify(R.copyCost({level:3}))),{gp:150,hours:6});});
test('non-Wizard spells and spells above the unlocked level are rejected',()=>{const low={className:'Wizard',level:1,stats:{INT:16}};const bad=[R.entry(spells[3])];assert.match(R.validate(low,{book:bad,prepared:[],cantrips:[]},spells)[0],/bu Wizard seviyesinde/);assert.equal(R.resolve(spells,'Bless'),null);});
test('Wizard choice panel replaces the old combined picker with the spellbook workflow',()=>{
 const ui={console,V47_SPELLS:spells,v81WizardRules:R,V37_PATCH_NOTES:[],auth:null,current:null,document:{addEventListener:()=>{},querySelectorAll:()=>[]},prChoicePanel:()=>'<section class="pr-choice card v53-choice"><button id="prSavePlayerChoices" class="primary">Seçimlerimi Kaydet</button></section>',esc:String,$:()=>null};ui.window=ui;ui.globalThis=ui;vm.createContext(ui);vm.runInContext(fs.readFileSync(path.join(root,'v81.js'),'utf8'),ui,{filename:'v81.js'});
 const html=ui.prChoicePanel(wizard);assert.match(html,/Kitabım ve Bugün Hazırladıklarım/);assert.match(html,/id="v81WizardSave"/);assert.doesNotMatch(html,/id="prSavePlayerChoices"/);assert.doesNotMatch(html,/id="v81AddMode"/);assert.equal(ui.V37_PATCH_NOTES[0].build,'Build 82');
});
test('normal Wizard view hides the unowned catalog and locks preparation outside a long rest',()=>{
 const ui={console,V47_SPELLS:spells,v81WizardRules:R,V37_PATCH_NOTES:[],auth:null,current:null,document:{addEventListener:()=>{},querySelectorAll:()=>[]},prChoicePanel:()=>'<section class="pr-choice card v53-choice"><button id="prSavePlayerChoices" class="primary">Seçimlerimi Kaydet</button></section>',esc:String,$:()=>null};ui.window=ui;ui.globalThis=ui;vm.createContext(ui);vm.runInContext(fs.readFileSync(path.join(root,'v81.js'),'utf8'),ui,{filename:'v81.js'});
 const locked={...wizard,wizardSpellbookVersion:82,spellbookSpells:[R.entry(spells[1])],resources:{}},html=ui.prChoicePanel(locked);
 assert.match(html,/Alarm/);assert.doesNotMatch(html,/Misty Step/);assert.doesNotMatch(html,/id="v81WizardSave"/);assert.match(html,/Kısa dinlenme gerekli/);
});
test('DM rest and library permissions open only their matching Wizard controls',()=>{
 const ui={console,V47_SPELLS:spells,v81WizardRules:R,V37_PATCH_NOTES:[],auth:null,current:null,document:{addEventListener:()=>{},querySelectorAll:()=>[]},prChoicePanel:()=>'<section class="pr-choice card v53-choice"><button id="prSavePlayerChoices" class="primary">Seçimlerimi Kaydet</button></section>',esc:String,$:()=>null};ui.window=ui;ui.globalThis=ui;vm.createContext(ui);vm.runInContext(fs.readFileSync(path.join(root,'v81.js'),'utf8'),ui,{filename:'v81.js'});
 const base={...wizard,wizardSpellbookVersion:82,spellbookSpells:[R.entry(spells[1])]};
 const prepared=ui.prChoicePanel({...base,resources:{v82_prepare_ready:1}});assert.match(prepared,/Günlük hazırlıkları kaydet/);assert.doesNotMatch(prepared,/Misty Step/);
 const library=ui.prChoicePanel({...base,resources:{v82_spellbook_edit_ready:1}});assert.match(library,/Misty Step/);assert.match(library,/id="v81AddMode"/);
 const recovery=ui.prChoicePanel({...base,resources:{v82_arcane_recovery_ready:1}});assert.match(recovery,/id="v81RecoveryOpen" >Arcane Recovery</);
});
test('database patch requires DM rest and one-use library authorization',()=>{
 const sql=fs.readFileSync(path.join(root,'v82-update.sql'),'utf8');
 assert.match(sql,/wizard_rest_v82/);assert.match(sql,/wizard_spellbook_unlock_v82/);assert.match(sql,/İlk Wizard kurulumunda kopya büyü eklenemez/);assert.match(sql,/Hazırlanan büyüler yalnız uzun dinlenmeden sonra/);assert.match(sql,/önce DM kısa dinlenmeyi tamamlamalı/);assert.match(sql,/rows-'v82_arcane_recovery_ready'/);
});
