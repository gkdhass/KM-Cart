/**
 * @file client/src/pages/Checkout.jsx
 * @description Checkout page with delivery form, Razorpay payment integration,
 * payment method selection (COD/UPI/Card/NetBanking), and order summary.
 * Two-column layout on desktop, stacked on mobile.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FaTruck, FaCreditCard, FaMobileAlt, FaMoneyBillWave, FaUniversity,
  FaLock, FaSpinner, FaFlask, FaCheckCircle,
} from 'react-icons/fa';

/** All Indian states for dropdown */
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/** Payment method options */
const PAYMENT_OPTIONS = [
  { id: 'COD', label: 'Cash on Delivery', icon: FaMoneyBillWave, desc: 'Pay when delivered' },
  { id: 'UPI', label: 'UPI Payment', icon: FaMobileAlt, desc: 'Pay via PhonePe, GPay, Paytm' },
  { id: 'Card', label: 'Credit / Debit Card', icon: FaCreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'NetBanking', label: 'Net Banking', icon: FaUniversity, desc: 'All major banks' },
];

/**
 * Checkout page component.
 * Protected route — requires login. Redirects to /products if cart is empty.
 */
function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // ── Form state ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('COD');

  // ── UI state ────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Pre-fill from auth user ─────────────────────────────────────────
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // ── Redirect if cart is empty ───────────────────────────────────────
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/products');
    }
  }, [cartItems, navigate, loading]);

  // ── Computed values ─────────────────────────────────────────────────
  const deliveryCharge = cartTotal >= 500 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const finalTotal = cartTotal + tax + deliveryCharge;

  /**
   * Validate a single field.
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim().length < 2 ? 'Full name is required' : '';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Valid email is required';
      case 'phone':
        return /^[6-9]\d{9}$/.test(value) ? '' : 'Valid 10-digit phone number required';
      case 'addressLine1':
        return value.trim().length < 5 ? 'Address is required (min 5 chars)' : '';
      case 'city':
        return value.trim().length < 2 ? 'City is required' : '';
      case 'state':
        return value.trim() === '' ? 'Please select a state' : '';
      case 'pincode':
        return /^\d{6}$/.test(value) ? '' : 'Valid 6-digit pincode required';
      default:
        return '';
    }
  };

  /**
   * Handle field blur — validates and marks field as touched.
   */
  const handleBlur = (name, value) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  /**
   * Validate entire form.
   */
  const validateForm = () => {
    const fields = { fullName, email, phone, addressLine1, city, state, pincode };
    const newTouched = {};
    const newErrors = {};
    let valid = true;

    Object.entries(fields).forEach(([name, value]) => {
      newTouched[name] = true;
      const err = validateField(name, value);
      newErrors[name] = err;
      if (err) valid = false;
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return valid;
  };

  /**
   * Check if the entire form is valid (no submit, just for button state).
   */
  const isFormValid = () => {
    const fields = { fullName, email, phone, addressLine1, city, state, pincode };
    return Object.entries(fields).every(
      ([name, value]) => validateField(name, value) === ''
    );
  };

  /**
   * Handle place order — supports both COD and Razorpay online payment.
   */
  const handlePlaceOrder = async () => {
    // Step 1: Validate all form fields before proceeding
    if (!validateForm()) {
      setError('Please fill all required fields correctly.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    // Step 2: Get auth token - check BOTH possible localStorage keys
    const token = localStorage.getItem('gkcart_token') || localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to place an order.');
      setLoading(false);
      navigate('/login');
      return;
    }

    // Step 3: Build the request body matching EXACTLY what backend expects
    const deliveryChargeCalc = cartTotal >= 500 ? 0 : 99;
    const taxAmount = Math.round(cartTotal * 0.18);
    const finalTotalCalc = cartTotal + taxAmount + deliveryChargeCalc;

    const orderPayload = {
      cartItems: cartItems.map(item => ({
        productId: item._id || item.productId,
        name: item.name,
        image: item.image || '',
        brand: item.brand || '',
        price: Number(item.price),
        qty: Number(item.qty)
      })),
      deliveryAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : '',
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      subtotal: cartTotal,
      deliveryCharge: deliveryChargeCalc,
      tax: taxAmount,
      totalAmount: finalTotalCalc
    };

    // ─── COD ORDER ─────────────────────────────────────────────────────
    if (selectedPayment === 'COD') {
      console.log('COD Order payload:', orderPayload);

      try {
        const response = await api.post('/orders/place', {
          ...orderPayload,
          paymentMethod: 'COD',
          paymentStatus: 'Pending'
        });

        if (response.data.success) {
          // Show immediate success confirmation
          toast.success(
            'Order Placed Successfully!',
            {
              icon: <FaCheckCircle className="text-xl" />,
              duration: 4000,
            }
          );
          
          clearCart();
          navigate('/order-success', {
            state: { order: response.data.order }
          });
        } else {
          setError(response.data.message || 'Order failed. Please try again.');
        }
      } catch (err) {
        console.error('COD Order error:', err.response?.data || err.message);
        
        // Handle cart validation errors with detailed item information
        if (err.response?.data?.errorType === 'cart_validation_failed') {
          const { unavailableItems, outOfStockItems, deactivatedItems } = err.response.data;
          
          // Auto-remove unavailable items from cart
          const itemsToRemove = [
            ...(unavailableItems || []),
            ...(deactivatedItems || [])
          ];
          
          if (itemsToRemove.length > 0) {
            console.log('[Checkout] Auto-removing unavailable items:', itemsToRemove);
            itemsToRemove.forEach(item => {
              removeFromCart(item.productId);
            });
          }
          
          // Build detailed error message
          let errorMsg = 'Cart Updated:\n\n';
          
          if (unavailableItems?.length > 0) {
            errorMsg += '❌ Removed (no longer available):\n';
            unavailableItems.forEach(item => {
              errorMsg += `  • ${item.name}\n`;
            });
            errorMsg += '\n';
          }
          
          if (deactivatedItems?.length > 0) {
            errorMsg += '⚠️ Removed (currently unavailable):\n';
            deactivatedItems.forEach(item => {
              errorMsg += `  • ${item.name}\n`;
            });
            errorMsg += '\n';
          }
          
          if (outOfStockItems?.length > 0) {
            errorMsg += '📦 Insufficient stock:\n';
            outOfStockItems.forEach(item => {
              errorMsg += `  • ${item.name}: Only ${item.availableStock} available (you have ${item.requestedQty} in cart)\n`;
            });
            errorMsg += '\n';
          }
          
          errorMsg += 'Please review your updated cart and try again.';
          setError(errorMsg);
          
          // Scroll to top to show error
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Generic error handling
          const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // ─── ONLINE PAYMENT via Razorpay (UPI/Card/NetBanking) ─────────────

    // Capture orderData in closure BEFORE popup opens
    const orderData = { ...orderPayload };

    try {
      // Step 4: Create Razorpay order on backend
      console.log('[Checkout] Creating Razorpay order, amount:', finalTotalCalc);
      const rzpOrderRes = await api.post('/payment/create-order', {
        amount: finalTotalCalc,
        currency: 'INR',
        receipt: 'receipt_' + Date.now()
      });

      console.log('[Checkout] Razorpay order response:', rzpOrderRes.data);

      if (!rzpOrderRes.data.success) {
        throw new Error(rzpOrderRes.data.message || 'Failed to create payment order');
      }

      // Step 5: Load Razorpay script then open popup
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) { 
            console.log('[Checkout] Razorpay already loaded');
            resolve(true); 
            return; 
          }
          console.log('[Checkout] Loading Razorpay script...');
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            console.log('[Checkout] Razorpay script loaded successfully');
            resolve(true);
          };
          script.onerror = () => {
            console.error('[Checkout] Razorpay script failed to load');
            resolve(false);
          };
          document.body.appendChild(script);
        });
      };

      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Razorpay failed to load. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Step 6: Configure Razorpay options
      console.log('[Checkout] Configuring Razorpay with keyId:', rzpOrderRes.data.keyId);
      const options = {
        key: rzpOrderRes.data.keyId,
        amount: rzpOrderRes.data.amount,
        currency: 'INR',
        name: 'K_M_Cart',
        description: 'Order Payment - ' + cartItems.length + ' item(s)',
        order_id: rzpOrderRes.data.orderId,
        prefill: {
          name: fullName,
          contact: phone,
          email: user?.email || ''
        },
        theme: { color: '#7C8BF2' },

        // Step 7: Handler fires AFTER Razorpay confirms payment
        handler: async function (response) {
          console.log('[Checkout] Payment successful, verifying...', response);
          try {
            // CRITICAL: Use token captured in outer closure
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData
            });

            console.log('[Checkout] Verification response:', verifyRes.data);

            if (verifyRes.data.success) {
              // Show immediate success confirmation
              toast.success(
                'Order Placed Successfully!',
                {
                  icon: <FaCheckCircle className="text-xl" />,
                  duration: 4000,
                }
              );
              
              clearCart();
              navigate('/order-success', {
                state: { order: verifyRes.data.order }
              });
            } else {
              setError('Payment verification failed: ' + verifyRes.data.message);
              setLoading(false);
            }
          } catch (verifyErr) {
            console.error('[Checkout] Payment verify error:', verifyErr.response?.data || verifyErr);
            setError('Payment was received but order confirmation failed. Contact support with payment ID: ' + response.razorpay_payment_id);
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            console.log('[Checkout] Payment modal dismissed by user');
            setError('Payment was cancelled. Please try again.');
            setLoading(false);
          }
        }
      };

      console.log('[Checkout] Opening Razorpay checkout...');
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('[Checkout] Payment failed:', response.error);
        setError('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('[Checkout] Razorpay init error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Payment initialization failed. Try again.');
      setLoading(false);
    }
  };

  /**
   * Format price in Indian Rupee format.
   */
  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

  // ── Not logged in gate ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4
                      bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-2xl text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please login to checkout</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to place an order.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 page-enter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your order details below</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── LEFT COLUMN: Delivery Form ──────────────────────────── */}
          <div className="flex-1 space-y-6">
            {/* Section 1: Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold
                                 flex items-center justify-center">1</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  onBlur={() => handleBlur('fullName', fullName)}
                  error={touched.fullName ? errors.fullName : ''}
                  placeholder="Enter your full name"
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  onBlur={() => handleBlur('email', email)}
                  error={touched.email ? errors.email : ''}
                  placeholder="your@email.com"
                  required
                />
                <InputField
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  onBlur={() => handleBlur('phone', phone)}
                  error={touched.phone ? errors.phone : ''}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* Section 2: Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold
                                 flex items-center justify-center">2</span>
                Delivery Address
              </h2>
              <div className="space-y-4">
                <InputField
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={setAddressLine1}
                  onBlur={() => handleBlur('addressLine1', addressLine1)}
                  error={touched.addressLine1 ? errors.addressLine1 : ''}
                  placeholder="House no., Street, Area"
                  required
                />
                <InputField
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={setAddressLine2}
                  placeholder="Apartment, suite, unit (optional)"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="City"
                    value={city}
                    onChange={setCity}
                    onBlur={() => handleBlur('city', city)}
                    error={touched.city ? errors.city : ''}
                    placeholder="Your city"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      onBlur={() => handleBlur('state', state)}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900
                                 outline-none transition-all duration-200
                                 ${touched.state && errors.state
                                   ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                   : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                 }`}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {touched.state && errors.state && (
                      <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>
                <InputField
                  label="Pincode"
                  value={pincode}
                  onChange={setPincode}
                  onBlur={() => handleBlur('pincode', pincode)}
                  error={touched.pincode ? errors.pincode : ''}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold
                                   flex items-center justify-center">3</span>
                  Payment Method
                </h2>
                {/* Test mode badge */}
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200
                               text-amber-700 text-xs font-semibold rounded-full">
                  <FaFlask className="text-[10px]" /> Test Mode
                </span>
              </div>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedPayment === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer
                                 transition-all duration-200
                                 ${isSelected
                                   ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                   : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                 }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={isSelected}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                      ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="text-lg" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-400">{option.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Test card info for online payments */}
              {selectedPayment !== 'COD' && (
                <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                  <p className="font-semibold mb-1">🧪 Test Mode — Use these test credentials:</p>
                  <p>Card: <span className="font-mono font-medium">4111 1111 1111 1111</span></p>
                  <p>Expiry: <span className="font-mono font-medium">Any future date</span> | CVV: <span className="font-mono font-medium">Any 3 digits</span></p>
                </div>
              )}
            </div>

            {/* Place Order Button (mobile) */}
            <div className="lg:hidden">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !isFormValid() || cartItems.length === 0}
                className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl
                           hover:bg-indigo-700 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {selectedPayment === 'COD' ? 'Placing order...' : 'Processing payment...'}
                  </>
                ) : (
                  `Place Order • ${formatPrice(finalTotal)}`
                )}
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Order Summary ─────────────────────────── */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Item list */}
              <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm text-gray-700 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">× {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-800 flex-shrink-0">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald-600 font-medium' : 'text-gray-700'}>
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (GST 18%)</span>
                  <span className="text-gray-700">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Place Order Button */}
              <div className="hidden lg:block mt-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                  </div>
                )}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !isFormValid() || cartItems.length === 0}
                  className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl
                             hover:bg-indigo-700 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {selectedPayment === 'COD' ? 'Placing order...' : 'Processing...'}
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                <FaLock className="text-gray-300" />
                Secured by K_M_Cart
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable input field component with label, error state, and validation.
 */
function InputField({ label, type = 'text', value, onChange, onBlur, error, placeholder, maxLength, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900
                   placeholder:text-gray-400 outline-none transition-all duration-200
                   ${error
                     ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                     : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                   }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default Checkout;
