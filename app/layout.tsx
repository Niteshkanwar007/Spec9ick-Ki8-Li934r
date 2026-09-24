import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Spec9ick-Ki8-Li934r: Linear Spec Kit Workflow Engine',
  description: 'Transform rough ideas into structured Linear issue workflows with versioned specs, auto-clipboard commands, child tasks, and clean git branch creation.',
  openGraph: {
    title: 'Spec9ick-Ki8-Li934r: Linear Spec Kit Workflow Engine',
    description: 'Transform rough ideas into structured Linear issue workflows with versioned specs, auto-clipboard commands, child tasks, and clean git branch creation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spec9ick-Ki8-Li934r: Linear Spec Kit Workflow Engine',
    description: 'Transform rough ideas into structured Linear issue workflows with versioned specs, auto-clipboard commands, child tasks, and clean git branch creation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
