const { readDB, writeDB, nextId } = require('../data/store');
const { getIO, PRODUCTS_ROOM } = require('../socket');

exports.getProducts = (req, res) => {
  const db = readDB();
  let products = db.products || [];
  if (req.query.categoryId) {
    products = products.filter((p) => String(p.categoryId) === String(req.query.categoryId));
  }
  res.status(200).json({ success: true, data: products });
};

exports.createProduct = (req, res) => {
  const db = readDB();
  const { name, categoryId, quantity, price } = req.body || {};

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  const newProduct = {
    id: nextId(db.products),
    name: name.trim(),
    categoryId: Number(categoryId) || categoryId,
    quantity: Number(quantity) || 0,
    price: Number(price)
  };

  db.products.push(newProduct);
  writeDB(db);

  res.status(201).json({ success: true, data: newProduct });
};

exports.updateProduct = (req, res) => {
  const db = readDB();
  const index = db.products.findIndex((p) => String(p.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const updatedProduct = {
    ...db.products[index],
    ...req.body,
    id: db.products[index].id,
    categoryId: req.body.categoryId !== undefined ? (Number(req.body.categoryId) || req.body.categoryId) : db.products[index].categoryId,
    quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : db.products[index].quantity,
    price: req.body.price !== undefined ? Number(req.body.price) : db.products[index].price
  };

  db.products[index] = updatedProduct;
  writeDB(db);

  // Push the new data to everyone currently on the Products page
  const io = req.app.get('io') || getIO();
  io.to(PRODUCTS_ROOM || 'products').emit('productUpdated', {
    product: updatedProduct,
    updatedBy: req.user.id
  });

  res.status(200).json({ success: true, data: updatedProduct });
};

exports.deleteProduct = (req, res) => {
  const db = readDB();
  const index = db.products.findIndex((p) => String(p.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const deleted = db.products[index];
  db.products.splice(index, 1);
  writeDB(db);

  res.status(200).json({ success: true, data: deleted });
};
