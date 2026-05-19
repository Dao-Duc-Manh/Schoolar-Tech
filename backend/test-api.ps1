# PowerShell API Testing Script for Scholar Tech
# Usage: powershell.exe -ExecutionPolicy Bypass -File test-api.ps1
# Or in PowerShell terminal: .\test-api.ps1

$API_URL = "http://localhost:3000/api"
$TEACHER_EMAIL = "teacher@test.com"
$TEACHER_PASSWORD = "password123"
$ADMIN_EMAIL = "admin@test.com"
$ADMIN_PASSWORD = "admin123"

# Function to pretty print JSON
function Format-JsonOutput {
    param($JsonString)
    try {
        $JsonString | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
    catch {
        $JsonString
    }
}

Write-Host "Scholar Tech API Testing Script" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host "Testing endpoint: $API_URL" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register Admin User
Write-Host "Test 1: Register Admin User" -ForegroundColor Yellow
$adminBody = @{
    fullName = "Admin User"
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
    role = "admin"
} | ConvertTo-Json

$adminResponse = Invoke-WebRequest -Uri "$API_URL/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $adminBody `
    -UseBasicParsing

$adminContent = $adminResponse.Content | ConvertFrom-Json
$ADMIN_TOKEN = $adminContent.data.token

Write-Host $adminResponse.Content -ForegroundColor Green
Write-Host "✓ Admin Token extracted" -ForegroundColor Green
Write-Host ""

# Test 2: Register Teacher User
Write-Host "Test 2: Register Teacher User" -ForegroundColor Yellow
$teacherBody = @{
    fullName = "Teacher User"
    email = $TEACHER_EMAIL
    password = $TEACHER_PASSWORD
    role = "teacher"
} | ConvertTo-Json

$teacherResponse = Invoke-WebRequest -Uri "$API_URL/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $teacherBody `
    -UseBasicParsing

$teacherContent = $teacherResponse.Content | ConvertFrom-Json
$TEACHER_TOKEN = $teacherContent.data.token

Write-Host $teacherResponse.Content -ForegroundColor Green
Write-Host "✓ Teacher Token extracted" -ForegroundColor Green
Write-Host ""

# Test 3: Register Student User
Write-Host "Test 3: Register Student User" -ForegroundColor Yellow
$studentBody = @{
    fullName = "Student User"
    email = "student@test.com"
    password = "student123"
    role = "student"
} | ConvertTo-Json

$studentResponse = Invoke-WebRequest -Uri "$API_URL/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $studentBody `
    -UseBasicParsing

$studentContent = $studentResponse.Content | ConvertFrom-Json
$STUDENT_ID = $studentContent.data.user.id
$STUDENT_TOKEN = $studentContent.data.token

Write-Host $studentResponse.Content -ForegroundColor Green
Write-Host "✓ Student ID and Token extracted" -ForegroundColor Green
Write-Host ""

# Test 4: Login
Write-Host "Test 4: Login Test" -ForegroundColor Yellow
$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -UseBasicParsing

Write-Host (Format-JsonOutput $loginResponse.Content) -ForegroundColor Green
Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host ""

# Test 5: Get Current User
Write-Host "Test 5: Get Current User" -ForegroundColor Yellow
$currentUserResponse = Invoke-WebRequest -Uri "$API_URL/auth/me" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" } `
    -UseBasicParsing

Write-Host (Format-JsonOutput $currentUserResponse.Content) -ForegroundColor Green
Write-Host "✓ Current user retrieved" -ForegroundColor Green
Write-Host ""

# Test 6: Create Class (Teacher)
Write-Host "Test 6: Create Class" -ForegroundColor Yellow
$classBody = @{
    name = "Web Development 101"
    code = "WEB101"
    description = "Learn web development with HTML, CSS, and JavaScript"
    semester = "Fall 2024"
    capacity = 30
} | ConvertTo-Json

$classResponse = Invoke-WebRequest -Uri "$API_URL/classes" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
    -Body $classBody `
    -UseBasicParsing

$classContent = $classResponse.Content | ConvertFrom-Json
$CLASS_ID = $classContent.data.id

Write-Host (Format-JsonOutput $classResponse.Content) -ForegroundColor Green
Write-Host "✓ Class created with ID: $CLASS_ID" -ForegroundColor Green
Write-Host ""

# Test 7: List Classes
Write-Host "Test 7: List Classes" -ForegroundColor Yellow
$listResponse = Invoke-WebRequest -Uri "$API_URL/classes?page=1&limit=10" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
    -UseBasicParsing

Write-Host (Format-JsonOutput $listResponse.Content) -ForegroundColor Green
Write-Host "✓ Classes listed" -ForegroundColor Green
Write-Host ""

# Test 8: Get Class Details
Write-Host "Test 8: Get Class Details" -ForegroundColor Yellow
if ($CLASS_ID) {
    $detailResponse = Invoke-WebRequest -Uri "$API_URL/classes/$CLASS_ID" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
        -UseBasicParsing

    Write-Host (Format-JsonOutput $detailResponse.Content) -ForegroundColor Green
    Write-Host "✓ Class details retrieved" -ForegroundColor Green
}
Write-Host ""

# Test 9: Enroll Student
Write-Host "Test 9: Enroll Student in Class" -ForegroundColor Yellow
if ($CLASS_ID -and $STUDENT_ID) {
    $enrollBody = @{
        userId = $STUDENT_ID
        classId = $CLASS_ID
    } | ConvertTo-Json

    $enrollResponse = Invoke-WebRequest -Uri "$API_URL/students/enroll" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
        -Body $enrollBody `
        -UseBasicParsing

    $enrollContent = $enrollResponse.Content | ConvertFrom-Json
    $STUDENT_ENROLLMENT_ID = $enrollContent.data.id

    Write-Host (Format-JsonOutput $enrollResponse.Content) -ForegroundColor Green
    Write-Host "✓ Student enrolled" -ForegroundColor Green
}
Write-Host ""

