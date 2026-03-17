// ===== OFFERS ENGINE =====
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Check if an offer's conditions are met.
 * @param {Object} offer
 * @param {Array} cartItems - [{menuItemId, qty, price}]
 * @param {number} cartSubtotal
 * @param {number} consecutiveDays
 * @returns {boolean}
 */
function checkOfferConditions(offer, cartItems = [], cartSubtotal = 0, consecutiveDays = 0) {
  const cond = offer.conditions || {};
  const today = new Date().getDay();

  // Day of week check
  if (cond.daysOfWeek && cond.daysOfWeek.length > 0) {
    if (!cond.daysOfWeek.includes(today)) return false;
  }

  // Min order amount
  if (cond.minOrderAmount && cartSubtotal < cond.minOrderAmount) return false;

  // Consecutive days
  if (cond.requiredConsecutiveDays && consecutiveDays < cond.requiredConsecutiveDays) return false;

  // Applicable items
  if (cond.applicableItemIds && cond.applicableItemIds.length > 0) {
    const hasItem = cartItems.some(i => cond.applicableItemIds.includes(i.menuItemId));
    if (!hasItem) return false;
  }

  // Min item qty
  if (cond.minItemQty && cond.applicableItemIds && cond.applicableItemIds.length > 0) {
    const totalQty = cartItems
      .filter(i => cond.applicableItemIds.includes(i.menuItemId))
      .reduce((s, i) => s + i.qty, 0);
    if (totalQty < cond.minItemQty) return false;
  }

  return true;
}

/**
 * Apply offer reward to cart.
 * Returns { discount, note, cartItems (modified) }
 */
function applyOfferReward(offer, cartItems, cartSubtotal) {
  const reward = offer.reward;
  let discount = 0;
  let note = '';
  const modifiedItems = cartItems.map(i => ({ ...i }));

  switch (reward.type) {
    case 'fixed_price':
      if (offer.conditions.applicableItemIds && offer.conditions.applicableItemIds.length > 0) {
        modifiedItems.forEach(item => {
          if (offer.conditions.applicableItemIds.includes(item.menuItemId)) {
            const saving = (item.price - reward.fixedPrice) * item.qty;
            if (saving > 0) {
              item.offerPrice = reward.fixedPrice;
              discount += saving;
            }
          }
        });
        note = `${offer.title}: Special price ₹${reward.fixedPrice} applied`;
      }
      break;
    case 'percentage_off':
      discount = Math.round(cartSubtotal * (reward.percentageOff / 100));
      note = `${offer.title}: ${reward.percentageOff}% off applied (-₹${discount})`;
      break;
    case 'flat_off':
      discount = Math.min(reward.flatOff, cartSubtotal);
      note = `${offer.title}: ₹${discount} off applied`;
      break;
    case 'free_item':
      note = `🎁 ${offer.title}: Free ${reward.freeItemName}! Show this to the delivery agent.`;
      break;
    case 'custom_message':
      note = `🎉 ${offer.title}: ${reward.customMessage}`;
      break;
  }

  return { discount, note, modifiedItems };
}

/**
 * Render a colored offer banner HTML string.
 */
function renderOfferBanner(offer) {
  const color = offer.badgeColor || '#e63946';
  const icons = { fixed_price: '💰', percentage_off: '🏷️', flat_off: '✂️', free_item: '🎁', custom_message: '🎉' };
  const icon = icons[offer.reward?.type] || '🎉';
  return `
    <div class="offer-banner" style="background:${color}22;border:1px solid ${color}55;color:var(--text);">
      <span class="offer-icon">${icon}</span>
      <div>
        <strong style="color:${color}">${offer.title}</strong>
        ${offer.description ? `<span style="color:var(--text-muted);margin-left:0.5rem;font-size:0.82rem;">${offer.description}</span>` : ''}
      </div>
    </div>
  `;
}
