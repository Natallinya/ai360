import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'docs', 'figma-export');
const url = process.env.DESIGN_URL ?? 'http://localhost:8765/design-v2-warm.html';

const names = [
  '01-home',
  '02-search',
  '03-wishlist',
  '04-add-url',
  '05-fusion',
  '06-states',
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const screens = page.locator('section.screen');
const count = await screens.count();

for (let i = 0; i < count; i += 1) {
  const name = names[i] ?? `screen-${i + 1}`;
  const el = screens.nth(i);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await el.screenshot({
    path: path.join(outDir, `${name}.png`),
  });
  console.log(`saved ${name}.png`);
}

await browser.close();
console.log(`Done: ${count} screens → ${outDir}`);
