import React, { useState } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { useSubscriptionStore, selectShouldShowAds } from '@/src/stores/subscription-store';

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
  const [failed, setFailed] = useState(false);

  if (!BannerAd || !shouldShowAds || failed) {
    return null;
  }

  return (
    <View style={[{ alignItems: 'center', marginVertical: 12 }, containerStyle]}>
      <BannerAd
        unitId={getAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
