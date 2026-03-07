# Expo SDK Packages Reference

## Golden Rule
Always use `npx expo install <package>` for Expo SDK packages.
It auto-selects the correct version compatible with your Expo SDK.

```bash
# Good
npx expo install expo-camera expo-location

# Risky — may install incompatible version
npm install expo-camera
```

---

## Core SDK Packages

### Camera
```bash
npx expo install expo-camera
```
```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';

function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <View>
        <Text>Camera permission required</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <CameraView style={{ flex: 1 }} facing="back">
      {/* overlay UI */}
    </CameraView>
  );
}
```

### Location
```bash
npx expo install expo-location
```
```tsx
import * as Location from 'expo-location';

async function getLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  console.log(location.coords.latitude, location.coords.longitude);
}

// Watch position
const subscription = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.High, timeInterval: 5000 },
  (location) => console.log(location)
);
// Cleanup:
subscription.remove();
```

### Push Notifications
```bash
npx expo install expo-notifications
```
```tsx
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Required handler setup (in root _layout.tsx)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;  // Won't work on simulator

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-eas-project-id',
  });
  return token.data;
}
```

### Secure Storage
```bash
npx expo install expo-secure-store
```
```tsx
import * as SecureStore from 'expo-secure-store';

// Store
await SecureStore.setItemAsync('userToken', token);

// Retrieve
const token = await SecureStore.getItemAsync('userToken');

// Delete
await SecureStore.deleteItemAsync('userToken');
```
Use for: auth tokens, sensitive user data. Max ~2KB per value.

### AsyncStorage (Non-Sensitive Data)
```bash
npx expo install @react-native-async-storage/async-storage
```
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('settings', JSON.stringify(settings));
const raw = await AsyncStorage.getItem('settings');
const settings = raw ? JSON.parse(raw) : null;
await AsyncStorage.removeItem('settings');
```

### File System
```bash
npx expo install expo-file-system
```
```tsx
import * as FileSystem from 'expo-file-system';

// Download a file
const { uri } = await FileSystem.downloadAsync(
  'https://example.com/file.pdf',
  FileSystem.documentDirectory + 'file.pdf'
);

// Read file
const content = await FileSystem.readAsStringAsync(uri);

// Write file
await FileSystem.writeAsStringAsync(uri, content);

// File info
const info = await FileSystem.getInfoAsync(uri);
console.log(info.exists, info.size);
```

### Image Picker
```bash
npx expo install expo-image-picker
```
```tsx
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    // use uri
  }
}

async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return;

  const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  if (!result.canceled) console.log(result.assets[0].uri);
}
```

### Haptics
```bash
npx expo install expo-haptics
```
```tsx
import * as Haptics from 'expo-haptics';

// Light tap feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
// Medium
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// Success / Error / Warning
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### Sharing
```bash
npx expo install expo-sharing
```
```tsx
import * as Sharing from 'expo-sharing';

if (await Sharing.isAvailableAsync()) {
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share document',
  });
}
```

### Linking (URLs & Deep Links)
```bash
# Built-in, no install needed
import { Linking } from 'react-native';

// Open URL
await Linking.openURL('https://example.com');

// Open settings
await Linking.openSettings();

// Check if app can handle URL
const canOpen = await Linking.canOpenURL('tel:+1234567890');
```

### Constants & Device Info
```bash
npx expo install expo-constants expo-device
```
```tsx
import Constants from 'expo-constants';
import * as Device from 'expo-device';

Constants.expoConfig?.version        // App version
Constants.expoConfig?.extra?.apiUrl  // From app.config extra

Device.isDevice          // false on simulator
Device.deviceType        // Phone, Tablet, Desktop, TV
Device.osName            // "iOS", "Android"
Device.osVersion         // "17.0"
```

---

## State Management Recommendations

| Use Case | Package |
|----------|---------|
| Simple local state | `useState`, `useReducer` |
| Global client state | `zustand` |
| Server state / caching | `@tanstack/react-query` |
| Forms | `react-hook-form` |
| Auth tokens | `expo-secure-store` |
| User preferences | `@react-native-async-storage/async-storage` |

### Zustand Setup
```bash
npm install zustand
```
```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      setToken: (token) => set({ token, isAuthenticated: !!token }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## Config Plugins (for Native Permissions)

Config plugins modify native code during `expo prebuild` / EAS Build.
Always add them to `plugins` in app.config.js:

```js
plugins: [
  'expo-router',
  [
    'expo-camera',
    { cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.' }
  ],
  [
    'expo-location',
    { locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.' }
  ],
  [
    'expo-notifications',
    {
      icon: './assets/notification-icon.png',
      color: '#ffffff',
    }
  ],
]
```

---

## Packages to Avoid / Replace

| Avoid | Use Instead | Reason |
|-------|-------------|--------|
| `react-native`'s `Image` | `expo-image` | Better caching, blurhash, formats |
| `AsyncStorage` for secrets | `expo-secure-store` | Not encrypted |
| `react-navigation` alone | `expo-router` (wraps it) | Integrated with Expo |
| `react-native-maps` (bare) | `react-native-maps` via expo plugin | Needs config plugin |
| Inline `fetch` everywhere | `@tanstack/react-query` | Caching, loading states |
| `moment.js` | `date-fns` or `dayjs` | Smaller bundle size |
