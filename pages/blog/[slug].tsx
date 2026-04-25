import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import { getPost, getAllSlugs, Post } from '../../lib/blog';

export default function BlogPost({ post }: { post: Post }) {
  return (
    <>
      <Head>
        <title>{post.title} — Margen Real</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
      </Head>

      <style>{`
        * { box-sizing: border-box; }
        body { background: #0a0a0e; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; }
        .article-wrap { max-width: 680px; margin: 0 auto; padding: 64px 24px 120px; }
        .back-link { display: inline-block; font-size: 0.8125rem; color: #555; text-decoration: none; margin-bottom: 48px; }
        .back-link:hover { color: #f0f0f0; }
        .article-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .article-cat { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #f9d71b; }
        .article-date { font-size: 0.75rem; color: #555; }
        .article-wrap h1 { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 900; letter-spacing: -0.03em; margin: 0 0 32px; line-height: 1.15; }
        .article-body { font-size: 1rem; line-height: 1.8; color: #d0d0d0; }
        .article-body h2 { font-size: 1.125rem; font-weight: 800; color: #f0f0f0; margin: 40px 0 12px; letter-spacing: -0.02em; }
        .article-body h3 { font-size: 0.9375rem; font-weight: 700; color: #f0f0f0; margin: 28px 0 8px; }
        .article-body p { margin: 0 0 20px; }
        .article-body strong { color: #f0f0f0; font-weight: 700; }
        .article-body a { color: #f9d71b; text-decoration: none; }
        .article-body a:hover { text-decoration: underline; }
        .article-body ul, .article-body ol { padding-left: 20px; margin: 0 0 20px; }
        .article-body li { margin-bottom: 8px; }
        .article-body table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 0.875rem; }
        .article-body th { text-align: left; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #666; padding: 8px 12px; border-bottom: 1px solid #222; }
        .article-body td { padding: 10px 12px; border-bottom: 1px solid #161616; color: #c0c0c0; }
        .article-body tr:last-child td { border-bottom: none; }
        .article-body pre { background: #111; border: 1px solid #1f1f1f; border-radius: 8px; padding: 16px 20px; font-size: 0.8125rem; overflow-x: auto; margin: 20px 0; }
        .article-body code { font-family: 'Menlo', 'Monaco', monospace; font-size: 0.875em; background: #141414; padding: 2px 6px; border-radius: 4px; }
        .article-body pre code { background: none; padding: 0; }
        .article-body blockquote { border-left: 3px solid #f9d71b; margin: 24px 0; padding: 4px 20px; color: #999; font-style: italic; }
        .article-body hr { border: none; border-top: 1px solid #1a1a1a; margin: 40px 0; }
        .article-body em { color: #888; font-style: normal; font-size: 0.8125rem; }
        .cta-box { margin-top: 56px; padding: 28px; background: #0f0f13; border: 1px solid #1f1f1f; border-radius: 14px; text-align: center; }
        .cta-box p { font-size: 0.9375rem; color: #888; margin: 0 0 16px; }
        .cta-btn { display: inline-block; background: #f9d71b; color: #0a0a0e; font-weight: 800; font-size: 0.9375rem; padding: 14px 28px; border-radius: 10px; text-decoration: none; }
        .cta-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="article-wrap">
        <Link href="/blog" className="back-link">← Volver al blog</Link>

        <div className="article-meta">
          <span className="article-cat">{post.category}</span>
          <span className="article-date">{post.date}</span>
        </div>

        <h1>{post.title}</h1>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className="cta-box">
          <p>Calculá el margen real de tus productos en segundos.</p>
          <Link href="/calculadora-ml" className="cta-btn">Ir a la calculadora →</Link>
        </div>
      </div>
    </>
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
