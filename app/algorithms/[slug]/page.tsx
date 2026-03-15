import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAlgorithmConfig, getLiveSlugs } from '@/app/lib/algorithm-registry';
import { AlgorithmPageContent } from '@/components/algorithm-page/AlgorithmPageContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getAlgorithmConfig(slug);
  if (!config) {
    return { title: 'Algorithm — AlgoViz' };
  }
  return {
    title: `${config.name} — AlgoViz`,
    description: config.description,
  };
}

export async function generateStaticParams() {
  return getLiveSlugs().map((slug) => ({ slug }));
}

export default async function AlgorithmPage({ params }: PageProps) {
  const { slug } = await params;
  const config = getAlgorithmConfig(slug);
  if (!config) notFound();
  return <AlgorithmPageContent slug={slug} />;
}
