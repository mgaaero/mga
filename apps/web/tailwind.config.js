/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          dark: '#070b14',
          card: '#0f172a',
          border: '#1e293b',
          accent: '#0284c7',
          alert: '#ef4444',
          hazard: '#f97316',
          memory: '#94a3b8',
          mitigated: '#10b981'
        }
      }
    },
  },
  plugins: [],
}

