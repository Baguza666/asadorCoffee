const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Utility: highlight active nav link based on current path
const navLinks = document.querySelectorAll('.site-nav__link');
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach((link) => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('is-active');
  } else {
    link.classList.remove('is-active');
  }
});
