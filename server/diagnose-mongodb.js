const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function diagnoseMongoDB() {
  console.log('=== MONGODB CONNECTION DIAGNOSIS ===\n');
  
  const uri = process.env.MONGODB_URI;
  
  // Mask sensitive parts
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  console.log('Connection URI (masked):', maskedUri);
  console.log('Database name:', uri.match(/\.net\/([^?]+)/)?.[1] || 'NOT SPECIFIED');
  console.log('\n--- Attempting Connection ---\n');
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Port:', conn.connection.port);
    console.log('Ready state:', conn.connection.readyState); // 1 = connected
    
    // Test a simple query
    console.log('\n--- Testing Query ---\n');
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    console.log('✅ Query successful!');
    console.log('Total products in database:', count);
    
    if (count > 0) {
      const sample = await Product.findOne();
      console.log('\nSample product:');
      console.log('  Name:', sample.name);
      console.log('  Brand:', sample.brand);
      console.log('  Price: ₹' + sample.price);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Disconnected successfully');
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️ Possible causes:');
      console.error('  1. MongoDB Atlas cluster is PAUSED (M0 free tier auto-pauses)');
      console.error('  2. Firewall blocking port 27017');
      console.error('  3. Network connectivity issues');
      console.error('\n💡 Check: https://cloud.mongodb.com/v2 → Database → Resume cluster if paused');
    } else if (error.message.includes('authentication')) {
      console.error('\n⚠️ Authentication failed - check username/password in connection string');
    } else if (error.message.includes('timeout')) {
      console.error('\n⚠️ Connection timeout - cluster may be paused or unreachable');
    }
    
    process.exit(1);
  }
}

diagnoseMongoDB();
