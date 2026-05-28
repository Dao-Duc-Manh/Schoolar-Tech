-- 002_assignments_submissions.sql
-- migrations placeholder: if project uses manual migration execution.

:r
-- Nội dung giống db_assignment_system.sql

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY,

  class_id UUID NOT NULL,
  teacher_id UUID NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  due_date TIMESTAMP NULL,
  max_score FLOAT NOT NULL DEFAULT 10,

  problem_file_name VARCHAR(500) NULL,
  problem_file_path VARCHAR(500) NULL,
  problem_file_type VARCHAR(100) NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'published',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,

  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,

  answer_file_name VARCHAR(500) NULL,
  answer_file_path VARCHAR(500) NULL,
  answer_file_type VARCHAR(100) NULL,

  answer_text TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'submitted',

  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP NULL,

  score FLOAT NULL,
  feedback TEXT,

  updated_by UUID NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_submission_assignment_student UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments (class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions (student_id);

