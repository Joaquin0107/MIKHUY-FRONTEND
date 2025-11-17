import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Request Interfaces (igual que tenías)
export interface IniciarSesionRequest {
  juegoId: string;
  nivel: number;
}

export interface FinalizarSesionRequest {
  sesionId: string;
  puntosObtenidos: number;
  tiempoJugado: number;
  completado: boolean;
}

export interface GuardarNutrimentalRespuestaRequest {
  sesionId: string;
  preguntaNumero: number;
  preguntaTema: string;
  respuestaCorrecta: boolean;
  tiempoRespuesta: number;
}

export interface GuardarReto7DiasRegistroRequest {
  sesionId: string;
  diaNumero: number;
  momentoDia: 'Desayuno' | 'Almuerzo' | 'Cena';
  alimentosFrutas: number;
  alimentosVerduras: number;
  alimentosProteinas: number;
  alimentosCarbohidratos: number;
  alimentosLacteos: number;
  alimentosDulces: number;
  emocion?: 'feliz' | 'normal' | 'triste' | 'estresado' | 'ansioso';
  caloriasEstimadas?: number;
  notas?: string;
}

export interface GuardarCoachRespuestaRequest {
  sesionId: string;
  preguntaNumero: number;
  preguntaEtapa: string;
  respuestaValor: number;
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

@Injectable({
  providedIn: 'root'
})
export class SesionJuegoService {
  private apiUrl = `${environment.apiUrl}/sesiones`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    // Usar siempre la misma key 'authToken'
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  iniciarSesion(request: IniciarSesionRequest): Observable<ApiResponse<SesionJuegoResponse>> {
    return this.http.post<ApiResponse<SesionJuegoResponse>>(
      `${this.apiUrl}/iniciar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  finalizarSesion(request: FinalizarSesionRequest): Observable<ApiResponse<SesionJuegoResponse>> {
    return this.http.put<ApiResponse<SesionJuegoResponse>>(
      `${this.apiUrl}/finalizar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  guardarRespuestaNutrimental(request: GuardarNutrimentalRespuestaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/nutrimental/respuesta`,
      request,
      { headers: this.getHeaders() }
    );
  }

  guardarRegistroReto7Dias(request: GuardarReto7DiasRegistroRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/reto7dias/registro`,
      request,
      { headers: this.getHeaders() }
    );
  }

  guardarRespuestaCoach(request: GuardarCoachRespuestaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/coach/respuesta`,
      request,
      { headers: this.getHeaders() }
    );
  }

  getMisSesiones(): Observable<ApiResponse<SesionJuegoResponse[]>> {
    return this.http.get<ApiResponse<SesionJuegoResponse[]>>(
      `${this.apiUrl}/mis-sesiones`,
      { headers: this.getHeaders() }
    );
  }
}
