import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoAgent — AI Business Automation Platform',
  description: 'Turn customer conversations into sales, bookings, and operations automatically with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-[#0F172A] min-h-screen">
        {children}
      </body>
    </html>
  );
}
