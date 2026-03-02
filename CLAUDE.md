# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Privacy-first menstrual cycle tracking app built with **React Native + TypeScript**. One-time purchase (€5.99) with optional Premium Plus subscription (€1.49/mo). Currently in **pre-development phase** — three specification documents define the full architecture.

## Specification Documents

- `01-app-workflow.md` — Features, UX flows, cycle tracking logic, notifications, monetization tiers
- `02-architecture.md` — Data pipeline (Protobuf → zstd → AES-256-GCM), key management, encryption
- `03-data-management.md` — Firebase integration, cloud backup/restore, photo storage, cost analysis

**Always consult these documents before implementing features.** They contain detailed requirements, edge cases, and explicit design decisions.

## Core Design Principles

1. **Local-first** — All data on-device. Cloud backup is opt-in, never automatic. No internet required for core functionality.
2. **Account-free** — Full app works without account creation. Firebase account only for cloud backup.
3. **Privacy as product** — No data collection, no external analytics on health data, no third-party SDKs accessing sensitive data.
4. **Zero custom server** — Firebase only, added last.

## Implementation Phases (Strict Order)

**Phase 1: Core local-only app** — Cycle tracking, predictions, symptom/mood logging, notifications, app lock, in-app purchases. No cloud dependency.

**Phase 2: Enhanced features** — Pattern insights, trend graphs, custom symptom tags, health conditions, partner sharing, teenager mode, widgets, PDF export.

**Phase 3: Cloud integration (last)** — Firebase auth, encrypted cloud backup/restore, cross-device sync, photo upload.

## Data Pipeline

```
Serialize (Protobuf) → Compress (zstd level 5, dictionary) → Encrypt (AES-256-GCM) → Store
```

- Compress **before** encrypt (encrypted data is incompressible)
- Ship pre-trained zstd dictionary as bundled asset (~50-100 KB), version it in backup metadata
- Skip compression for already-compressed media (JPEG, PNG, MP4)
- Two-layer key architecture: User credentials → Argon2id/PBKDF2 → KEK → decrypt Master Key (stored in platform Keychain)

## Key Libraries (Planned)

| Purpose | Library |
|---------|---------|
| Local DB | `@nozbe/watermelondb` or `react-native-mmkv` |
| Serialization | `protobufjs` |
| Compression | `react-native-zstd` or `pako` |
| Encryption | `react-native-quick-crypto` |
| Key derivation | `react-native-argon2` |
| Keychain/biometrics | `react-native-keychain` |
| Notifications | `notifee` |
| In-app purchases | `react-native-iap` |
| Firebase | `@react-native-firebase/*` (Phase 3 only) |

## Critical Design Decisions

- **Never infer pregnancy from missing data.** If no period is logged, show neutral prompt with options: "Log period", "Late — still waiting", "I forgot to log", "Skip this cycle". Never say "missed period" based on absent data.
- **Cycle predictions** use rolling weighted average of last 3-6 cycles (most recent = 40% weight). Show confidence indicator. For irregular cycles (stddev > 5 days), show wider predicted window.
- **Teenager mode** (ages 9-17) hides intercourse logging, fertility tracking, and adult content. Requires parental consent under 16 (GDPR Article 8).
- **Master Key** stored in iOS Keychain / Android Keystore via `react-native-keychain`. Never in plaintext.
- **Unique random IV** for every encryption operation. Per-user salt for key derivation.

## Compliance

GDPR mandatory (EU app with health data). Explicit consent flow for health data (Article 9). Must support: data export (JSON/PDF), full data deletion (local + cloud), right to rectification. No Facebook SDK, no ad networks on health screens.
