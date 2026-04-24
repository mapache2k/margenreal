import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'guias');

export type GuiaFrontmatter = {
  title: string;
  slug: string;
  description: string;
  date: string;
  draft: boolean;
  tags: string[];
};

export type GuiaItem = GuiaFrontmatter & { content: string };

export function getAllGuias(includeDrafts = false): GuiaFrontmatter[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
      const { data } = matter(raw);
      return data as GuiaFrontmatter;
    })
    .filter(g => includeDrafts || !g.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getGuia(slug: string): GuiaItem | null {
  if (!fs.existsSync(CONTENT_DIR)) return null;
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === slug) return { ...(data as GuiaFrontmatter), content };
  }
  return null;
}
