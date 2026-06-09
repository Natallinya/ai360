const BLOCKED_TITLE_PATTERNS = [
  /нет соединения/i,
  /доступ ограничен/i,
  /access denied/i,
  /captcha/i,
  /antibot/i,
  /подтвердите/i,
  /robot/i,
  /ошибка/i,
];

const BLOCKED_HTML_PATTERNS = [
  /captcha/i,
  /antibot/i,
  /challenge-platform/i,
];

export function isBlockedMarketplacePage(title: string, html: string): boolean {
  const normalizedTitle = title.trim();
  if (BLOCKED_TITLE_PATTERNS.some((p) => p.test(normalizedTitle))) {
    return true;
  }
  return BLOCKED_HTML_PATTERNS.some((p) => p.test(html));
}

export function blockedPageMessage(source: string): string {
  return (
    `${source} показал страницу блокировки или ошибки вместо карточки товара. ` +
    `Антибот маркетплейса распознал автоматический браузер. ` +
    `Попробуйте позже или добавьте товар вручную (название и цену).`
  );
}
