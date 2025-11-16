import { menuItems as seedMenuItems } from '../data/menu-data.js';
import { addItemToCart } from './cart.js';
import { trackEvent } from './analytics.js';

const categoryContainer = document.querySelector('[data-category-container]');
const grid = document.querySelector('[data-menu-grid]');
const emptyState = document.querySelector('[data-menu-empty]');
const searchForm = document.querySelector('[data-menu-search]');
const searchInput = searchForm?.querySelector('input');
const loadingIndicator = document.querySelector('[data-menu-loading]');

const MENU_STORAGE_KEY = 'asadorMenuItems';

const loadMenuInventory = () => {
  try {
    const stored = window.localStorage.getItem(MENU_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(seedMenuItems));
    return [...seedMenuItems];
  } catch (error) {
    console.warn('Unable to read stored menu data, using defaults.', error);
    try {
      window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(seedMenuItems));
    } catch (storageError) {
      console.error('Failed to seed menu data', storageError);
    }
    return [...seedMenuItems];
  }
};

const menuItems = loadMenuInventory();

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Breakfasts', value: 'Breakfasts' },
  { label: 'Savory Sandwiches', value: 'Savory Sandwiches' },
  { label: 'Virgin Cocktails', value: 'Virgin Cocktails' },
  { label: 'Virgin Mojitos', value: 'Virgin Mojitos' },
  { label: 'Asador Matcha', value: 'Asador Matcha' },
  { label: 'Hot Drinks', value: 'Hot Drinks' },
  { label: 'Cold Drinks', value: 'Cold Drinks' },
  { label: 'Crepes', value: 'Crepes' },
  { label: 'Waffles', value: 'Waffles' },
  { label: 'Pancakes', value: 'Pancakes' },
  { label: 'Cake bombs', value: 'Cake bombs' },
  { label: 'Soft Ice Cream', value: 'Soft Ice Cream' },
  { label: 'Crispy Rice', value: 'Crispy Rice' },
  { label: 'Frappes', value: 'Frappes' },
  { label: 'Milkshakes', value: 'Milkshakes' },
  { label: 'Lemonade', value: 'Lemonade' },
  { label: 'Energy Drinks', value: 'Energy Drinks' },
  { label: 'Ice Tea', value: 'Ice Tea' },
  { label: 'Asador Combos', value: 'Asador Combos', badge: 'Coming Soon' }
];

let activeCategory = 'all';
let searchQuery = '';

const categoryCounts = menuItems.reduce(
  (acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  },
  { all: menuItems.length }
);

const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn.apply(null, args), delay);
  };
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const setLoadingState = (isLoading) => {
  grid?.setAttribute('aria-busy', String(isLoading));
  if (!loadingIndicator) return;
  if (isLoading) {
    loadingIndicator.hidden = false;
  } else {
    loadingIndicator.hidden = true;
  }
};

const addToCart = (itemId, sizeLabel) => {
  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) return;

  const keySize = sizeLabel || (item.sizes?.[0]?.name ?? 'Standard');
  const selectedSize = item.sizes?.find((size) => size.name === keySize);
  const price = selectedSize ? selectedSize.price : item.price;

  addItemToCart({
    id: item.id,
    name: item.name,
    size: keySize,
    price,
    image: item.image,
  });
};

const renderCategories = () => {
  if (!categoryContainer) return;
  categoryContainer.innerHTML = CATEGORIES.map((category) => {
    const count = categoryCounts[category.value] || 0;
    const isActive = category.value === activeCategory;
    return `
      <button
        class="menu-pill ${isActive ? 'is-active' : ''}"
        role="tab"
        type="button"
        data-category="${category.value}"
        aria-selected="${isActive}"
        tabindex="${isActive ? '0' : '-1'}"
      >
        <span>${category.label}</span>
        <span class="menu-pill__count">${count}</span>
        ${category.badge ? `<span class="menu-pill__badge">${category.badge}</span>` : ''}
      </button>
    `;
  }).join('');
};

