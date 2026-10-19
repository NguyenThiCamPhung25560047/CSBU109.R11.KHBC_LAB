const BASE_URL = 'https://dummyjson.com';

// GET /products?limit=12&skip=0
export async function getProducts(limit = 12, skip = 0, signal) {
  const res = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// GET /products/{id}
export async function getProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}