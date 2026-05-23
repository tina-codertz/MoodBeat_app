/**
 * Mint a test JWT for local development.
 * Usage: npm run generate:jwt
 * Optional: USER_ID=... EMAIL=... npm run generate:jwt
 */
import { sign } from 'hono/jwt';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadSecret(): string {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv) return fromEnv;

  const devVarsPath = resolve(__dirname, '../.dev.vars');
  const contents = readFileSync(devVarsPath, 'utf8');
  const match = contents.match(/^JWT_SECRET=(.+)$/m);
  if (!match) {
    throw new Error('JWT_SECRET not found in .dev.vars');
  }
  return match[1].trim();
}

const secret = loadSecret();
const userId = process.env.USER_ID ?? crypto.randomUUID();
const email = process.env.EMAIL ?? 'dev@moodbeat.app';
const expiresInDays = Number(process.env.EXPIRES_DAYS ?? 7);

const token = await sign(
  {
    sub: userId,
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * expiresInDays,
  },
  secret,
  'HS256',
);

console.log('JWT token (valid for %d days):', expiresInDays);
console.log(token);
console.log('\nPayload:');
console.log(JSON.stringify({ sub: userId, email, exp_days: expiresInDays }, null, 2));
console.log('\nUse in requests:');
console.log(`Authorization: Bearer ${token}`);
