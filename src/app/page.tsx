'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Wordmark, Fleuron, Monogram } from '@/components/layout/Brand';
import EventTypeIcon from '@/components/ui/EventTypeIcon';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const COLLECTIONS = [
  {
    slug: 'wedding',
    name: 'Weddings',
    line: 'Multi-day ceremonies, registries, and seating charts that actually balance.',
  },
  {
    slug: 'birthday',
    name: 'Birthdays',
    line: 'From intimate dinners to surprise parties with coordinated vendor crews.',
  },
  {
    slug: 'community',
    name: 'Community Gatherings',
    line: 'Festivals, fundraisers, and block parties with volunteer scheduling.',
  },
  {
    slug: 'corporate',
    name: 'Corporate Events',
    line: 'Conferences and galas with run-of-show timelines and invoicing.',
  },
  {
    slug: 'anniversary',
    name: 'Anniversaries',
    line: 'Milestone years deserve guest books, toasts, and careful pacing.',
  },
] as const;

const SUITE = [
  {
    num: '01',
    title: 'The Consultation',
    body:
      'Describe the occasion in plain words. The GenAI concierge drafts a complete master plan — milestones, themes, and a minute-by-minute run of show — calibrated to your guest count and budget.',
  },
  {
    num: '02',
    title: 'The Ledger',
    body:
      'A budget that keeps itself. Log estimates against actuals per category, watch the remaining buffer in real time, and ask the optimizer where to cut without cutting corners.',
  },
  {
    num: '03',
    title: 'The Directory',
    body:
      'Every vendor in one place with negotiation states, contact details, and the essential contract questions to ask — surfaced by the AI before you sign.',
  },
  {
    num: '04',
    title: 'The Register',
    body:
      'RSVPs, plus-ones, and dietary restrictions in a guest register that turns headcounts into catering numbers.',
  },
  {
    num: '05',
    title: 'The Day-Of Book',
    body:
      'An hour-by-hour itinerary your whole party can follow — from first arrival to the last song — printable and shareable.',
  },
] as const;

