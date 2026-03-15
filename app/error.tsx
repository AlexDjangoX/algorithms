"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging and error reporting; avoid swallowing errors.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-center text-muted-foreground">
        {error.message}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          aria-label="Try again"
          className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          aria-label="Back to home"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
