const Category = require('../models/Category');
const Article = require('../models/Article');

// @desc Create a new category
// @route POST /api/categories
// @access Private/Admin
const createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      createdBy: req.user._id
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all categories
// @route GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: 'category',
          as: 'articles'
        }
      },
      {
        $addFields: {
          articleCount: { $size: '$articles' },
          id: '$_id' // Add id field just in case frontend needs it (mongoose adds it by default, aggregate doesn't)
        }
      },
      {
        $project: {
          articles: 0
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a category
// @route PUT /api/categories/:id
// @access Private/Admin
const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for duplicates
    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory._id.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    category.name = name;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a category
// @route DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is used in any article
    const articleCount = await Article.countDocuments({ category: req.params.id });
    if (articleCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is currently used in ${articleCount} article(s). Please re-categorize them first.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};
