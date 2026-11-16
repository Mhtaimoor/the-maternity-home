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
    <div className="container-fluid tmh-shell">
      <div className="row g-0">
        <aside className="col-lg-2 tmh-sidebar">
          <div className="tmh-brand fs-4 mb-1 px-2">TMH Admin</div>
          <div className="text-secondary small px-2 mb-3">The Maternity Home</div>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`tmh-side-link ${pathname.startsWith(l.href) ? 'active' : ''}`}
            >
              <i className={`bi ${l.icon}`} />
              {l.label}
            </Link>
          ))}
          <button
            className="tmh-side-link w-100 border-0 bg-transparent mt-3"
            onClick={() => {
              clearTokens();
              router.push('/login');
            }}
          >
            <i className="bi bi-box-arrow-right" />
            Log out
          </button>
        </aside>
        <main className="col-lg-10 tmh-main">{children}</main>
      </div>
    </div>
  );
}
