/**
 * @file client/src/utils/voiceParser.test.js
 * @description Manual test cases for voice parser
 * Run in browser console or Node.js
 */

import { parseShoppingList, formatParsedItems } from './voiceParser.js';

// Test cases
const testCases = [
  {
    name: 'Simple list with quantities and units',
    input: '2 kg rice, 500 grams sugar, 3 packets biscuits',
    expected: {
      itemCount: 3,
      items: [
        { productName: 'rice', quantity: 2, unit: 'Kg' },
        { productName: 'sugar', quantity: 500, unit: 'Kg' },
        { productName: 'biscuits', quantity: 3, unit: 'Pack' },
      ],
    },
  },
  {
    name: 'Mixed with "and" separator',
    input: '1 liter milk and 2 kg tomatoes and 3 pieces chicken',
    expected: {
      itemCount: 3,
    },
  },
  {
    name: 'Special quantities',
    input: 'half kg turmeric powder, quarter kg pepper, dozen eggs',
    expected: {
      itemCount: 3,
      items: [
        { productName: 'turmeric powder', quantity: 0.5, unit: 'Kg' },
        { productName: 'pepper', quantity: 0.25, unit: 'Kg' },
        { productName: 'eggs', quantity: 12, unit: 'Piece' },
      ],
    },
  },
  {
    name: 'Commands mixed with items',
    input: '2 kg rice, show total bill, 3 packets biscuits, checkout',
    expected: {
      itemCount: 2,
      commandCount: 2,
    },
  },
  {
    name: 'Price hints',
    input: 'basmati rice under 200 rupees, sunflower oil for 150',
    expected: {
      itemCount: 2,
      items: [
        { productName: 'basmati rice', priceHint: 200 },
        { productName: 'sunflower oil', priceHint: 150 },
      ],
    },
  },
  {
    name: 'Duplicate merging',
    input: '2 kg rice, 3 kg rice, 1 kg rice',
    expected: {
      itemCount: 1,
      items: [{ productName: 'rice', quantity: 6, unit: 'Kg' }],
    },
  },
  {
    name: 'No quantities (defaults)',
    input: 'milk, bread, eggs',
    expected: {
      itemCount: 3,
      items: [
        { productName: 'milk', quantity: 1 },
        { productName: 'bread', quantity: 1 },
        { productName: 'eggs', quantity: 1 },
      ],
    },
  },
  {
    name: 'Remove command',
    input: 'remove rice, delete sugar, cancel order',
    expected: {
      commandCount: 3,
    },
  },
  {
    name: 'Natural speech with fillers',
    input: 'I need 2 kg rice, please add 500 grams sugar, and give me 3 packets of biscuits',
    expected: {
      itemCount: 3,
    },
  },
  {
    name: 'Empty input',
    input: '',
    expected: {
      itemCount: 0,
      commandCount: 0,
    },
  },
];

// Run tests
export function runVoiceParserTests() {
  console.log('🧪 Running Voice Parser Tests\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    console.log(`\n📝 Test ${index + 1}: ${test.name}`);
    console.log(`Input: "${test.input}"`);

    const result = parseShoppingList(test.input);

    console.log(`\nResult:`);
    console.log(`  Items: ${result.items.length}`);
    console.log(`  Commands: ${result.commands.length}`);

    // Validate expectations
    let testPassed = true;

    if (test.expected.itemCount !== undefined) {
      if (result.items.length !== test.expected.itemCount) {
        console.log(`  ❌ Expected ${test.expected.itemCount} items, got ${result.items.length}`);
        testPassed = false;
      } else {
        console.log(`  ✅ Item count matches: ${result.items.length}`);
      }
    }

    if (test.expected.commandCount !== undefined) {
      if (result.commands.length !== test.expected.commandCount) {
        console.log(`  ❌ Expected ${test.expected.commandCount} commands, got ${result.commands.length}`);
        testPassed = false;
      } else {
        console.log(`  ✅ Command count matches: ${result.commands.length}`);
      }
    }

    // Show parsed items
    if (result.items.length > 0) {
      console.log('\n  Parsed Items:');
      result.items.forEach((item, i) => {
        console.log(`    ${i + 1}. ${item.productName} - ${item.quantity}${item.unit ? ` ${item.unit}` : ''}`);
        if (item.priceHint) {
          console.log(`       Price hint: under ₹${item.priceHint}`);
        }
      });
    }

    // Show commands
    if (result.commands.length > 0) {
      console.log('\n  Parsed Commands:');
      result.commands.forEach((cmd, i) => {
        console.log(`    ${i + 1}. ${cmd.type} - "${cmd.text}"`);
      });
    }

    if (testPassed) {
      console.log(`\n✅ Test ${index + 1} PASSED`);
      passed++;
    } else {
      console.log(`\n❌ Test ${index + 1} FAILED`);
      failed++;
    }

    console.log('-'.repeat(60));
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  console.log('='.repeat(60) + '\n');
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.runVoiceParserTests = runVoiceParserTests;
  console.log('💡 Run tests in console: runVoiceParserTests()');
}
