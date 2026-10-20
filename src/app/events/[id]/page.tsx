'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, Users, DollarSign, Clock, CheckSquare, Sparkles, 
  Trash2, Plus, ArrowLeft, Building2, MapPin, CheckCircle2,
  FileText, ListFilter, Send
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Event, Vendor, Task, BudgetItem, Guest, TimelineItem } from '@/types';
import { formatCurrency, formatDate, getEventTypeEmoji } from '@/lib/utils';

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

  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'tasks' | 'budget' | 'guests' | 'timeline' | 'ai'>('overview');

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

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        {/* Event Header Banner */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900" role="img" aria-label={event.event_type}>
                {getEventTypeEmoji(event.event_type)}
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {event.title}
                  </h1>
                  <Badge status={event.status}>{event.status.replace('_', ' ')}</Badge>
                </div>
                {event.theme && (
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                    Theme: {event.theme}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                  {event.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" /> {formatDate(event.event_date)}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> {event.guest_count} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" /> Budget: {formatCurrency(Number(event.budget))}
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
              className="flex items-center gap-2 self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4" /> Generate Full AI Plan
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'vendors', label: `Vendors (${vendors.length})` },
            { id: 'tasks', label: `Checklist & Tasks (${tasks.length})` },
            { id: 'budget', label: 'Budget Breakdown' },
            { id: 'guests', label: `Guest List (${guests.length})` },
            { id: 'timeline', label: `Timeline (${timeline.length})` },
            { id: 'ai', label: '✨ AI Assistant' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="md">
                <p className="text-xs text-gray-500">Tasks Completed</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {completedTasks} / {tasks.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full"
                    style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </Card>

              <Card padding="md">
                <p className="text-xs text-gray-500">Budget Spent / Total</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Total Cap: {formatCurrency(Number(event.budget))}</p>
              </Card>

              <Card padding="md">
                <p className="text-xs text-gray-500">Confirmed RSVPs</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  {guests.filter((g) => g.rsvp_status === 'accepted').length} / {guests.length || event.guest_count}
                </p>
                <p className="text-xs text-gray-400 mt-1">Target: {event.guest_count} guests</p>
              </Card>
            </div>

            {event.description && (
              <Card padding="lg">
                <h3 className="text-base font-bold mb-2">Event Description & Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card padding="md" className="border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
                <h3 className="text-base font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" /> AI Planning Short-cuts
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                  Click any quick action to have CelebPlan AI optimize your event parameters instantly.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('ai');
                      handleAskAI(`Generate a detailed checklist of vendors needed for my ${event.event_type} (${event.title}) with cost estimates.`);
                    }}
                  >
                    Vendor Checklist Idea
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('ai');
                      handleAskAI(`Create an optimized budget breakdown for $${event.budget} for this ${event.event_type}.`);
                    }}
                  >
                    Optimize Budget
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab('ai');
                      handleAskAI(`Create a minute-by-minute day-of schedule and run-of-show timeline for my ${event.event_type}.`);
                    }}
                  >
                    Generate Day-of Timeline
                  </Button>
                </div>
              </Card>

              <Card padding="md">
                <h3 className="text-base font-bold mb-2">Next Priority Tasks</h3>
                {tasks.length === 0 ? (
                  <p className="text-xs text-gray-400">No tasks added yet. Head to the Checklist tab to add your milestones.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800">
                        <span className={t.status === 'completed' ? 'line-through text-gray-400' : 'font-medium'}>{t.title}</span>
                        <Badge status={t.priority}>{t.priority}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Vendor Management</h2>
                <p className="text-xs text-gray-500">Track caterers, venues, photographers, florists, and DJs.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setVendorModal(true)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Vendor
              </Button>
            </div>

            {vendors.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  icon={<Building2 className="w-10 h-10 text-gray-400 mx-auto" />}
                  title="No vendors tracked"
                  description="Add vendors manually or ask CelebPlan AI to recommend vendor categories for your event type."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setVendorModal(true)} className="mt-3">
                      Add First Vendor
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((v) => (
                  <Card key={v.id} padding="md" className="border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                        {v.category}
                      </span>
                      <Badge status={v.status}>{v.status}</Badge>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{v.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Est. Cost: <strong className="text-gray-800 dark:text-gray-200">{formatCurrency(Number(v.estimated_cost))}</strong></p>
                    {v.contact_email && <p className="text-xs text-gray-500 mt-0.5">Email: {v.contact_email}</p>}
                    {v.contact_phone && <p className="text-xs text-gray-500 mt-0.5">Phone: {v.contact_phone}</p>}
                    {v.notes && <p className="text-xs text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">{v.notes}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Checklists & Planning Milestones</h2>
                <p className="text-xs text-gray-500">Stay organized from announcement to day-of execution.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setTaskModal(true)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Task
              </Button>
            </div>

            {tasks.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  icon={<CheckSquare className="w-10 h-10 text-gray-400 mx-auto" />}
                  title="No tasks on the checklist"
                  description="Create actionable items to ensure every phase of your celebration is planned to perfection."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setTaskModal(true)} className="mt-3">
                      Add First Task
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <Card key={t.id} padding="sm" className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
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
                        className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                      />
                      <div>
                        <p className={`text-sm font-semibold ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {t.title}
                        </p>
                        {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.due_date && <span className="text-xs text-gray-400">Due {t.due_date}</span>}
                      <Badge status={t.priority}>{t.priority}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Budget & Expense Allocation</h2>
                <p className="text-xs text-gray-500">Monitor budget items against your overall cap of {formatCurrency(Number(event.budget))}.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setBudgetModal(true)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="md">
                <p className="text-xs text-gray-500">Total Budget</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(Number(event.budget))}</p>
              </Card>
              <Card padding="md">
                <p className="text-xs text-gray-500">Estimated Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalAllocated)}</p>
              </Card>
              <Card padding="md">
                <p className="text-xs text-gray-500">Remaining Buffer</p>
                <p className={`text-xl font-bold ${Number(event.budget) - totalAllocated < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {formatCurrency(Number(event.budget) - totalAllocated)}
                </p>
              </Card>
            </div>

            {budgetItems.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  icon={<DollarSign className="w-10 h-10 text-gray-400 mx-auto" />}
                  title="No budget lines configured"
                  description="List expenses like catering, attire, rentals, flowers, and entertainment."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setBudgetModal(true)} className="mt-3">
                      Add Budget Line
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Estimated</th>
                      <th className="px-4 py-3">Actual</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {budgetItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{item.category}</td>
                        <td className="px-4 py-3 text-gray-500">{item.description || '—'}</td>
                        <td className="px-4 py-3">{formatCurrency(Number(item.estimated_amount))}</td>
                        <td className="px-4 py-3 font-medium">{item.actual_amount ? formatCurrency(Number(item.actual_amount)) : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {item.is_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Guest List & RSVPs</h2>
                <p className="text-xs text-gray-500">Track attendances, plus-ones, and dietary restrictions.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setGuestModal(true)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Guest
              </Button>
            </div>

            {guests.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  icon={<Users className="w-10 h-10 text-gray-400 mx-auto" />}
                  title="No guests added yet"
                  description="Import or enter guest names to manage invitations and seating."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setGuestModal(true)} className="mt-3">
                      Add First Guest
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {guests.map((g) => (
                  <Card key={g.id} padding="sm" className="border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{g.name}</h4>
                        {g.email && <p className="text-xs text-gray-500">{g.email}</p>}
                      </div>
                      <Badge status={g.rsvp_status}>{g.rsvp_status}</Badge>
                    </div>
                    {g.dietary_restrictions && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded">
                        Dietary: {g.dietary_restrictions}
                      </p>
                    )}
                    {g.plus_one && (
                      <span className="text-[10px] text-purple-600 font-semibold mt-1 inline-block">+1 Allowed</span>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Event Day Timeline & Schedule</h2>
                <p className="text-xs text-gray-500">Run-of-show itinerary for vendors, wedding parties, and hosts.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setTimelineModal(true)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Timeline Milestone
              </Button>
            </div>

            {timeline.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  icon={<Clock className="w-10 h-10 text-gray-400 mx-auto" />}
                  title="No schedule items"
                  description="Map out guest arrival, ceremony, dinner, speeches, cake cutting, and departure."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setTimelineModal(true)} className="mt-3">
                      Add Timeline Milestone
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {timeline.map((item, idx) => (
                  <Card key={item.id} padding="sm" className="flex items-start gap-4 border-l-4 border-l-purple-600">
                    <div className="text-center font-bold text-xs bg-purple-50 dark:bg-purple-950/40 p-2 rounded text-purple-600 min-w-16">
                      {item.start_time ? new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Slot ${idx + 1}`}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.title}</h4>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <Card padding="md" className="border border-purple-200 dark:border-purple-800">
              <h2 className="text-base font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                CelebPlan AI Planner for &ldquo;{event.title}&rdquo;
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The AI is informed with all details about this event (budget, guests, vendors, timeline). Ask for checklists, recommendations, contracts tips, or theme enhancements.
              </p>

              <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                {aiResponses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No custom conversation yet. Use the prompt below or generate an automated plan!
                  </div>
                ) : (
                  aiResponses.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white ml-auto max-w-[80%]' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap'}`}>
                      {msg.content}
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-xs text-purple-600 flex items-center gap-2">
                    <LoadingSpinner size="sm" /> Thinking and formulating event strategy...
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Recommend a 3-course menu for 50 guests under $2,000"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAskAI(); }}
                  disabled={aiLoading}
                />
                <Button variant="primary" size="sm" onClick={() => handleAskAI()} disabled={aiLoading || !aiPrompt.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Vendor Modal */}
      <Modal isOpen={vendorModal} onClose={() => setVendorModal(false)} title="Add New Vendor">
        <form onSubmit={handleAddVendor} className="space-y-4">
          <Input label="Vendor / Company Name *" required value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} />
          <Input label="Category (e.g., Catering, DJ, Photography, Florist) *" required value={vendorForm.category} onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })} />
          <Input type="number" label="Estimated Cost ($)" value={vendorForm.estimated_cost.toString()} onChange={(e) => setVendorForm({ ...vendorForm, estimated_cost: Number(e.target.value) })} />
          <Input label="Contact Email" type="email" value={vendorForm.contact_email} onChange={(e) => setVendorForm({ ...vendorForm, contact_email: e.target.value })} />
          <Input label="Contact Phone" value={vendorForm.contact_phone} onChange={(e) => setVendorForm({ ...vendorForm, contact_phone: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Save Vendor</Button>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Add Checklist Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input label="Task Title *" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          <Input label="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          <Input type="date" label="Due Date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Create Task</Button>
        </form>
      </Modal>

      {/* Budget Modal */}
      <Modal isOpen={budgetModal} onClose={() => setBudgetModal(false)} title="Add Budget Line Item">
        <form onSubmit={handleAddBudgetItem} className="space-y-4">
          <Input label="Category *" required value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} />
          <Input label="Description" value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} />
          <Input type="number" label="Estimated Cost ($)" value={budgetForm.estimated_amount.toString()} onChange={(e) => setBudgetForm({ ...budgetForm, estimated_amount: Number(e.target.value) })} />
          <Input type="number" label="Actual Cost ($)" value={budgetForm.actual_amount.toString()} onChange={(e) => setBudgetForm({ ...budgetForm, actual_amount: Number(e.target.value) })} />
          <Button type="submit" variant="primary" className="w-full">Save Line Item</Button>
        </form>
      </Modal>

      {/* Guest Modal */}
      <Modal isOpen={guestModal} onClose={() => setGuestModal(false)} title="Add Guest">
        <form onSubmit={handleAddGuest} className="space-y-4">
          <Input label="Full Name *" required value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} />
          <Input label="Email Address" type="email" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} />
          <Input label="Dietary Restrictions (e.g., Vegan, Gluten-Free, Halal)" value={guestForm.dietary_restrictions} onChange={(e) => setGuestForm({ ...guestForm, dietary_restrictions: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Save Guest</Button>
        </form>
      </Modal>

      {/* Timeline Modal */}
      <Modal isOpen={timelineModal} onClose={() => setTimelineModal(false)} title="Add Timeline Event">
        <form onSubmit={handleAddTimeline} className="space-y-4">
          <Input label="Milestone Title *" required placeholder="e.g. Cocktail Hour Begins" value={timelineForm.title} onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })} />
          <Input label="Description" placeholder="e.g. Guests served signature drinks in the garden" value={timelineForm.description} onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Add To Schedule</Button>
        </form>
      </Modal>
    </div>
  );
}
