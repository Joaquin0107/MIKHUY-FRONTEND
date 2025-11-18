import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EstudianteResponse {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  grado: string;
  seccion: string;
  puntosAcumulados: number;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  grado: string;
  seccion: string;
  peso?: number;
  talla?: number;
  edad?: number;
}

export interface EstadisticasEstudianteResponse {
  juegoCompletados: number;
  puntosGanados: number;
  canjesRealizados: number;
  diasActivo: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private baseUrl = `${environment.apiUrl}/estudiantes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtener perfil del estudiante autenticado
   */
  getMiPerfil(): Observable<ApiResponse<EstudianteResponse>> {
    return this.http.get<ApiResponse<EstudianteResponse>>(
      `${this.baseUrl}/perfil`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar perfil del estudiante
   */
  updateMiPerfil(data: UpdateProfileRequest): Observable<ApiResponse<EstudianteResponse>> {
    return this.http.put<ApiResponse<EstudianteResponse>>(
      `${this.baseUrl}/perfil`,
      data,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener puntos acumulados
   */
  getMisPuntos(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.baseUrl}/puntos`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estadísticas del estudiante
   */
  getMisEstadisticas(): Observable<ApiResponse<EstadisticasEstudianteResponse>> {
    return this.http.get<ApiResponse<EstadisticasEstudianteResponse>>(
      `${this.baseUrl}/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cambiar contraseña (endpoint de auth)
   */
  cambiarContrasena(data: ChangePasswordRequest): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return this.http.post<ApiResponse<any>>(
      `${environment.apiUrl}/auth/cambiar-password`,
      data,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      }
    );
  }

  /**
   * Subir avatar (si tienes endpoint para esto)
   */
  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/avatar`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type para FormData
        })
      }
    );
  }
}