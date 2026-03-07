import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  enabled?: boolean;
  onToggle?: (val: boolean) => void;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  enabled,
  onToggle,
  defaultExpanded = false,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { colors } = useTheme();

  // Auto-collapse when section is disabled via the switch
  useEffect(() => {
    if (enabled === false && expanded) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(false);
    }
  }, [enabled]);

  const handleToggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <View className="mt-4">
      <TouchableOpacity
        className="flex-row items-center py-2 mb-2"
        onPress={handleToggleExpand}
        activeOpacity={0.6}
      >
        <Text className="text-[13px] font-semibold uppercase tracking-widest flex-1" style={{ color: colors.textTertiary }}>
          {title}
        </Text>
        {!expanded && subtitle != null && (
          <Text className="text-[12px] mr-2" style={{ color: colors.textMuted }}>{subtitle}</Text>
        )}
        {enabled != null && (
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ true: colors.switchActive }}
            style={{ marginRight: 8 }}
          />
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}
