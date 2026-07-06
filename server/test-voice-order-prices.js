/**
 * Test script to verify voice order price calculation
 */

const Product = require('./models/Product');
const mongoose = require('mongoose');
require('dotenv').config();

async function testPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find sample products
    const products = await Product.find({
      $or: [
        { name: { $regex: 'rice', $options: 'i' } },
        { name: { $regex: 'oil', $options: 'i' } },
        { name: { $regex: 'mustard', $options: 'i' } }
      ]
    }).limit(6).lean();

    console.log('Sample Product Prices:\n');
    products.forEach(p => {
      console.log(`${p.name} (${p.unit}): ₹${p.price}`);
    });

    console.log('\n--- Simulating Voice Order ---\n');
    
    // Simulate: "1 kg rice, 2 liter oil"
    const order1 = [
      { product: products.find(p => /rice/i.test(p.name)), qty: 1 },
      { product: products.find(p => /oil/i.test(p.name) && /liter/i.test(p.unit || '')), qty: 2 }
    ].filter(o => o.product);

    if (order1.length > 0) {
      console.log('Order 1: "1 kg rice, 2 liter oil"');
      let total1 = 0;
      order1.forEach(item => {
        const itemTotal = item.product.price * item.qty;
        total1 += itemTotal;
        console.log(`  ${item.product.name} × ${item.qty} = ₹${item.product.price} × ${item.qty} = ₹${itemTotal}`);
      });
      console.log(`  TOTAL: ₹${total1}\n`);
    }

    // Simulate: "mustard oil"
    const mustardOil = products.find(p => /mustard/i.test(p.name) && /oil/i.test(p.name));
    if (mustardOil) {
      console.log('Order 2: "1 mustard oil"');
      console.log(`  ${mustardOil.name} × 1 = ₹${mustardOil.price}`);
      console.log(`  TOTAL: ₹${mustardOil.price}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPrices();
