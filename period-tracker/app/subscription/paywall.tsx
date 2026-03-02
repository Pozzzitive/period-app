import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/src/stores';

export default function PaywallScreen() {
  const router = useRouter();
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);

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
        <FeatureItem emoji="📊" text="Symptom pattern insights" desc="Discover trends in your symptoms" />
        <FeatureItem emoji="📈" text="Cycle-over-cycle trend graphs" desc="Compare your last 3/6/12 cycles" />
        <FeatureItem emoji="🏷️" text="Custom symptom tags" desc="Create your own symptom categories" />
        <FeatureItem emoji="📋" text="Extended analytics & reports" desc="Detailed cycle analysis" />
        <FeatureItem emoji="📄" text="Export as PDF" desc="Share with your healthcare provider" />
        <FeatureItem emoji="📱" text="Home screen widget" desc="Period countdown at a glance" />
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

function FeatureItem({ emoji, text, desc }: { emoji: string; text: string; desc: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{text}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresList: {
    gap: 14,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  planCard: {
    backgroundColor: '#E74C3C',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  planCardSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#27AE60',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  restoreText: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});
