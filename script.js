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

  const policy = document.querySelector('.policy');
  const policySections = Array.from(document.querySelectorAll('[data-policy-section]'));
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  const percent = document.querySelector('#reading-percent');
  const fill = document.querySelector('#reading-fill');

  if (policy && policySections.length) {
    const readingStatus = document.querySelector('.reading-status');
    if (readingStatus) readingStatus.hidden = false;
    let scheduled = false;

    function updateReading() {
      const bounds = policy.getBoundingClientRect();
      const readingLine = Math.min(window.innerHeight * 0.3, 180);
      const travel = Math.max(1, bounds.height - window.innerHeight + readingLine);
      const progress = Math.round(Math.min(1, Math.max(0, (readingLine - bounds.top) / travel)) * 100);
      if (percent) percent.textContent = `${progress}%`;
      if (fill) fill.style.transform = `scaleX(${progress / 100})`;

      let current = null;
      policySections.forEach(section => {
        if (section.getBoundingClientRect().top <= readingLine + 24) current = section.id;
      });
      if (progress === 100) current = policySections[policySections.length - 1].id;
      tocLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      scheduled = false;
    }

    function scheduleReading() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateReading);
    }

    window.addEventListener('scroll', scheduleReading, { passive: true });
    window.addEventListener('resize', scheduleReading);
    window.addEventListener('load', scheduleReading, { once: true });
    updateReading();
  }
})();
