const express = require('express');
const router = express.Router();
const { getCustomerDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/customer', protect, getCustomerDashboardStats);

module.exports = router;
