import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function PrivacyPage(): React.JSX.Element {
  return (
    <>
      <Head>
        <title>Privacidad — margenreal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <nav>
        <Link className="nav-logo" href="/">
          margen<span>real</span>
        </Link>
        <div className="nav-links">
          <Link className="nav-link" href="/">
            Inicio
          </Link>
          <Link className="nav-link" href="/tool">Herramienta Gratis</Link>
          <Link className="nav-link" href="/pro">Herramienta Pro</Link>
          <Link className="nav-link" href="/pricing">
            Planes
          </Link>
          <Link className="nav-link" href="/about">
            Nosotros
          </Link>
        </div>
        <Link className="btn nav-cta" href="/tool">
          Diagnosticar mi negocio →
        </Link>
      </nav>

      <div className="page-wrap">
        <div className="legal-wrap">
          <div className="label">Legal</div>
          <h1>Política de Privacidad</h1>
          <div className="legal-date">Última actualización: enero 2025</div>

          <div className="highlight-box">
            <p>
              🔒 <strong>Resumen en una línea:</strong> tus números financieros se
              calculan completamente en tu navegador. No los enviamos, no los
              guardamos, no los vemos. Nunca.
            </p>
          </div>

          <h2>1. Quiénes somos</h2>
          <p>
            margenreal.io es una herramienta de diagnóstico financiero para
            pequeñas y medianas empresas en América Latina. Nuestro objetivo es
            ayudarte a entender la salud de tu negocio de forma simple, rápida y
            privada.
          </p>

          <h2>2. Qué información recopilamos</h2>
          <p>
            <strong>Datos financieros de la calculadora:</strong> ninguno. Todo el
            procesamiento de los números que ingresas en la herramienta (ventas,
            costos, caja, etc.) ocurre directamente en tu navegador. Estos datos
            nunca salen de tu dispositivo ni llegan a nuestros servidores.
          </p>
          <p>
            <strong>Datos de navegación:</strong> podemos recopilar información
            técnica básica y anónima como el tipo de navegador, el país de
            acceso y las páginas visitadas, con el único fin de entender cómo se
            usa el sitio y mejorar la experiencia. Esta información no contiene
            datos personales identificables.
          </p>
          <p>
            <strong>Correo electrónico:</strong> si nos contactas por email o te
            registras en una lista de espera, guardamos tu dirección de correo
            únicamente para responder a tu consulta o avisarte sobre
            actualizaciones del producto.
          </p>

          <h2>3. Cómo usamos la información</h2>
          <ul>
            <li>Para hacer funcionar y mejorar la herramienta</li>
            <li>Para entender patrones de uso de forma agregada y anónima</li>
            <li>Para comunicarnos contigo si nos escribiste o dejaste tu email</li>
            <li>Nunca para vender datos a terceros</li>
            <li>Nunca para publicidad dirigida</li>
          </ul>

          <h2>4. Cookies y tecnologías similares</h2>
          <p>
            Podemos usar cookies técnicas básicas para el funcionamiento del sitio.
            No usamos cookies de seguimiento publicitario ni compartimos datos con
            redes de publicidad.
          </p>

          <h2>5. Compartir información con terceros</h2>
          <p>
            No vendemos, arrendamos ni compartimos tu información personal con
            terceros, excepto en los siguientes casos limitados:
          </p>
          <ul>
            <li>
              <strong>Proveedores de infraestructura:</strong> servicios de
              hosting (como Vercel) que procesan datos técnicos para operar el
              sitio, bajo sus propias políticas de privacidad.
            </li>
            <li>
              <strong>Obligación legal:</strong> si una autoridad competente nos
              lo requiere legalmente.
            </li>
          </ul>

          <h2>6. Seguridad</h2>
          <p>
            Dado que los datos financieros que ingresas nunca salen de tu
            navegador, el riesgo de exposición es mínimo por diseño. Tomamos
            medidas razonables para proteger cualquier información que sí
            procesemos en nuestros sistemas.
          </p>

          <h2>7. Tus derechos</h2>
          <p>
            Tienes derecho a acceder, corregir o eliminar cualquier dato personal
            que podamos tener sobre ti. Para ejercer estos derechos, contáctanos
            en{" "}
            <a href="mailto:contacto@margenreal.io" style={{ color: "var(--accent)" }}>
              contacto@margenreal.io
            </a>
            .
          </p>

          <h2>8. Menores de edad</h2>
          <p>
            Esta herramienta no está dirigida a personas menores de 18 años. No
            recopilamos intencionalmente información de menores.
          </p>

          <h2>9. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política ocasionalmente. Si hacemos cambios
            significativos, lo indicaremos en esta página con una nueva fecha de
            actualización. Te recomendamos revisarla periódicamente.
          </p>

          <h2>10. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política de privacidad, escríbenos a{" "}
            <a href="mailto:contacto@margenreal.io" style={{ color: "var(--accent)" }}>
              contacto@margenreal.io
            </a>
            .
          </p>

          <hr className="divider" />
          <p style={{ fontSize: 13, color: "var(--muted2)" }}>
            Esta política aplica al sitio web margenreal.io y sus subdominios. Al
            usar la herramienta, aceptas los términos descritos en este documento.
          </p>
        </div>

        <footer>
          <Link className="footer-logo" href="/">
            margen<span>real</span>
          </Link>
          <div className="footer-links">
            <Link className="footer-link" href="/">
              Inicio
            </Link>
            <Link className="footer-link" href="/tool">
              Herramienta
            </Link>
            <Link className="footer-link" href="/terms">
              Términos
            </Link>
            <a className="footer-link" href="mailto:contacto@margenreal.io">
              Contacto
            </a>
          </div>
          <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
        </footer>
      </div>

      <style>{`
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
          background: rgba(232, 255, 71, 0.06);
          border: 1px solid rgba(232, 255, 71, 0.2);
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
