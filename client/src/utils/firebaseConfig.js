/**
 * @file client/src/utils/firebaseConfig.js
 * @description Firebase configuration for Google + GitHub OAuth login.
 * Validates env vars, initializes Firebase, and exports sign-in functions.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ── Read config from Vite env variables ──────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── Validate all required keys ───────────────────────────────────────
const REQUIRED_KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

let firebaseReady = false;

const missingKeys = Object.entries(REQUIRED_KEYS)
  .filter(([key]) => !firebaseConfig[key] || firebaseConfig[key] === 'undefined')
  .map(([, envName]) => envName);

if (missingKeys.length > 0) {
  console.error('Missing Firebase env vars:', missingKeys.join(', '));
  console.error('Add them to client/.env and restart the dev server!');
} else {
  firebaseReady = true;
  console.log('Firebase config loaded!');
}

// ── Initialize Firebase ──────────────────────────────────────────────
let app = null;
let auth = null;
let storage = null;
let googleProvider = null;
let githubProvider = null;

if (firebaseReady) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);

    // Google provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    // GitHub provider
    githubProvider = new GithubAuthProvider();
    githubProvider.addScope('user:email');
  } catch (error) {
    console.error('Firebase init failed:', error.message);
    firebaseReady = false;
  }
}

// ── Error message helper ─────────────────────────────────────────────
function getFirebaseErrorMessage(error) {
  switch (error.code) {
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not enabled. Go to Firebase Console → Authentication → Get Started, then enable Google/GitHub sign-in methods.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup blocked by browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup can be open at a time.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in method. Try using Google login instead.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase Auth. Add it to Firebase Console → Authentication → Settings → Authorized domains.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

// ── Helper: Detect mobile viewport ───────────────────────────────────
function isMobileViewport() {
  // Check viewport width
  if (window.innerWidth <= 768) return true;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  return mobileRegex.test(userAgent.toLowerCase());
}

// ── Google Sign In ───────────────────────────────────────────────────
export const signInWithGoogle = async () => {
  if (!firebaseReady || !auth || !googleProvider) {
    throw new Error(
      'Firebase is not configured. Please check your .env file and restart the dev server.'
    );
  }

  // Detect if we should use redirect instead of popup
  const shouldUseRedirect = isMobileViewport();
  
  console.log('[Firebase] Google sign-in method:', shouldUseRedirect ? 'redirect' : 'popup');

  try {
    // Mobile: Use redirect (no popup blocking issues)
    if (shouldUseRedirect) {
      console.log('[Firebase] Using signInWithRedirect for mobile viewport');
      await signInWithRedirect(auth, googleProvider);
      // Function returns here - user will be redirected away
      // Result will be handled by getRedirectResult() on page load
      return null; // Redirect in progress
    }
    
    // Desktop: Try popup first
    console.log('[Firebase] Attempting signInWithPopup');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    return {
      name: user.displayName || 'Google User',
      email: user.email,
      photo: user.photoURL || '',
      googleId: user.uid,
      token: await user.getIdToken(),
    };
    
  } catch (error) {
    console.error('Google sign-in error:', error.code, error.message);
    
    // Auto-retry with redirect if popup was blocked
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn('[Firebase] Popup blocked, retrying with redirect...');
      try {
        await signInWithRedirect(auth, googleProvider);
        return null; // Redirect in progress
      } catch (redirectError) {
        console.error('Redirect also failed:', redirectError);
        throw new Error(getFirebaseErrorMessage(redirectError));
      }
    }
    
    throw new Error(getFirebaseErrorMessage(error));
  }
};

// ── Get Redirect Result (Call on app load) ───────────────────────────
/**
 * Check for redirect result after user returns from Google/GitHub OAuth.
 * Should be called once when the app loads (e.g., in App.jsx or AuthContext).
 * @returns {Promise<Object|null>} User data if redirect completed, null otherwise
 */
export const checkRedirectResult = async () => {
  if (!firebaseReady || !auth) {
    return null;
  }

  try {
    console.log('[Firebase] Checking for redirect result...');
    const result = await getRedirectResult(auth);
    
    if (!result) {
      console.log('[Firebase] No redirect result found (normal page load)');
      return null;
    }
    
    const user = result.user;
    console.log('[Firebase] ✓ Redirect sign-in successful:', user.email);
    
    // Determine provider from result
    const providerId = result.providerId || result.user.providerData[0]?.providerId;
    const isGoogle = providerId?.includes('google');
    
    return {
      name: user.displayName || (isGoogle ? 'Google User' : 'GitHub User'),
      email: user.email,
      photo: user.photoURL || '',
      googleId: isGoogle ? user.uid : null,
      githubId: !isGoogle ? user.uid : null,
      token: await user.getIdToken(),
      provider: isGoogle ? 'google' : 'github',
    };
  } catch (error) {
    console.error('[Firebase] Redirect result error:', error.code, error.message);
    throw new Error(getFirebaseErrorMessage(error));
  }
};

// ── GitHub Sign In ───────────────────────────────────────────────────
export const signInWithGithub = async () => {
  if (!firebaseReady || !auth || !githubProvider) {
    throw new Error(
      'Firebase is not configured. Please check your .env file and restart the dev server.'
    );
  }

  // Detect if we should use redirect instead of popup
  const shouldUseRedirect = isMobileViewport();
  
  console.log('[Firebase] GitHub sign-in method:', shouldUseRedirect ? 'redirect' : 'popup');

  try {
    // Mobile: Use redirect
    if (shouldUseRedirect) {
      console.log('[Firebase] Using signInWithRedirect for mobile viewport');
      await signInWithRedirect(auth, githubProvider);
      return null; // Redirect in progress
    }
    
    // Desktop: Try popup first
    console.log('[Firebase] Attempting signInWithPopup');
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    return {
      name: user.displayName || 'GitHub User',
      email: user.email,
      photo: user.photoURL || '',
      githubId: user.uid,
      token: await user.getIdToken(),
    };
    
  } catch (error) {
    console.error('GitHub sign-in error:', error.code, error.message);
    
    // Auto-retry with redirect if popup was blocked
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn('[Firebase] Popup blocked, retrying with redirect...');
      try {
        await signInWithRedirect(auth, githubProvider);
        return null; // Redirect in progress
      } catch (redirectError) {
        console.error('Redirect also failed:', redirectError);
        throw new Error(getFirebaseErrorMessage(redirectError));
      }
    }
    
    throw new Error(getFirebaseErrorMessage(error));
  }
};

export { auth, googleProvider, githubProvider, firebaseReady, storage };
export default app;
