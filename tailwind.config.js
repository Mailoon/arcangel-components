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
    },
  },

  plugins: [],
};
