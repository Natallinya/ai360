import { writeFileSync } from 'node:fs';

const DEFAULT_API_URL = 'https://ai360.onrender.com';
const fromEnv = process.env.API_BASE_URL?.trim();
const apiBaseUrl = (fromEnv || DEFAULT_API_URL).replace(/\/$/, '');

const content = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl.replace(/'/g, "\\'")}',
};
`;

writeFileSync('web/src/environments/environment.prod.ts', content, 'utf8');
console.log(`Wrote web/src/environments/environment.prod.ts (apiBaseUrl=${apiBaseUrl})`);
