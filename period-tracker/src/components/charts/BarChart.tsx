import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/src/theme';

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  averageLine?: number;
  unit?: string;
}

const PADDING = { top: 20, right: 16, bottom: 32, left: 36 };

export function BarChart({ data, height = 180, averageLine, unit = '' }: BarChartProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (e: { nativeEvent: { layout: { width: number } } }) =>
    setContainerWidth(e.nativeEvent.layout.width);

  if (data.length === 0 || containerWidth === 0) {
    return <View style={{ height }} onLayout={handleLayout} />;
  }

  const chartWidth = containerWidth - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), averageLine ?? 0) * 1.15;
  const minValue = Math.min(...data.map((d) => d.value)) * 0.85;
  const range = maxValue - minValue || 1;

  const barWidth = Math.min(32, (chartWidth / data.length) * 0.6);
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

  const scaleY = (value: number) =>
    PADDING.top + chartHeight - ((value - minValue) / range) * chartHeight;

  return (
    <View onLayout={handleLayout}>
      <Svg width={containerWidth} height={height}>
        {/* Y-axis labels */}
        <SvgText
          x={PADDING.left - 4}
          y={PADDING.top + 4}
          textAnchor="end"
          fontSize={10}
          fill={colors.textTertiary}
        >
          {Math.round(maxValue)}{unit}
        </SvgText>
        <SvgText
          x={PADDING.left - 4}
          y={PADDING.top + chartHeight + 4}
          textAnchor="end"
          fontSize={10}
          fill={colors.textTertiary}
        >
          {Math.round(minValue)}{unit}
        </SvgText>

        {/* Bars */}
        {data.map((d, i) => {
          const x = PADDING.left + gap + i * (barWidth + gap);
          const barHeight = ((d.value - minValue) / range) * chartHeight;
          const y = PADDING.top + chartHeight - barHeight;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(1, barHeight)}
                rx={4}
                fill={colors.primary}
                opacity={0.85}
              />
              {/* Value label */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                fill={colors.textSecondary}
                fontWeight="600"
              >
                {d.value}
              </SvgText>
              {/* X-axis label */}
              <SvgText
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                fontSize={9}
                fill={colors.textTertiary}
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Average line */}
        {averageLine != null && (
          <>
            <Line
              x1={PADDING.left}
              y1={scaleY(averageLine)}
              x2={containerWidth - PADDING.right}
              y2={scaleY(averageLine)}
              stroke={colors.destructive}
              strokeWidth={1}
              strokeDasharray="4,3"
              opacity={0.6}
            />
            <SvgText
              x={containerWidth - PADDING.right}
              y={scaleY(averageLine) - 4}
              textAnchor="end"
              fontSize={9}
              fill={colors.destructive}
            >
              avg {averageLine}{unit}
            </SvgText>
          </>
        )}
      </Svg>
    </View>
  );
}
