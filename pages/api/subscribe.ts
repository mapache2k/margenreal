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
      'Los 5 errores de pricing (tu checklist)',
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

Aquí están los 5 errores de pricing que hacen que muchos negocios vendan bien pero ganen poco:

1. Calcular el margen sobre el precio de venta, no sobre el costo.
El margen real se calcula sobre el costo. Si compras a $100 y vendes a $150, tu margen es 33%, no 50%.

2. No incluir los costos de importación en el costo del producto.
Flete, arancel, bodegaje, seguro, tipo de cambio. Si no están en el costo unitario, tu margen es una ilusión.

3. Fijar precio mirando a la competencia sin saber tu estructura de costos.
Puedes vender más barato que todos y perder en cada venta. El precio de la competencia no es tu piso — tu costo sí.

4. Ignorar el costo del capital atado en inventario.
Cada unidad en bodega tiene un costo financiero. Si tardas 60 días en vender, ese dinero no está trabajando.

5. No tener un margen mínimo definido antes de negociar.
Sin un piso claro, cualquier descuento parece razonable.

Calcula tu margen real aquí: https://margenreal.io/calculadora-ml

Saludos,
Margen Real

---
Si no pediste este checklist, ignora este mensaje.`;
}

function buildEmail() {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111111;line-height:1.7;max-width:600px;">

<p>Hola,</p>

<p>Aquí están los 5 errores de pricing que hacen que muchos negocios vendan bien pero ganen poco:</p>

<p><strong>1. Calcular el margen sobre el precio de venta, no sobre el costo.</strong><br>
El margen real se calcula sobre el costo. Si compras a $100 y vendes a $150, tu margen es 33%, no 50%.</p>

<p><strong>2. No incluir los costos de importación en el costo del producto.</strong><br>
Flete, arancel, bodegaje, seguro, tipo de cambio. Si no están en el costo unitario, tu margen es una ilusión.</p>

<p><strong>3. Fijar precio mirando a la competencia sin saber tu estructura de costos.</strong><br>
Puedes vender más barato que todos y perder en cada venta. El precio de la competencia no es tu piso — tu costo sí.</p>

<p><strong>4. Ignorar el costo del capital atado en inventario.</strong><br>
Cada unidad en bodega tiene un costo financiero. Si tardas 60 días en vender, ese dinero no está trabajando.</p>

<p><strong>5. No tener un margen mínimo definido antes de negociar.</strong><br>
Sin un piso claro, cualquier descuento parece razonable. Define tu margen mínimo antes de cada negociación.</p>

<p>Si quieres calcular tu margen real en cada producto: https://margenreal.io/calculadora-ml</p>

<p>Saludos,<br>Margen Real</p>

<p style="font-size:13px;color:#888888;margin-top:40px;">Si no pediste este checklist, ignora este mensaje.</p>

</body>
</html>
  `;
}
