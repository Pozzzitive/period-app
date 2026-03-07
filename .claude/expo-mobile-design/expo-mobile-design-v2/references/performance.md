# Expo Performance Optimization Reference

## The Golden Rules

1. **Avoid re-renders** — most perf issues are unnecessary re-renders
2. **Keep JS thread free** — run animations on the UI thread via Reanimated
3. **Virtualize lists** — never use `ScrollView` for long lists
4. **Memoize sparingly** — only when you can measure the benefit

---

## Preventing Re-renders

### memo, useCallback, useMemo
```tsx
import { memo, useCallback, useMemo } from 'react';

// memo: skip re-render if props haven't changed
const ListItem = memo(({ item, onPress }: Props) => (
  <Pressable onPress={() => onPress(item.id)}>
    <Text>{item.title}</Text>
  </Pressable>
));

// useCallback: stable function reference for memo'd children
function Parent() {
  const [items, setItems] = useState([...]);

  const handlePress = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []); // no deps = stable forever

  return items.map(item => <ListItem key={item.id} item={item} onPress={handlePress} />);
}

// useMemo: expensive computation
const filteredItems = useMemo(
  () => items.filter(i => i.category === activeCategory),
  [items, activeCategory]
);
```

### Avoiding inline objects/functions in JSX
```tsx
// ❌ New object on every render → child always re-renders
<MyComponent style={{ flex: 1 }} onPress={() => doSomething()} />

// ✅ Stable references
const containerStyle = { flex: 1 };  // or StyleSheet.create
const handlePress = useCallback(() => doSomething(), []);
<MyComponent style={containerStyle} onPress={handlePress} />
```

---

## FlatList Performance

```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}

  // Core perf props:
  removeClippedSubviews={true}    // unmount off-screen items (Android)
  maxToRenderPerBatch={10}        // items rendered per batch
  updateCellsBatchingPeriod={50}  // ms between batches
  windowSize={10}                 // render window (5 = 5 screens above + below)
  initialNumToRender={10}         // items on first render

  // Avoid layout recalculations:
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// renderItem must be memoized!
const renderItem = useCallback(({ item }: { item: Item }) => (
  <ListItem item={item} />
), []);
```

### FlashList (Drop-in FlatList Replacement — Much Faster)
```bash
npx expo install @shopify/flash-list
```
```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ListItem item={item} />}
  estimatedItemSize={80}  // required — average item height in px
  keyExtractor={(item) => item.id}
/>
```
FlashList is 5–10× faster than FlatList for large lists — prefer it.

---

## Animation Performance

### Always Run Animations on UI Thread
```tsx
// ✅ Reanimated — runs on UI thread, never drops frames
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// ❌ setState for position — runs on JS thread, janky
const [x, setX] = useState(0);
// Avoid animating via state
```

### Use `useAnimatedStyle` Not Inline Style for Animated Values
```tsx
// ❌ — won't animate smoothly
<Animated.View style={{ transform: [{ translateX: someSharedValue }] }} />

// ✅
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: someSharedValue.value }]
}));
<Animated.View style={style} />
```

---

## Image Performance

```tsx
import { Image } from 'expo-image';

// expo-image handles: caching, progressive loading, blurhash placeholders
<Image
  source={{ uri: imageUrl }}
  placeholder={{ blurhash }}
  contentFit="cover"
  cachePolicy="memory-disk"   // aggressive caching
  recyclingKey={item.id}       // reuse component in lists
  style={{ width: 200, height: 200 }}
/>
```

For large lists with images: use `recyclingKey` equal to the item's unique ID so expo-image can recycle the image view.

---

## Bundle Size

### Analyze your bundle
```bash
npx expo export --platform ios --source-maps
npx react-native-bundle-visualizer  # visual treemap
```

### Replace heavy packages
| Heavy Package | Lighter Alternative |
|--------------|---------------------|
| `moment.js` (67KB) | `date-fns` (tree-shaken) or `dayjs` (2KB) |
| `lodash` (full) | `lodash-es` + tree shaking, or native JS |
| `react-native-svg` icons | `@expo/vector-icons` (already in Expo) |
| Full `firebase` web SDK | `@react-native-firebase` (native, faster) |

### Lazy load heavy screens
```tsx
import { lazy, Suspense } from 'react';
const HeavyChart = lazy(() => import('@/components/HeavyChart'));

<Suspense fallback={<ActivityIndicator />}>
  <HeavyChart />
</Suspense>
```

---

## JavaScript Thread

### Avoid Blocking the JS Thread
```tsx
// ❌ Blocks JS thread, UI freezes
const result = heavyComputation(largeData);

// ✅ Option 1: requestAnimationFrame for batching
requestAnimationFrame(() => {
  setResult(heavyComputation(data));
});

// ✅ Option 2: InteractionManager (waits for animations to complete)
import { InteractionManager } from 'react-native';
InteractionManager.runAfterInteractions(() => {
  setResult(heavyComputation(data));
});

// ✅ Option 3: expo-task-manager for background work
```

### Hermes Engine
Hermes is enabled by default in Expo SDK 48+. It significantly improves startup time and memory usage. Don't disable it.

---

## React Query for Server State

Avoids redundant fetches, manages cache, handles loading/error states:

```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function PostsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => supabase.from('posts').select('*').then(r => r.data),
    staleTime: 5 * 60 * 1000,  // 5 min cache
  });

  if (isLoading) return <ActivityIndicator />;
  return <FlashList data={data} renderItem={...} estimatedItemSize={80} />;
}

// Optimistic mutation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newPost) => supabase.from('posts').insert(newPost),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
});
```

---

## Startup Performance

```tsx
// 1. Hold splash screen until critical resources load
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

// Load fonts + auth check in parallel
const [fontsLoaded] = useFonts({ ... });
const [sessionChecked, setSessionChecked] = useState(false);

useEffect(() => {
  checkAuthSession().then(() => setSessionChecked(true));
}, []);

useEffect(() => {
  if (fontsLoaded && sessionChecked) SplashScreen.hideAsync();
}, [fontsLoaded, sessionChecked]);

// 2. Don't import heavy libs at module level if not needed on startup
// 3. Use expo-constants to skip heavy setup in dev
```
