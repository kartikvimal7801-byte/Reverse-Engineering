-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'manager')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'approved', 'rejected')),
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 11),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 11),
  status VARCHAR(50) DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'complete')),
  data JSONB,
  completed_at TIMESTAMP,
  UNIQUE(project_id, step_number)
);

-- Components table (from Step 2)
CREATE TABLE IF NOT EXISTS components (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  part_id VARCHAR(50) NOT NULL,
  photo_urls TEXT[],
  assembly_position INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Measurements table (from Step 3)
CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  measurement_type VARCHAR(100),
  value DECIMAL(10, 3),
  unit VARCHAR(20) DEFAULT 'mm',
  cad_file_url TEXT,
  geometry_data JSONB
);

-- Materials table (from Step 4)
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  material_type VARCHAR(100),
  material_name VARCHAR(100)
);

-- Performance data table (from Step 5)
CREATE TABLE IF NOT EXISTS performance_data (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  head DECIMAL(10, 2),
  discharge DECIMAL(10, 2),
  efficiency DECIMAL(5, 2),
  power_consumption DECIMAL(10, 2)
);

-- Cost data table (from Step 6)
CREATE TABLE IF NOT EXISTS cost_data (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  component_id INTEGER REFERENCES components(id),
  bom_cost DECIMAL(12, 2),
  manufacturing_cost DECIMAL(12, 2),
  assembly_cost DECIMAL(12, 2),
  logistics_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2)
);

-- AI analysis table (Steps 7, 8, 9)
CREATE TABLE IF NOT EXISTS ai_analysis (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  analysis_type VARCHAR(50),
  input_data JSONB,
  output_data JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Management reviews table (Step 10)
CREATE TABLE IF NOT EXISTS management_reviews (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  decision VARCHAR(50) NOT NULL CHECK (decision IN ('approved', 'rework_required', 'rejected')),
  feedback TEXT,
  reviewer_id INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP DEFAULT NOW()
);

-- Reports table (Step 11)
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Files table (tracking uploads)
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size BIGINT,
  s3_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_project_id ON workflow_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_components_project_id ON components(project_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
