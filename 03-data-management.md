# Part 3: Data Management & Firebase Integration

## Overview

This document covers the cloud backup layer: Firebase configuration, backup/restore flows, photo storage, cost estimation, and data archival. This is the **final phase of implementation** — everything described here is built on top of a fully functional local-first app.

### Implementation Priority

> **This is the last thing you build.** The app must be complete and fully usable with local-only storage before any Firebase integration begins. The serialization, compression, and encryption pipeline from [Part 2: Architecture & Security](./02-architecture.md) already runs on-device. This document adds the network transport layer and cloud storage on top. The user must be able to use the app indefinitely without ever creating an account or enabling cloud backup.

---

## Platform Options (Context)

Before diving into the Firebase approach, here is a summary of the cloud-per-platform options considered:

### iOS — iCloud (CloudKit)

Apple provides this almost for free. With CloudKit, the app stores user data in the user's iCloud account. When they log into a new iPhone with the same Apple ID, the data is just there. Options include:

- **NSUbiquitousKeyValueStore** — for small settings/preferences
- **CloudKit (CKContainer)** — for structured data, files, images
- **Core Data + CloudKit sync** — Apple handles syncing automatically

The user doesn't need to "log in" to the app — their Apple ID ties everything together.

### Android — Google Drive API / Firebase

- **Google Drive App Data folder** — a hidden folder in the user's Google Drive only the app can see. Free, invisible to the user, follows their Google account.
- **Firebase Auth + Firestore/Cloud Storage** — generous free tier, Google manages everything.

### Cross-Platform Challenge

iCloud doesn't work on Android; Google Drive's app data folder doesn't work on iOS. For cross-platform support, **Firebase** is the best zero-server option that works on both. **React Native with TypeScript** is the recommended cross-platform framework — it provides native performance with a single codebase and has the strongest ecosystem of Firebase and crypto libraries.

### Alternative: Supabase

If avoiding Google entirely, **Supabase** is an open-source Firebase alternative with a free tier (500MB database, 1GB file storage). It works on both platforms but requires slightly more setup.

---

## 1. Firebase Configuration

### Firebase Storage Structure

```
/users/{userId}/
    ├── keyblob            // encrypted Master Key + salt + metadata
    ├── backups/
    │   ├── latest.enc     // most recent full backup (compressed + encrypted)
    │   ├── meta.json      // backup timestamp, version, compression type
    │   └── chunks/        // (optional) for large backups, split into chunks
    │       ├── 0.enc
    │       ├── 1.enc
    │       └── ...
    ├── photos/                    // Premium Plus only
    │   ├── 2026-02/
    │   │   ├── abc123.enc         // encrypted JPEG
    │   │   ├── def456.enc
    │   │   └── ...
    │   └── 2026-03/
    │       └── ...
```

### Firestore Security Rules

Lock down access so users can only read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

### React Native Firebase Libraries

| Purpose         | Library                                          |
|-----------------|--------------------------------------------------|
| Auth            | `@react-native-firebase/auth`                    |
| Storage         | `@react-native-firebase/storage`                 |
| Database        | `@react-native-firebase/firestore`               |

---

## 2. Backup Metadata Schema

Store alongside each backup for versioning and restore logic:

```json
{
  "version": 2,
  "timestamp": "2026-02-26T14:30:00Z",
  "appVersion": "1.4.0",
  "serialization": "protobuf",
  "protoSchemaVersion": 3,
  "compression": "zstd",
  "compressionLevel": 5,
  "dictionaryVersion": 1,
  "encryption": "AES-256-GCM",
  "keyDerivation": "argon2id",
  "chunks": 1,
  "originalSizeBytes": 2048000,
  "compressedSizeBytes": 410000,
  "encryptedSizeBytes": 410016,
  "checksum": "sha256:abcdef1234567890..."
}
```

This metadata is also stored locally alongside the on-device backup. When the user enables cloud backup, the same metadata is uploaded to Firestore.

---

## 3. Full Backup Flow (Step by Step)

### Local Backup (Always Active)

```
1.  Collect all user data into a single data structure
2.  Serialize to Protobuf (binary, schema-driven)
3.  Compress with zstd using bundled dictionary (level 5)
4.  Generate a random 12-byte IV
5.  Encrypt compressed blob with AES-256-GCM using the Master Key + IV
6.  Prepend IV to the ciphertext
7.  Write encrypted blob to local storage
8.  Write metadata locally
9.  Log backup timestamp
```

