-- ============================================================
--  MILISAM ENTERPRISE — PostgreSQL Database Schema
--  Run this file in psql or pgAdmin to set up the database
-- ============================================================

-- 1. Create the database (run this separately as superuser)
-- CREATE DATABASE milisam_db;
-- \c milisam_db

-- ============================================================
--  BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    email           VARCHAR(150),
    service         VARCHAR(50)     NOT NULL,  -- cleaning | business | products | maintenance | other
    preferred_date  DATE,
    location        VARCHAR(200),
    message         TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending',  -- pending | confirmed | completed | cancelled
    submitted_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  CONTACTS TABLE (general enquiries, not bookings)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
    id           SERIAL PRIMARY KEY,
    full_name    VARCHAR(150)  NOT NULL,
    phone        VARCHAR(20),
    email        VARCHAR(150)  NOT NULL,
    subject      VARCHAR(200),
    message      TEXT          NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  SERVICES TABLE (manage service types from the DB)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(50)   UNIQUE NOT NULL,   -- e.g. 'cleaning'
    name        VARCHAR(100)  NOT NULL,           -- e.g. 'Cleaning Services'
    description TEXT,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Seed default services
INSERT INTO services (slug, name, description) VALUES
  ('cleaning',    'Cleaning Services',  'Residential, office and commercial deep cleaning.'),
  ('business',    'Business Solutions', 'Enterprise workspace management and outsourced cleaning.'),
  ('products',    'Cleaning Products',  'Quality detergents, disinfectants and sanitation supplies.'),
  ('maintenance', 'Maintenance',        'Plumbing, repairs and technical support.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
--  AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
--  USEFUL INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_status       ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service      ON bookings(service);
CREATE INDEX IF NOT EXISTS idx_bookings_submitted_at ON bookings(submitted_at DESC);

-- ============================================================
--  QUICK VIEW: pending bookings
-- ============================================================
CREATE OR REPLACE VIEW pending_bookings AS
  SELECT id, full_name, phone, service, preferred_date, location, submitted_at
  FROM   bookings
  WHERE  status = 'pending'
  ORDER  BY submitted_at DESC;
