/**
 * Generates an Apple client_secret JWT for Supabase Apple Sign-In.
 *
 * Usage:
 *   node scripts/generate-apple-secret.mjs \
 *     --team-id YOUR_TEAM_ID \
 *     --key-id YOUR_KEY_ID \
 *     --client-id com.jpatel3.samvad.web \
 *     --key-file /path/to/AuthKey_XXXXXX.p8
 *
 * The output JWT is valid for 6 months. Paste it into Supabase > Auth > Apple > Secret Key.
 */

import { readFileSync } from 'fs';
import { createPrivateKey, createSign } from 'crypto';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) {
    console.error(`Missing --${name}`);
    process.exit(1);
  }
  return args[idx + 1];
}

const teamId = getArg('team-id');
const keyId = getArg('key-id');
const clientId = getArg('client-id');
const keyFile = getArg('key-file');

const privateKeyPem = readFileSync(keyFile, 'utf8');
const privateKey = createPrivateKey({ key: privateKeyPem, format: 'pem' });

const now = Math.floor(Date.now() / 1000);
const exp = now + 86400 * 180; // 6 months

const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
const payload = {
  iss: teamId,
  iat: now,
  exp,
  aud: 'https://appleid.apple.com',
  sub: clientId,
};

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const unsigned = `${base64url(header)}.${base64url(payload)}`;

const sign = createSign('SHA256');
sign.update(unsigned);
const signature = sign
  .sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const jwt = `${unsigned}.${signature}`;

console.log('\n=== Apple Client Secret JWT ===\n');
console.log(jwt);
console.log('\nPaste this into Supabase > Authentication > Providers > Apple > Secret Key');
console.log(`\nExpires: ${new Date(exp * 1000).toISOString()}\n`);