### Cloud Backup (When User Opts In)

After the local backup completes:

```
10. Upload encrypted blob to Firebase Storage at /users/{uid}/backups/latest.enc
11. Write metadata to Firestore
12. Confirm upload success before marking as synced
```

### Restore (New Device — Cloud Phase)

```
1.  User signs in via Firebase Auth
2.  Fetch encrypted Master Key blob + salt from Firestore
3.  Derive KEK from credentials + salt (Argon2id)
4.  Decrypt the Master Key
5.  Download encrypted backup + metadata from Firebase
6.  Read dictionaryVersion from metadata, load correct bundled dictionary
7.  Split IV (first 12 bytes) from ciphertext
8.  Decrypt with AES-256-GCM using Master Key + IV
9.  Decompress with zstd using the dictionary
10. Deserialize Protobuf into app data structures
11. Populate local database / state
12. App is fully restored — user picks up where they left off
```

---

## 4. Photo Storage (Premium Plus)

Photos are the most expensive data type to store. Gating them behind a subscription ensures the recurring cost is covered by recurring revenue.

**Pipeline for photos:**

```
Photo → Resize/quality cap (max 1080p, JPEG quality 80%) → Encrypt (AES-256-GCM with Master Key) → Store locally → Upload to Firebase Storage (if cloud backup enabled)
```

- **Do NOT compress photos with zstd** — JPEG is already compressed. Zstd will waste CPU for near-zero gain.
- **Resize before encryption** — cap at 1080×1080 pixels. A resized JPEG at 80% quality is typically 200–400 KB.
- **Encrypt like everything else** — the same Master Key encrypts the photo blob. The photo path/reference is stored in the backup metadata.
- **Storage budget:** At ~300 KB per photo, 10 photos/month per subscriber = ~3 MB/month per subscriber. The €1.49/month subscription covers Firebase costs even at massive scale.

---

## 5. Cost Estimation

### Business Model Context

This app uses a **one-time purchase model** (no subscription for core features). Every byte of Firebase storage is a permanent cost with no recurring revenue to offset it. Aggressive compression is not optional — it's a business requirement. The **Protobuf + zstd dictionary + level 5** strategy is chosen specifically to maximize user capacity per dollar.

### Firebase Free Tier (Spark Plan)

| Resource              | Free Limit          |
|-----------------------|---------------------|
| Firestore storage     | 1 GB                |
| Firestore reads       | 50,000/day          |
| Firestore writes      | 20,000/day          |
| Cloud Storage         | 5 GB                |
| Storage downloads     | 1 GB/day            |
| Auth users            | Unlimited           |

### Per-User Estimate (Protobuf + zstd Dictionary + Level 5)

| Data Type                       | Raw Size | After Protobuf | After Dict Compression | After Encryption |
|---------------------------------|----------|----------------|------------------------|------------------|
| App settings/preferences        | 50 KB    | ~30 KB         | ~5 KB                  | ~5 KB            |
| Moderate user data              | 500 KB   | ~300 KB        | ~40 KB                 | ~40 KB           |
| Heavy user (with media refs)    | 5 MB     | ~3 MB          | ~600 KB                | ~600 KB          |

### User Capacity on Free Tier (5 GB Cloud Storage)

| User Type              | Backup Size | Users on Free Tier |
|------------------------|-------------|--------------------|
| Light (~5 KB each)     | 5 KB        | ~1,000,000         |
| Moderate (~40 KB each) | 40 KB       | ~125,000           |
| Heavy (~600 KB each)   | 600 KB      | ~8,300             |

### Cost Beyond Free Tier (Blaze Plan)

| Users (moderate) | Storage Needed | Monthly Cost (est.)  |
|------------------|----------------|----------------------|
| 125,000          | 5 GB           | **$0 (free tier)**   |
| 250,000          | 10 GB          | ~$0.13/month         |
| 500,000          | 20 GB          | ~$0.39/month         |
| 1,000,000        | 40 GB          | ~$0.91/month         |

> At $0.026/GB/month, even 1 million moderate users costs under $1/month in storage. Bandwidth costs (downloads) will be the larger factor at scale — but only triggered when users actually restore backups.

