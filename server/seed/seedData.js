/**
 * @file server/seed/seedData.js
 * @description Database seeder script for K_M_Cart.
 * Populates MongoDB with 500 products, FAQs, and test user with orders.
 * Run with: npm run seed (from the server directory)
 *
 * WARNING: This script drops existing data before seeding!
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const FAQ = require('../models/FAQ');
const connectDB = require('../config/db');

// Import product generator
const { generateAllProducts } = require('./generateProducts');

// ─────────────────────────────────────────────────────────────────────
// SAMPLE FAQs (10 items covering major customer concerns)
// ─────────────────────────────────────────────────────────────────────

const sampleFAQs = [
  {
    question: 'What is the return policy?',
    answer: '📦 We offer a **30-day hassle-free return policy**. If you\'re not satisfied with your purchase, you can return it within 30 days of delivery for a full refund. The product must be in its original packaging and unused condition. Return shipping is free for defective items.',
    keywords: ['return', 'refund', 'exchange'],
    category: 'returns',
  },
  {
    question: 'How long does delivery take?',
    answer: '🚚 Standard delivery takes **3-5 business days** across India. Express delivery (1-2 days) is available for metro cities at an additional charge of ₹99. Free shipping is available on all orders above ₹999.',
    keywords: ['delivery', 'shipping', 'time', 'how long', 'ship'],
    category: 'shipping',
  },
  {
    question: 'What payment methods are accepted?',
    answer: '💳 We accept multiple payment methods:\n\n• **Credit/Debit Cards** (Visa, Mastercard, RuPay)\n• **UPI** (Google Pay, PhonePe, Paytm)\n• **Net Banking** (All major banks)\n• **Cash on Delivery (COD)** — available on orders up to ₹50,000\n• **EMI options** available on orders above ₹3,000 (0% EMI on select cards)',
    keywords: ['payment', 'pay', 'upi', 'credit', 'debit', 'net banking', 'wallet'],
    category: 'payment',
  },
  {
    question: 'Is Cash on Delivery (COD) available?',
    answer: '💵 Yes! **Cash on Delivery** is available on orders up to ₹50,000. A small COD fee of ₹40 applies. COD is available in 20,000+ pin codes across India. You can check COD availability by entering your pin code at checkout.',
    keywords: ['cod', 'cash on delivery', 'cash'],
    category: 'payment',
  },
  {
    question: 'Are EMI options available?',
    answer: '📊 Yes! We offer **EMI (Easy Monthly Installments)** on orders above ₹3,000:\n\n• **No-Cost EMI**: Available on select credit cards (3, 6, 9 months)\n• **Standard EMI**: Available on all major credit cards (up to 24 months)\n• **Bajaj Finserv EMI**: Available for Bajaj card holders\n• **Cardless EMI**: Through ZestMoney, Simpl, and LazyPay',
    keywords: ['emi', 'installment', 'monthly'],
    category: 'payment',
  },
  {
    question: 'How do I cancel my order?',
    answer: '❌ You can cancel your order anytime **before it is shipped**:\n\n1. Go to **My Orders** page\n2. Select the order you want to cancel\n3. Click **Cancel Order** and select a reason\n4. Refund will be processed within **5-7 business days**\n\nOnce the order is shipped, you\'ll need to reject delivery or initiate a return after receiving it.',
    keywords: ['cancel', 'cancellation', 'cancel order'],
    category: 'returns',
  },
  {
    question: 'What is the warranty policy?',
    answer: '🛡️ All products come with the **manufacturer\'s warranty**:\n\n• **Mobiles**: 1 year manufacturer warranty\n• **Laptops**: 1-2 years depending on brand\n• **Tablets**: 1 year manufacturer warranty\n• **Accessories**: 6 months - 1 year warranty\n\nExtended warranty plans are available at checkout. Warranty does not cover physical damage or water damage.',
    keywords: ['warranty', 'guarantee', 'repair', 'service'],
    category: 'general',
  },
  {
    question: 'How can I track my order?',
    answer: '📍 You can track your order easily:\n\n1. Tell me your **Order ID** (e.g., ORD-2024-001) and I\'ll show you the status instantly\n2. Or go to **My Orders** page after logging in\n3. You\'ll also receive tracking updates via **email and SMS**\n\nTracking is updated in real-time once your order is shipped.',
    keywords: ['track', 'tracking', 'where is', 'status'],
    category: 'shipping',
  },
  {
    question: 'Do you offer international shipping?',
    answer: '🌍 Currently, we ship only within **India**. We are working on expanding to international markets soon! Sign up for our newsletter to be notified when international shipping becomes available.',
    keywords: ['international', 'abroad', 'overseas', 'foreign'],
    category: 'shipping',
  },
  {
    question: 'How do I contact customer support?',
    answer: '📞 You can reach our customer support team through:\n\n• **Chat**: Talk to me right here! I\'m available 24/7\n• **Email**: support@gkcart.com (response within 24 hours)\n• **Phone**: 1800-XXX-XXXX (Mon-Sat, 9 AM - 9 PM)\n• **WhatsApp**: +91-XXXXX-XXXXX\n\nFor urgent issues, phone support is the fastest option.',
    keywords: ['contact', 'support', 'help', 'customer service', 'phone', 'email'],
    category: 'general',
  },
];

// ─────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────

/**
 * Seeds the database with sample data.
 * Generates ~500 products, 10 FAQs, 1 test user, and sample orders.
 * Drops all existing data before seeding.
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // ── Clear existing data ──────────────────────────────────────────
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await FAQ.deleteMany({});
    console.log('   OK All collections cleared\n');

    // ── Generate and Seed Products ───────────────────────────────────
    console.log('Generating products...');
    const allProducts = generateAllProducts();
    console.log(`   Generated ${allProducts.length} products`);

    console.log('Inserting products into database...');
    const products = await Product.insertMany(allProducts);
    console.log(`   OK ${products.length} products created\n`);

    // ── Seed FAQs ────────────────────────────────────────────────────
    console.log('Seeding FAQs...');
    const faqs = await FAQ.insertMany(sampleFAQs);
    console.log(`   OK ${faqs.length} FAQs created\n`);

    // ── Create Test User ─────────────────────────────────────────────
    console.log('Creating test user...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@gkcart.com',
      password: 'password123',
    });
    console.log(`   OK Test user created: ${testUser.email}\n`);

    // ── Seed Orders for Test User ────────────────────────────────────
    console.log('Seeding orders for test user...');

    const sampleOrders = [
      {
        userId: testUser._id,
        orderId: 'ORD-2024-0001',
        products: [
          { productId: products[0]._id, name: products[0].name, image: products[0].image, brand: products[0].brand, qty: 1, price: products[0].price },
          { productId: products[5]._id, name: products[5].name, image: products[5].image, brand: products[5].brand, qty: 1, price: products[5].price },
        ],
        deliveryAddress: {
          fullName: 'Test User', phone: '9876543210',
          addressLine1: '123 MG Road', addressLine2: 'Apt 4B',
          city: 'Bangalore', state: 'Karnataka', pincode: '560001',
        },
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        subtotal: products[0].price + products[5].price,
        deliveryCharge: 0,
        tax: Math.round((products[0].price + products[5].price) * 0.18),
        totalAmount: Math.round((products[0].price + products[5].price) * 1.18),
        status: 'Shipped',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        orderId: 'ORD-2024-0002',
        products: [
          { productId: products[30]._id, name: products[30].name, image: products[30].image, brand: products[30].brand, qty: 1, price: products[30].price },
        ],
        deliveryAddress: {
          fullName: 'Test User', phone: '9876543210',
          addressLine1: '123 MG Road', addressLine2: 'Apt 4B',
          city: 'Bangalore', state: 'Karnataka', pincode: '560001',
        },
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        subtotal: products[30].price,
        deliveryCharge: 0,
        tax: Math.round(products[30].price * 0.18),
        totalAmount: Math.round(products[30].price * 1.18),
        status: 'Delivered',
        estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    const orders = await Order.insertMany(sampleOrders);
    console.log(`   OK ${orders.length} orders created\n`);

    // ── Category breakdown ───────────────────────────────────────────
    const categories = {};
    allProducts.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    // ── Summary ──────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════');
    console.log('  Database seeded successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Products: ${products.length}`);
    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`     └─ ${cat}: ${count}`);
    });
    console.log(`  FAQs:     ${faqs.length}`);
    console.log(`  Users:    1 (test@gkcart.com / password123)`);
    console.log(`  Orders:   ${orders.length}`);
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
