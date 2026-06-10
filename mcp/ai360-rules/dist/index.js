#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { CONSOLIDATED_RULES_FILENAME, consolidatedFilePath, installRuleSection, listRules, projectRoot, readRuleSection, rulesDir, } from './rules-fs.js';
const TOOLS = [
    {
        name: 'rule_list',
        description: `List rule sections inside single file .cursor/rules/${CONSOLIDATED_RULES_FILENAME}.`,
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'rule_read',
        description: `Read .cursor/rules/${CONSOLIDATED_RULES_FILENAME} (full file) or one section by slug.`,
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'Section slug from rule_list, or omit for full file',
                },
            },
        },
    },
    {
        name: 'rule_install',
        description: 'Add or update a rule section in ONE file .cursor/rules/custom-rules.mdc. Use when user says «Установи правило …» — title + content. Replaces section with same title if it exists.',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'Short rule title, e.g. «Не пушить без спроса»',
                },
                content: {
                    type: 'string',
                    description: 'Markdown body: what the agent must follow',
                },
                replaceExisting: {
                    type: 'boolean',
                    description: 'Replace section with same title (default: true)',
                },
            },
            required: ['title', 'content'],
        },
    },
];
function textResult(payload) {
    return {
        content: [
            {
                type: 'text',
                text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
            },
        ],
    };
}
async function handleTool(name, args) {
    switch (name) {
        case 'rule_list': {
            const rules = await listRules();
            return textResult({
                projectRoot: projectRoot(),
                rulesDir: rulesDir(),
                consolidatedFile: consolidatedFilePath(),
                sectionCount: rules.sections.length,
                sections: rules.sections,
                note: 'Все пользовательские правила — в одном файле custom-rules.mdc',
            });
        }
        case 'rule_read': {
            const slug = typeof args.slug === 'string' ? args.slug.trim() : undefined;
            const result = await readRuleSection(slug);
            return textResult(result);
        }
        case 'rule_install': {
            const title = String(args.title ?? '').trim();
            const content = String(args.content ?? '').trim();
            const replaceExisting = typeof args.replaceExisting === 'boolean' ? args.replaceExisting : true;
            if (!title || !content) {
                return textResult({ error: 'title and content are required' });
            }
            const { filePath, slug, action } = await installRuleSection(title, content, replaceExisting);
            return textResult({
                action,
                slug,
                filePath,
                consolidatedFile: CONSOLIDATED_RULES_FILENAME,
                message: `Правило «${title}» ${action === 'updated' ? 'обновлено' : 'добавлено'} в ` +
                    `.cursor/rules/${CONSOLIDATED_RULES_FILENAME}. Cursor читает этот файл при работе в репозитории.`,
            });
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
async function main() {
    const server = new Server({ name: 'ai360-rules', version: '0.2.0' }, { capabilities: { tools: {} } });
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            const args = (request.params.arguments ?? {});
            return await handleTool(request.params.name, args);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [{ type: 'text', text: `Error: ${message}` }],
                isError: true,
            };
        }
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
