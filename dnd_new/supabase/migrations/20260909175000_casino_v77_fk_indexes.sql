-- Build 77 follow-up: covering indexes for every new foreign-key lookup.
create index if not exists casino_settings_v77_updated_by_idx on public.casino_settings_v77(updated_by);
create index if not exists casino_games_v77_updated_by_idx on public.casino_games_v77(updated_by);
create index if not exists casino_rounds_v77_opened_by_idx on public.casino_rounds_v77(opened_by);
create index if not exists casino_rounds_v77_resolved_by_idx on public.casino_rounds_v77(resolved_by);
create index if not exists casino_plays_v77_game_idx on public.casino_plays_v77(game_id);
create index if not exists casino_operations_v77_user_idx on public.casino_operations_v77(user_id);
