# Part 1: App Workflow & Features

## Overview

A privacy-first menstrual cycle tracking app built as a **one-time purchase** with an optional premium subscription. The app is designed to work **entirely offline and on-device** — no account, no server, no internet connection required for core functionality.

### Implementation Priority

> **Local-first.** Every feature described in this document is built to run entirely on the user's device using local storage. There is no dependency on Firebase, cloud services, or user authentication for any core functionality. Account creation, login, and cloud backup are the **final integration step** — covered separately in [Part 3: Data Management & Firebase](./03-data-management.md). Build the complete app experience first, then layer cloud sync on top.

---

## Design Principles

1. **Local-first by default** — all data lives on-device. Cloud backup is opt-in, never automatic. The user controls when (and if) their data leaves their phone.
2. **Account-free usage** — the app works fully without creating any account. A Firebase account is only required when the user opts into cloud backup. This positions the app competitively against alternatives that force account creation from day one.
3. **Privacy as the product** — the app never collects, shares, or analyzes user health data externally. This is the #1 marketing differentiator.
4. **Minimal cost** — features are computed on-device wherever possible, keeping server costs near zero.

---

## Cycle Tracking & Predictions

### Cycle Phases & Descriptions

The app educates the user about each phase of their cycle with clear, medically accurate descriptions. These are shown contextually — when the user is in that phase, the app surfaces the relevant info.

| Phase | Typical Days | Description |
|-------|-------------|-------------|
| **Menstruation** | Days 1–5 | Active bleeding. The uterine lining sheds. Common symptoms include cramps, fatigue, bloating, and mood changes. Energy levels tend to be lower. |
| **Follicular Phase** | Days 1–13 | Overlaps with menstruation. Estrogen rises as the body prepares an egg for release. Energy and mood typically improve throughout this phase. Skin may clear up. |
| **Ovulation** | Days 13–15 | An egg is released from the ovary. **This is the most fertile window** (including 2–3 days before and 1 day after). Cervical mucus becomes clear and stretchy. Libido may increase. Some users feel a mild pain on one side (mittelschmerz). |
| **Luteal Phase** | Days 15–28 | Progesterone rises to prepare the uterus for potential implantation. If no pregnancy occurs, hormone levels drop toward the end, triggering the next period. |
| **Premenstrual (PMS)** | Days 23–28 | The tail end of the luteal phase. Common symptoms: mood swings, breast tenderness, bloating, food cravings, irritability, headaches, and fatigue. This is the **least fertile** window. |

> **Note:** Day counts are based on an average 28-day cycle. The app adapts these ranges to the user's actual tracked cycle length over time.

### Irregular Cycle Support

Many users have cycles that range from 21 to 45+ days (especially those with PCOS, stress, or hormonal changes). The app must not assume a 28-day model.

**Adaptive prediction approach:**

- Use a **rolling average of the last 3–6 logged cycles** for predictions, not a fixed formula.
- Weight more recent cycles higher (e.g., last cycle = 40% weight, previous = 30%, etc.).
- If fewer than 3 cycles are logged, use the user's self-reported "typical cycle length" from onboarding as a baseline.
- Display a **confidence indicator** on predictions (e.g., "high confidence" after 6+ consistent cycles, "learning your pattern" for new users or irregular cycles).
- For highly irregular cycles (standard deviation > 5 days), show a wider predicted window rather than a single date, and notify the user that predictions are approximate.

### The "Missing Period" Safeguard

**Critical design decision:** The app must **never infer pregnancy from missing data.** If a user simply forgets to log a cycle, the app should not interpret this as a missed period or display pregnancy-related prompts.

Privacy researchers have raised this as a real concern: in jurisdictions where reproductive rights are restricted, an app that flags a "missed period" based on absent data could create risk for the user.

**Implementation:**

- If no period is logged by the predicted start date + 7 days, show a gentle, neutral prompt: "It looks like you haven't logged your period yet. Would you like to log it now, or skip this cycle?"
- Offer explicit options: **"Log period"**, **"Late — still waiting"**, **"I forgot to log"**, **"Skip this cycle"**.
- Never use language like "missed period" or "could you be pregnant?" based solely on absent data.
- The "skip" option ensures that absence of data is not ambiguous in the dataset.

