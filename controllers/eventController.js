const { render } = require('ejs');
const eventModel = require('../models/eventModel');
const Admin = require('../models/adminModel');



  exports.createEvent = async (req, res) => {
    try {
  console.log("hi");
      if (!req.session.admin) {
        return res.redirect('/login'); // Redirect to login if no session
      }
     
     
      const { eventName, eventDate, eventTime, capacity, duration, eventPrice,  eventDescription } = req.body;
      if (!eventName || !eventDate || !eventTime || !capacity || !duration || !eventPrice || !eventDescription) {
        return res.status(400).send('All fields are required.');
      }
      

    console.log('Request body:', req.body);

      console.log(req.session.admin.adminId);
      const newEvent = await eventModel.createEvent(eventName, eventDate, eventTime, capacity,duration,  eventPrice,   eventDescription,req.session.admin.adminId);
      console.log('Event created:', newEvent);
    
  

  //  const adminId=req.session.admin.adminId; 
  //  const admin=await Admin.getAdminById(adminId);
  //  console.log(admin);
   
  

  res.redirect('/events/eventManage');
  

//   res.redirect(`/events/${newEvent._id}/manageEvent`);

      
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).send('Internal Server Error');
    }
  };



exports.manageEvent = async (req, res) => {
    try {
  console.log("i have eneterd in manage event");
  console.log('Admin session:',req.session.admin)
   
  if (!req.session || !req.session.admin) {
    console.error('Admin session not found.');
    return res.redirect('/login'); // Redirect to login if no session
  }
      const events = await eventModel.getAllEvents();
     
    
  
      res.render('events/eventManage', { admin: req.session.admin, events });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).send('Internal Server Error');
    }
  };


  exports.deleteEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      if (!req.session.admin) {
        return res.redirect('/login'); // Redirect if admin is not logged in
      }
  
      await eventModel.deleteEvent(eventId); // Call model function to delete the event
      console.log(`Event with ID ${eventId} deleted successfully.`);
      res.redirect('/events/eventManage'); // Redirect back to the management page
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  exports.getUpdateEventPage = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      if (!req.session.admin) {
        return res.redirect('/login'); // Redirect to login if no session
      }
  
      const event = await eventModel.getEventById(eventId); // Fetch event details
      if (!event) {
        return res.status(404).send('Event not found.');
      }
  
      res.render('events/updateEvent', { admin: req.session.admin, event });
    } catch (error) {
      console.error('Error fetching event for update:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  

  exports.updateEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
  
      if (!req.session.admin) {
        return res.redirect('/login'); // Redirect if admin is not logged in
      }
  
      const { eventName, eventDate, eventTime, capacity, duration, eventPrice, eventDescription } = req.body;
  
      if (!eventName || !eventDate || !eventTime || !capacity || !duration || !eventPrice || !eventDescription) {
        return res.status(400).send('All fields are required.');
      }
  
      // Update the event in the database
      await eventModel.updateEvent(eventId, {
        eventName,
        eventDate: new Date(eventDate),
        eventTime,
        capacity,
        duration,
        eventPrice,
        eventDescription,
      });
  
      console.log(`Event with ID ${eventId} updated successfully.`);
      res.redirect('/events/eventManage');
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).send('Internal Server Error');
    }
  };