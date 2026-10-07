# Backend and frontend implementation notes

This update connects the React client to the existing Naija Life MySQL schema in `Ncity-master/SQL/Database SQL.sql`. Game definitions and player balances remain in the legacy tables; the Express API now owns the player-facing requests added here.

## Added API behavior

- `GET /api/game/dashboard` returns the signed-in player's current stats, online counts, next respect threshold, owned properties and active action. It also updates the player's `timeonline` timestamp.
- Dashboard requests apply all level rewards due from the player's respect, matching the legacy progression rules.
- `GET /api/game/activities` returns the seeded job, gym, school and hospital options.
- `GET /api/game/catalog/{vehicles|properties|pets|shop|resources|leaderboard|casino|races|fights}` returns the corresponding read-only database listings.
- `POST /api/game/bank/deposit` and `/withdraw` move a positive whole-number amount between cash and bank. The balance check and update run in one transaction.
- `POST /api/game/actions/{job|gym|school|hospital}/start` charges the applicable costs, deducts energy or health where configured and creates the timed action.
- `POST /api/game/actions/finish` awards the configured reward after the action timer expires.
- `POST /api/game/actions/leave` removes the active action and returns the legacy PHP partial refund where applicable.
- `GET /api/game/characters` and `POST /api/game/character` load character choices and apply their starting stats once.
- `POST /api/game/purchases/{item|property|pet|vehicle|home|garage|hangar|quay}/:id` applies prices, level/VIP checks, ownership, capacity and stat effects for PHP shop and upgrade flows.
- `POST /api/game/sales/{item|pet|vehicle}/:id` returns the PHP-style partial refund and removes the owned item.
- `POST /api/game/properties/:id/collect` checks the property timer, pays its income once, and advances the next collection time.
- `GET /api/game/messages`, `POST /api/game/messages`, and `POST /api/game/messages/:id/read` support private inbox, send and read state.
- `GET /api/game/players/:id` and `POST /api/game/players/:id/comments` load public profiles and profile comments.
- `PUT /api/game/settings` updates email/avatar and hashes a new password; `GET/PUT /api/game/preferences` load and save the supported language and theme.
- `GET /api/game/vehicles/owned` and `POST /api/game/vehicles/:id/upgrade` manage the player's vehicle performance stats.
- `POST /api/game/casino/spin` spends a spin and grants a seeded prize; `POST /api/game/casino/spins` buys spins with in-game cash.
- `POST /api/auth/signout` revokes the current JWT; authenticated game routes reject revoked and expired tokens.

Player operations use bearer tokens. Balance and timed-action mutations lock the player row and use transactions to prevent concurrent requests from overspending or starting overlapping actions.

## Frontend

The sign-in and registration forms now navigate into an authenticated dashboard. The dashboard shows player balances and stats, a live active-action timer, and navigation for work, gym, school, hospital and bank. The activity screens use catalog data from the database and refresh the dashboard after each mutation.

The frontend route map now includes the player-facing PHP pages: `/home`, `/vehicles`, `/properties`, `/pets`, `/shop`, `/jobs`, `/gym`, `/school`, `/bank`, `/hospital`, `/races`, `/fight-arena`, `/leaderboard`, `/casino`, `/resources`, `/messages`, `/settings`, plus character and upgrade pages. The original PHP images are available under `frontend/public/ncity/images`. Purchases are connected for shop items, properties, pets, vehicles and facility upgrades; property income, vehicle upgrades, messages, account settings and casino spins are connected. Races, fights, external resource payments and admin management still need their game actions.

The sign-in form offers `demo` / `demo`. Those credentials enter a local browser demo and do not call the API; the demo has local player progress, working bank/activity actions, a reset control, and 20-second activity timers. The legacy SQL seed also contains the same demo account for API-backed environments.

## Database changes

Migration `002_game_sessions.sql` adds `revoked_tokens` for sign-out. It was applied to the configured database with `npm run db:migrate`; the migration runner reported `Applied: 002_game_sessions.sql`. Migration `001_auth_unique_constraints.sql` was already recorded as applied.

## Remaining PHP systems

The app still needs API and UI work for character selection, public profiles and feed comments, messages and chat, account settings, leaderboard and level rewards, resources and shop inventory, pets, properties and timed income collection, homes/garages/hangars/quays, vehicle upgrades and racing, fights, casino, PayPal payments, administrator screens, language/theme selection, and energy refill scheduling. The broader scope remains tracked in [backend-functions-checklist.md](backend-functions-checklist.md).

## Local setup

Configure `backend/.env` with the MySQL connection and a strong `JWT_SECRET`. Configure `frontend/.env` with `VITE_API_URL` pointing to the API base, then start the backend and Vite frontend. The initial database schema and seed data are imported by `npm run db:migrate` if the configured database does not already contain a `players` table.
