import React from 'react';
import { useUserStore } from '../../stores';

interface TeenagerGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Hides content when teenager mode is active.
 * Used to hide intercourse logging, fertility tracking, and adult content.
 */
export function TeenagerGate({ children, fallback = null }: TeenagerGateProps) {
  const isTeenager = useUserStore((s) => s.profile.isTeenager);
  if (isTeenager) return <>{fallback}</>;
  return <>{children}</>;
}
