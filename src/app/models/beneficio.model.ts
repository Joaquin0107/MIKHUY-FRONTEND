export interface Beneficio {
  id: string;
  nombre: string;
  descripcion?: string;
  puntos_requeridos: number;
  categoria?: string;
  stock?: number;
  imagen_url?: string;
  activo?: boolean;
  fecha_creacion?: string;
}
