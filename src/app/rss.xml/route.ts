import { blogs, caseStudies } from '#content';

import { SITE_URL } from '@/app/lib/siteUrl';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const allItems = [
    ...blogs.map((blog) => ({
      title: blog.title,
      link: `${SITE_URL}/resources/blog/${blog.slug}`,
      description: blog.excerpt,
      pubDate: new Date(blog.date).toUTCString(),
      date: new Date(blog.date).getTime(),
    })),
    ...caseStudies.map((cs) => ({
      title: cs.title,
      link: `${SITE_URL}/resources/case-studies/${cs.slug}`,
      description: cs.excerpt,
      pubDate: new Date(cs.date).toUTCString(),
      date: new Date(cs.date).getTime(),
    })),
  ].sort((a, b) => b.date - a.date);

  const rssItems = allItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid>${item.link}</guid>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CraftsAI - AI-Powered Development</title>
    <link>${SITE_URL}</link>
    <description>Blog posts, case studies, and guides on AI-powered software development from CraftsAI.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
