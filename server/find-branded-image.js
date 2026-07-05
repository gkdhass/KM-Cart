/**
 * Search for real branded product images
 * We need images with VISIBLE brand text/logos
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Try these specific branded product image URLs that should have visible text
const candidateImages = [
  {
    name: 'Fortune Oil Bottle',
    url: 'https://m.media-amazon.com/images/I/61nR8cPfvYL._SX679_.jpg',
    brand: 'Fortune',
    product: 'Sunflower Oil'
  },
  {
    name: 'Parachute Coconut Oil',
    url: 'https://m.media-amazon.com/images/I/41ELXqvKpwL._SX300_SY300_QL70_FMwebp_.jpg',
    brand: 'Parachute',
    product: 'Coconut Oil'
  },
  {
    name: 'Amul Butter',
    url: 'https://m.media-amazon.com/images/I/71u9QRHKJQL._SX679_.jpg',
    brand: 'Amul',
    product: 'Butter'
  },
  {
    name: 'MTR Sambar Powder',
    url: 'https://m.media-amazon.com/images/I/81VPHqF+tTL._SX679_.jpg',
    brand: 'MTR',
    product: 'Sambar Powder'
  }
];

async function downloadAndCheck(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        const stats = fs.statSync(filepath);
        resolve(stats.size);
      });
    }).on('error', reject);
  });
}

async function findBrandedImage() {
  console.log('=== SEARCHING FOR BRANDED PRODUCT IMAGES ===\n');
  
  for (const candidate of candidateImages) {
    const filepath = path.join(__dirname, `test_${candidate.brand.toLowerCase()}.jpg`);
    
    console.log(`Trying: ${candidate.name}`);
    console.log(`  Brand: ${candidate.brand}`);
    console.log(`  Product: ${candidate.product}`);
    console.log(`  URL: ${candidate.url.substring(0, 60)}...`);
    
    try {
      const size = await downloadAndCheck(candidate.url, filepath);
      console.log(`  ✓ Downloaded: ${(size / 1024).toFixed(2)} KB`);
      console.log(`  ✓ Saved to: ${filepath}`);
      console.log(`\n✅ SUCCESS - Use this file for brand test\n`);
      return filepath;
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    console.log();
  }
  
  console.log('❌ Could not download any branded images');
  console.log('\nThis test requires either:');
  console.log('(a) A manually curated image with visible brand text');
  console.log('(b) A photo of a real branded product\n');
  return null;
}

findBrandedImage();
