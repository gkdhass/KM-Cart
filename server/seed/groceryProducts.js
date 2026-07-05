/**
 * @file server/seed/groceryProducts.js
 * @description Seeds K_M_Cart with 100+ Tamil grocery products across 17 categories.
 * Each product has permanent Unsplash CDN image URLs (direct photo links that never expire).
 * Run: node seed/groceryProducts.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const connectDB = require('../config/db');

// ═══════════════════════════════════════════════════════════════
// PERMANENT UNSPLASH CDN IMAGE URLS (direct photo links)
// These use images.unsplash.com/photo-{id} format — never expire
// ═══════════════════════════════════════════════════════════════

const allProducts = [

  // ── OIL — எண்ணெய் வகைகள் ──────────────────────────────────
  { name: 'Sunflower Oil', nameTamil: 'சூரியகாந்தி எண்ணெய்', brand: 'Fortune', price: 180, unit: 'Liter', category: 'Oil', description: 'Pure refined sunflower oil. Light and healthy for daily cooking.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop'] },
  { name: 'Groundnut Oil', nameTamil: 'நிலக்கடலை எண்ணெய்', brand: 'Dhara', price: 220, unit: 'Liter', category: 'Oil', description: 'Cold pressed groundnut oil with rich natural flavor.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop'] },
  { name: 'Coconut Oil', nameTamil: 'தேங்காய் எண்ணெய்', brand: 'Parachute', price: 250, unit: 'Liter', category: 'Oil', description: 'Pure virgin coconut oil. Best for South Indian cooking.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=300&h=300&fit=crop'] },
  { name: 'Mustard Oil', nameTamil: 'கடுகு எண்ணெய்', brand: 'Fortune', price: 195, unit: 'Liter', category: 'Oil', description: 'Kachi ghani mustard oil with strong flavor.',
    images: ['https://images.unsplash.com/photo-1612187915600-5e3c3a6b3e6e?w=300&h=300&fit=crop'] },
  { name: 'Gingelly Oil', nameTamil: 'நல்லெண்ணெய்', brand: 'Saffola', price: 350, unit: 'Liter', category: 'Oil', description: 'Pure sesame gingelly oil. Traditional and healthy.',
    images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=300&h=300&fit=crop'] },
  { name: 'Rice Bran Oil', nameTamil: 'அரிசி தவிடு எண்ணெய்', brand: 'Fortune', price: 165, unit: 'Liter', category: 'Oil', description: 'Light rice bran oil with high smoke point.',
    images: ['https://images.unsplash.com/photo-1505576399279-0d309eeaf9dc?w=300&h=300&fit=crop'] },
  { name: 'Palm Oil', nameTamil: 'பனை எண்ணெய்', brand: 'Dhara', price: 140, unit: 'Liter', category: 'Oil', description: 'Refined palm oil for everyday cooking.',
    images: ['https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&h=300&fit=crop'] },
  { name: 'Olive Oil', nameTamil: 'ஆலிவ் எண்ணெய்', brand: 'Saffola', price: 650, unit: 'Liter', category: 'Oil', description: 'Extra virgin olive oil. Perfect for salads and dressings.',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop&q=80'] },

  // ── MASALA — மசாலா வகைகள் ──────────────────────────────────
  { name: 'Turmeric Powder', nameTamil: 'மஞ்சள் தூள்', brand: 'MTR', price: 85, unit: 'Kg', category: 'Masala', description: 'Pure turmeric powder. Natural color and aroma.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&h=300&fit=crop'] },
  { name: 'Red Chilli Powder', nameTamil: 'மிளகாய் தூள்', brand: 'Everest', price: 120, unit: 'Kg', category: 'Masala', description: 'Spicy red chilli powder for bold flavor.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop&q=80'] },
  { name: 'Coriander Powder', nameTamil: 'மல்லி தூள்', brand: 'Aachi', price: 95, unit: 'Kg', category: 'Masala', description: 'Freshly ground coriander powder.',
    images: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300&h=300&fit=crop'] },
  { name: 'Garam Masala', nameTamil: 'கரம் மசாலா', brand: 'MTR', price: 150, unit: 'Kg', category: 'Masala', description: 'Aromatic blend of whole spices.',
    images: ['https://images.unsplash.com/photo-1532336414041-8e2b9eec0be3?w=300&h=300&fit=crop'] },
  { name: 'Sambar Powder', nameTamil: 'சாம்பார் தூள்', brand: 'MTR', price: 110, unit: 'Kg', category: 'Masala', description: 'Authentic Tamil sambar powder blend.',
    images: ['https://images.unsplash.com/photo-1599909533601-fc16cf6a1fd7?w=300&h=300&fit=crop'] },
  { name: 'Rasam Powder', nameTamil: 'ரசம் தூள்', brand: 'Aachi', price: 100, unit: 'Kg', category: 'Masala', description: 'Traditional rasam powder for tangy taste.',
    images: ['https://images.unsplash.com/photo-1607672632467-9a6e798b4b22?w=300&h=300&fit=crop'] },
  { name: 'Pepper Powder', nameTamil: 'மிளகு தூள்', brand: 'Sakthi', price: 180, unit: 'Kg', category: 'Masala', description: 'Fresh ground black pepper powder.',
    images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=300&fit=crop'] },
  { name: 'Cumin Powder', nameTamil: 'சீரகம் தூள்', brand: 'Everest', price: 130, unit: 'Kg', category: 'Masala', description: 'Freshly ground cumin powder.',
    images: ['https://images.unsplash.com/photo-1580893246395-52aead8960dc?w=300&h=300&fit=crop'] },

  // ── RICE & GRAINS — அரிசி & தானியங்கள் ─────────────────────
  { name: 'Basmati Rice', nameTamil: 'பாஸ்மதி அரிசி', brand: 'India Gate', price: 120, unit: 'Kg', category: 'Rice & Grains', description: 'Long grain premium basmati rice.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop'] },
  { name: 'Ponni Rice', nameTamil: 'பொன்னி அரிசி', price: 65, unit: 'Kg', category: 'Rice & Grains', description: 'Popular Tamil Nadu ponni boiled rice.',
    images: ['https://images.unsplash.com/photo-1536304993881-460e4b1f11a1?w=300&h=300&fit=crop'] },
  { name: 'Brown Rice', nameTamil: 'பழுப்பு அரிசி', brand: 'Daawat', price: 90, unit: 'Kg', category: 'Rice & Grains', description: 'Healthy whole grain brown rice.',
    images: ['https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&h=300&fit=crop'] },
  { name: 'Raw Rice', nameTamil: 'பச்சரிசி', price: 55, unit: 'Kg', category: 'Rice & Grains', description: 'Fresh raw rice for daily cooking.',
    images: ['https://images.unsplash.com/photo-1594055397022-e36a6e1f2a53?w=300&h=300&fit=crop'] },
  { name: 'Wheat', nameTamil: 'கோதுமை', brand: 'India Gate', price: 45, unit: 'Kg', category: 'Rice & Grains', description: 'Whole wheat grains for flour making.',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop'] },
  { name: 'Rava', nameTamil: 'ரவை', price: 50, unit: 'Kg', category: 'Rice & Grains', description: 'Fine semolina rava for upma and halwa.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop'] },
  { name: 'Maida', nameTamil: 'மைதா', price: 48, unit: 'Kg', category: 'Rice & Grains', description: 'Refined all purpose flour.',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop'] },
  { name: 'Vermicelli', nameTamil: 'சேமியா', brand: 'Daawat', price: 60, unit: 'Kg', category: 'Rice & Grains', description: 'Fine vermicelli for kheer and upma.',
    images: ['https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&h=300&fit=crop'] },

  // ── PULSES & DAL — பருப்பு வகைகள் ─────────────────────────
  { name: 'Toor Dal', nameTamil: 'துவரம் பருப்பு', price: 140, unit: 'Kg', category: 'Pulses & Dal', description: 'Premium toor dal for sambar and dal.', isFeatured: true,
    images: ['https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=300&h=300&fit=crop'] },
  { name: 'Urad Dal', nameTamil: 'உளுந்து', price: 160, unit: 'Kg', category: 'Pulses & Dal', description: 'White urad dal for idli and dosa batter.',
    images: ['https://images.unsplash.com/photo-1585996340862-fc5eca745782?w=300&h=300&fit=crop'] },
  { name: 'Moong Dal', nameTamil: 'பாசிப்பருப்பு', price: 130, unit: 'Kg', category: 'Pulses & Dal', description: 'Split moong dal. Easy to digest and healthy.',
    images: ['https://images.unsplash.com/photo-1612257416648-ee7a6c533fad?w=300&h=300&fit=crop'] },
  { name: 'Chana Dal', nameTamil: 'கடலை பருப்பு', price: 115, unit: 'Kg', category: 'Pulses & Dal', description: 'Yellow chana dal for dal and sundal.',
    images: ['https://images.unsplash.com/photo-1515543904462-3456a4544e33?w=300&h=300&fit=crop'] },
  { name: 'Masoor Dal', nameTamil: 'மசூர் பருப்பு', price: 125, unit: 'Kg', category: 'Pulses & Dal', description: 'Red masoor lentils. Quick cooking dal.',
    images: ['https://images.unsplash.com/photo-1617692855027-33b14f061079?w=300&h=300&fit=crop'] },
  { name: 'Green Gram', nameTamil: 'பச்சைப்பயறு', price: 120, unit: 'Kg', category: 'Pulses & Dal', description: 'Whole green gram for sprouts and curries.',
    images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=300&h=300&fit=crop'] },
  { name: 'Black Chana', nameTamil: 'கருப்பு கொண்டைக்கடலை', price: 110, unit: 'Kg', category: 'Pulses & Dal', description: 'Protein rich black chickpeas.',
    images: ['https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&h=300&fit=crop'] },
  { name: 'White Chana', nameTamil: 'வெள்ளை கொண்டைக்கடலை', price: 105, unit: 'Kg', category: 'Pulses & Dal', description: 'White chickpeas for chole and sundal.',
    images: ['https://images.unsplash.com/photo-1515543904462-3456a4544e33?w=300&h=300&fit=crop&q=80'] },

  // ── SPICES — முழு மசாலா ───────────────────────────────────
  { name: 'Mustard Seeds', nameTamil: 'கடுகு', price: 80, unit: 'Kg', category: 'Spices', description: 'Whole black mustard seeds for tempering.',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop&q=70'] },
  { name: 'Cumin Seeds', nameTamil: 'சீரகம்', price: 200, unit: 'Kg', category: 'Spices', description: 'Aromatic cumin seeds for cooking.',
    images: ['https://images.unsplash.com/photo-1599909533601-fc16cf6a1fd7?w=300&h=300&fit=crop&q=80'] },
  { name: 'Fenugreek Seeds', nameTamil: 'வெந்தயம்', price: 90, unit: 'Kg', category: 'Spices', description: 'Bitter fenugreek seeds. Good for health.',
    images: ['https://images.unsplash.com/photo-1532336414041-8e2b9eec0be3?w=300&h=300&fit=crop&q=80'] },
  { name: 'Fennel Seeds', nameTamil: 'சோம்பு', price: 150, unit: 'Kg', category: 'Spices', description: 'Sweet fennel seeds for flavoring.',
    images: ['https://images.unsplash.com/photo-1580893246395-52aead8960dc?w=300&h=300&fit=crop&q=80'] },
  { name: 'Cloves', nameTamil: 'கிராம்பு', price: 800, unit: 'Kg', category: 'Spices', description: 'Whole cloves for biryani and masala.',
    images: ['https://images.unsplash.com/photo-1538239351001-5bf2e51ad42b?w=300&h=300&fit=crop'] },
  { name: 'Cardamom', nameTamil: 'ஏலக்காய்', price: 1200, unit: 'Kg', category: 'Spices', description: 'Green cardamom pods for sweets and tea.',
    images: ['https://images.unsplash.com/photo-1607677703496-a367a3a24680?w=300&h=300&fit=crop'] },
  { name: 'Cinnamon', nameTamil: 'இலவங்கப்பட்டை', price: 400, unit: 'Kg', category: 'Spices', description: 'Whole cinnamon sticks for biryani.',
    images: ['https://images.unsplash.com/photo-1587131782738-de30ea91a542?w=300&h=300&fit=crop'] },
  { name: 'Bay Leaf', nameTamil: 'பிரியாணி இலை', price: 200, unit: 'Kg', category: 'Spices', description: 'Dried bay leaves for biryani and curries.',
    images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=300&h=300&fit=crop&q=80'] },

  // ── SUGAR & SWEETENERS — சர்க்கரை ─────────────────────────
  { name: 'White Sugar', nameTamil: 'வெள்ளை சர்க்கரை', price: 50, unit: 'Kg', category: 'Sugar & Sweeteners', description: 'Pure refined white sugar.',
    images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop'] },
  { name: 'Brown Sugar', nameTamil: 'பழுப்பு சர்க்கரை', price: 80, unit: 'Kg', category: 'Sugar & Sweeteners', description: 'Natural brown sugar with molasses flavor.',
    images: ['https://images.unsplash.com/photo-1604431696980-07e518647610?w=300&h=300&fit=crop'] },
  { name: 'Jaggery', nameTamil: 'வெல்லம்', price: 70, unit: 'Kg', category: 'Sugar & Sweeteners', description: 'Pure sugarcane jaggery. No chemicals.',
    images: ['https://images.unsplash.com/photo-1604431696980-07e518647610?w=300&h=300&fit=crop&q=80'] },
  { name: 'Honey', nameTamil: 'தேன்', price: 350, unit: 'Kg', category: 'Sugar & Sweeteners', description: 'Pure natural honey. Raw and unprocessed.',
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop'] },
  { name: 'Rock Sugar', nameTamil: 'கல்கண்டு', price: 120, unit: 'Kg', category: 'Sugar & Sweeteners', description: 'Crystal rock sugar for sweets and drinks.',
    images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop&q=80'] },

  // ── BEVERAGES — பானங்கள் ───────────────────────────────────
  { name: 'Tea Powder', nameTamil: 'தேயிலை தூள்', price: 280, unit: 'Kg', category: 'Beverages', description: 'Premium CTC tea powder for strong tea.',
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop'] },
  { name: 'Coffee Powder', nameTamil: 'காப்பி தூள்', price: 350, unit: 'Kg', category: 'Beverages', description: 'Freshly roasted coffee powder blend.',
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop'] },
  { name: 'Green Tea', nameTamil: 'கிரீன் டீ', price: 200, unit: 'Pack', category: 'Beverages', description: 'Healthy antioxidant rich green tea bags.',
    images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=300&fit=crop'] },
  { name: 'Boost', nameTamil: 'பூஸ்ட்', price: 220, unit: 'Pack', category: 'Beverages', description: 'Energy and sports nutrition drink.',
    images: ['https://images.unsplash.com/photo-1544252890-c3e95e867194?w=300&h=300&fit=crop'] },
  { name: 'Horlicks', nameTamil: 'ஹார்லிக்ஸ்', price: 240, unit: 'Pack', category: 'Beverages', description: 'Nourishing health drink for growth.',
    images: ['https://images.unsplash.com/photo-1573750216245-4508fa15bbc2?w=300&h=300&fit=crop'] },

  // ── HOUSEHOLD & CLEANING — வீட்டு சுத்தம் ─────────────────
  { name: 'Bath Soap', nameTamil: 'குளியல் சோப்பு', brand: 'Pears', price: 45, unit: 'Piece', category: 'Household & Cleaning', description: 'Gentle moisturizing bath soap.',
    images: ['https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=300&h=300&fit=crop'] },
  { name: 'Detergent Powder', nameTamil: 'சலவை தூள்', price: 120, unit: 'Kg', category: 'Household & Cleaning', description: 'Powerful detergent for clean clothes.',
    images: ['https://images.unsplash.com/photo-1585227538757-de2f209ad70c?w=300&h=300&fit=crop'] },
  { name: 'Dishwash Liquid', nameTamil: 'பாத்திரம் கழுவும் திரவம்', brand: 'Vim', price: 95, unit: 'Liter', category: 'Household & Cleaning', description: 'Grease cutting dishwash liquid.',
    images: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop'] },
  { name: 'Floor Cleaner', nameTamil: 'தரை சுத்தம் திரவம்', brand: 'Lizol', price: 110, unit: 'Liter', category: 'Household & Cleaning', description: 'Disinfectant floor cleaner with fresh scent.',
    images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop'] },
  { name: 'Toilet Cleaner', nameTamil: 'கழிப்பறை சுத்தம் திரவம்', brand: 'Harpic', price: 85, unit: 'Liter', category: 'Household & Cleaning', description: 'Powerful toilet cleaning liquid.',
    images: ['https://images.unsplash.com/photo-1585227538757-de2f209ad70c?w=300&h=300&fit=crop&q=80'] },

  // ── PACKAGED & READY — தயார் உணவுகள் ──────────────────────
  { name: 'Instant Noodles', nameTamil: 'உடனடி நூடுல்ஸ்', price: 15, unit: 'Pack', category: 'Packaged & Ready', description: 'Quick cook instant noodles. Ready in 2 mins.',
    images: ['https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&h=300&fit=crop'] },
  { name: 'Pasta', nameTamil: 'பாஸ்தா', price: 60, unit: 'Pack', category: 'Packaged & Ready', description: 'Italian style pasta. Various shapes available.',
    images: ['https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&h=300&fit=crop&q=80'] },
  { name: 'Oats', nameTamil: 'ஓட்ஸ்', price: 180, unit: 'Pack', category: 'Packaged & Ready', description: 'Healthy rolled oats for breakfast.',
    images: ['https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&h=300&fit=crop'] },
  { name: 'Cornflakes', nameTamil: 'கார்ன் ஃப்ளேக்ஸ்', price: 200, unit: 'Pack', category: 'Packaged & Ready', description: 'Crispy cornflakes breakfast cereal.',
    images: ['https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=300&h=300&fit=crop'] },
  { name: 'Instant Mix', nameTamil: 'உடனடி கலவை', price: 75, unit: 'Pack', category: 'Packaged & Ready', description: 'Ready to cook instant mix packets.',
    images: ['https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=300&h=300&fit=crop'] },

  // ── DAIRY — பால் பொருட்கள் ────────────────────────────────
  { name: 'Milk', nameTamil: 'பால்', brand: 'Amul', price: 28, unit: 'Liter', category: 'Dairy', description: 'Fresh full cream milk. Daily delivery.',
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop'] },
  { name: 'Curd', nameTamil: 'தயிர்', brand: 'Amul', price: 40, unit: 'Kg', category: 'Dairy', description: 'Fresh set curd. Thick and creamy.',
    images: ['https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300&h=300&fit=crop'] },
  { name: 'Butter', nameTamil: 'வெண்ணெய்', brand: 'Amul', price: 55, unit: 'Pack', category: 'Dairy', description: 'Salted butter pack. Creamy and fresh.',
    images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc0d?w=300&h=300&fit=crop'] },
  { name: 'Ghee', nameTamil: 'நெய்', brand: 'Amul', price: 550, unit: 'Liter', category: 'Dairy', description: 'Pure cow ghee. Traditional taste.',
    images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop'] },
  { name: 'Paneer', nameTamil: 'பன்னீர்', brand: 'Nestle', price: 80, unit: 'Pack', category: 'Dairy', description: 'Fresh soft paneer for curries.',
    images: ['https://images.unsplash.com/photo-1631452180775-4ddb5b900e79?w=300&h=300&fit=crop'] },

  // ── SNACKS — நொறுக்குத் தீனிகள் ──────────────────────────
  { name: 'Chips', nameTamil: 'சிப்ஸ்', price: 20, unit: 'Pack', category: 'Snacks', description: 'Crispy potato chips. Multiple flavors.',
    images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop'] },
  { name: 'Mixture', nameTamil: 'மிக்சர்', price: 80, unit: 'Pack', category: 'Snacks', description: 'Spicy Tamil mixture snack pack.',
    images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=300&fit=crop'] },
  { name: 'Murukku', nameTamil: 'முறுக்கு', price: 120, unit: 'Kg', category: 'Snacks', description: 'Crispy rice flour murukku. Traditional taste.',
    images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop'] },
  { name: 'Namkeen', nameTamil: 'நம்கீன்', price: 60, unit: 'Pack', category: 'Snacks', description: 'Savory namkeen snack mix.',
    images: ['https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=300&h=300&fit=crop'] },
  { name: 'Popcorn', nameTamil: 'பொப்கார்ன்', price: 30, unit: 'Pack', category: 'Snacks', description: 'Butter popcorn. Ready to eat.',
    images: ['https://images.unsplash.com/photo-1585735935302-404760228d5d?w=300&h=300&fit=crop'] },

  // ── BISCUITS & COOKIES — பிஸ்கட் வகைகள் ───────────────────
  { name: 'Marie Biscuits', nameTamil: 'மரி பிஸ்கட்', price: 30, unit: 'Pack', category: 'Biscuits & Cookies', description: 'Classic marie tea biscuits.',
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop'] },
  { name: 'Cream Biscuits', nameTamil: 'கிரீம் பிஸ்கட்', price: 25, unit: 'Pack', category: 'Biscuits & Cookies', description: 'Sweet cream filled biscuits.',
    images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop'] },
  { name: 'Digestive Biscuits', nameTamil: 'டைஜெஸ்டிவ் பிஸ்கட்', price: 55, unit: 'Pack', category: 'Biscuits & Cookies', description: 'Healthy whole wheat digestive biscuits.',
    images: ['https://images.unsplash.com/photo-1590080875852-ba44e3266e76?w=300&h=300&fit=crop'] },
  { name: 'Chocolate Cookies', nameTamil: 'சாக்லேட் குக்கீஸ்', price: 70, unit: 'Pack', category: 'Biscuits & Cookies', description: 'Rich chocolate chip cookies.',
    images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop'] },
  { name: 'Butter Cookies', nameTamil: 'பட்டர் குக்கீஸ்', price: 65, unit: 'Pack', category: 'Biscuits & Cookies', description: 'Melt in mouth butter cookies.',
    images: ['https://images.unsplash.com/photo-1618923850107-d1ddd5e7ac82?w=300&h=300&fit=crop'] },

  // ── CHOCOLATES — சாக்லேட் ─────────────────────────────────
  { name: 'Milk Chocolate', nameTamil: 'பால் சாக்லேட்', price: 50, unit: 'Pack', category: 'Chocolates', description: 'Creamy milk chocolate bar.',
    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=300&fit=crop'] },
  { name: 'Dark Chocolate', nameTamil: 'டார்க் சாக்லேட்', price: 80, unit: 'Pack', category: 'Chocolates', description: 'Rich 70% dark chocolate bar.',
    images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop&q=80'] },
  { name: 'Candy', nameTamil: 'மிட்டாய்', price: 10, unit: 'Pack', category: 'Chocolates', description: 'Assorted fruit candy pack.',
    images: ['https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=300&h=300&fit=crop'] },
  { name: 'Lollipop', nameTamil: 'லாலிபாப்', price: 5, unit: 'Piece', category: 'Chocolates', description: 'Colorful fruit flavored lollipop.',
    images: ['https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=300&h=300&fit=crop'] },
  { name: 'Chewing Gum', nameTamil: 'சுவையூட்டும் கம்', price: 10, unit: 'Pack', category: 'Chocolates', description: 'Fresh mint chewing gum pack.',
    images: ['https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=300&h=300&fit=crop&q=80'] },

  // ── JUICES & DRINKS — குளிர்பானங்கள் ──────────────────────
  { name: 'Orange Juice', nameTamil: 'ஆரஞ்சு ஜூஸ்', price: 80, unit: 'Liter', category: 'Juices & Drinks', description: 'Fresh squeezed orange juice.',
    images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop'] },
  { name: 'Apple Juice', nameTamil: 'ஆப்பிள் ஜூஸ்', price: 90, unit: 'Liter', category: 'Juices & Drinks', description: 'Pure apple juice. No added sugar.',
    images: ['https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=300&h=300&fit=crop'] },
  { name: 'Mango Juice', nameTamil: 'மாம்பழ ஜூஸ்', price: 85, unit: 'Liter', category: 'Juices & Drinks', description: 'Real mango pulp juice drink.',
    images: ['https://images.unsplash.com/photo-1546173159-315724a31696?w=300&h=300&fit=crop'] },
  { name: 'Cola', nameTamil: 'கோலா', price: 40, unit: 'Liter', category: 'Juices & Drinks', description: 'Refreshing cola soft drink.',
    images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=300&fit=crop'] },
  { name: 'Lemon Soda', nameTamil: 'எலுமிச்சை சோடா', price: 30, unit: 'Liter', category: 'Juices & Drinks', description: 'Tangy lemon flavored soda drink.',
    images: ['https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop'] },

  // ── DRY FRUITS & NUTS — உலர் பழங்கள் ─────────────────────
  { name: 'Almonds', nameTamil: 'பாதாம்', price: 800, unit: 'Kg', category: 'Dry Fruits & Nuts', description: 'Premium California almonds. Rich in nutrients.',
    images: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=300&h=300&fit=crop'] },
  { name: 'Cashews', nameTamil: 'முந்திரி', price: 950, unit: 'Kg', category: 'Dry Fruits & Nuts', description: 'Whole cashew nuts. Crunchy and delicious.',
    images: ['https://images.unsplash.com/photo-1563292769-4e05b684851a?w=300&h=300&fit=crop'] },
  { name: 'Pistachios', nameTamil: 'பிஸ்தா', price: 1100, unit: 'Kg', category: 'Dry Fruits & Nuts', description: 'Roasted and salted pistachio nuts.',
    images: ['https://images.unsplash.com/photo-1525110025043-4dfcbe56f08f?w=300&h=300&fit=crop'] },
  { name: 'Raisins', nameTamil: 'திராட்சை', price: 300, unit: 'Kg', category: 'Dry Fruits & Nuts', description: 'Seedless black raisins. Sweet and juicy.',
    images: ['https://images.unsplash.com/photo-1596273312270-2c3e0a07c3b4?w=300&h=300&fit=crop'] },
  { name: 'Dates', nameTamil: 'பேரிச்சம்பழம்', price: 250, unit: 'Kg', category: 'Dry Fruits & Nuts', description: 'Soft Medjool dates. Natural sweetener.',
    images: ['https://images.unsplash.com/photo-1610300124948-1fa2bf13fa58?w=300&h=300&fit=crop'] },

  // ── PICKLES & SAUCES — ஊறுகாய் ────────────────────────────
  { name: 'Mango Pickle', nameTamil: 'மாங்காய் ஊறுகாய்', price: 120, unit: 'Pack', category: 'Pickles & Sauces', description: 'Spicy raw mango pickle. Traditional recipe.',
    images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop&q=80'] },
  { name: 'Lemon Pickle', nameTamil: 'எலுமிச்சை ஊறுகாய்', price: 100, unit: 'Pack', category: 'Pickles & Sauces', description: 'Tangy lemon pickle with spices.',
    images: ['https://images.unsplash.com/photo-1596097635092-6e73fed5ecb5?w=300&h=300&fit=crop'] },
  { name: 'Tomato Ketchup', nameTamil: 'தக்காளி சாஸ்', price: 85, unit: 'Pack', category: 'Pickles & Sauces', description: 'Thick tomato ketchup. Perfect for snacks.',
    images: ['https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&h=300&fit=crop'] },
  { name: 'Chilli Sauce', nameTamil: 'மிளகாய் சாஸ்', price: 75, unit: 'Pack', category: 'Pickles & Sauces', description: 'Hot and spicy chilli sauce.',
    images: ['https://images.unsplash.com/photo-1590159983013-d4ff5fc71c1d?w=300&h=300&fit=crop'] },
  { name: 'Soy Sauce', nameTamil: 'சோயா சாஸ்', price: 70, unit: 'Pack', category: 'Pickles & Sauces', description: 'Dark soy sauce for Chinese cooking.',
    images: ['https://images.unsplash.com/photo-1590159983013-d4ff5fc71c1d?w=300&h=300&fit=crop&q=80'] },

  // ── PERSONAL CARE — தனிநபர் பராமரிப்பு ────────────────────
  { name: 'Shampoo', nameTamil: 'ஷாம்பு', brand: 'Dove', price: 180, unit: 'Pack', category: 'Personal Care', description: 'Nourishing shampoo for healthy hair.',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop'] },
  { name: 'Conditioner', nameTamil: 'கண்டிஷனர்', brand: 'Dove', price: 200, unit: 'Pack', category: 'Personal Care', description: 'Smoothing hair conditioner.',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop&q=80'] },
  { name: 'Hair Oil', nameTamil: 'முடி எண்ணெய்', brand: 'Parachute', price: 150, unit: 'Pack', category: 'Personal Care', description: 'Nourishing coconut hair oil.',
    images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=300&fit=crop'] },
  { name: 'Face Wash', nameTamil: 'முகம் கழுவும் திரவம்', brand: 'Pears', price: 120, unit: 'Pack', category: 'Personal Care', description: 'Gentle face wash for glowing skin.',
    images: ['https://images.unsplash.com/photo-1556228841-a3c3dab3e755?w=300&h=300&fit=crop'] },
  { name: 'Toothpaste', nameTamil: 'பற்பசை', price: 80, unit: 'Pack', category: 'Personal Care', description: 'Whitening toothpaste with fresh mint.',
    images: ['https://images.unsplash.com/photo-1559304787-e8b067e0d30d?w=300&h=300&fit=crop'] },
];

// ── Enrich products with common fields ──────────────────────────
const finalProducts = allProducts.map((p) => ({
  ...p,
  brand: p.brand || 'K_M_Cart Fresh',
  stock: p.stock || 100,
  isActive: true,
  isFeatured: p.isFeatured || false,
  image: p.images?.[0] || `https://placehold.co/300x300/16A34A/FFFFFF?text=${encodeURIComponent(p.name)}`,
  images: p.images || [`https://placehold.co/300x300/16A34A/FFFFFF?text=${encodeURIComponent(p.name)}`],
  rating: +(3.8 + Math.random() * 1.2).toFixed(1),
  reviewCount: Math.floor(Math.random() * 200) + 10,
  tags: [p.category.toLowerCase(), 'grocery', 'fresh', 'daily'],
  gender: 'all',
}));

// ── Seed function ───────────────────────────────────────────────
async function seedGrocery() {
  try {
    await connectDB();
    console.log('\n🛒 K_M_Cart Grocery Seeder');
    console.log('═══════════════════════════════════════\n');

    // Clear old products
    const deleted = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} old products`);

    // Insert new products
    const inserted = await Product.insertMany(finalProducts);

    // Category breakdown
    const cats = {};
    inserted.forEach((p) => { cats[p.category] = (cats[p.category] || 0) + 1; });

    console.log(`\n✅ Added ${inserted.length} grocery products with real images!\n`);
    Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => console.log(`   └─ ${cat}: ${count}`));
    console.log('\n═══════════════════════════════════════');
    console.log('  🎉 K_M_Cart is ready with REAL images!');
    console.log('  Fresh Grocery. Delivered Fast. 🛒');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((k) =>
        console.error(`   → ${k}: ${error.errors[k].message}`)
      );
    }
    process.exit(1);
  }
}

seedGrocery();
