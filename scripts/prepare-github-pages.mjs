import { copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'web', 'dist', 'web', 'browser');
const indexHtml = join(distDir, 'index.html');

copyFileSync(indexHtml, join(distDir, '404.html'));
writeFileSync(join(distDir, '.nojekyll'), '', 'utf8');

console.log(`GitHub Pages artifacts ready in ${distDir}`);
