/**
 * @file client/src/pages/ProductDetail.jsx
 * @description Full-screen product detail page with split layout (image | details),
 * review summary, review form with star rating / image upload, and review list.
 * Accessible via /product/:id route.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaBolt,
  FaChevronLeft, FaThumbsUp, FaCamera, FaTimes, FaCheck,
  FaBoxOpen, FaTruck, FaShieldAlt, FaUndo,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

/* ═══════════════════════════════════════════════════════════════════════
   STAR RATING DISPLAY (read-only)
   ═══════════════════════════════════════════════════════════════════════ */
function StarRating({ rating, size = 'text-sm' }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} className={`text-amber-400 ${size}`} />);
    else if (i === full && half) stars.push(<FaStarHalfAlt key={i} className={`text-amber-400 ${size}`} />);
    else stars.push(<FaRegStar key={i} className={`text-amber-400 ${size}`} />);
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE STAR SELECTOR (for review form)
   ═══════════════════════════════════════════════════════════════════════ */
function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform duration-150 hover:scale-125 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <FaStar
            className={`text-2xl transition-colors duration-150 ${
              star <= (hovered || value) ? 'text-amber-400 drop-shadow-sm' : 'text-gray-200'
            }`}
          />
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-500 animate-fade-in">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   RATING DISTRIBUTION BAR
   ═══════════════════════════════════════════════════════════════════════ */
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-gray-500 font-medium">{star}★</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-gray-400 text-xs">{count}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SINGLE REVIEW CARD
   ═══════════════════════════════════════════════════════════════════════ */
