const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
  getMyArticles,
  addComment,
  getComments
} = require('../controllers/articleController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

router.get('/', getArticles);
router.get('/my', protect, getMyArticles);
router.get('/:id', optionalProtect, getArticleById);
router.post('/', protect, authorize('staff', 'admin'), createArticle);
router.put('/:id', protect, authorize('staff', 'admin'), updateArticle);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteArticle);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
