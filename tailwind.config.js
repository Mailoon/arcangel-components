/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/demo-app/src/**/*.{html,ts}",
    "./projects/arcangel-components/src/lib/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        greenSC: '#01A393',
        'dark-graySC': '#1D2732',
        'dark-gray-contrastSC': '#3D5F7D',
      },
      keyframes: {
        'arc-popover-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'arc-popover-in': 'arc-popover-in 150ms ease-out',
      },
      boxShadow: {
        'arc-panel': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
