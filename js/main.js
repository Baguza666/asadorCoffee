import './cart.js';
import { initAnalytics } from './analytics.js';

const initYearStamp = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
};

const highlightActiveNav = () => {
  const navLinks = document.querySelectorAll('.site-nav__link');
  const normalizedPath = (path) => {
    if (!path) return '/';
    return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  };

  const currentPath = normalizedPath(window.location.pathname) || '/';
  navLinks.forEach((link) => {
    const target = normalizedPath(link.getAttribute('href'));
    if (target === currentPath) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
};

const initScrollAnimations = () => {
  const animated = document.querySelectorAll('[data-animate]');
  if (!animated.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    animated.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  animated.forEach((el) => observer.observe(el));
};

const initImageFallback = () => {
  const fallbackSrc = 'https://via.placeholder.com/400x300/c4a888/192447?text=ASADOR';
  document.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target?.tagName === 'IMG' && !target.dataset.fallbackApplied) {
        target.dataset.fallbackApplied = 'true';
        target.src = target.dataset.fallbackSrc || fallbackSrc;
      }
    },
    true
  );
};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-loaded');
  initYearStamp();
  highlightActiveNav();
  initScrollAnimations();
});

initAnalytics();
initImageFallback();
