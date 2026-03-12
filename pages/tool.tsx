import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import React, { useEffect } from "react";

export default function ToolPage(): React.JSX.Element {
  useEffect(() => {
    // Ensure empty-state is visible on mount
    const empty = document.getElementById("sEmpty");
    const results = document.getElementById("sResults");
    if (empty) empty.style.display = "flex";
    if (results) results.classList.remove("show");
  }, []);

  // Read inputs (keeps same IDs as original so existing calculator.js can read/write)
  function sInputs() {
    return {
      revenue: parseFloat((document.getElementById("s_rev") as HTMLInputElement)?.value || "0") || 0,
      marginPct: parseFloat((document.getElementById("s_mg") as HTMLInputElement)?.value || "0") || 0,
      fixedCosts: parseFloat((document.getElementById("s_fc") as HTMLInputElement)?.value || "0") || 0,
      cash: parseFloat((document.getElementById("s_cash") as HTMLInputElement)?.value || "0") || 0,
      debt: parseFloat((document.getElementById("s_debt") as HTMLInputElement)?.value || "0") || 0,
      arDays: parseFloat((document.getElementById("s_ar") as HTMLInputElement)?.value || "0") || 0,
      apDays: parseFloat((document.getElementById("s_ap") as HTMLInputElement)?.value || "0") || 0,
    };
  }

  // Trigger calculation — expects a global `calculate` and `renderResults` to exist (from /public/js/calculator.js)
  function sCalc() {
    // @ts-ignore - calculate comes from the external script in public/js/calculator.js
    const calculate = (window as any).calculate;
    const renderResults = (window as any).renderResults;
    if (typeof calculate !== "function" || typeof renderResults !== "function") {
      // If the external script isn't loaded, show a basic alert
      alert("La calculadora aún no está lista. Asegúrate de tener /js/calculator.js disponible.");
      return;
    }
    const r = calculate(sInputs());
    renderResults("s", r);
    const sResults = document.getElementById("sResults");
    const sEmpty = document.getElementById("sEmpty");
    if (sResults) sResults.classList.add("show");
    if (sEmpty) (sEmpty.style as any).display = "none";
  }

  function sReset() {
    const ids = ["s_rev", "s_mg", "s_fc", "s_cash", "s_debt", "s_ar", "s_ap"];
    ids.forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = "";
    });
    const sResults = document.getElementById("sResults");
    const sEmpty = document.getElementById("sEmpty");
    if (sResults) sResults.classList.remove("show");
    if (sEmpty) (sEmpty.style as any).display = "flex";
  }

  return (
    <>
      <Head>
        <title>Herramienta — margenreal</title>
        <meta name="description" content="Diagnóstico financiero para tu PyME en 3 minutos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Load your calculator script from public/js/calculator.js */}
      <Script src="/js/calculator.js" strategy="lazyOnload" />

      <nav>
        <Link className="nav-logo" href="/">
          margen<span>real</span>
        </Link>
        <div className="nav-links">
          <Link className="nav-link" href="/">
            Inicio
          </Link>
          <Link className="nav-link" href="/tool">
            Herramienta Gratis
          </Link>
          <Link className="nav-link" href="/pro">
            Herramienta Pro
          </Link>
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
        <div className="tool-header">
          <div className="label">Diagnóstico financiero</div>
          <h1>Conoce si tu negocio
            <br />
            va a sobrevivir.</h1>
          <p className="sub">7 variables · 3 minutos · Diagnóstico real</p>
        </div>

        <div className="single-wrap">
          <div className="tool-grid">
            {/* Left: inputs */}
            <div className="inputs-card">
              <h3>Datos de tu negocio</h3>

              <div className="sf">
                <label>Ventas mensuales</label>
                <input type="number" id="s_rev" placeholder="0" />
              </div>

              <div className="sf">
                <label>Margen bruto (%)</label>
                <input type="number" id="s_mg" placeholder="40" />
              </div>

              <div className="sf">
                <label>Costos fijos mensuales</label>
                <input type="number" id="s_fc" placeholder="0" />
              </div>

              <div className="sf-row">
                <div className="sf">
                  <label>Caja disponible</label>
                  <input type="number" id="s_cash" placeholder="0" />
                </div>
                <div className="sf">
                  <label>Deuda mensual</label>
                  <input type="number" id="s_debt" placeholder="0" />
                </div>
              </div>

              <div className="sf-row">
                <div className="sf">
                  <label>Días para cobrar</label>
                  <input type="number" id="s_ar" placeholder="30" />
                </div>
                <div className="sf">
                  <label>Días para pagar</label>
                  <input type="number" id="s_ap" placeholder="30" />
                </div>
              </div>

              <button className="btn-calc" onClick={sCalc}>
                Calcular diagnóstico →
              </button>
              <button className="btn-reset" onClick={sReset}>
                Limpiar campos
              </button>
            </div>

            {/* Right: results */}
            <div>
              <div className="results-panel" id="sResults">
                <div id="sScore" />
                <div className="metrics-grid" id="sMetrics" />
                <div className="chart-card">
                  <div className="chart-lbl">Proyección de caja — 3 escenarios</div>
                  <div id="sChart" />
                </div>
                <div className="sens-row" id="sSens" />
                <div className="diag-card" id="sDiag" />
                <div className="pro-upsell">
                  <div className="pro-upsell-left">
                    <div className="pro-upsell-label">✦ Herramienta Pro</div>
                    <div className="pro-upsell-title">¿Quieres ir más profundo?</div>
                    <div className="pro-upsell-text">Simuladores de escenarios, forecast a 24 meses, análisis de palancas con IA y más.</div>
                  </div>
                  <Link href="/pro" className="btn pro-upsell-btn">
                    Probar Pro gratis →
                  </Link>
                </div>
              </div>

              <div className="empty-state" id="sEmpty">
                <div className="es-icon">📊</div>
                <div className="es-title">Tu diagnóstico aparece aquí</div>
                <div className="es-text">
                  Completa los datos a la izquierda
                  <br />
                  y presiona <strong style={{ color: "var(--text)" }}>Calcular diagnóstico</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page-specific styles (keeps most layout identical to your original) */}
      <style>{`
        /* ── Page header ── */
        .tool-header {
          padding: 56px 40px 32px;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }
        @media (max-width: 640px) {
          .tool-header {
            padding: 40px 20px 24px;
          }
        }
        .tool-header h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1.15;
          margin-bottom: 12px;
        }
        .tool-header .sub {
          font-size: 1rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* ── SINGLE PAGE ── */
        .single-wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 16px 40px 80px;
        }
        @media (max-width: 640px) {
          .single-wrap {
            padding: 16px 20px 60px;
          }
        }

        .tool-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .tool-grid {
            grid-template-columns: 1fr;
          }
        }

        .inputs-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          position: sticky;
          top: 80px;
        }
        .inputs-card h3 {
          font-family: var(--font-display);
          font-size: 1.0625rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 22px;
          line-height: 1;
        }

        .sf {
          margin-bottom: 16px;
        }
        .sf label {
          display: block;
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 7px;
          line-height: 1;
        }
        .sf input {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.2;
          padding: 11px 14px;
          border-radius: 9px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -moz-appearance: textfield;
        }
        .sf input::-webkit-outer-spin-button,
        .sf input::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
        .sf input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(245, 240, 232, 0.07);
        }
        .sf input::placeholder {
          color: var(--border2);
        }
        .sf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .btn-calc {
          width: 100%;
          margin-top: 20px;
          background: var(--accent);
          color: #0a0a0e;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.9375rem;
          line-height: 1;
          padding: 15px;
          border-radius: 11px;
          border: none;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
        }
        .btn-calc:hover {
          box-shadow: 0 6px 24px rgba(245, 240, 232, 0.15);
          transform: translateY(-1px);
        }

        .btn-reset {
          width: 100%;
          margin-top: 8px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 10px;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reset:hover {
          border-color: var(--muted2);
          color: var(--text);
        }

        .results-panel {
          display: none;
        }
        .results-panel.show {
          display: block;
          animation: fadeUp 0.4s ease both;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 32px;
          border: 1.5px dashed var(--border2);
          border-radius: 16px;
          color: var(--muted);
        }
        .es-icon {
          font-size: 3rem;
          margin-bottom: 18px;
          opacity: 0.6;
        }
        .es-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .es-text {
          font-size: 0.9375rem;
          color: var(--muted);
          line-height: 1.6;
        }
        .pro-upsell {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
          margin-top: 16px; padding: 24px 28px;
          background: rgba(249,215,27,.04);
          border: 1px solid rgba(249,215,27,.15);
          border-radius: 14px;
        }
        .pro-upsell-left { flex: 1; min-width: 200px; }
        .pro-upsell-label {
          font-size: 0.625rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 6px;
        }
        .pro-upsell-title {
          font-family: var(--font-display); font-size: 1rem; font-weight: 800;
          color: var(--text); margin-bottom: 6px; letter-spacing: -0.02em;
        }
        .pro-upsell-text { font-size: 0.8125rem; color: var(--muted); line-height: 1.6; }
        .pro-upsell-btn {
          background: var(--accent); color: #080810;
          font-family: var(--font-display); font-weight: 800;
          font-size: 0.875rem; padding: 12px 20px;
          border-radius: 10px; white-space: nowrap;
          text-decoration: none; flex-shrink: 0;
        }
        .pro-upsell-btn:hover { background: #fff; text-decoration: none; }
      `}</style>
    </>
  );
}
