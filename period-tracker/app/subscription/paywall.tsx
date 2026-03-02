import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function PaywallScreen() {
  const router = useRouter();
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePurchase = (period: 'monthly' | 'yearly') => {
    // In production: use react-native-iap to process purchase
    Alert.alert(
      'In-App Purchase',
      `This will initiate a ${period} subscription purchase via the App Store. This feature requires react-native-iap to be configured with real product IDs.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Purchase',
          onPress: () => {
            setSubscription({
              tier: 'premium_plus',
              isActive: true,
              period,
              purchasedAt: new Date().toISOString(),
            });
            router.back();
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'This will check for existing purchases. In production, this uses react-native-iap.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Premium Plus</Text>
      <Text style={styles.subtitle}>
        Unlock advanced insights and features
      </Text>

      {/* Features list */}
      <View style={styles.featuresList}>
        <FeatureItem iconName="analytics-outline" text="Symptom pattern insights" desc="Discover trends in your symptoms" styles={styles} colors={colors} />
        <FeatureItem iconName="trending-up-outline" text="Cycle-over-cycle trend graphs" desc="Compare your last 3/6/12 cycles" styles={styles} colors={colors} />
        <FeatureItem iconName="pricetag-outline" text="Custom symptom tags" desc="Create your own symptom categories" styles={styles} colors={colors} />
        <FeatureItem iconName="document-text-outline" text="Extended analytics & reports" desc="Detailed cycle analysis" styles={styles} colors={colors} />
        <FeatureItem iconName="download-outline" text="Export as PDF" desc="Share with your healthcare provider" styles={styles} colors={colors} />
        <FeatureItem iconName="phone-portrait-outline" text="Home screen widget" desc="Period countdown at a glance" styles={styles} colors={colors} />
      </View>

      {/* Pricing */}
      <TouchableOpacity style={styles.planCard} onPress={() => handlePurchase('yearly')}>
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>Save 27%</Text>
        </View>
        <Text style={styles.planPrice}>€12.99/year</Text>
        <Text style={styles.planPer}>€1.08/month</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.planCard, styles.planCardSecondary]} onPress={() => handlePurchase('monthly')}>
        <Text style={styles.planPrice}>€1.49/month</Text>
        <Text style={styles.planPer}>Cancel anytime</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreText}>Restore purchases</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Payment will be charged to your App Store account. Subscription
        automatically renews unless cancelled at least 24 hours before the end of
        the current period.
      </Text>
    </ScrollView>
  );
}

function FeatureItem({ iconName, text, desc, styles, colors }: { iconName: React.ComponentProps<typeof Ionicons>['name']; text: string; desc: string; styles: ReturnType<typeof createStyles>; colors: ThemeColors }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={iconName} size={s(24)} color={colors.primary} />
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{text}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(20),
    paddingBottom: s(40),
  },
  title: {
    fontSize: fs(28),
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: s(4),
  },
  subtitle: {
    fontSize: fs(16),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: s(24),
  },
  featuresList: {
    gap: s(14),
    marginBottom: s(28),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.text,
  },
  featureDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginTop: s(2),
  },
  planCard: {
    backgroundColor: colors.primary,
    padding: s(20),
    borderRadius: s(14),
    alignItems: 'center',
    marginBottom: s(10),
    position: 'relative',
  },
  planCardSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  saveBadge: {
    position: 'absolute',
    top: s(-10),
    right: s(16),
    backgroundColor: colors.success,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: s(10),
  },
  saveText: {
    color: colors.onPrimary,
    fontSize: fs(12),
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: fs(22),
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
  planPer: {
    fontSize: fs(14),
    color: 'rgba(255,255,255,0.8)',
    marginTop: s(2),
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: s(14),
    marginTop: s(4),
  },
  restoreText: {
    fontSize: fs(15),
    color: colors.primary,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: fs(11),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: s(8),
    lineHeight: fs(16),
  },
});
