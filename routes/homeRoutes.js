// routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');


// Home route
router.get('/', homeController.renderHomePage);
router.get('/suggest', (req, res) => {
    res.render('events/suggest');  // Ensure you have a login.ejs file to render
  })
module.exports = router;
