const mongoose = require('mongoose');


// Define user/admin schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    phone_number: { type: String ,default: '' ,required: false},
    address: { type: String ,default: '' ,required: false},
    about_me: { type: String, default: 'Tell us about yourself' ,required: false},
  });

  const Admin = mongoose.model('Admin', adminSchema);


  

  const createAdminUser = async (username, name, email, password_hash) => {
    const newAdminUser = new Admin({
        username,
        name,
        email,
        password_hash,
    });
// Use async/await instead of callback
    try {
    await newAdminUser.save();
    return newAdminUser;
    } catch (error) {
       throw new Error('Error saving user: ' + error.message);
    }
};

const getAdminByEmail = async (email) => {
  try {
    return await Admin.findOne({ email });
  } catch (error) {
    throw new Error('Error fetching admin by email: ' + error.message);
  }
};

const getAdminById = async (adminId) => {
  try {
    return await Admin.findById(adminId);
  } catch (error) {
    throw new Error('Error fetching admin by ID: ' + error.message);
  }
};



  module.exports = {
    Admin,
    createAdminUser,
    getAdminByEmail,
    getAdminById,
   
  };
