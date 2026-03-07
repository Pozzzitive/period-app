import { createWidget, type WidgetBase } from 'expo-widgets';
import { Text, VStack, HStack, ZStack, Spacer, Gauge } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  padding,
  frame,
  gaugeStyle,
  tint,
  opacity,
  background,
} from '@expo/ui/swift-ui/modifiers';
import { shapes } from '@expo/ui/swift-ui/modifiers';

type CycleWidgetProps = {
  cycleDay: number;
  phaseName: string;
  phaseColor: string;
  daysUntilNextPeriod: number;
  cycleLength: number;
  periodLength: number;
  isPremiumPlus: boolean;
};

function CycleWidgetComponent(props: WidgetBase<CycleWidgetProps>) {
  'widget';

  const {
    family,
    cycleDay,
    phaseName,
    phaseColor,
    daysUntilNextPeriod,
    cycleLength,
    periodLength,
    isPremiumPlus,
  } = props;

  // Free users: show sample preview faded + upgrade badge
  if (!isPremiumPlus) {
    const sampleColor = '#A888C4';

    if (family === 'systemSmall') {
      return (
        <ZStack>
          <VStack
            spacing={6}
            alignment="leading"
            modifiers={[padding({ all: 14 }), opacity(0.25)]}
          >
            <Text
              modifiers={[
                font({ size: 11, weight: 'medium' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}
            >
              Cycle Tracker
            </Text>
            <Text modifiers={[font({ size: 28, weight: 'bold' }), foregroundStyle(sampleColor)]}>
              Day 14
            </Text>
            <Text
              modifiers={[
                font({ size: 13, weight: 'medium' }),
                foregroundStyle({ type: 'hierarchical', style: 'primary' }),
              ]}
            >
              Ovulation
            </Text>
            <Spacer />
            <Gauge
              value={0.5}
              min={0}
              max={1}
              modifiers={[gaugeStyle('linearCapacity'), tint(sampleColor)]}
            />
          </VStack>
          <VStack alignment="center">
            <Spacer />
            <Text
              modifiers={[
                font({ size: 12, weight: 'bold' }),
                foregroundStyle('#FFFFFF'),
                padding({ horizontal: 10, vertical: 5 }),
                background('#A888C4', shapes.capsule()),
              ]}
            >
              Get Premium
            </Text>
            <Spacer />
          </VStack>
        </ZStack>
      );
    }

    // systemMedium teaser
    return (
      <ZStack>
        <HStack spacing={16} modifiers={[padding({ all: 14 }), opacity(0.25)]}>
          <VStack spacing={6} alignment="leading">
            <Text
              modifiers={[
                font({ size: 11, weight: 'medium' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}
            >
              Cycle Tracker
            </Text>
            <Text modifiers={[font({ size: 28, weight: 'bold' }), foregroundStyle(sampleColor)]}>
              Day 14
            </Text>
            <Text
              modifiers={[
                font({ size: 14, weight: 'medium' }),
                foregroundStyle({ type: 'hierarchical', style: 'primary' }),
              ]}
            >
              Ovulation
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 12 }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}
            >
              14 days until next period
            </Text>
          </VStack>
          <Spacer />
          <VStack alignment="center" modifiers={[frame({ width: 80, height: 80 })]}>
            <Gauge
              value={0.5}
              min={0}
              max={1}
              modifiers={[gaugeStyle('circular'), tint(sampleColor)]}
            />
          </VStack>
        </HStack>
        <VStack alignment="center">
          <Spacer />
          <Text
            modifiers={[
              font({ size: 13, weight: 'bold' }),
              foregroundStyle('#FFFFFF'),
              padding({ horizontal: 14, vertical: 6 }),
              background('#A888C4', shapes.capsule()),
            ]}
          >
            Upgrade to Premium
          </Text>
          <Spacer />
        </VStack>
      </ZStack>
    );
  }

  // Premium user — real data
  const progress = cycleLength > 0 ? cycleDay / cycleLength : 0;
  const daysText =
    daysUntilNextPeriod === 0
      ? 'Period expected today'
      : daysUntilNextPeriod === 1
        ? '1 day until next period'
        : `${daysUntilNextPeriod} days until next period`;

  if (family === 'systemSmall') {
    return (
      <VStack
        spacing={6}
        alignment="leading"
        modifiers={[padding({ all: 14 })]}
      >
        <Text
          modifiers={[
            font({ size: 11, weight: 'medium' }),
            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
          ]}
        >
          Cycle Tracker
        </Text>
        <Text modifiers={[font({ size: 28, weight: 'bold' }), foregroundStyle(phaseColor)]}>
          Day {cycleDay}
        </Text>
        <Text
          modifiers={[
            font({ size: 13, weight: 'medium' }),
            foregroundStyle({ type: 'hierarchical', style: 'primary' }),
          ]}
        >
          {phaseName}
        </Text>
        <Spacer />
        <Gauge
          value={progress}
          min={0}
          max={1}
          modifiers={[gaugeStyle('linearCapacity'), tint(phaseColor)]}
        >
          <Text modifiers={[font({ size: 10 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
            {daysUntilNextPeriod}d
          </Text>
        </Gauge>
      </VStack>
    );
  }

  // systemMedium
  return (
    <HStack spacing={16} modifiers={[padding({ all: 14 })]}>
      <VStack spacing={6} alignment="leading">
        <Text
          modifiers={[
            font({ size: 11, weight: 'medium' }),
            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
          ]}
        >
          Cycle Tracker
        </Text>
        <Text modifiers={[font({ size: 28, weight: 'bold' }), foregroundStyle(phaseColor)]}>
          Day {cycleDay}
        </Text>
        <Text
          modifiers={[
            font({ size: 14, weight: 'medium' }),
            foregroundStyle({ type: 'hierarchical', style: 'primary' }),
          ]}
        >
          {phaseName}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 12 }),
            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
          ]}
        >
          {daysText}
        </Text>
      </VStack>
      <Spacer />
      <VStack alignment="center" modifiers={[frame({ width: 80, height: 80 })]}>
        <Gauge
          value={progress}
          min={0}
          max={1}
          modifiers={[gaugeStyle('circular'), tint(phaseColor)]}
        >
          <Text modifiers={[font({ size: 18, weight: 'bold' }), foregroundStyle(phaseColor)]}>
            {cycleDay}
          </Text>
        </Gauge>
      </VStack>
    </HStack>
  );
}

export const CycleWidget = createWidget<CycleWidgetProps>(
  'CycleWidget',
  CycleWidgetComponent,
);
