'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  DEMO_USER_OPTIONS,
  MOCK_AUTH_COOKIE_NAME,
} from '@/lib/auth/demo-users';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale ?? 'en';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const mockEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
  const warningMessage = mockEnabled ? 'Mock auth is active — any credentials will work.' : null;

  const mockButtons = useMemo(
    () =>
      mockEnabled
        ? DEMO_USER_OPTIONS.map((user) => (
            <Button
              key={user.userId}
              variant="outline"
              className="h-auto w-full flex-col items-start gap-1 py-3 text-left"
              onClick={() => {
                if (typeof document !== 'undefined') {
                  document.cookie = `${MOCK_AUTH_COOKIE_NAME}=${user.userId}; path=/; max-age=2592000; sameSite=lax`;
                }
                router.push(`/${locale}${user.redirectPath}`);
              }}
            >
              <span className="text-base font-semibold text-slate-900">{user.label}</span>
              <span className="text-xs text-slate-500">{user.description}</span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </Button>
          ))
        : null,
    [locale, mockEnabled, router]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setError(null);
    if (mockEnabled) {
      router.push('/en/admin');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }

    router.push('/en/admin');
  };

  return (
    <div className="mx-auto mt-12 max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-semibold text-slate-900">TownHub admin login</h1>
      <p className="mt-2 text-sm text-slate-500">Enter your email and password to continue.</p>
      {warningMessage ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {warningMessage}
        </div>
      ) : null}
      {mockEnabled && (
        <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-sm text-slate-600">Select a demo persona to continue instantly:</p>
          <div className="space-y-2">{mockButtons}</div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          required
        />
        <Input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full rounded-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in with password'}
        </Button>
      </form>
    </div>
  );
}
