import type { NextApiRequest, NextApiResponse } from 'next';

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Margen Real', email: 'contacto@margenreal.io' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo error: ${res.status}`);
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
      '5 errores de pricing que te hacen vender sin margen',
      buildEmail()
    );

    await sendEmail(
      'contacto@margenreal.io',
      `[lead] ${email}`,
      `<p>Nuevo lead: <strong>${email}</strong><br>${new Date().toISOString()}</p>`
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe]', err);
    return res.status(500).json({ error: 'Error al enviar. Intentá de nuevo.' });
  }
}

function buildEmail() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:24px;font-family:Georgia,serif;font-size:16px;color:#1a1a1a;background:#ffffff;max-width:580px;">

<p>Hola,</p>

<p>Acá están los 5 errores de pricing que hacen que muchos negocios vendan bien pero ganen poco:</p>

<p><strong>1. Calcular el margen sobre el precio de venta, no sobre el costo.</strong><br>
El margen real se calcula sobre el costo. Si comprás a $100 y vendés a $150, tu margen es 33%, no 50%. Ese error infla todos tus indicadores.</p>

<p><strong>2. No incluir los costos de importación en el costo del producto.</strong><br>
Flete, arancel, bodegaje, seguro, tipo de cambio. Si no están en el costo unitario, tu margen es una ilusión.</p>

<p><strong>3. Fijar precio mirando a la competencia sin saber tu estructura de costos.</strong><br>
Podés vender más barato que todos y perder en cada venta. El precio de la competencia no es tu piso — tu costo sí.</p>

<p><strong>4. Ignorar el costo del capital atado en inventario.</strong><br>
Cada unidad en bodega tiene un costo financiero. Si tardás 60 días en vender, ese dinero no está trabajando — y eso tiene precio.</p>

<p><strong>5. No tener un margen mínimo definido antes de negociar.</strong><br>
Sin un piso claro, cualquier descuento parece razonable. Definí tu margen mínimo aceptable antes de cada negociación.</p>

<p>Si querés calcular exactamente cuál es tu margen real en cada producto, sin suposiciones ni fórmulas manuales, podés hacerlo acá:<br>
<a href="https://margenreal.io/calculadora">https://margenreal.io/calculadora</a></p>

<p>Saludos,<br>
Margen Real</p>

<p style="font-size:13px;color:#888;margin-top:32px;">Si no pediste este checklist, ignorá este mensaje.</p>

</body>
</html>`;
}
