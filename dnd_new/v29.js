/* v29: remove the last generic theme placeholders from every screen. */
const v29OldTheme=prTheme;
prTheme=function(name=''){
  const species=allSpecies().find(s=>(s.subs||[]).includes(name));
  if(species)return ['alt tür mekaniği',v28SubspeciesText(name,species.name)];
  const klass=allClasses().find(c=>(c.subs||[]).includes(name));
  if(klass)return ['subclass mekaniği',v28SubclassText(name)];
  return v29OldTheme(name);
};
prHeritageRows=function(c){if(!c.subspecies)return[];return [[1,c.subspecies+' Özellikleri',v28SubspeciesText(c.subspecies,c.species)]]};
prSubclassRows=function(c){if(!c.subclass)return[];let unlock=['Cleric','Sorcerer','Warlock'].includes(c.className)?1:['Druid','Wizard'].includes(c.className)?2:3;return [[unlock,c.subclass+' Özellikleri',v28SubclassText(c.subclass)]]};
const v29CreatePreviewBase=v25CreatePreview;
v25CreatePreview=function(){v29CreatePreviewBase();let species=$('#prNewSpecies')?.value,sub=$('#prNewSubspecies')?.value,el=$('#v25CreatePreview');if(el&&sub)el.insertAdjacentHTML('afterbegin',`<div class="v29-choice-rule"><b>${esc(sub)} — Mekanik</b><p>${esc(v28SubspeciesText(sub,species))}</p></div>`)};
const v29TraitBase=prTraitCard;
prTraitCard=function(c){let html=v29TraitBase(c);if(!c.subspecies)return html;return html.replace('</section>',`<div class="v29-choice-rule"><b>${esc(c.subspecies)}</b><p>${esc(v28SubspeciesText(c.subspecies,c.species))}</p></div></section>`)};
if(current)render();
