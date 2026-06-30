# Bug Report — learn-mandarin (MandarinSRS)

Reviewed: React 19 + TypeScript + Vite + Dexie SRS flashcard app.
`tsc -b` passes; `oxlint` reports 2 exhaustive-deps warnings. The bugs below are
behavioral/logic issues found by reading the source.

---

## Critical

### 1. Dark mode is completely broken (Tailwind v4 not configured for class-based dark mode)
- **Files:** `src/index.css`, `src/pages/SettingsPage.tsx:11-15`
- The dark-mode toggle does `document.documentElement.classList.toggle('dark', next)`,
  and the whole UI uses `dark:` variants. But Tailwind v4 defaults `dark:` to
  `@media (prefers-color-scheme: dark)`. Class-based dark mode requires
  `@custom-variant dark (&:where(.dark, .dark *));` in `index.css` — which is **absent**.
- **Result:** Toggling the switch adds a `.dark` class that Tailwind ignores. Dark mode
  follows only the OS setting; the in-app toggle does nothing visible.
- **Fix:** Add `@custom-variant dark (&:where(.dark, .dark *));` to `index.css`.

### 2. Dark-mode preference doesn't persist across reloads
- **Files:** `src/stores/settingsStore.ts`, `src/main.tsx` / `src/components/layout/Layout.tsx`
- `darkMode` is persisted in localStorage, but **nothing applies the `.dark` class on app
  startup**. The only code that sets the class is the Settings toggle handler.
- **Result:** Even after fixing #1, a user who enables dark mode sees it revert on every
  reload until they revisit Settings and toggle twice.
- **Fix:** On startup (e.g. in `main.tsx` or an effect in `AppInner`), read
  `useSettingsStore.getState().darkMode` and set
  `document.documentElement.classList.toggle('dark', darkMode)`.

---

## High

### 3. Session stats double-count the final card
- **File:** `src/pages/StudyPage.tsx:94, 102-111`
- `recordResult(quality >= 2)` already increments `correctCount`/`againCount` in the store.
  Then when saving the session, the code re-reads those counts and adds the current card
  **again**:
  ```
  cardsStudied: getState().correctCount + getState().againCount + 1
  correctCount: getState().correctCount + (quality >= 2 ? 1 : 0)
  againCount:   getState().againCount   + (quality < 2 ? 1 : 0)
  ```
- **Result:** Every saved session over-counts by 1 (cards studied, and whichever of
  correct/again the last rating was). Streaks/history are inflated.
- **Fix:** Since `recordResult` already counted this card, save the store values directly
  without the extra `+1` / `+ (quality...)`.

### 4. "Again" requeue mutates Zustand state in place
- **File:** `src/pages/StudyPage.tsx:97-100`
- `queue.push(updatedItem)` mutates the store's array directly without going through a
  setter. Zustand subscribers aren't notified, and it violates React/immutability rules
  (especially under StrictMode). It currently "works" only because `advance()` happens to
  trigger a re-render that reads the mutated array.
- **Fix:** Add a `requeue`/`setQueue` action in `studyStore.ts` that returns a new array,
  and call it instead of mutating.

### 5. "Again" interval preview is wrong for review cards
- **Files:** `src/lib/srs.ts:51-61` and `previewIntervals` (89-110)
- On a lapse, `computeSM2` returns `interval: 1` but schedules `nextReview` ~1 minute out
  (`addMinutes(now, LEARNING_STEPS[0])`, state `relearning`). `previewIntervals` decides
  "learning step vs days" by checking `out.interval === 0`; since it's `1`, the **Again**
  button shows **"1d"** even though the card actually returns in ~1 minute.
- **Fix:** Return `interval: 0` on the lapse path (consistent with the learning-step
  paths), or have `previewIntervals` key off `state`/`nextReview` instead of `interval`.

---

## Medium

### 6. "New cards/day" and "Max reviews/day" are per-session, not per-day
- **Files:** `src/hooks/useStudyQueue.ts:31-37, 24-29`
- The queue caps new cards at `newCardsPerDay` and reviews at `maxReviewsPerDay` **per
  queue build**. Nothing tracks how many new/review cards were already introduced earlier
  today. Clicking "Study More" or re-entering the deck hands out another full batch.
