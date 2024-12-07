const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const bookingController = require('../controllers/bookingController');

// Middleware to check admin session
function checkAdminSession(req, res, next) {
    console.log('Session data:', req.session); // Debug log
    if (!req.session.admin) {
      return res.redirect('/login');
    }
    next();
  }

// Admin profile routes
router.get('/admin/:adminId/profile',checkAdminSession, profileController.getProfile);  // Dynamically use adminId
router.post('/admin/:adminId/profile',checkAdminSession, profileController.updateProfile);  // Dynamically use adminId
router.get('/admin/:adminId/bookingDetails',checkAdminSession, bookingController.getBookingDetails);

module.exports = router;
