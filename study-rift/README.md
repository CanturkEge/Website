# Study Rift · v0.1.0

Standalone, buildless Turkish study dungeon RPG at `/study-rift/`. No homepage links or unrelated files changed. Hosted by the existing GitHub Pages pipeline.

## Implemented

- 5 rank-gated dungeons; 8 unique questions per run; harder final two boss rooms.
- HP/MP, per-question abilities, correct-answer mana regeneration, combos, XP, levels, gold.
- Character equipment: weapon, armor, relic, cheat sheet. 17 items across 4 rarities.
- Weighted dungeon loot, a bonus note guaranteed after the first win, permanent inventory. Cheating prevention is not a goal: this is a personal study tool, not an authoritative competitive game.
- Three skill paths with prerequisites and one point per level. Paths can be mixed.
- Topic-specific cheat sheets unlock bonus notes and grant limited free hints while equipped.
- Safe training with topic/type/mistake filters; free hints; first daily correct answer per unique question gives XP; daily 5-question reward.
- Multiple choice, true/false, matching, code blocks, explanations, mistake notebook, personal notes, topic mastery, run history.
- Camp potion shop, optional audio, responsive layout and keyboard-accessible buttons.
- Supabase email/password accounts, auto-refreshed sessions, private owner-only save rows, optimistic revision checking, serialized saves, local fallback, offline-recovery choice. Supabase SDK is vendored: no third-party runtime JavaScript CDN dependency. Fonts have system fallbacks.

## Content status

**36 manually authored OOD sample questions; not sourced from the professor's slides.** `source` is displayed on every question. The uploaded screenshot was used as a brief, not a question source. Actual slides are still pending.

`data.js` contains `QUESTIONS` and `BONUS_NOTES`. Each question has: stable `id`, topic index, difficulty 1–3, type `mc`/`tf`/`match`, prompt, options, answer, explanation, conceptual hint, optional code, source. For `match`, answer is a same-length array of matching right-hand labels. For other types, answer is an integer option index.

When importing slides: author source-backed questions, include filename + slide number in `source`, keep stable IDs for unchanged content, retain coverage of difficulty tiers, and rerun tests. `makeQueue` expects at least 8 candidates across the regular/boss tiers, including at least 6 in each primary tier used by a dungeon. Do not silently relabel examples as slide-derived.

## Backend

Uses the existing active Supabase project, in one isolated `public.study_rift_saves` table. No other app's schema or auth configuration was changed. `config.js` includes only a publishable browser key; never add service-role keys. Auth data remains in Supabase Auth. RLS restricts SELECT, INSERT and UPDATE to `auth.uid() = user_id`; anonymous table access is revoked. `schema.sql` documents the deployed migration. Do not rerun it against the already-provisioned database.

Only new accounts without a cloud record import the local guest save. Existing accounts load their own cloud record. Unsynced local copies trigger an explicit recovery choice; a differing remote revision blocks a write instead of silently overwriting another device. Local copies are keyed by account ID. Sign-in and email confirmation settings follow existing project configuration. If email verification is required, verify from email and then sign in on this page. No account, SMTP, or verification settings were weakened.

## Local checks and deployment

```sh
cd study-rift
npm ci --ignore-scripts
npm test
npm run build:vendor # only needed after changing SDK/dependency inputs
```

Serve this directory with any static HTTP server; no frontend build is required. Commit `vendor/supabase.js` and the lockfile. Do not commit `node_modules`.

Tests cover valid question coverage/answers, unique difficulty-scaled queues, duplicate submission, mana/damage, death/revival, guaranteed first-clear loot, reward idempotency, equipment constraints, training XP limits and skill prerequisites. Browser QA covers a complete dungeon including matching, hints, healing, reload persistence, loot, equipment, skills and training. Database RLS isolation was tested transactionally with rollback.

Limitations: initial examples only; no slide upload/parser/AI generator in the website; no PvP/leaderboards; no server-authoritative economy; no password recovery UI yet. Real email registration depends on existing Supabase email delivery settings.