const STEPS = [
  {
    num: 'I',
    title: 'Set the scene',
    body: 'Occasion, date, venue, guest count, and the budget you have in mind.',
  },
  {
    num: 'II',
    title: 'Receive the draft',
    body: 'The concierge composes your plan, checklist, and vendor shortlist in seconds.',
  },
  {
    num: 'III',
    title: 'Refine & deliver',
    body: 'Adjust anything, track every detail, and walk into the day with the book already written.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Wordmark />
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/auth/login"
                className="px-3 py-2 text-[0.8125rem] font-medium tracking-[0.06em] uppercase text-muted hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[0.8125rem] font-semibold tracking-[0.06em] uppercase bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
              >
                Begin
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-1">
        {/* ============================= HERO ============================= */}
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-center">
              {/* Copy */}
              <div className="lg:col-span-7 animate-rise">
                <p className="eyebrow mb-6">Est. for the joyfully organised</p>
                <h1
                  id="hero-heading"
                  className="font-display text-[2.75rem] leading-[1.04] sm:text-6xl lg:text-[4.4rem] font-semibold tracking-[-0.02em] text-foreground"
                >
                  Every great affair
                  <br />
                  is <em className="italic font-light text-primary">composed</em>,
                  <br className="hidden sm:block" /> not improvised.
                </h1>
                <p className="mt-7 text-lg leading-relaxed text-muted max-w-xl">
                  CelebPlan is a GenAI concierge for weddings, birthdays, and community
                  gatherings — drafting master plans, ledgers, vendor directories, and
                  day-of itineraries, then keeping every one of them honest.
                </p>

                <div className="mt-9 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-md font-semibold text-sm tracking-[0.05em] uppercase hover:bg-primary-hover transition-colors shadow-[0_1px_0_rgba(0,0,0,0.15)]"
                  >
                    Open the atelier
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="inline-flex items-center justify-center px-7 py-3.5 border border-border-strong rounded-md font-semibold text-sm tracking-[0.05em] uppercase text-foreground hover:border-accent hover:text-primary transition-colors"
                  >
                    I have an account
                  </button>
                </div>

                <p className="mt-8 text-[0.8125rem] text-muted flex items-center gap-2">
                  <Fleuron className="opacity-80" />
                  Free while the module runs · No card required
                </p>
              </div>

              {/* Invitation specimen card */}
              <div className="lg:col-span-5 animate-rise delay-2 relative" aria-hidden="true">
                <div className="paper frame-ornate rounded-lg p-7 sm:p-8 sm:pb-28 relative">
                  <div className="flex items-center justify-between mb-6">
                    <span className="eyebrow">You are cordially invited</span>
                    <Monogram size={26} className="text-accent" />
                  </div>

                  <p className="font-display text-3xl sm:text-[2.1rem] leading-tight font-semibold tracking-tight">
                    Sarah &amp; Michael
                  </p>
                  <p className="mt-1.5 font-display italic font-light text-muted text-lg">
                    a garden wedding, under the late-summer sun
                  </p>

                  <div className="my-6 h-px bg-border" />

                  <dl className="space-y-3 text-sm">
                    {[
                      ['Date', 'Saturday, 14 September'],
                      ['Venue', 'The Willow Estate, Ridgefield'],
                      ['Guests', '120 seated'],
                      ['Budget', '$18,000 — ledger balanced'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline gap-4">
                        <dt className="eyebrow w-16 shrink-0 text-muted">{k}</dt>
                        <dd className="text-foreground font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-7">
                    <div className="flex items-baseline justify-between text-[0.7rem] tracking-[0.14em] uppercase text-muted mb-2">
                      <span>Planning</span>
                      <span className="num text-accent font-semibold">68%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full w-[68%] bg-accent rounded-full" />
                    </div>
                    <p className="mt-3 text-[0.8125rem] text-muted">
                      12 vendors booked · 24 of 31 tasks · 96 RSVPs in
                    </p>
                  </div>
                </div>

                {/* Floating concierge note */}
                <div className="absolute -bottom-8 left-2 sm:-left-10 w-[15.5rem] paper rounded-lg p-4 shadow-[0_12px_32px_-16px_rgba(36,29,22,0.4)]">
                  <p className="eyebrow mb-1.5">Concierge note</p>
                  <p className="text-[0.8125rem] leading-relaxed text-foreground">
                    Move the cake cutting to{' '}
                    <span className="num font-semibold text-primary">8:40 pm</span> — golden
                    hour photography ends at 8:55.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== COLLECTIONS ========================= */}
        <section className="border-y border-border bg-surface-2/40" aria-labelledby="collections-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <p className="eyebrow mb-3">The collection</p>
                <h2 id="collections-heading" className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                  Occasions we keep books for
                </h2>
              </div>
              <Fleuron className="hidden sm:inline-flex mb-2" />
            </div>

            <ul className="divide-y divide-border border-y border-border">
              {COLLECTIONS.map((item, i) => (
                <li key={item.slug}>
                  <Link
                    href="/auth/register"
                    className="group grid sm:grid-cols-12 gap-2 sm:gap-6 items-center py-5 transition-colors hover:bg-surface/70 px-2 -mx-2 rounded"
                    aria-label={`Start planning a ${item.name}`}
                  >
                    <span className="sm:col-span-1 num text-[0.8125rem] font-semibold text-accent tracking-widest">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="sm:col-span-3 flex items-center gap-3">
                      <EventTypeIcon type={item.slug} size={17} className="w-9 h-9" />
                      <span className="font-display text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </span>
                    <span className="sm:col-span-7 text-[0.9375rem] text-muted leading-relaxed">
                      {item.line}
                    </span>
                    <ArrowUpRight
                      className="hidden sm:block sm:col-span-1 w-4 h-4 ml-auto text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============================ SUITE ============================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28" aria-labelledby="suite-heading">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow mb-4">The atelier suite</p>
                <h2 id="suite-heading" className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                  Five rooms,
                  <br />
                  one address book.
                </h2>
                <p className="mt-5 text-muted leading-relaxed max-w-sm">
                  Planning usually sprawls across notebooks, spreadsheets, and group chats.
                  The suite gathers it under one roof — and the concierge reads all of it
                  before it answers a single question.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8">
              <ol className="border-t border-border">
                {SUITE.map((item) => (
                  <li
                    key={item.num}
                    className="group grid sm:grid-cols-12 gap-3 sm:gap-8 py-8 border-b border-border"
                  >
                    <span className="sm:col-span-2 font-display text-2xl font-semibold text-accent num">
                      {item.num}
                    </span>
                    <h3 className="sm:col-span-3 font-display text-xl font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="sm:col-span-7 text-[0.9375rem] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============================= STEPS ============================ */}
        <section className="border-t border-border bg-surface-2/40" aria-labelledby="steps-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow mb-4">Correspondence course</p>
              <h2 id="steps-heading" className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                From first letter to final toast
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
              {STEPS.map((step, i) => (
                <article
                  key={step.num}
                  className={cn(
                    'relative paper rounded-lg p-7 text-center',
                    i === 1 && 'md:-translate-y-3'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-accent/10 font-display text-lg font-semibold text-accent"
                  >
                    {step.num}
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[0.9375rem] leading-relaxed text-muted">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== CTA ============================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28" aria-labelledby="cta-heading">
          <div className="bg-ink frame-ornate-dark rounded-lg px-8 py-14 sm:px-16 sm:py-20 text-center">
            <Monogram size={40} className="mx-auto text-accent mb-6" />
            <h2
              id="cta-heading"
              className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#f5eee1] leading-tight"
            >
              Your celebration deserves
              <br className="hidden sm:block" /> a proper rehearsal.
            </h2>
            <p className="mt-5 text-[#c9bba4] max-w-xl mx-auto leading-relaxed">
              Open the atelier, describe the occasion, and watch a full plan assemble itself
              — then make it yours, detail by detail.
            </p>
            <button
              onClick={() => router.push('/auth/register')}
              className="mt-9 inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-accent-foreground rounded-md font-semibold text-sm tracking-[0.05em] uppercase hover:bg-[#b8934d] transition-colors"
            >
              Begin planning
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <Wordmark href={null} markSize={26} />
            <p className="text-[0.8125rem] text-muted flex items-center gap-3">
              <Fleuron className="opacity-70" />
              <span>&copy; {new Date().getFullYear()} CelebPlan · Composed with GenAI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
