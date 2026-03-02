# Part 2: Architecture & Security

## Overview

This document covers the technical architecture of the app's data pipeline: how user data is serialized, compressed, encrypted, and secured. All operations described here run **entirely on-device**. The encryption and compression layers are designed to be transport-agnostic — they work whether the data stays local or is eventually uploaded to Firebase.

### Implementation Priority

> **Local-first.** Everything in this document is implemented before any cloud integration. The serialization, compression, and encryption pipeline runs on the user's device to protect local data. The same pipeline is later reused when cloud backup is added in [Part 3: Data Management & Firebase](./03-data-management.md). Build the data pipeline first, add the network layer last.

---

## Design Principles

1. **Compress before encrypt** — encrypted data is incompressible, so compression must come first.
2. **Account-tied encryption** — the decryption key is derived from or gated by the user's identity (applied when cloud backup is enabled).
3. **Cross-device restore** — sign in on a new phone, get your data back automatically (applies to the cloud backup phase).
4. **Minimal cost** — aggressive compression keeps within Firebase's free tier as long as possible.
5. **Zero custom server** — Firebase handles auth, storage, and database only when the user chooses to enable cloud backup.

---

## Data Pipeline

```
BACKUP (local or cloud):
  User Data → Serialize (Protobuf) → Compress (zstd + dictionary, level 5) → Encrypt (AES-256-GCM) → Store

RESTORE:
  Load → Decrypt (AES-256-GCM) → Decompress (zstd + dictionary) → Deserialize (Protobuf) → User Data
```

> **Important:** Always compress before encrypting. Encrypted output has maximum entropy and cannot be compressed.

For local storage, the encrypted blob is written to the device filesystem. For cloud backup, the same blob is uploaded to Firebase (covered in Part 3).

---

## 1. Serialization

Choose a serialization format based on your data:

| Format   | Best For                        | Notes                          |
|----------|---------------------------------|--------------------------------|
| JSON     | Simple key-value data, settings | Human-readable, larger size    |
| Protobuf | Structured app data, models     | Compact binary, schema-driven  |
| CBOR     | Mixed data types                | JSON-like but binary, smaller  |

### Recommendation

- Use **Protobuf** as the primary serialization format. It produces 30–50% smaller output than JSON before compression even begins, which compounds with compression gains. This is critical for a non-subscription app where storage costs come directly out of revenue.
- Use **JSON** only for debugging or human-readable exports during development.

---

## 2. Compression

### Algorithm: Zstandard (zstd) with Dictionary Compression

| Property          | Value                                                          |
|-------------------|----------------------------------------------------------------|
| Compression ratio | 80–95% reduction with Protobuf + dictionary                   |
| Speed             | Faster than gzip at similar ratios                             |
| Libraries         | iOS: `ZSTDSwift`, Android: `zstd-jni`, RN: `react-native-zstd` |
| Level             | **5** (optimal speed/ratio tradeoff)                           |

### Dictionary Compression

Since all user backups share the same Protobuf schema (identical field names, structures, and patterns), a **pre-trained zstd dictionary** dramatically improves compression — especially on smaller payloads where the compressor doesn't have enough data to learn patterns on its own.

**How it works:**

1. During development, collect a set of sample/representative backups (100+ samples is ideal).
2. Train a zstd dictionary using `zstd --train` on these samples.
3. Ship the dictionary as a bundled asset inside the app (~50–100 KB).
4. Use the dictionary for both compression and decompression.
5. Version the dictionary — store `dictionaryVersion` in backup metadata so the app knows which dictionary to use during restore.

**Impact:** On small-to-medium payloads (under 1 MB), dictionary compression can improve ratios by **2–3x** over plain zstd. A 150 KB payload (plain zstd) can drop to 40–50 KB with a dictionary.

### Guidelines

- Use **compression level 5** — the sweet spot for mobile devices (fast enough for real-time, strong enough to cut costs).
- **Skip compression** for already-compressed formats: JPEG, PNG, MP4, AAC, ZIP.
- Compress metadata and raw/text data; pass media through as-is.
- Store `compressionType` and `dictionaryVersion` in the backup metadata so the restore path knows what to expect.
- **Retrain the dictionary** when the Protobuf schema changes significantly (e.g., major version bumps).

### Pseudocode

```
// One-time: load bundled dictionary
dictionary = loadAsset("zstd_dictionary_v1.dict")

function compressBackup(data):
    serialized = Protobuf.serialize(data)       // binary, schema-driven
    compressed = zstd.compressWithDict(serialized, dictionary, level=5)
    return compressed

function decompressBackup(compressed):
    serialized = zstd.decompressWithDict(compressed, dictionary)
    data = Protobuf.deserialize(serialized)
    return data
```

