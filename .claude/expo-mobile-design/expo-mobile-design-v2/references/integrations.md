# Integrations Reference

## Supabase

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store
```

### Setup
```ts
// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // Important: false for React Native
    },
  }
);
```

### Auth
```tsx
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Session listener (put in root _layout.tsx)
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
  });
  return () => subscription.unsubscribe();
}, []);
```

### Queries
```tsx
// Select
const { data, error } = await supabase
  .from('posts')
  .select('id, title, created_at, author:profiles(name)')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(20);

// Insert
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello', user_id: session.user.id })
  .select()
  .single();

// Update
const { error } = await supabase
  .from('posts')
  .update({ title: 'Updated' })
  .eq('id', postId);

// Delete
const { error } = await supabase.from('posts').delete().eq('id', postId);

// Realtime subscription
const channel = supabase
  .channel('posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log(payload))
  .subscribe();
// Cleanup:
supabase.removeChannel(channel);
```

### File Storage
```tsx
// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, fileBlob, { upsert: true });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);
```

---

## Firebase

```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

> **Note:** Firebase requires bare workflow or a config plugin. Use `@react-native-firebase` (not the web SDK `firebase`).

### app.config.js
```js
plugins: [
  '@react-native-firebase/app',
  '@react-native-firebase/auth',
]
```

### Auth
```tsx
import auth from '@react-native-firebase/auth';

// Sign up
const { user } = await auth().createUserWithEmailAndPassword(email, password);

// Sign in
const { user } = await auth().signInWithEmailAndPassword(email, password);

// Sign out
await auth().signOut();

// Listen to auth state
useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged(user => setUser(user));
  return unsubscribe;
}, []);
```

### Firestore
```tsx
import firestore from '@react-native-firebase/firestore';

// Get document
const doc = await firestore().collection('users').doc(userId).get();
const data = doc.data();

// Set / update
await firestore().collection('users').doc(userId).set({ name: 'Alice' }, { merge: true });

// Query
const snapshot = await firestore()
  .collection('posts')
  .where('published', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

// Realtime listener
const unsubscribe = firestore()
  .collection('posts')
  .onSnapshot(snapshot => {
    const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setPosts(posts);
  });
// Cleanup: unsubscribe()
```

---

## Stripe Payments

```bash
npx expo install @stripe/stripe-react-native
```

### app.config.js
```js
plugins: [
  ['@stripe/stripe-react-native', { merchantIdentifier: 'merchant.com.yourapp' }]
]
```

### Setup (root _layout.tsx)
```tsx
import { StripeProvider } from '@stripe/stripe-react-native';

<StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PK!}>
  {children}
</StripeProvider>
```

### Payment Sheet (Recommended Flow)
```tsx
import { useStripe } from '@stripe/stripe-react-native';

function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePayment = async () => {
    // 1. Call your backend to create a PaymentIntent
    const { paymentIntent, ephemeralKey, customer } = await fetchFromYourBackend('/create-payment-intent', {
      amount: 1999, // cents
    });

    // 2. Init the sheet
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Your App',
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: false,
      defaultBillingDetails: { name: 'Jane Doe' },
    });

    if (error) console.error(error);
  };

  const handlePay = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert('Payment failed', error.message);
    } else {
      Alert.alert('Success', 'Payment confirmed!');
    }
  };

  useEffect(() => { initializePayment(); }, []);

  return <Button title="Pay $19.99" onPress={handlePay} />;
}
```

### Apple Pay / Google Pay
```tsx
import { useApplePay, useGooglePay } from '@stripe/stripe-react-native';

// Apple Pay
const { presentApplePay, isApplePaySupported } = useApplePay();
if (isApplePaySupported) {
  const { error } = await presentApplePay({
    cartItems: [{ label: 'Your App', amount: '19.99', paymentType: 'final' }],
    country: 'US',
    currency: 'USD',
  });
}
```

---

## OAuth (Social Login)

### Google OAuth with Supabase
```bash
npx expo install expo-auth-session expo-web-browser
```

```tsx
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: makeRedirectUri({ scheme: 'myapp', path: 'auth/callback' }),
      },
    });

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url);
      // Supabase handles the session automatically via the deep link
    }
  };

  return (
    <Pressable onPress={handleGoogleLogin} className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 gap-3">
      <Text className="font-semibold text-gray-800">Continue with Google</Text>
    </Pressable>
  );
}
```

### app.config.js — Required for OAuth redirects
```js
scheme: 'myapp',  // enables myapp:// deep link for OAuth callback
```

---

## Biometric Authentication

```bash
npx expo install expo-local-authentication
```

```tsx
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics(): Promise<boolean> {
  // Check hardware support
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  // Check enrollment
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    Alert.alert('No biometrics set up', 'Please enable Face ID or fingerprint in your device settings.');
    return false;
  }

  // Authenticate
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirm your identity',
    cancelLabel: 'Use password instead',
    fallbackLabel: 'Enter password',
    disableDeviceFallback: false,  // allow PIN fallback
  });

  return result.success;
}

// Practical usage: protect sensitive screens
function SecureScreen() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    authenticateWithBiometrics().then(setUnlocked);
  }, []);

  if (!unlocked) return <ActivityIndicator />;
  return <View>{/* sensitive content */}</View>;
}

// Check what biometrics are available
const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
```

### Secure Token Storage + Biometrics Pattern
```tsx
import * as SecureStore from 'expo-secure-store';

// Save token after login
await SecureStore.setItemAsync('auth_token', token);

// Retrieve with biometric gate
async function getTokenSecurely() {
  const authenticated = await authenticateWithBiometrics();
  if (!authenticated) throw new Error('Authentication failed');
  return await SecureStore.getItemAsync('auth_token');
}
```
