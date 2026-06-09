import { Router } from 'express';

import { AnimalFusionStyle } from '../models/animal-fusion.model.js';
import { fuseAnimals } from '../services/animal-fusion.service.js';
import { getFusionImage } from '../services/animal-fusion-cache.service.js';

export const animalFusionRouter = Router();

animalFusionRouter.post('/animal-fusion', async (req, res) => {
  const animal1 = typeof req.body?.animal1 === 'string' ? req.body.animal1 : '';
  const animal2 = typeof req.body?.animal2 === 'string' ? req.body.animal2 : '';
  const style = parseStyle(req.body?.style);

  try {
    const result = await fuseAnimals({ animal1, animal2, style });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось создать гибрида';
    res.status(422).json({ error: message });
  }
});

animalFusionRouter.get('/animal-fusion/image/:cacheId', (req, res) => {
  const cacheId = req.params.cacheId;
  if (!/^[a-f0-9]{16}$/.test(cacheId)) {
    res.status(400).json({ error: 'Invalid image id' });
    return;
  }

  const cached = getFusionImage(cacheId);
  if (!cached) {
    res.status(404).json({ error: 'Image not found or expired. Generate again.' });
    return;
  }

  res.setHeader('Content-Type', cached.contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(cached.buffer);
});

function parseStyle(value: unknown): AnimalFusionStyle | undefined {
  if (value === 'cute' || value === 'realistic' || value === 'cartoon') {
    return value;
  }
  return undefined;
}
