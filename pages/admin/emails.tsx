import Head from 'next/head';
import { useState } from 'react';
import AdminGate from '../../components/AdminGate';
import Layout from '../../components/Layout';

const E2_SUBJECT = 'El error que destruye tu margen en MercadoLibre';
const E3_SUBJECT = 'Tu precio minimo: el numero que te protege de vender a perdida';

const E2_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111111;line-height:1.7;max-width:600px;">
<p>Hola,</p>
<p>La semana pasada te mande el checklist de los 5 errores de pricing. Hoy quiero profundizar en el que mas dinero les cuesta a los vendedores de MercadoLibre.</p>
<p><strong>El problema: publicas un precio sin saber cuanto te queda despues de las comisiones.</strong></p>
<p>MercadoLibre cobra entre 11% y 17% de comision segun la categoria. A eso sumale el costo del despacho, el IVA del servicio, y el costo de tu producto. Muchos vendedores descubren que estan ganando 2% o 3% de margen real — o directamente perdiendo.</p>
<p>El calculo correcto:</p>
<p style="background:#f5f5f5;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;">Margen = (Precio de venta - Costo - Comision ML - Envio) / Precio de venta</p>
<p>Si no haces ese calculo antes de publicar, estas adivinando.</p>
<p><a href="https://margenreal.io/calculadora-ml" style="color:#111111;font-weight:700;">Calcular mi margen real en ML Chile</a></p>
<p>En el proximo email te explico como definir tu precio minimo.</p>
<p>Saludos,<br>Margen Real</p>
<p style="font-size:13px;color:#888888;margin-top:40px;">Recibiste este email porque descargaste el checklist de pricing en margenreal.io.</p>
</body></html>`;

const E2_TEXT = `Hola,

La semana pasada te mande el checklist de los 5 errores de pricing. Hoy quiero profundizar en el que mas dinero les cuesta a los vendedores de MercadoLibre.

El problema: publicas un precio sin saber cuanto te queda despues de las comisiones.

MercadoLibre cobra entre 11% y 17% segun la categoria. A eso sumale despacho, IVA y costo del producto. Muchos vendedores terminan con 2-3% de margen real, o perdiendo.

El calculo correcto:
Margen = (Precio de venta - Costo - Comision ML - Envio) / Precio de venta

Calcula tu margen real aqui: https://margenreal.io/calculadora-ml

En el proximo email te explico como definir tu precio minimo.

Saludos,
Margen Real

---
Recibiste este email porque descargaste el checklist de pricing en margenreal.io.`;

const E3_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111111;line-height:1.7;max-width:600px;">
<p>Hola,</p>
<p>Este es el tercer email de la serie. Hoy: como calcular tu precio minimo.</p>
<p><strong>El precio minimo no es el precio mas barato que puedes poner. Es el precio por debajo del cual pierdes dinero.</strong></p>
<p>La formula:</p>
<p style="background:#f5f5f5;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;">Precio minimo = (Costo + Costos fijos asignados + Comision) / (1 - Margen minimo objetivo)</p>
<p>Ejemplo: producto a $8.000, comision ML 14%, margen minimo 15%.</p>
<p style="background:#f5f5f5;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;">Precio minimo = $8.000 / (1 - 0,14 - 0,15) = $8.000 / 0,71 = $11.268</p>
<p>Si publicas a menos de $11.268, no llegas al 15% de margen. Si la competencia esta a $10.500 y bajas para igualarlos, estas perdiendo.</p>
<p>Tener este numero claro cambia como negocias, como respondes a la competencia, y como evaluas cada canal de venta.</p>
<p><a href="https://margenreal.io/shop" style="color:#111111;font-weight:700;">Ver la guia de pricing completa</a></p>
<p>Saludos,<br>Margen Real</p>
<p style="font-size:13px;color:#888888;margin-top:40px;">Recibiste este email porque descargaste el checklist de pricing en margenreal.io.</p>
</body></html>`;

