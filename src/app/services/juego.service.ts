import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface JuegoResponse {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  maxNiveles: number;
  puntosPorNivel: number;
  puntosMaximos: number;
  activo: boolean;
  fechaCreacion: string;
  // Campos de progreso
  progresoId?: string;
  nivelActual?: number;
  puntosGanados?: number;
  vecesJugado?: number;
  ultimaJugada?: string;
  completado?: boolean;
  porcentajeCompletado?: number;
  // Para frontend
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JuegosService {
  private apiUrl = `${environment.apiUrl}/juegos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener headers con token de autorización
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken'); // Usamos authToken como en tu AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtener todos los juegos activos
   */
  getAllActive(): Observable<ApiResponse<JuegoResponse[]>> {
    return this.http.get<ApiResponse<JuegoResponse[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener juegos con el progreso del estudiante actual
   */
  getMisJuegos(): Observable<ApiResponse<JuegoResponse[]>> {
    return this.http.get<ApiResponse<JuegoResponse[]>>(
      `${this.apiUrl}/mi-progreso`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener un juego por ID
   */
  getById(id: string): Observable<ApiResponse<JuegoResponse>> {
    return this.http.get<ApiResponse<JuegoResponse>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener juegos por categoría
   */
  getByCategoria(categoria: string): Observable<ApiResponse<JuegoResponse[]>> {
    return this.http.get<ApiResponse<JuegoResponse[]>>(
      `${this.apiUrl}/categoria/${categoria}`,
      { headers: this.getHeaders() }
    );
  }
}