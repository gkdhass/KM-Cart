/**
 * Check if "Cold-Pressed Oils" product exists in database
 */

const Product = require('./models/Product');
const mongoose = require('mongoose');
require('dotenv').config();

async function checkProduct() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Search for "Cold-Pressed Oils"
    const product = await Product.findOne({
      name: { $regex: 'Cold-Pressed', $options: 'i' }
    }).lean();

    if (!product) {
      console.log('❌ Product "Cold-Pressed Oils" NOT FOUND in database');
      console.log('This explains the "is no longer available" error\n');
      
      // Check if there are any products with "oil" in the name
      const oilProducts = await Product.find({
        name: { $regex: 'oil', $options: 'i' }
      }).limit(5).lean();
      
      console.log('Other oil products in database:');
      oilProducts.forEach(p => {
        console.log(`  - ${p.name} (stock: ${p.stock}, isActive: ${p.isActive !== false})`);
      });
    } else {
      console.log('✓ Product found:');
      console.log(`  Name: ${product.name}`);
      console.log(`  Stock: ${product.stock}`);
      console.log(`  isActive: ${product.isActive !== false}`);
      console.log(`  _id: ${product._id}`);
      console.log(`  Price: ₹${product.price}`);
      
      if (product.stock === 0) {
        console.log('\n⚠️ Product is OUT OF STOCK');
      }
      if (product.isActive === false) {
        console.log('\n⚠️ Product is DEACTIVATED (isActive: false)');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProduct();
