/**
 * @file client/src/pages/Login.jsx
 * @description Centered card login page with Firebase Auth (Email, Google, GitHub).
 * Purple-themed with sparkle logo, error handling, and social login buttons.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle,
  FaSpinner, FaExclamationTriangle,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { signInWithGoogle, checkRedirectResult } from '../utils/firebaseConfig';
import api from '../utils/api';

/**
 * Maps Firebase error codes to user-friendly messages.
 */
function getFirebaseErrorMsg(code) {
  const map = {
    'auth/configuration-not-found':
      'Firebase Authentication is not enabled. Please enable Google/GitHub sign-in in Firebase Console → Authentication → Sign-in method.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups.',
    'auth/cancelled-popup-request': 'Only one sign-in popup can be open at a time.',
    'auth/account-exists-with-different-credential':
      'An account with this email already exists using a different sign-in method.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/unauthorized-domain':
      'This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/invalid-email': 'Please enter a valid email address.',
  };
  return map[code] || null;
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(''); // 'google' | 'github' | ''
  const [redirecting, setRedirecting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Check for OAuth Redirect Result on Page Load ─────────────────
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('[Login] Checking for OAuth redirect result...');
        const redirectUser = await checkRedirectResult();
        
        if (!redirectUser) {
          console.log('[Login] No redirect result found (normal page load)');
          return;
        }
        
        console.log('[Login] ✓ OAuth redirect successful:', redirectUser.email);
        setRedirecting(true);
        setSocialLoading(redirectUser.provider === 'google' ? 'google' : 'github');
        
        // Send to backend
        const endpoint = redirectUser.provider === 'google' ? '/auth/google' : '/auth/github';
        const payload = redirectUser.provider === 'google' 
          ? {
              name: redirectUser.name,
              email: redirectUser.email,
              photo: redirectUser.photo,
              googleId: redirectUser.googleId,
            }
          : {
              name: redirectUser.name,
              email: redirectUser.email,
              photo: redirectUser.photo,
              githubId: redirectUser.githubId,
            };
        
        const res = await api.post(endpoint, payload);
        
        if (res.data.success) {
          const { user: userData, token } = res.data.data;
          localStorage.setItem('gkcart_token', token);
          localStorage.setItem('gkcart_user', JSON.stringify(userData));
          console.log('[Login] ✓ Backend authentication successful, redirecting...');
          window.location.href = userData.role === 'admin' ? '/admin/dashboard' : '/';
        } else {
          setError(res.data.message || 'OAuth login failed.');
          setRedirecting(false);
          setSocialLoading('');
        }
      } catch (err) {
        console.error('[Login] Redirect handling error:', err);
        setError(err.message || 'OAuth sign-in failed. Please try again.');
        setRedirecting(false);
        setSocialLoading('');
      }
    };
    
    handleRedirect();
  }, []);

  // ── Email/Password Login ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      const friendlyMsg = getFirebaseErrorMsg(err.code);
      setError(friendlyMsg || err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Login (Fixed: Direct call, no setState before Firebase) ────
  const handleGoogleLogin = async () => {
    // DO NOT call setState before Firebase - it breaks the synchronous gesture chain!
    // setState will be called after Firebase returns or during redirect
    
    setError(''); // Clear previous errors (OK - doesn't break popup)
    
    try {
      const googleUser = await signInWithGoogle();
      
      // If redirect flow, signInWithGoogle returns null and redirects user away
      if (googleUser === null) {
        console.log('[Login] Redirect to Google initiated, user will return after auth');
        setRedirecting(true);
        return; // User is being redirected, don't continue
      }
      
      // Popup flow returned successfully
      setSocialLoading('google'); // Now safe to set loading state
      
      const res = await api.post('/auth/google', {
        name: googleUser.name,
        email: googleUser.email,
        photo: googleUser.photo,
        googleId: googleUser.googleId,
      });

      if (res.data.success) {
        const { user: userData, token } = res.data.data;
        localStorage.setItem('gkcart_token', token);
        localStorage.setItem('gkcart_user', JSON.stringify(userData));
        window.location.href = userData.role === 'admin' ? '/admin/dashboard' : '/';
      } else {
        setError(res.data.message || 'Google login failed.');
        setSocialLoading('');
      }
    } catch (err) {
      const friendlyMsg = getFirebaseErrorMsg(err.code);
      setError(friendlyMsg || err.message || 'Google login failed.');
      setSocialLoading('');
    }
  };


  const anyLoading = isLoading || !!socialLoading || redirecting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-10">
      {/* ── Centered Card ──────────────────────────────────────────── */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10 sm:px-10">

          {/* ── Logo + Brand ─────────────────────────────────────── */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600
                            flex items-center justify-center shadow-lg shadow-purple-200 mb-4">
              <HiSparkles className="text-white text-2xl" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600
                           bg-clip-text text-transparent">
              K_M_Cart
            </h1>
          </div>

          {/* ── Heading ──────────────────────────────────────────── */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your K_M_Cart account</p>
            <p className="text-sm mt-2">
              New user?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                Create account
              </Link>
            </p>
          </div>

          {/* ── Error Alert ──────────────────────────────────────── */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50
                            animate-fade-in" id="login-error-alert">
              <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Login Form ───────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={anyLoading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white
                             text-gray-900 placeholder:text-gray-400 text-sm
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                             outline-none transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={anyLoading}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white
                             text-gray-900 placeholder:text-gray-400 text-sm
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                             outline-none transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={anyLoading}
              id="login-submit-btn"
              className="w-full py-3 rounded-xl font-semibold text-white text-sm
                         bg-gradient-to-r from-purple-600 to-indigo-600
                         hover:from-purple-700 hover:to-indigo-700
                         focus:ring-4 focus:ring-purple-500/30
                         shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300
                         transition-all duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg
                         flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* ── Divider ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Social Login Button ──────────────────────────────── */}
          <div>
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={anyLoading}
              id="google-login-btn"
              className="w-full flex items-center justify-center gap-2.5 py-3 
                         border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white
                         hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'google' ? (
                <FaSpinner className="animate-spin text-purple-500" />
              ) : (
                <FaGoogle className="text-red-500" />
              )}
              Continue with Google
            </button>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} K_M_Cart. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
