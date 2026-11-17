import type { Metadata } from 'next';
import { APP_NAME } from '@tmh/shared';
import { BootstrapClient } from '../components/BootstrapClient';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/tmh.css';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Maternity, postpartum, newborn and baby essentials — Pakistan',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="tmh-body">
        <BootstrapClient />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
