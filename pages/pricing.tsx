import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function PricingPage(): React.JSX.Element {
  return (
    <>
      <Head>
        <title>Planes — margenreal</title>
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
          <Link className="nav-link" href="/tool">
            Herramienta
          </Link>
          <Link className="nav-link active" href="/pricing">
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
        <section className="section">
          <div className="label">Planes</div>
          <h1 className="heading">
            Empieza gratis.
            <br />
            Crece cuando estés listo.
          </h1>
          <p className="subtext" style={{ marginTop: 12 }}>
            Durante la fase beta, la herramienta es 100% gratuita. Los planes de
            pago estarán disponibles con las funciones avanzadas.
          </p>

          <div className="pricing-grid">
            <div className="plan">
              <div className="plan-name">Gratis</div>
              <div className="plan-price">
                $0<sub>/mes</sub>
              </div>
              <div className="plan-desc">
                Para dueños que quieren claridad financiera básica ahora mismo.
              </div>
              <ul className="plan-features">
                <li>Diagnóstico de supervivencia</li>
                <li>Runway de caja</li>
                <li>Punto de equilibrio</li>
                <li>Sensibilidad ante caídas</li>
                <li>Diagnóstico gerencial automático</li>
                <li>Modo paso a paso + todo en uno</li>
                <li className="off">Escenarios múltiples</li>
                <li className="off">Exportar PDF</li>
                <li className="off">Benchmarks sectoriales</li>
              </ul>
              <Link className="btn-plan btn-plan-outline" href="/tool">
                Empezar gratis
              </Link>
            </div>

            <div className="plan featured">
              <div className="plan-tag">PRÓXIMAMENTE</div>
              <div className="plan-name">Pro</div>
              <div className="plan-price">
                <sup>$</sup>19<sub>/mes</sub>
              </div>
              <div className="plan-desc">
                Para dueños que quieren tomar mejores decisiones cada semana.
              </div>
              <ul className="plan-features">
                <li>Todo lo del plan Gratis</li>
                <li>Escenarios múltiples</li>
                <li>Exportar PDF profesional</li>
                <li>Historial y seguimiento mensual</li>
                <li>Benchmarks sectoriales</li>
                <li>Alertas automáticas</li>
                <li className="off">Módulo de nómina</li>
                <li className="off">Integración bancaria</li>
              </ul>
              <button
                className="btn-plan btn-plan-accent"
                onClick={() => alert("¡Te avisaremos cuando esté listo!")}
              >
                Notificarme →
              </button>
            </div>

            <div className="plan">
              <div className="plan-name">Empresa</div>
              <div className="plan-price">
                <sup>$</sup>79<sub>/mes</sub>
              </div>
              <div className="plan-desc">
                Para asesores, contadores y multi-empresas.
              </div>
              <ul className="plan-features">
                <li>Todo lo del plan Pro</li>
                <li>Hasta 10 empresas</li>
                <li>Módulo de nómina</li>
                <li>Integración ERP / bancaria</li>
                <li>Score financiero exportable</li>
                <li>Soporte prioritario</li>
                <li>White-label disponible</li>
              </ul>
              <a className="btn-plan btn-plan-outline" href="mailto:contacto@margenreal.io">
                Contactar →
              </Link>
            </div>
          </div>

          <p className="pricing-note">
            Precios referenciales en USD · Pueden cambiar antes del lanzamiento
            oficial
          </p>

          {/* Compare table */}
          <div style={{ marginTop: 64 }}>
            <div className="label">Comparar planes</div>
            <h2 className="heading" style={{ marginBottom: 0 }}>
              ¿Qué incluye cada uno?
            </h2>
            <div style={{ overflowX: "auto", marginTop: 24 }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Funcionalidad</th>
                    <th>Gratis</th>
                    <th>Pro</th>
                    <th>Empresa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Diagnóstico de supervivencia</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                  </tr>
                  <tr>
                    <td>Runway y punto de equilibrio</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                  </tr>
                  <tr>
                    <td>Sensibilidad ante caídas</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                  </tr>
                  <tr>
                    <td>Diagnóstico gerencial automático</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                    <td className="yes">✓</td>
                  </tr>
                  <tr>
                    <td>Escenarios múltiples</td>
                    <td className="no">—</td>
                    <td className="soon">Pronto</td>
                    <td className="soon">Pronto</td>
                  </tr>
                  <tr>
                    <td>Exportar PDF</td>
                    <td className="no">—</td>
                    <td className="soon">Pronto</td>
                    <td className="soon">Pronto</td>
                  </tr>
                  <tr>
                    <td>Benchmarks sectoriales</td>
                    <td className="no">—</td>
                    <td className="soon">Pronto</td>
                    <td className="soon">Pronto</td>
                  </tr>
                  <tr>
                    <td>Historial mensual</td>
                    <td className="no">—</td>
                    <td className="soon">Pronto</td>
                    <td className="soon">Pronto</td>
                  </tr>
                  <tr>
                    <td>Múltiples empresas</td>
                    <td className="no">—</td>
                    <td className="no">—</td>
                    <td className="soon">Pronto</td>
                  </tr>
                  <tr>
                    <td>Integración bancaria / ERP</td>
                    <td className="no">—</td>
                    <td className="no">—</td>
                    <td className="soon">Pronto</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

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
            <Link className="footer-link" href="/about">
              Nosotros
            </Link>
            <Link className="footer-link" href="/privacy">
              Privacidad
            </Link>
            <Link className="footer-link" href="/terms">
              Términos
            </Link>
            <a className="footer-link" href="mailto:contacto@margenreal.io">
              Contacto
            </Link>
          </div>
          <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
        </footer>
      </div>

      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-top: 48px;
        }
        .plan {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          position: relative;
          transition: transform 0.2s, border 0.2s;
        }
        .plan:hover {
          transform: translateY(-4px);
        }
        .plan.featured {
          border-color: var(--accent);
          background: #111108;
        }
        .plan-tag {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #080810;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 800;
          padding: 4px 16px;
          border-radius: 99px;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .plan-name {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .plan-price {
          font-family: var(--font-display);
          font-size: 46px;
          font-weight: 800;
          line-height: 1;
          margin: 16px 0 4px;
        }
        .plan-price sup {
          font-size: 20px;
          vertical-align: top;
          margin-top: 10px;
          display: inline-block;
          color: var(--muted);
        }
        .plan-price sub {
          font-size: 14px;
          font-family: var(--font-body);
          color: var(--muted);
          font-weight: 400;
        }
        .plan-desc {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .plan-features {
          list-style: none;
          margin-bottom: 28px;
          display: grid;
          gap: 10px;
          padding: 0;
        }
        .plan-features li {
          font-size: 13px;
          color: #b8b8d0;
          display: flex;
          gap: 10px;
          align-items: start;
          line-height: 1.5;
        }
        .plan-features li::before {
          content: "✓";
          color: var(--accent);
          font-weight: 700;
          flex-shrink: 0;
        }
        .plan-features li.off::before {
          content: "—";
          color: var(--muted2);
        }
        .plan-features li.off {
          color: var(--muted2);
        }
        .btn-plan {
          width: 100%;
          padding: 14px;
          border-radius: 11px;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .btn-plan-accent {
          background: var(--accent);
          color: #080810;
          border: none;
        }
        .btn-plan-accent:hover {
          box-shadow: 0 6px 24px rgba(232, 255, 71, 0.25);
        }
        .btn-plan-outline {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--text);
        }
        .btn-plan-outline:hover {
          border-color: var(--muted);
          background: var(--surface2);
        }
        .pricing-note {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--muted);
        }
        .compare-table {
          width: 100%;
          margin-top: 48px;
          border-collapse: collapse;
          font-size: 14px;
        }
        .compare-table th {
          font-family: var(--font-display);
          font-weight: 700;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .compare-table td {
          padding: 13px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
        }
        .compare-table tr:last-child td {
          border-bottom: none;
        }
        .compare-table td:first-child {
          color: var(--text);
        }
        .compare-table .yes {
          color: var(--success);
          font-weight: 600;
        }
        .compare-table .no {
          color: var(--muted2);
        }
        .compare-table .soon {
          color: var(--warning);
          font-size: 12px;
        }

        /* small responsive tweak */
        @media (max-width: 640px) {
          .pricing-grid {
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}
