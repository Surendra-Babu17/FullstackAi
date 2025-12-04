/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        secondary: "#A855F7",
        accent: "#756c68ff"
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        fade: "fade 600ms ease-in-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fade: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        }
      }
    }
  },
  plugins: [],
};
