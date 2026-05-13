-- ------------------------------------------------------------------
-- Pulse — PostgreSQL schema.
--
-- Two tables, no extensions required, works on any Postgres ≥ 12.
--
-- Run once at setup:
--   psql $POSTGRES_URL -f schema/postgres.sql
-- Or paste into the Vercel Postgres SQL console.
--
-- Privacy: no IPs, no PII, no cookies. `session_hash` is
-- SHA256(ip + user_agent + daily_salt). The daily_salt rotates every
-- 24h (server-side), so yesterday's session_hash cannot be linked to
-- any current IP.
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS analytics_events (
  id            BIGSERIAL PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type    TEXT NOT NULL,    -- 'view' | 'contact_open' | 'cal_click' | etc.
  page          TEXT NOT NULL,    -- pathname, e.g. '/case-studies/gramota'
  referrer_host TEXT,             -- hostname only — 'news.ycombinator.com', not full URL
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  country       TEXT,             -- 2-letter ISO code (from edge geo header)
  device        TEXT,             -- 'desktop' | 'mobile' | 'tablet'
  browser       TEXT,             -- 'chrome' | 'safari' | 'firefox' | 'edge' | 'opera' | 'other'
  os            TEXT,             -- 'windows' | 'mac' | 'ios' | 'android' | 'linux' | 'other'
  session_hash  TEXT NOT NULL,    -- SHA256(ip|ua|daily_salt), 128 bits as hex
  props         JSONB             -- event-specific payload (scroll depth, outbound host, etc.)
);

CREATE INDEX IF NOT EXISTS idx_events_ts          ON analytics_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_ts     ON analytics_events (event_type, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_session_ts  ON analytics_events (session_hash, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_page_ts     ON analytics_events (page, ts DESC);

CREATE TABLE IF NOT EXISTS analytics_vitals (
  id           BIGSERIAL PRIMARY KEY,
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric       TEXT NOT NULL,     -- 'FCP' | 'LCP' | 'INP' | 'CLS' | 'FID' | 'TTFB'
  value        DOUBLE PRECISION NOT NULL,  -- ms for time metrics, unitless for CLS
  page         TEXT NOT NULL,
  country      TEXT,
  device       TEXT,
  session_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vitals_ts          ON analytics_vitals (ts DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_metric_ts   ON analytics_vitals (metric, ts DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_page_metric ON analytics_vitals (page, metric);
