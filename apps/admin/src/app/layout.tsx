import type { Metadata } from 'next';
import { APP_NAME } from '@tmh/shared';
import { AdminShell } from '../components/AdminShell';
import { BootstrapClient } from '../components/BootstrapClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/tmh-admin.css';

export const metadata: Metadata = {
  title: `${APP_NAME} Admin`,
  description: 'Staff admin portal',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="tmh-admin-body">
        <BootstrapClient />
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
