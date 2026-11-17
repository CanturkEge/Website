# Study Rift · v0.4.0

A standalone Turkish study dungeon RPG served at `/study-rift/` by the existing GitHub Pages site. The website homepage is unchanged.

## Current game

- Mandatory username/password accounts. Email is optional, only for recovery. New Study Rift accounts do not require email confirmation; other apps' Auth configuration is unchanged.
- Choose a permanent class: **Rün Bilgesi**, **Rift Muhafızı**, or **Gölge Gezgin**. Each has **16 branched nodes** and a unique starting ability. Root is free; each subsequent level gives 2 points. All 48 node effects are connected to the engine.
- Class-specific actions include correct matching pairs (Kehanet), a single reward-free correction (İkinci Şans), conversion of HP to MP, shields, evasion, and a risky XP wager.
- **89 catalog items**: 17 original items and 72 combinations of 18 equipment families × 4 rarities. Gear has actual stat differences; some open abilities. Topic-specific cheat sheets unlock notes and give limited free hints.
- Rank-weighted loot excludes currently owned equipment and prefers families outside the last four drops. No selected-rarity candidates → another allowed rarity; no eligible equipment left → consumable + essence. D+ rank has a quality guarantee after 5 drops (3 with the appropriate Ranger node). Consumables stack. Salvaged items may become eligible again; there is no claim of an infinite unique catalog.
- Five ranks use **difficulty 1–5**, eight separate room exams and 23 distinct questions per new run; the final two rooms use the next tier (capped at 5). Room formats prefer variety and unseen/weak material. A bipartite assignment reserves scarce formats while keeping every question inside its room’s allowed formats. No question repeats within a new run. MC choices are shuffled and persisted for the run; matching layouts stay stable.
- Training has topic, format, difficulty and wrong-answer filters. First daily correct answer per question gives limited XP. An explicitly started five-minute mission requires five unique correct answers and rewards 35 gold + one HP potion once per day. Expired missions can retry without resetting the daily question-XP ledger.
- Separate course question pools, mastery, mistakes, bonus notes, personal notebooks and history. Character XP and equipment are shared across courses.
- OOD is open. Database Management, Operating Systems, Digital Logic Design and Modeling & Discrete Simulation are currently locked. Each course has its own realm title, topics and scene color treatment.
- Animated startup, portal-entry transition, loot reveal, reduced-motion support, responsive layouts.

## Content and adding courses

**168 original OOD sample questions across six formats, including 84 new multi-select, sequence-ordering and short-answer questions. No professor OOD slides have been imported.** Every question displays its source status. High-tier distractors distinguish closely related concepts, rather than just asking for definitions.

`courses.js` is the course registry. `game-data.js` combines catalog data. Add a course entry with a unique ID, topics, realm, theme and lock status. Add source-backed question objects with that `course` ID, globally unique question IDs, topic index, difficulty 1–5, type `mc`/`tf`/`match`/`multi`/`order`/`short`, options, answer, explanation, hint, and source filename/slide. MC/TF answers are integer indices; matching answers are parallel arrays of right-side labels; multi answers are an exact set of integer indices; order answers are the ordered labels; short answers are a nonempty array of accepted string aliases. Add the course's notes and course-tagged cheat sheets.

Leave a course locked until its content is ready. New-room exams need 16 distinct regular-tier questions and 7 boss-tier questions; S-rank needs 23 distinct tier-5 questions. The per-room format constraints in `rooms.js` must also be satisfiable; keep a balanced format pool and leave courses locked until ready. The client doesn't upload or parse slides and does not call an AI service. The assistant can import reviewed slide content through repository changes.

## Modeling course (v0.6)

The `simulation` realm is unlocked with **220 questions, 11 topics, 36 lessons, 108 explanation sections, 72 flashcards, 72 lesson-scoped mini checks and 12 equippable cheat sheets**. The OOD pool remains 168; total questions are 388. Question IDs are stable `sim-CC-NN`, with 20/chapter and 44/difficulty. All six formats and all five room-exam tiers are covered. Numerical questions state units, assumptions and rounding; explanations work through calculations. Mini checks test their own lesson's concepts, separately from the dungeon pool.

`simulation-sources.js` indexes the professor's uploaded two-slides-per-page Subject1–11 PDFs, with one-based PDF page references on questions/lessons. The six-slides-per-page ZIP duplicates the source content and is not counted twice. `simulation-questions.js`, `simulation-learning.js`, `simulation-checks.js` and `simulation-loot.js` hold original adapted content; full source PDFs are not redistributed. Corrections/notation clarifications cover geometric support, normal/Weibull parameterization, Box–Muller and test-decision interpretations.

