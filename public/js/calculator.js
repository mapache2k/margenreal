/* ═══════════════════════════════════════
   margenreal.io — Calculator v3
   - 3-scenario cash projection (best/base/worst)
   - Ranked action diagnosis (impact-first)
   - Cash gap analysis
   - How we calculate this transparency
═══════════════════════════════════════ */

/* ─── FORMAT ─── */
function fmt(n) {
  if (!isFinite(n)) return '∞';
  const abs  = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if      (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
  else if (abs >= 1_000)     return sign + Math.round(abs / 1_000) + 'K';
  else                       return sign + Math.round(abs).toString();
}
function pct(n) { return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }

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

  // Sensitivity scenarios
  const ebitda10 = (revenue * 0.9  * (marginPct / 100)) - fixedCosts - debt;
  const ebitda20 = (revenue * 0.8  * (marginPct / 100)) - fixedCosts - debt;
  const ebitda10u= (revenue * 1.1  * (marginPct / 100)) - fixedCosts - debt;

  // ── 3-SCENARIO PROJECTION ──
  // Base: flat revenue
  // Best: revenue grows +5% per month (optimistic but realistic for a recovering biz)
  // Worst: revenue declines -5% per month
  const scenarios = { best: [], base: [], worst: [] };
  let cashBase = cash, cashBest = cash, cashWorst = cash;
  let revBase = revenue, revBest = revenue, revWorst = revenue;

  for (let m = 0; m < 6; m++) {
    // Base — flat
    cashBase  += freeCashFlow;

    // Best — revenue +5%/mo, costs fixed
    revBest   *= 1.05;
    const fcfBest  = (revBest  * (marginPct / 100)) - fixedCosts - debt;
    cashBest  += fcfBest;

    // Worst — revenue -5%/mo, costs fixed
    revWorst  *= 0.95;
    const fcfWorst = (revWorst * (marginPct / 100)) - fixedCosts - debt;
    cashWorst += fcfWorst;

    scenarios.base.push(Math.round(cashBase));
    scenarios.best.push(Math.round(cashBest));
    scenarios.worst.push(Math.round(cashWorst));
  }

  // ── CASH GAP ANALYSIS ──
  // How much additional monthly revenue needed to break even?
  const revenueGap = marginPct > 0
    ? Math.max(0, breakeven - revenue)
    : null;

  // How much to cut fixed costs to break even at current revenue?
  const costGap = Math.max(0, -(ebitda - debt));

  // What margin % needed at current revenue to break even?
  const marginNeeded = revenue > 0
    ? ((fixedCosts + debt) / revenue) * 100
    : null;

  // Health score 0–100
  let score = 0;
  if (ebitda > 0)                score += 30;
  if (runway > 6 || ebitda > 0)  score += 20;
  if (marginPct >= 30)           score += 20;
  if (ebitda10 > 0)              score += 15;
  if (wcGap <= 0)                score += 15;

  return {
    revenue, marginPct, grossProfit, fixedCosts, ebitda, freeCashFlow,
    breakeven, runway, cash, debt, wcGap, arDays, apDays,
    ebitda10, ebitda20, ebitda10u,
    scenarios, revenueGap, costGap, marginNeeded,
    score
  };
}

