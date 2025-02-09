const mongoose = require('mongoose');

// Define the User schema
const adminScheme = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate usernames
    trim: true,   // Removes whitespace
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the User model
const Admin = mongoose.model('Admin_Table', adminScheme);

module.exports = Admin;
