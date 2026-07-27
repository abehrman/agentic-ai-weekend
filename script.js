/* =========================================================================
   Agentic AI Weekend by AgentX — The Clearance Bench.
   Progressive enhancement only. The HTML is authored as the complete, legible
   static state: the five-station path, all facts, and every CTA read without
   this file. Enhancement adds three things:
     1. the tuition current-window marker (runs always; no motion),
     2. the human-operated clearance rail (advance one station per activation;
        it moves only on your click, never because time passed or the tab changed),
     3. the FAQ breakpoint defaults (all six answers open on desktop, one on
        mobile; every answer stays open in the no-JS HTML).
   ========================================================================= */

/* ---- Pure, testable tuition-window logic ----------------------------- */
/* Boundaries are the real deadlines, inclusive of the named day. The active
   date is derived in America/New_York (the venue's zone). Lexical compare of
   YYYY-MM-DD is DST-proof. */
function windowFor(isoDate) {
  if (isoDate <= '2026-08-15') return 'early';
  if (isoDate <= '2026-09-05') return 'mid';
  return 'full';
}

/* ---- Pure, testable carrier geometry --------------------------------- */
/* Each fixture has five pre-gate station stops plus a DISTINCT post-release
   output-tray stop (across the stop bar). Desktop travels the x-axis; the
   mobile vertical bench travels the y-axis. The release stop is deliberately
   past the station-5 stop so the final activation visibly moves the artifact. */
var RAIL_GEOMETRY = {
  desktop: { axis: 'x', stations: [0, 108, 226, 344, 462], released: 560, gateLift: -18 },
  mobile:  { axis: 'y', stations: [0, 56, 112, 168, 224], released: 272, gateLift: -14 }
};

function carrierTransform(geom, station, released) {
  var stops = geom.stations;
  var i = Math.min(Math.max(station, 1), stops.length) - 1;
  var v = released ? geom.released : stops[i];
  return geom.axis === 'x' ? 'translate(' + v + ',0)' : 'translate(0,' + v + ')';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { windowFor, RAIL_GEOMETRY, carrierTransform };
}

/* ---- Everything below touches the DOM; skipped under Node ------------- */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

function init() {
  markCurrentTuitionWindow();
  setupClearanceRail();
  setupFaq();
}

/* ---- 1. Tuition current-window marker (additive, decoupled from motion) */
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
  var span = document.querySelector('.span[data-window="' + windowFor(iso) + '"]');
  if (!span) return;
  span.classList.add('is-current');
  var marker = span.querySelector('[data-marker]');
  if (marker) marker.hidden = false;
}

