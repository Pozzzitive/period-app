import type { ExportData } from './data-export';
import type { CycleAnalytics } from '../engine/analytics-engine';
import type { SymptomPattern } from '../engine/pattern-analyzer';

export interface PDFOptions {
  includeCycleHistory: boolean;
  includeStatistics: boolean;
  includeSymptomPatterns: boolean;
  includeMoodData: boolean;
}

export function buildPDFHTML(
  data: ExportData,
  analytics: CycleAnalytics | null,
  patterns: SymptomPattern[],
  options: PDFOptions,
): string {
  const sections: string[] = [];

  // Header
  sections.push(`
    <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #D4738C; padding-bottom: 16px;">
      <h1 style="color: #D4738C; margin: 0; font-size: 24px;">Cycle Health Report</h1>
      <p style="color: #888; margin: 4px 0 0 0; font-size: 12px;">
        Generated ${new Date(data.exportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  `);

  // Profile summary
  sections.push(`
    <div style="margin-bottom: 20px;">
      <h2 style="color: #333; font-size: 16px; margin-bottom: 8px;">Profile Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #666;">Typical cycle length</td><td style="padding: 4px 0; font-weight: 600;">${data.profile.typicalCycleLength} days</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Typical period length</td><td style="padding: 4px 0; font-weight: 600;">${data.profile.typicalPeriodLength} days</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Cycles tracked</td><td style="padding: 4px 0; font-weight: 600;">${data.cycles.length}</td></tr>
      </table>
    </div>
  `);

  // Cycle history table
  if (options.includeCycleHistory && data.periods.length > 0) {
    const rows = data.periods.map((p) => {
      const cycle = data.cycles.find((c) => c.startDate === p.startDate);
      return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${p.startDate}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${p.endDate ?? 'Ongoing'}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${cycle?.periodLength ?? '-'} days</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${cycle?.cycleLength ? `${cycle.cycleLength} days` : '-'}</td>
        </tr>
      `;
    }).join('');

    sections.push(`
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 16px; margin-bottom: 8px;">Cycle History</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f8f0f3;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #D4738C;">Start Date</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #D4738C;">End Date</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #D4738C;">Period</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #D4738C;">Cycle</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `);
  }

  // Statistics
  if (options.includeStatistics && analytics) {
    sections.push(`
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 16px; margin-bottom: 8px;">Statistics (${analytics.cyclesAnalyzed} cycles analyzed)</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #666;">Average period length</td><td style="padding: 4px 0; font-weight: 600;">${analytics.avgPeriodLength} days</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Period range</td><td style="padding: 4px 0; font-weight: 600;">${analytics.shortestPeriod}-${analytics.longestPeriod} days</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Period trend</td><td style="padding: 4px 0; font-weight: 600;">${analytics.periodLengthTrend}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Cycle variability</td><td style="padding: 4px 0; font-weight: 600;">${analytics.cycleLengthVariability} days</td></tr>
        </table>
      </div>
    `);

    // Top symptoms
    if (analytics.topSymptoms.length > 0) {
      const symptomRows = analytics.topSymptoms.slice(0, 10).map((s) =>
        `<tr><td style="padding: 4px 0;">${s.icon} ${s.label}</td><td style="padding: 4px 0; font-weight: 600;">${s.percentage}% of logged days</td></tr>`
      ).join('');

      sections.push(`
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; font-size: 16px; margin-bottom: 8px;">Top Symptoms</h2>
          <table style="width: 100%; border-collapse: collapse;">${symptomRows}</table>
        </div>
      `);
    }
  }

  // Symptom patterns
  if (options.includeSymptomPatterns && patterns.length > 0) {
    const patternItems = patterns.slice(0, 10).map((p) =>
      `<li style="margin-bottom: 6px;">${p.icon} ${p.description} (${p.occurrenceRate}% of cycles)</li>`
    ).join('');

    sections.push(`
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 16px; margin-bottom: 8px;">Symptom Patterns</h2>
        <ul style="padding-left: 16px; font-size: 13px;">${patternItems}</ul>
      </div>
    `);
  }

  // Mood data
  if (options.includeMoodData && analytics && analytics.moodDistribution.length > 0) {
    const moodItems = analytics.moodDistribution.map((m) =>
      `<span style="display: inline-block; margin: 4px 8px 4px 0; font-size: 13px;">${m.icon} ${m.label}: ${m.count}x</span>`
    ).join('');

    sections.push(`
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 16px; margin-bottom: 8px;">Mood Data</h2>
        <div>${moodItems}</div>
      </div>
    `);
  }

  // Footer
  sections.push(`
    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; text-align: center;">
      <p style="color: #aaa; font-size: 10px; margin: 0;">
        This report is for informational purposes only and is not medical advice.
        Generated by Period Tracker app.
      </p>
    </div>
  `);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333;
          padding: 32px;
          font-size: 14px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      ${sections.join('\n')}
    </body>
    </html>
  `;
}
