import Head from 'next/head';
import { useState } from 'react';
import AdminGate from '../../components/AdminGate';
import Layout from '../../components/Layout';

const CONTENT_TYPES = [
  { value: 'tier3_case_study', label: 'Tier 3 — Case study (empresa grande)', needsResearch: true },
  { value: 'tier3_framework', label: 'Tier 3 — Framework avanzado', needsResearch: false },
  { value: 'tier2_strategy', label: 'Tier 2 — Estrategia de pricing', needsResearch: false },
  { value: 'tier2_channel_margin', label: 'Tier 2 — Margen por canal', needsResearch: false },
];

export default function PipelinePage() {
  const [type, setType] = useState('tier3_case_study');
  const [topic, setTopic] = useState('');
  const [research, setResearch] = useState('');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const selectedType = CONTENT_TYPES.find(t => t.value === type)!;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading');
    setDraft('');
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic, research: research || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setDraft(data.draft);
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminGate>
    <Layout>
      <Head>
        <title>Content Pipeline — Margen Real Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        * { box-sizing: border-box; }
        body { background: #0a0a0e; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; }
        .admin-wrap { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
        .admin-header { margin-bottom: 40px; }
        .admin-header h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px; }
        .admin-header p { color: #888; font-size: 0.875rem; margin: 0; }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 8px; }
        .field select, .field input, .field textarea { width: 100%; background: #111; border: 1.5px solid #222; color: #f0f0f0; font-family: inherit; font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; transition: border-color 0.2s; resize: vertical; }
        .field select:focus, .field input:focus, .field textarea:focus { border-color: #f9d71b; }
        .field textarea { min-height: 200px; }
        .btn-generate { background: #f9d71b; color: #0a0a0e; font-weight: 800; font-size: 0.9375rem; padding: 14px 28px; border-radius: 10px; border: none; cursor: pointer; transition: opacity 0.15s; width: 100%; margin-top: 8px; }
        .btn-generate:hover { opacity: 0.9; }
        .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
        .draft-wrap { margin-top: 40px; }
        .draft-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .draft-header span { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #666; }
        .btn-copy { background: #1a1a1a; border: 1px solid #333; color: #f0f0f0; font-size: 0.8125rem; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
        .btn-copy:hover { background: #222; }
        .draft-output { background: #111; border: 1.5px solid #1f1f1f; border-radius: 12px; padding: 24px; font-size: 0.875rem; line-height: 1.8; color: #d0d0d0; white-space: pre-wrap; word-break: break-word; max-height: 600px; overflow-y: auto; }
        .status-loading { color: #f9d71b; font-size: 0.875rem; margin-top: 16px; text-align: center; }
        .status-error { color: #ef4444; font-size: 0.875rem; margin-top: 16px; text-align: center; }
        .hint { font-size: 0.75rem; color: #555; margin-top: 6px; }
      `}</style>

      <div className="admin-wrap">
        <div className="admin-header">
          <h1>Content Pipeline</h1>
          <p>Genera borradores de contenido con Claude usando los prompts del CTO Build Spec.</p>
        </div>

        <div className="field">
          <label>Tipo de contenido</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {CONTENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{selectedType.needsResearch ? 'Empresa / tema' : 'Nombre del framework o estrategia'}</label>
          <input
            type="text"
            placeholder={selectedType.needsResearch ? 'ej. MercadoLibre Chile' : 'ej. Price elasticity'}
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>

        {selectedType.needsResearch && (
          <div className="field">
            <label>Texto del reporte de investigación</label>
            <textarea
              placeholder="Pega aquí el texto extraído del PDF de investigación (Perplexity report)..."
              value={research}
              onChange={e => setResearch(e.target.value)}
            />
            <div className="hint">El texto se inyecta directamente en el prompt de Claude. No modifiques el tono ni las instrucciones — solo pega el contenido.</div>
          </div>
        )}

        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={status === 'loading' || !topic.trim()}
        >
          {status === 'loading' ? 'Generando borrador...' : 'Generar borrador →'}
        </button>

        {status === 'error' && (
          <div className="status-error">Error al generar. Verifica que ANTHROPIC_API_KEY esté configurada.</div>
        )}

        {status === 'done' && draft && (
          <div className="draft-wrap">
            <div className="draft-header">
              <span>Borrador generado</span>
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? '¡Copiado!' : 'Copiar todo'}
              </button>
            </div>
            <div className="draft-output">{draft}</div>
          </div>
        )}
      </div>
    </Layout>
    </AdminGate>
  );
}
