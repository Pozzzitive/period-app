import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/src/theme';

export interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  unit?: string;
  color?: string;
}

const PADDING = { top: 20, right: 16, bottom: 32, left: 36 };

export function LineChart({ data, height = 180, unit = '', color }: LineChartProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const lineColor = color ?? colors.primary;

  const handleLayout = (e: { nativeEvent: { layout: { width: number } } }) =>
    setContainerWidth(e.nativeEvent.layout.width);

  if (data.length === 0 || containerWidth === 0) {
    return <View style={{ height }} onLayout={handleLayout} />;
  }

  const chartWidth = containerWidth - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values) * 1.1;
  const minValue = Math.min(...values) * 0.9;
  const range = maxValue - minValue || 1;

  const getX = (i: number) => {
    if (data.length === 1) return PADDING.left + chartWidth / 2;
    return PADDING.left + (i / (data.length - 1)) * chartWidth;
  };
  const getY = (value: number) =>
    PADDING.top + chartHeight - ((value - minValue) / range) * chartHeight;

  // Build smooth path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return (
    <View onLayout={handleLayout}>
      <Svg width={containerWidth} height={height}>
        {/* Y-axis labels */}
        <SvgText x={PADDING.left - 4} y={PADDING.top + 4} textAnchor="end" fontSize={10} fill={colors.textTertiary}>
          {Math.round(maxValue)}{unit}
        </SvgText>
        <SvgText x={PADDING.left - 4} y={PADDING.top + chartHeight + 4} textAnchor="end" fontSize={10} fill={colors.textTertiary}>
          {Math.round(minValue)}{unit}
        </SvgText>

        {/* Grid line */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top + chartHeight}
          x2={containerWidth - PADDING.right}
          y2={PADDING.top + chartHeight}
          stroke={colors.borderSubtle}
          strokeWidth={0.5}
        />

        {/* Line path */}
        <Path d={pathD} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" />

        {/* Dots and labels */}
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <Circle cx={getX(i)} cy={getY(d.value)} r={4} fill={lineColor} />
            <Circle cx={getX(i)} cy={getY(d.value)} r={2} fill="white" />
            <SvgText
              x={getX(i)}
              y={height - 6}
              textAnchor="middle"
              fontSize={9}
              fill={colors.textTertiary}
            >
              {d.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
