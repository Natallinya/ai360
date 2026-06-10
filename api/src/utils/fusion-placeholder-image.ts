import { FUSION_IMAGE_SIZE } from '../config/fusion-image.config.js';
import { AnimalFusionStyle } from '../models/animal-fusion.model.js';

const STYLE_COLORS: Record<AnimalFusionStyle, { bg1: string; bg2: string; accent: string }> = {
  cute: { bg1: '#fef3c7', bg2: '#fce7f3', accent: '#f59e0b' },
  cartoon: { bg1: '#dbeafe', bg2: '#dcfce7', accent: '#2563eb' },
  realistic: { bg1: '#e7e5e4', bg2: '#d6d3d1', accent: '#57534e' },
};

export function buildFusionPlaceholderSvg(
  animal1: string,
  animal2: string,
  style: AnimalFusionStyle = 'cute',
): Buffer {
  const colors = STYLE_COLORS[style];
  const safeTitle = escapeXml(`${animal1} × ${animal2}`);
  const safeA1 = escapeXml(animal1);
  const safeA2 = escapeXml(animal2);

  const size = FUSION_IMAGE_SIZE;
  const center = size / 2;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bg1}"/>
      <stop offset="100%" stop-color="${colors.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${center}" cy="${center}" r="${Math.round(size * 0.33)}" fill="#ffffff" opacity="0.55"/>
  <ellipse cx="${center}" cy="${Math.round(center * 1.17)}" rx="${Math.round(size * 0.24)}" ry="${Math.round(size * 0.17)}" fill="${colors.accent}" opacity="0.18"/>
  <text x="${Math.round(center * 0.66)}" y="${Math.round(center * 0.9)}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(size * 0.14)}" text-anchor="middle">🧬</text>
  <text x="${Math.round(center * 1.34)}" y="${Math.round(center * 0.9)}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(size * 0.14)}" text-anchor="middle">✨</text>
  <text x="${center}" y="${Math.round(size * 0.29)}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(size * 0.056)}" font-weight="700" fill="#1f2937" text-anchor="middle">${safeTitle}</text>
  <text x="${Math.round(center * 0.7)}" y="${Math.round(size * 0.66)}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(size * 0.044)}" fill="#374151" text-anchor="middle">${safeA1}</text>
  <text x="${Math.round(center * 1.3)}" y="${Math.round(size * 0.66)}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(size * 0.044)}" fill="#374151" text-anchor="middle">${safeA2}</text>
  <text x="${center}" y="${Math.round(size * 0.76)}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(size * 0.032)}" fill="#6b7280" text-anchor="middle">Заглушка — AI-очередь недоступна</text>
</svg>`;

  return Buffer.from(svg, 'utf8');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
