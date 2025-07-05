import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { entry: post },
	}));
}

export const GET: APIRoute = async ({ props }) => {
	const { entry } = props as { entry: any };
	const { title, description } = entry.data;

	// SVGを生成
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="2" fill="#ffffff" opacity="0.1"/>
      <circle cx="35" cy="35" r="2" fill="#ffffff" opacity="0.1"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  
  <!-- Large decorative brackets -->
  <path d="M150 180 L50 315 L150 450" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.15"/>
  <path d="M1050 180 L1150 315 L1050 450" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.15"/>
  
  <!-- Blog name -->
  <text x="600" y="120" font-family="Arial, sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" opacity="0.8">Code &amp; Living</text>
  
  <!-- Title background -->
  <rect x="100" y="200" width="1000" height="180" fill="#000000" opacity="0.2" rx="10"/>
  
  <!-- Title (wrap long titles) -->
  ${renderTitle(title)}
  
  <!-- Description -->
  ${renderDescription(description)}
</svg>`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};

function renderTitle(title: string): string {
	// タイトルが長い場合は改行
	const maxLength = 40;
	if (title.length <= maxLength) {
		return `<text x="600" y="300" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${escapeXml(title)}</text>`;
	}

	// 単語で分割して改行
	const words = title.split(' ');
	const lines: string[] = [];
	let currentLine = '';

	for (const word of words) {
		if (`${currentLine} ${word}`.length <= maxLength) {
			currentLine = currentLine ? `${currentLine} ${word}` : word;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}
	if (currentLine) lines.push(currentLine);

	return lines
		.map((line, i) => {
			const y = 280 + i * 50;
			return `<text x="600" y="${y}" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${escapeXml(line)}</text>`;
		})
		.join('\n  ');
}

function renderDescription(description: string): string {
	// 説明文も長い場合は省略
	const maxLength = 80;
	const truncated =
		description.length > maxLength ? `${description.substring(0, maxLength - 3)}...` : description;

	return `<text x="600" y="450" font-family="Arial, sans-serif" font-size="24" fill="#FFFFFF" text-anchor="middle" opacity="0.8">${escapeXml(truncated)}</text>`;
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
