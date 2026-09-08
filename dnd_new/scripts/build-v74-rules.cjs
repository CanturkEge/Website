/* Derive server metadata from the exact client catalogue. Run after catalogue edits. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={console,URL};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['v47-data.js','v52-data.js','v53-data.js','v74-core.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const rules=[],put=(id,data)=>rules.push([id,data]);
for(const s of ctx.V47_SPELLS)put('spell:'+s.id,{id:s.id,name:s.name,nameTr:s.nameTr||s.name,level:s.level,castingTime:s.castingTime,concentration:s.concentration,rounds:ctx.v74Rules.durationRounds(s)});
for(const [name,cl]of Object.entries(ctx.V53_CLASSES)){
 const features=rows=>(rows||[]).map(f=>({name:f.name,level:f.level}));
 put('class:'+name,{saves:cl.saves,features:features(cl.features)});
 const subs=new Set(['',...Object.keys(ctx.V53_SUBCLASS_FEATURES?.[name]||{})]);
 if(name==='Cleric')for(const d of Object.values(ctx.V52_CLERIC_DOMAINS))subs.add(d.id);
 for(let level=1;level<=20;level++)put(`class:${name}:${level}`,{resources:ctx.v74Rules.resourceRules({className:name,level})});
 const casting=subclass=>Array.from({length:21},(_,level)=>{const c={className:name,subclass,level};return level&&ctx.v74Rules.casting(c)?{slots:ctx.v74Rules.slots(c),automatic:ctx.v74Rules.automatic(c)}:null;});
 const base=casting('');if(base.some(Boolean))put(`casting:${name}:`,base);
 for(const subclass of subs){
  if(!subclass)continue;
  const extra=[...(ctx.V53_SUBCLASS_FEATURES?.[name]?.[subclass]||[])];
  if(name==='Cleric')extra.push(...(Object.values(ctx.V52_CLERIC_DOMAINS).find(d=>d.id===subclass)?.features||[]));
  put(`subclass:${name}:${subclass}`,{features:features(extra)});
  const rows=casting(subclass);if(rows.some(Boolean)&&JSON.stringify(rows)!==JSON.stringify(base))put(`casting:${name}:${subclass}`,rows);
 }
}
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const sqlPath=path.join(root,'v74-update.sql'),base=fs.readFileSync(sqlPath,'utf8').split('-- BEGIN GENERATED RULES')[0]+'-- BEGIN GENERATED RULES\n';
const sql=base+'insert into public.adventure_rules_v74(id,data) values\n'+rules.map(([id,d])=>`(${quote(id)},${quote(JSON.stringify(d))}::jsonb)`).join(',\n')+'\non conflict(id) do update set data=excluded.data;\ncommit;\n';
fs.writeFileSync(sqlPath,sql);
const migrations=fs.readdirSync(path.join(root,'supabase/migrations')).filter(x=>x.endsWith('_adventure_tools_v74.sql'));
if(migrations.length!==1)throw Error('Create exactly one migration using supabase migration new adventure_tools_v74 first');
fs.writeFileSync(path.join(root,'supabase/migrations',migrations[0]),sql);
console.log(`${rules.length} rule rows; ${ctx.V47_SPELLS.length} spells; ${sql.length} SQL bytes`);
