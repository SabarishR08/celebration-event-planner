'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Fleuron, Monogram } from '@/components/layout/Brand';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

const OPENING_LETTER: Message = {
  role: 'assistant',
  content:
    'Good afternoon. I am the CelebPlan concierge.\n\nTell me about the occasion you are drafting — the numbers, the mood, the constraints — and I will propose budgets, vendor checklists, day-of itineraries, and theme directions you can refine.',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([OPENING_LETTER]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setError('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      setMessages([...newMessages, { role: 'assistant', content: data.data.message }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error communicating with AI');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'A cosy 30th birthday — $2,500, 30 guests',
    'Vendor checklist for an autumn outdoor wedding',
    'Hourly day-of timeline for an evening community gala',
    'How should $15,000 split across catering, venue, and décor?',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col">
        <header className="text-center mb-7">
          <p className="eyebrow mb-3">Correspondence</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            The concierge&apos;s desk
          </h1>
          <p className="text-muted text-[0.9375rem] mt-2 max-w-lg mx-auto leading-relaxed">
            Budgets, schedules, vendors, and creative directions — answered in plain language.
          </p>
          <Fleuron className="mt-4 opacity-80" />
        </header>

        {/* Conversation sheet */}
        <div className="paper rounded-lg flex-1 flex flex-col min-h-[34rem] max-h-[42rem] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-6" aria-live="polite">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn('flex gap-3.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <Monogram size={30} className="text-accent mt-0.5" />
                )}

                <div
                  className={cn(
                    'max-w-[85%] px-4.5 py-3.5 text-[0.9375rem] leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-md rounded-br-sm px-4'
                      : 'paper rounded-md rounded-bl-sm px-4 whitespace-pre-wrap'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <p className="eyebrow mb-1.5">Concierge</p>
                  )}
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <span
                    aria-hidden="true"
                    className="mt-0.5 w-8 h-8 shrink-0 rounded-full border border-border-strong bg-surface-2 flex items-center justify-center text-[0.7rem] font-semibold tracking-widest uppercase text-muted"
                  >
                    You
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 justify-start">
                <Monogram size={30} className="text-accent mt-0.5 animate-pulse" />
                <div className="paper rounded-md rounded-bl-sm px-4 py-3 text-sm text-muted flex items-center gap-2.5">
                  <LoadingSpinner size="sm" /> Drafting a considered reply…
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/40 text-destructive text-sm rounded-md flex items-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested correspondence */}
          {messages.length <= 2 && (
            <div className="px-5 sm:px-7 pb-4 border-t border-border pt-4">
              <p className="eyebrow mb-2.5">Try beginning with</p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(p)}
                    className="text-[0.8125rem] px-3 py-1.5 rounded-full border border-border-strong text-muted hover:border-accent hover:text-primary transition-colors text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compose bar */}
          <form onSubmit={handleSend} className="border-t border-border p-3 sm:p-4 flex gap-2.5 bg-surface-2/40">
            <label htmlFor="chat-input" className="sr-only">
              Write to the concierge
            </label>
            <input
              id="chat-input"
              type="text"
              className="flex-1 px-4 py-2.5 text-sm rounded-md border border-border-strong bg-surface focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-accent transition-colors"
              placeholder="Ask about timelines, budgets, vendors, or themes…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" variant="primary" disabled={loading || !input.trim()} className="px-4">
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
