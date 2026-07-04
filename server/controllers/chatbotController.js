const Product  = require('../models/Product');
const Order    = require('../models/Order');
const FAQ      = require('../models/FAQ');
const { detectIntent } = require('../utils/intentDetector');
const { matchProduct } = require('../utils/productMatcher');

/**
 * Build a human-readable summary of applied filters
 * Used in the bot response message
 */
const buildFilterSummary = (intent) => {
  const parts = [];
  if (intent.category)  parts.push(intent.category.replace('-', ' '));
  if (intent.brand)     parts.push('by ' + intent.brand);
  if (intent.maxPrice)  parts.push('under ₹' + intent.maxPrice.toLocaleString('en-IN'));
  if (intent.minPrice)  parts.push('above ₹' + intent.minPrice.toLocaleString('en-IN'));
  if (intent.minRating) parts.push(intent.minRating + '+ stars');
  if (intent.keywords)  parts.push('"' + intent.keywords + '"');
  return parts.length ? parts.join(', ') : 'all categories';
};

/**
 * @desc    Handle chatbot message — detect intent, query DB, return response
 * @route   POST /api/chatbot
 * @access  Public (optional auth via optionalAuth middleware)
 */
const handleChat = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // ── INPUT VALIDATION ─────────────────────────────────────────────
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        type: 'text',
        message: 'Please type something! I can help you find products, track orders, or answer questions.',
        data: null
      });
    }

    const lowerMsg = message.toLowerCase().trim();
    const intent   = detectIntent(lowerMsg);

    console.log('[Chatbot] Message:', message, '| Intent:', JSON.stringify(intent));

    // ════════════════════════════════════════════════════════════════
    // CASE 1 — PRODUCTS
    // ════════════════════════════════════════════════════════════════
    if (intent.type === 'products') {
      const query = {};
      const andConditions = [];

      // ── Category filter ─────────────────────────────────────────
      if (intent.category) {
        andConditions.push({ category: intent.category });
      }

      // ── Price filters ────────────────────────────────────────────
      if (intent.maxPrice || intent.minPrice) {
        const priceFilter = {};
        if (intent.maxPrice) priceFilter.$lte = intent.maxPrice;
        if (intent.minPrice) priceFilter.$gte = intent.minPrice;
        andConditions.push({ price: priceFilter });
      }

      // ── Rating filter ────────────────────────────────────────────
      if (intent.minRating) {
        andConditions.push({ rating: { $gte: intent.minRating } });
      }

      // ── Brand filter ─────────────────────────────────────────────
      if (intent.brand) {
        andConditions.push({
          brand: { $regex: intent.brand, $options: 'i' }
        });
      }

      // ── Keyword search on name, description, brand, tags ─────────
      if (intent.keywords && intent.keywords.length > 2) {
        const kw = intent.keywords.trim();
        andConditions.push({
          $or: [
            { name:        { $regex: kw, $options: 'i' } },
            { description: { $regex: kw, $options: 'i' } },
            { brand:       { $regex: kw, $options: 'i' } },
            { tags:        { $elemMatch: { $regex: kw, $options: 'i' } } }
          ]
        });
      }

      // ── Combine all filters with AND ─────────────────────────────
      if (andConditions.length > 0) {
        query.$and = andConditions;
      }
      // If no filters extracted at all → return top rated products
      // (don't return everything — too many)

      let products = await Product.find(query)
        .sort({ rating: -1, reviewCount: -1 })
        .limit(6)
        .lean();

      // ── Fallback: relax filters if no results ────────────────────
      if (products.length === 0 && andConditions.length > 1) {
        // Try with only category + price (drop keywords/brand)
        const relaxedConditions = andConditions.filter(c =>
          c.category || c.price || c.rating
        );
        if (relaxedConditions.length > 0) {
          products = await Product.find({ $and: relaxedConditions })
            .sort({ rating: -1 })
            .limit(6)
            .lean();
        }
      }

      // ── Still no results: return top rated in category if known ──
      if (products.length === 0 && intent.category) {
        products = await Product.find({ category: intent.category })
          .sort({ rating: -1 })
          .limit(6)
          .lean();
      }

      if (products.length === 0) {
        return res.json({
          type: 'text',
          message: 'Sorry, I could not find any products matching "' + message + '". Try a different search like "show coconut oil under ₹200" or "best rated basmati rice".',
          data: null
        });
      }

      const summary = buildFilterSummary(intent);
      return res.json({
        type: 'products',
        message: 'Found ' + products.length + ' products for ' + summary + ':',
        data: products
      });
    }

    // ════════════════════════════════════════════════════════════════
    // CASE 2 — ORDER TRACKING
    // ════════════════════════════════════════════════════════════════
    if (intent.type === 'order') {
      if (!userId && !intent.orderId) {
        return res.json({
          type: 'text',
          message: 'Please log in to see your orders, or tell me your Order ID (e.g. "track ORD-2024-0001").',
          data: null
        });
      }

      let order = null;

      if (intent.orderId) {
        // Search by orderId string (case-insensitive)
        order = await Order.findOne({
          orderId: { $regex: intent.orderId.replace(/-/g, '[-]?'), $options: 'i' }
        }).lean();
      } else if (userId) {
        // Get most recent order for this user
        order = await Order.findOne({ userId })
          .sort({ createdAt: -1 })
          .lean();
      }

      if (!order) {
        return res.json({
          type: 'text',
          message: intent.orderId
            ? 'Order ' + intent.orderId + ' not found. Please check the order ID and try again.'
            : 'You have no orders yet! Start shopping and your orders will appear here.',
          data: null
        });
      }

      return res.json({
        type: 'order',
        message: 'Here is your order status:',
        data: {
          orderId:           order.orderId,
          status:            order.status,
          estimatedDelivery: order.estimatedDelivery,
          totalAmount:       order.totalAmount,
          itemCount:         order.products ? order.products.length : 0,
          paymentMethod:     order.paymentMethod,
          paymentStatus:     order.paymentStatus
        }
      });
    }

    // ════════════════════════════════════════════════════════════════
    // CASE 3 — FAQ
    // ════════════════════════════════════════════════════════════════
    if (intent.type === 'faq') {
      // Try DB first
      const faq = await FAQ.findOne({
        keywords: { $in: [intent.keyword] }
      }).lean();

      if (faq) {
        return res.json({ type: 'text', message: faq.answer, data: null });
      }

      // Hardcoded fallbacks
      const answers = {
        return:   'Return Policy: Return any product within 30 days of delivery. Items must be in original condition and packaging. Refund is credited within 5–7 business days to your original payment method.',
        delivery: 'Delivery Info: Standard delivery takes 3–7 business days across India. Orders above ₹500 qualify for FREE delivery. Express 1–2 day delivery is available in metro cities.',
        payment:  'Payment Options: We accept Cash on Delivery (COD), UPI (PhonePe, GPay, Paytm), Credit/Debit Cards, and Net Banking — all secured by Razorpay.',
        cancel:   'Cancellation Policy: Cancel anytime before your order is shipped. Go to My Orders → Cancel Order. Prepaid refunds are processed within 5–7 business days.',
        warranty: 'Warranty: Most products come with manufacturer warranty where applicable. Contact customer care for specific warranty details on your purchased item.'
      };

      return res.json({
        type: 'text',
        message: answers[intent.keyword] || 'I can help with returns, delivery, payments, cancellations, and warranties. Which do you need help with?',
        data: null
      });
    }

    // ════════════════════════════════════════════════════════════════
    // CASE 4 — GREETING
    // ════════════════════════════════════════════════════════════════
    if (intent.type === 'greeting') {
      return res.json({
        type: 'text',
        message: 'Hello! Welcome to K_M_Cart! Here is what I can do:\n\n🔍 Find products: "Show coconut oil under ₹200"\n📦 Track orders: "Track my order ORD-2024-0001"\n⭐ Filter by rating: "Basmati rice above 4 stars"\n❓ Answer questions: "What is your return policy?"\n\nWhat are you looking for today?',
        data: null
      });
    }

    // ════════════════════════════════════════════════════════════════
    // CASE 5 — FALLBACK
    // ════════════════════════════════════════════════════════════════
    return res.json({
      type: 'text',
      message: 'I did not quite understand that. Here are some things you can ask:\n\n• "Show me coconut oil under ₹250"\n• "Best basmati rice with 4+ rating"\n• "Track order ORD-2024-0001"\n• "What is your return policy?"\n• "Toor dal under ₹150"',
      data: null
    });

  } catch (error) {
    console.error('[Chatbot] Error:', error.message, error.stack);
    return res.status(500).json({
      type: 'text',
      message: 'Oops! Something went wrong on my end. Please try again.',
      data: null
    });
  }
};

