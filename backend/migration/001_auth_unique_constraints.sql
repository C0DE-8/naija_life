ALTER TABLE players
  ADD UNIQUE KEY uq_players_username (username),
  ADD UNIQUE KEY uq_players_email (email);
