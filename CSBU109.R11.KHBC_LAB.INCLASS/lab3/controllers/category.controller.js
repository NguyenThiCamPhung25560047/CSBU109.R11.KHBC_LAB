// Request handlers for Category API
const Category = require('../models/category.model');
const { slugify } = require('../models/category.model');

// 1. GET /api/categories - List categories with pagination and sorting
exports.getAllCategories = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const skip = (page - 1) * limit;

    let sort = { createdAt: -1 };
    if (req.query.sort) {
      const sortField = req.query.sort.trim();
      if (sortField.startsWith('-')) {
        sort = { [sortField.substring(1)]: -1 };
      } else {
        sort = { [sortField]: 1 };
      }
    }

    const totalCategories = await Category.countDocuments();
    const categories = await Category.find()
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        totalCategories
      },
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/categories/:id - Retrieve category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'No category found with the given ID'
      });
    }
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/categories - Create category (slug is auto-generated)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newCategory = await Category.create({ name, description });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
};

// 4. PATCH /api/categories/:id - Partial update (re-generates slug if name changes)
exports.updateCategory = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Regenerate slug because Mongoose pre('save') does not fire on findByIdAndUpdate
    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'No category found to update'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

// 5. PUT /api/categories/:id - Full update
exports.replaceCategory = async (req, res, next) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description || ''
    };

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'No category found to update'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE /api/categories/:id - Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'No category found to delete'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};