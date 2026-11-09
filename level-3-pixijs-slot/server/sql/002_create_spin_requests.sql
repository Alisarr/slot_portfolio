CREATE TABLE IF NOT EXISTS spin_requests (
  session_id UUID NOT NULL REFERENCES game_sessions(id),
  request_id UUID NOT NULL,
  total_bet DOUBLE PRECISION NOT NULL
    CHECK (total_bet > 0 AND total_bet < 'Infinity'::double precision),
  response JSONB NOT NULL CHECK (jsonb_typeof(response) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, request_id)
);