const Collection = require('../models/Collection');

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
const createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const collection = await Collection.create({
      name,
      user: req.user._id,
      articles: []
    });

    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get my collections
// @route   GET /api/collections
// @access  Private
const getMyCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single collection with articles
// @route   GET /api/collections/:id
// @access  Private
const getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id })
      .populate({
        path: 'articles',
        populate: {
          path: 'author',
          select: 'name email profilePicture'
        }
      });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add article to collection
// @route   POST /api/collections/:id/add
// @access  Private
const addArticleToCollection = async (req, res) => {
  try {
    const { articleId } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Check if article already exists in collection
    if (collection.articles.includes(articleId)) {
      return res.status(400).json({ message: 'Article already exists in this collection' });
    }

    collection.articles.push(articleId);
    await collection.save();

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Remove article from collection
// @route   POST /api/collections/:id/remove
// @access  Private
const removeArticleFromCollection = async (req, res) => {
  try {
    const { articleId } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.articles = collection.articles.filter(
      (id) => id.toString() !== articleId.toString()
    );

    await collection.save();

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await collection.deleteOne();
    res.json({ message: 'Collection removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createCollection,
  getMyCollections,
  getCollection,
  addArticleToCollection,
  removeArticleFromCollection,
  deleteCollection
};
