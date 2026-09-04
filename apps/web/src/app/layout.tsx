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
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
