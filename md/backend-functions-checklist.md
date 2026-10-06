# NCity Backend Function Checklist

This checklist is based on the player-facing pages, admin screens, form actions, AJAX endpoints, scheduled jobs, and payment handlers in `Ncity-master`. Check an item once its backend behavior is implemented and verified.

## Public access and accounts

- [ ] Show public home page data: game settings, online/total player counts, best and newest players, screenshots, and informational content.
- [ ] Register a new player account with username/email validation, password storage, starting balances, and initial player state.
- [ ] Sign in a player and create an authenticated session.
- [ ] Sign out a player and invalidate their session.
- [ ] Select a starting character and apply its starting attributes.
- [ ] Authenticate an administrator and enforce admin-only access.

## Player profile and communication

- [ ] View the signed-in player's dashboard, stats, timers, owned assets, and status.
- [ ] View another player's public profile and statistics.
- [ ] Post comments on the home feed and player profiles.
- [ ] Send and view private messages, including unread/read status.
- [ ] Post and retrieve global chat messages.
- [ ] Update account settings, including email, avatar, and password.
- [ ] Change the player's language.
- [ ] Change the player's theme/appearance.
- [ ] View the player leaderboard/rankings.

## Core game systems

- [ ] Apply level progression and level rewards from respect thresholds.
- [ ] Refill player energy on schedule and support full-energy refill.
- [ ] Work a job and apply its costs, rewards, and cooldown.
- [ ] Train in the gym and apply fees, energy costs, stat gains, health recovery, and cooldowns.
- [ ] Study at school and apply fees, energy costs, intelligence gains, and cooldowns.
- [ ] Receive hospital treatment and apply payment, health recovery, and cooldowns.
- [ ] Deposit money into the bank.
- [ ] Withdraw money from the bank.
- [ ] Buy and use resources/services with the configured currency and effects.
- [ ] Buy shop items and apply their stat bonuses and inventory changes.
- [ ] Manage equipped/owned items and item categories as used by the game.
- [ ] Buy and manage pets, including home capacity and pet limits.
- [ ] Buy properties and collect timed property income.
- [ ] Upgrade homes and manage home capacity.
- [ ] Upgrade garages and manage vehicle capacity.
- [ ] Upgrade hangars and manage aircraft capacity.
- [ ] Upgrade quays and manage boat capacity.
- [ ] Buy and manage vehicles, including garage/hangar/quay placement and vehicle stats.
- [ ] Upgrade vehicle performance.
- [ ] Race vehicles and record race outcomes/rewards.
- [ ] Start and resolve player fights in the fight arena, including fight history and rewards.
- [ ] Play the casino wheel, charge for spins, select prizes, and grant winnings.

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
