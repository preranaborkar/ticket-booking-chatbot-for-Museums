const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, required: true },
    capacity: { type: Number, required: true },
    duration: { type: String, required: true },
    eventPrice: { type: Number, required: true },
    eventImage: { type: String, required: false }, // Assuming you store the image URL/path
    eventDescription: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }, // Reference to admin who created event
    createdAt: { type: Date, default: Date.now }
  });

  
  const Event = mongoose.model('Event', eventSchema);


  
const getEventById = async (eventId) => {
  try {
    return await Event.findById(eventId);
  } catch (error) {
    throw new Error('Error fetching event by ID: ' + error.message);
  }
};

const getEventByName = async (eventName) => {
  try {
    return await Event.findOne({ eventName: eventName }); // Searches by the eventName field
  } catch (error) {
    throw new Error('Error fetching event by name: ' + error.message);
  }
};


const getAllEvents = async () => {
  try {
    return await Event.find().populate('createdBy'); // Optional: Populate admin details
  } catch (error) {
    throw new Error('Error fetching events: ' + error.message);
  }
};


const createEvent = async (eventName, eventDate, eventTime, capacity, duration, eventPrice,  eventDescription,createdBy) => {
  const newEvent = new Event({
    eventName, eventDate, eventTime, capacity, duration, eventPrice,  eventDescription,createdBy
  });
  console.log('New Event to be saved:', newEvent);
  try {
    await newEvent.save();
    console.log('Event saved successfully:', newEvent); // Save to database
    return newEvent;
  } catch (error) {
    throw new Error('Error saving event: ' + error.message);
  }
};

const deleteEvent = async (eventId) => {
  try {
    await Event.findByIdAndDelete(eventId); // Find and delete the event by its ID
    console.log(`Event with ID ${eventId} has been deleted.`);
  } catch (error) {
    throw new Error('Error deleting event: ' + error.message);
  }
};



const updateEvent = async (eventId, updatedData) => {
  try {
    await Event.findByIdAndUpdate(eventId, updatedData, { new: true });
    console.log(`Event with ID ${eventId} updated successfully.`);
  } catch (error) {
    throw new Error('Error updating event: ' + error.message);
  }
};


module.exports={
  Event,
getEventById,
createEvent,
getAllEvents,
deleteEvent,
updateEvent,
getEventByName,
}
