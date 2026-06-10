import { createHash } from 'node:crypto';

import { env } from '../config/env.js';
import {
  FUSION_HORDE_CFG_SCALE,
  FUSION_HORDE_GENERATION_SIZE,
  FUSION_HORDE_STEPS,
} from '../config/fusion-image.config.js';
import {
  AnimalFusionRequest,
  AnimalFusionResponse,
  AnimalFusionStyle,
} from '../models/animal-fusion.model.js';
import { animalNameForPrompt } from '../utils/animal-name-i18n.js';
import { generateBrainrotName } from '../utils/fusion-brainrot-name.js';
import { buildFusionPlaceholderSvg } from '../utils/fusion-placeholder-image.js';
import {
  getFusionImage,
  getFusionImageProvider,
  storeFusionImage,
} from './animal-fusion-cache.service.js';

const ANIMAL_NAME_RE = /^[\p{L}\p{N}\s\-]{2,40}$/u;
const HORDE_POLL_INTERVAL_MS = 3_000;
const HORDE_MAX_POLLS = 60;
const HORDE_SUBMIT_TIMEOUT_MS = 60_000;
const HORDE_STATUS_TIMEOUT_MS = 45_000;
const HORDE_IMAGE_FETCH_TIMEOUT_MS = 45_000;

export function fuseAnimals(input: AnimalFusionRequest): Promise<AnimalFusionResponse> {
  const animal1 = normalizeAnimalName(input.animal1);
  const animal2 = normalizeAnimalName(input.animal2);
  const style = input.style ?? 'cute';

  if (!ANIMAL_NAME_RE.test(animal1) || !ANIMAL_NAME_RE.test(animal2)) {
    throw new Error('Укажите два названия животных (2–40 букв, без спецсимволов).');
  }

  if (animal1.toLowerCase() === animal2.toLowerCase()) {
    throw new Error('Выберите два разных животных.');
  }

  const promptAnimal1 = animalNameForPrompt(animal1);
  const promptAnimal2 = animalNameForPrompt(animal2);
  const prompt = buildFusionPrompt(promptAnimal1, promptAnimal2, style);
  const title = generateBrainrotName(animal1, animal2);

  if (isOpenAiConfigured()) {
    return generateWithOpenAi({ animal1, animal2, title, prompt, style });
  }

  return generateWithStableHorde({ animal1, animal2, title, prompt, style });
}

function normalizeAnimalName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function buildFusionPrompt(animal1: string, animal2: string, style: AnimalFusionStyle): string {
  const styleHint =
    style === 'realistic'
      ? 'photorealistic wildlife portrait'
      : style === 'cartoon'
        ? 'colorful cartoon illustration, bold outlines'
        : 'cute friendly digital illustration, soft colors';

  return [
    `Hybrid chimera creature, equal mix of ${animal1} and ${animal2},`,
    `clearly visible traits from BOTH a ${animal1} AND a ${animal2} merged into ONE animal,`,
    `for example ${animal1} head or ears with ${animal2} body, legs, tail or wings,`,
    'single subject, full body, centered, plain light background,',
    `${styleHint},`,
    'high detail, no text, no watermark, no collage, no two separate animals side by side',
  ].join(' ');
}

const FUSION_NEGATIVE_PROMPT =
  'two animals, multiple animals, collage, split screen, diptych, human, person, text, watermark, logo, blurry, deformed, extra limbs';

function buildCacheId(animal1: string, animal2: string, prompt: string): string {
  return createHash('sha256').update(`${animal1}|${animal2}|${prompt}`).digest('hex').slice(0, 16);
}

function hordeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Client-Agent': env.stableHordeClientAgent,
    apikey: env.stableHordeApiKey,
  };
}

async function generateWithStableHorde(params: {
  animal1: string;
  animal2: string;
  title: string;
  prompt: string;
  style: AnimalFusionStyle;
}): Promise<AnimalFusionResponse> {
  const cacheId = buildCacheId(params.animal1, params.animal2, params.prompt);

  if (!getFusionImage(cacheId)) {
    try {
      const image = await requestStableHordeImage(params.prompt);
      storeFusionImage(cacheId, image.buffer, image.contentType, 'stablehorde');
    } catch {
      const placeholder = buildFusionPlaceholderSvg(params.animal1, params.animal2, params.style);
      storeFusionImage(cacheId, placeholder, 'image/svg+xml', 'placeholder');
    }
  }

  const provider = getFusionImageProvider(cacheId) ?? 'stablehorde';
  return buildFusionResponse(params, cacheId, provider);
}

