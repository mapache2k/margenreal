import Head from 'next/head';
import Layout from '../components/Layout';

export default function TermsPage() {
  return (
    <Layout>
      <Head>
        <title>Términos de Uso — Margen Real</title>
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
        .highlight-box { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px 24px; margin: 28px 0; }
        .highlight-box p { color: var(--text); margin: 0; font-size: 15px; line-height: 1.7; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 36px 0; }
      `}</style>

      <div className="legal-wrap">
        <div className="page-eyebrow"><span className="dot" />Legal</div>
        <h1>Términos de Uso</h1>
        <div className="legal-date">Última actualización: abril 2025</div>

        <div className="highlight-box">
          <p>
            ⚠️ <strong>Importante:</strong> Margen Real es una herramienta educativa de apoyo al pricing, no un servicio de asesoría financiera, contable o legal certificada. Los resultados de la calculadora son estimaciones basadas en los datos que tú ingresas.
          </p>
        </div>

        <h2>1. Aceptación de los términos</h2>
        <p>Al acceder y usar margenreal.io, aceptas estos Términos de Uso. Si no estás de acuerdo con alguna parte, te pedimos que no uses el servicio.</p>

        <h2>2. Descripción del servicio</h2>
        <p>Margen Real ofrece herramientas y contenido educativo para dueños de pequeñas y medianas empresas en América Latina, enfocados en estrategias de pricing y gestión de márgenes. El servicio incluye:</p>
        <ul>
          <li>Calculadora de margen para MercadoLibre Chile</li>
          <li>Guías gratuitas sobre pricing y márgenes</li>
          <li>Materiales digitales de pago (ebooks, guías avanzadas)</li>
        </ul>

        <h2>3. Uso permitido</h2>
        <p>Puedes usar margenreal.io para:</p>
        <ul>
          <li>Calcular y analizar el margen de tus productos</li>
          <li>Aprender sobre estrategias de pricing para tu negocio</li>
          <li>Acceder a los materiales digitales que hayas adquirido</li>
        </ul>
        <p>No puedes usar margenreal.io para:</p>
        <ul>
          <li>Reproducir o redistribuir los materiales digitales sin autorización</li>
          <li>Intentar acceder, modificar o interferir con la infraestructura del sitio</li>
          <li>Usar el servicio de forma que viole leyes aplicables</li>
        </ul>

        <h2>4. Compras y pagos</h2>
        <p>Los materiales digitales de pago se procesan a través de Lemon Squeezy. Al completar una compra, recibirás acceso al material adquirido por email. Las compras de productos digitales no tienen derecho a reembolso salvo que el material no pueda ser entregado.</p>

        <h2>5. Limitación de responsabilidad</h2>
        <p><strong>Margen Real no es un servicio de asesoría financiera, contable, legal ni tributaria.</strong> Los resultados de la calculadora son estimaciones matemáticas basadas exclusivamente en los datos que tú proporcionas.</p>
        <p>Nos deslindamos de cualquier responsabilidad por:</p>
        <ul>
          <li>Decisiones de negocio tomadas basándose en el contenido del sitio</li>
          <li>Inexactitudes derivadas de datos incorrectos ingresados por el usuario</li>
          <li>Pérdidas financieras de cualquier tipo asociadas al uso del servicio</li>
          <li>Interrupciones temporales del servicio</li>
        </ul>

        <h2>6. Propiedad intelectual</h2>
        <p>El código, diseño, textos, marca y materiales de margenreal.io son propiedad de sus creadores. No puedes copiar, modificar ni redistribuir ningún componente del servicio sin autorización expresa por escrito.</p>

        <h2>7. Modificaciones a los términos</h2>
        <p>Podemos actualizar estos términos en cualquier momento. Los cambios entran en vigor al publicarse en esta página. El uso continuado del servicio implica aceptación de los nuevos términos.</p>

        <h2>8. Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa será resuelta en los tribunales competentes de Santiago de Chile.</p>

        <h2>9. Contacto</h2>
        <p>Para consultas sobre estos términos, escríbenos a <a href="mailto:contacto@margenreal.io" style={{ color: 'var(--accent)' }}>contacto@margenreal.io</a>.</p>

        <hr className="divider" />
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Al usar margenreal.io aceptas estos términos en su totalidad.</p>
      </div>
    </Layout>
  );
}
