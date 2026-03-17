// ===== CHECKOUT PAGE LOGIC =====
let activeOffers = [];
let finalDiscount = 0;
let finalTotal = 0;

async function init() {
  updateCartBadge();
  const cart = Cart.getCart();
  if (cart.length === 0) {
    window.location.href = '/';
    return;
  }
  await loadAreas();
  await loadOffers();
  renderSummary();
}

async function loadAreas() {
  try {
    const areas = await API.get('/areas');
    const sel = document.getElementById('customer-area');
    sel.innerHTML = '<option value="">Select your area</option>' +
      areas.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
  } catch (e) { console.error(e); }
}

async function loadOffers() {
  try {
    const restaurantId = Cart.getRestaurantId();
    if (!restaurantId) return;
    activeOffers = await API.get(`/offers?restaurantId=${restaurantId}`);

    // Display banners for all active offers
    const wrapper = document.getElementById('offer-banners-wrapper');
    if (wrapper && activeOffers.length > 0) {
      wrapper.innerHTML = `<div class="offer-banners">${activeOffers.map(renderOfferBanner).join('')}</div>`;
    }
  } catch (e) { /* silent */ }
}

function renderSummary() {
  const cart = Cart.getCart();
  const subtotal = Cart.getTotal();

  // Evaluate offers
  const phone = localStorage.getItem('localbite_phone') || '';
  const streak = phone ? Loyalty.getConsecutiveDays(phone) : 0;
  let totalDiscount = 0;
  let discountLabel = '';

  for (const offer of activeOffers) {
    if (checkOfferConditions(offer, cart, subtotal, streak)) {
      const result = applyOfferReward(offer, cart, subtotal);
      totalDiscount += result.discount;
      if (result.note && result.discount > 0) discountLabel = result.note;
    }
  }

  finalDiscount = totalDiscount;
  finalTotal = subtotal + 30 - finalDiscount;

  // Render items
  const itemsEl = document.getElementById('order-items');
  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-row" style="margin-bottom:0.5rem;">
      <span>${i.name} × ${i.qty}</span>
      <span>₹${i.price * i.qty}</span>
    </div>
  `).join('');

  document.getElementById('summary-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('summary-total').textContent = `₹${finalTotal}`;

  if (finalDiscount > 0 && discountLabel) {
    document.getElementById('discount-row').style.display = '';
    document.getElementById('discount-label').textContent = discountLabel;
    document.getElementById('discount-value').textContent = `-₹${finalDiscount}`;
  }
}

document.getElementById('checkout-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Placing order...';

  const cart = Cart.getCart();
  const restaurantId = Cart.getRestaurantId();
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const area = document.getElementById('customer-area').value;
  const address = document.getElementById('customer-address').value.trim();

  try {
    const order = await API.post('/orders', {
      customerName: name,
      phone,
      address,
      area,
      restaurantId,
      items: cart.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, qty: i.qty })),
      totalPrice: finalTotal,
      deliveryCharge: 30,
    });

    // Record for loyalty
    Loyalty.recordOrder(phone);
    localStorage.setItem('localbite_phone', phone);

    Cart.clearCart();
    showToast('Order placed successfully! 🎉', 'success');
    setTimeout(() => { window.location.href = `/tracking.html?orderId=${order._id}`; }, 1200);
  } catch (err) {
    showToast('Failed to place order. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Place Order 🎉';
  }
});

init();
