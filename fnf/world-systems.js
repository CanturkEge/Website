/* FNF v0.7.0 · The room simulation UI. SQL is the source of truth. */
(() => {
  'use strict';
  const resources={coin:['Para','◇'],wood:['Odun','♧'],stone:['Taş','◆'],grain:['Tahıl','❦'],food:['Yiyecek','✿'],fodder:['Yem','❀'],ore:['Cevher','◈'],herbs:['Ot','✧'],fertilizer:['Gübre','✳']};
  const buildings={warehouse:['Depo','Ağırlık kapasitesi'],barn:['Ahır','Hayvan yeri ve kervan hacmi'],study:['Çalışma evi','Günlük araştırma'],tavern:['Han','Haber, içki ve oyun'],palisade:['Çit','Baskın kaybını azaltır']};
  const projects={seedcraft:['Tohum bilgisi','Tohumların gözlem defteri'],husbandry:['Soy kayıtları','Hayvan özelliklerini karşılaştır'],weather:['İklim notları','Hava döngülerini oku'],faith:['Alamet yorumu','Yardımcı elçilerin işaretleri']};
  const climate=['Ilıman','Kurak','Nemli','Soğuk'];
  const phaseNames=['Sabah','Öğle','Gece'];
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function row(label,value,note=''){return `<div class="sim-row"><strong>${safe(label)}</strong><span>${safe(value)}</span>${note?`<small>${safe(note)}</small>`:''}</div>`}
  function notice(message){return `<p class="sim-feedback feedback" role="status">${safe(message)}</p>`}
  function bind(main,ctx){
    main.querySelectorAll('[data-sim]').forEach(button=>button.onclick=async()=>{
      const action=button.dataset.sim, payload={...button.dataset};
      delete payload.sim;delete payload.label;
      if(button.dataset.amountFrom){
        const input=main.querySelector(button.dataset.amountFrom);
        payload.amount=input?.value;
      }
      button.disabled=true;
      const old=button.textContent;button.textContent='İşleniyor…';
      try{
        const {data,error}=await ctx.db.rpc('fnf_sim_action',{
          p_room_id:ctx.room.id,p_action:action,p_payload:payload
        });
        if(error||data?.error)throw error||new Error(data.error);
        await ctx.loadWorld();ctx.render();
      }catch(err){
        button.disabled=false;button.textContent=old;
        const target=main.querySelector('.sim-feedback');
        if(target){target.textContent=err.message||'İşlem tamamlanamadı.';target.classList.remove('ok')}
      }
    });
  }
  function overview(main,ctx){
    const w=ctx.world,s=w.sim,dm=ctx.room.role==='dm';
    if(!s)return;
    const block=document.createElement('section');
    block.className='sim-overview stacked';
    block.innerHTML=`<div class="sim-heading"><span class="eyebrow">DÜNYANIN NABZI · ${safe(s.climate)}</span><h2>Günün ritmi</h2><p>Dünya tohumu <code>${safe(s.world_seed)}</code> · Mevsimler 10 gün sürer. Güneş ${safe(s.conditions?.sun)} · Nem %${safe(s.conditions?.humidity)} · Sıcaklık ${safe(s.conditions?.temperature)}°C. Sabah kuralları DM gün geçirdiğinde işler.</p></div>
      <div class="weather-track">${(s.weather_phases||[]).map((v,i)=>`<div class="${i===s.phase?'current':''}"><small>${phaseNames[i]}</small><strong>${safe(v)}</strong></div>`).join('')}</div>
      ${dm&&s.phase<2?`<button class="button secondary" data-sim="phase">Sonraki hava evresi →</button>`:''}
      <div class="sim-kpis"><div><b>${s.population}</b><small>HALK</small></div><div><b>${s.morale}</b><small>MORAL</small></div><div><b>${s.threat}</b><small>TEHLİKE</small></div><div><b>${s.favor}</b><small>LÜTUF</small></div></div>
      <div class="omen-line"><span>✧</span><div><b>Alamet</b><p>${safe(s.omen?.text)}</p>${s.omen?.task?`<small>${safe(s.omen.due)}. güne kadar DM kararı bekliyor.</small>`:''}</div></div>
      ${dm&&s.omen?.task?`<div class="sim-actions"><button class="button" data-sim="omen" data-choice="help">3 yiyecekle yardım et</button><button class="button secondary" data-sim="omen" data-choice="refuse">Reddet</button></div>`:''}
      ${dm?`<div class="sim-actions"><button class="button secondary" data-sim="guard">3 odunla nöbet kur</button></div>`:''}
      ${w.day===1&&dm?`<form class="world-seed-form"><label for="worldSeed">Dünya tohumu (yalnız ilk gün)</label><div class="sim-actions"><input id="worldSeed" value="${safe(s.world_seed)}" minlength="4" maxlength="32" pattern="[A-Za-z0-9_-]+"><select id="worldClimate">${climate.map(c=>`<option ${s.climate===c?'selected':''}>${c}</option>`).join('')}</select><button class="button secondary" type="submit">Dünyayı belirle</button></div></form>`:''}
      ${notice('')}`;
    main.append(block);
    bind(block,ctx);
    const form=block.querySelector('.world-seed-form');
    if(form)form.onsubmit=async e=>{
      e.preventDefault();const button=e.submitter;button.disabled=true;
      const {data,error}=await ctx.db.rpc('fnf_sim_action',{
        p_room_id:ctx.room.id,p_action:'set_world',
        p_payload:{target:form.querySelector('#worldSeed').value,choice:form.querySelector('#worldClimate').value}
      });
      if(error||data?.error){button.disabled=false;block.querySelector('.sim-feedback').textContent=error?.message||data.error;return}
      await ctx.loadWorld();ctx.render();
    };
  }
  function settlement(main,ctx){
    const s=ctx.world.sim,dm=ctx.room.role==='dm';
    const entries=Object.entries(resources).map(([id,[name,icon]])=>`<div class="supply"><span>${icon}</span><strong>${name}</strong><b>${safe(s.resources[id]||0)}</b></div>`).join('');
    main.innerHTML=`<section class="sim-heading"><span class="eyebrow">YERLEŞİM DEFTERİ · GÜN ${ctx.world.day}</span><h2>Köy yaşadıkça değişir.</h2><p>Halk yiyecek tüketir, binalar bakım ister. Ahırdaki hayvanlar yemle üretir; vergi her onuncu günde gelir.</p></section>
      <div class="sim-two"><section class="sim-sheet"><h3>Ortak depo</h3><p>Ağırlık ${ctx.world.weight}/${ctx.world.capacity}. Kervan tek seferde ${ctx.world.carry} hacim taşır.</p><div class="supplies">${entries}</div></section>
      <section class="sim-sheet"><h3>Halk ve yolcular</h3>${row('Köylü',s.population,'Her gün yiyecek gerekli')}${row('Moral',s.morale+'/100','Eksiklik, vergi ve baskın etkiler')}
        <div class="visitor-list">${s.visitors?.length?s.visitors.map((v,i)=>`<div class="visitor"><b>${safe(v.name)}</b><small>${safe(v.species)} · ${safe(v.class_id)} · ${safe(v.skill)} ${safe(v.ability)}</small><button class="text-button" data-sim="ask" data-target="${i}" ${s.last_ask_day===ctx.world.day?'disabled':''}>1 paraya bilgi sor →</button>${dm?`<button class="text-button" data-sim="recruit" data-index="${i}">2 yiyecekle köye al →</button>`:''}</div>`).join(''):'<p class="muted">Yolcuların gelişi için günü geçir.</p>'}</div></section></div>
      <section class="sim-sheet stacked"><div class="sim-section-head"><div><span class="eyebrow">KÖY HALKI</span><h3>Sakinler</h3></div><span>Her yolcunun kendi kökeni ve becerisi vardır.</span></div>
        <div class="visitor-list">${s.villagers.map(v=>`<div class="visitor"><b>${safe(v.name)}</b><small>${safe(v.species)} · ${safe(v.class_id)} · ${safe(v.skill)} · Yetenek ${safe(v.ability)}</small></div>`).join('')}</div></section>
      <section class="sim-sheet stacked"><div class="sim-section-head"><div><span class="eyebrow">YAPILAR</span><h3>İnşa ve bakım</h3></div><span>Günlük bakım odun ister.</span></div>
        <div class="buildings">${Object.entries(buildings).map(([id,[name,desc]])=>`<div class="building"><span>⌂</span><div><strong>${name} · Seviye ${s.buildings[id]}</strong><small>${desc}</small></div>${dm?`<button class="button secondary" data-sim="build" data-target="${id}" ${s.buildings[id]>=3?'disabled':''}>Yükselt · ${4+3*s.buildings[id]} odun / ${2+s.buildings[id]} taş</button>`:''}</div>`).join('')}</div></section>${notice('')}`;
    bind(main,ctx);
  }
  function livestock(main,ctx){
    const s=ctx.world.sim,entry=ctx.world.catalog.find(x=>x.id==='animal_01');
    const name=entry?.name||'Bilinmeyen hayvan';
    main.innerHTML=`<section class="sim-heading"><span class="eyebrow">AHIR · SOY KAYDI</span><h2>Her yavru ayrı bir iz taşır.</h2><p>Yetişkin dişi ve erkek aynı türden eşleşir. Verim ve dayanıklılık ebeveyn ortalamasından küçük bir sapmayla kalıtılır; nadir doğum nimeti oluşabilir. Günlük yem üretimi sürdürür.</p></section>
      <div class="sim-two"><section class="sim-sheet"><h3>Ahır / ${s.animals.length} canlı</h3><div class="animal-list">${s.animals.map(a=>`<div class="animal"><span class="animal-seal">${entry?.image?'<img src="./assets/codex/animal_01.svg" alt="">':'?'}</span><div><strong>${safe(a.id)} · ${safe(name)} ${a.blessing?'✧':''}</strong><small>${a.sex==='F'?'Dişi':'Erkek'} · ${a.age<2?'Yavru':'Yetişkin'} · Verim ${a.yield} · Dayanıklılık ${a.hardiness}</small></div></div>`).join('')}</div></section>
      <section class="sim-sheet"><h3>Yetiştirme</h3><p>Yavru için ahırda yer ve 2 yem gerekli. İlk iki oyun gününde yavru üretime katılmaz.</p><form id="breedForm"><label for="mother">Dişi</label><select id="mother">${s.animals.filter(a=>a.sex==='F'&&a.age>=2).map(a=>`<option value="${safe(a.id)}">${safe(a.id)} · ${safe(name)}</option>`).join('')}</select><label for="father">Erkek</label><select id="father">${s.animals.filter(a=>a.sex==='M'&&a.age>=2).map(a=>`<option value="${safe(a.id)}">${safe(a.id)} · ${safe(name)}</option>`).join('')}</select><button class="button" type="submit">Yavrulat · 2 yem</button></form><p class="muted">Nadir tür bilgisi ansiklopedide DM açtıkça görünür.</p></section></div>${notice('')}`;
    main.querySelector('#breedForm').onsubmit=async e=>{
      e.preventDefault();const b=e.submitter;b.disabled=true;
      const {data,error}=await ctx.db.rpc('fnf_sim_action',{p_room_id:ctx.room.id,p_action:'breed',
        p_payload:{target:main.querySelector('#mother').value,choice:main.querySelector('#father').value}});
      if(error||data?.error){b.disabled=false;main.querySelector('.sim-feedback').textContent=error?.message||data.error;return}
      await ctx.loadWorld();ctx.render();
    };
  }
  function market(main,ctx){
    const s=ctx.world.sim,q=ctx.world.quotes;
    main.innerHTML=`<section class="sim-heading"><span class="eyebrow">YOL PAZARI · ${safe(s.climate)} BÖLGESİ</span><h2>Her fiyat bir hikâye.</h2><p>Fiyatlar gün, mevsim, bölge ihtiyacı ve alım satım talebine göre değişir. Her malın ağırlığı, hacmi ve yoğunluğu vardır. Kervan hacmi ${ctx.world.carry}, depo ${ctx.world.weight}/${ctx.world.capacity} ağırlık.</p></section>
      <section class="sim-sheet"><div class="sim-section-head"><h3>Günün tezgâhı</h3><span>Ortak para: ${s.resources.coin} ◇</span></div><div class="market-list">${Object.entries(q).map(([id,v])=>`<div class="market-row"><div><strong>${resources[id]?.[0]||id}</strong><small>${s.resources[id]} stok · ${v.weight} ağırlık / ${v.bulk} hacim · yoğunluk ${v.density}</small></div><b>Al ${v.buy} ◇ <small>Sat ${v.sell} ◇</small></b><input id="qty-${id}" type="number" min="1" max="20" value="1" aria-label="${resources[id]?.[0]} miktarı"><div class="sim-actions"><button class="button secondary" data-sim="trade" data-target="${id}" data-choice="buy" data-amount-from="#qty-${id}">Al</button><button class="button secondary" data-sim="trade" data-target="${id}" data-choice="sell" data-amount-from="#qty-${id}">Sat</button></div></div>`).join('')}</div></section>
      <section class="sim-sheet stacked tavern"><span class="eyebrow">HAN · YOL HABERLERİ</span><h3>${s.buildings.tavern?'Kapılar açık':'Önce hanı kur'}</h3><p>${safe(s.news)}</p><div class="sim-actions"><button class="button secondary" data-sim="tavern" data-choice="drink" ${!s.buildings.tavern?'disabled':''}>İçki ve sohbet · 2 ◇</button><button class="button secondary" data-sim="tavern" data-choice="game" ${!s.buildings.tavern?'disabled':''}>Han oyunu · günde bir</button></div><small>Han oyunu yalnız oyun içi para kullanır.</small></section>${notice('')}`;
    bind(main,ctx);
  }
  function exploration(main,ctx){
    const s=ctx.world.sim,dm=ctx.room.role==='dm';
    main.innerHTML=`<section class="sim-heading"><span class="eyebrow">KEŞİF · İŞARETLER</span><h2>Haritanın dışına bak.</h2><p>Dünya tohumu iklimi, hava düzenini, yolcu profilini ve keşif sonuçlarını etkiler. Günde bir keşif kaynak bulur; tehlikeyi de yükseltir.</p></section>
      <div class="sim-two"><section class="sim-sheet"><h3>Yol günlüğü</h3><p>${safe(s.last_result)}</p><button class="button" data-sim="explore" ${s.last_explore_day===ctx.world.day?'disabled':''}>Keşfe çık →</button><p class="muted">Keşfedilen türün resim ve bilgilerini DM ansiklopediden açar.</p></section>
      <section class="sim-sheet"><span class="eyebrow">TEK YÜCE TANRI · YARDIMCI ELÇİLER</span><h3>Alametler</h3><p>${safe(s.omen?.text)}</p>${s.omen?.task?`<p>Görev süresi: ${safe(s.omen.due)}. gün. Yardım 3 yiyecek, ödül 5 lütuf.</p>`:''}<p>İlahi lütuf tarlada büyüye dönüşebilir. Her doğumda çok düşük olasılıkla özel nimet görülür.</p>${dm&&s.omen?.task?`<div class="sim-actions"><button class="button" data-sim="omen" data-choice="help">Görevi tamamla</button><button class="button secondary" data-sim="omen" data-choice="refuse">Reddet</button></div>`:''}</section></div>${notice('')}`;
    bind(main,ctx);
  }
  function research(main,ctx){
    const s=ctx.world.sim;
    main.innerHTML=`<section class="sim-heading"><span class="eyebrow">ÇALIŞMA EVİ · BİLGİ</span><h2>Bilinmeyeni birlikte çöz.</h2><p>Araştırma üç DM günü sürer. Deney ve yolcu sohbeti DM için keşif ipucudur; ansiklopedi bilgilerini açma yetkisi DM'de kalır.</p></section>
      <div class="sim-two"><section class="sim-sheet"><h3>Etkin araştırma</h3>${row('Proje',projects[s.research.active]?.[0]||'Yok')}${row('İlerleme',s.research.active?`${s.research.progress}/3 gün`:'Bekliyor')}${row('Tamamlanan',s.research.done.map(k=>projects[k]?.[0]||k).join(', ')||'Henüz yok')}</section>
      <section class="sim-sheet"><h3>Yeni çalışma</h3>${Object.entries(projects).map(([id,[name,desc]])=>`<div class="research-row"><div><strong>${name}</strong><small>${desc}</small></div><button class="button secondary" data-sim="research" data-target="${id}" ${s.research.done.includes(id)||s.research.active||!s.buildings.study?'disabled':''}>${s.research.done.includes(id)?'Tamamlandı':'6 ◇ · Başlat'}</button></div>`).join('')}<p class="muted">Başlamak için Yerleşim bölümünden Çalışma Evi kur.</p></section></div>${notice('')}`;
    bind(main,ctx);
  }
  function farm(main,ctx){
    main.querySelectorAll('.field-row').forEach(rowNode=>{
      const slot=rowNode.querySelector('[data-slot]')?.dataset.slot;
      if(!slot)return;
      const p=ctx.world.plots.find(x=>String(x.slot)===slot);
      if(!p)return;
      const line=document.createElement('div');line.className='field-tending';
      line.innerHTML=`<small>Alan ${p.area} · Verim ${p.fertility}% · Bakım ${p.care} · Gübre ${p.fertilizer} · Büyü ${p.magic}</small>
        <div class="sim-actions">${p.seed_id?`<button data-sim="field" data-target="${slot}" data-choice="care">Bakım</button><button data-sim="field" data-target="${slot}" data-choice="fertilize">Gübre</button><button data-sim="field" data-target="${slot}" data-choice="magic">Büyü</button>`:''}
          <button data-sim="field" data-target="${slot}" data-choice="restore">Toprağı yenile</button>
          ${ctx.room.role==='dm'?`<button data-sim="field" data-target="${slot}" data-choice="expand">Alanı büyüt</button>`:''}</div>`;
      rowNode.append(line);
    });
    main.insertAdjacentHTML('beforeend',notice(''));
    bind(main,ctx);
  }
  window.FNF_SYSTEMS={overview,settlement,livestock,market,exploration,research,farm};
})();