### Health Conditions Tracking

Allow users to tag diagnosed conditions that affect their cycle. This enables condition-aware insights entirely on-device (no server-side processing needed).

**Supported conditions (initial set):**

- Polycystic Ovary Syndrome (PCOS)
- Endometriosis
- Premenstrual Dysphoric Disorder (PMDD)
- Uterine fibroids
- Thyroid disorders (hypo/hyperthyroidism)
- Bleeding disorders

**How it works:**

- At any time in settings, the user can add a confirmed diagnosis.
- The app then surfaces **condition-relevant insights** contextually. For example: "Users with PCOS often experience longer or irregular cycles — your predictions may take more cycles to stabilize."
- Symptom logging can be pre-populated with condition-common symptoms (e.g., for endometriosis: pelvic pain, painful intercourse, heavy bleeding).
- This data stays strictly on-device unless the user opts into cloud backup, and it is never used for analytics or shared externally.

### Fertility Window Tracking

Based on the user's logged periods, the app calculates:

- **Fertile window:** ~6 days (5 days before ovulation + ovulation day). Highlight in green on the calendar.
- **Peak fertility:** Ovulation day ± 1 day. Highlight with a distinct marker.
- **Low fertility / safe window:** Late luteal through menstruation. Highlight in a neutral color.

**Algorithm approach:** Start with the calendar method (cycle length - 14 = estimated ovulation day), and refine predictions over time as more cycles are logged. Consider integrating optional inputs like basal body temperature (BBT) and cervical mucus observations for more accurate predictions.

> **Disclaimer:** The app should always display a clear disclaimer that cycle predictions are estimates and should not be used as the sole method of contraception or conception planning. Recommend consulting a healthcare provider.

---

## Notification System

All notifications are **local notifications** — no push server needed, zero server cost. The user can opt-in/out of each notification category independently in settings.

| Notification | Trigger | Default | Message Example |
|---|---|---|---|
| **Period Reminder** | 5 days before predicted period start | On | "Your period is estimated to start in 5 days. How are you feeling?" |
| **Period Starting** | Day of predicted period start | On | "Your period may start today. Don't forget to log it when it begins." |
| **Premenstrual Phase** | Entry into PMS window (~day 23) | On | "You're entering the premenstrual phase. PMS symptoms like mood changes and bloating are common right now." |
| **Fertile Window Open** | 5 days before estimated ovulation | Off | "Your fertile window begins today. You're approaching your most fertile days." |
| **Peak Fertility** | Estimated ovulation day | Off | "Today is your estimated ovulation day — your most fertile day of the cycle." |
| **Low Fertility** | Entry into late luteal phase | Off | "You're now in your least fertile phase of the cycle." |
| **Daily Log Reminder** | Configurable time (e.g., 9 PM) | Off | "How was your day? Take a moment to log your symptoms and mood." |
| **Cycle Summary** | Day after period ends | On | "Your last cycle was 29 days. View your cycle summary." |
| **Pill / Medication Reminder** | Daily at user-configured time | Off | "Time to take your pill." |
| **Contraception Reminder** | Configurable (e.g., patch change, ring removal) | Off | "Reminder: it's time to change your contraceptive patch." |

Birth control pill reminders are one of the most requested features across all period tracker reviews. The daily pill reminder uses local notifications and supports multiple medication types: daily pill, weekly patch, monthly ring, injection schedule, and custom medication.

**Implementation notes (React Native):**

- Use `react-native-push-notification` or `notifee` for local notification scheduling on both iOS and Android.
- Notifications are scheduled/rescheduled every time the user logs a period or updates their data.
- Fertility notifications (fertile/infertile) are **off by default** and gated behind a settings toggle with a brief explanation: "Would you like fertility insights? This helps if you're trying to conceive or avoid pregnancy."
- All notification text should be neutral, supportive, and non-alarmist.

