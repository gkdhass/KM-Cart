/**
 * Check if admin account exists in database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');
    
    const email = 'mohandhassgk352@gmail.com';
    console.log('🔍 Searching for:', email);
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User NOT FOUND in database');
      console.log('\n📊 Checking total users in database...');
      const totalUsers = await User.countDocuments();
      console.log(`Total users: ${totalUsers}`);
      
      const admins = await User.find({ role: 'admin' });
      console.log(`\nAdmin accounts found: ${admins.length}`);
      if (admins.length > 0) {
        console.log('Existing admin emails:');
        admins.forEach(admin => console.log(`  - ${admin.email} (role: ${admin.role})`));
      }
    } else {
      console.log('✅ User FOUND:');
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Is Admin:', user.role === 'admin' ? 'YES ✓' : 'NO (role is: ' + user.role + ')');
      console.log('  Password hash:', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');
      console.log('  Created:', user.createdAt);
      console.log('  Is Banned:', user.isBanned);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
