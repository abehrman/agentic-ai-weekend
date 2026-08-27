function priceWindow(isoDate) {
  if (isoDate <= '2026-09-13') return 'launch';
  if (isoDate <= '2026-09-27') return 'standard';
  return 'full';
}

if (typeof module !== 'undefined' && module.exports) module.exports = { priceWindow };

if (typeof document !== 'undefined') (() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setupReveals() {
    const items = [...document.querySelectorAll('.reveal')];
    if (!items.length || reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    items.forEach((item) => observer.observe(item));
  }

  function setupActiveNavigation() {
    const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((link) => [link.hash.slice(1), link]));
    const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.removeAttribute('aria-current'));
      byId.get(visible.target.id)?.setAttribute('aria-current', 'true');
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });

    sections.forEach((section) => observer.observe(section));
  }

  function setupStoryRail() {
    const rail = document.querySelector('[data-story-rail]');
    const controls = document.querySelector('[data-story-controls]');
    if (!rail || !controls) return;
    const cards = [...rail.querySelectorAll('.story-card')];
    const previous = controls.querySelector('[data-story-prev]');
    const next = controls.querySelector('[data-story-next]');
    const currentLabel = controls.querySelector('[data-story-current]');
    if (!cards.length || !previous || !next || !currentLabel) return;

    rail.tabIndex = 0;
    rail.setAttribute('aria-label', 'Everyday AgentX AI Course stories');
    currentLabel.setAttribute('aria-live', 'polite');
    let frame = null;

    const cardLeft = (card) => card.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
    const closestIndex = () => cards.reduce((best, card, index) => {
      const distance = Math.abs(cardLeft(card) - rail.scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity }).index;

    const update = () => {
      frame = null;
      const index = closestIndex();
      const scrollable = rail.scrollWidth > rail.clientWidth + 2;
      controls.hidden = !scrollable;
      currentLabel.textContent = String(index + 1).padStart(2, '0');
      previous.disabled = index === 0;
      next.disabled = index === cards.length - 1;
    };

    const goTo = (index) => {
      const target = Math.max(0, Math.min(cards.length - 1, index));
      rail.scrollTo({ left: cardLeft(cards[target]), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    };

    previous.addEventListener('click', () => goTo(closestIndex() - 1));
    next.addEventListener('click', () => goTo(closestIndex() + 1));
    rail.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      goTo(closestIndex() + (event.key === 'ArrowRight' ? 1 : -1));
    });
    rail.addEventListener('scroll', () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function setupAgentSystem() {
    const system = document.querySelector('[data-agent-system]');
    if (!system) return;
    const steps = [...system.querySelectorAll('.agent-steps li')];
    const canvas = system.querySelector('.agent-system__canvas');
    const progress = system.querySelector('.agent-system__progress span');
    const motionToggle = system.querySelector('[data-agent-motion]');
    let current = 0;
    let timer = null;
    let manuallyPaused = false;

    const activate = (index) => {
      current = index;
      steps.forEach((step, stepIndex) => {
        const active = stepIndex === index;
        step.classList.toggle('is-active', active);
        step.setAttribute('aria-pressed', String(active));
      });
      const title = steps[index]?.querySelector('strong')?.textContent || '';
      if (canvas) canvas.dataset.stage = `${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')} · ${title}`;
      if (progress) progress.style.width = `${((index + 1) / steps.length) * 100}%`;
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (reducedMotion.matches || document.hidden || manuallyPaused) return;
      timer = window.setInterval(() => activate((current + 1) % steps.length), 2300);
    };

    const updateMotionToggle = () => {
      if (!motionToggle) return;
      motionToggle.setAttribute('aria-pressed', String(manuallyPaused));
      document.documentElement.classList.toggle('is-motion-paused', manuallyPaused);
      motionToggle.textContent = manuallyPaused ? 'Play motion' : 'Pause motion';
    };

    motionToggle?.addEventListener('click', () => {
      manuallyPaused = !manuallyPaused;
      updateMotionToggle();
      manuallyPaused ? stop() : start();
    });

    steps.forEach((step, index) => {
      step.tabIndex = 0;
      step.setAttribute('role', 'button');
      step.addEventListener('pointerenter', () => { stop(); activate(index); });
      step.addEventListener('focusin', () => { stop(); activate(index); });
      step.addEventListener('click', () => { activate(index); start(); });
      step.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate(index);
        start();
      });
    });
    system.addEventListener('pointerleave', start);
    system.addEventListener('focusout', (event) => {
      if (!system.contains(event.relatedTarget)) start();
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    reducedMotion.addEventListener?.('change', () => reducedMotion.matches ? stop() : start());

    activate(0);
    updateMotionToggle();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? start() : stop(), { threshold: 0.3 });
      observer.observe(system);
    } else {
      start();
    }
  }

  function dateInNewYork(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const value = (type) => parts.find((part) => part.type === type)?.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  }

  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function campaignParams() {
    const current = new URLSearchParams(window.location.search);
    const campaign = new URLSearchParams();

    campaignKeys.forEach((key) => {
      const value = current.get(key);
      if (value && /^[a-z0-9_-]{1,150}$/i.test(value)) campaign.set(key, value);
    });

    try {
      if ([...campaign].length) window.sessionStorage.setItem('agentx_campaign', campaign.toString());
      else {
        const saved = new URLSearchParams(window.sessionStorage.getItem('agentx_campaign') || '');
        campaignKeys.forEach((key) => {
          const value = saved.get(key);
          if (value && /^[a-z0-9_-]{1,150}$/i.test(value)) campaign.set(key, value);
        });
      }
    } catch (_) {
      // Checkout still works when storage is blocked.
    }

    return campaign;
  }

  function withCampaign(url, campaign) {
    const destination = new URL(url, window.location.href);
    campaign.forEach((value, key) => destination.searchParams.set(key, value));
    return destination.toString();
  }

  function setupCampaignAttribution() {
    const campaign = campaignParams();
    if (![...campaign].length) return;

    document.querySelectorAll('a[href]').forEach((link) => {
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || !/\/register\/$/.test(destination.pathname)) return;
      link.href = withCampaign(link.href, campaign);
    });
  }

  function setupTuition() {
    const tuition = document.querySelector('[data-tuition]');
    const windowName = priceWindow(dateInNewYork());
    tuition?.querySelectorAll('[data-price-window]').forEach((card) => {
      card.classList.toggle('is-current', card.dataset.priceWindow === windowName);
    });

    const status = document.querySelector('[data-price-status]');
    const messages = {
      launch: 'Launch tuition of $995 is available through September 13.',
      standard: 'Standard tuition is $1,250 through September 27.',
      full: 'Full tuition is $1,495.',
    };
    if (status) status.textContent = messages[windowName];

    const current = {
      launch: { price: '$995', fact: '$995 through September 13', deadline: 'Launch rate through September 13, 2026' },
      standard: { price: '$1,250', fact: '$1,250 through September 27', deadline: 'Standard rate through September 27, 2026' },
      full: { price: '$1,495', fact: '$1,495 from September 28', deadline: 'Full tuition from September 28, 2026' },
    }[windowName];
    document.querySelectorAll('[data-current-price]').forEach((node) => { node.textContent = current.price; });
    document.querySelectorAll('[data-current-fact]').forEach((node) => { node.textContent = current.fact; });
    document.querySelectorAll('[data-current-deadline]').forEach((node) => { node.textContent = current.deadline; });
  }

  function setupCheckoutLinks() {
    const checkoutUrl = document.body.dataset.checkoutUrl || '';
    const links = [...document.querySelectorAll('[data-checkout-link]')];
    if (!links.length) return;

    if (checkoutUrl) {
      const campaign = campaignParams();
      links.forEach((control) => {
        const destination = withCampaign(checkoutUrl, campaign);
        if (control instanceof HTMLAnchorElement) control.href = destination;
        else control.dataset.checkoutDestination = destination;
        control.dataset.checkoutReady = 'true';
      });
    }
  }

  function setupReadiness() {
    const form = document.querySelector('[data-readiness-form]');
    if (!form) return;
    const checks = [...form.querySelectorAll('input[type="checkbox"][required]')];
    const control = form.querySelector('[data-checkout-link]');
    if (!checks.length || !control) return;

    const update = () => {
      const ready = checks.every((check) => check.checked);
      control.classList.toggle('is-pending', !ready);
      control.textContent = ready ? control.dataset.liveLabel : 'Complete the checks to continue';
    };

    checks.forEach((check) => check.addEventListener('change', update));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const destination = control.dataset.checkoutDestination || form.action;
      window.location.assign(destination);
    });
    update();
  }

  setupReveals();
  setupActiveNavigation();
  setupStoryRail();
  setupAgentSystem();
  setupCampaignAttribution();
  setupTuition();
  setupCheckoutLinks();
  setupReadiness();

})();
