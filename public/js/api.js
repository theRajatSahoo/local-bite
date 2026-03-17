const API = {
  base: '/api',

  getToken() {
    return localStorage.getItem('token');
  },

  async get(path) {
    const res = await fetch(this.base + path, {
      headers: {
        Authorization: this.getToken()
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken()
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async put(path, body) {
    const res = await fetch(this.base + path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken()
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(path, body = {}) {
    const res = await fetch(this.base + path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken()
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(path) {
    const res = await fetch(this.base + path, {
      method: 'DELETE',
      headers: {
        Authorization: this.getToken()
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
window.updateCartBadge = function () {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
};