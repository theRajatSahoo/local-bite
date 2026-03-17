const API = {
  base: '/api',

  getToken() {
    return localStorage.getItem('token');
  },

  getHeaders(isJson = false) {
    const token = this.getToken();

    return {
      ...(isJson && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    };
  },

  async handleResponse(res) {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'API Error');
    }
    return res.json();
  },

  async get(path) {
    const res = await fetch(this.base + path, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  },

  async put(path, body) {
    const res = await fetch(this.base + path, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  },

  async patch(path, body = {}) {
    const res = await fetch(this.base + path, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  },

  async delete(path) {
    const res = await fetch(this.base + path, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  },
};

// Cart badge updater
window.updateCartBadge = function () {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
};