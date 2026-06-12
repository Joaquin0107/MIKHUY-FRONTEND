import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ─── Modelos ───────────────────────────────────────────────────────────────

export interface Companero {
  id: string;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
  puntosAcumulados: number;
  juegosCompletados: number;
  avatarUrl?: string;
}

export type EstadoAmistad =
  | 'ninguno'
  | 'pendiente_enviada'
  | 'pendiente_recibida'
  | 'amigos';

// ─── Servicio ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AmigoService {

  private readonly BASE = 'https://mikhuy-backend.onrender.com/api/estudiantes';
  private readonly AMISTADES_BASE = 'https://mikhuy-backend.onrender.com/api/amistades';

  constructor(private http: HttpClient) {}

  // ── Compañeros ──────────────────────────────────────────────────────────

  /** GET /api/estudiantes/companeros */
  getCompaneros(): Observable<Companero[]> {
    return this.http
      .get<{ success: boolean; data: Companero[] }>(
        `${this.BASE}/companeros`,
        { headers: this.authHeaders() },
      )
      .pipe(map((r) => r.data ?? []));
  }

  // ── Amistad: lecturas ─────────────────────────────────────────────────────

  /** GET /api/amistades — amigos confirmados */
  getAmigos(): Observable<Companero[]> {
    return this.http
      .get<{ success: boolean; data: Companero[] }>(`${this.AMISTADES_BASE}`, { headers: this.authHeaders() })
      .pipe(map(res => res.data || [])); 
  }

  /** GET /api/amistades/solicitudes-recibidas */
  getSolicitudesRecibidas(): Observable<any[]> {
    return this.http
      .get<{ success: boolean; data: any[] }>(`${this.AMISTADES_BASE}/solicitudes-recibidas`, { headers: this.authHeaders() })
      .pipe(map(res => res.data || []));
  }

  /** GET /api/amistades/solicitudes-enviadas — IDs de estudiantes con solicitud enviada */
  getSolicitudesEnviadas(): Observable<string[]> {
    return this.http
      .get<{ success: boolean; data: string[] }>(
        `${this.AMISTADES_BASE}/solicitudes-enviadas`,
        { headers: this.authHeaders() },
      )
      .pipe(map((r) => r.data ?? []));
  }

  /** GET /api/amistades/estado/{otroId} */
  getEstado(otroId: string): Observable<EstadoAmistad> {
    return this.http
      .get<{ success: boolean; data: { estado: EstadoAmistad } }>(
        `${this.AMISTADES_BASE}/estado/${otroId}`,
        { headers: this.authHeaders() },
      )
      .pipe(map((r) => r.data?.estado ?? 'ninguno'));
  }

  // ── Amistad: acciones ─────────────────────────────────────────────────────

  /** POST /api/amistades/solicitar/{receptorId} */
  enviarSolicitud(destinatarioId: string): Observable<void> {
    return this.http.post<void>(
      `${this.AMISTADES_BASE}/solicitar/${destinatarioId}`,
      {},
      { headers: this.authHeaders() },
    );
  }

  /** POST /api/amistades/aceptar/{solicitanteId} */
  aceptarSolicitud(remitenteId: string): Observable<void> {
    return this.http.post<void>(
      `${this.AMISTADES_BASE}/aceptar/${remitenteId}`,
      {},
      { headers: this.authHeaders() },
    );
  }

  /** DELETE /api/amistades/{otroId} — rechaza solicitud pendiente o elimina amistad */
  eliminarRelacion(otroId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.AMISTADES_BASE}/${otroId}`,
      { headers: this.authHeaders() },
    );
  }

  // ── Notificaciones (opcional, solo para avisar al otro usuario) ───────────

  /** POST /api/estudiantes/notificar-amigo */
  notificar(payload: {
    destinatarioEstudianteId: string;
    tipo: string;
    mensaje: string;
    nombreRemitente: string;
    remitenteEstudianteId: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${this.BASE}/notificar-amigo`,
      payload,
      { headers: this.authHeaders() },
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  private authHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}