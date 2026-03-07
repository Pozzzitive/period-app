import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
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
  const { colors } = useTheme();
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);
  const setPurchasedApp = useSubscriptionStore((s) => s.setPurchasedApp);
  const hasPurchasedApp = useSubscriptionStore((s) => s.hasPurchasedApp);
  const isPremiumPlus = useSubscriptionStore((s) => s.subscription.tier === 'premium_plus' && s.subscription.isActive);

  const [products, setProducts] = useState<ProductOrSubscription[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    initIAP(
      // Purchase success
      (purchase) => {
        const productId = purchase.productId;
        if (productId === PRODUCT_IDS.BASE_APP) {
          setPurchasedApp(true);
        } else if (isSubscriptionId(productId)) {
          const period = getPeriodFromProductId(productId);
          setSubscription({
            tier: 'premium_plus',
            isActive: true,
            period: period ?? 'monthly',
            purchasedAt: new Date().toISOString(),
            productId,
          });
        }
        setLoading(false);
        Alert.alert('Purchase Complete', 'Thank you for your purchase!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      // Purchase error
      (error) => {
        setLoading(false);
        Alert.alert('Purchase Failed', error.message ?? 'Something went wrong. Please try again.');
      },
    );

    // Fetch available products
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
          setSubscription({
            tier: 'premium_plus',
            isActive: true,
            period: period ?? 'monthly',
            purchasedAt: purchase.transactionDate
              ? new Date(Number(purchase.transactionDate)).toISOString()
              : new Date().toISOString(),
            productId: purchase.productId,
          });
          restored = true;
        }
      }

      if (restored) {
        Alert.alert('Restored', 'Your purchases have been restored.', [
          { text: 'OK', onPress: () => router.back() },
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

  // Find localized prices from fetched products
  const findProduct = (id: string) => products.find((p) => ('id' in p && p.id === id) || ('productId' in p && p.productId === id));
  const getPrice = (p: ProductOrSubscription | undefined) => p && 'displayPrice' in p ? p.displayPrice : null;

  const baseProduct = findProduct(PRODUCT_IDS.BASE_APP);
  const basePrice = getPrice(baseProduct) ?? (productsLoading ? '...' : '€5.99');
  const monthlyPrice = getPrice(findProduct(SUBSCRIPTION_IDS.MONTHLY)) ?? (productsLoading ? '...' : '€1.49');
  const yearlyPrice = getPrice(findProduct(SUBSCRIPTION_IDS.YEARLY)) ?? (productsLoading ? '...' : '€12.99');

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Base app purchase */}
      {!hasPurchasedApp && (
        <>
          <Text className="text-[28px] font-bold text-center mb-1" style={{ color: colors.text }}>Get the Full App</Text>
          <Text className="text-base text-center mb-5" style={{ color: colors.textSecondary }}>
            Pay once. No ads. No data selling. Ever.
          </Text>

          <View className="gap-3 mb-5">
            <BaseFeatureItem text="Full cycle tracking & predictions" />
            <BaseFeatureItem text="Symptom & mood logging" />
            <BaseFeatureItem text="All notifications & pill reminders" />
            <BaseFeatureItem text="Intercourse logging" />
            <BaseFeatureItem text="App lock & biometric protection" />
            <BaseFeatureItem text="100% offline — your data stays on-device" />
          </View>

          <TouchableOpacity
            className="p-5 rounded-[14px] items-center mb-3"
            style={{ backgroundColor: colors.primary }}
            onPress={handleBuyApp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-[22px] font-bold" style={{ color: colors.onPrimary }}>{basePrice}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="text-sm mt-0.5">One-time purchase</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="h-px my-5" style={{ backgroundColor: colors.border }} />
        </>
      )}

      {/* Premium Plus subscription — hide purchase UI if already subscribed */}
      {isPremiumPlus ? (
        <View className="p-5 rounded-[14px] items-center mb-4" style={{ backgroundColor: colors.successLight }}>
          <Text className="text-lg font-bold mb-1" style={{ color: colors.success }}>Premium Plus Active</Text>
          <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
            You already have Premium Plus. All features are unlocked.
          </Text>
        </View>
      ) : null}

      <Text className="text-[28px] font-bold text-center mb-1" style={{ color: colors.primary }}>Premium Plus</Text>
      <Text className="text-base text-center mb-5" style={{ color: colors.textSecondary }}>
        Unlock advanced insights and features
      </Text>

      <View className="gap-3.5 mb-7">
        <FeatureItem iconName="analytics-outline" text="Symptom pattern insights" desc="Discover trends in your symptoms" />
        <FeatureItem iconName="trending-up-outline" text="Cycle-over-cycle trend graphs" desc="Compare your last 3/6/12 cycles" />
        <FeatureItem iconName="pricetag-outline" text="Custom symptom tags" desc="Create your own symptom categories" />
        <FeatureItem iconName="document-text-outline" text="Extended analytics & reports" desc="Detailed cycle analysis" />
        <FeatureItem iconName="download-outline" text="Export as PDF" desc="Share with your healthcare provider" />
        <FeatureItem iconName="phone-portrait-outline" text="Home screen widget" desc="Period countdown at a glance" />
      </View>

      <TouchableOpacity
        className="p-5 rounded-[14px] items-center mb-2.5 relative"
        style={{ backgroundColor: colors.primary, opacity: isPremiumPlus ? 0.5 : 1 }}
        onPress={() => handleSubscribe('yearly')}
        disabled={loading || isPremiumPlus}
      >
        <View className="absolute -top-2.5 right-4 px-2.5 py-1 rounded-[10px]" style={{ backgroundColor: colors.success }}>
          <Text className="text-[12px] font-bold" style={{ color: colors.onPrimary }}>Save 27%</Text>
        </View>
        <Text className="text-[22px] font-bold" style={{ color: colors.onPrimary }}>{yearlyPrice}/year</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="text-sm mt-0.5">Billed annually</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="p-5 rounded-[14px] items-center mb-2.5"
        style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, opacity: isPremiumPlus ? 0.5 : 1 }}
        onPress={() => handleSubscribe('monthly')}
        disabled={loading || isPremiumPlus}
      >
        <Text className="text-[22px] font-bold" style={{ color: colors.primary }}>{monthlyPrice}/month</Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>Cancel anytime</Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center py-3.5 mt-1" onPress={handleRestore} disabled={restoring}>
        {restoring ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text className="text-[15px] font-medium" style={{ color: colors.primary }}>Restore purchases</Text>
        )}
      </TouchableOpacity>

      <Text className="text-[11px] text-center mt-2 leading-4" style={{ color: colors.textMuted }}>
        Payment will be charged to your {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} account.
        Subscription automatically renews unless cancelled at least 24 hours
        before the end of the current period.
      </Text>
    </ScrollView>
  );
}

function BaseFeatureItem({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-2.5">
      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      <Text className="text-[15px] flex-1" style={{ color: colors.text }}>{text}</Text>
    </View>
  );
}

function FeatureItem({ iconName, text, desc }: { iconName: React.ComponentProps<typeof Ionicons>['name']; text: string; desc: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-start gap-3">
      <Ionicons name={iconName} size={24} color={colors.primary} />
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>{text}</Text>
        <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>{desc}</Text>
      </View>
    </View>
  );
}
