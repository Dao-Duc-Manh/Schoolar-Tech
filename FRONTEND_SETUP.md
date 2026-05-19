# Scholar Tech Frontend - Setup Completo

**Data**: Abril 2026
**Status**: ✅ Projeto inicializado com sucesso
**Tecnologia**: React 18 + TypeScript + Vite + Tailwind CSS

---

## 📋 Checklist de Inicialização

- [x] Projeto React criado com Vite
- [x] TypeScript configurado
- [x] Tailwind CSS integrado e configurado
- [x] Dependências principais instaladas
  - [x] axios (HTTP client)
  - [x] react-router-dom (roteamento)
  - [x] zustand (state management)
  - [x] socket.io-client (chat real-time)
  - [x] react-hook-form (gerenciamento de formulários)
- [x] Estrutura de pastas criada
- [x] Serviços de API configurados
  - [x] apiClient com interceptadores
  - [x] authService
- [x] Store de autenticação (Zustand)
- [x] Tipos TypeScript definidos
- [x] Constantes da aplicação
- [x] Hooks customizados
- [x] Utilidades e helpers
- [x] Estilos Tailwind customizados
- [x] Variáveis de ambiente

---

## 🗂️ Estrutura Atual do Projeto

```
frontend/
├── src/
│   ├── components/              # Componentes reutilizáveis (vazio)
│   │   ├── Common/              # Button, Card, Modal, etc
│   │   ├── Layout/              # Navbar, Sidebar, Footer
│   │   ├── Auth/                # Login form, Register form
│   │   └── Dashboard/           # Dashboard components
│   ├── pages/                   # Páginas da aplicação (vazio)
│   │   ├── Login.tsx            # Página de login
│   │   ├── Register.tsx         # Página de registro
│   │   ├── Dashboard.tsx        # Dashboard principal
│   │   ├── Classes.tsx          # Gestão de classes
│   │   ├── Students.tsx         # Gestão de estudantes
│   │   ├── Grades.tsx           # Gestão de notas
│   │   └── NotFound.tsx         # Página 404
│   ├── services/                # ✅ PRONTO
│   │   ├── api.ts               # Axios client com interceptadores
│   │   ├── authService.ts       # Serviços de autenticação
│   │   ├── classService.ts      # Serviços de classes (futuro)
│   │   ├── studentService.ts    # Serviços de estudantes (futuro)
│   │   ├── gradeService.ts      # Serviços de notas (futuro)
│   │   └── socketService.ts     # Socket.io setup (futuro)
│   ├── stores/                  # ✅ PRONTO
│   │   ├── authStore.ts         # Store de autenticação
│   │   ├── classStore.ts        # Store de classes (futuro)
│   │   └── uiStore.ts           # Store de UI state (futuro)
│   ├── hooks/                   # ✅ PARCIALMENTE PRONTO
│   │   ├── useProtectedRoute.ts # Proteção de rotas
│   │   ├── useForm.ts           # Form handling (futuro)
│   │   └── useFetch.ts          # Data fetching (futuro)
│   ├── utils/                   # ✅ PRONTO
│   │   └── helpers.ts           # Funções utilitárias
│   ├── types/                   # ✅ PRONTO
│   │   └── index.ts             # Definições TypeScript
│   ├── constants/               # ✅ PRONTO
│   │   └── index.ts             # Constantes da app
│   ├── App.tsx                  # Componente raiz (vazio)
│   ├── main.tsx                 # Entrada da app (padrão Vite)
│   ├── index.css                # ✅ Tailwind CSS configurado
│   └── vite-env.d.ts            # Tipos Vite
├── public/
│   └── vite.svg                 # Logo Vite (mantém padrão)
├── .env                         # ✅ Variáveis de ambiente
├── .env.example                 # ✅ Template de .env
├── .gitignore                   # Padrão git
├── vite.config.ts               # Configuração Vite
├── tsconfig.json                # Configuração TypeScript
├── tailwind.config.js           # ✅ Tailwind CSS
├── postcss.config.js            # ✅ PostCSS
├── package.json                 # ✅ Dependências
├── package-lock.json            # Lock npm
└── README.md                    # ✅ Documentação básica
```