# Test 10: List Students in Class
Write-Host "Test 10: List Students in Class" -ForegroundColor Yellow
if ($CLASS_ID) {
    $studentsResponse = Invoke-WebRequest -Uri "$API_URL/students/class/$CLASS_ID?page=1&limit=10" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
        -UseBasicParsing

    Write-Host (Format-JsonOutput $studentsResponse.Content) -ForegroundColor Green
    Write-Host "✓ Students listed" -ForegroundColor Green
}
Write-Host ""

# Test 11: Add Grade
Write-Host "Test 11: Add Grade to Student" -ForegroundColor Yellow
if ($STUDENT_ENROLLMENT_ID) {
    $gradeBody = @{
        studentId = $STUDENT_ENROLLMENT_ID
        assessmentName = "Quiz 1"
        assessmentType = "quiz"
        score = 8.5
        maxScore = 10
        feedback = "Great work!"
    } | ConvertTo-Json

    $gradeResponse = Invoke-WebRequest -Uri "$API_URL/grades" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
        -Body $gradeBody `
        -UseBasicParsing

    $gradeContent = $gradeResponse.Content | ConvertFrom-Json
    $GRADE_ID = $gradeContent.data.id

    Write-Host (Format-JsonOutput $gradeResponse.Content) -ForegroundColor Green
    Write-Host "✓ Grade added" -ForegroundColor Green
}
Write-Host ""

# Test 12: Get Student Grades
Write-Host "Test 12: Get Student Grades" -ForegroundColor Yellow
if ($STUDENT_ENROLLMENT_ID) {
    $getGradesResponse = Invoke-WebRequest -Uri "$API_URL/grades/student/$STUDENT_ENROLLMENT_ID" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $STUDENT_TOKEN" } `
        -UseBasicParsing

    Write-Host (Format-JsonOutput $getGradesResponse.Content) -ForegroundColor Green
    Write-Host "✓ Student grades retrieved" -ForegroundColor Green
}
Write-Host ""

# Test 13: Update Grade
Write-Host "Test 13: Update Grade" -ForegroundColor Yellow
if ($GRADE_ID) {
    $updateGradeBody = @{
        score = 9.0
        feedback = "Excellent!"
    } | ConvertTo-Json

    $updateGradeResponse = Invoke-WebRequest -Uri "$API_URL/grades/$GRADE_ID" `
        -Method PUT `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
        -Body $updateGradeBody `
        -UseBasicParsing

    Write-Host (Format-JsonOutput $updateGradeResponse.Content) -ForegroundColor Green
    Write-Host "✓ Grade updated" -ForegroundColor Green
}
Write-Host ""

# Test 14: Get Grade Report
Write-Host "Test 14: Get Grade Report" -ForegroundColor Yellow
$reportResponse = Invoke-WebRequest -Uri "$API_URL/grades/report/class" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer $TEACHER_TOKEN" } `
    -UseBasicParsing

Write-Host (Format-JsonOutput $reportResponse.Content) -ForegroundColor Green
Write-Host "✓ Grade report retrieved" -ForegroundColor Green
Write-Host ""

# Test 15: Health Check
Write-Host "Test 15: Health Check" -ForegroundColor Yellow
$healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" `
    -Method GET `
    -UseBasicParsing

Write-Host (Format-JsonOutput $healthResponse.Content) -ForegroundColor Green
Write-Host "✓ Health check passed" -ForegroundColor Green
Write-Host ""

Write-Host "=======================================" -ForegroundColor Yellow
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Extracted IDs for manual testing:" -ForegroundColor Cyan
Write-Host "Admin Token: $ADMIN_TOKEN"
Write-Host "Teacher Token: $TEACHER_TOKEN"
Write-Host "Student ID: $STUDENT_ID"
Write-Host "Student Token: $STUDENT_TOKEN"
Write-Host "Class ID: $CLASS_ID"
Write-Host "Grade ID: $GRADE_ID"
