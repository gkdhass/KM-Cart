/**
 * @file server/test-mongodb-connection.js
 * @description Standalone MongoDB connection diagnostic tool
 * Run: node server/test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns').promises;

console.log('\n═══════════════════════════════════════════════');
console.log('  🔍 MongoDB Connection Diagnostics');
console.log('═══════════════════════════════════════════════\n');

// Step 1: Check environment variable
console.log('📋 Step 1: Checking MONGODB_URI environment variable...');
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

// Mask password for display
function maskUri(uri) {
  try {
    const urlObj = new URL(uri.replace('mongodb+srv://', 'https://'));
    if (urlObj.password) {
      const masked = uri.replace(urlObj.password, '***MASKED***');
      return masked;
    }
    return uri;
  } catch (e) {
    return uri.replace(/:([^@]+)@/, ':***MASKED***@');
  }
}

console.log('✓ MONGODB_URI is set');
console.log('  URI Format:', maskUri(uri));
console.log('  URI Length:', uri.length, 'characters\n');

// Step 2: Parse URI components
console.log('📋 Step 2: Parsing URI components...');
try {
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)(\/[^?]+)?(\?.*)?/);
  if (match) {
    const [, username, password, host, dbName, queryString] = match;
    console.log('✓ URI Format: Valid');
    console.log('  Username:', username);
    console.log('  Password:', password ? '***MASKED***' : 'MISSING');
    console.log('  Host:', host);
    console.log('  Database:', dbName || '⚠️  NOT SPECIFIED (will use default "test")');
    console.log('  Query String:', queryString || 'None');
    
    if (!dbName || dbName === '/') {
      console.warn('\n⚠️  WARNING: No database name specified in URI!');
      console.warn('  This may cause connection issues.');
      console.warn('  Expected format: mongodb+srv://user:pass@host/DATABASE_NAME?options');
    }
  } else {
    console.warn('⚠️  Could not parse URI format - may be invalid');
  }
} catch (e) {
  console.error('❌ Error parsing URI:', e.message);
}
console.log();

// Step 3: Test DNS resolution
console.log('📋 Step 3: Testing DNS resolution...');
const hostname = uri.match(/@([^\/\?]+)/)?.[1];
if (hostname) {
  console.log('  Resolving:', hostname);
  try {
    const addresses = await dns.resolve(hostname);
    console.log('✓ DNS Resolution: SUCCESS');
    console.log('  Resolved to:', addresses.slice(0, 3).join(', '), addresses.length > 3 ? `... (${addresses.length} total)` : '');
  } catch (dnsError) {
    console.error('❌ DNS Resolution: FAILED');
    console.error('  Error:', dnsError.message);
    console.error('\n  Possible causes:');
    console.error('  - No internet connection');
    console.error('  - DNS server blocking MongoDB Atlas domains');
    console.error('  - VPN/Firewall blocking DNS queries');
    console.error('  - Incorrect hostname in URI');
    process.exit(1);
  }
} else {
  console.error('❌ Could not extract hostname from URI');
  process.exit(1);
}
console.log();

// Step 4: Test TCP connectivity (port 27017 for MongoDB)
console.log('📋 Step 4: Testing network reachability...');
console.log('  Note: MongoDB Atlas uses SRV records (multiple servers)');
console.log('  Skipping direct port test (not reliable for +srv connections)\n');

// Step 5: Attempt actual MongoDB connection
console.log('📋 Step 5: Attempting MongoDB connection...');
console.log('  Timeout: 30 seconds (increased for diagnostic)');
console.log('  Connecting...\n');

const startTime = Date.now();

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,  // 30 seconds for diagnostic
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4,  // Force IPv4 (sometimes helps)
})
.then(() => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ SUCCESS: Connected in ${duration} seconds`);
  console.log(`   Host: ${mongoose.connection.host}`);
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Ready State: ${mongoose.connection.readyState} (1 = connected)`);
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✅ All diagnostics passed!');
  console.log('  MongoDB connection is working correctly.');
  console.log('═══════════════════════════════════════════════\n');
  
  process.exit(0);
})
.catch((error) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.error(`❌ FAILED: Connection attempt timed out after ${duration} seconds\n`);
  
  console.error('═══════════════════════════════════════════════');
  console.error('  ❌ Connection Failed - Full Error Details');
  console.error('═══════════════════════════════════════════════');
  console.error('\nError Object:');
  console.error(JSON.stringify(error, null, 2));
  
  console.error('\n────────────────────────────────────────────────');
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  
  if (error.code) {
    console.error('Error Code:', error.code);
  }
  
  if (error.reason) {
    console.error('\nUnderlying Reason:');
    console.error(error.reason);
  }
  
  console.error('\n────────────────────────────────────────────────');
  console.error('Possible Causes:\n');
  
  if (error.message.includes('IP') || error.message.includes('whitelist')) {
    console.error('  🔧 IP NOT WHITELISTED');
    console.error('     1. Go to: https://cloud.mongodb.com');
    console.error('     2. Select your cluster → Network Access');
    console.error('     3. Add your current IP address');
    console.error('     4. Wait 2-3 minutes and try again\n');
  } else if (error.message.includes('authentication') || error.message.includes('auth')) {
    console.error('  🔧 AUTHENTICATION FAILED');
    console.error('     - Check username and password in MONGODB_URI');
    console.error('     - Verify user exists in Atlas → Database Access');
    console.error('     - Check user has read/write permissions\n');
  } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
    console.error('  🔧 CONNECTION TIMEOUT');
    console.error('     Possible causes:');
    console.error('     - Firewall blocking MongoDB ports (27017, 27015-27017)');
    console.error('     - Corporate network/VPN restrictions');
    console.error('     - Antivirus blocking connections');
    console.error('     - MongoDB Atlas service temporarily unreachable');
    console.error('     - Cluster paused in Atlas\n');
    console.error('  🔧 NETWORK DIAGNOSTIC STEPS:');
    console.error('     1. Disable VPN temporarily and retry');
    console.error('     2. Try from a different network (mobile hotspot)');
    console.error('     3. Check Atlas cluster status (not paused)');
    console.error('     4. Check if ports 27015-27017 are blocked\n');
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
    console.error('  🔧 DNS RESOLUTION FAILED');
    console.error('     - DNS server cannot resolve MongoDB Atlas hostname');
    console.error('     - Check internet connection');
    console.error('     - Try changing DNS server (e.g., Google DNS 8.8.8.8)\n');
  } else {
    console.error('  🔧 UNKNOWN ERROR');
    console.error('     - Check the full error details above');
    console.error('     - Verify MONGODB_URI format');
    console.error('     - Try connecting from MongoDB Compass with same URI\n');
  }
  
  console.error('═══════════════════════════════════════════════\n');
  process.exit(1);
});

// Timeout safety (in case promise never resolves/rejects)
setTimeout(() => {
  console.error('\n❌ Connection attempt exceeded 35 second hard timeout');
  console.error('   This indicates a network-level block or firewall issue');
  console.error('   The connection is not being rejected - it\'s being silently dropped\n');
  process.exit(1);
}, 35000);
