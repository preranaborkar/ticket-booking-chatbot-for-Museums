
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');


// Middleware to check admin session
function checkAdminSession(req, res, next) {
  console.log('Session data:', req.session); // Debug log
  if (!req.session.admin) {
    return res.redirect('/login');
  }
  next();
}

router.get('/events/createEvent',checkAdminSession, (req, res) => {
    res.render('events/createEvent'); 
  });
  router.post('/events/createEvent', checkAdminSession,eventController.createEvent);


  router.get('/events/eventManage', checkAdminSession, eventController.manageEvent);
  router.post('/events/eventManage', checkAdminSession, eventController.manageEvent, eventController.createEvent);


 router.post('/events/delete/:id', checkAdminSession, eventController.deleteEvent);


 router.get('/events/update/:id', checkAdminSession, eventController.getUpdateEventPage);
router.post('/events/update/:id', checkAdminSession, eventController.updateEvent);

module.exports = router;