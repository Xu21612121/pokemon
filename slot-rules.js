// User-defined slots with community sample rates; RGB remains disabled pending data.
// Rates must be per-pack probabilities; box/case guarantees need a separate model.
function drawConfiguredAnniversary(catalog, rates, random = Math.random) {
  for (const key of ['fur','rgb','sar','ar','rr','gold']) {
    if (!Number.isFinite(rates?.[key]) || rates[key] < 0 || rates[key] > 1) throw Error('缺少有效单包概率：'+key);
  }
  if(rates.fur+rates.rgb>1 || rates.sar+rates.ar+rates.rr>1)throw Error('同卡位互斥概率之和不能超过1');
  const sample=group=>{const pool=catalog.filter(c=>c.slotGroup===group);if(!pool.length)throw Error('缺少卡池：'+group);return pool[Math.floor(random()*pool.length)];};
  const special=random(),rare=random(),last=random();
  return [sample('normal'),sample('normal'),sample('normal'),
    sample(special<rates.rgb?'rgb':special<rates.rgb+rates.fur?'fur':'normal'),
    sample(rare<rates.sar?'sar':rare<rates.sar+rates.ar?'ar':rare<rates.sar+rates.ar+rates.rr?'rr':'normal'),
    sample(last<rates.gold?'gold':'pikachu')];
}
