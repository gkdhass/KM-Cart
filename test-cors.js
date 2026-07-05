/**
 * CORS Test Script
 * Tests if backend properly allows requests from frontend domain
 * 
 * Usage: node test-cors.js
 */

const https = require('https');

const BACKEND_URL = 'https://km-cart.vercel.app';
const FRONTEND_ORIGIN = 'https://kmcart.vercel.app';

console.log('🧪 Testing CORS configuration...\n');
console.log(`Backend:  ${BACKEND_URL}`);
console.log(`Frontend: ${FRONTEND_ORIGIN}\n`);

// Test 1: Basic health check (no CORS needed)
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣  Testing basic health check (GET /api/health)...');
    
    https.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Backend is running');
          console.log(`   Response: ${JSON.parse(data).message}\n`);
          resolve();
        } else {
          console.log(`   ❌ Health check failed: ${res.statusCode}\n`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Test 2: CORS preflight (OPTIONS request with Origin header)
function testCORSPreflight() {
  return new Promise((resolve, reject) => {
    console.log('2️⃣  Testing CORS preflight (OPTIONS /api/auth/google)...');
    
    const url = new URL(`${BACKEND_URL}/api/auth/google`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };
    
    const req = https.request(options, (res) => {
      const allowOrigin = res.headers['access-control-allow-origin'];
      const allowMethods = res.headers['access-control-allow-methods'];
      const allowHeaders = res.headers['access-control-allow-headers'];
      
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Access-Control-Allow-Origin: ${allowOrigin || 'MISSING ❌'}`);
      console.log(`   Access-Control-Allow-Methods: ${allowMethods || 'MISSING ❌'}`);
      console.log(`   Access-Control-Allow-Headers: ${allowHeaders || 'MISSING ❌'}`);
      
      if (allowOrigin === FRONTEND_ORIGIN || allowOrigin === '*') {
        console.log('   ✅ CORS preflight passed\n');
        resolve();
      } else {
        console.log('   ❌ CORS preflight failed - Origin not allowed\n');
        reject(new Error('CORS not configured correctly'));
      }
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test 3: Actual cross-origin request simulation
function testCORSRequest() {
  return new Promise((resolve, reject) => {
    console.log('3️⃣  Testing actual cross-origin GET request...');
    
    const url = new URL(`${BACKEND_URL}/api/products?page=1&limit=1`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      const allowOrigin = res.headers['access-control-allow-origin'];
      
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Access-Control-Allow-Origin: ${allowOrigin || 'MISSING ❌'}`);
      
      if (allowOrigin === FRONTEND_ORIGIN || allowOrigin === '*') {
        console.log('   ✅ Cross-origin request allowed\n');
        resolve();
      } else {
        console.log('   ❌ Cross-origin request blocked\n');
        reject(new Error('CORS headers missing'));
      }
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Run all tests sequentially
async function runTests() {
  try {
    await testHealthCheck();
    await testCORSPreflight();
    await testCORSRequest();
    
    console.log('═'.repeat(60));
    console.log('✅ All CORS tests passed!');
    console.log('═'.repeat(60));
    console.log('\nYour frontend at https://kmcart.vercel.app can now');
    console.log('successfully call your backend at https://km-cart.vercel.app\n');
    
  } catch (error) {
    console.log('═'.repeat(60));
    console.log('❌ CORS test failed');
    console.log('═'.repeat(60));
    console.error(`\nError: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure backend is deployed with updated CORS config');
    console.log('2. Check Vercel function logs for CORS warnings');
    console.log('3. Verify CLIENT_URL env var in Vercel dashboard\n');
    process.exit(1);
  }
}

runTests();
