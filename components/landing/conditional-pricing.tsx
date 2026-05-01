'use client';

import { useAuth } from '@/src/AuthContext';
import { Pricing } from './pricing';

export function ConditionalPricing() {
  const { user, isPaid, loading } = useAuth() as any;

  // Hide pricing section if user has already paid
  if (loading || (user && isPaid)) return null;

  return <Pricing />;
}
