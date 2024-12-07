const bcrypt = require('bcryptjs');
const adminModel = require('../models/adminModel');

// Register a user
const registerUser =  async (req, res) => {
  const { username, name, email, password, confirmPassword } = req.body;
  console.log("register me enter kiya");
  if (password !== confirmPassword) {
    return res.render('auth/register', { error: 'Password do not match' });
  }
  try {

    const existingUser = await adminModel.getAdminByEmail(email);

    if (existingUser) {
      return res.render('auth/register', { error: 'User already exists with this email.' });
      
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await adminModel.createAdminUser(username, name, email, hashedPassword);

    if (newUser) { // Check if a user object is returned
      return res.redirect('/login'); // Corrected the route for the login page
    }
    return res.render('auth/register', { error: 'Unexpected error during user registration.' });


} catch (err) {
  return res.render('auth/register', { error: 'Username already exits' });
  res.status(500).send('Database error: ' + err.message);
}
};

// User login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
 
  console.log("login me enter kiya");
 
  // console.log('Login request:', req.body);
  if (!email || !password) {
    return res.render('auth/login', { error: 'Email and password are required.' });
  }


  try {
    const admin = await adminModel.getAdminByEmail(email);

    // console.log('Admin fetched:', user);
    if (!admin) {
      return res.render('auth/login', { error: 'No user found with this email.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid Password' });
    }

    req.session.admin = { adminId: admin._id, name: admin.name, email: admin.email ,username: admin.username};
    // res.send('Login successful');
    res.redirect(`/admin/${admin._id}/profile`);
  } catch (err) {
    return res.render('auth/login', { error: 'Error logging in: ' + err.message });
  }
  
};

module.exports = {
  registerUser,
  loginUser
};
