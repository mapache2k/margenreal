import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
}

export function getAllPosts(): PostMeta[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  return files
    .map(filename => {
      const slug = filename.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
      const { data } = matter(raw);
      return { slug, title: data.title, date: data.date, excerpt: data.excerpt, category: data.category } as PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<Post | null> {
  ensureBlogDir();
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    category: data.category,
    contentHtml: processed.toString(),
  };
}

export function getAllSlugs(): string[] {
  ensureBlogDir();
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}
