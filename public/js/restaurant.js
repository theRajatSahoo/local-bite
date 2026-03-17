// ===== RESTAURANT / MENU PAGE =====
const EMOJI_MAP = {
  'Biryani & Rice': '🍛', 'Fast Food': '🍔', 'Odia Cuisine': '🍲',
  'North Indian': '🫕', 'Chinese & Momos': '🥟', 'Multi-cuisine': '🍽️',
};

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get('id');

if (!restaurantId) window.location.href = '/';

let activeOffers = [];

async function init() {
  updateCartBadge();
  await Promise.all([loadRestaurant(), loadMenu(), loadOffers()]);
  renderSidebarCart();
}

async function loadRestaurant() {
  try {
    const r = await API.get(`/restaurants/${restaurantId}`);
    document.title = `${r.name} — LocalBite`;
    document.getElementById('restaurant-name').textContent = r.name;
    document.getElementById('restaurant-name-bc').textContent = r.name;
    document.getElementById('restaurant-emoji').textContent = EMOJI_MAP[r.category] || '🍽️';
    document.getElementById('restaurant-category').textContent = r.category;
    document.getElementById('restaurant-meta').innerHTML = `
      <span><span class="star">★</span> ${r.rating}</span>
      <span>⏱ ${r.deliveryTime}</span>
      <span>📍 ${r.area}</span>
      <span style="color:${r.isOpen ? 'var(--success)' : 'var(--text-dim)'}">● ${r.isOpen ? 'Open Now' : 'Currently Closed'}</span>
    `;
  } catch (e) { console.error(e); }
}

async function loadMenu() {
  try {
    const items = await API.get(`/menu/${restaurantId}`);
    if (items.length === 0) {
      document.getElementById('menu-container').innerHTML = `<div class="empty-state"><div class="empty-icon">🍽️</div><h3>Menu coming soon</h3></div>`;
      return;
    }
    // Group by category
    const categories = {};
    items.forEach(item => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });
    const html = Object.entries(categories).map(([cat, catItems]) => `
      <div class="menu-category">
        <h3>${cat}</h3>
        <div class="menu-items">
          ${catItems.map(item => renderMenuItem(item)).join('')}
        </div>
      </div>
    `).join('');
    document.getElementById('menu-container').innerHTML = html;
  } catch (e) { console.error(e); }
}

