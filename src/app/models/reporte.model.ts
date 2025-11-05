export interface Reporte {
  id: string;
  estudiante_id: string;
  profesor_id?: string;
  tipo_reporte: 'mensual' | 'trimestral' | 'personalizado';
  fecha_inicio: string;
  fecha_fin: string;
  contenido_json?: any;
  pdf_url?: string;
  generado_por?: string;
  fecha_generacion?: string;
}
