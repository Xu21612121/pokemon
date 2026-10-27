// User-defined slots with community sample rates; RGB remains disabled pending data.
// Rates must be per-pack probabilities; box/case guarantees need a separate model.
function drawConfiguredAnniversary(catalog, rates, random = Math.random, energyLast = false) {
  for (const key of ['fur','rgb','sar','ar','rr','gold']) {
    if (!Number.isFinite(rates?.[key]) || rates[key] < 0 || rates[key] > 1) throw Error('缺少有效单包概率：'+key);
  }
  if(rates.fur+rates.rgb>1 || rates.sar+rates.ar+rates.rr>1)throw Error('同卡位互斥概率之和不能超过1');
  const sample=group=>{const pool=catalog.filter(c=>c.slotGroup===group);if(!pool.length)throw Error('缺少卡池：'+group);return pool[Math.floor(random()*pool.length)];};
  if(energyLast){
    // English reference: at most one hit per pack, including DR/RR.
    const categories=['rgb','fur','sar','gold','ar','rr'];
    if(categories.reduce((sum,k)=>sum+rates[k],0)>1)throw Error('单包互斥出货概率之和不能超过1');
    const roll=random();let end=0,hit=null;
    for(const group of categories){end+=rates[group];if(roll<end){hit=group;break;}}
    // Until the user supplies a verified R list, the base pool is explicitly provisional.
    const baseRare=catalog.some(c=>c.slotGroup==='r')?'r':'normal';
    return [sample('normal'),sample('normal'),
      sample(['rgb','fur'].includes(hit)?hit:'normal'),
      sample(['sar','ar','rr'].includes(hit)?hit:baseRare),
      sample(hit==='gold'?'gold':'pikachu'),sample('energy')];
  }
  const special=random(),rare=random(),last=random();
  return [sample('normal'),sample('normal'),sample('normal'),
    sample(special<rates.rgb?'rgb':special<rates.rgb+rates.fur?'fur':'normal'),
    sample(rare<rates.sar?'sar':rare<rates.sar+rates.ar?'ar':rare<rates.sar+rates.ar+rates.rr?'rr':'normal'),
    sample(last<rates.gold?'gold':'pikachu')];
}
