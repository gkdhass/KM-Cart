/**
 * @file server/controllers/orderController.js
 * @description Order controller for handling order placement and retrieval.
 * Supports placing new orders with stock verification, fetching user orders
 * with pagination, and looking up orders by orderId string.
 */

const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @route   POST /api/orders/place
 * @desc    Place a new order from cart items. Validates cart, verifies stock,
 *          generates unique orderId, creates order, and reduces product stock.
 * @access  Protected (requires JWT)
 *
 * @param {Object} req.body - { cartItems, deliveryAddress, paymentMethod, subtotal, tax, deliveryCharge, totalAmount }
 * @returns {Object} { success, message, order: { orderId, status, estimatedDelivery, totalAmount, itemCount } }
 */
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      cartItems,
      deliveryAddress,
      paymentMethod,
      subtotal,
      tax,
      deliveryCharge,
      totalAmount,
    } = req.body;

    // ── Validate cart items ───────────────────────────────────────────
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items before placing an order.',
      });
    }

    // ── Validate delivery address ─────────────────────────────────────
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required.',
      });
    }

    const requiredAddressFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of requiredAddressFields) {
      if (!deliveryAddress[field] || deliveryAddress[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Delivery address field "${field}" is required.`,
        });
      }
    }

    // ── Validate payment method ───────────────────────────────────────
    const validPaymentMethods = ['COD', 'UPI', 'Card', 'NetBanking'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`,
      });
    }

    // ── Verify stock for all items ────────────────────────────────────
    const unavailableItems = [];
    const outOfStockItems = [];
    const deactivatedItems = [];
    
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      // Product deleted from database
      if (!product) {
        unavailableItems.push({
          productId: item.productId,
          name: item.name,
          reason: 'deleted'
        });
        continue;
      }

      // Product deactivated (isActive = false)
      if (product.isActive === false) {
        deactivatedItems.push({
          productId: item.productId,
          name: item.name,
          reason: 'deactivated'
        });
        continue;
      }

      // Insufficient stock
      if (product.stock < item.qty) {
        outOfStockItems.push({
          productId: item.productId,
          name: item.name,
          availableStock: product.stock,
          requestedQty: item.qty,
          reason: 'insufficient_stock'
        });
        continue;
      }
    }

    // Return detailed error with all problematic items
    if (unavailableItems.length > 0 || outOfStockItems.length > 0 || deactivatedItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are no longer available. Please review and update your cart.',
        unavailableItems,
        outOfStockItems,
        deactivatedItems,
        errorType: 'cart_validation_failed'
      });
    }

    // ── Generate unique order ID ──────────────────────────────────────
    const count = await Order.countDocuments();
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + String(count + 1).padStart(4, '0');

    // ── Calculate estimated delivery (5 days from now) ────────────────
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    // ── Create order document ─────────────────────────────────────────
    const order = await Order.create({
      userId,
      orderId,
      products: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image || '',
        brand: item.brand || 'Generic',
        price: item.price,
        qty: item.qty,
      })),
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        addressLine1: deliveryAddress.addressLine1,
        addressLine2: deliveryAddress.addressLine2 || '',
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      },
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      subtotal: subtotal || 0,
      deliveryCharge: deliveryCharge || 0,
      tax: tax || 0,
      totalAmount,
      status: 'Pending',
      estimatedDelivery,
    });

    // ── Reduce stock for all ordered items ─────────────────────────────
    await Promise.all(
      cartItems.map((item) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty },
        })
      )
    );

    // ── Return success response ───────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        orderId: order.orderId,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        totalAmount: order.totalAmount,
        itemCount: cartItems.length,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    console.error('Place order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
    });
  }
};

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders for the currently authenticated user with pagination.
 * @access  Protected (requires JWT)
 *
 * @param {Number} req.query.page - Page number (default: 1)
 * @param {Number} req.query.limit - Items per page (default: 10)
 * @returns {Object} { success, count, totalPages, currentPage, data: [...orders] }
 */
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages,
      currentPage: page,
      data: orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders. Please try again.',
    });
  }
};

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get a single order by its human-readable orderId string (e.g., "ORD-2024-0042")
 * @access  Protected (JWT required)
 *
 * @param {String} req.params.orderId - Human-readable order ID string
 * @returns {Object} { success, data: order }
 */
const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId: orderId.toUpperCase(),
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID "${orderId}" not found. Please check the order ID and try again.`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details. Please try again.',
    });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderByOrderId };
