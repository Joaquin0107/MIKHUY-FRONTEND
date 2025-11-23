import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private apiUrl = environment.apiUrl;
  private baseUrl = `${environment.apiUrl}/api/estudiantes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    console.log('🔑 Token en getHeaders:', token ? '✓ EXISTE' : '✗ NO EXISTE');
    
    if (!token) {
      console.error('❌ NO HAY TOKEN DISPONIBLE');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMiPerfil(): Observable<ApiResponse<EstudianteResponse>> {
    console.log('📡 GET:', `${this.baseUrl}/perfil`);
    console.log('📋 Headers:', this.getHeaders().keys());
    
    return this.http.get<ApiResponse<EstudianteResponse>>(
      `${this.baseUrl}/perfil`,
      { headers: this.getHeaders() } // ✅ AGREGADO
    );
  }

  updateMiPerfil(data: UpdateProfileRequest): Observable<ApiResponse<EstudianteResponse>> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    console.log('📡 PUT:', `${this.baseUrl}/perfil`);
    console.log('🎟️ Token disponible:', token ? '✓ SÍ' : '✗ NO');
    console.log('📦 Datos enviados:', data);
    console.log('📋 Headers completos:', this.getHeaders().keys());
    
    if (!token) {
      console.error('❌ CRÍTICO: No hay token para actualizar perfil');
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
    }
    
    return this.http.put<ApiResponse<EstudianteResponse>>(
      `${this.baseUrl}/perfil`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getMisPuntos(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.baseUrl}/puntos`,
      { headers: this.getHeaders() } 
    );
  }

  getMisEstadisticas(): Observable<ApiResponse<EstadisticasEstudianteResponse>> {
    console.log('📡 GET Estadísticas:', `${this.baseUrl}/estadisticas`);
    return this.http.get<ApiResponse<EstadisticasEstudianteResponse>>(
      `${this.baseUrl}/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    const formData = new FormData();
    formData.append('avatar', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/avatar`,
      formData,
      { headers }
    );
  }
}