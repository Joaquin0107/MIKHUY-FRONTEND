export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida?: boolean;
  fecha_creacion?: string;
}