/**
 * @desc    Match voice-parsed shopping items to database products
 * @route   POST /api/chatbot/voice-order
 * @access  Public
 * @body    { items: [{ rawText, productName, quantity, unit, priceHint }] }
 * @returns { results: [{ status, product?, candidates?, query, inputIndex }] }
 */
const handleVoiceOrder = async (req, res) => {
  try {
    const { items } = req.body;

    // Validate input
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: items array required',
        results: []
      });
    }

    if (items.length === 0) {
      return res.json({
        success: true,
        message: 'No items to process',
        results: []
      });
    }

    // Process each item through matchProduct
    const results = await Promise.all(
      items.map(async (item, index) => {
        try {
          // Call matchProduct with the parsed data
          const matchResult = await matchProduct({
            text: item.productName,
            unit: item.unit,
            quantity: item.quantity,
            brand: null // Could extract brand from productName if needed
          });

          // Add input metadata for frontend correlation
          return {
            ...matchResult,
            inputIndex: index,
            rawText: item.rawText,
            requestedQuantity: item.quantity,
            requestedUnit: item.unit,
            priceHint: item.priceHint || null
          };
        } catch (error) {
          console.error(`[VoiceOrder] Error matching item ${index}:`, error);
          return {
            status: 'notFound',
            inputIndex: index,
            rawText: item.rawText,
            requestedQuantity: item.quantity,
            requestedUnit: item.unit,
            priceHint: item.priceHint || null,
            query: { text: item.productName, unit: item.unit, quantity: item.quantity },
            reason: 'Error processing item'
          };
        }
      })
    );

    // Calculate summary statistics
    const summary = {
      total: results.length,
      matched: results.filter(r => r.status === 'matched').length,
      ambiguous: results.filter(r => r.status === 'ambiguous').length,
      notFound: results.filter(r => r.status === 'notFound').length
    };

    return res.json({
      success: true,
      message: `Processed ${summary.total} items: ${summary.matched} matched, ${summary.ambiguous} ambiguous, ${summary.notFound} not found`,
      results,
      summary
    });

  } catch (error) {
    console.error('[VoiceOrder] Error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to process voice order',
      results: [],
      error: error.message
    });
  }
};

module.exports = { handleChat, handleVoiceOrder };
