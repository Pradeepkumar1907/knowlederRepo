const express = require('express');
const router = express.Router();
const { createOrGetChat, getUserChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:userId', protect, createOrGetChat);
router.get('/', protect, getUserChats);

module.exports = router;
