// src/app/services/canje.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CanjeRequest, CanjeResponse, ApiResponse } from '../models/beneficio.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CanjeService {
  private apiUrl = `${environment.apiUrl}/canjes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener headers con token de autorización
   */
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Realizar un canje
   */
  realizarCanje(request: CanjeRequest): Observable<CanjeResponse> {
    return this.http.post<ApiResponse<CanjeResponse>>(
      this.apiUrl,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener mis canjes
   */
  getMisCanjes(): Observable<CanjeResponse[]> {
    return this.http.get<ApiResponse<CanjeResponse[]>>(
      `${this.apiUrl}/mis-canjes`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener mis canjes pendientes
   */
  getMisCanjesPendientes(): Observable<CanjeResponse[]> {
    return this.http.get<ApiResponse<CanjeResponse[]>>(
      `${this.apiUrl}/pendientes`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancelar un canje
   */
  cancelarCanje(id: string): Observable<CanjeResponse> {
    return this.http.delete<ApiResponse<CanjeResponse>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data)
    );
  }
}