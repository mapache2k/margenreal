/* ═══════════════════════════════════════
   margenreal.io — Calculator Logic
   Import this in tool.html:
   <script src="/js/calculator.js"></script>
═══════════════════════════════════════ */

/* ─── HELPERS ─── */
const g = id => parseFloat(document.getElementById(id)?.value) || 0;

function fmt(n) {
  if (!isFinite(n)) return '∞';
  const abs = Math.abs(n);
  let s;
  if      (abs >= 1_000_000) s = (n / 1_000_000).toFixed(1) + 'M';
  else if (abs >= 1_000)     s = (n / 1_000).toFixed(0) + 'K';
  else                       s = Math.round(n).toString();
  return s;
}

/* ─── CORE CALCULATION ─── */
function calculate(inputs) {
  const { revenue, marginPct, fixedCosts, cash, debt, arDays, apDays } = inputs;

  const grossProfit  = revenue * (marginPct / 100);
  const ebitda       = grossProfit - fixedCosts;
  const freeCashFlow = ebitda - debt;
  const breakeven    = marginPct > 0 ? (fixedCosts + debt) / (marginPct / 100) : Infinity;
  const monthlyBurn  = freeCashFlow < 0 ? Math.abs(freeCashFlow) : 0;
  const runway       = monthlyBurn > 0 ? cash / monthlyBurn : Infinity;
  const wcGap        = arDays - apDays;
  const ebitda10     = (revenue * 0.9 * (marginPct / 100)) - fixedCosts - debt;
  const ebitda20     = (revenue * 0.8 * (marginPct / 100)) - fixedCosts - debt;

  // 6-month cash projection
  const projection = [];
  let runningCash = cash;
  for (let m = 0; m < 6; m++) {
    runningCash += freeCashFlow;
    projection.push(runningCash);
  }

  // Health score 0–100
  let score = 0;
  if (ebitda > 0)             score += 30;
  if (runway > 6 || ebitda > 0) score += 20;
  if (marginPct >= 30)        score += 20;
  if (ebitda10 > 0)           score += 15;
  if (wcGap <= 0)             score += 15;

  return { revenue, marginPct, grossProfit, fixedCosts, ebitda, freeCashFlow,
           breakeven, runway, cash, debt, wcGap, arDays, apDays,
           ebitda10, ebitda20, projection, score };
}

