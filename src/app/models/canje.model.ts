export interface Canje {
  id: string;
  estudiante_id: string;
  beneficio_id: string;
  cantidad: number;
  puntos_gastados: number;
  estado?: 'pendiente' | 'entregado' | 'cancelado';
  fecha_canje?: string;
  fecha_entrega?: string;
}
