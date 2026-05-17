/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        green: { 50:'#EDF5E2',100:'#C8E49A',200:'#A1D45A',400:'#78B828',600:'#4A8A14',800:'#2E5A0B' },
        teal: { 50:'#E0F6EE',100:'#9FE4CE',200:'#56CEAA',400:'#22B885',600:'#138563',800:'#0A5842' },
        amber: { 50:'#FAEEDA',100:'#FAC775',200:'#EF9F27',400:'#BA7517',600:'#854F0B' },
        coral: { 50:'#FAECE7',100:'#F5C4B3',400:'#D85A30',600:'#993C1D' },
      },
    },
  },
  plugins: [],
}
