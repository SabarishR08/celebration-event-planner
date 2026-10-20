import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CelebPlan AI - Smart Celebration & Event Planner',
  description:
    'AI-powered planning assistant for organizing weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.',
  keywords: ['event planner', 'wedding planner', 'birthday planner', 'AI assistant', 'celebration'],
  authors: [{ name: 'CelebPlan AI' }],
  openGraph: {
    title: 'CelebPlan AI - Smart Celebration & Event Planner',
    description: 'AI-powered event planning assistant',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
