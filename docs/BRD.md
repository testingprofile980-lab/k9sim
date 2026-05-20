# Business Requirements Document (BRD)

**Product (working name):** ResuMind
**Document version:** 0.1 (draft)
**Date:** 2026-05-20
**Owner:** Founder / Product
**Status:** Pre-build, to be used as input for AI-assisted development

---

## 1. Executive Summary

ResuMind is a personal memory-assistant mobile app that lets users capture anything they need to remember — a photo, a short text, a voice note, a number, or a scrap of information — in **under two seconds** via a system-wide floating capture button. The app then automatically classifies each capture, extracts any time, date, or location it contains, schedules timely reminders for time-bound items, and delivers an end-of-day summary of everything else so nothing slips through the cracks.

The product is built around three non-negotiable principles:

1. **Zero-friction capture** — one tap, no categories, no decisions.
2. **Local-first privacy** — user data never leaves the device by default.
3. **Useful recall, not just storage** — the app actively surfaces what matters when it matters.

---

## 2. Problem Statement

Most people forget small but important things every day — a name, an address, a medicine dose, a task a colleague mentioned in passing, the spot where they parked. Existing solutions fail one of three ways:

- **Note apps** (Google Keep, Apple Notes, Bear) require the user to choose a notebook, type a title, or pick a tag — too much friction in the 2-second window where memory is fresh.
- **Reminder apps** (Apple Reminders, Todoist) require the user to *already know* what they want to remember and when.
- **Voice assistants** require unlocking the phone, opening an app, and speaking precisely — and most don't surface what was captured later.

The result: people stop capturing, or they capture and never look at it again.

---

## 3. Target Users

### 3.1 Primary persona — "The Busy Forgetter"
- Age 25–55
- Smartphone user, on phone several hours a day
- Juggles work, family, errands
- Has tried notes apps but stopped because they were too much work
- Wants to remember things without becoming "a notes person"

### 3.2 Secondary persona — "The Note-Averse"
- Age 50+, or anyone less comfortable with structured digital tools
- Struggles to type long notes
- Comfortable with the camera and voice recording
- Needs the app to do the organizing for them

### 3.3 Anti-persona (not a target)
- Power users of Notion, Obsidian, Roam — they want structure and control, which is the opposite of this product.

---

## 4. Goals and Non-Goals

### 4.1 Goals (v1)
- Capture text, photo, or voice in ≤ 2 seconds from anywhere on the phone.
- Automatically classify each capture as reminder, todo, or memory.
- Extract dates, times, and locations from text and voice.
- Send a notification before a time-bound item's scheduled time.
- Send a single end-of-day digest of open todos and the day's memories.
- Keep all user data on the device by default.

### 4.2 Non-Goals (v1)
- Multi-device sync.
- Sharing or collaboration.
- Tags, folders, notebooks, or any user-imposed structure.
- Calendar integration (read or write).
- Web app or desktop app.
- Account creation, login, or email collection.

---

## 5. Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| D1 retention | ≥ 40% |
| D7 retention | ≥ 25% |
| D30 retention | ≥ 15% |
| Median captures per active user per day | ≥ 3 |
| End-of-day digest open rate | ≥ 50% |
| Reminder action rate (user taps notification) | ≥ 30% |
| App size on disk | ≤ 150 MB |
| Time from button tap to capture saved (p50) | ≤ 2 seconds |
| Crash-free sessions | ≥ 99.5% |

---

## 6. Platform and Technical Scope

### 6.1 Launch platform
- **Android only for v1.** Reason: iOS does not permit a system-wide floating button, which is the core UX. iOS support is a v2 conversation.

### 6.2 Minimum supported version
- Android 10 (API 29) and above.

### 6.3 Tech stack (recommended, to be confirmed by engineering)
- **Language:** Kotlin
- **UI:** Jetpack Compose
- **Local DB:** Room (SQLite under the hood)
- **Background work:** WorkManager + AlarmManager (for exact-time reminders)
- **On-device OCR:** ML Kit Text Recognition
- **On-device speech-to-text:** Android `SpeechRecognizer` (free, online) with optional offline Whisper-tiny fallback
- **On-device classification / date extraction:** Gemini Nano via `AICore` (where available) with a rules-based fallback for older devices
- **Encryption at rest:** SQLCipher or Android EncryptedFile, key stored in Android Keystore
- **Crash reporting:** Sentry, configured to scrub user content from breadcrumbs

