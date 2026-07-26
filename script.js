/* =========================================================================
   Agentic AI Weekend by AgentX — progressive enhancement only.
   The HTML is authored as the complete, legible static state. Nothing here
   is required to understand the page. This script adds:
     1. the tuition current-window marker (runs always, decoupled from motion),
     2. the interactive two-lane walkthrough (motion only, never in reduce),
     3. mobile nav disclosure, sticky header, and sticky mobile CTA.
   ========================================================================= */

/* ---- Pure, testable tuition-window logic ----------------------------- */
/* Boundaries are the real deadlines, inclusive of the named day, compared as
   ISO date strings in America/New_York (the venue's zone). Lexical compare of
   YYYY-MM-DD is DST-proof. */
function windowFor(isoDate) {
  if (isoDate <= '2026-08-15') return 'early';
  if (isoDate <= '2026-09-05') return 'mid';
  return 'full';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { windowFor };
}

/* ---- Everything below touches the DOM; skip it under Node ------------- */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

function init() {
  markCurrentTuitionWindow();
  setupNav();
  setupStickyHeader();
  setupStickyCta();
  setupAgentLoop();
}

/* ---- 1. Tuition current-window marker --------------------------------- */
function todayISOInEasternTime() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

function markCurrentTuitionWindow() {
  var iso;
  try { iso = todayISOInEasternTime(); }
  catch (e) { return; } /* No reliable date? Leave all three windows unmarked. */
  var win = windowFor(iso);
  var row = document.querySelector('.ledger__row[data-window="' + win + '"]');
  if (!row) return;
  row.classList.add('is-current');
  var marker = row.querySelector('[data-marker]');
  if (marker) marker.hidden = false;
}

/* ---- 2. Mobile navigation disclosure --------------------------------- */
function setupNav() {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- 3a. Sticky header only after the hero exits --------------------- */
function setupStickyHeader() {
  var hero = document.querySelector('.hero');
  var masthead = document.getElementById('masthead');
  if (!hero || !masthead || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    masthead.dataset.sticky = entries[0].isIntersecting ? 'off' : 'on';
  }, { threshold: 0 });
  io.observe(hero);
}

/* ---- 3b. Sticky mobile CTA: after hero CTA, gone before tuition ------- */
function setupStickyCta() {
  var sticky = document.querySelector('[data-sticky-cta]');
  var heroCta = document.querySelector('.hero__cta');
  var tuition = document.getElementById('tuition');
  if (!sticky || !heroCta || !tuition) return;

  var ticking = false;
  function update() {
    ticking = false;
    var heroGone = heroCta.getBoundingClientRect().bottom < 0;
    /* Hide as soon as the tuition section (and everything below it, incl. the
       final CTA) enters the viewport, so the bar never sits beside a real CTA. */
    var tuitionInView = tuition.getBoundingClientRect().top < window.innerHeight;
    var show = heroGone && !tuitionInView;
    sticky.hidden = !show;
    sticky.classList.toggle('is-visible', show);
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---- 4. Two-lane bounded-run walkthrough ----------------------------- */
function setupAgentLoop() {
  var mq = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false, addEventListener: null, addListener: null };

  var controller = null;
  function build() {
    if (controller) { controller.destroy(); controller = null; }
    controller = createAgentLoop(mq.matches);
  }
  if (mq.addEventListener) mq.addEventListener('change', build);
  else if (mq.addListener) mq.addListener(build);
  build();
}

function createAgentLoop(reduced) {
  var fig = document.getElementById('agentloop');
  if (!fig) return { destroy: function () {} };

  var states = Array.prototype.slice.call(fig.querySelectorAll('.loopstate'));
  var controls = fig.querySelector('[data-controls]');
  var statusEl = fig.querySelector('[data-status]');
  var toggleBtn = fig.querySelector('[data-action="toggle"]');
  var replayBtn = fig.querySelector('[data-action="replay"]');
  var stepBtns = Array.prototype.slice.call(fig.querySelectorAll('.stepbtn'));
  var TOTAL = states.length;

  /* Reduced motion / no controls: keep the full static strip, nothing runs. */
  if (reduced || !TOTAL || !controls) {
    fig.classList.remove('is-enhanced');
    if (controls) controls.hidden = true;
    return { destroy: function () {} };
  }

  fig.classList.add('is-enhanced');
  controls.hidden = false;

  var STEP_MS = 2200;
  var current = 1;        /* deterministic first state, visible on load */
  var userPaused = false; /* explicit pause or manual step selection */
  var inView = !('IntersectionObserver' in window);
  var finished = false;
  var timer = null;

  function motionActive() {
    return inView && !document.hidden && !userPaused && !finished;
  }

  function render() {
    var msg;
    if (finished) {
      msg = 'Complete. The run ends at your approval, step ' + TOTAL + ' of ' + TOTAL + '.';
    } else if (userPaused) {
      msg = 'Paused. Showing step ' + current + ' of ' + TOTAL + '.';
    } else if (!inView || document.hidden) {
      msg = 'Paused while off screen. Showing step ' + current + ' of ' + TOTAL + '.';
    } else {
      msg = 'Playing. Step ' + current + ' of ' + TOTAL + '.';
    }
    statusEl.textContent = msg;
    toggleBtn.textContent = finished ? 'Replay from step 1' : (userPaused ? 'Play' : 'Pause');
    toggleBtn.setAttribute('aria-label',
      finished ? 'Replay the walkthrough from step 1'
               : (userPaused ? 'Play the walkthrough' : 'Pause the walkthrough'));
  }

  function setActive(n) {
    current = Math.min(Math.max(n, 1), TOTAL);
    states.forEach(function (el, i) {
      var active = (i + 1) === current;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    stepBtns.forEach(function (b, i) {
      b.setAttribute('aria-current', (i + 1) === current ? 'true' : 'false');
    });
    render();
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function tick() {
    if (current >= TOTAL) { finished = true; stop(); render(); return; }
    setActive(current + 1);
    if (current >= TOTAL) { finished = true; stop(); render(); }
  }

  function sync() {
    if (motionActive()) {
      if (!timer) timer = setInterval(tick, STEP_MS);
    } else {
      stop();
    }
    render();
  }

  function replay() {
    finished = false;
    userPaused = false;
    setActive(1);
    sync();
  }

  toggleBtn.addEventListener('click', function () {
    if (finished) { replay(); return; }
    userPaused = !userPaused;
    sync();
  });
  replayBtn.addEventListener('click', replay);
  stepBtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      userPaused = true;       /* manual selection stops automatic progression */
      finished = false;
      setActive(i + 1);
      sync();
    });
  });

  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      inView = entries[0].intersectionRatio >= 0.5;
      sync();
    }, { threshold: [0, 0.5, 1] });
    io.observe(fig);
  }

  document.addEventListener('visibilitychange', sync);

  /* Deterministic first paint, then autoplay begins only when in view. */
  setActive(1);
  sync();

  return {
    destroy: function () {
      stop();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      fig.classList.remove('is-enhanced');
      states.forEach(function (el) {
        el.classList.remove('is-active');
        el.removeAttribute('aria-hidden');
      });
      controls.hidden = true;
    }
  };
}
