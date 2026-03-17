// ===== ORDER TRACKING PAGE =====
const STATUS_ORDER = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
const STATUS_EMOJI = { 'Placed': '📋', 'Preparing': '👨‍🍳', 'Out for Delivery': '🛵', 'Delivered': '✅' };
const STATUS_SUBTITLE = {
  'Placed': 'Your order has been received. The restaurant will start preparing soon.',
  'Preparing': 'The chef is cooking your meal right now.',
  'Out for Delivery': 'Your order is on its way! 🛵',
  'Delivered': 'Your order has been delivered. Enjoy your meal! 🎉',
};

const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');

if (!orderId) window.location.href = '/';

let pollInterval = null;

async function loadOrder() {
  try {
    const order = await API.get(`/orders/${orderId}`);
    renderOrder(order);
    if (order.status === 'Delivered') {
      clearInterval(pollInterval);
    }
  } catch (e) {
    document.getElementById('current-status').textContent = 'Order not found';
  }
}

function renderOrder(order) {
  document.getElementById('order-id-display').textContent = `Order ID: ${order._id}`;
  document.getElementById('current-status').textContent = order.status;
  document.getElementById('status-emoji').textContent = STATUS_EMOJI[order.status] || '⏳';
  document.getElementById('status-subtitle').textContent = STATUS_SUBTITLE[order.status] || '';

  // Update steps
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  document.querySelectorAll('.status-step').forEach((step, idx) => {
    step.classList.remove('done', 'current');
    if (idx < currentIdx) step.classList.add('done');
    else if (idx === currentIdx) step.classList.add('current');
  });

  // Order details
  const restaurant = order.restaurantId?.name || 'Restaurant';
  const itemsHtml = order.items.map(i => `<div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span>${i.name} × ${i.qty}</span><span>₹${i.price * i.qty}</span></div>`).join('');
  document.getElementById('order-details').innerHTML = `
    <div style="margin-bottom:0.5rem;"><strong style="color:var(--text);">${restaurant}</strong></div>
    <div>${itemsHtml}</div>
    <hr style="border-color:var(--border);margin:0.75rem 0;" />
    <div style="display:flex;justify-content:space-between;"><span>Delivery Charge</span><span>₹${order.deliveryCharge}</span></div>
    <div style="display:flex;justify-content:space-between;font-weight:700;color:var(--text);margin-top:0.3rem;"><span>Total</span><span>₹${order.totalPrice}</span></div>
    <div style="margin-top:0.75rem;">📍 ${order.area} — ${order.address}</div>
    <div>📞 ${order.phone}</div>
  `;
}

// Poll every 10 seconds
loadOrder();
pollInterval = setInterval(loadOrder, 10000);