### Revenue vs. Cost Projection (Premium Plus Photo Storage)

| Subscribers | Photo Storage/mo | Firebase Cost/mo | Revenue/mo | Net/mo |
|-------------|-----------------|------------------|------------|--------|
| 100         | 300 MB          | ~$0.01           | €149       | +€149  |
| 1,000       | 3 GB            | ~$0.08           | €1,490     | +€1,490|
| 10,000      | 30 GB           | ~$0.78           | €14,900    | +€14,900|

> Firebase costs are negligible compared to subscription revenue. Even at 10,000 subscribers, storage costs less than €1/month.

---

## 6. Cost Control & Data Archival

### Cost Control Strategies

1. **Prune old backups** — keep only the latest backup per user. No versioning unless requested.
2. **Inactive user cleanup** — after 12+ months of inactivity, notify the user and archive/delete their backup.
3. **Set a backup size cap** — reject backups over a threshold (e.g., 10 MB compressed) to prevent outliers from blowing up costs.
4. **Monitor Firebase usage dashboard** — set budget alerts at $1, $5, $10/month to catch surprises early.

### Data Deletion (GDPR Right to Erasure)

The app must provide a "Delete all my data" button that:

1. Wipes all local data on the device
2. Deletes the Firebase Storage files at `/users/{uid}/` (backups + photos)
3. Deletes the Firestore documents at `/users/{uid}/`
4. Optionally deletes the Firebase Auth account
5. Confirms deletion to the user

This must work even if the user's subscription has lapsed. Data deletion is a legal right, not a premium feature.

### Data Export (GDPR Right to Portability)

The user can export all their data in a standard format:

- **JSON export** — human-readable, includes all cycle data, symptoms, logs, and settings
- **PDF report** — formatted cycle summary suitable for sharing with a healthcare provider (Premium Plus feature)

Export runs entirely on-device. The decrypted local data is formatted and saved to the device's file system for the user to share as they choose.

---

## 7. Cloud Backup Enablement Flow

This is the user-facing flow for opting into cloud backup. It only appears when the user explicitly requests it.

```
1.  User taps "Enable Cloud Backup" in settings
2.  Present consent screen:
    - "Your data will be encrypted on your device before upload. 
       No one — including us — can read your data."
    - Explain what is backed up (cycle data, symptoms, settings)
    - Separate toggle for photo backup (Premium Plus only)
3.  User signs in via Firebase Auth (Google, Apple, or email)
4.  If Option A (passphrase): prompt user to create a backup passphrase
5.  Generate/retrieve Master Key
6.  If first time: upload encrypted Master Key blob to Firebase
7.  Run first cloud backup (local backup pipeline + upload)
8.  Show confirmation: "Cloud backup enabled. Your data is encrypted and synced."
9.  Schedule automatic backups (e.g., daily or on significant data changes)
```

### Automatic Backup Triggers

Once cloud backup is enabled, the app syncs automatically:

- After the user logs a new period
- After any significant data change (configurable threshold)
- Daily at a quiet time (e.g., 3 AM) if data has changed
- On app close/background (if data has changed since last backup)

All triggers run the same local backup pipeline, then upload the encrypted blob if cloud backup is enabled.

---

## 8. Future Considerations

- **Incremental/delta backups** — only upload changes since the last backup to reduce bandwidth.
- **Backup versioning** — keep the last N backups for rollback capability.
- **Chunked uploads** — split large backups into chunks for resumable uploads on flaky connections.
- **Migration path** — if you later move off Firebase, the encryption layer is independent. Only the upload/download transport changes.
- **Key rotation** — periodically generate a new Master Key, re-encrypt data, and retire the old key.
- **Offline queue** — if the device is offline during a backup trigger, queue it and sync when connectivity returns.
- **EHDS preparation** — monitor the EU European Health Data Space rollout (key dates: 2029, 2031) and ensure the data model supports standardized health data portability formats when required.

---

## Related Documents

- [Part 1: App Workflow & Features](./01-app-workflow.md) — cycle tracking, notifications, monetization, and pricing.
- [Part 2: Architecture & Security](./02-architecture.md) — serialization, compression, encryption, key management, libraries, privacy compliance, and security checklist.
