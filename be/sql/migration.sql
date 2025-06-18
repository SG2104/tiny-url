CREATE TABLE urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_code UNIQUE (code)
);
CREATE INDEX idx_urls_code ON urls (code);