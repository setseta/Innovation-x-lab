/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050816',
        slateGlow: '#0f172a',
        electric: '#3b82f6',
        violetGlow: '#7c3aed',
        textSoft: '#cbd5e1',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.35), 0 20px 60px rgba(59,130,246,0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
