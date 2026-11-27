const { readDB, writeDB, nextId } = require('../data/store');

exports.getCategories = (req, res) => {
  const db = readDB();
  res.status(200).json({ success: true, data: db.categories });
};

exports.createCategory = (req, res) => {
  const { name } = req.body || {};
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const db = readDB();
  const exists = db.categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: 'Category already exists' });
  }

  const newCategory = { id: nextId(db.categories), name: name.trim() };
  db.categories.push(newCategory);
  writeDB(db);

  res.status(201).json({ success: true, data: newCategory });
};

exports.updateCategory = (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const db = readDB();
  const category = db.categories.find((c) => Number(c.id) === id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const duplicate = db.categories.some((c) => Number(c.id) !== id && c.name.toLowerCase() === name.trim().toLowerCase());
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'Category name already exists' });
  }

  category.name = name.trim();
  writeDB(db);

  res.status(200).json({ success: true, data: category });
};

exports.deleteCategory = (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const index = db.categories.findIndex((c) => Number(c.id) === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const inUse = db.products.some((p) => Number(p.categoryId) === id);
  if (inUse) {
    return res.status(400).json({ success: false, message: 'Cannot delete category that still has products' });
  }

  db.categories.splice(index, 1);
  writeDB(db);

  res.status(200).json({ success: true, message: 'Category deleted' });
};