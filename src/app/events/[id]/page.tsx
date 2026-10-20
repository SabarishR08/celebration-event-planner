'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, Users, Wallet, Clock, CheckSquare,
  Plus, ArrowLeft, Building2, MapPin, Send, PenLine
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Fleuron, Monogram } from '@/components/layout/Brand';
import EventTypeIcon from '@/components/ui/EventTypeIcon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Event, Vendor, Task, BudgetItem, Guest, TimelineItem } from '@/types';
import { formatCurrency, formatDate, getEventTypeLabel, cn } from '@/lib/utils';

type TabId = 'overview' | 'vendors' | 'tasks' | 'budget' | 'guests' | 'timeline' | 'ai';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Modals
  const [vendorModal, setVendorModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [guestModal, setGuestModal] = useState(false);
  const [timelineModal, setTimelineModal] = useState(false);

  // Forms
  const [vendorForm, setVendorForm] = useState({ name: '', category: 'Catering', estimated_cost: 0, contact_email: '', contact_phone: '', notes: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium' as any, due_date: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'Venue', description: '', estimated_amount: 0, actual_amount: 0 });
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '', plus_one: false, dietary_restrictions: '' });
  const [timelineForm, setTimelineForm] = useState({ title: '', description: '', start_time: '', category: 'General' });

  // AI Assistant in event context
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) {
        if (res.status === 401) router.push('/auth/login');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setEvent(json.data.event);
        setVendors(json.data.vendors);
        setTasks(json.data.tasks);
        setBudgetItems(json.data.budgetItems);
        setGuests(json.data.guests);
        setTimeline(json.data.timeline);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vendorForm, estimated_cost: Number(vendorForm.estimated_cost) }),
      });
      if (res.ok) {
        setVendorModal(false);
        setVendorForm({ name: '', category: 'Catering', estimated_cost: 0, contact_email: '', contact_phone: '', notes: '' });
        fetchEventDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setTaskModal(false);
        setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
        fetchEventDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...budgetForm,
          estimated_amount: Number(budgetForm.estimated_amount),
          actual_amount: Number(budgetForm.actual_amount),
        }),
      });
      if (res.ok) {
        setBudgetModal(false);
        setBudgetForm({ category: 'Venue', description: '', estimated_amount: 0, actual_amount: 0 });
        fetchEventDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestForm),
      });
      if (res.ok) {
        setGuestModal(false);
        setGuestForm({ name: '', email: '', phone: '', plus_one: false, dietary_restrictions: '' });
        fetchEventDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timelineForm),
      });
      if (res.ok) {
        setTimelineModal(false);
        setTimelineForm({ title: '', description: '', start_time: '', category: 'General' });
        fetchEventDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async (customPrompt?: string) => {
    const text = customPrompt || aiPrompt;
    if (!text || aiLoading) return;
    setAiLoading(true);
    setAiResponses((prev) => [...prev, { role: 'user', content: text }]);
    setAiPrompt('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, eventId: Number(eventId) }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponses((prev) => [...prev, { role: 'assistant', content: data.data.message }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const totalSpent = budgetItems.reduce((acc, b) => acc + Number(b.actual_amount || b.estimated_amount || 0), 0);
  const totalAllocated = budgetItems.reduce((acc, b) => acc + Number(b.estimated_amount || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const acceptedRsvps = guests.filter((g) => g.rsvp_status === 'accepted').length;

  if (loading || !event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-28 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'vendors', label: `Vendors (${vendors.length})` },
    { id: 'tasks', label: `Checklist (${tasks.length})` },
    { id: 'budget', label: 'Ledger' },
    { id: 'guests', label: `Register (${guests.length})` },
    { id: 'timeline', label: `Itinerary (${timeline.length})` },
    { id: 'ai', label: 'Concierge' },
  ];

  const sectionHeader = (title: string, subtitle: string, action?: React.ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to the ledger
        </Link>

        {/* ===== Event suite cover ===== */}
        <header className="paper frame-ornate rounded-lg px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-7">
            <div className="flex items-start gap-5">
              <EventTypeIcon type={event.event_type} className="w-14 h-14" size={26} />
              <div>
                <p className="eyebrow mb-2">
                  {getEventTypeLabel(event.event_type)} · {event.status.replace('_', ' ')}
                </p>
                <h1 className="font-display text-3xl sm:text-[2.5rem] leading-tight font-semibold tracking-[-0.02em]">
                  {event.title}
                </h1>
                {event.theme && (
                  <p className="font-display italic font-light text-muted text-lg mt-1">
                    {event.theme}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[0.8125rem] text-muted">
                  {event.event_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                      {formatDate(event.event_date)}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span className="num">{event.guest_count}</span>&nbsp;guests
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span className="num">{formatCurrency(Number(event.budget))}</span>
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setActiveTab('ai');
                handleAskAI(`Generate a comprehensive event plan, checklist, and vendor suggestions for this ${event.event_type} (${event.title}) with a budget of $${event.budget} and ${event.guest_count} guests.`);
              }}
              className="inline-flex items-center gap-2 self-start md:self-auto shrink-0"
            >
              <PenLine className="w-4 h-4" aria-hidden="true" /> Compose the full plan
            </Button>
          </div>
        </header>

        {/* ===== Tabs ===== */}
        <nav className="border-b border-border overflow-x-auto" aria-label="Event sections">
          <div className="flex items-center gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={cn(
                  'relative py-3 text-[0.8125rem] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-colors',
                  activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-foreground'
                )}
              >
                {tab.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-px left-0 right-0 h-[2px] bg-accent transition-transform duration-300',
                    activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </button>
            ))}
          </div>
        </nav>

        {/* ===== Overview ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="md">
                <p className="eyebrow text-muted mb-2">Checklist progress</p>
                <p className="num font-display text-3xl font-semibold tracking-tight">
                  {completedTasks}
                  <span className="text-muted text-xl"> / {tasks.length}</span>
                </p>
                <div className="w-full bg-surface-2 rounded-full h-1.5 mt-3" role="presentation">
                  <div
                    className="bg-accent h-1.5 rounded-full transition-all"
                    style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </Card>

              <Card padding="md">
                <p className="eyebrow text-muted mb-2">Committed so far</p>
                <p className="num font-display text-3xl font-semibold tracking-tight">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-xs text-muted mt-2 num">
                  of {formatCurrency(Number(event.budget))} budgeted
                </p>
              </Card>

              <Card padding="md">
                <p className="eyebrow text-muted mb-2">RSVPs accepted</p>
                <p className="num font-display text-3xl font-semibold tracking-tight">
                  {acceptedRsvps}
                  <span className="text-muted text-xl"> / {guests.length || event.guest_count}</span>
                </p>
                <p className="text-xs text-muted mt-2 num">target {event.guest_count} guests</p>
              </Card>
            </div>

            {event.description && (
              <Card padding="lg">
                <h3 className="font-display text-xl font-semibold tracking-tight mb-2">The vision</h3>
                <p className="text-[0.9375rem] text-muted leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card padding="lg" className="bg-accent-soft/50 border-accent/30">
                <h3 className="font-display text-xl font-semibold tracking-tight flex items-center gap-2 mb-1.5">
                  <Monogram size={20} className="text-accent" /> Ask the concierge
                </h3>
                <p className="text-sm text-muted mb-4">
                  Shortcuts the AI can draft from this event&apos;s own numbers.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('ai');
                      handleAskAI(`Generate a detailed checklist of vendors needed for my ${event.event_type} (${event.title}) with cost estimates.`);
                    }}
                  >
                    Vendor checklist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('ai');
                      handleAskAI(`Create an optimized budget breakdown for $${event.budget} for this ${event.event_type}.`);
                    }}
                  >
                    Optimize the ledger
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('ai');
                      handleAskAI(`Create a minute-by-minute day-of schedule and run-of-show timeline for my ${event.event_type}.`);
                    }}
                  >
                    Day-of itinerary
                  </Button>
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="font-display text-xl font-semibold tracking-tight mb-3">Next up</h3>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted">
                    Nothing on the checklist yet — open the Checklist tab to add the first milestone.
                  </p>
                ) : (
                  <ul className="space-y-0">
                    {tasks.slice(0, 4).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-b-0 text-sm"
                      >
                        <span className={cn(t.status === 'completed' ? 'line-through text-muted' : 'font-medium')}>
                          {t.title}
                        </span>
                        <Badge status={t.priority}>{t.priority}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ===== Vendors ===== */}
        {activeTab === 'vendors' && (
          <div className="animate-fade-in">
            {sectionHeader(
              'The directory',
              'Caterers, venues, photographers, florists — with their negotiation states.',
              <Button size="sm" onClick={() => setVendorModal(true)} className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" aria-hidden="true" /> Add vendor
              </Button>
            )}

            {vendors.length === 0 ? (
              <div className="paper rounded-lg">
                <EmptyState
                  icon={<Building2 className="w-10 h-10 mx-auto" strokeWidth={1.5} />}
                  title="The directory is empty"
                  description="Add vendors by hand, or ask the concierge which categories your occasion calls for."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setVendorModal(true)} className="mt-2">
                      Add the first vendor
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((v) => (
                  <Card key={v.id} padding="md" className="flex flex-col">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <span className="eyebrow text-accent">{v.category}</span>
                      <Badge status={v.status}>{v.status}</Badge>
                    </div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">{v.name}</h3>
                    <p className="text-sm text-muted mt-1 num">
                      Estimated <span className="font-semibold text-foreground">{formatCurrency(Number(v.estimated_cost))}</span>
                    </p>
                    {v.contact_email && <p className="text-xs text-muted mt-1">{v.contact_email}</p>}
                    {v.contact_phone && <p className="text-xs text-muted num">{v.contact_phone}</p>}
                    {v.notes && (
                      <p className="text-xs text-muted mt-3 bg-surface-2/70 p-2.5 rounded border border-border leading-relaxed">
                        {v.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== Tasks ===== */}
        {activeTab === 'tasks' && (
          <div className="animate-fade-in">
            {sectionHeader(
              'The checklist',
              'Milestones from the first announcement to the last song.',
              <Button size="sm" onClick={() => setTaskModal(true)} className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" aria-hidden="true" /> Add task
              </Button>
            )}

            {tasks.length === 0 ? (
              <div className="paper rounded-lg">
                <EmptyState
                  icon={<CheckSquare className="w-10 h-10 mx-auto" strokeWidth={1.5} />}
                  title="No milestones yet"
                  description="Write the first one — the concierge can propose a full checklist for your occasion type."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setTaskModal(true)} className="mt-2">
                      Add the first task
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="paper rounded-lg divide-y divide-border">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <label className="flex items-center gap-4 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={async () => {
                          const newStatus = t.status === 'completed' ? 'pending' : 'completed';
                          await fetch(`/api/events/${eventId}/tasks`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ taskId: t.id, status: newStatus }),
                          });
                          fetchEventDetails();
                        }}
                        className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                        aria-label={`Mark ${t.title} as ${t.status === 'completed' ? 'pending' : 'completed'}`}
                      />
                      <div className="min-w-0">
                        <p className={cn('text-sm font-semibold truncate', t.status === 'completed' ? 'line-through text-muted' : 'text-foreground')}>
                          {t.title}
                        </p>
                        {t.description && <p className="text-xs text-muted truncate">{t.description}</p>}
                      </div>
                    </label>
                    <div className="flex items-center gap-3 shrink-0">
                      {t.due_date && <span className="text-xs text-muted num">due {t.due_date}</span>}
                      <Badge status={t.priority}>{t.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== Budget ===== */}
        {activeTab === 'budget' && (
          <div className="animate-fade-in">
            {sectionHeader(
              'The ledger',
              `Estimated against actual, against a cap of ${formatCurrency(Number(event.budget))}.`,
              <Button size="sm" onClick={() => setBudgetModal(true)} className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" aria-hidden="true" /> Add line
              </Button>
            )}

            <div className="paper rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border mb-6">
              {[
                { label: 'Budget cap', value: formatCurrency(Number(event.budget)), tone: '' },
                { label: 'Estimated', value: formatCurrency(totalAllocated), tone: '' },
                {
                  label: 'Remaining buffer',
                  value: formatCurrency(Number(event.budget) - totalAllocated),
                  tone: Number(event.budget) - totalAllocated < 0 ? 'text-destructive' : 'text-success',
                },
              ].map((s) => (
                <div key={s.label} className="px-6 py-5">
                  <p className="eyebrow text-muted mb-1.5">{s.label}</p>
                  <p className={cn('num font-display text-2xl font-semibold tracking-tight', s.tone)}>{s.value}</p>
                </div>
              ))}
            </div>

            {budgetItems.length === 0 ? (
              <div className="paper rounded-lg">
                <EmptyState
                  icon={<Wallet className="w-10 h-10 mx-auto" strokeWidth={1.5} />}
                  title="No lines in the ledger"
                  description="List catering, attire, rentals, flowers, entertainment — estimate first, reconcile later."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setBudgetModal(true)} className="mt-2">
                      Add a budget line
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="paper rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border-strong text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Category</th>
                      <th className="px-5 py-3.5 font-semibold">Description</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Estimated</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Actual</th>
                      <th className="px-5 py-3.5 font-semibold">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {budgetItems.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="px-5 py-3.5 font-semibold">{item.category}</td>
                        <td className="px-5 py-3.5 text-muted">{item.description || '—'}</td>
                        <td className="px-5 py-3.5 num text-right">{formatCurrency(Number(item.estimated_amount))}</td>
                        <td className="px-5 py-3.5 num text-right font-medium">
                          {item.actual_amount ? formatCurrency(Number(item.actual_amount)) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge status={item.is_paid ? 'confirmed' : 'pending'}>
                            {item.is_paid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== Guests ===== */}
        {activeTab === 'guests' && (
          <div className="animate-fade-in">
            {sectionHeader(
              'The register',
              'RSVPs, plus-ones, and dietary notes — headcounts the caterer can trust.',
              <Button size="sm" onClick={() => setGuestModal(true)} className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" aria-hidden="true" /> Add guest
              </Button>
            )}

            {guests.length === 0 ? (
              <div className="paper rounded-lg">
                <EmptyState
                  icon={<Users className="w-10 h-10 mx-auto" strokeWidth={1.5} />}
                  title="The register is empty"
                  description="Enter guest names to begin tracking invitations, replies, and seating."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setGuestModal(true)} className="mt-2">
                      Add the first guest
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {guests.map((g) => (
                  <Card key={g.id} padding="sm">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[0.9375rem] truncate">{g.name}</h4>
                        {g.email && <p className="text-xs text-muted truncate">{g.email}</p>}
                      </div>
                      <Badge status={g.rsvp_status}>{g.rsvp_status}</Badge>
                    </div>
                    {g.dietary_restrictions && (
                      <p className="text-xs text-accent mt-2.5 bg-accent/10 border border-accent/30 px-2 py-1 rounded">
                        Table notes: {g.dietary_restrictions}
                      </p>
                    )}
                    {g.plus_one && (
                      <span className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase text-primary mt-1.5 inline-block">
                        Plus one
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== Timeline ===== */}
        {activeTab === 'timeline' && (
          <div className="animate-fade-in">
            {sectionHeader(
              'The day-of book',
              'Run of show for the wedding party, vendors, and hosts.',
              <Button size="sm" onClick={() => setTimelineModal(true)} className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" aria-hidden="true" /> Add moment
              </Button>
            )}

            {timeline.length === 0 ? (
              <div className="paper rounded-lg">
                <EmptyState
                  icon={<Clock className="w-10 h-10 mx-auto" strokeWidth={1.5} />}
                  title="The itinerary is blank"
                  description="Map guest arrival, the ceremony, dinner, toasts, and the send-off."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setTimelineModal(true)} className="mt-2">
                      Add the first moment
                    </Button>
                  }
                />
              </div>
            ) : (
              <ol className="relative border-l border-border-strong ml-3 space-y-6">
                {timeline.map((item, idx) => (
                  <li key={item.id} className="ml-6">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background"
                    />
                    <div className="paper rounded-lg p-4">
                      <div className="flex items-baseline gap-3">
                        <time className="num text-[0.8125rem] font-semibold text-accent tracking-widest uppercase">
                          {item.start_time
                            ? new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : `Slot ${idx + 1}`}
                        </time>
                        <h4 className="font-display text-lg font-semibold tracking-tight">{item.title}</h4>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted mt-1 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* ===== Concierge ===== */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in">
            <Card padding="lg" className="frame-ornate">
              <div className="flex items-center gap-3 mb-1.5">
                <Monogram size={24} className="text-accent" />
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  The concierge, on &ldquo;{event.title}&rdquo;
                </h2>
              </div>
              <p className="text-sm text-muted">
                It has read this event&apos;s budget, guests, vendors, and itinerary — ask for
                checklists, contract questions, or theme refinements.
              </p>

              <div className="mt-5 space-y-4 max-h-[500px] overflow-y-auto p-4 bg-surface-2/50 rounded-md border border-border">
                {aiResponses.length === 0 ? (
                  <div className="text-center py-10 text-muted text-sm">
                    <Fleuron className="mb-3 opacity-70" />
                    The page is open — ask anything, or compose the full plan from the header.
                  </div>
                ) : (
                  aiResponses.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'px-4 py-3 rounded-md text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto max-w-[85%]'
                          : 'paper text-foreground max-w-[92%] whitespace-pre-wrap'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <p className="eyebrow mb-1.5">Concierge</p>
                      )}
                      {msg.content}
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="paper px-4 py-3 rounded-md text-sm text-accent flex items-center gap-2">
                    <LoadingSpinner size="sm" /> Composing a considered reply…
                  </div>
                )}
              </div>

              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAI();
                }}
              >
                <input
                  type="text"
                  placeholder="e.g. a three-course menu for 50 guests under $2,000"
                  className="flex-1 px-3 py-2.5 text-sm rounded-md border border-border-strong bg-surface focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-accent transition-colors"
                  aria-label="Ask the concierge"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={aiLoading}
                />
                <Button variant="primary" size="sm" type="submit" disabled={aiLoading || !aiPrompt.trim()}>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </Card>
          </div>
        )}
      </main>

      {/* ===== Modals ===== */}
      <Modal isOpen={vendorModal} onClose={() => setVendorModal(false)} title="Add a vendor">
        <form onSubmit={handleAddVendor} className="space-y-4">
          <Input label="Vendor or company name *" required value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} />
          <Input label="Category (catering, DJ, photography, florist…) *" required value={vendorForm.category} onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })} />
          <Input type="number" label="Estimated cost ($)" value={vendorForm.estimated_cost.toString()} onChange={(e) => setVendorForm({ ...vendorForm, estimated_cost: Number(e.target.value) })} />
          <Input label="Contact email" type="email" value={vendorForm.contact_email} onChange={(e) => setVendorForm({ ...vendorForm, contact_email: e.target.value })} />
          <Input label="Contact phone" value={vendorForm.contact_phone} onChange={(e) => setVendorForm({ ...vendorForm, contact_phone: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Save vendor</Button>
        </form>
      </Modal>

      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Add a checklist task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input label="Task title *" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          <Input label="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          <Input type="date" label="Due date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Create task</Button>
        </form>
      </Modal>

      <Modal isOpen={budgetModal} onClose={() => setBudgetModal(false)} title="Add a ledger line">
        <form onSubmit={handleAddBudgetItem} className="space-y-4">
          <Input label="Category *" required value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} />
          <Input label="Description" value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} />
          <Input type="number" label="Estimated ($)" value={budgetForm.estimated_amount.toString()} onChange={(e) => setBudgetForm({ ...budgetForm, estimated_amount: Number(e.target.value) })} />
          <Input type="number" label="Actual ($)" value={budgetForm.actual_amount.toString()} onChange={(e) => setBudgetForm({ ...budgetForm, actual_amount: Number(e.target.value) })} />
          <Button type="submit" variant="primary" className="w-full">Save line</Button>
        </form>
      </Modal>

      <Modal isOpen={guestModal} onClose={() => setGuestModal(false)} title="Add a guest">
        <form onSubmit={handleAddGuest} className="space-y-4">
          <Input label="Full name *" required value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} />
          <Input label="Email address" type="email" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} />
          <Input label="Dietary notes (vegan, gluten-free, halal…)" value={guestForm.dietary_restrictions} onChange={(e) => setGuestForm({ ...guestForm, dietary_restrictions: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Save guest</Button>
        </form>
      </Modal>

      <Modal isOpen={timelineModal} onClose={() => setTimelineModal(false)} title="Add a moment">
        <form onSubmit={handleAddTimeline} className="space-y-4">
          <Input label="Moment title *" placeholder="e.g. cocktail hour begins" value={timelineForm.title} onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })} />
          <Input label="Description" placeholder="e.g. signature drinks served in the garden" value={timelineForm.description} onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Add to the itinerary</Button>
        </form>
      </Modal>
    </div>
  );
}
