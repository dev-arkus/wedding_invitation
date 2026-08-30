#!/usr/bin/env node
/**
 * Convierte el JSON del service account en las líneas del .env.local.
 *
 *   node scripts/env-from-service-account.mjs ~/Downloads/proyecto-abc123.json
 *
 * Se hace con script y no a mano porque la clave privada son ~1700 caracteres
 * con saltos de línea: copiarla a ojo es la forma más común de romper esto.
 */

import { readFileSync } from 'node:fs';

const path = process.argv[2];

if (!path) {
  console.error('Uso: node scripts/env-from-service-account.mjs <ruta-al-json>');
  process.exit(1);
}

let key;
try {
  key = JSON.parse(readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`No se pudo leer ${path}: ${error.message}`);
  process.exit(1);
}

if (key.type !== 'service_account' || !key.client_email || !key.private_key) {
  console.error(
    'Ese archivo no parece la clave de un service account.\n' +
      'Debe tener "type": "service_account", "client_email" y "private_key".',
  );
  process.exit(1);
}

// Se escapan los saltos y se envuelve en comillas: así el valor cabe en una
// sola línea del .env, y queda idéntico al formato que pide Vercel.
const escaped = key.private_key.replace(/\n/g, '\\n');

console.log(`GOOGLE_CLIENT_EMAIL=${key.client_email}`);
console.log(`GOOGLE_PRIVATE_KEY="${escaped}"`);
console.log('');
console.error(`Cuenta: ${key.client_email}`);
console.error('Comparte el Google Sheet con ese correo, con permiso de Editor.');
