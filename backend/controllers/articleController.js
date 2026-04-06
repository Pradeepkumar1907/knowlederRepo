const Article = require('../models/Article');
const User = require('../models/User');

// @desc Get all articles with search and filtering
// @route GET /api/articles
const getArticles = async (req, res) => {
  const { search, category } = req.query;
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  try {
    const articles = await Article.find(query)
      .populate('author', 'name role')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single article
// @route GET /api/articles/:id
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name role')
      .populate('category', 'name');
    if (article) {
      // Record view if user is logged in
      if (req.user) {
        const user = await User.findById(req.user._id);
        if (user) {
          // Initialize if it doesn't exist
          if (!user.recentlyViewed) {
            user.recentlyViewed = [];
          }

          // Remove if already exists to update timestamp and position
          user.recentlyViewed = user.recentlyViewed.filter(
            v => v.article && v.article.toString() !== article._id.toString()
          );
          
          // Add to beginning
          user.recentlyViewed.unshift({ article: article._id, viewedAt: Date.now() });
          
          // Limit to 10
          if (user.recentlyViewed.length > 10) {
            user.recentlyViewed = user.recentlyViewed.slice(0, 10);
          }
          
          await user.save();
        }
        
        // Add user to views (avoid duplicate)
        if (!article.views.includes(req.user._id)) {
          article.views.push(req.user._id);
          await article.save();
        }
      }
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new article
// @route POST /api/articles
const createArticle = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const article = await Article.create({
      title,
      content,
      category,
      author: req.user._id
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update an article
// @route PUT /api/articles/:id
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    const { title, content, category } = req.body;
    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete an article
// @route DELETE /api/articles/:id
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await article.deleteOne();
    res.json({ message: 'Article removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Like/Unlike an article
// @route POST /api/articles/:id/like
const toggleLike = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const isLiked = article.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      article.likes = article.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      article.likes.push(req.user._id);
    }

    await article.save();
    res.json({ likes: article.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current user articles
// @route GET /api/articles/my
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .populate('author', 'name role')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error('Error in getMyArticles:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Add comment to an article
// @route POST /api/articles/:id/comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.comments.push({
      user: req.user._id,
      text: text
    });

    await article.save();

    // Re-populate and return the comments
    const updatedArticle = await Article.findById(req.params.id)
      .populate('comments.user', 'name');

    res.status(201).json(updatedArticle.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get comments for an article
// @route GET /api/articles/:id/comments
const getComments = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('comments.user', 'name');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
  getMyArticles,
  addComment,
  getComments
};
