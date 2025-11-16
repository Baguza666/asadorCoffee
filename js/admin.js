import { menuItems as seedMenuItems } from '../data/menu-data.js';

const STORAGE_KEY = 'asadorMenuItems';
const SESSION_KEY = 'asadorAdminAuth';
const ADMIN_PASSWORD = 'asadorcoffee2024'; // NOTE: Client-side password for demo purposes only.
const ITEMS_PER_PAGE = 20;
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];
const CATEGORY_OPTIONS = [
  'Breakfasts',
  'Savory Sandwiches',
  'Virgin Cocktails',
  'Virgin Mojitos',
  'Asador Matcha',
  'Hot Drinks',
  'Cold Drinks',
  'Crepes',
  'Waffles',
  'Pancakes',
  'Cake bombs',
  'Soft Ice Cream',
  'Crispy Rice',
  'Frappes',
  'Milkshakes',
  'Lemonade',
  'Energy Drinks',
  'Ice Tea',
  'Asador Combos',
];

const root = document.querySelector('[data-admin-root]');
const loginSection = document.querySelector('[data-admin-login]');
const dashboardSection = document.querySelector('[data-admin-dashboard]');
const loginForm = document.querySelector('[data-admin-login-form]');
const passwordInput = loginForm?.querySelector('input[type="password"]');
const loginError = document.querySelector('[data-admin-login-error]');
const logoutButton = document.querySelector('[data-admin-logout]');
const exportButton = document.querySelector('[data-admin-export]');
const importInput = document.querySelector('[data-admin-import]');
const importTrigger = document.querySelector('.admin-import');
const addButton = document.querySelector('[data-admin-open-add]');
const searchInput = document.querySelector('[data-admin-search]');
const filterSelect = document.querySelector('[data-admin-filter]');
const tableBody = document.querySelector('[data-admin-table-body]');
const emptyState = document.querySelector('[data-admin-empty]');
const pagination = document.querySelector('[data-admin-pagination]');
const prevPageButton = pagination?.querySelector('[data-page-prev]');
const nextPageButton = pagination?.querySelector('[data-page-next]');
const pageStatus = pagination?.querySelector('[data-page-status]');
const statsTotal = document.querySelector('[data-admin-stat-total]');
const statsAvailable = document.querySelector('[data-admin-stat-available]');
const statsCategories = document.querySelector('[data-admin-stat-categories]');
const categoryList = document.querySelector('[data-admin-category-stats]');
const formModal = document.querySelector('[data-admin-form-modal]');
const deleteModal = document.querySelector('[data-admin-delete-modal]');
const formElement = formModal?.querySelector('[data-admin-item-form]');
const formNameInput = formElement?.querySelector('[name="name"]');
const formDescriptionInput = formElement?.querySelector('[name="description"]');
const formCategoryInput = formElement?.querySelector('[name="category"]');
const formPriceInput = formElement?.querySelector('[name="price"]');
const formImageInput = formElement?.querySelector('[name="image"]');
const formAvailableInput = formElement?.querySelector('[name="available"]');
const formIdInput = formElement?.querySelector('input[name="itemId"]');
const deleteMessage = document.querySelector('[data-admin-delete-message]');
const deleteConfirmButton = document.querySelector('[data-admin-confirm-delete]');
const deleteCloseButtons = document.querySelectorAll('[data-admin-close-delete]');
const formCloseButtons = document.querySelectorAll('[data-admin-close-form]');
const formTitle = document.querySelector('[data-admin-form-title]');
const formEyebrow = document.querySelector('[data-admin-form-eyebrow]');
const toastStack = document.querySelector('[data-toast-stack]');

const state = {
  isAuthenticated: false,
  items: [],
  sortKey: 'name',
  sortDirection: 'asc',
  search: '',
  category: 'all',
  currentPage: 1,
  editingId: null,
};

const formatCurrency = (value) => `$${Number(value).toFixed(2)}`;
const createId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `asador-${Date.now()}-${Math.random().toString(16).slice(2)}`);

const getStoredMenu = () => {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMenuItems));
    return [...seedMenuItems];
  } catch (error) {
    console.warn('Unable to access localStorage, using seed data.', error);
    return [...seedMenuItems];
  }
};

const persistMenu = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch (error) {
    console.error('Failed to persist menu items', error);
  }
};

