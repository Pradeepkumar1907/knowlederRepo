const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc Send a message
// @route POST /api/message
const sendMessage = async (req, res) => {
  const { chatId, text } = req.body;

  try {
    const message = await Message.create({
      chatId,
      sender: req.user._id,
      text
    });

    // Update chat lastMessage and updatedAt
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
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
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages };
