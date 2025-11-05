export interface AnalisisNutricional {
  id: string;
  estudiante_id: string;
  fecha_analisis: string;
  proteinas_porcentaje?: number;
  carbohidratos_porcentaje?: number;
  grasas_porcentaje?: number;
  vitamina_a?: number;
  vitamina_c?: number;
  calcio?: number;
  hierro?: number;
  etapa_cambio?: string;
  puntaje_motivacion?: number;
  disposicion_cambio?: number;
  porcentaje_aciertos?: number;
  temas_debiles?: string[];
  fecha_creacion?: string;
}
