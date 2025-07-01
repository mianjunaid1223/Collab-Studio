import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { Poppins, PT_Sans } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Pixel Canvas Collab',
  description: 'A collaborative canvas for digital mindfulness and teamwork.',
};

const fontPoppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

const fontPtSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", fontPoppins.variable, fontPtSans.variable)} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-body antialiased')} suppressHydrationWarning>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
