import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-mono font-bold text-amber-500">404</h1>
        <h2 className="text-lg font-semibold text-zinc-200">Page Not Found</h2>
        <p className="text-sm text-zinc-400">
          The requested resource could not be found. Return to the PyVM Obfuscator workspace.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors"
        >
          Back to Workspace
        </Link>
      </div>
    </div>
  );
}
