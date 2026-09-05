'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-mono font-bold text-red-500">System Error</h1>
          <p className="text-sm text-zinc-400">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