### 6.4 Permissions required
- `SYSTEM_ALERT_WINDOW` — for the floating button
- `CAMERA` — for photo capture
- `RECORD_AUDIO` — for voice capture
- `POST_NOTIFICATIONS` — for reminders and digest
- `SCHEDULE_EXACT_ALARM` — for time-bound reminders
- `ACCESS_FINE_LOCATION` (optional, gated behind a feature toggle) — for future geofenced reminders, off by default

### 6.5 Offline behavior
- 100% of v1 functionality works offline.
- No network calls in v1 except optional crash reporting (which the user can disable in settings).

---

## 7. Functional Requirements

### 7.1 Onboarding (first launch)
- **FR-1.1** Single welcome screen explaining: one-tap capture, end-of-day reminders, data stays on your phone.
- **FR-1.2** Request `SYSTEM_ALERT_WINDOW` permission with an in-context explanation of why.
- **FR-1.3** Request notification permission.
- **FR-1.4** Ask the user to set their preferred end-of-day digest time (default: 8:00 PM, user-adjustable in 30-min increments).
- **FR-1.5** No account creation. No email. No login.

### 7.2 Floating capture button
- **FR-2.1** A persistent draggable floating bubble visible on top of all other apps once enabled.
- **FR-2.2** The bubble can be moved to any edge of the screen and snaps to the nearest edge.
- **FR-2.3** Tapping the bubble opens a compact capture sheet with three large buttons: **Photo**, **Voice**, **Text**.
- **FR-2.4** Long-pressing the bubble opens the full app.
- **FR-2.5** The user can hide the bubble via a quick-settings tile or a setting; hiding does not stop the digest.
- **FR-2.6** The bubble survives reboot (re-spawns on `BOOT_COMPLETED`).

### 7.3 Capture flows

#### 7.3.1 Photo capture
- **FR-3.1** Tapping **Photo** opens the camera in a single-shot mode (no gallery picker in the capture sheet).
- **FR-3.2** After the photo is taken, the user sees a 3-second confirmation toast ("Saved") and the capture sheet closes. No "save / discard / add details" dialog.
- **FR-3.3** OCR runs in the background on the photo. Extracted text is attached to the capture.
- **FR-3.4** If the OCR text contains a date/time, the classifier proposes a reminder (see 7.4).

#### 7.3.2 Voice capture
- **FR-3.5** Tapping **Voice** immediately starts recording with a visible waveform and a single **Stop** button.
- **FR-3.6** Max recording length: 2 minutes. After 2 minutes, recording auto-stops.
- **FR-3.7** On stop, the audio is transcribed on-device. Both the audio file and the transcript are saved.
- **FR-3.8** Confirmation toast. No edit step.

#### 7.3.3 Text capture
- **FR-3.9** Tapping **Text** opens a single multi-line text field with the keyboard already up.
- **FR-3.10** Submit via the keyboard's send action or a single **Save** button.

### 7.4 Auto-classification and extraction

For every capture, the app runs a classification step. Output structure:

```
{
  "type": "reminder" | "todo" | "memory",
  "when": ISO-8601 timestamp | null,
  "summary": "≤ 60-char one-line description"
}
```

- **FR-4.1** **`reminder`**: capture contains an explicit time AND/OR date in the future. A notification is scheduled.
- **FR-4.2** **`todo`**: capture implies an action to take but has no specific time. Rolled into the end-of-day digest.
- **FR-4.3** **`memory`**: capture is reference information with no action implied (e.g., a parking spot photo, a Wi-Fi password). Searchable but not surfaced.
- **FR-4.4** Classification runs on-device. If on-device AI is unavailable on the user's device, a rules-based fallback handles dates ("tomorrow at 5", "in 2 hours", "Friday 3pm") and a simple keyword classifier ("remind me", "don't forget" → reminder).
- **FR-4.5** The user can override the classification in the capture detail view (one tap to change type, edit the time).

