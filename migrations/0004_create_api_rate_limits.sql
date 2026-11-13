CREATE TABLE IF NOT EXISTS api_rate_limits (
    scope TEXT NOT NULL,
    client_hash TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (scope, client_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window_start
ON api_rate_limits(window_start);
