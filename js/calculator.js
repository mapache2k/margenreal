/* ═══════════════════════════════════════
   margenreal.io — Calculator Logic v2
═══════════════════════════════════════ */

function fmt(n) {
  if (!isFinite(n)) return '∞';
  const abs  = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if      (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
  else if (abs >= 1_000)     return sign + (abs / 1_000).toFixed(0) + 'K';
  else                       return sign + Math.round(abs).toString();
}

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
  const projection   = [];
  let runningCash    = cash;
  for (let m = 0; m < 6; m++) { runningCash += freeCashFlow; projection.push(runningCash); }
  let score = 0;
  if (ebitda > 0)               score += 30;
  if (runway > 6 || ebitda > 0) score += 20;
  if (marginPct >= 30)          score += 20;
  if (ebitda10 > 0)             score += 15;
  if (wcGap <= 0)               score += 15;
  return { revenue, marginPct, grossProfit, fixedCosts, ebitda, freeCashFlow,
           breakeven, runway, cash, debt, wcGap, ebitda10, ebitda20, projection, score };
}

function buildDiagnosis(r) {
  const items = [];
  if (r.marginPct < 20)
    items.push({ icon: '🔴', text: `<strong>Margen muy ajustado (${r.marginPct.toFixed(0)}%).</strong> Incluso duplicar ventas generará poco valor real. Revisar precios o reducir costos variables es urgente antes de crecer.` });
  else if (r.marginPct < 35)
    items.push({ icon: '🟡', text: `<strong>Margen moderado (${r.marginPct.toFixed(0)}%).</strong> El negocio funciona, pero el crecimiento no compensa rápido. Un +5% en margen impacta más que +20% en ventas.` });
  else
    items.push({ icon: '🟢', text: `<strong>Margen sólido (${r.marginPct.toFixed(0)}%).</strong> Cada venta adicional tiene buen impacto. El foco debe estar en escalar volumen, no en optimizar costos.` });

  const cov = r.marginPct > 0 ? r.grossProfit / (r.fixedCosts || 1) : 0;
  if (cov < 1)
    items.push({ icon: '⚠️', text: `<strong>Costos fijos demasiado altos para tu nivel de ventas.</strong> Necesitas ${fmt(r.breakeven)} solo para cubrirlos. Reducir fijos en 10% mejoraría el resultado en <strong>${fmt(r.fixedCosts * 0.1)}</strong>/mes.` });
  else if (cov < 1.5)
    items.push({ icon: '🔶', text: `<strong>Estructura de costos con poco margen de error.</strong> Una caída del 15% en ventas te llevaría a pérdida operacional. Revisa si hay costos fijos prescindibles.` });

  if (r.wcGap > 30)
    items.push({ icon: '⏳', text: `<strong>Estás financiando a tus clientes por ${r.wcGap} días.</strong> Cobras tarde, pagas rápido — esto inmoviliza caja aunque seas rentable.` });
  else if (r.wcGap <= 0)
    items.push({ icon: '✅', text: `<strong>Tu ciclo de caja es favorable.</strong> Pagas después de cobrar (${Math.abs(r.wcGap)} días a favor). Puedes crecer sin capital adicional.` });

  if (r.ebitda < 0 && r.runway < 3)
    items.push({ icon: '🚨', text: `<strong>Menos de 3 meses de caja disponible.</strong> Prioridad: reduce costos fijos, acelera cobros, o consigue liquidez inmediata.` });
  else if (r.ebitda > 0 && r.ebitda20 < 0)
    items.push({ icon: '🛡️', text: `<strong>Rentable hoy, pero frágil ante caídas.</strong> Un -20% en ventas te pone en pérdida. Construye reserva de 2–3 meses de costos fijos.` });
  else if (r.ebitda > 0 && r.ebitda20 > 0)
    items.push({ icon: '💪', text: `<strong>Tu negocio resiste una caída del 20% y sigue siendo rentable.</strong> Tienes base para crecer. Identifica qué palanca tiene mayor retorno: volumen, precio o margen.` });

  return items;
}

function renderScoreBadge(id, score) {
  const el = document.getElementById(id);
  if (!el) return;
  let cls, dot, label;
  if      (score >= 70) { cls = 'healthy'; dot = '#34d399'; label = 'Negocio saludable';  }
  else if (score >= 40) { cls = 'warning'; dot = '#fbbf24'; label = 'Señales de alerta'; }
  else                  { cls = 'danger';  dot = '#f05252'; label = 'Zona de riesgo';     }
  el.innerHTML = `<div class="score-bar ${cls}"><span class="score-dot" style="background:${dot}"></span><span class="score-text">${label}</span><span class="score-num">Score ${score}/100</span></div>`;
}

