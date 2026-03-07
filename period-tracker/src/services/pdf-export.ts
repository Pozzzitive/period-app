import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { collectExportData } from './data-export';
import { buildPDFHTML } from './pdf-template';
import type { PDFOptions } from './pdf-template';
import { computeAnalytics } from '../engine/analytics-engine';
import { analyzeSymptomPatterns } from '../engine/pattern-analyzer';
import { SYMPTOMS } from '../constants/symptoms';
import { MOODS } from '../constants/moods';
import { useCustomSymptomStore } from '../stores/custom-symptom-store';

export async function generatePDF(options: PDFOptions): Promise<string> {
  const data = collectExportData();

  const customSymptoms = useCustomSymptomStore.getState().customSymptoms;
  const allSymptomDefs = [
    ...SYMPTOMS.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
    ...customSymptoms.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
  ];
  const moodDefs = MOODS.map((m) => ({ id: m.id, label: m.label, icon: m.icon }));

  const analytics = computeAnalytics(data.logs, data.cycles, allSymptomDefs, moodDefs);
  const patterns = analyzeSymptomPatterns(data.logs, data.cycles, allSymptomDefs);

  const html = buildPDFHTML(data, analytics, patterns, options);

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePDF(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share your cycle report',
    });
  }
}
