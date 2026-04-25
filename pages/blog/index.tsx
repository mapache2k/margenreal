import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getAllPosts, PostMeta } from '../../lib/blog';

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  return (
    <Layout>
      <Head>
        <title>Blog — Margen Real</title>
        <meta name="description" content="Estrategias de pricing y margen para negocios en América Latina." />
      </Head>

      <style>{`
        .blog-list { max-width: var(--content-max); padding: 0 0 80px; display: grid; gap: 1px; }
        @media(max-width:640px){ .blog-list { padding: 0 0 60px; } }
        .blog-card { background: var(--surface); padding: 28px; transition: background var(--transition); text-decoration: none; display: block; }
        .blog-card:first-child { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        .blog-card:last-child  { border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
        .blog-card:only-child  { border-radius: var(--radius-lg); }
        .blog-card:hover { background: var(--surface-2); }
        .blog-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .blog-cat { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px; }
        .blog-date { font-size: 0.75rem; color: var(--muted); }
        .blog-card-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1.3; }
        .blog-excerpt { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }
        .blog-arrow { font-size: 0.875rem; color: var(--accent); margin-top: 12px; font-weight: 600; }
        .empty { padding: 0 0 80px; text-align: center; color: var(--muted); }
      `}</style>

      <div className="page-wrap">
        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Blog
          </div>
          <h1 className="page-h1">Pricing y margen<br />para negocios reales</h1>
          <p className="page-lead">Sin teoría. Sin relleno. Solo lo que funciona.</p>
        </div>

        {posts.length === 0 ? (
          <div className="empty"><p>No hay artículos publicados todavía.</p></div>
        ) : (
          <div className="blog-list">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-meta">
                  <span className="blog-cat">{post.category}</span>
                  <span className="blog-date">{post.date}</span>
                </div>
                <div className="blog-card-title">{post.title}</div>
                <div className="blog-excerpt">{post.excerpt}</div>
                <div className="blog-arrow">Leer artículo →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts();
  return { props: { posts } };
};
