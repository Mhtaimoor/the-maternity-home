import { APP_NAME } from '@tmh/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function AdminHomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: '#0f1f1c',
        color: '#e8f0ee',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <p style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12, opacity: 0.7 }}>
          Admin portal shell
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', margin: '0.6rem 0' }}>
          {APP_NAME}
        </h1>
        <p style={{ lineHeight: 1.5, opacity: 0.85 }}>
          Phase 0 placeholder. Login, catalogue, and order desk arrive in Phases 1–5.
        </p>
        <p style={{ fontSize: 14, opacity: 0.65 }}>
          API expected at <code>{apiUrl}/health</code>
        </p>
      </div>
    </main>
  );
}
