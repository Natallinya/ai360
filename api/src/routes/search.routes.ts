import { Router } from 'express';

import { searchProducts } from '../services/search.service.js';

export const searchRouter = Router();

searchRouter.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  const wbPage = parsePositiveInt(req.query.wbPage);

  try {
    const result = await searchProducts(query, { wbPage });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    res.status(500).json({ error: message });
  }
});

function parsePositiveInt(value: unknown): number | undefined {
  const raw = typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(raw) || raw < 1) {
    return undefined;
  }
  return Math.floor(raw);
}

searchRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    sources: ['mock', 'wildberries', 'dummyjson'],
  });
});
