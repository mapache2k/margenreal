import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

const CALC_FREE = [
  { href: '/calculadora-ml', icon: '🧮', label: 'Calculadora ML', desc: 'Margen real en MercadoLibre' },
  { href: '/importados', icon: '📦', label: 'Importados', desc: 'Productos con costos de importación' },
];

const CALC_PRO = [
  { href: '/pro', icon: '📊', label: 'Dashboard Pro', desc: 'Vista general de tu negocio' },
  { href: '/pro/diagnostico', icon: '🔬', label: 'Diagnóstico IA', desc: 'Análisis y plan de acción' },
  { href: '/pro/forecast', icon: '📈', label: 'Forecast', desc: 'Proyección de caja a 6 meses' },
  { href: '/pro/simuladores', icon: '⚡', label: 'Simuladores', desc: 'Decisiones: deuda, equipo, crisis' },
];

const TOP_LINKS = [
  { href: '/', label: 'Inicio', exact: true },
  { href: '/gratis', label: 'Gratis' },
  { href: '/guias', label: 'Guías' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Planes' },
  { href: '/about', label: 'Nosotros' },
];

const CALC_PATHS = ['/calculadora-ml', '/importados', '/pro'];

export default function NavBar() {
  const { pathname } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileCalcOpen, setMobileCalcOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isCalcActive = CALC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  return (
    <>
      <style>{`
        .nav-drop-wrap { position: relative; }
        .nav-drop-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.875rem; font-weight: 500; color: var(--muted);
          background: none; border: none; cursor: pointer; font-family: var(--font-body);
          padding: 7px 12px; border-radius: 8px;
          transition: color var(--transition), background var(--transition);
          white-space: nowrap;
        }
        .nav-drop-btn:hover, .nav-drop-btn.open { color: var(--text); background: var(--surface); }
        .nav-drop-btn.active { color: var(--text); background: rgba(249,215,27,0.10); }
        .nav-drop-chevron { font-size: 0.625rem; color: var(--muted); transition: transform 0.2s; line-height: 1; }
        .nav-drop-btn.open .nav-drop-chevron { transform: rotate(180deg); }

        .nav-drop-panel {
          position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%);
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 8px; min-width: 320px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          z-index: 200; display: none;
        }
        .nav-drop-panel.open { display: block; animation: dropFadeIn 0.15s ease both; }
        @keyframes dropFadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        .drop-section-label {
          font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--muted-2); padding: 8px 12px 4px;
        }
        .drop-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px; text-decoration: none;
          transition: background var(--transition); cursor: pointer;
        }
        .drop-item:hover { background: var(--surface-2); text-decoration: none; }
        .drop-item.active { background: rgba(249,215,27,0.08); }
        .drop-icon { font-size: 1.25rem; flex-shrink: 0; width: 32px; text-align: center; }
        .drop-text {}
        .drop-label { font-size: 0.875rem; font-weight: 700; color: var(--text); line-height: 1.2; }
        .drop-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.3; margin-top: 1px; }
        .drop-divider { border: none; border-top: 1px solid var(--border); margin: 6px 8px; }
        .drop-pro-badge {
          margin-left: auto; flex-shrink: 0;
          font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
          background: rgba(249,215,27,0.12); color: var(--accent); border-radius: 4px; padding: 2px 6px;
        }

        /* Mobile calc accordion */
        .nav-mobile-section { padding: 4px 0; }
        .nav-mobile-section-btn {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; background: none; border: none; cursor: pointer; font-family: var(--font-body);
          font-size: 1rem; font-weight: 500; color: var(--muted);
          padding: 12px 16px; border-radius: 10px;
          transition: color var(--transition), background var(--transition);
        }
        .nav-mobile-section-btn.active { color: var(--text); background: rgba(249,215,27,0.10); }
        .nav-mobile-section-btn:hover { color: var(--text); background: var(--surface); }
        .nav-mobile-section-content { padding: 4px 0 4px 16px; }
        .nav-mobile-sub-label { font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-2); padding: 6px 16px 2px; }
        .nav-mobile-sub-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; border-radius: 10px; text-decoration: none;
          font-size: 0.9375rem; color: var(--muted);
          transition: color var(--transition), background var(--transition);
        }
        .nav-mobile-sub-item:hover { color: var(--text); background: var(--surface); text-decoration: none; }
        .nav-mobile-sub-item.active { color: var(--text); }
        .nav-mobile-sub-icon { font-size: 1rem; flex-shrink: 0; width: 24px; text-align: center; }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          margen<span style={{ color: 'var(--accent)' }}>real</span>
        </Link>

        <div className="nav-links">
          {/* Calculadoras dropdown */}
          <div className="nav-drop-wrap" ref={dropRef}>
            <button
              className={`nav-drop-btn${isCalcActive ? ' active' : ''}${dropOpen ? ' open' : ''}`}
              onClick={() => setDropOpen(o => !o)}
            >
              Calculadoras
              <span className="nav-drop-chevron">▼</span>
            </button>

            <div className={`nav-drop-panel${dropOpen ? ' open' : ''}`}>
              <div className="drop-section-label">Gratis</div>
              {CALC_FREE.map(item => (
                <Link key={item.href} href={item.href} className={`drop-item${isActive(item.href) ? ' active' : ''}`} onClick={() => setDropOpen(false)}>
                  <span className="drop-icon">{item.icon}</span>
                  <span className="drop-text">
                    <span className="drop-label">{item.label}</span>
                    <span className="drop-desc">{item.desc}</span>
                  </span>
                </Link>
              ))}

              <hr className="drop-divider" />
              <div className="drop-section-label">Pro</div>
              {CALC_PRO.map(item => (
                <Link key={item.href} href={item.href} className={`drop-item${isActive(item.href) ? ' active' : ''}`} onClick={() => setDropOpen(false)}>
                  <span className="drop-icon">{item.icon}</span>
                  <span className="drop-text">
                    <span className="drop-label">{item.label}</span>
                    <span className="drop-desc">{item.desc}</span>
                  </span>
                  <span className="drop-pro-badge">Pro</span>
                </Link>
              ))}
            </div>
          </div>

          {TOP_LINKS.filter(l => l.href !== '/').map(({ href, label, exact }) => (
            <Link key={href} href={href} className={`nav-link${isActive(href, exact) ? ' active' : ''}`} style={{ textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/calculadora-ml" className="btn nav-cta" style={{ textDecoration: 'none' }}>
            Calcular mi margen →
          </Link>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span className={`ham-line${menuOpen ? ' open' : ''}`} />
            <span className={`ham-line${menuOpen ? ' open' : ''}`} />
            <span className={`ham-line${menuOpen ? ' open' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMenuOpen(false)}>
          <div className="nav-mobile-panel" onClick={e => e.stopPropagation()}>
            {/* Calculadoras accordion */}
            <div className="nav-mobile-section">
              <button
                className={`nav-mobile-section-btn${isCalcActive ? ' active' : ''}`}
                onClick={() => setMobileCalcOpen(o => !o)}
              >
                Calculadoras
                <span style={{ fontSize: '0.625rem', transition: 'transform 0.2s', display: 'inline-block', transform: mobileCalcOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {mobileCalcOpen && (
                <div className="nav-mobile-section-content">
                  <div className="nav-mobile-sub-label">Gratis</div>
                  {CALC_FREE.map(item => (
                    <Link key={item.href} href={item.href} className={`nav-mobile-sub-item${isActive(item.href) ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                      <span className="nav-mobile-sub-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div className="nav-mobile-sub-label" style={{ marginTop: 8 }}>Pro</div>
                  {CALC_PRO.map(item => (
                    <Link key={item.href} href={item.href} className={`nav-mobile-sub-item${isActive(item.href) ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                      <span className="nav-mobile-sub-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {TOP_LINKS.filter(l => l.href !== '/').map(({ href, label }) => (
              <Link key={href} href={href} className={`nav-mobile-link${isActive(href) ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}

            <Link href="/calculadora-ml" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>
              Calcular mi margen →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
