/**
 * @file client/src/components/Layout/Navbar.jsx
 * @description Auth-aware navigation bar with user avatar dropdown,
 * cart icon with badge, mobile hamburger menu, and conditional content
 * based on login state.
 * Theme: Indigo Blue (#7C8BF2) + Lavender (#DFE1F2)
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FaShoppingBag, FaSignInAlt, FaSignOutAlt, FaUser, FaBox,
  FaShoppingCart, FaSearch, FaHeart, FaTimes,
} from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import CartDrawer from '../Cart/CartDrawer';

/**
 * Navbar component — sticky top navigation bar.
 * Shows different content based on auth state.
 */
function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  /** Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  /** Focus search input when opened */
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  /** Get user initials for avatar */
  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  /** Check if a nav link is active */
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ── Brand Logo ──────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="K_M_Cart"
                className="w-9 h-9 rounded-xl shadow-md
                           group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"
              />
              <div>
                <span className="text-lg font-bold gradient-text">K_M_Cart</span> <span>  </span>
                <span className="hidden sm:inline text-[10px] text-[#7C8BF2] block -mt-1 font-medium">
                      Fresh Grocery. Delivered Fast.
                </span>
              </div>
            </Link>

            {/* ── LOGGED IN: Desktop Navigation ───────────────────────── */}
            {isAuthenticated ? (
              <>
                {/* Desktop search bar */}
                <div className="hidden lg:flex flex-1 max-w-md mx-8">
                  <form onSubmit={handleSearch} className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50
                                 text-gray-900 placeholder:text-gray-400 text-sm
                                 focus:border-[#7C8BF2] focus:ring-2 focus:ring-[#7C8BF2]/20
                                 focus:bg-white outline-none transition-all duration-200"
                    />
                  </form>
                </div>

                {/* Center nav links */}
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                               ${isActive('/') ? 'text-[#7C8BF2] bg-[#DFE1F2]' : 'text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2]'}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                               flex items-center gap-1.5
                               ${isActive('/products') ? 'text-[#7C8BF2] bg-[#DFE1F2]' : 'text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2]'}`}
                  >
                    <FaShoppingBag className="text-xs" /> Products
                  </Link>
                  <Link
                    to="/orders"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                               flex items-center gap-1.5
                               ${isActive('/orders') ? 'text-[#7C8BF2] bg-[#DFE1F2]' : 'text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2]'}`}
                  >
                    <FaBox className="text-xs" /> Orders
                  </Link>
                </div>

                {/* Right side icons */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Mobile search toggle (tablet) */}
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#7C8BF2]
                               hover:bg-[#DFE1F2] transition-all duration-200"
                    aria-label="Search"
                  >
                    <FaSearch className="text-lg" />
                  </button>

                  {/* Wishlist */}
                  <button
                    className="relative p-2 rounded-xl text-gray-600 hover:text-[#7C8BF2]
                               hover:bg-[#DFE1F2] transition-all duration-200"
                    aria-label="Wishlist"
                  >
                    <FaHeart className="text-lg" />
                  </button>

                  {/* Cart */}
                  <button
                    onClick={toggleCart}
                    className="relative p-2 rounded-xl text-gray-600 hover:text-[#7C8BF2]
                               hover:bg-[#DFE1F2] transition-all duration-200"
                    aria-label="Open cart"
                  >
                    <FaShoppingCart className="text-xl" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#7C8BF2] text-white text-xs
                                       w-5 h-5 rounded-full flex items-center justify-center font-bold
                                       animate-bounce-once shadow-sm">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>

                  {/* User Avatar Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C8BF2] to-[#5A6BE0]
                                 flex items-center justify-center text-white text-sm font-bold
                                 hover:shadow-lg hover:scale-105 transition-all duration-200
                                 ring-2 ring-white shadow-md"
                    >
                      {getInitials()}
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border
                                      border-gray-100 py-2 animate-fade-in z-50">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800">
                            Hello, {user?.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700
                                       hover:bg-[#DFE1F2] hover:text-[#7C8BF2] transition-all
                                       flex items-center gap-3"
                          >
                            <FaUser className="text-xs text-gray-400" /> My Profile
                          </button>
                          <button
                            onClick={() => { setDropdownOpen(false); navigate('/orders'); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700
                                       hover:bg-[#DFE1F2] hover:text-[#7C8BF2] transition-all
                                       flex items-center gap-3"
                          >
                            <FaBox className="text-xs text-gray-400" /> My Orders
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { setDropdownOpen(false); navigate('/admin/dashboard'); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-[#5A6BE0]
                                         hover:bg-[#DFE1F2] transition-all
                                         flex items-center gap-3"
                            >
                              <FaShoppingBag className="text-xs" /> Admin Dashboard
                            </button>
                          )}
                        </div>

                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600
                                       hover:bg-red-50 transition-all flex items-center gap-3"
                          >
                            <FaSignOutAlt className="text-xs" /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* ── LOGGED OUT: Desktop buttons ─────────────────────────── */
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                             text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2] transition-all duration-200"
                >
                  <FaSignInAlt className="text-xs" /> Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  Register
                </Link>
              </div>
            )}

            {/* ── Mobile: Cart + Menu Button ──────────────────────────── */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && (
                <>
                  {/* Mobile search */}
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="p-2 rounded-xl text-gray-600 hover:text-[#7C8BF2]
                               hover:bg-[#DFE1F2] transition-all duration-200"
                    aria-label="Search"
                  >
                    <FaSearch className="text-lg" />
                  </button>

                  {/* Mobile Cart */}
                  <button
                    onClick={toggleCart}
                    className="relative p-2 rounded-xl text-gray-600 hover:text-[#7C8BF2]
                               hover:bg-[#DFE1F2] transition-all duration-200"
                    aria-label="Open cart"
                  >
                    <FaShoppingCart className="text-lg" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#7C8BF2] text-white text-[10px]
                                       w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* Hamburger menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* ── Mobile Search Bar (slide-down) ──────────────────────────── */}
          {searchOpen && (
            <div className="lg:hidden py-3 border-t border-gray-100 animate-fade-in">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                               text-gray-900 placeholder:text-gray-400 text-sm outline-none
                               focus:border-[#7C8BF2] focus:ring-2 focus:ring-[#7C8BF2]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </form>
            </div>
          )}

          {/* ── Mobile Menu ────────────────────────────────────────────── */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
              {isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="px-4 py-3 mb-2 bg-[#DFE1F2] rounded-xl mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C8BF2] to-[#5A6BE0]
                                      flex items-center justify-center text-white text-sm font-bold">
                        {getInitials()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/"
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                               ${isActive('/') ? 'text-[#7C8BF2] bg-[#DFE1F2]' : 'text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2]'}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                               ${isActive('/products') ? 'text-[#7C8BF2] bg-[#DFE1F2]' : 'text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2]'}`}
                  >
                    Products
                  </Link>
                  <Link
                    to="/orders"
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                               ${isActive('/orders') ? 'text-[#7C8BF2] bg-[#DFE1F2]' : 'text-gray-600 hover:text-[#7C8BF2] hover:bg-[#DFE1F2]'}`}
                  >
                    My Orders
                  </Link>

                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium
                                 text-red-600 hover:bg-red-50 transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600
                               hover:text-[#7C8BF2] hover:bg-[#DFE1F2] transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block mx-4 mt-1 text-center btn-primary text-sm py-2"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Cart Drawer ───────────────────────────────────────────────── */}
      <CartDrawer />
    </>
  );
}

export default Navbar;