---

## 3. Encryption

### Algorithm: AES-256-GCM

AES-256-GCM provides both **confidentiality** and **integrity** (authenticated encryption). It's the industry standard and has native support on both platforms via React Native's `react-native-quick-crypto`.

### Key Management: Two-Layer Architecture

A two-layer key system ensures that if the user changes their password/passphrase, you only re-encrypt the Master Key — not every piece of stored data.

```
┌─────────────────────────────────────────────────────┐
│                    USER CREDENTIALS                  │
│              (passphrase or auth token)              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Argon2id/PBKDF2│  + salt
              │  Key Derivation │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │ Key Encryption  │
              │ Key (KEK)       │
              └───────┬────────┘
                      │
                      ▼  (unwraps)
              ┌────────────────┐
              │  Master Key     │  ← stored encrypted locally (and optionally in Firebase)
              │  (AES-256)      │
              └───────┬────────┘
                      │
                      ▼  (encrypts/decrypts)
              ┌────────────────┐
              │  User Data      │
              │  (local + backups)│
              └────────────────┘
```

### Local-First Key Storage

Before cloud backup is enabled, the encrypted Master Key blob is stored on-device:

- **iOS:** Keychain (synced via iCloud Keychain if user has it enabled)
- **Android:** Android Keystore
- **React Native:** `react-native-keychain` wraps both

When cloud backup is later integrated, the same encrypted blob is additionally uploaded to Firebase for cross-device restore.

### First-Time Setup Flow

1. User launches the app (no account needed).
2. Generate a random **Master Key** (256-bit AES key).
3. Store the Master Key securely in the platform keychain via `react-native-keychain`.
4. Use the Master Key to encrypt all local user data with **AES-256-GCM**.
5. Each encryption operation uses a unique **IV/nonce** (12 bytes, randomly generated).

When cloud backup is later enabled:

