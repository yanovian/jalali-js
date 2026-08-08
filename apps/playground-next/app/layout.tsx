import type { ReactNode } from 'react';

export const metadata = {
  title: 'jalali-js playground (Next.js)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