/* ─── RANKED ACTION DIAGNOSIS ─── */
// Each action has: priority (1=highest), icon, problem, action, impact estimate
function buildActions(r) {
  const actions = [];

  // ── MARGIN (biggest lever for most businesses) ──
  if (r.marginPct < 15) {
    const impact10pct = r.revenue * 0.1 * ((r.marginPct + 10) / 100) - r.revenue * 0.1 * (r.marginPct / 100);
    // Actually: if price goes up 10%, revenue goes up 10%, margin gain = new_gross - old_gross
    const newGross = (r.revenue * 1.1) * (r.marginPct / 100); // same margin %, more revenue
    const gainFromPrice = newGross - r.grossProfit;
    actions.push({
      priority: 1,
      icon: '📈',
      label: 'MAYOR IMPACTO',
      problem: `Tu margen bruto es ${r.marginPct.toFixed(0)}% — por cada ${fmt(r.revenue)} que vendes, solo ${fmt(r.grossProfit)} quedan para cubrir costos.`,
      action: `Sube precios un 10% antes de tocar cualquier otra variable. Si vendes lo mismo, pasarías de ${fmt(r.grossProfit)} a ${fmt(Math.round(newGross))} de margen bruto mensual.`,
      impact: `+10% en precio = +${fmt(Math.round(gainFromPrice))} de margen bruto sin vender más`,
      color: 'var(--danger)'
    });
  } else if (r.marginPct < 30) {
    const targetGross = r.revenue * 0.35;
    const gainToTarget = targetGross - r.grossProfit;
    actions.push({
      priority: 1,
      icon: '📈',
      label: 'ALTA PRIORIDAD',
      problem: `Margen de ${r.marginPct.toFixed(0)}% — de cada ${fmt(r.revenue)} vendidos, ${fmt(r.grossProfit)} van a cubrir costos. Funciona, pero el crecimiento no compensa rápido.`,
      action: 'Identifica los 3 productos o clientes con mejor margen y enfoca el esfuerzo de ventas ahí. Evita descuentos — cada 5% de descuento reduce tu margen bruto proporcionalmente.',
      impact: `Llegar al 35% de margen generaría +${fmt(Math.round(gainToTarget))} adicionales al mes sin vender más`,
      color: 'var(--warning)'
    });
  }

  // ── FIXED COSTS ──
  if (r.ebitda < 0) {
    const costGapPct = r.fixedCosts > 0 ? (r.costGap / r.fixedCosts) * 100 : null;
    const costCuttable = costGapPct !== null && costGapPct <= 100; // is it even possible to cut enough?

    let action, impact;
    if (!costCuttable || costGapPct > 60) {
      // Cutting costs alone won't save this — need revenue too
      const revenueNeeded = fmt(r.revenueGap || 0);
      const costCut30     = fmt(r.fixedCosts * 0.3);
      action = `Solo recortar costos no es suficiente — necesitas también ${revenueNeeded} más en ventas. Combina: recorta lo que puedas (apunta a un 20–30% de fijos) y activa ventas en paralelo.`;
      impact = `Recortar 30% en fijos (−${costCut30}/mes) + ventas adicionales de ${revenueNeeded} = equilibrio`;
    } else {
      const cutPct = Math.ceil(costGapPct);
      action = `Necesitas reducir tus costos fijos un ${cutPct}% (equivale a −${fmt(r.costGap)}/mes sobre tus ${fmt(r.fixedCosts)}/mes actuales). Revisa nómina, arriendo y suscripciones en ese orden.`;
      impact = `−${cutPct}% en costos fijos = punto de equilibrio exacto`;
    }

    actions.push({
      priority: r.marginPct < 15 ? 2 : 1,
      icon: '✂️',
      label: r.marginPct < 15 ? 'URGENTE' : 'MAYOR IMPACTO',
      problem: `Tus costos fijos (${fmt(r.fixedCosts)}/mes) superan lo que genera tu margen bruto (${fmt(r.grossProfit)}/mes) — operas en pérdida de ${fmt(Math.abs(r.ebitda))}/mes.`,
      action,
      impact,
      color: 'var(--danger)'
    });
  } else if (r.ebitda > 0 && r.ebitda < r.fixedCosts * 0.2) {
    actions.push({
      priority: 2,
      icon: '✂️',
      label: 'MEDIA PRIORIDAD',
      problem: `Tu resultado es positivo (${fmt(r.ebitda)}/mes) pero solo representa el ${((r.ebitda / r.fixedCosts) * 100).toFixed(0)}% de tus costos fijos — poco margen de error.`,
      action: 'Revisa si hay costos fijos que puedas convertir a variables (pagas solo cuando vendes). Eso reduce el riesgo sin afectar capacidad.',
      impact: `Reducir fijos un 10% (−${fmt(r.fixedCosts * 0.1)}/mes) = +${fmt(r.fixedCosts * 0.1)} de resultado mensual`,
      color: 'var(--warning)'
    });
  }

  // ── WORKING CAPITAL ──
  if (r.wcGap > 20) {
    const trapped = Math.round(r.revenue * (r.wcGap / 30) * 0.5);
    actions.push({
      priority: 3,
      icon: '⏱️',
      label: r.wcGap > 45 ? 'ALTA PRIORIDAD' : 'MEDIA PRIORIDAD',
      problem: `Cobras ${r.arDays} días después de vender, pagas en ${r.apDays} días — tienes ${r.wcGap} días financiando a tus clientes.`,
      action: 'Negocia cobros anticipados (anticipo del 50%), acorta plazos a 15 días máximo, ofrece descuento por pago rápido.',
      impact: `Reducir días de cobro en 15 días liberaría ~${fmt(trapped)} de caja inmediatamente`,
      color: r.wcGap > 45 ? 'var(--warning)' : 'var(--muted)'
    });
  } else if (r.wcGap <= 0) {
    actions.push({
      priority: 4,
      icon: '✅',
      label: 'VENTAJA',
      problem: `Cobras antes de pagar — ${Math.abs(r.wcGap)} días a favor.`,
      action: 'Mantén esta ventaja al crecer. Si añades clientes nuevos, negocia las mismas condiciones desde el inicio.',
      impact: 'Crecimiento sin necesidad de capital adicional',
      color: 'var(--success)'
    });
  }

  // ── RUNWAY / SURVIVAL ──
  if (!isFinite(r.runway) && r.ebitda > 0) {
    // Great — add growth action
    if (r.ebitda20 > 0) {
      actions.push({
        priority: 4,
        icon: '🚀',
        label: 'OPORTUNIDAD',
        problem: 'Tu negocio es rentable y resiste caídas del 20% — base sólida.',
        action: 'Con esta estabilidad, el siguiente paso es escalar el canal que mejor convierte. Mide el costo de adquisición y duplica lo que funciona.',
        impact: '+20% en volumen = +' + fmt(r.ebitda * 0.2) + ' adicionales al mes',
        color: 'var(--success)'
      });
    }
  } else if (r.runway < 3 && r.ebitda < 0) {
    actions.push({
      priority: 1,
      icon: '🚨',
      label: 'CRÍTICO — ACTÚA HOY',
      problem: `Menos de ${r.runway < 1 ? 'un mes' : r.runway.toFixed(1) + ' meses'} de caja disponible.`,
      action: 'Prioridad absoluta: (1) llama a tus mejores clientes y cobra lo pendiente hoy, (2) negocia diferir cualquier costo fijo que puedas, (3) evalúa una línea de crédito de emergencia.',
      impact: 'Cada semana de retraso reduce tus opciones significativamente',
      color: 'var(--danger)'
    });
  } else if (r.runway < 6 && r.ebitda < 0) {
    actions.push({
      priority: 2,
      icon: '⚠️',
      label: 'ATENCIÓN',
      problem: `Tienes ${r.runway.toFixed(1)} meses de caja — ventana limitada para ajustar.`,
      action: 'No esperes a que se agote. En los próximos 30 días define qué costos fijos puedes eliminar y establece una meta mínima de ventas semanal.',
      impact: `Llegar a breakeven te da runway infinito — faltan ${fmt(Math.abs(r.revenueGap || r.costGap))}`,
      color: 'var(--warning)'
    });
  }

  // Sort by priority
  return actions.sort((a, b) => a.priority - b.priority);
}

