import { Usuario } from './usuario.model';

export interface Profesor {
  id: string;
  usuario_id: string;
  usuario?: Usuario;
  materia: string;
  anos_experiencia?: number;
  fecha_registro?: string;
}