- **Result:** A user can blow far past their daily new-card limit by restarting sessions.
- **Fix:** Count cards already introduced/reviewed today (e.g. from `reviewLog` or
  `srsState.lastReview`) and subtract from the daily allowance.

### 7. Streak shows 0 for the whole day until you study
- **File:** `src/hooks/useDeckStats.ts:39-57`
- `useStreakDays` starts `checkDate` at today and breaks if the newest session isn't today.
  So a user with a 30-day streak sees **"0 day streak"** all day until they complete a
  session, instead of the streak carrying over from yesterday until midnight.
- **Fix:** If there's no session today but there is one yesterday, start counting from
  yesterday (keep the streak "alive" for the current day).

### 8. Backup export/import omits `reviewLog`
- **File:** `src/pages/SettingsPage.tsx:17-52`
- `exportData` saves `cards`, `srsState`, `decks`, `sessions` but **not** `reviewLog`.
  `importData` likewise clears/restores only those four tables.
- **Result:** Review history is silently lost on backup/restore. "Overwrite your existing
  progress" leaves the old `reviewLog` rows behind (now orphaned/inconsistent).
- **Fix:** Include `reviewLog` in both export and the import transaction.

### 9. Import has no validation / error handling
- **File:** `src/pages/SettingsPage.tsx:33-52`
- `JSON.parse(text)` and `bulkAdd(data.cards ?? [])` run with no schema check or
  try/catch. A malformed or unrelated JSON file throws an uncaught error (or corrupts the
  DB) after the user already confirmed the destructive overwrite. Also, the confirm dialog
  appears **after** the file is read but the clear happens regardless once confirmed.
- **Fix:** Wrap in try/catch, validate the shape before clearing tables, and surface a
  user-facing error.

---

## Low / Minor

### 10. New-card count display is misleading
- **Files:** `src/hooks/useDeckStats.ts:21-25`, `src/components/dashboard/DeckCard.tsx`
- `newCount` counts **all** new cards in the deck (e.g. 150 for HSK-1), but only
  `newCardsPerDay` (20) will actually be studied. The dashboard shows "150 new" which
  overstates today's workload.

### 11. `useTTS().speak` isn't memoized → effects re-bind every render
- **Files:** `src/hooks/useTTS.ts:22-24`, `src/pages/StudyPage.tsx:40-46, 119-138`
- `speak` is a fresh function each render. The keyboard-shortcut effect and auto-play
  effect depend on it (or omit it, per the oxlint warnings), causing unnecessary
  listener re-binds / stale-dep warnings. Wrap `speak` in `useCallback`.

### 12. TTS init can resolve without a usable voice
- **File:** `src/lib/tts.ts:14-31`
- If `getVoices()` is empty and `voiceschanged` never fires, the 3s fallback `resolve()`s
  but `initialized` stays `false`, so `speak()` silently no-ops forever. Consider setting
  `initialized = true` in the fallback (so a later `setVoice` works) or retrying.

### 13. `parsePinyin` comment vs. behavior mismatch
- **File:** `src/lib/pinyin.ts:24`
- Comment claims it preserves "punctuation attached to words," but it only splits on
  whitespace and never handles hyphens or trailing punctuation as described. Cosmetic, but
  punctuation (e.g. "nǐ.") gets the syllable's tone color applied to the period.

### 14. StrictMode double-invokes queue build
- **File:** `src/pages/StudyPage.tsx:29-35`
- The mount effect's cleanup calls `reset()`, and under StrictMode the effect runs twice,
  so `buildQueue()` fires twice and the first queue is reset before the second build.
  Harmless today but wasteful and fragile; guard with a ref or accept the dep warnings
  intentionally.

### 15. Toggles use `<div onClick>` inside `<label>` — not keyboard accessible
- **Files:** `src/pages/DecksPage.tsx:28-36`, `src/pages/SettingsPage.tsx:84-90`
- The active/auto-play switches are clickable `<div>`s, not real checkboxes/buttons. They
  can't be toggled via keyboard and aren't announced to screen readers. In `DecksPage` the
  `<div>` is also nested in a `<label>`, so a click can fire the handler twice.
