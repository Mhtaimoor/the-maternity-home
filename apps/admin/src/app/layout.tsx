import type { Metadata } from 'next';
import { APP_NAME } from '@tmh/shared';
import { AdminShell } from '../components/AdminShell';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME} Admin`,
  description: 'Staff admin portal',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