All course progression/notebooks, random decks, market notes and mastery exams use the existing course-scoped mechanisms. Shared character gear/XP/gold remain shared. Modeling has its own dungeon and room presentation names. Skill-independent daily mastery must deploy the updated `bank.json` and shared `question-utils.js`; existing frozen OOD exams are preserved. No schema change is needed.

Numeric short questions optionally carry private `numeric:{value,tolerance,units}` grading metadata and public `answerFormat` instructions. The strict parser accepts a finite decimal (comma/dot), scientific notation or a simple fraction with an explicitly allowed unit. It rejects expressions, unknown units, infinities and division by zero. It performs no implicit unit conversion. Public questions never expose the private numeric value. Text answers retain accent/case normalization.

The form-input regression came from delegating all `[data-page]` ancestors after adding `body.dataset.page`: clicking inputs found `body` and rerendered the page. Delegation now selects only actionable links/buttons. Browser verification uses actual click then focused keyboard entry and submit, which reproduces the original failure; locator-fill alone would miss it.

## Lobby, navigation and market

Successful login opens the main lobby. Course previews change scenery without changing the active course or its progress. Entering the current course preserves an active run. Other courses remain locked until reviewed content is ready. `realm-art.js` provides distinct local SVG scenes and `courses.js` defines palettes/atmospheres. `navigation.js` groups pages into collapsible folders; account settings persist group preferences.

`market.js` defines deterministic course/day stock, fixed-price consumables, once-daily bundles, quotes and upgrade plans. Istanbul calendar dates rotate stock at midnight. The OOD counter has 11 daily gear/cheat-sheet offers plus two unlimited potions. Stock is stable across purchases, owned gear cannot be repurchased, and a per-course/day ledger prevents buying the same offer again after salvage. Search, categories, sorting, affordability, bulk quantities and actual equipment comparisons are client UI features. Confirmation revalidates level, inventory, daily limit, balance and run status before mutation. Market browsing is allowed during a run; trading, upgrades and salvage require ending it.

Weapon/armor/relic upgrades cost gold + essence, require character levels 2/4/6 and cap at +3. Each step adds weapon +2 XP/correct, armor +8 max HP/+1 defense or relic +8 max MP; bonuses apply only when equipped. Salvaging requires confirmation, protects equipped items, grants the rarity value plus 5 essence/upgrade and removes that item's upgrade record. This does not affect the skill-independent daily leaderboard. State v5 adds market/upgrades and normalizes v4 saves without resetting progress. Currency and campaign progression retain the existing owner-editable game-save trust model; this market is not a server-authoritative economy.

## Rooms and daily mastery

Each new dungeon has eight room exams with 2/3/3/2/3/3/3/4 questions. Three rooms are untimed; the other five have 150/210/180/240/300 seconds. Opening a room creates one absolute deadline, persisted in the save. Feedback remains in the same room; next-question advances internally, and only a completed room report can return to the map. The final timely answer stops the clock before feedback reading. Expiry ends the run; death/expiry requires a same-rank restart from room one. Once-per-run death/second-chance abilities do not reverse a time expiry. v0.3 active runs migrate to their original eight single-question untimed rooms without lost progress.

Wrong-answer HP base is `34 + 8 × question difficulty + 5 × rank index`, with +8 for elite and +12 for bosses before defenses. Mana's base correct-answer regeneration is now 3, plus actual class/gear/node bonuses. Wrong answers drain 8/10/12/14/16 MP by rank, bounded at zero. Skill-use limits persist across a room's questions; new rooms refresh them. Training and learning controls have no HP/MP cost.

The **Ustalık tablosu** is independent of game XP and equipment. The authenticated `study-rift-mastery` function creates one frozen set per course per Istanbul calendar day: 2 questions from each difficulty, 10 total, maximum 200 points. Correct answers award 10/15/20/25/30 by difficulty. Every new attempt has ten minutes, validated on the server. Reopening resumes the same deadline. Expiry finalizes the existing score, with unsubmitted questions counted as blank; the review includes default unanswered results. No speed, class, skill, hints or XP bonus is used. Equal score and correct count share a dense rank. One attempt per user/day/course resumes from its saved cursor. The board shows up to 100 completed results using canonical display names only; the login-handle line is hidden. Scores and rank are unchanged.

`study_rift_exams` and `study_rift_attempts` are service-role-only tables with RLS and revoked client grants. Each request validates the JWT and profile. The server checks answers against the private frozen set, ignores client-supplied scores and conditionally advances the cursor to reject duplicate/racing submissions. Active question responses omit answer keys and hints; matching questions expose shuffled candidates without their mapping. Feedback releases the answered solution. This is a learning leaderboard; the downloadable study question bank is public and it is not a proctored examination.

