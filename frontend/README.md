# Scholar Tech Frontend - React + Vite

> Interface moderna e responsiva para a plataforma de gestão educacional Scholar Tech

## 🚀 Início Rápido

### Requisitos
- Node.js 16+
- npm 7+

### Instalação
```bash
cd frontend
npm install
```

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── stores/             # Estados Zustand
├── hooks/              # Custom hooks
├── utils/              # Funções utilitárias
├── types/              # Definições TypeScript
├── constants/          # Constantes
├── App.tsx             # Componente raiz
└── main.tsx            # Entrada
```

---

## 🛠️ Stack de Tecnologias

- **React 18+** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router 6** - Roteamento
- **Zustand** - State Management
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time

---

## 🔧 Configuração

Crie `.env` com suas variáveis:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Scholar Tech
VITE_ENABLE_CHAT=true
```

---

## 📦 Dependências Instaladas

✅ axios - HTTP client
✅ react-router-dom - Roteamento
✅ zustand - State management
✅ socket.io-client - Real-time chat
✅ tailwindcss - CSS framework
✅ react-hook-form - Forms
✅ postcss & autoprefixer - CSS processing

---

## 📡 Serviços de API

### Autenticação
```typescript
import { authService } from '@/services/authService';

await authService.login(email, password);
await authService.register(fullName, email, password);
authService.logout();
```

### Estado Global
```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, token, login, logout } = useAuthStore();
```

---

## 🎯 Próximas Ações

1. ✅ Projeto React criado
2. ✅ Dependências instaladas
3. ✅ Serviços de API configurados
4. ✅ State management (Zustand) setup
5. ⏳ Criar páginas (Login, Register, Dashboard)
6. ⏳ Conectar ao backend
7. ⏳ Implementar chat real-time

---

## 📚 Documentação Completa

Veja [FRONTEND_SETUP.md](../FRONTEND_SETUP.md) para guia completo.

---

## 💡 Quick Start Componente

```typescript
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

---

## 🔗 Links Úteis

- Backend API: http://localhost:3000/api/health
- Frontend Dev: http://localhost:5173
- Tailwind Docs: https://tailwindcss.com
- React Docs: https://react.dev

---

**Desenvolvido com ❤️ para Scholar Tech**
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
