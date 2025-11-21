import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Beneficio, ApiResponse } from '../models/beneficio.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BeneficioService {
  private apiUrl = `${environment.apiUrl}/beneficios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener headers con token de autorización
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener todos los beneficios activos
   */
  getAllActive(): Observable<Beneficio[]> {
    return this.http.get<ApiResponse<Beneficio[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener beneficios disponibles para el estudiante actual
   */
  getDisponibles(): Observable<Beneficio[]> {
    return this.http.get<ApiResponse<Beneficio[]>>(
      `${this.apiUrl}/disponibles`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener beneficio por ID
   */
  getById(id: string): Observable<Beneficio> {
    return this.http.get<ApiResponse<Beneficio>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener beneficios por categoría
   */
  getByCategoria(categoria: string): Observable<Beneficio[]> {
    return this.http.get<ApiResponse<Beneficio[]>>(
      `${this.apiUrl}/categoria/${categoria}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }
}