import { Usuario } from './usuario.model';

export interface Estudiante {
  id: string;
  usuario_id: string;
  usuario?: Usuario;
  edad: number;
  grado: string;
  seccion: string;
  talla?: number;
  peso?: number;
  puntos_acumulados?: number;
  fecha_registro?: string;
}
