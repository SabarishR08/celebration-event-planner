'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Fleuron } from '@/components/layout/Brand';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { EventType } from '@/types';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    event_type: 'wedding' as EventType,
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    guest_count: 50,
    budget: 5000,
    theme: '',
    notes: '',
  });

  const eventTypeOptions = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'community', label: 'Community gathering or festival' },
    { value: 'corporate', label: 'Corporate seminar or gala' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'other', label: 'Another celebration' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          guest_count: Number(formData.guest_count),
          budget: Number(formData.budget),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create event');
      }

      router.push(`/events/${data.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase text-muted hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to the ledger
        </Link>

        <header className="text-center mb-10">
          <p className="eyebrow mb-3">A new chapter</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Set a new occasion in motion
          </h1>
          <p className="text-muted text-[0.9375rem] mt-3 max-w-lg mx-auto leading-relaxed">
            Give the concierge the essentials — it will draft the master plan, ledger, and
            checklist around them.
          </p>
          <Fleuron className="mt-5 opacity-80" />
        </header>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/40 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <Card padding="lg" className="frame-ornate">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  id="title"
                  label="Occasion title *"
                  placeholder="e.g. Sarah & Michael's Garden Wedding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <Select
                id="event_type"
                label="Kind of occasion *"
                options={eventTypeOptions}
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                required
              />

              <Input
                id="theme"
                label="Theme or aesthetic"
                placeholder="e.g. rustic boho, enchanted forest"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              />

              <Input
                id="event_date"
                type="date"
                label="Date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />

              <Input
                id="event_time"
                type="time"
                label="Start time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              />

              <Input
                id="budget"
                type="number"
                min="0"
                step="100"
                label="Budget (USD) *"
                value={formData.budget.toString()}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                required
              />

              <Input
                id="guest_count"
                type="number"
                min="1"
                label="Expected guests *"
                value={formData.guest_count.toString()}
                onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                required
              />

              <div className="md:col-span-2">
                <Input
                  id="location"
                  label="Venue or location"
                  placeholder="e.g. The Willow Estate, Ridgefield"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-[0.8125rem] font-semibold tracking-[0.02em] text-foreground mb-1.5">
                  Vision &amp; notes
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-md border border-border-strong bg-surface text-foreground placeholder:text-muted/70 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-accent transition-colors"
                  placeholder="Traditions to honour, music you love, the mood you are after…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-5 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading} className="inline-flex items-center gap-2">
                Draft the plan
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
