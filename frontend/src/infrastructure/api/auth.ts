import { apiRequest, clearTokens, setTokens } from './client';

export type UserRole = 'admin' | 'client';
export type UserStatut = 'actif' | 'suspendu';

export interface UserDto {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: UserRole;
  statut: UserStatut;
  avatar?: string | null;
  ville?: string;
  date_inscription: string;
  derniere_connexion: string | null;
}

export interface AuthResponse {
  success: boolean;
  user: UserDto;
  tokens: { access: string; refresh: string };
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setTokens(data.tokens.access, data.tokens.refresh);
  return data;
}

export async function registerApi(input: {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/register/', {
    method: 'POST',
    body: input,
    auth: false,
  });
  setTokens(data.tokens.access, data.tokens.refresh);
  return data;
}

export async function logoutApi(refresh: string): Promise<void> {
  try {
    await apiRequest('/auth/logout/', { method: 'POST', body: { refresh } });
  } finally {
    clearTokens();
  }
}

export async function meApi(): Promise<UserDto> {
  return apiRequest<UserDto>('/auth/me/');
}
