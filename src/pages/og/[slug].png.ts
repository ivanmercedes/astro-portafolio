import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { Resvg } from '@resvg/resvg-js';

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Max lines allowed for the title
const MAX_LINES = 3;

// Helper function to wrap text for multiline display with truncation
function wrapText(text: string, maxLength: number, lineHeight: number): { tspans: string; lineCount: number } {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        if (lines.length === MAX_LINES) break;
      }
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine && lines.length < MAX_LINES) {
    lines.push(currentLine.trim());
  }

  // If there are remaining words, add ellipsis to the last line
  const allText = lines.join(' ');
  const isTruncated = allText.length < text.replace(/\s+/g, ' ').trim().length;
  if (isTruncated && lines.length > 0) {
    let lastLine = lines[lines.length - 1];
    // Ensure ellipsis fits within maxLength
    if (lastLine.length > maxLength - 1) {
      lastLine = lastLine.slice(0, maxLength - 1).trim();
    }
    lines[lines.length - 1] = lastLine + '…';
  }

  const tspans = lines.map((line, i) =>
    `<tspan x="0" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`
  ).join('');

  return { tspans, lineCount: lines.length };
}

function generateSvg(title: string): string {
  // Determine font size and layout based on title length
  const titleLength = title.length;
  let fontSize: number;
  let lineHeight: number;
  let charsPerLine: number;

  if (titleLength <= 30) {
    fontSize = 72;
    lineHeight = 80;
    charsPerLine = 25;
  } else if (titleLength <= 60) {
    fontSize = 64;
    lineHeight = 72;
    charsPerLine = 28;
  } else {
    fontSize = 56;
    lineHeight = 64;
    charsPerLine = 32;
  }

  const { tspans: wrappedTitle, lineCount } = wrapText(title, charsPerLine, lineHeight);

  // Dynamic vertical positioning
  const badgeY = 180;
  const titleStartY = badgeY + 32 + 60; // after badge + gap
  const titleBlockHeight = (lineCount - 1) * lineHeight;
  const authorY = titleStartY + titleBlockHeight + 60; // gap after title
  // Clamp author so it doesn't go off-screen (630 - padding)
  const clampedAuthorY = Math.min(authorY, 570);

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e5e5e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#737373;stop-opacity:1" />
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="100"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.5"/>
  <ellipse cx="600" cy="200" rx="400" ry="200" fill="rgba(255,255,255,0.03)" filter="url(#blur)"/>
  <g transform="translate(80, 0)">
    <g transform="translate(0, ${badgeY})">
      <rect x="0" y="0" width="120" height="32" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <circle cx="16" cy="16" r="4" fill="#22c55e"/>
      <text x="28" y="21" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500" fill="#d4d4d4">Blog Post</text>
    </g>
    <text x="0" y="${titleStartY}" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="500" fill="url(#titleGradient)" letter-spacing="-1.44">
      ${wrappedTitle}
    </text>
    <text x="0" y="${clampedAuthorY}" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#a3a3a3">Ivan Mercedes</text>
  </g>
</svg>`;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { title: post.data.ogTitle || post.data.name },
  }));
};

export const GET: APIRoute = async ({ props }) => {
    const { title } = props as { title: string };

  const svg = generateSvg(title);

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200
    }
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
