export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
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
  profesorId?: string;
  puntosAcumulados?: number;
  grado?: string;
  seccion?: string;
  materia?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  edad: number;
  grado: string;
  seccion: string;
  talla?: number;
  peso?: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
