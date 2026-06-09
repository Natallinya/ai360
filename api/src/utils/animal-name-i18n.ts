import { ANIMAL_REGISTRY, resolveAnimalKey } from './animal-registry.js';

const RU_TRANSLIT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

/** RU → EN для prompt генератора (Stable Horde лучше понимает английский). */
export function animalNameForPrompt(name: string): string {
  const canonical = resolveAnimalKey(name);
  const entry = ANIMAL_REGISTRY[canonical];
  if (entry) {
    return entry.en;
  }

  const normalized = name.trim().toLowerCase().replace(/\s+/g, ' ');
  if (/^[a-z][a-z\s\-]{1,38}$/i.test(normalized)) {
    return normalized;
  }

  const transliterated = transliterateRu(normalized);
  if (transliterated) {
    return `${transliterated} animal`;
  }

  return normalized;
}

function transliterateRu(value: string): string {
  let result = '';

  for (const char of value) {
    const lower = char.toLowerCase();
    const mapped = RU_TRANSLIT[lower];
    if (mapped === undefined) {
      if (/[a-z0-9\s\-]/i.test(char)) {
        result += char;
      }
      continue;
    }

    result += mapped;
  }

  return result.trim();
}
