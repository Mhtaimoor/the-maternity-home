import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header container">
      <Link href="/" className="brand">
        The Maternity Home
      </Link>
      <nav className="nav">
        <Link href="/shop">Shop</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/track">Track order</Link>
        <Link href="/pages/about">About</Link>
        <Link href="/pages/faq">FAQ</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div>
        <strong>The Maternity Home</strong>
        <div className="muted">Maternity · postpartum · newborn essentials</div>
      </div>
      <div className="nav">
        <Link href="/pages/shipping">Shipping</Link>
        <Link href="/pages/returns">Returns</Link>
        <Link href="/pages/privacy">Privacy</Link>
        <Link href="/pages/terms">Terms</Link>
      </div>
    </footer>
  );
}
