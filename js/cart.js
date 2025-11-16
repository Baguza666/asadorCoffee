const CART_STORAGE_KEY = 'asadorCart';
const FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

let cartItems = readCartFromStorage();
let initialized = false;
let dom = {};

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
};

function readCartFromStorage() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Unable to read cart from storage', error);
    return [];
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Unable to save cart', error);
  }
}

function cacheDom() {
  dom = {
    fab: document.querySelector('[data-cart-toggle]'),
    badge: document.querySelector('[data-cart-count]'),
    overlay: document.querySelector('[data-cart-overlay]'),
    drawer: document.querySelector('[data-cart-drawer]'),
    closeBtn: document.querySelector('[data-cart-close]'),
    itemsList: document.querySelector('[data-cart-items]'),
    emptyState: document.querySelector('[data-cart-empty]'),
    subtotal: document.querySelector('[data-cart-subtotal]'),
    clearBtn: document.querySelector('[data-cart-clear]'),
    staffBtn: document.querySelector('[data-cart-staff]'),
    toastStack: document.querySelector('[data-toast-stack]'),
    orderSummary: document.querySelector('[data-order-summary]'),
    orderList: document.querySelector('[data-order-summary-list]'),
    orderTotal: document.querySelector('[data-order-total]'),
    orderTimestamp: document.querySelector('[data-order-timestamp]'),
    orderEdit: document.querySelector('[data-order-edit]'),
    orderNew: document.querySelector('[data-order-new]'),
  };
}

function formatCurrency(value) {
  return FORMATTER.format(value ?? 0);
}

function getCartCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

function triggerFabBounce() {
  if (!dom.fab) return;
  dom.fab.classList.remove('is-bouncing');
  // Force reflow to restart animation
  void dom.fab.offsetWidth;
  dom.fab.classList.add('is-bouncing');
}

function showToast(message, variant = 'neutral') {
  if (!dom.toastStack) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  dom.toastStack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener(
      'transitionend',
      () => toast.remove(),
      { once: true }
    );
  }, 3200);
}

function updateBadge() {
  if (!dom.fab || !dom.badge) return;
  const count = getCartCount();
  dom.badge.textContent = count;
  if (count === 0) {
    dom.badge.setAttribute('data-empty', 'true');
  } else {
    dom.badge.removeAttribute('data-empty');
  }
  dom.fab.setAttribute('aria-label', `Open cart (${count} item${count === 1 ? '' : 's'})`);
}

function renderCartItems() {
  if (!dom.itemsList || !dom.emptyState) return;

  dom.itemsList.innerHTML = cartItems
    .map((item) => {
      const subtotal = item.price * item.quantity;
      return `
        <li class="cart-line" data-cart-item data-item-id="${item.id}" data-item-size="${item.size}">
          <div class="cart-line__media">
            <img src="${item.image}" alt="${item.name}" loading="lazy" width="60" height="60" />
          </div>
          <div class="cart-line__info">
            <p class="cart-line__title">${item.name}</p>
            <p class="cart-line__meta">${item.size}</p>
            <p class="cart-line__price">${formatCurrency(item.price)}</p>
          </div>
          <div class="cart-line__controls" aria-label="Quantity for ${item.name} ${item.size}">
            <button class="qty-btn" type="button" data-cart-decrement aria-label="Decrease quantity">−</button>
            <span class="cart-line__qty" aria-live="polite">${item.quantity}</span>
            <button class="qty-btn" type="button" data-cart-increment aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-line__subtotal">${formatCurrency(subtotal)}</div>
          <button class="icon-button" type="button" data-cart-remove aria-label="Remove ${item.name}">
            <span aria-hidden="true">🗑</span>
          </button>
        </li>
      `;
    })
    .join('');

  const hasItems = cartItems.length > 0;
  dom.emptyState.hidden = hasItems;
  dom.itemsList.hidden = !hasItems;
}

function updateSubtotal() {
  if (!dom.subtotal) return;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  dom.subtotal.textContent = formatCurrency(subtotal);
}

function toggleActionButtons() {
  const hasItems = cartItems.length > 0;
  dom.clearBtn?.toggleAttribute('disabled', !hasItems);
  dom.staffBtn?.toggleAttribute('disabled', !hasItems);
}

function updateUI() {
  updateBadge();
  renderCartItems();
  updateSubtotal();
  toggleActionButtons();
}

function findItem(id, size) {
  return cartItems.find((item) => item.id === id && item.size === size);
}

function persistAndRender(message, variant = 'neutral') {
  saveCartToStorage(cartItems);
  if (initialized) {
    updateUI();
    if (message) {
      showToast(message, variant);
    }
  }
}

