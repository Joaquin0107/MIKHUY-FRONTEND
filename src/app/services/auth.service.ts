import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface ChangePasswordRequest {
  oldPassword: string;
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
  private baseUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'authToken';
  private userKey = 'currentUser';
  private sessionExpiryKey = 'sessionExpiry';

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  cambiarContrasena(data: ChangePasswordRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/change-password`,
      data,
    );
  }

  // ── CP010: Activar cuenta con token ──────────────────────────────────────
  activarCuenta(token: string): Observable<ApiResponse<void>> {
    return this.http.get<ApiResponse<void>>(
      `${this.baseUrl}/activate?token=${token}`,
    );
  }

  // ── CP011: Reenviar enlace de activación ──────────────────────────────────
  reenviarActivacion(tokenAntiguo: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/resend?token=${tokenAntiguo}`,
      {},
    );
  }

  // ── Panel admin: obtener URL de activación ────────────────────────────────
  getActivationUrl(email: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(
      `${this.baseUrl}/activation-url?email=${encodeURIComponent(email)}`,
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getCurrentUser(): any | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('studentPoints');
    localStorage.removeItem(this.sessionExpiryKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  saveSessionExpiry(): void {
    const expiry = Date.now() + 2 * 60 * 1000;
    localStorage.setItem(this.sessionExpiryKey, expiry.toString());
  }

  refreshSessionExpiry(): void {
    const expiry = Date.now() + 2 * 60 * 1000;
    localStorage.setItem(this.sessionExpiryKey, expiry.toString());
  }

  isSessionExpired(): boolean {
    const expiry = localStorage.getItem(this.sessionExpiryKey);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  }
}
