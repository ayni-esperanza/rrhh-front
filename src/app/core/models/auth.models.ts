export type Role = 'admin' | 'rrhh' | 'supervisor' | 'colaborador';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  user: UserSession | null;
}