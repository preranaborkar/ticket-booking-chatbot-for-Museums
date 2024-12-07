const { getAllEvents } = require('../models/eventModel'); 

exports.renderHomePage = async (req, res) => {
    try {
        const events = await getAllEvents(); // Fetch all events from the database
        console.log('Fetched events:', events);
        res.render('home', { events }); // Pass events data to the template
    } catch (error) {
        console.error('Error fetching events:', error.message);
        res.status(500).send('An error occurred while loading events.');
    }
};