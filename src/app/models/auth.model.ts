// src/app/models/auth.model.ts

// === DTO para login ===
export interface LoginRequest {
  email: string;
  password: string;
}

// === DTO para registro de estudiante ===
export interface RegisterStudentRequest {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  edad?: number;
  colegio?: string;
}

// === DTO para cambiar contraseña ===
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// === Respuesta del backend al autenticarse ===
export interface AuthResponse {
  token: string;
  tipoToken: string;      // Ejemplo: "Bearer"
  rol: string;            // "student", "teacher", "admin"
  usuarioId: number;
  nombreUsuario: string;
}