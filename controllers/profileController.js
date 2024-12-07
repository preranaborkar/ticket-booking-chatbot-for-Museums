const Admin = require('../models/adminModel');

// Render admin profile page
exports.getProfile = async (req, res) => {
  try {
    console.log("profile me enter kiya");

    if (!req.session.admin) {
      return res.redirect('/login'); // Redirect to login if no session
    }

    const adminId = req.session.admin.adminId; 
    const admin = await Admin.getAdminById(adminId);
   
    if (!admin) {
      return res.status(404).send('Admin not found');
    }

    res.render('admin/profile', { admin });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Update admin profile

exports.updateProfile =  async (req, res) => {
  try {
    console.log("update profile  me enter kiya");
    if (!req.session.admin) {
      return res.redirect('/login'); // Redirect to login if not logged in
    }
    
   const adminId = req.session.admin.adminId; 
   
    const { name, email, phone_number, about_me ,address} = req.body;

    const admin = await Admin.getAdminById(adminId);
    if (!admin) {
      return res.status(404).send('Admin not found');
    }
console.log('Admin Info :',admin);
    console.log(req.body);

    // Only update fields if new values are provided
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone_number) admin.phone_number = phone_number;
    if (about_me) admin.about_me = about_me;
    if (address) admin.address = address;
   console.log("i have updated ",admin)
    await admin.save();
    console.log('Updated Admin:', admin);
   

    req.session.admin = { adminId: admin._id };
    res.redirect(`/admin/${adminId}/profile`);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

