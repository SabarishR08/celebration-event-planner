'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Calendar, DollarSign, Users, MapPin, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
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
    { value: 'wedding', label: '💒 Wedding Celebration' },
    { value: 'birthday', label: '🎂 Birthday Party' },
    { value: 'community', label: '🏘️ Community Gathering / Festival' },
    { value: 'corporate', label: '🏢 Corporate Seminar / Gala' },
    { value: 'anniversary', label: '💍 Anniversary Celebration' },
    { value: 'other', label: '🎉 Other Special Event' },
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
            Plan a New Celebration <Sparkles className="w-6 h-6 text-purple-600" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Provide the foundation of your event. You can immediately generate AI checklists, vendor plans, and budget suggestions.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Card padding="lg" className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  id="title"
                  label="Event Title *"
                  placeholder="e.g., Sarah & Michael's Dream Wedding, Alex's 30th Birthday Bash"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Select
                  id="event_type"
                  label="Celebration Category *"
                  options={eventTypeOptions}
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                  required
                />
              </div>

              <div>
                <Input
                  id="theme"
                  label="Theme or Aesthetic (Optional)"
                  placeholder="e.g., Rustic Boho, Neon Cyberpunk, Enchanted Forest"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
              </div>

              <div>
                <Input
                  id="event_date"
                  type="date"
                  label="Event Date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>

              <div>
                <Input
                  id="event_time"
                  type="time"
                  label="Start Time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </div>

              <div>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="100"
                  label="Estimated Budget ($ USD) *"
                  value={formData.budget.toString()}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Input
                  id="guest_count"
                  type="number"
                  min="1"
                  label="Expected Number of Guests *"
                  value={formData.guest_count.toString()}
                  onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  id="location"
                  label="Venue / Location"
                  placeholder="e.g., Grand Plaza Ballroom, Central Park Picnic Area, Seattle WA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Vision & Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your vision, special traditions, music preferences, or goals for this event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="flex items-center gap-2"
              >
                Create & Launch Planner <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
