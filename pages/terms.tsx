// pages/terms.tsx
import Head from "next/head";
import React from "react";

export default function TermsPage(): JSX.Element {
  return (
    <>
      <Head>
        <title>Términos de Uso — margenreal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <nav>
        <a className="nav-logo" href="/">
          margen<span>real</span>
        </a>
        <div className="nav-links">
          <a className="nav-link" href="/">
            Inicio
          </a>
          <a className="nav-link" href="/tool">
            Herramienta
          </a>
          <a className="nav-link" href="/pricing">
            Planes
          </a>
          <a className="nav-link" href="/about">
            Nosotros
          </a>
        </div>
        <a className="btn nav-cta" href="/tool">
          Diagnosticar mi negocio →
        </a>
      </nav>

      <div className="page-wrap">
        <div className="legal-wrap">
          <div className="label">Legal</div>
          <h1>Términos de Uso</h1>
          <div className="legal-date">Última actualización: enero 2025</div>

          <div className="highlight-box">
            <p>
              ⚠️ <strong>Importante:</strong> margenreal es una herramienta de
              apoyo a la toma de decisiones, no un servicio de asesoría
              financiera, contable o legal certificada. Los resultados son
              estimaciones basadas en los datos que tú ingresas.
            </p>
          </div>

          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder y usar margenreal.io, aceptas estos Términos de Uso. Si
            no estás de acuerdo con alguna parte, te pedimos que no uses el
            servicio.
          </p>

          <h2>2. Descripción del servicio</h2>
          <p>
            margenreal.io es una herramienta de diagnóstico financiero que
            permite a dueños de pequeñas y medianas empresas obtener estimaciones
            sobre la salud financiera de su negocio a partir de datos que ellos
            mismos ingresan.
          </p>
          <p>El servicio incluye cálculos de:</p>
          <ul>
            <li>Runway de caja (meses disponibles antes de quedarse sin caja)</li>
            <li>Punto de equilibrio operacional</li>
            <li>Sensibilidad ante variaciones en ventas</li>
            <li>Proyecciones de caja a 6 meses</li>
            <li>Diagnóstico gerencial automatizado</li>
          </ul>

          <h2>3. Uso permitido</h2>
          <p>Puedes usar margenreal.io para:</p>
          <ul>
            <li>Analizar la situación financiera de tu propio negocio</li>
            <li>Apoyar decisiones internas de gestión</li>
            <li>Compartir resultados con tu equipo o asesores</li>
          </ul>
          <p>No puedes usar margenreal.io para:</p>
          <ul>
            <li>Presentar los resultados como informes financieros certificados</li>
            <li>Usar el servicio de forma que viole leyes aplicables</li>
            <li>Intentar acceder, modificar o interferir con la infraestructura del sitio</li>
            <li>Reproducir o redistribuir el servicio sin autorización</li>
          </ul>

          <h2>4. Limitación de responsabilidad</h2>
          <p>
            <strong>margenreal.io no es un servicio de asesoría financiera,
            contable, legal ni tributaria.</strong> Los resultados de la herramienta
            son estimaciones matemáticas basadas exclusivamente en los datos que
            tú proporcionas.
          </p>
          <p>Nos deslindamos de cualquier responsabilidad por:</p>
          <ul>
            <li>Decisiones de negocio tomadas basándose en los resultados de la herramienta</li>
            <li>Inexactitudes derivadas de datos incorrectos o incompletos ingresados por el usuario</li>
            <li>Pérdidas financieras de cualquier tipo asociadas al uso del servicio</li>
            <li>Interrupciones temporales del servicio</li>
          </ul>
          <p>
            Siempre recomendamos complementar el uso de la herramienta con la
            asesoría de un contador, financiero o asesor certificado.
          </p>

          <h2>5. Precisión de los resultados</h2>
          <p>
            Los cálculos son tan precisos como los datos ingresados. La herramienta
            utiliza modelos financieros simplificados diseñados para dar claridad
            rápida, no para reemplazar análisis financieros profesionales detallados.
          </p>
          <p>Los resultados son estimaciones y no garantías sobre el desempeño futuro de tu negocio.</p>

          <h2>6. Propiedad intelectual</h2>
          <p>
            El código, diseño, textos, marca y lógica de margenreal.io son
            propiedad de sus creadores. No puedes copiar, modificar ni
            redistribuir ningún componente del servicio sin autorización expresa
            por escrito.
          </p>

          <h2>7. Disponibilidad del servicio</h2>
          <p>
            Nos esforzamos por mantener el servicio disponible en todo momento,
            pero no garantizamos disponibilidad ininterrumpida. Podemos realizar
            mantenimientos, actualizaciones o cambios sin previo aviso.
          </p>

          <h2>8. Modificaciones a los términos</h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. Los cambios
            entran en vigor al publicarse en esta página. El uso continuado del
            servicio después de un cambio implica aceptación de los nuevos
            términos.
          </p>

          <h2>9. Ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República de Chile. Cualquier
            disputa será resuelta en los tribunales competentes de Santiago de Chile.
          </p>

          <h2>10. Contacto</h2>
          <p>
            Para consultas sobre estos términos, escríbenos a{" "}
            <a href="mailto:contacto@margenreal.io" style={{ color: "var(--accent)" }}>
              contacto@margenreal.io
            </a>
            .
          </p>

          <hr className="divider" />
          <p style={{ fontSize: 13, color: "var(--muted2)" }}>
            Al usar margenreal.io aceptas estos términos en su totalidad. Si tienes
            dudas, contáctanos antes de usar el servicio.
          </p>
        </div>

        <footer>
          <a className="footer-logo" href="/">
            margen<span>real</span>
          </a>
          <div className="footer-links">
            <a className="footer-link" href="/">
              Inicio
            </a>
            <a className="footer-link" href="/tool">
              Herramienta
            </a>
            <a className="footer-link" href="/privacy">
              Privacidad
            </a>
            <a className="footer-link" href="mailto:contacto@margenreal.io">
              Contacto
            </a>
          </div>
          <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
        </footer>
      </div>

      <style jsx>{`
        .legal-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 60px 40px 80px;
        }
        @media (max-width: 640px) {
          .legal-wrap {
            padding: 40px 20px 60px;
          }
        }
        .legal-wrap h1 {
          font-family: var(--font-display);
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 800;
          margin-bottom: 8px;
        }
        .legal-date {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 48px;
        }
        .legal-wrap h2 {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          margin: 36px 0 12px;
          color: var(--text);
        }
        .legal-wrap p {
          font-size: 15px;
          color: #b0b0cc;
          line-height: 1.8;
          margin-bottom: 14px;
        }
        .legal-wrap ul {
          padding-left: 20px;
          margin-bottom: 14px;
        }
        .legal-wrap ul li {
          font-size: 15px;
          color: #b0b0cc;
          line-height: 1.8;
          margin-bottom: 6px;
        }
        .legal-wrap strong {
          color: var(--text);
        }
        .highlight-box {
          background: rgba(255, 75, 75, 0.06);
          border: 1px solid rgba(255, 75, 75, 0.2);
          border-radius: 12px;
          padding: 20px 24px;
          margin: 28px 0;
        }
        .highlight-box p {
          color: var(--text);
          margin: 0;
          font-size: 15px;
          line-height: 1.7;
        }
        .divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 36px 0;
        }
      `}</style>
    </>
  );
}
