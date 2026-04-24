import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Pretendard",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
      colors: {
        gov: {
          navy: "#0b2e5a",
          blue: "#1e5aad",
          accent: "#d94e1f",
        },
        paper: "#fafaf7",
      },
    },
  },
  plugins: [],
};

export default config;
