const express = require('express');
const router = express.Router();
const {
  createCollection,
  getMyCollections,
  getCollection,
  addArticleToCollection,
  removeArticleFromCollection,
  deleteCollection
} = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createCollection)
  .get(protect, getMyCollections);

router.route('/:id')
  .get(protect, getCollection)
  .delete(protect, deleteCollection);

router.post('/:id/add', protect, addArticleToCollection);
router.post('/:id/remove', protect, removeArticleFromCollection);

module.exports = router;
