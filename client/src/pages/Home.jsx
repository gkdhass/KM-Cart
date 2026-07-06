/**
 * @file client/src/pages/Home.jsx
 * @description Main home page showing hero banner, category quick links with
 * real images and Tamil names, deals of the day, all products with infinite scroll,
 * special category showcases, and trust badges footer.
 * Theme: Indigo Blue (#7C8BF2) + Lavender (#DFE1F2)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import ProductCard from '../components/Products/ProductCard';
import {
  FaSearch, FaRobot, FaShoppingBag, FaFire, FaSpinner, FaTruck, FaUndo, FaLock,
} from 'react-icons/fa';

/**
 * Category definitions with real Unsplash images and Tamil names.
 * IDs match the actual product category values in the database.
 */
const CATEGORIES = [
  {
    id: 'Oil',
    label: 'Oil',
    tamil: 'எண்ணெய்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'Masala',
    label: 'Masala',
    tamil: 'மசாலா',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop',
    color: 'bg-red-50 border-red-200',
  },
  {
    id: 'Rice & Grains',
    label: 'Rice & Grains',
    tamil: 'அரிசி',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'Pulses & Dal',
    label: 'Pulses & Dal',
    tamil: 'பருப்பு',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=200&h=200&fit=crop',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'Spices',
    label: 'Spices',
    tamil: 'முழு மசாலா',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1532336414041-8e2b9eec0be3?w=200&h=200&fit=crop',
    color: 'bg-yellow-50 border-yellow-300',
  },
  {
    id: 'Sugar & Sweeteners',
    label: 'Sugar & Sweeteners',
    tamil: 'சர்க்கரை',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop',
    color: 'bg-pink-50 border-pink-200',
  },
  {
    id: 'Beverages',
    label: 'Beverages',
    tamil: 'பானங்கள்',
    emoji: '🧃',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop',
    color: 'bg-amber-50 border-amber-300',
  },
  {
    id: 'Household & Cleaning',
    label: 'Household',
    tamil: 'வீட்டு சுத்தம்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'Packaged & Ready',
    label: 'Packaged',
    tamil: 'தயார் உணவு',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'Dairy',
    label: 'Dairy',
    tamil: 'பால் பொருட்கள்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop',
    color: 'bg-sky-50 border-sky-200',
  },
  {
    id: 'Snacks',
    label: 'Snacks',
    tamil: 'நொறுக்குத் தீனி',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'Biscuits & Cookies',
    label: 'Biscuits',
    tamil: 'பிஸ்கட்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'Chocolates',
    label: 'Chocolates',
    tamil: 'சாக்லேட்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop',
    color: 'bg-yellow-50 border-yellow-700',
  },
  {
    id: 'Juices & Drinks',
    label: 'Juices',
    tamil: 'ஜூஸ்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop',
    color: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'Dry Fruits & Nuts',
    label: 'Dry Fruits',
    tamil: 'உலர் பழங்கள்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&h=200&fit=crop',
    color: 'bg-amber-50 border-amber-300',
  },
  {
    id: 'Pickles & Sauces',
    label: 'Pickles',
    tamil: 'ஊறுகாய்',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=200&h=200&fit=crop',
    color: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'Personal Care',
    label: 'Personal Care',
    tamil: 'தனிநபர் பராமரிப்பு',
    emoji: '',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
    color: 'bg-purple-50 border-purple-200',
  },
];

/** Filter category pills for all products section */
const FILTER_PILLS = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label })),
];

/** Sort options */
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'New Arrivals' },
];

/**
 * Home page component.
 * @returns {JSX.Element} Home page
 */
