import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RULES_DIR_NAME = path.join('.cursor', 'rules');
export const CONSOLIDATED_RULES_FILENAME =
  process.env.AI360_RULES_FILE ?? 'custom-rules.mdc';

const SECTION_SEPARATOR = '\n\n---\n\n';

const INITIAL_TEMPLATE = `---
description: Пользовательские правила ai360 (дополняются через MCP ai360-rules)
alwaysApply: true
---

# Пользовательские правила

Сюда MCP записывает правила из чата («Установи правило …»).
Стандарты Angular и git — в отдельных файлах: \`angular-standards.mdc\`, \`angular-git-workflow.mdc\`.

`;

export function projectRoot(): string {
  return process.env.AI360_PROJECT_ROOT ?? process.cwd();
}

export function rulesDir(): string {
  return path.join(projectRoot(), RULES_DIR_NAME);
}

export function consolidatedFilePath(): string {
  return path.join(rulesDir(), CONSOLIDATED_RULES_FILENAME);
}

export async function ensureRulesDir(): Promise<string> {
  const dir = rulesDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export interface RuleSection {
  title: string;
  slug: string;
  content: string;
}

export interface RuleSummary {
  slug: string;
  title: string;
  source: 'consolidated';
}

export async function ensureConsolidatedFile(): Promise<string> {
  await ensureRulesDir();
  const filePath = consolidatedFilePath();

  try {
    await readFile(filePath, 'utf8');
  } catch {
    await writeFile(filePath, INITIAL_TEMPLATE, 'utf8');
  }

  return filePath;
}

export async function readConsolidatedFile(): Promise<string> {
  const filePath = await ensureConsolidatedFile();
  return readFile(filePath, 'utf8');
}

export function parseSections(fileContent: string): {
  frontmatter: string;
  preamble: string;
  sections: RuleSection[];
} {
  const { frontmatter, body } = stripFrontmatter(fileContent);
  const sections: RuleSection[] = [];
  const parts = body.split(/^## /m);

  const preamble = (parts.shift() ?? '').trim();
  for (const part of parts) {
    const newline = part.indexOf('\n');
    if (newline === -1) {
      continue;
    }

    const title = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    if (!title) {
      continue;
    }

    sections.push({
      title,
      slug: slugifyTitle(title),
      content,
    });
  }

  return { frontmatter, preamble, sections };
}

export async function listRules(): Promise<{
  filePath: string;
  filename: string;
  sections: RuleSummary[];
}> {
  const filePath = await ensureConsolidatedFile();
  const content = await readFile(filePath, 'utf8');
  const { sections } = parseSections(content);

  return {
    filePath,
    filename: CONSOLIDATED_RULES_FILENAME,
    sections: sections.map((section) => ({
      slug: section.slug,
      title: section.title,
      source: 'consolidated' as const,
    })),
  };
}

export async function readRuleSection(slug?: string): Promise<{
  filePath: string;
  slug: string | null;
  content: string;
}> {
  const filePath = await ensureConsolidatedFile();
  const fileContent = await readFile(filePath, 'utf8');

  if (!slug || slug === 'all' || slug === CONSOLIDATED_RULES_FILENAME.replace(/\.mdc$/, '')) {
    return { filePath, slug: null, content: fileContent };
  }

  const { sections } = parseSections(fileContent);
  const section = sections.find((item) => item.slug === slug || item.title === slug);

  if (!section) {
    throw new Error(`Rule section not found: ${slug}`);
  }

  return {
    filePath,
    slug: section.slug,
    content: `## ${section.title}\n\n${section.content}`,
  };
}

export async function installRuleSection(
  title: string,
  content: string,
  replaceExisting = true,
): Promise<{ filePath: string; slug: string; action: 'created' | 'updated' }> {
  const filePath = await ensureConsolidatedFile();
  const fileContent = await readFile(filePath, 'utf8');
  const { frontmatter, preamble, sections } = parseSections(fileContent);
  const slug = slugifyTitle(title);
  const trimmedContent = content.trim();
  const existingIndex = sections.findIndex(
    (section) => section.slug === slug || section.title === title,
  );

  let action: 'created' | 'updated';

  if (existingIndex >= 0) {
    if (!replaceExisting) {
      throw new Error(`Rule «${title}» already exists (slug: ${slug}). Use replaceExisting=true.`);
    }

    sections[existingIndex] = { title, slug, content: trimmedContent };
    action = 'updated';
  } else {
    sections.push({ title, slug, content: trimmedContent });
    action = 'created';
  }

  const rebuilt = rebuildConsolidatedFile(frontmatter, preamble, sections);
  await writeFile(filePath, rebuilt, 'utf8');

  return { filePath, slug, action };
}

function rebuildConsolidatedFile(
  frontmatter: string,
  preamble: string,
  sections: RuleSection[],
): string {
  const fm = frontmatter.trim()
    ? frontmatter
    : `---
description: Пользовательские правила ai360 (дополняются через MCP ai360-rules)
alwaysApply: true
---`;

  const bodyParts = [preamble.trim()];

  for (const section of sections) {
    bodyParts.push(`## ${section.title}\n\n${section.content.trim()}`);
  }

  return `${fm.trimEnd()}\n\n${bodyParts.join(SECTION_SEPARATOR)}\n`;
}

function stripFrontmatter(content: string): { frontmatter: string; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { frontmatter: '', body: content };
  }

  return {
    frontmatter: `---\n${match[1]}\n---`,
    body: content.slice(match[0].length),
  };
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
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

export function slugifyTitle(title: string): string {
  const lower = title.trim().toLowerCase();
  let transliterated = '';

  for (const char of lower) {
    transliterated += CYRILLIC_TO_LATIN[char] ?? char;
  }

  const slug = transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56);

  return slug || 'custom-rule';
}