After question edits, run `npm run build:bank` and redeploy **study-rift-mastery** with `index.ts`, `question-utils.js` and `bank.json`. Only reviewed, ready course content should be deployed; locked course content is currently absent from the bank. `ranking-v3.sql` documents the already-applied hosted migration. Never expose service-role keys in client code.

## Guided learning

`learning.js` contains six OOD units, three sublessons each, 54 explanation sections, 36 flash cards and 36 optional mini checks. Unit/lesson identifiers are course-scoped. The reader opens explanations first; flash cards and checks use separate, explicitly selected tabs. Read completion is manual and does not require a quiz score. Saved progress includes read lessons, known/review cards, check answers and last lesson. It does not award game XP or leaderboard points. Modeling is separately authored from the supplied Subject1–11 slides; other locked courses still need their own content. No course borrows another course's lessons.

## Account management

`study_rift_profiles.display_name` is the canonical visible name; `username` remains the immutable login identifier. Only the authenticated `study-rift-account` function can rename/delete, and supplied target UUIDs are ignored. Renaming updates the profile without changing attempt keys, scores or tie ordering. The board resolves current names on every fetch.

Deletion rechecks the current password, requires the literal `SİL`, and removes Study Rift progress/profile/attempts. Username-only internal aliases are signed out globally and deleted through Auth, cascading app records. Email identities may be shared by other apps: only Study Rift membership/data and the current session are removed; their shared Auth identity and other apps are preserved. Save RLS additionally requires an existing Rift profile, blocking stale-token save recreation after membership deletion. The service-only SECURITY INVOKER `study_rift_delete_profile` handles shared membership removal atomically. Client cleanup removes this account's cached saves and local session. It never deletes other cached account prefixes.

`account-timers-v4.sql` documents the applied hosted migration. It adds display names/deadlines, tightens save RLS and provides the service-only deletion helper. Previously running daily attempts received a fresh ten-minute deadline at migration; completed results were preserved.

## Version history

`releases.js` is the app's version and release-note source. Use three independent integer components: major.minor.patch. New features increment minor; compatible fixes increment patch; breaking releases increment major. There is no carry at ten: `0.3.9 → 0.3.10` and `1.20.0` are valid. Update package metadata and the release entry together. The Yama Notları page sorts components numerically and shows prior releases. `CHANGELOG.md` provides the same history in the repository.

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
npm run build:bank    # after editing questions or shared grading
npm test
npm run build:vendor  # only after changing SDK inputs
```

No frontend build is required. Commit the vendored SDK and lockfile, not `node_modules`. Tests cover all 5 tiers, 16 nodes/class, old-save migration, course locks, no-repeat decks, correct shuffled answer handling, reward idempotency, loot rarity/uniqueness/pity, class prerequisites, unique class actions, training rewards, shop and salvage.

Backend integration was tested with a disposable account: signup without email, username login, duplicate/wrong-password rejection, own-profile visibility, save creation/readback and stale revision rejection. The test session was signed out and the disposable account removed. Browser QA checks the login gate and registration form; an isolated preview-only character fixture tests class selection, branches, realms and combat without using user credentials. QA fixture files are never shipped.

Version 0.3 checks additionally cover all six formats, exact multi-selection, canonical short aliases, shuffled multi answer mapping, room locks, fatal damage/restart, defensive passives, numeric versions and server bank consistency. Live backend tests used two disposable accounts: identical daily questions, both 200/200 despite forged XP/class/equipment inputs, equal rank, foreign-attempt and anonymous rejection, duplicate submission rejection and one attempt per day. Sessions were signed out and both accounts removed. No professor OOD slides have been imported.

Version 0.4 adds regression checks for room exam progression, clock persistence/expiry, stopping the clock on final answer, v0.3 run migration, mana loss/regeneration, timed daily mission retries/reward idempotency and course-scoped learning progress. UI QA uses isolated preview fixtures; live backend tests use disposable accounts to verify server deadlines, rename-without-rerank, password rechecks, account deletion, leaderboard removal and stale-token denial.

Version 0.5 adds eight engine regression checks for daily stock/limits, bulk and bundle accounting, purchase atomicity, level gates, forge costs/caps/equipped effects, salvage, active-run restrictions and v4 save migration. Isolated browser fixtures verify the lobby, locked-world previews, grouped navigation, market transactions and receipts, local persistence, forging, mobile layout and display-name-only leaderboard rows.

Version 0.6 adds six regression checks for Modeling coverage/source references, numeric grading and public-payload privacy, room allocation/full clears at every tier, course-separated learning progress, and functional course-scoped cheat sheets. Browser fixtures exercise text and numeric answer clicks/submission, the new realm, its learning path, mini checks, flashcards, equipment reference content and mobile widths.