---

## Intercourse Logging

Users can log intimate activity within the app. This ties into fertility tracking (helps the app show context like "intercourse during fertile window") and is useful for users actively trying to conceive or avoid pregnancy.

**Data captured:**

- Date and time
- Protected / unprotected toggle
- Optional notes
- Optional photos (**Premium Plus only** — see Monetization below)

---

## App Lock / Biometric Protection

Given the intimate nature of the data (cycle logs, intercourse records, photos), the app must offer a lock screen. This is **not a premium feature** — it is table stakes for this category.

**Supported lock methods:**

- **Face ID / Touch ID** (iOS) / **Fingerprint / Face Unlock** (Android)
- **PIN code** (4–6 digits)
- **App timeout** — configurable auto-lock after 1, 5, or 15 minutes of inactivity

The lock screen should appear on every app launch and when returning from background. This protects against someone picking up an unlocked phone and opening the app.

**React Native implementation:** Use `react-native-keychain` for biometric authentication and secure PIN storage.

---

## Partner Sharing (Optional)

Users can optionally share a limited, read-only summary with a partner. This is useful for couples trying to conceive or partners who want to be supportive.

**What is shared (user chooses):**

- Next predicted period date
- Current cycle phase
- Fertile window (if fertility notifications are enabled)

**What is never shared:**

- Symptoms, moods, or notes
- Intercourse logs
- Photos
- Raw cycle data

**Implementation:** The user generates a shareable summary (not a live link to their data). This can be a simple text/image card sent via any messaging app. When cloud backup is later integrated, a paired partner view using a separate, non-encrypted Firestore document that the user explicitly publishes becomes an option. The user can revoke sharing at any time.

---

## Teenager / Minor Mode

Most period tracking apps are designed for adult women and include features that are too mature or irrelevant for younger users. A dedicated mode for users aged 9–17 captures an underserved market.

**When enabled, teenager mode:**

- Hides intercourse logging entirely
- Hides fertility/ovulation tracking and notifications
- Focuses on period education: "what is happening in your body" explanations for each phase
- Uses age-appropriate, supportive language
- Disables Premium Plus photo features
- Can be enabled during onboarding ("Is this your first time tracking your period?") or in settings

**Privacy note:** If the user is under 16 (or the applicable age of digital consent in their jurisdiction), GDPR Article 8 requires parental consent for data processing. If the app is fully local-first with no account, this is not triggered. If the user later opts into cloud backup, a parental consent flow is required.

---

## Monetization: Premium Plus Subscription

### Philosophy

The core app is a **one-time purchase** — full period tracking, cycle predictions, notifications, and local storage are all included. The subscription tier adds premium features to keep the barrier low and avoid fragmenting the experience. All premium features are computed **on-device** with zero server cost.

### Premium Plus — €1.49/month or €12.99/year

| Feature | Free (one-time purchase) | Premium Plus |
|---|---|---|
| Full cycle tracking & predictions | ✅ | ✅ |
| Symptom & mood logging | ✅ | ✅ |
| All notifications (incl. pill reminders) | ✅ | ✅ |
| Intercourse logging (text) | ✅ | ✅ |
| App lock / biometric protection | ✅ | ✅ |
| Health conditions tagging | ✅ | ✅ |
| Encrypted cloud backup & restore | ✅ | ✅ |
| **Photo attachments in intercourse logs** | ❌ | ✅ |
| **Symptom pattern insights** ("You tend to get headaches 2 days before your period") | ❌ | ✅ |
| **Cycle-over-cycle trend graphs** (compare last 3/6/12 cycles) | ❌ | ✅ |
| **Custom symptom tags** (create your own beyond the defaults) | ❌ | ✅ |
| **Extended cycle analytics & reports** | ❌ | ✅ |
| **Export data as PDF** (for sharing with healthcare provider) | ❌ | ✅ |
| **Home screen widget** (next period countdown, current phase) | ❌ | ✅ |

