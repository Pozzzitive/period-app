import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { addMonths, addYears } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import { CornerFlowers } from '@/src/components/decorations/CornerFlowers';
import {
  initIAP,
  teardownIAP,
  loadProducts,
  buyBaseApp,
  buySubscription,
  restorePurchases,
  isSubscriptionId,
  getPeriodFromProductId,
  PRODUCT_IDS,
  SUBSCRIPTION_IDS,
} from '@/src/services/iap';
import type { ProductOrSubscription } from 'react-native-iap';

export default function PaywallScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isOnboarding = mode === 'onboarding';
  const { colors } = useTheme();
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);
  const setPurchasedApp = useSubscriptionStore((s) => s.setPurchasedApp);
  const hasPurchasedApp = useSubscriptionStore((s) => s.hasPurchasedApp);
  const isPremiumPlus = useSubscriptionStore((s) => s.subscription.tier === 'premium_plus' && s.subscription.isActive);

  const [products, setProducts] = useState<ProductOrSubscription[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const navigateAway = () => {
    if (isOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  useEffect(() => {
    initIAP(
      (purchase) => {
        const productId = purchase.productId;
        if (productId === PRODUCT_IDS.BASE_APP) {
          setPurchasedApp(true);
        } else if (isSubscriptionId(productId)) {
          const period = getPeriodFromProductId(productId);
          const now = new Date();
          const expiresAt = period === 'yearly'
            ? addYears(now, 1).toISOString()
            : addMonths(now, 1).toISOString();
          setSubscription({
            tier: 'premium_plus',
            isActive: true,
            period: period ?? 'monthly',
            purchasedAt: now.toISOString(),
            expiresAt,
            productId,
          });
        }
        setLoading(false);
        Alert.alert('Purchase Complete', 'Thank you for your purchase!', [
          { text: 'OK', onPress: navigateAway },
        ]);
      },
      (error) => {
        setLoading(false);
        Alert.alert('Purchase Failed', error.message ?? 'Something went wrong. Please try again.');
      },
    );

    loadProducts().then((p) => { setProducts(p); setProductsLoading(false); }).catch(() => setProductsLoading(false));

    return () => teardownIAP();
  }, []);

  const handleBuyApp = async () => {
    setLoading(true);
    try {
      await buyBaseApp();
    } catch {
      setLoading(false);
    }
  };

  const handleSubscribe = async (period: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      await buySubscription(period);
    } catch {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const purchases = await restorePurchases();
      let restored = false;

      for (const purchase of purchases) {
        if (purchase.productId === PRODUCT_IDS.BASE_APP) {
          setPurchasedApp(true);
          restored = true;
        } else if (isSubscriptionId(purchase.productId)) {
          const period = getPeriodFromProductId(purchase.productId);
          const purchaseDate = purchase.transactionDate
            ? new Date(Number(purchase.transactionDate))
            : new Date();
          const expiresAt = period === 'yearly'
            ? addYears(purchaseDate, 1).toISOString()
            : addMonths(purchaseDate, 1).toISOString();
          setSubscription({
            tier: 'premium_plus',
            isActive: true,
            period: period ?? 'monthly',
            purchasedAt: purchaseDate.toISOString(),
            expiresAt,
            productId: purchase.productId,
          });
          restored = true;
        }
      }

      if (restored) {
        Alert.alert('Restored', 'Your purchases have been restored.', [
          { text: 'OK', onPress: navigateAway },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const findProduct = (id: string) => products.find((p) => ('id' in p && p.id === id) || ('productId' in p && p.productId === id));
  const getPrice = (p: ProductOrSubscription | undefined) => p && 'displayPrice' in p ? p.displayPrice : null;

  const basePrice = getPrice(findProduct(PRODUCT_IDS.BASE_APP)) ?? (productsLoading ? '...' : '€5.99');
  const monthlyPrice = getPrice(findProduct(SUBSCRIPTION_IDS.MONTHLY)) ?? (productsLoading ? '...' : '€1.49');
  const yearlyPrice = getPrice(findProduct(SUBSCRIPTION_IDS.YEARLY)) ?? (productsLoading ? '...' : '€12.99');

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Gradient hero header */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 48, paddingBottom: 36, paddingHorizontal: 24, position: 'relative', overflow: 'hidden' }}
        >
          <CornerFlowers opacity={0.25} />
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="flower-outline" size={64} color={colors.onPrimary} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.onPrimary, textAlign: 'center', marginBottom: 6 }}>
              Unlock Everything
            </Text>
            <Text style={{ fontSize: 15, color: colors.onPrimary, opacity: 0.85, textAlign: 'center' }}>
              Your cycle, your privacy, your way
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Base app purchase card */}
        {!hasPurchasedApp && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginTop: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>Full App</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
                Pay once. No ads. No data selling. Ever.
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                <BaseFeatureItem text="Cycle tracking" />
                <BaseFeatureItem text="Predictions" />
                <BaseFeatureItem text="Symptom logging" />
                <BaseFeatureItem text="Mood logging" />
                <BaseFeatureItem text="Pill reminders" />
                <BaseFeatureItem text="No ads" />
                <BaseFeatureItem text="App lock" />
                <BaseFeatureItem text="100% offline" />
              </View>

              <TouchableOpacity
                style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}
                onPress={handleBuyApp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.onPrimary }}>{basePrice}</Text>
                    <Text style={{ fontSize: 13, color: colors.onPrimary, opacity: 0.8, marginTop: 2 }}>One-time purchase</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Premium Plus card */}
        <Animated.View entering={FadeInDown.duration(500).delay(hasPurchasedApp ? 200 : 300)}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginTop: 16 }}>
            {isPremiumPlus ? (
              <View style={{ backgroundColor: colors.successLight, padding: 14, borderRadius: 12, marginBottom: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success }}>Premium Plus Active</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>All features are unlocked.</Text>
              </View>
            ) : null}

            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>Premium Plus</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Advanced insights and features
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              <PremiumFeatureItem text="Pattern insights" />
              <PremiumFeatureItem text="Trend graphs" />
              <PremiumFeatureItem text="Custom tags" />
              <PremiumFeatureItem text="Analytics" />
              <PremiumFeatureItem text="PDF export" />
              <PremiumFeatureItem text="Home widget" />
            </View>

            {/* Subscription buttons */}
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10, opacity: isPremiumPlus ? 0.5 : 1, position: 'relative' }}
              onPress={() => handleSubscribe('yearly')}
              disabled={loading || isPremiumPlus}
            >
              <View style={{ position: 'absolute', top: -10, right: 16, backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.onPrimary }}>Save 27%</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.onPrimary }}>{yearlyPrice}/year</Text>
              <Text style={{ fontSize: 13, color: colors.onPrimary, opacity: 0.8, marginTop: 2 }}>Billed annually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', opacity: isPremiumPlus ? 0.5 : 1 }}
              onPress={() => handleSubscribe('monthly')}
              disabled={loading || isPremiumPlus}
            >
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary }}>{monthlyPrice}/month</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>Cancel anytime</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Restore purchases */}
        <Animated.View entering={FadeInDown.duration(500).delay(hasPurchasedApp ? 300 : 400)}>
          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 14, marginTop: 8 }} onPress={handleRestore} disabled={restoring}>
            {restoring ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.primary }}>Restore purchases</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Legal text */}
        <Text style={{ fontSize: 11, textAlign: 'center', color: colors.textMuted, lineHeight: 16, marginTop: 4, paddingHorizontal: 8 }}>
          Payment will be charged to your {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} account.
          Subscription automatically renews unless cancelled at least 24 hours
          before the end of the current period.
        </Text>

        {/* Skip button — only in onboarding mode */}
        {isOnboarding && (
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 16, marginTop: 8, marginBottom: 8 }}
              onPress={navigateAway}
            >
              <Text style={{ fontSize: 15, color: colors.textSecondary }}>Maybe Later</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Continue free with ads</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}

function BaseFeatureItem({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 10 }}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={{ fontSize: 13, color: colors.text, marginLeft: 6, flex: 1 }}>{text}</Text>
    </View>
  );
}

function PremiumFeatureItem({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 10 }}>
      <Ionicons name="star" size={16} color={colors.primary} />
      <Text style={{ fontSize: 13, color: colors.text, marginLeft: 6, flex: 1 }}>{text}</Text>
    </View>
  );
}
