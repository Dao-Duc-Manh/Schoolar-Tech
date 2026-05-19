-- Scholar Tech / Dai Nam LMS SQL schema
-- PostgreSQL migration. Sequelize also syncs these tables automatically at runtime.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL,
  avatar VARCHAR(500),
  phone VARCHAR(30),
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_code VARCHAR(60) NOT NULL UNIQUE,
  faculty VARCHAR(255),
  major VARCHAR(255),
  class_name VARCHAR(120),
  course_year VARCHAR(40),
  gpa DOUBLE PRECISION DEFAULT 0,
  academic_status VARCHAR(60) DEFAULT 'Đang học',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_code VARCHAR(60) NOT NULL UNIQUE,
  faculty VARCHAR(255),
  position VARCHAR(120),
  degree VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 3,
  faculty VARCHAR(255),
  major VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  major VARCHAR(255),
  course_year VARCHAR(40),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  missing_assignments INTEGER DEFAULT 0,
  learning_status VARCHAR(40) DEFAULT 'Active',
  risk_level VARCHAR(40) DEFAULT 'low',
  risk_reason TEXT,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  attendance_score DOUBLE PRECISION DEFAULT 0,
  assignment_score DOUBLE PRECISION DEFAULT 0,
  midterm_score DOUBLE PRECISION DEFAULT 0,
  final_score DOUBLE PRECISION DEFAULT 0,
  total_score DOUBLE PRECISION DEFAULT 0,
  letter_grade VARCHAR(10),
  status VARCHAR(60),
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  file_url VARCHAR(500),
  status VARCHAR(40) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  review_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  achievement_date DATE,
  description TEXT,
  file_url VARCHAR(500),
  status VARCHAR(40) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  review_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  career_objective TEXT,
  desired_position VARCHAR(255),
  desired_industry VARCHAR(255),
  desired_location VARCHAR(255),
  portfolio_url VARCHAR(500),
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  cv_file_url VARCHAR(500),
  ai_summary TEXT,
  academic_score INTEGER DEFAULT 0,
  skill_score INTEGER DEFAULT 0,
  project_score INTEGER DEFAULT 0,
  certificate_score INTEGER DEFAULT 0,
  achievement_score INTEGER DEFAULT 0,
  experience_score INTEGER DEFAULT 0,
  career_readiness_score INTEGER DEFAULT 0,
  status VARCHAR(60) DEFAULT 'Draft',
  consent_to_share BOOLEAN DEFAULT FALSE,
  show_gpa BOOLEAN DEFAULT TRUE,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(60) DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  target_table VARCHAR(120),
  target_id VARCHAR(120),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  note_type VARCHAR(40) DEFAULT 'Academic',
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
