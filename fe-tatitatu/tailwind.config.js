import scrollbarHide from 'tailwind-scrollbar-hide';

export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7B0C42',
        secondary: '#D8D8D8',
        pink: '#FFE0ED',
        oren: '#DA5903',
        merah: '#C21747',
        hijau: '#269529',
        coklatMuda: '#F6E9DF',
        coklatTua: '#71503D',
        biruMuda: '#D7EAFF',
        biruTua: '#023F80'
      }
    },
  },
  plugins: [
    scrollbarHide,
  ],
};
