(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(function () { preloader.classList.add('is-hidden'); }, 450);
    }
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const navList = document.getElementById('navList');

  function closeMenu() {
    if (!burger || !navList) return;
    burger.classList.remove('is-open');
    navList.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  if (burger && navList) {
    burger.addEventListener('click', function () {
      const isOpen = navList.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!navList.classList.contains('is-open')) return;
      if (navList.contains(e.target) || burger.contains(e.target)) return;
      closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  const allCounters = document.querySelectorAll('[data-counter], [data-start-date]');
  if (allCounters.length) {
    const runCounter = function (el) {
      let target = Number(el.dataset.counter) || 0;
      if (el.dataset.startDate) {
        const parts = el.dataset.startDate.split('-').map(Number);
        const start = Date.UTC(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        target = Math.max(0, Math.floor((todayUtc - start) / 86400000));
      }
      if (reduceMotion) { el.textContent = target; return; }
      const duration = 1600;
      const start = performance.now();
      const tick = function (now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          co.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
      allCounters.forEach(function (el) { co.observe(el); });
    } else {
      allCounters.forEach(runCounter);
    }
  }

  /* ---------- Flying hearts ---------- */
  const heartsBg = document.getElementById('heartsBg');
  if (heartsBg && !reduceMotion) {
    const spawnHeart = function () {
      const heart = document.createElement('span');
      heart.className = 'heart-float';
      heart.textContent = '♥';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.fontSize = 10 + Math.random() * 22 + 'px';
      heart.style.animationDuration = 9 + Math.random() * 9 + 's';
      heart.style.opacity = String(0.25 + Math.random() * 0.5);
      heartsBg.appendChild(heart);
      setTimeout(function () { heart.remove(); }, 19000);
    };
    for (let i = 0; i < 7; i++) setTimeout(spawnHeart, i * 600);
    setInterval(spawnHeart, 2200);
  }

  /* ---------- Quotes slider ---------- */
  const quotes = Array.prototype.slice.call(document.querySelectorAll('.quote'));
  const dotsWrap = document.getElementById('quoteDots');
  const prevBtn = document.getElementById('prevQuote');
  const nextBtn = document.getElementById('nextQuote');
  let quoteIndex = 0;
  let quoteTimer = null;

  if (quotes.length) {
    const dots = quotes.map(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'quotes__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Цитата ' + (i + 1));
      dot.addEventListener('click', function () { showQuote(i); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function showQuote(index) {
      quoteIndex = (index + quotes.length) % quotes.length;
      quotes.forEach(function (q, i) { q.classList.toggle('is-active', i === quoteIndex); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === quoteIndex); });
      restartAuto();
    }

    function restartAuto() {
      if (reduceMotion) return;
      clearInterval(quoteTimer);
      quoteTimer = setInterval(function () { showQuote(quoteIndex + 1); }, 6500);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { showQuote(quoteIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showQuote(quoteIndex + 1); });

    showQuote(0);
  }

  /* ---------- Future letter ---------- */
  const letter = document.querySelector('.letter');
  const openLetterButton = document.getElementById('openLetter');
  const letterMessage = document.getElementById('letterMessage');

  if (letter && openLetterButton && letterMessage) {
    openLetterButton.addEventListener('click', function () {
      letterMessage.hidden = false;
      openLetterButton.hidden = true;
    });
  }
})();
