# 📁 Estrutura Completa do Projeto Scholar Tech

```
d:\code 2\
├── 📂 backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Sequelize + PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── classController.js
│   │   │   ├── studentController.js
│   │   │   ├── gradeController.js
│   │   │   └── documentController.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT + Authorization
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Class.js
│   │   │   ├── Student.js
│   │   │   ├── Grade.js
│   │   │   └── Document.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── classes.js
│   │   │   ├── students.js
│   │   │   └── grades.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── sockets/
│   │       └── chat.js           # Socket.io handlers
│   ├── uploads/                  # Diretório de arquivos
│   ├── server.js                 # Entry point
│   ├── package.json
│   ├── .env                      # Variáveis de ambiente
│   ├── .env.example
│   ├── README.md
│   └── .gitignore
│
├── 📂 frontend-new/              # React/Vue/Angular Frontend (TODO)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── 📂 stitch_ai_h_c_t_p_h_s/     # UI Statics (original)
│   └── ... (16 páginas HTML atualizadas com shared-nav)
│
├── 📄 index.html                 # Home page principal
├── 📄 shared-nav.html            # Navegação compartilhada
├── 📄 config.json
├── 📄 opencode.json
├── 📄 TODO.md
├── 📄 RELATORIO_FINAL.md         # Relatório de integração
├── 📄 QUICK_START.md             # Guia rápido
└── 📄 PROJECT_STRUCTURE.md       # Este arquivo

## 🏗️ Arquitetura

### Frontend (HTML/CSS - Estático)
- Páginas HTML com Tailwind CSS
- Navegação unificada com shared-nav.html
- Pode ser substituído por React/Vue/Angular

### Backend (Node.js + Express)
- API RESTful com autenticação JWT
- Banco de dados PostgreSQL + Sequelize ORM
- Socket.io para chat em tempo real
- Upload de arquivos com Multer
- Role-based access control (Admin/Teacher/Student)

### Banco de Dados (PostgreSQL)
```
users
├── id (UUID)
├── fullName
├── email (unique)
├── password (hashed)
├── role (admin/teacher/student)
├── avatar
├── lastLogin
└── timestamps

classes
├── id (UUID)
├── name
├── code (unique)
├── description
├── teacherId (FK → users)
├── semester
├── capacity
├── currentEnrollment
├── status
└── timestamps

students (enrollment)
├── id (UUID)
├── userId (FK → users)
├── classId (FK → classes)
├── studentCode
├── enrollmentDate
├── status
├── midtermGrade
├── finalGrade
├── attendance
└── timestamps

grades
├── id (UUID)
├── studentId (FK → students)
├── assessmentName
├── assessmentType (quiz/assignment/midterm/final)
├── score
├── maxScore
├── percentage
├── feedback
└── timestamps

documents
├── id (UUID)
├── title
├── fileName
├── filePath
├── fileSize
├── fileType
├── uploadedBy (FK → users)
├── classId (FK → classes)
├── documentType (material/assignment/resource)
└── timestamps
```

## 🚀 Fluxo de Desenvolvimento

### Fase 1: Backend (Atual) ✅
- [x] API RESTful com autenticação
- [x] Modelos Sequelize
- [x] Controladores e rotas
- [x] Middleware de autenticação
- [ ] Upload de documentos
- [ ] Chat/Socket.io (partial)
- [ ] Tests unitários
- [ ] Swagger/OpenAPI docs

### Fase 2: Frontend (React)
- [ ] Setup React + Vite
- [ ] Componentes reutilizáveis
- [ ] Integração com API
- [ ] Estado com Redux/Zustand
- [ ] Autenticação com JWT
- [ ] Interface para teachers
- [ ] Dashboard para students
- [ ] Real-time chat UI

### Fase 3: Melhorias
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Analytics & reports
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] Video conferencing (Zoom/WebRTC)

## 📋 Checklist de Configuração

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `scholar_tech_db` criado
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Dependências instaladas (npm install)
- [ ] Servidor rodando (npm run dev)
- [ ] API testada com Postman/Insomnia
- [ ] Frontend começado (React/Vue/Angular)
- [ ] Database sincronizado
- [ ] CORS configurado
- [ ] JWT_SECRET atualizado em produção

## 🔐 Segurança - Checklist Produção

- [ ] JWT_SECRET alterado (min 32 chars)
- [ ] DB_PASSWORD alterada
- [ ] NODE_ENV = production
- [ ] CORS_ORIGIN limitado
- [ ] HTTPS habilitado
- [ ] Rate limiting implementado
- [ ] Input validation em todos endpoints
- [ ] SQL injection protection (Sequelize)
- [ ] XSS protection headers
- [ ] CSRF tokens implementados
- [ ] Senhas com bcrypt (salt rounds ≥ 10)
- [ ] Backup automático do database

## 📞 API Endpoints Rápida Referência

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/register | Registrar usuário |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuário atual |
| POST | /api/classes | Criar classe |
| GET | /api/classes | Listar classes |
| GET | /api/classes/:id | Obter classe |
| PUT | /api/classes/:id | Atualizar classe |
| DELETE | /api/classes/:id | Deletar classe |
| POST | /api/students/enroll | Enrolar estudante |
| GET | /api/students/class/:classId | Listar estudantes |
| GET | /api/students/:id | Perfil do estudante |
| POST | /api/grades | Adicionar nota |
| GET | /api/grades/student/:id | Notas do estudante |
| PUT | /api/grades/:id | Atualizar nota |

## 🛠️ Tecnologias Stack

### Backend
- Node.js v16+
- Express.js 5.x
- PostgreSQL 12+
- Sequelize ORM
- JWT authentication
- Socket.io
- Bcryptjs
- Multer

### Frontend (Sugerido)
- React 18+ ou Vue 3+ ou Angular 15+
- Tailwind CSS
- Axios/Fetch API
- Socket.io client
- Redux/Zustand/Pinia

### DevOps
- Docker (coming soon)
- Docker Compose
- GitHub Actions
- Heroku/AWS/Azure

## 📊 Estatísticas do Projeto

- **Total de Commits**: -
- **Arquivos criados**: 50+
- **Linhas de código**: 3000+
- **Dependências**: 20+
- **Endpoints API**: 20+
- **Models**: 5
- **Routes**: 4
- **Controllers**: 4
- **Middleware**: 1

## 🤝 Contribuindo

1. Crie uma branch feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através de:
- Email: team@scholartech.com
- GitHub: https://github.com/scholartech

---

**Atualizado em**: 15 de Abril de 2026
**Status**: 🟡 Em Desenvolvimento (Backend 80%, Frontend 0%)