### 7.5 Reminders
- **FR-5.1** Time-bound captures generate an exact-time notification, by default **15 minutes before** the extracted time.
- **FR-5.2** Lead time is configurable in settings (5, 10, 15, 30, 60 min).
- **FR-5.3** The notification shows the capture's summary and a thumbnail if it's a photo.
- **FR-5.4** Notification actions: **Done**, **Snooze 10 min**, **Open**.
- **FR-5.5** A reminder that is not acknowledged within 30 minutes after its trigger time is added to the next end-of-day digest as "missed."

### 7.6 End-of-day digest
- **FR-6.1** A single notification is delivered at the user's preferred digest time (default 8:00 PM).
- **FR-6.2** The digest contains:
  - A count of captures made today.
  - Open `todo`s from today, grouped at the top.
  - Missed reminders, if any.
  - A scrollable timeline of today's memories (read-only summaries).
- **FR-6.3** Tapping the digest opens the "Today" view inside the app.
- **FR-6.4** If the user has zero captures that day, no digest is sent (avoid empty noise).

### 7.7 Browse and search
- **FR-7.1** "Today" view: vertical list of today's captures in reverse chronological order.
- **FR-7.2** "All" view: grouped by day, infinite scroll backward.
- **FR-7.3** Full-text search across capture summaries, OCR text, and voice transcripts.
- **FR-7.4** Each capture detail view shows the original media, transcript/OCR text, classified type, time (if any), and lets the user edit type/time, delete, or share.

