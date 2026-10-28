-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Institution Profile Table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    aicte_permanent_id VARCHAR(50) NOT NULL UNIQUE,
    academic_year VARCHAR(20) NOT NULL,
    sanctioned_intake INTEGER NOT NULL DEFAULT 0,
    built_up_area_sqm NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    pan_number VARCHAR(10) NOT NULL,
    aicte_faculty_id VARCHAR(50),
    designation VARCHAR(50) NOT NULL CHECK (designation IN ('Professor', 'Associate Professor', 'Assistant Professor')),
    highest_degree VARCHAR(20) NOT NULL CHECK (highest_degree IN ('PhD', 'Masters', 'Bachelors')),
    department VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    is_regular BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for duplicate checks and department aggregations
CREATE INDEX IF NOT EXISTS idx_faculty_pan ON faculty (pan_number);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty (department);
CREATE INDEX IF NOT EXISTS idx_faculty_designation ON faculty (designation);

-- 3. Infrastructure Table
CREATE TABLE IF NOT EXISTS infrastructure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('Classroom', 'Tutorial', 'Laboratory', 'Seminar Hall')),
    area_sqm NUMERIC(10, 2) NOT NULL,
    seating_capacity INTEGER NOT NULL DEFAULT 0,
    has_smart_board BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_room_type ON infrastructure (room_type);

-- 4. Compliance Issues Table
CREATE TABLE IF NOT EXISTS compliance_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Data Quality', 'AICTE Norm Deficit')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'Warning', 'Info')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('Faculty', 'Infrastructure', 'Disclosure')),
    record_reference TEXT NOT NULL,
    description TEXT NOT NULL,
    aicte_norm_reference TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_severity ON compliance_issues (severity);
CREATE INDEX IF NOT EXISTS idx_issues_resolved ON compliance_issues (is_resolved);

-- 5. AICTE Approval Process Handbook Chunks Table (for RAG with Gemini embeddings)
CREATE TABLE IF NOT EXISTS aicte_handbook_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handbook_edition VARCHAR(50) DEFAULT '2024-25',
    chapter_number VARCHAR(20),
    section_title TEXT NOT NULL,
    page_number INTEGER,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(768), -- Dimensions for Gemini text-embedding-004
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index using cosine distance
CREATE INDEX IF NOT EXISTS idx_handbook_chunks_embedding 
ON aicte_handbook_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Helper function for semantic search via Supabase RPC
CREATE OR REPLACE FUNCTION match_aicte_chunks (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.65,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  section_title TEXT,
  page_number INTEGER,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.section_title,
    c.page_number,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM aicte_handbook_chunks c
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

