const CART_KEY = 'shopping_cart';

// Получить корзину
export const getCart = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

// Сохранить корзину
const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// Добавить товар в корзину (если уже есть, увеличить количество)
export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  saveCart(cart);
  return cart;
};

// Удалить товар из корзины
export const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
};

// Изменить количество
export const updateQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      return removeFromCart(productId);
    }
    saveCart(cart);
  }
  return cart;
};

// Очистить корзину
export const clearCart = () => {
  saveCart([]);
};

// Получить общую сумму
export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// Оформление заказа (эмуляция)
export const checkout = (orderDetails) => {
  // В реальности здесь был бы POST-запрос на сервер
  // Сохраняем заказ в localStorage для админки
  const ordersKey = 'orders';
  const orders = localStorage.getItem(ordersKey) ? JSON.parse(localStorage.getItem(ordersKey)) : [];
  const newOrder = {
    id: Date.now(),
    date: new Date().toISOString(),
    items: getCart(),
    total: getCartTotal(),
    ...orderDetails,
    status: 'новый'
  };
  orders.push(newOrder);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  clearCart();
  return newOrder;
};