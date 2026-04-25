import Link from 'next/link';
import { useRouter } from 'next/router';

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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
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
      <Link href="/calculadora-ml" className="btn nav-cta" style={{ textDecoration: 'none' }}>
        Calcular mi margen →
      </Link>
    </nav>
  );
}
