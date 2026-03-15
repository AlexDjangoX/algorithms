import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AlgorithmGrid } from '@/components/home/AlgorithmGrid';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <AlgorithmGrid />
      </main>
      <Footer />
    </>
  );
}
