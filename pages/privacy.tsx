import Head from 'next/head';
import Layout from '../components/Layout';

export default function PrivacyPage() {
  return (
    <Layout>
      <Head>
        <title>Política de Privacidad — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        .legal-wrap { max-width: 720px; margin: 0 auto; padding: 60px 40px 80px; }
        @media (max-width: 640px) { .legal-wrap { padding: 40px 20px 60px; } }
        .legal-wrap h1 { font-family: var(--font-display); font-size: clamp(28px, 5vw, 42px); font-weight: 800; margin-bottom: 8px; }
        .legal-date { font-size: 13px; color: var(--muted); margin-bottom: 48px; }
        .legal-wrap h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin: 36px 0 12px; color: var(--text); }
        .legal-wrap p { font-size: 15px; color: var(--muted); line-height: 1.8; margin-bottom: 14px; }
        .legal-wrap ul { padding-left: 20px; margin-bottom: 14px; }
        .legal-wrap ul li { font-size: 15px; color: var(--muted); line-height: 1.8; margin-bottom: 6px; }
        .legal-wrap strong { color: var(--text); }
        .highlight-box { background: rgba(249,215,27,0.06); border: 1px solid rgba(249,215,27,0.2); border-radius: 12px; padding: 20px 24px; margin: 28px 0; }
        .highlight-box p { color: var(--text); margin: 0; font-size: 15px; line-height: 1.7; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 36px 0; }
      `}</style>

      <div className="legal-wrap">
        <div className="page-eyebrow"><span className="dot" />Legal</div>
        <h1>Política de Privacidad</h1>
        <div className="legal-date">Última actualización: abril 2025</div>

        <div className="highlight-box">
          <p>🔒 <strong>Resumen:</strong> los números que ingresas en la calculadora se procesan en tu navegador. No los enviamos ni guardamos. Si nos dejas tu email, lo usamos solo para enviarte lo que pediste.</p>
        </div>

        <h2>1. Quiénes somos</h2>
        <p>Margen Real (margenreal.io) es una plataforma educativa de pricing para dueños de pequeñas y medianas empresas en América Latina.</p>

        <h2>2. Qué información recopilamos</h2>
        <p><strong>Datos de la calculadora:</strong> ninguno. Los cálculos de margen ocurren directamente en tu navegador y nunca llegan a nuestros servidores.</p>
        <p><strong>Correo electrónico:</strong> si te suscribes al newsletter o descargas material gratuito, guardamos tu email para enviarte el contenido prometido y actualizaciones del producto. Puedes darte de baja en cualquier momento.</p>
        <p><strong>Datos de pago:</strong> las compras se procesan por Lemon Squeezy. No almacenamos datos de tarjetas ni información bancaria.</p>
        <p><strong>Datos de navegación:</strong> usamos PostHog para recopilar datos anónimos de uso (páginas visitadas, interacciones con la calculadora) con el fin de mejorar el producto. No contienen información personal identificable.</p>

        <h2>3. Cómo usamos la información</h2>
        <ul>
          <li>Para enviarte el material que solicitaste</li>
          <li>Para enviarte actualizaciones y contenido relevante (solo si te suscribiste)</li>
          <li>Para entender cómo se usa el sitio y mejorarlo</li>
          <li>Nunca para vender datos a terceros</li>
          <li>Nunca para publicidad dirigida</li>
        </ul>

        <h2>4. Proveedores de terceros</h2>
        <ul>
          <li><strong>Vercel:</strong> hosting del sitio</li>
          <li><strong>Resend:</strong> envío de emails transaccionales</li>
          <li><strong>Lemon Squeezy:</strong> procesamiento de pagos</li>
          <li><strong>PostHog:</strong> analítica anónima de uso</li>
        </ul>
        <p>Cada proveedor opera bajo sus propias políticas de privacidad.</p>

        <h2>5. Tus derechos</h2>
        <p>Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiéndonos a <a href="mailto:contacto@margenreal.io" style={{ color: 'var(--accent)' }}>contacto@margenreal.io</a>. Para darte de baja del newsletter, usa el link de baja incluido en cada email.</p>

        <h2>6. Seguridad</h2>
        <p>Tomamos medidas razonables para proteger la información que procesamos. Los datos financieros de la calculadora nunca salen de tu navegador, lo que minimiza el riesgo por diseño.</p>

        <h2>7. Menores de edad</h2>
        <p>Este servicio no está dirigido a personas menores de 18 años.</p>

        <h2>8. Cambios a esta política</h2>
        <p>Podemos actualizar esta política ocasionalmente. Los cambios se publican en esta página con una nueva fecha de actualización.</p>

        <h2>9. Contacto</h2>
        <p>Para preguntas sobre esta política, escríbenos a <a href="mailto:contacto@margenreal.io" style={{ color: 'var(--accent)' }}>contacto@margenreal.io</a>.</p>

        <hr className="divider" />
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Al usar margenreal.io aceptas los términos descritos en este documento.</p>
      </div>
    </Layout>
  );
}
