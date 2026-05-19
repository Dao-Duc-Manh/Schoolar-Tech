// Application constants

export const APP_NAME = 'Scholar Tech';
export const APP_VERSION = '1.0.0';

export const USER_ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
} as const;

export const CLASS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  DROPPED: 'dropped',
  COMPLETED: 'completed',
} as const;

export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  MIDTERM: 'midterm',
  FINAL: 'final',
} as const;

export const DOCUMENT_TYPES = {
  MATERIAL: 'material',
  ASSIGNMENT: 'assignment',
  RESOURCE: 'resource',
} as const;

export const PERMISSIONS = {
  ADMIN: ['*'],
  LECTURER: [
    'create:class',
    'read:class',
    'update:class',
    'delete:class',
    'enroll:student',
    'add:grade',
    'read:grade',
  ],
  STUDENT: ['read:class', 'read:grade', 'read:document'],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Desconectado com sucesso!',
    REGISTER: 'Registro realizado com sucesso!',
    CREATE: 'Criado com sucesso!',
    UPDATE: 'Atualizado com sucesso!',
    DELETE: 'Deletado com sucesso!',
  },
  ERROR: {
    UNAUTHORIZED: 'Não autorizado',
    FORBIDDEN: 'Acesso negado',
    NOT_FOUND: 'Não encontrado',
    BAD_REQUEST: 'Requisição inválida',
    SERVER_ERROR: 'Erro no servidor',
    NETWORK_ERROR: 'Erro de conexão',
  },
  VALIDATION: {
    REQUIRED: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Email inválido',
    PASSWORD_TOO_SHORT: 'Senha deve ter pelo menos 6 caracteres',
    PASSWORDS_NOT_MATCH: 'As senhas não conferem',
  },
} as const;

export const COLORS = {
  PRIMARY: '#0ea5e9',
  PRIMARY_DARK: '#0284c7',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  LIGHT: '#f3f4f6',
  GRAY: '#6b7280',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CLASSES: '/classes',
  CLASS_DETAIL: '/classes/:id',
  STUDENTS: '/students',
  GRADES: '/grades',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  CLASSES: {
    LIST: '/classes',
    CREATE: '/classes',
    GET: '/classes/:id',
    UPDATE: '/classes/:id',
    DELETE: '/classes/:id',
  },
  STUDENTS: {
    ENROLL: '/students/enroll',
    LIST_BY_CLASS: '/students/class/:classId',
    GET: '/students/:studentId',
    UPDATE: '/students/:studentId',
  },
  GRADES: {
    ADD: '/grades',
    GET_BY_STUDENT: '/grades/student/:studentId',
    UPDATE: '/grades/:gradeId',
    REPORT: '/grades/report/class',
  },
} as const;
