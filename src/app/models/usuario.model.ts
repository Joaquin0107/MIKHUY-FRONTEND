export interface Usuario {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  avatar_url?: string;
  rol: 'student' | 'teacher' | 'admin';
  activo?: boolean;
  fecha_creacion?: string;
  ultima_conexion?: string;
}
