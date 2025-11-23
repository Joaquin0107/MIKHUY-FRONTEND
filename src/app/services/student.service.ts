import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Estudiante } from '../models/estudiante.model';
import { UpdateProfileRequest } from './perfil.service';

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
  juegosCompletados?: number; 
  totalSesiones?: number; 
  fechaRegistro?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/estudiantes`;

  private puntosSubject = new BehaviorSubject<number>(0);
  public puntos$ = this.puntosSubject.asObservable();

  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    const puntosGuardados = localStorage.getItem('studentPoints');
    if (puntosGuardados) {
      this.puntosSubject.next(parseInt(puntosGuardados));
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

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

  getMisNotificaciones(): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(`${this.apiUrl}/mis-notificaciones`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.notificacionesSubject.next(response.data);
        }
      })
    );
  }

  actualizarPuntos(puntos: number): void {
    this.puntosSubject.next(puntos);
    localStorage.setItem('studentPoints', puntos.toString());
  }

  sumarPuntos(puntosGanados: number): void {
    const puntosActuales = this.puntosSubject.value;
    const nuevosPuntos = puntosActuales + puntosGanados;
    this.actualizarPuntos(nuevosPuntos);
  }

  getPuntosActuales(): number {
    return this.puntosSubject.value;
  }

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

  limpiarDatos(): void {
    this.puntosSubject.next(0);
    this.notificacionesSubject.next([]);
    localStorage.removeItem('studentPoints');
  }

  getAll(): Observable<ApiResponse<StudentListResponse[]>> {
    return this.http.get<ApiResponse<StudentListResponse[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getById(estudianteId: string): Observable<ApiResponse<StudentListResponse>> {
    console.log('📡 GET: Obteniendo estudiante:', estudianteId);
    return this.http.get<ApiResponse<StudentListResponse>>(
      `${this.apiUrl}/${estudianteId}`,
      { headers: this.getHeaders() }
    );
  }

  getByGrado(grado: string): Observable<ApiResponse<StudentListResponse[]>> {
    return this.http.get<ApiResponse<StudentListResponse[]>>(
      `${this.apiUrl}/grado/${grado}`,
      { headers: this.getHeaders() }
    );
  }

  getByGradoAndSeccion(grado: string, seccion: string): Observable<ApiResponse<StudentListResponse[]>> {
    return this.http.get<ApiResponse<StudentListResponse[]>>(
      `${this.apiUrl}/grado/${grado}/seccion/${seccion}`,
      { headers: this.getHeaders() }
    );
  }

  getRanking(): Observable<ApiResponse<RankingResponse>> {
    return this.http.get<ApiResponse<RankingResponse>>(
      `${this.apiUrl}/ranking`,
      { headers: this.getHeaders() }
    );
  }

  getEstadisticas(estudianteId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${estudianteId}/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  updateEstudiante(
    estudianteId: string, 
    data: UpdateProfileRequest
  ): Observable<ApiResponse<StudentListResponse>> {
    console.log('👨‍🏫 PUT: Profesor actualizando estudiante:', estudianteId);
    console.log('📦 Datos enviados:', data);
    
    return this.http.put<ApiResponse<StudentListResponse>>(
      `${this.apiUrl}/${estudianteId}/perfil`,
      data,
      { headers: this.getHeaders() }
    );
  }
}