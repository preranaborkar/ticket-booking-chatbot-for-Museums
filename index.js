// Start server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const authRoutes = require('./routes/authRoutes.js');
const homeRoutes = require('./routes/homeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const eventRoutes=require('./routes/eventRoutes.js');
const chatbotRoutes = require('./routes/chatbotRoutes');
const app = express();


const cors = require('cors');
app.use(cors());
// app.use(cors({
//     origin: 'https://museum-chatbot-ticketing.vercel.app/', // Replace with your actual frontend URL on Vercel
//     methods: 'GET, POST, PUT, DELETE',
//     credentials: true // Allow cookies to be sent, if needed
// }));


// // Set storage engine for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Save files to the "uploads" folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Use a unique name for the image
//   },
// });


// const upload = multer({ storage });



const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;
dotenv.config();

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
// Connect to MongoDB
connectDB();




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));








app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));





// Routes

app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', eventRoutes);
app.use('/', chatbotRoutes);


// Logout Route
app.get('/logout', (req, res) => {
  // Clear any session data if using sessions
  if (req.session) {
      req.session.destroy((err) => {
          if (err) {
              console.error('Error destroying session:', err);
          }
         
          // Redirect to home page after session is cleared
          res.redirect('/');
      });
  } 
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
