/* v42: Keep the local dice form stable across log refreshes and cloud re-renders. */
(()=>{
  const V42_DICE_TYPES=new Set(['2','3','4','6','8','10','12','20','100','F']);
  const v42DiceMemory=new Map();

  function v42DiceKey(){
    return `kadim-dice-v42:${String(auth?.id||'guest')}:${String(current?.id||'none')}`;
  }

  function v42Finite(value,fallback=0,min=-999,max=999){
    let number=Number(value);
    return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
  }

  function v42DiceDefaults(){
    return {die:'20',count:1,bonus:0,bonusManual:false,skill:'Serbest d20',formula:'',last:null};
  }

  function v42NormalizeDicePrefs(raw={}){
    let prefs={...v42DiceDefaults(),...(raw&&typeof raw==='object'?raw:{})};
    prefs.die=V42_DICE_TYPES.has(String(prefs.die))?String(prefs.die):'20';
    prefs.count=Math.round(v42Finite(prefs.count,1,1,20));
    prefs.bonus=v42Finite(prefs.bonus,0);
    prefs.bonusManual=!!prefs.bonusManual;
    prefs.skill=Object.hasOwn(V25_SKILLS,String(prefs.skill))?String(prefs.skill):'Serbest d20';
    prefs.formula=String(prefs.formula||'').slice(0,80);
    if(!prefs.last||typeof prefs.last!=='object')prefs.last=null;
    else{
      let values=Array.isArray(prefs.last.values)?prefs.last.values.map(value=>v42Finite(value,0,-1000,1000)).slice(0,20):[];
      prefs.last={formula:String(prefs.last.formula||'Zar atışı').slice(0,180),values,bonus:v42Finite(prefs.last.bonus,0),total:v42Finite(prefs.last.total,0,-999999,999999)};
    }
    return prefs;
  }

  function v42LoadDicePrefs(){
    let key=v42DiceKey(),cached=v42DiceMemory.get(key);
    if(cached)return v42NormalizeDicePrefs(cached);
    let stored=null;
    try{stored=JSON.parse(localStorage.getItem(key)||'null')}catch(error){stored=null}
    let prefs=v42NormalizeDicePrefs(stored);
    v42DiceMemory.set(key,prefs);
    return {...prefs};
  }

  function v42SaveDicePrefs(prefs){
    let key=v42DiceKey(),normalized=v42NormalizeDicePrefs(prefs);
    v42DiceMemory.set(key,normalized);
    try{localStorage.setItem(key,JSON.stringify(normalized))}catch(error){}
    return normalized;
  }

  function v42CaptureDiceForm(prefs=v42LoadDicePrefs()){
    let count=$('#sessionDiceCount'),bonus=$('#sessionDiceBonus'),skill=$('#v25Skill'),formula=$('#sessionFormula');
    if(count)prefs.count=Math.round(v42Finite(count.value,prefs.count,1,20));
    if(bonus)prefs.bonus=v42Finite(bonus.value,prefs.bonus);
    if(skill&&Object.hasOwn(V25_SKILLS,skill.value))prefs.skill=skill.value;
    if(formula)prefs.formula=String(formula.value||'').slice(0,80);
    if(V42_DICE_TYPES.has(String(sessionSelectedDie)))prefs.die=String(sessionSelectedDie);
    return prefs;
  }

  function v42PaintLastRoll(last){
    let output=$('#sessionRollout');if(!output||!last)return;
    let total=document.createElement('b'),detail=document.createElement('small');
    total.textContent=String(last.total);
    detail.textContent=`${last.formula} → [${last.values.join(', ')}]`;
    output.replaceChildren(total,detail);
  }

  function v42RestoreDiceForm(){
    if(!current||page!=='dice'||!$('#sessionDiceCount'))return;
    let prefs=v42LoadDicePrefs();
    sessionSelectedDie=prefs.die;
    document.querySelectorAll('[data-session-die]').forEach(button=>{
      let selected=button.dataset.sessionDie===prefs.die;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    let count=$('#sessionDiceCount'),bonus=$('#sessionDiceBonus'),skill=$('#v25Skill'),formula=$('#sessionFormula');
    if(count)count.value=String(prefs.count);
    if(skill){
      skill.value=prefs.skill;
      if(typeof v25UpdateSkill==='function')v25UpdateSkill();
    }
    if(bonus){
      if(prefs.bonusManual||prefs.skill==='Serbest d20')bonus.value=String(prefs.bonus);
      else prefs.bonus=v42Finite(bonus.value,prefs.bonus);
    }
    if(formula)formula.value=prefs.formula;
    v42PaintLastRoll(prefs.last);
    v42SaveDicePrefs(prefs);
  }

  function v42WrapDicePage(base){
    return function(){
      let prefs=v42LoadDicePrefs();
      sessionSelectedDie=prefs.die;
      let html=base();
      queueMicrotask(v42RestoreDiceForm);
      return html;
    };
  }

  dmPages.dice=v42WrapDicePage(dmPages.dice);
  playerPages.dice=v42WrapDicePage(playerPages.dice);

  const v42RecordRollBase=sessionRecordRoll;
  sessionRecordRoll=async function(formula,values,bonus,total){
    let prefs=v42CaptureDiceForm(),skill=$('#v25Skill')?.value||prefs.skill;
    let displayed=skill&&skill!=='Serbest d20'?`${skill} • ${formula}`:String(formula);
    prefs.last={formula:displayed,values:Array.isArray(values)?values.slice():[],bonus,total};
    v42SaveDicePrefs(prefs);
    return v42RecordRollBase(formula,values,bonus,total);
  };

  document.addEventListener('input',event=>{
    if(!current||page!=='dice')return;
    let prefs=v42LoadDicePrefs();
    if(event.target.id==='sessionDiceCount')prefs.count=Math.round(v42Finite(event.target.value,prefs.count,1,20));
    else if(event.target.id==='sessionDiceBonus'){prefs.bonus=v42Finite(event.target.value,prefs.bonus);prefs.bonusManual=true}
    else if(event.target.id==='sessionFormula')prefs.formula=String(event.target.value||'').slice(0,80);
    else return;
    v42SaveDicePrefs(prefs);
  });

  document.addEventListener('change',event=>{
    if(!current||page!=='dice'||event.target.id!=='v25Skill')return;
    let prefs=v42LoadDicePrefs();
    prefs.skill=Object.hasOwn(V25_SKILLS,event.target.value)?event.target.value:'Serbest d20';
    prefs.bonus=v42Finite($('#sessionDiceBonus')?.value,0);
    prefs.bonusManual=false;
    v42SaveDicePrefs(prefs);
  });

  document.addEventListener('click',event=>{
    let button=event.target.closest('[data-session-die]');
    if(!button||!current||page!=='dice')return;
    let die=String(button.dataset.sessionDie);
    if(!V42_DICE_TYPES.has(die))return;
    let prefs=v42CaptureDiceForm();prefs.die=die;sessionSelectedDie=die;
    v42SaveDicePrefs(prefs);
    document.querySelectorAll('[data-session-die]').forEach(row=>{
      let selected=row===button;row.classList.toggle('selected',selected);row.setAttribute('aria-pressed',String(selected));
    });
  });

  window.v42RestoreDiceForm=v42RestoreDiceForm;
  if(current&&page==='dice')render();
})();
