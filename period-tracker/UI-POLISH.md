# UI Polish Checklist

## High Impact

- [ ] **Bottom sheets with spring physics** — Replace all `<Modal animationType="slide">` with `@gorhom/bottom-sheet` for spring animations, swipe-to-dismiss, and backdrop gestures. Affects: History sheet, Log period sheet, Day summary sheet, Intercourse sheets.

- [ ] **Declutter home screen between ring and calendar** — Move prediction count (+/- stepper) and "Show predicted phases" toggle into a collapsible section or behind a gear icon on the month nav row. Legend sits flush with calendar.

- [ ] **Consistent month navigation arrows** — Home uses rounded pill buttons, Calendar/Insights/Log use bare Unicode text. Unify to pill buttons everywhere.

- [ ] **Larger legend dots** — Bump from `w-2.5 h-2.5` (10px) to `w-3 h-3` (12px) for better color recognition.

## Medium Impact

- [ ] **Swipe-to-navigate on Calendar tab** — Add horizontal FlatList pager (like Home tab) so users can swipe between months instead of only tapping arrows.

- [ ] **CycleRing inactive segment visibility** — Change tint from `color + '55'` to `color + '88'` so non-current phase arcs are more visible.

- [ ] **Day detail phase context** — Add a colored chip at the top of `/day/[date]` showing which phase that day falls in (e.g. "Follicular — Day 9").

- [ ] **Insights stat cards** — Wrap each StatItem in a small rounded card with a subtle tinted background instead of flat text.

## Low Impact

- [ ] **Spring animations** — Switch `FadeInDown.duration(400)` to `FadeInDown.springify().damping(15)` for more organic motion.

- [ ] **Haptic consistency** — Add `Haptics.selectionAsync()` to month navigation arrows and other interactive elements that currently lack feedback.

- [ ] **Swipe-to-delete in history** — Replace the plain "Delete" text button in period history with swipe-to-delete gesture.

- [ ] **Empty state illustrations** — Upgrade "No period history yet" and "Complete one cycle" empty states with larger icon compositions or simple illustrations.
