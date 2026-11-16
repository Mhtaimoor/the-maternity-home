import { APP_NAME, CURRENCY } from '@tmh/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: 'linear-gradient(160deg, #f7f3ef 0%, #e8f0ee 55%, #dfe9e6 100%)',
        color: '#1f4e46',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <p style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12, margin: 0 }}>
          Storefront shell
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', margin: '0.6rem 0' }}>{APP_NAME}</h1>
        <p style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.5, color: '#345' }}>
          Phase 0 placeholder. Catalogue, cart and checkout arrive in later phases. Currency:{' '}
          {CURRENCY}.
        </p>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#567' }}>
          API expected at <code>{apiUrl}/health</code>
        </p>
      </div>
    </main>
  );
}
