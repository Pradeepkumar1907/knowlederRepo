const express = require('express');
const router = express.Router();
const { createOrGetChat, getUserChats, sendArticleToChat } = require('../controllers/chatController');
const { deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:userId', protect, createOrGetChat);
router.post('/send', protect, sendArticleToChat);
router.get('/', protect, getUserChats);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
