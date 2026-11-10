// Validation middleware for Category requests
const validateCategory = (req, res, next) => {
  const { name } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Category name cannot be empty'
    });
  }

  if (name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Category name must be at least 3 characters'
    });
  }

  next();
};

const validateCategoryPatch = (req, res, next) => {
  if (req.body && req.body.name !== undefined) {
    const { name } = req.body;
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category name cannot be empty'
      });
    }
    if (name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Category name must be at least 3 characters'
      });
    }
  }

  next();
};

module.exports = {
  validateCategory,
  validateCategoryPatch
};