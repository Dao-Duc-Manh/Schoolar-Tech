# Scholar Tech API Testing Guide - Postman/Insomnia

## Como usar este guia

Este guia fornece todas as requisições necessárias para testar a API Scholar Tech usando Postman ou Insomnia. Você pode:

1. **Copiar e colar** cada requisição manualmente
2. **Usar o arquivo JSON** para importar a coleção completa
3. **Seguir a sequência abaixo** para testar cada endpoint

---

## Configuração Inicial

### Base URL
Adicione como variável de ambiente no seu cliente:
```
{{base_url}} = http://localhost:3000/api
```

### Autenticação
A resposta de cada login/registro inclui um token JWT. Salve como:
```
{{admin_token}}
{{teacher_token}}
{{student_token}}
```

---

## Testes em Sequência

### 1. REGISTRO - Admin User
**Método:** POST  
**URL:** `{{base_url}}/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "fullName": "Admin User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "fullName": "Admin User",
      "email": "admin@test.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Ação:** Copie o token para `{{admin_token}}`

---

### 2. REGISTRO - Teacher User
**Método:** POST  
**URL:** `{{base_url}}/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "fullName": "Professor João",
  "email": "teacher@test.com",
  "password": "password123",
  "role": "teacher"
}
```

**Ação:** Copie o token para `{{teacher_token}}`

---

### 3. REGISTRO - Student User
**Método:** POST  
**URL:** `{{base_url}}/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "fullName": "João Silva",
  "email": "student@test.com",
  "password": "student123",
  "role": "student"
}
```

**Resposta:** Extrair `user.id` para `{{student_id}}` e token para `{{student_token}}`

---

### 4. LOGIN
**Método:** POST  
**URL:** `{{base_url}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Resposta esperada (200 OK):** Token JWT

---

### 5. GET USUÁRIO ATUAL
**Método:** GET  
**URL:** `{{base_url}}/auth/me`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "Admin User",
    "email": "admin@test.com",
    "role": "admin",
    "lastLogin": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 6. CRIAR CLASSE
**Método:** POST  
**URL:** `{{base_url}}/classes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Body (JSON):**
```json
{
  "name": "Web Development 101",
  "code": "WEB101",
  "description": "Learn modern web development with HTML, CSS, and JavaScript",
  "semester": "Fall 2024",
  "capacity": 30
}
```

**Resposta esperada (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "class-uuid...",
    "name": "Web Development 101",
    "code": "WEB101",
    "teacherId": "teacher-uuid...",
    "status": "active"
  }
}
```

**Ação:** Copie o `id` para `{{class_id}}`

---

### 7. LISTAR CLASSES
**Método:** GET  
**URL:** `{{base_url}}/classes?page=1&limit=10`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "classes": [...],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 8. OBTER DETALHES DA CLASSE
**Método:** GET  
**URL:** `{{base_url}}/classes/{{class_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "class-uuid...",
    "name": "Web Development 101",
    "code": "WEB101",
    "description": "...",
    "capacity": 30,
    "currentEnrollment": 0,
    "teacher": {
      "id": "...",
      "fullName": "Professor João"
    }
  }
}
```

---

### 9. ENROLAR ESTUDANTE
**Método:** POST  
**URL:** `{{base_url}}/students/enroll`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Body (JSON):**
```json
{
  "userId": "{{student_id}}",
  "classId": "{{class_id}}"
}
```

**Resposta esperada (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "enrollment-uuid...",
    "userId": "...",
    "classId": "{{class_id}}",
    "status": "active",
    "enrollmentDate": "2024-01-01T12:00:00.000Z"
  }
}
```

**Ação:** Copie o `id` para `{{enrollment_id}}`

---

### 10. LISTAR ESTUDANTES DA CLASSE
**Método:** GET  
**URL:** `{{base_url}}/students/class/{{class_id}}?page=1&limit=10`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "enrollment-uuid...",
        "user": {
          "fullName": "João Silva",
          "email": "student@test.com"
        },
        "status": "active",
        "attendance": 0
      }
    ],
    "pagination": {...}
  }
}
```

