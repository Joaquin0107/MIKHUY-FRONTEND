export interface CoachRespuesta {
  id: string;
  sesion_id: string;
  pregunta_numero: number;
  pregunta_etapa?: string;
  respuesta_valor: number;
  fecha_respuesta?: string;
}
