/**
 * @file server/check-user-role.js
 * @description Script to check a user's current role in the database
 * Usage: node check-user-role.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set in environment variables');
  process.exit(1);
}

const email = process.argv[2] || 'mohandhassgk352@gmail.com';

async function checkUserRole() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully\n');

    console.log(`Checking user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`ERROR: User with email "${email}" not found`);
      process.exit(1);
    }

    console.log('User found. Current data:');
    console.log('========================================');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Role type: ${typeof user.role}`);
    console.log(`Role === 'admin': ${user.role === 'admin'}`);
    console.log(`Role === 'user': ${user.role === 'user'}`);
    console.log('========================================');
    console.log('\nFull user object:');
    console.log(JSON.stringify(user.toObject(), null, 2));

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkUserRole();
