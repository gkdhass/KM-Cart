/**
 * @file server/check-mongodb-region.js
 * @description Checks MongoDB Atlas cluster region by connecting and inspecting connection details
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkMongoDBRegion() {
  try {
    console.log('\n🔍 Checking MongoDB Atlas Cluster Region...');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not set in .env');
    }

    console.log('📡 Connecting to MongoDB Atlas...\n');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    // Wait for connection to fully establish
    await mongoose.connection.asPromise();

    // Get connection details
    const host = mongoose.connection.host;
    const dbName = mongoose.connection.name;
    const replica = mongoose.connection.db.admin().serverStatus;

    console.log('✅ Connected Successfully!\n');
    console.log('Connection Details:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📍 Host:     ${host}`);
    console.log(`📦 Database: ${dbName}`);
    console.log(`🔗 URI:      ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log('');

    // Parse region from hostname
    // MongoDB Atlas hostnames contain region codes
    // Format: cluster-shard-00-0X-XXXXX.mongodb.net
    // The XXXXX code often indicates region
    console.log('Region Analysis:');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (host.includes('shard')) {
      const parts = host.split('.');
      const shardPart = parts[0]; // e.g., "ac-jg3r11f-shard-00-00"
      console.log(`🏷️  Shard ID: ${shardPart}`);
    }

    // Try to get server info
    try {
      const admin = mongoose.connection.db.admin();
      const serverInfo = await admin.serverStatus();
      
      if (serverInfo.host) {
        console.log(`🖥️  Server:  ${serverInfo.host}`);
      }
      
      if (serverInfo.process) {
        console.log(`⚙️  Process: ${serverInfo.process}`);
      }
    } catch (err) {
      console.log('⚠️  Could not retrieve detailed server info (requires admin privileges)');
    }

    console.log('');
    console.log('Region Inference:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('To find the exact Atlas cluster region:');
    console.log('1. Go to: https://cloud.mongodb.com/');
    console.log('2. Navigate to: Your Cluster → Configuration tab');
    console.log('3. Look for: "Provider: AWS/GCP/Azure | Region: xyz"');
    console.log('');
    console.log('Common Atlas Regions:');
    console.log('  • Mumbai (India):        AWS ap-south-1, GCP asia-south1');
    console.log('  • Singapore:             AWS ap-southeast-1, GCP asia-southeast1');
    console.log('  • Sydney (Australia):    AWS ap-southeast-2, GCP australia-southeast1');
    console.log('  • US East (Virginia):    AWS us-east-1, GCP us-east4');
    console.log('');
    console.log('Vercel Regions (for comparison):');
    console.log('  • Mumbai:    bom1');
    console.log('  • Singapore: sin1');
    console.log('  • Sydney:    syd1');
    console.log('  • US East:   iad1 (current default if not configured)');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMongoDBRegion();
