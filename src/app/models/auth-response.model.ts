export interface AuthResponse {
  token: string;
  tokenType?: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  rol: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  avatarUrl?: string;
  estudianteId?: string;
  puntosAcumulados?: number;
  grado?: string;
  seccion?: string;
  profesorId?: string;
  materia?: string;
}
