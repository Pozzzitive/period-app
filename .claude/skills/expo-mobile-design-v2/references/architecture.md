# Expo Architecture Reference

## Project Structure (Expo Router v3)

```
my-app/
├── app/                        # All routes live here
│   ├── _layout.tsx             # Root layout (providers, fonts, splash)
│   ├── index.tsx               # "/" route
│   ├── (tabs)/                 # Tab group
│   │   ├── _layout.tsx         # Tab bar config
│   │   ├── index.tsx           # First tab
│   │   └── explore.tsx         # Second tab
│   ├── (auth)/                 # Auth group (no tab bar)
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── modal.tsx               # Modal screen
├── components/                 # Shared UI components
├── hooks/                      # Custom hooks
├── constants/                  # Colors, sizes, config
├── assets/                     # Images, fonts
├── app.json / app.config.js    # Expo config
└── babel.config.js
```

## Managed vs Bare Workflow

| Feature | Managed | Bare |
|---------|---------|------|
| Native code | Hidden | Exposed (ios/ & android/) |
| Config plugins | Yes | Manual linking |
| EAS Build | Yes | Yes |
| Custom native modules | Via plugins | Direct |
| Recommended for | Most apps | Custom native needs |

**Default to Managed unless** the user explicitly needs custom native code.

## app.config.js (Preferred Over app.json)

```js
// app.config.js — supports dynamic values, env vars
export default ({ config }) => ({
  ...config,
  name: "MyApp",
  slug: "my-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.company.myapp",
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera.",
    },
  },
  android: {
    adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png" },
    package: "com.company.myapp",
    permissions: ["CAMERA", "ACCESS_FINE_LOCATION"],
  },
  plugins: [
    "expo-router",
    ["expo-camera", { cameraPermission: "Allow $(PRODUCT_NAME) to access camera." }],
  ],
  extra: {
    apiUrl: process.env.API_URL,
    eas: { projectId: "your-project-id" },
  },
});
```

## Root Layout (_layout.tsx)

```tsx
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## EAS (Expo Application Services)

### eas.json
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Common EAS Commands
```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build
eas build --platform ios --profile development
eas build --platform android --profile preview
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA Updates
eas update --branch production --message "Fix login bug"
```

## New Architecture (React Native 0.74+)

Expo SDK 51+ enables New Architecture by default on new projects.

```json
// app.json
{
  "expo": {
    "newArchEnabled": true
  }
}
```

**Compatibility check before adding a package:**
- Check the package's README for "New Architecture" or "Fabric" support
- Use https://reactnative.directory to filter by new arch support
- Known-good: all official Expo SDK packages, react-native-reanimated 3+, react-native-gesture-handler 2+

## Environment Variables

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.example.com  # Exposed to client
SECRET_KEY=abc123                             # Build-time only (not in app bundle)
```

```ts
// Access in app
const apiUrl = process.env.EXPO_PUBLIC_API_URL;  // OK — public
// Never access non-EXPO_PUBLIC_ vars in app code
```

## Common Setup Mistakes to Avoid

1. **Missing `GestureHandlerRootView`** — required at the root for gesture-handler to work
2. **Missing `SafeAreaProvider`** — required for `useSafeAreaInsets()` and `SafeAreaView`
3. **`expo install` vs `npm install`** — always use `expo install` for SDK packages
4. **Forgetting `"expo-router"` in plugins** — required for file-based routing
5. **`scheme` missing in app.config** — required for deep links and OAuth redirects
   ```js
   scheme: "myapp",  // enables myapp:// deep links
   ```
