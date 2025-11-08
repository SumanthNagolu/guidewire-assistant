import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Orchestration Tool',
  description: 'Multi-model AI orchestration for superior planning and decision-making',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

