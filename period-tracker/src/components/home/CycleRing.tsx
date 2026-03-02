import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { s, fs } from '@/src/utils/scale';
import { getCyclePhaseRanges } from '@/src/engine';
import { PHASES } from '@/src/constants/phases';
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

const SIZE = s(240);
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = s(106);
const STROKE_WIDTH = s(13);
const GAP_DEGREES = 2;  // degrees, not pixels — leave as-is
const HIT_SLOP_WIDTH = s(28);

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
  tintColor: string;
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
  const [selectedSegment, setSelectedSegment] = useState<CyclePhase | null>(null);

  // How many days past the expected cycle end (period is late)
  const lateDays = phase ? Math.max(0, phase.dayInCycle - cycleLength) : 0;
  const effectiveLength = cycleLength + lateDays;

  // Build arc segments from engine ranges
  const segments = useMemo((): ArcSegment[] => {
    const ranges = getCyclePhaseRanges('2000-01-01', cycleLength, periodLength, lateDays);
    const totalGap = ranges.length * GAP_DEGREES;
    const usable = 360 - totalGap;

    const result: ArcSegment[] = [];
    let angle = -90; // 12 o'clock

    for (const range of ranges) {
      const days = range.endDay - range.startDay + 1;
      const sweep = (days / effectiveLength) * usable;
      const halfGap = GAP_DEGREES / 2;

      result.push({
        phase: range.phase,
        startAngle: angle + halfGap,
        endAngle: angle + halfGap + sweep,
        startDay: range.startDay,
        endDay: range.endDay,
        color: colors.phases[range.phase].color,
        tintColor: colors.phases[range.phase].color + '55',
      });

      angle += halfGap + sweep + halfGap;
    }

    return result;
  }, [cycleLength, periodLength, lateDays, effectiveLength, colors.phases]);

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

  const handleSegmentPress = useCallback((segPhase: CyclePhase) => {
    setSelectedSegment((prev) => (prev === segPhase ? null : segPhase));
  }, []);

  // Info + position for the selected segment callout
  const segmentInfo = useMemo(() => {
    if (!selectedSegment) return null;
    const seg = segments.find((s) => s.phase === selectedSegment);
    if (!seg) return null;
    const days = seg.endDay - seg.startDay + 1;
    const label = PHASES[seg.phase].label;
    const midAngle = (seg.startAngle + seg.endAngle) / 2;
    const pos = polarToCartesian(CX, CY, RADIUS + s(28), midAngle);
    return { label, days, color: seg.color, x: pos.x, y: pos.y };
  }, [selectedSegment, segments]);

  return (
    <Pressable style={styles.container} onPress={() => setSelectedSegment(null)}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {hasData ? (
          <>
            {/* Invisible wider hit areas for tapping */}
            {segments.map((seg) => (
              <Path
                key={`hit-${seg.phase}`}
                d={describeArc(CX, CY, RADIUS, seg.startAngle, seg.endAngle)}
                stroke="transparent"
                strokeWidth={HIT_SLOP_WIDTH}
                fill="none"
                onPress={() => handleSegmentPress(seg.phase)}
              />
            ))}
            {/* Visible arcs */}
            {segments.map((seg) => (
              <Path
                key={seg.phase}
                d={describeArc(CX, CY, RADIUS, seg.startAngle, seg.endAngle)}
                stroke={selectedSegment === seg.phase || phase?.phase === seg.phase ? seg.color : seg.tintColor}
                strokeWidth={selectedSegment === seg.phase ? STROKE_WIDTH + s(3) : STROKE_WIDTH}
                strokeLinecap="round"
                fill="none"
                onPress={() => handleSegmentPress(seg.phase)}
              />
            ))}
            {dot && (
              <SvgCircle
                cx={dot.x}
                cy={dot.y}
                r={s(7)}
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

      {/* Center content — always visible */}
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
            <Ionicons name="checkmark-circle-outline" size={s(14)} color={colors.success} />
            <Text style={[styles.btnText, { color: colors.success }]}>End period</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={onLogPeriod}
            activeOpacity={0.7}
          >
            <Ionicons name="water-outline" size={s(14)} color={colors.onPrimary} />
            <Text style={[styles.btnText, styles.btnTextPrimary]}>
              Log period
            </Text>
          </TouchableOpacity>
        )}

        {/* Secondary actions */}
        {hasData && (
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
        )}
      </View>

      {/* Animated side callout */}
      {segmentInfo && (
        <Animated.View
          key={selectedSegment}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.callout,
            {
              backgroundColor: segmentInfo.color,
              left: Math.max(s(4), Math.min(segmentInfo.x - s(48), SIZE - s(100))),
              top: Math.max(s(4), Math.min(segmentInfo.y - s(16), SIZE - s(36))),
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setSelectedSegment(null)}
            activeOpacity={0.8}
            style={styles.calloutInner}
          >
            <Text style={styles.calloutLabel}>{segmentInfo.label}</Text>
            <Text style={styles.calloutDays}>
              {segmentInfo.days} {segmentInfo.days === 1 ? 'day' : 'days'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Pressable>
  );
}

// ── Styles ───────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0,
      height: SIZE,
    },
    center: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: RADIUS * 2 - STROKE_WIDTH * 2 - s(16),
    },
    dayText: {
      fontSize: fs(28),
      fontWeight: '700',
      color: colors.text,
    },
    ofText: {
      fontSize: fs(14),
      fontWeight: '500',
      color: colors.textTertiary,
      marginBottom: s(8),
    },
    startText: {
      fontSize: fs(18),
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: s(12),
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5),
      paddingHorizontal: s(16),
      paddingVertical: s(8),
      borderRadius: s(20),
      backgroundColor: colors.surfaceTertiary,
    },
    btnPrimary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.3,
      shadowRadius: s(4),
      elevation: 3,
    },
    btnText: {
      fontSize: fs(13),
      fontWeight: '600',
      color: colors.text,
    },
    btnTextPrimary: {
      color: colors.onPrimary,
    },
    chips: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: s(8),
      gap: s(6),
    },
    chip: {
      paddingHorizontal: s(10),
      paddingVertical: s(4),
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    chipText: {
      fontSize: fs(11),
      fontWeight: '500',
      color: colors.primary,
    },
    callout: {
      position: 'absolute',
      borderRadius: s(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.2,
      shadowRadius: s(4),
      elevation: 4,
    },
    calloutInner: {
      alignItems: 'center',
      paddingHorizontal: s(10),
      paddingVertical: s(6),
    },
    calloutLabel: {
      fontSize: fs(12),
      fontWeight: '700',
      color: '#FFFFFF',
    },
    calloutDays: {
      fontSize: fs(10),
      fontWeight: '500',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 1,
    },
  });
