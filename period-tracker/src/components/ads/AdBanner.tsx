import React, { useState, useEffect } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { useSubscriptionStore, selectShouldShowAds } from '@/src/stores/subscription-store';
import { useUserStore } from '@/src/stores/user-store';
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch {
  // Native module not available (e.g. Expo Go or missing native rebuild)
}

// TODO: Replace with real ad unit IDs before production release
const PROD_AD_UNIT_IDS = {
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
};

function getAdUnitId(): string {
  if (__DEV__ || !TestIds) return TestIds?.ADAPTIVE_BANNER ?? '';
  return Platform.OS === 'ios' ? PROD_AD_UNIT_IDS.ios : PROD_AD_UNIT_IDS.android;
}

interface AdBannerProps {
  containerStyle?: ViewStyle;
}

export function AdBanner({ containerStyle }: AdBannerProps) {
  const shouldShowAds = useSubscriptionStore(selectShouldShowAds);
  const isTeenager = useUserStore((s) => s.profile.isTeenager);
  const [failed, setFailed] = useState(false);
  const [trackingResolved, setTrackingResolved] = useState(Platform.OS !== 'ios');
  const [nonPersonalized, setNonPersonalized] = useState(true);

  // Request ATT permission on iOS before showing any ad
  // Skip ATT for teenagers — they always get non-personalized child-safe ads
  useEffect(() => {
    if (Platform.OS !== 'ios' || !shouldShowAds || isTeenager) {
      setTrackingResolved(true);
      return;
    }

    (async () => {
      const { status } = await getTrackingPermissionsAsync();
      if (status === 'undetermined') {
        const { status: newStatus } = await requestTrackingPermissionsAsync();
        setNonPersonalized(newStatus !== 'granted');
      } else {
        setNonPersonalized(status !== 'granted');
      }
      setTrackingResolved(true);
    })();
  }, [shouldShowAds, isTeenager]);

  if (!BannerAd || !shouldShowAds || failed || !trackingResolved) {
    return null;
  }

  // COPPA / GDPR Article 8: child-directed treatment for teenager mode
  const requestOptions = isTeenager
    ? {
        requestNonPersonalizedAdsOnly: true,
        tagForChildDirectedTreatment: true,
        maxAdContentRating: 'G' as const,
      }
    : { requestNonPersonalizedAdsOnly: nonPersonalized };

  return (
    <View style={[{ alignItems: 'center', marginVertical: 12 }, containerStyle]}>
      <BannerAd
        unitId={getAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={requestOptions}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