---

### 11. ADICIONAR NOTA
**Método:** POST  
**URL:** `{{base_url}}/grades`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Body (JSON):**
```json
{
  "studentId": "{{enrollment_id}}",
  "assessmentName": "Quiz 1 - Fundamentals",
  "assessmentType": "quiz",
  "score": 8.5,
  "maxScore": 10,
  "feedback": "Excelente desempenho!"
}
```

**Resposta esperada (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "grade-uuid...",
    "assessmentName": "Quiz 1 - Fundamentals",
    "assessmentType": "quiz",
    "score": 8.5,
    "maxScore": 10,
    "percentage": 85,
    "feedback": "Excelente desempenho!"
  }
}
```

**Ação:** Copie o `id` para `{{grade_id}}`

---

### 12. OBTER NOTAS DO ESTUDANTE
**Método:** GET  
**URL:** `{{base_url}}/grades/student/{{enrollment_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{student_token}}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "id": "grade-uuid...",
        "assessmentName": "Quiz 1 - Fundamentals",
        "assessmentType": "quiz",
        "score": 8.5,
        "maxScore": 10,
        "percentage": 85,
        "feedback": "Excelente desempenho!",
        "gradeDate": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 13. ATUALIZAR NOTA
**Método:** PUT  
**URL:** `{{base_url}}/grades/{{grade_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Body (JSON):**
```json
{
  "score": 9.0,
  "feedback": "Muito bom! Com pequenas melhorias..."
}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "grade-uuid...",
    "score": 9.0,
    "maxScore": 10,
    "percentage": 90,
    "feedback": "Muito bom! Com pequenas melhorias..."
  }
}
```

---

### 14. OBTER RELATÓRIO DE NOTAS
**Método:** GET  
**URL:** `{{base_url}}/grades/report/class`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{teacher_token}}
```

**Query Params (opcional):**
```
studentId: {{enrollment_id}}
classId: {{class_id}}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "report": {
      "totalAssessments": 1,
      "averageGrade": 90,
      "highestGrade": 90,
      "lowestGrade": 90
    }
  }
}
```

---

### 15. HEALTH CHECK
**Método:** GET  
**URL:** `http://localhost:3000/api/health`

**Headers:** (nenhum necessário)

**Resposta esperada (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Erros Comuns

### 401 Unauthorized
**Causa:** Token ausente ou inválido
**Solução:** 
- Verifique se o token foi incluído no header `Authorization: Bearer <token>`
- Verifique se o token não expirou
- Refaça o login para obter um novo token

### 403 Forbidden
**Causa:** Usuário não tem permissão
**Solução:**
- Verifique se o usuário tem a role necessária (teacher/admin)
- Use o token do usuário correto

### 400 Bad Request
**Causa:** Dados faltando ou inválidos
**Solução:**
- Verifique se todos os campos obrigatórios estão presentes
- Valide os tipos de dados

### 409 Conflict
**Causa:** Recurso já existe (ex: email duplicado)
**Solução:**
- Use um email diferente para registro
- Verifique se o código da classe já existe

---

## Dicas para Postman/Insomnia

1. **Salvar tokens automaticamente:**
   - Vá para Tests na requisição de login
   - Adicione: `pm.globals.set("token", pm.response.json().data.token);`

2. **Ordem recomendada de teste:**
   1. Health Check
   2. Register Admin
   3. Register Teacher
   4. Register Student
   5. Login
   6. Get Current User
   7. Create Class
   8. List Classes
   9. Enroll Student
   10. List Students
   11. Add Grade
   12. Get Grades
   13. Update Grade
   14. Get Report

3. **Usar colections:**
   - Crie uma folder para cada recurso (Auth, Classes, Students, Grades)
   - Organize requisições por tipo (GET, POST, PUT, DELETE)

---

## Próximos Passos

Após validar a API:
1. Conectar com frontend (React/Vue)
2. Implementar upload de arquivos
3. Configurar Socket.io para chat em tempo real
4. Preparar para produção (Docker, PostgreSQL remoto)
