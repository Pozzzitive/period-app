---
name: expo-mobile-design
description: "Use this skill for ANY task involving Expo, React Native, or cross-platform mobile app development. Triggers on building screens or components, navigation/routing, NativeWind/Tailwind styling, animations, SDK integrations, EAS builds, app.config.js, platform-specific code, debugging mobile issues, performance optimization, or testing. Use proactively for 'mobile app', 'React Native', 'Expo', 'iOS/Android', Supabase, Firebase, Stripe, OAuth, biometrics, or any .tsx file with mobile imports. This skill prevents common mistakes and provides production-ready patterns."
---

# Expo Cross-Platform Mobile Design Skill (v2)

You are an expert Expo/React Native engineer. **NativeWind (Tailwind) is the default styling approach.** Always consult reference files before writing non-trivial code.

## Reference Files

| File | When to read |
|------|-------------|
| `references/architecture.md` | Project structure, Expo workflow, EAS, app.config.js, new architecture |
| `references/ui-patterns.md` | NativeWind styling, layout, SafeAreaView, keyboard, lists, images |
| `references/animations.md` | Reanimated, pill/segment menus, drawers, calendars, transitions, gestures |
| `references/router.md` | Expo Router v3, navigation, layouts, auth flows, deep linking |
| `references/integrations.md` | Supabase, Firebase, Stripe, OAuth, biometrics |
| `references/sdk.md` | Expo SDK packages, permissions, config plugins |
| `references/debugging.md` | Error lookup, Flipper, common crashes, dev tools |
| `references/performance.md` | FlatList tuning, memoization, bundle size, profiling |
| `references/testing.md` | Jest, React Native Testing Library, Detox E2E |

Always read at least one reference file before writing non-trivial code. Read multiple for cross-concern tasks.

---

## Core Principles (Always Apply)

### 1. React Native ≠ React Web
- No `div`, `span`, `p`, `h1`–`h6` — use `View`, `Text`, `ScrollView`
- No CSS files or class names — use NativeWind `className` props
- No `window`, `document`, `localStorage` — use Expo equivalents
- Flexbox default: `flexDirection: 'column'`, `flexShrink: 0`

### 2. NativeWind First
```tsx
// Always prefer className over StyleSheet for new code
<View className="flex-1 bg-white px-4 pt-safe">
  <Text className="text-xl font-bold text-gray-900">Hello</Text>
</View>
```
Use `StyleSheet.create` only for: dynamic values, complex shadows, or performance-critical lists.

### 3. Safety Wrappers — Always Include
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';

<SafeAreaView className="flex-1">
  <KeyboardAvoidingView
    className="flex-1"
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    {/* screen content */}
  </KeyboardAvoidingView>
</SafeAreaView>
```

### 4. Package Installation
```bash
npx expo install expo-camera        # SDK packages — always expo install
npm install zustand date-fns        # Pure JS packages — npm ok
```

### 5. Platform Conditionals
```tsx
import { Platform } from 'react-native';
const isIOS = Platform.OS === 'ios';
// File splits: Button.ios.tsx / Button.android.tsx / Button.tsx
```

---

## Quick Decision Tree

| User asks about… | Read |
|-----------------|------|
| Navigation, routing, tabs, modals | `router.md` |
| Styling, layout, components | `ui-patterns.md` |
| Animations, sliding UI, gestures | `animations.md` |
| Supabase, Firebase, Stripe, Auth, Biometrics | `integrations.md` |
| Camera, location, notifications, file system | `sdk.md` |
| Build, deploy, EAS, app.config | `architecture.md` |
| Something crashing or broken | `debugging.md` |
| Slow, janky, large bundle | `performance.md` |
| Writing tests | `testing.md` |
