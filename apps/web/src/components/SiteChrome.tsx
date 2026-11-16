'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, STORE_PHONE_DISPLAY, STORE_WHATSAPP_URL } from '@tmh/shared';

const links = [
  { href: '/shop', label: 'Shop', icon: 'bi-grid' },
  { href: '/cart', label: 'Cart', icon: 'bi-bag' },
  { href: '/track', label: 'Track Order', icon: 'bi-geo-alt' },
  { href: '/pages/about', label: 'Our Story', icon: 'bi-heart' },
  { href: '/pages/faq', label: 'FAQ', icon: 'bi-question-circle' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-expand-lg tmh-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand tmh-brand fs-4 mb-0 d-flex align-items-center gap-2" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand-mark.png" alt="" width={38} height={38} className="tmh-nav-mark" />
          <span>{APP_NAME}</span>
        </Link>
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#tmhNav"
          aria-controls="tmhNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="tmhNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            {links.map((l) => {
              const isActive = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
              return (
                <li className="nav-item" key={l.href}>
                  <Link
                    className={`nav-link tmh-nav-link d-flex align-items-center gap-1 ${
                      isActive ? 'active' : ''
                    }`}
                    href={l.href}
                  >
                    <i className={`bi ${l.icon} opacity-75`} />
                    <span>{l.label}</span>
                  </Link>
                </li>
              );
            })}
            <li className="nav-item ms-lg-2">
              <a
                className="btn btn-tmh py-2 px-3"
                href={STORE_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`WhatsApp ${STORE_PHONE_DISPLAY}`}
              >
                <i className="bi bi-whatsapp me-1 text-white" /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="tmh-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="tmh-brand fs-3 d-flex align-items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brand-mark.png" alt="" width={40} height={40} className="tmh-nav-mark" />
              {APP_NAME}
            </div>
            <p className="text-secondary mb-3 mt-2" style={{ maxWidth: 380, lineHeight: 1.6 }}>
              Maternity, postpartum, newborn and baby care essentials. Thoughtfully curated for comfort,
              safety, and peace of mind for Pakistani mothers and families.
            </p>
            <a
              className="btn btn-tmh-outline btn-sm"
              href={STORE_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-whatsapp me-1" />
              WhatsApp {STORE_PHONE_DISPLAY}
            </a>
          </div>
          <div className="col-md-3">
            <div className="fw-semibold text-dark mb-3 fs-6">Customer Support</div>
            <div className="d-grid gap-2">
              <Link href="/track">Track Order</Link>
              <Link href="/pages/shipping">Shipping & Delivery Rates</Link>
              <Link href="/pages/returns">Returns & Exchange</Link>
              <Link href="/pages/faq">Frequently Asked Questions</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="fw-semibold text-dark mb-3 fs-6">Information & Legal</div>
            <div className="d-grid gap-2">
              <Link href="/pages/about">Our Brand Story</Link>
              <Link href="/pages/privacy">Privacy Policy</Link>
              <Link href="/pages/terms">Terms of Service</Link>
              <div className="text-secondary small mt-2">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