**Why this works:** The premium features above (pattern insights, trend graphs, custom tags, widget) are all computed **on-device** with zero server cost. They have high perceived value for power users but cost nothing to deliver. Only photo storage has a real Firebase cost (when cloud backup is enabled), which the subscription more than covers.

### Subscription Implementation (React Native)

- Use `react-native-iap` package (supports both App Store and Google Play billing)
- Store subscription status locally on-device for immediate feature gating
- When cloud backup is later integrated, store subscription status in Firebase Firestore for cross-device sync and validate receipts server-side using Firebase Cloud Functions

---

## Pricing Strategy

### Base App — One-Time Purchase

| Price Point | Positioning |
|-------------|-------------|
| €2.99 | Too cheap — users may not trust an app handling intimate data at this price |
| **€4.99–€6.99** | **Sweet spot** — signals quality and seriousness without being a barrier |
| €9.99+ | Too high — free alternatives (Clue, Flo) offer strong free tiers |

**Recommended: €5.99** (one-time purchase, no ads, no data selling)

The one-time purchase model is unusual in this market (most competitors use subscriptions or ad-supported free tiers) and is itself a differentiator. Market the price as: "Pay once. No ads. No data selling. Your body, your data, forever."

### Premium Plus — €1.49/month or €12.99/year

The annual plan saves ~€5/year compared to monthly, incentivizing commitment. The price is deliberately low compared to competitors (Clue Plus: ~€10/month, Flo Premium: ~€12/month) because:

- Most premium features (insights, graphs, custom tags, widget) are computed on-device with zero server cost
- Only photo storage has a real Firebase cost (~€0.01/user/month)
- The low price reduces churn and increases conversion

### Revenue Model Summary

| Revenue Stream | Price | Recurring? |
|---|---|---|
| Base app purchase | €5.99 | No (one-time) |
| Premium Plus subscription | €1.49/month or €12.99/year | Yes |
| Data selling | **€0 — never** | N/A |
| Advertising | **€0 — never** | N/A |

---

## Future Considerations

- **Basal Body Temperature (BBT) integration** — allow users to log daily temperature for more accurate ovulation predictions. Could integrate with Bluetooth thermometers or wearables (Oura Ring, Apple Watch).
- **Cervical mucus tracking** — optional input to refine fertility predictions alongside the calendar method.
- **Partner sharing enhancements** — if the basic share-a-summary feature gains traction, consider a paired partner account with real-time cycle phase updates (still E2E encrypted once cloud backup is integrated).
- **Healthcare provider export** — generate a cycle report (PDF) that users can share with their doctor. Premium Plus feature.
- **Apple Health / Google Fit integration** — sync cycle data with the platform health apps for users who want centralized health data. Must respect the consent flow (opt-in only).
- **Machine learning predictions** — as more cycles are logged, use on-device ML (Core ML on iOS / TensorFlow Lite on Android / `react-native-tflite` for React Native) to improve cycle length and symptom predictions without sending data to any server.
- **Wearable integration** — sync with Oura Ring, Garmin, WHOOP, or Fitbit for automatic BBT and sleep data. Compute ovulation predictions from temperature patterns.
- **PCOS / PMDD specialized modes** — for users who tag these conditions, offer tailored prediction models, symptom sets, and educational content.
- **Perimenopause mode** — adapt the tracking model for users in their 40s-50s experiencing cycle changes. Clue and Flo both offer this; it's becoming table stakes.
- **Additional Premium Plus features** — if subscription uptake is strong, consider adding: custom themes, mood trend analysis, cycle comparison (month-over-month), and AI-powered symptom pattern detection (on-device).
- **Localization** — period tracking apps with the widest reach support 15–20+ languages. Prioritize English, Spanish, French, German, Portuguese, Arabic, and Hindi for maximum market coverage.

---

## Related Documents

- [Part 2: Architecture & Security](./02-architecture.md) — serialization, compression, encryption, key management, libraries, privacy compliance, and security checklist.
- [Part 3: Data Management & Firebase](./03-data-management.md) — Firebase configuration, backup/restore flows, cost estimation, and cloud integration (implemented last).
