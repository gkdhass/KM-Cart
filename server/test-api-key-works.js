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

async function testRotatedAPIKey() {
  console.log('=== TESTING ROTATED GEMINI API KEY ===\n');
  
  // Download a sunflower oil image from Unsplash
  const imageUrl = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop';
  const imagePath = path.join(__dirname, 'test_sunflower_image.jpg');
  
  try {
    console.log('1. Downloading sunflower oil test image...');
    await downloadImage(imageUrl, imagePath);
    const fileSize = fs.statSync(imagePath).size;
    console.log(`   ✓ Downloaded: ${(fileSize / 1024).toFixed(2)} KB\n`);
    
    console.log('2. Uploading to /api/products/image-search...\n');
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post(
      'http://localhost:5000/api/products/image-search',
      form,
      {
        headers: form.getHeaders(),
        validateStatus: () => true // Accept all status codes
      }
    );
    
    console.log('═══ RESPONSE ═══');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Source:', response.data.source);
    console.log('Detected Brand:', response.data.detectedBrand || '(null)');
    console.log('Detected Product:', response.data.detectedProduct || '(null)');
    console.log('Detected Category:', response.data.detectedCategory || '(null)');
    console.log('Products Found:', response.data.products?.length || 0);
    
    if (response.data.success && response.data.source === 'gemini') {
      console.log('\n✅ API KEY WORKING - Gemini API responded successfully!');
      return true;
    } else if (response.data.errorType === 'GEMINI_ERROR') {
      console.log('\n❌ API KEY ISSUE - Gemini returned error');
      console.log('Error:', response.data.errorDetails);
      return false;
    } else {
      console.log('\n⚠️  Unexpected response - check details above');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  } finally {
    // Cleanup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('\n🧹 Cleaned up test image');
    }
  }
}

testRotatedAPIKey().then(success => {
  process.exit(success ? 0 : 1);
});
