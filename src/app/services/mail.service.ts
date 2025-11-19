import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private API = 'http://localhost:8084/api/email';

  constructor(private http: HttpClient) {}

  /**
   * Headers para peticiones JSON (email simple)
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') ?? '';

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Headers para FormData (email con PDF)
   * No se debe definir Content-Type porque Angular lo genera automáticamente.
   */
  private getHeadersForFormData(): HttpHeaders {
    const token = localStorage.getItem('authToken') ?? '';

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  /**
   * Enviar email simple
   */
  sendEmail(data: {
    to: string;
    subject: string;
    message: string;
  }): Observable<any> {
    // ✅ Log detallado antes de enviar
    console.log('📧 [MailService] Preparando envío de email');
    console.log('📧 [MailService] URL:', `${this.API}/send`);
    console.log('📧 [MailService] Data:', JSON.stringify(data, null, 2));
    console.log('📧 [MailService] Headers:', {
      Authorization: 'Bearer ' + (localStorage.getItem('authToken') ? '***' : 'NO TOKEN'),
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.API}/send`, data, {
      headers: this.getHeaders(),
      withCredentials: true,
    }).pipe(
      tap(response => {
        console.log('✅ [MailService] Respuesta exitosa:', response);
      }),
      catchError(error => {
        console.error('❌ [MailService] Error completo:', error);
        console.error('❌ [MailService] Status:', error.status);
        console.error('❌ [MailService] Message:', error.message);
        console.error('❌ [MailService] Error body:', error.error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Enviar email con PDF adjunto
   */
  sendEmailWithPdf(formData: FormData): Observable<any> {
    console.log('📧 [MailService] Preparando envío de email con PDF');
    console.log('📧 [MailService] URL:', `${this.API}/send-with-pdf`);
    
    // Log del contenido del FormData
    const entries: any = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        entries[key] = `File: ${value.name} (${value.size} bytes, ${value.type})`;
      } else {
        entries[key] = value;
      }
    });
    console.log('📄 [MailService] FormData content:', entries);

    return this.http.post(`${this.API}/send-with-pdf`, formData, {
      headers: this.getHeadersForFormData(),
      withCredentials: true,
    }).pipe(
      tap(response => {
        console.log('✅ [MailService] Email con PDF enviado:', response);
      }),
      catchError(error => {
        console.error('❌ [MailService] Error al enviar email con PDF:', error);
        console.error('❌ [MailService] Status:', error.status);
        console.error('❌ [MailService] Error body:', error.error);
        return throwError(() => error);
      })
    );
  }
}