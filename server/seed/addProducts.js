/**
 * Seed script to add grocery products to the database.
 * Run: node seed/addProducts.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');

const products = [
  // ── Oil ──────────────────────────────────────
  {
    name: "Sunflower Oil 1L",
    description: "Refined sunflower cooking oil, 1L pack",
    price: 180,
    originalPrice: 200,
    discount: 10,
    stock: 100,
    category: "Oil",
    brand: "Fortune",
    unit: "Liter",
  },
  {
    name: "Groundnut Oil 1L",
    description: "Pure groundnut oil, rich flavor",
    price: 220,
    originalPrice: 250,
    discount: 12,
    stock: 80,
    category: "Oil",
    brand: "Dhara",
    unit: "Liter",
  },
  {
    name: "Coconut Oil 500ml",
    description: "Natural coconut oil for cooking",
    price: 160,
    originalPrice: 180,
    discount: 10,
    stock: 70,
    category: "Oil",
    brand: "Parachute",
    unit: "Liter",
  },
  {
    name: "Olive Oil 500ml",
    description: "Extra virgin olive oil",
    price: 450,
    originalPrice: 500,
    discount: 10,
    stock: 50,
    category: "Oil",
    brand: "Figaro",
    unit: "Liter",
  },
  {
    name: "Mustard Oil 1L",
    description: "Cold pressed mustard oil",
    price: 200,
    originalPrice: 230,
    discount: 13,
    stock: 90,
    category: "Oil",
    brand: "Engine",
    unit: "Liter",
  },

  // ── Masala ────────────────────────────────────
  {
    name: "Garam Masala 100g",
    description: "Blended spice mix for Indian cooking",
    price: 70,
    originalPrice: 80,
    discount: 12,
    stock: 100,
    category: "Masala",
    brand: "Aachi",
    unit: "Pack",
  },
  {
    name: "Chicken Masala 100g",
    description: "Spice mix for chicken dishes",
    price: 75,
    originalPrice: 90,
    discount: 15,
    stock: 80,
    category: "Masala",
    brand: "Sakthi",
    unit: "Pack",
  },
  {
    name: "Biryani Masala 100g",
    description: "Aromatic biryani spice mix",
    price: 85,
    originalPrice: 100,
    discount: 15,
    stock: 70,
    category: "Masala",
    brand: "Aachi",
    unit: "Pack",
  },
  {
    name: "Sambar Powder 200g",
    description: "Traditional South Indian sambar powder",
    price: 90,
    originalPrice: 110,
    discount: 18,
    stock: 60,
    category: "Masala",
    brand: "MTR",
    unit: "Pack",
  },
  {
    name: "Rasam Powder 100g",
    description: "Spicy rasam mix powder",
    price: 60,
    originalPrice: 70,
    discount: 10,
    stock: 80,
    category: "Masala",
    brand: "Aachi",
    unit: "Pack",
  },

  // ── Rice & Grains ────────────────────────────
  {
    name: "Basmati Rice 5kg",
    description: "Premium long grain basmati rice",
    price: 600,
    originalPrice: 700,
    discount: 14,
    stock: 50,
    category: "Rice & Grains",
    brand: "India Gate",
    unit: "Kg",
  },
  {
    name: "Ponni Rice 5kg",
    description: "Traditional ponni rice",
    price: 400,
    originalPrice: 450,
    discount: 11,
    stock: 60,
    category: "Rice & Grains",
    brand: "Local",
    unit: "Kg",
  },
  {
    name: "Wheat 2kg",
    description: "Whole wheat grains",
    price: 120,
    originalPrice: 140,
    discount: 14,
    stock: 80,
    category: "Rice & Grains",
    brand: "Aashirvaad",
    unit: "Kg",
  },
  {
    name: "Ragi 1kg",
    description: "Healthy ragi grains",
    price: 90,
    originalPrice: 110,
    discount: 18,
    stock: 70,
    category: "Rice & Grains",
    brand: "24 Mantra",
    unit: "Kg",
  },
  {
    name: "Mixed Millets 1kg",
    description: "Nutritious millet mix",
    price: 150,
    originalPrice: 180,
    discount: 16,
    stock: 60,
    category: "Rice & Grains",
    brand: "Organic India",
    unit: "Kg",
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Product.insertMany(products);
    console.log(`✅ Successfully added ${result.length} products:`);
    result.forEach((p) => console.log(`   • ${p.name} (${p.category}) — ₹${p.price}`));

    await mongoose.disconnect();
    console.log('\n✅ Done! Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedProducts();
