const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');
const Comment = require('./models/Comment');

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/know_repo');
    console.log('Connected to MongoDB');

    const articles = await Article.find({});
    let totalMigrated = 0;

    for (const article of articles) {
      if (article.comments && article.comments.length > 0) {
        for (const oldComment of article.comments) {
          await Comment.create({
            article: article._id,
            author: oldComment.user,
            text: oldComment.text,
            createdAt: oldComment.createdAt,
            parent: null
          });
          totalMigrated++;
        }
      }
    }

    console.log(`Successfully migrated ${totalMigrated} comments.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
