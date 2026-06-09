import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { closePlaywrightBrowser } from './parsers/playwright-fetch.service.js';
import { animalFusionRouter } from './routes/animal-fusion.routes.js';
import { offersRouter } from './routes/offers.routes.js';
import { searchRouter } from './routes/search.routes.js';
import { wbImageRouter } from './routes/wb-image.routes.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);
app.use(express.json());

app.use('/api', searchRouter);
app.use('/api', wbImageRouter);
app.use('/api', animalFusionRouter);
app.use('/api', offersRouter);

app.listen(env.port, () => {
  console.log(`BFF listening on http://localhost:${env.port}`);
  console.log(`  GET /api/health`);
  console.log(`  GET /api/search?q=headphones`);
  console.log(`  POST /api/offers/from-url { "url": "..." }`);
  console.log(`  POST /api/animal-fusion { "animal1": "кот", "animal2": "сова" }`);
  console.log(`  sources: mock + wildberries + dummyjson`);
  console.log(`  Playwright: WB/Allegro/Yandex import (npm run playwright:install)`);
});

process.on('SIGINT', () => {
  void closePlaywrightBrowser().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void closePlaywrightBrowser().finally(() => process.exit(0));
});