function renderMetrics(id, r) {
  const el = document.getElementById(id);
  if (!el) return;
  const eC  = r.ebitda >= 0 ? 'g' : 'r';
  const rwC = r.ebitda >= 0 ? 'h' : (r.runway > 6 ? 'y' : 'r');
  const rwV = r.ebitda >= 0 ? '∞' : (r.runway < 0.5 ? '< 1' : r.runway.toFixed(1));
  const beC = r.revenue >= r.breakeven ? 'g' : 'y';
  const wcC = r.wcGap <= 0 ? 'g' : r.wcGap <= 15 ? '' : 'y';
  const rbc = r.runway < 3 ? '#f05252' : r.runway < 6 ? '#fbbf24' : '#34d399';
  el.innerHTML = `
    <div class="m-card ${eC}">
      <div class="m-lbl">Resultado operacional</div>
      <div class="m-val">${r.ebitda >= 0 ? '+' : ''}${fmt(r.ebitda)}</div>
      <div class="m-sub">${r.ebitda >= 0 ? 'Por encima del punto de equilibrio' : 'Estás perdiendo dinero cada mes'}</div>
    </div>
    <div class="m-card ${rwC}">
      <div class="m-lbl">Meses de runway</div>
      <div class="m-val">${rwV}</div>
      <div class="m-sub">${r.ebitda >= 0 ? 'Con este ritmo no quemas caja' : 'Tiempo antes de quedarte sin caja'}</div>
      ${r.ebitda < 0 ? `<div class="runway-track"><div class="runway-fill" id="rb_${id}" style="width:0%;background:${rbc}"></div></div>` : ''}
    </div>
    <div class="m-card ${beC}">
      <div class="m-lbl">Venta mínima para sobrevivir</div>
      <div class="m-val">${isFinite(r.breakeven) ? fmt(r.breakeven) : '—'}</div>
      <div class="m-sub">${r.revenue >= r.breakeven ? `${fmt(r.revenue - r.breakeven)} sobre el quiebre` : `Faltan ${fmt(r.breakeven - r.revenue)} para cubrir todo`}</div>
    </div>
    <div class="m-card ${wcC}">
      <div class="m-lbl">Brecha capital de trabajo</div>
      <div class="m-val">${r.wcGap > 0 ? '+' : ''}${r.wcGap} días</div>
      <div class="m-sub">${r.wcGap <= 0 ? 'Cobras antes de pagar — favorable' : r.wcGap <= 15 ? 'Brecha moderada, manejable' : 'Estás financiando a tus clientes'}</div>
    </div>`;
  setTimeout(() => {
    const rb = document.getElementById(`rb_${id}`);
    if (rb && isFinite(r.runway)) rb.style.width = Math.min(100, (r.runway / 12) * 100) + '%';
  }, 300);
}

function renderChart(id, projection) {
  const el = document.getElementById(id);
  if (!el) return;
  const maxVal = Math.max(...projection.map(Math.abs), 1);
  const months = ['M1','M2','M3','M4','M5','M6'];
  el.innerHTML = projection.map((val, i) => {
    const h     = Math.max(6, (Math.abs(val) / maxVal) * 80);
    const color = val >= 0 ? '#34d399' : '#f05252';
    return `<div class="bar-wrap"><div class="bar-v">${fmt(val)}</div><div class="bar" style="height:${h}px;background:${color};opacity:${0.55 + i * 0.09}"></div><div class="bar-l">${months[i]}</div></div>`;
  }).join('');
}

function renderSensitivity(id, r) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `
    <div class="sens-card">
      <div class="sens-lbl">Ventas −10%</div>
      <div class="sens-val" style="color:${r.ebitda10 >= 0 ? '#34d399' : '#f05252'}">${r.ebitda10 >= 0 ? '+' : ''}${fmt(r.ebitda10)}</div>
      <div class="sens-sub">${r.ebitda10 >= 0 ? 'Sigue rentable' : 'Entra en pérdida'}</div>
    </div>
    <div class="sens-card">
      <div class="sens-lbl">Ventas −20%</div>
      <div class="sens-val" style="color:${r.ebitda20 >= 0 ? '#34d399' : '#f05252'}">${r.ebitda20 >= 0 ? '+' : ''}${fmt(r.ebitda20)}</div>
      <div class="sens-sub">${r.ebitda20 >= 0 ? 'Sigue rentable' : 'Entra en pérdida'}</div>
    </div>
    <div class="sens-card">
      <div class="sens-lbl">Margen bruto</div>
      <div class="sens-val" style="color:${r.marginPct >= 30 ? '#34d399' : r.marginPct >= 15 ? '#fbbf24' : '#f05252'}">${r.marginPct.toFixed(1)}%</div>
      <div class="sens-sub">${r.marginPct >= 30 ? 'Saludable' : r.marginPct >= 15 ? 'Moderado' : 'Muy ajustado'}</div>
    </div>`;
}

function renderDiagnosis(id, r) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="diag-head">💡 Diagnóstico inteligente</div>
    ${buildDiagnosis(r).map(d => `<div class="diag-item"><div class="di-icon">${d.icon}</div><div class="di-text">${d.text}</div></div>`).join('')}`;
}

function renderResults(prefix, r) {
  renderScoreBadge(`${prefix}Score`,   r.score);
  renderMetrics(`${prefix}Metrics`,    r);
  renderChart(`${prefix}Chart`,        r.projection);
  renderSensitivity(`${prefix}Sens`,   r);
  renderDiagnosis(`${prefix}Diag`,     r);
}
