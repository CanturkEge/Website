/* v65: safely seed single-stock named relics into existing campaign markets. */
((root)=>{
  'use strict';
  const baseEnsure=exEnsureState;
  exEnsureState=function(){
    baseEnsure();if(!state||current?.role!=='dm'||(+state.shopSeedVersion||0)>=7)return;
    state.market=Array.isArray(state.market)?state.market:[];
    for(const item of V65_UNIQUE_MARKET)if(!state.market.some(row=>row.id===item.id||row.name===item.name))state.market.push({...item});
    state.shopSeedVersion=7;setTimeout(save,0);
  };
  if(current){exEnsureState();render()}
})(typeof window!=='undefined'?window:globalThis);