async function requestStableHordeImage(
  prompt: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const submit = await fetch('https://stablehorde.net/api/v2/generate/async', {
    method: 'POST',
    headers: hordeHeaders(),
    body: JSON.stringify({
      prompt,
      negative_prompt: FUSION_NEGATIVE_PROMPT,
      params: {
        width: FUSION_HORDE_GENERATION_SIZE,
        height: FUSION_HORDE_GENERATION_SIZE,
        steps: FUSION_HORDE_STEPS,
        cfg_scale: FUSION_HORDE_CFG_SCALE,
      },
      nsfw: false,
      censor_nsfw: true,
    }),
    signal: AbortSignal.timeout(HORDE_SUBMIT_TIMEOUT_MS),
  });

  if (!submit.ok) {
    const body = await submit.text();
    throw new Error(`Stable Horde submit failed (${submit.status}): ${body.slice(0, 160)}`);
  }

  const job = (await submit.json()) as { id?: string };
  if (!job.id) {
    throw new Error('Stable Horde не вернул id задачи.');
  }

  return pollStableHordeJob(job.id);
}

async function pollStableHordeJob(
  jobId: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  for (let attempt = 0; attempt < HORDE_MAX_POLLS; attempt += 1) {
    await sleep(HORDE_POLL_INTERVAL_MS);

    try {
      const statusResponse = await fetch(
        `https://stablehorde.net/api/v2/generate/status/${jobId}`,
        {
          headers: hordeHeaders(),
          signal: AbortSignal.timeout(HORDE_STATUS_TIMEOUT_MS),
        },
      );

      if (!statusResponse.ok) {
        continue;
      }

      const status = (await statusResponse.json()) as {
        done?: boolean;
        faulted?: boolean;
        generations?: Array<{ img?: string }>;
      };

      if (status.faulted) {
        throw new Error('Генерация на Stable Horde завершилась с ошибкой. Попробуйте ещё раз.');
      }

      if (status.done) {
        const img = status.generations?.[0]?.img;
        if (!img) {
          throw new Error('Stable Horde не вернул изображение.');
        }

        return downloadHordeImage(img);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Stable Horde')) {
        throw error;
      }
      // сетевой сбой — пробуем снова
    }
  }

  throw new Error(
    'Генерация заняла слишком много времени (очередь Stable Horde). Попробуйте через минуту.',
  );
}

async function downloadHordeImage(
  img: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (/^https?:\/\//i.test(img)) {
    const imageResponse = await fetch(img, {
      signal: AbortSignal.timeout(HORDE_IMAGE_FETCH_TIMEOUT_MS),
    });

    if (!imageResponse.ok) {
      throw new Error(`Stable Horde image download failed (${imageResponse.status}).`);
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    if (buffer.length < 1_000) {
      throw new Error('Получен пустой файл изображения.');
    }

    return {
      buffer,
      contentType: imageResponse.headers.get('content-type') ?? 'image/webp',
    };
  }

  const buffer = Buffer.from(img, 'base64');
  if (buffer.length < 1_000) {
    throw new Error('Получен пустой файл изображения.');
  }

  return { buffer, contentType: 'image/png' };
}

function isOpenAiConfigured(): boolean {
  return Boolean(env.openaiApiKey);
}

function buildFusionResponse(
  params: { animal1: string; animal2: string; title: string; prompt: string },
  cacheId: string,
  provider: AnimalFusionResponse['provider'],
): AnimalFusionResponse {
  return {
    animal1: params.animal1,
    animal2: params.animal2,
    title: params.title,
    prompt: params.prompt,
    imageUrl: `/api/animal-fusion/image/${cacheId}`,
    provider,
  };
}

async function generateWithOpenAi(params: {
  animal1: string;
  animal2: string;
  title: string;
  prompt: string;
  style: AnimalFusionStyle;
}): Promise<AnimalFusionResponse> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-2',
      prompt: params.prompt,
      n: 1,
      size: '256x256',
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI image failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as { data?: Array<{ url?: string }> };
  const remoteUrl = data.data?.[0]?.url;

  if (!remoteUrl) {
    throw new Error('OpenAI не вернул URL изображения.');
  }

  const cacheId = buildCacheId(params.animal1, params.animal2, params.prompt);
  const imageResponse = await fetch(remoteUrl, { signal: AbortSignal.timeout(30_000) });

  if (imageResponse.ok) {
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    storeFusionImage(
      cacheId,
      buffer,
      imageResponse.headers.get('content-type') ?? 'image/png',
      'openai',
    );

    return {
      animal1: params.animal1,
      animal2: params.animal2,
      title: params.title,
      prompt: params.prompt,
      imageUrl: `/api/animal-fusion/image/${cacheId}`,
      provider: 'openai',
    };
  }

  return {
    animal1: params.animal1,
    animal2: params.animal2,
    title: params.title,
    prompt: params.prompt,
    imageUrl: remoteUrl,
    provider: 'openai',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
