/**
 * @file server/promote-admin.js
 * @description One-time script to promote a user to admin role.
 * Usage: node promote-admin.js <email>
 * Example: node promote-admin.js mohandhassgk352@gmail.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set in environment variables');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: node promote-admin.js <email>');
  console.error('Example: node promote-admin.js mohandhassgk352@gmail.com');
  process.exit(1);
}

async function promoteToAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    console.log(`Looking for user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`ERROR: User with email "${email}" not found`);
      process.exit(1);
    }

    console.log('Current user data:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Current Role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('User is already an admin. No changes needed.');
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log('SUCCESS: User promoted to admin');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  New Role: ${user.role}`);
    console.log('');
    console.log('IMPORTANT: Please logout and login again for the changes to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

promoteToAdmin();