6. User signs in via Firebase Auth (Google, Apple, or email).
7. Derive a **Key Encryption Key (KEK)** from the user's credentials using **Argon2id** (preferred) or **PBKDF2** with a random salt.
8. Encrypt the Master Key with the KEK.
9. Upload the **encrypted Master Key blob** + **salt** to Firebase (under the user's document).

### New Device Restore Flow (Cloud Phase)

1. User signs in on new device → Firebase Auth confirms identity.
2. Pull the encrypted Master Key blob + salt from Firebase.
3. Re-derive the KEK from credentials + salt.
4. Decrypt the Master Key.
5. Use the Master Key to decrypt all user data backups.

### Password/Passphrase Change

1. Decrypt Master Key with the old KEK.
2. Derive a new KEK from the new credentials + new salt.
3. Re-encrypt the Master Key with the new KEK.
4. Upload the new encrypted blob + new salt to Firebase (if cloud backup is enabled).
5. **No need to re-encrypt any data** — only the Master Key wrapper changes.

### Encryption Pseudocode

```
function encryptData(plaintext, masterKey):
    iv = generateRandomBytes(12)
    ciphertext = AES_256_GCM.encrypt(plaintext, masterKey, iv)
    return iv + ciphertext   // prepend IV for decryption

function decryptData(blob, masterKey):
    iv = blob[0:12]
    ciphertext = blob[12:]
    plaintext = AES_256_GCM.decrypt(ciphertext, masterKey, iv)
    return plaintext
```

---

## 4. The Password/Credential Problem

When using "Sign in with Google" or "Sign in with Apple," there is no user-typed password to derive a KEK from. Three options:

### Option A: Separate Backup Passphrase (Most Secure)

- At first launch (or when enabling cloud backup), ask the user to create a "backup passphrase."
- This passphrase is used to derive the KEK.
- **Pros:** True end-to-end encryption. Even you (the developer) cannot read user data. Survives a full Firebase breach.
- **Cons:** Adds friction. If the user forgets the passphrase, their data is gone forever.

### Option B: Platform Keychain Sync

- Generate the KEK randomly on device.
- Store it in iOS Keychain (synced via iCloud Keychain) or Android Keystore (synced via Google Block Store).
- **Pros:** Invisible to the user, no extra passphrase.
- **Cons:** Tied to the platform ecosystem. Cross-platform restore is harder.

### Option C: Firebase-Auth-Gated Encryption (Easiest)

- Generate the Master Key randomly.
- Store it encrypted in Firebase, but gated only by Firebase Auth rules (no separate passphrase derivation).
- The encryption protects data at rest and against database breaches where auth is not compromised.
- **Pros:** Simplest implementation. No extra user input needed.
- **Cons:** If someone compromises the Firebase Auth account, they get the key. Not true E2E.

### Recommendation

| Scenario                              | Best Option              |
|---------------------------------------|--------------------------|
| High-security app (health, finance)   | Option A (passphrase)    |
| Consumer app, single platform         | Option B (keychain sync) |
| Consumer app, cross-platform, easy UX | Option C (auth-gated)    |

> **Note:** Options B and C only become relevant when cloud backup is implemented. For the initial local-first build, the Master Key lives in the platform keychain and no credential derivation is needed.

---

## 5. Libraries & Dependencies (React Native / TypeScript)

Since the app is built as a single React Native codebase, all dependencies are managed through npm/yarn. The native Swift/Kotlin layers are handled internally by the React Native libraries.

| Purpose            | Library                                          | Notes                          |
|--------------------|--------------------------------------------------|--------------------------------|
| Local Database     | `@nozbe/watermelondb` or `react-native-mmkv`     | High-performance local storage |
| Compression        | `react-native-zstd` or `pako` (gzip fallback)    | zstd preferred for ratio       |
| Encryption         | `react-native-quick-crypto`                       | Native AES-256-GCM on both platforms |
| Key Derivation     | `react-native-argon2`                             | Argon2id for KEK derivation    |
| Keychain           | `react-native-keychain`                           | Biometrics + secure key storage |
| Notifications      | `notifee` or `react-native-push-notification`     | Local notifications, zero server cost |
| Biometric Auth     | `react-native-keychain` (built-in)                | Face ID, Touch ID, fingerprint |
| Protobuf           | `protobufjs`                                      | Schema-driven serialization    |
| In-App Purchases   | `react-native-iap`                                | App Store + Google Play billing |

**Added when cloud backup is implemented (Part 3):**

| Purpose            | Library                                          |
|--------------------|--------------------------------------------------|
| Auth               | `@react-native-firebase/auth`                    |
| Cloud Storage      | `@react-native-firebase/storage`                 |
| Cloud Database     | `@react-native-firebase/firestore`               |

---

## 6. Privacy & Sensitivity Considerations

This app handles **extremely sensitive personal health and intimate data**. Privacy isn't just a feature — it's the core promise and the primary marketing differentiator.

### Why Privacy Is the #1 Selling Point

The period tracker market has been rocked by privacy scandals. Flo settled with the FTC over sharing menstrual and pregnancy data with Facebook and Google, and faced a $56M class action settlement in 2025. Privacy International found that 61% of period tracking apps were sharing data with Facebook in 2019. After the overturn of Roe v. Wade in the US, many women deleted their period trackers out of fear that cycle data could be used as evidence in abortion prosecutions. The apps winning user trust right now — Drip, Euki, Embody — all store data locally with no cloud requirement. Your app's architecture (local-first, E2E encrypted cloud backup, no analytics on health data) directly addresses every major concern in this space.

### Regulatory Requirements

**GDPR — Data Protection Impact Assessment (DPIA)**

A DPIA is **legally mandatory** before launching in the EU. Under GDPR Article 35, any processing of special category data (which includes reproductive health data) at scale requires a documented impact assessment. This must be completed and available for supervisory authorities before the app goes live.

The DPIA should cover:

- What personal data is collected and why (data mapping)
- The legal basis for processing (explicit consent under Article 9(2)(a))
- Risks to data subjects (e.g., data breach exposing cycle/intimacy data, law enforcement access)
- Mitigation measures (E2E encryption, local-first storage, no third-party sharing)
- Data retention and deletion policies

**GDPR — Explicit Consent Flow**

GDPR Article 9 requires **explicit consent** for processing health data. This is stricter than regular consent — it must be:

- **Specific** — separate consent for each category (cycle data, symptoms, intercourse logs, photos)
- **Informed** — the user must understand what they're consenting to in plain language
- **Freely given** — the app must work without consent for non-essential processing (this is satisfied by local-first design: no consent needed if data never leaves the device)
- **Withdrawable** — user can revoke consent at any time

**Implementation:** At first launch, present a clear consent screen (not buried in a privacy policy). Each data category has its own toggle. Cloud backup requires a separate, explicit opt-in. The consent screen should explain in 1-2 sentences what each category involves and who can access it (answer: only the user).

**European Health Data Space (EHDS)**

The EU's EHDS was adopted in February 2025 and entered into force in March 2025. While the key rules on secondary use of health data won't apply until 2029-2031, the framework explicitly includes wellness and lifestyle apps as potential data sources. Designing with EHDS in mind now (clean Protobuf schemas, granular consent, data export capability) will prevent costly refactoring later.

**Key EHDS considerations:**

- The EHDS may require apps to make health data portable in standardized formats
- Secondary use provisions may allow anonymized data to be used for research (with consent)
- Data from wellness apps is not subject to the same quality standards as medical devices, but is still in scope

### Privacy Commitments

- **Local-first by default** — all data stays on the device unless the user explicitly enables cloud backup.
- **End-to-end encryption is non-negotiable** for cloud backups. No one (including the developer) can read user data.
- **No analytics on health data** — do not send cycle data, symptoms, or intercourse logs to any analytics service. Track only anonymous app usage metrics (screen views, crash reports) using a privacy-respecting tool (e.g., TelemetryDeck, Plausible, or self-hosted Matomo).
- **No third-party SDKs that access health data** — no Facebook SDK, no Google Analytics on health screens, no ad networks. Audit all third-party dependencies.
- **No third-party data sharing** — ever. Make this explicit in the privacy policy and in-app.
- **Minimal data collection** — only collect what's needed for the app to function. No location, no contacts, no device fingerprinting.
- **Transparent privacy policy** — written in plain language, not legalese. Explain exactly what is stored, where, and who can access it (answer: only the user). Aim for a reading level accessible to a teenager.
- **Photo privacy** — photos in the intercourse category are encrypted on-device before upload. They never exist in plaintext on any server. Thumbnail generation (if needed) must happen on-device only.
- **GDPR data rights** — implement all required rights:
  - **Right to access** — user can view all their data at any time (already satisfied by the app UI)
  - **Right to portability** — user can export all their data in a standard format (JSON or PDF)
  - **Right to erasure** — "Delete all my data" button that wipes local storage and (if cloud backup is enabled) Firebase Storage + Firestore documents for the user
  - **Right to rectification** — user can edit any logged data at any time
- **No inference from missing data** — the app never flags, interprets, or acts on the absence of logged data (see "Missing Period Safeguard" in Part 1).

---

## 7. Security Checklist

### Encryption & Key Management
- [ ] Master Key is **never** stored in plaintext anywhere (not in local storage, not in Firebase)
- [ ] Each encryption operation uses a **unique random IV/nonce**
- [ ] Salt is unique per user and stored alongside the encrypted key blob
- [ ] Key derivation uses a **memory-hard function** (Argon2id preferred over PBKDF2)
- [ ] Photos are encrypted on-device before upload — never stored in plaintext on Firebase
- [ ] Zstd dictionary is **bundled in the app binary**, versioned, and referenced in backup metadata

### Access Control
- [ ] App offers **biometric / PIN lock** at launch (Face ID, Touch ID, fingerprint, PIN)
- [ ] App enforces **minimum passphrase length** (if using Option A for KEK derivation)
- [ ] SSL/TLS is enforced for all Firebase communication (default behavior — applies when cloud backup is enabled)

### Privacy & Compliance
- [ ] **DPIA completed and documented** before EU launch
- [ ] **Explicit consent flow** at first launch with per-category toggles
- [ ] Cloud backup is **opt-in only** — app works fully without an account
- [ ] "Delete all my data" feature wipes local storage and (if cloud enabled) all Firebase Storage and Firestore documents for the user
- [ ] No health or intimate data is sent to analytics services
- [ ] **No third-party SDKs** access health data (no Facebook SDK, no ad networks on health screens)
- [ ] Privacy policy is clear, plain-language, and covers GDPR requirements
- [ ] Privacy policy is accessible **within the app** at all times (not just at install)
- [ ] App **never infers pregnancy** from missing data — only from explicit user input
- [ ] Parental consent flow implemented for users under 16 who opt into cloud backup

### Cost Control (applies when cloud backup is enabled)
- [ ] Old backups are pruned to avoid unbounded storage growth (critical for non-subscription model)
- [ ] Backup size cap is enforced to prevent outlier users from inflating storage costs
- [ ] Subscription receipt validation is done server-side (Firebase Cloud Functions)
- [ ] Firebase budget alerts set at $1, $5, $10/month
- [ ] Firebase Security Rules restrict each user to their own `/users/{uid}/` path

---

## Related Documents

- [Part 1: App Workflow & Features](./01-app-workflow.md) — cycle tracking, notifications, monetization, and pricing.
- [Part 3: Data Management & Firebase](./03-data-management.md) — Firebase configuration, backup/restore flows, cost estimation, and cloud integration (implemented last).
