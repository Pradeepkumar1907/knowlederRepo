const Article = require('../models/Article');
const Collection = require('../models/Collection');

// @desc Get customer dashboard stats
// @route GET /api/dashboard/customer
const getCustomerDashboardStats = async (req, res) => {
  try {
    const viewsCount = await Article.countDocuments({
      views: req.user._id
    });

    const likesCount = await Article.countDocuments({
      likes: req.user._id
    });

    const collections = await Collection.find({ user: req.user._id });
    let bookmarksCount = 0;
    collections.forEach(c => {
      bookmarksCount += c.articles.length;
    });

    res.json({
      viewsCount,
      likesCount,
      bookmarksCount
    });
  } catch (error) {
    console.error('Error in getCustomerDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomerDashboardStats
};
