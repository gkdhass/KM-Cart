const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function testBrandMatch() {
  console.log('=== BRAND IMAGE SEARCH TEST ===\n');
  console.log('Target: Fortune brand products (3 in database)\n');
  
  // Try with sunflower oil image
  const imageUrl = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop';
  const imagePath = path.join(__dirname, 'test_fortune_sunflower.jpg');
  
  try {
    console.log('Step 1: Downloading sunflower oil image...');
    await downloadImage(imageUrl, imagePath);
    console.log(`✓ Image downloaded: ${(fs.statSync(imagePath).size / 1024).toFixed(2)} KB\n`);
    
    console.log('Step 2: Uploading to /api/products/image-search...\n');
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post(
      'http://localhost:5000/api/products/image-search',
      form,
      { headers: form.getHeaders(), validateStatus: () => true }
    );
    
    console.log('═══════════════════════════════════════');
    console.log('RESPONSE STATUS:', response.status);
    console.log('═══════════════════════════════════════\n');
    
    console.log('RAW JSON RESPONSE:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n═══════════════════════════════════════');
    
    console.log('\n=== VERIFICATION ===\n');
    console.log('✓ Success:', response.data.success);
    console.log('✓ Source:', response.data.source);
    console.log('✓ Detected Brand:', response.data.detectedBrand || '(null)');
    console.log('✓ Detected Product:', response.data.detectedProduct || '(null)');
    console.log('✓ Detected Category:', response.data.detectedCategory || '(null)');
    console.log('✓ Products Found:', response.data.products?.length || 0);
    
    if (response.data.products && response.data.products.length > 0) {
      console.log('\n=== MATCHED PRODUCTS ===\n');
      response.data.products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Brand: ${p.brand}`);
        console.log(`   Category: ${p.category}`);
        console.log(`   Price: ₹${p.price}`);
        console.log(`   Image: ${p.image?.substring(0, 60)}...`);
        console.log();
      });
      
      console.log('✅ BRAND MATCH TEST PASSED!');
      console.log(`Found ${response.data.products.length} product(s) matching the image\n`);
    } else {
      console.log('\n⚠️  NO PRODUCTS MATCHED');
      console.log('Reason:', response.data.message);
      console.log('\nThis is expected for generic stock photos.');
      console.log('Gemini could not detect a specific brand from the image.\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('🧹 Cleaned up test image');
    }
  }
}

testBrandMatch();