function ReviewCard({ review, productId, currentUserId, onLikeToggled }) {
  const [liking, setLiking] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const isLiked = review.likes?.some((id) => id === currentUserId);
  const likeCount = review.likes?.length || 0;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await api.put(`/products/${productId}/reviews/${review._id}/like`);
      onLikeToggled();
    } catch (err) {
      console.error('Like failed:', err);
    } finally {
      setLiking(false);
    }
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 review-card-enter">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                            flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(review.userName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{review.userName}</p>
              <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StarRating rating={review.rating} size="text-xs" />
          </div>
        </div>

        {/* Comment */}
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>

        {/* Attached images */}
        {review.images?.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {review.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImg(img)}
                className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-100
                           hover:border-indigo-400 transition-colors duration-200 flex-shrink-0"
              >
                <img src={img} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     transition-all duration-200 border
                     ${isLiked
                       ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                       : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                     }`}
        >
          <FaThumbsUp className={`text-[10px] ${liking ? 'animate-bounce-once' : ''}`} />
          Helpful{likeCount > 0 && ` (${likeCount})`}
        </button>
      </div>

      {/* Lightbox modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          <img
            src={lightboxImg}
            alt="Review"
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN: PRODUCT DETAIL PAGE
   ═══════════════════════════════════════════════════════════════════════ */
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // ── Product data ────────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Image gallery ───────────────────────────────────────────────────
  const [selectedImg, setSelectedImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);

  // ── Cart feedback ───────────────────────────────────────────────────
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Review form state ───────────────────────────────────────────────
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const fileInputRef = useRef(null);

  // ── Fetch product ───────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  // ── Image zoom handler ──────────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // ── Add to cart ─────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    addToCart(product);
    navigate('/checkout');
  };

  // ── Image upload handler ────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewImages.length + files.length > 3) {
      setReviewError('Maximum 3 images allowed.');
      return;
    }
    setReviewError('');

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setReviewError('Each image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReviewImages((prev) => [...prev, ev.target.result].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeReviewImage = (index) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit review ───────────────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    // Validate
    if (reviewRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setReviewError('Review must be at least 10 characters.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: reviewImages,
      });

      if (res.data.success) {
        setReviewSuccess('Review submitted successfully!');
        setReviewRating(0);
        setReviewComment('');
        setReviewImages([]);
        fetchProduct(); // Re-fetch to show new review
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Format price ────────────────────────────────────────────────────
  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

  // ── Derived values ──────────────────────────────────────────────────
  const isOutOfStock = product?.stock === 0;
  const isLowStock = product?.stock > 0 && product?.stock <= 10;
  const hasDiscount = product?.discount > 0;
  const isClothing = ['men-shirts', 'men-pants', 'kids-dress', 'girls-dress'].includes(product?.category);

  // Build image array: prefer images[], then image field, then dynamic fallback
  const productImages = product
    ? (product.images?.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [`https://source.unsplash.com/400x400/?grocery,${encodeURIComponent(product.name)}`])
    : [];

  // Fallback URL for broken images
  const imgFallback = product
    ? `https://placehold.co/400x400/16A34A/FFFFFF?text=${encodeURIComponent(product.name)}`
    : '';

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product?.reviews?.filter((r) => r.rating === star).length || 0,
  }));

  const alreadyReviewed = product?.reviews?.some(
    (r) => r.userId === user?.id || r.userId === user?._id
  );

  /* ── LOADING STATE ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button skeleton */}
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            {/* Details skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="h-12 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-12 flex-1 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── ERROR STATE ───────────────────────────────────────────────────── */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center page-enter">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FaBoxOpen className="text-3xl text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'This product may have been removed.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl
                       hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  /* ── MAIN RENDER ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 product-detail-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* ── Back Button ─────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600
                     mb-6 lg:mb-8 group transition-colors duration-200"
        >
          <FaChevronLeft className="text-xs group-hover:-translate-x-1 transition-transform duration-200" />
          Back
        </button>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1: SPLIT LAYOUT — IMAGE | DETAILS
            ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

          {/* ── LEFT: Product Image ───────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              ref={imgRef}
              className="relative aspect-square bg-white rounded-2xl border border-gray-100
                         overflow-hidden shadow-sm cursor-crosshair group animate-zoom-in"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={productImages[selectedImg]}
                alt={product.name}
                className={`w-full h-full object-contain transition-transform duration-300
                           ${zoomed ? 'scale-150' : 'scale-100'}`}
                style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                draggable={false}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = imgFallback;
                }}
              />

              {/* Discount badge */}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1
                                rounded-full font-bold shadow-md">
                  −{product.discount}% OFF
                </span>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5
                              rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Hover to zoom
              </div>
            </div>

            {/* Thumbnail gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200
                               ${selectedImg === idx
                                 ? 'border-indigo-500 shadow-md shadow-indigo-100'
                                 : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="hidden lg:grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: FaTruck, label: 'Free Delivery', sub: 'Orders ₹499+' },
                { icon: FaShieldAlt, label: 'Genuine Product', sub: '100% Authentic' },
                { icon: FaUndo, label: 'Easy Returns', sub: '7-Day Policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 px-3 py-3">
                  <Icon className="text-indigo-500 text-lg flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product Details ────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {product.brand}
              </span>
              {product.category && (
                <span className="text-xs text-gray-400 capitalize">
                  in {product.category.replace(/-/g, ' ')}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-1">
              {product.name}
            </h1>

            {/* Tamil Name */}
            {product.nameTamil && (
              <p className="text-green-600 font-medium text-base mb-3">{product.nameTamil}</p>
            )}

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-lg">
                <span className="text-sm font-bold text-green-700">{product.rating?.toFixed(1)}</span>
                <FaStar className="text-green-600 text-xs" />
              </div>
              <StarRating rating={product.rating || 0} size="text-sm" />
              <span className="text-sm text-gray-400">
                ({product.reviewCount?.toLocaleString('en-IN') || 0} reviews)
              </span>
            </div>

            {/* Price section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-5 py-4 mb-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-gray-900">
                  {formatPrice(product.price)}
                  {product.unit && (
                    <span className="text-base font-normal text-gray-500"> / {product.unit}</span>
                  )}
                </span>
                {hasDiscount && product.originalPrice > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {product.discount}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-2.5 h-2.5 rounded-full ${
                isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className={`text-sm font-semibold ${
                isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {isOutOfStock
                  ? 'Out of Stock'
                  : isLowStock
                    ? `Hurry! Only ${product.stock} left`
                    : `In Stock (${product.stock} available)`}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About this product</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size chips */}
            {isClothing && product.sizes?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Sizes Available</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200
                                 text-sm font-medium text-gray-700 hover:border-indigo-400
                                 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Color chips */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Colors</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200
                                 text-sm font-medium text-gray-700 capitalize hover:border-indigo-400
                                 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* ── Action Buttons ──────────────────────────────────────── */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addedToCart}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center
                           justify-center gap-2 transition-all duration-200 border-2
                           ${addedToCart
                             ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                             : isOutOfStock
                               ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                               : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:shadow-md'
                           }`}
              >
                {addedToCart ? (
                  <><FaCheck className="text-sm" /> Added to Cart</>
                ) : (
                  <><FaShoppingCart className="text-sm" /> Add to Cart</>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                           text-white font-semibold text-sm flex items-center justify-center gap-2
                           hover:shadow-lg hover:shadow-indigo-200 hover:scale-[1.02]
                           active:scale-95 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <FaBolt className="text-sm" /> Buy Now
              </button>
            </div>

            {/* Mobile trust badges */}
            <div className="lg:hidden grid grid-cols-3 gap-2 mt-5">
              {[
                { icon: FaTruck, label: 'Free Delivery' },
                { icon: FaShieldAlt, label: 'Genuine' },
                { icon: FaUndo, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-white rounded-xl border border-gray-100 py-2.5">
                  <Icon className="text-indigo-500 text-sm" />
                  <p className="text-[10px] font-medium text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: REVIEW SUMMARY
            ════════════════════════════════════════════════════════════════ */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <HiSparkles className="text-indigo-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: Big rating number */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold text-gray-900 mb-1">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
                <StarRating rating={product.rating || 0} size="text-lg" />
                <p className="text-sm text-gray-400 mt-2">
                  {product.reviewCount || 0} ratings
                </p>
              </div>

              {/* Center: Distribution bars */}
              <div className="md:col-span-2 space-y-2">
                {ratingDist.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={product.reviews?.length || 0} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3: REVIEW FORM
            ════════════════════════════════════════════════════════════════ */}
        {!alreadyReviewed && (
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
            <form
              onSubmit={handleSubmitReview}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
            >
              {/* Star selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
                <StarSelector value={reviewRating} onChange={setReviewRating} />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review *</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product... (min 10 characters)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900
                             placeholder:text-gray-400 text-sm resize-none
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                             focus:bg-white outline-none transition-all duration-200"
                />
                <p className="text-xs text-gray-400 mt-1">{reviewComment.length}/500 characters</p>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Photos <span className="text-gray-400 font-normal">(optional, max 3)</span>
                </label>
                <div className="flex gap-3 flex-wrap items-start">
                  {reviewImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeReviewImage(idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <FaTimes className="text-white text-sm" />
                      </button>
                    </div>
                  ))}
                  {reviewImages.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300
                                 flex flex-col items-center justify-center gap-1 text-gray-400
                                 hover:border-indigo-400 hover:text-indigo-500 transition-colors duration-200"
                    >
                      <FaCamera className="text-lg" />
                      <span className="text-[10px] font-medium">Add</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Error / Success messages */}
              {reviewError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 animate-fade-in">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="bg-emerald-50 text-emerald-600 text-sm px-4 py-3 rounded-xl border border-emerald-100 animate-fade-in">
                  {reviewSuccess}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                           text-white font-semibold rounded-xl shadow-lg shadow-indigo-200
                           hover:shadow-xl hover:scale-[1.02] active:scale-95
                           transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                           flex items-center justify-center gap-2"
              >
                {reviewSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </div>
        )}

        {alreadyReviewed && (
          <div className="mb-10 bg-indigo-50 rounded-2xl p-5 flex items-center gap-3">
            <FaCheck className="text-indigo-600 text-lg flex-shrink-0" />
            <p className="text-sm text-indigo-700 font-medium">
              You've already reviewed this product. Thank you for your feedback!
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4: REVIEW LIST
            ════════════════════════════════════════════════════════════════ */}
        {product.reviews?.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Customer Reviews ({product.reviews.length})
            </h3>
            <div className="space-y-4">
              {product.reviews
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    productId={id}
                    currentUserId={user?.id || user?._id}
                    onLikeToggled={fetchProduct}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Empty reviews state */}
        {(!product.reviews || product.reviews.length === 0) && (
          <div className="mb-12 text-center py-10">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <FaStar className="text-2xl text-gray-200" />
            </div>
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
