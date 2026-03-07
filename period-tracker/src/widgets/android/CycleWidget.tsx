import React from 'react';
import { FlexWidget, TextWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
import type { WidgetData } from '../../services/widget-data';

// Phase colors matching src/constants/phases.ts
const PHASE_COLORS: Record<string, string> = {
  menstruation: '#D4738C',
  follicular: '#6BAF9A',
  ovulation: '#A888C4',
  luteal: '#D4A06E',
  premenstrual: '#7E9BC4',
};

interface PhaseSegment {
  phase: string;
  startDay: number;
  endDay: number;
  color: string;
}

function getPhaseSegments(cycleLength: number, periodLength: number): PhaseSegment[] {
  const ovulationDay = Math.max(cycleLength - 14, periodLength + 2);
  const pmsStart = Math.max(cycleLength - 4, ovulationDay + 2);

  const segments: PhaseSegment[] = [
    { phase: 'menstruation', startDay: 1, endDay: periodLength, color: PHASE_COLORS.menstruation },
    { phase: 'follicular', startDay: periodLength + 1, endDay: ovulationDay - 1, color: PHASE_COLORS.follicular },
    { phase: 'ovulation', startDay: ovulationDay, endDay: Math.min(ovulationDay + 1, cycleLength), color: PHASE_COLORS.ovulation },
    { phase: 'luteal', startDay: ovulationDay + 2, endDay: pmsStart - 1, color: PHASE_COLORS.luteal },
    { phase: 'premenstrual', startDay: pmsStart, endDay: cycleLength, color: PHASE_COLORS.premenstrual },
  ];
  return segments.filter((s) => s.startDay <= s.endDay);
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

interface CycleWidgetProps {
  data: WidgetData;
  width: number;
  height: number;
}

function buildMultiPhaseRingSvg(
  size: number,
  cycleLength: number,
  periodLength: number,
  cycleDay: number,
  currentPhaseColor: string,
  opacity: number = 1,
): string {
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2 - 1;
  const gapDeg = 3;
  const segments = getPhaseSegments(cycleLength, periodLength);
  const totalGap = gapDeg * segments.length;
  const usable = 360 - totalGap;

  let currentAngle = 0;
  let arcs = '';
  let dotCx = cx;
  let dotCy = cy - radius; // default top

  for (const seg of segments) {
    const days = seg.endDay - seg.startDay + 1;
    const sweep = (days / cycleLength) * usable;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;

    const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';

    arcs += `<path d="${describeArc(cx, cy, radius, startAngle, endAngle)}"
      fill="none" stroke="${seg.color}" stroke-width="${strokeWidth}" stroke-linecap="round"${opacityAttr} />`;

    // If current day falls in this segment, compute dot position
    if (cycleDay >= seg.startDay && cycleDay <= seg.endDay) {
      const fraction = (cycleDay - seg.startDay) / Math.max(days, 1);
      const dotAngle = startAngle + fraction * sweep;
      const pos = polarToCartesian(cx, cy, radius, dotAngle);
      dotCx = pos.x;
      dotCy = pos.y;
    }

    currentAngle = endAngle + gapDeg;
  }

  // Day indicator dot
  const dotOpacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';
  const dot = `<circle cx="${dotCx}" cy="${dotCy}" r="5" fill="${currentPhaseColor}" stroke="white" stroke-width="2"${dotOpacityAttr} />`;

  // Center text
  const centerText = `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
    font-size="15" font-weight="bold" fill="${currentPhaseColor}"${dotOpacityAttr}>${cycleDay}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${arcs}${dot}${centerText}
  </svg>`;
}

function TeaserWidget({ isWide }: { isWide: boolean }) {
  'use no memo';

  const sampleColor = '#A888C4' as `#${string}`;
  // Faded multi-phase ring with sample data (day 14 of 28)
  const ringSize = 72;
  const fadedRingSvg = buildMultiPhaseRingSvg(ringSize, 28, 5, 14, '#A888C4', 0.3);

  if (isWide) {
    return (
      <OverlapWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
        }}
        clickAction="OPEN_APP"
      >
        {/* Faded sample content — row with text + ring */}
        <FlexWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
          }}
        >
          <FlexWidget
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              flex: 1,
              height: 'match_parent',
              justifyContent: 'space-between',
            }}
          >
            <TextWidget
              text="Cycle Tracker"
              style={{ fontSize: 11, color: 'rgba(153, 153, 153, 0.3)' }}
            />
            <TextWidget
              text="Day 14"
              style={{ fontSize: 26, color: 'rgba(168, 136, 196, 0.3)', fontWeight: 'bold' }}
            />
            <TextWidget
              text="Ovulation"
              style={{ fontSize: 14, color: 'rgba(51, 51, 51, 0.3)', fontWeight: '500' }}
            />
            <TextWidget
              text="14 days until next period"
              style={{ fontSize: 12, color: 'rgba(153, 153, 153, 0.3)' }}
            />
          </FlexWidget>
          <FlexWidget
            style={{
              width: ringSize,
              height: ringSize,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
            }}
          >
            <SvgWidget
              svg={fadedRingSvg}
              style={{ width: ringSize, height: ringSize }}
            />
          </FlexWidget>
        </FlexWidget>
        {/* Upgrade badge overlay — centered on top */}
        <FlexWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlexWidget
            style={{
              backgroundColor: sampleColor,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <TextWidget
              text="Upgrade to Premium"
              style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' }}
            />
          </FlexWidget>
        </FlexWidget>
      </OverlapWidget>
    );
  }

  // Small teaser
  return (
    <OverlapWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
      }}
      clickAction="OPEN_APP"
    >
      {/* Faded sample content */}
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 14,
        }}
      >
        <TextWidget
          text="Cycle Tracker"
          style={{ fontSize: 11, color: 'rgba(153, 153, 153, 0.3)' }}
        />
        <TextWidget
          text="Day 14"
          style={{ fontSize: 26, color: 'rgba(168, 136, 196, 0.3)', fontWeight: 'bold' }}
        />
        <TextWidget
          text="Ovulation"
          style={{ fontSize: 13, color: 'rgba(51, 51, 51, 0.3)', fontWeight: '500' }}
        />
      </FlexWidget>
      {/* Upgrade badge overlay — centered on top */}
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FlexWidget
          style={{
            backgroundColor: sampleColor,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
        >
          <TextWidget
            text="Get Premium"
            style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 'bold' }}
          />
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}