### 7.8 Settings
- **FR-8.1** Toggle floating bubble on/off.
- **FR-8.2** Digest time picker.
- **FR-8.3** Reminder lead-time picker.
- **FR-8.4** Export all data as a ZIP (JSON + media files) to a user-chosen location.
- **FR-8.5** Delete all data with a two-step confirmation.
- **FR-8.6** Crash reporting toggle (default: ON, with a plain-language note about what is and isn't sent).
- **FR-8.7** "What gets sent where" screen — explicitly lists every network call the app can make.

---

## 8. Non-Functional Requirements

### 8.1 Performance
- **NFR-1** Capture button tap → capture sheet visible: ≤ 200 ms.
- **NFR-2** Photo capture → "Saved" toast: ≤ 2 s.
- **NFR-3** OCR / transcription / classification run async; never block the capture confirmation.
- **NFR-4** App cold start to "Today" view: ≤ 1.5 s on a mid-tier 2022 Android device.

### 8.2 Privacy and security
- **NFR-5** All user content (text, transcripts, OCR output, media) is stored encrypted at rest using a key in the Android Keystore.
- **NFR-6** No user content is transmitted off-device in v1.
- **NFR-7** Crash reports must not contain user content. Capture IDs may be sent; capture contents may not.
- **NFR-8** App must function with no network connectivity.
- **NFR-9** Uninstalling the app removes all data (no cloud residue, because there is no cloud).

### 8.3 Reliability
- **NFR-10** Crash-free session rate ≥ 99.5%.
- **NFR-11** No capture is ever lost: writes are committed to disk before the confirmation toast is shown.
- **NFR-12** Scheduled reminders survive reboot and app kill.

### 8.4 Accessibility
- **NFR-13** Meet WCAG 2.1 AA for color contrast.
- **NFR-14** All actions reachable via TalkBack.
- **NFR-15** Dynamic type support up to 200%.
- **NFR-16** Voice capture is a first-class path so users who struggle to type are fully supported.

### 8.5 Battery
- **NFR-17** Background battery usage under typical use (10 captures/day) ≤ 2% of daily battery on a reference device.

---

## 9. Data Model (logical)

```
Capture
  id: UUID
  created_at: timestamp
  type: enum(reminder, todo, memory)
  source: enum(photo, voice, text)
  summary: string (≤ 60 chars, AI-generated)
  body_text: string | null            // text capture, OCR output, or transcript
  media_path: string | null           // local encrypted file path
  scheduled_at: timestamp | null      // for reminders
  reminder_lead_min: int | null
  reminder_state: enum(pending, fired, acknowledged, snoozed, missed) | null
  user_edited: bool
  deleted_at: timestamp | null        // soft delete, purged after 30 days

DigestLog
  id: UUID
  digest_date: date
  sent_at: timestamp
  capture_count: int
  opened: bool
```

No user table. No accounts.

---

## 10. UX Principles

1. **Capture must never ask a question.** If the app needs to know something, it asks later or guesses and lets the user correct.
2. **No empty states that scold.** First-time views explain the value, not the missing data.
3. **Defaults over settings.** Every screen ships with sensible defaults; advanced users can tweak in Settings.
4. **One primary action per screen.** No screen has two equally-weighted buttons.
5. **Text never wraps past two lines on the home view.** Long captures truncate with "..." and expand on tap.

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Android restricts `SYSTEM_ALERT_WINDOW` further | Medium | High | Provide a fallback Quick Settings tile + Share Sheet target |
| On-device AI quality is poor on older phones | High | Medium | Rules-based fallback for date extraction; degraded but functional |
| Users don't trust "data stays on your phone" claim | Medium | High | Open-source the app; publish a third-party audit; in-app "What gets sent where" screen |
| Battery drain from floating service | Medium | High | Service is lightweight; profile aggressively; allow bubble disable |
| Name collision with existing "Resumind" resume app | High | Medium | Resolve before launch — rename if app-store search shows confusion |
| Notification fatigue from digest + reminders | Medium | Medium | Suppress empty digests; combine same-minute reminders; in-app rate limit |

---

## 12. Open Questions

1. **Name.** ResuMind has a known collision with an AI résumé tool and reads as "résumé + mind" to most people. Decide before public listing.
2. **Cloud LLM opt-in.** Should a v1.1 add an opt-in cloud summary using a zero-data-retention provider for users on devices without on-device AI?
3. **Pricing model.** Free with a one-time unlock for export and lead-time customization? Fully free with donations? Subscription is probably wrong for this audience.
4. **iOS strategy.** Accept that the iOS version is a different, weaker product (no floating button → Lock Screen widget + Share Sheet + Shortcuts)? Or wait for an iOS API change?
5. **Geofenced reminders.** v2 or never?

---

## 13. Release Plan

### 13.1 Milestones

| Milestone | Scope | Target |
|---|---|---|
| M0 — Tech spike | Validate floating bubble, on-device classification quality | Week 2 |
| M1 — Capture only | Bubble + 3 capture types + local storage + Today view | Week 5 |
| M2 — Intelligence | OCR, transcription, classification, date extraction | Week 8 |
| M3 — Reminders | Scheduled notifications, snooze, missed handling | Week 10 |
| M4 — Digest + Settings | End-of-day digest, export, privacy screen | Week 12 |
| M5 — Polish + closed beta | Accessibility, perf, crash hardening | Week 14 |
| M6 — Public launch | Play Store release | Week 16 |

### 13.2 Definition of done (v1)
- All Functional Requirements in section 7 implemented.
- All NFRs in section 8 met on reference device (Pixel 6a or equivalent).
- Crash-free sessions ≥ 99.5% in closed beta for two consecutive weeks.
- Privacy policy + "What gets sent where" screen live.
- Play Store listing approved.

---

## 14. Out of Scope (explicit)

- Cloud sync, backup to your own server, account system.
- Sharing captures with other users.
- Calendar / email / third-party app integrations.
- Web app, desktop app, watch app.
- Tags, folders, search filters beyond plain text.
- Multi-language UI (English only at launch; localization is a fast-follow).

---

## 15. Glossary

- **Capture** — a single unit of saved content (photo, voice, or text).
- **Digest** — the end-of-day summary notification.
- **Bubble** — the floating capture button overlay.
- **Reminder** — a capture with a scheduled future notification.
- **Todo** — an actionable capture with no specific time.
- **Memory** — a reference capture with no action implied.
