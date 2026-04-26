import { GetServerSideProps } from 'next';
import { getAllGuias } from '../lib/guias';
import { getAllPosts } from '../lib/blog';

const BASE = 'https://margenreal.io';

function url(loc: string, priority = '0.7', changefreq = 'monthly') {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const guias = getAllGuias(false);
  const posts = getAllPosts();

  const staticPages = [
    url(`${BASE}/`,               '1.0', 'weekly'),
    url(`${BASE}/calculadora-ml`, '0.9', 'monthly'),
    url(`${BASE}/importados`,     '0.8', 'monthly'),
    url(`${BASE}/guias`,          '0.8', 'weekly'),
    url(`${BASE}/blog`,           '0.8', 'weekly'),
    url(`${BASE}/pricing`,        '0.7', 'monthly'),
    url(`${BASE}/checkout`,       '0.6', 'monthly'),
    url(`${BASE}/about`,          '0.5', 'yearly'),
    url(`${BASE}/privacy`,        '0.3', 'yearly'),
    url(`${BASE}/terms`,          '0.3', 'yearly'),
  ];

  const guiaPages = guias.map(g =>
    url(`${BASE}/guias/${g.slug}`, g.type === 'playbook' ? '0.8' : '0.7', 'monthly')
  );

  const blogPages = posts.map(p =>
    url(`${BASE}/blog/${p.slug}`, '0.7', 'monthly')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...guiaPages, ...blogPages].join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() { return null; }
