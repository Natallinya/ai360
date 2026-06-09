export interface AnimalEntry {
  en: string;
  stems: string[];
  aliases?: string[];
}

/** Канонические русские названия → EN для промпта и слоги для brainrot-имени. */
export const ANIMAL_REGISTRY: Record<string, AnimalEntry> = {
  кот: { en: 'cat', stems: ['мяу', 'пуш', 'мур', 'котт', 'няш'], aliases: ['котик', 'котёнок', 'котенок', 'кошечка'] },
  кошка: { en: 'cat', stems: ['мяу', 'пуш', 'мур', 'котт', 'няш'], aliases: ['кошечка'] },
  собака: { en: 'dog', stems: ['гав', 'лай', 'бобик', 'пёс', 'ван'], aliases: ['собачка', 'пёсик', 'песик', 'дог'] },
  пёс: { en: 'dog', stems: ['гав', 'лай', 'бобик', 'пёс', 'ван'], aliases: ['пес'] },
  сова: { en: 'owl', stems: ['сов', 'уху', 'фил', 'ноч', 'древ'], aliases: ['совушка', 'совёнок', 'совенок'] },
  лиса: { en: 'fox', stems: ['лис', 'рыж', 'хитр', 'плут'], aliases: ['лисица', 'лисичка'] },
  заяц: { en: 'rabbit', stems: ['зай', 'ух', 'прыг', 'уш'], aliases: ['зайчик', 'зайчонок'] },
  кролик: { en: 'rabbit', stems: ['зай', 'ух', 'прыг', 'уш'], aliases: ['кроль'] },
  медведь: { en: 'bear', stems: ['мед', 'миш', 'бур', 'топ'], aliases: ['медвежонок', 'мишка'] },
  медоед: {
    en: 'honey badger',
    stems: ['мед', 'ед', 'злой', 'брон'],
    aliases: ['медоедик'],
  },
  волк: { en: 'wolf', stems: ['вол', 'вой', 'сер', 'стай'], aliases: ['волчонок'] },
  лошадь: { en: 'horse', stems: ['лош', 'ржан', 'кон', 'скак'], aliases: ['лошадка', 'конь', 'жеребец', 'пони'] },
  корова: { en: 'cow', stems: ['му', 'кор', 'рог', 'пас'], aliases: ['коровка'] },
  свинья: { en: 'pig', stems: ['хрю', 'свин', 'пята', 'коп'], aliases: ['свинка', 'поросёнок', 'поросенок'] },
  овца: { en: 'sheep', stems: ['бе', 'бара', 'шер', 'куд'], aliases: ['овечка', 'барашек'] },
  коза: { en: 'goat', stems: ['ме', 'коз', 'рог', 'гор'], aliases: ['козочка', 'козёл', 'козел'] },
  панда: { en: 'panda', stems: ['пан', 'бамб', 'чёр', 'мил'], aliases: ['пандочка'] },
  тигр: { en: 'tiger', stems: ['тиг', 'полос', 'рыч', 'джун'], aliases: ['тигрёнок', 'тигренок'] },
  лев: { en: 'lion', stems: ['лев', 'грив', 'рыч', 'цар'], aliases: ['львица', 'львёнок', 'львенок'] },
  слон: { en: 'elephant', stems: ['слон', 'хоб', 'труб', 'сер'], aliases: ['слоник', 'слонёнок', 'слоненок'] },
  жираф: { en: 'giraffe', stems: ['жир', 'шей', 'пят', 'сав'], aliases: ['жирафик'] },
  зебра: { en: 'zebra', stems: ['зеб', 'полос', 'афр', 'степ'] },
  обезьяна: { en: 'monkey', stems: ['чим', 'банан', 'прыг', 'хвост'], aliases: ['мартышка'] },
  горилла: { en: 'gorilla', stems: ['гор', 'груд', 'джун', 'сил'] },
  шимпанзе: { en: 'chimpanzee', stems: ['шим', 'чим', 'бан', 'ум'] },
  пингвин: { en: 'penguin', stems: ['пинг', 'льд', 'вим', 'антар'], aliases: ['пингвинчик'] },
  дельфин: { en: 'dolphin', stems: ['дель', 'фин', 'волн', 'клик'] },
  акула: { en: 'shark', stems: ['аку', 'чел', 'зуб', 'оке'] },
  кит: { en: 'whale', stems: ['кит', 'фон', 'брыз', 'оке'] },
  орёл: { en: 'eagle', stems: ['орл', 'клюв', 'неб', 'крыл'], aliases: ['орел'] },
  ворона: { en: 'crow', stems: ['вор', 'кар', 'чёр', 'гра'], aliases: ['ворон'] },
  попугай: { en: 'parrot', stems: ['поп', 'крич', 'рад', 'пер'] },
  утка: { en: 'duck', stems: ['ут', 'кря', 'плав', 'утк'], aliases: ['уточка', 'утёнок', 'утенок'] },
  лягушка: { en: 'frog', stems: ['ква', 'ляг', 'бол', 'прыг'], aliases: ['лягушонок', 'жаба'] },
  жаба: { en: 'toad', stems: ['ква', 'жаб', 'бол', 'прыг'] },
  черепаха: { en: 'turtle', stems: ['чер', 'панц', 'мед', 'шел'], aliases: ['черепашка'] },
  крокодил: { en: 'crocodile', stems: ['крок', 'чел', 'гена', 'бол'], aliases: ['крокодильчик'] },
  дракон: { en: 'dragon', stems: ['драк', 'огн', 'чеш', 'рёв'] },
  единорог: { en: 'unicorn', stems: ['един', 'рог', 'рад', 'маг'] },
  ёж: { en: 'hedgehog', stems: ['ёж', 'игл', 'кол', 'ком'], aliases: ['еж', 'ежик'] },
  белка: { en: 'squirrel', stems: ['бел', 'орех', 'хвост', 'древ'], aliases: ['белочка'] },
  мышь: { en: 'mouse', stems: ['пи', 'мыш', 'сыр', 'нор'], aliases: ['мышка'] },
  крыса: { en: 'rat', stems: ['пи', 'крыс', 'сыр', 'нор'] },
  хомяк: { en: 'hamster', stems: ['хом', 'щёк', 'бег', 'кол'], aliases: ['хомячок'] },
  енот: { en: 'raccoon', stems: ['ено', 'полос', 'банд', 'ноч'], aliases: ['енотик'] },
  ленивец: { en: 'sloth', stems: ['лен', 'ви', 'мед', 'вет'] },
  капибара: { en: 'capybara', stems: ['капи', 'бар', 'чил', 'бол'] },
  фламинго: { en: 'flamingo', stems: ['флам', 'роз', 'ног', 'роз'] },
  павлин: { en: 'peacock', stems: ['пав', 'хвост', 'пёры', 'гор'] },
  осьминог: { en: 'octopus', stems: ['осьм', 'щуп', 'глуб', 'черн'], aliases: ['осьминожка'] },
  краб: { en: 'crab', stems: ['краб', 'клеш', 'пляж', 'шел'] },
  бабочка: { en: 'butterfly', stems: ['баб', 'крыл', 'нек', 'цвет'] },
  пчела: { en: 'bee', stems: ['пчел', 'жуж', 'мёд', 'улей'], aliases: ['пчёлка', 'пчелка'] },
  бегемот: { en: 'hippopotamus', stems: ['бег', 'гип', 'реч', 'тол'] },
  носорог: {
    en: 'rhinoceros',
    stems: ['нос', 'рог', 'брон', 'сав'],
    aliases: ['носорожик', 'носорожка', 'носороги'],
  },
  олень: { en: 'deer', stems: ['олен', 'рог', 'лес', 'скач'], aliases: ['оленёнок', 'олененок'] },
  лось: { en: 'moose', stems: ['лос', 'рог', 'тай', 'лес'] },
  баран: { en: 'ram', stems: ['бар', 'рог', 'шер', 'стад'] },
  змея: { en: 'snake', stems: ['зме', 'шип', 'полз', 'чеш'], aliases: ['удав', 'питон', 'кобра'] },
  ящерица: { en: 'lizard', stems: ['ящер', 'хвост', 'чеш', 'сол'] },
  кенгуру: { en: 'kangaroo', stems: ['кенг', 'прыг', 'сум', 'авс'] },
  курица: { en: 'chicken', stems: ['кур', 'кло', 'яйц', 'нас'], aliases: ['кура', 'петух', 'цыплёнок', 'цыпленок'] },
  голубь: { en: 'pigeon', stems: ['гол', 'крыл', 'гор', 'пер'] },
  лебедь: { en: 'swan', stems: ['леб', 'бел', 'озер', 'гор'] },
  страус: { en: 'ostrich', stems: ['стра', 'бег', 'пер', 'афр'] },
  верблюд: { en: 'camel', stems: ['верб', 'горб', 'пуст', 'карав'] },
  осёл: { en: 'donkey', stems: ['осл', 'ух', 'иа', 'пол'], aliases: ['осел'] },
  выдра: { en: 'otter', stems: ['выд', 'реч', 'игр', 'вод'] },
  тюлень: { en: 'seal', stems: ['тюл', 'льд', 'мор', 'плав'] },
  морж: { en: 'walrus', stems: ['мор', 'клык', 'льд', 'север'] },
  рысь: { en: 'lynx', stems: ['рыс', 'уш', 'лес', 'рыж'] },
  гепард: { en: 'cheetah', stems: ['геп', 'спр', 'пят', 'сав'] },
  пантера: { en: 'panther', stems: ['пант', 'чёр', 'ноч', 'джун'] },
  ягуар: { en: 'jaguar', stems: ['ягу', 'пят', 'джун', 'рыч'] },
  леопард: { en: 'leopard', stems: ['лео', 'пят', 'рыч', 'скал'] },
  барсук: { en: 'badger', stems: ['бар', 'полос', 'нор', 'ноч'] },
  бобёр: { en: 'beaver', stems: ['боб', 'плот', 'реч', 'зуб'], aliases: ['бобер'] },
  койот: { en: 'coyote', stems: ['кой', 'вой', 'степ', 'хитр'] },
  лама: { en: 'llama', stems: ['лам', 'плю', 'гор', 'шер'] },
  альпака: { en: 'alpaca', stems: ['альп', 'пуш', 'гор', 'шер'] },
  скунс: { en: 'skunk', stems: ['скун', 'полос', 'зап', 'ноч'] },
  окapi: { en: 'okapi', stems: ['ока', 'полос', 'шей', 'лес'], aliases: ['окапи'] },
  коала: { en: 'koala', stems: ['коал', 'эвк', 'лес', 'мил'] },
  утконос: { en: 'platypus', stems: ['утк', 'клюв', 'вод', 'стран'] },
  муравей: { en: 'ant', stems: ['мур', 'улей', 'труд', 'микр'] },
  паук: { en: 'spider', stems: ['паук', 'паут', 'восьм', 'нас'] },
  скорпион: { en: 'scorpion', stems: ['скор', 'жал', 'пуст', 'хвост'] },
  кальмар: { en: 'squid', stems: ['каль', 'щуп', 'мор', 'черн'] },
  медуза: { en: 'jellyfish', stems: ['мед', 'щуп', 'мор', 'проз'] },
  сурикат: { en: 'meerkat', stems: ['сури', 'стой', 'пуст', 'сем'] },
  норка: { en: 'ferret', stems: ['нор', 'хор', 'игр', 'полз'] },
  хорёк: { en: 'ferret', stems: ['хор', 'нор', 'игр', 'полз'], aliases: ['хорек'] },
  кабан: { en: 'boar', stems: ['каб', 'клык', 'лес', 'дик'] },
  лисица: { en: 'fox', stems: ['лис', 'рыж', 'хитр', 'плут'] },
};

