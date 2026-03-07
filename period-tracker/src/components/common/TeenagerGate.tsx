import React from 'react';
import { useUserStore, useSettingsStore } from '../../stores';

interface TeenagerGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Hides content when teenager mode is active OR when the user has
 * opted out of intercourse data collection (GDPR Article 9).
 */
export function TeenagerGate({ children, fallback = null }: TeenagerGateProps) {
  const isTeenager = useUserStore((s) => s.profile.isTeenager);
  const intercourseConsent = useSettingsStore((s) => s.settings.dataCategories.intercourse);
  if (isTeenager || !intercourseConsent) return <>{fallback}</>;
  return <>{children}</>;
}