const announce = (message) => {
  if (!toastStack) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastStack.appendChild(toast);
  window.setTimeout(() => toast.classList.add('is-visible'), 10);
  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 2400);
};

const toggleModal = (modal, shouldShow) => {
  if (!modal) return;
  if (shouldShow) {
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  } else {
    modal.setAttribute('hidden', 'true');
    modal.setAttribute('aria-hidden', 'true');
    const openModal = document.querySelector('.admin-modal:not([hidden])');
    if (!openModal) {
      document.body.classList.remove('is-locked');
    }
  }
};

const populateCategorySelects = () => {
  if (!filterSelect) return;
  CATEGORY_OPTIONS.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filterSelect.append(option);
  });

  const categoryField = document.getElementById('item-category');
  if (categoryField) {
    categoryField.innerHTML = CATEGORY_OPTIONS.map((category) => `<option value="${category}">${category}</option>`).join('');
  }
};

const openFormModal = (mode = 'create', item = null) => {
  if (!formElement) return;
  state.editingId = mode === 'edit' && item ? item.id : null;
  formTitle.textContent = mode === 'edit' ? 'Edit Menu Item' : 'Add Menu Item';
  formEyebrow.textContent = mode === 'edit' ? 'Update' : 'New item';
  formElement.reset();
  if (formIdInput) formIdInput.value = state.editingId || '';

  if (mode === 'edit' && item) {
    if (formNameInput) formNameInput.value = item.name;
    if (formDescriptionInput) formDescriptionInput.value = item.description;
    if (formCategoryInput) formCategoryInput.value = item.category;
    if (formPriceInput) formPriceInput.value = item.price;
    if (formImageInput) formImageInput.value = item.image;
    if (formAvailableInput) formAvailableInput.checked = item.available !== false;

    SIZE_OPTIONS.forEach((sizeLabel) => {
      const checkbox = formElement.querySelector(`[data-size-checkbox="${sizeLabel}"]`);
      const priceInput = formElement.querySelector(`[data-size-price="${sizeLabel}"]`);
      const sizeData = item.sizes?.find((size) => size.name === sizeLabel);
      if (checkbox && priceInput) {
        checkbox.checked = Boolean(sizeData);
        priceInput.disabled = !checkbox.checked;
        priceInput.value = sizeData ? sizeData.price : '';
      }
    });
  } else {
    SIZE_OPTIONS.forEach((sizeLabel) => {
      const checkbox = formElement.querySelector(`[data-size-checkbox="${sizeLabel}"]`);
      const priceInput = formElement.querySelector(`[data-size-price="${sizeLabel}"]`);
      if (checkbox && priceInput) {
        checkbox.checked = false;
        priceInput.disabled = true;
        priceInput.value = '';
      }
    });
  }

  toggleModal(formModal, true);
  formNameInput?.focus();
};

const closeFormModal = () => {
  toggleModal(formModal, false);
  state.editingId = null;
};

const openDeleteModal = (item) => {
  if (!deleteModal) return;
  state.editingId = item.id;
  deleteMessage.textContent = `Are you sure you want to delete ${item.name}?`;
  toggleModal(deleteModal, true);
};

const closeDeleteModal = () => {
  toggleModal(deleteModal, false);
  state.editingId = null;
};

const filterItems = () => {
  const searchTerm = state.search.toLowerCase();
  return state.items.filter((item) => {
    const matchesCategory = state.category === 'all' || item.category === state.category;
    const matchesSearch =
      !searchTerm || item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
};

const sortItems = (items) => {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const { sortKey, sortDirection } = state;
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortKey === 'price') {
      return (a.price - b.price) * direction;
    }
    return a[sortKey].localeCompare(b[sortKey]) * direction;
  });
  return sorted;
};

const renderStats = () => {
  const totalItems = state.items.length;
  const availableItems = state.items.filter((item) => item.available !== false).length;
  const activeCategories = new Set(state.items.map((item) => item.category)).size;

  if (statsTotal) statsTotal.textContent = totalItems;
  if (statsAvailable) statsAvailable.textContent = availableItems;
  if (statsCategories) statsCategories.textContent = activeCategories;

  if (categoryList) {
    const categoryCounts = state.items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    categoryList.innerHTML = entries.length
      ? entries.map((entry) => `<li><span>${entry[0]}</span><strong>${entry[1]}</strong></li>`).join('')
      : '<li><span>No categories yet</span><strong>0</strong></li>';
  }
};

