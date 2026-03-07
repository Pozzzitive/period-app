# Expo Debugging Reference

## Dev Tools Setup

### Expo Dev Menu
Shake device or press `m` in terminal to open. Useful options:
- **Open JS Debugger** — Chrome DevTools for JS
- **Toggle Performance Monitor** — FPS, RAM, JS thread
- **Enable/Disable Fast Refresh**

### Flipper (Advanced)
```bash
# Install Flipper desktop app: https://fbflipper.com
# Then install in app:
npx expo install react-native-flipper
```
Gives you: Network inspector, Layout inspector, Crash reporter, Redux DevTools.

### Reactotron (Lightweight Alternative)
```bash
npm install --save-dev reactotron-react-native reactotron-redux
```
Good for: logging, network, Redux/Zustand state inspection.

---

## Common Error Lookup

### "Invariant Violation: Text strings must be rendered within a <Text> component"
```tsx
// ❌ Wrong — conditional renders a string
{someBoolean && 'Some text'}

// ✅ Fix
{someBoolean && <Text>Some text</Text>}
// OR
{someBoolean ? <Text>Some text</Text> : null}
```

### "Unable to resolve module X"
1. Run `npx expo install <package>` again
2. Delete `node_modules`, run `npm install`
3. Clear Metro cache: `npx expo start --clear`
4. If a monorepo, check `watchFolders` in metro.config.js

### "RCTBridge required dispatch_sync" (iOS crash)
This is a threading issue. Wrap the offending code:
```tsx
import { InteractionManager } from 'react-native';
InteractionManager.runAfterInteractions(() => {
  // heavy work here
});
```

### "Attempted to assign to readonly property" (Reanimated)
You're mutating a shared value directly:
```tsx
// ❌
sharedValue.value.someProperty = 'new';

// ✅
sharedValue.value = { ...sharedValue.value, someProperty: 'new' };
```

### "Cannot read property of undefined" in navigation
Likely accessing route params before they exist:
```tsx
const { id } = useLocalSearchParams<{ id?: string }>();
if (!id) return null;  // guard
```

### Metro Bundler Stuck / Slow
```bash
# Kill Metro, clear cache:
npx expo start --clear

# If still broken, nuclear option:
watchman watch-del-all
rm -rf node_modules
npm install
npx expo start --clear
```

### "Require cycle" warning
Extract the shared dep to a third file:
```
A imports B, B imports A → extract shared code to C
```

### Network request failed (on device, not simulator)
- Simulator uses your Mac's network, device uses its own
- Ensure your API server is accessible on the local network
- Expo Go: Use your local IP (not localhost): `http://192.168.x.x:3000`
- Check for SSL cert issues on physical device

### "Shadow not showing on Android"
```tsx
// iOS: use shadow* props
// Android: use elevation — the two systems are separate
<View style={{
  elevation: 6,               // Android
  shadowColor: '#000',        // iOS
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
}} />
```

### Keyboard covers inputs on Android
```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  // Android often needs 'height' but try 'position' too
>
```
If `KeyboardAvoidingView` still fails on Android, try `react-native-keyboard-controller`:
```bash
npx expo install react-native-keyboard-controller
```

### Images not showing
1. Check URI is valid (log it)
2. Check network permissions in app.config
3. For local images, ensure path is correct relative to the component file
4. Use `expo-image` instead of RN's `Image` for better caching

### App crashes on launch (no error shown)
```bash
# Check native logs:
# iOS:
npx react-native log-ios
# Android:
npx react-native log-android
# Or in Xcode / Android Studio logcat
```

---

## Debugging Animations

```tsx
// Log shared values (run on JS thread):
import { runOnJS } from 'react-native-reanimated';

const pan = Gesture.Pan().onUpdate((e) => {
  translateX.value = e.translationX;
  runOnJS(console.log)(e.translationX);  // ✅ logs from worklet
});

// Visualize layout in NativeWind/StyleSheet:
// Add a temporary border to see bounds
<View className="border border-red-500">...</View>
```

---

## Performance Profiling

```tsx
// Enable JS performance marks:
import { Performance } from 'react-native';
performance.mark('render-start');
// ... render ...
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
```

Use the **Hermes Profiler** in React DevTools for flame graphs:
1. Open React DevTools (`npx react-devtools`)
2. Go to Profiler tab → Record → interact → Stop
3. Identify long renders and unnecessary re-renders

---

## EAS Build Errors

### "Missing required field" in eas.json
Validate with: `eas build:configure`

### iOS build fails with signing error
```bash
eas credentials  # manage certs interactively
```

### Android build fails with "SDK not found"
Set in eas.json:
```json
"build": {
  "production": {
    "android": { "buildType": "apk" },
    "env": { "ANDROID_SDK_ROOT": "/path/to/sdk" }
  }
}
```

### OTA update not applying
- Check `channel` in eas.json matches what `eas update` targets
- Updates apply on second launch after download
- Force immediate: use `expo-updates` API:
```tsx
import * as Updates from 'expo-updates';
const update = await Updates.checkForUpdateAsync();
if (update.isAvailable) {
  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();  // applies immediately
}
```
