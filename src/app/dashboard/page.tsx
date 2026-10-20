'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Calendar, Users, DollarSign, Sparkles, Clock, 
  ArrowRight, CheckSquare, Briefcase, PartyPopper, CheckCircle
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Event, User } from '@/types';
import { formatCurrency, formatDate, getEventTypeEmoji } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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
  };

  const totalBudget = events.reduce((sum, e) => sum + Number(e.budget || 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + Number(e.guest_count || 0), 0);
  const activeEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar userName={user?.name} />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                  Event Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Manage all your upcoming weddings, parties, and celebrations in one unified hub.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/chat">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Planner
                  </Button>
                </Link>
                <Link href="/events/new">
                  <Button variant="primary" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Celebration
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card padding="md" className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Celebrations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{events.length}</p>
                </div>
              </Card>

              <Card padding="md" className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Planning</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeEvents}</p>
                </div>
              </Card>

              <Card padding="md" className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Allocated Budget</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalBudget)}</p>
                </div>
              </Card>

              <Card padding="md" className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Estimated Attendees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalGuests}</p>
                </div>
              </Card>
            </div>

            {/* Events List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Events</h2>
                <span className="text-xs text-gray-500">{events.length} event(s) recorded</span>
              </div>

              {events.length === 0 ? (
                <Card padding="lg" className="text-center py-12">
                  <EmptyState
                    icon={<PartyPopper className="w-12 h-12 text-purple-400 mx-auto" />}
                    title="No celebrations planned yet"
                    description="Create your first event to start organizing budgets, vendor checklists, and schedules with AI!"
                    action={
                      <Link href="/events/new">
                        <Button variant="primary" className="mt-4">
                          <Plus className="w-4 h-4 mr-1.5" /> Plan Your First Event
                        </Button>
                      </Link>
                    }
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((evt) => (
                    <Link key={evt.id} href={`/events/${evt.id}`}>
                      <Card hover padding="lg" className="h-full flex flex-col justify-between group border border-gray-200 dark:border-gray-800">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <span className="text-3xl" role="img" aria-label={evt.event_type}>
                              {getEventTypeEmoji(evt.event_type)}
                            </span>
                            <Badge status={evt.status}>{evt.status.replace('_', ' ')}</Badge>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {evt.title}
                          </h3>

                          {evt.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {evt.description}
                            </p>
                          )}

                          <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                            {evt.event_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                <span>{formatDate(evt.event_date)}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5 text-green-500" />
                              <span>Budget: {formatCurrency(Number(evt.budget || 0))}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-blue-500" />
                              <span>{evt.guest_count} guests anticipated</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-medium text-purple-600 dark:text-purple-400">
                          <span>Open Management Suite</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
