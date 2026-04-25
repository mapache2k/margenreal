import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import { getPost, getAllSlugs, Post } from '../../lib/blog';

export default function BlogPost({ post }: { post: Post }) {
  return (
    <Layout>
      <Head>
        <title>{post.title} — Margen Real</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
      </Head>

      <style>{`
        .blog-wrap { max-width: 720px; margin: 0 auto; padding: 56px 40px 80px; }
        @media(max-width:640px){ .blog-wrap { padding: 32px 20px 60px; } }

        .blog-back { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--muted); text-decoration: none; margin-bottom: 32px; transition: color 0.15s; }
        .blog-back:hover { color: var(--text); }

        .blog-post-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .blog-post-cat { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px; }
        .blog-post-date { font-size: 0.75rem; color: var(--muted); }

        .blog-post-title { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 12px; }
        .blog-post-excerpt { font-size: 1rem; color: var(--muted); line-height: 1.7; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid var(--border); }

        .blog-body h2 { font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; letter-spacing: -0.02em; margin: 40px 0 16px; color: var(--text); }
        .blog-body h3 { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; margin: 28px 0 12px; color: var(--text); }
        .blog-body p { font-size: 0.9375rem; color: var(--text-2, var(--muted)); line-height: 1.8; margin-bottom: 16px; }
        .blog-body strong { color: var(--text); font-weight: 700; }
        .blog-body ul, .blog-body ol { padding-left: 20px; margin-bottom: 16px; }
        .blog-body li { font-size: 0.9375rem; color: var(--text-2, var(--muted)); line-height: 1.8; margin-bottom: 6px; }
        .blog-body pre { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; overflow-x: auto; margin-bottom: 20px; }
        .blog-body code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875rem; color: var(--accent); }
        .blog-body pre code { color: var(--text); }
        .blog-body blockquote { border-left: 3px solid var(--accent); padding: 12px 20px; background: rgba(249,215,27,0.04); border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        .blog-body blockquote p { margin-bottom: 0; }
        .blog-body table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.875rem; }
        .blog-body th { background: var(--surface); padding: 10px 14px; text-align: left; font-weight: 700; color: var(--text); border-bottom: 2px solid var(--border); }
        .blog-body td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--muted); }
        .blog-body tr:last-child td { border-bottom: none; }
        .blog-body a { color: var(--accent); text-decoration: none; font-weight: 600; }
        .blog-body a:hover { text-decoration: underline; }
        .blog-body em { color: var(--muted); font-style: italic; font-size: 0.875rem; }
        .blog-body hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }

        .blog-cta { background: rgba(249,215,27,0.04); border: 1px solid rgba(249,215,27,0.2); border-radius: 16px; padding: 28px; margin-top: 48px; text-align: center; }
        .blog-cta p { color: var(--muted); font-size: 0.9375rem; margin-bottom: 16px; }
      `}</style>

      <div className="blog-wrap">
        <Link href="/blog" className="blog-back">← Volver al blog</Link>

        <div className="blog-post-meta">
          <span className="blog-post-cat">{post.category}</span>
          <span className="blog-post-date">{post.date}</span>
        </div>

        <h1 className="blog-post-title">{post.title}</h1>
        <p className="blog-post-excerpt">{post.excerpt}</p>

        <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        <div className="blog-cta">
          <p>Calculá el margen real de tus productos en segundos.</p>
          <Link href="/calculadora-ml" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Ir a la calculadora →
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllSlugs();
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(params!.slug as string);
  if (!post) return { notFound: true };
  return { props: { post } };
};
