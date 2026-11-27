require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function seedData() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_lab5_db';
  await mongoose.connect(uri);
  console.log('[Seed] Connected to MongoDB');

  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log('[Seed] Cleared existing products and categories');

  // Categories
  const beverage = await Category.create({ name: 'Beverage' });
  const fruit = await Category.create({ name: 'Fruit' });
  const food = await Category.create({ name: 'Food' });

  // Products - matching exact Lab 5 PDF screenshot values:
  const products = [
    // Beverage: 3 products, 230 qty, 2,400,000 stockValue
    { name: 'Pepsi', categoryId: beverage._id, quantity: 100, price: 10000, status: 'active' },
    { name: 'CocaCola', categoryId: beverage._id, quantity: 80, price: 12000, status: 'active' },
    { name: 'Lavie', categoryId: beverage._id, quantity: 50, price: 8800, status: 'active' },

    // Fruit: 3 products, 82 qty, 655,099 stockValue
    { name: 'Apple', categoryId: fruit._id, quantity: 50, price: 10000, status: 'active' },
    { name: 'Banana', categoryId: fruit._id, quantity: 32, price: 4846.84375, status: 'active' },
    { name: 'Update product', categoryId: fruit._id, quantity: 0, price: 99, status: 'active' },

    // Food: 2 products, 25 qty, 310,000 stockValue
    { name: 'Meat', categoryId: food._id, quantity: 5, price: 50000, status: 'active' },
    { name: 'Egg', categoryId: food._id, quantity: 20, price: 3000, status: 'active' }
  ];

  await Product.insertMany(products);
  console.log('[Seed] Successfully seeded demo data matching Lab 5 specification!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = seedData;
