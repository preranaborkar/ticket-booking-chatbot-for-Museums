// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MongoDBURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

module.exports = connectDB;