/* ─── DIAGNOSIS ENGINE ─── */
function buildDiagnosis(r) {
  const items = [];

  // Margin
  if (r.marginPct < 20) {
    items.push({ icon: '🔴', text: `<strong>Margen muy ajustado (${r.marginPct.toFixed(0)}%).</strong> Incluso duplicar ventas generará poco valor real. Es urgente revisar precios o reducir costos variables antes de crecer.` });
  } else if (r.marginPct < 35) {
    items.push({ icon: '🟡', text: `<strong>Margen moderado (${r.marginPct.toFixed(0)}%).</strong> El negocio funciona, pero el crecimiento no compensa rápido. Un +5% en margen impacta más que +20% en ventas.` });
  } else {
    items.push({ icon: '🟢', text: `<strong>Margen sólido (${r.marginPct.toFixed(0)}%).</strong> Cada venta adicional tiene buen impacto. El foco debe estar en escalar volumen, no en optimizar costos.` });
  }

  // Fixed cost leverage
  const coverageRatio = r.marginPct > 0 ? r.grossProfit / (r.fixedCosts || 1) : 0;
  if (coverageRatio < 1) {
    items.push({ icon: '⚠️', text: `<strong>Costos fijos demasiado altos para tu nivel de ventas.</strong> Necesitas ${fmt(r.breakeven)} solo para cubrirlos. Reducir fijos en 10% mejoraría el resultado en <strong>${fmt(r.fixedCosts * 0.1)}</strong> al mes.` });
  } else if (coverageRatio < 1.5) {
    items.push({ icon: '🔶', text: `<strong>Estructura de costos con poco margen de error.</strong> Una caída del 15% en ventas te llevaría a pérdida operacional. Revisa si hay costos fijos prescindibles.` });
  }

  // Working capital
  if (r.wcGap > 30) {
    items.push({ icon: '⏳', text: `<strong>Estás financiando a tus clientes por ${r.wcGap} días.</strong> Cobras tarde, pagas rápido. Inmoviliza caja aunque seas rentable. Reducir días de cobro en 15 días liberaría ~${fmt(r.revenue * 0.5 / 30 * 15)} de caja.` });
  } else if (r.wcGap <= 0) {
    items.push({ icon: '✅', text: `<strong>Tu ciclo de caja es favorable.</strong> Pagas después de cobrar (${Math.abs(r.wcGap)} días a favor). Puedes crecer sin necesitar capital adicional.` });
  }

  // Survival
  if (r.ebitda < 0 && r.runway < 3) {
    items.push({ icon: '🚨', text: `<strong>Menos de 3 meses de caja disponible.</strong> Prioridad número uno: extender el runway. Reduce costos fijos, acelera cobros o consigue liquidez inmediata.` });
  } else if (r.ebitda > 0 && r.ebitda20 < 0) {
    items.push({ icon: '🛡️', text: `<strong>Rentable hoy, pero frágil ante caídas.</strong> Un -20% en ventas te pone en pérdida. Construye una reserva de 2–3 meses de costos fijos.` });
  } else if (r.ebitda > 0 && r.ebitda20 > 0) {
    items.push({ icon: '💪', text: `<strong>Tu negocio resiste una caída del 20% y sigue siendo rentable.</strong> Tienes base para crecer. Identifica qué palanca tiene mayor retorno: volumen, precio o margen.` });
  }

  return items;
}

/* ─── RENDER HELPERS ─── */
function renderScoreBadge(containerId, score) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let cls, dot, label;
  if (score >= 70) { cls = 'healthy'; dot = 'var(--green)';  label = 'Negocio saludable'; }
  else if (score >= 40) { cls = 'warning'; dot = 'var(--yellow)'; label = 'Señales de alerta'; }
  else              { cls = 'danger';  dot = 'var(--red)';   label = 'Zona de riesgo'; }
  el.innerHTML = `
    <div class="score-bar ${cls}">
      <span class="score-dot" style="background:${dot}"></span>
      <span class="score-text">${label}</span>
      <span class="score-num">Score ${score}/100</span>
    </div>`;
}