export function CycleWidget({ data, width, height }: CycleWidgetProps) {
  'use no memo';

  const isWide = width > 200;

  // Free users: show teaser with upgrade badge
  if (!data.isPremiumPlus) {
    return <TeaserWidget isWide={isWide} />;
  }

  // Premium users: show real data
  const cycleDay = data.cycleDay ?? 1;
  const phaseName = data.currentPhase ?? 'Log your period';
  const phaseColor = (data.phaseColor ?? '#888888') as `#${string}`;
  const daysLeft = data.daysUntilNextPeriod ?? 0;
  const cycleLength = data.cycleLength ?? 28;
  const progress = cycleLength > 0 ? cycleDay / cycleLength : 0;

  const daysText =
    daysLeft === 0
      ? 'Period expected today'
      : daysLeft === 1
        ? '1 day until next period'
        : `${daysLeft} days until next period`;

  if (isWide) {
    const ringSize = 72;
    const pLength = data.periodLength ?? 5;
    const ringSvg = buildMultiPhaseRingSvg(ringSize, cycleLength, pLength, cycleDay, data.phaseColor ?? '#888888');

    return (
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            flex: 1,
            height: 'match_parent',
            justifyContent: 'space-between',
          }}
        >
          <TextWidget
            text="Cycle Tracker"
            style={{ fontSize: 11, color: '#999999' }}
          />
          <TextWidget
            text={`Day ${cycleDay}`}
            style={{ fontSize: 26, color: phaseColor, fontWeight: 'bold' }}
          />
          <TextWidget
            text={phaseName}
            style={{ fontSize: 14, color: '#333333', fontWeight: '500' }}
          />
          <TextWidget
            text={daysText}
            style={{ fontSize: 12, color: '#999999' }}
          />
        </FlexWidget>
        <FlexWidget
          style={{
            width: ringSize,
            height: ringSize,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
          }}
        >
          <SvgWidget
            svg={ringSvg}
            style={{ width: ringSize, height: ringSize }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  // Small layout
  const barWidth = 100;
  const filledWidth = Math.round(barWidth * Math.min(Math.max(progress, 0), 1));
  const barSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${barWidth}" height="6" viewBox="0 0 ${barWidth} 6">
    <rect x="0" y="0" width="${barWidth}" height="6" rx="3" fill="#E0E0E0" />
    <rect x="0" y="0" width="${filledWidth}" height="6" rx="3" fill="${data.phaseColor ?? '#888888'}" />
  </svg>`;

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Cycle Tracker"
        style={{ fontSize: 11, color: '#999999' }}
      />
      <TextWidget
        text={`Day ${cycleDay}`}
        style={{ fontSize: 26, color: phaseColor, fontWeight: 'bold' }}
      />
      <TextWidget
        text={phaseName}
        style={{ fontSize: 13, color: '#333333', fontWeight: '500' }}
      />
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
          flexGap: 8,
        }}
      >
        <SvgWidget
          svg={barSvg}
          style={{ width: barWidth, height: 6 }}
        />
        <TextWidget
          text={`${daysLeft}d`}
          style={{ fontSize: 10, color: '#999999' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
