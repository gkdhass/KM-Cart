/**
 * Try alternative sources for branded product images
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Try Wikimedia Commons and other public sources
const alternativeSources = [
  {
    name: 'Amul Butter (Wikimedia)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amul_Butter.jpg/800px-Amul_Butter.jpg',
    brand: 'Amul',
    product: 'Butter'
  },
  {
    name: 'Fortune Oil (alternative)',
    url: 'https://5.imimg.com/data5/SELLER/Default/2023/5/308354857/YN/ZT/WV/8935138/fortune-sunflower-oil-500x500.jpg',
    brand: 'Fortune',
    product: 'Oil'
  },
  {
    name: 'Parachute Oil (alternative)',  
    url: 'https://5.imimg.com/data5/SELLER/Default/2021/7/GR/PZ/ZM/3677299/parachute-coconut-oil-500x500.jpg',
    brand: 'Parachute',
    product: 'Coconut Oil'
  }
];

async function download(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            reject(new Error(`HTTP ${redirectResponse.statusCode}`));
            return;
          }
          const fileStream = fs.createWriteStream(filepath);
          redirectResponse.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(fs.statSync(filepath).size);
          });
        }).on('error', reject);
      } else if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      } else {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(fs.statSync(filepath).size);
        });
      }
    }).on('error', reject);
  });
}

async function tryDownload() {
  console.log('=== TRYING ALTERNATIVE BRANDED IMAGE SOURCES ===\n');
  
  for (const source of alternativeSources) {
    const filepath = path.join(__dirname, `branded_${source.brand.toLowerCase()}.jpg`);
    
    console.log(`Attempting: ${source.name}`);
    console.log(`  Expected brand: ${source.brand}`);
    console.log(`  Expected product: ${source.product}`);
    console.log(`  URL: ${source.url.substring(0, 70)}...`);
    
    try {
      const size = await download(source.url, filepath);
      console.log(`  ✅ SUCCESS - Downloaded ${(size / 1024).toFixed(2)} KB`);
      console.log(`  File: ${filepath}\n`);
      return { filepath, ...source };
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    console.log();
  }
  
  return null;
}

tryDownload().then(result => {
  if (result) {
    console.log('═══════════════════════════════════════');
    console.log('Ready to test with:');
    console.log(`File: ${result.filepath}`);
    console.log(`Expected brand: ${result.brand}`);
    console.log(`Expected product: ${result.product}`);
    console.log('═══════════════════════════════════════\n');
  } else {
    console.log('═══════════════════════════════════════');
    console.log('❌ NO BRANDED IMAGES AVAILABLE');
    console.log('═══════════════════════════════════════');
    console.log('\nThis test cannot proceed without:');
    console.log('1. A real photo of a branded product, OR');
    console.log('2. A manually provided test image with visible brand text');
    console.log('\nCannot verify brand detection without appropriate test data.\n');
  }
});
