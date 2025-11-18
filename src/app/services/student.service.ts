import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}