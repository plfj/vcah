import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PyVM Obfuscator & Native Rust Virtualizer | Cross-Platform Python Protection',
  description: 'Enterprise-grade Python code virtualizer with Native Rust Virtual Machine, custom VM instructions, opcode remapping, randomized entropy byte stream, and Python 3.7-3.14 support.',
  openGraph: {
    title: 'PyVM Obfuscator & Native Rust Virtualizer',
    description: 'Enterprise-grade Python code virtualizer with Native Rust Virtual Machine, custom VM instructions, opcode remapping, randomized entropy byte stream, and Python 3.7-3.14 support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PyVM Obfuscator & Native Rust Virtualizer',
    description: 'Enterprise-grade Python code virtualizer with Native Rust Virtual Machine, custom VM instructions, opcode remapping, randomized entropy byte stream, and Python 3.7-3.14 support.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#07090e] text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200" suppressHydrationWarning>{children}</body>
    </html>
  );
}
