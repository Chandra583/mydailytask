/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        primary: {
          dark: '#0a0e27',
          navy: '#0f172a',
          slate: '#1e293b',
        },
        accent: {
          pink: '#e91e63',
          coral: '#ec4899',
          purple: '#a855f7',
        },
        // Modern color palette
        modern: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          emerald: '#10b981',
          green: '#22c55e',
          yellow: '#eab308',
          amber: '#f59e0b',
          orange: '#f97316',
          red: '#ef4444',
          rose: '#f43f5e',
        },
        // Time period colors (updated for modern look)
        time: {
          morning: '#06b6d4',   // Cyan-500
          afternoon: '#f59e0b', // Amber-500
          evening: '#f97316',   // Orange-500
          night: '#8b5cf6',     // Violet-500
        },
        week: {
          1: '#3b82f6', // Blue
          2: '#10b981', // Green
          3: '#a855f7', // Purple
          4: '#f59e0b', // Yellow
          5: '#ef4444', // Red/Orange
        },
        // Glass effect colors
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'widest': '0.1em',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-pink': '0 0 20px rgba(233, 30, 99, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'progress': 'progress 1s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        progress: {
          '0%': { strokeDashoffset: '339.292' },
          '100%': { strokeDashoffset: 'var(--progress-offset)' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