---

## 🎯 Próximas Tarefas (Prioridade)

### Fase 2.1: Autenticação & Layout (Esta Semana) 
**Objetivo**: Ter sistema de login/registro funcional com layout base

#### Task 1: Criar Layout Base (2h)
- [ ] Componente Navbar com logo e menus
- [ ] Componente Sidebar para navegação
- [ ] Componente Footer
- [ ] Layout component que agrega todos
- [ ] Responsividade com Tailwind

**Arquivo**: `src/components/Layout/MainLayout.tsx`

```typescript
// Estrutura esperada
export function MainLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return children; // Sem layout em páginas públicas
  }
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
```

#### Task 2: Página de Login (2h)
- [ ] Formulário com email e password
- [ ] Validação com react-hook-form
- [ ] Integração com authService
- [ ] Feedback de erro/loading
- [ ] Redirect após login bem-sucedido

**Arquivo**: `src/pages/Login.tsx`

#### Task 3: Página de Registro (2h)
- [ ] Formulário com fullName, email, password
- [ ] Selector de role (student/teacher)
- [ ] Validação com regex e custom validators
- [ ] Confirmação de senha
- [ ] Integração com authService

**Arquivo**: `src/pages/Register.tsx`

#### Task 4: Roteamento Completo (1h)
- [ ] Configurar React Router
- [ ] Protected routes com autenticação
- [ ] Redirect após logout
- [ ] Tratamento de rotas inválidas

**Arquivo**: `src/App.tsx`

```typescript
// Estrutura esperada
const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'classes', element: <Classes /> },
    ]
  },
  { path: '*', element: <NotFound /> },
]);
```

---

### Fase 2.2: Dashboard Principal (Semana seguinte)
- [ ] Cards de estatísticas
- [ ] Gráficos e charts
- [ ] Quick actions
- [ ] Notificações

### Fase 2.3: Gestão de Classes (Semana seguinte)
- [ ] Lista de classes com paginação
- [ ] Criar/editar classe
- [ ] Visualizar detalhes

### Fase 2.4: Gestão de Estudantes (Semana seguinte)
- [ ] Enrolar estudantes
- [ ] Lista de estudantes
- [ ] Perfil do estudante

### Fase 2.5: Gestão de Notas (Semana seguinte)
- [ ] Adicionar notas
- [ ] Visualizar notas por estudante
- [ ] Relatórios

### Fase 2.6: Chat em Tempo Real (Semana seguinte)
- [ ] Integração Socket.io
- [ ] Interface de chat
- [ ] Salas por classe

---

## 🚀 Como Começar o Desenvolvimento

### 1. Iniciar o Servidor de Desenvolvimento
```bash
cd frontend
npm run dev
```

Abra: http://localhost:5173

### 2. Verificar Backend
```bash
# Em outro terminal
cd backend
npm run dev
```

Abra: http://localhost:3000/api/health

### 3. Começar a Codar

Editar arquivo de exemplo:
```bash
# Abrir VS Code
code .

# Criar novo componente em src/components/Button.tsx
# Modificar src/pages/Login.tsx
# etc...
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar dev server
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Lint com ESLint
```

### Gerenciamento

```bash
# Instalar nova dependência
npm install package-name

# Instalar dev dependency
npm install --save-dev package-name

# Ver dependências desatualizadas
npm outdated

# Atualizar dependências
npm update
```

---

## 📝 Padrões de Código

### Componentes Funcionais
```typescript
interface Props {
  title: string;
  onSubmit?: (data: any) => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  const [state, setState] = useState('');
  const { user } = useAuthStore();
  
  return (
    <div className="card">
      <h2 className="section-title">{title}</h2>
      {/* Content */}
    </div>
  );
}
```

