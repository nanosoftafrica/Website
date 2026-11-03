-- Case studies content type: client success stories shown on the public
-- site (nav already had a "Case Studies" link pointing at /blog as a
-- placeholder). Timestamps use camelCase createdAt/updatedAt to match
-- Sequelize's default field mapping, same convention as every other table
-- in this codebase (see 20260810_itil_incident_service_request.sql for the
-- bug this avoids).

CREATE TABLE IF NOT EXISTS case_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  client VARCHAR(255) NOT NULL,
  industry VARCHAR(100) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  summary TEXT DEFAULT '',
  challenge TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  outcome TEXT DEFAULT '',
  services_used JSONB DEFAULT '[]',
  hero_image VARCHAR(500),
  color VARCHAR(20) DEFAULT '#0096D6',
  bg_color VARCHAR(50) DEFAULT 'rgba(0,150,214,0.08)',
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_studies_active ON case_studies(active);
CREATE INDEX IF NOT EXISTS idx_case_studies_order ON case_studies("order");
