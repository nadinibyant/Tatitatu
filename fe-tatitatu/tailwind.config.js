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
          biruTua: '#023F80',
          hitam: '#2D2D2D'
        }
      },
    },
    safelist: [
      'hover:bg-primary',
      'hover:bg-biruTua',
      'hover:bg-coklatTua',
      'hover:bg-hitam',
      'hover:bg-secondary',
      'text-primary',
      'text-biruTua',
      'text-coklatTua',
      'text-biruMuda',
      'text-hitam',
      'text-secondary',
      'bg-biruMuda',
      'bg-hitam',
      'bg-secondary',
      'border-primary',
      'border-biruTua',
      'border-coklatTua',
      'border-hitam',
      'border-secondary',
      'focus:ring-primary',
      'focus:ring-biruTua',
      'focus:ring-coklatTua',
      'focus:ring-hitam',
      'focus:ring-secondary',
    ],
    plugins: [
      scrollbarHide,
    ],
  };
