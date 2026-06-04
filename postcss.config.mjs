/** @type {import('postcss-load-config').Config} */
// Tailwind 3 has built-in prefixer, no need for autoprefixer
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