export function addItemToCart(payload) {
  const { id, name, size = 'Standard', price = 0, image } = payload;
  if (!id || !name) return;

  const safeImage = image || 'https://via.placeholder.com/80x80/c4a888/192447?text=Item';
  const existing = findItem(id, size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ id, name, size, price, image: safeImage, quantity: 1 });
  }

  persistAndRender(`${name} added to cart`, 'success');
  triggerFabBounce();
}

function updateItemQuantity(id, size, delta) {
  const item = findItem(id, size);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter((entry) => !(entry.id === id && entry.size === size));
    persistAndRender('Item removed from cart', 'info');
  } else {
    persistAndRender('Quantity updated', 'neutral');
  }
}

function removeItem(id, size) {
  cartItems = cartItems.filter((item) => !(item.id === id && item.size === size));
  persistAndRender('Item removed from cart', 'info');
}

function clearCart(showMessage = true) {
  if (!cartItems.length) return;
  cartItems = [];
  persistAndRender(showMessage ? 'Cart cleared' : '', 'info');
}

function handleItemActions(event) {
  const target = event.target;
  const line = target.closest('[data-cart-item]');
  if (!line) return;
  const { itemId, itemSize } = line.dataset;

  if (target.matches('[data-cart-increment]')) {
    updateItemQuantity(itemId, itemSize, 1);
  }
  if (target.matches('[data-cart-decrement]')) {
    updateItemQuantity(itemId, itemSize, -1);
  }
  if (target.matches('[data-cart-remove]')) {
    removeItem(itemId, itemSize);
  }
}

function openDrawer() {
  if (!dom.drawer || !dom.overlay) return;
  dom.drawer.classList.add('is-visible');
  dom.overlay.hidden = false;
  document.body.classList.add('has-cart-open');
  dom.drawer.setAttribute('aria-hidden', 'false');
  dom.closeBtn?.focus();
}

function closeDrawer() {
  if (!dom.drawer || !dom.overlay) return;
  dom.drawer.classList.remove('is-visible');
  dom.overlay.hidden = true;
  document.body.classList.remove('has-cart-open');
  dom.drawer.setAttribute('aria-hidden', 'true');
}

function toggleDrawer() {
  if (!dom.drawer) return;
  if (dom.drawer.classList.contains('is-visible')) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

function renderOrderSummary() {
  if (!dom.orderSummary || !dom.orderList || !dom.orderTotal) return;
  dom.orderList.innerHTML = cartItems
    .map(
      (item) => `
        <div class="order-summary__row">
          <div>
            <p class="order-summary__item">${item.quantity} × ${item.name}</p>
            <p class="order-summary__meta">${item.size}</p>
          </div>
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
        </div>
      `
    )
    .join('');
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  dom.orderTotal.textContent = formatCurrency(total);
  const now = new Date();
  dom.orderTimestamp.textContent = now.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function openOrderSummary() {
  if (!cartItems.length || !dom.orderSummary) return;
  renderOrderSummary();
  closeDrawer();
  dom.orderSummary.hidden = false;
  dom.orderSummary.classList.add('is-visible');
  document.body.classList.add('has-order-summary');
}

function closeOrderSummary() {
  if (!dom.orderSummary) return;
  dom.orderSummary.classList.remove('is-visible');
  dom.orderSummary.hidden = true;
  document.body.classList.remove('has-order-summary');
}

function handleNewOrder() {
  clearCart(false);
  closeOrderSummary();
  closeDrawer();
  showToast('New order started', 'success');
}

function attachEvents() {
  dom.fab?.addEventListener('click', toggleDrawer);
  dom.overlay?.addEventListener('click', closeDrawer);
  dom.closeBtn?.addEventListener('click', closeDrawer);
  dom.itemsList?.addEventListener('click', handleItemActions);
  dom.clearBtn?.addEventListener('click', () => clearCart(true));
  dom.staffBtn?.addEventListener('click', openOrderSummary);
  dom.orderSummary?.addEventListener('click', (event) => {
    if (event.target === dom.orderSummary) {
      closeOrderSummary();
    }
  });
  dom.orderEdit?.addEventListener('click', () => {
    closeOrderSummary();
    openDrawer();
  });
  dom.orderNew?.addEventListener('click', handleNewOrder);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (dom.orderSummary && dom.orderSummary.classList.contains('is-visible')) {
      closeOrderSummary();
      return;
    }
    if (dom.drawer && dom.drawer.classList.contains('is-visible')) {
      closeDrawer();
    }
  });
}

export function initCart() {
  if (initialized) return;
  ready(() => {
    cacheDom();
    if (!dom.fab) return;
    initialized = true;
    updateUI();
    attachEvents();
  });
}

// Initialize automatically when imported
initCart();

export function getCartItems() {
  return [...cartItems];
}
