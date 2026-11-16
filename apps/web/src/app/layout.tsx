import type { Metadata } from 'next';
import { APP_NAME } from '@tmh/shared';
import './globals.css';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Maternity, postpartum, newborn and baby essentials — Pakistan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
