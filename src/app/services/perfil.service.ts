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
  nombres: string;         // ✅ Backend usa "nombres" (plural)
  apellidos: string;       // ✅ Backend usa "apellidos" (plural)
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
}

export interface UpdateProfileRequest {
  nombres: string;         // ✅ Backend espera "nombres"
  apellidos: string;       // ✅ Backend espera "apellidos"
  email: string;           // ✅ Agregado
  telefono?: string;
  grado: string;
  seccion: string;
  peso?: number;           // Frontend envía number, backend convierte a BigDecimal
  talla?: number;          // Frontend envía number, backend convierte a BigDecimal
  edad?: number;
  avatarUrl?: string;      // ✅ Agregado por si se usa
}

export interface EstadisticasEstudianteResponse {
  juegoCompletados: number;
  puntosGanados: number;
  canjesRealizados: number;
  diasActivo: number;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private baseUrl = `${environment.apiUrl}/estudiantes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener perfil del estudiante autenticado
   * GET /api/estudiantes/perfil
   * El interceptor agrega automáticamente el token
   */
  getMiPerfil(): Observable<ApiResponse<EstudianteResponse>> {
    console.log('📡 GET:', `${this.baseUrl}/estudiantes/perfil`);
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
    console.log('📦 Datos:', data);
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
    return this.http.get<ApiResponse<EstadisticasEstudianteResponse>>(
      `${this.baseUrl}/estadisticas`
    );
  }

  /**
   * ✅ Subir avatar
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