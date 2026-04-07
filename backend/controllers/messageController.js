const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc Send a message
// @route POST /api/message
const sendMessage = async (req, res) => {
  const { chatId, text, articleId } = req.body;

  try {
    const message = await Message.create({
      chatId,
      sender: req.user._id,
      text,
      article: articleId || null
    });

    // Update chat lastMessage and updatedAt
    const lastMsgText = articleId ? 'Shared an article' : text;
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: lastMsgText,
      updatedAt: Date.now()
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get messages for a specific chat
// @route GET /api/message/:chatId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId
    })
    .populate('article', 'title category')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a message (mark as deleted)
// @route DELETE /api/chat/:messageId
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.deleted = true;
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, deleteMessage };
