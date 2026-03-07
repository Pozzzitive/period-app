# Expo Testing Reference

## Setup: Jest + React Native Testing Library

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npx expo install jest-expo
```

### package.json
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))"
    ]
  }
}
```

---

## Component Tests (React Native Testing Library)

```tsx
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Submit" onPress={() => {}} />);
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button label="Submit" onPress={onPress} />);
    fireEvent.press(screen.getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button label="Submit" onPress={() => {}} loading />);
    expect(screen.getByTestId('button')).toBeDisabled();
  });
});
```

### Querying Elements
```tsx
// By text (most readable)
screen.getByText('Submit')
screen.queryByText('Optional text')  // returns null if not found
screen.findByText('Async text')       // returns promise, waits

// By testID (for non-text elements)
screen.getByTestId('submit-button')

// By role (accessible)
screen.getByRole('button', { name: 'Submit' })
```

### Testing Async Behavior
```tsx
import { render, screen, waitFor } from '@testing-library/react-native';

it('shows posts after loading', async () => {
  render(<PostsList />);
  expect(screen.getByTestId('loading-indicator')).toBeTruthy();

  await waitFor(() => {
    expect(screen.getByText('My First Post')).toBeTruthy();
  });
});
```

---

## Mocking Native Modules

Many Expo packages need mocks. Create `__mocks__/` or add to jest setup:

```ts
// jest.setup.ts
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: ({ children }: any) => children,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);
```

### Mocking Supabase
```ts
// __mocks__/lib/supabase.ts
export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
};
```

---

## Hook Tests

```tsx
// hooks/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from '../useCounter';

it('increments count', () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0);

  act(() => { result.current.increment(); });
  expect(result.current.count).toBe(1);
});
```

---

## Integration Tests with MSW (Mock Service Worker)

Mock API calls without changing your actual fetch/axios code:

```bash
npm install --save-dev msw@latest
```

```ts
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/posts', () =>
    HttpResponse.json([{ id: '1', title: 'Test Post' }])
  ),
  http.post('https://api.example.com/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '2', ...body }, { status: 201 });
  }),
];

// jest.setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Detox: E2E Testing

Best for full user flow testing on a real simulator/emulator.

```bash
npm install --save-dev detox @config-plugins/detox
npx detox init
```

### .detoxrc.js
```js
module.exports = {
  apps: {
    'ios.debug': { type: 'ios.app', binaryPath: 'ios/build/YourApp.app', build: 'xcodebuild...' },
    'android.debug': { type: 'android.apk', binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk' },
  },
  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 15' } },
    emulator: { type: 'android.emulator', device: { avdName: 'Pixel_6_API_33' } },
  },
  configurations: {
    'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
    'android.emu.debug': { device: 'emulator', app: 'android.debug' },
  },
};
```

### Writing Detox Tests
```ts
// e2e/login.test.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should log in successfully', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error on wrong password', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

```bash
# Run E2E tests
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
```

---

## Running Tests

```bash
# Unit + integration
npm test
npm test -- --watch                    # watch mode
npm test -- --coverage                 # coverage report
npm test -- --testPathPattern=Button   # specific file

# E2E (Detox)
detox test --configuration ios.sim.debug
detox test --configuration android.emu.debug
```
