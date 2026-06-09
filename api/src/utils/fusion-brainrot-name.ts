/** Слоги и корни для «итальянского brainrot»-имени (бомбардиро крокадило и т.п.). */
const ANIMAL_STEMS: Record<string, string[]> = {
  кот: ['мяу', 'пуш', 'мур', 'котт', 'няш'],
  кошка: ['мяу', 'пуш', 'мур', 'котт', 'няш'],
  собака: ['гав', 'лай', 'бобик', 'пёс', 'ван'],
  пёс: ['гав', 'лай', 'бобик', 'пёс', 'ван'],
  пес: ['гав', 'лай', 'бобик', 'пёс', 'ван'],
  сова: ['сов', 'уху', 'фил', 'ноч', 'древ'],
  лиса: ['лис', 'рыж', 'хитр', 'плут'],
  заяц: ['зай', 'ух', 'прыг', 'уш'],
  кролик: ['зай', 'ух', 'прыг', 'уш'],
  медведь: ['мед', 'миш', 'бур', 'топ'],
  волк: ['вол', 'вой', 'сер', 'стай'],
  лошадь: ['лош', 'ржан', 'кон', 'скак'],
  корова: ['му', 'кор', 'рог', 'пас'],
  свинья: ['хрю', 'свин', 'пята', 'коп'],
  овца: ['бе', 'бара', 'шер', 'куд'],
  коза: ['ме', 'коз', 'рог', 'гор'],
  панда: ['пан', 'бамб', 'чёр', 'мил'],
  тигр: ['тиг', 'полос', 'рыч', 'джун'],
  лев: ['лев', 'грив', 'рыч', 'цар'],
  слон: ['слон', 'хоб', 'труб', 'сер'],
  жираф: ['жир', 'шей', 'пят', 'сав'],
  зебра: ['зеб', 'полос', 'афр', 'степ'],
  обезьяна: ['чим', 'банан', 'прыг', 'хвост'],
  пингвин: ['пинг', 'льд', 'вим', 'антар'],
  дельфин: ['дель', 'фин', 'волн', 'клик'],
  акула: ['аку', 'чел', 'зуб', 'оке'],
  кит: ['кит', 'фон', 'брыз', 'оке'],
  орёл: ['орл', 'клюв', 'неб', 'крыл'],
  орел: ['орл', 'клюв', 'неб', 'крыл'],
  ворона: ['вор', 'кар', 'чёр', 'гра'],
  попугай: ['поп', 'крич', 'рад', 'пер'],
  утка: ['ут', 'кря', 'плав', 'утк'],
  лягушка: ['ква', 'ляг', 'бол', 'прыг'],
  черепаха: ['чер', 'панц', 'мед', 'шел'],
  крокодил: ['крок', 'чел', 'гена', 'бол'],
  дракон: ['драк', 'огн', 'чеш', 'рёв'],
  единорог: ['един', 'рог', 'рад', 'маг'],
  ёж: ['ёж', 'игл', 'кол', 'ком'],
  еж: ['ёж', 'игл', 'кол', 'ком'],
  белка: ['бел', 'орех', 'хвост', 'древ'],
  мышь: ['пи', 'мыш', 'сыр', 'нор'],
  крыса: ['пи', 'крыс', 'сыр', 'нор'],
  хомяк: ['хом', 'щёк', 'бег', 'кол'],
  енот: ['ено', 'полос', 'банд', 'ноч'],
  ленивец: ['лен', 'ви', 'мед', 'вет'],
  капибара: ['капи', 'бар', 'чил', 'бол'],
  фламинго: ['флам', 'роз', 'ног', 'роз'],
  павлин: ['пав', 'хвост', 'пёры', 'гор'],
  осьминог: ['осьм', 'щуп', 'глуб', 'черн'],
  краб: ['краб', 'клеш', 'пляж', 'шел'],
  бабочка: ['баб', 'крыл', 'нек', 'цвет'],
  пчела: ['пчел', 'жуж', 'мёд', 'улей'],
};

const FIRST_SUFFIXES = ['иро', 'илло', 'ини', 'елло', 'адро', 'унг', 'апим', 'алеро', 'атапим'];
const SECOND_SUFFIXES = ['ило', 'ини', 'адило', 'елла', 'сахур', 'алано', 'елло', 'унгунг', 'итини'];
const TUNG_STEMS = ['тунг', 'брр', 'трал', 'бамб', 'пата', 'дрил', 'бомб'];

type NamePattern = 'double' | 'tung' | 'compound';

export function generateBrainrotName(animal1: string, animal2: string): string {
  const a1 = normalizeAnimal(animal1);
  const a2 = normalizeAnimal(animal2);
  const seed = hashPair(a1, a2, Date.now());

  const stem1 = pickStem(a1, seed);
  const stem2 = pickStem(a2, seed + 17);
  const pattern = pickPattern(seed);

  switch (pattern) {
    case 'tung': {
      const tung = pick(TUNG_STEMS, seed + 3);
      const tail = pick(SECOND_SUFFIXES, seed + 5);
      return capitalize(`${tung} ${tung} ${tung} ${stem2}${tail}`);
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

function normalizeAnimal(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickStem(animal: string, seed: number): string {
  const stems = ANIMAL_STEMS[animal];
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