const renderTable = () => {
  if (!tableBody) return;
  const filtered = sortItems(filterItems());
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  state.currentPage = Math.min(state.currentPage, totalPages);
  const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  tableBody.innerHTML = pageItems
    .map((item) => {
      const sizes = item.sizes?.length
        ? item.sizes.map((size) => `${size.name}: ${formatCurrency(size.price)}`).join('<br />')
        : '—';
      const availability = item.available === false ? 'Coming soon' : 'Available';
      return `
        <tr>
          <td><img src="${item.image}" alt="${item.name}" loading="lazy" class="admin-thumb" /></td>
          <td>
            <strong>${item.name}</strong>
            <p class="admin-table__description">${item.description}</p>
          </td>
          <td>${item.category}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${sizes}</td>
          <td><span class="status-chip ${item.available === false ? 'is-pending' : 'is-live'}">${availability}</span></td>
          <td class="admin-table__actions">
            <button class="icon-button" type="button" data-admin-edit="${item.id}" aria-label="Edit ${item.name}">✏️</button>
            <button class="icon-button" type="button" data-admin-delete="${item.id}" aria-label="Delete ${item.name}">🗑️</button>
          </td>
        </tr>
      `;
    })
    .join('');

  if (emptyState) {
    emptyState.hidden = pageItems.length > 0;
  }

  if (pageStatus) {
    pageStatus.textContent = `Page ${state.currentPage} of ${totalPages}`;
  }

  if (prevPageButton) {
    prevPageButton.disabled = state.currentPage === 1;
  }
  if (nextPageButton) {
    nextPageButton.disabled = state.currentPage === totalPages || totalPages === 0;
  }
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  if (!formElement) return;
  const formData = new FormData(formElement);
  const name = formData.get('name').trim();
  const description = formData.get('description').trim();
  const category = formData.get('category');
  const price = Number(formData.get('price'));
  const image = formData.get('image').trim();
  const available = formAvailableInput?.checked ?? true;

  if (!name || !description || !category || !Number.isFinite(price) || !image) {
    announce('Please complete all required fields.');
    return;
  }

  let invalidSize = false;
  const sizes = SIZE_OPTIONS.reduce((acc, label) => {
    const checkbox = formElement.querySelector(`[data-size-checkbox="${label}"]`);
    const priceInput = formElement.querySelector(`[data-size-price="${label}"]`);
    if (checkbox?.checked) {
      const sizePrice = Number(priceInput.value);
      if (!Number.isFinite(sizePrice)) {
        invalidSize = true;
        return acc;
      }
      acc.push({ name: label, price: sizePrice });
    }
    return acc;
  }, []);

  if (invalidSize) {
    announce('Please enter prices for selected sizes.');
    return;
  }

  const recordId = formData.get('itemId') || createId();
  const existingIndex = state.items.findIndex((item) => item.id === recordId);
  const preservedSizes = existingIndex > -1
    ? (state.items[existingIndex].sizes || []).filter((size) => !SIZE_OPTIONS.includes(size.name))
    : [];
  const mergedSizes = [...sizes];
  preservedSizes.forEach((size) => {
    if (!mergedSizes.some((entry) => entry.name === size.name)) {
      mergedSizes.push(size);
    }
  });

  const payload = {
    id: recordId,
    name,
    description,
    category,
    price,
    image,
    available,
    sizes: mergedSizes,
  };

  if (existingIndex > -1) {
    state.items[existingIndex] = payload;
    announce('Item updated.');
  } else {
    state.items = [payload, ...state.items];
    state.currentPage = 1;
    announce('New item added.');
  }

  persistMenu();
  renderStats();
  renderTable();
  closeFormModal();
};

const deleteItem = () => {
  if (!state.editingId) return;
  state.items = state.items.filter((item) => item.id !== state.editingId);
  persistMenu();
  renderStats();
  renderTable();
  announce('Item deleted.');
  closeDeleteModal();
};

const handleSearch = (value) => {
  state.search = value;
  state.currentPage = 1;
  renderTable();
};

const handleFilter = (event) => {
  state.category = event.target.value;
  state.currentPage = 1;
  renderTable();
};

