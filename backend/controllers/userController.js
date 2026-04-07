const User = require('../models/User');
const Article = require('../models/Article');

// @desc Get user profile
// @route GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's own articles
    const myArticles = await Article.find({ author: user._id }).sort({ createdAt: -1 });

    // Get liked articles
    const likedArticles = await Article.find({ likes: user._id }).populate('author', 'name role').sort({ createdAt: -1 });

    // Get recently viewed articles
    const populatedUser = await User.findById(req.user._id)
      .populate({
        path: 'recentlyViewed.article',
        populate: { path: 'author', select: 'name role' }
      });
    
    const recentlyViewed = populatedUser.recentlyViewed.map(rv => rv.article).filter(a => a !== null);

    res.json({
      user,
      myArticles,
      likedArticles,
      recentlyViewed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Search users by name or username
// @route GET /api/users/search
const searchUsers = async (req, res) => {
  const { q } = req.query;
  const query = q || '';
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    // Add follows state to results
    const results = users.map(user => {
      const followers = user.followers || [];
      const following = user.following || [];
      const isFollowing = req.user ? followers.some(f => f.toString() === req.user._id.toString()) : false;
      const isFollowedBy = req.user ? following.some(f => f.toString() === req.user._id.toString()) : false;
      
      return {
        ...user._doc,
        isFollowing,
        isFollowedBy,
        isMutual: isFollowing && isFollowedBy,
        followersCount: followers.length,
        followingCount: following.length
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get dashboard statistics
// @route GET /api/users/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const authorId = new mongoose.Types.ObjectId(req.user._id);

    // Total articles created by this user
    const totalArticles = await Article.countDocuments({ author: req.user._id });

    // Total likes received across all articles by this user
    const stats = await Article.aggregate([
      { $match: { author: authorId } },
      { $project: { numLikes: { $size: { $ifNull: ["$likes", []] } } } },
      { $group: { _id: null, totalLikes: { $sum: "$numLikes" } } }
    ]);

    const totalLikes = stats.length > 0 ? stats[0].totalLikes : 0;

    res.json({
      totalArticles,
      totalLikes
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get admin dashboard statistics
// @route GET /api/users/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalLikes = await Article.aggregate([
      { $project: { numLikes: { $size: "$likes" } } },
      { $group: { _id: null, totalLikes: { $sum: "$numLikes" } } }
    ]);

    res.json({
      totalUsers,
      totalArticles,
      totalLikes: totalLikes.length > 0 ? totalLikes[0].totalLikes : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all users for management
// @route GET /api/users/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get public user profile
// @route GET /api/users/:id
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's own articles
    const articles = await Article.find({ author: user._id }).sort({ createdAt: -1 });

    const isFollowing = req.user ? (user.followers || []).some(f => f.toString() === req.user._id.toString()) : false;
    const isFollowedBy = req.user ? (user.following || []).some(f => f.toString() === req.user._id.toString()) : false;

    res.json({
      user,
      articles,
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length,
      isFollowing,
      isFollowedBy,
      isMutual: isFollowing && isFollowedBy
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Follow a user
// @route POST /api/users/follow/:id
const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following/followers
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Unfollow a user
// @route POST /api/users/unfollow/:id
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get followers
// @route GET /api/users/:id/followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name username');
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current user's followed users
// @route GET /api/users/following
const getMyFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name username role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get following
// @route GET /api/users/:id/following
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name username');
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a user
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete other admins' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  getDashboardStats,
  getAdminStats,
  getAllUsers,
  getPublicProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getMyFollowing,
  getFollowers,
  getFollowing,
  deleteUser
};
