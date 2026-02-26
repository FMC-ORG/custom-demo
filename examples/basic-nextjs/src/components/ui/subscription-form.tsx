'use client';

import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

/**
 * SubscriptionForm - collects email and full name, sends renewal email to Federico Mujica.
 */
export const SubscriptionForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: data.fullName, email: data.email }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(json?.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-confused-container p-8 text-white">
        <p className="text-center text-lg font-medium text-white/90">
          Thanks for subscribing!
        </p>
        <p className="mt-2 text-center text-sm text-white/70">
          We&apos;ll be in touch about your car insurance renewal.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-confused-container p-8 text-white">
      <h3 className="mb-6 text-lg font-bold">Subscribe for renewal reminders</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="subscription-fullName"
            className="mb-2 block text-sm font-medium text-white/90"
          >
            Full name
          </label>
          <input
            id="subscription-fullName"
            type="text"
            {...register('fullName')}
            disabled={status === 'loading'}
            className={cn(
              'w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder:text-white/50',
              'focus:outline-none focus:ring-2 focus:ring-confused-cta-teal',
              errors.fullName ? 'border-red-400' : 'border-white/20'
            )}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="subscription-email"
            className="mb-2 block text-sm font-medium text-white/90"
          >
            Email
          </label>
          <input
            id="subscription-email"
            type="email"
            {...register('email')}
            disabled={status === 'loading'}
            className={cn(
              'w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder:text-white/50',
              'focus:outline-none focus:ring-2 focus:ring-confused-cta-teal',
              errors.email ? 'border-red-400' : 'border-white/20'
            )}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
        {errorMessage && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center rounded-lg bg-confused-cta-teal px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
};
