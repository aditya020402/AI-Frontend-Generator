/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                    // ✅ Required
    "./src/**/*.{js,jsx,ts,tsx}",     // ✅ Scans ALL React components
    "./public/index.html"             // ✅ HTML template
  ],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#3b82f6', 600: '#2563eb' }
      }
    }
  },
  plugins: [],
}
