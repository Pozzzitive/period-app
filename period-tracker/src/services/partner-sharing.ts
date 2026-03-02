import { Share } from 'react-native';
import { format } from 'date-fns';
import type { PredictionResult, PhaseInfo, PartnerShareData } from '../models';
import { PHASES } from '../constants/phases';

export function generatePartnerShareData(
  prediction: PredictionResult | null,
  phase: PhaseInfo | null,
  fertilityEnabled: boolean
): PartnerShareData {
  const data: PartnerShareData = {
    generatedAt: new Date().toISOString(),
  };

  if (prediction) {
    data.nextPeriodDate = prediction.nextPeriodStart;
  }

  if (phase) {
    data.currentPhase = PHASES[phase.phase].label;
    data.cycleDay = phase.dayInCycle;
  }

  if (fertilityEnabled && prediction?.fertileWindowStart && prediction?.fertileWindowEnd) {
    data.fertileWindow = {
      start: prediction.fertileWindowStart,
      end: prediction.fertileWindowEnd,
    };
  }

  return data;
}

export function formatShareText(data: PartnerShareData): string {
  const lines: string[] = ['Cycle Update'];

  if (data.currentPhase) {
    lines.push(`Current phase: ${data.currentPhase}`);
  }

  if (data.cycleDay) {
    lines.push(`Cycle day: ${data.cycleDay}`);
  }

  if (data.nextPeriodDate) {
    lines.push(`Next period: ${format(new Date(data.nextPeriodDate), 'MMM d')}`);
  }

  if (data.fertileWindow) {
    lines.push(
      `Fertile window: ${format(new Date(data.fertileWindow.start), 'MMM d')} - ${format(new Date(data.fertileWindow.end), 'MMM d')}`
    );
  }

  lines.push('');
  lines.push('Shared from Period Tracker');

  return lines.join('\n');
}

export async function shareWithPartner(data: PartnerShareData): Promise<void> {
  const text = formatShareText(data);
  await Share.share({
    message: text,
    title: 'Cycle Update',
  });
}
