/**
 * Migration 001: Initial schema
 * 
 * Creates all base tables for the Oremus app:
 * - users (Firebase Auth mapping)
 * - preferences (per-user settings)
 * - templates (saved session templates)
 * - sessions (completed meditation/prayer sessions)
 * - prayer_list_items (Christian prayer list)
 * - daily_prompt_state (tracks daily prompt rotation)
 * - favorite_prompts (user-favorited prompts)
 * 
 * This migration runs in a single transaction and sets user_version = 1.
 */

export const migration001 = `
BEGIN;

-- -----------------------------
-- Users (maps to Firebase Auth)
-- -----------------------------
CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,            -- Firebase uid (or anonymous uid)
  email             TEXT,                        -- nullable for anonymous users
  display_name      TEXT,
  tradition         TEXT NOT NULL DEFAULT 'general'
                     CHECK(tradition IN ('christianity','islam','buddhism','general')),
  created_at        INTEGER NOT NULL,            -- unix ms
  updated_at        INTEGER NOT NULL             -- unix ms
);

CREATE INDEX IF NOT EXISTS idx_users_tradition ON users(tradition);

-- -----------------------------
-- Preferences (1 row per user)
-- -----------------------------
CREATE TABLE IF NOT EXISTS preferences (
  user_id                 TEXT PRIMARY KEY,
  default_duration_sec    INTEGER NOT NULL DEFAULT 600,       -- 10 min
  prep_enabled            INTEGER NOT NULL DEFAULT 1,         -- 0/1
  prompt_frequency        TEXT NOT NULL DEFAULT 'low'
                           CHECK(prompt_frequency IN ('none','low','medium')),
  cue_type                TEXT NOT NULL DEFAULT 'haptic'
                           CHECK(cue_type IN ('text','haptic','sound','haptic_only')),
  screen_mode             TEXT NOT NULL DEFAULT 'dim'
                           CHECK(screen_mode IN ('normal','dim','black')),
  neutral_language        INTEGER NOT NULL DEFAULT 0,         -- 0/1
  updated_at              INTEGER NOT NULL,                   -- unix ms
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------
-- Templates
-- -----------------------------
CREATE TABLE IF NOT EXISTS templates (
  id                    TEXT PRIMARY KEY,        -- uuid
  user_id               TEXT NOT NULL,
  name                  TEXT NOT NULL,
  duration_sec          INTEGER NOT NULL,
  prep_enabled          INTEGER,                 -- nullable => inherit from preferences
  prompt_frequency      TEXT
                         CHECK(prompt_frequency IN ('none','low','medium')),
  cue_type              TEXT
                         CHECK(cue_type IN ('text','haptic','sound','haptic_only')),
  screen_mode           TEXT
                         CHECK(screen_mode IN ('normal','dim','black')),
  neutral_language      INTEGER,                 -- nullable => inherit
  add_on_qibla          INTEGER NOT NULL DEFAULT 0,
  add_on_daily_prompt   INTEGER NOT NULL DEFAULT 1,
  is_favorite           INTEGER NOT NULL DEFAULT 0,
  sort_order            INTEGER NOT NULL DEFAULT 0, -- for user-controlled ordering
  created_at            INTEGER NOT NULL,        -- unix ms
  updated_at            INTEGER NOT NULL,        -- unix ms
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_fav ON templates(user_id, is_favorite);

-- -----------------------------
-- Sessions (append-only)
-- -----------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id                 TEXT PRIMARY KEY,           -- uuid
  user_id            TEXT NOT NULL,
  template_id        TEXT,                       -- nullable (quick session)
  started_at         INTEGER NOT NULL,           -- unix ms
  ended_at           INTEGER NOT NULL,           -- unix ms
  duration_sec       INTEGER NOT NULL,
  focus_rating       INTEGER                      -- 1..5 nullable
                     CHECK(focus_rating IS NULL OR (focus_rating BETWEEN 1 AND 5)),
  note               TEXT,                        -- optional reflection
  intention          TEXT,                        -- optional prep intention
  was_prep_used      INTEGER NOT NULL DEFAULT 0,  -- 0/1 (actual)
  resolved_tradition TEXT NOT NULL DEFAULT 'general'
                     CHECK(resolved_tradition IN ('christianity','islam','buddhism','general')),
  resolved_prompt_frequency TEXT NOT NULL DEFAULT 'low'
                     CHECK(resolved_prompt_frequency IN ('none','low','medium')),
  resolved_cue_type   TEXT NOT NULL DEFAULT 'haptic'
                     CHECK(resolved_cue_type IN ('text','haptic','sound','haptic_only')),
  resolved_screen_mode TEXT NOT NULL DEFAULT 'dim'
                     CHECK(resolved_screen_mode IN ('normal','dim','black')),
  created_at         INTEGER NOT NULL,           -- unix ms
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_time ON sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_template ON sessions(user_id, template_id);

-- -----------------------------
-- Christian prayer list items
-- -----------------------------
CREATE TABLE IF NOT EXISTS prayer_list_items (
  id              TEXT PRIMARY KEY,              -- uuid
  user_id         TEXT NOT NULL,
  title           TEXT NOT NULL,
  created_at      INTEGER NOT NULL,              -- unix ms
  updated_at      INTEGER NOT NULL,              -- unix ms
  last_prayed_at  INTEGER,                       -- unix ms nullable
  is_archived     INTEGER NOT NULL DEFAULT 0,    -- 0/1
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prayer_items_user ON prayer_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_items_user_archived ON prayer_list_items(user_id, is_archived);

-- -----------------------------
-- Daily prompt state (per user + tradition)
-- Stores "what was shown today" without storing copyrighted text.
-- prompt_key maps to a local in-app prompt catalog.
-- -----------------------------
CREATE TABLE IF NOT EXISTS daily_prompt_state (
  user_id        TEXT NOT NULL,
  tradition      TEXT NOT NULL
                 CHECK(tradition IN ('christianity','islam','buddhism','general')),
  last_shown_ymd TEXT,                           -- 'YYYY-MM-DD' (local device date)
  prompt_key     TEXT,                           -- identifier in local catalog
  updated_at     INTEGER NOT NULL,               -- unix ms
  PRIMARY KEY (user_id, tradition),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------
-- Favorite prompts (optional)
-- -----------------------------
CREATE TABLE IF NOT EXISTS favorite_prompts (
  user_id     TEXT NOT NULL,
  tradition   TEXT NOT NULL
              CHECK(tradition IN ('christianity','islam','buddhism','general')),
  prompt_key  TEXT NOT NULL,
  created_at  INTEGER NOT NULL,                  -- unix ms
  PRIMARY KEY (user_id, tradition, prompt_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fav_prompts_user_trad ON favorite_prompts(user_id, tradition);

COMMIT;
`;
