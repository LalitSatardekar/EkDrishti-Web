/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B1120',
        secondary: '#111827',
        surface: '#0F172A',
        accent: '#2563EB',
        accentLight: '#38BDF8',
        textPrimary: '#E5E7EB',
        textSecondary: '#94A3B8',
        borderSubtle: '#1F2937',
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
