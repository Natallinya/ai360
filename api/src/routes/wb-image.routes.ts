import { Router } from 'express';

import { resolveWbProductImageUrl } from '../services/wb-image.service.js';

export const wbImageRouter = Router();

wbImageRouter.get('/wb-image/:nmId', async (req, res) => {
  const nmId = Number(req.params.nmId);

  if (!Number.isFinite(nmId) || nmId <= 0) {
    res.status(400).json({ error: 'Invalid nmId' });
    return;
  }

  const url = await resolveWbProductImageUrl(nmId);
  if (!url) {
    res.status(404).json({ error: 'WB image not found' });
    return;
  }

  res.redirect(302, url);
});
