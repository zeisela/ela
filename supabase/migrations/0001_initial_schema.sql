-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM (
  'admin', 'manager', 'editor', 'community_manager', 'designer'
);

CREATE TYPE client_status AS ENUM (
  'active', 'inactive', 'paused', 'churned'
);

CREATE TYPE content_type AS ENUM (
  'post', 'reel', 'carousel', 'story'
);

CREATE TYPE content_status AS ENUM (
  'draft', 'scheduled', 'published', 'cancelled'
);

CREATE TYPE file_category AS ENUM (
  'brandbook', 'logo', 'video', 'photo', 'manual', 'other'
);

CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'restore'
);

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'editor',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  company         TEXT,
  logo_url        TEXT,
  instagram       TEXT,
  facebook        TEXT,
  tiktok          TEXT,
  status          client_status DEFAULT 'active',
  assigned_to     UUID REFERENCES profiles(id),
  start_date      DATE,
  notes           TEXT,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- ============================================
-- PLANS
-- ============================================
CREATE TABLE plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  month           INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            INT NOT NULL,
  posts_goal      INT DEFAULT 0,
  reels_goal      INT DEFAULT 0,
  stories_goal    INT DEFAULT 0,
  carousels_goal  INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, month, year)
);

-- ============================================
-- CONTENT
-- ============================================
CREATE TABLE content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  client_id       UUID NOT NULL REFERENCES clients(id),
  plan_id         UUID REFERENCES plans(id),
  title           TEXT NOT NULL,
  type            content_type NOT NULL,
  status          content_status DEFAULT 'draft',
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  assigned_to     UUID REFERENCES profiles(id),
  notes           TEXT,
  external_id     TEXT,
  platform_data   JSONB DEFAULT '{}',
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- ============================================
-- CONTENT ATTACHMENTS
-- ============================================
CREATE TABLE content_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id  UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   BIGINT,
  mime_type   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENT FILES
-- ============================================
CREATE TABLE client_files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  client_id       UUID NOT NULL REFERENCES clients(id),
  category        file_category NOT NULL,
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_size       BIGINT,
  mime_type       TEXT,
  uploaded_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  client_id       UUID NOT NULL REFERENCES clients(id),
  plan_id         UUID REFERENCES plans(id),
  title           TEXT NOT NULL,
  period_month    INT NOT NULL,
  period_year     INT NOT NULL,
  observations    TEXT,
  pdf_url         TEXT,
  generated_by    UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  type        TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID REFERENCES organizations(id),
  user_id     UUID REFERENCES profiles(id),
  action      audit_action NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_clients_org ON clients(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_status ON clients(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_assigned ON clients(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_plans_client ON plans(client_id);
CREATE INDEX idx_plans_period ON plans(year, month);
CREATE INDEX idx_content_client ON content(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_plan ON content(plan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_scheduled ON content(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_type ON content(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_status ON content(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_client_files_client ON client_files(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_audit_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_org ON audit_log(org_id);

-- Full-text search
CREATE INDEX idx_clients_name_trgm ON clients USING GIN (name gin_trgm_ops);
CREATE INDEX idx_content_title_trgm ON content USING GIN (title gin_trgm_ops);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, organization_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'organization_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org_id
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = auth_org_id());

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (organization_id = auth_org_id());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (organization_id = auth_org_id());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (organization_id = auth_org_id() AND (id = auth.uid() OR auth_role() IN ('admin', 'manager')));

-- Clients
CREATE POLICY "clients_select" ON clients FOR SELECT
  USING (organization_id = auth_org_id() AND deleted_at IS NULL);
CREATE POLICY "clients_insert" ON clients FOR INSERT
  WITH CHECK (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager'));
CREATE POLICY "clients_update" ON clients FOR UPDATE
  USING (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager') AND deleted_at IS NULL);
CREATE POLICY "clients_delete" ON clients FOR DELETE
  USING (organization_id = auth_org_id() AND auth_role() = 'admin');

-- Plans
CREATE POLICY "plans_select" ON plans FOR SELECT
  USING (organization_id = auth_org_id());
CREATE POLICY "plans_insert" ON plans FOR INSERT
  WITH CHECK (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager'));
CREATE POLICY "plans_update" ON plans FOR UPDATE
  USING (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager'));

-- Content
CREATE POLICY "content_select" ON content FOR SELECT
  USING (organization_id = auth_org_id() AND deleted_at IS NULL);
CREATE POLICY "content_insert" ON content FOR INSERT
  WITH CHECK (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager', 'editor', 'community_manager'));
CREATE POLICY "content_update" ON content FOR UPDATE
  USING (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager', 'editor', 'community_manager') AND deleted_at IS NULL);
CREATE POLICY "content_delete" ON content FOR DELETE
  USING (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager'));

-- Content attachments
CREATE POLICY "attachments_select" ON content_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_attachments.content_id
        AND c.organization_id = auth_org_id()
        AND c.deleted_at IS NULL
    )
  );
CREATE POLICY "attachments_insert" ON content_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_attachments.content_id
        AND c.organization_id = auth_org_id()
    )
  );
CREATE POLICY "attachments_delete" ON content_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_attachments.content_id
        AND c.organization_id = auth_org_id()
        AND auth_role() IN ('admin', 'manager', 'editor', 'community_manager')
    )
  );

-- Client files
CREATE POLICY "files_select" ON client_files FOR SELECT
  USING (organization_id = auth_org_id() AND deleted_at IS NULL);
CREATE POLICY "files_insert" ON client_files FOR INSERT
  WITH CHECK (organization_id = auth_org_id());
CREATE POLICY "files_delete" ON client_files FOR DELETE
  USING (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager'));

-- Reports
CREATE POLICY "reports_select" ON reports FOR SELECT
  USING (organization_id = auth_org_id());
CREATE POLICY "reports_insert" ON reports FOR INSERT
  WITH CHECK (organization_id = auth_org_id() AND auth_role() IN ('admin', 'manager', 'editor'));

-- Notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Audit log
CREATE POLICY "audit_select" ON audit_log FOR SELECT
  USING (org_id = auth_org_id() AND auth_role() IN ('admin', 'manager'));
