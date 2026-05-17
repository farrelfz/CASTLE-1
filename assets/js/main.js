/* ============================================================
   CASTLE Conference 6.0 — main.js
   Handles: language toggle, navbar, mobile menu, AOS, smooth scroll, hero slider
   Optimized & Cleaned
   ============================================================ */

(function () {
  'use strict';

  // DOM Helpers
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // ────────────────────────────────────────────────────────
  // LANGUAGE TOGGLE
  // ────────────────────────────────────────────────────────
  const langToggle = $('#lang-toggle');
  if (langToggle) {
    const translatableElements = $$('[data-id][data-en]');
    const languageStorageKey = 'castle-language';
    let currentLang = (() => {
      try {
        const saved = localStorage.getItem(languageStorageKey);
        return (saved === 'id' || saved === 'en') ? saved : 'en';
      } catch (_) {
        return 'en';
      }
    })();

    function renderLanguage(lang) {
      const safeLang = lang === 'en' ? 'en' : 'id';
      translatableElements.forEach((element) => {
        const value = element.dataset[safeLang];
        if (typeof value !== 'string') return;
        if (element.tagName === 'META') {
          element.setAttribute('content', value);
        } else {
          element.innerHTML = value;
        }
      });
      document.documentElement.lang = safeLang;
      langToggle.innerHTML = safeLang === 'en' ? 'ID' : 'EN';
      langToggle.setAttribute('aria-label', safeLang === 'en' ? 'Ganti bahasa ke Indonesia' : 'Switch language to English');
      try {
        localStorage.setItem(languageStorageKey, safeLang);
      } catch (_) {}
    }

    function applyLanguage(lang, animate = false) {
      if (!animate) {
        renderLanguage(lang);
        return;
      }
      document.body.classList.add('is-language-switching');
      window.setTimeout(() => {
        renderLanguage(lang);
        window.requestAnimationFrame(() => {
          document.body.classList.remove('is-language-switching');
        });
      }, 120);
    }

    applyLanguage(currentLang);
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'id' ? 'en' : 'id';
      applyLanguage(currentLang, true);
    });
  }

  // ────────────────────────────────────────────────────────
  // NAVBAR SCROLL EFFECT
  // ────────────────────────────────────────────────────────
  const navbar = $('.navbar');
  if (navbar) {
    const handleNavbarScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 36);
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();
  }

  // ────────────────────────────────────────────────────────
  // ACTIVE NAV LINK ON SCROLL
  // ────────────────────────────────────────────────────────
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  const anchorNavLinks = navLinks.filter((link) => link.getAttribute('href')?.startsWith('#'));
  if (sections.length && anchorNavLinks.length) {
    const updateActiveLink = () => {
      const scrollPos = window.scrollY + 120;
      sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < bottom) {
          anchorNavLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    };
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // ────────────────────────────────────────────────────────
  // MOBILE HAMBURGER MENU
  // ────────────────────────────────────────────────────────
  const hamburger = $('#hamburger');
  const navLinksEl = $('#navLinks');
  if (hamburger && navLinksEl) {
    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navLinksEl.classList.toggle('open');
      document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
    };

    const closeMenu = () => {
      hamburger.classList.remove('active');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', toggleMenu);
    $$('.nav-link', navLinksEl).forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksEl.classList.contains('open')) closeMenu();
    });
  }

  // ────────────────────────────────────────────────────────
  // INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
  // ────────────────────────────────────────────────────────
  const aosItems = $$('[data-aos]');
  if (aosItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    aosItems.forEach((item) => observer.observe(item));
  }

  // ────────────────────────────────────────────────────────
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = $(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ────────────────────────────────────────────────────────
  // HERO SLIDER
  // ────────────────────────────────────────────────────────
  const slider = $('.hero-slider');
  if (slider) {
    const slides = $$('.hero-slide', slider);
    const dots = $$('.hero-gallery-dots button', slider);
    const prevBtn = $('.hero-slider-btn--prev', slider);
    const nextBtn = $('.hero-slider-btn--next', slider);

    if (slides.length) {
      let current = 0;
      let timer = null;
      const interval = 5000;

      const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
      };

      const stopAutoPlay = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      const startAutoPlay = () => {
        stopAutoPlay();
        timer = setInterval(() => showSlide(current + 1), interval);
      };

      prevBtn?.addEventListener('click', () => { showSlide(current - 1); startAutoPlay(); });
      nextBtn?.addEventListener('click', () => { showSlide(current + 1); startAutoPlay(); });
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { showSlide(i); startAutoPlay(); });
      });

      slider.addEventListener('mouseenter', stopAutoPlay);
      slider.addEventListener('mouseleave', startAutoPlay);
      slider.addEventListener('focusin', stopAutoPlay);
      slider.addEventListener('focusout', startAutoPlay);

      showSlide(0);
      startAutoPlay();
    }
  }

  // ────────────────────────────────────────────────────────
  // PAYMENT METHOD TOGGLE
  // ────────────────────────────────────────────────────────
  const paymentWidgets = $$('[data-payment-widget]');
  if (paymentWidgets.length) {
    paymentWidgets.forEach((widget) => {
      const options = $$('.payment-option', widget);
      const panels = $$('.payment-panel', widget);
      if (!options.length || !panels.length) return;

      const setActive = (method) => {
        options.forEach((option) => {
          const isActive = option.dataset.paymentMethod === method;
          option.classList.toggle('is-active', isActive);
          option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        panels.forEach((panel) => {
          panel.classList.toggle('is-active', panel.dataset.paymentMethod === method);
        });
      };

      const defaultMethod = options[0].dataset.paymentMethod;
      if (defaultMethod) setActive(defaultMethod);

      options.forEach((option) => {
        option.addEventListener('click', () => setActive(option.dataset.paymentMethod));
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // TIMELINE COMPLETED STATE
  // ────────────────────────────────────────────────────────
  const datedTimelineItems = $$('[data-end-date]');
  if (datedTimelineItems.length) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    datedTimelineItems.forEach((item) => {
      const endDate = new Date(`${item.dataset.endDate}T23:59:59+07:00`);
      if (!Number.isNaN(endDate.getTime()) && endDate < today) {
        item.classList.add('is-complete');
      }
    });
  }

  const publicationWidgets = $$('[data-publication-widget]');
  if (publicationWidgets.length) {
    publicationWidgets.forEach((widget) => {
      const choices = $$('.publication-choice', widget);
      const panels = $$('[data-publication-panel]', widget);
      if (!choices.length || !panels.length) return;

      const setPublication = (target) => {
        choices.forEach((choice) => {
          const isActive = choice.dataset.publicationTarget === target;
          choice.classList.toggle('is-active', isActive);
          choice.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        panels.forEach((panel) => {
          panel.classList.toggle('is-active', panel.dataset.publicationPanel === target);
        });
      };

      choices.forEach((choice) => {
        choice.addEventListener('click', () => setPublication(choice.dataset.publicationTarget));
      });
    });
  }

})();
