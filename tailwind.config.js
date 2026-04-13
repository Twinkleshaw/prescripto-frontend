/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0d9488", // teal — matches your design
        "primary-dark": "#0f766e",
        sidebar: "#f8fafc",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
