# Naija Life Backend Function Checklist

This checklist is based on the player-facing pages, admin screens, form actions, AJAX endpoints, scheduled jobs, and payment handlers in `Ncity-master`. Check an item once its backend behavior is implemented and verified.

## Public access and accounts

- [ ] Show public home page data: game settings, online/total player counts, best and newest players, screenshots, and informational content.
- [x] Register a new player account with username/email validation, bcrypt password storage, starting balances, default language/theme, and initial player state. (`POST /api/auth/signup`)
- [x] Sign in a player and issue an authenticated JWT. Legacy SHA-256 password hashes are upgraded to bcrypt after successful sign-in. (`POST /api/auth/signin`)
- [x] Sign out a player and invalidate their session. (`POST /api/auth/signout`)
- [x] Select a starting character and apply its starting attributes. (`GET /api/game/characters`, `POST /api/game/character`)
- [ ] Authenticate an administrator and enforce admin-only access.

## Player profile and communication

- [ ] View the signed-in player's dashboard, stats, timers, owned assets, and status.
- [ ] View another player's public profile and statistics.
- [ ] Post comments on the home feed and player profiles.
- [x] Send and view private messages, including unread/read status. (`GET /api/game/messages`, `POST /api/game/messages`, `POST /api/game/messages/:id/read`)
- [ ] Post and retrieve global chat messages.
- [x] Update account settings, including email, avatar, and password. (`PUT /api/game/settings`)
- [x] Change the player's language. (`PUT /api/game/preferences`)
- [x] Change the player's theme/appearance. (`PUT /api/game/preferences`)
- [x] View the player leaderboard/rankings. (`GET /api/game/catalog/leaderboard`)

Frontend route shells exist for `/messages`, `/settings`, `/leaderboard`, and `/player/:playerId`; only the leaderboard currently displays database data. Messaging, account updates, and public profiles still need their APIs.

## Core game systems

- [x] Apply level progression and level rewards from respect thresholds. (`GET /api/game/dashboard`)
- [ ] Refill player energy on schedule and support full-energy refill.
- [x] Work a job and apply its costs, rewards, and cooldown. (`POST /api/game/actions/job/start`, `/finish`, `/leave`)
- [x] Train in the gym and apply fees, energy costs, stat gains, health recovery, and cooldowns. (`POST /api/game/actions/gym/start`, `/finish`, `/leave`)
- [x] Study at school and apply fees, energy costs, intelligence gains, and cooldowns. (`POST /api/game/actions/school/start`, `/finish`, `/leave`)
- [x] Receive hospital treatment and apply payment, health recovery, and cooldowns. (`POST /api/game/actions/hospital/start`, `/finish`, `/leave`)
- [x] Deposit money into the bank. (`POST /api/game/bank/deposit`)
- [x] Withdraw money from the bank. (`POST /api/game/bank/withdraw`)
- [ ] Buy and use resources/services with the configured currency and effects.
- [x] Buy shop items and apply their stat bonuses and inventory changes. (`POST /api/game/purchases/item/:id`)
- [ ] Manage equipped/owned items and item categories as used by the game.
- [ ] Buy and manage pets, including home capacity and pet limits.
- [x] Buy properties and collect timed property income. (`POST /api/game/purchases/property/:id`, `POST /api/game/properties/:id/collect`)
- [x] Upgrade homes and manage home capacity. (`POST /api/game/purchases/home/:id`)
- [x] Upgrade garages and manage vehicle capacity. (`POST /api/game/purchases/garage/:id`)
- [x] Upgrade hangars and manage aircraft capacity. (`POST /api/game/purchases/hangar/:id`)
- [x] Upgrade quays and manage boat capacity. (`POST /api/game/purchases/quay/:id`)
- [ ] Buy and manage vehicles, including garage/hangar/quay placement and vehicle stats.
- [x] Upgrade vehicle performance. (`GET /api/game/vehicles/owned`, `POST /api/game/vehicles/:id/upgrade`)
- [ ] Complete purchases and mutations for the added catalog page routes (vehicles, properties, pets, shop items, resources, casino, races, and fights).
- [ ] Race vehicles and record race outcomes/rewards.
- [ ] Start and resolve player fights in the fight arena, including fight history and rewards.
- [x] Play the casino wheel, charge for spins, select prizes, and grant winnings. (`POST /api/game/casino/spin`, `POST /api/game/casino/spins`)

## Payments and background processing

- [ ] Process PayPal payment notifications securely and credit the correct player account.
- [ ] Record and display payment transactions in player/admin payment history.
- [ ] Run scheduled energy refill jobs with correct refill limits and timing.
- [ ] Track player online activity and update last-online/time-online status.

## Admin dashboard and management

- [ ] Show admin dashboard summaries and system/player statistics.
- [ ] Manage player records, roles/admin access, and player status.
- [ ] Manage game-wide settings, public content, and PayPal configuration.
- [ ] Manage level thresholds and rewards configuration.
- [ ] Manage character records and character categories.
- [ ] Manage item records and item categories.
- [ ] Manage vehicle records and vehicle categories.
- [ ] Manage job definitions.
- [ ] Manage gym workout definitions.
- [ ] Manage school subject definitions.
- [ ] Manage hospital treatment definitions.
- [ ] Manage resource/service definitions.
- [ ] Manage pet definitions.
- [ ] Manage property definitions.
- [ ] Manage home definitions.
- [ ] Manage garage definitions.
- [ ] Manage hangar definitions.
- [ ] Manage quay definitions.
- [ ] Manage casino prize definitions.
- [ ] Manage supported languages and default language settings.
- [ ] Manage available themes and the default theme.
