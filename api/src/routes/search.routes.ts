import { Router } from 'express';

import { searchProducts } from '../services/search.service.js';

export const searchRouter = Router();

searchRouter.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';

  try {
    const result = await searchProducts(query);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    res.status(500).json({ error: message });
  }
});

searchRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    sources: ['mock', 'wildberries', 'dummyjson'],
  });
});
