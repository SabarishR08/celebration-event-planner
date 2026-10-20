import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
});

export const metadata: Metadata = {
  title: 'CelebPlan — The Celebration Atelier',
  description:
    'A GenAI-powered planning atelier for weddings, birthdays, and community gatherings — budgets, run-of-show timelines, vendor checklists, and personalised ideas in one place.',
  keywords: ['event planner', 'wedding planner', 'birthday planner', 'AI assistant', 'celebration'],
  authors: [{ name: 'CelebPlan' }],
  openGraph: {
    title: 'CelebPlan — The Celebration Atelier',
    description: 'A GenAI-powered celebration & event planning atelier',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
