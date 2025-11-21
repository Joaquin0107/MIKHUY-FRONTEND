import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChangePasswordRequest {
  oldPassword: string;      // ✅ Backend espera "oldPassword"
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/auth`; // ✅ Incluir /api/auth
  private tokenKey = 'authToken';
  private userKey = 'currentUser';

  constructor(private http: HttpClient) {}

  // --- Peticiones al backend ---
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  /**
   * ✅ Cambiar contraseña
   * PUT /api/auth/change-password (Backend usa change-password, no cambiar-password)
   */
  cambiarContrasena(data: ChangePasswordRequest): Observable<ApiResponse<any>> {
    console.log('🔐 Enviando cambio de contraseña:', {
      oldPassword: '***',
      newPassword: '***',
      confirmPassword: '***'
    });

    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/change-password`, // ✅ Endpoint correcto
      data
    );
  }

  // --- Token y usuario ---
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    console.log('✅ Token guardado');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    console.log('✅ Usuario guardado:', user);
  }

  getCurrentUser(): any | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('studentPoints');
    console.log('✅ Sesión cerrada');
  }

  // --- Autenticación ---
  isLoggedIn(): boolean {
    const hasToken = !!this.getToken();
    console.log('🔍 Usuario autenticado:', hasToken);
    return hasToken;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
}