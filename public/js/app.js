// ===== HOMEPAGE LOGIC =====
const EMOJI_MAP = {
  'Biryani & Rice': '🍛', 'Fast Food': '🍔', 'Odia Cuisine': '🍲',
  'North Indian': '🫕', 'Chinese & Momos': '🥟', 'South Indian': '🍜',
  'Multi-cuisine': '🍽️', 'Snacks': '🍟', 'Desserts': '🍨',
};

async function init() {
  updateCartBadge();
  await loadAreas();
  await loadRestaurants();
  await loadOffers();
}

async function loadAreas() {
  try {
    const areas = await API.get('/areas');
    const sel = document.getElementById('area-select');
    sel.innerHTML = '<option value="">Select your area</option>' +
      areas.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
    // Restore last selected
    const saved = localStorage.getItem('localbite_area');
    if (saved) sel.value = saved;
    sel.addEventListener('change', () => localStorage.setItem('localbite_area', sel.value));
  } catch (e) { console.error('Failed to load areas', e); }
}

async function loadRestaurants() {
  try {
    const restaurants = await API.get('/restaurants');
    const grid = document.getElementById('restaurants-grid');
    document.getElementById('restaurant-count').textContent = `${restaurants.length} restaurants found`;
    if (restaurants.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🏪</div><h3>No restaurants yet</h3><p>Check back soon!</p></div>`;
      return;
    }
    grid.innerHTML = restaurants.map(r => `
      <div class="restaurant-card" onclick="window.location='/restaurant.html?id=${r._id}'">
        <div class="restaurant-card-img">
          ${EMOJI_MAP[r.category] || '🍽️'}
          <span class="restaurant-badge ${r.isOpen ? '' : 'closed'}">${r.isOpen ? 'Open' : 'Closed'}</span>
        </div>
        <div class="restaurant-card-body">
          <h3>${r.name}</h3>
          <div class="restaurant-meta">
            <span><span class="star">★</span> ${r.rating}</span>
            <span>⏱ ${r.deliveryTime}</span>
            <span>📍 ${r.area}</span>
          </div>
          <span class="restaurant-category">${r.category}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('restaurants-grid').innerHTML = `<p style="color:var(--primary)">Failed to load restaurants. Is the server running?</p>`;
  }
}

async function loadOffers() {
  try {
    const offers = await API.get('/offers');
    const wrapper = document.getElementById('offer-banners-wrapper');
    if (!wrapper || offers.length === 0) return;

    const phone = localStorage.getItem('localbite_phone') || '';
    const streak = phone ? Loyalty.getConsecutiveDays(phone) : 0;

    const banners = [];
    for (const offer of offers) {
      const applicable = checkOfferConditions(offer, [], 0, streak);
      if (applicable) {
        banners.push(renderOfferBanner(offer));
      }
    }
    if (banners.length > 0) {
      wrapper.innerHTML = `<div class="offer-banners">${banners.join('')}</div>`;
    }
  } catch (e) { /* silently fail */ }
}

init();
