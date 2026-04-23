import type { NextApiRequest, NextApiResponse } from 'next';

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Margen Real <contacto@margenreal.io>',
      to: [to],
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend error: ${res.status} ${body}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    await sendEmail(
      email,
      'Tu checklist de pricing',
      buildEmail(),
      buildEmailText()
    );

    await sendEmail(
      'contacto@margenreal.io',
      `[lead] ${email}`,
      `<p>Nuevo lead: <strong>${email}</strong><br>${new Date().toISOString()}</p>`,
      `Nuevo lead: ${email}\n${new Date().toISOString()}`
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe]', err);
    return res.status(500).json({ error: 'Error al enviar. Intentá de nuevo.' });
  }
}

function buildEmailText() {
  return `Hola,

Acá están los 5 errores de pricing que hacen que muchos negocios vendan bien pero ganen poco:

1. Calcular el margen sobre el precio de venta, no sobre el costo.
El margen real se calcula sobre el costo. Si comprás a $100 y vendés a $150, tu margen es 33%, no 50%.

2. No incluir los costos de importación en el costo del producto.
Flete, arancel, bodegaje, seguro, tipo de cambio. Si no están en el costo unitario, tu margen es una ilusión.

3. Fijar precio mirando a la competencia sin saber tu estructura de costos.
Podés vender más barato que todos y perder en cada venta. El precio de la competencia no es tu piso — tu costo sí.

4. Ignorar el costo del capital atado en inventario.
Cada unidad en bodega tiene un costo financiero. Si tardás 60 días en vender, ese dinero no está trabajando.

5. No tener un margen mínimo definido antes de negociar.
Sin un piso claro, cualquier descuento parece razonable.

Calculá tu margen real acá: https://margenreal.io/calculadora

Saludos,
Margen Real

---
Si no pediste este checklist, ignorá este mensaje.`;
}

function buildEmail() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4ade80;">MARGEN REAL</p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 40px 0;">
            <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;line-height:1.2;color:#f0f0f0;letter-spacing:-0.02em;">
              Los 5 errores de pricing que te hacen vender sin margen
            </h1>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 0;">
            <p style="margin:0 0 16px;font-size:16px;color:#9ca3af;line-height:1.7;"><strong style="color:#f0f0f0;">1. Calcular el margen sobre el precio de venta, no sobre el costo.</strong><br>
            El margen real se calcula sobre el costo. Si comprás a $100 y vendés a $150, tu margen es 33%, no 50%. Ese error infla todos tus indicadores.</p>

            <p style="margin:0 0 16px;font-size:16px;color:#9ca3af;line-height:1.7;"><strong style="color:#f0f0f0;">2. No incluir los costos de importación en el costo del producto.</strong><br>
            Flete, arancel, bodegaje, seguro, tipo de cambio. Si no están en el costo unitario, tu margen es una ilusión.</p>

            <p style="margin:0 0 16px;font-size:16px;color:#9ca3af;line-height:1.7;"><strong style="color:#f0f0f0;">3. Fijar precio mirando a la competencia sin saber tu estructura de costos.</strong><br>
            Podés vender más barato que todos y perder en cada venta. El precio de la competencia no es tu piso — tu costo sí.</p>

            <p style="margin:0 0 16px;font-size:16px;color:#9ca3af;line-height:1.7;"><strong style="color:#f0f0f0;">4. Ignorar el costo del capital atado en inventario.</strong><br>
            Cada unidad en bodega tiene un costo financiero. Si tardás 60 días en vender, ese dinero no está trabajando — y eso tiene precio.</p>

            <p style="margin:0 0 32px;font-size:16px;color:#9ca3af;line-height:1.7;"><strong style="color:#f0f0f0;">5. No tener un margen mínimo definido antes de negociar.</strong><br>
            Sin un piso claro, cualquier descuento parece razonable. Definí tu margen mínimo aceptable antes de cada negociación.</p>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;">
              Si querés saber exactamente cuál es tu margen real en cada producto — sin suposiciones, sin fórmulas manuales:
            </p>
            <a href="https://margenreal.io/calculadora"
               style="display:inline-block;background:#4ade80;color:#0a0a0a;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;">
              Calcular mi margen ahora
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px;border-top:1px solid #1f1f1f;">
            <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.6;">
              Margen Real &middot; <a href="https://margenreal.io" style="color:#4b5563;">margenreal.io</a><br>
              Si no pediste esto, ignorá este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}
