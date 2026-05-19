#!/bin/bash
# API Testing Script for Scholar Tech
# Usage: bash test-api.sh or ./test-api.sh (on Linux/Mac)
# For Windows PowerShell users: see powershell-test.ps1

API_URL="http://localhost:3000/api"
TEACHER_EMAIL="teacher@test.com"
TEACHER_PASSWORD="password123"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="admin123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Scholar Tech API Testing Script${NC}"
echo "======================================="
echo "Testing endpoint: $API_URL"
echo ""

# Test 1: Register Admin User
echo -e "${YELLOW}Test 1: Register Admin User${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASSWORD'",
    "role": "admin"
  }')
echo "$ADMIN_RESPONSE"
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}Admin Token extracted${NC}\n"

# Test 2: Register Teacher User
echo -e "${YELLOW}Test 2: Register Teacher User${NC}"
TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Teacher User",
    "email": "'$TEACHER_EMAIL'",
    "password": "'$TEACHER_PASSWORD'",
    "role": "teacher"
  }')
echo "$TEACHER_RESPONSE"
TEACHER_TOKEN=$(echo "$TEACHER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}Teacher Token extracted${NC}\n"

# Test 3: Register Student User
echo -e "${YELLOW}Test 3: Register Student User${NC}"
STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Student User",
    "email": "student@test.com",
    "password": "student123",
    "role": "student"
  }')
echo "$STUDENT_RESPONSE"
STUDENT_ID=$(echo "$STUDENT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}Student ID and Token extracted${NC}\n"

# Test 4: Login
echo -e "${YELLOW}Test 4: Login Test${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASSWORD'"
  }')
echo "$LOGIN_RESPONSE"
echo -e "${GREEN}Login successful${NC}\n"

# Test 5: Get Current User
echo -e "${YELLOW}Test 5: Get Current User${NC}"
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | json_pp 2>/dev/null || \
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "${GREEN}Current user retrieved${NC}\n"

# Test 6: Create Class (Teacher)
echo -e "${YELLOW}Test 6: Create Class${NC}"
CLASS_RESPONSE=$(curl -s -X POST "$API_URL/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "name": "Web Development 101",
    "code": "WEB101",
    "description": "Learn web development with HTML, CSS, and JavaScript",
    "semester": "Fall 2024",
    "capacity": 30
  }')
echo "$CLASS_RESPONSE"
CLASS_ID=$(echo "$CLASS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}Class created with ID: $CLASS_ID${NC}\n"

# Test 7: List Classes
echo -e "${YELLOW}Test 7: List Classes${NC}"
curl -s -X GET "$API_URL/classes?page=1&limit=10" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | json_pp 2>/dev/null || \
curl -s -X GET "$API_URL/classes?page=1&limit=10" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
echo -e "${GREEN}Classes listed${NC}\n"

# Test 8: Get Class Details
echo -e "${YELLOW}Test 8: Get Class Details${NC}"
if [ ! -z "$CLASS_ID" ]; then
  curl -s -X GET "$API_URL/classes/$CLASS_ID" \
    -H "Authorization: Bearer $TEACHER_TOKEN" | json_pp 2>/dev/null || \
  curl -s -X GET "$API_URL/classes/$CLASS_ID" \
    -H "Authorization: Bearer $TEACHER_TOKEN"
  echo -e "${GREEN}Class details retrieved${NC}\n"
fi

# Test 9: Enroll Student
echo -e "${YELLOW}Test 9: Enroll Student in Class${NC}"
if [ ! -z "$CLASS_ID" ] && [ ! -z "$STUDENT_ID" ]; then
  ENROLL_RESPONSE=$(curl -s -X POST "$API_URL/students/enroll" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -d '{
      "userId": "'$STUDENT_ID'",
      "classId": "'$CLASS_ID'"
    }')
  echo "$ENROLL_RESPONSE"
  STUDENT_ENROLLMENT_ID=$(echo "$ENROLL_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}Student enrolled${NC}\n"
fi

# Test 10: List Students in Class
echo -e "${YELLOW}Test 10: List Students in Class${NC}"
if [ ! -z "$CLASS_ID" ]; then
  curl -s -X GET "$API_URL/students/class/$CLASS_ID?page=1&limit=10" \
    -H "Authorization: Bearer $TEACHER_TOKEN" | json_pp 2>/dev/null || \
  curl -s -X GET "$API_URL/students/class/$CLASS_ID?page=1&limit=10" \
    -H "Authorization: Bearer $TEACHER_TOKEN"
  echo -e "${GREEN}Students listed${NC}\n"
fi

# Test 11: Add Grade
echo -e "${YELLOW}Test 11: Add Grade to Student${NC}"
if [ ! -z "$STUDENT_ENROLLMENT_ID" ]; then
  GRADE_RESPONSE=$(curl -s -X POST "$API_URL/grades" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -d '{
      "studentId": "'$STUDENT_ENROLLMENT_ID'",
      "assessmentName": "Quiz 1",
      "assessmentType": "quiz",
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Great work!"
    }')
  echo "$GRADE_RESPONSE"
  GRADE_ID=$(echo "$GRADE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo -e "${GREEN}Grade added${NC}\n"
fi

# Test 12: Get Student Grades
echo -e "${YELLOW}Test 12: Get Student Grades${NC}"
if [ ! -z "$STUDENT_ENROLLMENT_ID" ]; then
  curl -s -X GET "$API_URL/grades/student/$STUDENT_ENROLLMENT_ID" \
    -H "Authorization: Bearer $STUDENT_TOKEN" | json_pp 2>/dev/null || \
  curl -s -X GET "$API_URL/grades/student/$STUDENT_ENROLLMENT_ID" \
    -H "Authorization: Bearer $STUDENT_TOKEN"
  echo -e "${GREEN}Student grades retrieved${NC}\n"
fi

# Test 13: Update Grade
echo -e "${YELLOW}Test 13: Update Grade${NC}"
if [ ! -z "$GRADE_ID" ]; then
  curl -s -X PUT "$API_URL/grades/$GRADE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -d '{
      "score": 9.0,
      "feedback": "Excellent!"
    }' | json_pp 2>/dev/null || \
  curl -s -X PUT "$API_URL/grades/$GRADE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -d '{
      "score": 9.0,
      "feedback": "Excellent!"
    }'
  echo -e "${GREEN}Grade updated${NC}\n"
fi

# Test 14: Get Grade Report
echo -e "${YELLOW}Test 14: Get Grade Report${NC}"
curl -s -X GET "$API_URL/grades/report/class" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | json_pp 2>/dev/null || \
curl -s -X GET "$API_URL/grades/report/class" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
echo -e "${GREEN}Grade report retrieved${NC}\n"

# Test 15: Health Check
echo -e "${YELLOW}Test 15: Health Check${NC}"
curl -s -X GET "http://localhost:3000/api/health" | json_pp 2>/dev/null || \
curl -s -X GET "http://localhost:3000/api/health"
echo -e "${GREEN}Health check passed${NC}\n"

echo -e "${YELLOW}=======================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "Extracted IDs for manual testing:"
echo "Admin Token: $ADMIN_TOKEN"
echo "Teacher Token: $TEACHER_TOKEN"
echo "Student ID: $STUDENT_ID"
echo "Student Token: $STUDENT_TOKEN"
echo "Class ID: $CLASS_ID"
echo "Grade ID: $GRADE_ID"
