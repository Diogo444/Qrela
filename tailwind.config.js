/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './pages/**/*.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        surface: {
          1: '#111C33',
          2: '#162447',
        },
        fg: '#E5E7EB',
        muted: '#94A3B8',
        accent: '#38BDF8',
        danger: '#EF4444',
        border: 'rgba(148,163,184,0.2)',
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(56, 189, 248, 0.35)',
      },
    },
  },
  plugins: [],
}
