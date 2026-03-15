import Link from "next/link";

const ALGORITHMS = [
  {
    id: "library-sort",
    name: "Library Sort",
    description:
      "Gapped insertion sort — like a librarian leaving space on shelves for new books.",
    category: "Sorting",
    complexity: "O(n log n)",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-zinc-100">
            AlgoViz
          </Link>
          <span className="text-sm text-zinc-500">
            Learn algorithms visually
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
            Visualize Algorithms
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-500">
            Step through algorithms with synchronized visualization and code
            execution. Understand how they work, line by line.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ALGORITHMS.map((algo) => (
            <Link
              key={algo.id}
              href={`/algorithms/${algo.id}`}
              className="group cursor-pointer rounded-xl border border-white/5 bg-zinc-900/80 p-6 transition-all duration-150 hover:border-rose-500/30 hover:bg-zinc-900 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <span className="text-xs font-medium text-rose-400">
                {algo.category}
              </span>
              <h2 className="mt-2 text-lg font-semibold text-zinc-100 group-hover:text-rose-400">
                {algo.name}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">{algo.description}</p>
              <p className="mt-4 font-mono text-xs text-zinc-600">
                {algo.complexity}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-zinc-600">
          More algorithms coming soon.
        </p>
      </main>
    </div>
  );
}