/* ─── RENDER: SCORE ─── */
function renderScoreBadge(id, score) {
  const el = document.getElementById(id);
  if (!el) return;
  let cls, dot, label, sub;
  if (score >= 70) {
    cls = 'healthy'; dot = 'var(--success)';
    label = 'Negocio saludable';
    sub = 'Base sólida para crecer';
  } else if (score >= 40) {
    cls = 'warning'; dot = 'var(--warning)';
    label = 'Señales de alerta';
    sub = 'Hay palancas concretas por mover';
  } else {
    cls = 'danger'; dot = 'var(--danger)';
    label = 'Zona de riesgo';
    sub = 'Requiere acción inmediata';
  }
  el.innerHTML = `
    <div class="score-bar ${cls}">
      <span class="score-dot" style="background:${dot}"></span>
      <div>
        <div class="score-text">${label}</div>
        <div style="font-size:0.75rem;color:var(--muted);margin-top:2px">${sub}</div>
      </div>
      <span class="score-num">Score ${score}/100</span>
    </div>`;
}

/* ─── RENDER: METRICS ─── */
function renderMetrics(id, r) {
  const el = document.getElementById(id);
  if (!el) return;
  const eC  = r.ebitda >= 0 ? 'g' : 'r';
  const rwC = r.ebitda >= 0 ? 'h' : (r.runway > 6 ? 'y' : 'r');
  const rwV = r.ebitda >= 0 ? '∞' : (r.runway < 0.5 ? '< 1' : r.runway.toFixed(1));
  const beC = r.revenue >= r.breakeven ? 'g' : 'y';
  const wcC = r.wcGap <= 0 ? 'g' : r.wcGap <= 20 ? '' : 'y';
  const rbc = r.runway < 3 ? 'var(--danger)' : r.runway < 6 ? 'var(--warning)' : 'var(--success)';

  el.innerHTML = `
    <div class="m-card ${eC}">
      <div class="m-lbl">Resultado operacional / mes</div>
      <div class="m-val">${r.ebitda >= 0 ? '+' : ''}${fmt(r.ebitda)}</div>
      <div class="m-sub">${r.ebitda >= 0
        ? `${fmt(r.grossProfit)} margen bruto − ${fmt(r.fixedCosts)} fijos`
        : `Déficit de ${fmt(Math.abs(r.ebitda))} mensual`}</div>
    </div>
    <div class="m-card ${rwC}">
      <div class="m-lbl">Runway de caja</div>
      <div class="m-val">${rwV} <span style="font-size:1rem;font-weight:500">${r.ebitda >= 0 ? '' : 'meses'}</span></div>
      <div class="m-sub">${r.ebitda >= 0
        ? 'No quemas caja con este resultado'
        : `${fmt(r.cash)} caja ÷ ${fmt(r.freeCashFlow < 0 ? Math.abs(r.freeCashFlow) : 0)} burn/mes`}</div>
      ${r.ebitda < 0 ? `<div class="runway-track"><div class="runway-fill" id="rb_${id}" style="width:0%;background:${rbc}"></div></div>` : ''}
    </div>
    <div class="m-card ${beC}">
      <div class="m-lbl">Punto de equilibrio</div>
      <div class="m-val">${isFinite(r.breakeven) ? fmt(r.breakeven) : '—'}</div>
      <div class="m-sub">${r.revenue >= r.breakeven
        ? `Vendes ${fmt(r.revenue - r.breakeven)} por encima del mínimo`
        : `Necesitas ${fmt(r.revenueGap)} más en ventas para cubrir todo`}</div>
    </div>
    <div class="m-card ${wcC}">
      <div class="m-lbl">Ciclo de caja</div>
      <div class="m-val">${r.wcGap > 0 ? '+' : ''}${r.wcGap} <span style="font-size:1rem;font-weight:500">días</span></div>
      <div class="m-sub">${r.wcGap <= 0
        ? `Cobras ${Math.abs(r.wcGap)}d antes de pagar — favorable`
        : `Financias a clientes por ${r.wcGap} días`}</div>
    </div>`;

  setTimeout(() => {
    const rb = document.getElementById(`rb_${id}`);
    if (rb && isFinite(r.runway)) rb.style.width = Math.min(100, (r.runway / 12) * 100) + '%';
  }, 300);
}

