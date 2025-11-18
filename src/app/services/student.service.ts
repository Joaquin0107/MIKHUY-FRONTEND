import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Estudiante } from '../models/estudiante.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo?: string;
  icon?: string;
  title?: string;
  time?: string;
}

export interface RankingResponse {
  ranking: StudentRanking[];
  totalEstudiantes: number;
  miPosicion: StudentRanking | null;
}

export interface StudentRanking {
  posicion: number;
  estudianteId: string;
  nombre: string;
  grado: string;
  seccion: string;
  puntosAcumulados: number;
  avatarUrl?: string;
  esTop3: boolean;
  esMiPosicion: boolean;
  juegosCompletados: number;
}

export interface StudentListResponse {
  id: string;
  usuarioId: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  edad: number;
  grado: string;
  seccion: string;
  talla?: number;
  peso?: number;
  puntosAcumulados: number;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/estudiantes`;

  // BehaviorSubject para mantener los puntos sincronizados
  private puntosSubject = new BehaviorSubject<number>(0);
  public puntos$ = this.puntosSubject.asObservable();

  // BehaviorSubject para notificaciones
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar puntos iniciales desde localStorage si existen
    const puntosGuardados = localStorage.getItem('studentPoints');
    if (puntosGuardados) {
      this.puntosSubject.next(parseInt(puntosGuardados));
    }
  }

  /**
   * Método privado para obtener headers con token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener puntos actuales del estudiante desde el servidor
   */
  getMisPuntos(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/puntos`).pipe(
      tap(response => {
        if (response.success && response.data !== undefined) {
          this.actualizarPuntos(response.data);
        }
      })
    );
  }

  getMiPerfil(): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.apiUrl}/perfil`);
  }

  /**
   * Obtener notificaciones del estudiante
   */
  getMisNotificaciones(): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(`${this.apiUrl}/mis-notificaciones`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.notificacionesSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Actualizar puntos localmente y en el BehaviorSubject
   */
  actualizarPuntos(puntos: number): void {
    this.puntosSubject.next(puntos);
    localStorage.setItem('studentPoints', puntos.toString());
  }

  /**
   * Sumar puntos a los actuales (útil después de completar un juego)
   */
  sumarPuntos(puntosGanados: number): void {
    const puntosActuales = this.puntosSubject.value;
    const nuevosPuntos = puntosActuales + puntosGanados;
    this.actualizarPuntos(nuevosPuntos);
  }

  /**
   * Obtener puntos actuales (valor sincrónico)
   */
  getPuntosActuales(): number {
    return this.puntosSubject.value;
  }

  /**
   * Refrescar puntos desde el servidor
   */
  refrescarPuntos(): void {
    this.getMisPuntos().subscribe({
      next: (response) => {
        console.log('Puntos actualizados desde el servidor:', response.data);
      },
      error: (err) => {
        console.error('Error al refrescar puntos:', err);
      }
    });
  }

  /**
   * Marcar notificación como leída
   */
  marcarNotificacionLeida(notificacionId: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/notificaciones/${notificacionId}/leer`,
      {}
    ).pipe(
      tap(response => {
        if (response.success) {
          const notificaciones = this.notificacionesSubject.value.map(n =>
            n.id === notificacionId ? { ...n, leida: true } : n
          );
          this.notificacionesSubject.next(notificaciones);
        }
      })
    );
  }

  /**
   * Limpiar datos (útil para logout)
   */
  limpiarDatos(): void {
    this.puntosSubject.next(0);
    this.notificacionesSubject.next([]);
    localStorage.removeItem('studentPoints');
  }

  // ========================================================
  // MÉTODOS PARA DASHBOARD (PROFESORES)
  // ========================================================

  /**
   * Obtener todos los estudiantes (para profesores)
   * GET /api/estudiantes
   */
  getAll(): Observable<ApiResponse<StudentListResponse[]>> {
    return this.http.get<ApiResponse<StudentListResponse[]>>(
      this.apiUrl,  // ✅ CAMBIADO: this.baseUrl → this.apiUrl
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estudiantes por grado
   * GET /api/estudiantes/grado/{grado}
   */
  getByGrado(grado: string): Observable<ApiResponse<StudentListResponse[]>> {
    return this.http.get<ApiResponse<StudentListResponse[]>>(
      `${this.apiUrl}/grado/${grado}`,  // ✅ CAMBIADO: this.baseUrl → this.apiUrl
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estudiantes por grado y sección
   * GET /api/estudiantes/grado/{grado}/seccion/{seccion}
   */
  getByGradoAndSeccion(grado: string, seccion: string): Observable<ApiResponse<StudentListResponse[]>> {
    return this.http.get<ApiResponse<StudentListResponse[]>>(
      `${this.apiUrl}/grado/${grado}/seccion/${seccion}`,  // ✅ CAMBIADO: this.baseUrl → this.apiUrl
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener ranking completo
   * GET /api/estudiantes/ranking
   */
  getRanking(): Observable<ApiResponse<RankingResponse>> {
    return this.http.get<ApiResponse<RankingResponse>>(
      `${this.apiUrl}/ranking`,  // ✅ CAMBIADO: this.baseUrl → this.apiUrl
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estadísticas de un estudiante
   * GET /api/estudiantes/{id}/estadisticas
   */
  getEstadisticas(estudianteId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${estudianteId}/estadisticas`,  // ✅ CAMBIADO: this.baseUrl → this.apiUrl
      { headers: this.getHeaders() }
    );
  }
}