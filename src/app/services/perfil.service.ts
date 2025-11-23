import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EstudianteResponse {
  id: string;
  usuarioId: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  grado: string;
  seccion: string;
  edad?: number;
  peso?: number;
  talla?: number;
  puntosAcumulados: number;
  avatarUrl?: string;
  // Estadísticas básicas
  juegosJugados?: number;
  juegosCompletados?: number;
  totalSesiones?: number;
  fechaRegistro?: string;
}

export interface UpdateProfileRequest {
  nombres: string;
  apellidos: string;
  telefono?: string;
  grado: string;
  seccion: string;
  peso?: number;
  talla?: number;
  edad?: number;
  avatarUrl?: string;
}

export interface EstadisticasEstudianteResponse {
  puntosAcumulados: number;
  puntosGanados: number;
  puntosGastados: number;
  juegosJugados: number;
  juegosCompletados: number;
  totalSesiones: number;
  tiempoTotalJugado: number;
  posicionRanking: number;
  totalEstudiantes: number;
  notificacionesNoLeidas: number;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  // ✅ CORRECCIÓN: Definir apiUrl
  private apiUrl = environment.apiUrl;
  private baseUrl = `${environment.apiUrl}/api/estudiantes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener perfil del estudiante autenticado
   * GET /api/estudiantes/perfil
   */
  getMiPerfil(): Observable<ApiResponse<EstudianteResponse>> {
    console.log('📡 GET:', `${this.baseUrl}/perfil`);
    return this.http.get<ApiResponse<EstudianteResponse>>(
      `${this.baseUrl}/perfil`
    );
  }

  /**
   * Actualizar perfil del estudiante
   * PUT /api/estudiantes/perfil
   */
  updateMiPerfil(data: UpdateProfileRequest): Observable<ApiResponse<EstudianteResponse>> {
    console.log('📡 PUT:', `${this.baseUrl}/perfil`);
    console.log('📦 Datos enviados:', data);
    return this.http.put<ApiResponse<EstudianteResponse>>(
      `${this.baseUrl}/perfil`,
      data
    );
  }

  /**
   * Obtener puntos acumulados
   * GET /api/estudiantes/puntos
   */
  getMisPuntos(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.baseUrl}/puntos`
    );
  }

  /**
   * Obtener estadísticas del estudiante
   * GET /api/estudiantes/estadisticas
   */
  getMisEstadisticas(): Observable<ApiResponse<EstadisticasEstudianteResponse>> {
    console.log('📡 GET Estadísticas:', `${this.baseUrl}/estadisticas`);
    return this.http.get<ApiResponse<EstadisticasEstudianteResponse>>(
      `${this.baseUrl}/estadisticas`
    );
  }

  /**
   * Subir avatar
   * POST /api/estudiantes/avatar
   */
  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/avatar`,
      formData
    );
  }
}