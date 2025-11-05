export interface ProgresoJuego {
  id: string;
  estudiante_id: string;
  juego_id: string;
  nivel_actual?: number;
  puntos_ganados?: number;
  veces_jugado?: number;
  ultima_jugada?: string;
  completado?: boolean;
  fecha_inicio?: string;
}
