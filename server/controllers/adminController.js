/**
 * @file server/controllers/adminController.js
 * @description Admin controller handling dashboard stats, product/order/user CRUD,
 * analytics, and chart data aggregations for the admin dashboard.
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY MAPPING for Pie Charts
   Grocery categories use their raw names directly.
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD STATS
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics: total products, orders, users, revenue,
 *          recent orders, and low stock alerts
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, revenueAgg, recentOrders, lowStockProducts] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: { $in: ['Paid', 'Pending'] }, status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'name email')
          .lean(),
        Product.find({ stock: { $lte: 10 } })
          .sort({ stock: 1 })
          .limit(10)
          .select('name stock image category')
          .lean(),
      ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error('[getDashboardStats] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   PIE CHART DATA
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/charts/piedata
 * @desc    Get aggregated data for pie charts: products by category, orders by status
 * @access  Admin
 */
const getChartPieData = async (req, res) => {
  try {
    const [productsByCategory, ordersByStatus] = await Promise.all([
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Use raw category names directly (grocery categories are already display-friendly)
    const productData = productsByCategory.map((item) => ({
      name: item._id || 'Other',
      value: item.count,
    }));

    const orderData = ordersByStatus.map((item) => ({
      name: item._id || 'Unknown',
      value: item.count,
    }));

    res.status(200).json({
      success: true,
      productData,
      orderData,
    });
  } catch (error) {
    console.error('[getChartPieData] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch chart data.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   PRODUCT MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/products
 * @desc    Get all products with search, sort, pagination for admin table
 * @access  Admin
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      search = '',
      sort = 'newest',
      page = 1,
      limit = 10,
      category = '',
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      stock_asc: { stock: 1 },
      stock_desc: { stock: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('[getAllProducts] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

/**
 * @route   POST /api/admin/products
 * @desc    Create a new product
 * @access  Admin
 */
const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice, discount,
      category, brand, stock, image, images, tags,
      sizes, colors, gender, isFeatured, isActive,
    } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required.',
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0.',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || '',
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      discount: Number(discount) || 0,
      category: category.toLowerCase(),
      brand: brand?.trim() || 'Generic',
      stock: Number(stock) || 0,
      image: image || (images && images.length > 0 ? images[0] : undefined),
      images: images || [],
      tags: tags || [],
      sizes: sizes || [],
      colors: colors || [],
      gender: gender || 'all',
      isFeatured: isFeatured || false,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: product,
    });
  } catch (error) {
    console.error('[createProduct] Error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update a product (only changed fields)
 * @access  Admin
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Update only provided fields
    const allowedFields = [
      'name', 'description', 'price', 'originalPrice', 'discount',
      'category', 'brand', 'stock', 'image', 'images', 'tags',
      'sizes', 'colors', 'gender', 'isFeatured', 'isActive',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // If images updated, set primary image to first one
    if (req.body.images && req.body.images.length > 0 && !req.body.image) {
      product.image = req.body.images[0];
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: product,
    });
  } catch (error) {
    console.error('[updateProduct] Error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete a product
 * @access  Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error('[deleteProduct] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   ORDER MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filters and pagination
 * @access  Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const {
      search = '',
      status = '',
      page = 1,
      limit = 10,
      startDate = '',
      endDate = '',
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { orderId: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email')
        .lean(),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      orders,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('[getAllOrders] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Update payment status if delivered
    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    // If cancelling, restore stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await Promise.all(
        order.products.map((item) =>
          Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } })
        )
      );
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: order,
    });
  } catch (error) {
    console.error('[updateOrderStatus] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   USER MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      search = '',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-password')
        .lean(),
      User.countDocuments(query),
    ]);

    // For each user, get their order count
    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        return { ...user, orderCount };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithOrderCount,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('[getAllUsers] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Toggle user role between 'user' and 'admin'
 * @access  Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "user" or "admin".',
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to "${role}".`,
      data: user,
    });
  } catch (error) {
    console.error('[updateUserRole] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

/**
 * @route   PUT /api/admin/users/:id/ban
 * @desc    Toggle ban/unban user
 * @access  Admin
 */
const toggleBanUser = async (req, res) => {
  try {
    // Prevent self-ban
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot ban yourself.',
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent banning other admins
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban another admin user.',
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned ? 'User has been banned.' : 'User has been unbanned.',
      data: user,
    });
  } catch (error) {
    console.error('[toggleBanUser] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to toggle user ban status.' });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (cannot delete self)
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete another admin. Demote first.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User "${user.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error('[deleteUser] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

/**
 * @route   GET /api/admin/users/:id/orders
 * @desc    Get orders for a specific user
 * @access  Admin
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('[getUserOrders] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user orders.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   ANALYTICS
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data: revenue over time, orders/day, top products,
 *          sales by category, new users per day
 * @access  Admin
 */
const getAnalyticsData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    // Revenue over time (by day)
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          image: { $first: '$products.image' },
          totalSold: { $sum: '$products.qty' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.qty'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Sales by category
    const salesByCategory = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$products.price', '$products.qty'] } },
          count: { $sum: '$products.qty' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // New users per day
    const newUsersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format data for charts
    const revenueData = revenueByDay.map((d) => ({
      date: d._id,
      revenue: d.revenue,
      orders: d.count,
    }));

    const userData = newUsersByDay.map((d) => ({
      date: d._id,
      users: d.count,
    }));

    const categoryData = salesByCategory.map((d) => ({
      name: d._id || 'Other',
      revenue: d.revenue,
      count: d.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        revenueData,
        topProducts,
        categoryData,
        userData,
        period: `${daysNum} days`,
      },
    });
  } catch (error) {
    console.error('[getAnalyticsData] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories (including inactive) for admin management
 * @access  Admin
 */
const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .lean();

    // For each category, get product count
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat.name });
        return { ...cat, productCount };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error('[getAdminCategories] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category
 * @access  Admin
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    // Check for duplicate
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${name.trim()}" already exists.`,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
      image: image || '',
      isActive: isActive !== false,
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: `Category "${category.name}" created successfully!`,
      data: category,
    });
  } catch (error) {
    console.error('[createCategory] Error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update a category
 * @access  Admin
 */
const updateCategory = async (req, res) => {
  try {
    const { name, description, image, isActive, order } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const oldName = category.name;

    // Check duplicate if name changed
    if (name && name.trim() !== oldName) {
      const existing = await Category.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Category "${name.trim()}" already exists.`,
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = Number(order);

    await category.save();

    // If name changed, update all products with the old category name
    if (name && name.trim() !== oldName) {
      await Product.updateMany(
        { category: oldName },
        { category: category.name }
      );
    }

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" updated successfully!`,
      data: category,
    });
  } catch (error) {
    console.error('[updateCategory] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete a category. If products exist, use ?force=true to reassign them to "Uncategorized".
 * @access  Admin
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: category.name });

    if (productCount > 0) {
      const forceDelete = req.query.force === 'true';

      if (!forceDelete) {
        return res.status(400).json({
          success: false,
          productCount,
          message: `Cannot delete "${category.name}" — ${productCount} product(s) still use this category. Move or delete them first.`,
        });
      }

      // Force delete: move products to "Uncategorized"
      await Product.updateMany(
        { category: category.name },
        { category: 'Uncategorized' }
      );

      // Ensure "Uncategorized" category exists
      const uncatExists = await Category.findOne({ name: 'Uncategorized' });
      if (!uncatExists) {
        await Category.create({
          name: 'Uncategorized',
          description: 'Products moved from deleted categories',
          order: 999,
          isActive: true,
        });
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: productCount > 0
        ? `Category "${category.name}" deleted. ${productCount} product(s) moved to "Uncategorized".`
        : `Category "${category.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error('[deleteCategory] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

module.exports = {
  getDashboardStats,
  getChartPieData,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getUserOrders,
  getAnalyticsData,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
