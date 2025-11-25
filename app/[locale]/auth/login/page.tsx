'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const mockEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
  const warningMessage = mockEnabled ? 'Mock auth is active — any credentials will work.' : null;

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
