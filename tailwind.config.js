// tailwind.config.js
module.exports = {
  darkMode: 'class', // 'media' 대신 'class'로 변경: prefers 무시하고 'dark' 클래스에 의존
  content: ['./src/**/*.{js,ts,jsx,tsx}'], // 적절히 설정
  theme: {
    extend: {},
  },
  plugins: [],
};