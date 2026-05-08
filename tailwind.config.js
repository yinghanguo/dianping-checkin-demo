/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 大众点评品牌色系
        dpOrange: {
          DEFAULT: "#FF6F00",
          light: "#FFA040",
          deep: "#E55A00",
          bg: "#FFF6E5",
        },
        dpGreen: {
          DEFAULT: "#7BC142",
          light: "#C8E6A0",
          bg: "#E8F5D8",
        },
        dpInk: "#1A1A1A",
        dpText: {
          primary: "#1A1A1A",
          secondary: "#666666",
          tertiary: "#999999",
          quaternary: "#CCCCCC",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      animation: {
        "shutter-flash": "shutter 0.4s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
      },
      keyframes: {
        shutter: {
          "0%": { opacity: 0 },
          "50%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
