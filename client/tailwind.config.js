/**
 * @file client/tailwind.config.js
 * @description Tailwind CSS configuration for K_M_Cart.
 * Cream/Peach (#FBE8CE) + Orange (#F96D00) theme with admin dashboard.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FEF8F0',
          100: '#FBE8CE',
          200: '#E8C99A',
          300: '#F5D5A8',
          400: '#F96D00',
          500: '#E86500',
          600: '#D65C00',
          700: '#C45300',
          800: '#B24A00',
          900: '#A04100',
        },
        accent: {
          400: '#FFA040',
          500: '#F96D00',
          600: '#E86500',
          700: '#D65C00',
        },
        admin: {
          bg: '#FBE8CE',
          card: '#FFFFFF',
          accent: '#F96D00',
          'accent-hover': '#E86500',
          surface: '#E4DFB5',
          border: '#E8C99A',
          sidebar: '#FBE8CE',
          header: '#E4DFB5',
          hover: '#E8C99A',
          active: '#F96D00',
        },
      },
      textColor: {
        DEFAULT: '#000000',
      },
      animation: {
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Unique page animations
        'hero-fade': 'heroFade 0.8s ease-out',
        'hero-slide': 'heroSlide 1s ease-out',
        'stagger-card': 'staggerCard 0.5s ease-out',
        'zoom-in': 'zoomIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'card-entrance': 'cardEntrance 0.5s ease-out',
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
        'spin-slow': 'spinSlow 1.5s linear infinite',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '0.3' },
        },
        // Unique page animation keyframes
        heroFade: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heroSlide: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        staggerCard: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        cardEntrance: {
          '0%': { opacity: '0', transform: 'translateY(20px) rotateX(-10deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'chat': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'chat-hover': '0 30px 60px rgba(0, 0, 0, 0.2)',
        'button-glow': '0 0 20px rgba(124, 139, 242, 0.4)',
      },
    },
  },
  plugins: [],
};
