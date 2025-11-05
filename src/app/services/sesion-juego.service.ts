import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Request Interfaces
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

// Response Interface
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

  /**
   * Obtener headers con token de autorización
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Iniciar una nueva sesión de juego
   */
  iniciarSesion(request: IniciarSesionRequest): Observable<ApiResponse<SesionJuegoResponse>> {
    return this.http.post<ApiResponse<SesionJuegoResponse>>(
      `${this.apiUrl}/iniciar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Finalizar sesión de juego
   */
  finalizarSesion(request: FinalizarSesionRequest): Observable<ApiResponse<SesionJuegoResponse>> {
    return this.http.put<ApiResponse<SesionJuegoResponse>>(
      `${this.apiUrl}/finalizar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Guardar respuesta de Desafío Nutrimental
   */
  guardarRespuestaNutrimental(request: GuardarNutrimentalRespuestaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/nutrimental/respuesta`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Guardar registro de Reto 7 Días
   */
  guardarRegistroReto7Dias(request: GuardarReto7DiasRegistroRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/reto7dias/registro`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Guardar respuesta de Coach Exprés
   */
  guardarRespuestaCoach(request: GuardarCoachRespuestaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/coach/respuesta`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener mis sesiones
   */
  getMisSesiones(): Observable<ApiResponse<SesionJuegoResponse[]>> {
    return this.http.get<ApiResponse<SesionJuegoResponse[]>>(
      `${this.apiUrl}/mis-sesiones`,
      { headers: this.getHeaders() }
    );
  }
}