const mongoose = require('mongoose');
require('dotenv').config();

async function checkBrands() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const products = await mongoose.connection.db.collection('products')
    .find({})
    .limit(20)
    .toArray();
  
  console.log('=== SAMPLE PRODUCTS IN DATABASE ===\n');
  products.forEach(p => {
    console.log(`${p.name}`);
    console.log(`  Brand: ${p.brand}`);
    console.log(`  Category: ${p.category}`);
    console.log(`  Price: ₹${p.price}`);
    console.log();
  });
  
  const brands = [...new Set(products.map(p => p.brand))];
  console.log('Unique brands:', brands.join(', '));
  
  await mongoose.disconnect();
}

checkBrands();
