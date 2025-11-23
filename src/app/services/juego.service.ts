import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

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
  progresoId?: string;
  nivelActual?: number;
  puntosGanados?: number;
  vecesJugado?: number;
  ultimaJugada?: string;
  completado?: boolean;
  porcentajeCompletado?: number;
  image?: string;
  imagen?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class JuegosService {
  private apiUrl = `${environment.apiUrl}/juegos`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getAllActive(): Observable<ApiResponse<JuegoResponse[]>> {
    return this.http.get<ApiResponse<JuegoResponse[]>>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getMisJuegos(): Observable<ApiResponse<JuegoResponse[]>> {
    return this.http.get<ApiResponse<JuegoResponse[]>>(
      `${this.apiUrl}/mi-progreso`,
      { headers: this.getHeaders() }
    );
  }

  getById(id: string): Observable<ApiResponse<JuegoResponse>> {
    return this.http.get<ApiResponse<JuegoResponse>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getByCategoria(categoria: string): Observable<ApiResponse<JuegoResponse[]>> {
    return this.http.get<ApiResponse<JuegoResponse[]>>(
      `${this.apiUrl}/categoria/${categoria}`,
      { headers: this.getHeaders() }
    );
  }

  getRankingPorJuego(juegoId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    return this.http.get<any>(`${environment.apiUrl}/api/estudiantes/ranking`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    });
  }

  getTotalPuntos(juegos: JuegoResponse[]): number {
    return juegos.reduce((total, j) => total + (j.puntosGanados || 0), 0);
  }
}
