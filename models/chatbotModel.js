
const mongoose = require('mongoose');
// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);


// Ticket Schema
const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    quantity: { type: Number, required: true }, // Number of tickets booked
    bookingDate: { type: Date, required: true }, // Date for which booking is done
    status: { type: String, default: 'confirmed' },
    qrCode: { type: String, required: true } // QR code string
});


const Ticket = mongoose.model('Ticket', ticketSchema);

const createUser = async (name, email) => {
    const newUser = new User({ name, email});
    try {
        await newUser.save();
        console.log('User created successfully:', newUser);
        return newUser;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
};

const createTicket = async (userId, eventId, quantity, bookingDate, qrCode) => {
    const newTicket = new Ticket({ userId, eventId, quantity, bookingDate, qrCode });
    try {
        await newTicket.save();
        console.log('Ticket created successfully:', newTicket);
        return newTicket;
    } catch (error) {
        throw new Error('Error creating ticket: ' + error.message);
    }
};

const getUserBookings = async (userId) => {
    try {
        const tickets = await Ticket.find({ userId })
            .populate('eventId') // Populates event details
            .populate('userId'); // Optional: Populates user details
        return tickets;
    } catch (error) {
        throw new Error('Error fetching user bookings: ' + error.message);
    }
};

const getEventBookings = async (eventId) => {
    try {
        const bookings = await Ticket.find({ eventId })
            .populate('userId') // Populates user details
            .populate('eventId'); // Populates event details
        return bookings;
    } catch (error) {
        throw new Error('Error fetching event bookings: ' + error.message);
    }
};

const deleteTicket = async (ticketId) => {
    try {
        await Ticket.findByIdAndDelete(ticketId);
        console.log(`Ticket with ID ${ticketId} deleted successfully.`);
    } catch (error) {
        throw new Error('Error deleting ticket: ' + error.message);
    }
};



module.exports = {
    createUser,
    getUserBookings,
    getEventBookings,
    deleteTicket,
    User,
    createTicket,
    Ticket
}