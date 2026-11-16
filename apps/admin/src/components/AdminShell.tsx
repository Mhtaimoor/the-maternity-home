'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearTokens } from '../lib/api';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Orders' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/delivery', label: 'Delivery' },
  { href: '/coupons', label: 'Coupons' },
  { href: '/content', label: 'Content' },
  { href: '/reports', label: 'Reports' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">TMH Admin</div>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
        <button
          onClick={() => {
            clearTokens();
            router.push('/login');
          }}
        >
          Log out
        </button>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}
