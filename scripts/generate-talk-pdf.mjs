import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlFile = join(root, 'docs', 'talk-ai360-presentation.html');
const pdfFile = join(root, 'docs', 'talk-ai360.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'networkidle' });
await page.waitForFunction(() => {
  const imgs = [...document.images];
  return imgs.length === 0 || imgs.every((img) => img.complete && img.naturalWidth > 0);
});
await page.pdf({
  path: pdfFile,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
});
await browser.close();

console.log(`PDF: ${pdfFile}`);
