const express = require('express');
const chatbotController = require('../controllers/chatbotController');

const router = express.Router();

// Dialogflow webhook endpoint
router.post('/webhook', chatbotController.bookTicket);

module.exports = router;