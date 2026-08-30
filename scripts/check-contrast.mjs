#!/usr/bin/env node
/**
 * Auditoría de contraste WCAG 2.1 de la paleta.
 *
 *   node scripts/check-contrast.mjs
 *
 * Los colores se leen de app/globals.css, no de una copia: si alguien cambia un
 * token, esta auditoría lo ve. Sale con código 1 si algún uso declarado no llega
 * a su mínimo.
 */

import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

const tokens = {};
for (const [, name, hex] of css.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  tokens[name] = hex;
}

/** Luminancia relativa según WCAG 2.1. */
function luminance(hex) {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla un color sobre un fondo, para la jerarquía por opacidad. */
function over(hex, bg, alpha) {
  const mix = (i) => {
    const f = parseInt(hex.slice(i, i + 2), 16);
    const b = parseInt(bg.slice(i, i + 2), 16);
    return Math.round(f * alpha + b * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${mix(1)}${mix(3)}${mix(5)}`;
}

// Cada fila declara un uso real, no una combinación teórica.
// AA texto normal = 4.5, AA texto grande (>=24px o >=19px bold) = 3.0.
const CHECKS = [
  ['hueso 100% sobre noche', tokens.hueso, tokens.noche, 4.5, 'texto de cuerpo'],
  ['hueso 100% sobre navy', tokens.hueso, tokens.navy, 4.5, 'texto sobre superficie'],
  ['hueso 60% sobre noche', over(tokens.hueso, tokens.noche, 0.6), tokens.noche, 4.5, 'texto secundario'],
  ['hueso 60% sobre navy', over(tokens.hueso, tokens.navy, 0.6), tokens.navy, 4.5, 'opción Sí/No no elegida'],
  ['hueso 40% sobre noche', over(tokens.hueso, tokens.noche, 0.4), tokens.noche, 3.0, 'solo epígrafes grandes'],
  ['luz sobre noche', tokens.luz, tokens.noche, 4.5, 'estrellas, foco, acentos'],
  ['luz sobre navy', tokens.luz, tokens.navy, 4.5, 'acentos sobre superficie'],
  ['oro sobre noche', tokens.oro, tokens.noche, 4.5, 'filetes y subrayados'],
  ['oro sobre navy', tokens.oro, tokens.navy, 4.5, 'filetes sobre superficie'],
  ['noche sobre oro', tokens.noche, tokens.oro, 4.5, 'texto en selección'],
  ['hueso sobre azul-luz', tokens.hueso, tokens['azul-luz'], 4.5, 'texto sobre el azul claro'],
];

let failures = 0;
console.log('');
console.log('  uso                              ratio   mín   resultado');
console.log('  ' + '-'.repeat(62));

for (const [label, fg, bg, min, note] of CHECKS) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failures++;
  console.log(
    `  ${label.padEnd(30)} ${r.toFixed(2).padStart(6)}  ${min.toFixed(1)}   ${ok ? 'PASA' : 'FALLA'}  ${note}`,
  );
}

// El aviso original de some_specs.md, ahora comprobado en vez de asumido.
const oroSobreHueso = ratio(tokens.oro, tokens.hueso);
console.log('');
console.log(
  `  Nota: oro sobre hueso da ${oroSobreHueso.toFixed(2)}:1 — por eso el fondo es oscuro.`,
);
console.log(
  `  Sobre navy el mismo dorado llega a ${ratio(tokens.oro, tokens.navy).toFixed(2)}:1 y sí sirve para texto.`,
);
console.log('');

if (failures > 0) {
  console.error(`${failures} combinación(es) por debajo del mínimo.`);
  process.exit(1);
}
console.log('  Todo en regla.\n');
