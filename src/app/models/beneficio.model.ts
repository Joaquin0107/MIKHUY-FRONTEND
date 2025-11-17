export interface Beneficio {
  id: string;
  nombre: string;
  descripcion: string;
  puntosRequeridos: number;
  categoria: string;
  stock: number;
  disponible: boolean;
  imagenUrl: string;
  activo: boolean;
  fechaCreacion: string;
  vecesCanjeado?: number;
  puedeCanjearse?: boolean;
}

export interface CanjeRequest {
  beneficioId: string;
  cantidad: number;
}

export interface CanjeResponse {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteGrado: string;
  estudianteSeccion: string;
  beneficioId: string;
  beneficioNombre: string;
  beneficioDescripcion: string;
  beneficioCategoria: string;
  beneficioImagenUrl: string;
  beneficioPuntosRequeridos: number;
  cantidad: number;
  puntosGastados: number;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  fechaCanje: string;
  fechaEntrega?: string;
  puedeSerCancelado: boolean;
  tiempoTranscurrido: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}