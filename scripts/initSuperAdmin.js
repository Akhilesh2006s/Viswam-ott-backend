const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SuperAdmin = require('../models/SuperAdmin');

// Load env vars
dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to database
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/LMS?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: 'Amenityforge@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Super Admin already exists with this email');
      console.log('Updating password...');
      existingAdmin.password = 'Amenity';
      existingAdmin.name = 'Super Admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Super Admin password updated successfully');
    } else {
      // Create super admin
      const superAdmin = await SuperAdmin.create({
        name: 'Super Admin',
        email: 'Amenityforge@gmail.com',
        password: 'Amenity',
        role: 'super_admin',
        isActive: true,
      });
      console.log('✅ Super Admin created successfully');
      console.log('Email:', superAdmin.email);
      console.log('Name:', superAdmin.name);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();