/* ---- 2. The human-operated clearance rail ---------------------------- */
function setupClearanceRail() {
  var fig = document.getElementById('rail');
  if (!fig) return;

  var stations = Array.prototype.slice.call(fig.querySelectorAll('.station'));
  var controls = fig.querySelector('[data-controls]');
  var advanceBtn = fig.querySelector('[data-action="advance"]');
  var resetBtn = fig.querySelector('[data-action="reset"]');
  var stepBtns = Array.prototype.slice.call(fig.querySelectorAll('[data-goto]'));
  var statusEl = fig.querySelector('[data-status]');
  /* Desktop (horizontal) and mobile (vertical) fixtures both use these hooks;
     CSS shows one per breakpoint, each driven by its own axis geometry. */
  var carriers = Array.prototype.slice.call(fig.querySelectorAll('[data-carrier]'));
  var gates = Array.prototype.slice.call(fig.querySelectorAll('[data-gate]'));
  var TOTAL = stations.length;
  if (!TOTAL || !controls || !advanceBtn) return; /* keep the static path */

  /* Motion is entirely a CSS concern: transforms always reflect state; under
     prefers-reduced-motion the CSS disables the transition so the change is
     instant. The fixture therefore never lies about the current station. */
  var geomFor = function (el) {
    return RAIL_GEOMETRY[el.getAttribute('data-carrier') || el.getAttribute('data-gate')] || RAIL_GEOMETRY.desktop;
  };

  var currentStation = 1; /* 1..TOTAL, deterministic first paint */
  var released = false;

  fig.classList.add('is-enhanced');
  controls.hidden = false;

  function names() {
    var el = stations[currentStation - 1];
    var n = el ? el.querySelector('.station__name') : null;
    return n ? n.textContent.trim() : ('Station ' + currentStation);
  }

  function render() {
    stations.forEach(function (el, i) {
      var active = (i + 1) === currentStation && !released;
      var done = released && (i + 1) === TOTAL;
      el.classList.toggle('is-current', active || done);
    });
    stepBtns.forEach(function (b, i) {
      b.setAttribute('aria-current', (i + 1) === currentStation ? 'true' : 'false');
    });

    /* One control, one meaning: advance, then a distinct final release. */
    if (released) {
      advanceBtn.hidden = true;
      resetBtn.hidden = false;
    } else {
      advanceBtn.hidden = false;
      resetBtn.hidden = true;
      var last = currentStation === TOTAL;
      advanceBtn.textContent = last ? 'Review and release' : 'Advance the work';
      advanceBtn.setAttribute('aria-label',
        last ? 'Review and release the artifact' : 'Advance the work to the next station');
    }

    if (released) {
      statusEl.textContent = 'Released. The artifact is in the output tray at station ' +
        TOTAL + ' of ' + TOTAL + '. Reset the bench to run it again.';
    } else {
      statusEl.textContent = 'Station ' + currentStation + ' of ' + TOTAL + ': ' + names() + '.';
    }

    fig.classList.toggle('is-released', released);

    /* Carrier and gate always reflect state (see note above). */
    carriers.forEach(function (c) {
      c.setAttribute('transform', carrierTransform(geomFor(c), currentStation, released));
    });
    gates.forEach(function (g) {
      g.setAttribute('transform', released ? 'translate(0,' + geomFor(g).gateLift + ')' : 'translate(0,0)');
    });
  }

  /* Direct station selection is always meaningful, including after release:
     it clears the released state (lowering the gate) before selecting. */
  function setStation(n) {
    released = false;
    currentStation = Math.min(Math.max(n, 1), TOTAL);
    render();
  }

  function advance() {
    if (released) return;
    if (currentStation < TOTAL) setStation(currentStation + 1);
    else release();
  }

  function release() {
    released = true;
    render();
  }

  function reset() {
    released = false;
    currentStation = 1;
    render();
  }

  advanceBtn.addEventListener('click', advance);
  resetBtn.addEventListener('click', reset);
  stepBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { setStation(i + 1); });
  });

  render();
}

/* ---- 3. FAQ progressive enhancement (breakpoint-aware default state) --- */
/* Every answer is open in the source HTML, so the whole Q&A reads with no
   JavaScript at every width. This enhancement only sets the DEFAULT open state
   per breakpoint and re-applies it when the 900px line is actually crossed:
     desktop (>= 900px): all six open — the full Q&A visible at a glance;
     mobile / tablet (< 900px): the first open, the other five collapsed.
   Between those moments the user toggles freely; summaries stay fully mouse- and
   keyboard-operable (no pointer-events suppression anywhere). */
function setupFaq() {
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));
  if (items.length < 2 || typeof window.matchMedia !== 'function') return;
  var desktop = window.matchMedia('(min-width: 900px)');
  function apply(isDesktop) {
    items.forEach(function (d, i) { d.open = isDesktop || i === 0; });
  }
  apply(desktop.matches);
  var onChange = function (e) { apply(e.matches); };
  /* Supported path plus a safe fallback for older Safari MediaQueryList. */
  if (typeof desktop.addEventListener === 'function') desktop.addEventListener('change', onChange);
  else if (typeof desktop.addListener === 'function') desktop.addListener(onChange);
}
