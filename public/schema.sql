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
