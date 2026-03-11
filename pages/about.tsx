import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function AboutPage(): React.JSX.Element {
  return (
    <>
      <Head>
        <title>Nosotros — margenreal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="page-wrap">
        <nav>
          <Link className="nav-logo" href="/">
            margen<span>real</span>
          </Link>
          <div className="nav-links">
            <Link className="nav-link" href="/">Inicio</Link>
            <Link className="nav-link" href="/tool">Herramienta</Link>
            <Link className="nav-link" href="/pricing">Planes</Link>
            <Link className="nav-link active" href="/about">Nosotros</Link>
          </div>
          <Link className="btn nav-cta" href="/tool">Diagnosticar mi negocio →</Link>
        </nav>

        <section className="section">
          <div className="label">Nuestra misión</div>
          <h1 className="heading">Claridad financiera<br/>para cada PyME en LatAm.</h1>

          <div className="about-grid">
            <div className="about-text">
              <p>
                La mayoría de los dueños de negocios en LatAm <strong>no ignoran los números porque son descuidados.</strong> Los ignoran porque se sienten abrumados.
              </p>
              <p>Se despiertan pensando en vender más, en tener caja hoy, en apagar el próximo incendio. No en modelos financieros.</p>
              <p><strong>El problema real no es falta de datos. Es falta de claridad.</strong></p>
              <p>margenreal nació para cambiar eso. No somos un software de contabilidad — somos una capa de decisión. Tomamos los números que ya tienes y los convertimos en respuestas concretas.</p>
              <p>Empezamos en LatAm porque aquí el problema es más urgente y las soluciones existentes están diseñadas para otro tipo de empresa, en otro contexto.</p>

              <div className="values-grid">
                <div className="value-item">
                  <div className="vi-icon">🎯</div>
                  <div>
                    <div className="vi-title">Claridad sobre complejidad</div>
                    <div className="vi-text">Menos variables, más insights. Si no puedes explicarlo en una oración, no debería estar en la pantalla.</div>
                  </div>
                </div>

                <div className="value-item">
                  <div className="vi-icon">🛡️</div>
                  <div>
                    <div className="vi-title">Privacidad sin negociación</div>
                    <div className="vi-text">Tus números se calculan en tu navegador. No los guardamos, no los usamos, no los vendemos.</div>
                  </div>
                </div>

                <div className="value-item">
                  <div className="vi-icon">🌎</div>
                  <div>
                    <div className="vi-title">Construido para LatAm</div>
                    <div className="vi-text">No una traducción de un producto gringo. Una herramienta que entiende el contexto, el idioma y los desafíos reales de la región.</div>
                  </div>
                </div>

                <div className="value-item">
                  <div className="vi-icon">⚡</div>
                  <div>
                    <div className="vi-title">Velocidad de decisión</div>
                    <div className="vi-text">Los negocios pequeños no pueden esperar el informe trimestral. La claridad debe ser instantánea.</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="quote-card">
                <blockquote>"En 3 minutos, saber si tu negocio va a sobrevivir y <em>exactamente qué cambiar</em>."</blockquote>
                <div className="quote-attr">— La promesa central de margenreal</div>
              </div>

              <div className="stats-card">
                <div className="stats-card-title">El problema en números</div>

                <div className="stat-row">
                  <div className="stat-row-label">PyMEs en LatAm sin acceso a análisis financiero real</div>
                  <div className="stat-row-val" style={{ color: "var(--accent)" }}>~80%</div>
                </div>

                <div className="stat-row">
                  <div className="stat-row-label">PyMEs que cierran por problemas de caja, no de ventas</div>
                  <div className="stat-row-val" style={{ color: "var(--danger)" }}>60%</div>
                </div>

                <div className="stat-row">
                  <div className="stat-row-label">Tiempo promedio para completar el diagnóstico</div>
                  <div className="stat-row-val" style={{ color: "var(--success)" }}>3 min</div>
                </div>

                <div className="stat-row">
                  <div className="stat-row-label">Variables necesarias (sin contabilidad)</div>
                  <div className="stat-row-val" style={{ color: "var(--text)" }}>7</div>
                </div>
              </div>
            </div>
          </div>

          <div className="roadmap">
            <div className="label">Roadmap</div>
            <h2 className="heading">Hacia dónde vamos.</h2>

            <div className="rm-list">
              <div className="rm-item">
                <div>
                  <div className="rm-phase">Fase 0</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>0–3 meses</div>
                </div>
                <div>
                  <div className="rm-title">Validación</div>
                  <div className="rm-text">Entrevistar 20 dueños de PyMEs. Lanzar herramienta beta. Conseguir los primeros 50 usuarios activos. Medir tasa de completación.</div>
                </div>
              </div>

              <div className="rm-item">
                <div>
                  <div className="rm-phase">Fase 1</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>3–6 meses</div>
                </div>
                <div>
                  <div className="rm-title">MVP y crecimiento</div>
                  <div className="rm-text">Herramienta de supervivencia pulida. 1.000 usuarios. Refinamiento de UX. Validar disposición a pagar.</div>
                </div>
              </div>

              <div className="rm-item">
                <div>
                  <div className="rm-phase">Fase 2</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>6–12 meses</div>
                </div>
                <div>
                  <div className="rm-title">Monetización</div>
                  <div className="rm-text">Lanzamiento del plan Pro. Primeras alianzas con instituciones financieras. Desarrollo del score financiero para PyMEs.</div>
                </div>
              </div>

              <div className="rm-item">
                <div>
                  <div className="rm-phase">Fase 3</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>12–24 meses</div>
                </div>
                <div>
                  <div className="rm-title">Sistema financiero completo</div>
                  <div className="rm-text">P&L automático. Flujo de caja. Benchmarks sectoriales. Integración bancaria. Score financiero estandarizado para conectar PyMEs con financiamiento.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 64, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 20, padding: "48px 32px" }}>
            <div className="label" style={{ textAlign: "center" }}>¿Quieres hablar?</div>
            <h2 className="heading" style={{ marginBottom: 12 }}>Estamos construyendo esto<br/>con los usuarios.</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.7 }}>
              Si eres dueño de una PyME en LatAm y quieres ser beta tester, o si tienes feedback, escríbenos.
            </p>
            <a className="btn btn-primary" href="mailto:contacto@margenreal.io">contacto@margenreal.io</Link>
          </div>
        </section>

        <footer>
          <Link className="footer-logo" href="/">margen<span>real</span></Link>
          <div className="footer-links">
            <Link className="footer-link" href="/">Inicio</Link>
            <Link className="footer-link" href="/tool">Herramienta</Link>
            <Link className="footer-link" href="/pricing">Planes</Link>
            <Link className="footer-link" href="/privacy">Privacidad</Link>
            <Link className="footer-link" href="/terms">Términos</Link>
            <a className="footer-link" href="mailto:contacto@margenreal.io">Contacto</a>
          </div>
          <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
        </footer>
      </div>
    </>
  );
}
