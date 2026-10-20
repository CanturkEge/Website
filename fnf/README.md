# Farms & Fields (FNF)

Independent, static browser game shell at `https://egecanturk.dev/fnf/` in the same GitHub Pages repository as the D&D site. It has its **own** Supabase project, auth session (`fnf-auth-v1`), tables, and room memberships. D&D files are not imported or changed.

## Current version (v0.6.0)

- Username/password registration and sign-in without an invitation. A room code is required only to join, and the creator password only to create a room. No real email or confirmation link is needed.
- DM room creation with a server-checked creator password and a separate 10-character player invite code.
- The DM enters their room directly without creating a character. Players create one character per room: six species, four paths, twelve specializations, six abilities starting at 10, eight ability points, one species bonus, and two chosen class skills. Species and specialization also grant fixed training; overlapping training gives expertise.
- Copper and midnight-blue field-journal UI, room roster, character sheet, and patch notes.
- Four shared farm plots, seed stock, plant/water/harvest actions, DM-controlled days, recorded daily RP prompts, and an illustrated codex whose fields are unlocked by the DM. Settlement and exploration remain draft panels.
- DM campaign management: JSON backup, import into a separate room with a fresh invite code, and deletion by exact room-name confirmation. Returning players reclaim their backed-up characters after joining the new room.

Start future edits with `PROJECT_INDEX.md`; confirmed concepts and open decisions live in `GAME_DESIGN.md`. Names and descriptions are centralized in `game-data.js`.

## Set up a dedicated Supabase project

1. Apply `schema.sql`, `v02-update.sql`, `v03-username-auth.sql`, `v04-farming-day-codex.sql`, then `v05-campaign-backup.sql` to the dedicated FNF project only. Its private `fnf_private.room_gate` starts empty.
2. Generate a high-entropy room creation password and insert only its salted SHA-256 digest into `fnf_private.room_gate`; do not put the password in Git or `config.js`. The SQL comment in `schema.sql` shows the insert pattern. Give the password only to trusted room creators.
3. Deploy `functions/fnf-auth/index.ts` as `fnf-auth` with `verify_jwt=false`: public registration validates username/password; account migration validates the existing user JWT in the function. Supabase's privileged secret key stays in Edge Function environment variables, never in client code.
4. Put the new project's API URL and **publishable** key in `config.js`. Publish the repository root via GitHub Pages; `/fnf/` is served from `fnf/index.html`.

## Rules and security

Members can read only their own room and its characters. Direct browser writes to tables are disallowed; validated RPCs handle room creation, joining, and character creation. The gate password is checked in a private schema and failed attempts are limited to five per account per fifteen-minute window. Players join with the room code and need no creator password. The v2 RPC validates ability points and skill choices, and only players may create characters. Existing v1 records remain readable; the old character creation RPC is no longer executable by clients.

Registration uses a synthetic address derived from a lowercased username only as an internal Supabase Auth identifier. The Edge Function creates it as confirmed, so no message is sent. Old, already confirmed FNF email accounts can sign in once using the username field, claim a username, and keep their user ID, rooms, and characters. If migration fails they can skip and keep playing. Pre-existing unconfirmed accounts are not automatically activated. User metadata is only a display label, never a source of authorization.

The first farming rules are intentionally small: a planted crop is watered on its first day; on DM day advance it grows by one only if watered, soil and season match. Water resets after the transition. Crops mature in two or three successful advances and harvest returns two seeds. Seasons rotate every seven DM days; daily weather and event prompts repeat on a four-day sequence. This is a starter loop, not a complete economy or event generator. Game values live in `v04-farming-day-codex.sql`.

## v0.7.0 release candidate

`v06-world-systems.sql` and the `world-systems.js` / `world-systems.css` UI cover the proposed larger simulation. The live database migration has **not** been applied because automatic approval review rejected the production schema and rules change. Keep this branch separate from GitHub Pages main until the migration is approved and verified. The migration is additive for old rooms and accepts v0.6 JSON backups; new backups include simulation state and experience.

Prepared systems: ten-day seasons, world seed and climate, morning/noon/night weather, crop growth conditions separate from yield modifiers, storage weight and caravan bulk, construction/upkeep, villagers and visitors, livestock genetics, research/discovery, daily regional supply-demand pricing, tavern activities, tax/raids, mythology omens and experience. The starting balance is deliberately easy to revise after play reports.
