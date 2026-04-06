const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config();

const defaultCategories = ['Tech', 'Lifestyle', 'Business', 'Education'];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected to seed categories.');

    try {
      const adminUser = await User.findOne({ role: 'admin' });
      const createdById = adminUser ? adminUser._id : null;

      const categoryMap = {};

      for (const name of defaultCategories) {
        let category = await Category.findOne({ name });
        if (!category) {
          category = await Category.create({ name, createdBy: createdById });
          console.log(`Created category: ${name}`);
        } else {
          console.log(`Category already exists: ${name}`);
        }
        categoryMap[name] = category._id;
      }
      
      const db = mongoose.connection.db;
      const articlesCollection = db.collection('articles');
      
      const articles = await articlesCollection.find({}).toArray();
      let updatedCount = 0;
      
      for (let article of articles) {
        if (typeof article.category === 'string') {
          let catName = article.category;
          
          if (!categoryMap[catName]) {
            let newCat = await Category.findOne({ name: catName });
            if (!newCat) {
              newCat = await Category.create({ name: catName, createdBy: createdById });
              console.log(`Created missing legacy category: ${catName}`);
            }
            categoryMap[catName] = newCat._id;
          }
          
          await articlesCollection.updateOne(
            { _id: article._id },
            { $set: { category: categoryMap[catName] } }
          );
          updatedCount++;
        }
      }
      
      console.log(`Updated ${updatedCount} articles with explicit category refs.`);
      console.log('Categories seeding complete.');
    } catch (e) {
      console.error(e);
    } finally {
      process.exit();
    }
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit();
  });
