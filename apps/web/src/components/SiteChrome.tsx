import Link from 'next/link';

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
        <Link className="navbar-brand tmh-brand fs-4 mb-0" href="/">
          The Maternity Home
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
                href="https://wa.me/923000000000"
                target="_blank"
                rel="noreferrer"
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
            <div className="tmh-brand fs-3">The Maternity Home</div>
            <p className="text-secondary mb-0 mt-2">
              Maternity, postpartum, newborn and baby essentials — care-focused shopping for Pakistani
              families.
            </p>
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
