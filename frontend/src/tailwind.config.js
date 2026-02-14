/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/pages/**/*.{js,jsx}",
    "./src/stores/**/*.{js,jsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      // Custom Colors (used throughout app)
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          900: '#111827'
        },
        slate: {
          50: '#f8fafc',
          900: '#0f172a'
        }
      },
      
      // Custom Shadows (used in cards, buttons)
      boxShadow: {
        'glow': '0 0 0 1px rgba(59, 130, 246, 0.5)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'button': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      },
      
      // Custom Border Radius (consistent with MUI)
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      
      // Typography (Inter font)
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      
      // Smooth Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      
      // Responsive breakpoints (Tailwind default + custom)
      screens: {
        'xs': '475px',
        '3xl': '1600px'
      }
    },
  },
  plugins: [
    // Line clamp for text truncation
    require('@tailwindcss/line-clamp'),
    
    // Typography plugin (optional - for prose)
    require('@tailwindcss/typography')
  ],
  corePlugins: {
    preflight: true  // Reset/normalize CSS
  }
}
