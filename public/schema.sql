CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE components (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  framework VARCHAR(20) NOT NULL,
  current_code TEXT NOT NULL,
  base_prompt TEXT,
  image_data TEXT,
  css_props JSONB DEFAULT '{}',
  preview_image TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id VARCHAR(50) PRIMARY KEY,
  component_id VARCHAR(50) REFERENCES components(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE component_versions (
  id VARCHAR(50) PRIMARY KEY,
  component_id VARCHAR(50) REFERENCES components(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  code TEXT NOT NULL,
  css_props JSONB,
  change_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- USERS TABLE INDEXES
-- ========================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);     -- Login/search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created ON users(created_at DESC); -- Recent users

-- ========================================
-- COMPONENTS TABLE INDEXES (MOST CRITICAL)
-- ========================================
-- User dashboard (80% of queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_user_id ON components(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_user_updated ON components(user_id, updated_at DESC);

-- Library search/filter (name, framework, status)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_name_trgm ON components USING GIN(name gin_trgm_ops); -- Fuzzy search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_framework ON components(framework);
CREATE INDEX CONCONCURRENTLY IF NOT EXISTS idx_components_status ON components(status);

-- JSONB CSS props search (color, padding queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_css_props ON components USING GIN(css_props);

-- Timestamps
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_created ON components(created_at DESC);

-- ========================================
-- CONVERSATIONS TABLE (CHAT HISTORY)
-- ========================================
-- Chat loading by component (99% of chat queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_comp_time ON conversations(component_id, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_time ON conversations(user_id, timestamp DESC);

-- Role filtering (user vs assistant)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_role ON conversations(role);

-- JSONB metadata search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_metadata ON conversations USING GIN(metadata);

-- ========================================
-- COMPONENT_VERSIONS TABLE
-- ========================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_versions_comp_num ON component_versions(component_id, version_number DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_versions_comp_created ON component_versions(component_id, created_at DESC);

-- ========================================
-- ANALYZE FOR QUERY PLANNER
-- ========================================
ANALYZE users;
ANALYZE components;
ANALYZE conversations; 
ANALYZE component_versions;


