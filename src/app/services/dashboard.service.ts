import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { AuthService } from './auth.service';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardEstudianteResponse {
  estudiante: EstudianteResponse;
  estadisticas: EstadisticasEstudianteResponse;
  juegos: JuegoResponse[];
  ultimasSesiones: SesionJuegoResponse[];
  notificaciones: NotificacionResponse[];
  beneficiosDisponibles: BeneficioResponse[];
  ultimoAnalisis: AnalisisNutricionalResponse | null;
  ranking: RankingInfo;
  salud: SaludInfo;
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
  edad: number;
  grado: string;
  seccion: string;
  talla?: number;
  peso?: number;
  imc?: number;
  puntosAcumulados: number;
  juegosJugados: number;
  juegosCompletados: number;
  totalSesiones: number;
  fechaRegistro: string;
  ultimaConexion?: string;
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

export interface JuegoResponse {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  maxNiveles: number;
  puntosPorNivel: number;
  nivelActual?: number;
  puntosGanados?: number;
  vecesJugado?: number;
  completado?: boolean;
}

export interface SesionJuegoResponse {
  id: string;
  progresoId: string;
  juegoNombre: string;
  juegoCategoria: string;
  nivelJugado: number;
  puntosObtenidos: number;
  tiempoJugado: number;
  tiempoJugadoFormato: string;
  completado: boolean;
  fechaSesion: string;
}

export interface NotificacionResponse {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

export interface BeneficioResponse {
  id: string;
  nombre: string;
  descripcion: string;
  puntosRequeridos: number;
  categoria: string;
  stock: number;
  imagenUrl?: string;
  activo: boolean;
}

export interface AnalisisNutricionalResponse {
  id: string;
  estudianteId: string;
  fechaAnalisis: string;
  proteinasPorcentaje: number;
  carbohidratosPorcentaje: number;
  grasasPorcentaje: number;
  etapaCambio?: string;
  porcentajeAciertos?: number;
}

export interface RankingInfo {
  posicion: number;
  total: number;
  top5: TopEstudiante[];
}

export interface TopEstudiante {
  nombre: string;
  puntos: number;
  posicion: number;
}

export interface SaludInfo {
  medicionActual: MedicionSaludResponse | null;
  historialMediciones: MedicionSaludResponse[];
  estadisticas: EstadisticasSalud | null;
}

export interface MedicionSaludResponse {
  id: string;
  estudianteId: string;
  peso: number;
  talla: number;
  imc: number;
  estadoNutricional: string;
  fechaRegistro: string;
  notas?: string;
}

export interface EstadisticasSalud {
  imcActual: number;
  estadoNutricionalActual: string;
  variacionPeso: number; 
  variacionTalla: number;
  totalMediciones: number;
  tendencia: string; 
  recomendacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMiDashboard(): Observable<ApiResponse<DashboardEstudianteResponse>> {
    return this.http.get<ApiResponse<DashboardEstudianteResponse>>(
      this.baseUrl,
      { headers: this.getHeaders() }
    );
  }

  getDashboardEstudiante(estudianteId: string): Observable<ApiResponse<DashboardEstudianteResponse>> {
    return this.http.get<ApiResponse<DashboardEstudianteResponse>>(
      `${this.baseUrl}/estudiante/${estudianteId}`,
      { headers: this.getHeaders() }
    );
  }
}