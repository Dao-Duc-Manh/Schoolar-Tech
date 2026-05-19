## 🚀 QUICK START - Scholar Tech Backend

### ⚡ Configuração Rápida (5 minutos)

#### 1. Instale PostgreSQL
- Download: https://www.postgresql.org/download/
- Instale e anote a senha do usuário `postgres`
- Abra pgAdmin ou terminal SQL

#### 2. Crie o banco de dados
```sql
CREATE DATABASE scholar_tech_db;
```

#### 3. Configure o arquivo `.env`
```bash
# Substitua a senha
DB_PASSWORD=postgres_password_here
JWT_SECRET=sua_chave_super_secreta_min_32_caracteres
```

#### 4. Inicie o servidor
```bash
cd d:\code 2\backend
npm run dev
```

✅ Servidor rodando em: http://localhost:3000

---

### 📝 Primeiros Passos

#### 1. Registre um usuário (TEACHER)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Prof. João",
    "email": "professor@example.com",
    "password": "senha123",
    "role": "teacher"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "professor@example.com", "role": "teacher" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Copie o `token`** - você usará para os próximos requests!

#### 2. Crie uma classe
```bash
curl -X POST http://localhost:3000/api/classes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Programação Web",
    "code": "CS101",
    "description": "Aprenda desenvolvimento web",
    "semester": "2024-1",
    "capacity": 50
  }'
```

Copie o `id` da classe retornada!

#### 3. Registre um estudante
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Aluno",
    "email": "aluno@example.com",
    "password": "senha123",
    "role": "student"
  }'
```

Copie o `id` do usuário!

#### 4. Enrole o estudante na classe
```bash
curl -X POST http://localhost:3000/api/students/enroll \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "STUDENT_ID_HERE",
    "classId": "CLASS_ID_HERE"
  }'
```

#### 5. Adicione uma nota
```bash
curl -X POST http://localhost:3000/api/grades \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STUDENT_ID_HERE",
    "assessmentName": "Prova 1",
    "assessmentType": "quiz",
    "score": 8.5,
    "maxScore": 10,
    "feedback": "Ótima prova!"
  }'
```

---

### 🛠️ Ferramentas Recomendadas

**Para testar APIs:**
- **Postman**: https://www.postman.com/downloads/
- **Insomnia**: https://insomnia.rest/download
- **Thunder Client** (VS Code): VS Code Extension

### 📊 Estrutura de Dados

```
Usuários
├── Admin (gerencia tudo)
├── Teacher (cria classes, adiciona notas)
└── Student (vê suas classes e notas)

Classes
├── Criadas por Teachers
├── Contêm Students
└── Armazenam Grades e Documents

Students (Enrollment)
├── Associação entre User + Class
├── Armazena notas
└── Novembro, TL, frequência

Grades
├── Notas dos alunos
├── Múltiplas avaliações por aluno
└── Calcula percentual automaticamente

Documents
├── Materiais, tarefas, recursos
├── Upload feito por Teachers
└── Download contabilizado
```

---

### 🔑 JWT Token Lifecycle

```
1. User login → Receive token (valid for 7 days)
   └→ Token contém: id, email, role

2. Add token to header:
   Authorization: Bearer <token>

3. Token expira → Login novamente

4. Token inválido → 401 Unauthorized
```

---

### ❌ Problemas Comuns

**Erro: "connect ECONNREFUSED 127.0.0.1:5432"**
- ❌ PostgreSQL não está rodando
- ✅ Abra pgAdmin ou inicie o PostgreSQL

**Erro: "unauthorized"**
- ❌ Token não incluído ou expirado
- ✅ Faça login novamente e copie o novo token

**Erro: "CORS error"**
- ❌ Frontend está em URL diferente
- ✅ Adicione à `.env` em `CORS_ORIGIN`

---

### 📚 Próximos Passos

1. **Crie o Frontend** - React, Vue ou Angular
2. **Implemente Upload de Documentos** - Multer está pronto
3. **Configure Socket.io Chat** - Chat em tempo real
4. **Deploy** - Heroku, AWS, ou seu próprio servidor

---

### 🎯 Health Check
```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-04-15T10:00:00.000Z"
}
```

---

Enjoy! 🚀 Qualquer dúvida, refira-se ao `README.md`
