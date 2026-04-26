import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Calcula tu margen real en MercadoLibre Chile';
  const sub   = searchParams.get('sub')   ?? 'Comisión + IVA 19% + envío. Sin sorpresas.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#f9d71b"/>
            <rect x="6" y="20" width="4" height="6" rx="1" fill="#0a0a0e"/>
            <rect x="12" y="14" width="4" height="12" rx="1" fill="#0a0a0e"/>
            <rect x="18" y="9" width="4" height="17" rx="1" fill="#0a0a0e"/>
          </svg>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            margen<span style={{ color: '#f9d71b' }}>real</span>
          </span>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            fontSize: title.length > 50 ? '52px' : '64px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '26px',
            color: '#888899',
            fontWeight: 500,
            lineHeight: 1.4,
          }}>
            {sub}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '18px', color: '#555566', fontWeight: 600 }}>margenreal.io</span>
          <div style={{
            background: '#f9d71b',
            color: '#0a0a0e',
            fontSize: '16px',
            fontWeight: 800,
            padding: '10px 24px',
            borderRadius: '8px',
          }}>
            Calcular gratis →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