function renderMenuItem(item) {
  const cart = Cart.getCart();
  const cartItem = cart.find(c => c.menuItemId === item._id);
  const qty = cartItem ? cartItem.qty : 0;

  // Check for offer price
  let priceHtml = `₹${item.price}`;
  for (const offer of activeOffers) {
    if (offer.conditions?.applicableItemIds?.includes(item._id) && offer.reward?.type === 'fixed_price') {
      priceHtml = `<span class="offer-price">₹${offer.reward.fixedPrice}</span> <span class="original-price">₹${item.price}</span>`;
      break;
    }
  }

  return `
    <div class="menu-item" id="item-${item._id}" data-name="${item.name.replace(/"/g, '&quot;')}" data-price="${item.price}">
      <div class="veg-dot ${item.isVeg ? '' : 'non-veg'}"></div>
      <div class="menu-item-info">
        <h4>${item.name}</h4>
        ${item.description ? `<p>${item.description}</p>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;flex-shrink:0;">
        <span class="menu-item-price">${priceHtml}</span>
        ${qty === 0
          ? `<button class="add-btn" onclick="addToCart('${item._id}','${item.name.replace(/'/g, "\\'")}',${item.price})">+ Add</button>`
          : `<div class="qty-control">
               <button class="qty-btn" onclick="decreaseQty('${item._id}')">−</button>
               <span class="qty-num">${qty}</span>
               <button class="qty-btn" onclick="addToCart('${item._id}','${item.name.replace(/'/g, "\\'")}',${item.price})">+</button>
             </div>`
        }
      </div>
    </div>
  `;
}

async function loadOffers() {
  try {
    activeOffers = await API.get(`/offers?restaurantId=${restaurantId}`);
    const wrapper = document.getElementById('offer-banners-wrapper');
    if (wrapper && activeOffers.length > 0) {
      wrapper.innerHTML = `<div class="offer-banners">${activeOffers.map(renderOfferBanner).join('')}</div>`;
    }
  } catch (e) { /* silent */ }
}

function addToCart(menuItemId, name, price) {
  // Check for offer price
  let finalPrice = price;
  for (const offer of activeOffers) {
    if (offer.conditions?.applicableItemIds?.includes(menuItemId) && offer.reward?.type === 'fixed_price') {
      finalPrice = offer.reward.fixedPrice;
      break;
    }
  }
  Cart.addItem({ menuItemId, name, price: finalPrice }, restaurantId);
  refreshMenuItemUI(menuItemId, name, price);
  renderSidebarCart();
  updateCartBadge();
  showToast(`${name} added to cart`, 'success');
}

function decreaseQty(menuItemId) {
  Cart.removeItem(menuItemId);
  const cart = Cart.getCart();
  const existing = cart.find(c => c.menuItemId === menuItemId);
  const itemEl = document.getElementById(`item-${menuItemId}`);
  if (!existing) {
    // Read name and price from data attributes to rebuild the Add button correctly
    const name = itemEl ? itemEl.dataset.name || '' : '';
    const price = itemEl ? Number(itemEl.dataset.price) || 0 : 0;
    const btn = itemEl && itemEl.querySelector('.qty-control');
    if (btn) btn.outerHTML = `<button class="add-btn" onclick="addToCart('${menuItemId}','${name.replace(/'/g, "\\'")}',${price})">+ Add</button>`;
  } else {
    itemEl.querySelector('.qty-num').textContent = existing.qty;
  }
  renderSidebarCart();
  updateCartBadge();
}

function refreshMenuItemUI(menuItemId, name, price) {
  const cart = Cart.getCart();
  const cartItem = cart.find(c => c.menuItemId === menuItemId);
  const item = document.getElementById(`item-${menuItemId}`);
  if (!item) return;
  const qtyContainer = item.querySelector('.qty-control, .add-btn');
  if (cartItem && cartItem.qty > 0) {
    const newHtml = `<div class="qty-control">
      <button class="qty-btn" onclick="decreaseQty('${menuItemId}')">−</button>
      <span class="qty-num">${cartItem.qty}</span>
      <button class="qty-btn" onclick="addToCart('${menuItemId}','${name.replace(/'/g, "\\'")}',${price})">+</button>
    </div>`;
    if (qtyContainer) qtyContainer.outerHTML = newHtml;
  }
}

function renderSidebarCart() {
  const cart = Cart.getCart();
  const itemsEl = document.getElementById('sidebar-cart-items');
  const summaryEl = document.getElementById('sidebar-cart-summary');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty">Add items to get started</div>';
    summaryEl.style.display = 'none';
    return;
  }

  const subtotal = Cart.getTotal();
  let discount = 0;
  let offerNote = '';

  // Apply eligible offers
  const phone = localStorage.getItem('localbite_phone') || '';
  const streak = phone ? Loyalty.getConsecutiveDays(phone) : 0;
  for (const offer of activeOffers) {
    if (checkOfferConditions(offer, cart, subtotal, streak)) {
      const result = applyOfferReward(offer, cart, subtotal);
      discount += result.discount;
      if (result.note) offerNote = result.note;
    }
  }

  itemsEl.innerHTML = `<div class="cart-items">${cart.map(i => `
    <div class="cart-item">
      <span class="cart-item-name">${i.name}</span>
      <span class="cart-item-qty">×${i.qty}</span>
      <span class="cart-item-price">₹${i.price * i.qty}</span>
    </div>
  `).join('')}</div>`;

  document.getElementById('subtotal').textContent = `₹${subtotal}`;
  document.getElementById('total').textContent = `₹${subtotal + 30 - discount}`;
  document.getElementById('cart-offer-note').textContent = offerNote;
  summaryEl.style.display = '';
}

init();
