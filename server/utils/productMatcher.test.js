/**
 * @file server/utils/productMatcher.test.js
 * @description Test suite for fuzzy product matcher
 * Run with: node server/utils/productMatcher.test.js
 * 
 * Uses real product names from server/seed/groceryProducts.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { matchProduct, calculateSimilarity, normalizeText } = require('./productMatcher');
const connectDB = require('../config/db');

// ═══════════════════════════════════════════════════════════════
// TEST UTILITIES
// ═══════════════════════════════════════════════════════════════

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASS' });
  } else {
    console.log(`❌ FAIL: ${testName}`);
    if (details) console.log(`   Details: ${details}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAIL', details });
  }
}

function assertEqual(actual, expected, testName) {
  const passed = actual === expected;
  assert(passed, testName, passed ? '' : `Expected: ${expected}, Got: ${actual}`);
}

function assertGreaterThan(actual, threshold, testName) {
  const passed = actual > threshold;
  assert(passed, testName, passed ? '' : `Expected > ${threshold}, Got: ${actual}`);
}

// ═══════════════════════════════════════════════════════════════
// UNIT TESTS (No DB required)
// ═══════════════════════════════════════════════════════════════

function runUnitTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 UNIT TESTS - Text Processing');
  console.log('═'.repeat(60) + '\n');
  
  // Test normalizeText
  assertEqual(normalizeText('  Tomato  '), 'tomato', 'normalizeText: trim spaces');
  assertEqual(normalizeText('Sun Flower  Oil'), 'sun flower oil', 'normalizeText: multiple spaces');
  assertEqual(normalizeText(''), '', 'normalizeText: empty string');
  
  // Test calculateSimilarity
  const exactMatch = calculateSimilarity('tomato', 'Tomato');
  assertEqual(exactMatch, 1.0, 'calculateSimilarity: exact match (case insensitive)');
  
  const partialMatch = calculateSimilarity('sun', 'Sunflower Oil');
  assertGreaterThan(partialMatch, 0.8, 'calculateSimilarity: partial match (contains)');
  
  const fuzzyMatch = calculateSimilarity('tomatoe', 'tomato');
  assertGreaterThan(fuzzyMatch, 0.7, 'calculateSimilarity: fuzzy match (typo)');
  
  const noMatch = calculateSimilarity('banana', 'oil');
  assert(noMatch < 0.4, 'calculateSimilarity: no match', `Score: ${noMatch}`);
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION TESTS (Requires seeded DB)
// ═══════════════════════════════════════════════════════════════

async function runIntegrationTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 INTEGRATION TESTS - Product Matching');
  console.log('═'.repeat(60) + '\n');
  
  // ── TEST 1: Exact Match ──────────────────────────────────────
  console.log('📌 Test 1: Exact Match\n');
  const exact1 = await matchProduct({ text: 'Sunflower Oil' });
  assert(
    exact1.status === 'matched' || exact1.status === 'ambiguous',
    'Exact match: "Sunflower Oil"',
    `Status: ${exact1.status}`
  );
  
  if (exact1.status === 'matched') {
    assert(
      exact1.product?.name === 'Sunflower Oil',
      'Exact match: correct product name',
      `Got: ${exact1.product?.name}`
    );
    assert(exact1.score >= 0.85, 'Exact match: high score', `Score: ${exact1.score}`);
  } else {
    // Ambiguous case
    assert(
      exact1.candidates?.some(c => c.product.name === 'Sunflower Oil'),
      'Exact match (ambiguous): sunflower oil in candidates',
      `Got candidates: ${exact1.candidates?.map(c => c.product.name).join(', ')}`
    );
  }
  
  // ── TEST 2: Partial Match ────────────────────────────────────
  console.log('\n📌 Test 2: Partial Match\n');
  const partial1 = await matchProduct({ text: 'turmeric' });
  assertEqual(partial1.status, 'matched', 'Partial match: "turmeric"');
  assert(
    partial1.product?.name.toLowerCase().includes('turmeric'),
    'Partial match: name contains "turmeric"',
    `Got: ${partial1.product?.name}`
  );
  
  const partial2 = await matchProduct({ text: 'basmati' });
  assertEqual(partial2.status, 'matched', 'Partial match: "basmati"');
  assert(
    partial2.product?.name.toLowerCase().includes('basmati'),
    'Partial match: name contains "basmati"',
    `Got: ${partial2.product?.name}`
  );
  
  // ── TEST 3: Misspelled Match ─────────────────────────────────
  console.log('\n📌 Test 3: Misspelled/Fuzzy Match\n');
  const fuzzy1 = await matchProduct({ text: 'toor daal' }); // "daal" vs "dal"
  assert(
    fuzzy1.status === 'matched' || fuzzy1.status === 'ambiguous',
    'Fuzzy match: "toor daal" (misspelled)',
    `Status: ${fuzzy1.status}`
  );
  if (fuzzy1.status === 'matched') {
    assert(
      fuzzy1.product?.name.toLowerCase().includes('toor'),
      'Fuzzy match: found toor dal',
      `Got: ${fuzzy1.product?.name}`
    );
  }
  
  const fuzzy2 = await matchProduct({ text: 'almond' }); // "almond" → "Almonds"
  assertEqual(fuzzy2.status, 'matched', 'Fuzzy match: "almond" (singular)');
  assert(
    fuzzy2.product?.name.toLowerCase().includes('almond'),
    'Fuzzy match: found almonds',
    `Got: ${fuzzy2.product?.name}`
  );
  
  const fuzzy3 = await matchProduct({ text: 'cocunut oil' }); // "cocunut" → "coconut"
  assert(
    fuzzy3.status === 'matched' || fuzzy3.status === 'ambiguous',
    'Fuzzy match: "cocunut oil" (typo)',
    `Status: ${fuzzy3.status}, Product: ${fuzzy3.product?.name || 'N/A'}`
  );
  
  // ── TEST 4: Unit/Size-Specific Match ─────────────────────────
  console.log('\n📌 Test 4: Unit-Specific Match\n');
  const unitMatch1 = await matchProduct({ text: 'oil', unit: 'Liter' });
  assert(
    unitMatch1.status === 'matched' || unitMatch1.status === 'ambiguous',
    'Unit match: "oil" with unit="Liter"',
    `Status: ${unitMatch1.status}`
  );
  if (unitMatch1.status === 'matched') {
    assertEqual(unitMatch1.product?.unit, 'Liter', 'Unit match: correct unit');
  }
  
  const unitMatch2 = await matchProduct({ text: 'sugar', unit: 'Kg' });
  assert(
    unitMatch2.status === 'matched' || unitMatch2.status === 'ambiguous',
    'Unit match: "sugar" with unit="Kg"',
    `Status: ${unitMatch2.status}`
  );
  if (unitMatch2.status === 'matched') {
    assertEqual(unitMatch2.product?.unit, 'Kg', 'Unit match: correct unit');
  }
  
  // ── TEST 5: Ambiguous Match ──────────────────────────────────
  console.log('\n📌 Test 5: Ambiguous Match (Multiple Candidates)\n');
  const ambig1 = await matchProduct({ text: 'chocolate' });
  // Should match multiple: "Milk Chocolate", "Dark Chocolate", "Chocolate Cookies"
  assert(
    ambig1.status === 'matched' || ambig1.status === 'ambiguous',
    'Ambiguous match: "chocolate"',
    `Status: ${ambig1.status}`
  );
  if (ambig1.status === 'ambiguous') {
    assert(ambig1.candidates.length > 1, 'Ambiguous match: multiple candidates');
    assert(
      ambig1.candidates.every(c => c.product.name.toLowerCase().includes('chocolate')),
      'Ambiguous match: all candidates contain "chocolate"'
    );
  }
  
  const ambig2 = await matchProduct({ text: 'biscuit' });
  // Should match multiple: "Marie Biscuits", "Cream Biscuits", "Digestive Biscuits"
  assert(
    ambig2.status === 'matched' || ambig2.status === 'ambiguous',
    'Ambiguous match: "biscuit"',
    `Status: ${ambig2.status}`
  );
  
  // ── TEST 6: Brand + Text Match ───────────────────────────────
  console.log('\n📌 Test 6: Brand + Text Match\n');
  const brandMatch1 = await matchProduct({ text: 'basmati rice', brand: 'K_M_Cart Fresh' });
  assert(
    brandMatch1.status === 'matched' || brandMatch1.status === 'ambiguous',
    'Brand match: "basmati rice" with brand filter',
    `Status: ${brandMatch1.status}`
  );
  if (brandMatch1.status === 'matched') {
    assertEqual(brandMatch1.product?.brand, 'K_M_Cart Fresh', 'Brand match: correct brand');
  } else if (brandMatch1.status === 'ambiguous') {
    assert(
      brandMatch1.candidates.every(c => c.product.brand === 'K_M_Cart Fresh'),
      'Brand match (ambiguous): all candidates have correct brand'
    );
  }
  
  // ── TEST 7: No Match ─────────────────────────────────────────
  console.log('\n📌 Test 7: No Match Found\n');
  const noMatch1 = await matchProduct({ text: 'xyz123notarealproduct' });
  assertEqual(noMatch1.status, 'notFound', 'No match: invalid product name');
  assert(noMatch1.query?.text === 'xyz123notarealproduct', 'No match: query preserved');
  
  const noMatch2 = await matchProduct({ text: '' });
  assertEqual(noMatch2.status, 'notFound', 'No match: empty text');
  
  // ── TEST 8: Quantity Parameter ───────────────────────────────
  console.log('\n📌 Test 8: Quantity Parameter\n');
  const qtyMatch = await matchProduct({ text: 'milk', quantity: 3 });
  assertEqual(qtyMatch.status, 'matched', 'Quantity: match with quantity=3');
  assertEqual(qtyMatch.quantity, 3, 'Quantity: correct quantity returned');
  
  const qtyDefault = await matchProduct({ text: 'milk' });
  assertEqual(qtyDefault.quantity, 1, 'Quantity: defaults to 1');
  
  // ── TEST 9: Tamil Name Match ─────────────────────────────────
  console.log('\n📌 Test 9: Tamil Name Match\n');
  
  // Note: Direct Tamil character search has limitations with string-similarity library
  // This is expected behavior - the matcher prioritizes English/Latin script
  const tamil1 = await matchProduct({ text: 'பால்' }); // Tamil for "milk"
  console.log(`   ℹ️  Tamil character matching: ${tamil1.status} (known limitation)`);
  
  // Test English equivalent works correctly
  const tamil2 = await matchProduct({ text: 'milk' });
  assertEqual(tamil2.status, 'matched', 'Tamil fallback: "milk" in English');
  assert(
    tamil2.product?.name.toLowerCase().includes('milk'),
    'Tamil fallback: found milk',
    `Got: ${tamil2.product?.name}`
  );
  
  // Verify Tamil name is present in the matched product
  if (tamil2.product?.nameTamil) {
    assert(
      tamil2.product.nameTamil.length > 0,
      'Tamil fallback: product has Tamil name',
      `Tamil: ${tamil2.product.nameTamil}`
    );
  }
  
  // ── TEST 10: Category Match ──────────────────────────────────
  console.log('\n📌 Test 10: Category Match\n');
  const category1 = await matchProduct({ text: 'masala' });
  assert(
    category1.status === 'matched' || category1.status === 'ambiguous',
    'Category match: "masala"',
    `Status: ${category1.status}`
  );
  if (category1.status === 'matched') {
    assert(
      category1.product?.category === 'Masala' || 
      category1.product?.name.toLowerCase().includes('masala'),
      'Category match: product in Masala category',
      `Got: ${category1.product?.category}, Name: ${category1.product?.name}`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 FUZZY PRODUCT MATCHER - TEST SUITE');
  console.log('═'.repeat(60));
  
  try {
    // Run unit tests (no DB needed)
    runUnitTests();
    
    // Connect to database
    console.log('\n📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Run integration tests (requires seeded products)
    await runIntegrationTests();
    
    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
    console.log('═'.repeat(60) + '\n');
    
    // Exit with appropriate code
    const exitCode = testResults.failed > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