const handleSort = (event) => {
  const sortButton = event.target.closest('[data-sort]');
  if (!sortButton) return;
  const sortKey = sortButton.dataset.sort;
  if (state.sortKey === sortKey) {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortKey = sortKey;
    state.sortDirection = 'asc';
  }
  renderTable();

  document.querySelectorAll('.sort-button').forEach((button) => {
    if (button.dataset.sort === state.sortKey) {
      button.classList.add('is-active');
      button.setAttribute('data-sort-direction', state.sortDirection);
    } else {
      button.classList.remove('is-active');
      button.removeAttribute('data-sort-direction');
    }
  });
};

const handleTableClick = (event) => {
  const editButton = event.target.closest('[data-admin-edit]');
  const deleteButton = event.target.closest('[data-admin-delete]');

  if (editButton) {
    const item = state.items.find((entry) => entry.id === editButton.dataset.adminEdit);
    if (item) openFormModal('edit', item);
  }
  if (deleteButton) {
    const item = state.items.find((entry) => entry.id === deleteButton.dataset.adminDelete);
    if (item) openDeleteModal(item);
  }
};

const handlePagination = (direction) => {
  const totalPages = Math.max(1, Math.ceil(filterItems().length / ITEMS_PER_PAGE));
  if (direction === 'next' && state.currentPage < totalPages) {
    state.currentPage += 1;
  }
  if (direction === 'prev' && state.currentPage > 1) {
    state.currentPage -= 1;
  }
  renderTable();
};

const handleExport = () => {
  const blob = new Blob([JSON.stringify(state.items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'asador-menu.json';
  anchor.click();
  URL.revokeObjectURL(url);
};

const handleImport = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const importedData = JSON.parse(loadEvent.target.result);
      if (!Array.isArray(importedData)) throw new Error('Invalid file format');
      state.items = importedData;
      state.currentPage = 1;
      persistMenu();
      renderStats();
      renderTable();
      announce('Menu imported successfully.');
    } catch (error) {
      console.error('Import failed', error);
      announce('Import failed. Please check the file.');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
};

const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn.apply(null, args), delay);
  };
};

const authenticate = () => {
  state.isAuthenticated = sessionStorage.getItem(SESSION_KEY) === 'true';
  if (state.isAuthenticated) {
    loginSection?.setAttribute('hidden', 'true');
    dashboardSection?.removeAttribute('hidden');
  } else {
    loginSection?.removeAttribute('hidden');
    dashboardSection?.setAttribute('hidden', 'true');
  }
};

const init = () => {
  if (!root) return;
  populateCategorySelects();
  state.items = getStoredMenu();
  authenticate();
  renderStats();
  renderTable();
};

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    passwordInput.value = '';
    loginError?.setAttribute('hidden', 'true');
    authenticate();
  } else {
    loginError?.removeAttribute('hidden');
  }
});

logoutButton?.addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  authenticate();
});

addButton?.addEventListener('click', () => openFormModal('create'));
formCloseButtons.forEach((button) => button.addEventListener('click', closeFormModal));
deleteCloseButtons.forEach((button) => button.addEventListener('click', closeDeleteModal));
formElement?.addEventListener('submit', handleFormSubmit);
deleteConfirmButton?.addEventListener('click', deleteItem);
searchInput?.addEventListener('input', debounce((event) => handleSearch(event.target.value)));
filterSelect?.addEventListener('change', handleFilter);
tableBody?.addEventListener('click', handleTableClick);
document.querySelector('.admin-table thead')?.addEventListener('click', handleSort);
prevPageButton?.addEventListener('click', () => handlePagination('prev'));
nextPageButton?.addEventListener('click', () => handlePagination('next'));
exportButton?.addEventListener('click', handleExport);
importInput?.addEventListener('change', handleImport);
importTrigger?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    importInput?.click();
  }
});
formElement?.querySelectorAll('[data-size-checkbox]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const priceInput = formElement.querySelector(`[data-size-price="${checkbox.dataset.sizeCheckbox}"]`);
    if (priceInput) {
      priceInput.disabled = !checkbox.checked;
      if (!checkbox.checked) priceInput.value = '';
    }
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!formModal?.hasAttribute('hidden')) closeFormModal();
    if (!deleteModal?.hasAttribute('hidden')) closeDeleteModal();
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    try {
      state.items = JSON.parse(event.newValue);
      renderStats();
      renderTable();
    } catch (error) {
      console.error('Failed to sync menu data', error);
    }
  }
});

init();
