import { menuItems } from '../data/menu-data.js';

const grid = document.querySelector('.menu__grid');
const chips = document.querySelectorAll('.chip');

function renderItems(category = 'all') {
  if (!grid) return;
  grid.innerHTML = '';
  const filtered =
    category === 'all' ? menuItems : menuItems.filter((item) => item.category === category);

  filtered.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'menu-card';
    article.innerHTML = `
      <div class="menu-card__meta">
        <span>${item.name}</span>
        <span>$${item.price.toFixed(2)}</span>
      </div>
      <p class="menu-card__notes">${item.notes}</p>
    `;
    grid.append(article);
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p>No items yet in this category.</p>';
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    renderItems(chip.dataset.category);
  });
});

renderItems();
