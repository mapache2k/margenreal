import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Inicio', exact: true },
  { href: '/calculadora-ml', label: 'Calculadora ML' },
  { href: '/gratis', label: 'Gratis' },
  { href: '/guias', label: 'Guías' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Planes' },
  { href: '/about', label: 'Nosotros' },
];

export default function NavBar() {
  const { pathname } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          margen<span style={{ color: 'var(--accent)' }}>real</span>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${isActive(href, exact) ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
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
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            <span className={`ham-line${open ? ' open' : ''}`} />
            <span className={`ham-line${open ? ' open' : ''}`} />
            <span className={`ham-line${open ? ' open' : ''}`} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-mobile-overlay" onClick={() => setOpen(false)}>
          <div className="nav-mobile-panel" onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={`nav-mobile-link${isActive(href, exact) ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/calculadora-ml" className="nav-mobile-cta" onClick={() => setOpen(false)}>
              Calcular mi margen →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
