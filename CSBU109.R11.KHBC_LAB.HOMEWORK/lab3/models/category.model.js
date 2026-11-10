// Mongoose schema definition for Category
const mongoose = require('mongoose');

// Helper to convert category name into slug (e.g. "Home & Living" -> "home-living")
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    minlength: [3, 'Category name must be at least 3 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Auto-generate slug from name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  if (typeof next === 'function') next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
module.exports.slugify = slugify;