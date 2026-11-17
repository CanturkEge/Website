# Study Rift · v0.2.0

A standalone Turkish study dungeon RPG served at `/study-rift/` by the existing GitHub Pages site. The website homepage is unchanged.

## Current game

- Mandatory username/password accounts. Email is optional, only for recovery. New Study Rift accounts do not require email confirmation; other apps' Auth configuration is unchanged.
- Choose a permanent class: **Rün Bilgesi**, **Rift Muhafızı**, or **Gölge Gezgin**. Each has **15 branched nodes** and a unique starting ability. Root is free; each subsequent level gives 2 points. All 45 node effects are connected to the engine.
- Class-specific actions include correct matching pairs (Kehanet), a single reward-free correction (İkinci Şans), conversion of HP to MP, shields, evasion, and a risky XP wager.
- **89 catalog items**: 17 original items and 72 combinations of 18 equipment families × 4 rarities. Gear has actual stat differences; some open abilities. Topic-specific cheat sheets unlock notes and give limited free hints.
- Rank-weighted loot excludes currently owned equipment and prefers families outside the last four drops. No selected-rarity candidates → another allowed rarity; no eligible equipment left → consumable + essence. D+ rank has a quality guarantee after 5 drops (3 with the appropriate Ranger node). Consumables stack. Salvaged items may become eligible again; there is no claim of an infinite unique catalog.
- Five ranks use **difficulty 1–5**, eight distinct questions per run, with the final two drawn from the next tier (capped at 5). Weighted shuffle bags prefer unseen/weak material without repeating a difficulty pool until exhausted. MC choices are shuffled and persisted for the run; matching layouts stay stable.
- Training has topic, format, difficulty and wrong-answer filters. First daily correct answer per question gives limited XP; the daily unique-question task gives an extra reward.
- Separate course question pools, mastery, mistakes, bonus notes, personal notebooks and history. Character XP and equipment are shared across courses.
- OOD is open. Database Management, Operating Systems, Digital Logic Design and Modeling & Discrete Simulation are currently locked. Each course has its own realm title, topics and scene color treatment.
- Animated startup, portal-entry transition, loot reveal, reduced-motion support, responsive layouts.

## Content and adding courses

**84 original OOD sample questions, including 48 additional application/analysis/advanced/mastery scenarios. No professor slides have been imported.** Every question displays its source status. High-tier distractors distinguish closely related concepts, rather than just asking for definitions.

`courses.js` is the course registry. `game-data.js` combines catalog data. Add a course entry with a unique ID, topics, realm, theme and lock status. Add source-backed question objects with that `course` ID, globally unique question IDs, topic index, difficulty 1–5, type `mc`/`tf`/`match`, options, answer, explanation, hint, and source filename/slide. MC/TF answers are integer indices; matching answers are parallel arrays of right-side labels. Add the course's notes and course-tagged cheat sheets.

Leave a course locked until its content is ready. At least 8 questions per difficulty is the minimum engine/test requirement; larger, balanced topic/format banks are preferable. The client doesn't upload or parse slides and does not call an AI service. The assistant can import reviewed slide content through repository changes.

## Identity and saved progress

`study_rift_profiles` maps lowercase, unique usernames to Supabase Auth UUIDs. Normal clients can SELECT only their own profile and cannot create or rename usernames directly. The `study-rift-auth` Edge Function implements registration, login, username claims for old email accounts and recovery initiation. It checks credentials with Supabase Auth and returns a native session; passwords are never saved in application tables or browser storage by app code. SDK session storage contains session tokens, not passwords.

For username-only signup, Auth receives a random internal `@rift.invalid` alias. With optional recovery email, Auth uses that address. New users are created with `email_confirm: true` for this application's explicit no-confirmation flow. No project-wide email confirmation setting was disabled. Password reset email depends on the project's existing SMTP and allowed-redirect settings; receipt/redirect has not been verified with a real mailbox. Existing email accounts can sign in via the legacy entry and claim a username without losing their UUID or saves.

The public function has `verify_jwt: false` because signup/signin have no session yet; its body authenticates login via password and validates an existing JWT for username claims. CORS is restricted; database-backed IP/action and username/action counters throttle attempts. The counters are service-role-only. Function source imports a pinned SDK; service-role credentials exist only in Edge runtime environment variables. Never put them into client config.

`study_rift_saves` uses owner-only RLS and optimistic revisions. Saves are serialized; conflicts stop overwrites. Local unsynced copies trigger recovery choices. Prior v0.1 XP, inventory and notebooks are migrated; class selection is re-opened and old skill points are refunded into the new rules. The mandatory login gate doesn't erase prior local guest data: a new account may import it once.

`schema.sql` documents the initial table; `auth-v2.sql` documents the deployed username/counter migration. Do not rerun them against already-provisioned production tables. The hosted migration has already been applied.

## Checks

```sh
cd study-rift
npm ci --ignore-scripts
npm test
npm run build:vendor  # only after changing SDK inputs
```

No frontend build is required. Commit the vendored SDK and lockfile, not `node_modules`. Tests cover all 5 tiers, 15 nodes/class, old-save migration, course locks, no-repeat decks, correct shuffled answer handling, reward idempotency, loot rarity/uniqueness/pity, class prerequisites, unique class actions, training rewards, shop and salvage.

Backend integration was tested with a disposable account: signup without email, username login, duplicate/wrong-password rejection, own-profile visibility, save creation/readback and stale revision rejection. The test session was signed out and the disposable account removed. Browser QA checks the login gate and registration form; an isolated preview-only character fixture tests class selection, branches, realms and combat without using user credentials. QA fixture files are never shipped.
