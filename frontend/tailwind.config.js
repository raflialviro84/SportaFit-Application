/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        'sporta-blue': '#1246B3',      // warna utama (CTA, button)
        'sporta-bg': '#EEF2FF',        // background terang
        'sporta-dark': '#1E3A8A',      // gradasi gelap / hero
        'sporta-gray': '#6B7280',      // teks kecil
        'sporta-text': '#1F2937',      // teks utama
      },
    },
  },
  plugins: [],
}
