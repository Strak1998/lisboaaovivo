/* ============================================
   LISBOA DESPIDA — ULTRA PREMIUM JS
   ============================================ */

/* ============================================
   AGE GATE
   ============================================ */
const ageGate = document.getElementById('ageGate');
const ageEnter = document.getElementById('ageEnter');
const ageLeave = document.getElementById('ageLeave');
const pageSite = document.getElementById('pageSite');

if (ageGate) {
  const verified = sessionStorage.getItem('ld_age_verified');
  if (verified) {
    ageGate.classList.add('hidden');
    if (pageSite) pageSite.style.opacity = '1';
  } else {
    if (pageSite) pageSite.style.opacity = '0';
  }

  if (ageEnter) {
    ageEnter.addEventListener('click', () => {
      sessionStorage.setItem('ld_age_verified', '1');
      ageGate.style.transition = 'opacity 500ms ease';
      ageGate.style.opacity = '0';
      setTimeout(() => {
        ageGate.classList.add('hidden');
        if (pageSite) {
          pageSite.style.transition = 'opacity 800ms ease';
          pageSite.style.opacity = '1';
        }
      }, 500);
    });
  }

  if (ageLeave) {
    ageLeave.addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });
  }
}

/* ============================================
   REVEAL ON SCROLL
   ============================================ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ============================================
   CITY PERSONALIZATION
   ============================================ */
const cityTextNodes = document.querySelectorAll('[data-city-text]');

if (cityTextNodes.length) {
  const params = new URLSearchParams(window.location.search);
  const cityParam = params.get('cidade') || params.get('city');
  const cityName = cityParam
    ? cityParam
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
    : 'Lisboa';

  cityTextNodes.forEach((node) => {
    node.textContent = cityName;
  });
}

/* ============================================
   NEWSLETTER FORM
   ============================================ */
const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = newsletterForm.querySelector('button');
    if (button) {
      button.textContent = 'Registado! Verifica o teu email';
      button.disabled = true;
      button.style.background = 'var(--success)';
      button.style.color = '#fff';
    }
  });
}

/* ============================================
   CURSOR GLOW
   ============================================ */
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
  });
}

/* ============================================
   3D CARD TILT — Handled by three-scene.js
   (enhanced with light reflections + scroll 3D)
   ============================================ */

/* ============================================
   FLOATING PARTICLES
   ============================================ */
const particlesContainer = document.querySelector('.particles');
if (particlesContainer) {
  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 2.5 + 0.8;
    p.style.cssText = [
      `left: ${Math.random() * 100}vw`,
      `width: ${size}px`,
      `height: ${size}px`,
      `--drift: ${(Math.random() * 100 - 50).toFixed(0)}px`,
      `animation-duration: ${(Math.random() * 16 + 12).toFixed(1)}s`,
      `animation-delay: ${(Math.random() * 14).toFixed(1)}s`,
      `opacity: 0`,
    ].join(';');
    particlesContainer.appendChild(p);
  }
}

/* ============================================
   CAROUSEL ENGINE
   ============================================ */
function initCarousel(container, options = {}) {
  const track = container.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');
  const dotsWrap = container.querySelector('.carousel-dots');
  const counterCurrent = container.querySelector('.carousel-current');
  const counterTotal = container.querySelector('.carousel-total');

  const autoPlay = options.autoPlay !== false;
  const interval = options.interval || 4500;
  const thumbs = options.thumbs || null;

  let current = 0;
  let timer = null;
  let progressBar = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

  // Progress bar
  if (autoPlay) {
    progressBar = document.createElement('div');
    progressBar.className = 'carousel-progress';
    container.appendChild(progressBar);
  }

  // Counter
  if (counterTotal) counterTotal.textContent = String(slides.length).padStart(2, '0');

  function goTo(index) {
    if (index === current) return;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    if (thumbs) {
      const allThumbs = Array.from(thumbs.querySelectorAll('.model-thumb'));
      allThumbs[current]?.classList.remove('active');
      allThumbs[index]?.classList.add('active');
    }

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
    if (counterCurrent) counterCurrent.textContent = String(current + 1).padStart(2, '0');

    resetTimer();
  }

  function next() { goTo((current + 1) % slides.length); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
  });

  // Touch / swipe
  let startX = 0;
  let isDragging = false;
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    pauseTimer();
  }, { passive: true });
  container.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? next() : prev();
    }
    resetTimer();
  });

  // Auto-play
  function startTimer() {
    if (!autoPlay) return;
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.transitionDuration = '0ms';
      requestAnimationFrame(() => {
        progressBar.style.transitionDuration = interval + 'ms';
        progressBar.style.width = '100%';
      });
    }
    timer = setTimeout(next, interval);
  }

  function pauseTimer() {
    clearTimeout(timer);
    if (progressBar) {
      progressBar.style.transitionDuration = '0ms';
      progressBar.style.width = progressBar.offsetWidth + 'px';
    }
  }

  function resetTimer() {
    clearTimeout(timer);
    startTimer();
  }

  // Pause on hover
  container.addEventListener('mouseenter', pauseTimer);
  container.addEventListener('mouseleave', resetTimer);

  startTimer();
}