const ALIAS_TO_CANONICAL = buildAliasMap();

function buildAliasMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const [canonical, entry] of Object.entries(ANIMAL_REGISTRY)) {
    map.set(canonical, canonical);
    for (const alias of entry.aliases ?? []) {
      map.set(alias, canonical);
    }
  }

  return map;
}

export function resolveAnimalKey(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) {
    return normalized;
  }

  const direct = ALIAS_TO_CANONICAL.get(normalized);
  if (direct) {
    return direct;
  }

  const stripped = stripDiminutiveSuffix(normalized);
  if (stripped !== normalized) {
    const fromStripped = ALIAS_TO_CANONICAL.get(stripped);
    if (fromStripped) {
      return fromStripped;
    }
  }

  return normalized;
}

function stripDiminutiveSuffix(name: string): string {
  if (name.endsWith('ёнок') || name.endsWith('енок') || name.endsWith('онок')) {
    return name.slice(0, -4);
  }

  if (name.endsWith('ечка') || name.endsWith('очка')) {
    return name.slice(0, -4);
  }

  if (name.endsWith('чик') || name.endsWith('шка')) {
    return name.slice(0, -3);
  }

  if (name.endsWith('ик') && name.length > 4) {
    return name.slice(0, -2);
  }

  return name;
}

export function animalStemsForName(name: string): string[] | undefined {
  const canonical = resolveAnimalKey(name);
  return ANIMAL_REGISTRY[canonical]?.stems;
}
