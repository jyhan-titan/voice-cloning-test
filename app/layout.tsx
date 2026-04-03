import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MobileDrawerNav } from '@/src/components/layout/MobileDrawerNav';
import { DesktopSidebar } from '@/src/components/layout/DesktopSidebar';
import { QueryProvider } from '@/src/components/QueryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mentofolio Voice Studio',
  description: '멘토폴리오 보이스 스튜디오',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="h-[100dvh] overflow-hidden flex flex-col lg:flex-row"
      >
        <QueryProvider>
          <MobileDrawerNav />
          <DesktopSidebar />
          <main className="flex-1 min-w-0 bg-zinc-50 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
