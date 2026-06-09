import 'dotenv/config';

const LOCAL_CORS_ORIGINS = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:4201',
  'http://127.0.0.1:4201',
];

const DEFAULT_PROD_CORS_ORIGINS = ['https://natallinya.github.io'];

function parseCorsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.split(',').map((value) => value.trim()) ?? [];
  const merged = [...LOCAL_CORS_ORIGINS, ...DEFAULT_PROD_CORS_ORIGINS, ...fromEnv];
  return [...new Set(merged.filter(Boolean))];
}

export const env = {
  port: Number(process.env.PORT ?? 4077),
  corsOrigins: parseCorsOrigins(),
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
  stableHordeApiKey: process.env.STABLE_HORDE_API_KEY?.trim() || '0000000000',
  stableHordeClientAgent:
    process.env.STABLE_HORDE_CLIENT_AGENT?.trim() || 'ai360:1.0:dev@localhost',
};
