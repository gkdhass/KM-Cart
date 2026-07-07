/**
 * @file server/check-product-images.js
 * @description Diagnostic script to check which products have missing or broken image URLs
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const connectDB = require('./config/db');

async function checkProductImages() {
  try {
    await connectDB();
    console.log('\n🔍 Checking Product Images in Database');
    console.log('═══════════════════════════════════════\n');

    // Fetch all products
    const products = await Product.find({}).sort({ category: 1, name: 1 });
    
    console.log(`📦 Total products in database: ${products.length}\n`);

    // Track issues
    const missingImages = [];
    const emptyImages = [];
    const brokenUrls = [];
    
    products.forEach((product) => {
      const hasImages = product.images && Array.isArray(product.images) && product.images.length > 0;
      const hasImage = product.image && product.image.trim() !== '';
      
      if (!hasImages && !hasImage) {
        missingImages.push({
          name: product.name,
          category: product.category,
          id: product._id
        });
      } else if (hasImages && product.images[0].trim() === '') {
        emptyImages.push({
          name: product.name,
          category: product.category,
          images: product.images,
          id: product._id
        });
      } else if (hasImage && product.image.trim() === '') {
        emptyImages.push({
          name: product.name,
          category: product.category,
          image: product.image,
          id: product._id
        });
      }
      
      // Check for placeholder or broken URLs
      const imageUrl = (hasImages ? product.images[0] : product.image) || '';
      if (imageUrl.includes('placehold.co') || 
          imageUrl.includes('placeholder') || 
          imageUrl === '' ||
          imageUrl.includes('source.unsplash.com')) {
        brokenUrls.push({
          name: product.name,
          category: product.category,
          url: imageUrl,
          id: product._id
        });
      }
    });

    // Report findings
    if (missingImages.length > 0) {
      console.log('❌ PRODUCTS WITH NO IMAGES FIELD:');
      console.log('═══════════════════════════════════════');
      missingImages.forEach((p) => {
        console.log(`   → ${p.name} (${p.category})`);
      });
      console.log('');
    }

    if (emptyImages.length > 0) {
      console.log('⚠️  PRODUCTS WITH EMPTY IMAGE URLS:');
      console.log('═══════════════════════════════════════');
      emptyImages.forEach((p) => {
        console.log(`   → ${p.name} (${p.category})`);
      });
      console.log('');
    }

    if (brokenUrls.length > 0) {
      console.log('🔗 PRODUCTS WITH PLACEHOLDER/DYNAMIC URLS:');
      console.log('═══════════════════════════════════════');
      brokenUrls.forEach((p) => {
        console.log(`   → ${p.name} (${p.category})`);
        console.log(`      URL: ${p.url}`);
      });
      console.log('');
    }

    // Category breakdown of issues
    const categoryIssues = {};
    [...missingImages, ...emptyImages, ...brokenUrls].forEach((p) => {
      if (!categoryIssues[p.category]) {
        categoryIssues[p.category] = [];
      }
      if (!categoryIssues[p.category].includes(p.name)) {
        categoryIssues[p.category].push(p.name);
      }
    });

    if (Object.keys(categoryIssues).length > 0) {
      console.log('📊 ISSUES BY CATEGORY:');
      console.log('═══════════════════════════════════════');
      Object.entries(categoryIssues)
        .sort((a, b) => b[1].length - a[1].length)
        .forEach(([cat, names]) => {
          console.log(`   ${cat}: ${names.length} product(s) with issues`);
          names.forEach((name) => console.log(`      → ${name}`));
        });
      console.log('');
    }

    // Summary
    const totalIssues = new Set([
      ...missingImages.map(p => p.name),
      ...emptyImages.map(p => p.name),
      ...brokenUrls.map(p => p.name)
    ]).size;

    console.log('═══════════════════════════════════════');
    console.log(`📈 SUMMARY:`);
    console.log(`   Total products checked: ${products.length}`);
    console.log(`   Products with issues: ${totalIssues}`);
    console.log(`   Products OK: ${products.length - totalIssues}`);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProductImages();
