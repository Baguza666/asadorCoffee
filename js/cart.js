const CART_KEY = 'asador-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
  } catch (error) {
    console.error('Unable to parse cart', error);
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item) {
  const cart = getCart();
  cart.push({ ...item, addedAt: new Date().toISOString() });
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartItems() {
  return getCart();
}
