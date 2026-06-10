module.exports = {
  plugins: {
    // Tailwind is handled via the Vite plugin (@tailwindcss/vite),
    // avoid registering `tailwindcss` directly here to prevent PostCSS plugin conflicts.
    autoprefixer: {},
  },
};
