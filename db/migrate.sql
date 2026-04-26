-- Margen Real — Schema inicial
-- Schema público: tablas compartidas (directorio de tenants)

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  plan         TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  order_id     TEXT NOT NULL DEFAULT '',
  schema_name  TEXT UNIQUE,              -- schema del tenant: tenant_{id}
  activated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Auditoría de accesos (append-only, schema público)
CREATE TABLE IF NOT EXISTS auth_log (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  email      TEXT NOT NULL,
  event      TEXT NOT NULL CHECK (event IN ('activated','login_ok','login_fail','session_check')),
  ip         TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_log_user_idx    ON auth_log (user_id);
CREATE INDEX IF NOT EXISTS auth_log_created_idx ON auth_log (created_at DESC);
