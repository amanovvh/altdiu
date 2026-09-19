import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './messages/**/*.json',
  ],
  darkMode: 'class', // reserved for future dark theme
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        // === BRAND PALETTE ===
        // Primary: deep academic navy (matches the official seal)
        primary: {
          50: '#eef2f8',
          100: '#d8e0ee',
          200: '#aebdd9',
          300: '#7a93bf',
          400: '#4f6fa6',
          500: '#2f528a',
          600: '#1f3f70',
          700: '#172f57',
          800: '#0e2046',  // brand primary (matches seal navy)
          900: '#081634',
          950: '#040b1c',
        },
        // Accent: refined gold (matches the seal gold)
        accent: {
          50: '#fbf6e9',
          100: '#f3e8c4',
          200: '#e8d391',
          300: '#d8b86a',
          400: '#c9a961',  // brand accent
          500: '#b08c3f',
          600: '#977430',
          700: '#765a26',
          800: '#5d4720',
          900: '#4a3a1c',
          950: '#2a2010',
        },
        // Neutral text system
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#5b6b7d',  // muted text
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#15202b',
        },
        // Surfaces
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f6f7fb',
          dark: '#0a1830',
          card: '#ffffff',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.875rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm-soft': '0 1px 2px rgba(10, 37, 64, 0.05)',
        soft: '0 4px 14px rgba(10, 37, 64, 0.06)',
        DEFAULT: '0 10px 30px rgba(10, 37, 64, 0.08)',
        lg: '0 20px 60px rgba(10, 37, 64, 0.12)',
        xl: '0 30px 80px rgba(10, 37, 64, 0.16)',
        'inner-soft': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'accent-glow': '0 12px 40px -8px rgba(201, 169, 97, 0.35)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0a2540 0%, #143b62 50%, #1b4a7a 100%)',
        'gradient-accent': 'linear-gradient(135deg, #c9a961 0%, #a8862e 100%)',
        'gradient-soft': 'linear-gradient(180deg, #f6f7fb 0%, #ffffff 100%)',
        'hero-pattern': "radial-gradient(circle at 20% 30%, rgba(201,169,97,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(45,95,160,0.12) 0%, transparent 50%)",
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'marquee': 'marquee 40s linear infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [typography],
};

export default config;