/* ─── RENDER: SCENARIO CHART ─── */
function renderChart(id, r) {
  const el = document.getElementById(id);
  if (!el) return;

  const { best, base, worst } = r.scenarios;
  const allVals = [...best, ...base, ...worst];
  const maxVal  = Math.max(...allVals.map(Math.abs), 1);
  const months  = ['M1','M2','M3','M4','M5','M6'];
  const chartH  = 80; // px

  el.innerHTML = `
    <div class="scenario-legend">
      <span class="sl-item"><span class="sl-dot" style="background:var(--success)"></span>Optimista (+5%/mes)</span>
      <span class="sl-item"><span class="sl-dot" style="background:var(--text-2)"></span>Base (sin cambios)</span>
      <span class="sl-item"><span class="sl-dot" style="background:var(--danger)"></span>Pesimista (−5%/mes)</span>
    </div>
    <div class="scenario-chart">
      ${months.map((m, i) => {
        const bH  = Math.max(3, (Math.abs(base[i])  / maxVal) * chartH);
        const beH = Math.max(3, (Math.abs(best[i])  / maxVal) * chartH);
        const wH  = Math.max(3, (Math.abs(worst[i]) / maxVal) * chartH);
        const bCol  = base[i]  >= 0 ? 'var(--text-2)'  : 'rgba(200,200,200,.35)';
        const beCol = best[i]  >= 0 ? 'var(--success)' : 'rgba(52,211,153,.3)';
        const wCol  = worst[i] >= 0 ? 'rgba(232,85,85,.5)' : 'var(--danger)';
        return `
          <div class="sc-col">
            <div class="sc-bars">
              <div class="sc-bar" style="height:${beH}px;background:${beCol}" title="Optimista: ${fmt(best[i])}"></div>
              <div class="sc-bar" style="height:${bH}px;background:${bCol}"  title="Base: ${fmt(base[i])}"></div>
              <div class="sc-bar" style="height:${wH}px;background:${wCol}"  title="Pesimista: ${fmt(worst[i])}"></div>
            </div>
            <div class="sc-label">${m}</div>
            <div class="sc-val">${fmt(base[i])}</div>
          </div>`;
      }).join('')}
    </div>
    <div class="scenario-note">
      Escenario base asume ingresos constantes. Optimista: +5% mensual. Pesimista: −5% mensual. Costos fijos sin cambio en todos los casos.
    </div>`;
}

