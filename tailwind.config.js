/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: "#0d9488",
          dark: "#0f766e",
          light: "#5eead4",
        },
      },
    },
  },
  plugins: [],
};
