/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noche: 'var(--noche)',
        navy: 'var(--navy)',
        'azul-luz': 'var(--azul-luz)',
        oro: 'var(--oro)',
        luz: 'var(--luz)',
        hueso: 'var(--hueso)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Didot', 'Bodoni MT', 'Georgia', 'serif'],
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