### Usar Zustand Store
```typescript
import { useAuthStore } from '@/stores/authStore';

export function UserProfile() {
  const { user, logout } = useAuthStore();
  
  if (!user) return null;
  
  return (
    <div>
      <p>Welcome, {user.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Chamadas API
```typescript
import apiClient from '@/services/api';

export function ClassList() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  
  useEffect(() => {
    if (!token) return;
    
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/classes?page=1&limit=10');
        setClasses(response.data.data.classes);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [token]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="grid gap-4">
      {classes.map(cls => (
        <ClassCard key={cls.id} class={cls} />
      ))}
    </div>
  );
}
```

---

## 🎨 Exemplo de Página Completa

```typescript
// src/pages/Classes.tsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api';
import { Class } from '@/types';

export function Classes() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuthStore();
  
  useEffect(() => {
    if (!token) return;
    
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(
          '/classes?page=1&limit=20'
        );
        setClasses(response.data.data.classes);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [token]);
  
  const handleCreate = () => {
    // Implementar modal de criar classe
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Minha Classes</h1>
        {user?.role === 'teacher' && (
          <button className="btn btn-primary" onClick={handleCreate}>
            + Nova Classe
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma classe encontrada
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <ClassCard key={cls.id} class={cls} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClassCard({ class: cls }: { class: Class }) {
  return (
    <div className="card card-hover cursor-pointer">
      <h3 className="section-subtitle">{cls.name}</h3>
      <p className="text-muted text-sm mb-2">{cls.code}</p>
      <p className="text-sm mb-4">{cls.description}</p>
      <div className="flex justify-between items-center">
        <span className="badge badge-info">
          {cls.currentEnrollment}/{cls.capacity}
        </span>
        <button className="btn btn-sm btn-primary">View</button>
      </div>
    </div>
  );
}
```

---

## 🔍 Debugging

### Console Logs
```typescript
// Ver estado Zustand
import { useAuthStore } from '@/stores/authStore';

useEffect(() => {
  console.log('Auth state:', useAuthStore.getState());
}, []);
```

### React DevTools
```bash
# Instalar extensão do Chrome
# https://chrome.google.com/webstore/detail/react-developer-tools/

# Usar no código
npm run dev
# Abrir Chrome DevTools > React tab
```

### Tailwind Sakura
```bash
# Ver classes usadas
npm run build
```

---

## 📊 Progresso

**Inicialização**: ✅ Completa
- Projeto criado
- Dependências instaladas
- Estrutura de pastas
- Configurações básicas

**Próximo Passo**: Autenticação & Layout
- Estimado: 7-10 horas
- Prazo: Esta semana

**Roadmap Completo**: 6-8 semanas
- 1 semana: Auth + Layout
- 1 semana: Dashboard
- 1 semana: Classes
- 1 semana: Estudantes
- 1 semana: Notas
- 1 semana: Chat
- 1 semana: Polishing + testes

---

## 📚 Referências

### Documentação
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev/guide)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com/docs/intro)

### Recursos
- [MDN Web Docs](https://developer.mozilla.org)
- [CSS Tricks](https://css-tricks.com)
- [Dev.to](https://dev.to)
- [Stackoverflow](https://stackoverflow.com)

---

## ✅ Checklist Antes de Commitar

Antes de fazer push:
- [ ] Código está formatado e sem erros de lint
- [ ] Não há console.logs desnecessários
- [ ] TypeScript types estão corretos
- [ ] Componentes reutilizáveis quando possível
- [ ] CSS classes Tailwind (não custom CSS)
- [ ] Testes passando
- [ ] README atualizado se necessário

---

**Last Updated**: Abril 15, 2026
**Status**: 🟢 Em Desenvolvimento Ativo
**Next Review**: Abril 20, 2026
