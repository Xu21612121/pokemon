function mountSwipe() {
  const top = document.querySelector('.swipe-top');
  if (!top) return;
  const scale = .7;
  let gesture = null, busy = false;
  function finish(dx, dy) {
    if (busy) return;
    busy = true;
    top.style.transition = 'transform 240ms ease-out, opacity 240ms';
    top.style.transform = `translate(${dx * 5 / scale}px, ${dy * 5 / scale}px) rotate(${dx / 12}deg)`;
    top.style.opacity = '0';
    const current = opening[0];
    setTimeout(() => {
      if (!top.isConnected || opening[0] !== current) return;
      s.cards.push(opening.shift());
      save();
      render();
      document.querySelector('.swipe-top')?.focus({ preventScroll: true });
    }, 240);
  }
  function reset() {
    gesture = null;
    top.style.transition = 'transform 180ms ease-out';
    top.style.transform = '';
  }
  top.addEventListener('pointerdown', event => {
    if (busy || gesture || event.button !== 0 || event.isPrimary === false) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    top.setPointerCapture?.(event.pointerId);
    top.style.transition = 'none';
  });
  top.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId || busy) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    top.style.transform = `translate(${dx / scale}px, ${dy / scale}px) rotate(${dx / 18}deg)`;
  });
  top.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId || busy) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    const threshold = Math.max(55, Math.min(90, top.getBoundingClientRect().width * .23));
    gesture = null;
    if (Math.hypot(dx, dy) >= threshold) finish(dx, dy);
    else reset();
  });
  top.addEventListener('pointercancel', reset);
  top.addEventListener('lostpointercapture', () => { if (!busy) reset(); });
  top.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      finish(event.key === 'ArrowLeft' ? -100 : event.key === 'ArrowRight' ? 100 : 0,
        event.key === 'ArrowUp' ? -100 : event.key === 'ArrowDown' ? 100 : 0);
    }
  });
}
function revealCard(c) {
  return `<div class="cardart ${c.cardKey?'has-art':''} ${c.rare?'rare':''}">${cardPicture(c)}</div><span class="tag">${c.lang} · ${c.rare?'闪卡 ✦':'普通卡'} ${c.error?'⭐ 错版':''}</span><h3>${cardTitle(c)}</h3><div class="price">${money(value(c))}</div><p class="muted">品相 ${c.condition.toFixed(1)}% · 左右居中 ${50-c.center/2}:${50+c.center/2}</p>`;
}