const createSizePills = (item) => {
  if (!item.sizes || item.sizes.length === 0) {
    return '';
  }

  return `
    <div class="menu-card__sizes" role="group" aria-label="Sizes for ${item.name}">
      ${item.sizes
        .map((size, index) => `
          <button
            class="size-pill ${index === 0 ? 'is-selected' : ''}"
            data-size-btn
            data-item-id="${item.id}"
            data-size-label="${size.name}"
            aria-pressed="${index === 0}"
            type="button"
          >
            ${size.name}
          </button>
        `)
        .join('')}
    </div>
  `;
};

const renderItems = () => {
  if (!grid) return;

  setLoadingState(true);
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const searchableText = `${item.name} ${item.description}`.toLowerCase();
    const matchesSearch = !searchQuery || searchableText.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  grid.classList.add('is-filtering');
  grid.innerHTML = filteredItems
    .map((item) => {
      const disabled = item.available === false;
      return `
        <article class="menu-card ${disabled ? 'is-unavailable' : ''}" data-category="${item.category}">
          <div class="menu-card__media">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
            ${disabled ? '<span class="menu-card__flag">Coming Soon</span>' : ''}
          </div>
          <div class="menu-card__body">
            <div class="menu-card__heading">
              <h3>${item.name}</h3>
              <span class="menu-card__price">${formatCurrency(item.price)}</span>
            </div>
            <p class="menu-card__description">${item.description}</p>
            ${createSizePills(item)}
            <button
              class="btn btn--ghost ${disabled ? 'btn--disabled' : ''}"
              type="button"
              data-add-to-cart
              data-item-id="${item.id}"
              ${disabled ? 'disabled aria-disabled="true"' : ''}
            >
              ${disabled ? 'Unavailable' : 'Add to Cart'}
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  if (emptyState) {
    emptyState.hidden = filteredItems.length > 0;
  }

  window.setTimeout(() => {
    grid.classList.remove('is-filtering');
    setLoadingState(false);
  }, 220);
};

const handleCategoryClick = (event) => {
  const target = event.target.closest('[data-category]');
  if (!target) return;

  activeCategory = target.dataset.category;
  renderCategories();
  renderItems();
  trackEvent('menu_category_click', {
    category: activeCategory,
    item_count: categoryCounts[activeCategory] || menuItems.length,
  });
};

const handleSizeSelection = (event) => {
  const sizeButton = event.target.closest('[data-size-btn]');
  if (!sizeButton) return;

  const card = sizeButton.closest('.menu-card');
  if (!card) return;

  const itemId = sizeButton.dataset.itemId;
  card
    .querySelectorAll(`[data-item-id="${itemId}"][data-size-btn]`)
    .forEach((btn) => {
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');
    });
  sizeButton.classList.add('is-selected');
  sizeButton.setAttribute('aria-pressed', 'true');
};

const handleAddToCart = (event) => {
  const button = event.target.closest('[data-add-to-cart]');
  if (!button) return;

  const card = button.closest('.menu-card');
  const selectedSize = card?.querySelector('.size-pill.is-selected');
  const sizeLabel = selectedSize?.dataset.sizeLabel;
  const { itemId } = button.dataset;
  addToCart(itemId, sizeLabel);
  button.classList.add('is-success');
  button.textContent = 'Added';
  window.setTimeout(() => {
    button.classList.remove('is-success');
    button.textContent = 'Add to Cart';
  }, 1200);
};

const initSearch = () => {
  if (!searchForm || !searchInput) return;
  searchForm.addEventListener('submit', (event) => event.preventDefault());
  const debounced = debounce((value) => {
    searchQuery = value.toLowerCase().trim();
    renderItems();
  });
  searchInput.addEventListener('input', (event) => debounced(event.target.value));
};

const initMenu = () => {
  renderCategories();
  renderItems();
  categoryContainer?.addEventListener('click', handleCategoryClick);
  grid?.addEventListener('click', (event) => {
    handleSizeSelection(event);
    handleAddToCart(event);
  });
  initSearch();
};

initMenu();
