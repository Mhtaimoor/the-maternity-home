import Link from 'next/link';
import { APP_NAME, STORE_PHONE_DISPLAY, STORE_WHATSAPP_URL } from '@tmh/shared';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/cart', label: 'Cart' },
  { href: '/track', label: 'Track' },
  { href: '/pages/about', label: 'About' },
  { href: '/pages/faq', label: 'FAQ' },
];

export function SiteHeader() {
  return (
    <nav className="navbar navbar-expand-lg tmh-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand tmh-brand fs-4 mb-0 d-flex align-items-center gap-2" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand-mark.png" alt="" width={36} height={36} className="tmh-nav-mark" />
          {APP_NAME}
        </Link>
        <button
          className="navbar-toggler"
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
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {links.map((l) => (
              <li className="nav-item" key={l.href}>
                <Link className="nav-link tmh-nav-link" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="nav-item ms-lg-2">
              <a
                className="btn btn-tmh"
                href={STORE_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`WhatsApp ${STORE_PHONE_DISPLAY}`}
              >
                <i className="bi bi-whatsapp me-1" /> WhatsApp
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
            <p className="text-secondary mb-2 mt-2">
              Maternity, postpartum, newborn and baby essentials — care-focused shopping for Pakistani
              families.
            </p>
            <a className="text-decoration-none" href={STORE_WHATSAPP_URL} target="_blank" rel="noreferrer">
              <i className="bi bi-whatsapp me-1" />
              WhatsApp {STORE_PHONE_DISPLAY}
            </a>
          </div>
          <div className="col-md-3">
            <div className="fw-semibold mb-2">Help</div>
            <div className="d-grid gap-1">
              <Link href="/track">Track order</Link>
              <Link href="/pages/shipping">Shipping</Link>
              <Link href="/pages/returns">Returns</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="fw-semibold mb-2">Policies</div>
            <div className="d-grid gap-1">
              <Link href="/pages/privacy">Privacy</Link>
              <Link href="/pages/terms">Terms</Link>
              <Link href="/pages/faq">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
