import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'PulseCommerce | High-Performance Hardware & Flash Drops',
  description: 'Production-grade e-commerce platform engineered with Next.js, Prisma, Redis, and Stripe. Featuring real-time concurrency stock locks and idempotent payments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 4.5rem)' }}>
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