// Init hero carousel
const heroCarousel = document.querySelector('.hero-carousel');
if (heroCarousel) {
  initCarousel(heroCarousel, { autoPlay: true, interval: 4500 });
}

// Init model carousel with thumbs
const modelCarousel = document.querySelector('.model-carousel');
const modelThumbs = document.querySelector('.model-thumbs');
if (modelCarousel) {
  initCarousel(modelCarousel, {
    autoPlay: true,
    interval: 6000,
    thumbs: modelThumbs,
  });

  if (modelThumbs) {
    modelThumbs.addEventListener('click', (e) => {
      const thumb = e.target.closest('.model-thumb');
      if (!thumb) return;
      const index = parseInt(thumb.dataset.index, 10);
      const dots = modelCarousel.querySelectorAll('.carousel-dot');
      const allThumbs = modelThumbs.querySelectorAll('.model-thumb');

      dots[index]?.click();
      allThumbs.forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  }
}

/* ============================================
   ANIMATED COUNTERS
   ============================================ */
const counterElements = document.querySelectorAll('.hero-fact-number');

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

counterElements.forEach((el) => counterObserver.observe(el));

/* ============================================
   BILLING TOGGLE
   ============================================ */
const billingOptions = document.querySelectorAll('.billing-option');
const monthlyPrices = document.querySelectorAll('.price-monthly');
const annualPrices = document.querySelectorAll('.price-annual');

billingOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    billingOptions.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const isAnnual = btn.dataset.billing === 'annual';

    monthlyPrices.forEach((el) => {
      el.classList.toggle('price-hidden', isAnnual);
    });
    annualPrices.forEach((el) => {
      el.classList.toggle('price-hidden', !isAnnual);
    });
  });
});

/* ============================================
   MARKET SWITCHER
   ============================================ */
const marketTabs = document.querySelectorAll('.market-tab');
const marketPanels = document.querySelectorAll('.market-panel');

marketTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedMarket = tab.dataset.market;

    marketTabs.forEach((btn) => {
      const isActive = btn === tab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    marketPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.marketPanel === selectedMarket);
    });
  });
});

/* ============================================
   TIP BUTTONS
   ============================================ */
const tipButtons = document.querySelectorAll('.tip-btn');

tipButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const amount = btn.dataset.amount;
    // Visual feedback
    tipButtons.forEach((b) => {
      b.style.background = '';
      b.style.color = '';
      b.style.borderColor = '';
    });
    btn.style.background = 'rgba(210, 164, 95, 0.3)';
    btn.style.borderColor = 'var(--gold)';

    // In production: redirect to payment
    setTimeout(() => {
      btn.textContent = `${amount}€ ✓`;
      setTimeout(() => {
        btn.textContent = `${amount}€`;
      }, 2000);
    }, 300);
  });
});

/* ============================================
   STICKY CTA (mobile)
   ============================================ */
const stickyCta = document.getElementById('stickyCta');
const membershipSection = document.getElementById('membership');

