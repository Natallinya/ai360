#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

const DEFAULT_BFF_URL = 'http://localhost:3000';
const SEARCH_TIMEOUT_MS = 90_000;
const FUSION_TIMEOUT_MS = 360_000;
const DEFAULT_TIMEOUT_MS = 30_000;

function bffBaseUrl(): string {
  return (process.env.AI360_BFF_URL ?? DEFAULT_BFF_URL).replace(/\/$/, '');
}

function apiUrl(path: string): string {
  return `${bffBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchBff(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<{ ok: boolean; status: number; body: string }> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { timeoutMs: _ignored, ...requestInit } = init ?? {};

  const response = await fetch(apiUrl(path), {
    ...requestInit,
    signal: AbortSignal.timeout(timeoutMs),
  });

  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

const TOOLS: Tool[] = [
  {
    name: 'bff_health',
    description:
      'Ping ai360 BFF GET /api/health. Use before search/fusion to check local api or Render.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'bff_search',
    description:
      'Search products via GET /api/search?q=... Optional wbPage for Wildberries pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search text (min 2 characters)',
        },
        wbPage: {
          type: 'number',
          description: 'Wildberries page number (2+ loads next WB batch only)',
          minimum: 1,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'bff_fuse_animals',
    description:
      'Create animal hybrid via POST /api/animal-fusion. May take 1–6 min on Stable Horde queue.',
    inputSchema: {
      type: 'object',
      properties: {
        animal1: { type: 'string', description: 'First animal, e.g. кот' },
        animal2: { type: 'string', description: 'Second animal, e.g. сова' },
        style: {
          type: 'string',
          enum: ['cute', 'cartoon', 'realistic'],
          description: 'Image style (default: cute)',
        },
      },
      required: ['animal1', 'animal2'],
    },
  },
  {
    name: 'bff_wb_image',
    description:
      'Check Wildberries image proxy GET /api/wb-image/:nmId (follows redirect, returns status).',
    inputSchema: {
      type: 'object',
      properties: {
        nmId: {
          type: 'string',
          description: 'Wildberries product id (nmId), digits only',
        },
      },
      required: ['nmId'],
    },
  },
];

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

async function handleTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'bff_health': {
      const result = await fetchBff('/api/health');
      return textResult({
        baseUrl: bffBaseUrl(),
        status: result.status,
        ok: result.ok,
        body: tryParseJson(result.body),
      });
    }

    case 'bff_search': {
      const query = String(args.query ?? '').trim();
      if (query.length < 2) {
        return textResult({ error: 'query must be at least 2 characters' });
      }

      const params = new URLSearchParams({ q: query });
      const wbPage = Number(args.wbPage);
      if (Number.isFinite(wbPage) && wbPage >= 1) {
        params.set('wbPage', String(Math.floor(wbPage)));
      }

      const result = await fetchBff(`/api/search?${params}`, { timeoutMs: SEARCH_TIMEOUT_MS });
      return textResult({
        baseUrl: bffBaseUrl(),
        status: result.status,
        ok: result.ok,
        body: tryParseJson(result.body),
      });
    }

    case 'bff_fuse_animals': {
      const animal1 = String(args.animal1 ?? '').trim();
      const animal2 = String(args.animal2 ?? '').trim();
      const style = typeof args.style === 'string' ? args.style : 'cute';

      if (!animal1 || !animal2) {
        return textResult({ error: 'animal1 and animal2 are required' });
      }

      const result = await fetchBff('/api/animal-fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal1, animal2, style }),
        timeoutMs: FUSION_TIMEOUT_MS,
      });

      return textResult({
        baseUrl: bffBaseUrl(),
        status: result.status,
        ok: result.ok,
        body: tryParseJson(result.body),
        note: result.ok
          ? 'imageUrl is relative — open via BFF baseUrl + imageUrl'
          : undefined,
      });
    }

    case 'bff_wb_image': {
      const nmId = String(args.nmId ?? '').replace(/\D/g, '');
      if (!nmId) {
        return textResult({ error: 'nmId must contain digits' });
      }

      const response = await fetch(apiUrl(`/api/wb-image/${nmId}`), {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });

      return textResult({
        baseUrl: bffBaseUrl(),
        nmId,
        status: response.status,
        ok: response.ok || response.status === 302 || response.status === 301,
        location: response.headers.get('location'),
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function main(): Promise<void> {
  const server = new Server(
    {
      name: 'ai360-bff',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const args = (request.params.arguments ?? {}) as Record<string, unknown>;
      return await handleTool(request.params.name, args);
    } catch (error) {
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