/* ─── RENDER: SENSITIVITY ─── */
function renderSensitivity(id, r) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `
    <div class="sens-card">
      <div class="sens-lbl">Si vendes −10%</div>
      <div class="sens-val" style="color:${r.ebitda10 >= 0 ? 'var(--success)' : 'var(--danger)'}">${r.ebitda10 >= 0 ? '+' : ''}${fmt(r.ebitda10)}</div>
      <div class="sens-sub">${r.ebitda10 >= 0 ? 'Sigue rentable' : 'Entra en pérdida'}</div>
    </div>
    <div class="sens-card">
      <div class="sens-lbl">Si vendes −20%</div>
      <div class="sens-val" style="color:${r.ebitda20 >= 0 ? 'var(--success)' : 'var(--danger)'}">${r.ebitda20 >= 0 ? '+' : ''}${fmt(r.ebitda20)}</div>
      <div class="sens-sub">${r.ebitda20 >= 0 ? 'Sigue rentable' : 'Entra en pérdida'}</div>
    </div>
    <div class="sens-card">
      <div class="sens-lbl">Si vendes +10%</div>
      <div class="sens-val" style="color:var(--success)">${r.ebitda10u >= 0 ? '+' : ''}${fmt(r.ebitda10u)}</div>
      <div class="sens-sub">${r.ebitda10u >= 0 ? 'Resultado positivo' : 'Aún en pérdida'}</div>
    </div>`;
}

/* ─── RENDER: DIAGNOSIS ─── */
function renderDiagnosis(id, r) {
  const el = document.getElementById(id);
  if (!el) return;
  const actions = buildActions(r);
  el.innerHTML = `
    <div class="diag-head">🎯 Acciones por impacto</div>
    ${actions.map((a, i) => `
      <div class="diag-item">
        <div class="di-rank" style="background:${a.color}20;border-color:${a.color}40">
          <span style="font-size:1rem">${a.icon}</span>
          <span class="di-label" style="color:${a.color}">${a.label}</span>
        </div>
        <div class="di-body">
          <div class="di-problem">${a.problem}</div>
          <div class="di-action">→ ${a.action}</div>
          <div class="di-impact">💰 ${a.impact}</div>
        </div>
      </div>`).join('')}`;
}

/* ─── FULL RENDER ─── */
function renderResults(prefix, r) {
  renderScoreBadge(`${prefix}Score`,   r.score);
  renderMetrics(`${prefix}Metrics`,    r);
  renderChart(`${prefix}Chart`,        r);
  renderSensitivity(`${prefix}Sens`,   r);
  renderDiagnosis(`${prefix}Diag`,     r);
}