function renderMetrics(containerId, r) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const eClass  = r.ebitda >= 0 ? 'g' : 'r';
  const rwClass = r.ebitda >= 0 ? 'h' : (r.runway > 6 ? 'y' : 'r');
  const rwVal   = r.ebitda >= 0 ? '∞' : (r.runway < 0.5 ? '< 1' : r.runway.toFixed(1));
  const beClass = r.revenue >= r.breakeven ? 'g' : 'y';
  const wcClass = r.wcGap <= 0 ? 'g' : r.wcGap <= 15 ? '' : 'y';
  const runwayBarColor = r.runway < 3 ? 'var(--red)' : r.runway < 6 ? 'var(--yellow)' : 'var(--green)';

  el.innerHTML = `
    <div class="m-card ${eClass}">
      <div class="m-lbl">Resultado operacional</div>
      <div class="m-val">${r.ebitda >= 0 ? '+' : ''}${fmt(r.ebitda)}</div>
      <div class="m-sub">${r.ebitda >= 0 ? 'Por encima del punto de equilibrio' : 'Estás perdiendo dinero cada mes'}</div>
    </div>
    <div class="m-card ${rwClass}">
      <div class="m-lbl">Meses de runway</div>
      <div class="m-val">${rwVal}</div>
      <div class="m-sub">${r.ebitda >= 0 ? 'Con este ritmo no quemas caja' : 'Tiempo antes de quedarte sin caja'}</div>
      ${r.ebitda < 0 ? `<div class="runway-track"><div class="runway-fill" id="rbar_${containerId}" style="width:0%;background:${runwayBarColor}"></div></div>` : ''}
    </div>
    <div class="m-card ${beClass}">
      <div class="m-lbl">Venta mínima para sobrevivir</div>
      <div class="m-val">${isFinite(r.breakeven) ? fmt(r.breakeven) : '—'}</div>
      <div class="m-sub">${r.revenue >= r.breakeven ? `${fmt(r.revenue - r.breakeven)} sobre el punto de quiebre` : `Faltan ${fmt(r.breakeven - r.revenue)} para cubrir todo`}</div>
    </div>
    <div class="m-card ${wcClass}">
      <div class="m-lbl">Brecha capital de trabajo</div>
      <div class="m-val">${r.wcGap > 0 ? '+' : ''}${r.wcGap} días</div>
      <div class="m-sub">${r.wcGap <= 0 ? 'Cobras antes de pagar — favorable' : r.wcGap <= 15 ? 'Brecha moderada, manejable' : 'Estás financiando a tus clientes'}</div>
    </div>`;

  // animate runway bar
  setTimeout(() => {
    const rb = document.getElementById(`rbar_${containerId}`);
    if (rb && isFinite(r.runway)) rb.style.width = Math.min(100, (r.runway / 12) * 100) + '%';
  }, 300);
}

function renderChart(containerId, projection) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const maxVal = Math.max(...projection.map(Math.abs), 1);
  const months = ['M1','M2','M3','M4','M5','M6'];
  el.innerHTML = projection.map((val, i) => {
    const h     = Math.max(4, (Math.abs(val) / maxVal) * 90);
    const color = val >= 0 ? 'var(--green)' : 'var(--red)';
    return `<div class="bar-wrap">
      <div class="bar-v">${fmt(val)}</div>
      <div class="bar" style="height:${h}px;background:${color};opacity:${0.5 + i * 0.1}"></div>
      <div class="bar-l">${months[i]}</div>
    </div>`;
  }).join('');
}

function renderSensitivity(containerId, r) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="sens-card">
      <div class="sens-lbl">-10% ventas</div>
      <div class="sens-val" style="color:${r.ebitda10 >= 0 ? 'var(--green)' : 'var(--red)'}">${r.ebitda10 >= 0 ? '+' : ''}${fmt(r.ebitda10)}</div>
    </div>
    <div class="sens-card">
      <div class="sens-lbl">-20% ventas</div>
      <div class="sens-val" style="color:${r.ebitda20 >= 0 ? 'var(--green)' : 'var(--red)'}">${r.ebitda20 >= 0 ? '+' : ''}${fmt(r.ebitda20)}</div>
    </div>
    <div class="sens-card">
      <div class="sens-lbl">Margen bruto</div>
      <div class="sens-val" style="color:${r.marginPct >= 30 ? 'var(--green)' : r.marginPct >= 15 ? 'var(--yellow)' : 'var(--red)'}">${r.marginPct.toFixed(1)}%</div>
    </div>`;
}

function renderDiagnosis(containerId, r) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const items = buildDiagnosis(r);
  el.innerHTML = `
    <div class="diag-head">💡 Diagnóstico inteligente</div>
    ${items.map(d => `<div class="diag-item"><div class="di-icon">${d.icon}</div><div class="di-text">${d.text}</div></div>`).join('')}`;
}

/* ─── FULL RENDER (calls all of the above) ─── */
function renderResults(prefix, r) {
  renderScoreBadge(`${prefix}Score`, r.score);
  renderMetrics(`${prefix}Metrics`, r);
  renderChart(`${prefix}Chart`, r.projection);
  renderSensitivity(`${prefix}Sens`, r);
  renderDiagnosis(`${prefix}Diag`, r);
}
