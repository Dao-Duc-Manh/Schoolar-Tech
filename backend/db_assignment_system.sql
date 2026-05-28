-- db_assignment_system.sql
-- Bảng lưu bài tập do giảng viên giao và file sinh viên nộp
-- (Dùng được cho cả MySQL/PostgreSQL theo mức tối thiểu: UUID, timestamp)
-- Nếu bạn dùng dialect cụ thể, mình có thể tinh chỉnh thêm.

-- ==========================
-- Table: assignments
-- ==========================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY,

  class_id UUID NOT NULL,
  teacher_id UUID NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  due_date TIMESTAMP NULL,
  max_score FLOAT NOT NULL DEFAULT 10,

  -- file đề bài (ppt/pptx/pdf/canvas-export...)
  problem_file_name VARCHAR(500) NULL,
  problem_file_path VARCHAR(500) NULL,
  problem_file_type VARCHAR(100) NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'published',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- Table: submissions
-- ==========================

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,

  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,

  -- file bài làm (MVP upload file)
  answer_file_name VARCHAR(500) NULL,
  answer_file_path VARCHAR(500) NULL,
  answer_file_type VARCHAR(100) NULL,

  -- phase 2 (làm trực tiếp) sẽ dùng
  answer_text TEXT,

  -- status
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',

  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP NULL,

  score FLOAT NULL,
  feedback TEXT,

  updated_by UUID NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- đảm bảo mỗi sinh viên chỉ có 1 submission hiện tại cho 1 assignment (nếu bạn cho phép nộp lại thì bỏ/đổi ràng buộc này)
  CONSTRAINT uq_submission_assignment_student UNIQUE (assignment_id, student_id)
);

-- ==========================
-- Optional indexes
-- ==========================
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments (class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions (student_id);

