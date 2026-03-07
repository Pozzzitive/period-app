# Period Tracker — Codebase Issues

## Critical

- [ ] **#1 Premium themes selectable without purchase** — `ThemePicker.tsx:22-26` — `handleSelect` applies any theme, lock icon is cosmetic only *(SKIPPED — still testing)*

## High

- [x] **#2 IntercourseDetailSheet saves notes on every keystroke** — used local state + save on blur instead of MMKV write per character
- [x] **#3 YearInPixels `getColorForDate` stale closure in useMemo** — moved function inside useMemo, added early exit for irrelevant cycles, fixed `todayStr` dep
- [x] **#4 Notification scheduling triggers OS permission prompt unexpectedly** — changed to `getPermissionsAsync()` check-only, no prompt
- [x] **#5 LockScreen attempt counter resets on re-mount** — persisted `failedAttempts`/`lockedUntil` in auth store, added escalating lockout (30s/60s/5min)
- [x] **#6 Period overlap check ignores ongoing periods** — ongoing period `end` now uses `addDays(start, typicalPeriodLength - 1)`

## Medium

- [x] **#7 Dead `|| true` condition in IntercourseDetailSheet** — removed dead conditional, photos section always renders
- [x] **#8 `storePin` overwrites salt without verifying old PIN** — added `oldPin` param, verifies existing PIN before overwrite
- [x] **#9 `deleteAllData` resets subscription state** — removed `subscriptionStore.clearAll()`, IAP state preserved
- [x] **#10 PMS and Period Reminder notifications fire on same day** — PMS moved to -6 days, period reminder stays at -5
- [x] **#11 GDPR: `dataCategories.intercourse` consent not enforced** — `TeenagerGate` now also checks `dataCategories.intercourse`
- [x] **#12 Ad Banner always uses test ad IDs** — added `getAdUnitId()` with `__DEV__` check and platform-specific production IDs
- [x] **#13 `today` stale after midnight** — CalendarGrid re-renders via focusKey; YearInPixels fixed via `todayStr` in deps
- [x] **#14 YearInPixels useMemo missing `today` in deps** — fixed via `todayStr` string comparison in useMemo deps
- [x] **#15 `exportAsJSON` writes to Documents (iCloud-backed)** — changed to `Paths.cache`
- [x] **#16 IntercourseCalendarGrid no MIN_CYCLE_LENGTH filter** — added `if (len < MIN_CYCLE_LENGTH) continue`
- [x] **#17 Settings migration missing `dailyLogReminderTime`** — added migration for `dailyLogReminderTime` and `contraceptionReminderTime`

## Low

- [x] **#18 `generateId` theoretical collision risk** — replaced with `Crypto.randomUUID()` from expo-crypto
- [x] **#19 Charts double layout render** — extracted shared `handleLayout` callback, removed duplicate `onLayout`
- [x] **#20 Unused `expo-haptics` import** — removed
- [x] **#21 "Overdue by X days" wording can cause anxiety** — softened: "X days past expected date" (<=14d) or "Expected date has passed" (>14d)
- [x] **#22 CollapsibleSection stays expanded when disabled** — added useEffect to auto-collapse when `enabled` changes to false
- [x] **#23 SymptomRankingCard 0% bar width** — filters zero-count symptoms before rendering
- [x] **#24 Phase color opacity via hex concatenation** — added clarifying comment, confirmed all theme colors are 7-char hex
- [x] **#25 `usePillSwipe` can intercept horizontal scroll** — increased threshold (dx > dy*2, dx > 30px)
- [x] **#26 PredictionCard "Overdue" risks inferring pregnancy** — merged with #21, uses neutral language
- [x] **#27 Pattern analyzer boundary edge cases** — added MIN_CYCLE_LENGTH filter to `completedCycles`

---

## Re-scan #2 — New Issues Found

### Medium

- [x] **#28 analytics-engine uses population stddev (n) instead of sample stddev (n-1)** — changed to `/ (cycleLengths.length - 1)` with guard for length < 2
- [x] **#29 analytics-engine missing MIN_CYCLE_LENGTH filter** — added `&& c.cycleLength >= MIN_CYCLE_LENGTH` to completedCycles filter
- [x] **#30 `handleConfirmPeriod` missing `typicalPeriodLength` in useCallback deps** — added to dependency array
- [x] **#31 `storePin` allows overwrite without oldPin when PIN exists** — guard now rejects if `oldPin` not provided when existing PIN in Keychain
- [x] **#32 `handleEndPeriod` no validation that today >= startDate** — added early return guard

### Low

- [x] **#33 Unused `_periods` parameter in `computeAnalytics`** — removed parameter, updated all call sites and tests
- [x] **#34 `deleteAllData` skips local backup file** — now calls `deleteLocalBackup()` from crypto/pipeline
- [x] **#35 privacy.tsx `Section` children typed as `string` not `ReactNode`** — changed to `React.ReactNode`
- [x] **#36 No `minimumDate` on onboarding date picker** — replaced with `InlineDatePicker` with 90-day min, also fixes Android system dialog
- [x] **#37 Missing `Stack.Screen` for `settings/age` route** — added with title and headerBackTitle
- [x] **#38 Period history ScrollView no height constraint** — added `flexShrink: 1` style
- [x] **#39 `custom-symptoms.tsx` missing KeyboardAvoidingView** — wrapped with KAV for iOS padding behavior
- [x] **#40 Health-conditions "Skip" doesn't clear selected conditions** — now clears all toggled conditions before navigating

### Remaining (not fixed — cosmetic / low impact)

- [ ] **Duplicate LegendItem components** in index.tsx and calendar.tsx — extract to shared component
- [ ] **Legend uses `.color` vs `.lightColor`** inconsistently between screens
- [ ] **No "Change PIN" flow** in app-lock settings — user must disable/re-enable
- [ ] **Paywall "Save 27%" hardcoded** — should calculate from actual prices
- [ ] **`defaultProfile.createdAt` evaluated at module load** — cosmetic, overridden by persistence
- [ ] **Insights `cycles` selector** creates new reference on every recalculation — consider `useShallow`
