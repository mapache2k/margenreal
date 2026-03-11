// pages/api/diagnose.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { calc } = req.body;
    if (!calc) return res.status(400).json({ error: 'calc data required' });

    let prompt: string;

    if (calc._rawPrompt) {
      prompt = calc._rawPrompt;
    } else {
      prompt = `Eres un consultor financiero experto en pequeñas y medianas empresas latinoamericanas. Analiza estos datos financieros de un negocio y escribe un diagnóstico honesto, directo y útil en español.

DATOS DEL NEGOCIO:
- Ventas mensuales: $${calc.revenue.toLocaleString()}
- Margen bruto: ${calc.grossMarginPct}% ($${calc.grossProfit.toLocaleString()})
- EBITDA mensual: $${calc.ebitda.toLocaleString()}
- Costos fijos: $${calc.fixedCosts.toLocaleString()}
- Flujo neto mensual: $${calc.monthlyNetCashFlow.toLocaleString()}
- Caja disponible: $${calc.cashOnHand.toLocaleString()}
- Caja ajustada: $${calc.cashAdjustedStart.toLocaleString()}
- Runway: ${isFinite(calc.runway) ? calc.runway.toFixed(1) + ' meses' : 'indefinido (flujo positivo)'}
- Punto de equilibrio: $${isFinite(calc.breakevenRevenue) ? calc.breakevenRevenue.toLocaleString() : 'N/A'}
- Días para cobrar (DSO): ${calc.arDays} días
- Días para pagar (DPO): ${calc.apDays} días
- Brecha de capital de trabajo: ${calc.wcGapDays} días
- Efectivo atrapado en ciclo: $${calc.wcCashTied.toLocaleString()}
- Score de salud financiera: ${calc.score}/100
- EBITDA si ventas caen 10%: $${calc.sensitivities.ebitda_minus10.toLocaleString()}
- EBITDA si ventas caen 20%: $${calc.sensitivities.ebitda_minus20.toLocaleString()}

Escribe el diagnóstico en exactamente 3 párrafos:

PÁRRAFO 1 — LA REALIDAD: Describe el estado actual del negocio con honestidad. Menciona los números más importantes.

PÁRRAFO 2 — EL RIESGO PRINCIPAL: El problema más urgente o trampa silenciosa. Sé específico con números.

PÁRRAFO 3 — LA PALANCA: La acción más importante esta semana. Una sola cosa, concreta y accionable.

Tono: directo, sin rodeos, habla de "tu negocio". Máximo 200 palabras.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: data.error?.message || 'Error calling Claude' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ ok: true, diagnosis: text });

  } catch (err: any) {
    console.error('diagnose error', err);
    return res.status(500).json({ error: err?.message || 'internal error' });
  }
}