const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const defaultData = {
  users: [],
  categories: [
    { id: 1, name: 'Beverage' },
    { id: 2, name: 'Food' },
    { id: 3, name: 'Fruit' }
  ],
  products: [
    { id: 1, categoryId: 1, name: 'Pepsi', quantity: 45, price: 15000 },
    { id: 2, categoryId: 2, name: 'Meat', quantity: 5, price: 50000 },
    { id: 3, categoryId: 2, name: 'Egg', quantity: 20, price: 3000 },
    { id: 4, categoryId: 1, name: 'CocaCola', quantity: 35, price: 15000 },
    { id: 5, categoryId: 1, name: 'Lavie', quantity: 150, price: 8000 },
    { id: 6, categoryId: 3, name: 'Apple', quantity: 50, price: 10000 },
    { id: 7, categoryId: 3, name: 'Banana', quantity: 30, price: 5000 }
  ]
};

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(defaultData));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map((item) => Number(item.id))) + 1 : 1;
}

module.exports = { readDB, writeDB, nextId };