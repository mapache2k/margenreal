import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NavBar() {
  const { pathname } = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav>
      <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        margen<span style={{ color: 'var(--accent)' }}>real</span>
      </Link>
      <div className="nav-links">
        <Link href="/" className={`nav-link${isActive('/') ? ' active' : ''}`} style={{ textDecoration: 'none' }}>Inicio</Link>
        <Link href="/calculadora-ml" className={`nav-link${isActive('/calculadora-ml') ? ' active' : ''}`} style={{ textDecoration: 'none' }}>Calculadora ML</Link>
        <Link href="/guias" className={`nav-link${isActive('/guias') ? ' active' : ''}`} style={{ textDecoration: 'none' }}>Guías</Link>
        <Link href="/importados" className={`nav-link${isActive('/importados') ? ' active' : ''}`} style={{ textDecoration: 'none' }}>Para vendedores ML</Link>
      </div>
      <Link href="/calculadora-ml" className="btn nav-cta" style={{ textDecoration: 'none' }}>
        Calcular mi margen →
      </Link>
    </nav>
  );
}
