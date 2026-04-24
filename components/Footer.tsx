import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <Link href="/" className="footer-logo" style={{ textDecoration: 'none' }}>
        margen<span>real</span>
      </Link>
      <div className="footer-links">
        <Link href="/calculadora-ml" className="footer-link">Calculadora ML</Link>
        <Link href="/guias" className="footer-link">Guías</Link>
        <Link href="/importados" className="footer-link">Para vendedores ML</Link>
        <Link href="/privacy" className="footer-link">Privacidad</Link>
        <Link href="/terms" className="footer-link">Términos</Link>
      </div>
      <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
    </footer>
  );
}
