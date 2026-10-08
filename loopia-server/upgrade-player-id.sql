-- Run once in phpMyAdmin BEFORE uploading the new api.php/lib.php.
-- Existing results are preserved; they keep NULL as player_key.
ALTER TABLE ss_results
 ADD COLUMN IF NOT EXISTS player_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER name;
ALTER TABLE ss_results
 ADD UNIQUE INDEX IF NOT EXISTS ss_player_week (challenge_id,player_key);
