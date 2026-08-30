/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // `<alpha-value>` es lo que permite `bg-navy/80`, `text-hueso/60`, etc.
      // Sin esto Tailwind descarta el modificador de opacidad sin avisar.
      colors: {
        noche: 'rgb(var(--noche-rgb) / <alpha-value>)',
        navy: 'rgb(var(--navy-rgb) / <alpha-value>)',
        'azul-luz': 'rgb(var(--azul-luz-rgb) / <alpha-value>)',
        oro: 'rgb(var(--oro-rgb) / <alpha-value>)',
        luz: 'rgb(var(--luz-rgb) / <alpha-value>)',
        hueso: 'rgb(var(--hueso-rgb) / <alpha-value>)',
        'oro-tinta': 'rgb(var(--oro-tinta-rgb) / <alpha-value>)',
      },
      fontFamily: {
        script: ['var(--font-script)', 'Snell Roundhand', 'cursive'],
        display: ['var(--font-display)', 'Optima', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Radio de los paneles. Suave, no de formulario.
        '3xl': '1.5rem',
      },
      letterSpacing: {
        // Etiquetas y epígrafes en versalitas muy espaciadas.
        eyebrow: '0.2em',
        // Tracking del lockup de nombres.
        lockup: '0.18em',
      },
    },
  },
  plugins: [],
};