const E3_TEXT = `Hola,

Este es el tercer email de la serie. Hoy: como calcular tu precio minimo.

El precio minimo no es el precio mas barato que puedes poner. Es el precio por debajo del cual pierdes dinero.

La formula:
Precio minimo = (Costo + Costos fijos asignados + Comision) / (1 - Margen minimo objetivo)

Ejemplo: producto a 8.000, comision ML 14%, margen minimo 15%.
Precio minimo = 8.000 / (1 - 0,14 - 0,15) = 8.000 / 0,71 = 11.268

Si publicas a menos de 11.268, no llegas al 15% de margen.

Ver la guia de pricing completa: https://margenreal.io/shop

Saludos,
Margen Real

---
Recibiste este email porque descargaste el checklist de pricing en margenreal.io.`;

type CopyState = { [key: string]: boolean };

export default function EmailTemplatesPage() {
  const [copied, setCopied] = useState<CopyState>({});

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const sections = [
    { id: 'e2', title: 'Email 2 — Comisiones ML', timing: 'Enviar: 3-5 dias despues del Email 1', subject: E2_SUBJECT, html: E2_HTML, text: E2_TEXT },
    { id: 'e3', title: 'Email 3 — Precio minimo', timing: 'Enviar: 7-10 dias despues del Email 1', subject: E3_SUBJECT, html: E3_HTML, text: E3_TEXT },
  ];

  return (
    <AdminGate>
    <Layout>
      <Head>
        <title>Email Templates — Margen Real Admin</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #0a0a0e; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; }
        .wrap { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
        h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px; }
        .subtitle { color: #888; font-size: 0.875rem; margin: 0 0 40px; }
        .email-title { font-size: 1rem; font-weight: 700; margin: 0 0 4px; }
        .timing { font-size: 0.75rem; color: #666; margin: 0 0 20px; }
        .field { margin-bottom: 16px; }
        .field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .field-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #666; }
        .btn-copy { background: #1a1a1a; border: 1px solid #333; color: #f0f0f0; font-size: 0.8125rem; font-weight: 600; padding: 6px 14px; border-radius: 6px; cursor: pointer; }
        .btn-copy:hover { background: #222; }
        .code-block { background: #111; border: 1.5px solid #1f1f1f; border-radius: 10px; padding: 16px; font-size: 0.8125rem; line-height: 1.7; color: #d0d0d0; white-space: pre-wrap; word-break: break-word; max-height: 260px; overflow-y: auto; font-family: 'SF Mono', 'Fira Code', monospace; }
        .subject-block { background: #111; border: 1.5px solid #1f1f1f; border-radius: 10px; padding: 12px 16px; font-size: 0.9375rem; color: #f0f0f0; }
        .divider { border: none; border-top: 1px solid #1a1a1a; margin: 40px 0; }
        .instructions { background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px 24px; margin-bottom: 40px; }
        .instructions h3 { font-size: 0.875rem; font-weight: 700; margin: 0 0 12px; }
        .instructions ol { margin: 0; padding-left: 20px; }
        .instructions li { font-size: 0.875rem; color: #888; line-height: 1.8; }
      `}</style>

      <div className="wrap">
        <h1>Email Templates — Nurture Sequence</h1>
        <p className="subtitle">Copia cada seccion y pegala en Resend Broadcasts cuando corresponda.</p>

        <div className="instructions">
          <h3>Como enviar en Resend</h3>
          <ol>
            <li>Ve a Resend → Broadcasts → New Broadcast</li>
            <li>Elige la audiencia (contactos de margenreal.io)</li>
            <li>Pega el Subject y el HTML en los campos correspondientes</li>
            <li>Envia un preview a tu email antes de mandar a toda la lista</li>
          </ol>
        </div>

        {sections.map((s, i) => (
          <div key={s.id}>
            {i > 0 && <hr className="divider" />}
            <div className="email-title">{s.title}</div>
            <p className="timing">{s.timing}</p>
            {(['subject', 'html', 'text'] as const).map(type => {
              const key = s.id + '-' + type;
              const labels = { subject: 'Subject', html: 'HTML', text: 'Texto plano (fallback)' };
              const values = { subject: s.subject, html: s.html, text: s.text };
              return (
                <div className="field" key={key}>
                  <div className="field-header">
                    <span className="field-label">{labels[type]}</span>
                    <button className="btn-copy" onClick={() => copy(key, values[type])}>
                      {copied[key] ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  {type === 'subject'
                    ? <div className="subject-block">{values[type]}</div>
                    : <div className="code-block">{values[type]}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Layout>
    </AdminGate>
  );
}
