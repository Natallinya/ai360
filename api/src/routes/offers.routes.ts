import { Router } from 'express';

import { importOfferFromUrl } from '../services/url-metadata.service.js';

export const offersRouter = Router();

offersRouter.post('/offers/from-url', async (req, res) => {
  const url = typeof req.body?.url === 'string' ? req.body.url : '';

  if (!url.trim()) {
    res.status(400).json({ error: 'Поле url обязательно' });
    return;
  }

  try {
    const result = await importOfferFromUrl(url);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось разобрать ссылку';
    res.status(422).json({ error: message });
  }
});
