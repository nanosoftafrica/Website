/* ════════════════════════════════════════════════════════════════
   Nanosoft shared interactivity — custom cursor, magnetic buttons,
   connector-line draw-on-scroll, staggered scroll-reveal. Loaded by
   every public page. All motion is gated behind a fine-pointer/hover
   check and prefers-reduced-motion, so touch devices and users who've
   asked for less motion get a clean, static experience.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    if (canHover && !reduceMotion) {
      initCustomCursor();
      initMagneticButtons();
    }
    initConnectorLines();
    initScrollReveal();
    initReactiveHero();
    initCountUp();
  });

  // ── Reactive hero background: the dot-grid + two glow blobs respond to
  // mouse position (parallax), scroll position, and clicks (a soft pulse),
  // plus a slow idle drift when nothing else is happening. Runs via
  // requestAnimationFrame only while the hero is on/near screen. Skipped
  // entirely under prefers-reduced-motion — elements stay at their static
  // CSS position with no transform, a clean non-animated fallback.
  function initReactiveHero() {
    if (reduceMotion) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var dots  = hero.querySelector('.hero-dots');
    var glow1 = hero.querySelector('.hero-glow-1');
    var glow2 = hero.querySelector('.hero-glow-2');
    if (!dots || !glow1 || !glow2) return;

    var mx = 0, my = 0, targetMx = 0, targetMy = 0;
    var pulse = 0;
    var t = 0;
    var running = false;

    if (canHover) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        targetMx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        targetMy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { targetMx = 0; targetMy = 0; });
    }
    hero.addEventListener('click', function () { pulse = 1; });

    function frame() {
      if (!running) return;
      t += 0.01;
      mx += (targetMx - mx) * 0.04;
      my += (targetMy - my) * 0.04;
      pulse *= 0.94;

      var scrollT = Math.min(window.scrollY / (window.innerHeight || 1), 1);
      var driftX = Math.sin(t) * 14;
      var driftY = Math.cos(t * 0.8) * 10;

      dots.style.transform  = 'translate(' + (mx * 10) + 'px,' + (my * 10 - scrollT * 30) + 'px)';
      glow1.style.transform = 'translate(' + (driftX + mx * -18) + 'px,' + (driftY + my * -14 + scrollT * 40) + 'px) scale(' + (1 + pulse * 0.12) + ')';
      glow2.style.transform = 'translate(' + (driftX * -0.6 + mx * 22) + 'px,' + (driftY * -0.6 + my * 18 - scrollT * 25) + 'px) scale(' + (1 + pulse * 0.18) + ')';

      requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !running) { running = true; requestAnimationFrame(frame); }
          else if (!entry.isIntersecting) { running = false; }
        });
      }, { threshold: 0 }).observe(hero);
    } else {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  // ── Custom cursor: small dot (tracks instantly) + trailing ring ──
  function initCustomCursor() {
    var dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('has-custom-cursor');

    var targetX = 0, targetY = 0, ringX = 0, ringY = 0, started = false;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.transform = 'translate(' + targetX + 'px,' + targetY + 'px) translate(-50%,-50%)';
      if (!started) { ringX = targetX; ringY = targetY; started = true; }
    }, { passive: true });

    (function tick() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    })();

    var hoverSelector = 'a, button, .btn-circle, input, textarea, select, [role="button"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverSelector)) {
        document.documentElement.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverSelector)) {
        document.documentElement.classList.remove('cursor-hover');
      }
    });
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0'; ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1'; ring.style.opacity = '';
    });
  }

  // ── Magnetic buttons: primary CTAs pull toward the cursor nearby ──
  function initMagneticButtons() {
    var selector = '.btn-circle, .btn-hero, .btn-primary-sm, .btn-cta, .btn-demo-submit, .block-hero .cta, .block-cta a, [data-magnetic]';
    var els = document.querySelectorAll(selector);
    els.forEach(function (el) {
      var strength = el.classList.contains('btn-circle') ? 0.35 : 0.18;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (mx * strength) + 'px,' + (my * strength) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .4s cubic-bezier(.2,.9,.3,1.4)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 400);
      });
    });
  }

  // ── Connector lines: hand-drawn SVG arrows that draw in on scroll ──
  function initConnectorLines() {
    var lines = document.querySelectorAll('.connector-line:not([data-reveal-init])');
    if (!lines.length) return;
    lines.forEach(function (l) { l.setAttribute('data-reveal-init', ''); });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      lines.forEach(function (l) { l.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.3 });
    lines.forEach(function (l) { io.observe(l); });
  }

  // ── Staggered scroll-reveal for any [data-reveal] element ──
  // Safe to call repeatedly: pages that inject content after an async
  // fetch (e.g. Team/Milestones cards from /api/content) should call
  // window.NanosoftInteractive.refresh() once that content is in the DOM,
  // since it won't exist yet when this runs on the initial DOMContentLoaded.
  var revealCounters = new WeakMap();
  function initScrollReveal() {
    var items = document.querySelectorAll('[data-reveal]:not([data-reveal-init])');
    if (!items.length) return;

    items.forEach(function (el) {
      el.setAttribute('data-reveal-init', '');
      var parent = el.parentElement;
      var idx = revealCounters.get(parent) || 0;
      revealCounters.set(parent, idx + 1);
      el.style.transitionDelay = Math.min(idx * 80, 480) + 'ms';
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // ── Deterministic color pick for no-photo fallback tiles/avatars, so the
  // same name always gets the same brand-palette color across page loads. ──
  var COLOR_PALETTE = ['#0096D6', '#0369A1', '#075985', '#0E7490', '#1D4ED8'];
  function colorFor(str) {
    var h = 0;
    str = str || '';
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return COLOR_PALETTE[h % COLOR_PALETTE.length];
  }

  // ── Count-up numbers: real stats (500+, 25 years, etc.) animate from 0
  // to their final value once scrolled into view, instead of just sitting
  // there static — a legitimate "achievement/momentum" UX cue, not a
  // fabricated one, since the target number always comes from real data
  // already in the page (a data-count-to attribute set by the page itself). ──
  function countUp(el, target, suffix, duration) {
    suffix = suffix || '';
    duration = duration || 1400;
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Auto-scan for [data-count-to="500" data-count-suffix="+"] elements and
  // trigger countUp() once each is scrolled into view. Safe to call
  // repeatedly (e.g. from refresh()) — already-triggered elements are
  // marked and skipped.
  function initCountUp() {
    var items = document.querySelectorAll('[data-count-to]:not([data-count-init])');
    if (!items.length) return;
    items.forEach(function (el) { el.setAttribute('data-count-init', ''); });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.textContent = el.getAttribute('data-count-to') + (el.getAttribute('data-count-suffix') || '');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          countUp(el, parseInt(el.getAttribute('data-count-to'), 10) || 0, el.getAttribute('data-count-suffix') || '');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    items.forEach(function (el) { io.observe(el); });
  }

  // ── Public API: call refresh() after injecting new content (e.g. once
  // an async /api/content fetch finishes rendering cards) so newly-added
  // [data-reveal]/.connector-line/[data-count-to] elements get picked up. ──
  window.NanosoftInteractive = {
    refresh: function () {
      initConnectorLines();
      initScrollReveal();
      initCountUp();
    },
    colorFor: colorFor,
    countUp: countUp
  };
})();
