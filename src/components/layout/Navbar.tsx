'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Wordmark } from '@/components/layout/Brand';
import { cn } from '@/lib/utils';

interface NavbarProps {
  userName?: string;
}

export default function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
      router.push('/auth/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/events/new', label: 'New Event' },
    { href: '/chat', label: 'AI Atelier' },
  ];

  return (
    <nav
      className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <Wordmark href="/dashboard" markSize={30} />

            <div className="hidden sm:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative py-1.5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase transition-colors',
                      isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-0.5 left-0 right-0 h-px bg-accent transition-transform duration-300',
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userName && (
              <span className="hidden sm:inline text-[0.8125rem] text-muted">
                <span className="eyebrow mr-1.5 text-accent">Host</span>
                <span className="font-medium text-foreground">{userName}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted hover:text-destructive transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Compact nav for small screens */}
        <div className="sm:hidden flex items-center gap-5 pb-2.5 -mt-1 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'text-[0.75rem] font-medium tracking-[0.08em] uppercase whitespace-nowrap',
                  isActive ? 'text-primary border-b border-accent pb-0.5' : 'text-muted'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
