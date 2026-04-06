const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
