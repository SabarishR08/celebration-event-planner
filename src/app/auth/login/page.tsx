'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Wordmark, Fleuron, Monogram } from '@/components/layout/Brand';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-14">
      <div className="w-full max-w-md animate-rise">
        <div className="text-center mb-7">
          <Link href="/" className="inline-block mb-6">
            <Wordmark />
          </Link>
          <p className="eyebrow mb-3">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Return to your books
          </h1>
          <Fleuron className="mt-4 opacity-80" />
        </div>

        <div className="paper frame-ornate rounded-lg px-7 py-9 sm:px-9">
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/40 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full py-3 mt-1" isLoading={loading}>
              Sign in
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-border text-center">
            <p className="text-[0.9375rem] text-muted">
              No account yet?{' '}
              <Link href="/auth/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                Request an invitation
              </Link>
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-7">
          <Monogram size={22} className="text-accent opacity-70" />
        </div>
      </div>
    </div>
  );
}
