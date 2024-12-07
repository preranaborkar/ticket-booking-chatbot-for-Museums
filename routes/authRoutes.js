// loginRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();



router.get('/register', (req, res) => {
    res.render('auth/register'); // Render the register page (register.ejs)
  });
  router.post('/register', authController.registerUser);

// Render login page
router.get('/login', (req, res) => {
  res.render('auth/login');  // Ensure you have a login.ejs file to render
})

// Handle login form submission
router.post('/login', authController.loginUser);

module.exports = router;
