const TOKEN_KEY = 'bb24_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  products: (params = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    const s = qs.toString();
    return request('/products' + (s ? `?${s}` : ''));
  },
  product: (slug) => request(`/products/${slug}`),
  categories: () => request('/categories'),
  register: (d) => request('/auth/register', { method: 'POST', body: d }),
  login: (d) => request('/auth/login', { method: 'POST', body: d }),
  me: () => request('/auth/me'),
  addReview: (d) => request('/reviews', { method: 'POST', body: d }),
  checkout: (d) => request('/orders/checkout', { method: 'POST', body: d }),
  orders: () => request('/orders'),
  order: (id) => request(`/orders/${id}`),
  newsletter: (email) => request('/newsletter', { method: 'POST', body: { email } }),
  // admin
  adminStats: () => request('/admin/stats'),
  adminProducts: () => request('/admin/products'),
  adminCreateProduct: (d) => request('/admin/products', { method: 'POST', body: d }),
  adminUpdateProduct: (id, d) => request(`/admin/products/${id}`, { method: 'PUT', body: d }),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  adminOrders: () => request('/admin/orders'),
  adminOrderStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const money = (cents) =>
  '$' + (cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
