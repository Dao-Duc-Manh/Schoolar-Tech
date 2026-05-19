# Scholar Tech - Guia de Desenvolvimento Local

## Configuração Inicial

### Requisitos do Sistema
- **Node.js**: v16 ou superior
- **npm**: v7 ou superior
- **PostgreSQL**: v12 ou superior
- **Git**: para versionamento

Verifique as versões instaladas:
```bash
node --version
npm --version
psql --version
git --version
```

---

## Passo 1: Instalar PostgreSQL

### Windows
1. Download: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Execute o instalador
3. Configure a senha do superuser (padrão é `postgres`)
4. Escolha a porta (padrão: 5432)
5. Abra pgAdmin para verificar a instalação

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

---

## Passo 2: Criar o Banco de Dados

### Via pgAdmin (Interface Gráfica)
1. Abra pgAdmin
2. Clique com botão direito em "Databases"
3. Selecione "Create" > "Database"
4. Nome: `scholar_tech_db`
5. Click "Save"

### Via Terminal (CLI)
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar database
CREATE DATABASE scholar_tech_db;

# Verificar
\l

# Sair
\q
```

---

## Passo 3: Configurar Variáveis de Ambiente

### Arquivo .env
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com seu editor preferido:

**Windows (PowerShell):**
```powershell
notepad .env
```

**Linux/macOS:**
```bash
nano .env
```

### Valores Recomendados para Desenvolvimento

```env
# Servidor
NODE_ENV=development
PORT=3000
HOST=localhost

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scholar_tech_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=5
DB_POOL_MIN=1

# JWT
JWT_SECRET=your-super-secret-key-for-development-change-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Email (opcional, para implementações futuras)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

---

## Passo 4: Instalar Dependências

```bash
cd backend
npm install
```

Isso instalará:
- Express.js (framework web)
- PostgreSQL driver e Sequelize (database)
- JWT e bcryptjs (autenticação)
- Socket.io (comunicação em tempo real)
- Multer (upload de arquivos)
- dotenv (variáveis de ambiente)
- E outras ferramentas necessárias

---

## Passo 5: Iniciar o Servidor

### Modo de Desenvolvimento (Com Auto-Reload)
```bash
npm run dev
```

Você verá algo como:
```
✅ Server running on port 3000
✅ Database connected successfully
✅ Models synchronized
```

### Modo de Produção
```bash
npm start
```

---

## Passo 6: Testar a API

### Health Check Rápido
```bash
# Em outro terminal
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Teste Completo com PowerShell
```powershell
cd backend
.\test-api.ps1
```

### Teste com Postman
1. Download: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Abra Postman
3. Importe: `backend/postman_collection.json`
4. Configure variável `base_url` = `http://localhost:3000/api`
5. Run requests na ordem

---

## Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do PostgreSQL
│   ├── models/
│   │   ├── User.js              # Modelo de usuário
│   │   ├── Class.js             # Modelo de classe/curso
│   │   ├── Student.js           # Modelo de enrollment
│   │   ├── Grade.js             # Modelo de notas
│   │   └── Document.js          # Modelo de documentos
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticação
│   │   ├── classController.js   # Lógica de classes
│   │   ├── studentController.js # Lógica de enrollment
│   │   └── gradeController.js   # Lógica de notas
│   ├── routes/
│   │   ├── auth.js              # Endpoints de auth
│   │   ├── classes.js           # Endpoints de classes
│   │   ├── students.js          # Endpoints de students
│   │   └── grades.js            # Endpoints de grades
│   ├── middleware/
│   │   └── auth.js              # JWT e RBAC
│   ├── utils/
│   │   └── validators.js        # Funções de validação
│   └── logs/
│       └── app.log              # Logs da aplicação
├── uploads/                      # Diretório para uploads
├── .env                         # Variáveis de ambiente (não commitar)
├── .env.example                 # Template de .env
├── .gitignore                   # Arquivos ignorados por Git
├── package.json                 # Dependências do projeto
├── package-lock.json            # Lock do npm
├── server.js                    # Arquivo principal
├── README.md                    # Documentação geral
├── QUICK_START.md               # Guia rápido
├── API_SPEC.json                # Especificação da API
├── POSTMAN_GUIDE.md             # Guia do Postman
├── DEPLOY_CHECKLIST.md          # Checklist de deploy
└── LOCAL_DEVELOPMENT.md         # Este arquivo
```

---

## Fluxo de Desenvolvimento

### 1. Criar Nova Feature
```bash
# Criar branch
git checkout -b feature/nova-feature

# Trabalhar nos arquivos
nano src/routes/nova-rota.js
nano src/controllers/novaController.js

# Testar localmente
npm run dev
# Usar Postman ou curl para testar

# Commit
git add .
git commit -m "feat: adicionar nova feature"

# Push
git push origin feature/nova-feature
```

### 2. Fazer Debug
```bash
# Ver logs em tempo real
npm run dev
# Logs aparecerão no console

# Adicionar debug em código
const debug = require('debug')('app:*');
debug('Mensagem de debug');

