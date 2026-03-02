import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getCyclePhaseRanges } from '@/src/engine';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import type { PhaseInfo } from '@/src/models';
import type { CyclePhase } from '@/src/constants/phases';

interface CycleRingProps {
  phase: PhaseInfo | null;
  cycleLength: number;
  periodLength: number;
  onLogPeriod: () => void;
  onLogToday: () => void;
  isOngoingPeriod: boolean;
  onEndPeriod: () => void;
  periodCount: number;
  onHistory: () => void;
}

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 106;
const STROKE_WIDTH = 13;
const GAP_DEGREES = 2;

// ── SVG helpers ─────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

// ── Component ────────────────────────────────────────────────

interface ArcSegment {
  phase: CyclePhase;
  startAngle: number;
  endAngle: number;
  startDay: number;
  endDay: number;
  color: string;
}

export function CycleRing({
  phase,
  cycleLength,
  periodLength,
  onLogPeriod,
  onLogToday,
  isOngoingPeriod,
  onEndPeriod,
  periodCount,
  onHistory,
}: CycleRingProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasData = phase !== null;

  // Build arc segments from engine ranges
  const segments = useMemo((): ArcSegment[] => {
    const ranges = getCyclePhaseRanges('2000-01-01', cycleLength, periodLength);
    const totalGap = ranges.length * GAP_DEGREES;
    const usable = 360 - totalGap;

    const result: ArcSegment[] = [];
    let angle = -90; // 12 o'clock

    for (const range of ranges) {
      const days = range.endDay - range.startDay + 1;
      const sweep = (days / cycleLength) * usable;
      const halfGap = GAP_DEGREES / 2;

      result.push({
        phase: range.phase,
        startAngle: angle + halfGap,
        endAngle: angle + halfGap + sweep,
        startDay: range.startDay,
        endDay: range.endDay,
        color: colors.phases[range.phase].color,
      });

      angle += halfGap + sweep + halfGap;
    }

    return result;
  }, [cycleLength, periodLength, colors.phases]);

  // Day indicator dot
  const dot = useMemo(() => {
    if (!phase) return null;

    for (const seg of segments) {
      if (phase.dayInCycle >= seg.startDay && phase.dayInCycle <= seg.endDay) {
        const segDays = seg.endDay - seg.startDay + 1;
        const fraction =
          segDays === 1 ? 0.5 : (phase.dayInCycle - seg.startDay) / (segDays - 1);
        const angle = seg.startAngle + fraction * (seg.endAngle - seg.startAngle);
        const pos = polarToCartesian(CX, CY, RADIUS, angle);
        return { x: pos.x, y: pos.y, color: seg.color };
      }
    }
    return null;
  }, [phase, segments]);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {hasData ? (
          <>
            {segments.map((seg) => (
              <Path
                key={seg.phase}
                d={describeArc(CX, CY, RADIUS, seg.startAngle, seg.endAngle)}
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                fill="none"
              />
            ))}
            {dot && (
              <SvgCircle
                cx={dot.x}
                cy={dot.y}
                r={7}
                fill={dot.color}
                stroke="#FFFFFF"
                strokeWidth={2.5}
              />
            )}
          </>
        ) : (
          <SvgCircle
            cx={CX}
            cy={CY}
            r={RADIUS}
            stroke={colors.surfaceTertiary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        )}
      </Svg>

      {/* Center content */}
      <View style={styles.center}>
        {hasData ? (
          <>
            <Text style={styles.dayText}>Day {phase.dayInCycle}</Text>
            <Text style={styles.ofText}>of {phase.cycleLength}</Text>
          </>
        ) : (
          <Text style={styles.startText}>Start tracking</Text>
        )}

        {/* Primary action */}
        {isOngoingPeriod ? (
          <TouchableOpacity style={styles.btn} onPress={onEndPeriod} activeOpacity={0.7}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={[styles.btnText, { color: colors.success }]}>End period</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={onLogPeriod}
            activeOpacity={0.7}
          >
            <Ionicons name="water-outline" size={16} color={colors.onPrimary} />
            <Text style={[styles.btnText, styles.btnTextPrimary]}>
              Log period
            </Text>
          </TouchableOpacity>
        )}

        {/* Secondary actions */}
        <View style={styles.chips}>
          <TouchableOpacity style={styles.chip} onPress={onLogToday} activeOpacity={0.6}>
            <Text style={styles.chipText}>Symptoms</Text>
          </TouchableOpacity>
          {periodCount > 0 && (
            <TouchableOpacity style={styles.chip} onPress={onHistory} activeOpacity={0.6}>
              <Text style={styles.chipText}>History</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      height: SIZE,
    },
    center: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayText: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
    },
    ofText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textTertiary,
      marginBottom: 12,
    },
    startText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 22,
      backgroundColor: colors.surfaceTertiary,
    },
    btnPrimary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    btnText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    btnTextPrimary: {
      color: colors.onPrimary,
    },
    chips: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.primary,
    },
  });
