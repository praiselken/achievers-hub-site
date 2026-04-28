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
        green: { 50:'#EAF3DE',100:'#C0DD97',200:'#97C459',400:'#639922',600:'#3B6D11',800:'#27500A' },
        teal: { 50:'#E1F5EE',100:'#9FE1CB',200:'#5DCAA5',400:'#1D9E75',600:'#0F6E56',800:'#085041' },
        amber: { 50:'#FAEEDA',100:'#FAC775',200:'#EF9F27',400:'#BA7517',600:'#854F0B' },
        coral: { 50:'#FAECE7',100:'#F5C4B3',400:'#D85A30',600:'#993C1D' },
      },
    },
  },
  plugins: [],
}
