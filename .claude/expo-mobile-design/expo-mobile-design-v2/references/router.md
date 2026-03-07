# Expo Router v3 Reference

## File-Based Routing

Every file in `app/` becomes a route. Folders create nested layouts.

```
app/
├── _layout.tsx          → Root layout (required)
├── index.tsx            → "/" (home)
├── about.tsx            → "/about"
├── (tabs)/
│   ├── _layout.tsx      → Tab layout
│   ├── index.tsx        → "/  " (first tab)
│   └── settings.tsx     → "/settings"
├── (auth)/
│   ├── login.tsx        → "/login"
│   └── register.tsx     → "/register"
├── blog/
│   ├── index.tsx        → "/blog"
│   └── [id].tsx         → "/blog/:id" (dynamic)
├── [...missing].tsx     → 404 catch-all
└── modal.tsx            → "/modal"
```

**Groups `(name)/`** — logical groups, don't affect URL path  
**`[param]`** — dynamic segment  
**`[...rest]`** — catch-all segments  
**`+not-found.tsx`** — 404 handler  

---

## Layouts

### Tab Layout
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarStyle: { backgroundColor: '#fff' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Stack Layout
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal', title: 'Details' }}
      />
      <Stack.Screen
        name="blog/[id]"
        options={{ title: 'Article' }}
      />
    </Stack>
  );
}
```

---

## Navigation

### useRouter
```tsx
import { useRouter } from 'expo-router';

function MyScreen() {
  const router = useRouter();

  return (
    <>
      <Button onPress={() => router.push('/settings')} title="Go to Settings" />
      <Button onPress={() => router.push('/blog/123')} title="Open Article" />
      <Button onPress={() => router.replace('/login')} title="Replace (no back)" />
      <Button onPress={() => router.back()} title="Go Back" />
    </>
  );
}
```

### Link Component
```tsx
import { Link } from 'expo-router';

// Basic
<Link href="/settings">Settings</Link>

// With params
<Link href={{ pathname: '/blog/[id]', params: { id: '123' } }}>
  Read Article
</Link>

// Modal
<Link href="/modal" asChild>
  <Pressable><Text>Open Modal</Text></Pressable>
</Link>
```

### Reading Route Params
```tsx
import { useLocalSearchParams } from 'expo-router';

// For /blog/[id].tsx
function BlogPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Post ID: {id}</Text>;
}

// Pass extra params (query string style):
router.push({ pathname: '/settings', params: { section: 'notifications' } });
// Access: const { section } = useLocalSearchParams();
```

---

## Auth Flow Pattern

```tsx
// app/_layout.tsx — Redirect based on auth state
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

---

## Header Customization

```tsx
// Static options in _layout.tsx:
<Stack.Screen
  name="profile"
  options={{
    title: 'My Profile',
    headerStyle: { backgroundColor: '#6366f1' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerRight: () => <Pressable onPress={handleEdit}><Text>Edit</Text></Pressable>,
    headerBackTitle: 'Back',
  }}
/>

// Dynamic options from inside the screen:
import { useNavigation } from 'expo-router';
function ProfileScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ title: user.name });
  }, [user.name]);
}
```

---

## Deep Linking & Universal Links

```js
// app.config.js
export default {
  expo: {
    scheme: 'myapp',           // myapp:// links
    intentFilters: [            // Android universal links
      {
        action: 'VIEW',
        data: [{ scheme: 'https', host: 'myapp.com' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
};
```

---

## Modal Patterns

```tsx
// Push a full-screen modal
router.push('/modal');

// Sheet-style (iOS)
<Stack.Screen name="modal" options={{ presentation: 'formSheet' }} />

// Dismiss programmatically inside modal
import { useRouter } from 'expo-router';
function Modal() {
  const router = useRouter();
  return <Button onPress={() => router.dismiss()} title="Close" />;
}
```

---

## Common Router Mistakes

| Mistake | Fix |
|---------|-----|
| Using `useNavigation` from RN directly | Use `useRouter` and `useNavigation` from `expo-router` |
| Hardcoded route strings with typos | Use typed routes: enable `typedRoutes` in app.config |
| Not handling back gesture on Android | Always have a way back or set `gestureEnabled: false` |
| Params lost after reload | Use persistent storage (SecureStore, AsyncStorage) for critical state |
| Tabs re-mounting on navigate | Use `initialRouteName` and keep screens in memory |

### Enable Typed Routes (Recommended)
```js
// app.config.js
plugins: [
  ['expo-router', { typedRoutes: true }]
]
```
Now `router.push('/typoed-route')` will give a TypeScript error.
