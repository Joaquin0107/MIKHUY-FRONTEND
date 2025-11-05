export interface NutrimentalRespuesta {
  id: string;
  sesion_id: string;
  pregunta_numero: number;
  pregunta_tema?: string;
  respuesta_correcta: boolean;
  tiempo_respuesta?: number;
  fecha_respuesta?: string;
}
