import { ReactNode, useState, useEffect } from 'react';

const SESSION_KEY = 'mr_admin_auth';
const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'margenreal2026';

export default function AdminGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === '1');
    setReady(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!ready) return null;
  if (authed) return <>{children}</>;

  return (
    <>
      <style>{`
        .gate-wrap {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #0a0a0e; padding: 24px;
        }
        .gate-box {
          width: 100%; max-width: 360px;
          background: #111; border: 1.5px solid #1f1f1f;
          border-radius: 16px; padding: 36px 32px;
        }
        .gate-title {
          font-size: 1.0625rem; font-weight: 800; color: #f0f0f0;
          letter-spacing: -0.02em; margin: 0 0 6px;
        }
        .gate-sub { font-size: 0.8125rem; color: #666; margin: 0 0 28px; }
        .gate-input {
          width: 100%; background: #0a0a0e; border: 1.5px solid #222;
          color: #f0f0f0; font-size: 0.9375rem; padding: 12px 14px;
          border-radius: 10px; outline: none; transition: border-color 0.2s;
          font-family: inherit; box-sizing: border-box;
        }
        .gate-input:focus { border-color: #f9d71b; }
        .gate-input.error { border-color: #ef4444; }
        .gate-btn {
          width: 100%; margin-top: 12px; background: #f9d71b; color: #0a0a0e;
          font-weight: 800; font-size: 0.9375rem; padding: 13px;
          border-radius: 10px; border: none; cursor: pointer;
          transition: opacity 0.15s; font-family: inherit;
        }
        .gate-btn:hover { opacity: 0.9; }
        .gate-error { font-size: 0.8125rem; color: #ef4444; margin-top: 10px; text-align: center; }
      `}</style>
      <div className="gate-wrap">
        <div className="gate-box">
          <div className="gate-title">Admin — Margen Real</div>
          <div className="gate-sub">Acceso restringido</div>
          <form onSubmit={handleSubmit}>
            <input
              className={`gate-input${error ? ' error' : ''}`}
              type="password"
              placeholder="Contraseña"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <button className="gate-btn" type="submit">Entrar →</button>
            {error && <div className="gate-error">Contraseña incorrecta</div>}
          </form>
        </div>
      </div>
    </>
  );
}
