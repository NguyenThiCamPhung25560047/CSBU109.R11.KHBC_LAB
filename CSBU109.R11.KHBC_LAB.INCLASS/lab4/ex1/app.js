const API_URL = 'http://localhost:5001/api/v1/products';

let editingId = null;
let allCategories = new Set();

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();

  document.getElementById('product-form').addEventListener('submit', handleAddProduct);
  document.getElementById('category-filter').addEventListener('change', (e) => {
    fetchProducts(e.target.value);
  });
});

function showError(message) {
  const errBox = document.getElementById('error-message');
  errBox.innerText = message;
  errBox.style.display = 'block';
}

function clearError() {
  const errBox = document.getElementById('error-message');
  errBox.style.display = 'none';
}

async function fetchProducts(category = 'All Categories') {
  clearError();
  try {
    let url = API_URL;
    if (category && category !== 'All Categories') {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const res = await fetch(url);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || 'Failed to fetch products');

    result.data.forEach(p => { if (p.category) allCategories.add(p.category); });
    updateCategoryDropdown();

    renderTable(result.data);
  } catch (err) {
    showError(`Error fetching products: ${err.message}`);
  }
}

function updateCategoryDropdown() {
  const select = document.getElementById('category-filter');
  const currentVal = select.value;
  select.innerHTML = '<option value="All Categories">All Categories</option>';
  allCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderTable(products) {
  const tbody = document.getElementById('product-list');
  tbody.innerHTML = '';

  products.forEach(p => {
    const tr = document.createElement('tr');

    if (editingId === p.id) {
      tr.innerHTML = `
        <td>${p.id}</td>
        <td><input type="text" id="edit-name-${p.id}" value="${p.name}"></td>
        <td><input type="number" id="edit-price-${p.id}" value="${p.price}"></td>
        <td><input type="text" id="edit-category-${p.id}" value="${p.category}"></td>
        <td>
          <button class="btn-save" onclick="saveEdit(${p.id})">Save</button>
          <button class="btn-cancel" onclick="cancelEdit()">Cancel</button>
        </td>
      `;
    } else {
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${Number(p.price).toLocaleString()} VND</td>
        <td>${p.category}</td>
        <td>
          <button class="btn-edit" onclick="startEdit(${p.id})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      `;
    }
    tbody.appendChild(tr);
  });
}

async function handleAddProduct(e) {
  e.preventDefault();
  clearError();

  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;
  const category = document.getElementById('category').value;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    document.getElementById('product-form').reset();
    fetchProducts(document.getElementById('category-filter').value);
  } catch (err) {
    showError(`Error adding product: ${err.message}`);
  }
}

function startEdit(id) {
  editingId = id;
  fetchProducts(document.getElementById('category-filter').value);
}

function cancelEdit() {
  editingId = null;
  fetchProducts(document.getElementById('category-filter').value);
}

async function saveEdit(id) {
  clearError();
  const name = document.getElementById(`edit-name-${id}`).value;
  const price = document.getElementById(`edit-price-${id}`).value;
  const category = document.getElementById(`edit-category-${id}`).value;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    editingId = null;
    fetchProducts(document.getElementById('category-filter').value);
  } catch (err) {
    showError(`Error updating product: ${err.message}`);
  }
}

async function deleteProduct(id) {
  clearError();
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    fetchProducts(document.getElementById('category-filter').value);
  } catch (err) {
    showError(`Error deleting product: ${err.message}`);
  }
}