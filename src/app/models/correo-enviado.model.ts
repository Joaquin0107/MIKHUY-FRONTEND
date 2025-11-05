export interface CorreoEnviado {
  id: string;
  reporte_id?: string;
  destinatario_email: string;
  asunto: string;
  mensaje?: string;
  adjunto_url?: string;
  estado?: 'enviado' | 'fallido' | 'pendiente';
  fecha_envio?: string;
}
