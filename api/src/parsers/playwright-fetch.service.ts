import { chromium, type Browser, type BrowserContext } from 'playwright';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const PAGE_TIMEOUT_MS = 45_000;

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }
  return browserPromise;
}

async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: {
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  return context;
}

export interface PlaywrightPageResult {
  html: string;
  finalUrl: string;
}

export async function fetchPageWithPlaywright(
  url: string,
  options?: { warmupUrl?: string; settleMs?: number },
): Promise<PlaywrightPageResult> {
  const browser = await getBrowser();
  const context = await createStealthContext(browser);
  const page = await context.newPage();

  try {
    if (options?.warmupUrl) {
      await page.goto(options.warmupUrl, {
        waitUntil: 'domcontentloaded',
        timeout: PAGE_TIMEOUT_MS,
      });
      await page.waitForTimeout(1_500);
    }

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT_MS,
    });

    await page.waitForTimeout(options?.settleMs ?? 3_000);

    try {
      await page.waitForSelector('h1, meta[property="og:title"]', {
        timeout: 8_000,
      });
    } catch {
      // continue with best-effort parse
    }

    return {
      html: await page.content(),
      finalUrl: page.url(),
    };
  } catch (error) {
    throw mapPlaywrightError(error);
  } finally {
    await context.close();
  }
}

/** @deprecated use fetchPageWithPlaywright */
export async function fetchHtmlWithPlaywright(url: string): Promise<string> {
  const result = await fetchPageWithPlaywright(url);
  return result.html;
}

function mapPlaywrightError(error: unknown): Error {
  const message = error instanceof Error ? error.message : 'unknown';
  if (message.includes('Executable doesn') || message.includes('browserType.launch')) {
    return new Error(
      'Playwright Chromium не установлен. Выполните: npm run playwright:install',
    );
  }
  return new Error(`Playwright: ${message}`);
}

export async function closePlaywrightBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}
