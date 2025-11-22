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
  email: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefono?: string;
  avatarUrl?: string;
  edad?: number;
  grado: string;
  seccion: string;
  talla?: number;
  peso?: number;
  imc?: number;
  puntosAcumulados: number;
  juegosJugados?: number;
  juegosCompletados?: number;
  totalSesiones?: number;
  fechaRegistro?: string;      // ✅ AGREGADO
  ultimaConexion?: string;     // ✅ AGREGADO
}

export interface UpdateProfileRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  grado?: string;
  seccion?: string;
  edad?: number;
  peso?: number;
  talla?: number;
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
  // ✅ CORREGIDO: Usar environment sin .prod
  private baseUrl = `${environment.apiUrl}/api/estudiantes`;

  constructor(private http: HttpClient) {}

  getMiPerfil(): Observable<ApiResponse<EstudianteResponse>> {
    console.log('📡 GET:', `${this.baseUrl}/perfil`);
    return this.http.get<ApiResponse<EstudianteResponse>>(`${this.baseUrl}/perfil`);
  }

  updateMiPerfil(data: UpdateProfileRequest): Observable<ApiResponse<EstudianteResponse>> {
    console.log('📡 PUT:', `${this.baseUrl}/perfil`, data);
    return this.http.put<ApiResponse<EstudianteResponse>>(`${this.baseUrl}/perfil`, data);
  }

  getMisPuntos(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/puntos`);
  }

  getMisEstadisticas(): Observable<ApiResponse<EstadisticasEstudianteResponse>> {
    return this.http.get<ApiResponse<EstadisticasEstudianteResponse>>(`${this.baseUrl}/estadisticas`);
  }
}