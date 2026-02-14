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


-- Components indexes (MOST IMPORTANT)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_user_id ON components(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_user_updated ON components(user_id, updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_name ON components USING GIN(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_framework ON components(framework);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_status ON components(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_components_css_props ON components USING GIN(css_props);

-- Chat indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_component_time ON chat_messages(component_id, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_role_time ON chat_messages(role, timestamp DESC);

-- Users indexes
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);

-- Analyze tables for query planner
ANALYZE components;
ANALYZE chat_messages;
ANALYZE users;

