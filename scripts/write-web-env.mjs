import { writeFileSync } from 'node:fs';

const apiBaseUrl = (process.env.API_BASE_URL ?? 'https://ai360-bff.onrender.com').replace(
  /\/$/,
  '',
);

const content = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl.replace(/'/g, "\\'")}',
};
`;

writeFileSync('web/src/environments/environment.prod.ts', content, 'utf8');
console.log(`Wrote web/src/environments/environment.prod.ts (apiBaseUrl=${apiBaseUrl})`);
