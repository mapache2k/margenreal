import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getAllPosts, PostMeta } from '../../lib/blog';

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  return (
    <>
      <Head>
        <title>Blog — Margen Real</title>
        <meta name="description" content="Estrategias de pricing y margen para negocios en América Latina." />
      </Head>

      <style>{`
        * { box-sizing: border-box; }
        body { background: #0a0a0e; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; }
        .blog-wrap { max-width: 720px; margin: 0 auto; padding: 64px 24px; }
        .blog-eyebrow { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #f9d71b; margin-bottom: 12px; }
        .blog-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 900; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.1; }
        .blog-sub { color: #666; font-size: 0.9375rem; margin: 0 0 56px; }
        .post-list { display: flex; flex-direction: column; gap: 2px; }
        .post-card { display: block; padding: 28px 0; border-bottom: 1px solid #1a1a1a; text-decoration: none; color: inherit; transition: opacity 0.15s; }
        .post-card:first-child { border-top: 1px solid #1a1a1a; }
        .post-card:hover { opacity: 0.75; }
        .post-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .post-cat { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #f9d71b; }
        .post-date { font-size: 0.75rem; color: #555; }
        .post-card h2 { font-size: 1.125rem; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px; line-height: 1.35; }
        .post-excerpt { font-size: 0.875rem; color: #888; line-height: 1.6; margin: 0; }
        .empty { color: #555; font-size: 0.9375rem; text-align: center; padding: 80px 0; }
        .back-link { display: inline-block; font-size: 0.8125rem; color: #555; text-decoration: none; margin-bottom: 48px; }
        .back-link:hover { color: #f0f0f0; }
      `}</style>

      <div className="blog-wrap">
        <Link href="/" className="back-link">← margenreal.io</Link>
        <div className="blog-eyebrow">Blog</div>
        <h1 className="blog-title">Pricing y margen para negocios reales</h1>
        <p className="blog-sub">Sin teoría. Sin relleno. Solo lo que funciona.</p>

        {posts.length === 0 ? (
          <div className="empty">No hay artículos publicados aún.</div>
        ) : (
          <div className="post-list">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="post-card">
                <div className="post-meta">
                  <span className="post-cat">{post.category}</span>
                  <span className="post-date">{post.date}</span>
                </div>
                <h2>{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts();
  return { props: { posts } };
};
