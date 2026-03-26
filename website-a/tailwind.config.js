/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark base
        'ct-bg': '#0A0F1C',
        'ct-surface': '#0F1629',
        'ct-card': '#131D35',
        'ct-border': '#1E2D4A',
        'ct-hover': '#1A2540',

        // Government accents
        'ct-saffron': '#FF9933',
        'ct-india': '#138808',
        'ct-navy': '#000080',

        // Modern accents
        'ct-cyan': '#00D4FF',
        'ct-emerald': '#10B981',
        'ct-amber': '#F59E0B',
        'ct-red': '#EF4444',
        'ct-purple': '#8B5CF6',

        // Text
        'ct-text': '#E2E8F0',
        'ct-muted': '#64748B',
        'ct-subtle': '#94A3B8',

        // Legacy palette kept for compatibility during migration
        gov: {
          navy: '#1a3a6b',
          blue: '#2d5fa6',
          orange: '#f15a22',
          dark: '#0a1f44',
          bg: '#f5f7fa',
          border: '#e8ecf0',
          table: '#dce8f5',
          stripe: '#f0f5fb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, #131D35 0%, #0F1629 100%)',
        'gradient-saffron': 'linear-gradient(135deg, #FF9933 0%, #FF6600 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
        'gradient-amber': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-saffron': '0 0 20px rgba(255, 153, 51, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
};
