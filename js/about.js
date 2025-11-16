const modal = document.querySelector('[data-gallery-modal]');
const modalImage = document.querySelector('[data-gallery-image]');
const closeBtn = document.querySelector('[data-gallery-close]');
const galleryTriggers = document.querySelectorAll('[data-gallery-trigger]');

const openModal = (src, alt) => {
  if (!modal || !modalImage) return;
  modalImage.src = src;
  modalImage.alt = alt;
  modal.removeAttribute('hidden');
  modal.dataset.active = 'true';
  document.body.classList.add('no-scroll');
};

const closeModal = () => {
  if (!modal || !modalImage) return;
  modal.setAttribute('hidden', '');
  modal.dataset.active = 'false';
  modalImage.src = '';
  modalImage.alt = '';
  document.body.classList.remove('no-scroll');
};

if (galleryTriggers.length) {
  galleryTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-gallery-src');
      const alt = trigger.getAttribute('data-gallery-alt') || 'Gallery image';
      if (src) {
        openModal(src, alt);
      }
    });
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', closeModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && modal.dataset.active === 'true') {
    closeModal();
  }
});
