import { menuItems } from '../data/menu-data.js';

const form = document.getElementById('admin-form');
const list = document.getElementById('admin-items');
let drafts = [...menuItems];

function renderDrafts() {
  if (!list) return;
  list.innerHTML = '';
  drafts.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.name}</strong><br />
      <small>${item.category} · $${item.price.toFixed(2)}</small>
      <p>${item.notes}</p>
    `;
    list.append(li);
  });
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const newItem = {
      id: crypto.randomUUID(),
      name: formData.get('name').trim(),
      price: Number(formData.get('price')),
      category: formData.get('category'),
      notes: formData.get('notes').trim(),
    };
    drafts = [newItem, ...drafts];
    renderDrafts();
    form.reset();
  });
}

renderDrafts();
