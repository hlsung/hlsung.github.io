(() => {
  'use strict';

  const root = document.documentElement;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-toggle');
  let motionPaused = motionPreference.matches;

  function setMotion(paused) {
    motionPaused = paused;
    root.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.querySelector('span').textContent = paused
        ? '움직임 켜기'
        : '움직임 멈추기';
    }
  }

  setMotion(motionPaused);
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.addEventListener('click', () => setMotion(!motionPaused));
  }
  motionPreference.addEventListener('change', event => setMotion(event.matches));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('[data-reveal], [data-policy-section]')
      .forEach(element => revealObserver.observe(element));
    root.classList.add('motion-ready');
  }

  // FAQ answers open and close over 240ms; without JS or with motion off, <details> works as usual.
  document.querySelectorAll('.faq details').forEach(details => {
    const summary = details.querySelector('summary');
    if (!summary || typeof details.animate !== 'function') return;
    let running = null;

    summary.addEventListener('click', event => {
      if (motionPaused) return;
      event.preventDefault();
      // Start from the current (possibly mid-animation) height so a second tap reverses smoothly.
      const startHeight = details.offsetHeight;
      const opening = !details.open || details.classList.contains('is-closing');
      if (running) running.cancel();
      details.classList.toggle('is-closing', !opening);
      details.open = true;
      const border = details.offsetHeight - details.clientHeight;
      const endHeight = opening ? details.offsetHeight : summary.offsetHeight + border;
      details.style.overflow = 'hidden';
      const animation = details.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
      running = animation;
      animation.onfinish = () => {
        if (running !== animation) return;
        if (!opening) details.open = false;
        details.classList.remove('is-closing');
        details.style.overflow = '';
        running = null;
      };
    });
  });
})();
