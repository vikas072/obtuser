'use client';

import { useAuth } from '@/src/AuthContext';
import { Pricing } from './pricing';

export function ConditionalPricing() {
  const { user, isPaid, purchasedSemesters, loading } = useAuth() as any;

  // Hide pricing section if user has already purchased all semesters
  if (loading || (user && (purchasedSemesters?.length || 0) >= 8)) return null;

  return <Pricing />;
}
