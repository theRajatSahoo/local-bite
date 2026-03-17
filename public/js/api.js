const API = {
  base: '/api',

  getToken() {
    return localStorage.getItem("token");
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();

    const res = await fetch(this.base + endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Auto-redirect to login on auth failure
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/admin/login.html";
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Request failed");
    }

    return res.json();
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};