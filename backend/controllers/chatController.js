const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc Create or get chat between logged-in user and another user
// @route POST /api/chat/:userId
const createOrGetChat = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Validate if we can chat (Follow condition)
    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userId);
    const isFollowedBy = currentUser.followers.includes(userId);

    // Criteria: Current user follows target OR Mutual follow
    if (!isFollowing && !isFollowedBy) {
      return res.status(403).json({ message: 'You can only chat with users you follow or who follow you' });
    }

    // 2. Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', 'name username role');

    if (chat) {
      return res.json(chat);
    }

    // 3. Create new chat
    chat = await Chat.create({
      participants: [req.user._id, userId],
      lastMessage: ''
    });

    chat = await Chat.findById(chat._id).populate('participants', 'name username role');
    res.status(201).json(chat);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all chats for logged-in user
// @route GET /api/chat
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] }
    })
    .populate('participants', 'name username role')
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrGetChat, getUserChats };
