// ===== CART MANAGER (localStorage) =====
const Cart = {
  KEY: 'localbite_cart',
  RESTAURANT_KEY: 'localbite_cart_restaurant',

  getCart() {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  },

  getRestaurantId() {
    return localStorage.getItem(this.RESTAURANT_KEY) || null;
  },

  addItem(item, restaurantId) {
    // Warn if mixing restaurants
    const existingRestaurant = this.getRestaurantId();
    if (existingRestaurant && existingRestaurant !== restaurantId) {
      const ok = confirm('Your cart has items from another restaurant. Starting a new cart will remove them. Continue?');
      if (!ok) return false;
      this.clearCart();
    }
    const cart = this.getCart();
    const existing = cart.find(i => i.menuItemId === item.menuItemId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    localStorage.setItem(this.KEY, JSON.stringify(cart));
    localStorage.setItem(this.RESTAURANT_KEY, restaurantId);
    return true;
  },

  removeItem(menuItemId) {
    let cart = this.getCart();
    const existing = cart.find(i => i.menuItemId === menuItemId);
    if (existing) {
      existing.qty -= 1;
      if (existing.qty <= 0) cart = cart.filter(i => i.menuItemId !== menuItemId);
    }
    localStorage.setItem(this.KEY, JSON.stringify(cart));
    if (cart.length === 0) localStorage.removeItem(this.RESTAURANT_KEY);
  },

  clearCart() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.RESTAURANT_KEY);
  },

  getTotal() {
    return this.getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  getCount() {
    return this.getCart().reduce((sum, i) => sum + i.qty, 0);
  },
};

// ===== LOYALTY STREAK TRACKER =====
const Loyalty = {
  KEY: 'localbite_orders',

  recordOrder(phone) {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(this.KEY) || '{}');
    const userHistory = data[phone] || [];
    if (!userHistory.includes(today)) {
      userHistory.push(today);
    }
    data[phone] = userHistory;
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  getConsecutiveDays(phone) {
    const data = JSON.parse(localStorage.getItem(this.KEY) || '{}');
    const userHistory = (data[phone] || []).map(d => new Date(d)).sort((a, b) => b - a);
    if (userHistory.length === 0) return 0;
    let streak = 1;
    for (let i = 0; i < userHistory.length - 1; i++) {
      const diff = (userHistory[i] - userHistory[i + 1]) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) streak++;
      else break;
    }
    return streak;
  },
};