# Ou com console.log customizado
console.log('🔍 Debug:', variavel);
console.error('❌ Erro:', erro);
```

### 3. Testar Endpoints
```bash
# Teste simples no terminal
curl -X GET http://localhost:3000/api/health

# Teste com autenticação
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer seu-token-aqui"

# POST com dados
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João",
    "email": "joao@test.com",
    "password": "123456"
  }'
```

---

## Problemas Comuns e Soluções

### Error: EADDRINUSE: address already in use :::3000
**Problema:** Outra aplicação está usando a porta 3000

**Solução:**
```bash
# Windows PowerShell
Start-Process -FilePath "taskkill.exe" -ArgumentList "/pid (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Ou mudar a porta no .env
PORT=3001
```

### Error: connect ECONNREFUSED 127.0.0.1:5432
**Problema:** PostgreSQL não está rodando

**Solução:**
```bash
# Windows
# Abra Services e procure por "postgresql-x64"

# macOS
brew services start postgresql@15

# Linux
sudo service postgresql start
```

### Error: relation "users" does not exist
**Problema:** Tabelas não foram criadas no banco de dados

**Solução:**
```bash
# Sequelize criará automaticamente na primeira execução
npm run dev

# Se persistir, sincronize manualmente
# Adicione ao server.js temporariamente:
await sequelize.sync({ force: true });  // CUIDADO: deleta dados!
```

### Error: Unknown authentication method
**Problema:** Versão do PostgreSQL desatualizada

**Solução:**
```bash
# Uninstall e reinstall PostgreSQL 12+
# Ou altere o método de autenticação em postgresql.conf
```

---

## Dicas de Performance

### 1. Usar Eager Loading
```javascript
// ❌ Ruim: N+1 queries
const students = await Student.findAll();
for (let s of students) {
  const user = await User.findByPk(s.userId);  // Query extra por student!
}

// ✅ Bom: 1 query
const students = await Student.findAll({
  include: { model: User }
});
```

### 2. Adicionar Índices no Banco
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_classId ON students(classId);
CREATE INDEX idx_grades_studentId ON grades(studentId);
```

### 3. Usar Paginação
```javascript
// Sempre limitar resultados
const PAGE = 1;
const LIMIT = 20;
const data = await Model.findAll({
  limit: LIMIT,
  offset: (PAGE - 1) * LIMIT
});
```

---

## Ferramentas Úteis

### VS Code Extensions Recomendadas
- **REST Client**: Testar APIs diretamente no editor
- **Thunder Client**: Cliente HTTP integrado
- **ESLint**: Verificar qualidade de código
- **Prettier**: Formatar código automaticamente
- **GitLens**: Ver histórico de Git

### Instalação:
```bash
code --install-extension humao.rest-client
code --install-extension rangav.vscode-thunder-client
```

### Arquivo .restclient.json para testar:
```json
@baseUrl = http://localhost:3000/api
@token = seu-jwt-token-aqui

### Health Check
GET {{baseUrl}}/health

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@test.com",
  "password": "123456"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

---

## Integração com Frontend

### Conectar React/Vue ao Backend

**Arquivo `.env.local` do frontend:**
```
VITE_API_URL=http://localhost:3000/api
# ou
REACT_APP_API_URL=http://localhost:3000/api
```

**Chamada de API (React):**
```javascript
const API_URL = process.env.REACT_APP_API_URL;

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@test.com',
    password: 'password'
  })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);
```

**Header de Autenticação (fetch):**
```javascript
const token = localStorage.getItem('token');

fetch(`${API_URL}/classes`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Commits e Git

### Convenção de Commits (Conventional Commits)
```bash
# Feat - Nova feature
git commit -m "feat: adicionar endpoint de notas"

# Fix - Corrigir bug
git commit -m "fix: corrigir cálculo de percentual de nota"

# Docs - Documentação
git commit -m "docs: atualizar README com instruções"

# Style - Formatação
git commit -m "style: reformatar código com prettier"

# Test - Testes
git commit -m "test: adicionar testes de autenticação"

# Refactor - Refatoração
git commit -m "refactor: simplificar lógica de busca"

# Chore - Manutenção
git commit -m "chore: atualizar dependências"
```

---

## Próximas Etapas

1. **Frontend**: Iniciar desenvolvimento React/Vue
   - Autenticação com JWT
   - Listagem de classes
   - Interface de notas
   - Chat em tempo real (Socket.io)

2. **Melhorias Backend**:
   - Validação mais rigorosa
   - Error handling customizado
   - Rate limiting
   - Logging estruturado

3. **Testes**:
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress)

4. **DevOps**:
   - Docker containerization
   - CI/CD pipeline (GitHub Actions)
   - Production deployment

---

## Contato e Suporte

Para dúvidas ou problemas:
1. Verifique este documento
2. Consulte [README.md](README.md)
3. Verifique logs em `./logs/app.log`
4. Abra issue no repositório Git

Boa sorte! 🚀
