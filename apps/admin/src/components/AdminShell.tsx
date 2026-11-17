'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (pathname === '/login') return <>{children}</>;

  const currentLink = links.find((l) => pathname.startsWith(l.href)) || {
    label: 'Admin Portal',
    icon: 'bi-speedometer2',
  };

  return (
    <div className="tmh-shell">
      {/* Mobile Top Header (Displayed on screens < 992px) */}
      <header className="tmh-mobile-header d-lg-none">
        <div className="d-flex align-items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand-mark.png"
            alt=""
            width={34}
            height={34}
            className="tmh-brand-mark"
          />
          <div>
            <div className="tmh-brand fs-6 mb-0 text-white leading-none">TMH Admin</div>
            <div className="tmh-meta d-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
              <i className={`bi ${currentLink.icon} text-success`} />
              <span>{currentLink.label}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="btn btn-tmh-ghost btn-sm px-2 py-1"
            title="Open Storefront"
          >
            <i className="bi bi-box-arrow-up-right me-1" /> Store
          </a>

          <button
            type="button"
            className="tmh-mobile-toggle"
            aria-label="Toggle Navigation Drawer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} />
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="tmh-sidebar-backdrop d-lg-none"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Desktop sidebar & Mobile slide drawer) */}
      <aside className={`tmh-sidebar ${mobileOpen ? 'tmh-sidebar-open' : ''}`}>
        <div className="tmh-sidebar-brand d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand-mark.png"
              alt=""
              width={42}
              height={42}
              className="tmh-brand-mark"
            />
            <div>
              <div className="tmh-brand fs-5 mb-0 text-white">TMH Admin</div>
              <div className="tmh-meta small">The Maternity Home</div>
            </div>
          </div>

          {/* Close button in mobile drawer */}
          <button
            type="button"
            className="btn btn-tmh-ghost btn-sm d-lg-none p-1 px-2"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <nav className="flex-grow-1 tmh-sidebar-nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`tmh-side-link ${pathname.startsWith(l.href) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`bi ${l.icon}`} />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-2 border-top tmh-sidebar-footer" style={{ borderColor: 'var(--tmh-line-soft)' }}>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="tmh-side-link"
            title="Open customer storefront in new tab"
          >
            <i className="bi bi-shop" />
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

      {/* Main Content Area */}
      <main className="tmh-main">{children}</main>
    </div>
  );
}