function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // ── Search state ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Deals state ─────────────────────────────────────────────────────
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [countdown, setCountdown] = useState({ h: 24, m: 0, s: 0 });

  // ── All Products state (infinite scroll) ────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');

  // ── Special categories state ────────────────────────────────────────
  const [oilProducts, setOilProducts] = useState([]);
  const [dairyProducts, setDairyProducts] = useState([]);
  const [snackProducts, setSnackProducts] = useState([]);

  // ── Toast state ─────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // ── Infinite scroll sentinel ────────────────────────────────────────
  const sentinelRef = useRef(null);

  // ── Category image error tracking ───────────────────────────────────
  const [catImgErrors, setCatImgErrors] = useState({});

  // ── Countdown timer ─────────────────────────────────────────────────
  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = endOfDay - now;
      if (diff <= 0) {
        setCountdown({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ h, m, s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ── Fetch deals of the day ──────────────────────────────────────────
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setDealsLoading(true);
        const res = await api.get('/products', { params: { sort: 'discount', limit: 4 } });
        if (res.data.success) {
          setDeals(res.data.products);
        }
      } catch (err) {
        console.error('Failed to fetch deals:', err);
      } finally {
        setDealsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  // ── Fetch all products (paginated) ──────────────────────────────────
  const fetchProducts = useCallback(async (pageNum, filter, sort, reset = false) => {
    try {
      if (reset) setProductsLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 12 };
      if (filter && filter !== 'all') params.category = filter;
      if (sort) params.sort = sort;

      const res = await api.get('/products', { params });

      if (res.data.success) {
        if (reset) {
          setProducts(res.data.products);
        } else {
          setProducts((prev) => [...prev, ...res.data.products]);
        }
        setTotalCount(res.data.totalCount || 0);
        setHasMore(pageNum < (res.data.totalPages || 1));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial products fetch
  useEffect(() => {
    setPage(1);
    fetchProducts(1, activeFilter, sortBy, true);
  }, [activeFilter, sortBy, fetchProducts]);

  // ── Fetch special categories ────────────────────────────────────────
  useEffect(() => {
    const fetchCategory = async (category, setter) => {
      try {
        const res = await api.get('/products', { params: { category, limit: 6 } });
        if (res.data.success) setter(res.data.products);
      } catch (err) {
        console.error(`Failed to fetch ${category}:`, err);
      }
    };

    fetchCategory('Oil', setOilProducts);
    fetchCategory('Dairy', setDairyProducts);
    fetchCategory('Snacks', setSnackProducts);
  }, []);

  // ── Infinite scroll observer ────────────────────────────────────────
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || productsLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, activeFilter, sortBy, false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, productsLoading, page, activeFilter, sortBy, fetchProducts]);

  // ── Toast system ────────────────────────────────────────────────────
  const showToast = (message) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`✓ ${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/checkout');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="page-enter">
      {/* ── SECTION 1: HERO BANNER ──────────────────────────────────── */}
      <section className="relative h-64 md:h-80 bg-gradient-to-br from-[#7C8BF2] to-[#5A6BE0] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center">
          {user?.name && (
            <p className="text-indigo-200 text-sm mb-2 animate-fade-in">
              Welcome back, <span className="font-semibold text-white">{user.name}</span>!
            </p>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 animate-hero-fade">
            K_M_Cart
          </h1>
          <p className="text-indigo-200 text-sm md:text-base mb-6 animate-hero-slide">
            Fresh Groceries · Best Prices · Delivered Fast
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groceries, masalas, oils..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder:text-gray-400
                           outline-none shadow-lg text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#5A6BE0] text-white font-semibold rounded-xl shadow-lg
                         hover:bg-[#4A5AD0] transition-all duration-200 text-sm"
            >
              Search
            </button>
          </form>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30
                         rounded-xl text-sm font-medium hover:bg-white/30 transition-all duration-200
                         flex items-center gap-2"
            >
              <FaShoppingBag className="text-xs" /> Shop Now
            </button>
            <button
              onClick={() => {
                // Scroll to bottom to reveal chatbot button, then auto-click it
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                setTimeout(() => {
                  // Find chatbot button by multiple selectors for robustness
                  const chatbotBtn = 
                    document.querySelector('[aria-label="Open chat assistant"]') ||
                    document.querySelector('#chatbot-fab button') ||
                    document.querySelector('[title="Chat with K_M_Cart Assistant"]');
                  
                  if (chatbotBtn) {
                    chatbotBtn.click();
                  } else {
                    showToast('AI Chat is available at the bottom right corner!');
                  }
                }, 600);
              }}
              className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30
                         rounded-xl text-sm font-medium hover:bg-white/30 transition-all duration-200
                         flex items-center gap-2"
            >
              <FaRobot className="text-xs" /> Ask AI
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── SECTION 2: CATEGORY QUICK LINKS WITH IMAGES ────────────── */}
        <section className="py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Shop by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.id)}`)}
                className={`${cat.color} border-2 rounded-2xl p-3 cursor-pointer
                           hover:shadow-md hover:scale-105 transition-all duration-200
                           flex flex-col items-center text-center group animate-stagger-card`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Category Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-2 bg-white/50">
                  {!catImgErrors[cat.id] ? (
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={() => setCatImgErrors((prev) => ({ ...prev, [cat.id]: true }))}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {cat.emoji}
                    </div>
                  )}
                </div>

                {/* Emoji fallback shown below image */}
                <span className="text-lg mb-0.5">{cat.emoji}</span>

                {/* English name */}
                <p className="font-semibold text-gray-800 text-xs leading-tight">
                  {cat.label}
                </p>

                {/* Tamil name */}
                <p className="text-[#7C8BF2] text-[10px] mt-0.5 font-medium">
                  {cat.tamil}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: DEALS OF THE DAY ─────────────────────────────── */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                <FaFire className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Deals of the Day</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              <span className="text-xs text-red-600 font-semibold">Ends in</span>
              <span className="font-mono text-sm font-bold text-red-700">
                {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
              </span>
            </div>
          </div>

          {dealsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {deals.map((product) => (
                <div key={product._id} className="relative">
                  {/* DEAL banner */}
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold
                                  px-2 py-0.5 rounded-full shadow-sm">
                    DEAL
                  </div>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 4: ALL PRODUCTS ─────────────────────────────────── */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">All Products</h2>
              {totalCount > 0 && (
                <span className="px-2.5 py-0.5 bg-[#DFE1F2] text-[#7C8BF2] text-xs font-semibold rounded-full">
                  {totalCount.toLocaleString('en-IN')} Products
                </span>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm -mx-4 px-4 py-3 mb-5
                          border-b border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                {FILTER_PILLS.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => handleFilterChange(pill.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border
                               whitespace-nowrap transition-all duration-200
                               ${activeFilter === pill.id
                                 ? 'bg-[#7C8BF2] text-white border-[#7C8BF2] shadow-md shadow-indigo-200'
                                 : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                               }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700
                           text-xs outline-none focus:border-[#7C8BF2] focus:ring-2
                           focus:ring-[#7C8BF2]/20 transition-all duration-200 min-w-[140px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="flex gap-2">
                      <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                      <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm">Try a different category or filter</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>

              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />

              {/* Loading more spinner */}
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                  <FaSpinner className="animate-spin text-[#7C8BF2]" />
                  <span className="text-sm">Loading more products...</span>
                </div>
              )}

              {/* End message */}
              {!hasMore && products.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 font-medium">
                    You've seen all products!
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── SECTION 5: SPECIAL CATEGORIES SHOWCASE ──────────────────── */}
        {oilProducts.length > 0 && (
          <CategoryShowcase
            title="🫙 Cooking Oils"
            products={oilProducts}
            category="Oil"
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onViewAll={() => navigate('/products?category=Oil')}
          />
        )}

        {dairyProducts.length > 0 && (
          <CategoryShowcase
            title="🥛 Fresh Dairy"
            products={dairyProducts}
            category="Dairy"
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onViewAll={() => navigate('/products?category=Dairy')}
          />
        )}

        {snackProducts.length > 0 && (
          <CategoryShowcase
            title="🍿 Popular Snacks"
            products={snackProducts}
            category="Snacks"
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onViewAll={() => navigate('/products?category=Snacks')}
          />
        )}
      </div>

      {/* ── SECTION 6: TRUST BADGES / FOOTER STRIP ────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <FaTruck className="text-xl text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FaUndo className="text-xl text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Easy 30-day Returns</p>
                <p className="text-xs text-gray-500">Hassle-free return policy</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <FaLock className="text-xl text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">100% Secure Payments</p>
                <p className="text-xs text-gray-500">Razorpay encrypted checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Toast Notifications ──────────────────────────────────────── */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#7C8BF2] text-white px-4 py-3 rounded-xl shadow-lg
                       text-sm font-medium animate-fade-in max-w-xs"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CategoryShowcase — horizontal scroll section for a specific category.
 */
function CategoryShowcase({ title, products, onAddToCart, onBuyNow, onViewAll }) {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          onClick={onViewAll}
          className="text-xs text-[#7C8BF2] font-semibold hover:text-[#5A6BE0] transition-colors"
        >
          View All →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {products.map((product) => (
          <div key={product._id} className="flex-shrink-0 w-56">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Home;