if (stickyCta && membershipSection) {
  const stickyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stickyCta.classList.remove('visible');
        } else {
          // Only show after scrolling past the hero
          if (window.scrollY > window.innerHeight * 0.5) {
            stickyCta.classList.add('visible');
          }
        }
      });
    },
    { threshold: 0 }
  );

  stickyObserver.observe(membershipSection);

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight * 0.5) {
      stickyCta.classList.remove('visible');
    }
  }, { passive: true });
}

/* ============================================
   MOBILE NAV TOGGLE
   ============================================ */
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
  });

  // Close nav when a link is clicked
  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '&#9776;';
    });
  });
}

/* ============================================
   CARD HOVER GLOW (sets --mouse-x / --mouse-y)
   ============================================ */
const glowCards = document.querySelectorAll(
  '.persona-card, .city-card, .flow-card, .collection-card, .pack-card, .event-card, .testimonial-card, .market-card'
);

glowCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
  });
});

/* ============================================
   STICKY HEADER — Glass on scroll
   ============================================ */
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  let lastScrolled = false;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 60;
    if (scrolled !== lastScrolled) {
      siteHeader.classList.toggle('scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }, { passive: true });
}

/* ============================================
   MAGNETIC HOVER — CTAs pull toward cursor
   ============================================ */
const magneticButtons = document.querySelectorAll('.button-primary, .button-glass');

magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ============================================
   PARALLAX SECTIONS — Subtle depth on scroll
   ============================================ */
const parallaxSections = document.querySelectorAll('.hero-stage, .model-carousel');

if (parallaxSections.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    parallaxSections.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = 0.04;
      const offset = rect.top * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

/* ============================================
   SMOOTH SCROLL for anchor links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================
   SCARCITY — VIP & FOUNDING SPOTS COUNTDOWN
   ============================================ */
const vipSpotsEl = document.getElementById('vipSpots');
const foundingSpotsEl = document.getElementById('foundingSpots');

function decrementSpot(el, minVal) {
  if (!el) return;
  const current = parseInt(el.textContent, 10);
  if (current > minVal) {
    el.textContent = current - 1;
    el.style.transition = 'transform 300ms ease, color 300ms ease';
    el.style.transform = 'scale(1.3)';
    el.style.color = 'var(--gold-bright)';
    setTimeout(() => {
      el.style.transform = '';
      el.style.color = '';
    }, 400);
  }
}

// Simulate natural scarcity — spots decrease over time
if (vipSpotsEl || foundingSpotsEl) {
  setTimeout(() => decrementSpot(vipSpotsEl, 3), 45000);
  setTimeout(() => decrementSpot(foundingSpotsEl, 8), 75000);
  setTimeout(() => decrementSpot(vipSpotsEl, 3), 120000);
  setTimeout(() => decrementSpot(foundingSpotsEl, 8), 180000);
}

/* ============================================
   LIVE ACTIVITY TOAST — Social proof nudges
   ============================================ */
const toastMessages = [
  'Marco R. de Lisboa acabou de aderir ao Inner Circle',
  'Pedro L. do Porto comprou o pack Janise Essencial',
  'Algu\u00e9m de S\u00e3o Paulo aderiu ao Private Pass',
  'Jo\u00e3o S. enviou um tip de 25\u20ac \u00e0 Janise',
  'Novo membro do Rio de Janeiro entrou agora',
  'Pack "Sem Limites" comprado h\u00e1 2 minutos',
  '3 pessoas est\u00e3o a ver os planos agora',
];

function showActivityToast() {
  const existing = document.querySelector('.activity-toast');
  if (existing) existing.remove();

  const liveRegion = document.querySelector('.activity-toast-region');
  const msg = toastMessages[Math.floor(Math.random() * toastMessages.length)];
  const toast = document.createElement('div');
  toast.className = 'activity-toast';
  toast.innerHTML = '<span class="live-dot" aria-hidden="true"></span> ' + msg;
  document.body.appendChild(toast);

  // Update aria-live region for screen readers
  if (liveRegion) liveRegion.textContent = msg;

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
      if (liveRegion) liveRegion.textContent = '';
    }, 400);
  }, 4000);
}

// Show first toast after 20s, then every 35-60s
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setTimeout(showActivityToast, 20000);
  setInterval(() => {
    showActivityToast();
  }, 35000 + Math.random() * 25000);
}
