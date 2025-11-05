export interface SesionJuego {
  id: string;
  progreso_id: string;
  nivel_jugado: number;
  puntos_obtenidos: number;
  tiempo_jugado?: number;
  completado?: boolean;
  fecha_sesion?: string;
}
