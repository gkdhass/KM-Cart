/**
 * @file server/utils/productMatcher.examples.js
 * @description Usage examples for the product matcher utility
 * Run with: node utils/productMatcher.examples.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { matchProduct } = require('./productMatcher');
const connectDB = require('../config/db');

/**
 * Example 1: Simple product search
 */
async function example1_SimpleSearch() {
  console.log('\n📌 Example 1: Simple Product Search\n');
  
  const result = await matchProduct({ text: 'turmeric powder' });
  
  console.log('Query: "turmeric powder"');
  console.log(`Status: ${result.status}`);
  if (result.status === 'matched') {
    console.log(`Product: ${result.product.name}`);
    console.log(`Price: ₹${result.product.price}`);
    console.log(`Score: ${result.score.toFixed(3)}`);
  }
}

/**
 * Example 2: Fuzzy search with typo
 */
async function example2_FuzzySearch() {
  console.log('\n📌 Example 2: Fuzzy Search (Typo Correction)\n');
  
  const result = await matchProduct({ text: 'almond' }); // singular → plural
  
  console.log('Query: "almond" (should match "Almonds")');
  console.log(`Status: ${result.status}`);
  if (result.status === 'matched') {
    console.log(`Product: ${result.product.name}`);
    console.log(`Match Score: ${result.score.toFixed(3)}`);
  }
}

/**
 * Example 3: Ambiguous search
 */
async function example3_AmbiguousSearch() {
  console.log('\n📌 Example 3: Ambiguous Search (Multiple Matches)\n');
  
  const result = await matchProduct({ text: 'chocolate' });
  
  console.log('Query: "chocolate"');
  console.log(`Status: ${result.status}`);
  if (result.status === 'ambiguous') {
    console.log(`Found ${result.candidates.length} similar products:`);
    result.candidates.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.product.name} (score: ${c.score.toFixed(3)})`);
    });
    console.log('\n💡 User should be prompted to choose one');
  } else if (result.status === 'matched') {
    console.log(`Single match: ${result.product.name}`);
  }
}

/**
 * Example 4: Unit-specific search
 */
async function example4_UnitSearch() {
  console.log('\n📌 Example 4: Unit-Specific Search\n');
  
  const result = await matchProduct({ 
    text: 'oil', 
    unit: 'Liter' 
  });
  
  console.log('Query: "oil" with unit="Liter"');
  console.log(`Status: ${result.status}`);
  if (result.status === 'matched') {
    console.log(`Product: ${result.product.name}`);
    console.log(`Unit: ${result.product.unit}`);
  } else if (result.status === 'ambiguous') {
    console.log('Multiple oil products found (by liter):');
    result.candidates.slice(0, 3).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.product.name} - ${c.product.unit}`);
    });
  }
}

/**
 * Example 5: Brand filtering
 */
async function example5_BrandFilter() {
  console.log('\n📌 Example 5: Brand Filtering\n');
  
  const result = await matchProduct({ 
    text: 'rice',
    brand: 'K_M_Cart Fresh'
  });
  
  console.log('Query: "rice" with brand="K_M_Cart Fresh"');
  console.log(`Status: ${result.status}`);
  if (result.status === 'matched') {
    console.log(`Product: ${result.product.name}`);
    console.log(`Brand: ${result.product.brand}`);
  } else if (result.status === 'ambiguous') {
    console.log('Multiple rice products from K_M_Cart Fresh:');
    result.candidates.slice(0, 3).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.product.name}`);
    });
  }
}

/**
 * Example 6: Voice ordering simulation
 */
async function example6_VoiceOrdering() {
  console.log('\n📌 Example 6: Voice Ordering Simulation\n');
  
  // Simulate: "Add 2 kilos of basmati rice to cart"
  const voiceInput = {
    text: 'basmati rice',
    quantity: 2
  };
  
  const result = await matchProduct(voiceInput);
  
  console.log('Voice Command: "Add 2 kilos of basmati rice to cart"');
  console.log(`Extracted: text="${voiceInput.text}", quantity=${voiceInput.quantity}`);
  console.log(`Match Status: ${result.status}`);
  
  if (result.status === 'matched') {
    console.log(`Adding to cart:`);
    console.log(`   Product: ${result.product.name}`);
    console.log(`   Quantity: ${result.quantity}`);
    console.log(`   Price per unit: ₹${result.product.price}`);
    console.log(`   Total: ₹${result.product.price * result.quantity}`);
  } else if (result.status === 'ambiguous') {
    console.log('Need clarification from user:');
    result.candidates.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.product.name}`);
    });
  }
}

/**
 * Example 7: Image OCR simulation
 */
async function example7_ImageOCR() {
  console.log('\n📌 Example 7: Image OCR Simulation\n');
  
  // Simulate OCR extracted text from product label image
  const ocrText = "Fresh Sunflower Oil - 1 Liter";
  
  // Extract relevant info (simplified)
  const extractedText = 'sunflower oil';
  const extractedUnit = 'Liter';
  
  const result = await matchProduct({ 
    text: extractedText,
    unit: extractedUnit
  });
  
  console.log('OCR Text: "Fresh Sunflower Oil - 1 Liter"');
  console.log(`Extracted: text="${extractedText}", unit="${extractedUnit}"`);
  console.log(`Match Status: ${result.status}`);
  
  if (result.status === 'matched') {
    console.log(`✅ Product identified:`);
    console.log(`   ${result.product.name}`);
    console.log(`   ₹${result.product.price}/${result.product.unit}`);
  } else if (result.status === 'ambiguous') {
    console.log('🔍 Multiple matches - show visual confirmation:');
    result.candidates.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.product.name} (${c.product.unit})`);
    });
  }
}

/**
 * Example 8: No match scenario
 */
async function example8_NoMatch() {
  console.log('\n📌 Example 8: No Match Scenario\n');
  
  const result = await matchProduct({ text: 'flying unicorn' });
  
  console.log('Query: "flying unicorn"');
  console.log(`Status: ${result.status}`);
  if (result.status === 'notFound') {
    console.log(`Reason: ${result.reason}`);
    console.log('💡 Suggest: Show alternative products or search tips');
  }
}

/**
 * Main runner
 */
async function runExamples() {
  try {
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 PRODUCT MATCHER - USAGE EXAMPLES');
    console.log('═'.repeat(60));
    
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Run all examples
    await example1_SimpleSearch();
    await example2_FuzzySearch();
    await example3_AmbiguousSearch();
    await example4_UnitSearch();
    await example5_BrandFilter();
    await example6_VoiceOrdering();
    await example7_ImageOCR();
    await example8_NoMatch();
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ All examples completed!');
    console.log('═'.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples();
}

module.exports = { runExamples };
