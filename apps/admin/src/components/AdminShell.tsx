'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearTokens } from '../lib/api';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { href: '/orders', label: 'Orders', icon: 'bi-bag-check' },
  { href: '/products', label: 'Products', icon: 'bi-box-seam' },
  { href: '/categories', label: 'Categories', icon: 'bi-tags' },
  { href: '/delivery', label: 'Delivery', icon: 'bi-truck' },
  { href: '/coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
  { href: '/content', label: 'Content', icon: 'bi-file-earmark-text' },
  { href: '/reports', label: 'Reports', icon: 'bi-graph-up' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="d-flex tmh-shell">
      <aside className="tmh-sidebar">
        <div className="tmh-sidebar-brand">
          <div className="d-flex align-items-center gap-2 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand-mark.png" alt="" width={42} height={42} className="tmh-brand-mark" />
            <div>
              <div className="tmh-brand fs-5 mb-0 text-white">TMH Admin</div>
              <div className="tmh-meta small">The Maternity Home</div>
            </div>
          </div>
        </div>

        <nav className="flex-grow-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`tmh-side-link ${pathname.startsWith(l.href) ? 'active' : ''}`}
            >
              <i className={`bi ${l.icon}`} />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-2 border-top" style={{ borderColor: 'var(--tmh-line-soft)' }}>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="tmh-side-link"
            title="Open customer storefront in new tab"
          >
            <i className="bi bi-box-arrow-up-right" />
            <span>View Storefront</span>
          </a>

          <button
            className="tmh-side-link w-100 border-0 bg-transparent text-start"
            onClick={() => {
              clearTokens();
              router.push('/login');
            }}
          >
            <i className="bi bi-box-arrow-right text-danger" />
            <span className="text-danger">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="tmh-main">{children}</main>
    </div>
  );
}
