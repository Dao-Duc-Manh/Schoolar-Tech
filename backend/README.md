# Scholar Tech - Backend API

## Descrição
Backend API com Node.js + Express para a plataforma de gestão de aprendizado Scholar Tech. Inclui autenticação JWT, gerenciamento de classes, estudantes, notas, upload de documentos e chat em tempo real com Socket.io.

## 🚀 Tecnologias Utilizadas
- **Node.js** + **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticação e autorização
- **Socket.io** - Comunicação em tempo real
- **Multer** - Upload de arquivos
- **bcryptjs** - Hash de senhas

##  Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório** (se aplicável)
```bash
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scholar_tech_db
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

PORT=3000
NODE_ENV=development
```

4. **Crie o banco de dados PostgreSQL**
```sql
CREATE DATABASE scholar_tech_db;
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

#### Registrar
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "João Silva",
      "email": "joao@example.com",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Classes

#### Criar Classe
```http
POST /api/classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Programação Web",
  "code": "CS101",
  "description": "Introdução a desenvolvimento web",
  "semester": "2024-1",
  "capacity": 50
}
```

#### Listar Classes
```http
GET /api/classes?page=1&limit=10
Authorization: Bearer <token>
```

#### Obter Classe por ID
```http
GET /api/classes/:id
Authorization: Bearer <token>
```

#### Atualizar Classe
```http
PUT /api/classes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Novo Nome",
  "description": "Nova descrição"
}
```

#### Deletar Classe
```http
DELETE /api/classes/:id
Authorization: Bearer <token>
```

### Estudantes

#### Enrolar Estudante
```http
POST /api/students/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "student-uuid",
  "classId": "class-uuid"
}
```

#### Listar Estudantes da Classe
```http
GET /api/students/class/:classId?page=1&limit=10
Authorization: Bearer <token>
```

#### Obter Perfil do Estudante
```http
GET /api/students/:studentId
Authorization: Bearer <token>
```

#### Atualizar Estudante
```http
PUT /api/students/:studentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active",
  "midtermGrade": 8.5,
  "finalGrade": 9.0,
  "attendance": 12
}
```

### Notas

#### Adicionar Nota
```http
POST /api/grades
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "student-uuid",
  "assessmentName": "Prova 1",
  "assessmentType": "quiz",
  "score": 8.5,
  "maxScore": 10,
  "feedback": "Ótima performance!"
}
```

#### Obter Notas do Estudante
```http
GET /api/grades/student/:studentId
Authorization: Bearer <token>
```

#### Atualizar Nota
```http
PUT /api/grades/:gradeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 9.0,
  "feedback": "Excelente!"
}
```

#### Relatório de Notas
```http
GET /api/grades/report/class?studentId=uuid&classId=uuid
Authorization: Bearer <token>
```

## 👥 Roles e Permissões

### Admin
- Criar/editar/deletar classes
- Gerenciar todos os usuários
- Ver relatórios completos
- Adicionar/editar notas

### Teacher (Professor)
- Criar classes
- Enrolar estudantes
- Adicionar/editar notas dos estudantes
- Ver relatórios da sua classe

### Student (Estudante)
- Ver suas classes
- Ver suas notas e relatórios
- Participar de chats

## 🔐 Segurança

- Todas as senhas são hash com bcryptjs
- JWT tokens com expiração configurável
- CORS habilitado e configurável
- Validação de entrada em todos os endpoints
- Autorização baseada em roles

## 🚀 Recursos em Tempo Real

O servidor usa Socket.io para comunicação em tempo real:

### Eventos Suportados
- `join-room` - Entrar em uma sala de chat
- `send-message` - Enviar mensagem
- `user-joined` - Usuário entrou na sala
- `receive-message` - Receber mensagem

Exemplo de conexão:
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('join-room', {
    room: 'class-123',
    userId: 'user-uuid',
    userName: 'João Silva'
  });
});

socket.on('receive-message', (data) => {
  console.log(`${data.userName}: ${data.message}`);
});
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js        # Configuração PostgreSQL/Sequelize
│   ├── controllers/           # Controladores de lógica
│   │   ├── authController.js
│   │   ├── classController.js
│   │   ├── studentController.js
│   │   └── gradeController.js
│   ├── middleware/            # Middlewares
│   │   └── auth.js
│   ├── models/                # Modelos Sequelize
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Student.js
│   │   ├── Grade.js
│   │   └── Document.js
│   ├── routes/                # Rotas API
│   │   ├── auth.js
│   │   ├── classes.js
│   │   ├── students.js
│   │   └── grades.js
│   └── utils/                 # Funções utilitárias
├── uploads/                   # Diretório de uploads
├── server.js                  # Arquivo principal
├── package.json
├── .env.example
└── README.md
```

## 🐛 Troubleshooting

### Erro de conexão ao banco de dados
- Verifique se PostgreSQL está rodando
- Confirme as variáveis de ambiente
- Verifique credenciais do banco

### Erro de autenticação
- Confirme que o token não expirou
- Verifique o header `Authorization: Bearer <token>`
- Regenere o token fazendo login novamente

### CORS Errors
- Verifique a variável `CORS_ORIGIN` no `.env`
- Certifique-se que a URL do frontend está incluída

## 📝 Licença
ISC

## 📧 Suporte
Para mais informações ou suporte, entre em contato com o time Scholar Tech.
