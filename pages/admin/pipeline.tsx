'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AdminGate from '../../components/AdminGate';
import Layout from '../../components/Layout';

/* ─── Pipeline ───────────────────────────────────────────────── */
const CONTENT_TYPES = [
  { value: 'tier3_case_study',     label: 'Tier 3 — Case study (empresa grande)', needsResearch: true },
  { value: 'tier3_framework',      label: 'Tier 3 — Framework avanzado',          needsResearch: false },
  { value: 'tier2_strategy',       label: 'Tier 2 — Estrategia de pricing',       needsResearch: false },
  { value: 'tier2_channel_margin', label: 'Tier 2 — Margen por canal',            needsResearch: false },
];

function TabPipeline() {
  const [type, setType]       = useState('tier3_case_study');
  const [topic, setTopic]     = useState('');
  const [research, setResearch] = useState('');
  const [draft, setDraft]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [copied, setCopied]   = useState(false);
  const selectedType = CONTENT_TYPES.find(t => t.value === type)!;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading'); setDraft('');
    try {
      const res  = await fetch('/api/pipeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, topic, research: research || undefined }) });
      const data = await res.json();
      res.ok ? (setDraft(data.draft), setStatus('done')) : setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <div className="a-wrap">
      <h1 className="a-title">Pipeline de contenido</h1>
      <p className="a-sub">Generá borradores con Claude usando los prompts del CTO Build Spec.</p>

      <div className="a-field">
        <label>Tipo de contenido</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="a-field">
        <label>{selectedType.needsResearch ? 'Empresa / tema' : 'Nombre del framework o estrategia'}</label>
        <input type="text" placeholder={selectedType.needsResearch ? 'ej. MercadoLibre Chile' : 'ej. Price elasticity'} value={topic} onChange={e => setTopic(e.target.value)} />
      </div>
      {selectedType.needsResearch && (
        <div className="a-field">
          <label>Texto del reporte de investigación</label>
          <textarea placeholder="Pegá aquí el texto del reporte..." value={research} onChange={e => setResearch(e.target.value)} />
        </div>
      )}
      <button className="a-btn" onClick={handleGenerate} disabled={status === 'loading' || !topic.trim()}>
        {status === 'loading' ? 'Generando...' : 'Generar borrador →'}
      </button>
      {status === 'error' && <div className="a-error">Error. Verificá que ANTHROPIC_API_KEY esté configurada.</div>}
      {status === 'done' && draft && (
        <div className="a-draft">
          <div className="a-draft-header">
            <span className="a-label">Borrador generado</span>
            <button className="a-copy-btn" onClick={() => { navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? '¡Copiado!' : 'Copiar todo'}
            </button>
          </div>
          <div className="a-output">{draft}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Emails ─────────────────────────────────────────────────── */
const E2_SUBJECT = 'El error que destruye tu margen en MercadoLibre';
const E3_SUBJECT = 'Tu precio minimo: el numero que te protege de vender a perdida';
const E2_HTML = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="margin:0;padding:40px 20px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111111;line-height:1.7;max-width:600px;">\n<p>Hola,</p>\n<p>La semana pasada te mande el checklist de los 5 errores de pricing. Hoy quiero profundizar en el que mas dinero les cuesta a los vendedores de MercadoLibre.</p>\n<p><strong>El problema: publicas un precio sin saber cuanto te queda despues de las comisiones.</strong></p>\n<p>MercadoLibre cobra entre 11% y 17% de comision segun la categoria. A eso sumale el costo del despacho, el IVA del servicio, y el costo de tu producto. Muchos vendedores descubren que estan ganando 2% o 3% de margen real — o directamente perdiendo.</p>\n<p>El calculo correcto:</p>\n<p style="background:#f5f5f5;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;">Margen = (Precio de venta - Costo - Comision ML - Envio) / Precio de venta</p>\n<p>Si no haces ese calculo antes de publicar, estas adivinando.</p>\n<p><a href="https://margenreal.io/calculadora-ml" style="color:#111111;font-weight:700;">Calcular mi margen real en ML Chile</a></p>\n<p>En el proximo email te explico como definir tu precio minimo.</p>\n<p>Saludos,<br>Margen Real</p>\n<p style="font-size:13px;color:#888888;margin-top:40px;">Recibiste este email porque descargaste el checklist de pricing en margenreal.io.</p>\n</body></html>`;
const E2_TEXT = `Hola,\n\nLa semana pasada te mande el checklist de los 5 errores de pricing. Hoy quiero profundizar en el que mas dinero les cuesta a los vendedores de MercadoLibre.\n\nEl problema: publicas un precio sin saber cuanto te queda despues de las comisiones.\n\nMercadoLibre cobra entre 11% y 17% segun la categoria. A eso sumale despacho, IVA y costo del producto. Muchos vendedores terminan con 2-3% de margen real, o perdiendo.\n\nEl calculo correcto:\nMargen = (Precio de venta - Costo - Comision ML - Envio) / Precio de venta\n\nCalcula tu margen real aqui: https://margenreal.io/calculadora-ml\n\nEn el proximo email te explico como definir tu precio minimo.\n\nSaludos,\nMargen Real\n\n---\nRecibiste este email porque descargaste el checklist de pricing en margenreal.io.`;
const E3_HTML = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="margin:0;padding:40px 20px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111111;line-height:1.7;max-width:600px;">\n<p>Hola,</p>\n<p>Este es el tercer email de la serie. Hoy: como calcular tu precio minimo.</p>\n<p><strong>El precio minimo no es el precio mas barato que puedes poner. Es el precio por debajo del cual pierdes dinero.</strong></p>\n<p>La formula:</p>\n<p style="background:#f5f5f5;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;">Precio minimo = (Costo + Costos fijos asignados + Comision) / (1 - Margen minimo objetivo)</p>\n<p>Ejemplo: producto a $8.000, comision ML 14%, margen minimo 15%.</p>\n<p style="background:#f5f5f5;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;">Precio minimo = $8.000 / (1 - 0,14 - 0,15) = $8.000 / 0,71 = $11.268</p>\n<p>Si publicas a menos de $11.268, no llegas al 15% de margen.</p>\n<p><a href="https://margenreal.io/pricing" style="color:#111111;font-weight:700;">Ver la guia de pricing completa</a></p>\n<p>Saludos,<br>Margen Real</p>\n<p style="font-size:13px;color:#888888;margin-top:40px;">Recibiste este email porque descargaste el checklist de pricing en margenreal.io.</p>\n</body></html>`;
const E3_TEXT = `Hola,\n\nEste es el tercer email de la serie. Hoy: como calcular tu precio minimo.\n\nEl precio minimo no es el precio mas barato que puedes poner. Es el precio por debajo del cual pierdes dinero.\n\nLa formula:\nPrecio minimo = (Costo + Costos fijos asignados + Comision) / (1 - Margen minimo objetivo)\n\nEjemplo: producto a 8.000, comision ML 14%, margen minimo 15%.\nPrecio minimo = 8.000 / (1 - 0,14 - 0,15) = 8.000 / 0,71 = 11.268\n\nSi publicas a menos de 11.268, no llegas al 15% de margen.\n\nVer la guia de pricing completa: https://margenreal.io/pricing\n\nSaludos,\nMargen Real\n\n---\nRecibiste este email porque descargaste el checklist de pricing en margenreal.io.`;

const EMAIL_SECTIONS = [
  { id: 'e2', title: 'Email 2 — Comisiones ML', timing: 'Enviar: 3-5 días después del Email 1', subject: E2_SUBJECT, html: E2_HTML, text: E2_TEXT },
  { id: 'e3', title: 'Email 3 — Precio mínimo', timing: 'Enviar: 7-10 días después del Email 1', subject: E3_SUBJECT, html: E3_HTML, text: E3_TEXT },
];

function TabEmails() {
  const [copied, setCopied] = useState<{ [k: string]: boolean }>({});
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(p => ({ ...p, [key]: true }));
    setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 2000);
  };

  return (
    <div className="a-wrap">
      <h1 className="a-title">Templates de email</h1>
      <p className="a-sub">Copiá cada sección y pegala en Resend Broadcasts cuando corresponda.</p>

      <div className="a-instr">
        <strong>Cómo enviar en Resend:</strong>
        <ol><li>Resend → Broadcasts → New Broadcast</li><li>Elegí la audiencia</li><li>Pegá Subject y HTML</li><li>Enviá preview a tu email antes de mandar a toda la lista</li></ol>
      </div>

      {EMAIL_SECTIONS.map((s, i) => (
        <div key={s.id}>
          {i > 0 && <hr className="a-divider" />}
          <div className="a-email-title">{s.title}</div>
          <div className="a-timing">{s.timing}</div>
          {(['subject', 'html', 'text'] as const).map(type => {
            const key = s.id + '-' + type;
            const labels = { subject: 'Subject', html: 'HTML', text: 'Texto plano' };
            const values = { subject: s.subject, html: s.html, text: s.text };
            return (
              <div className="a-field" key={key}>
                <div className="a-field-header">
                  <span className="a-label">{labels[type]}</span>
                  <button className="a-copy-btn" onClick={() => copy(key, values[type])}>{copied[key] ? 'Copiado!' : 'Copiar'}</button>
                </div>
                <div className="a-code">{values[type]}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Review ─────────────────────────────────────────────────── */
type GuiaReview = { slug: string; title: string; description: string; tags: string[]; draft: boolean };

function TabReview() {
  const [guias, setGuias] = useState<GuiaReview[]>([]);

  useEffect(() => {
    fetch('/api/admin/guias').then(r => r.json()).then(d => setGuias(d.guias ?? [])).catch(() => {});
  }, []);

  const drafts    = guias.filter(g => g.draft);
  const published = guias.filter(g => !g.draft);

  const Section = ({ title, items }: { title: string; items: GuiaReview[] }) => (
    <div style={{ marginBottom: 32 }}>
      <div className="a-label" style={{ marginBottom: 12 }}>{title} ({items.length})</div>
      {items.length === 0 ? <div className="a-sub">Sin resultados.</div> : items.map(g => (
        <div key={g.slug} className="a-review-card">
          <div className="a-review-header">
            <span className="a-review-title">{g.title}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`a-badge ${g.draft ? 'a-badge-draft' : 'a-badge-pub'}`}>{g.draft ? 'Borrador' : 'Publicado'}</span>
              {!g.draft && <Link href={`/guias/${g.slug}`} className="a-view-link" target="_blank">Ver →</Link>}
            </div>
          </div>
          <div className="a-review-desc">{g.description}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
            {g.tags.map(t => <span key={t} className="a-tag">{t}</span>)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="a-wrap">
      <h1 className="a-title">Review de guías</h1>
      <p className="a-sub">Vista de todos los contenidos — borradores y publicados.</p>
      <Section title="Borradores" items={drafts} />
      <Section title="Publicados" items={published} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
type Tab = 'pipeline' | 'emails' | 'review';

const TABS: { id: Tab; label: string }[] = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'emails',   label: 'Emails' },
  { id: 'review',   label: 'Review guías' },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('pipeline');

  return (
    <AdminGate>
      <Layout>
        <Head>
          <title>Admin — Margen Real</title>
          <meta name="robots" content="noindex" />
        </Head>

        <style>{`
          .a-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); padding: 0 24px; background: var(--bg); position: sticky; top: 56px; z-index: 100; }
          .a-tab { padding: 14px 20px; font-size: 0.875rem; font-weight: 600; color: var(--muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: color 0.15s; white-space: nowrap; }
          .a-tab:hover { color: var(--text); }
          .a-tab.active { color: var(--text); border-bottom-color: var(--accent); }

          .a-wrap { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; }
          .a-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); margin: 0 0 6px; }
          .a-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
          .a-label { font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); }

          .a-field { margin-bottom: 20px; }
          .a-field label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
          .a-field select, .a-field input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: inherit; font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
          .a-field textarea { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: inherit; font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; resize: vertical; min-height: 180px; box-sizing: border-box; }
          .a-field select:focus, .a-field input:focus, .a-field textarea:focus { border-color: var(--accent); }
          .a-field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

          .a-btn { background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 13px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; width: 100%; }
          .a-btn:hover { opacity: 0.9; }
          .a-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .a-copy-btn { background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.8125rem; font-weight: 600; padding: 6px 14px; border-radius: 7px; cursor: pointer; font-family: inherit; transition: background 0.15s; }
          .a-copy-btn:hover { background: var(--bg); }

          .a-draft { margin-top: 32px; }
          .a-draft-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .a-output { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 20px; font-size: 0.875rem; line-height: 1.8; color: var(--muted); white-space: pre-wrap; word-break: break-word; max-height: 560px; overflow-y: auto; }
          .a-error { color: #ef4444; font-size: 0.875rem; margin-top: 14px; }

          .a-code { background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px; padding: 14px 16px; font-size: 0.8125rem; line-height: 1.7; color: var(--muted); white-space: pre-wrap; word-break: break-word; max-height: 240px; overflow-y: auto; font-family: 'SF Mono','Fira Code',monospace; }
          .a-divider { border: none; border-top: 1px solid var(--border); margin: 36px 0; }
          .a-email-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
          .a-timing { font-size: 0.75rem; color: var(--muted-2); margin-bottom: 20px; }
          .a-instr { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 18px 22px; margin-bottom: 32px; font-size: 0.875rem; color: var(--muted); line-height: 1.7; }
          .a-instr strong { color: var(--text); display: block; margin-bottom: 8px; }
          .a-instr ol { margin: 0; padding-left: 18px; }

          .a-review-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 10px; }
          .a-review-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
          .a-review-title { font-weight: 700; color: var(--text); font-size: 0.9375rem; }
          .a-review-desc { font-size: 0.8125rem; color: var(--muted); margin-bottom: 10px; line-height: 1.55; }
          .a-badge { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }
          .a-badge-draft { background: rgba(239,68,68,0.1); color: #ef4444; }
          .a-badge-pub { background: rgba(34,197,94,0.1); color: #22c55e; }
          .a-view-link { font-size: 0.8125rem; color: var(--accent); text-decoration: none; font-weight: 600; }
          .a-tag { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 7px; }
        `}</style>

        {/* Tab bar */}
        <div className="a-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`a-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'pipeline' && <TabPipeline />}
        {tab === 'emails'   && <TabEmails />}
        {tab === 'review'   && <TabReview />}

      </Layout>
    </AdminGate>
  );
}
