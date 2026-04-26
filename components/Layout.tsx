import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Footer from './Footer';

const SIDEBAR_W = 220;
const SIDEBAR_COLLAPSED = 56;

function Ico({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  home:  'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  calc:  'M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z M8 6h.01 M12 6h.01 M16 6h.01 M8 10h.01 M12 10h.01 M16 10h.01 M8 14h8 M8 18h8',
  gift:  'M20 12v10H4V12 M22 7H2v5h20V7z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
  book:  'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  edit:  'M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z',
  tag:   'M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  user:  'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8 4 4 0 000-8',
  chev:  'M6 9l6 6 6-6',
};

const CALC_FREE = [
  { href: '/calculadora-ml', label: 'Calculadora ML', desc: 'Margen real en MercadoLibre' },
  { href: '/importados', label: 'Importados', desc: 'Productos con costos de importación' },
];
const CALC_PATHS = ['/calculadora-ml', '/importados'];

const NAV = [
  { href: '/',        icon: 'home', label: 'Inicio',   exact: true },
  { href: '/gratis',  icon: 'gift', label: 'Gratis' },
  { href: '/guias',   icon: 'book', label: 'Guías' },
  { href: '/blog',    icon: 'edit', label: 'Blog' },
  { href: '/pro',     icon: 'calc', label: 'Pro' },
  { href: '/pricing', icon: 'tag',  label: 'Planes' },
  { href: '/about',   icon: 'user', label: 'Nosotros' },
];

const NAV_ADMIN = [
  { href: '/admin/pipeline', icon: 'edit', label: 'Pipeline' },
  { href: '/admin/emails',   icon: 'gift', label: 'Emails' },
  { href: '/review',         icon: 'book', label: 'Review guías' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { pathname } = router;
  const [expanded, setExpanded] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [userInitial, setUserInitial] = useState<string | null>(null);
  const [userEmail, setUserEmail]     = useState<string | null>(null);
  const [userPlan, setUserPlan]       = useState<string | null>(null);
  const [dropOpen, setDropOpen]       = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setExpanded(false); }, [pathname]);

  useEffect(() => {
    const email = localStorage.getItem('mr_user_email');
    const token = localStorage.getItem('mr_session');
    const plan  = localStorage.getItem('mr_user_plan');
    if (email && token) {
      setUserEmail(email);
      setUserInitial(email.charAt(0).toUpperCase());
      setUserPlan(plan);
    } else {
      setUserEmail(null);
      setUserInitial(null);
      setUserPlan(null);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick as unknown as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick as unknown as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mr_session');
    localStorage.removeItem('mr_user_email');
    localStorage.removeItem('mr_user_plan');
    setUserInitial(null);
    setUserEmail(null);
    setDropOpen(false);
    router.replace('/');
  };

  useEffect(() => {
    document.body.style.overflow = (expanded && mobile) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [expanded, mobile]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const isCalcActive = CALC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  const sidebarW = mobile ? SIDEBAR_W : (expanded ? SIDEBAR_W : SIDEBAR_COLLAPSED);

  return (
    <>
      <style>{`
        .site-topbar {
          position: fixed; top: 0; left: 0; right: 0; height: 56px;
          background: var(--bg); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; z-index: 300;
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .topbar-ham {
          display: flex; flex-direction: column; justify-content: center; gap: 5px;
          width: 36px; height: 36px; background: none; border: none; cursor: pointer; padding: 8px;
          flex-shrink: 0; border-radius: 8px; transition: background var(--transition);
        }
        .topbar-ham:hover { background: var(--surface); }
        .topbar-ham span { display: block; width: 100%; height: 2px; background: var(--text); border-radius: 2px; transition: transform 0.2s, opacity 0.2s; }
        .topbar-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); text-decoration: none; letter-spacing: -0.02em; }
        .topbar-logo span { color: var(--accent); }

        /* Sidebar */
        .site-sidebar {
          position: fixed; top: 56px; left: 0; bottom: 0;
          width: ${SIDEBAR_COLLAPSED}px;
          background: var(--bg); border-right: 1px solid var(--border);
          overflow: hidden; overflow-y: auto;
          transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
          z-index: 200;
          display: flex; flex-direction: column;
        }
        .site-sidebar.expanded { width: ${SIDEBAR_W}px; }
        @media (max-width: 768px) {
          .site-sidebar { left: -${SIDEBAR_W}px; width: ${SIDEBAR_W}px; transition: left 0.22s cubic-bezier(0.4,0,0.2,1); }
          .site-sidebar.expanded { left: 0; }
        }

        /* Overlay mobile */
        .site-overlay {
          position: fixed; inset: 56px 0 0 0; background: rgba(0,0,0,0.5);
          z-index: 199; backdrop-filter: blur(2px);
        }

        /* Main content */
        .site-main {
          padding-top: 56px;
          margin-left: ${SIDEBAR_COLLAPSED}px;
          min-height: 100vh;
          transition: margin-left 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .site-main.expanded { margin-left: ${SIDEBAR_W}px; }
        @media (max-width: 768px) {
          .site-main, .site-main.expanded { margin-left: 0; }
        }

        /* Sidebar nav items */
        .sb-item {
          display: flex; align-items: center; gap: 14px;
          padding: 0 18px; height: 48px; min-width: 0;
          color: var(--muted); text-decoration: none; cursor: pointer;
          border: none; background: none; font-family: var(--font-body);
          font-size: 0.9375rem; font-weight: 500; width: 100%; text-align: left;
          transition: color var(--transition), background var(--transition);
          white-space: nowrap; flex-shrink: 0;
          border-radius: 0;
        }
        .sb-item:hover { color: var(--text); background: var(--surface); text-decoration: none; }
        .sb-item.active { color: var(--text); background: var(--surface); }
        .sb-icon { flex-shrink: 0; width: 20px; display: flex; align-items: center; justify-content: center; }
        .sb-label { opacity: 0; transition: opacity 0.15s; white-space: nowrap; overflow: hidden; }
        .site-sidebar.expanded .sb-label { opacity: 1; }
        .sb-chev { margin-left: auto; flex-shrink: 0; opacity: 0; transition: opacity 0.15s, transform 0.2s; }
        .site-sidebar.expanded .sb-chev { opacity: 1; }
        .sb-chev.open { transform: rotate(180deg); }

        /* Sidebar sub-items */
        .sb-sub { overflow: hidden; transition: max-height 0.25s ease; max-height: 0; }
        .sb-sub.open { max-height: 400px; }
        .sb-sub-label {
          font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--muted-2); padding: 8px 18px 4px 52px; white-space: nowrap;
        }
        .sb-sub-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 18px 9px 52px; color: var(--muted);
          text-decoration: none; font-size: 0.875rem; font-weight: 500;
          transition: color var(--transition), background var(--transition);
          white-space: nowrap;
        }
        .sb-sub-item:hover { color: var(--text); background: var(--surface); text-decoration: none; }
        .sb-sub-item.active { color: var(--text); }
        .sb-pro-dot {
          margin-left: auto; font-size: 0.5rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.06em; background: rgba(249,215,27,0.12); color: var(--accent);
          border-radius: 3px; padding: 1px 5px; flex-shrink: 0;
        }

        /* Sidebar divider */
        .sb-divider { border: none; border-top: 1px solid var(--border); margin: 6px 0; }

        /* Topbar actions responsive */
        .topbar-actions { display: flex; align-items: center; gap: 6px; }
        .topbar-btn-secondary { display: inline-block; }
        .topbar-btn-login {
          font-size: 0.75rem; font-weight: 700; color: var(--accent);
          text-decoration: none; padding: 7px 10px; border-radius: 8px;
          border: 1.5px solid var(--accent); transition: opacity 0.15s; white-space: nowrap;
        }
        .topbar-btn-login:hover { opacity: 0.75; text-decoration: none; }
        .topbar-btn-signup {
          font-size: 0.75rem; font-weight: 800; color: var(--bg);
          text-decoration: none; padding: 7px 10px; border-radius: 8px;
          background: var(--accent); transition: opacity 0.15s; white-space: nowrap;
        }
        .topbar-btn-signup:hover { opacity: 0.85; text-decoration: none; }
        .topbar-btn-short { display: none; }
        @media (max-width: 480px) {
          .topbar-actions { gap: 4px; }
          .topbar-btn-login, .topbar-btn-signup { font-size: 0.6875rem; padding: 5px 9px; }
          .topbar-btn-long { display: none; }
          .topbar-btn-short { display: inline; }
        }
        .topbar-user-pill { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px; padding: 5px 12px 5px 6px; cursor: pointer; font-family: inherit; }
        .topbar-user-name { font-size: 0.8125rem; font-weight: 700; color: var(--text); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media (max-width: 380px) { .topbar-user-name { display: none; } }
        .topbar-drop { position: absolute; right: 0; top: calc(100% + 8px); background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; min-width: 220px; z-index: 500; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        @media (max-width: 380px) { .topbar-drop { right: -12px; min-width: 200px; } }

        /* Tooltip for collapsed state */
        .sb-tooltip-wrap { position: relative; }
        .sb-tooltip {
          position: absolute; left: calc(100% + 8px); top: 50%; transform: translateY(-50%);
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; padding: 6px 12px;
          font-size: 0.8125rem; font-weight: 600; color: var(--text);
          white-space: nowrap; pointer-events: none;
          opacity: 0; transition: opacity 0.15s;
          z-index: 400;
        }
        .sb-tooltip-wrap:hover .sb-tooltip { opacity: 1; }
        .site-sidebar.expanded .sb-tooltip { display: none; }
      `}</style>

      {/* Top bar */}
      <header className="site-topbar">
        <div className="topbar-left">
          <button className="topbar-ham" onClick={() => setExpanded(e => !e)} aria-label="Menú">
            <span /><span /><span />
          </button>
          <Link href="/" className="topbar-logo">
            margen<span>real</span>
          </Link>
        </div>
        {userInitial && userEmail ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button onClick={() => setDropOpen(o => !o)} className="topbar-user-pill">
              <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                {userInitial}
              </span>
              <span className="topbar-user-name">{userEmail.split('@')[0]}</span>
            </button>

            {dropOpen && (
              <div className="topbar-drop">
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                    {userInitial}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail.split('@')[0]}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{userEmail.split('@')[1]}</div>
                  </div>
                </div>
                {[
                  { href: userPlan === 'admin' ? '/admin' : '/dashboard', label: 'Mi cuenta' },
                  { href: '/cambiar-password', label: 'Cambiar contraseña' },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)}
                    style={{ display: 'block', padding: '11px 16px', fontSize: '0.875rem', color: 'var(--text)', textDecoration: 'none', transition: 'background 0.12s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseOut={e  => (e.currentTarget.style.background = 'transparent')}>
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={handleLogout}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: '0.875rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseOut={e  => (e.currentTarget.style.background = 'transparent')}>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="topbar-actions">
            <Link href="/login" className="topbar-btn-login">
              <span className="topbar-btn-long">Iniciar sesión</span>
              <span className="topbar-btn-short">Ingresar</span>
            </Link>
            <Link href="/registro" className="topbar-btn-signup">
              <span className="topbar-btn-long">Crear cuenta</span>
              <span className="topbar-btn-short">Registro</span>
            </Link>
          </div>
        )}
      </header>

      {/* Mobile overlay */}
      {expanded && mobile && (
        <div className="site-overlay" onClick={() => setExpanded(false)} />
      )}

      {/* Sidebar */}
      <aside className={`site-sidebar${expanded ? ' expanded' : ''}`}>

        {/* Mi cuenta — solo logueado */}
        {userInitial && (
          <>
            <div className="sb-tooltip-wrap">
              <Link href={userPlan === 'admin' ? '/admin' : '/dashboard'} className={`sb-item${isActive('/dashboard') || isActive('/admin') ? ' active' : ''}`}>
                <span className="sb-icon"><Ico d={ICONS.user} /></span>
                <span className="sb-label" style={{ color: 'var(--accent)', fontWeight: 700 }}>Mi cuenta</span>
              </Link>
              <div className="sb-tooltip">Mi cuenta</div>
            </div>
            <hr className="sb-divider" />
          </>
        )}

        {userPlan === 'admin' ? (
          /* Nav admin */
          <>
            {NAV_ADMIN.map(({ href, icon, label }) => (
              <div key={href} className="sb-tooltip-wrap">
                <Link href={href} className={`sb-item${isActive(href) ? ' active' : ''}`}>
                  <span className="sb-icon"><Ico d={ICONS[icon as keyof typeof ICONS]} /></span>
                  <span className="sb-label">{label}</span>
                </Link>
                <div className="sb-tooltip">{label}</div>
              </div>
            ))}
          </>
        ) : (
          /* Nav regular */
          <>
            <div className="sb-tooltip-wrap">
              <button
                className={`sb-item${isCalcActive ? ' active' : ''}`}
                onClick={() => { if (!expanded) { setExpanded(true); setCalcOpen(true); } else setCalcOpen(o => !o); }}
              >
                <span className="sb-icon"><Ico d={ICONS.calc} /></span>
                <span className="sb-label">Calculadoras</span>
                <span className={`sb-chev${calcOpen ? ' open' : ''}`}><Ico d={ICONS.chev} size={14} /></span>
              </button>
              <div className="sb-tooltip">Calculadoras</div>
            </div>

            <div className={`sb-sub${calcOpen && expanded ? ' open' : ''}`}>
              {CALC_FREE.map(item => (
                <Link key={item.href} href={item.href} className={`sb-sub-item${isActive(item.href) ? ' active' : ''}`}>
                  {item.label}
                </Link>
              ))}
            </div>

            <hr className="sb-divider" />

            {NAV.map(({ href, icon, label, exact }) => (
              <div key={href} className="sb-tooltip-wrap">
                <Link href={href} className={`sb-item${isActive(href, exact) ? ' active' : ''}${href === '/pro' ? ' pro' : ''}`}>
                  <span className="sb-icon" style={href === '/pro' ? { color: 'var(--accent)' } : undefined}><Ico d={ICONS[icon as keyof typeof ICONS]} /></span>
                  <span className="sb-label" style={href === '/pro' ? { color: 'var(--accent)', fontWeight: 700 } : undefined}>{label}</span>
                </Link>
                <div className="sb-tooltip">{label}</div>
              </div>
            ))}
          </>
        )}
      </aside>

      {/* Main */}
      <main className={`site-main${!mobile && expanded ? ' expanded' : ''}`}>
        {children}
        <Footer />
      </main>
    </>
  );
}
