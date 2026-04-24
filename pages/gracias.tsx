import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import posthog from 'posthog-js';

export default function Gracias() {
  const router = useRouter();
  const { plan } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    posthog.capture('purchase_complete', { plan: plan ?? 'unknown' });
  }, [router.isReady, plan]);

  return (
    <Layout>
      <Head>
        <title>¡Compra confirmada! — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="page-wrap">
        <div className="page-hero" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div className="page-eyebrow">
            <span className="dot" />
            Compra confirmada
          </div>
          <h1 className="page-h1">¡Listo! Ya tienes<br />acceso a tu material.</h1>
          <p className="page-lead">
            Revisa tu email — te enviamos el enlace de descarga en los próximos minutos. Si no aparece, revisa la carpeta de Promociones o Spam.
          </p>
          <div className="page-actions" style={{ justifyContent: 'center' }}>
            <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Ir a la calculadora →
            </Link>
            <Link href="/guias" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Ver guías
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
