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

interface AmigoStorage {
  amigos: string[];
  enviadas: string[];
  recibidas: { id: string; nombre: string }[];
}

// ─── Servicio ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AmigoService {

  // Usa la misma base URL que tus otros servicios
  private readonly BASE = 'https://mikhuy-backend.onrender.com/api/estudiantes';

  constructor(private http: HttpClient) {}

  // ── HTTP ──────────────────────────────────────────────────────────────────

  /** GET /api/estudiantes/companeros */
  getCompaneros(): Observable<Companero[]> {
    return this.http
      .get<{ success: boolean; data: Companero[] }>(
        `${this.BASE}/companeros`,
        { headers: this.authHeaders() }
      )
      .pipe(map((r) => r.data ?? []));
  }

  /** POST /api/estudiantes/notificar-amigo */
  private notificar(payload: {
    destinatarioEstudianteId: string;
    tipo: string;
    mensaje: string;
    nombreRemitente: string;
    remitenteEstudianteId: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${this.BASE}/notificar-amigo`,
      payload,
      { headers: this.authHeaders() }
    );
  }

  // ── Acciones de amistad ───────────────────────────────────────────────────

  enviarSolicitud(
    miId: string,
    miNombre: string,
    destinatario: Companero
  ): Observable<void> {
    const store = this.getStore(miId);
    if (!store.enviadas.includes(destinatario.id)) {
      store.enviadas.push(destinatario.id);
      this.saveStore(miId, store);
    }
    return this.notificar({
      destinatarioEstudianteId: destinatario.id,
      tipo: 'amistad_solicitud',
      mensaje: `${miNombre} te envió una solicitud de amistad`,
      nombreRemitente: miNombre,
      remitenteEstudianteId: miId,
    });
  }

  aceptarSolicitud(
    miId: string,
    miNombre: string,
    remitenteId: string,
    remitenteNombre: string
  ): Observable<void> {
    const store = this.getStore(miId);
    store.recibidas = store.recibidas.filter((r) => r.id !== remitenteId);
    if (!store.amigos.includes(remitenteId)) store.amigos.push(remitenteId);
    this.saveStore(miId, store);

    return this.notificar({
      destinatarioEstudianteId: remitenteId,
      tipo: 'amistad_aceptada',
      mensaje: `${miNombre} aceptó tu solicitud de amistad`,
      nombreRemitente: miNombre,
      remitenteEstudianteId: miId,
    });
  }

  rechazarSolicitud(
    miId: string,
    miNombre: string,
    remitenteId: string
  ): Observable<void> {
    const store = this.getStore(miId);
    store.recibidas = store.recibidas.filter((r) => r.id !== remitenteId);
    this.saveStore(miId, store);

    return this.notificar({
      destinatarioEstudianteId: remitenteId,
      tipo: 'amistad_rechazada',
      mensaje: `${miNombre} rechazó tu solicitud de amistad`,
      nombreRemitente: miNombre,
      remitenteEstudianteId: miId,
    });
  }

  eliminarAmigo(miId: string, amigoId: string): void {
    const store = this.getStore(miId);
    store.amigos = store.amigos.filter((a) => a !== amigoId);
    this.saveStore(miId, store);
  }

  // ── Procesamiento de notificaciones ──────────────────────────────────────
  //
  // El back codifica el remitenteEstudianteId al final del mensaje separado por "|":
  //   mensaje = "Juan Pérez te envió una solicitud de amistad|<uuid>"
  //
  // Llamar en ngOnInit después de cargar notificaciones del back.

  procesarNotificacionesAmistad(
    miId: string,
    notificaciones: Array<{ tipo?: string; mensaje?: string }>
  ): void {
    const store = this.getStore(miId);
    let changed = false;

    for (const notif of notificaciones) {
      if (!notif.tipo?.startsWith('amistad_')) continue;

      // Parsear remitenteId del mensaje: "texto visible|<uuid>"
      const partes = (notif.mensaje ?? '').split('|');
      const remitenteId = partes[1]?.trim();
      const textoVisible = partes[0]?.trim() ?? '';
      if (!remitenteId) continue;

      if (notif.tipo === 'amistad_solicitud') {
        const yaExiste = store.recibidas.some((r) => r.id === remitenteId);
        const somoAmigos = store.amigos.includes(remitenteId);
        if (!yaExiste && !somoAmigos) {
          // Extraer nombre del texto: "X te envió una solicitud de amistad"
          const nombre = textoVisible.split(' te ')[0] ?? 'Compañero';
          store.recibidas.push({ id: remitenteId, nombre });
          changed = true;
        }
      } else if (notif.tipo === 'amistad_aceptada') {
        store.enviadas = store.enviadas.filter((e) => e !== remitenteId);
        if (!store.amigos.includes(remitenteId)) {
          store.amigos.push(remitenteId);
          changed = true;
        }
      } else if (notif.tipo === 'amistad_rechazada') {
        store.enviadas = store.enviadas.filter((e) => e !== remitenteId);
        changed = true;
      }
    }

    if (changed) this.saveStore(miId, store);
  }

  // ── Consultas de estado ───────────────────────────────────────────────────

  getEstado(miId: string, otroId: string): EstadoAmistad {
    const store = this.getStore(miId);
    if (store.amigos.includes(otroId))                    return 'amigos';
    if (store.enviadas.includes(otroId))                  return 'pendiente_enviada';
    if (store.recibidas.some((r) => r.id === otroId))     return 'pendiente_recibida';
    return 'ninguno';
  }

  getAmigos(miId: string): string[] {
    return this.getStore(miId).amigos;
  }

  getSolicitudesRecibidas(miId: string): { id: string; nombre: string }[] {
    return this.getStore(miId).recibidas;
  }

  getSolicitudesEnviadas(miId: string): string[] {
    return this.getStore(miId).enviadas;
  }

  // ── localStorage ──────────────────────────────────────────────────────────

  private storageKey(id: string): string {
    return `mikhuy_amigos_${id}`;
  }

  getStore(id: string): AmigoStorage {
    try {
      const raw = localStorage.getItem(this.storageKey(id));
      if (raw) return JSON.parse(raw) as AmigoStorage;
    } catch { /* JSON corrupto */ }
    return { amigos: [], enviadas: [], recibidas: [] };
  }

  saveStore(id: string, store: AmigoStorage): void {
    localStorage.setItem(this.storageKey(id), JSON.stringify(store));
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  private authHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}