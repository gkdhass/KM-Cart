/**
 * Script to apply brand assignments to products in groceryProducts.js
 * Run after modifying allProducts array
 */

const fs = require('fs');
const path = require('path');

// Brand assignments per approved plan
const brandMap = {
  // Oil (8 products)
  'Sunflower Oil': 'Fortune',
  'Groundnut Oil': 'Dhara',
  'Coconut Oil': 'Parachute',
  'Mustard Oil': 'Fortune',
  'Gingelly Oil': 'Saffola',
  'Rice Bran Oil': 'Fortune',
  'Palm Oil': 'Dhara',
  'Olive Oil': 'Saffola',
  
  // Masala (8 products)
  'Turmeric Powder': 'MTR',
  'Red Chilli Powder': 'Everest',
  'Coriander Powder': 'Aachi',
  'Garam Masala': 'MTR',
  'Sambar Powder': 'MTR',
  'Rasam Powder': 'Aachi',
  'Pepper Powder': 'Sakthi',
  'Cumin Powder': 'Everest',
  
  // Rice & Grains (8 products)
  'Basmati Rice': 'India Gate',
  'Brown Rice': 'Daawat',
  'Wheat': 'India Gate',
  'Vermicelli': 'Daawat',
  
  // Dairy (5 products)
  'Milk': 'Amul',
  'Curd': 'Amul',
  'Butter': 'Amul',
  'Ghee': 'Amul',
  'Paneer': 'Nestle',
  
  // Personal Care (5 products)
  'Shampoo': 'Dove',
  'Conditioner': 'Dove',
  'Hair Oil': 'Parachute',
  'Face Wash': 'Pears',
  
  // Household & Cleaning (5 products)
  'Bath Soap': 'Pears',
  'Dishwash Liquid': 'Vim',
  'Floor Cleaner': 'Lizol',
  'Toilet Cleaner': 'Harpic',
};

const filePath = path.join(__dirname, 'groceryProducts.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace brand assignments in product objects
Object.entries(brandMap).forEach(([productName, brandName]) => {
  // Pattern: { name: 'ProductName', ... }
  // We need to add brand: 'BrandName' after the name
  const pattern = new RegExp(
    `(\\{ name: '${productName.replace(/[()]/g, '\\$&')}',\\s+nameTamil: '[^']+',)`,
    'g'
  );
  
  content = content.replace(pattern, `$1 brand: '${brandName}',`);
});

fs.writeFileSync(filePath, content);

console.log('✅ Brand assignments applied successfully!');
console.log('\nBranded products:');
Object.entries(brandMap).forEach(([product, brand]) => {
  console.log(`  ${product} → ${brand}`);
});
console.log(`\nTotal branded products: ${Object.keys(brandMap).length}/100`);
