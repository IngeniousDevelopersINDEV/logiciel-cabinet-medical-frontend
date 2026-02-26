export type UserRole = 'ADMIN' | 'MEDECIN' | 'SECRETAIRE' | 'PATIENT';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone?: string;
  actif: boolean;
  dateCreation?: string;
  derniereConnexion?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone?: string;
}
