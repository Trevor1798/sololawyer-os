'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [barNumber, setBarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!barNumber.trim()) {
      setError('Bar number is required');
      setLoading(false);
      return;
    }

    // Validate bar number format (alphanumeric, 4-20 chars)
    if (!/^[A-Z0-9]{4,20}$/i.test(barNumber.trim())) {
      setError('Bar number must be 4-20 alphanumeric characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barNumber: barNumber.trim().toUpperCase(),
          email: user?.emailAddresses[0]?.emailAddress || '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save bar number');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Complete Your Profile
        </h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Please provide your state bar number to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="barNumber"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              State Bar Number *
            </label>
            <input
              id="barNumber"
              type="text"
              value={barNumber}
              onChange={(e) => setBarNumber(e.target.value.toUpperCase())}
              placeholder="e.g., 123456"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
              required
              pattern="[A-Z0-9]{4,20}"
              title="4-20 alphanumeric characters"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              4-20 alphanumeric characters
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

