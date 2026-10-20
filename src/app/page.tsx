'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PartyPopper, Calendar, Users, DollarSign, ClipboardList, 
  Sparkles, ArrowRight, CheckCircle, Star
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: 'AI-Powered Planning',
      description: 'Get personalized event recommendations, theme ideas, and vendor suggestions powered by advanced AI.',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: 'Smart Budget Management',
      description: 'Track expenses, optimize budget allocation, and get AI-driven cost-saving tips.',
    },
    {
      icon: <ClipboardList className="w-8 h-8 text-blue-500" />,
      title: 'Vendor Checklists',
      description: 'Manage vendor contacts, track booking status, and never miss an important detail.',
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      title: 'Timeline Builder',
      description: 'Create detailed planning timelines and day-of schedules with milestone tracking.',
    },
    {
      icon: <Users className="w-8 h-8 text-pink-500" />,
      title: 'Guest Management',
      description: 'Track RSVPs, manage seating arrangements, and handle dietary requirements.',
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'Personalized Ideas',
      description: 'Get creative suggestions tailored to your event type, theme, and cultural preferences.',
    },
  ];

  const eventTypes = [
    { emoji: '💒', name: 'Weddings', color: 'from-pink-500 to-rose-500' },
    { emoji: '🎂', name: 'Birthdays', color: 'from-purple-500 to-violet-500' },
    { emoji: '🏘️', name: 'Community Events', color: 'from-blue-500 to-cyan-500' },
    { emoji: '🏢', name: 'Corporate Events', color: 'from-gray-600 to-gray-800' },
    { emoji: '💍', name: 'Anniversaries', color: 'from-amber-500 to-orange-500' },
    { emoji: '🎉', name: 'Other Celebrations', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-[var(--border)]" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2" aria-label="CelebPlan AI Home">
              <PartyPopper className="w-8 h-8 text-[var(--primary)]" />
              <span className="text-xl font-bold gradient-text">CelebPlan AI</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Powered by GenAI
              </div>
              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
                Plan Your Perfect{' '}
                <span className="gradient-text">Celebration</span>{' '}
                with AI
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto animate-fade-in">
                Your intelligent event planning assistant that helps organize weddings, birthdays, and community events with smart budgets, timelines, and personalized ideas.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  Start Planning Free
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full sm:w-auto px-8 py-3.5 border-2 border-[var(--border)] rounded-xl font-semibold hover:bg-[var(--secondary)] transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="py-16 bg-white dark:bg-gray-900" aria-labelledby="events-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="events-heading" className="text-2xl font-bold text-center mb-10">Plan Any Celebration</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {eventTypes.map((type) => (
                <div
                  key={type.name}
                  className="flex flex-col items-center p-4 rounded-xl bg-[var(--secondary)] hover:shadow-md transition-all cursor-pointer card-hover"
                  onClick={() => router.push('/auth/register')}
                  role="button"
                  tabIndex={0}
                  aria-label={`Plan a ${type.name} event`}
                  onKeyDown={(e) => { if (e.key === 'Enter') router.push('/auth/register'); }}
                >
                  <span className="text-4xl mb-2" aria-hidden="true">{type.emoji}</span>
                  <span className="text-sm font-medium text-center">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[var(--secondary)]" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl font-bold mb-4">Everything You Need to Plan</h2>
              <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                From initial ideas to the big day, our AI assistant guides you through every step of event planning.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-[var(--border)] shadow-sm card-hover"
                >
                  <div className="mb-4" aria-hidden="true">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[var(--muted-foreground)] text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20" aria-labelledby="how-it-works-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Tell Us About Your Event', desc: 'Share your event type, date, budget, and guest count. Our AI will understand your needs.' },
                { step: '2', title: 'Get AI-Powered Plans', desc: 'Receive personalized recommendations for vendors, themes, timelines, and budget breakdowns.' },
                { step: '3', title: 'Manage & Execute', desc: 'Track tasks, manage vendors, send invites, and stay on top of your budget — all in one place.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-[var(--muted-foreground)] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-violet-600 text-white" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold mb-4">Ready to Plan Your Celebration?</h2>
            <p className="text-purple-100 mb-8 text-lg">
              Join thousands of happy event planners who trust CelebPlan AI for their special occasions.
            </p>
            <button
              onClick={() => router.push('/auth/register')}
              className="px-8 py-3.5 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg inline-flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
              Start Planning Now — It&apos;s Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-6 h-6 text-purple-400" aria-hidden="true" />
              <span className="text-white font-semibold">CelebPlan AI</span>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} CelebPlan AI. Built with GenAI for smarter event planning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
