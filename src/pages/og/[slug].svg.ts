import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

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

// Helper function to wrap text for multiline display
function wrapText(text: string, maxLength: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine) lines.push(currentLine.trim());

  return lines.map((line, i) =>
    `<tspan x="0" dy="${i === 0 ? 0 : 80}">${escapeHtml(line)}</tspan>`
  ).join('');
}

function generateSvg(title: string): string {
  const wrappedTitle = wrapText(title, 30);

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
    <g transform="translate(0, 180)">
      <rect x="0" y="0" width="120" height="32" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <circle cx="16" cy="16" r="4" fill="#22c55e"/>
      <text x="28" y="21" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500" fill="#d4d4d4">Blog Post</text>
    </g>
    <text x="0" y="280" font-family="Inter, system-ui, sans-serif" font-size="72" font-weight="500" fill="url(#titleGradient)" letter-spacing="-1.44">
      ${wrappedTitle}
    </text>
    <text x="0" y="520" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#a3a3a3">Ivan Mercedes</text>
  </g>
</svg>`;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { title: post.data.ogTitle || post.data.name },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title } = props as { title: string };

  return new Response(generateSvg(title), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
