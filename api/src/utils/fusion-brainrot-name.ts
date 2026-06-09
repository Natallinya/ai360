import { animalStemsForName, resolveAnimalKey } from './animal-registry.js';

const FIRST_SUFFIXES = ['иро', 'илло', 'ини', 'елло', 'адро', 'унг', 'апим', 'алеро', 'атапим'];
const SECOND_SUFFIXES = ['ило', 'ини', 'адило', 'елла', 'сахур', 'алано', 'елло', 'унгунг', 'итини'];
const TUNG_STEMS = ['тунг', 'брр', 'трал', 'бамб', 'пата', 'дрил', 'бомб'];

type NamePattern = 'double' | 'tung' | 'compound';

export function generateBrainrotName(animal1: string, animal2: string): string {
  const a1 = resolveAnimalKey(animal1);
  const a2 = resolveAnimalKey(animal2);
  const seed = hashPair(a1, a2, Date.now());

  const stem1 = pickStem(a1, seed);
  const stem2 = pickStem(a2, seed + 17);
  const pattern = pickPattern(seed);

  switch (pattern) {
    case 'tung': {
      const tung = pick(TUNG_STEMS, seed + 3);
      const tail = pick(SECOND_SUFFIXES, seed + 5);
      return capitalize(`${tung} ${stem1}${pick(FIRST_SUFFIXES, seed + 7)} ${stem2}${tail}`);
    }
    case 'compound': {
      const suf = pick(SECOND_SUFFIXES, seed + 7);
      return capitalize(`${stem1}${pick(FIRST_SUFFIXES, seed + 9)}${stem2}${suf}`);
    }
    default: {
      const left = `${stem1}${pick(FIRST_SUFFIXES, seed + 11)}`;
      const right = `${stem2}${pick(SECOND_SUFFIXES, seed + 13)}`;
      return `${capitalize(left)} ${capitalize(right)}`;
    }
  }
}

function pickStem(animal: string, seed: number): string {
  const stems = animalStemsForName(animal);
  if (stems?.length) {
    return pick(stems, seed);
  }

  const cleaned = animal.replace(/[^а-яёa-z]/gi, '');
  if (cleaned.length >= 4) {
    return cleaned.slice(0, 4);
  }

  return cleaned || 'звер';
}

function pickPattern(seed: number): NamePattern {
  const patterns: NamePattern[] = ['double', 'double', 'double', 'compound', 'tung'];
  return pick(patterns, seed + 19);
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!;
}

function hashPair(a1: string, a2: string, salt: number): number {
  const raw = `${a1}|${a2}|${salt}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return hash;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}
