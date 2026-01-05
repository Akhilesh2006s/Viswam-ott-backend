const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('../models/Subject');

// Load env vars
dotenv.config();

const testSubjects = async () => {
  try {
    // Connect to database
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/LMS?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all subjects
    const subjects = await Subject.find({});
    console.log(`\n📚 Total subjects in database: ${subjects.length}`);
    
    if (subjects.length > 0) {
      console.log('\n📋 Subjects list:');
      subjects.forEach((subject, index) => {
        console.log(`\n${index + 1}. ${subject.name}`);
        console.log(`   ID: ${subject._id}`);
        console.log(`   Classes: ${subject.classes.join(', ')}`);
        console.log(`   Video Count: ${subject.videoCount}`);
        console.log(`   Active: ${subject.isActive}`);
        console.log(`   Created: ${subject.createdAt}`);
      });
    } else {
      console.log('\n⚠️  No subjects found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testSubjects();


