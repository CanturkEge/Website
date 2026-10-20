# Farms & Fields (FNF)

Independent, static browser game shell at `https://egecanturk.dev/fnf/` in the same GitHub Pages repository as the D&D site. It has its **own** Supabase project, auth session (`fnf-auth-v1`), tables, and room memberships. D&D files are not imported or changed.

## First version

- Email/password registration and sign-in.
- DM room creation with a server-checked creator password and a separate 10-character player invite code.
- One character per player per room: six species, four paths, twelve specializations, and six starting skill points with a per-skill cap of three.
- Room roster and character card. Settlement, research, seasons, and world simulation are clearly marked for later versions.

## Set up a dedicated Supabase project

1. Apply `schema.sql` to the new FNF project only. Its private `fnf_private.room_gate` starts empty.
2. Generate a high-entropy room creation password and insert only its salted SHA-256 digest into `fnf_private.room_gate`; do not put the password in Git or `config.js`. The SQL comment in `schema.sql` shows the insert pattern. Give the password only to trusted room creators.
3. In Supabase Auth → URL Configuration, set the Site URL to `https://egecanturk.dev/fnf/` and add it to allowed redirect URLs, so email confirmation returns here.
4. Put the new project's API URL and **publishable** key in `config.js`. Never use a secret/service-role key in client code.
5. Publish the repository root via GitHub Pages. `/fnf/` is served from `fnf/index.html`.

## Rules and security

Members can read only their own room and its characters. Direct browser writes to tables are disallowed; validated RPCs handle room creation, joining, and character creation. The gate password is checked in a private schema and failed attempts are limited to five per account per fifteen-minute window. Players join with the room code and need no creator password. Character points are validated in the database.

This is the first playable **shell**, not a simulated farming game yet. Later systems should extend the data model without treating the landing page text as completed mechanics.
