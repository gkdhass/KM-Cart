/**
 * @file client/src/App.jsx
 * @description Root application component for K_M_Cart.
 * Complete route configuration with:
 * - ProtectedRoute: redirects to /login if not authenticated
 * - PublicOnlyRoute: redirects to / if already authenticated
 * - ConditionalNavbar/Chatbot/Footer: shown based on auth & route
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import ChatbotButton from './components/Chatbot/ChatbotButton';
import ChatbotModal from './components/Chatbot/ChatbotModal';
import { useChatbot } from './hooks/useChatbot';

/* ── Admin Imports ─────────────────────────────────────────────────── */
import AdminRoute from './components/Admin/AdminRoute';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import ManageProducts from './pages/Admin/ManageProducts';
import ManageCategories from './pages/Admin/ManageCategories';
import AddProduct from './pages/Admin/AddProduct';
import EditProduct from './pages/Admin/EditProduct';
import ManageOrders from './pages/Admin/ManageOrders';
import ManageUsers from './pages/Admin/ManageUsers';
import Analytics from './pages/Admin/Analytics';

/* ── Loading Spinner Component ─────────────────────────────────────── */

/**
 * Full-page loading spinner shown while auth state is being restored.
 * Matches the splash screen design for seamless transition.
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <img src="/logo.png" alt="K_M_Cart" className="w-16 h-16 rounded-2xl shadow-lg animate-pulse mb-4" />
      <p className="text-gray-500 text-sm font-medium">Loading K_M_Cart...</p>
      <div className="flex gap-1.5 mt-4">
        <div className="w-2 h-2 rounded-full bg-[#7C8BF2] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-[#7C8BF2] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-[#7C8BF2] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

/* ── Route Guards ──────────────────────────────────────────────────── */

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Shows loading spinner while auth state is being restored.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * PublicOnlyRoute — redirects authenticated users to /.
 * Used for login/register pages so logged-in users can't access them.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

/* ── Conditional Components ────────────────────────────────────────── */

/**
 * ConditionalNavbar — shows Navbar only when:
 * - User IS authenticated AND
 * - NOT on login/register/forgot-password pages
 */
function ConditionalNavbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hideOn = ['/login', '/register', '/forgot-password'];

  // Hide navbar on auth pages and admin pages (admin has its own navbar)
  if (!isAuthenticated || hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) return null;
  return <Navbar />;
}

/**
 * ConditionalChatbot — shows floating chatbot only when authenticated.
 */
function ConditionalChatbot() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const {
    messages, isOpen, isTyping, inputValue, unreadCount, quickReplies,
    messagesEndRef, inputRef, toggleChat, closeChat, clearChat,
    handleInputChange, handleSubmit, handleQuickReply,
  } = useChatbot();

  // Hide chatbot on admin pages
  if (!isAuthenticated || location.pathname.startsWith('/admin')) return null;

  return (
    <>
      <ChatbotButton isOpen={isOpen} unreadCount={unreadCount} onClick={toggleChat} />
      <ChatbotModal
        isOpen={isOpen}
        messages={messages}
        isTyping={isTyping}
        inputValue={inputValue}
        quickReplies={quickReplies}
        messagesEndRef={messagesEndRef}
        inputRef={inputRef}
        onClose={closeChat}
        onClear={clearChat}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onQuickReply={handleQuickReply}
      />
    </>
  );
}

/**
 * ConditionalFooter — shows Footer component on non-auth pages.
 */
function ConditionalFooter() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hideOn = ['/login', '/register', '/forgot-password'];

  // Hide footer on auth pages and admin pages
  if (!isAuthenticated || hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) return null;

  return <Footer />;
}

/* ── Main App Content ──────────────────────────────────────────────── */

/**
 * AppContent — inner component using auth context.
 * Separated from App so hooks can access AuthProvider context.
 */
function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar — shown only when logged in and not on auth pages */}
      <ConditionalNavbar />

      {/* Page Routes */}
      <main>
        <Routes>
          {/* Public routes — redirect to / if already logged in */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public pages — accessible to everyone (with navbar/footer if logged in) */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected routes — redirect to /login if not logged in */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin routes — protected by AdminRoute + AdminLayout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Chatbot — shown only when logged in */}
      <ConditionalChatbot />

      {/* Footer — hidden on login/register pages */}
      <ConditionalFooter />
    </div>
  );
}

/**
 * App — root component. Wraps everything in AuthProvider.
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
