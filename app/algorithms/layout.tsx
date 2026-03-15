import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AlgorithmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
