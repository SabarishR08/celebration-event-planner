'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Users, Wallet, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Fleuron, Monogram } from '@/components/layout/Brand';
import EventTypeIcon from '@/components/ui/EventTypeIcon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Event, User } from '@/types';
import { formatCurrency, formatDate, getEventTypeLabel, daysUntilEvent } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, eventsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/events'),
      ]);

      if (!userRes.ok) {
        router.push('/auth/login');
        return;
      }

      const userData = await userRes.json();
      if (userData.success) setUser(userData.data.user);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.success) setEvents(eventsData.data);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const totalBudget = events.reduce((sum, e) => sum + Number(e.budget || 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + Number(e.guest_count || 0), 0);
  const activeEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled').length;

  const stats = [
    { label: 'Occasions on the books', value: String(events.length) },
    { label: 'In active planning', value: String(activeEvents) },
    { label: 'Committed budgets', value: formatCurrency(totalBudget) },
    { label: 'Expected guests', value: String(totalGuests) },
  ];

  return (
    <div className="min-h-screen">
      <Navbar userName={user?.name} />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <div>
                <p className="eyebrow mb-3">
                  {user ? `The books of ${user.name.split(' ')[0]}` : 'Your books'}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.02em]">
                  The ledger
                </h1>
                <p className="text-muted mt-3 max-w-lg leading-relaxed">
                  Every occasion you are orchestrating, with its budget, guest count, and
                  countdown kept in one place.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/chat">
                  <Button variant="secondary">Ask the concierge</Button>
                </Link>
                <Link href="/events/new">
                  <Button className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    New occasion
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ledger summary strip */}
            <div className="paper rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border mb-12">
              {stats.map((s) => (
                <div key={s.label} className="px-6 py-6">
                  <p className="eyebrow text-muted mb-2">{s.label}</p>
                  <p className="num font-display text-3xl font-semibold tracking-tight">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Events */}
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Occasions</h2>
              <span className="text-[0.8125rem] text-muted num">
                {events.length} {events.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {events.length === 0 ? (
              <div className="paper rounded-lg">
                <EmptyState
                  icon={<Monogram size={48} />}
                  title="The page is still blank"
                  description="Set the first occasion in motion — the concierge will draft its plan, ledger, and checklist the moment you do."
                  action={
                    <Link href="/events/new">
                      <Button className="mt-2 inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Plan the first one
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {events.map((evt) => {
                  const days = evt.event_date ? daysUntilEvent(evt.event_date) : null;
                  return (
                    <Link key={evt.id} href={`/events/${evt.id}`}>
                      <article className="paper card-hover rounded-lg h-full flex flex-col group">
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between gap-3 mb-5">
                            <EventTypeIcon type={evt.event_type} className="w-11 h-11" size={20} />
                            <Badge status={evt.status}>{evt.status.replace('_', ' ')}</Badge>
                          </div>

                          <p className="eyebrow text-muted mb-1.5">
                            {getEventTypeLabel(evt.event_type)}
                          </p>
                          <h3 className="font-display text-[1.35rem] leading-snug font-semibold tracking-tight group-hover:text-primary transition-colors">
                            {evt.title}
                          </h3>

                          {evt.description && (
                            <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
                              {evt.description}
                            </p>
                          )}

                          <dl className="mt-5 space-y-2 text-[0.8125rem]">
                            {evt.event_date && (
                              <div className="flex items-center gap-2.5 text-muted">
                                <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                                <dt className="sr-only">Date</dt>
                                <dd>
                                  {formatDate(evt.event_date)}
                                  {days !== null && days >= 0 && (
                                    <span className="num text-accent font-semibold">
                                      {' '}· {days} days out
                                    </span>
                                  )}
                                </dd>
                              </div>
                            )}
                            <div className="flex items-center gap-2.5 text-muted">
                              <Wallet className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                              <dt className="sr-only">Budget</dt>
                              <dd className="num">{formatCurrency(Number(evt.budget || 0))}</dd>
                            </div>
                            <div className="flex items-center gap-2.5 text-muted">
                              <Users className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                              <dt className="sr-only">Guests</dt>
                              <dd className="num">{evt.guest_count} guests</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="px-6 py-3.5 border-t border-border flex items-center justify-between text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-muted group-hover:text-primary transition-colors">
                          <span>Open the book</span>
                          <ArrowRight
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                            aria-hidden="true"
                          />
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}

            {events.length > 0 && (
              <div className="flex justify-center mt-14">
                <Fleuron className="opacity-70" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
