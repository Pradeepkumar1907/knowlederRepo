const express = require('express');
const router = express.Router();
const { 
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
  getFollowing
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.get('/dashboard', protect, getDashboardStats);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), require('../controllers/userController').deleteUser);

// Following system
router.get('/search', protect, searchUsers);
router.get('/following', protect, getMyFollowing);
router.get('/:id', protect, getPublicProfile);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

module.exports = router;
