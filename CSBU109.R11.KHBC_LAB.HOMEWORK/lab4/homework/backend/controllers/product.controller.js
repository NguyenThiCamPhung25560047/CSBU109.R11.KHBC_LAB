const { readDB, writeDB, nextId } = require('../data/store');

exports.getProducts = (req, res) => {
  const { categoryId } = req.query;
  const db = readDB();
  let products = db.products;

  if (categoryId) {
    products = products.filter((p) => Number(p.categoryId) === Number(categoryId));
  }

  res.status(200).json({ success: true, data: products });
};

exports.createProduct = (req, res) => {
  const { name, categoryId, quantity, price } = req.body || {};
  if (!name || !categoryId || quantity === undefined || price === undefined) {
    return res.status(400).json({ success: false, message: 'All product fields are required' });
  }

  const db = readDB();
  const categoryExists = db.categories.some((c) => Number(c.id) === Number(categoryId));
  if (!categoryExists) {
    return res.status(400).json({ success: false, message: 'Invalid categoryId' });
  }

  const newProduct = {
    id: nextId(db.products),
    categoryId: Number(categoryId),
    name: name.trim(),
    quantity: Number(quantity),
    price: Number(price)
  };

  db.products.push(newProduct);
  writeDB(db);

  res.status(201).json({ success: true, data: newProduct });
};

exports.updateProduct = (req, res) => {
  const id = Number(req.params.id);
  const { name, categoryId, quantity, price } = req.body || {};

  const db = readDB();
  const product = db.products.find((p) => Number(p.id) === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (categoryId !== undefined) {
    const categoryExists = db.categories.some((c) => Number(c.id) === Number(categoryId));
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Invalid categoryId' });
    }
    product.categoryId = Number(categoryId);
  }

  if (name !== undefined && name.trim() !== '') product.name = name.trim();
  if (quantity !== undefined) product.quantity = Number(quantity);
  if (price !== undefined) product.price = Number(price);

  writeDB(db);
  res.status(200).json({ success: true, data: product });
};

exports.deleteProduct = (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const index = db.products.findIndex((p) => Number(p.id) === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  db.products.splice(index, 1);
  writeDB(db);

  res.status(200).json({ success: true, message: 'Product deleted' });
};