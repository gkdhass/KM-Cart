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

async function testBrandImage() {
  console.log('=== REAL BRAND IMAGE SEARCH TEST ===\n');
  
  // Use an Unsplash image of sunflower oil (same source as DB uses)
  const imageUrl = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop';
  const imagePath = path.join(__dirname, 'test_sunflower_oil_real.jpg');
  
  try {
    console.log('Downloading test image from Unsplash...');
    await downloadImage(imageUrl, imagePath);
    console.log('✅ Image downloaded:', imagePath);
    console.log('Image size:', (fs.statSync(imagePath).size / 1024).toFixed(2), 'KB\n');
    
    console.log('Uploading to image search API...\n');
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post(
      'http://localhost:5000/api/products/image-search',
      form,
      { headers: form.getHeaders() }
    );
    
    console.log('Status:', response.status);
    console.log('\n=== RAW RESPONSE ===');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n=== VERIFICATION ===');
    console.log('Success:', response.data.success);
    console.log('Detected Brand:', response.data.detectedBrand || '(null)');
    console.log('Detected Product:', response.data.detectedProduct || '(null)');
    console.log('Detected Category:', response.data.detectedCategory || '(null)');
    console.log('Source:', response.data.source);
    console.log('Products Found:', response.data.products?.length || 0);
    
    if (response.data.products && response.data.products.length > 0) {
      console.log('\n✅ SUCCESS! Products matched:\n');
      response.data.products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Brand: ${p.brand}`);
        console.log(`   Category: ${p.category}`);
        console.log(`   Price: ₹${p.price}`);
        console.log();
      });
    } else {
      console.log('\n⚠️ No products matched in catalog');
      console.log('This may mean:');
      console.log('- Detected brand/product doesn\'t match any database entries');
      console.log('- Matching logic needs adjustment');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testBrandImage();
