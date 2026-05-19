-- Indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_class ON documents(classId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_student ON grades(studentId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_assessment ON grades(assessmentType);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_class ON students(classId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_class_time ON messages(classId, timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_user ON messages(userId);
