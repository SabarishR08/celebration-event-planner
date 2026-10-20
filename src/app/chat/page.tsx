'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Celebration & Event Planner Assistant powered by GenAI. I can help you organize weddings, birthdays, anniversaries, and community gatherings. Ask me about budget allocations, vendor contract checklists, day-of timelines, or creative themes!",
    },
  ]);
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
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Plan a cozy 30th birthday party with a $2,500 budget and 30 guests",
    "What are the essential vendor checklist items for an autumn outdoor wedding?",
    "Generate an hourly day-of timeline for an evening community gala",
    "How should I split a $15,000 wedding budget across catering, venue, and decor?",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            CelebPlan GenAI Assistant
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Intelligent planning advice for budgets, schedules, vendors, & creative concepts.
          </p>
        </div>

        {/* Chat Conversation Box */}
        <Card padding="md" className="flex-1 flex flex-col h-[650px] shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none p-4 text-sm text-gray-500 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <LoadingSpinner size="sm" /> CelebPlan AI is crafting your recommendations...
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions */}
          {messages.length <= 2 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 mb-2 font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(p);
                    }}
                    className="text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-left transition-colors"
                  >
                    &ldquo;{p}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-2 sm:p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Ask anything about timelines, budget optimization, vendor questions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
