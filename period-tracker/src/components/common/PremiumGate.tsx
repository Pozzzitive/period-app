import React from 'react';
import { useSubscriptionStore } from '../../stores';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shows content only for Premium Plus subscribers.
 * Shows fallback (e.g., upgrade prompt) otherwise.
 */
export function PremiumGate({ children, fallback = null }: PremiumGateProps) {
  const isPremium = useSubscriptionStore((s) => s.isPremiumPlus());
  if (!isPremium) return <>{fallback}</>;
  return <>{children}</>;
}
