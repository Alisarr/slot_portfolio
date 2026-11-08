CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  state JSONB NOT NULL CHECK (jsonb_typeof(state) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);