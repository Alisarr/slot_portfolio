CREATE TABLE IF NOT EXISTS chest_requests (
  session_id UUID NOT NULL REFERENCES game_sessions(id),
  request_id UUID NOT NULL,
  chest_index INTEGER NOT NULL CHECK (chest_index BETWEEN 0 AND 4),
  response JSONB NOT NULL CHECK (jsonb_typeof(response) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, request_id)
);