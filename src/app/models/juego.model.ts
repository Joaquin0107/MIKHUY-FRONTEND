export interface Juego {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  max_niveles?: number;
  puntos_por_nivel?: number;
  activo?: boolean;
  fecha_creacion?: string;
}
