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

  

iniciarSesion(request: IniciarSesionRequest): Observable<ApiResponse<SesionJuegoResponse>> {
  return this.http.post<ApiResponse<SesionJuegoResponse>>(
    `${this.apiUrl}/iniciar`,
    request
    );
  }

finalizarSesion(request: FinalizarSesionRequest): Observable<ApiResponse<SesionJuegoResponse>> {
  return this.http.put<ApiResponse<SesionJuegoResponse>>(
    `${this.apiUrl}/finalizar`,
    request
    );
  }

  guardarRespuestaNutrimental(request: GuardarNutrimentalRespuestaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/nutrimental/respuesta`,
      request
    );
  }

  guardarRegistroReto7Dias(request: GuardarReto7DiasRegistroRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/reto7dias/registro`,
      request
    );
  }

  guardarRespuestaCoach(request: GuardarCoachRespuestaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/coach/respuesta`,
      request
    );
  }

  getMisSesiones(): Observable<ApiResponse<SesionJuegoResponse[]>> {
    return this.http.get<ApiResponse<SesionJuegoResponse[]>>(
      `${this.apiUrl}/mis-sesiones`,
    );
  }
}
