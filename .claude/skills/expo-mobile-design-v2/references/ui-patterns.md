# Expo UI Patterns Reference (NativeWind / Tailwind)

NativeWind is the default. Use `className` everywhere. Only use `StyleSheet.create` for: dynamic computed values, complex multi-property shadows, or proven perf bottlenecks in large lists.

## NativeWind Setup

```bash
npx expo install nativewind tailwindcss
npx tailwindcss init
```

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {} },
};
```

```js
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

```tsx
// app/_layout.tsx — import global CSS
import '../global.css';
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Safe Area Classes
NativeWind includes `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `px-safe`, `py-safe`:
```tsx
<View className="flex-1 pt-safe bg-white">
```

---

## Layout Fundamentals

```tsx
// Full screen
<View className="flex-1 bg-white" />

// Centered
<View className="flex-1 justify-center items-center" />

// Row
<View className="flex-row items-center gap-3" />

// Card
<View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100" />

// Absolute fill
<View className="absolute inset-0" />

// Safe padding screen
<View className="flex-1 px-4 pt-safe pb-safe bg-gray-50" />
```

---

## Dark Mode

```tsx
// tailwind.config.js
module.exports = { darkMode: 'class', ... };

// Component — cn() utility helps compose classes
import { useColorScheme } from 'nativewind';

function ThemedCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4">
      <Text className="text-gray-900 dark:text-white">{children}</Text>
    </View>
  );
}
```

---

## Typography

```tsx
// Headings
<Text className="text-3xl font-bold text-gray-900">Heading 1</Text>
<Text className="text-2xl font-bold text-gray-900">Heading 2</Text>
<Text className="text-xl font-semibold text-gray-800">Heading 3</Text>

// Body
<Text className="text-base text-gray-700 leading-6">Body text</Text>
<Text className="text-sm text-gray-500">Caption / secondary</Text>

// Links
<Text className="text-base text-indigo-500 font-medium">Link</Text>
```

---

## Buttons

```tsx
// Primary
<Pressable
  onPress={onPress}
  className="bg-indigo-500 active:bg-indigo-600 rounded-xl px-6 py-3.5 items-center"
>
  <Text className="text-white font-semibold text-base">Continue</Text>
</Pressable>

// Secondary / outline
<Pressable className="border border-gray-300 active:bg-gray-50 rounded-xl px-6 py-3.5 items-center">
  <Text className="text-gray-800 font-semibold text-base">Cancel</Text>
</Pressable>

// Destructive
<Pressable className="bg-red-500 active:bg-red-600 rounded-xl px-6 py-3.5 items-center">
  <Text className="text-white font-semibold text-base">Delete</Text>
</Pressable>

// Icon button
<Pressable className="w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200 items-center justify-center">
  <Ionicons name="arrow-back" size={20} color="#111" />
</Pressable>

// Disabled state
<Pressable disabled={loading} className="bg-indigo-500 disabled:opacity-50 rounded-xl px-6 py-3.5">
  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Submit</Text>}
</Pressable>
```

---

## Text Inputs

```tsx
import { TextInput, View, Text } from 'react-native';

function FormField({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        className={`bg-white border rounded-xl px-4 py-3 text-base text-gray-900
          ${error ? 'border-red-400' : 'border-gray-200'}`}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </View>
  );
}

// Usage:
<FormField
  label="Email"
  placeholder="you@example.com"
  keyboardType="email-address"
  autoCapitalize="none"
  error={errors.email}
/>
```

---

## Cards & Lists

```tsx
// Basic card
function PostCard({ post }: { post: Post }) {
  return (
    <Pressable className="bg-white rounded-2xl overflow-hidden shadow-sm active:opacity-80">
      <Image source={{ uri: post.image }} className="w-full h-48" contentFit="cover" />
      <View className="p-4 gap-2">
        <Text className="text-xs font-medium text-indigo-500 uppercase tracking-wide">
          {post.category}
        </Text>
        <Text className="text-lg font-bold text-gray-900" numberOfLines={2}>
          {post.title}
        </Text>
        <Text className="text-sm text-gray-500" numberOfLines={2}>
          {post.excerpt}
        </Text>
        <View className="flex-row items-center gap-2 pt-1">
          <Image source={{ uri: post.author.avatar }} className="w-6 h-6 rounded-full" />
          <Text className="text-xs text-gray-400">{post.author.name} · {post.readTime} min</Text>
        </View>
      </View>
    </Pressable>
  );
}
```

---

## Safe Areas

```tsx
// Always use from react-native-safe-area-context, not react-native
import { SafeAreaView } from 'react-native-safe-area-context';

// NativeWind shorthand (preferred):
<View className="flex-1 pt-safe px-4">

// Component (when you need full control):
<SafeAreaView className="flex-1" edges={['top', 'bottom']}>

// Hook (most flexible):
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { top, bottom } = useSafeAreaInsets();
<View style={{ paddingTop: top, paddingBottom: bottom + tabBarHeight }} />
```

---

## Keyboard Handling

```tsx
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

function FormScreen() {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 pt-safe pb-8 gap-4">
          {/* form fields */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

---

## Lists

Use **FlashList** for perf (see performance.md). Fall back to FlatList if needed.

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <PostCard post={item} />}
  estimatedItemSize={240}
  contentContainerStyle={{ padding: 16 }}
  ItemSeparatorComponent={() => <View className="h-3" />}
  ListEmptyComponent={() => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-gray-400">No items yet</Text>
    </View>
  )}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
/>
```

---

## Images

```bash
npx expo install expo-image
```

```tsx
import { Image } from 'expo-image';

// Standard
<Image source={{ uri }} className="w-full h-48 rounded-2xl" contentFit="cover" />

// With blurhash placeholder
<Image
  source={{ uri }}
  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
  contentFit="cover"
  transition={200}
  className="w-full h-48"
/>

// Avatar
<Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full" contentFit="cover" />
```

---

## Common UI Mistakes

| Mistake | Fix |
|---------|-----|
| `SafeAreaView` from `react-native` | Use from `react-native-safe-area-context` |
| Strings outside `<Text>` | Wrap all strings in `<Text>` |
| `overflow: hidden` not clipping on Android | Add `borderRadius` + `overflow-hidden` together |
| Touch target too small | Add `hitSlop` or min `w-11 h-11` (44pt) |
| List items cut off at bottom | `contentContainerStyle={{ paddingBottom: bottomTabHeight }}` |
| Shadow not showing on Android | Use `elevation-N` class or `elevation` style prop |
